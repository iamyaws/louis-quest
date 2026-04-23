/**
 * demoGarden.js — pre-arranged demo content for the empty-state garden.
 *
 * When the kid hasn't planted anything or placed any decor yet, we show
 * these pre-arranged plants + decor + hint rings so the scene reads as
 * alive and inviting instead of empty. Positions match the Claude Design
 * v1 mockup's Frame 2 / Frame 4 so the implementation visually matches
 * the target Marc approved. Real state.garden data takes precedence as
 * soon as the kid interacts — demo content fades out.
 *
 * All positions are { x, y } in % of scene (y is from bottom).
 */

function iso(d) { return d.toISOString().slice(0, 10); }
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
}

export function makeDemoPlants() {
  return [
    // Mature oak (deep back-right, anchors the horizon)
    { id: 'demo-mature-oak',  species: 'oak',    plantedAt: daysAgo(180), position: { x: 88, y: 16 } },
    // Mid pine (middle-right, further back)
    { id: 'demo-mid-pine',    species: 'pine',   plantedAt: daysAgo(95),  position: { x: 50, y: 30 } },
    // Mid apple (left, forward)
    { id: 'demo-mid-apple',   species: 'apple',  plantedAt: daysAgo(60),  position: { x: 10, y: 24 } },
    // Young birch (right, forward-mid)
    { id: 'demo-young-birch', species: 'birch',  plantedAt: daysAgo(20),  position: { x: 78, y: 14 } },
    // Fresh sapling (front-left, closest to the viewer)
    { id: 'demo-sprout',      species: 'linden', plantedAt: daysAgo(3),   position: { x: 18, y: 6 } },
  ];
}

// Shared with GardenMode so Ronki can sit directly ON the bench (Marc
// flag 24 Apr 2026: "arrangement of Ronki on a tiny bench is amazing").
// When both positions agree, the chibi reads as seated instead of
// floating next to the bench.
export const DEMO_BENCH_POSITION = { x: 30, y: 2 };

export function makeDemoDecor() {
  return [
    // Right-side cairn of 3 stones — grounded decoration near the fire
    { id: 'demo-stone-1',  type: 'stone',    position: { x: 70, y: 6 } },
    { id: 'demo-stone-2',  type: 'stone-sm', position: { x: 80, y: 4 } },
    { id: 'demo-stone-3',  type: 'stone',    position: { x: 86, y: 8 } },
    // Left-side lantern — warm light anchor
    { id: 'demo-lantern',  type: 'lantern',  position: { x: 4,  y: 14 } },
    // Bench — Ronki sits on it (see DEMO_BENCH_POSITION + GardenMode
    // ronkiPosition). The composition "chibi on a bench" is the
    // emotional centerpiece Marc called out.
    { id: 'demo-bench',    type: 'bench',    position: DEMO_BENCH_POSITION },
  ];
}

// Hint rings marking pre-defined spots where the kid can tap to add
// something. Three spots, distributed across the scene so they read as
// "available places" rather than one specific instruction. Always shown
// in idle mode; hidden during plant/decor flows (the pendingPosition
// ghost takes over then).
export const DEMO_HINT_SPOTS = [
  { x: 58, y: 26 },  // center-middle — between fire and pine
  { x: 28, y: 10 },  // front-left — near apple/sapling
  { x: 66, y: 20 },  // right-mid — between birch and oak
];

// Ambient gold orbs that float in the sky for atmosphere. Purely
// decorative, no interaction. Matches the "magical grove" feel of
// Claude Design's Frame 4.
export const AMBIENT_ORBS = [
  { x: 22, y: 66, scale: 1.0, delay: 0 },
  { x: 78, y: 62, scale: 0.7, delay: -1 },
  { x: 50, y: 72, scale: 0.5, delay: -0.5 },
];
