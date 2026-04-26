/** Spielzeug bei Ronki — small games available in the cave.
 *  Kid-facing: "Ronkis Spielzeug" / "Spiele in der Höhle".
 *
 *  Unlock model (cut #7, 25 Apr 2026): ALL games available from day
 *  one. The sequential badge-chain was a content cliff masquerading
 *  as progression — the original "graduate and disappear" behaviour
 *  meant five games eventually went away forever, which is the
 *  opposite of what a companion app wants. Now they sit as a stable
 *  rotating shelf the kid can return to whenever.
 *
 *  Each game is hosted by a Freund or creature that introduces the challenge
 *  via FreundIntroModal on first play.
 *
 *  Shipping cadence:
 *    Wave 2.5 — zahlenjagd + muster-memory (implemented:true)
 *    Wave 2.6 — wurzel-labyrinth + pilz-waage
 *    Wave 2.7 — kristall-sortierer + Forscher-Funkel creature unlock
 */

import type { TaskState } from '../context/TaskContext';

export interface MintGame {
  id: string;
  name: { de: string; en: string };
  emoji: string;
  badgeId: string;
  badgeLabel: { de: string; en: string };
  /** Host Freund's id (must match FREUND_BY_ID or a creature id that introduces the game). */
  hostId: string;
  /** Discovery prerequisite — what must be true in TaskState for the game to unlock. */
  unlockCheck: (state: Partial<TaskState>) => boolean;
  /** Ronki's intro line when the host presents the game. German, kid-friendly. */
  introLine: string;
  /**
   * Optional: narrator audio line id (served from /audio/narrator/{id}.mp3) that
   * voices the intro. When present, FreundIntroModal gates the "Los geht's!"
   * button until the audio finishes. If absent / muted / file missing, button
   * appears after a short fallback wait.
   */
  introAudioId?: string;
  /** Whether this game is built + shippable. Set true incrementally across waves. */
  implemented: boolean;
}

// All games available from day one (cut #7, 25 Apr 2026). The
// `unlockCheck` field stays on the type for shape compatibility with
// any consumer that still calls it; every entry now returns true.
export const MINT_GAMES: MintGame[] = [
  {
    id: 'zahlenjagd',
    name: { de: 'Zahlenjagd', en: 'Number Hunt' },
    emoji: '🎯',
    badgeId: 'badge_mint_zahlen',
    badgeLabel: { de: 'Zahlenjäger', en: 'Number Hunter' },
    hostId: 'sky_0',
    unlockCheck: () => true,
    introLine: 'Ich zähle die Sterne am Himmel. Kannst du mir helfen?',
    implemented: true,
  },
  {
    id: 'muster-memory',
    name: { de: 'Muster-Memory', en: 'Pattern Memory' },
    emoji: '🔁',
    badgeId: 'badge_mint_muster',
    badgeLabel: { de: 'Muster-Meister', en: 'Pattern Master' },
    hostId: 'forest_4',
    unlockCheck: () => true,
    introLine: 'Die Jahreszeiten folgen einem Muster. Schaust du mit mir?',
    implemented: true,
  },
  {
    id: 'wurzel-labyrinth',
    name: { de: 'Wurzel-Labyrinth', en: 'Root Maze' },
    emoji: '🗺️',
    badgeId: 'badge_mint_labyrinth',
    badgeLabel: { de: 'Labyrinth-Löser', en: 'Maze Solver' },
    hostId: 'forest_6',
    unlockCheck: () => true,
    introLine: 'Ich kenne die versteckten Pfade. Willst du sie finden?',
    implemented: true,
  },
  {
    id: 'pilz-waage',
    name: { de: 'Pilz-Waage', en: 'Mushroom Balance' },
    emoji: '⚖️',
    badgeId: 'badge_mint_waage',
    badgeLabel: { de: 'Waagen-Weise', en: 'Balance Sage' },
    hostId: 'pilzhueter',
    unlockCheck: () => true,
    introLine: 'Komm, bring die Pilze ins Gleichgewicht.',
    implemented: true,
  },
  {
    // Apr 2026 rework: original Kristall-Sortierer (color-sort) tested
    // boring; replaced with Kristall-Kette (drag-a-line tactile chain).
    // Same id + badge so existing saves stay valid.
    id: 'kristall-sortierer',
    name: { de: 'Kristall-Kette', en: 'Crystal Chain' },
    emoji: '💎',
    badgeId: 'badge_mint_kristall',
    badgeLabel: { de: 'Kristall-Kenner', en: 'Crystal Expert' },
    hostId: 'forest_5',
    unlockCheck: () => true,
    introLine: 'Ich hab funkelnde Kristalle gefunden! Zieh eine Linie durch gleiche Farben.',
    implemented: true,
  },
];

export const MINT_GAME_BY_ID: Map<string, MintGame> = new Map(MINT_GAMES.map(g => [g.id, g]));

/** Games currently in the sequence — unimplemented ones are skipped. */
export const MINT_SEQUENCE: MintGame[] = MINT_GAMES.filter(g => g.implemented);

/** Cut #7 (25 Apr 2026): graduation behaviour deleted. The card no
 *  longer disappears once all five badges are earned — games stay
 *  available as a stable rotating shelf. The function is kept for
 *  callers that still ask, but always returns false now. */
export function isForscherGraduated(_state: Partial<TaskState>): boolean {
  return false;
}
