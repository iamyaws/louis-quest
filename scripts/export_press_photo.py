"""
Export a press-ready JPG of the back-to-back founder photo for
Gemeindeblatt submissions. Target: 1-8 MB JPG (Unterföhring spec) in
centered-crop composition so subjects sit near the middle of the frame.

Output: website/public/art/founders/marc-louis-backtoback-press.jpg
"""
from pathlib import Path
from PIL import Image

SRC_DIR = Path("website/public/art/founders")
SRC = SRC_DIR / "_DSC9910.jpg"  # back-to-back stool shot

img = Image.open(SRC).convert("RGB")
w, h = img.size
print(f"Source: {w}x{h}")

# Same crop logic as center_founder_photo.py: keep left 60% of frame so
# subjects are centered in the final output (empty right-side studio bg
# gets trimmed away).
crop_right = int(w * 0.60)
cropped = img.crop((0, 0, crop_right, h))
print(f"Cropped: {cropped.size}")

# Target 3200px wide — newspaper-print quality AND stays >1 MB spec
MAX_W = 3200
if cropped.width > MAX_W:
    ratio = MAX_W / cropped.width
    cropped = cropped.resize(
        (MAX_W, int(cropped.height * ratio)), Image.Resampling.LANCZOS
    )
print(f"Resized: {cropped.size}")

out = SRC_DIR / "marc-louis-backtoback-press.jpg"
cropped.save(out, "JPEG", quality=90, optimize=True, progressive=True)
size_kb = out.stat().st_size // 1024
print(f"Wrote {out.name}  ({size_kb} KB / {size_kb / 1024:.2f} MB)")
if size_kb < 1024:
    print("WARNING: below 1 MB minimum. Consider bumping quality or size.")
elif size_kb > 8 * 1024:
    print("WARNING: above 8 MB maximum. Consider reducing quality or size.")
