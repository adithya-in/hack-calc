// hack-calc — Casio FX-82MS style LCD on a 2.25" 76x284 ST7789 bar TFT
//
// Hardware: ESP32 WROOM-32 + 2.25" ST7789P3 76x284 8-pin SPI panel.
// Wiring (display -> ESP32):
//   GND -> GND
//   VCC -> 3V3
//   SCL -> GPIO18 (SPI clock)
//   SDA -> GPIO23 (SPI MOSI)
//   RES -> GPIO17
//   DC  -> GPIO16
//   CS  -> GPIO5
//   BLK -> GPIO4 (ACTIVE-LOW; LEDC PWM for brightness)
//
// IMPORTANT: this sketch relies on the per-sketch tft_setup.h. arduino-cli
// does NOT auto-include it, so add:
//   --build-property "compiler.cpp.extra_flags=-I$PWD"
// Otherwise the library's global (240x320) config is used and nothing shows.
//
// The screen cycles every CYCLE_MS: Casio LCD -> Porsche banner -> cheat sheet.

#include <TFT_eSPI.h>
#include "porsche.h"

TFT_eSPI tft = TFT_eSPI();

static_assert(TFT_WIDTH == 76 && TFT_HEIGHT == 284,
              "Per-sketch tft_setup.h was NOT loaded (global 240x320 setup is active)");

// ---------------- configuration ----------------
#define CYCLE_MS     2000
#define BL_LEDC_CH   7
#define BL_LEDC_FREQ 5000
#define BL_LEDC_RES  8

// Backlight level (0..255) per state: Casio, Porsche, cheat sheet.
// BLK is active-low, so the duty cycle is inverted in setBrightness().
static const uint8_t STATE_BRIGHT[3] = {5, 100, 40};

// Casio LCD palette (inverted: dark panel, light segments)
static uint16_t LCD_BG;    // #152228
static uint16_t LCD_GRID;  // subtle off-pixel dots
static uint16_t LCD_INK;   // #bccfc4
// -----------------------------------------------

static void setBrightness(uint8_t level) {
#ifdef TFT_BL
  ledcWrite(BL_LEDC_CH, 255 - level);   // active-low
#endif
}

static int alignDown(int v, int p) { return v - (v % p); }

static void drawDotGrid(int x, int y, int w, int h, int pitch, uint16_t color) {
  for (int gy = y; gy < y + h; gy += pitch)
    for (int gx = x; gx < x + w; gx += pitch)
      tft.drawPixel(gx, gy, color);
}

static void lcdBase() {
  tft.fillScreen(LCD_BG);
}

// Draw one text line as blocky dot-matrix. font1 is a 5x7 bitmap; scaling by
// `size` turns each glyph pixel into a size x size block, and a faint dot grid
// behind it reads as the LCD off-pixels.
static void lcdText(const char *s, int x, int y, int size, bool rightAlign, int rightX) {
  int w = (int)strlen(s) * 6 * size;
  int px = rightAlign ? (rightX - w) : x;
  px = alignDown(px, size);
  int py = alignDown(y, size);

  drawDotGrid(px, py, w, 7 * size, size, LCD_GRID);

  tft.setTextFont(1);
  tft.setTextSize(size);
  tft.setTextColor(LCD_INK);            // transparent background
  tft.drawString(s, px, py);
}

static void drawAnnunciators() {
  tft.setTextFont(1);
  tft.setTextSize(1);
  tft.setTextColor(LCD_INK);
  tft.drawString("DEG", 8, 7);
  tft.drawString("M", 40, 7);
  tft.drawString("STO", 52, 7);
}

static void drawCasioDisplay(const char *expression, const char *result) {
  lcdBase();
  drawAnnunciators();
  lcdText(expression, 8, 20, 2, false, 0);              // top line
  lcdText(result, 0, 46, 3, true, tft.width() - 10);    // bottom line
}

static void drawCheatSheet() {
  const uint16_t paper = tft.color565(245, 243, 232);
  const uint16_t ink   = tft.color565(21, 34, 40);

  static const char *const lines[] = {
    "sin^2+cos^2=1   tan=sin/cos",
    "sin(A+B)=sinAcosB+cosAsinB",
    "cos(A+B)=cosAcosB-sinAsinB",
    "a/sinA=b/sinB=c/sinC",
    "a^2=b^2+c^2-2bc*cosA",
    "Area=0.5*a*b*sinC",
    "x=(-b+/-sqrt(b^2-4ac))/2a",
    "log(ab)=loga+logb",
  };

  tft.setSwapBytes(false);
  tft.fillScreen(paper);
  tft.setTextFont(1);
  tft.setTextSize(1);
  tft.setTextColor(ink);

  int y = 4;
  for (size_t i = 0; i < sizeof(lines) / sizeof(lines[0]); i++) {
    tft.drawString(lines[i], 6, y);
    y += 9;
  }
}

// States: 0 = Casio LCD, 1 = Porsche photo, 2 = cheat sheet.
static void drawState(int s) {
  setBrightness(STATE_BRIGHT[s]);
  tft.setSwapBytes(false);
  switch (s) {
    case 0:
      drawCasioDisplay("sin(30)+12", "12.5");
      break;
    case 1:
      tft.setSwapBytes(true);
      tft.pushImage(0, 0, PORSCHE_W, PORSCHE_H, PORSCHE_IMG);
      tft.setSwapBytes(false);
      break;
    case 2:
      drawCheatSheet();
      break;
  }
}

static int state = 0;

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println();
  Serial.println("=== hack-calc ===");

  LCD_BG   = tft.color565(21, 34, 40);       // #152228
  LCD_GRID = tft.color565(31, 47, 55);
  LCD_INK  = tft.color565(188, 207, 196);    // #bccfc4

  tft.init();
  tft.setRotation(1);   // landscape 284 x 76

#ifdef TFT_BL
  ledcSetup(BL_LEDC_CH, BL_LEDC_FREQ, BL_LEDC_RES);
  ledcAttachPin(TFT_BL, BL_LEDC_CH);
#endif

  tft.setSwapBytes(false);
  state = 0;
  drawState(state);
}

void loop() {
  delay(CYCLE_MS);
  state = (state + 1) % 3;
  Serial.printf("state %d\n", state);
  drawState(state);
}
