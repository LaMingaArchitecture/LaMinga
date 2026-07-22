import type { ISbStoryData } from '@storyblok/astro';
import { getStoryblokApi, storyblokVersion } from './storyblok';
import type {
  AtelierPageBlok,
  GlobalSettings,
  HomePageBlok,
  ProgrammeBlok,
  ProgrammeSummary,
  ProjectBlok,
  ProjectListBlok,
  ProjectSummary,
  StoryblokAsset,
  StoryblokColor,
  ThematiqueEntry,
} from '../types/storyblok';

// Live content only. Missing content (HTTP 404 / story-not-found, empty list,
// missing datasource) degrades gracefully: the fetch returns null/[] and the page
// renders a placeholder, so the build still succeeds. Genuine errors (network,
// 401 auth, 5xx) are intentionally NOT caught — they fail the build loudly rather
// than silently deploy an empty site over real content.

/**
 * True when a Storyblok delivery error means "record not found" (HTTP 404).
 * Checks both the top-level `status` (current storyblok-js-client shape) and the
 * typed `response.status`, so the guard survives a client refactor.
 */
function isNotFound(err: unknown): boolean {
  const e = err as { status?: number; response?: { status?: number } } | null;
  return e?.status === 404 || e?.response?.status === 404;
}

/**
 * Runs a content fetch, tolerating "record not found" (404): logs a warning and
 * returns `fallback` so the build degrades gracefully instead of failing. Genuine
 * errors (network, 401 auth, 5xx) are re-thrown — they must fail the build loudly.
 * `console.warn` (not `info`) so missing content surfaces in Netlify build logs.
 */
async function tolerateNotFound<T>(
  fetchFn: () => Promise<T>,
  fallback: T,
  absentMessage: string,
): Promise<T> {
  try {
    return await fetchFn();
  } catch (err) {
    if (isNotFound(err)) {
      console.warn(`[content] ${absentMessage}`);
      return fallback;
    }
    throw err;
  }
}

const SLUG = {
  home: 'home',
  projectList: 'projets',
  atelier: 'atelier',
  settings: 'config',
} as const;

const DATASOURCE_THEMATIQUE = 'thematique';

/**
 * Relations resolved on the shared project list fetch — single source of truth so
 * the delivery call and the SSR preview route never drift. Format `<component>.<field>`.
 */
export const PROJECT_RELATIONS = ['project.programme', 'project.projets_lies'] as const;

/** Relation resolved on the home_page fetch (each slide's linked project). */
export const HOME_RELATIONS = ['home_slide.projet'] as const;

function fetchStoryContent<T>(
  slug: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  return tolerateNotFound<T | null>(
    async () => {
      const api = getStoryblokApi();
      const { data } = await api.get(`cdn/stories/${slug}`, {
        version: storyblokVersion,
        ...params,
      });
      return data.story.content as T;
    },
    null,
    `story "${slug}" absente (${storyblokVersion}) — placeholder rendu`,
  );
}

export function getHomePage(): Promise<HomePageBlok | null> {
  return fetchStoryContent<HomePageBlok>(SLUG.home, { resolve_relations: [...HOME_RELATIONS] });
}

export function getProjectListPage(): Promise<ProjectListBlok | null> {
  return fetchStoryContent<ProjectListBlok>(SLUG.projectList);
}

export function getAtelierPage(): Promise<AtelierPageBlok | null> {
  return fetchStoryContent<AtelierPageBlok>(SLUG.atelier);
}

// Plain fetch (no memo): the SSR preview must reflect live draft edits per request.
export function getSettings(): Promise<GlobalSettings | null> {
  return fetchStoryContent<GlobalSettings>(SLUG.settings);
}

// Cache the published datasource for the whole SSG build (it is static during a build) —
// getThematiques is called by the Projets list and by every project detail page. Never cache
// in draft/preview: the SSR editor must reflect live datasource edits per request.
let thematiquesCache: Promise<ThematiqueEntry[]> | undefined;

