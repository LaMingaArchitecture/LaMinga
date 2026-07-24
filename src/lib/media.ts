/**
 * Shared LCP-preload resolution. The preload <link> must resolve to the EXACT URL the browser
 * picks for the LCP <img>/<video poster>, or the hero double-downloads. So the preload descriptors
 * here mirror ResponsiveMedia.astro's source selection byte-for-byte.
 * ⚠️ Keep in sync with src/storyblok/ResponsiveMedia.astro.
 */
import { sbImageW, sbSrcset, SIZES_FULLSCREEN, HERO_IMG_WIDTH, POSTER_WIDTH } from './image';
import type { AtelierPageBlok, StoryblokAsset } from '../types/storyblok';

export interface MediaFields {
  imagePaysage?: StoryblokAsset;
  imagePortrait?: StoryblokAsset;
  video?: StoryblokAsset;
  poster?: StoryblokAsset;
}

/** A preload descriptor → `<link rel="preload" as="image">` in BaseLayout. */
export interface PreloadImage {
  href: string;
  srcset?: string;
  sizes?: string;
  media?: string;
}

const MOBILE = '(max-width: 640px)';
// Complementary to MOBILE with no gap at fractional widths (e.g. 640.5px under zoom / fractional DPR).
const DESKTOP = '(min-width: 640.02px)';

/** Map a media blok's snake_case fields to MediaFields (media_slide / home_slide share the shape). */
export function slideMediaFields(blok: {
  image_paysage?: StoryblokAsset;
  image_portrait?: StoryblokAsset;
  video?: StoryblokAsset;
  poster?: StoryblokAsset;
}): MediaFields {
  return {
    imagePaysage: blok.image_paysage,
    imagePortrait: blok.image_portrait,
    video: blok.video,
    poster: blok.poster,
  };
}

/**
 * Preload descriptors for the LCP visual of a media blok. Empty when nothing is preloadable.
 * Video LCP → preload the poster only (a <video poster> can't take a srcset).
 */
export function lcpPreload(m: MediaFields): PreloadImage[] {
  if (m.video?.filename) {
    const poster = m.poster?.filename;
    return poster ? [{ href: sbImageW(poster, POSTER_WIDTH) }] : [];
  }
  const portrait = m.imagePortrait?.filename;
  const paysage = m.imagePaysage?.filename ?? portrait;
  if (!paysage) return [];

  const links: PreloadImage[] = [];
  // ≤640: the browser picks the portrait art-direction <source> — mirror it (only when present).
  if (portrait) {
    links.push({
      media: MOBILE,
      href: sbImageW(portrait, HERO_IMG_WIDTH),
      srcset: sbSrcset(portrait),
      sizes: SIZES_FULLSCREEN,
    });
  }
  // >640 (or all widths when there's no portrait source): the paysage <img>.
  links.push({
    media: portrait ? DESKTOP : undefined,
    href: sbImageW(paysage, HERO_IMG_WIDTH),
    srcset: sbSrcset(paysage),
    sizes: SIZES_FULLSCREEN,
  });
  return links;
}

/** The Atelier sections, in render order (see AtelierPage.astro). */
export type AtelierSection = 'video' | 'manifeste' | 'clients' | 'equipe' | 'none';

/**
 * Resolve the Atelier's FIRST rendered section and its LCP background — the single source of truth
 * shared by atelier.astro (preload) and AtelierPage.astro (which background loads eagerly). The
 * section gates MUST mirror AtelierPage.astro's render conditions, or the preload/eager flag can
 * target a section that never renders. `media` is undefined when the first section has no background
 * (e.g. a text-only manifeste) — then there is nothing to preload.
 */
export function atelierHero(blok: AtelierPageBlok): {
  section: AtelierSection;
  media?: MediaFields;
} {
  if (blok.video?.filename) {
    return { section: 'video', media: { video: blok.video, poster: blok.poster } };
  }
  if (blok.image?.filename || blok.texte_minga || blok.texte_construire) {
    return {
      section: 'manifeste',
      media: blok.image?.filename ? { imagePaysage: blok.image } : undefined,
    };
  }
  if (blok.clients_collectivites || blok.clients_oph || blok.clients_moa) {
    return {
      section: 'clients',
      media: blok.image_clients?.filename ? { imagePaysage: blok.image_clients } : undefined,
    };
  }
  if ((blok.equipe?.length ?? 0) > 0) {
    return {
      section: 'equipe',
      media: blok.image_equipe?.filename ? { imagePaysage: blok.image_equipe } : undefined,
    };
  }
  return { section: 'none' };
}
