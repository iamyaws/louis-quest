/** MINT games — brain-play progression for Louis via Forscher-Ecke.
 *  Kid-facing: "Forscher-Ecke" / "Knobel-Abenteuer". Internal: "MINT".
 *
 *  Unlock model (Apr 2026): SEQUENTIAL, ordered easiest → hardest.
 *    - Game 1 is always available from day one.
 *    - Each subsequent game unlocks when the previous game's badge is earned.
 *    - Unimplemented games (implemented:false) are filtered out of the
 *      sequence by ForscherEcke — they don't block progression. When they
 *      ship, they slot in at their array position and the unlockCheck of the
 *      next implemented game is re-evaluated.
 *    - Once every implemented game's badge is earned, the Hub hides the
 *      Forscher-Ecke card (graduation) and the completed games appear as
 *      stables in the MiniGames section.
 *
 *  Each game is hosted by a Freund or creature that introduces the challenge
 *  via FreundIntroModal on first play.
 *
 *  Shipping cadence:
 *    Wave 2.5 — zahlenjagd + muster-memory (implemented:true)
 *    Wave 2.6 — wurzel-labyrinth + pilz-waage
 *    Wave 2.7 — kristall-sortierer + Forscher-Funkel creature unlock
 */

import type { ChapterId } from './creatures';
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

// Sequential unlock: game N requires the badge from the implemented game
// immediately before it in this array. Unimplemented games are skipped, so
// Pilz-Waage (game 4) unlocks on Wurzel-Labyrinth's badge even though
// Kristall-Sortierer (unimplemented) sits between them in spec order.
export const MINT_GAMES: MintGame[] = [
  {
    // Position 1 — always unlocked from day one. Easiest (counting).
    id: 'zahlenjagd',
    name: { de: 'Zahlenjagd', en: 'Number Hunt' },
    emoji: '🎯',
    badgeId: 'badge_mint_zahlen',
    badgeLabel: { de: 'Zahlenjäger', en: 'Number Hunter' },
    hostId: 'sky_0', // Sturmflügel
    unlockCheck: () => true,
    introLine: 'Ich zähle die Sterne am Himmel. Kannst du mir helfen?',
    implemented: true,
  },
  {
    // Position 2 — unlocks on Zahlenjagd badge. Pattern recognition.
    id: 'muster-memory',
    name: { de: 'Muster-Memory', en: 'Pattern Memory' },
    emoji: '🔁',
    badgeId: 'badge_mint_muster',
    badgeLabel: { de: 'Muster-Meister', en: 'Pattern Master' },
    hostId: 'forest_4', // Baumbart
    unlockCheck: (s) => (s.mintBadgesEarned || []).includes('badge_mint_zahlen'),
    introLine: 'Die Jahreszeiten folgen einem Muster. Schaust du mit mir?',
    implemented: true,
  },
  {
    // Position 3 — unlocks on Muster-Memory badge. Spatial / pathfinding.
    id: 'wurzel-labyrinth',
    name: { de: 'Wurzel-Labyrinth', en: 'Root Maze' },
    emoji: '🗺️',
    badgeId: 'badge_mint_labyrinth',
    badgeLabel: { de: 'Labyrinth-Löser', en: 'Maze Solver' },
    hostId: 'forest_6', // Pilz-Jeti
    unlockCheck: (s) => (s.mintBadgesEarned || []).includes('badge_mint_muster'),
    introLine: 'Ich kenne die versteckten Pfade. Willst du sie finden?',
    implemented: true,
  },
  {
    // Position 4 — unlocks on Wurzel-Labyrinth badge (Kristall-Sortierer is
    // unimplemented so skipped in sequence). Logic / balance.
    id: 'pilz-waage',
    name: { de: 'Pilz-Waage', en: 'Mushroom Balance' },
    emoji: '⚖️',
    badgeId: 'badge_mint_waage',
    badgeLabel: { de: 'Waagen-Weise', en: 'Balance Sage' },
    hostId: 'pilzhueter', // Pilzhüter Freund
    unlockCheck: (s) => (s.mintBadgesEarned || []).includes('badge_mint_labyrinth'),
    introLine: 'Komm, bring die Pilze ins Gleichgewicht.',
    implemented: true,
  },
  {
    // Position 5 — Wave 2.7. Currently filtered out of ForscherEcke until
    // implemented. When it ships, will unlock on Pilz-Waage badge.
    id: 'kristall-sortierer',
    name: { de: 'Kristall-Sortierer', en: 'Crystal Sorter' },
    emoji: '🔷',
    badgeId: 'badge_mint_kristall',
    badgeLabel: { de: 'Kristall-Kenner', en: 'Crystal Expert' },
    hostId: 'forest_5', // Mr. Shroom
    unlockCheck: (s) => (s.mintBadgesEarned || []).includes('badge_mint_waage'),
    introLine: 'Mein Hut ist voll Kristalle. Hilfst du mir beim Sortieren?',
    implemented: false, // Wave 2.7
  },
];

export const MINT_GAME_BY_ID: Map<string, MintGame> = new Map(MINT_GAMES.map(g => [g.id, g]));

/** Games currently in the sequence — unimplemented ones are skipped. */
export const MINT_SEQUENCE: MintGame[] = MINT_GAMES.filter(g => g.implemented);

/** True when every implemented game's badge has been earned — Forscher-Ecke
 *  graduates and the Hub hides its card. */
export function isForscherGraduated(state: Partial<TaskState>): boolean {
  const earned = state.mintBadgesEarned || [];
  return MINT_SEQUENCE.length > 0 && MINT_SEQUENCE.every(g => earned.includes(g.badgeId));
}
