"""Find orphan audio files in public/audio/.

A file is considered LIVE if its basename (without .mp3) appears
literally anywhere in src/**/*.{js,jsx,ts,tsx} OR is generated
dynamically via {de_,en_}<basename> prefix patterns.

Conservative: prints the orphan list, does NOT delete (commit-friendly).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
AUDIO = ROOT / "public" / "audio"


def load_haystack() -> str:
    chunks = []
    for p in SRC.rglob("*"):
        if p.suffix not in {".jsx", ".tsx", ".ts", ".js"}:
            continue
        if ".test." in p.name:
            continue
        try:
            chunks.append(p.read_text(encoding="utf-8"))
        except Exception:
            pass
    return "\n".join(chunks)


def main() -> None:
    hay = load_haystack()
    orphans = []
    live = []
    total_bytes = 0

    for p in AUDIO.rglob("*.mp3"):
        rel = p.relative_to(ROOT).as_posix()
        base = p.stem
        # Strip de_/en_ prefix for the wider match (engine plays via
        # playLocalized which prepends lang prefix at runtime)
        unprefixed = re.sub(r"^(de_|en_)", "", base)
        # Live if basename OR unprefixed appears in code
        if base in hay or unprefixed in hay:
            live.append(rel)
        else:
            orphans.append((rel, p.stat().st_size))
            total_bytes += p.stat().st_size

    print(f"Total mp3s scanned: {len(orphans) + len(live)}")
    print(f"  Live: {len(live)}")
    print(f"  Orphan: {len(orphans)}  ({total_bytes / (1024*1024):.2f} MB)")
    print()

    # Group orphans by top folder for readability
    from collections import defaultdict
    by_folder = defaultdict(list)
    for rel, sz in orphans:
        # public/audio/X/Y.mp3 → group by X
        parts = Path(rel).parts
        # parts: ('public', 'audio', folder, ..., file)
        folder = "/".join(parts[2:-1]) or "(root)"
        by_folder[folder].append((rel, sz))

    print("Orphans by folder:")
    for folder, items in sorted(by_folder.items()):
        total = sum(s for _, s in items)
        print(f"  {folder}/  — {len(items)} files, {total/1024:.0f} KB")
        for rel, _ in sorted(items)[:5]:
            print(f"    {Path(rel).name}")
        if len(items) > 5:
            print(f"    ... and {len(items)-5} more")


if __name__ == "__main__":
    main()
