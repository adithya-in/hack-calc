// 2.25" ST7789P3 76x284 bar display self-test for classic ESP32 (WROOM-32)
//
// Wiring (display 8-pin module):
//   GND -> GND          VCC -> 3V3
//   SCL -> GPIO18       SDA -> GPIO23   (SPI clock / MOSI)
//   RES -> GPIO17       DC  -> GPIO16
//   CS  -> GPIO5        BLK -> GPIO4 (active-low backlight, PWM-dimmed)
//
// Built with TFT_eSPI (see tft_setup.h in this folder).

#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

static_assert(TFT_WIDTH == 76 && TFT_HEIGHT == 284,
              "Per-sketch tft_setup.h was NOT loaded (global 240x320 setup is active)");

#define BL_LEDC_CH   7
#define BL_LEDC_FREQ 5000
#define BL_LEDC_RES  8

// level 0..255 (0 = off, 255 = full). BLK is active-low, so invert duty.
static void setBrightness(uint8_t level) {
#ifdef TFT_BL
  ledcWrite(BL_LEDC_CH, 255 - level);
#endif
}

uint32_t counter = 0;

void drawUI(uint32_t n) {
  const int W = tft.width();
  const int H = tft.height();

  tft.fillScreen(TFT_BLACK);
  tft.drawRect(0, 0, W, H, TFT_CYAN);

  tft.setTextDatum(TL_DATUM);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.drawString("ST7789 2.25\"", 4, 3, 2);

  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.drawString("76x284", 4, 20, 2);

  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.drawString("Count:", 4, 38, 2);
  tft.setTextColor(TFT_ORANGE, TFT_BLACK);
  tft.drawNumber(n, 62, 36, 4);

  // animated progress bar near the bottom
  int trackY = H - 14;
  tft.fillRect(4, trackY, W - 8, 7, TFT_DARKGREY);
  int fill = (n * 9) % (W - 8);
  tft.fillRect(4, trackY, fill, 7, TFT_MAGENTA);
}

void setup() {
  Serial.begin(115200);
  delay(400);
  Serial.println();
  Serial.println("=== 2.25\" ST7789 76x284 test ===");

  tft.init();
  tft.setRotation(1);  // landscape: 284 x 76
  Serial.printf("TFT init OK, width=%d height=%d\n", tft.width(), tft.height());

#ifdef TFT_BL
  // Take over the backlight pin with LEDC PWM (active-low).
  ledcSetup(BL_LEDC_CH, BL_LEDC_FREQ, BL_LEDC_RES);
  ledcAttachPin(TFT_BL, BL_LEDC_CH);
  setBrightness(5);    // <-- tune this: 0 (off) .. 255 (full)
  Serial.println("backlight PWM @ level 5");
#endif

  // Channel/colour check: R then G then B then white.
  tft.fillScreen(TFT_RED);   delay(600);
  tft.fillScreen(TFT_GREEN); delay(600);
  tft.fillScreen(TFT_BLUE);  delay(600);
  tft.fillScreen(TFT_WHITE); delay(400);
  tft.fillScreen(TFT_BLACK);
}

void loop() {
  drawUI(counter++);
  Serial.printf("frame %u  (%dx%d)\n", counter, tft.width(), tft.height());
  delay(250);
}
