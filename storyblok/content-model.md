# Modèle de contenu Storyblok — LaMinga

Source de vérité du schéma. À pousser dans l'espace via le **serveur MCP Storyblok**
(ou `storyblok login` + `storyblok push-components`). Les **noms techniques sont en
`snake_case`** et doivent correspondre exactement aux clés de `components` dans
`astro.config.mjs` et aux discriminants `component` des types (`src/types/storyblok.ts`).

Langue : **FR uniquement, pas d'i18n.**

## Datasource

- **`typologie`** (slug `typologie`) — alimente le filtre des projets. Entrées (name → value) :
  - Logement → `logement`
  - Équipement public → `equipement-public`
  - Tertiaire → `tertiaire`
  - Réhabilitation → `rehabilitation`

> Les valeurs sont libres (à adapter avec LaMinga) ; le code ne code aucune typologie en dur.

## Composants (blocs)

### `project` (content type)

| Champ              | Type Storyblok | Config                                                            |
| ------------------ | -------------- | ----------------------------------------------------------------- |
| `titre`            | text           | requis                                                            |
| `typologie`        | option         | source = datasource `typologie` (valeur unique)                   |
| `annee`            | text           |                                                                   |
| `localisation`     | text           |                                                                   |
| `maitre_ouvrage`   | text           |                                                                   |
| `equipe`           | textarea       |                                                                   |
| `credits`          | textarea       |                                                                   |
| `visuels`          | multiasset     | filetypes: images (galerie)                                       |
| `affichage`        | option (self)  | valeurs `carousel`, `scroll` (défaut `scroll`)                    |
| `projet_similaire` | option         | source = stories internes, restreint au type `project` (relation) |

### `project_list` (content type — page Projets)

| Champ   | Type     | Config |
| ------- | -------- | ------ |
| `titre` | text     | requis |
| `intro` | richtext |        |

> La grille des projets et le filtre par typologie sont calculés par le code à partir de
> toutes les stories `project` + la datasource `typologie`.

### `atelier_page` (content type)

| Champ         | Type     | Config                    |
| ------------- | -------- | ------------------------- |
| `intro`       | richtext |                           |
| `competences` | richtext |                           |
| `clients`     | richtext |                           |
| `equipe`      | bloks    | whitelist : `team_member` |

### `team_member` (bloc imbriqué)

| Champ   | Type     | Config            |
| ------- | -------- | ----------------- |
| `nom`   | text     | requis            |
| `photo` | asset    | filetypes: images |
| `role`  | text     | optionnel         |
| `bio`   | richtext | optionnel         |

### `home_page` (content type)

| Champ     | Type     | Config                                                                  |
| --------- | -------- | ----------------------------------------------------------------------- |
| `titre`   | text     |                                                                         |
| `intro`   | richtext |                                                                         |
| `projets` | options  | source = stories internes, type `project` (mise en avant ; vide = tous) |

### `global_settings` (content type — singleton, story `config`)

| Champ             | Type     | Config                    |
| ----------------- | -------- | ------------------------- |
| `reseaux_sociaux` | bloks    | whitelist : `social_link` |
| `footer_adresse`  | textarea |                           |
| `footer_mentions` | richtext | mentions légales          |
| `email`           | text     |                           |

> `global_settings` et `social_link` ne sont pas rendus via `StoryblokComponent` (lus par
> `src/lib/content.ts` → `getSettings`, affichés par `Nav`/`Footer`). Inutile de les déclarer
> dans la map `components`.

### `social_link` (bloc imbriqué)

| Champ        | Type | Config                  |
| ------------ | ---- | ----------------------- |
| `plateforme` | text | ex. Instagram, LinkedIn |
| `url`        | text | URL https               |

### `page` (bloc de démo générique — `body` = bloks)

Composant d'amorçage Astro ; peut être conservé ou retiré.

## Stories à créer (recette)

| Slug             | Type              | Rôle                                               |
| ---------------- | ----------------- | -------------------------------------------------- |
| `home`           | `home_page`       | accueil (`/`)                                      |
| `projets`        | `project_list`    | page Projets (`/projets`)                          |
| `projets/<slug>` | `project`         | fiches projet (≥ 2 pour tester `projet_similaire`) |
| `atelier`        | `atelier_page`    | page Atelier (`/atelier`)                          |
| `config`         | `global_settings` | réglages globaux (réseaux sociaux, footer)         |

Publier ces stories pour qu'elles apparaissent en production (SSG, version `published`).
Tant que l'espace est vide, le site se construit sur les données mock de `src/data/mock.ts`.
