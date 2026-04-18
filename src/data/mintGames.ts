/** MINT games — brain-play discovery for Louis via Forscher-Ecke.
 *  Kid-facing: "Forscher-Ecke" / "Knobel-Abenteuer". Internal: "MINT".
 *
 *  Each game is hosted by a Freund or a creature that introduces the challenge
 *  via FreundIntroModal on first play. Unlock prerequisites chain neatly with
 *  existing discovery triggers — no new gating mechanic needed.
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
  /** Whether this game is built + shippable. Set true incrementally across waves. */
  implemented: boolean;
}

export const MINT_GAMES: MintGame[] = [
  {
    id: 'zahlenjagd',
    name: { de: 'Zahlenjagd', en: 'Number Hunt' },
    emoji: '🎯',
    badgeId: 'badge_mint_zahlen',
    badgeLabel: { de: 'Zahlenjäger', en: 'Number Hunter' },
    hostId: 'sky_0', // Sturmflügel
    unlockCheck: (s) => (s.micropediaDiscovered || []).some(d => d.id === 'sky_0'),
    introLine: 'Ich zähle die Sterne am Himmel. Kannst du mir helfen?',
    implemented: true,
  },
  {
    id: 'muster-memory',
    name: { de: 'Muster-Memory', en: 'Pattern Memory' },
    emoji: '🔁',
    badgeId: 'badge_mint_muster',
    badgeLabel: { de: 'Muster-Meister', en: 'Pattern Master' },
    hostId: 'forest_4', // Baumbart
    unlockCheck: (s) => (s.micropediaDiscovered || []).some(d => d.id === 'forest_4'),
    introLine: 'Die Jahreszeiten folgen einem Muster. Schaust du mit mir?',
    implemented: true,
  },
  {
    id: 'wurzel-labyrinth',
    name: { de: 'Wurzel-Labyrinth', en: 'Root Maze' },
    emoji: '🗺️',
    badgeId: 'badge_mint_labyrinth',
    badgeLabel: { de: 'Labyrinth-Löser', en: 'Maze Solver' },
    hostId: 'forest_6', // Pilz-Jeti
    unlockCheck: (s) => (s.micropediaDiscovered || []).some(d => d.id === 'forest_6'),
    introLine: 'Ich kenne die versteckten Pfade. Willst du sie finden?',
    implemented: true,
  },
  {
    id: 'pilz-waage',
    name: { de: 'Pilz-Waage', en: 'Mushroom Balance' },
    emoji: '⚖️',
    badgeId: 'badge_mint_waage',
    badgeLabel: { de: 'Waagen-Weise', en: 'Balance Sage' },
    hostId: 'pilzhueter', // Pilzhüter Freund
    unlockCheck: (s) => (s.freundArcsCompleted || []).includes('freund-pilzhueter'),
    introLine: 'Komm, bring die Pilze ins Gleichgewicht.',
    implemented: true,
  },
  {
    id: 'kristall-sortierer',
    name: { de: 'Kristall-Sortierer', en: 'Crystal Sorter' },
    emoji: '🔷',
    badgeId: 'badge_mint_kristall',
    badgeLabel: { de: 'Kristall-Kenner', en: 'Crystal Expert' },
    hostId: 'forest_5', // Mr. Shroom
    unlockCheck: (s) => (s.micropediaDiscovered || []).some(d => d.id === 'forest_5'),
    introLine: 'Mein Hut ist voll Kristalle. Hilfst du mir beim Sortieren?',
    implemented: false, // Wave 2.7
  },
];

export const MINT_GAME_BY_ID: Map<string, MintGame> = new Map(MINT_GAMES.map(g => [g.id, g]));
