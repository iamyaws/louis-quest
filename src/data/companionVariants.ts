/** Companion colorway variants — one-pick-forever identity.
 *
 *  Louis's 6-year-old feedback: the evolution stages (egg → baby → young →
 *  majestic → legendary) felt like a progression ladder. He wanted Ronki to
 *  be one stable companion. We keep the evolution mechanic in dev mode for
 *  RPG flavor, but in public mode we replace it with a Finch-style egg-pick
 *  onboarding: pick one of six colored eggs, instant hatch, unique colorway
 *  for life.
 *
 *  Art status: all variants currently render the same placeholder sprite
 *  (dragon-young.webp). Marc is producing per-variant art next; when it
 *  lands, only `spritePath` changes — everything else is CSS.
 */

export type CompanionVariantId =
  | 'amber'
  | 'teal'
  | 'rose'
  | 'violet'
  | 'forest'
  | 'sunset';

export interface CompanionVariant {
  id: CompanionVariantId;
  /** Kid-friendly display name — German primary, English secondary. */
  name: { de: string; en: string };
  /** CSS linear-gradient used as the egg placeholder face until real art lands. */
  eggGradient: string;
  /** rgba() glow ring for the selected egg state. */
  glowColor: string;
  /** Hex border used when the egg is picked. */
  borderColor: string;
  /** Path (relative to BASE_URL) to the companion sprite. Placeholder shared
   *  across all variants right now. */
  spritePath: string;
  /** CSS chibi palette — drives MoodChibi body/belly/horn/leg colors so
   *  each variant renders as its own colorway in the CSS character. Mood
   *  skins (sad/tired overlays) apply on top; variant is the base palette.
   *  Added Apr 2026 when Marc asked for all egg colorways to render
   *  consistently in the Ronki profile. */
  chibi: ChibiPalette;
}

export interface ChibiPalette {
  /** 175deg linear-gradient for the torso shape (light → mid → dark). */
  body: string;
  /** Belly panel — single color, a lighter cream-tinted shade of the mid. */
  belly: string;
  /** Horn gradient — typically gold-ish; can tint per variant. */
  horn: string;
  /** Leg gradient — darker version of body for grounded look. */
  leg: string;
  /** Eye ink — near-black; slight per-variant tint OK for warm/cool feel. */
  eyeInk: string;
  /** Cheek blush — rgba() for subtle color bath on the cheeks. */
  cheek: string;
}

