# hack-calc

A Casio FX-82MS shell powered by an ESP32 and a 2.25" ST7789 **76×284** bar TFT.
The panel is driven as a 284×76 landscape strip and made to look like the
calculator's original dot-matrix LCD.

![Porsche banner](assets/porsche_banner_284x76.png)

## What it does

The screen cycles every 2 seconds:

1. **Casio LCD** — dark `#152228` panel with light `#bccfc4` segments, faint
   dot-matrix grid, `DEG / M / STO` annunciators and a two-line
   expression/result (`sin(30)+12` → `12.5`).
2. **Porsche banner** — a 284×76 RGB565 photo of a Porsche 911 Carrera 4S.
3. **Cheat sheet** — a compact formulas sheet.

Then it repeats. Backlight brightness is set per state (Casio 5, Porsche 100,
cheat sheet 40) so the photo is visible while the LCD stays dim.

## Hardware

| Part | Detail |
|------|--------|
| MCU | ESP32 WROOM-32, ESP32-D0WD-V3, 4 MB flash |
| Display | 2.25" ST7789P3, 76×284, 8-pin SPI, 2.8–3.3 V |
| Active area | 14.8 × 55.3 mm |
| USB-serial | CP210x (`/dev/cu.usbserial-0001`) |

Wiring (display pin order **GND, VCC, SCL, SDA, RES, DC, CS, BLK** — confirm
against the silkscreen on your module):

| Display | ESP32 | Notes |
|---------|-------|-------|
| GND | GND | common ground |
| VCC | 3V3 | **do not use 5 V** |
| SCL | GPIO18 | SPI clock |
| SDA | GPIO23 | SPI MOSI |
| RES | GPIO17 | reset |
| DC  | GPIO16 | data/command |
| CS  | GPIO5  | chip select |
| BLK | GPIO4  | backlight, **active-low**, PWM-dimmed |

> `BLK` pulled to **GND turns the backlight on**. For dimming, drive it from
> GPIO4 with inverted PWM (`ledcWrite(ch, 255 - level)`).

## Critical findings

These cost the most time during bring-up:

1. **The backlight is active-low.** Wiring `BLK → 3V3` or driving it HIGH keeps
   the panel pitch black. Tie it to GND (full brightness) or PWM it on GPIO4.
2. **This panel's 76×284 window is offset inside the 240×320 GRAM.**
   Portrait needs `colstart=82, rowstart=18`; landscape needs
   `colstart=18, rowstart=82`. Without this, fills land off-screen and the
   display looks dead. See `patches/`.
3. **`tft_setup.h` is not auto-included by arduino-cli.** You must pass
   `--build-property "compiler.cpp.extra_flags=-I$PWD"`, or TFT_eSPI silently
   uses its global 240×320 config. The sketch has a `static_assert` to catch it.
4. **Full-GRAM raw test beats guessing.** `firmware/diagnostics/rawfill` writes
   the whole 240×320 GRAM with inversion-immune B/W stripes, bypassing all
   offsets. If stripes appear, the panel/backlight/SPI are fine and the problem
   is offsets; if not, it's hardware.

## Build & flash

Tested with `arduino-cli 1.3.1`, `esp32:esp32@2.0.17`, `TFT_eSPI@2.5.43`.

```bash
arduino-cli core install esp32:esp32@2.0.17
arduino-cli lib install TFT_eSPI@2.5.43

# one-time: add the 76x284 offsets to TFT_eSPI
./scripts/apply_tft_espi_patch.sh

# compile + upload
PORT=/dev/cu.usbserial-0001 ./scripts/build.sh flash
```

Or manually:

```bash
cd firmware/hack_calc
arduino-cli compile --fqbn esp32:esp32:esp32 \
  --build-property "compiler.cpp.extra_flags=-I$PWD" \
  --upload --port /dev/cu.usbserial-0001 .
```

## Configuration

| What | Where |
|------|-------|
| Cycle time | `CYCLE_MS` in `firmware/hack_calc/hack_calc.ino` |
| Brightness per state | `STATE_BRIGHT` |
| Casio colours | `LCD_BG`, `LCD_GRID`, `LCD_INK` |
| Casio content | `drawCasioDisplay("sin(30)+12", "12.5")` |
| Cheat sheet lines | `drawCheatSheet()` |
| Pins / panel size / colour order | `firmware/hack_calc/tft_setup.h` |
| Porsche image | `firmware/hack_calc/porsche.h` (regenerate with `scripts/make_porsche_banner.py`) |

## Repository layout

```
firmware/
  hack_calc/                 main sketch (Casio LCD + photo + cheat sheet loop)
  diagnostics/
    panel_test/              TFT_eSPI sanity test (border, text, RGB check)
    rawfill/                 raw-SPI full-GRAM stripe test (no offsets)
patches/
  0001-st7789-76x284-offsets.patch
scripts/
  build.sh                   compile / flash helper
  apply_tft_espi_patch.sh    patch TFT_eSPI for 76x284
  make_porsche_banner.py     photo -> 284x76 RGB565 header
assets/
  porsche_source.jpg         original photo (CC BY-SA 2.0)
  porsche_banner_284x76.png  processed banner
docs/
  HARDWARE.md SOFTWARE.md TROUBLESHOOTING.md CHANGELOG.md
```

See [`docs/`](docs/) for deep dives and [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)
if the panel is dark.

## Credits & licence

Code is MIT — see [`LICENSE`](LICENSE).

The Porsche photo and its derived banner/header are **CC BY-SA 2.0** by
David Villarreal Fernández (Wikimedia Commons). See [`CREDITS.md`](CREDITS.md).
