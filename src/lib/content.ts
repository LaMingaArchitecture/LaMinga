import type { ISbStoryData, SbBlokData } from '@storyblok/astro';
import { presentAsset } from './image';
import { getStoryblokApi, storyblokVersion } from './storyblok';
import type {
  AtelierPageBlok,
  GlobalSettings,
  HomePageBlok,
  ProgrammeBlok,
  ProgrammeLink,
  ProgrammeSummary,
  ProjectBlok,
  ProjectListBlok,
  ProjectSummary,
  StoryblokAsset,
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

const MAX_PER_PAGE = 100;

/**
 * Relations resolved on the shared project list fetch — single source of truth so
 * the delivery call and the SSR preview route never drift. Format `<component>.<field>`.
 */
export const PROJECT_RELATIONS = ['project.programme', 'project.projets_lies'] as const;

/** Relation resolved on the home_page fetch (each slide's linked project). */
export const HOME_RELATIONS = ['home_slide.projet'] as const;

/**
 * Memoizes a published fetch for the process lifetime: the whole SSG build, or a `pnpm dev` session
 * (restart it to see newly published edits). Never caches in draft: the SSR preview must reflect
 * live edits per request. A rejected promise is
 * evicted so a transient error (network/5xx) is not replayed to every later caller.
 */
function memoizePublished<T>(fetcher: () => Promise<T>): () => Promise<T> {
  let cache: Promise<T> | undefined;
  return () => {
    if (storyblokVersion !== 'published') return fetcher();
    if (!cache) {
      const result = fetcher();
      cache = result;
      result.catch(() => {
        if (cache === result) cache = undefined;
      });
    }
    return cache;
  };
}

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

// Paginated list fetch (the delivery API caps a page at 100 entries).
function fetchAll<T>(slug: string, params: Record<string, unknown>): Promise<T[]> {
  return getStoryblokApi().getAll(slug, {
    version: storyblokVersion,
    per_page: MAX_PER_PAGE,
    ...params,
  }) as Promise<T[]>;
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

/** Any story with every relation resolved — the single fetch of the SSR preview route. */
export function getPreviewStory(slug: string): Promise<SbBlokData | null> {
  return fetchStoryContent<SbBlokData>(slug, {
    resolve_relations: [...PROJECT_RELATIONS, ...HOME_RELATIONS],
  });
}

export const getSettings = memoizePublished(() => fetchStoryContent<GlobalSettings>(SLUG.settings));

export const getThematiques = memoizePublished(() =>
  tolerateNotFound<ThematiqueEntry[]>(
    async () => {
      const entries = await fetchAll<ThematiqueEntry>('cdn/datasource_entries', {
        datasource: DATASOURCE_THEMATIQUE,
      });
      return entries.map((entry) => ({ name: entry.name, value: entry.value }));
    },
    [],
    `datasource "${DATASOURCE_THEMATIQUE}" absente (${storyblokVersion}) — filtre vide`,
  ),
);

/**
 * List the `programme` stories (under `programmes/`) as { nom, slug } for the Projets explorer
 * chips, which deep-link as `/projets?programme=<slug>`. A missing folder degrades to [].
 */
export const getProgrammes = memoizePublished(() =>
  tolerateNotFound<ProgrammeLink[]>(
    async () => {
      const stories = await fetchAll<ISbStoryData>('cdn/stories', { starts_with: 'programmes/' });
      return stories
        .filter((story) => (story.content as ProgrammeBlok)?.component === 'programme')
        .map((story) => ({ nom: (story.content as ProgrammeBlok).nom, slug: story.slug }));
    },
    [],
    `aucune story sous "programmes/" (${storyblokVersion}) — menu programmes vide`,
  ),
);

/** True when a relation field arrived resolved (a story object, not a bare uuid). */
export function isResolved(rel: unknown): rel is ISbStoryData {
  return typeof rel === 'object' && rel !== null && 'content' in rel;
}

/** Programme label + slug from a project's resolved `programme` relation. */
function toProgramme(blok: ProjectBlok): ProgrammeSummary | undefined {
  const rel = blok.programme;
  if (isResolved(rel)) {
    const programme = rel.content as ProgrammeBlok;
    return { nom: programme.nom, slug: rel.slug };
  }
  return undefined;
}

/** Cover photo for the VRAC grid / Index hover: the explicit field, else the first carousel image. */
export function coverPhoto(blok: ProjectBlok): StoryblokAsset | undefined {
  const first = blok.carrousel?.find(
    (slide) => presentAsset(slide.image_paysage) ?? presentAsset(slide.image_portrait),
  );
  return (
    presentAsset(blok.photo_couverture) ??
    presentAsset(first?.image_paysage) ??
    presentAsset(first?.image_portrait)
  );
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
    vignette: presentAsset(blok.vignette_plan),
    photo: coverPhoto(blok),
  };
}

/** Programme (label + slug) for the project detail (pure post-resolution narrower). */
export function resolveProgramme(blok: ProjectBlok): ProgrammeSummary | undefined {
  return toProgramme(blok);
}

// Related projects (the `projets_lies` relation, resolved via resolve_relations), else [].
// Each related story's own `programme` resolves too: the client sends `resolve_level=2` whenever
// `resolve_relations` is set, so every response carries the nested relations of its stories.
export function resolveRelated(blok: ProjectBlok): ProjectSummary[] {
  return (blok.projets_lies ?? [])
    .filter(isResolved)
    .map((story) => toSummary(story.content as ProjectBlok, story.slug));
}

// Single list fetch with the programme + linked-project relations resolved, shared by
// getStaticPaths, the Projets grid and llms.txt (no per-project N+1). `by_slugs`, not `starts_with`:
// when a page references too many relations the client re-fetches them by uuid and forwards
// `starts_with`, which would drop every programme (they live under `programmes/`).
const getProjectStories = memoizePublished(() =>
  tolerateNotFound<ISbStoryData[]>(
    async () => {
      const stories = await fetchAll<ISbStoryData>('cdn/stories', {
        by_slugs: 'projets/*',
        resolve_relations: [...PROJECT_RELATIONS],
      });
      return stories.filter((story) => (story.content as ProjectBlok)?.component === 'project');
    },
    [],
    `aucune story sous "projets/" (${storyblokVersion}) — grille vide`,
  ),
);

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const stories = await getProjectStories();
  return stories.map((story) => toSummary(story.content as ProjectBlok, story.slug));
}

export async function getAllProjects(): Promise<Array<{ slug: string; blok: ProjectBlok }>> {
  const stories = await getProjectStories();
  return stories.map((story) => ({ slug: story.slug, blok: story.content as ProjectBlok }));
}
