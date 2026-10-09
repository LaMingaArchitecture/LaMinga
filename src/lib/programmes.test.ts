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

  test('ignores the retired single programme field', () => {
    const blok = { ...project({}), programme: programme('habitat-social', 'Habitat social') };
    expect(toProgrammes(blok)).toEqual([]);
  });

  test('ignores unresolved relations (bare uuids)', () => {
    const blok = project({ programmes: ['9b56f0a3-uuid', programme('commerce', 'Commerce')] });
    expect(toProgrammes(blok)).toEqual([{ nom: 'Commerce', slug: 'commerce' }]);
  });

  test('returns an empty list when the project has no programme', () => {
    expect(toProgrammes(project({}))).toEqual([]);
  });
});
