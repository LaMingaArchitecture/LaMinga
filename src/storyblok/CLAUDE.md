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
- **Bloc non enregistré** (composant inconnu ou en cours de modélisation) → rendu par `FallbackBlok`
  (`customFallbackComponent` dans `astro.config.mjs`) : rien en prod, notice discrète en draft. Un
  bloc non modélisé ne casse jamais le build.
- **Richtext** : toujours `renderRichText` (cf. `RichText.astro`) + `set:html` ; jamais de
  HTML brut concaténé.
- **Images** : service Storyblok via `sbImage()` (`src/lib/image.ts`) — `/m/{w}x{h}/` +
  `filters:format(webp)`. Toujours un `alt` (fallback raisonnable).
- **SVG** (logo, `social_link.icone`, `engagement.icone`) : rendus depuis le **filename brut**, PAS
  `sbImage()` (qui rasterise en webp). Icône décorative accompagnée d'un texte → `alt=""`.
- **Vidéo** (`media_slide`/`home_slide`/atelier) : via `ResponsiveMedia.astro` — `<video muted
autoplay loop playsinline>` + `<track kind="captions" />` (a11y lint). Hôtes autorisés par le CSP
  `media-src` (`astro.config.mjs`).
- **Données / relations** : récupérées dans `src/lib/content.ts` (live uniquement). Contenu
  manquant (404 / liste vide / datasource absente) → `null`/`[]` + placeholder `ContentNotice`
  (le build dégrade sans échouer) ; les erreurs réseau/401/5xx remontent et font échouer le build.
  - `version` : `draft` (preview) vs `published` (prod) — déjà géré par `storyblokVersion`.
  - Relations : `programme` (couleur) + `projets_lies` résolues via `PROJECT_RELATIONS`,
    `home_slide.projet` via `HOME_RELATIONS` (constantes exportées de `content.ts`, réutilisées par
    `preview/[...slug].astro`). Narrowers purs : `resolveProgramme` / `resolveRelated`.
  - Filtre projets : datasource `thematique` (`getThematiques`), jamais de valeurs en dur ;
    programmes = stories `programme` (nom + couleur).
- **Blocs de page** (`home_page`, `project_list`) : `home_page` rend son `carrousel` de `home_slide`
  via `StoryblokComponent` ; `project_list` charge la grille + les thématiques via
  `getProjectSummaries`/`getThematiques`.
- **Types** : tout bloc a une interface dans `src/types/storyblok.ts` (étend `SbBlokData`,
  discriminant `component` en `snake_case`). Pas de `any`.
- **Régénérer les types** après un changement de schéma Storyblok (re-pull du modèle) et
  mettre à jour `src/types/storyblok.ts` en conséquence.
- **Hydratation** : `client:visible` / `client:idle` seulement si le bloc est réellement
  interactif (la plupart restent statiques).

## `global_settings` / `social_link`

Lus par `getSettings()` et affichés par `Nav`/`Footer` (pas de `StoryblokComponent`) — ne pas
les ajouter à la map `components`.
