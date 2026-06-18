# CLAUDE.md — Blocs Storyblok (`src/storyblok/`)

Règles spécifiques à l'écriture des composants de bloc. Voir aussi le `CLAUDE.md` racine et
le schéma `storyblok/content-model.md`.

## Règles

- **`storyblokEditable(blok)`** sur l'élément racine de CHAQUE composant de bloc (sinon
  l'éditeur visuel ne peut pas cibler le bloc).
- **Enregistrer tout nouveau bloc Storyblok** (tout ce qui a un `component`) dans `components`
  de `astro.config.mjs`, clé = **nom technique `snake_case`** (= `content.component`), valeur =
  `storyblok/MonComposant`. Les composants de présentation pilotés par des champs (p. ex.
  `ImageGallery`, `ProjectCard`) ne sont PAS des bloks : ils s'importent directement, ne pas les
  enregistrer.
- **Rendu imbriqué** via `<StoryblokComponent blok={nestedBlok} />` (jamais d'import direct
  d'un bloc enregistré depuis une page → risque de cycle d'imports).
- **Richtext** : toujours `renderRichText` (cf. `RichText.astro`) + `set:html` ; jamais de
  HTML brut concaténé.
- **Images** : service Storyblok via `sbImage()` (`src/lib/image.ts`) — `/m/{w}x{h}/` +
  `filters:format(webp)`. Toujours un `alt` (fallback raisonnable).
- **Données / relations** : récupérées dans `src/lib/content.ts` (live uniquement ; les erreurs
  de fetch remontent — pas de contenu de secours silencieux).
  - `version` : `draft` (preview) vs `published` (prod) — déjà géré par `storyblokVersion`.
  - "Projet similaire" : relation `projet_similaire`, résolue via
    `resolve_relations: ['project.projet_similaire']`.
  - Filtre projets : datasource `typologie` (`getTypologies`), jamais de valeurs en dur.
- **Blocs de page** (`home_page`, `project_list`) : ils chargent eux-mêmes leurs données dérivées
  (grille, typologies) via `getProjectSummaries`/`getTypologies`, car rendus par `StoryblokComponent`.
- **Types** : tout bloc a une interface dans `src/types/storyblok.ts` (étend `SbBlokData`,
  discriminant `component` en `snake_case`). Pas de `any`.
- **Régénérer les types** après un changement de schéma Storyblok (re-pull du modèle) et
  mettre à jour `src/types/storyblok.ts` en conséquence.
- **Hydratation** : `client:visible` / `client:idle` seulement si le bloc est réellement
  interactif (la plupart restent statiques).

## `global_settings` / `social_link`

Lus par `getSettings()` et affichés par `Nav`/`Footer` (pas de `StoryblokComponent`) — ne pas
les ajouter à la map `components`.
