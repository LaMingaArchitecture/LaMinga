#!/usr/bin/env bash
# Prépare une photo pour Storyblok (cf. docs/procedure-medias.md) : rotation EXIF appliquée aux
# pixels, conversion colorimétrique vers sRGB via le profil ICC embarqué, métadonnées retirées,
# grand côté limité, JPEG progressif.
#
# Usage : scripts/optimize-image.sh <source> <destination.jpg> [qualité]
#   qualité : 82 par défaut (photos) ; 90 pour un dessin au trait.
set -euo pipefail

MAX_EDGE=2560
DEFAULT_QUALITY=82
SRGB_PROFILE="/System/Library/ColorSync/Profiles/sRGB Profile.icc"

die() {
  echo "$1" >&2
  exit 1
}

[[ $# -ge 2 ]] || die "Usage : $0 <source> <destination.jpg> [qualité]"
command -v magick >/dev/null || die "ImageMagick requis : brew install imagemagick"
[[ -f $SRGB_PROFILE ]] || die "Profil sRGB introuvable : $SRGB_PROFILE (macOS requis)"

src="$1"
dest="$2"
quality="${3:-$DEFAULT_QUALITY}"

[[ -f $src ]] || die "Source introuvable : $src"
[[ $quality =~ ^[0-9]+$ ]] && ((quality >= 1 && quality <= 100)) || die "Qualité invalide : $quality (1–100)"

# Le décodeur est imposé d'après l'extension : ImageMagick choisit sinon son lecteur d'après le
# contenu ou un préfixe (msl:, mvg:…), ce qu'on ne veut pas sur des fichiers reçus de l'extérieur.
shopt -s nocasematch
case $src in
  *.jpg | *.jpeg) coder=jpeg ;;
  *.png) coder=png ;;
  *.tif | *.tiff) coder=tiff ;;
  *.heic) coder=heic ;;
  *.webp) coder=webp ;;
  *) die "Format source non pris en charge : $src" ;;
esac
[[ $dest == *.jpg || $dest == *.jpeg ]] || die "La destination doit être un .jpg : $dest"
shopt -u nocasematch

if [[ -e $dest ]] && [[ $(realpath "$src") == $(realpath "$dest") ]]; then
  die "La destination écraserait la source : $dest"
fi

# [0] : première image seulement (TIFF multipage, PSD à calques). -profile convertit depuis le
# profil embarqué ; une image sans profil est supposée déjà sRGB. -alpha remove : fond blanc pour
# une capture ou un dessin transparent.
magick "$coder:$src[0]" -auto-orient -profile "$SRGB_PROFILE" -background white -alpha remove \
  -alpha off -resize "${MAX_EDGE}x${MAX_EDGE}>" -strip -sampling-factor 4:2:0 -interlace Plane \
  -quality "$quality" "jpeg:$dest" ||
  die "Lecture impossible en $coder : le contenu ne correspond peut-être pas à l'extension (une capture PNG nommée .jpg, par exemple). Renommer le fichier avec la bonne extension."

printf '%s  %s  %s\n' "$dest" "$(magick identify -format '%wx%h' "$dest")" "$(du -h "$dest" | cut -f1)"
