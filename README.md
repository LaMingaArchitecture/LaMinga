# LaMinga — site vitrine

Site vitrine de l'atelier d'architecture LaMinga. **Astro 6 + Storyblok** (headless),
déployé sur **Netlify**. Production statique (SSG), environnement de preview SSR pour
l'éditeur visuel Storyblok.

## Stack & rendu

- Astro 6 (TypeScript strict), `@storyblok/astro` 9 (région EU), adaptateur `@astrojs/netlify`,
  `@astrojs/sitemap` ; Node 22, pnpm (versions verrouillées par `pnpm-lock.yaml`).
- **Prod = SSG** (token Public, contenu `published`). **Preview = SSR** sur la route
  `/preview/` (token Preview, contenu `draft`) pour l'éditeur visuel. La publication déclenche
  un rebuild de la prod via webhook → build hook.
- Langue **FR uniquement** (pas d'i18n). Modèle de contenu : `storyblok/content-model.md`.

## Prérequis

- Node 22 (voir `.nvmrc`)
- pnpm 10 (via corepack)

## Installation

```bash
corepack enable
pnpm install
cp .env.example .env   # renseigner les tokens Storyblok (gestionnaire de mots de passe)
```

## Scripts

| Script                              | Description                           |
| ----------------------------------- | ------------------------------------- |
| `pnpm dev`                          | Serveur de développement              |
| `pnpm build`                        | Build de production (SSG)             |
| `pnpm preview`                      | Prévisualiser le build                |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                |
| `pnpm format` / `pnpm format:check` | Prettier                              |
| `pnpm typecheck`                    | Vérification de types (`astro check`) |

## Convention de commits

[Conventional Commits](https://www.conventionalcommits.org/), vérifiés par **commitlint**
(hook `commit-msg`). Types autorisés : `feat`, `fix`, `docs`, `chore`, `style`, `refactor`,
`perf`, `test`, `ci`, `build`, `revert`.

Format : `type(scope): description` — ex. `feat(projet): ajoute la galerie carrousel`.

Les hooks Husky sont actifs (`pre-commit` = lint-staged, `commit-msg` = commitlint).
**Ne jamais utiliser `--no-verify`.**

## Variables d'environnement

Voir `.env.example`. Les tokens Storyblok ne sont jamais commités : `.env` en local,
variables de contexte dans l'UI Netlify en ligne.

| Variable                  | Rôle                                               |
| ------------------------- | -------------------------------------------------- |
| `STORYBLOK_PUBLIC_TOKEN`  | Token de delivery (prod SSG, contenu `published`)  |
| `STORYBLOK_PREVIEW_TOKEN` | Token de preview (preview SSR, contenu `draft`)    |
| `PUBLIC_SITE_URL`         | URL canonique du site (sitemap, balises canonical) |
| `STORYBLOK_VERSION`       | `published` (prod) \| `draft` (preview)            |

## Déploiement

Prod statique (SSG) sur `main` ; environnement de preview SSR (route `/preview/`) pour
l'éditeur visuel. La publication d'un contenu déclenche un rebuild de la prod via un webhook
Storyblok → build hook Netlify. Procédure complète (build hook, webhook, éditeur visuel,
protection par mot de passe, recette) : **[`docs/deployment.md`](docs/deployment.md)**.

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — contexte technique (commandes, stack, rendu, conventions)
- [`src/storyblok/CLAUDE.md`](src/storyblok/CLAUDE.md) — règles d'écriture des blocs Storyblok
- [`storyblok/content-model.md`](storyblok/content-model.md) — schéma du modèle de contenu
- [`docs/deployment.md`](docs/deployment.md) — déploiement Netlify + webhook
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — workflow Git et conventions
- [`docs/back-office.md`](docs/back-office.md) — guide éditeur (créer une fiche projet)