export function getThematiques(): Promise<ThematiqueEntry[]> {
  if (storyblokVersion === 'published' && thematiquesCache) return thematiquesCache;
  const result = tolerateNotFound(
    async () => {
      const api = getStoryblokApi();
      const { data } = await api.get('cdn/datasource_entries', {
        datasource: DATASOURCE_THEMATIQUE,
        version: storyblokVersion,
        per_page: 100,
      });
      const entries: Array<{ name: string; value: string }> = data.datasource_entries ?? [];
      return entries.map((entry) => ({ name: entry.name, value: entry.value }));
    },
    [],
    `datasource "${DATASOURCE_THEMATIQUE}" absente (${storyblokVersion}) — filtre vide`,
  );
  if (storyblokVersion === 'published') thematiquesCache = result;
  return result;
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Normalize a native-color-picker object (or plain hex string) to a validated hex string.
 * Whitelist to a hex value so the colour can be safely interpolated into an inline `style`
 * (rejects an editor value like `red; background:url(…)` that would inject CSS declarations).
 */
export function colorHex(color?: StoryblokColor): string | undefined {
  if (!color) return undefined;
  const raw = (typeof color === 'string' ? color : color.color)?.trim();
  return raw && HEX_COLOR.test(raw) ? raw : undefined;
}

/** True when a relation field arrived resolved (a story object, not a bare uuid). */
export function isResolved(rel: unknown): rel is ISbStoryData {
  return typeof rel === 'object' && rel !== null && 'content' in rel;
}

/** Programme label + colour from a project's resolved `programme` relation. */
function toProgramme(blok: ProjectBlok): ProgrammeSummary | undefined {
  const rel = blok.programme;
  if (isResolved(rel)) {
    const programme = rel.content as ProgrammeBlok;
    return { nom: programme.nom, couleur: colorHex(programme.couleur) };
  }
  return undefined;
}

/** Cover photo for the VRAC grid / Index hover: the explicit field, else the first carousel image. */
function coverPhoto(blok: ProjectBlok): StoryblokAsset | undefined {
  if (blok.photo_couverture?.filename) return blok.photo_couverture;
  const first = blok.carrousel?.find(
    (slide) => slide.image_paysage?.filename || slide.image_portrait?.filename,
  );
  if (!first) return undefined;
  return first.image_paysage?.filename ? first.image_paysage : first.image_portrait;
}

function toSummary(blok: ProjectBlok, slug: string): ProjectSummary {
  return {
    slug,
    titre: blok.titre,
    ville: blok.ville,
    description_programme: blok.description_programme,
    maitre_ouvrage: blok.maitre_ouvrage,
    statut: blok.statut,
    programme: toProgramme(blok),
    thematiques: blok.thematiques ?? [],
    vignette: blok.vignette_plan,
    photo: coverPhoto(blok),
  };
}

/** Programme (label + colour) for the project detail (pure post-resolution narrower). */
export function resolveProgramme(blok: ProjectBlok): ProgrammeSummary | undefined {
  return toProgramme(blok);
}

// Related projects (the `projets_lies` relation, resolved via resolve_relations), else [].
// Each related story's own `programme` resolves too because every project lives under
// `projets/` and is co-fetched by getProjectStories(), so its programme is in the shared
// `rels` map the client applies across the whole tree (verified: related cards show colour).
export function resolveRelated(blok: ProjectBlok): ProjectSummary[] {
  return (blok.projets_lies ?? [])
    .filter(isResolved)
    .map((story) => toSummary(story.content as ProjectBlok, story.slug));
}

// Single list fetch with the programme + linked-project relations resolved, shared by
// the grid and the static-path generation (no per-project N+1).
function getProjectStories(): Promise<ISbStoryData[]> {
  return tolerateNotFound(
    async () => {
      const api = getStoryblokApi();
      const { data } = await api.get('cdn/stories', {
        version: storyblokVersion,
        starts_with: 'projets/',
        per_page: 100,
        resolve_relations: [...PROJECT_RELATIONS],
      });
      const stories: ISbStoryData[] = data.stories ?? [];
      return stories.filter((story) => (story.content as ProjectBlok)?.component === 'project');
    },
    [],
    `aucune story sous "projets/" (${storyblokVersion}) — grille vide`,
  );
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const stories = await getProjectStories();
  return stories.map((story) => toSummary(story.content as ProjectBlok, story.slug));
}

export async function getAllProjects(): Promise<Array<{ slug: string; blok: ProjectBlok }>> {
  const stories = await getProjectStories();
  return stories.map((story) => ({ slug: story.slug, blok: story.content as ProjectBlok }));
}
