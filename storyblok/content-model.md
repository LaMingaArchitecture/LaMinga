# Modèle de contenu Storyblok — LaMinga (v2)

Source de vérité du schéma. Créé dans l'espace via le **serveur MCP Storyblok**. Les **noms
techniques sont en `snake_case`** et correspondent exactement aux clés de `components` dans
`astro.config.mjs` et aux discriminants `component` des types (`src/types/storyblok.ts`).

Langue : **FR uniquement, pas d'i18n.** Modélisé d'après le design **LaMinga Templates V1**.

## Datasource

- **`thematique`** (slug `thematique`) — alimente la 2ᵉ ligne de filtres de la page Projets.
  Entrées (name → value) : Restructuration → `restructuration`, Sur-élévation → `sur-elevation`,
  Réemploi → `reemploi` (liste évolutive). Le bouton **« Index »** est un basculement de vue, **pas**
  une entrée de datasource.

> Les valeurs sont gérées par les éditeurs ; le code n'en code aucune en dur.

## Classification à deux niveaux

- **Programme** = catégorie unique par projet, **avec sa couleur** (1ʳᵉ ligne de filtres). Les 6
  programmes sont des stories `programme` : Logement, Équipement, Patrimoine, Activité, Aménagement,
  Programmation.
- **Thématiques** = plusieurs par projet, depuis la datasource `thematique` (2ᵉ ligne de filtres).

## Composants (blocs)

### `programme` (content type — stories sous `programmes/`)

| Champ     | Type Storyblok               | Config                                          |
| --------- | ---------------------------- | ----------------------------------------------- |
| `nom`     | text                         | requis                                          |
| `couleur` | custom `native-color-picker` | couleur du programme (filtre, bordures, survol) |

### `media_slide` (bloc imbriqué — slide du carrousel projet)

| Champ            | Type    | Config                               |
| ---------------- | ------- | ------------------------------------ |
| `image_paysage`  | asset   | filetypes: images                    |
| `image_portrait` | asset   | filetypes: images (mobile)           |
| `video`          | asset   | filetypes: videos (mp4, optionnel)   |
| `poster`         | asset   | filetypes: images (optionnel)        |
| `titre_clair`    | boolean | overlay/UI en clair sur visuel foncé |

### `engagement` (bloc imbriqué — projet, max 3)

| Champ     | Type  | Config                  |
| --------- | ----- | ----------------------- |
| `icone`   | asset | filetypes: images (SVG) |
| `libelle` | text  | ex. « Mise en valeur… » |

### `home_slide` (bloc imbriqué — slide du carrousel d'accueil)

| Champ                              | Type    | Config                                  |
| ---------------------------------- | ------- | --------------------------------------- |
| `image_paysage` / `image_portrait` | asset   | filetypes: images                       |
| `video` / `poster`                 | asset   | mp4 optionnel / poster optionnel        |
| `projet`                           | option  | relation story → `project` (`use_uuid`) |
| `titre_clair`                      | boolean | overlay en clair sur visuel foncé       |

> Le titre affiché est **dérivé** du `projet` lié (titre + ville + description_programme).

### `project` (content type — stories sous `projets/`)

| Champ                   | Type Storyblok | Config                                                                     |
| ----------------------- | -------------- | -------------------------------------------------------------------------- |
| `titre`                 | text           | requis                                                                     |
| `ville`                 | text           |                                                                            |
| `programme`             | option         | relation story → `programme` (folder `programmes/`, `use_uuid`)            |
| `thematiques`           | options        | source = datasource `thematique` (valeurs multiples)                       |
| `description_programme` | text           | une ligne — accueil, fiche projet, colonne Index                           |
| `maitre_ouvrage`        | text           | « Maîtrise d'ouvrage »                                                     |
| `equipe`                | textarea       | « Équipe »                                                                 |
| `statut`                | text           | ex. « Livré 2023 »                                                         |
| `surface_sdp`           | text           | m² SDP (texte libre : autorise « NC », fourchette)                         |
| `montant_ht`            | text           | ex. « 8 M€ »                                                               |
| `divers`                | textarea       |                                                                            |
| `texte`                 | richtext       | texte descriptif                                                           |
| `engagements`           | bloks          | whitelist `engagement`, **max 3**                                          |
| `carrousel`             | bloks          | whitelist `media_slide`                                                    |
| `vignette_plan`         | asset          | plan-masse N&B (grille « PM » + strip projets liés)                        |
| `photo_couverture`      | asset          | optionnel — grille « VRAC » + survol Index ; vide → 1re image du carrousel |
| `projets_lies`          | options        | relations story → `project` (`use_uuid`)                                   |

