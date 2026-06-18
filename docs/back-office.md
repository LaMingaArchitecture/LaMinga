# Guide back-office — créer du contenu (LaMinga)

Guide pour l'équipe LaMinga (non-technique). Tout le contenu se gère dans **Storyblok** ; le
site se met à jour automatiquement à la **publication**.

## Se connecter

1. Aller sur [app.storyblok.com](https://app.storyblok.com) et se connecter.
2. Ouvrir l'espace **LaMinga**.
3. Le contenu vit dans **Content** ; les listes déroulantes (typologies) dans
   **Block Library / Datasources**.

## Voir ses modifications en direct (éditeur visuel)

L'**éditeur visuel** affiche le site avec vos brouillons (`draft`) en direct, sans publier.
Si l'aperçu ne s'affiche pas, vérifier l'URL de preview (Settings → Visual Editor) — voir
l'équipe technique.

## Créer une fiche projet

1. **Content → dossier `projets` → + Entry**.
2. Choisir le type **Project**. Donner un **nom** (le _slug_, ex. `villa-belvedere`, forme
   l'URL `/projets/villa-belvedere` — éviter accents/espaces).
3. Remplir les champs :
   - **Titre**, **Typologie** (liste déroulante — alimentée par la datasource, pas de saisie libre),
   - **Année, Localisation, Maître d'ouvrage, Équipe, Crédits**,
   - **Visuels** : ajouter les images (galerie). L'affichage **carrousel** ou **scroll** se règle
     via le champ **Affichage**,
   - **Projet similaire** : sélectionner une autre fiche projet (lien en bas de page).
4. **Save** (brouillon) → vérifier dans l'éditeur visuel → **Publish** pour mettre en ligne.

> La page **Projets** (`/projets`) et l'accueil affichent automatiquement les projets publiés,
> groupés/filtrés par typologie. Pas besoin de les ajouter à la main (sauf mise en avant via la
> page d'accueil).

## Modifier l'Atelier

Story **`atelier`** (type _Atelier Page_) : intro, compétences, clients (texte riche) et la liste
des **membres de l'équipe** (ajouter/retirer des blocs _Team Member_ : nom, photo, rôle).

## Réglages globaux (réseaux sociaux, footer)

Story **`config`** (type _Global Settings_) : liens réseaux sociaux (header/footer), adresse,
e-mail, mentions légales.

## Ajouter une typologie

**Datasources → `typologie` → +Entry** : _name_ (affiché) + _value_ (technique, ex.
`logement`). Les filtres de la page Projets se mettent à jour automatiquement.

## Publier = mettre en ligne

La **publication** déclenche une régénération du site de production (quelques minutes). Un
brouillon non publié reste visible uniquement dans l'éditeur visuel. En cas d'erreur, l'équipe
technique peut restaurer une version précédente (rollback).
