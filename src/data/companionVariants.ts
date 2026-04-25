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
  /** Distinguishing traits per variant. Three small features that
   *  set this Ronki apart visually (horn accent, cheek mark, tail
   *  tuft). Added 25 Apr 2026 when Marc asked for "ronkis with
   *  variations and unique features that we can randomize or let
   *  the kids pick when evolution happens." */
  traits: VariantTraits;
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

/** Per-variant unique features shown alongside the base chibi.
 *
 * Each variant ships with three distinguishing traits drawn from a
 * shared vocabulary. Used today by the public Compendium to show
 * "this is what makes a Bernstein-Ronki different from a Türkis-Ronki"
 * at a glance, and reserved for the evolution-pick UI Marc has in
 * mind: at hatch + at each evolution stage, the kid sees the variant
 * traits and either picks one (older kids) or gets a randomized
 * roll (younger). The state field that persists the picked traits
 * is `state.hatchTraits` — see TaskContext.
 */
export interface VariantTraits {
  hornAccent: { id: string; label: { de: string; en: string }; emoji: string };
  cheekMark: { id: string; label: { de: string; en: string }; emoji: string };
  tailTuft:  { id: string; label: { de: string; en: string }; emoji: string };
}

export const COMPANION_VARIANTS: CompanionVariant[] = [
  {
    id: 'amber',
    name: { de: 'Bernstein-Ronki', en: 'Amber Ronki' },
    // Warm orange/gold — campfire, sunrise, honey.
    eggGradient: 'linear-gradient(160deg, #fde68a 0%, #f59e0b 55%, #A83E2C 100%)',
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
    traits: {
      hornAccent: { id: 'gold-tip',  label: { de: 'Gold-Spitze',     en: 'Gold tip'      }, emoji: '✨' },
      cheekMark:  { id: 'sun-freckle', label: { de: 'Sonnen-Sommersprosse', en: 'Sun freckle' }, emoji: '☀️' },
      tailTuft:   { id: 'ember-puff', label: { de: 'Glut-Quaste',    en: 'Ember tuft'    }, emoji: '🔥' },
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
    traits: {
      hornAccent: { id: 'wave-curve', label: { de: 'Wellen-Schwung', en: 'Wave curve' }, emoji: '🌊' },
      cheekMark:  { id: 'pearl-dot',  label: { de: 'Perlen-Punkt',   en: 'Pearl dot'  }, emoji: '🫧' },
      tailTuft:   { id: 'sea-foam',   label: { de: 'Seeschaum',      en: 'Sea foam'   }, emoji: '💧' },
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
    traits: {
      hornAccent: { id: 'heart-pair', label: { de: 'Herz-Paar',     en: 'Heart pair' }, emoji: '💕' },
      cheekMark:  { id: 'blush',      label: { de: 'Erröten',       en: 'Blush'      }, emoji: '🌸' },
      tailTuft:   { id: 'petal',      label: { de: 'Blüten-Quaste', en: 'Petal tuft' }, emoji: '🌷' },
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
    traits: {
      hornAccent: { id: 'spiral',    label: { de: 'Spiral-Horn', en: 'Spiral horn' }, emoji: '🌀' },
      cheekMark:  { id: 'star-mark', label: { de: 'Stern-Mal',   en: 'Star mark'   }, emoji: '✦'  },
      tailTuft:   { id: 'mist',      label: { de: 'Nebel-Hauch', en: 'Mist tuft'   }, emoji: '✧'  },
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
    traits: {
      hornAccent: { id: 'leaf-tip',   label: { de: 'Blatt-Spitze',   en: 'Leaf tip'  }, emoji: '🌿' },
      cheekMark:  { id: 'moss-mark',  label: { de: 'Moos-Punkt',     en: 'Moss dot'  }, emoji: '🍃' },
      tailTuft:   { id: 'fern-tuft',  label: { de: 'Farn-Quaste',    en: 'Fern tuft' }, emoji: '🌱' },
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
    traits: {
      hornAccent: { id: 'flame-tip',  label: { de: 'Flammen-Spitze', en: 'Flame tip'   }, emoji: '🔥' },
      cheekMark:  { id: 'sunset',     label: { de: 'Abendrot-Streif', en: 'Sunset stripe' }, emoji: '🌅' },
      tailTuft:   { id: 'spark',      label: { de: 'Funken-Quaste',   en: 'Spark tuft' }, emoji: '✨' },
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
