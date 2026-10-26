# Troubleshooting

## Screen is pitch black (no glow at all)

This is a backlight/power problem, not an SPI-data problem.

1. **BLK is active-low.** `BLK → GND` must light the panel. If you had it on
   3V3 (or driven HIGH), that is the bug.
2. Power-only test: connect only `GND→GND`, `VCC→3V3`, `BLK→GND`. If it still
   does not glow, check the module silkscreen pin order, solder joints, and
   that 3.3 V is actually present at VCC.
3. Try `BLK → GND` and `BLK → 3V3` to confirm polarity. Never put 5 V on VCC.
4. If it never lights under any wiring, the module may be dead.

If it glows but shows nothing, the backlight is fine — go to the next section.

## Backlight works but the image is blank/black

Almost always **CGRAM offsets**.

- Confirm the patch is applied: `TFT_Drivers/ST7789_Rotation.h` should contain
  `_init_width == 76` branches.
- Expected: portrait `colstart=82, rowstart=18`; landscape `colstart=18,
  rowstart=82`.
- If the image is shifted/clipped by a few pixels on an edge, tweak those four
  values for your batch.

Run `firmware/diagnostics/rawfill` to separate hardware from offsets. It fills
the entire 240×320 GRAM with B/W stripes and colour bars, so the visible strip
lights up regardless of offset.

## "tft_setup.h was NOT loaded" compile error

You are missing the include flag:

```bash
arduino-cli compile --fqbn esp32:esp32:esp32 \
  --build-property "compiler.cpp.extra_flags=-I$PWD" .
```

Run it from the sketch directory (so `$PWD` is correct), or use
`./scripts/build.sh`.

## Build says `compiler.cpp.extra_flags` ignored / sketch uses 240x320

Same cause as above. The `static_assert` exists to catch this.

## Colours are wrong / image looks like noise

- The image array is RGB565 and must be pushed with
  `tft.setSwapBytes(true)`.
- For text/fills, use `setSwapBytes(false)` (the main sketch does this).
- If red/blue are swapped, change `TFT_RGB_ORDER` in `tft_setup.h`.

## Backlight is always full brightness

`BLK` is probably still tied to GND. Move it to **GPIO4**; the firmware PWMs it.
With `BLK` on GND there is no way to dim.

## Brightness changes do nothing

- `BLK` must be on `TFT_BL`/GPIO4.
- Level is inverted: `ledcWrite(ch, 255 - level)`.
- Check `STATE_BRIGHT[]` in `hack_calc.ino`.

## Flicker or whine from the backlight

Raise `BL_LEDC_FREQ` (e.g. 20000) or lower it (e.g. 1000), depending on the
module's driver.

## Serial is garbage

- Baud is 115200.
- Opening the port can toggle DTR/RTS and reset the ESP32; the first bytes are
  the ROM boot log. Read again after ~1 s.
- If you previously had a flooding sketch, the OS/driver can hold a large stale
  buffer. Close and reopen the port, or reset the board.

## Upload fails: "port doesn't exist"

The board re-enumerated or the cable moved.

```bash
ls /dev/cu.*
arduino-cli board list
```

Replug the ESP32, confirm the port (often `/dev/cu.usbserial-0001`), then retry.

## Photo is too dim / too bright

Backlight is set per state in `STATE_BRIGHT[]`. Casio defaults to 5, Porsche to
100, cheat sheet to 40. Set them all to one value for a fixed brightness.

## Loop is not 2 seconds / serial floods

The current sketch uses `delay(CYCLE_MS)` — it cannot flood. If you see a flood,
you are likely reading stale buffered output from an earlier firmware. Close the
port, reset the board, and reconnect.
