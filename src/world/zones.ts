// Sanctuary map v0 — 3 zones Louis can visit. Each zone is a scene change,
// not a separate state tree. Same companion, same care actions, different
// texture and mood.
//
// Zones unlock on companion evolution milestones (CAT_STAGES thresholds):
//   Sanctuary (default) → always unlocked
//   Meadow             → catEvo >= 3  (reaches Baby stage — earned ~Day 1)
//   Nebel-Höhle        → catEvo >= 9  (reaches Jungtier stage — ~Day 3)
//
// Art strategy for v0: reuse the existing Sanctuary background and apply a
// CSS filter per zone so each has a distinct palette. Future versions will
// commission per-zone painted scenes (see /qa report ISSUE-007 avatar note).

export type ZoneId = 'sanctuary' | 'meadow' | 'cave';

export interface ZoneUnlockState {
  unlocked: boolean;
  hint: string; // i18n key shown when locked, e.g. "zone.meadow.unlockHint"
}

export interface Zone {
  id: ZoneId;
  nameKey: string; // i18n key for display name
  flavorKey: string; // i18n key for one-line flavor text under the dragon
  emoji: string;
  /** CSS filter applied to background image to tint the scene. */
  bgFilter: string;
  /** Painted background image path (relative to BASE_URL). */
  bgImage: string;
  /** Accent color used for the active pill and zone chip. */
  accent: string;
  unlockHintKey: string;
  unlockThreshold: {
    field: 'catEvo';
    min: number;
  };
}

export const ZONES: Zone[] = [
  {
    id: 'sanctuary',
    nameKey: 'zone.sanctuary.name',
    flavorKey: 'zone.sanctuary.flavor',
    emoji: '\u2728', // ✨
    bgFilter: 'none',
    bgImage: 'art/bioms/101st-egg-center-of-the-world.webp',
    accent: '#124346',
    unlockHintKey: 'zone.sanctuary.unlockHint', // unused — always unlocked
    unlockThreshold: { field: 'catEvo', min: 0 },
  },
  {
    id: 'meadow',
    nameKey: 'zone.meadow.name',
    flavorKey: 'zone.meadow.flavor',
    emoji: '\u{1F33F}', // 🌿
    bgFilter: 'none',
    bgImage: 'art/bioms/Morgenwald_dawn-forest.webp',
    accent: '#5a8a3e',
    unlockHintKey: 'zone.meadow.unlockHint',
    unlockThreshold: { field: 'catEvo', min: 3 },
  },
  {
    id: 'cave',
    nameKey: 'zone.cave.name',
    flavorKey: 'zone.cave.flavor',
    emoji: '\u{1F32B}\uFE0F', // 🌫️
    bgFilter: 'none',
    bgImage: 'art/bioms/Sternenmeer_sea-of-stars.webp',
    accent: '#5a4a8a',
    unlockHintKey: 'zone.cave.unlockHint',
    unlockThreshold: { field: 'catEvo', min: 9 },
  },
];

export function zoneById(id: ZoneId): Zone | undefined {
  return ZONES.find(z => z.id === id);
}

export interface GameStateSlice {
  catEvo?: number;
}

export function isZoneUnlocked(zone: Zone, state: GameStateSlice): boolean {
  const val = (state?.[zone.unlockThreshold.field] as number | undefined) ?? 0;
  return val >= zone.unlockThreshold.min;
}

/** Return progress toward unlock: 0..1. 1 = unlocked. */
export function zoneUnlockProgress(zone: Zone, state: GameStateSlice): number {
  if (zone.unlockThreshold.min <= 0) return 1;
  const val = (state?.[zone.unlockThreshold.field] as number | undefined) ?? 0;
  return Math.min(1, val / zone.unlockThreshold.min);
}
