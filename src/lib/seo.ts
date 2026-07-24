/**
 * SEO/GEO logic: per-page metadata resolution (with editor overrides + fallbacks) and JSON-LD
 * structured-data builders. Pure transforms over already-fetched content (no I/O of its own);
 * `coverPhoto` and `renderRichText` are pure. Rendered by `src/components/Seo.astro`; the site-wide
 * Organization node is emitted once by BaseLayout.
 */
import { renderRichText } from '@storyblok/astro';
import { coverPhoto } from './content';
import { sbImage } from './image';
import { collapseWhitespace, isHttpUrl } from './url';
import type {
  GlobalSettings,
  ProjectBlok,
  RichText,
  SeoBlok,
  StoryblokAsset,
  TeamMemberBlok,
} from '../types/storyblok';

const SITE_DEFAULT_NAME = 'LaMinga';
const SITE_DEFAULT_DESCRIPTION = "Atelier d'architecture LaMinga.";
/** Final og:image fallback — a branded raster generated from the logo (see public/og-default.png). */
export const SITE_DEFAULT_OG_IMAGE = '/og-default.png';
/** Storyblok asset hosts — only these are routed through the image service. */
const STORYBLOK_HOSTS = ['a.storyblok.com', 'a2.storyblok.com'];
/** Open Graph recommended share dimensions. */
const OG_IMAGE_SIZE = '1200x630';

// ── Metadata resolution ──────────────────────────────────────────────────────────────────────

export interface SeoInput {
  /** The story's `seo` override blok (already unwrapped via firstSeo). */
  seo?: SeoBlok;
  /** Page-level fallback title (static or derived). */
  title: string;
  /** Page-level fallback description (may be undefined → site default). */
  description?: string;
  /** Page visual used as the og:image fallback (cover / first slide / atelier image). */
  image?: StoryblokAsset;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  /** Raw filename (Storyblok host) OR site-relative default; absolutize with `absoluteImageUrl`. */
  ogImage: string;
}

/** Storyblok Blocks fields are always arrays — the `seo` blok is capped at 1, so read the first. */
export function firstSeo(seo?: SeoBlok[]): SeoBlok | undefined {
  return seo?.[0];
}

/**
 * The single fallback chain shared by every page type:
 *   title       = seo.titre_seo       || page title
 *   description = seo.description_seo  || page description || site default
 *   ogImage     = seo.image_partage    || page visual      || branded default
 */
export function resolveSeo(input: SeoInput): ResolvedSeo {
  const { seo } = input;
  return {
    title: seo?.titre_seo?.trim() || input.title,
    description:
      seo?.description_seo?.trim() || input.description?.trim() || SITE_DEFAULT_DESCRIPTION,
    ogImage: seo?.image_partage?.filename || input.image?.filename || SITE_DEFAULT_OG_IMAGE,
  };
}

/** Page-level SEO inputs derived from a project (title/description/cover) — mirrors [slug].astro. */
export function projectSeoInput(blok: ProjectBlok): SeoInput {
  const ville = blok.ville ? ` — ${blok.ville}` : '';
  const description =
    blok.description_programme ??
    `${blok.titre}${blok.ville ? `, ${blok.ville}` : ''} — projet de l'atelier d'architecture LaMinga.`;
  return {
    seo: firstSeo(blok.seo),
    title: `${blok.titre}${ville} — LaMinga`,
    description,
    image: coverPhoto(blok),
  };
}

// ── URL / image helpers ──────────────────────────────────────────────────────────────────────

/** Canonical/og:url/breadcrumb URL — mirrors BaseLayout's formula so absolute URLs never drift. */
export function canonicalUrl(pathname: string, siteUrl: string): string {
  return new URL(pathname, siteUrl).href;
}

/**
 * Absolute image URL for og:image / JSON-LD. Storyblok-hosted assets go through the image service
 * (webp at the OG size); a site-relative default (e.g. /og-default.png) is resolved against the
 * site; any other absolute URL is returned as-is. Empty → undefined.
 */
export function absoluteImageUrl(
  filename: string | undefined,
  siteUrl: string,
  size = OG_IMAGE_SIZE,
): string | undefined {
  if (!filename) return undefined;
  try {
    const url = new URL(filename);
    if (STORYBLOK_HOSTS.includes(url.host)) return sbImage(filename, size);
    // Any other absolute URL: only http(s) (reject javascript:/data: etc. — defense-in-depth, so
    // safety doesn't rely on the upstream field staying a Storyblok asset).
    return url.protocol === 'https:' || url.protocol === 'http:' ? filename : undefined;
  } catch {
    return new URL(filename, siteUrl).href;
  }
}

