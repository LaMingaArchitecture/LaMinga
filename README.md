# LaMinga — site vitrine

Site vitrine de l'atelier d'architecture LaMinga. **Astro 6 + Storyblok** (headless),
déployé sur **Netlify**. Production statique (SSG), environnement de preview SSR pour
l'éditeur visuel Storyblok.

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

> Documentation complète (déploiement, webhook, variables d'environnement) ajoutée à
> l'étape de documentation.
