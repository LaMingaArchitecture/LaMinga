# Guide utilisateur LaMinga (PDF) et kit Claude

Guide de publication destiné à l'équipe LaMinga (non technique), et kit qui permet de publier avec
Claude Desktop via le connecteur Storyblok.

| Fichier                                 | Rôle                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `guide.html` + `guide.css`              | Source du PDF : pages A4 fixes, charte LaMinga (`src/styles/tokens.css`) |
| `captures/`                             | Captures Storyblok (JPEG, 1440×900 @2x, recadrées)                       |
| `illustrations/`                        | Fenêtres reproduites en HTML, rendues en PNG au build                    |
| `kit-claude/`                           | Dossier remis aux architectes (zippé sous `LaMinga-Claude.zip`)          |
| `kit-claude/outils/optimiser-photos.js` | Outil photo sans installation (JXA + Core Image)                         |

## Produire le PDF et le zip

```bash
pnpm guide
```

Sortie dans `dist-guide/` (ignoré par git) : `LaMinga-Guide-de-publication.pdf` et
`LaMinga-Claude.zip`. Nécessite Google Chrome (impression headless).

Les pages ont une hauteur fixe : après une modification, vérifier qu'aucun contenu ne déborde sur le
pied de page (`pdftoppm -r 60 -png dist-guide/*.pdf /tmp/p` puis regarder les pages).

## Outil photo

Même traitement que `scripts/optimize-image.sh`, sans ImageMagick : rotation EXIF appliquée aux
pixels, conversion sRGB, métadonnées retirées, grand côté ≤ 2560 px, transparence sur blanc, JPEG
82 (90 si le nom contient « plan »). Sortie dans un sous-dossier `web/` à côté de chaque original.

```bash
osascript -l JavaScript docs/guide-utilisateur/kit-claude/outils/optimiser-photos.js <dossier>
osacompile -l JavaScript -o "Optimiser pour le web.app" docs/guide-utilisateur/kit-claude/outils/optimiser-photos.js
```

## Mettre à jour les captures

Storyblok change d'interface de temps en temps. Recapturer à 1440×900, facteur 2, sans rien
enregistrer dans Storyblok (fermer les fenêtres par **Cancel** / Échap), puis recadrer et exporter
en JPEG qualité 85. Les encadrés et pastilles sont positionnés en pourcentage de l'image dans
`guide.html`.

## Remettre aux architectes

1. Le PDF, et `LaMinga-Claude.zip` (à déposer dans le Drive de l'agence).
2. Les identifiants de l'aperçu (site preview, Basic-Auth) : à transmettre à part, jamais dans le
   PDF.
3. Une invitation Storyblok par personne si besoin (le plan actuel compte 2 sièges).
