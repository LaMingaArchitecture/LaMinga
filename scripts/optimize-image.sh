#!/usr/bin/env bash
# Prépare une photo pour Storyblok (cf. docs/procedure-medias.md) :
# rotation EXIF appliquée aux pixels (Storyblok l'ignore), sRGB, métadonnées retirées,
# 2560 px max sur le grand côté, JPEG progressif.
#
# Usage : scripts/optimize-image.sh <source> <destination.jpg> [qualité]
#   qualité : 82 par défaut (photos) ; 90 pour un dessin au trait.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage : $0 <source> <destination.jpg> [qualité]" >&2
  exit 1
fi
command -v magick >/dev/null || { echo "ImageMagick requis : brew install imagemagick" >&2; exit 1; }

src="$1"
dest="$2"
quality="${3:-82}"

# -alpha remove : un PNG transparent (capture, dessin) prend un fond blanc au lieu de noir en JPEG.
magick "$src" -auto-orient -background white -alpha remove -alpha off -colorspace sRGB \
  -resize '2560x2560>' -strip -sampling-factor 4:2:0 -interlace Plane -quality "$quality" "$dest"

printf '%s  %s  %s\n' "$dest" "$(magick identify -format '%wx%h' "$dest")" "$(du -h "$dest" | cut -f1)"
