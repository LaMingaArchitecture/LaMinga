# Contribuer — LaMinga

## Workflow Git

- **Une feature = une branche = une PR.** Jamais de commit direct sur `main`.
- Nommage des branches : `feat/*`, `fix/*`, `chore/*`, `docs/*`, `ci/*`, `refactor/*`.
- Chaque PR génère un **Deploy Preview** Netlify (URL dédiée) — valider dessus avant de merger.
- La **promotion = le merge sur `main`** (revue + CI verte). Rollback Netlify en un clic si besoin.

## Avant de committer

```bash
pnpm lint && pnpm typecheck && pnpm build
```

Les hooks Husky s'exécutent automatiquement :

- `pre-commit` → `lint-staged` (ESLint `--fix` + Prettier `--write` sur les fichiers stagés)
- `commit-msg` → `commitlint` (Conventional Commits)

**Ne jamais contourner les hooks (`--no-verify` interdit).** Si un hook échoue, le commit n'a
pas eu lieu : corriger, re-stager, refaire un **nouveau** commit (pas de `--amend` sur un commit
déjà poussé).

## Convention de commits

Format : `type(scope): description`. Types : `feat`, `fix`, `docs`, `chore`, `style`,
`refactor`, `perf`, `test`, `ci`, `build`, `revert`. Exemple :
`feat(projet): ajoute la galerie carrousel`.

## Blocs Storyblok

Tout nouveau bloc : composant dans `src/storyblok/` (avec `storyblokEditable`), enregistré dans
`astro.config.mjs` (nom technique `snake_case`), typé dans `src/types/storyblok.ts`. Voir
[`src/storyblok/CLAUDE.md`](src/storyblok/CLAUDE.md) et [`storyblok/content-model.md`](storyblok/content-model.md).

## Sécurité

- Aucun secret commité (`.env` ignoré ; tokens en variables d'environnement par site Netlify).
- Ne pas affaiblir la CSP de production ni autoriser le cadrage en dehors de la preview.
