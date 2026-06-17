import type { ISbStoryData } from '@storyblok/astro';
import { getStoryblokApi, storyblokVersion } from './storyblok';
import * as mock from '../data/mock';
import type {
  AtelierPageBlok,
  GlobalSettings,
  HomePageBlok,
  ProjectBlok,
  ProjectListBlok,
  ProjectSummary,
  TypologieEntry,
} from '../types/storyblok';

// Live-first with mock fallback: any fetch failure (empty space, missing token,
// network) falls back to mock content so the build never breaks.

const SLUG = {
  home: 'home',
  projectList: 'projets',
  atelier: 'atelier',
  settings: 'config',
} as const;

const DATASOURCE_TYPOLOGIE = 'typologie';

async function fetchContent<T>(
  slug: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  try {
    const api = getStoryblokApi();
    const { data } = await api.get(`cdn/stories/${slug}`, { version: storyblokVersion, ...params });
    return (data?.story?.content ?? null) as T | null;
  } catch {
    return null;
  }
}

function toSummary(content: ProjectBlok, slug: string): ProjectSummary {
  return {
    slug,
    titre: content.titre,
    typologie: content.typologie,
    cover: content.visuels?.[0],
  };
}

function resolveSimilar(blok: ProjectBlok): ProjectSummary | null {
  const rel = blok.projet_similaire;
  if (rel && typeof rel === 'object' && 'content' in rel) {
    return toSummary(rel.content as ProjectBlok, rel.slug);
  }
  if (typeof rel === 'string') {
    const m = mock.projectsMock.find((p) => p.content._uid === rel);
    if (m) return toSummary(m.content, m.slug);
  }
  return null;
}

export async function getHomePage(): Promise<HomePageBlok> {
  return (await fetchContent<HomePageBlok>(SLUG.home)) ?? mock.homeMock;
}

export async function getProjectListPage(): Promise<ProjectListBlok> {
  return (await fetchContent<ProjectListBlok>(SLUG.projectList)) ?? mock.projectListMock;
}

export async function getAtelierPage(): Promise<AtelierPageBlok> {
  return (await fetchContent<AtelierPageBlok>(SLUG.atelier)) ?? mock.atelierMock;
}

export async function getSettings(): Promise<GlobalSettings> {
  return (await fetchContent<GlobalSettings>(SLUG.settings)) ?? mock.settingsMock;
}

export async function getTypologies(): Promise<TypologieEntry[]> {
  try {
    const api = getStoryblokApi();
    const { data } = await api.get('cdn/datasource_entries', {
      datasource: DATASOURCE_TYPOLOGIE,
      version: storyblokVersion,
    });
    const entries: Array<{ name: string; value: string }> = data?.datasource_entries ?? [];
    if (entries.length === 0) return mock.typologiesMock;
    return entries.map((e) => ({ name: e.name, value: e.value }));
  } catch {
    return mock.typologiesMock;
  }
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  try {
    const api = getStoryblokApi();
    const { data } = await api.get('cdn/stories', {
      version: storyblokVersion,
      starts_with: 'projets/',
      per_page: 100,
    });
    const stories: ISbStoryData[] = data?.stories ?? [];
    const projects = stories
      .filter((s) => (s.content as ProjectBlok)?.component === 'project')
      .map((s) => toSummary(s.content as ProjectBlok, s.slug));
    return projects.length > 0
      ? projects
      : mock.projectsMock.map((p) => toSummary(p.content, p.slug));
  } catch {
    return mock.projectsMock.map((p) => toSummary(p.content, p.slug));
  }
}

export interface ProjectDetail {
  blok: ProjectBlok;
  similar: ProjectSummary | null;
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  try {
    const api = getStoryblokApi();
    const { data } = await api.get(`cdn/stories/projets/${slug}`, {
      version: storyblokVersion,
      resolve_relations: ['project.projet_similaire'],
    });
    const story: ISbStoryData | undefined = data?.story;
    if (!story) return fromMock(slug);
    const blok = story.content as ProjectBlok;
    return { blok, similar: resolveSimilar(blok) };
  } catch {
    return fromMock(slug);
  }
}

function fromMock(slug: string): ProjectDetail | null {
  const m = mock.projectsMock.find((p) => p.slug === slug);
  if (!m) return null;
  return { blok: m.content, similar: resolveSimilar(m.content) };
}
