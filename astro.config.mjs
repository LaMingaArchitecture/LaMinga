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

// CSP policy (emitted as a <meta> tag by Astro's native CSP).
// Production = strict, hash-based script/style + tight resource directives.
// Preview = no strict meta-CSP: the Storyblok bridge injects scripts/styles
// dynamically that have no build-time hash, so a hash CSP would break the
// Visual Editor. The preview env is password-protected and framing is allowed
// only there via an HTTP header (frame-ancestors lives in public/_headers,
// since frame-ancestors is ignored inside a <meta> CSP).
const securityConfig = isDraft
  ? {}
  : {
      security: {
        csp: {
          directives: [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "img-src 'self' data: https://a.storyblok.com https://a2.storyblok.com",
            "font-src 'self' data:",
            "connect-src 'self' https://api.storyblok.com",
          ],
        },
      },
    };

export default defineConfig({
  site: PUBLIC_SITE_URL,
  output: 'static',
  adapter: netlify(),
  ...securityConfig,
  integrations: [
    storyblok({
      accessToken: isDraft ? STORYBLOK_PREVIEW_TOKEN : STORYBLOK_PUBLIC_TOKEN,
      bridge: isDraft,
      apiOptions: { region: 'eu' },
      // Storyblok technical names (snake_case) -> Astro component paths.
      components: {
        project: 'storyblok/Project',
        project_list: 'storyblok/ProjectList',
        atelier_page: 'storyblok/AtelierPage',
        team_member: 'storyblok/TeamMember',
        home_page: 'storyblok/HomePage',
      },
    }),
    sitemap(),
  ],
  env: {
    schema: {
      // Optional: each Netlify context sets only the token it uses
      // (prod = Public, preview = Preview). Selected at config time via loadEnv.
      STORYBLOK_PUBLIC_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      STORYBLOK_PREVIEW_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
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
