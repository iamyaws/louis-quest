"""One-shot: rename FOOTBALL → Bewegung + single-tap in constants.ts."""
from pathlib import Path

p = Path("src/constants.ts")
s = p.read_text(encoding="utf-8")

old = (
    'export const FOOTBALL: Omit<Quest, \'done\' | \'streak\'> = '
    '{ id: "ft", name: "Fu\\u00DFball Training", icon: "\\u26BD", '
    'anchor: "hobby", xp: 10, minutes: 10, order: 1, target: 2 };'
)
new = (
    "// Renamed Apr 2026 from Fussball Training to Bewegung + single-tap.\n"
    "// The double-tap (target: 2) was training-session framing leftover.\n"
    "// Marc 27 Apr: 'make it universal and just say movement'. Keeps\n"
    "// FOOTBALL identifier so helpers.ts buildDay() Mon/Wed gating still\n"
    "// hits the right quest object - just no longer football-themed.\n"
    "// Icon U+1F3C3 (runner) - universal moving glyph.\n"
    'export const FOOTBALL: Omit<Quest, \'done\' | \'streak\'> = '
    '{ id: "ft", name: "Bewegung", icon: "\\u{1F3C3}", '
    'anchor: "hobby", xp: 10, minutes: 10, order: 1 };'
)

if old not in s:
    raise SystemExit("FOOTBALL line not found verbatim — file may have changed shape")
s = s.replace(old, new)
p.write_text(s, encoding="utf-8", newline="")
print("FOOTBALL renamed.")
