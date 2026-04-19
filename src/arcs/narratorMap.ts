/**
 * Drachenmutter narrator audio mapping — shared by useArc and by modals that
 * replay the narration when lore beats open.
 *
 * - intro: plays on arc accept (beat 1 reveal)
 * - outro: plays on arc complete via advance()
 * - beats: per-beat-id audio, played when that beat becomes active via advance()
 *   (used by Freund arcs where each beat has its own narration)
 */

export interface ArcNarrator {
  intro?: string;
  outro?: string;
  beats?: Record<string, string>;
}

export const ARC_NARRATOR: Record<string, ArcNarrator> = {
  'first-adventure': { intro: 'arc_first_intro', outro: 'arc_first_outro' },
  'listening-game':  { intro: 'arc_listen_intro', outro: 'arc_listen_outro' },
  'ronkis-garden':   { intro: 'arc_garden_intro', outro: 'arc_garden_outro' },
  'weather-walker':  { intro: 'arc_weather_intro', outro: 'arc_weather_outro' },
  'freund-pilzhueter': {
    intro: 'arc_pilzhueter_b1_intro',
    // No outro — the delayed callback (b4) IS the emotional finale, played by FreundCallbackCard
    beats: {
      'pil-b2-pose':    'arc_pilzhueter_b2_gift',
      'pil-b3-realife': 'arc_pilzhueter_b3_realife',
    },
  },
};

/**
 * Resolve the narrator audio lineId for a given arc/beat combination.
 *
 * For a lore beat at index 0 (the "intro" reveal) we use the arc's `intro`.
 * For inner lore beats with per-beat narration, we use `beats[beatId]`.
 * For the final callback lore beat on Freund arcs, fall back to intro if
 * no explicit entry — callers can pass null beatId for arc-level narration.
 */
export function resolveBeatNarratorLine(
  arcId: string | null | undefined,
  beatId: string | null | undefined,
  beatIndex: number,
): string | null {
  if (!arcId) return null;
  const narr = ARC_NARRATOR[arcId];
  if (!narr) return null;
  // Beat 0 is always the "intro" reveal
  if (beatIndex === 0 && narr.intro) return narr.intro;
  if (beatId && narr.beats?.[beatId]) return narr.beats[beatId];
  return null;
}
