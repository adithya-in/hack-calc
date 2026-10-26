# Hardware

## Bill of materials

| Part | Spec |
|------|------|
| MCU board | ESP32 WROOM-32 / ESP32-D0WD-V3, 4 MB flash, CP210x USB-serial |
| Display | 2.25" TFT, ST7789P3 controller, 76×284 px, 8-pin SPI |
| Display supply | 2.8–3.3 V |
| Active area | 14.8 × 55.3 mm |
| Host | macOS (instructions shell-agnostic) |

The exact module used was an Indian reseller listing ("2.25 inch TFT LCD ST7789
small screen 76*284 module LCD full view SPI color screen with soldering").
Resellers of this module typically use the pin order:

```
GND  VCC  SCL  SDA  RES  DC  CS  BLK
```

**Always confirm against the silkscreen/printing on your own board.** Reversed
or rotated pin order is a common cause of a dead-looking module, and VCC/GND
swaps can damage the panel.

## Wiring

| Display | ESP32 | Function |
|---------|-------|----------|
| GND | GND | ground |
| VCC | 3V3 | 3.3 V logic + panel supply |
| SCL | GPIO18 | SPI SCLK (VSPI) |
| SDA | GPIO23 | SPI MOSI (VSPI) |
| RES | GPIO17 | hardware reset |
| DC  | GPIO16 | data/command select |
| CS  | GPIO5  | chip select |
| BLK | GPIO4  | backlight, active-low, PWM |

If you do not want software brightness control, `BLK → GND` gives full
brightness. For dimming, use GPIO4 (see below).

```
ESP32                    2.25" ST7789 (284x76)
3V3  ------------------- VCC
GND  ------------------- GND
GPIO18 ---------------- SCL
GPIO23 ---------------- SDA
GPIO17 ---------------- RES
GPIO16 ---------------- DC
GPIO5  ---------------- CS
GPIO4  ---------------- BLK   (active-low, PWM)
```

## Power notes

- Use **3.3 V** for VCC. The panel is not 5 V tolerant.
- The backlight is the dominant current draw. Keep the ground return short and
  shared with the ESP32.
- If the board resets when the backlight jumps to full, suspect a weak USB
  supply/cable or a brown-out on the 3.3 V rail. A short, quality USB cable and
  a powered hub help.

## Backlight is active-low

This is the single most important hardware quirk:

- `BLK → GND` = **backlight ON**.
- `BLK → 3V3`, or driven HIGH = **backlight OFF** (pitch black).
- For PWM dimming, connect `BLK → GPIO4` and drive it with inverted duty:
  `ledcWrite(channel, 255 - level)`, where `level = 0..255`.

The firmware also sets `TFT_BACKLIGHT_ON LOW` in `tft_setup.h` so TFT_eSPI
agrees with the hardware.

## Panel geometry and offsets

The ST7789 GRAM is 240×320, but the visible area of this panel is a 76×284
window inside it. TFT_eSPI must offset every address window:

| Orientation | Size | colstart | rowstart |
|-------------|------|----------|----------|
| Portrait (rotation 0/2) | 76×284 | 82 | 18 |
| Landscape (rotation 1/3) | 284×76 | 18 | 82 |

These offsets are added to `TFT_eSPI/TFT_Drivers/ST7789_Rotation.h` by
`patches/0001-st7789-76x284-offsets.patch`. Different batches of the panel can
occasionally use slightly different offsets; if the image is clipped by a few
pixels on one edge, adjust these four numbers.

## Proven pin states

| Signal | State |
|--------|-------|
| SPI mode | 0 (CPOL=0, CPHA=0) |
| Colour order | RGB (`TFT_RGB_ORDER TFT_RGB`) |
| SPI clock | 27 MHz (stable; lower it if you see corruption) |
| Logic | 3.3 V |
