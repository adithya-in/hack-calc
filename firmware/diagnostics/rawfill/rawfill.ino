// Raw ST7789 full-GRAM test: bypasses TFT_eSPI and CGRAM offsets entirely.
// Fills the whole 240x320 GRAM with inversion-immune patterns so the visible
// 76x284 strip lights up no matter where its window sits.
// If screen stays black -> backlight / power / wiring / dead panel.

#include <SPI.h>

#define PIN_SCLK 18
#define PIN_MOSI 23
#define PIN_CS    5
#define PIN_DC   16
#define PIN_RST  17
#define PIN_BL    4

#define GRAM_W 240
#define GRAM_H 320

static inline void csLow()  { digitalWrite(PIN_CS, LOW); }
static inline void csHigh() { digitalWrite(PIN_CS, HIGH); }
static inline void dcCmd()  { digitalWrite(PIN_DC, LOW); }
static inline void dcData() { digitalWrite(PIN_DC, HIGH); }

void wrCmd(uint8_t c) {
  dcCmd(); csLow(); SPI.transfer(c); csHigh();
}

void cmdData(uint8_t c, const uint8_t *d, size_t n) {
  dcCmd(); csLow(); SPI.transfer(c);
  dcData(); for (size_t i = 0; i < n; i++) SPI.transfer(d[i]);
  csHigh();
}

void resetPanel() {
  digitalWrite(PIN_RST, LOW);  delay(20);
  digitalWrite(PIN_RST, HIGH); delay(150);
}

void initPanel() {
  wrCmd(0x01); delay(150);              // SWRESET
  wrCmd(0x11); delay(120);              // SLPOUT
  uint8_t colmod = 0x55; cmdData(0x3A, &colmod, 1);  // 16-bit colour
  uint8_t madctl = 0x00; cmdData(0x36, &madctl, 1);  // RGB, no flip
  wrCmd(0x20);                          // INVOFF
  wrCmd(0x13);                          // NORON
  wrCmd(0x29); delay(20);               // DISPON
}

void setWindow(uint16_t x0, uint16_t y0, uint16_t x1, uint16_t y1) {
  uint8_t b[4];
  b[0] = x0 >> 8; b[1] = x0 & 0xFF; b[2] = x1 >> 8; b[3] = x1 & 0xFF;
  cmdData(0x2A, b, 4);
  b[0] = y0 >> 8; b[1] = y0 & 0xFF; b[2] = y1 >> 8; b[3] = y1 & 0xFF;
  cmdData(0x2B, b, 4);
  wrCmd(0x2C);                          // RAMWR
}

void streamFrame(void (*pick)(int x, int y, uint16_t &c)) {
  setWindow(0, 0, GRAM_W - 1, GRAM_H - 1);
  dcData(); csLow();
  uint16_t c;
  for (int y = 0; y < GRAM_H; y++)
    for (int x = 0; x < GRAM_W; x++) {
      pick(x, y, c);
      SPI.transfer16(c);
    }
  csHigh();
}

static void stripes(int x, int, uint16_t &c) {
  c = ((x / 8) & 1) ? 0xFFFF : 0x0000;
}

static void bars(int, int y, uint16_t &c) {
  if (y < 80)       c = 0xF800;   // red
  else if (y < 160) c = 0x07E0;   // green
  else if (y < 240) c = 0x001F;   // blue
  else              c = 0xFFFF;   // white
}

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println();
  Serial.println("=== RAW ST7789 FULL-GRAM TEST ===");

  pinMode(PIN_CS, OUTPUT);  digitalWrite(PIN_CS, HIGH);
  pinMode(PIN_DC, OUTPUT);
  pinMode(PIN_RST, OUTPUT);
  pinMode(PIN_BL, OUTPUT);
  digitalWrite(PIN_BL, HIGH);          // backlight ON

  SPI.begin(PIN_SCLK, -1, PIN_MOSI, -1);
  SPI.beginTransaction(SPISettings(20000000, MSBFIRST, SPI_MODE0));

  resetPanel();
  initPanel();

  Serial.println("init done, streaming patterns");
}

void loop() {
  Serial.println("pattern: B/W stripes");
  streamFrame(stripes);
  delay(4000);

  Serial.println("pattern: colour bars");
  streamFrame(bars);
  delay(4000);
}
