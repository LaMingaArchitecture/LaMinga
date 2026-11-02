# Référence — contenu du site LaMinga

Modèle complet (développeurs) : `storyblok/content-model.md` du dépôt du site. Ce fichier en garde
ce qu'il faut pour remplir une fiche.

## Fiche projet (`project`, dossier `projets/`, `parent_id` 200762964639845)

| Champ                   | Ce qu'on y met                                                               |
| ----------------------- | ---------------------------------------------------------------------------- |
| `titre`                 | Nom du projet (obligatoire)                                                  |
| `ville`                 | « Paris 20e », « Anglet »…                                                   |
| `programmes`            | Liste d'UUID de fiches `programme` (dossier `programmes/`), une ou plusieurs |
| `thematiques`           | Liste de `value` de la datasource `thematique` (ex. `reemploi`)              |
| `description_programme` | Une ligne : « Restructuration de logements insalubres à logements sociaux »  |
| `maitre_ouvrage`        | Maîtrise d'ouvrage                                                           |
| `equipe`                | Une ligne par intervenant : « Economiste : Atec »                            |
| `statut`                | « Livré 2023 », « En chantier »…                                             |
| `surface_sdp`           | « 196 m² » (texte libre, « NC » accepté)                                     |
| `montant_ht`            | « 895 000 € »                                                                |
| `divers`                | Crédits photos, mentions                                                     |
| `texte`                 | Texte descriptif (texte riche : un paragraphe par bloc `paragraph`)          |
| `carrousel`             | Slides `media_slide` (voir ci-dessous)                                       |
| `engagements`           | 3 maximum : `icone` (image), `libelle`, `description`                        |
| `vignette_plan`         | Plan masse noir et blanc                                                     |
| `photo_couverture`      | Photo du projet livré ; vide = 1re image du carrousel                        |
| `projets_lies`          | UUID de fiches projet ; vide = choix automatique de projets similaires       |
| `seo`                   | Bloc optionnel (`titre_seo`, `description_seo`, `image_partage`)             |

Le champ `programme` (au singulier) est un ancien champ : ne pas le remplir.

### Slide du carrousel (`media_slide`)

`image_paysage` (ordinateur), `image_portrait` (téléphone), `video` + `poster` (optionnels),
`titre_clair` (`true` si la photo est sombre : le texte passe en clair). Chaque slide a un `_uid`
unique (`sl-<projet>-NN`).

### Forme d'une image dans une fiche

```json
{
  "id": 228704775349590,
  "alt": "Buzenval — vue sur le projet livré, Paris 20e",
  "title": "Buzenval — 03 (paysage)",
  "filename": "https://a.storyblok.com/f/293403884331975/b02f2fe074/buzenval-03-paysage.jpg",
  "copyright": "Serge Detalle",
  "name": "",
  "focus": "",
  "source": "",
  "fieldtype": "asset",
  "is_external_url": false
}
```

`copyright` = auteur de la photo (crédit), à demander s'il n'est pas dans le dossier.

## Formats d'image attendus

L'outil photo limite le grand côté à 2560 px ; Storyblok recadre et convertit ensuite tout seul.
Ce qui compte : **la forme** et **une taille suffisante**.

| Emplacement                   | Forme conseillée | Taille minimale (grand côté) |
| ----------------------------- | ---------------- | ---------------------------- |
| Image paysage (carrousel)     | 16:9             | 1920 px                      |
| Image portrait (téléphone)    | 3:4              | 1200 px (idéal 1600)         |
| Photo de couverture           | 4:3              | 1200 px                      |
| Plan masse (noir et blanc)    | 4:5              | 1000 px                      |
| Fonds de la page Atelier      | 16:9             | 1920 px                      |
| Photo d'un membre de l'équipe | carré, N&B       | 1000 px                      |
| Image de partage (réseaux)    | ~1,9:1           | 1200 px                      |

## Autres fiches

- **Accueil** (`home`) : `carrousel` de `home_slide` → `image_paysage`, `image_portrait`, `video`,
  `poster`, `projet` (UUID d'une fiche projet), `titre_clair`.
- **Atelier** (`atelier`) : `video` + `poster`, `image`, `image_clients`, `image_equipe`, textes
  `texte_minga` / `texte_construire` (texte riche), listes `clients_collectivites`, `clients_oph`,
  `clients_moa` (un client par ligne), `equipe` (`team_member` : `nom`, `photo`, `role`, `bio`).
- **Réglages** (`config`) : coordonnées, adresses, mentions légales, réseaux sociaux.

## Listes de choix

- Programmes : `listStories` avec `starts_with: "programmes/"` → utiliser l'`uuid`.
- Thématiques : `listDatasources` → id de `thematique` → `listDatasourceEntries`.
- Création : `createStory` (sans `publish`) ; publication : `publishStory` ; retrait :
  `unpublishStory`.