export const COMPANION_VARIANTS: CompanionVariant[] = [
  {
    id: 'amber',
    name: { de: 'Bernstein-Ronki', en: 'Amber Ronki' },
    // Warm orange/gold — campfire, sunrise, honey.
    eggGradient: 'linear-gradient(160deg, #fde68a 0%, #f59e0b 55%, #b45309 100%)',
    glowColor: 'rgba(245,158,11,0.35)',
    borderColor: '#f59e0b',
    spritePath: 'art/companion/dragon-young.webp',
    chibi: {
      body: 'linear-gradient(175deg, #fed7aa 0%, #f97316 62%, #c2410c 100%)',
      belly: '#fde0a8',
      horn: 'linear-gradient(180deg, #fde68a, #f59e0b)',
      leg: 'linear-gradient(180deg, #f97316, #9a3412)',
      eyeInk: '#1a0e08',
      cheek: 'rgba(255,105,105,0.45)',
    },
  },
  {
    id: 'teal',
    name: { de: 'Türkis-Ronki', en: 'Teal Ronki' },
    // Cyan/mint — lagoon, shallow sea, morning pond.
    eggGradient: 'linear-gradient(160deg, #ccfbf1 0%, #2dd4bf 55%, #0f766e 100%)',
    glowColor: 'rgba(20,184,166,0.35)',
    borderColor: '#14b8a6',
    spritePath: 'art/companion/dragon-young.webp',
    chibi: {
      body: 'linear-gradient(175deg, #99f6e4 0%, #14b8a6 62%, #0f766e 100%)',
      belly: '#ccfbf1',
      horn: 'linear-gradient(180deg, #5eead4, #14b8a6)',
      leg: 'linear-gradient(180deg, #14b8a6, #134e4a)',
      eyeInk: '#0a2025',
      cheek: 'rgba(253,164,175,0.5)',
    },
  },
  {
    id: 'rose',
    name: { de: 'Rosen-Ronki', en: 'Rose Ronki' },
    // Pink/coral — cherry blossom, warm blush.
    eggGradient: 'linear-gradient(160deg, #fecdd3 0%, #fb7185 55%, #be123c 100%)',
    glowColor: 'rgba(244,114,182,0.35)',
    borderColor: '#fb7185',
    spritePath: 'art/companion/dragon-young.webp',
    chibi: {
      body: 'linear-gradient(175deg, #fecdd3 0%, #fb7185 62%, #be123c 100%)',
      belly: '#ffe4e6',
      horn: 'linear-gradient(180deg, #fda4af, #fb7185)',
      leg: 'linear-gradient(180deg, #fb7185, #881337)',
      eyeInk: '#1f0510',
      cheek: 'rgba(244,114,182,0.55)',
    },
  },
  {
    id: 'violet',
    name: { de: 'Veilchen-Ronki', en: 'Violet Ronki' },
    // Purple/lavender — dusk, stardust, amethyst.
    eggGradient: 'linear-gradient(160deg, #ddd6fe 0%, #8b5cf6 55%, #5b21b6 100%)',
    glowColor: 'rgba(139,92,246,0.35)',
    borderColor: '#8b5cf6',
    spritePath: 'art/companion/dragon-young.webp',
    chibi: {
      body: 'linear-gradient(175deg, #ddd6fe 0%, #8b5cf6 62%, #5b21b6 100%)',
      belly: '#ede9fe',
      horn: 'linear-gradient(180deg, #c4b5fd, #8b5cf6)',
      leg: 'linear-gradient(180deg, #8b5cf6, #4c1d95)',
      eyeInk: '#140828',
      cheek: 'rgba(236,72,153,0.42)',
    },
  },
  {
    id: 'forest',
    name: { de: 'Wald-Ronki', en: 'Forest Ronki' },
    // Deep green — moss, pine, grove canopy.
    eggGradient: 'linear-gradient(160deg, #bbf7d0 0%, #16a34a 55%, #14532d 100%)',
    glowColor: 'rgba(34,197,94,0.35)',
    borderColor: '#22c55e',
    spritePath: 'art/companion/dragon-young.webp',
    chibi: {
      body: 'linear-gradient(175deg, #86efac 0%, #22c55e 62%, #15803d 100%)',
      belly: '#d1fae5',
      horn: 'linear-gradient(180deg, #bbf7d0, #22c55e)',
      leg: 'linear-gradient(180deg, #22c55e, #14532d)',
      eyeInk: '#041a0a',
      cheek: 'rgba(251,146,60,0.45)',
    },
  },
  {
    id: 'sunset',
    name: { de: 'Abendrot-Ronki', en: 'Sunset Ronki' },
    // Pink-orange blend — horizon at dusk.
    eggGradient: 'linear-gradient(160deg, #fed7aa 0%, #f472b6 50%, #c026d3 100%)',
    glowColor: 'rgba(236,72,153,0.35)',
    borderColor: '#ec4899',
    spritePath: 'art/companion/dragon-young.webp',
    chibi: {
      body: 'linear-gradient(175deg, #fed7aa 0%, #f472b6 55%, #c026d3 100%)',
      belly: '#fce7f3',
      horn: 'linear-gradient(180deg, #fed7aa, #f472b6)',
      leg: 'linear-gradient(180deg, #f472b6, #9d174d)',
      eyeInk: '#2a0514',
      cheek: 'rgba(249,168,212,0.55)',
    },
  },
];

export const DEFAULT_VARIANT_ID: CompanionVariantId = 'amber';

/** Resolve a variant by id; falls back to the default if missing or unknown. */
export function getVariant(id: CompanionVariantId | string | undefined | null): CompanionVariant {
  if (!id) return COMPANION_VARIANTS.find(v => v.id === DEFAULT_VARIANT_ID)!;
  const found = COMPANION_VARIANTS.find(v => v.id === id);
  return found || COMPANION_VARIANTS.find(v => v.id === DEFAULT_VARIANT_ID)!;
}
