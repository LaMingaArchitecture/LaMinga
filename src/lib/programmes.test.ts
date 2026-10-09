import type { ISbStoryData } from '@storyblok/astro';
import { describe, expect, test } from 'vitest';
import type { ProjectBlok } from '../types/storyblok';
import { toProgrammes } from './programmes';

const programme = (slug: string, nom: string) =>
  ({ slug, content: { component: 'programme', nom } }) as unknown as ISbStoryData;

const project = (fields: Partial<ProjectBlok>): ProjectBlok =>
  ({ component: 'project', titre: 'Projet', _uid: 'p', ...fields }) as ProjectBlok;

describe('toProgrammes', () => {
  test('returns every resolved programme in editor order', () => {
    const blok = project({
      programmes: [
        programme('enseignement', 'Enseignement'),
        programme('equipement', 'Équipement'),
      ],
    });
    expect(toProgrammes(blok)).toEqual([
      { nom: 'Enseignement', slug: 'enseignement' },
      { nom: 'Équipement', slug: 'equipement' },
    ]);
  });

  test('falls back to the single legacy programme when programmes is empty', () => {
    const blok = project({
      programmes: [],
      programme: programme('habitat-social', 'Habitat social'),
    });
    expect(toProgrammes(blok)).toEqual([{ nom: 'Habitat social', slug: 'habitat-social' }]);
  });

  test('prefers programmes over the legacy field', () => {
    const blok = project({
      programmes: [programme('commerce', 'Commerce')],
      programme: programme('habitat-social', 'Habitat social'),
    });
    expect(toProgrammes(blok)).toEqual([{ nom: 'Commerce', slug: 'commerce' }]);
  });

  test('ignores unresolved relations (bare uuids)', () => {
    const blok = project({ programmes: ['9b56f0a3-uuid', programme('commerce', 'Commerce')] });
    expect(toProgrammes(blok)).toEqual([{ nom: 'Commerce', slug: 'commerce' }]);
  });

  test('returns an empty list when the project has no programme', () => {
    expect(toProgrammes(project({}))).toEqual([]);
  });
});
