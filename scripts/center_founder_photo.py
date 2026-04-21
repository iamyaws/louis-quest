"""
Center the back-to-back founder photo by cropping the empty right side.

Source image has subjects on the left ~1/3 of frame. Original aspect 3:2.
Cropping the right portion shifts subjects toward the center without any
AI/warping — just a tighter composition.

Output: marc-louis-backtoback-centered.webp (used in UeberMich).
"""
from pathlib import Path
from PIL import Image

SRC_DIR = Path("website/public/art/founders")
# _DSC9910 is the actual back-to-back-on-stool shot. Earlier mapping in
# process_founder_photos.py had this swapped with _DSC9815 (play/tongue shot).
SRC = SRC_DIR / "_DSC9910.jpg"

img = Image.open(SRC).convert("RGB")
w, h = img.size
print(f"Source: {w}x{h}  aspect {w/h:.3f}")

# Subjects occupy roughly the left 30-40% of the frame. To center them in
# the final crop, keep roughly from x=0 to x=60% of source width.
# That turns a 3:2 landscape into a ~3:3.3 (slightly portrait) composition,
# with subjects near the horizontal center.
#
# Calibration reasoning:
#   - Original: subjects centered around x=0.28*w
#   - Final width = 0.60 * w; final subject center = 0.28/0.60 = ~47% of final
#   - That's visually close enough to centered for a non-symmetric composition
crop_right = int(w * 0.60)
crop_left = 0
crop_top = 0
crop_bottom = h

cropped = img.crop((crop_left, crop_top, crop_right, crop_bottom))
print(f"Cropped: {cropped.size}  aspect {cropped.size[0]/cropped.size[1]:.3f}")

# Resize to web-friendly size, aspect-preserving
MAX_W = 1400
if cropped.width > MAX_W:
    ratio = MAX_W / cropped.width
    cropped = cropped.resize(
        (MAX_W, int(cropped.height * ratio)), Image.Resampling.LANCZOS
    )
print(f"Resized: {cropped.size}")

out = SRC_DIR / "marc-louis-backtoback-centered.webp"
cropped.save(out, "WEBP", quality=88, method=6)
print(f"Wrote {out.name}  ({out.stat().st_size // 1024} KB)")
