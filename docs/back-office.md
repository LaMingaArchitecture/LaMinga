# Guide back-office — créer du contenu (LaMinga)

Guide pour l'équipe LaMinga (non-technique). Tout le contenu se gère dans **Storyblok** ; le
site se met à jour à la **publication**.

## Se connecter

1. Aller sur [app.storyblok.com](https://app.storyblok.com) et se connecter.
2. Ouvrir l'espace **LaMinga**.
3. Le contenu vit dans **Content** ; les listes déroulantes (thématiques) dans
   **Block Library → Datasources**.

## Voir ses modifications en direct (éditeur visuel)

L'**éditeur visuel** affiche le site avec vos brouillons (`draft`) en direct, sans publier.
Si l'aperçu ne s'affiche pas, vérifier l'URL de preview (Settings → Visual Editor) — voir
l'équipe technique.

## Créer une fiche projet

1. **Content → dossier `projets` → + Entry**.
2. Choisir le type **Projet**. Donner un **nom** (le _slug_, ex. `buzenval`, forme l'URL
   `/projets/buzenval` — éviter accents/espaces).
3. Remplir les champs :
   - **Titre**, **Ville**.
   - **Programme** : sélectionner **un** programme (Logement, Équipement, Patrimoine, Activité,
     Aménagement, Programmation) — chaque programme a **sa couleur** (voir plus bas).
   - **Thématiques** : en cocher plusieurs (Restructuration, Sur-élévation, Réemploi…) — liste
     alimentée par la datasource, pas de saisie libre.
   - **Description du programme** : une ligne (ex. « Restructuration de logements insalubres à
     logements sociaux »).
   - **Maîtrise d'ouvrage, Équipe, Statut, Surface (m² SDP), Montant HT, Divers**.
   - **Texte descriptif** (texte riche).
   - **Engagements** : jusqu'à **3** (icône SVG + libellé, ex. « Mise en valeur de l'existant »).
   - **Carrousel** : ajouter des **Slides média** dans l'ordre (image paysage + portrait, vidéo mp4
     optionnelle + poster, et la case **Titre en clair** = texte clair sur visuel foncé).
   - **Vignette plan-masse (N&B)** : le plan-masse affiché dans la grille Projets.
   - **Photo de couverture** (optionnel) : photo représentative (vue « VRAC » + survol de l'Index).
     Si vide, la 1ʳᵉ image du carrousel est utilisée.
   - **Projets liés** : sélectionner d'autres fiches projet (« Sélection de projets en relation »).
4. **Save** (brouillon) → vérifier dans l'éditeur visuel → **Publish** pour mettre en ligne.

> La page **Projets** (`/projets`) et l'accueil affichent automatiquement les projets publiés. Pas
> besoin de les ajouter à la main.

## Gérer les programmes (couleurs)

**Content → dossier `programmes`** : une story par programme. Chaque programme a un **Nom** et une
**Couleur** (sélecteur de couleur natif). Changer une couleur ou un nom se reflète sur le site après
publication (rebuild).

## Ajouter une thématique

**Datasources → `thematique` → + Entry** : _name_ (affiché) + _value_ (technique, ex. `reemploi`,
sans accents/espaces).

> ⚠️ **Important** : contrairement aux stories, une modification de **datasource** ne déclenche
> **pas** automatiquement la mise à jour du site (le webhook ne réagit qu'aux publications de
> stories). Pour publier une nouvelle thématique en ligne : **re-publier n'importe quelle story**
> (ex. `config`), ce qui déclenche un rebuild ; ou demander à l'équipe technique de lancer le
> **build hook** Netlify. En attendant, la thématique est bien visible dans l'éditeur visuel (draft).

## Composer la page d'accueil

Story **`home`** (type _Page d'accueil_) : le **Carrousel d'accueil** est une liste de **Slides
accueil**. Pour chaque slide : un visuel (image paysage + portrait, ou vidéo mp4 + poster), le
**Projet** mis en avant (le titre affiché est repris du projet), et la case **Titre en clair**.

## Modifier l'Atelier

Story **`atelier`** (type _Page Atelier_) : vidéo d'introduction, image d'illustration, textes
**Minga** et **Construire ensemble** (les titres ont des valeurs par défaut, modifiables), les trois
listes de clients (Collectivités / OPH / MOA privée, **un client par ligne**) et les **Membres de
l'équipe** (nom, photo N&B, rôle, bio).

## Réglages globaux (logo, contact, réseaux sociaux)

Story **`config`** (type _Réglages globaux_) : **logo** (SVG), nom de l'atelier, e-mail, téléphone,
**adresse Paris** + **adresse Anglet**, mentions légales, et les **Réseaux sociaux** (chacun :
plateforme, URL, **icône SVG**).

## Spécifications visuelles (équipe marketing)

Fournir les assets aux formats suivants :

| Asset                                       | Format / ratio conseillé                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Image paysage** (carrousel, home)         | JPG/WebP, paysage ~**16:9**, ≥ 1600 px de large                                                              |
| **Image portrait** (mobile)                 | JPG/WebP, portrait ~**3:4**, ≥ 900 px de large                                                               |
| **Vignette plan-masse**                     | plan N&B, **carré ~1:1**, ≥ 800 px                                                                           |
| **Photo de couverture**                     | JPG/WebP, paysage ~4:3, ≥ 800 px                                                                             |
| **Photo membre équipe**                     | JPG/WebP **N&B**, carré ~1:1, ≥ 500 px                                                                       |
| **Logo, icônes réseaux, icônes engagement** | **SVG** vectoriel, fond transparent, monochrome de préférence (`currentColor`)                               |
| **Vidéos** (carrousel, home, atelier)       | **mp4 (H.264/AAC)**, ≤ **1080p**, budget **≤ ~5 Mo** par vidéo, **muette**, + une **image poster** par vidéo |

Les images passent par le service d'images Storyblok (converties en WebP). Les **SVG** sont servis
tels quels (ne pas les aplatir en PNG). Les vidéos sont hébergées sur Storyblok (`a.storyblok.com`) —
le CSP `media-src` est déjà configuré pour ce domaine.

## Charte graphique (couleurs, polices, assets)

La charte est centralisée dans **une seule couche de design tokens** (`src/styles/tokens.css`) :
chaque couleur, police, espacement et bordure du site en découle. Rien n'est codé en dur dans les
composants — pour un changement global, l'équipe technique modifie ce seul fichier.

### Palette

| Nom (charte)     | Hex       | Usage principal                                                  |
| ---------------- | --------- | ---------------------------------------------------------------- |
| Beige clair      | `#f9f7f2` | fond de page                                                     |
| Rouge corail     | `#ff6c4f` | accent home (logo/réseaux/flèches), programme Patrimoine         |
| Violet aubergine | `#7e4080` | accent pages intérieures : nav, logo, texte de tableau, légendes |
| Violet nuit      | `#32255b` | texte foncé principal                                            |
| Violet vif       | `#a785ff` | violet secondaire ; programme Activité (proposé)                 |
| Vert citron      | `#d5ee6e` | programme Équipement                                             |
| Olive            | `#bbbd2b` | programme Aménagement (proposé)                                  |
| Turquoise        | `#11a3c2` | programme Logement                                               |
| Bleu clair       | `#bbd5fd` | panneaux d'information translucides                              |
| Taupe clair      | `#d0b8b0` | onglet actif, sélection thématique, fond Projets à 10 %          |
| Rose             | `#fec9d7` | programme Programmation (proposé)                                |
| Gris             | `#c6c6c6` | neutre                                                           |
| Jaune fluo       | `#ffff00` | annotation (non utilisé dans l'UI)                               |

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

| Asset                        | Emplacement                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| Logo **violet** (pages int.) | **Storyblok** `config.logo` (modifiable par l'éditeur)                 |
| Logo **corail** (home)       | **dépôt** (`public/logo/logo-corail.svg`) — variante de marque fixe    |
| Icônes **Insta / LinkedIn**  | **dépôt** (composants `currentColor`, se colorent seuls corail/violet) |
| Flèches (chevrons)           | **dépôt** (`public/icons/`, tracés vectoriels — plus de glyphe texte)  |
| Police serif                 | **dépôt** auto-hébergée (`public/fonts/`)                              |
| Icônes engagement            | **Storyblok** `engagement.icone`                                       |

### Changer une couleur de programme (sans déploiement)

Sur chaque story **`programme`** (`programmes/…`), le champ **`couleur`** (sélecteur natif) définit
la couleur du programme : filtres, bordures et survol des vignettes s'y adaptent, et le texte posé
sur un aplat reste lisible automatiquement. **Publier** la story suffit — aucune intervention
technique. Correspondance actuelle : Logement = Turquoise, Équipement = Vert citron, Patrimoine =
Rouge corail, Activité = Violet vif, Aménagement = Olive, Programmation = Rose (les trois derniers
sont **proposés** — à valider).

### Points ouverts

- **Licence Self Modern** : la version fournie est un essai ; à acheter ou remplacer avant la mise
  en ligne (le substitut libre Playfair Display est en place en attendant).
- **Couleurs de programmes** Activité / Aménagement / Programmation : propositions à confirmer.
- **Pictogrammes d'engagement** : les fichiers fournis sont en **JPG/PNG** (matriciels) et ne
  correspondent pas au rendu vectoriel des maquettes — **demander les versions SVG** à l'équipe
  marketing (le champ `engagement.icone` attend du SVG monochrome `currentColor`).

## Publier = mettre en ligne

La **publication d'une story** déclenche une régénération de la production (quelques minutes). Un
brouillon non publié reste visible uniquement dans l'éditeur visuel. En cas d'erreur, l'équipe
technique peut restaurer une version précédente (rollback). Rappel : une modification de **datasource**
nécessite le contournement décrit plus haut.
