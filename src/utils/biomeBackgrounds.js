// ══════════════════════════════════════════════════════════════════════════
// Per-tab tinted backgrounds — each view gets its own emotional key
// without breaking the painterly consistency of the app.
//
// Structure (same for every tab):
//   · Bottom layer: mood-specific gradient base (campfire amber, morning
//     sky blue, treasure gold, dusk teal, forest sage)
//   · Top layer: cream wash gradient that dominates at the fold (75%+) so
//     content cards always read clearly. The tint bleeds through at the
//     very top (behind the TopBar) and subtly at the bottom edges.
//
// Marc's brief: "maybe we need to add a few different backgrounds to give
// every tab a distinct feel. can also be a gradient". Reference: Ronki
// Aufgaben Polish v2 uses dark warm-brown base + radial depth gradients +
// cream sky overlay on top. This module generalises that pattern across
// all five tabs with a shared cream overlay + per-tab mood base.
//
// Usage (in each view component):
//   <div className="fixed inset-0 pointer-events-none"
//        style={{
//          zIndex: 0,
//          background: biomeBackground('hub'),
//          backgroundColor: '#fff8f2',
//        }}
//        aria-hidden="true" />
// ══════════════════════════════════════════════════════════════════════════

// Mood-specific base gradients per tab. Each is a radial+radial+solid
// composition so the base has subtle depth (not a flat color), matching
// the Polish v2 approach. The color choices map to a time-of-day / biome
// theme per tab:
//   hub     → campfire at dusk (warm ember amber)
//   quests  → morning ritual sky (soft blue with cloud depth)
//   shop    → afternoon treasure (honey gold)
//   journal → evening dusk (deep teal)
//   care    → forest biome (earthy sage)
const BIOME_BASES = {
  hub: `
    radial-gradient(1400px 700px at 20% -10%, #3d2818 0%, transparent 65%),
    radial-gradient(1000px 600px at 100% 100%, #1a0f05 0%, transparent 60%),
    linear-gradient(180deg, #2a1a08 0%, #1a0f05 100%)
  `,
  quests: `
    radial-gradient(1400px 700px at 20% -10%, #b7d7ea 0%, transparent 65%),
    radial-gradient(1000px 600px at 100% 100%, #6b9fc5 0%, transparent 60%),
    linear-gradient(180deg, #9cc3dc 0%, #7aa8c9 100%)
  `,
  shop: `
    radial-gradient(1400px 700px at 20% -10%, #fde68a 0%, transparent 65%),
    radial-gradient(1000px 600px at 100% 100%, #8a6b1a 0%, transparent 60%),
    linear-gradient(180deg, #a07d25 0%, #6d5a1e 100%)
  `,
  journal: `
    radial-gradient(1400px 700px at 20% -10%, #1a424a 0%, transparent 65%),
    radial-gradient(1000px 600px at 100% 100%, #0c2a2e 0%, transparent 60%),
    linear-gradient(180deg, #0f3236 0%, #092428 100%)
  `,
  care: `
    radial-gradient(1400px 700px at 20% -10%, #4a6b4a 0%, transparent 65%),
    radial-gradient(1000px 600px at 100% 100%, #1a3020 0%, transparent 60%),
    linear-gradient(180deg, #2f4a30 0%, #1f3320 100%)
  `,
};

// Alias 'ronki' → 'care' so callers can use the view-id. Both refer to
// the companion / Pflege-merged tab.
BIOME_BASES.ronki = BIOME_BASES.care;

// Shared cream wash that sits ON TOP of every biome base. Lets tint
// through at the very top (0 opacity → 0.35 at 15% → dominant by 55%).
// Content cards always land on cream (#fff8f2) at the fold.
const CREAM_OVERLAY = `
  linear-gradient(
    180deg,
    rgba(255, 248, 242, 0.00) 0%,
    rgba(255, 248, 242, 0.30) 15%,
    rgba(255, 248, 242, 0.72) 45%,
    rgba(255, 248, 242, 0.92) 70%,
    #fff8f2 100%
  )
`;

/**
 * Return the CSS `background` string for a given view tab.
 * Stacks cream overlay on top of the mood-specific base.
 *
 * @param {'hub'|'quests'|'shop'|'journal'|'care'|'ronki'} viewId
 * @returns {string} ready-to-use CSS `background` property value
 */
export function biomeBackground(viewId) {
  const base = BIOME_BASES[viewId] || BIOME_BASES.hub;
  return `${CREAM_OVERLAY}, ${base}`;
}

// Export the raw pieces in case a consumer needs to layer additional
// elements (e.g. Hub's painted scene image).
export { BIOME_BASES, CREAM_OVERLAY };
