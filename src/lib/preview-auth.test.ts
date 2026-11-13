import { afterEach, describe, expect, test, vi } from 'vitest';
import previewAuth from '../../netlify/edge-functions/preview-auth';

const SECRET = 'équipe:mot-de-passe';

const stubEnv = (env: Record<string, string>): void => {
  vi.stubGlobal('Netlify', { env: { get: (key: string) => env[key] } });
};

const request = (credentials?: string, path = '/'): Request => {
  const headers = new Headers();
  if (credentials !== undefined) {
    const bytes = new TextEncoder().encode(credentials);
    headers.set('authorization', `basic ${btoa(String.fromCharCode(...bytes))}`);
  }
  return new Request(`https://preview.example${path}`, { headers });
};

afterEach(() => vi.unstubAllGlobals());

describe('previewAuth', () => {
  test('is inert without any preview signal (production)', () => {
    stubEnv({ STORYBLOK_VERSION: 'published' });
    expect(previewAuth(request())).toBeUndefined();
  });

  test('fails closed on a draft site without credentials configured', () => {
    stubEnv({ STORYBLOK_VERSION: 'draft' });
    expect(previewAuth(request(SECRET))?.status).toBe(503);
  });

  test('challenges a missing or wrong password', () => {
    stubEnv({ PREVIEW_BASIC_AUTH: SECRET });
    expect(previewAuth(request())?.status).toBe(401);
    expect(previewAuth(request('équipe:autre'))?.status).toBe(401);
    expect(previewAuth(request())?.headers.get('WWW-Authenticate')).toContain('Basic');
  });

  test('lets the right password through', () => {
    stubEnv({ PREVIEW_BASIC_AUTH: SECRET });
    expect(previewAuth(request(SECRET, '/preview/home'))).toBeUndefined();
    expect(previewAuth(request(SECRET, '/mentions-legales'))).toBeUndefined();
  });

  test.each([
    ['/', '/preview/home'],
    ['/atelier/', '/preview/atelier'],
    ['/projets?programme=logement', '/preview/projets?programme=logement'],
    ['/projets/tardets', '/preview/projets/tardets'],
  ])('sends the static page %s to its live draft', (path, target) => {
    stubEnv({ PREVIEW_BASIC_AUTH: SECRET });
    const response = previewAuth(request(SECRET, path));
    expect(response?.status).toBe(302);
    expect(response?.headers.get('location')).toBe(`https://preview.example${target}`);
  });
});
