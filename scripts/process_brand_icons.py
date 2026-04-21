"""
Export brand-icon PNGs at multiple sizes for website use.
Source: C:\\Users\\öööö\\.basic-memory\\Ronki\\image\\app icon\\
Target: website/public/art/branding/
"""
from pathlib import Path
from PIL import Image

SRC_DIR = Path("../.basic-memory/Ronki/image/app icon")
OUT_DIR = Path("website/public/art/branding")
OUT_DIR.mkdir(parents=True, exist_ok=True)

SOURCES = [
    ("app-icon.png", "ronki-icon-head"),
    ("app-icon-alt2.png", "ronki-icon-full"),
    ("app-icon-alt3.png", "ronki-icon-heroic"),
]

SIZES = [64, 128, 256]

for src_name, target_stem in SOURCES:
    src = SRC_DIR / src_name
    if not src.exists():
        print(f"Skip missing: {src}")
        continue
    img = Image.open(src).convert("RGBA")
    print(f"Source {src_name}: {img.size}")
    for size in SIZES:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        out = OUT_DIR / f"{target_stem}-{size}.webp"
        resized.save(out, "WEBP", quality=92, method=6)
        kb = out.stat().st_size // 1024
        print(f"  -> {out.name}  ({kb} KB)")
print("done.")
