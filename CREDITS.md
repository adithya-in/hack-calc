# Credits

## Porsche photograph

- **Title:** 2013 Porsche 911 Carrera 4S (991)
- **Author:** David Villarreal Fernández
- **Source:** https://commons.wikimedia.org/wiki/File:2013_Porsche_911_Carrera_4S_(991)_(9626546987).jpg
- **Licence:** [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)

The photo was resized, composited over a blurred and darkened copy of itself,
and converted to a 284×76 RGB565 array. The following files are derivative works
and remain **CC BY-SA 2.0**:

- `assets/porsche_source.jpg` (unmodified copy of the original)
- `assets/porsche_source_preview.png` (resized preview)
- `assets/porsche_banner_284x76.png` (processed banner)
- `firmware/hack_calc/porsche.h` (RGB565 data)

If you redistribute the banner or header, keep this attribution and the
ShareAlike licence. The MIT licence in `LICENSE` covers the code only.

## Software

- [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) by Bodmer — display driver.
- [arduino-esp32](https://github.com/espressif/arduino-esp32) — ESP32 core.
- [arduino-cli](https://github.com/arduino/arduino-cli) — build/upload tool.

## Hardware notes

The 76×284 CGRAM offsets were determined empirically on this panel. Thanks to
the TFT_eSPI community for the rotation-offset pattern used by the patch.
