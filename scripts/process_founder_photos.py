"""
Process founder photos:
1. Rename _DSC*.jpg -> meaningful names (marc-louis-backtoback/play/portrait)
2. Convert originals to WebP (keep background)
3. Run rembg for background-removed alt versions
4. Save both alongside each other in public/art/founders/

Usage: python scripts/process_founder_photos.py
"""
from pathlib import Path
from PIL import Image
from rembg import remove, new_session
import io

SRC_DIR = Path("website/public/art/founders")

# Map source files to target names. Based on the photos Marc sent in order:
#   1. Back-to-back on stool (profile)
#   2. Playing on bed (laughing)
#   3. Portrait, sitting, looking at camera
# The JPG filenames by creation sequence:
MAPPING = [
    # Verified by inspection: _DSC9815 is the playful tongue-out bed shot,
    # _DSC9910 is the back-to-back stool pose. Initial mapping had these
    # swapped — corrected here.
    ("_DSC9815.JPEG", "marc-louis-play"),
    ("_DSC9910.jpg", "marc-louis-backtoback"),
    ("_DSC9917.jpg", "marc-louis-portrait"),
]

MAX_WIDTH = 1600  # Downscale from ~2000px studio shots; plenty for web
WEBP_QUALITY = 85
WEBP_QUALITY_NOBG = 90  # Slightly higher for the alpha version


def process_one(src: Path, target_stem: str, session) -> None:
    print(f"-> {src.name} -> {target_stem}")

    # Load + downscale for web
    img = Image.open(src).convert("RGB")
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        new_size = (MAX_WIDTH, int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    print(f"  size: {img.size}")

    # 1) Original WebP (with studio white bg)
    webp_path = SRC_DIR / f"{target_stem}.webp"
    img.save(webp_path, "WEBP", quality=WEBP_QUALITY, method=6)
    print(f"  wrote {webp_path.name} ({webp_path.stat().st_size // 1024} KB)")

    # 2) Background-removed version with alpha channel
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    removed_bytes = remove(buf.getvalue(), session=session)
    removed = Image.open(io.BytesIO(removed_bytes))
    nobg_path = SRC_DIR / f"{target_stem}-nobg.webp"
    removed.save(nobg_path, "WEBP", quality=WEBP_QUALITY_NOBG, method=6, lossless=False)
    print(f"  wrote {nobg_path.name} ({nobg_path.stat().st_size // 1024} KB)")


def main():
    if not SRC_DIR.exists():
        print(f"Missing: {SRC_DIR}")
        return
    session = new_session()  # default u2net
    for src_name, target_stem in MAPPING:
        src = SRC_DIR / src_name
        if not src.exists():
            print(f"Skip (missing): {src_name}")
            continue
        process_one(src, target_stem, session)
    print("done.")


if __name__ == "__main__":
    main()
