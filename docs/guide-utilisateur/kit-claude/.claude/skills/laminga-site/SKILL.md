---
name: laminga-site
description: Publier ou modifier du contenu sur le site LaMinga via le connecteur Storyblok — nouveau projet, photos d'un projet, textes, page d'accueil, page Atelier, installation de l'outil photo. À utiliser dès qu'un membre de l'équipe LaMinga parle du site, d'un projet à mettre en ligne, de photos à changer ou de Storyblok.
---

# Site LaMinga — publier avec Claude

Lire d'abord `CLAUDE.md` (ton, règles d'or). Les champs de chaque fiche et les formats d'image sont
dans [reference-contenu.md](reference-contenu.md).

## 0. Vérifier que tout est prêt (à chaque nouvelle conversation)

1. **Connecteur Storyblok** : appeler `search` avec « stories ». Si l'outil est absent ou répond
   « non autorisé », dire : « Je n'ai pas accès à Storyblok. Ouvrez Réglages → Connecteurs, vérifiez
   que Storyblok est connecté, puis ouvrez une nouvelle conversation. » (guide, chapitre
   « Installation »). S'arrêter là.
2. Protocole du connecteur : `search` → `describe` (toujours) → outil d'exécution indiqué par
   `executeWith`. Les outils prennent `operation` (pas `operationId`) ; les lectures par
   identifiant prennent `id`. Toujours limiter les réponses avec `fields`.

## 1. Retrouver les fichiers de la personne

Les dossiers projets sont dans Google Drive, synchronisé sur le Mac par **Google Drive pour
ordinateur** : `~/Library/CloudStorage/GoogleDrive-*/`. Demander le nom du dossier du projet, le
retrouver (`ls`, `find -maxdepth 4 -iname '*<nom>*'`), puis confirmer le chemin avec la personne.

- **Textes** : un Google Docs apparaît sur le Mac comme un fichier `.gdoc` illisible. Le lire avec le
  connecteur Google Drive s'il est activé ; sinon demander à la personne de coller le texte dans la
  conversation (ou d'exporter le document en PDF dans le même dossier).
- **PDF** (plan masse) : `qlmanage -t -s 2400 -o <dossier>/web <fichier.pdf>` produit un PNG, à passer
  ensuite dans l'outil photo.

## 2. Inventorier et poser les questions AVANT tout envoi

Lancer l'outil photo sur le dossier du projet (il écrit les versions web dans des sous-dossiers
`web/`, sans toucher aux originaux) :

```bash
osascript -l JavaScript outils/optimiser-photos.js "<dossier du projet>"
```

Puis présenter à la personne, en langage simple, un **plan de la fiche** :

- titre, ville, programmes (dans la liste existante — `listStories` dossier `programmes/`),
  thématiques (datasource `thematique`), textes et cartouche (maîtrise d'ouvrage, équipe, statut,
  surface, montant) ;
- **le carrousel slide par slide** : une image paysage (ordinateur) + une image portrait
  (téléphone) par slide, appariées par numéro. Une photo présente dans les deux dossiers = un seul
  envoi, en paysage seulement. Une photo portrait sans pendant = slide « portrait seul » en fin de
  carrousel ;
- la **photo de couverture** (une photo du bâtiment livré, pas un croquis) et le **plan masse** ;
- les problèmes : images signalées « TROP PETITE » (proposer de les écarter), numéros en double,
  textes ou chiffres manquants.

Attendre la validation de ce plan. Ne rien envoyer avant.

## 3. Envoyer les images

Pour chaque fichier du dossier `web/` validé :

1. `upload_asset` (`space_id`, `filename` = nom du fichier web, `title`, `alt`).
   Nom : `<projet>-NN-paysage.jpg` / `<projet>-NN-portrait.jpg` (NN = ordre du slide),
   `<projet>-plan-masse.jpg`. Renommer le fichier web avant l'envoi si besoin (`mv`).
   Texte alternatif (`alt`) en français : `<Projet> — <ce qu'on voit>, <Ville>`.
2. Exécuter la commande `curl` renvoyée, **une seule commande par appel**, depuis le dossier du
   fichier, en retirant le champ `Content-Type` en double. Réponse **204** attendue.
3. `upload_asset_finish` (`space_id`, `asset_id`).

Les vidéos (`.mp4`) sont refusées par le connecteur : demander à la personne de les envoyer à la
main (guide, chapitre « Vidéos »), puis récupérer l'image avec `listAssets`.

## 4. Remplir la fiche — en brouillon

- **Nouveau projet** : vérifier d'abord qu'il n'existe pas (`listStories`, `with_slug`
  `projets/<slug>` et recherche par titre). Créer la fiche dans le dossier `projets/` (content type
  `project`), slug en minuscules sans accents (`ecole-buzenval`).
- **Projet existant** : `getStoryById` puis `updateStory`. **Le contenu est remplacé en entier** :
  renvoyer tout le contenu lu, en ne changeant que les champs visés. Un champ oublié est effacé.
- Toujours `publish: false`.

Puis donner le lien d'aperçu et expliquer quoi regarder :
`https://app.storyblok.com/#/me/spaces/293403884331975/stories/0/0/<id>` — « Ouvrez ce lien :
Storyblok affiche la page telle qu'elle sera en ligne. Vérifiez l'ordre des photos, les textes et
la version téléphone (icône mobile en haut de l'aperçu). »

## 5. Publier

Seulement après un « oui, publie » pour cette fiche : `publishStory` (ou `updateStory` avec
`publish: true`). Dire ensuite : « C'est en ligne. Le site se met à jour en 2 à 5 minutes. »

Une nouvelle fiche projet apparaît automatiquement dans la page Projets. Pour la mettre aussi sur la
page d'accueil, il faut l'ajouter au carrousel de la fiche `home` (proposer, ne pas le faire
d'office).

## 6. Autres tâches

- **Remplacer des photos** d'un projet : mêmes étapes 2 → 5 ; relier les nouvelles images, ne pas
  supprimer les anciennes sans accord.
- **Page d'accueil** (fiche `home`) : carrousel de slides `home_slide`, chacune reliée à un projet.
- **Page Atelier** (fiche `atelier`) : textes, listes de clients (un par ligne), membres de l'équipe
  (photo noir et blanc carrée).
- **Dépublier** un projet : `unpublishStory` après accord ; la fiche reste dans Storyblok.

## 7. Installer l'outil photo sur le Mac (si demandé)

```bash
osacompile -l JavaScript -o ~/Desktop/"Optimiser pour le web.app" outils/optimiser-photos.js
```

Dire ensuite : « L'icône « Optimiser pour le web » est sur votre bureau. Glissez-y des photos ou un
dossier : les versions prêtes pour le site apparaissent dans un dossier « web » à côté. »
