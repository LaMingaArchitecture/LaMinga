# CLAUDE.md — Site LaMinga

Vitrine d'agence d'architecture. **Astro 6 + Storyblok** (headless), déployé sur **Netlify**.
Prod = statique (SSG). Preview = SSR (contenu `draft`) pour l'éditeur visuel.
Éditeurs non-techniques : autonomie d'édition et performance priment.

## Commandes (pnpm)

- `pnpm dev` — développement
- `pnpm build` — build de prod (doit TOUJOURS passer avant un commit)
- `pnpm preview` — prévisualiser le build
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm typecheck` — `astro check`
- `pnpm audit` — audit des dépendances

## Stack (versions verrouillées par pnpm-lock.yaml)

- Node 22 (`.nvmrc`), pnpm 10 (corepack), TypeScript strict
- Astro 6, `@storyblok/astro` 9 (région EU, bridge activé en `draft` uniquement)
- Adaptateur `@astrojs/netlify` 7, `@astrojs/sitemap` 3
- `vite` épinglé en dépendance directe (utilisé par `loadEnv` dans `astro.config.mjs`)
- Variables typées via `astro:env` — JAMAIS de secret en dur

## Rendu

- Prod (`main`) : SSG, token Public, version `published`
- Preview : **2ᵉ site Netlify** qui build la même branche `main` avec `STORYBLOK_VERSION=draft`
  (token Preview, bridge ON). Route SSR `src/pages/preview/[...slug].astro` (`prerender=false`) ;
  gardée en 404 hors `draft`. Accès protégé par l'edge function `netlify/edge-functions/preview-auth.ts`
- Sélection token + bridge + CSP dans `astro.config.mjs` via `loadEnv(STORYBLOK_VERSION)` —
  commutateur unique (le site preview a `CONTEXT=production`, donc on se base sur `STORYBLOK_VERSION`,
  pas sur `CONTEXT`)
- Publication Storyblok → webhook → Build Hook Netlify → rebuild prod (cf. `docs/deployment.md`)

## Structure

- `src/storyblok/` — un composant par bloc (prop `blok`, `storyblokEditable` sur la racine) ;
  voir `src/storyblok/CLAUDE.md`. Schéma : `storyblok/content-model.md`
- `src/components/` — UI non-Storyblok (Nav, Footer, ProjectCard, ThematiqueFilter)
- `src/lib/` — `content.ts` (accès contenu live ; contenu manquant 404/vide → `null`/`[]` +
  placeholder, les erreurs réseau/401/5xx remontent), `storyblok.ts`, `image.ts`
- `src/layouts/`, `src/types/`
- Pages : `index`, `projets/index`, `projets/[slug]`, `atelier`, `preview/[...slug]`
- `scripts/generate-headers.mjs` → `public/_headers` (cadrage selon `STORYBLOK_VERSION`, généré au build)
- `netlify/edge-functions/preview-auth.ts` — Basic-Auth du site preview (Deno ; hors toolchain Astro)

## Contenu (Storyblok)

- Langue : **FR uniquement** (pas d'i18n) — noms de champs en FR (équipe marketing)
- Types : `home_page` (`home_slide`), `project_list`, `project` (`media_slide`, `engagement`),
  `atelier_page` (`team_member`), `programme`, `global_settings` (+ `social_link`)
- **Noms techniques en `snake_case`** = clés de `components` dans `astro.config.mjs`
- Classification à 2 niveaux : **`programme`** (relation, 1 par projet, avec `couleur`) +
  **`thematiques`** (datasource `thematique`, plusieurs par projet — jamais de valeurs en dur)
- Projets liés = relation `projets_lies` ; relations résolues via `PROJECT_RELATIONS` /
  `HOME_RELATIONS` (`src/lib/content.ts`, fetch partagé sans N+1) — même liste dans `preview/[...slug]`
- Assets SVG (logo, icônes) rendus depuis le filename brut (pas `sbImage`) ; vidéo mp4 → CSP `media-src`
- Schéma détaillé : `storyblok/content-model.md`
- Nav : Logo · Projets · Atelier · Réseaux Sociaux

## Sécurité / CSP

- CSP native Astro (meta) en prod : `script/style` par hash + `default/img/connect-src` restreints
- Cadrage : `public/_headers` généré selon `STORYBLOK_VERSION` — `DENY` en prod ; `frame-ancestors
https://app.storyblok.com` en preview uniquement (le bridge n'est autorisé qu'en preview)
- Accès preview : edge function `preview-auth` (Basic-Auth) — protège tout le site preview, inerte en prod
- En-têtes standards dans `netlify.toml` ; tokens = secrets de l'UI Netlify par site

## Conventions

- Conventional Commits ; hooks Husky actifs ; `--no-verify` interdit
- Avant commit : `lint` + `typecheck` + `build` doivent passer
- Composant Astro statique par défaut ; `client:*` seulement si réellement interactif
- Images via le service Storyblok (`src/lib/image.ts`) ; respecter eslint-plugin-jsx-a11y

## À ne pas faire

- Committer un `.env` ou un token (cf. `.gitignore`)
- **Référencer un identifiant de ticket ou d'outil de suivi externe** (n° d'issue, tag de
  sprint, etc.) dans le code, les commentaires, les messages de commit ou la doc — se référer
  uniquement au motif **métier ou technique**
- Mettre la prod en SSR (la prod reste statique ; seul `/preview/` est SSR)
- Coder des thématiques ou programmes en dur (toujours via la datasource / les stories `programme`)
- Casser la correspondance nom `snake_case` ↔ clé de la map `components`
