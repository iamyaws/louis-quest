// Cave style variants — kid-pickable wallpaper + floor for the
// painterly cave (RoomHub). Marc 25 Apr 2026: "louis really liked the
// garden and to give it his personal touch I would like to allow him
// the same for ronki's room … colors of the room, the furniture, etc."
//
// Approach A (free, no HP economy): kid taps a swatch in the cave's
// "Einrichten" sheet and the change applies instantly. Persists in
// state.caveStyle so it survives reloads. The defaults keep the
// existing warm-amber sandstone look so existing users see no change
// until they choose to personalise.
//
// Each wallpaper entry feeds three layered gradients in RoomHub:
//  · `bg`          — the main cave radial (covers the whole stage)
//  · `mouthShadow` — the upper inset that "pulls" the eye into the cave
//  · `inset`       — the inner shadow on the cave's outer frame
//
// Each floor entry feeds the two-tier mat at the bottom of the cave:
//  · `outer` — the wider, lighter back curve
//  · `inner` — the narrower, deeper terracotta runner

export interface CaveWallpaper {
  id: string;
  label: string;
  bg: string;
  mouthShadow: string;
  inset: string;  // multi-line box-shadow string applied as inset
}

export interface CaveFloor {
  id: string;
  label: string;
  outer: string;
  inner: string;
  outerInset: string;  // box-shadow inset for the outer mat
  innerInset: string;  // box-shadow inset for the inner runner
}

export const WALLPAPERS: CaveWallpaper[] = [
  {
    id: 'warm-amber',
    label: 'Lagerfeuer',
    bg: 'radial-gradient(ellipse 110% 80% at 50% -10%, #fef3c7 0%, #fde68a 30%, #fbbf24 65%, #b45309 100%)',
    mouthShadow: 'radial-gradient(ellipse at 50% 0%, transparent 0%, transparent 38%, rgba(78,42,20,0.30) 100%)',
    inset:
      '0 18px 36px -14px rgba(40, 20, 8, 0.40), ' +
      'inset 0 4px 0 rgba(255,255,255,0.35), ' +
      'inset 0 -10px 28px rgba(78, 42, 20, 0.45), ' +
      'inset 0 0 0 4px rgba(180,83,9,0.18)',
  },
  {
    id: 'cool-teal',
    label: 'Wasserhöhle',
    bg: 'radial-gradient(ellipse 110% 80% at 50% -10%, #cffafe 0%, #a5f3fc 30%, #06b6d4 65%, #155e75 100%)',
    mouthShadow: 'radial-gradient(ellipse at 50% 0%, transparent 0%, transparent 38%, rgba(8,40,52,0.32) 100%)',
    inset:
      '0 18px 36px -14px rgba(8, 40, 52, 0.45), ' +
      'inset 0 4px 0 rgba(255,255,255,0.45), ' +
      'inset 0 -10px 28px rgba(8, 40, 52, 0.40), ' +
      'inset 0 0 0 4px rgba(8,40,52,0.16)',
  },
  {
    id: 'mossy-green',
    label: 'Moosnest',
    bg: 'radial-gradient(ellipse 110% 80% at 50% -10%, #ecfccb 0%, #d9f99d 30%, #84cc16 65%, #3f6212 100%)',
    mouthShadow: 'radial-gradient(ellipse at 50% 0%, transparent 0%, transparent 38%, rgba(20,40,10,0.30) 100%)',
    inset:
      '0 18px 36px -14px rgba(20, 40, 10, 0.42), ' +
      'inset 0 4px 0 rgba(255,255,255,0.35), ' +
      'inset 0 -10px 28px rgba(20, 40, 10, 0.40), ' +
      'inset 0 0 0 4px rgba(54,83,20,0.18)',
  },
  {
    id: 'dusk-purple',
    label: 'Dämmerung',
    bg: 'radial-gradient(ellipse 110% 80% at 50% -10%, #f3e8ff 0%, #d8b4fe 30%, #a855f7 65%, #581c87 100%)',
    mouthShadow: 'radial-gradient(ellipse at 50% 0%, transparent 0%, transparent 38%, rgba(50,12,80,0.32) 100%)',
    inset:
      '0 18px 36px -14px rgba(50, 12, 80, 0.46), ' +
      'inset 0 4px 0 rgba(255,255,255,0.40), ' +
      'inset 0 -10px 28px rgba(50, 12, 80, 0.38), ' +
      'inset 0 0 0 4px rgba(80,30,120,0.18)',
  },
  {
    id: 'starlit',
    label: 'Sternennacht',
    bg: 'radial-gradient(ellipse 110% 80% at 50% -10%, #e0e7ff 0%, #a5b4fc 30%, #6366f1 65%, #1e1b4b 100%)',
    mouthShadow: 'radial-gradient(ellipse at 50% 0%, transparent 0%, transparent 38%, rgba(10,8,40,0.40) 100%)',
    inset:
      '0 18px 36px -14px rgba(10, 8, 40, 0.50), ' +
      'inset 0 4px 0 rgba(255,255,255,0.30), ' +
      'inset 0 -10px 28px rgba(10, 8, 40, 0.45), ' +
      'inset 0 0 0 4px rgba(30,27,75,0.22)',
  },
  {
    id: 'autumn-rust',
    label: 'Herbsthain',
    bg: 'radial-gradient(ellipse 110% 80% at 50% -10%, #fed7aa 0%, #fdba74 30%, #ea580c 65%, #7c2d12 100%)',
    mouthShadow: 'radial-gradient(ellipse at 50% 0%, transparent 0%, transparent 38%, rgba(67,20,7,0.32) 100%)',
    inset:
      '0 18px 36px -14px rgba(67, 20, 7, 0.45), ' +
      'inset 0 4px 0 rgba(255,255,255,0.35), ' +
      'inset 0 -10px 28px rgba(67, 20, 7, 0.42), ' +
      'inset 0 0 0 4px rgba(124,45,18,0.20)',
  },
];

