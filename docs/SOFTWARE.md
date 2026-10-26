# Software

## Toolchain

| Tool | Version |
|------|---------|
| arduino-cli | 1.3.1 |
| esp32 core | `esp32:esp32@2.0.17` |
| TFT_eSPI | 2.5.43 |
| FQBN | `esp32:esp32:esp32` |

Install:

```bash
arduino-cli core install esp32:esp32@2.0.17
arduino-cli lib install TFT_eSPI@2.5.43
./scripts/apply_tft_espi_patch.sh
```

## The TFT_eSPI patch

`TFT_eSPI` ships rotation offsets for common ST7789 sizes (135, 170, 172, 240×280,
…) but not for a 76×284 bar panel. Without offsets, `fillScreen` writes outside
the visible area and the screen looks blank.

`patches/0001-st7789-76x284-offsets.patch` adds four `else if` branches to
`TFT_Drivers/ST7789_Rotation.h`:

- rotation 0 (portrait): `colstart = 82; rowstart = 18;`
- rotation 1 (landscape): `colstart = 18; rowstart = 82;`
- rotation 2 (portrait): same as 0
- rotation 3 (landscape): same as 1

Apply from a TFT_eSPI checkout:

```bash
cd ~/Documents/Arduino/libraries/TFT_eSPI
patch -p1 < /path/to/hack-calc/patches/0001-st7789-76x284-offsets.patch
```

## Per-sketch `tft_setup.h`

`firmware/hack_calc/tft_setup.h` is a full TFT_eSPI configuration. It is guarded
by `USER_SETUP_ID 9001` and is meant to be included **instead of** the library's
global `User_Setup.h`.

Key settings:

```cpp
#define ST7789_DRIVER
#define TFT_WIDTH  76
#define TFT_HEIGHT 284
#define CGRAM_OFFSET
#define TFT_RGB_ORDER TFT_RGB
#define TFT_MOSI 23
#define TFT_SCLK 18
#define TFT_CS    5
#define TFT_DC   16
#define TFT_RST  17
#define TFT_BL    4
#define TFT_BACKLIGHT_ON LOW      // active-low panel
#define SPI_FREQUENCY 27000000
```

### Why the `-I` build flag is mandatory

TFT_eSPI supports sketch-local configuration through `__has_include`, but
arduino-cli does **not** add the sketch folder to the include path for library
compilation. The sketch therefore passes:

```
--build-property "compiler.cpp.extra_flags=-I$PWD"
```

Without it, the global `User_Setup.h` (240×320) is used. The sketch's

```cpp
static_assert(TFT_WIDTH == 76 && TFT_HEIGHT == 284, ...);
```

turns that silent failure into a compile error.

## Main sketch architecture

`firmware/hack_calc/hack_calc.ino`

- `setup()` initialises the panel, sets rotation 1 (284×76), configures LEDC PWM
  on `TFT_BL`, then draws state 0.
- `loop()` waits `CYCLE_MS`, advances `state = (state + 1) % 3`, and redraws.

### State 0 — Casio LCD (`drawCasioDisplay`)

- `lcdBase()` fills with `LCD_BG` (`#152228`).
- `drawAnnunciators()` prints `DEG`, `M`, `STO` in `LCD_INK` (`#bccfc4`).
- `lcdText()` draws each line in TFT_eSPI `font 1` (5×7 bitmap) scaled 2× or 3×.
  Each glyph pixel becomes a solid block, giving a chunky LCD look.
- `drawDotGrid()` places a faint `LCD_GRID` dot at every glyph-pixel position
  before the text, so off-pixels read as an LCD matrix.

Change the sample by editing the `drawCasioDisplay(...)` call.

### State 1 — Porsche banner

- `porsche.h` holds `PORSCHE_IMG[284*76]` as RGB565 in `PROGMEM`.
- `tft.setSwapBytes(true); tft.pushImage(0, 0, 284, 76, PORSCHE_IMG);`
- `setSwapBytes(true)` is required because the array is native little-endian
  `uint16_t` and the panel expects big-endian pixels.

Regenerate the header:

```bash
python3 scripts/make_porsche_banner.py \
  assets/porsche_source.jpg \
  firmware/hack_calc/porsche.h \
  --preview assets/porsche_banner_284x76.png
```

The generator scales the photo to height 76 and centres it over a blurred,
darkened "cover" version. That fills the extreme 3.74:1 aspect without cropping
the car.

### State 2 — cheat sheet

`drawCheatSheet()` fills a paper colour and prints eight ASCII formula lines in
`font 1` at size 1.

### Backlight

```cpp
static void setBrightness(uint8_t level) {
  ledcWrite(BL_LEDC_CH, 255 - level);   // BLK is active-low
}
```

`STATE_BRIGHT[]` is the per-state level. Set all three equal for a fixed
brightness.

## Build commands

```bash
# helper
./scripts/build.sh          # compile only
./scripts/build.sh flash    # compile + upload

# manual
cd firmware/hack_calc
arduino-cli compile --fqbn esp32:esp32:esp32 \
  --build-property "compiler.cpp.extra_flags=-I$PWD" .
```

## Serial

`Serial` runs at 115200. The sketch prints the state index every cycle. If you
open the port after boot you will miss the banner; that is normal.
