"""
Generate favicon + PWA icons from the Heroic dragon app-icon source.
Source: .basic-memory/Ronki/image/app icon/app-icon-alt3.png
Target: website/public/favicon-32.png, favicon-192.png, apple-touch-icon.png
"""
from pathlib import Path
from PIL import Image

SRC = Path("../.basic-memory/Ronki/image/app icon/app-icon-alt3.png")
OUT_DIR = Path("website/public")

TARGETS = [
    ("favicon-32.png", 32),
    ("favicon-192.png", 192),
    ("apple-touch-icon.png", 180),
]

img = Image.open(SRC).convert("RGBA")
print(f"Source: {img.size}")
for name, size in TARGETS:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    out = OUT_DIR / name
    resized.save(out, "PNG", optimize=True)
    kb = out.stat().st_size // 1024
    print(f"  -> {out.name} ({size}x{size}, {kb} KB)")
print("done.")