export const FLOORS: CaveFloor[] = [
  {
    id: 'amber',
    label: 'Sand',
    outer: 'radial-gradient(ellipse at 50% 0%, #fef3c7 0%, #fde68a 50%, #d97706 100%)',
    inner: 'radial-gradient(ellipse at 50% 0%, #fdba74 0%, #c2410c 100%)',
    outerInset: 'inset 0 -6px 14px rgba(120,53,15,0.35), inset 0 3px 0 rgba(255,255,255,0.40)',
    innerInset: 'inset 0 -4px 10px rgba(67,20,7,0.40), inset 0 2px 0 rgba(255,255,255,0.25)',
  },
  {
    id: 'mossy',
    label: 'Moos',
    outer: 'radial-gradient(ellipse at 50% 0%, #ecfccb 0%, #bef264 50%, #65a30d 100%)',
    inner: 'radial-gradient(ellipse at 50% 0%, #84cc16 0%, #3f6212 100%)',
    outerInset: 'inset 0 -6px 14px rgba(54,83,20,0.40), inset 0 3px 0 rgba(255,255,255,0.40)',
    innerInset: 'inset 0 -4px 10px rgba(20,40,10,0.45), inset 0 2px 0 rgba(255,255,255,0.20)',
  },
  {
    id: 'teal',
    label: 'Welle',
    outer: 'radial-gradient(ellipse at 50% 0%, #cffafe 0%, #67e8f9 50%, #0891b2 100%)',
    inner: 'radial-gradient(ellipse at 50% 0%, #06b6d4 0%, #155e75 100%)',
    outerInset: 'inset 0 -6px 14px rgba(8,40,52,0.40), inset 0 3px 0 rgba(255,255,255,0.45)',
    innerInset: 'inset 0 -4px 10px rgba(8,40,52,0.45), inset 0 2px 0 rgba(255,255,255,0.25)',
  },
  {
    id: 'rose',
    label: 'Rosengarten',
    outer: 'radial-gradient(ellipse at 50% 0%, #fce7f3 0%, #fbcfe8 50%, #be185d 100%)',
    inner: 'radial-gradient(ellipse at 50% 0%, #f472b6 0%, #831843 100%)',
    outerInset: 'inset 0 -6px 14px rgba(131,24,67,0.40), inset 0 3px 0 rgba(255,255,255,0.45)',
    innerInset: 'inset 0 -4px 10px rgba(80,10,40,0.45), inset 0 2px 0 rgba(255,255,255,0.25)',
  },
];

export const DEFAULT_CAVE_STYLE = { wallpaper: 'warm-amber', floor: 'amber' };

export const WALLPAPER_BY_ID: Record<string, CaveWallpaper> = Object.fromEntries(
  WALLPAPERS.map(w => [w.id, w]),
);
export const FLOOR_BY_ID: Record<string, CaveFloor> = Object.fromEntries(
  FLOORS.map(f => [f.id, f]),
);

// Safe lookup helpers — fall back to the default if the id no longer
// exists (e.g. a wallpaper got removed from a future build but the
// kid's persisted state still references it).
export function resolveWallpaper(id?: string): CaveWallpaper {
  return WALLPAPER_BY_ID[id || ''] || WALLPAPER_BY_ID[DEFAULT_CAVE_STYLE.wallpaper];
}
export function resolveFloor(id?: string): CaveFloor {
  return FLOOR_BY_ID[id || ''] || FLOOR_BY_ID[DEFAULT_CAVE_STYLE.floor];
}
