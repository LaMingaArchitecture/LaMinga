import type { ProjectSummary } from '../types/storyblok';

// Shared by the build-time haystack (data-search on each row/tile) and the client-side query, so
// the two normalize identically. Pure + dependency-free → safe to import into the browser bundle.

/** Accent-insensitive, lowercased key for substring search ("Réemploi" → "reemploi"). */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** The searchable haystack for a project: titre, ville, maîtrise d'ouvrage, description programme. */
export function projectSearchText(project: ProjectSummary): string {
  return normalizeSearch(
    [project.titre, project.ville, project.maitre_ouvrage, project.description_programme]
      .filter(Boolean)
      .join(' '),
  );
}
