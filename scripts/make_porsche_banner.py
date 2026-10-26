#!/usr/bin/env python3
"""Generate a 284x76 RGB565 C header for the hack-calc Porsche banner.

The source photo is scaled to full height and centred over a blurred,
darkened "cover" copy of itself, which fills the very wide 3.74:1 strip
without cropping the car.

Usage:
    python3 scripts/make_porsche_banner.py \
        assets/porsche_source.jpg \
        firmware/hack_calc/porsche.h

Requires Pillow.
"""

import argparse
import os

from PIL import Image, ImageEnhance, ImageFilter

W, H = 284, 76


def rgb565(r: int, g: int, b: int) -> int:
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)


def build_banner(src: str) -> Image.Image:
    im = Image.open(src).convert("RGB")

    # Background: cover 284x76, blur, darken.
    scale = max(W / im.width, H / im.height)
    bw, bh = int(im.width * scale + 0.5), int(im.height * scale + 0.5)
    bg = im.resize((bw, bh), Image.LANCZOS)
    left = (bw - W) // 2
    top = (bh - H) // 2
    bg = bg.crop((left, top, left + W, top + H)).filter(ImageFilter.GaussianBlur(8))
    bg = ImageEnhance.Brightness(bg).enhance(0.55)
    bg = ImageEnhance.Color(bg).enhance(0.9)

    # Foreground: whole car, full height, centred.
    fw = int(im.width * (H / im.height) + 0.5)
    fg = im.resize((fw, H), Image.LANCZOS)

    canvas = bg.copy()
    canvas.paste(fg, ((W - fw) // 2, 0))
    canvas = ImageEnhance.Contrast(canvas).enhance(1.08)
    canvas = ImageEnhance.Color(canvas).enhance(1.15)
    return canvas


def write_header(img: Image.Image, out_path: str, source_name: str) -> None:
    px = img.load()
    values = [rgb565(*px[x, y]) for y in range(H) for x in range(W)]

    with open(out_path, "w") as f:
        f.write("// Auto-generated 284x76 RGB565 banner. Do not edit by hand.\n")
        f.write("// Source: %s (see CREDITS.md for attribution/licence).\n" % source_name)
        f.write("#pragma once\n#include <pgmspace.h>\n\n")
        f.write("#define PORSCHE_W 284\n#define PORSCHE_H 76\n\n")
        f.write("static const uint16_t PORSCHE_IMG[PORSCHE_W * PORSCHE_H] PROGMEM = {\n")
        for i in range(0, len(values), 16):
            f.write("  " + ", ".join("0x%04X" % v for v in values[i:i + 16]) + ",\n")
        f.write("};\n")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", help="source photo (jpg/png)")
    ap.add_argument("output", help="output .h path")
    ap.add_argument("--preview", default=None, help="optional PNG preview path")
    args = ap.parse_args()

    img = build_banner(args.source)
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    write_header(img, args.output, os.path.basename(args.source))
    if args.preview:
        img.save(args.preview)
    print("wrote %s (%dx%d)" % (args.output, W, H))


if __name__ == "__main__":
    main()