### `project_list` (content type — startpage du dossier `projets`)

| Champ   | Type     | Config |
| ------- | -------- | ------ |
| `titre` | text     | requis |
| `intro` | richtext |        |

> La grille et les filtres (programme + thématique) sont calculés par le code à partir des stories
> `project` + les stories `programme` + la datasource `thematique`.

### `home_page` (content type — story `home`)

| Champ       | Type  | Config                 |
| ----------- | ----- | ---------------------- |
| `carrousel` | bloks | whitelist `home_slide` |

### `atelier_page` (content type — story `atelier`)

| Champ                   | Type     | Config                                             |
| ----------------------- | -------- | -------------------------------------------------- |
| `video`                 | asset    | filetypes: videos (intro, plan fixe)               |
| `image`                 | asset    | illustration                                       |
| `titre_minga`           | text     | opt. — défaut « Minga (tradition sud-américaine) » |
| `texte_minga`           | richtext |                                                    |
| `titre_construire`      | text     | opt. — défaut « Construire ensemble »              |
| `texte_construire`      | richtext |                                                    |
| `titre_clients`         | text     | opt. — défaut « Des clients engagés »              |
| `clients_collectivites` | textarea | un client par ligne                                |
| `clients_oph`           | textarea | un client par ligne                                |
| `clients_moa`           | textarea | un client par ligne                                |
| `titre_equipe`          | text     | opt. — défaut « LaMinga, une équipe soudée… »      |
| `equipe`                | bloks    | whitelist `team_member`                            |

### `team_member` (bloc imbriqué)

| Champ   | Type     | Config                  |
| ------- | -------- | ----------------------- |
| `nom`   | text     | requis                  |
| `photo` | asset    | filetypes: images (N&B) |
| `role`  | text     | optionnel               |
| `bio`   | richtext | optionnel               |

### `global_settings` (content type — singleton, story `config`)

| Champ              | Type     | Config                  |
| ------------------ | -------- | ----------------------- |
| `logo`             | asset    | SVG (rendu brut)        |
| `nom_atelier`      | text     | « LaMinga atelier… »    |
| `email`            | text     |                         |
| `telephone`        | text     |                         |
| `adresse_paris`    | textarea |                         |
| `adresse_anglet`   | textarea |                         |
| `mentions_legales` | richtext |                         |
| `reseaux_sociaux`  | bloks    | whitelist `social_link` |

### `social_link` (bloc imbriqué)

| Champ        | Type  | Config                  |
| ------------ | ----- | ----------------------- |
| `plateforme` | text  | ex. Instagram, LinkedIn |
| `url`        | text  | URL https               |
| `icone`      | asset | SVG (rendu brut)        |

> `global_settings` et `social_link` ne sont pas rendus via `StoryblokComponent` (lus par
> `src/lib/content.ts` → `getSettings`, affichés par `Nav`/`Footer`). Inutile de les déclarer
> dans la map `components`.

## Relations (résolues côté app, sans N+1)

Résolution groupée dans `src/lib/content.ts` via les constantes exportées :

- `PROJECT_RELATIONS = ['project.programme', 'project.projets_lies']` — sur le fetch de liste partagé.
- `HOME_RELATIONS = ['home_slide.projet']` — sur le fetch de la home.

La route SSR `src/pages/preview/[...slug].astro` réutilise ces mêmes constantes.

## Assets SVG

Le logo et les icônes (`social_link.icone`, `engagement.icone`) sont rendus depuis le **filename brut**
(pas via `sbImage()`, qui rasterise en webp).

## Stories (recette)

| Slug                  | Type              | Rôle                                           |
| --------------------- | ----------------- | ---------------------------------------------- |
| `home`                | `home_page`       | accueil (`/`)                                  |
| `projets` (startpage) | `project_list`    | page Projets (`/projets`)                      |
| `projets/<slug>`      | `project`         | fiches projet (≥ 2 pour tester `projets_lies`) |
| `programmes/<slug>`   | `programme`       | 6 programmes (couleur chacun)                  |
| `atelier`             | `atelier_page`    | page Atelier (`/atelier`)                      |
| `config`              | `global_settings` | réglages globaux                               |

Publier ces stories pour qu'elles apparaissent en production (SSG, version `published`). Le site lit
uniquement le contenu live : une erreur réseau/401/5xx fait échouer le build (le contenu manquant 404
dégrade en placeholder), afin de ne jamais publier de contenu erroné silencieusement.
