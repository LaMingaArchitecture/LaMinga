/// <reference types="@netlify/edge-functions" />

// Netlify Edge Function — gate the PREVIEW site behind HTTP Basic-Auth.
//
// Two Netlify sites build this repo from `main`: the production site
// (STORYBLOK_VERSION=published) and the preview site (STORYBLOK_VERSION=draft, which
// renders unpublished Storyblok drafts). This runs on every request of both sites
// but self-disables on production, so only the preview site is protected.
// Credentials come from the PREVIEW_BASIC_AUTH env var ("user:password"), set only
// in the preview site's Netlify environment.
//
// Runs on Deno (Netlify Edge), not Node. It is excluded from `astro check`/ESLint
// (tsconfig "exclude" + ESLint ignores) but IS type-checked against the Netlify Edge
// types via `pnpm typecheck:edge` (netlify/tsconfig.json), which the standard
// `pnpm typecheck` runs.

export default function previewAuth(request: Request): Response | undefined {
  // Inert on the production site: only the draft (preview) site is gated. Keep this
  // env read + early return as the first action so a prod request can never error here.
  if (Netlify.env.get('STORYBLOK_VERSION') !== 'draft') return undefined;

  const expected = Netlify.env.get('PREVIEW_BASIC_AUTH');
  // Fail closed: never expose drafts if the gate isn't configured.
  if (!expected) {
    return new Response('Preview access is not configured.', { status: 503 });
  }

  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded && safeEqual(decodeBase64(encoded), expected)) {
    return undefined; // authenticated — continue to the origin
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="LaMinga preview", charset="UTF-8"' },
  });
}

function decodeBase64(value: string): string {
  try {
    // atob yields a Latin-1 byte string; reinterpret those bytes as UTF-8 so an
    // accented PREVIEW_BASIC_AUTH (e.g. a French password) compares correctly with
    // the UTF-8 env value (matches the charset="UTF-8" advertised above).
    return new TextDecoder().decode(Uint8Array.from(atob(value), (c) => c.charCodeAt(0)));
  } catch {
    return '';
  }
}

// Constant-time-ish comparison to avoid trivial timing leaks on the shared secret.
// Note: it returns early on a length mismatch, so length is not hidden — acceptable
// for a marketing-draft gate over TLS with a high-entropy secret.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
