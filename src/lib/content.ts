import type { ISbStoryData } from '@storyblok/astro';
import { getStoryblokApi, storyblokVersion } from './storyblok';
import type {
  AtelierPageBlok,
  GlobalSettings,
  HomePageBlok,
  ProjectBlok,
  ProjectListBlok,
  ProjectSummary,
  TypologieEntry,
} from '../types/storyblok';

// Live content only. Missing content (HTTP 404 / story-not-found, empty list,
// missing datasource) degrades gracefully: the fetch returns null/[] and the page
// renders a placeholder, so the build still succeeds. Genuine errors (network,
// 401 auth, 5xx) are intentionally NOT caught — they fail the build loudly rather
// than silently deploy an empty site over real content.

/** True when a Storyblok delivery error means "record not found" (HTTP 404). */
function isNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    (err as { status?: number }).status === 404
  );
}

const SLUG = {
  home: 'home',
  projectList: 'projets',
  atelier: 'atelier',
  settings: 'config',
} as const;

const DATASOURCE_TYPOLOGIE = 'typologie';

async function fetchStoryContent<T>(
  slug: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  try {
    const api = getStoryblokApi();
    const { data } = await api.get(`cdn/stories/${slug}`, { version: storyblokVersion, ...params });
    return data.story.content as T;
  } catch (err) {
    if (isNotFound(err)) {
      console.info(`[content] story "${slug}" absente (${storyblokVersion}) — placeholder rendu`);
      return null;
    }
    throw err;
  }
}

export function getHomePage(): Promise<HomePageBlok | null> {
  return fetchStoryContent<HomePageBlok>(SLUG.home);
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

export async function getTypologies(): Promise<TypologieEntry[]> {
  try {
    const api = getStoryblokApi();
    const { data } = await api.get('cdn/datasource_entries', {
      datasource: DATASOURCE_TYPOLOGIE,
      version: storyblokVersion,
      per_page: 100,
    });
    const entries: Array<{ name: string; value: string }> = data.datasource_entries ?? [];
    return entries.map((entry) => ({ name: entry.name, value: entry.value }));
  } catch (err) {
    if (isNotFound(err)) {
      console.info(
        `[content] datasource "${DATASOURCE_TYPOLOGIE}" absente (${storyblokVersion}) — filtre vide`,
      );
      return [];
    }
    throw err;
  }
}

function toSummary(blok: ProjectBlok, slug: string): ProjectSummary {
  return { slug, titre: blok.titre, typologie: blok.typologie, cover: blok.visuels?.[0] };
}

/** Resolved similar project (relation comes resolved via resolve_relations), else null. */
export function resolveSimilar(blok: ProjectBlok): ProjectSummary | null {
  const rel = blok.projet_similaire;
  if (rel && typeof rel === 'object' && 'content' in rel) {
    return toSummary(rel.content as ProjectBlok, rel.slug);
  }
  return null;
}

// Single list fetch with the similar-project relation resolved, shared by the
// grid and the static-path generation (no per-project N+1).
async function getProjectStories(): Promise<ISbStoryData[]> {
  try {
    const api = getStoryblokApi();
    const { data } = await api.get('cdn/stories', {
      version: storyblokVersion,
      starts_with: 'projets/',
      per_page: 100,
      resolve_relations: ['project.projet_similaire'],
    });
    const stories: ISbStoryData[] = data.stories ?? [];
    return stories.filter((story) => (story.content as ProjectBlok)?.component === 'project');
  } catch (err) {
    if (isNotFound(err)) {
      console.info(`[content] aucune story sous "projets/" (${storyblokVersion}) — grille vide`);
      return [];
    }
    throw err;
  }
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const stories = await getProjectStories();
  return stories.map((story) => toSummary(story.content as ProjectBlok, story.slug));
}

export async function getAllProjects(): Promise<Array<{ slug: string; blok: ProjectBlok }>> {
  const stories = await getProjectStories();
  return stories.map((story) => ({ slug: story.slug, blok: story.content as ProjectBlok }));
}
