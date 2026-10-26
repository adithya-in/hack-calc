#!/usr/bin/env bash
# Apply the 76x284 rotation-offset patch to a TFT_eSPI checkout.
#
#   ./scripts/apply_tft_espi_patch.sh [path-to-TFT_eSPI]
#
# Default library path: ~/Documents/Arduino/libraries/TFT_eSPI
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIB="${1:-$HOME/Documents/Arduino/libraries/TFT_eSPI}"
PATCH="$ROOT/patches/0001-st7789-76x284-offsets.patch"

if [ ! -d "$LIB/TFT_Drivers" ]; then
  echo "error: TFT_eSPI not found at $LIB" >&2
  exit 1
fi

cd "$LIB"
# --forward makes re-running a no-op instead of failing on an already-patched file.
patch -p1 --forward < "$PATCH"
echo "patched $LIB"
