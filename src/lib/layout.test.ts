import { describe, expect, test } from 'vitest';
import { chromeFor } from './layout';

describe('chromeFor', () => {
  test('only the home reveals the nav cartouches on hover', () => {
    expect(chromeFor('home_page').navReveal).toBe(true);
    for (const component of ['project', 'project_list', 'atelier_page', undefined]) {
      expect(chromeFor(component).navReveal).toBeFalsy();
    }
  });
});
