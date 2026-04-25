/** Curated 30-emoji vocabulary for the friend-code system.
 *
 *  Marc 25 Apr 2026 — friends + sign-up feature: kids pick 3
 *  emojis from this set as their unique code. Pool size = 30³ =
 *  27,000 codes (plenty for a beta + first launch). When that runs
 *  out we add a fourth slot (810k codes) without changing the UX.
 *
 *  Curation rule: each glyph must be visually unambiguous from
 *  every other glyph in the set when rendered at ~36px on a
 *  parent's phone. No ⭐/✨/🌟 collision, no 🐱/😺 dupes, no
 *  skin-tone variants. Categories grouped so the picker grid
 *  reads as a sensible visual sweep.
 */

export interface EmojiOption {
  glyph: string;
  /** Kid-friendly name in DE — what they'd say out loud picking it. */
  label: string;
}

export const EMOJI_VOCABULARY: EmojiOption[] = [
  // ── Celestial / weather (6) ──
  { glyph: '🌙', label: 'Mond' },
  { glyph: '⭐', label: 'Stern' },
  { glyph: '✨', label: 'Funkeln' },
  { glyph: '☀️', label: 'Sonne' },
  { glyph: '🌈', label: 'Regenbogen' },
  { glyph: '🔥', label: 'Feuer' },

  // ── Animals (9) ──
  { glyph: '🦊', label: 'Fuchs' },
  { glyph: '🐰', label: 'Hase' },
  { glyph: '🐻', label: 'Bär' },
  { glyph: '🦉', label: 'Eule' },
  { glyph: '🐢', label: 'Schildkröte' },
  { glyph: '🦋', label: 'Schmetterling' },
  { glyph: '🐝', label: 'Biene' },
  { glyph: '🐌', label: 'Schnecke' },
  { glyph: '🐞', label: 'Marienkäfer' },

  // ── Nature (8) ──
  { glyph: '🌳', label: 'Baum' },
  { glyph: '🌿', label: 'Farn' },
  { glyph: '🍄', label: 'Pilz' },
  { glyph: '🌷', label: 'Tulpe' },
  { glyph: '🍂', label: 'Blatt' },
  { glyph: '🌰', label: 'Eichel' },
  { glyph: '🌊', label: 'Welle' },
  { glyph: '🪨', label: 'Stein' },

  // ── Objects (7) ──
  { glyph: '💎', label: 'Kristall' },
  { glyph: '🪶', label: 'Feder' },
  { glyph: '🍪', label: 'Keks' },
  { glyph: '🎈', label: 'Ballon' },
  { glyph: '🪄', label: 'Zauberstab' },
  { glyph: '🎵', label: 'Note' },
  { glyph: '🪁', label: 'Drachen' },
];

/** Format a 3-glyph code array as a single string for display
 *  ("🌙🦊⭐"). Robust to undefined / partial codes during the
 *  pick flow. */
export function formatEmojiCode(code?: string[] | null): string {
  if (!Array.isArray(code)) return '';
  return code.filter(Boolean).slice(0, 3).join('');
}

/** Compare two codes for equality (order matters). */
export function codesMatch(a?: string[] | null, b?: string[] | null): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== 3 || b.length !== 3) return false;
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
