# Guide marketing — gérer le contenu & les médias de LaMinga

Guide pour l'équipe LaMinga (non-technique). Tout le contenu du site se gère dans **Storyblok** ;
le site se met à jour à la **publication**.

> **Pourquoi ce guide ?** Jusqu'ici, le contenu et les médias étaient créés et optimisés de façon
> **automatisée** (outils techniques côté développement). L'équipe marketing reprend maintenant la
> main **directement dans Storyblok**, sans ces outils. Ce guide explique comment obtenir **le même
> résultat à la main** : saisir le contenu dans l'éditeur, et **préparer soi-même les images, vidéos
> et icônes** avec des logiciels gratuits.

## Sommaire

1. [Le principe en une minute](#1-le-principe-en-une-minute)
2. [Se connecter & se repérer](#2-se-connecter--se-repérer)
3. [Comprendre l'organisation du contenu](#3-comprendre-lorganisation-du-contenu)
4. [Préparer ses médias à la main (le playbook)](#4-préparer-ses-médias-à-la-main-le-playbook)
5. [Créer & éditer chaque type de contenu](#5-créer--éditer-chaque-type-de-contenu)
6. [Gérer les thématiques (listes déroulantes)](#6-gérer-les-thématiques-listes-déroulantes)
7. [Charte graphique (couleurs, polices, assets)](#7-charte-graphique-couleurs-polices-assets)
8. [Référencement (SEO) & IA](#8-référencement-seo--ia)
9. [Publier = mettre en ligne](#9-publier--mettre-en-ligne)
10. [Points ouverts](#10-points-ouverts)

---

## 1. Le principe en une minute

- Tout se passe dans **Storyblok** (l'outil d'édition). Le site public se régénère **à chaque
  publication**.
- Deux boutons à connaître :
  - **Save** = enregistrer un **brouillon**. Visible **uniquement dans l'aperçu**, jamais en ligne.
  - **Publish** = **mettre en ligne**. Déclenche la reconstruction du site (quelques minutes).
- **Méthode recommandée pour chaque modification** :
  **Préparer les médias → Save (brouillon) → vérifier dans l'aperçu visuel → Publish**.

---

## 2. Se connecter & se repérer

1. Aller sur [app.storyblok.com](https://app.storyblok.com) et se connecter.
2. Ouvrir l'espace **LaMinga**.
3. Trois zones utiles :
   - **Content** — toutes les pages et fiches (accueil, projets, atelier, réglages…).
   - **Assets** — la bibliothèque d'images/vidéos/icônes uploadées.
   - **Block Library → Datasources** — les **listes déroulantes** (les thématiques).

### Voir ses modifications en direct (l'éditeur visuel)

L'**éditeur visuel** affiche le site avec vos brouillons (`draft`) **en direct**, sans publier :
ouvrez une story, l'aperçu du site s'affiche à droite et se met à jour au fil de la saisie.

> L'aperçu passe par un site protégé par mot de passe. Si l'aperçu **ne s'affiche pas** : la
> première fois, ouvrez l'URL de preview dans un onglet classique pour saisir le mot de passe, puis
> revenez dans Storyblok. En cas de doute sur l'URL de preview (Settings → Visual Editor), voir
> l'équipe technique.

---

## 3. Comprendre l'organisation du contenu

Deux notions suffisent :

- **Les pages (stories)** — une entrée par page ou par fiche. Elles ont une **URL**. Ex. l'accueil,
  la page Projets, chaque projet, la page Atelier, les réglages globaux.
- **Les blocs** — des morceaux **à l'intérieur** d'une page, ajoutés en liste (ex. les slides d'un
  carrousel, les membres de l'équipe). Ils n'ont **pas** d'URL propre.

### La carte des pages

| Où (dossier / story)  | Type             | Rôle                                              |
| --------------------- | ---------------- | ------------------------------------------------- |
| `home`                | Accueil          | la page d'accueil (`/`)                           |
| `projets` (dossier)   | —                | contient toutes les fiches projet                 |
| `projets` (startpage) | Page Projets     | la page liste `/projets` (grille + filtres)       |
| `projets/<slug>`      | Projet           | une fiche projet (`/projets/<slug>`)              |
| `programmes/<slug>`   | Programme        | les programmes (filtres de la page Projets)       |
| `atelier`             | Page Atelier     | la page Atelier (`/atelier`)                      |
| `config`              | Réglages globaux | logo, contact, réseaux sociaux (pas d'URL propre) |

### Les deux niveaux de classification d'un projet

- **Programme** — **une seule** catégorie par projet (1ʳᵉ ligne de filtres sur la page Projets).
  On **choisit** le programme dans une liste (c'est une **relation** vers une story `programme`) —
  on ne le tape pas. La charte V3 fixe 8 programmes : Habitat social, Multi-sites, Programmation,
  Enseignement, Vitivinicole, Équipement, Commerce, Restauration.
  > **La couleur par programme a été supprimée.** Toutes les chips sélectionnées s'affichent
  > désormais en corail, et les vignettes n'ont plus de bordure colorée — c'est ce que dessine la
  > charte V3. Le champ **Couleur** ne sert plus à rien ; il sera retiré du formulaire.
- **Thématiques** — **plusieurs** par projet (2ᵉ ligne de filtres). On **coche** dans une liste
  déroulante (la **datasource** `thematique`) — pas de saisie libre.

### Les « relations » (choisir plutôt que taper)

Certains champs pointent vers **une autre page** au lieu de contenir du texte :

- **Programme** d'un projet → une story `programme`.
- **Projets liés** d'un projet → d'autres fiches projet.
- **Projet mis en avant** d'un slide d'accueil → une fiche projet.

Dans l'éditeur, ces champs ouvrent un **sélecteur** : on cherche et on **sélectionne** la ou les
stories cibles. Le site va ensuite chercher tout seul les infos liées (titre, ville, couleur…).

---

## 4. Préparer ses médias à la main (le playbook)

C'est la partie qui **remplace l'optimisation automatique**. Bonne nouvelle : **Storyblok optimise
déjà beaucoup automatiquement pour les images**. Il reste surtout à fournir un **bon fichier de
départ**, et à **compresser les vidéos vous-même** (Storyblok ne touche pas aux vidéos).

### Ce que Storyblok fait tout seul vs. ce qui reste à votre charge

| Type de média           | Storyblok fait automatiquement (à la livraison)                                                                                        | Vous devez faire (avant l'upload)                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Images** (photos)     | Convertit en **WebP**, **redimensionne**, génère les versions mobile/écran, **compresse** (qualité 80), **recadre** aux formats voulus | Fournir un **master net, au bon format (ratio) et assez grand**         |
| **Vidéos** (mp4)        | **Rien** — la vidéo est diffusée **telle quelle**                                                                                      | **Tout** : compresser en mp4 léger + fournir un **poster** (image fixe) |
| **Icônes / logo** (SVG) | **Rien** — le SVG est servi **tel quel** (surtout pas transformé)                                                                      | Fournir un **SVG propre**, vectoriel, transparent, monochrome           |

> ⚠️ **Trois réflexes contre-intuitifs pour les images :**
>
> 1. **Ne convertissez pas vos images en WebP vous-même.** Uploadez du **JPEG** (ou PNG) — Storyblok
>    fait la conversion WebP à la livraison. Fournir déjà du WebP n'apporte rien et complique.
> 2. **Ne réduisez pas trop la taille.** Storyblok ne **réduit** que : il n'agrandit jamais. Un
>    fichier trop petit sera **flou** sur grand écran. Visez **plus grand** que nécessaire (voir
>    table ci-dessous).
> 3. **N'écrasez pas la qualité.** Exportez en **qualité ~85–90 %**. Storyblok re-compresse ensuite ;
>    partir d'un fichier déjà abîmé donne un résultat abîmé.

### 4.1 — Images : le bon format et la bonne taille

Chaque emplacement du site attend un **ratio** (forme) précis et une **largeur minimale**. Le tableau
donne le **master à fournir** (Storyblok se charge du reste) :

| Emplacement (champ Storyblok)                  | Ratio conseillé    | Largeur mini du fichier fourni |
| ---------------------------------------------- | ------------------ | ------------------------------ |
| **Image paysage** — carrousel projet & accueil | **16:9** (paysage) | **≥ 1920 px**                  |
| **Image portrait** — version mobile            | **3:4** (portrait) | **≥ 1200 px** (idéal 1600)     |
| **Fonds Atelier** (image, clients, équipe)     | **16:9** (paysage) | **≥ 1920 px**                  |
| **Poster de vidéo**                            | comme la vidéo     | **≥ 1600 px**                  |
| **Vignette plan-masse** (N&B)                  | **1:1** (carré)    | **≥ 1000 px**                  |
| **Photo de couverture**                        | **4:3** (paysage)  | **≥ 1200 px**                  |
| **Photo membre équipe** (N&B)                  | **1:1** (carré)    | **≥ 1000 px**                  |
| **Image de partage SEO** (`image_partage`)     | **~1,9:1**         | **≥ 1200 px** (idéal 1200×630) |

> **Astuce « point de focus » (recadrage propre).** Pour les emplacements **carrés / 4:3** (vignette,
> couverture, photo d'équipe), Storyblok **recadre** l'image. Pour éviter que le recadrage coupe le
> sujet, ouvrez l'image dans **Assets** et réglez son **point de focus** (Focal point) sur le sujet.
> Storyblok centrera automatiquement le recadrage dessus.

**Comment produire ces fichiers (outils gratuits) :**

| Besoin                           | Outil gratuit                                   | Comment                                                                                                          |
| -------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Recadrer au bon ratio + exporter | **Photopea** (photopea.com, dans le navigateur) | Ouvrir l'image → outil **Recadrage** → saisir le ratio (ex. 16:9) → **File → Export as → JPG**, qualité ~85–90 % |
| Idem, sur Mac sans logiciel      | **Aperçu (Preview)**                            | Outils → **Rogner** ; puis **Exporter** en JPEG, qualité haute                                                   |
| Design / maquette                | **Figma** ou **Canva**                          | Cadre au bon ratio → **Export** PNG/JPG (2×)                                                                     |
| Retouche avancée                 | **GIMP** (gratuit, à installer)                 | Recadrage + **Exporter sous** JPEG                                                                               |

> **Passer en noir & blanc** (vignette plan-masse, photos d'équipe) : le site applique déjà un filtre
> N&B automatiquement aux **photos d'équipe**. Pour la **vignette plan-masse**, fournissez un plan
> déjà en N&B. Dans Photopea : `Image → Adjustments → Black & White`.

### 4.2 — Vidéos : compression obligatoire (Storyblok ne fait rien)

Le site lit les vidéos **muettes, en boucle, en lecture auto**. Il faut donc les **compresser
soi-même** en mp4 léger et **retirer le son**.

**Outil recommandé : [HandBrake](https://handbrake.fr)** (gratuit, Mac/Windows/Linux).

Réglages HandBrake :

| Réglage           | Valeur                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| **Format**        | **MP4** (onglet _Summary_ → Format : MP4)                                         |
| **Web Optimized** | **coché** (_Summary_ → « Web Optimized ») — démarrage plus rapide                 |
| **Codec vidéo**   | **H.264 (x264)** (onglet _Video_)                                                 |
| **Résolution**    | **≤ 1080p** (onglet _Dimensions_ → largeur max **1920**)                          |
| **Qualité**       | onglet _Video_ → **Constant Quality RF ≈ 24** (monter le RF = fichier plus léger) |
| **Audio**         | onglet _Audio_ → **supprimer la piste** (bouton _Remove_) — la vidéo est muette   |
| **Budget cible**  | **≤ ~5 Mo** par vidéo (raccourcir la durée si besoin)                             |

> **Vérifier le poids** : après export, si le fichier dépasse ~5 Mo, augmentez le **RF** (ex. 26–28)
> ou raccourcissez la vidéo, puis ré-exportez.

**Le poster (image fixe obligatoire avec chaque vidéo).** Chaque champ **vidéo** a un champ **poster**
associé : c'est l'image affichée avant/à la place de la vidéo. Fournissez une **image du même plan** :

- **VLC** (gratuit) : ouvrir la vidéo → mettre en pause sur la bonne image → menu **Vidéo → Prendre
  une capture** (le fichier atterrit dans Images/Photos).
- ou une **capture d'écran** de la vidéo en pause, puis recadrée en 16:9 (voir §4.1).

Le poster est une **image** : Storyblok l'optimisera automatiquement (WebP).

### 4.3 — Icônes & logo (SVG)

Le **logo**, les **icônes de réseaux sociaux** et les **icônes d'engagement** sont des **SVG**
(dessins vectoriels). Storyblok les sert **tels quels** — il faut donc qu'ils soient **propres dès
l'upload** :

- **Vraiment vectoriels** (pas une photo enregistrée en `.svg`).
- **Fond transparent**.
- **Monochromes** (une seule couleur). Pour que l'icône prenne **automatiquement la couleur du site**
  (corail/violet), le SVG doit utiliser `fill="currentColor"` plutôt qu'une couleur codée en dur.

**Outils :**

- **Nettoyer / alléger un SVG** : [SVGOMG](https://jakearchibald.github.io/svgomg/) (dans le
  navigateur) — coller/charger le SVG, télécharger la version optimisée.
- **Produire / exporter un SVG** : **Figma**, **Adobe Illustrator**, ou **Inkscape** (gratuit) →
  Exporter en SVG.
- **Rendre monochrome `currentColor`** : demandez au graphiste un « SVG monochrome, `fill:
currentColor` ». Techniquement, cela revient à remplacer la couleur de remplissage par
  `currentColor` dans le fichier.

> Rappel : les **icônes Instagram et LinkedIn** sont déjà intégrées au site (elles se colorent
> seules) — pas besoin de les fournir. Le champ `icone` d'un réseau ne sert que pour **d'autres**
> plateformes.

### 4.4 — Uploader dans Storyblok

Deux façons :

1. **Depuis un champ image/vidéo** d'une story : cliquer le champ → **Choose asset** → **Upload**
   (glisser-déposer votre fichier), puis le sélectionner.
2. **Depuis la bibliothèque** **Assets** : glisser-déposer les fichiers d'abord, puis les
   sélectionner dans les champs.

**Nommage conseillé** : des noms clairs, **sans accents ni espaces**, ex. `buzenval-paysage-01.jpg`,
`buzenval-poster.jpg`, `icone-toiture.svg`. Cela facilite la recherche plus tard.

---

## 5. Créer & éditer chaque type de contenu

Pour chaque type ci-dessous : la **liste des champs** (nom, à quoi il sert, s'il est **requis**) et
les gestes dans l'éditeur. **Requis** = à remplir obligatoirement ; les autres sont facultatifs.

### 5.1 — Fiche projet (`project`)

**Content → dossier `projets` → + Entry → type _Projet_.** Le **nom** de l'entrée forme l'URL
(_slug_) : ex. `buzenval` → `/projets/buzenval`. **Éviter accents et espaces** dans le slug.

| Champ                     | Sert à…                                                           | Requis |
| ------------------------- | ----------------------------------------------------------------- | ------ |
| **Titre**                 | le titre du projet                                                | ✅     |
| **Ville**                 | la ville                                                          |        |
| **Programme**             | **une** catégorie (relation → story programme) — porte la couleur |        |
| **Thématiques**           | **plusieurs** (cases à cocher, liste déroulante)                  |        |
| **Description programme** | une ligne (ex. « Restructuration de logements insalubres… »)      |        |
| **Maîtrise d'ouvrage**    | le maître d'ouvrage                                               |        |
| **Équipe**                | l'équipe (texte libre)                                            |        |
| **Statut**                | ex. « Livré 2023 »                                                |        |
| **Surface (m² SDP)**      | texte libre (autorise « NC », une fourchette…)                    |        |
| **Montant HT**            | ex. « 8 M€ »                                                      |        |
| **Divers**                | détails complémentaires                                           |        |
| **Texte descriptif**      | le corps de texte (texte riche)                                   |        |
| **Engagements**           | jusqu'à **3** blocs (icône SVG + libellé)                         |        |
| **Carrousel**             | les **Slides média** (voir ci-dessous), dans l'ordre              |        |
| **Vignette plan-masse**   | le plan-masse **N&B** affiché dans la grille Projets              |        |
| **Photo de couverture**   | photo représentative ; si vide → 1ʳᵉ image du carrousel           |        |
| **Projets liés**          | d'autres fiches projet (relations)                                |        |
| **SEO** (bloc)            | réglages de partage (facultatif — voir §8)                        |        |

**Ajouter des slides au carrousel (`media_slide`)** — dans le champ **Carrousel**, cliquer **+**,
choisir _Slide média_, puis remplir :

| Champ              | Sert à…                                                              |
| ------------------ | -------------------------------------------------------------------- |
| **Image paysage**  | le visuel principal (desktop)                                        |
| **Image portrait** | la version mobile                                                    |
| **Vidéo**          | une vidéo mp4 (optionnel) — voir §4.2                                |
| **Poster**         | l'image fixe de la vidéo                                             |
| **Titre en clair** | cocher si le texte doit s'afficher **clair** sur un visuel **foncé** |

> **Réordonner** les slides (ou n'importe quels blocs) : les **glisser-déposer** dans la liste.

**Ajouter des engagements (`engagement`, max 3)** — dans le champ **Engagements** :

| Champ       | Sert à…                                                     |
| ----------- | ----------------------------------------------------------- |
| **Icône**   | un pictogramme **SVG** (voir §4.3)                          |
| **Libellé** | le texte, ex. « Mise en valeur de l'existant » — **requis** |

Terminer par **Save** → vérifier l'aperçu → **Publish**.

> La page **Projets** et l'**accueil** affichent automatiquement les projets **publiés** : pas
> besoin de les ajouter à la main.

### 5.2 — Page Projets (`project_list`)

Story **`projets`** (startpage du dossier). La **grille** et les **filtres** (programme + thématique)
sont **calculés automatiquement** à partir des projets, des programmes et des thématiques — on ne
saisit **pas** la liste ici.

| Champ     | Sert à…                                            | Requis |
| --------- | -------------------------------------------------- | ------ |
| **Titre** | titre de la page (utile pour le SEO/accessibilité) | ✅     |
| **Intro** | texte d'introduction (texte riche)                 |        |
| **SEO**   | réglages de partage (voir §8)                      |        |

### 5.3 — Accueil (`home_page`)

Story **`home`**. Le **Carrousel d'accueil** est une liste de **Slides accueil** (`home_slide`).
Pour chaque slide :

| Champ                                  | Sert à…                                              |
| -------------------------------------- | ---------------------------------------------------- |
| **Image paysage** / **Image portrait** | le visuel (desktop / mobile)                         |
| **Vidéo** / **Poster**                 | vidéo mp4 optionnelle + son image fixe               |
| **Projet**                             | **relation** vers une fiche projet **mise en avant** |
| **Titre en clair**                     | texte clair sur visuel foncé                         |

> Le **titre affiché** sur le slide est **repris automatiquement** du projet lié (titre + ville +
> description). On ne le retape pas.

### 5.4 — Page Atelier (`atelier_page`)

Story **`atelier`** — 4 sections plein écran (vidéo → manifeste → clients → équipe). Une section
sans média est **masquée**.

| Champ                        | Sert à…                                                         |
| ---------------------------- | --------------------------------------------------------------- |
| **Vidéo** / **Poster**       | la vidéo d'intro (section 1) + son image fixe                   |
| **Image**                    | l'illustration de fond du **manifeste** (section 2)             |
| **Image clients**            | le fond de la section **clients** (section 3)                   |
| **Image équipe**             | le fond de la section **équipe** (section 4)                    |
| **Titre / Texte Minga**      | 1er bloc de texte (le titre a une valeur par défaut modifiable) |
| **Titre / Texte Construire** | 2e bloc de texte (idem)                                         |
| **Titre clients**            | titre de la section clients (défaut modifiable)                 |
| **Clients Collectivités**    | liste de clients — **un par ligne**                             |
| **Clients OPH**              | liste de clients — **un par ligne**                             |
| **Clients MOA**              | liste de clients (MOA privée) — **un par ligne**                |
| **Titre équipe**             | titre de la section équipe (défaut modifiable)                  |
| **Équipe**                   | les **Membres de l'équipe** (voir ci-dessous)                   |
| **SEO**                      | réglages de partage (voir §8)                                   |

**Membres de l'équipe (`team_member`)** :

| Champ     | Sert à…                                       | Requis |
| --------- | --------------------------------------------- | ------ |
| **Nom**   | le nom du membre                              | ✅     |
| **Photo** | portrait (affiché en **N&B** automatiquement) |        |
| **Rôle**  | l'intitulé de poste                           |        |
| **Bio**   | courte biographie (texte riche)               |        |

### 5.5 — Programmes & couleurs (`programme`)

**Content → dossier `programmes`** : une story par programme.

| Champ   | Sert à…                                                       | Requis |
| ------- | ------------------------------------------------------------- | ------ |
| **Nom** | le nom affiché sur la chip de filtre (ex. « Habitat social ») | ✅     |

Changer un **nom**, puis **Publier** la story, se reflète sur tout le site après reconstruction —
**sans intervention technique**. Le champ **Couleur** n'est plus lu (charte V3, §7).

### 5.6 — Réglages globaux (`global_settings`)

Story **`config`** (contact, réseaux — s'affichent dans la navigation et le pied de page).

| Champ                | Sert à…                          |
| -------------------- | -------------------------------- |
| **Nom de l'atelier** | ex. « LaMinga atelier… »         |
| **E-mail**           | l'adresse de contact             |
| **Téléphone**        | le téléphone                     |
| **Adresse Paris**    | l'adresse (texte libre)          |
| **Adresse Anglet**   | l'adresse (texte libre)          |
| **Mentions légales** | texte riche                      |
| **Réseaux sociaux**  | liste de liens (voir ci-dessous) |

**Réseaux sociaux (`social_link`)** :

| Champ          | Sert à…                                                        | Requis |
| -------------- | -------------------------------------------------------------- | ------ |
| **Plateforme** | ex. Instagram, LinkedIn                                        | ✅     |
| **URL**        | l'adresse **https** du profil                                  | ✅     |
| **Icône**      | icône **SVG** (inutile pour Instagram/LinkedIn, déjà intégrés) |        |

### 5.7 — Le bloc SEO (partage & Google)

Présent (facultatif) sur `home`, `projets`, `atelier` et chaque **projet**. Voir §8.

---

## 6. Gérer les thématiques (listes déroulantes)

**Block Library → Datasources → `thematique` → + Entry** :

- **name** = ce qui s'**affiche** (ex. « Réemploi »).
- **value** = valeur **technique**, **sans accents ni espaces** (ex. `reemploi`).

> ⚠️ **Important — une thématique ne se met PAS en ligne toute seule.** Contrairement aux pages, une
> modification de **datasource** ne déclenche **pas** la reconstruction du site (le système ne réagit
> qu'à la **publication d'une page**). Pour publier une nouvelle thématique :
>
> - **re-publier n'importe quelle page** (ex. `config`), ce qui relance la reconstruction ; **ou**
> - demander à l'équipe technique de **relancer** la mise à jour.
>
> En attendant, la thématique est déjà visible dans l'**aperçu** (brouillon).

---

## 7. Charte graphique (couleurs, polices, assets)

La charte est centralisée dans **une seule couche de design tokens** (`src/styles/tokens.css`) :
chaque couleur, police, espacement et bordure du site en découle. Rien n'est codé en dur dans les
composants — pour un changement **global**, l'équipe technique modifie ce seul fichier.

### Palette

| Nom (charte)     | Hex       | Usage principal                                                                     |
| ---------------- | --------- | ----------------------------------------------------------------------------------- |
| Beige clair      | `#f9f7f2` | fond de page                                                                        |
| Rouge corail     | `#ff6c4f` | réf. de marque ; programme Patrimoine (accent home appliqué : `#b84e39`, voir note) |
| Violet aubergine | `#7e4080` | accent pages intérieures : nav, logo, texte de tableau, légendes                    |
| Violet nuit      | `#32255b` | texte foncé principal                                                               |
| Violet vif       | `#a785ff` | violet secondaire ; programme Activité (proposé)                                    |
| Vert citron      | `#d5ee6e` | programme Équipement                                                                |
| Olive            | `#bbbd2b` | programme Aménagement (proposé)                                                     |
| Turquoise        | `#11a3c2` | programme Logement                                                                  |
| Bleu clair       | `#bbd5fd` | panneaux d'information translucides                                                 |
| Taupe clair      | `#d0b8b0` | onglet actif, sélection thématique, fond Projets à 10 %                             |
| Rose             | `#fec9d7` | programme Programmation (proposé)                                                   |
| Gris             | `#c6c6c6` | neutre                                                                              |
| Jaune fluo       | `#ffff00` | annotation (non utilisé dans l'UI)                                                  |

> **Accessibilité** : le Rouge corail `#ff6c4f` n'a pas un contraste suffisant sur fond clair
> (~2,6:1). En **texte / interface**, le site applique donc un corail légèrement assombri
> (`#b84e39`, ≥ 4,5:1) ; `#ff6c4f` reste la référence de marque et la couleur de **remplissage** du
> programme Patrimoine (le texte posé dessus reste lisible automatiquement).

### Typographies

- **Helvetica** (pile système `Helvetica Neue, Helvetica, Arial`) : interface, titres, corps.
- **Self Modern _italique_** (serif d'accent) : 2ᵉ ligne de filtres, légendes « Titre – Ville »,
  en-têtes de tableau, libellés du pied de page. ⚠️ La police fournie est une **version d'essai**
  (Fonderie Bretagne) : en attendant la confirmation de licence, le site auto-héberge la police
  **libre Playfair Display _italique_** (OFL) comme substitut. Le remplacement par Self Modern se
  fera sans toucher aux composants.

### Où vivent les assets

| Asset                       | Emplacement                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| **Logotype**                | **dépôt** (`public/logo/logo-laminga.svg`)                             |
| Icônes **Insta / LinkedIn** | **dépôt** (composants `currentColor`, se colorent seuls corail/violet) |
| Flèches (chevrons)          | **dépôt** (composant `Chevron.astro`)                                  |
| Polices                     | **dépôt** auto-hébergées (`public/fonts/`)                             |
| Icônes engagement           | **Storyblok** `engagement.icone`                                       |

> **Le logotype n'est plus modifiable depuis Storyblok.** La charte V3 ne prévoit qu'un seul
> traitement pour le web (paysage, aplat, corail + rose) et sa règle 1.4 interdit d'en altérer les
> couleurs, le cadrage ou les proportions : le fichier vit donc dans le dépôt, et le champ
> `config.logo` n'est plus lu. Le SVG du logo et le **favicon** portent les couleurs de la charte
> **en dur** : à mettre à jour côté technique si la palette change.

### Les couleurs de programme ont été supprimées (charte V3)

Il n'y a plus de couleur à régler par programme. La charte V3 peint **toutes** les chips
sélectionnées du même corail et retire la bordure colorée des vignettes : le champ **Couleur** des
stories `programme` n'est plus lu par le site et sera retiré du formulaire.

---

## 8. Référencement (SEO) & IA

Chaque page a un **titre**, une **description** et une **image de partage** calculés **automatiquement**
à partir du contenu. Pour les régler à la main, remplissez le bloc **SEO** (facultatif) présent sur
`home`, `projets`, `atelier` et chaque **projet** :

| Champ                | Rôle                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| **Titre SEO**        | titre affiché dans Google et les partages (défaut : dérivé du contenu) |
| **Description SEO**  | description courte (~155 caractères) pour Google et les IA             |
| **Image de partage** | visuel de partage (défaut : photo de couverture / premier visuel)      |

Laisser un champ **vide** = garder la valeur automatique. Le partage sur LinkedIn, WhatsApp ou Slack
affiche le titre, la description et l'image ; une page sans visuel utilise l'image LaMinga par défaut.

### Robots & moteurs de réponse IA (automatique)

Le site génère à chaque reconstruction un `robots.txt` et un `llms.txt` (résumé de l'atelier destiné
aux IA) — **aucune action éditeur**. Les robots des moteurs de réponse IA (OAI-SearchBot, ChatGPT-User,
PerplexityBot, ClaudeBot) sont **autorisés** afin que LaMinga apparaisse dans les réponses d'IA.

> **Décision LaMinga — robots d'entraînement :** GPTBot (OpenAI) et Google-Extended (Gemini) — qui
> aspirent le contenu pour **entraîner** les modèles — sont **refusés**. Cela n'affecte pas la
> visibilité dans les réponses d'IA. Pour changer cette politique, l'équipe technique bascule une
> seule constante (`TRAINING_CRAWLER_POLICY` dans `src/pages/robots.txt.ts`).

L'aperçu (brouillon) reste **exclu de l'indexation** (accès protégé + `noindex`).

---

## 9. Publier = mettre en ligne

- **Save** = brouillon (visible seulement dans l'aperçu).
- **Publish** = met en ligne → **reconstruction de la production** (quelques minutes) → le contenu
  apparaît sur le site public.
- **En cas d'erreur** : l'équipe technique peut **restaurer une version précédente** (rollback).
- **Rappel datasource** : une modification de **thématique** nécessite le contournement du §6.

### Check-list avant de publier

- [ ] Médias **préparés** (bon ratio, assez grands, vidéos compressées + poster) et uploadés.
- [ ] Champs **requis** remplis (Titre, etc.).
- [ ] **Save**, puis vérification dans l'**aperçu visuel** (desktop **et** mobile).
- [ ] Programme + thématiques corrects (pour un projet).
- [ ] **Publish** — attendre quelques minutes, puis vérifier sur le **site public**.

---

## 10. Points ouverts

- **Licence Self Modern** : la version fournie est un essai ; à acheter ou remplacer avant la mise en
  ligne (le substitut libre Playfair Display est en place en attendant).
- **Taxonomie V3 à saisir** : remplacer les programmes actuels par les 8 de la charte (Habitat
  social, Multi-sites, Programmation, Enseignement, Vitivinicole, Équipement, Commerce,
  Restauration) et les thématiques par les 5 attendues (Réemploi, Biosourcé, Restructuration,
  Ruralité, Densité urbaine). Le code dérive les filtres des projets publiés : aucune intervention
  technique n'est nécessaire, seulement la saisie.
- **Pictogrammes d'engagement** : les fichiers fournis sont en **JPG/PNG** (matriciels) et ne
  correspondent pas au rendu vectoriel des maquettes — **fournir les versions SVG** (monochrome
  `currentColor`, voir §4.3).
