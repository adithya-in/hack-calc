#!/usr/bin/env bash
# Build (default) or build+flash the hack_calc sketch.
#
#   ./scripts/build.sh            # compile only
#   ./scripts/build.sh flash      # compile and upload
#
# Override with env vars:
#   FQBN=esp32:esp32:esp32
#   PORT=/dev/cu.usbserial-0001
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKETCH_DIR="$ROOT/firmware/hack_calc"
FQBN="${FQBN:-esp32:esp32:esp32}"
PORT="${PORT:-/dev/cu.usbserial-0001}"
ACTION="${1:-build}"

cd "$SKETCH_DIR"

# The extra_flags -I is mandatory: arduino-cli does not auto-include the
# sketch-local tft_setup.h, so without it TFT_eSPI falls back to its global
# 240x320 config and the panel stays blank.
ARGS=(arduino-cli compile --fqbn "$FQBN"
      --build-property "compiler.cpp.extra_flags=-I$SKETCH_DIR")

if [ "$ACTION" = "flash" ]; then
  echo "Flashing $SKETCH_DIR to $PORT ..."
  "${ARGS[@]}" --upload --port "$PORT" .
else
  echo "Building $SKETCH_DIR ..."
  "${ARGS[@]}" .
fi
