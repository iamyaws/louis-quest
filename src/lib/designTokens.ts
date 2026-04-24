/**
 * designTokens — shared z-index + elevation scale.
 *
 * Both were sprinkled as magic numbers across components (agent-flagged
 * 24 Apr 2026). Centralizing here doesn't force a big-bang migration,
 * but future surfaces can import these and old surfaces can be moved
 * opportunistically. Kept in a .ts file so TS flags typos at callsites.
 */

/** Z-index registry. Lower = further back. Gaps left between tiers so
 *  we can insert new surfaces without renumbering. */
export const Z = {
  /** Scene backdrop (garden scene, legacy campfire). */
  sceneBackdrop: 1,
  /** Orbs / ambient decoration inside a scene. */
  sceneOrbs: 2,
  /** Plants, decor (same tier; DOM order decides who's in front). */
  scenePlant: 3,
  sceneDecor: 3,
  /** Fire / Lagerfeuer — slightly above plants/decor. */
  sceneFire: 4,
  /** Ronki chibi in-scene. */
  sceneRonki: 5,
  /** Hint rings pulsing on interactive spots. */
  sceneHint: 6,
  /** Ghost / drop-target preview during placement. */
  scenePending: 7,
  /** Speech bubble anchored above a plant / ronki (witness beat). */
  sceneBubble: 8,
  /** Hub: GardenPreview container sits ABOVE Hub's main paddingTop area
   *  so the preview is clickable (otherwise main catches the tap). */
  hubScene: 15,
  /** Hub topbar chrome (Marc pill, Sterne badge). Sits above hubScene. */
  hubHeader: 20,
  /** Decor mode side-rail + bottom strip overlays. */
  decorChrome: 25,
  /** First-tap tab coachmark modal. */
  tabCoachmark: 115,
  /** Tab unlock celebration toast (side-slide + confetti). */
  tabUnlockToast: 120,
  /** Garden action toasts (plantSeed / placeDecor success/failure). */
  gardenActionToast: 200,
  /** Bottom-sheet scrim (plant sheet above scene). */
  sheetScrim: 20,
  /** Bottom sheet body. */
  sheetBody: 30,
  /** Full-screen modal overlays (GardenMode). Highest — trumps everything. */
  modal: 9999,
} as const;

/** Shadow scale — three tiers for progressively-more-prominent surfaces.
 *  Use as `boxShadow: ELEVATION.card` etc. */
export const ELEVATION = {
  /** Flush card sitting on paper (HEUTE card, decor tile). */
  card: '0 4px 10px -4px rgba(18,67,70,0.10), 0 1px 3px rgba(18,67,70,0.04)',
  /** Pill or small floating element (Garten pill, action chip). */
  pill: '0 6px 14px -4px rgba(18,67,70,0.20)',
  /** Prominent action or hero surface (primary CTA, selected seed card). */
  feature: '0 12px 28px -8px rgba(18,67,70,0.30)',
  /** Full sheet lifting off the viewport. */
  sheet: '0 -20px 40px -10px rgba(0,0,0,0.35)',
} as const;

export type ZToken = keyof typeof Z;
export type ElevationToken = keyof typeof ELEVATION;
