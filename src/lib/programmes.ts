import type { ISbStoryData } from '@storyblok/astro';
import type { ProgrammeBlok, ProgrammeSummary, ProjectBlok, SbRelation } from '../types/storyblok';

/** True when a relation field arrived resolved (a story object, not a bare uuid). */
export function isResolved(rel: unknown): rel is ISbStoryData {
  return typeof rel === 'object' && rel !== null && 'content' in rel;
}

function toSummary(rel: SbRelation): ProgrammeSummary[] {
  return isResolved(rel) ? [{ nom: (rel.content as ProgrammeBlok).nom, slug: rel.slug }] : [];
}

/** A project's programmes (label + slug); unresolved relations are skipped. */
export function toProgrammes(blok: ProjectBlok): ProgrammeSummary[] {
  return (blok.programmes ?? []).flatMap(toSummary);
}
