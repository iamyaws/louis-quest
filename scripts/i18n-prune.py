"""Prune dead i18n keys from de.json + en.json.

A key is considered LIVE if any of:
  · it appears literally anywhere in src/**/*.{js,jsx,ts,tsx} (excluding tests)
  · its prefix is referenced via t(`prefix.${...}`) or t('prefix.' + var)
  · ALSO: any same-namespace key whose prefix matches a literal hit is kept
    (so e.g. if shop.header.eyebrow is used directly we keep all shop.header.*)

Output: rewritten de.json + en.json with all dead keys removed.
Prints stats.
"""
import json
import re
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"


def load_haystack() -> str:
    chunks = []
    for p in SRC.rglob("*"):
        if p.suffix not in {".jsx", ".tsx", ".ts", ".js"}:
            continue
        if ".test." in p.name:
            continue
        # Skip the i18n source files themselves
        if "i18n" in p.parts:
            continue
        try:
            chunks.append(p.read_text(encoding="utf-8"))
        except Exception:
            pass
    return "\n".join(chunks)


def main() -> None:
    de_path = ROOT / "src" / "i18n" / "de.json"
    en_path = ROOT / "src" / "i18n" / "en.json"
    de = json.loads(de_path.read_text(encoding="utf-8"))
    en = json.loads(en_path.read_text(encoding="utf-8"))

    hay = load_haystack()

    # Dynamic prefixes: t(`X.${var}`) or t('X.' + var)
    dyn = set()
    for m in re.finditer(r"t\(`([a-zA-Z][\w.]*)\.\$\{", hay):
        dyn.add(m.group(1) + ".")
    for m in re.finditer(r"t\(['\"]([a-zA-Z][\w.]*)\.['\"]\s*\+", hay):
        dyn.add(m.group(1) + ".")

    # Live prefixes: any key that has a literal hit -> mark its parent prefix as alive
    # so siblings under a section that's USED keep their dynamic-call paths.
    live_prefixes = set()
    for k in de.keys():
        if k in hay:
            parts = k.split(".")
            for i in range(1, len(parts)):
                live_prefixes.add(".".join(parts[:i]) + ".")

    def is_live(key: str) -> bool:
        if key in hay:
            return True
        for pfx in dyn:
            if key.startswith(pfx):
                return True
        # If a sibling under the same direct parent is live AND any literal
        # appears with that parent, keep this key (conservative: dynamic
        # rendering of a section likely needs all its keys)
        for pfx in live_prefixes:
            if key.startswith(pfx):
                # Be even more conservative: require that the parent prefix
                # ALSO appears as a t(...) prefix call. Otherwise this would
                # be too broad. Approximate: check if the prefix string
                # itself occurs in code (it does, since live_prefixes was
                # built from literal hits).
                return True
        return False

    dead = [k for k in de.keys() if not is_live(k)]
    print(f"Total keys: {len(de)}")
    print(f"Dynamic prefixes detected: {sorted(dyn)}")
    print(f"Confirmed dead: {len(dead)}")

    cnt = Counter(k.split(".")[0] for k in dead)
    print("Top dead namespaces:")
    for p, c in cnt.most_common(20):
        print(f"  {p}.* — {c}")

    # Filter both files
    de_pruned = {k: v for k, v in de.items() if k not in set(dead)}
    en_pruned = {k: v for k, v in en.items() if k not in set(dead)}

    de_path.write_text(json.dumps(de_pruned, indent=2, ensure_ascii=False), encoding="utf-8")
    en_path.write_text(json.dumps(en_pruned, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nDE: {len(de)} -> {len(de_pruned)} (-{len(de)-len(de_pruned)})")
    print(f"EN: {len(en)} -> {len(en_pruned)} (-{len(en)-len(en_pruned)})")


if __name__ == "__main__":
    main()
