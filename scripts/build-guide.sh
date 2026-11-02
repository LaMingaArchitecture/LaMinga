#!/usr/bin/env bash
# Produit le guide utilisateur (PDF) et le kit Claude (zip) à partir de docs/guide-utilisateur/.
# Usage : scripts/build-guide.sh   → dist-guide/LaMinga-Guide-de-publication.pdf + LaMinga-Claude.zip
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/docs/guide-utilisateur"
OUT="$ROOT/dist-guide"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
KIT_NAME="LaMinga-Claude"

[[ -x $CHROME ]] || { echo "Google Chrome introuvable : $CHROME (ou définir CHROME=…)" >&2; exit 1; }
mkdir -p "$OUT"

# Illustrations rendues depuis du HTML (fenêtres reproduites, sans capture de l'écran de l'utilisateur).
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=420,240 --screenshot="$SRC/captures/outil-photo-message.png" \
  "file://$SRC/illustrations/outil-photo-message.html" 2>/dev/null

"$CHROME" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf-no-header \
  --allow-file-access-from-files --virtual-time-budget=5000 \
  --print-to-pdf="$OUT/LaMinga-Guide-de-publication.pdf" "file://$SRC/guide.html" 2>/dev/null

# Le kit est zippé sous un nom lisible ; ditto conserve le dossier caché .claude.
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cp -R "$SRC/kit-claude" "$STAGE/$KIT_NAME"
rm -f "$OUT/LaMinga-Claude.zip"
ditto -c -k --norsrc --noextattr --keepParent "$STAGE/$KIT_NAME" "$OUT/LaMinga-Claude.zip"

echo "$OUT/LaMinga-Guide-de-publication.pdf"
echo "$OUT/LaMinga-Claude.zip"
