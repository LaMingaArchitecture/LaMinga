import { useStoryblokApi } from '@storyblok/astro';
import { STORYBLOK_VERSION } from 'astro:env/server';

/**
 * Content version for delivery API calls.
 * 'published' in production (SSG); 'draft' in the preview environment (SSR).
 */
export const storyblokVersion: 'draft' | 'published' = STORYBLOK_VERSION;

/** Storyblok delivery API client (token/region configured in astro.config.mjs). */
export function getStoryblokApi() {
  return useStoryblokApi();
}
