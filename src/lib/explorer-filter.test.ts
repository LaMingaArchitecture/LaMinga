import { describe, expect, test } from 'vitest';
import { matchesFilters } from './explorer-filter';

const item = {
  programmes: 'enseignement equipement',
  thematiques: 'restructuration reemploi',
  search: 'maistre toilettes paris',
};
const none = { programme: null, thematique: null, query: '' };

describe('matchesFilters', () => {
  test('matches under each of its programmes', () => {
    expect(matchesFilters(item, { ...none, programme: 'enseignement' })).toBe(true);
    expect(matchesFilters(item, { ...none, programme: 'equipement' })).toBe(true);
  });

  test('rejects another programme, without matching on a slug prefix', () => {
    expect(matchesFilters(item, { ...none, programme: 'commerce' })).toBe(false);
    expect(matchesFilters(item, { ...none, programme: 'equip' })).toBe(false);
  });

  test('a project without programme only shows when no programme is selected', () => {
    const bare = { ...item, programmes: '' };
    expect(matchesFilters(bare, none)).toBe(true);
    expect(matchesFilters(bare, { ...none, programme: 'enseignement' })).toBe(false);
  });

  test('combines programme, thematique and search', () => {
    expect(
      matchesFilters(item, { programme: 'equipement', thematique: 'reemploi', query: 'toilettes' }),
    ).toBe(true);
    expect(
      matchesFilters(item, { programme: 'equipement', thematique: 'ruralite', query: '' }),
    ).toBe(false);
    expect(matchesFilters(item, { ...none, query: 'anglet' })).toBe(false);
  });
});
