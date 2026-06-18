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
- Preview : SSR à la demande sur la route `src/pages/preview/[...slug].astro`
  (`prerender=false`), token Preview, version `draft` ; gardée en 404 hors `draft`
- Sélection token + bridge dans `astro.config.mjs` via `loadEnv(STORYBLOK_VERSION)`
- Publication Storyblok → webhook → Build Hook Netlify → rebuild prod (cf. `docs/deployment.md`)

## Structure

- `src/storyblok/` — un composant par bloc (prop `blok`, `storyblokEditable` sur la racine) ;
  voir `src/storyblok/CLAUDE.md`. Schéma : `storyblok/content-model.md`
- `src/components/` — UI non-Storyblok (Nav, Footer, ProjectCard, TypologieFilter)
- `src/lib/` — `content.ts` (accès contenu live ; les erreurs remontent), `storyblok.ts`, `image.ts`
- `src/layouts/`, `src/types/`
- Pages : `index`, `projets/index`, `projets/[slug]`, `atelier`, `preview/[...slug]`
- `scripts/generate-headers.mjs` → `public/_headers` (cadrage par contexte, généré au build)

## Contenu (Storyblok)

- Langue : **FR uniquement** (pas d'i18n)
- Types : `home_page`, `project_list`, `project`, `atelier_page`, `team_member`
  - réglages globaux `global_settings` (+ `social_link`)
- **Noms techniques en `snake_case`** = clés de `components` dans `astro.config.mjs`
- Filtre unique : **`typologie`** (datasource, jamais de valeurs en dur)
- "Projet similaire" = relation `projet_similaire` entre deux `project`
- Nav : Logo · Projets · Atelier · Réseaux Sociaux

## Sécurité / CSP

- CSP native Astro (meta) en prod : `script/style` par hash + `default/img/connect-src` restreints
- Cadrage : `public/_headers` généré par contexte — `DENY` en prod ; `frame-ancestors
https://app.storyblok.com` en preview uniquement (le bridge n'est autorisé qu'en preview)
- En-têtes standards dans `netlify.toml` ; tokens = secrets de l'UI Netlify par contexte

## Conventions

- Conventional Commits ; hooks Husky actifs ; `--no-verify` interdit
- Avant commit : `lint` + `typecheck` + `build` doivent passer
- Composant Astro statique par défaut ; `client:*` seulement si réellement interactif
- Images via le service Storyblok (`src/lib/image.ts`) ; respecter eslint-plugin-jsx-a11y

## À ne pas faire

- Committer un `.env` ou un token (cf. `.gitignore`)
- Mettre la prod en SSR (la prod reste statique ; seul `/preview/` est SSR)
- Coder des typologies en dur (toujours via la datasource)
- Casser la correspondance nom `snake_case` ↔ clé de la map `components`
