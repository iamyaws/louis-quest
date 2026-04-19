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
  },
  {
    id: 'teal',
    name: { de: 'Türkis-Ronki', en: 'Teal Ronki' },
    // Cyan/mint — lagoon, shallow sea, morning pond.
    eggGradient: 'linear-gradient(160deg, #ccfbf1 0%, #2dd4bf 55%, #0f766e 100%)',
    glowColor: 'rgba(20,184,166,0.35)',
    borderColor: '#14b8a6',
    spritePath: 'art/companion/dragon-young.webp',
  },
  {
    id: 'rose',
    name: { de: 'Rosen-Ronki', en: 'Rose Ronki' },
    // Pink/coral — cherry blossom, warm blush.
    eggGradient: 'linear-gradient(160deg, #fecdd3 0%, #fb7185 55%, #be123c 100%)',
    glowColor: 'rgba(244,114,182,0.35)',
    borderColor: '#fb7185',
    spritePath: 'art/companion/dragon-young.webp',
  },
  {
    id: 'violet',
    name: { de: 'Veilchen-Ronki', en: 'Violet Ronki' },
    // Purple/lavender — dusk, stardust, amethyst.
    eggGradient: 'linear-gradient(160deg, #ddd6fe 0%, #8b5cf6 55%, #5b21b6 100%)',
    glowColor: 'rgba(139,92,246,0.35)',
    borderColor: '#8b5cf6',
    spritePath: 'art/companion/dragon-young.webp',
  },
  {
    id: 'forest',
    name: { de: 'Wald-Ronki', en: 'Forest Ronki' },
    // Deep green — moss, pine, grove canopy.
    eggGradient: 'linear-gradient(160deg, #bbf7d0 0%, #16a34a 55%, #14532d 100%)',
    glowColor: 'rgba(34,197,94,0.35)',
    borderColor: '#22c55e',
    spritePath: 'art/companion/dragon-young.webp',
  },
  {
    id: 'sunset',
    name: { de: 'Abendrot-Ronki', en: 'Sunset Ronki' },
    // Pink-orange blend — horizon at dusk.
    eggGradient: 'linear-gradient(160deg, #fed7aa 0%, #f472b6 50%, #c026d3 100%)',
    glowColor: 'rgba(236,72,153,0.35)',
    borderColor: '#ec4899',
    spritePath: 'art/companion/dragon-young.webp',
  },
];

export const DEFAULT_VARIANT_ID: CompanionVariantId = 'amber';

/** Resolve a variant by id; falls back to the default if missing or unknown. */
export function getVariant(id: CompanionVariantId | string | undefined | null): CompanionVariant {
  if (!id) return COMPANION_VARIANTS.find(v => v.id === DEFAULT_VARIANT_ID)!;
  const found = COMPANION_VARIANTS.find(v => v.id === id);
  return found || COMPANION_VARIANTS.find(v => v.id === DEFAULT_VARIANT_ID)!;
}
