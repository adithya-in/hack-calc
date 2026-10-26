// Per-sketch TFT_eSPI configuration for the 2.25" 76x284 ST7789P3 bar panel.
// The library auto-includes this file (via __has_include) before User_Setup.h,
// so the global library config is left untouched.
#define USER_SETUP_ID 9001

#define ST7789_DRIVER

// Native (portrait) geometry of the panel
#define TFT_WIDTH  76
#define TFT_HEIGHT 284

// The 76x284 window sits inside the ST7789 240x320 GRAM; offsets are applied
// by the patched ST7789_Rotation.h (portrait 82/18, landscape 18/82).
#define CGRAM_OFFSET

// Community-verified colour order for this ST7789P3 bar panel
#define TFT_RGB_ORDER TFT_RGB

// ESP32 (VSPI) wiring
#define TFT_MOSI 23
#define TFT_SCLK 18
#define TFT_CS    5
#define TFT_DC   16
#define TFT_RST  17
#define TFT_BL    4
// Backlight on this module is ACTIVE-LOW (BLK to GND = on).
#define TFT_BACKLIGHT_ON LOW

// Fonts
#define LOAD_GLCD
#define LOAD_FONT2
#define LOAD_FONT4
#define LOAD_FONT6
#define LOAD_FONT7
#define LOAD_FONT8
#define LOAD_GFXFF
#define SMOOTH_FONT

// SPI clock (27 MHz is a safe, verified speed for this panel)
#define SPI_FREQUENCY  27000000
