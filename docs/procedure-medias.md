# Procédure — mettre à jour les médias d'un projet dans Storyblok (développeurs / assistant IA)

Procédure suivie pour remplacer les photos d'un projet (ou d'une section Atelier) à partir d'un
dossier fourni par le client, via le serveur MCP Storyblok. Pour le côté éditeur (préparer et
uploader à la main), voir [`guide-marketing.md`](guide-marketing.md) §4.

> **Publier une story déclenche le rebuild de la prod** (webhook → build hook Netlify, cf.
> [`deployment.md`](deployment.md)). On enregistre toujours en brouillon d'abord, on vérifie, puis
> on publie avec l'accord du client.

## 0. Prérequis

- Serveur MCP Storyblok connecté : [`storyblok-mcp.md`](storyblok-mcp.md). Une session ne voit le
  serveur que s'il était connecté **à son démarrage** — après l'OAuth, ouvrir une nouvelle session.
- Espace LaMinga : `space_id` **293403884331975**, région **EU** (visible dans les URL d'assets
  `a.storyblok.com/f/293403884331975/…`).
- ImageMagick (`brew install imagemagick`). Ghostscript n'est pas requis : les PDF se rastérisent
  avec Quick Look (étape 3).

## 1. Inventorier le dossier source

Le client livre en général `Paysage_Ordi/` (desktop) et `Portrait_Mobile/` (mobile), numérotés dans
l'ordre du carrousel, plus `Plans/` et `Picto/`. Avant tout upload :

```bash
cd "<dossier projet>"
# dimensions, orientation EXIF et poids de chaque fichier
find . -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0 |
  while IFS= read -r -d '' f; do
    printf '%s | %s | orient=%s | %s\n' "$f" "$(magick identify -format '%wx%h' "$f[0]")" \
      "$(magick identify -format '%[EXIF:Orientation]' "$f[0]")" "$(du -h "$f" | cut -f1)"
  done
# fichiers identiques entre les deux dossiers (même empreinte = même photo)
md5 -r Paysage_Ordi/* Portrait_Mobile/* | sort
```

À repérer :

