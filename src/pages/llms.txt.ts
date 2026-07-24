import type { APIRoute } from 'astro';
import { STORYBLOK_VERSION } from 'astro:env/server';
import { buildLlmsTxt, PREVIEW_LLMS } from '../lib/llms';

// Prerendered at build (SSG). On the preview site (draft) it renders the minimal stub.
export const prerender = true;

export const GET: APIRoute = async () => {
  const body = STORYBLOK_VERSION === 'draft' ? PREVIEW_LLMS : await buildLlmsTxt();
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
