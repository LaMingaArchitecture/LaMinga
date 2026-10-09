import type { ISbStoryData } from '@storyblok/astro';
import type { ProjectBlok } from '../types/storyblok';
import { toProgrammes } from './programmes';

interface Similarity {
  story: ISbStoryData;
  sharesProgramme: boolean;
  sharedThematiques: number;
}

/** The stories most similar to `blok` (itself excluded): a shared programme first, then the most
 *  shared thématiques; stories sharing neither are dropped. */
export function rankSimilar(
  blok: ProjectBlok,
  stories: ISbStoryData[],
  max: number,
): ISbStoryData[] {
  const programmes = new Set(toProgrammes(blok).map((p) => p.slug));
  const thematiques = new Set(blok.thematiques ?? []);
  const similarityOf = (story: ISbStoryData): Similarity => {
    const other = story.content as ProjectBlok;
    return {
      story,
      sharesProgramme: toProgrammes(other).some((p) => programmes.has(p.slug)),
      sharedThematiques: (other.thematiques ?? []).filter((value) => thematiques.has(value)).length,
    };
  };
  return stories
    .filter((story) => (story.content as ProjectBlok)._uid !== blok._uid)
    .map(similarityOf)
    .filter(({ sharesProgramme, sharedThematiques }) => sharesProgramme || sharedThematiques > 0)
    .sort(
      (a, b) =>
        Number(b.sharesProgramme) - Number(a.sharesProgramme) ||
        b.sharedThematiques - a.sharedThematiques,
    )
    .slice(0, max)
    .map(({ story }) => story);
}
