# Diagnostics

Two sketches for isolating faults. Neither one needs the main sketch's assets.

## `rawfill` — is the panel alive?

Bypasses TFT_eSPI completely and talks SPI directly, writing the **entire**
240×320 GRAM:

- B/W vertical stripes
- full-screen red, green, blue, white

Because it does not use offsets, the visible 76×284 strip will show stripes even
if the panel's CGRAM offsets are wrong.

- Stripes/colours visible → panel, backlight, wiring and SPI are fine; the
  problem is in TFT_eSPI config/offsets.
- Nothing visible but backlight glows → SPI or DC/CS/RES wiring.
- No glow → backlight/power (remember BLK is active-low).

## `panel_test` — is TFT_eSPI configured correctly?

Uses TFT_eSPI with its own `tft_setup.h`. Draws a border around the 284×76
landscape area, labels, and colour swatches. If the border is clipped or the
image is shifted, the offsets or rotation are wrong.

Both sketches require the per-sketch include flag:

```bash
cd firmware/diagnostics/rawfill   # or panel_test
arduino-cli compile --fqbn esp32:esp32:esp32 \
  --build-property "compiler.cpp.extra_flags=-I$PWD" \
  --upload --port /dev/cu.usbserial-0001 .
```

`panel_test` relies on the patched `ST7789_Rotation.h`; `rawfill` does not.
