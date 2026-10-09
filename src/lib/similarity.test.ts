import type { ISbStoryData } from '@storyblok/astro';
import { describe, expect, test } from 'vitest';
import type { ProjectBlok } from '../types/storyblok';
import { rankSimilar } from './similarity';

const programme = (slug: string) =>
  ({ slug, content: { component: 'programme', nom: slug } }) as unknown as ISbStoryData;

const story = (slug: string, programmes: string[], thematiques: string[] = []): ISbStoryData =>
  ({
    slug,
    content: {
      component: 'project',
      _uid: slug,
      titre: slug,
      programmes: programmes.map(programme),
      thematiques,
    },
  }) as unknown as ISbStoryData;

const blokOf = (s: ISbStoryData) => s.content as ProjectBlok;
const slugs = (stories: ISbStoryData[]) => stories.map((s) => s.slug);

describe('rankSimilar', () => {
  test('one shared programme among several counts as the same programme', () => {
    const target = story('maistre', ['enseignement', 'equipement']);
    const candidates = [story('thema-only', [], []), story('anglet', ['equipement'])];
    expect(slugs(rankSimilar(blokOf(target), [target, ...candidates], 5))).toEqual(['anglet']);
  });

  test('ranks a shared programme above shared thematiques, then by thematique count', () => {
    const target = story('target', ['habitat-social'], ['reemploi', 'biosource']);
    const candidates = [
      story('one-thema', ['commerce'], ['reemploi']),
      story('two-thema', ['commerce'], ['reemploi', 'biosource']),
      story('same-prog', ['habitat-social']),
      story('unrelated', ['commerce'], ['ruralite']),
    ];
    expect(slugs(rankSimilar(blokOf(target), [target, ...candidates], 5))).toEqual([
      'same-prog',
      'two-thema',
      'one-thema',
    ]);
  });

  test('caps the result at the given maximum', () => {
    const target = story('target', ['habitat-social']);
    const candidates = ['a', 'b', 'c'].map((s) => story(s, ['habitat-social']));
    expect(rankSimilar(blokOf(target), candidates, 2)).toHaveLength(2);
  });
});
