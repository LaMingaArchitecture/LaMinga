import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { storyblok } from '@storyblok/astro';

// Read env at config-eval time (astro:env modules aren't available here).
// Empty prefix loads ALL vars, including the server-only Storyblok tokens.
// This stays config-time only — secrets are never shipped to the client bundle.
const { STORYBLOK_PUBLIC_TOKEN, STORYBLOK_PREVIEW_TOKEN, STORYBLOK_VERSION, PUBLIC_SITE_URL } =
  loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Rendering model:
//   published -> prod SSG, Public token, bridge OFF
//   draft     -> preview SSR, Preview token, bridge ON (Visual Editor)
const isDraft = STORYBLOK_VERSION === 'draft';

export default defineConfig({
  site: PUBLIC_SITE_URL,
  output: 'static',
  adapter: netlify(),
  integrations: [
    storyblok({
      accessToken: isDraft ? STORYBLOK_PREVIEW_TOKEN : STORYBLOK_PUBLIC_TOKEN,
      bridge: isDraft,
      apiOptions: { region: 'eu' },
      components: {
        page: 'storyblok/Page',
      },
    }),
    sitemap(),
  ],
  env: {
    schema: {
      STORYBLOK_PUBLIC_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      STORYBLOK_PREVIEW_TOKEN: envField.string({ context: 'server', access: 'secret' }),
      PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public' }),
      STORYBLOK_VERSION: envField.enum({
        context: 'server',
        access: 'public',
        values: ['draft', 'published'],
        default: 'published',
      }),
    },
  },
});
