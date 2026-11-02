# Guide utilisateur LaMinga (PDF) et kit Claude

Guide de publication destiné à l'équipe LaMinga (non technique), et kit qui permet de publier avec
Claude Desktop via le connecteur Storyblok.

| Fichier                                  | Rôle                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `guide.html` + `guide.css`               | Source du PDF : pages A4 fixes, charte LaMinga (`src/styles/tokens.css`) |
| `captures/`                              | Captures Storyblok (JPEG, 1440×900 @2x, recadrées)                       |
| `illustrations/`                         | Fenêtres reproduites en HTML, rendues en PNG au build                    |
| `kit-claude/`                            | Dossier remis aux architectes (zippé sous `LaMinga-Claude.zip`)          |
| `kit-claude/outils/optimiser-photos.js`  | Outil photo Mac sans installation (JXA + Core Image)                     |
| `kit-claude/outils/optimiser-photos.ps1` | Outil photo Windows sans installation (PowerShell + WPF/WIC)             |
| `tests-outil-photo/`                     | Images de test et vérifications de l'outil Windows (CI Windows)          |

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

Sous Windows, même traitement avec le moteur image intégré (WPF / WIC), dans Windows PowerShell
5.1. `-Installer` copie l'outil dans `%LOCALAPPDATA%\LaMinga\` et pose un raccourci « Optimiser pour
le web » sur le bureau, sur lequel on glisse photos ou dossiers. Différences avec le Mac : JPEG non
progressif, et les photos HEIC demandent les extensions HEIF et HEVC du Microsoft Store.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File docs\guide-utilisateur\kit-claude\outils\optimiser-photos.ps1 <dossier>
powershell -NoProfile -ExecutionPolicy Bypass -File docs\guide-utilisateur\kit-claude\outils\optimiser-photos.ps1 -Installer
```

Le fichier `.ps1` doit rester en **UTF-8 avec BOM** (sinon PowerShell 5.1 abîme les accents). Il
n'est testable que sous Windows : le workflow `.github/workflows/outil-photo-windows.yml` lance
`tests-outil-photo/test.ps1` sur un runner Windows à chaque modification.

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
