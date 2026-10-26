# Changelog / development log

## 2026-10-27

- Created the public `hack-calc` repository with firmware, diagnostics, patch,
  image pipeline and documentation.
- Main sketch now cycles every 2 s: **Casio LCD → Porsche banner → cheat sheet**.
- Added a 284×76 RGB565 Porsche 911 banner (`porsche.h`) generated from a
  CC BY-SA 2.0 Wikimedia Commons photo.
- Added the formula cheat sheet state.
- Added per-state backlight levels (`STATE_BRIGHT = {5, 100, 40}`).
- Simplified the loop to `delay(CYCLE_MS)` + index rotation after a millis-gate
  version produced a tight print loop in testing.

## 2026-10-26

- Brought up the 2.25" 76×284 ST7789 panel on an ESP32 WROOM-32.
- Diagnosed the pitch-black screen: **BLK is active-low**; `BLK → GND` turns the
  backlight on.
- Verified panel/SPI/backlight independently with a raw-SPI full-GRAM stripe
  test (`firmware/diagnostics/rawfill`), which bypasses TFT_eSPI and offsets.
- Patched `TFT_eSPI/TFT_Drivers/ST7789_Rotation.h` for 76×284:
  portrait `colstart=82, rowstart=18`, landscape `colstart=18, rowstart=82`.
- Discovered that arduino-cli does not auto-include the sketch-local
  `tft_setup.h`; added the `-I$PWD` build-property workaround and a
  `static_assert` guard.
- Added LEDC PWM backlight dimming (inverted duty for active-low BLK).
- Built the Casio-style dot-matrix renderer (green/dark LCD palette, faint
  pixel grid, annunciators, two-line expression/result).
- Applied the final inverted palette: background `#152228`, text `#bccfc4`.

## Ideas / next

- Read the real FX-82MS keypad matrix and evaluate expressions.
- Drive the Casio screen from live calculator state instead of a fixed sample.
- Idle timeout that drops the backlight to 0.
- Replace the fixed cheat sheet with pages selected by a key.