- **Mêmes photos dans les deux dossiers** : un seul upload, renseigné en `image_paysage` seul (le
  mobile retombe sur l'image paysage, cf. `resolveMediaSources` dans `src/lib/media.ts`).
- **Numéros en double ou absents d'un côté** : à arbitrer avec le client (voir §2).
- **Basse résolution** (captures d'écran, < ~1100 px de large) : floue en plein écran sur mobile —
  proposer de l'écarter.
- **`orient=6` / `8` / `3`** (photos de téléphone) : pivotées à l'étape 3, sinon elles s'affichent
  couchées sur le site.
- **Doublons de l'existant** (pictogrammes, plan masse) : comparer avec la version en ligne avant de
  réuploader (étape 3) — inutile de créer un doublon.

## 2. Décider du découpage avec le client

Un slide du carrousel associe **une** image desktop (`image_paysage`) et **une** image mobile
(`image_portrait`) : les deux listes ne peuvent pas avoir des longueurs différentes. Un slide peut
n'avoir qu'une des deux (l'autre format affiche la même image recadrée). Choix retenu pour Buzenval,
à reproposer par défaut :

- appariement **par numéro** (desktop N + mobile N) ;
- un numéro en double d'un côté → deux slides ;
- images mobiles sans pendant → slides « portrait seul » en fin de carrousel ;
- captures basse résolution écartées ;
- photo de couverture (`photo_couverture`) : une photo du projet livré, pas un croquis.

Poser ces questions **avant** d'uploader.

## 3. Optimiser les fichiers

```bash
scripts/optimize-image.sh <source> <destination.jpg>        # photos (qualité 82)
scripts/optimize-image.sh <source> <destination.jpg> 90     # dessin au trait
```

Le script applique la rotation EXIF aux pixels, passe en sRGB, retire les métadonnées, limite à
2560 px sur le grand côté et encode en JPEG progressif. Ordres de grandeur obtenus : 400 Ko–1 Mo par
photo (12 Mo → 600 Ko pour la plus lourde).

- **Plan masse fourni en PDF** — rastériser avec Quick Look, puis rogner et passer en niveaux de
  gris :

  ```bash
  qlmanage -t -s 2400 -o . plan.pdf   # produit plan.pdf.png
  magick plan.pdf.png -background white -alpha remove -trim +repage -bordercolor white -border 40 \
    -colorspace Gray -resize '1600x1600>' -strip -interlace Plane -quality 85 <projet>-plan-masse.jpg
  ```

  Si le dessin n'occupe qu'une petite partie de la page, le résultat peut être **moins net** que la
  version déjà en ligne : comparer et garder la meilleure.

- **Pictogrammes** — comparer au pixel près avec la version en ligne :
  `magick compare -metric RMSE en-ligne.jpg nouveau.jpg null:` → `0` = identique, ne rien faire.

## 4. Nommer

| Média        | Nom de fichier                                                                                   | Titre Storyblok                            |
| ------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Slide projet | `<projet>-NN-paysage.jpg` / `<projet>-NN-portrait.jpg` (NN = ordre du slide, 01…)                | `<Projet> — NN <sujet> (paysage/portrait)` |
| Fond Atelier | `atelier-<section>.jpg` (`manifeste`, `equipe`, `clients`) — **nom de la section qui l'affiche** | `Atelier — fond <section>`                 |
| Plan masse   | `<projet>-plan-masse.jpg`                                                                        |                                            |
| Pictogramme  | `<projet>-<engagement>.jpg`                                                                      |                                            |

Texte alternatif (`alt`) en français, décrivant la photo : `<Projet> — <ce qu'on voit>, <Ville>`.

Storyblok **ne renomme pas** un fichier (le nom fait partie de l'URL) : pour corriger un nom, on
réuploade sous le bon nom et on relie la story (étapes 5–6).

## 5. Uploader (MCP)

Pour chaque fichier :

1. `upload_asset` (`space_id`, `filename`, `title`, `alt`) → renvoie un `asset_id` et les champs
   d'un POST S3 signé (valable ~30 min).
2. POST du fichier vers S3 (`curl -F …` fourni par la réponse, lancé depuis le dossier du fichier) →
   réponse **204** attendue.
3. `upload_asset_finish` (`space_id`, `asset_id`).

Le MCP ne sait **pas remplacer** un asset existant (même URL) : chaque upload crée un nouvel asset,
à relier ensuite dans la story. (« Replace » n'existe que dans l'interface : Assets → fichier →
Replace.)

## 6. Relier dans la story — en brouillon

1. `listStories` (`with_slug: "projets/<slug>"`) → `id` ; `getStoryById` → contenu complet.
2. `updateStory` avec `publish: false`. **Le champ `content` est remplacé en entier** : renvoyer
   tout le contenu lu à l'étape 1, en ne modifiant que les champs visés (`carrousel`,
   `photo_couverture`…). Un champ omis est effacé.
3. Vérifier le brouillon en local :

   ```bash
   pnpm dev:preview   # contenu draft, port 4322
   curl -s http://localhost:4322/preview/projets/<slug> | grep -oE 'f/293403884331975/[a-f0-9]+/[a-z0-9-]+\.(jpg|png|mp4)' | sort -u
   ```

   Toutes les nouvelles URL doivent apparaître, aucune ancienne.

## 7. Vérifier l'orientation après passage par le service image

Le site affiche la sortie redimensionnée du service Storyblok, pas le fichier uploadé : c'est elle
qu'il faut contrôler.

```bash
curl -s -o check.webp "https://a.storyblok.com/f/…/<fichier>.jpg/m/640x0/filters:format(webp):quality(80)"
magick identify -format '%wx%h\n' check.webp   # un portrait doit rester plus haut que large
```

Pour tout un lot, assembler une planche (`magick montage *.webp -tile 7x -geometry 170x170+3+3 planche.png`)
et la regarder.

## 8. Publier

Avec l'accord du client : `publishStory` (ou `updateStory` avec `publish: true`). Publication =
rebuild prod ; contrôler le site une fois le déploiement Netlify terminé.

## 9. Nettoyer les assets inutilisés

1. Lister les assets : `listAssets` (`per_page: 1000`).
2. Lister les assets référencés : contenu **brouillon** de toutes les stories (`getStoryById` sur
   chaque story de `listStories`) **et** le build publié :

   ```bash
   pnpm build
   grep -rl "/<hash-de-l-asset>/" dist | wc -l   # 0 = plus utilisé sur le site publié
   ```

3. Ne supprimer qu'un asset absent des deux, **après** publication des stories qui le remplaçaient.
4. `deleteAsset` : suppression **récupérable** (la réponse indique `permanently_deleted: false`) —
   l'asset part dans Assets → **Deleted assets**, d'où on le restaure. Ne jamais vider cet onglet
   sans accord.

## Pièges rencontrés

| Symptôme                                             | Cause                                                                                                      | Solution                                                                          |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Photo couchée sur le site, droite sur l'ordinateur   | Photo de téléphone avec orientation EXIF ; le service Storyblok garde l'étiquette, Chrome l'ignore en WebP | Appliquer la rotation aux pixels avant upload (`optimize-image.sh`) et réuploader |
| Tentation de corriger par `filters:rotate()`         | Certains navigateurs appliquent l'EXIF en WebP → double rotation ; `rotate` tourne en sens anti-horaire    | Ne pas corriger côté code : fichiers source redressés                             |
| Nom de fichier ne correspondant pas à la section     | Fichiers croisés à l'import                                                                                | Réuploader sous le bon nom (étape 4), relier, publier, supprimer l'ancien         |
| `magick` échoue sur un PDF (`gs: command not found`) | Ghostscript absent                                                                                         | `qlmanage -t` (étape 3)                                                           |
| Outils Storyblok absents de la session               | Serveur MCP connecté après le démarrage de la session                                                      | Nouvelle session (cf. [`storyblok-mcp.md`](storyblok-mcp.md))                     |