/**
 * Escape a JSON-LD object for safe injection via `set:html` (Astro does not escape set:html).
 * Neutralizes `</script>` breakout and stray HTML from editor-authored strings.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────────────────────

type JsonLd = Record<string, unknown>;

/** Drop undefined / empty-string / empty-array fields so JSON-LD carries only real data. */
function compact(obj: JsonLd): JsonLd {
  const out: JsonLd = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

const siteHome = (siteUrl: string): string => new URL('/', siteUrl).href;
const orgId = (siteUrl: string): string => `${siteHome(siteUrl)}#organization`;

/**
 * Build a PostalAddress from a free-text address field. `addressLocality` is derived from the field
 * identity (Paris/Anglet); the whole textarea goes into `streetAddress` (it may include the postal
 * code + city — acceptable while the address is a single free-text field, not decomposed in Storyblok).
 */
function postalAddress(street: string | undefined, locality: string): JsonLd | undefined {
  if (!street) return undefined;
  return {
    '@type': 'PostalAddress',
    streetAddress: street,
    addressLocality: locality,
    addressCountry: 'FR',
  };
}

/** Extract a 4-digit year from free-text `statut` ("Livré 2023" → "2023"); undefined otherwise. */
function yearFrom(text?: string): string | undefined {
  return text?.match(/\b(?:19|20)\d{2}\b/)?.[0];
}

/**
 * Convert a Storyblok richtext doc to a truncated plaintext string (for meta descriptions and
 * the llms.txt intro). Reused by src/lib/llms.ts.
 */
export function richTextToPlain(doc?: RichText, maxLength = 155): string | undefined {
  if (!doc) return undefined;
  const html = renderRichText(doc);
  if (!html) return undefined;
  const text = String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  // Strip a trailing lone high-surrogate so slicing never leaves half of an astral codepoint (→ ).
  const cut = (lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice).replace(
    /[\uD800-\uDBFF]$/,
    '',
  );
  return `${cut.trim()}…`;
}

/**
 * Site-wide `ProfessionalService` node from global_settings: name, url, contact, logo, both
 * addresses (Paris + Anglet), sameAs (social links). Returns undefined when settings are absent so
 * BaseLayout emits no empty script. Referenced by CreativeWork/Person via `@id`.
 */
export function professionalServiceJsonLd(
  settings: GlobalSettings | null,
  siteUrl: string,
): JsonLd | undefined {
  if (!settings) return undefined;
  const addresses = [
    postalAddress(collapseWhitespace(settings.adresse_paris), 'Paris'),
    postalAddress(collapseWhitespace(settings.adresse_anglet), 'Anglet'),
  ].filter(Boolean);
  const sameAs = (settings.reseaux_sociaux ?? []).map((link) => link.url).filter(isHttpUrl);

  return compact({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': orgId(siteUrl),
    name: settings.nom_atelier?.trim() || SITE_DEFAULT_NAME,
    url: siteHome(siteUrl),
    email: settings.email?.trim() || undefined,
    telephone: settings.telephone?.trim() || undefined,
    logo: settings.logo?.filename || undefined,
    image: new URL(SITE_DEFAULT_OG_IMAGE, siteUrl).href,
    address: addresses,
    sameAs,
    areaServed: 'FR',
  });
}

/** Per-project `CreativeWork`: name, description, location, date, image; creator → org by @id. */
export function creativeWorkJsonLd(
  blok: ProjectBlok,
  pageUrl: string,
  imageUrl: string | undefined,
  siteUrl: string,
): JsonLd {
  const ville = blok.ville?.trim();
  const location = ville
    ? {
        '@type': 'Place',
        name: ville,
        address: { '@type': 'PostalAddress', addressLocality: ville, addressCountry: 'FR' },
      }
    : undefined;

  return compact({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: blok.titre,
    description: blok.description_programme?.trim() || undefined,
    url: pageUrl,
    image: imageUrl,
    dateCreated: yearFrom(blok.statut),
    locationCreated: location,
    creator: { '@type': 'ProfessionalService', '@id': orgId(siteUrl) },
  });
}

/** `BreadcrumbList` from an ordered list of {name, url}. */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** `Person` for a team member; worksFor → org by @id (no extra settings fetch). */
export function personJsonLd(member: TeamMemberBlok, siteUrl: string, imageUrl?: string): JsonLd {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.nom,
    jobTitle: member.role?.trim() || undefined,
    image: imageUrl,
    worksFor: { '@type': 'ProfessionalService', '@id': orgId(siteUrl) },
  });
}
