import React from 'react';

/**
 * ChibiFriend — SVG-based chibi creature renderer for Ronki's Freunde.
 *
 * Marc 25 Apr 2026: "louis would rather have these chibi-style like
 * friends compared to the MJ rendered art. can we create 12 different
 * chibistyle friends (animals, creatures, lore-fitting, just go wild
 * but keep it within the world building and the bioms we have) and
 * replace the art style for the prototype."
 *
 * Design vocabulary — every creature is built from the same primitive
 * kit so the roster reads as one family:
 *
 *  · Round body in a distinctive palette (shape variation comes from
 *    overlay accessories more than from the silhouette).
 *  · Two big eyes with a single white highlight each.
 *  · A small mouth — smile, "O", or a beak.
 *  · Optional belly patch.
 *  · One signature accessory per friend: mushroom cap, leaf wreath,
 *    cloud puff, fin, shell, glowing aura, etc.
 *
 * This pairs well with the existing MoodChibi (which renders Ronki).
 * Both use the same friendly chibi proportions so the kid never sees
 * a style break inside the prototype.
 *
 * Render-only — no game logic. Pass `id` from the creatures list and
 * an optional `size` (default 96 px). Locked silhouette is requested
 * via `locked={true}` and renders a desaturated dotted-border slot.
 *
 * 12 chibi friends across the five biomes (forest / sky / water /
 * dream / hearth). IDs match the existing SEED_CREATURES so the
 * gallery + Micropedia continue to work unchanged.
 */

const FRIENDS = {
  // ── FOREST ──────────────────────────────────────────────────
  forest_0: {
    name: 'Glutfunke',
    body: '#fcd34d',  // warm amber
    bodyDeep: '#d97706',
    belly: '#fef9d7',
    eyeColor: '#3a1f12',
    accessory: 'ember',
    bg: '#fef3c7',
  },
  forest_2: {
    name: 'Knorrbart',
    body: '#a16207',  // bark brown
    bodyDeep: '#5c2a08',
    belly: '#fde68a',
    eyeColor: '#1a0e08',
    accessory: 'leafCrown',
    bg: '#fef9d7',
  },
  forest_5: {
    name: 'Mr. Shroom',
    body: '#fef3c7',  // cream stem
    bodyDeep: '#d97706',
    belly: '#fffdf5',
    eyeColor: '#3a1f12',
    accessory: 'mushroomCap',
    bg: '#fef3c7',
  },

  // ── SKY ─────────────────────────────────────────────────────
  sky_0: {
    name: 'Sturmflügel',
    body: '#bae6fd',  // pale storm blue
    bodyDeep: '#0284c7',
    belly: '#e0f2fe',
    eyeColor: '#1e3a8a',
    accessory: 'cloudPuff',
    bg: '#e0f2fe',
  },
  sky_1: {
    name: 'Larson',
    body: '#fde68a',  // canary
    bodyDeep: '#d97706',
    belly: '#fef9d7',
    eyeColor: '#3a1f12',
    accessory: 'beak',
    bg: '#fff8f2',
  },

  // ── WATER ───────────────────────────────────────────────────
  water_0: {
    name: 'Perlenfisch',
    body: '#a5f3fc',  // shimmer cyan
    bodyDeep: '#0e7490',
    belly: '#f0fdfa',
    eyeColor: '#0c4a6e',
    accessory: 'finTail',
    bg: '#cffafe',
  },
  water_1: {
    name: 'Wellentänzer',
    body: '#86efac',  // soft pond green
    bodyDeep: '#15803d',
    belly: '#fef9d7',
    eyeColor: '#1a0e08',
    accessory: 'frogMouth',
    bg: '#dcfce7',
  },
  water_2: {
    name: 'Muscheljuwel',
    body: '#fbcfe8',  // shell pink
    bodyDeep: '#be185d',
    belly: '#fdf2f8',
    eyeColor: '#3a1f12',
    accessory: 'shellBack',
    bg: '#fce7f3',
  },

  // ── DREAM ───────────────────────────────────────────────────
  dream_0: {
    name: 'Lichtflüstern',
    body: '#c4b5fd',  // dreamy lavender
    bodyDeep: '#6d28d9',
    belly: '#f5f3ff',
    eyeColor: '#1e1b4b',
    accessory: 'starHalo',
    bg: '#ede9fe',
  },
  dream_1: {
    name: 'Nachtflügel',
    body: '#312e81',  // deep indigo
    bodyDeep: '#0f0e3a',
    belly: '#a5b4fc',
    eyeColor: '#fef3c7',
    accessory: 'batWings',
    bg: '#1e1b4b',
    onDark: true,
  },

  // ── HEARTH ──────────────────────────────────────────────────
  hearth_0: {
    name: 'Goldauge',
    body: '#fbbf24',  // hearth gold
    bodyDeep: '#92400e',
    belly: '#fde68a',
    eyeColor: '#3a1f12',
    accessory: 'catEars',
    bg: '#fef3c7',
  },
  hearth_1: {
    name: 'Firecracker',
    body: '#fb923c',  // crackle orange
    bodyDeep: '#9a3412',
    belly: '#fed7aa',
    eyeColor: '#1a0e08',
    accessory: 'sparkle',
    bg: '#fed7aa',
  },
};

export const CHIBI_FRIEND_IDS = Object.keys(FRIENDS);

export function hasChibiFriend(id) {
  return id in FRIENDS;
}

export default function ChibiFriend({ id, size = 96, locked = false, withBg = true }) {
  const cfg = FRIENDS[id];

  if (locked || !cfg) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: size, height: size, borderRadius: '50%',
          border: '2px dashed rgba(120,53,15,0.30)',
          background: 'rgba(255,255,255,0.35)',
          display: 'grid', placeItems: 'center',
        }}
      >
        <span className="material-symbols-outlined" style={{
          fontSize: Math.floor(size * 0.32),
          color: 'rgba(120,53,15,0.5)',
          fontVariationSettings: "'FILL' 1",
        }}>lock</span>
      </div>
    );
  }

  const wrapStyle = withBg ? {
    width: size, height: size, borderRadius: '50%',
    background: cfg.bg,
    border: '2px solid #ffffff',
    boxShadow: '0 2px 8px rgba(120,53,15,0.18)',
    overflow: 'hidden',
    display: 'block',
  } : {
    width: size, height: size, display: 'block',
  };

  return (
    <div style={wrapStyle}>
      <svg
        width={size}
        height={size}
        viewBox="-50 -50 100 100"
        aria-label={cfg.name}
        role="img"
        style={{ display: 'block' }}
      >
        {/* Soft ground shadow (only when withBg, since the bg circle
            doesn't itself include a shadow). */}
        {withBg && (
          <ellipse cx={0} cy={36} rx={26} ry={4} fill="rgba(40,20,5,0.18)" />
        )}

        {/* Body — base oval. */}
        <BodyShape cfg={cfg} />

        {/* Belly patch. */}
        <ellipse cx={0} cy={8} rx={18} ry={13} fill={cfg.belly} opacity={0.9} />

        {/* Pre-face accessories (drawn behind eyes). */}
        {cfg.accessory === 'leafCrown' && <LeafCrown />}
        {cfg.accessory === 'cloudPuff' && <CloudPuff />}
        {cfg.accessory === 'mushroomCap' && <MushroomCap />}
        {cfg.accessory === 'starHalo' && <StarHalo />}
        {cfg.accessory === 'shellBack' && <ShellBack />}
        {cfg.accessory === 'catEars' && <CatEars cfg={cfg} />}
        {cfg.accessory === 'finTail' && <FinTail cfg={cfg} />}
        {cfg.accessory === 'batWings' && <BatWings />}

        {/* Eyes. */}
        <Eyes cfg={cfg} />

        {/* Mouth or beak. */}
        {cfg.accessory === 'beak' ? <Beak /> :
         cfg.accessory === 'frogMouth' ? <FrogMouth /> :
         <SmileMouth cfg={cfg} />}

        {/* Post-face accessories (drawn in front). */}
        {cfg.accessory === 'ember' && <Ember />}
        {cfg.accessory === 'sparkle' && <Sparkle />}
      </svg>
    </div>
  );
}

// ─── Building blocks ──────────────────────────────────────────

function BodyShape({ cfg }) {
  return (
    <>
      <ellipse cx={0} cy={4} rx={28} ry={28} fill={cfg.body} />
      <ellipse
        cx={0}
        cy={14}
        rx={28}
        ry={20}
        fill={cfg.bodyDeep}
        opacity={0.30}
        style={{ mixBlendMode: 'multiply' }}
      />
    </>
  );
}

function Eyes({ cfg }) {
  return (
    <>
      <ellipse cx={-9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
      <ellipse cx={9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
      {/* Highlights */}
      <circle cx={-7.6} cy={-3.6} r={1.2} fill="#ffffff" />
      <circle cx={10.4} cy={-3.6} r={1.2} fill="#ffffff" />
    </>
  );
}

function SmileMouth({ cfg }) {
  return (
    <path
      d="M -4 7 Q 0 11 4 7"
      stroke={cfg.eyeColor}
      strokeWidth={1.6}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Beak() {
  return (
    <path d="M -3 6 L 0 12 L 3 6 Z" fill="#d97706" stroke="#92400e" strokeWidth={0.6} />
  );
}

function FrogMouth() {
  return (
    <path d="M -8 7 Q 0 13 8 7" stroke="#1a0e08" strokeWidth={1.8} strokeLinecap="round" fill="none" />
  );
}

// ─── Accessories ─────────────────────────────────────────────

function MushroomCap() {
  return (
    <g>
      <ellipse cx={0} cy={-30} rx={32} ry={16} fill="#dc2626" />
      <ellipse cx={0} cy={-32} rx={32} ry={6} fill="#ef4444" />
      <circle cx={-12} cy={-32} r={3} fill="#fef9d7" />
      <circle cx={2} cy={-34} r={3.2} fill="#fef9d7" />
      <circle cx={14} cy={-30} r={2.6} fill="#fef9d7" />
    </g>
  );
}

function LeafCrown() {
  return (
    <g>
      <path d="M -22 -22 Q -16 -34 -8 -28" fill="#15803d" />
      <path d="M -8 -28 Q 0 -38 8 -28" fill="#22c55e" />
      <path d="M 8 -28 Q 16 -34 22 -22" fill="#15803d" />
      <path d="M 0 -32 Q 0 -36 -2 -34" stroke="#365314" strokeWidth={0.6} fill="none" />
    </g>
  );
}

function CloudPuff() {
  return (
    <g>
      <ellipse cx={-16} cy={-22} rx={10} ry={7} fill="#f0f9ff" />
      <ellipse cx={0} cy={-26} rx={12} ry={8} fill="#ffffff" />
      <ellipse cx={16} cy={-22} rx={10} ry={7} fill="#f0f9ff" />
      <ellipse cx={0} cy={-20} rx={20} ry={6} fill="#bae6fd" opacity={0.7} />
    </g>
  );
}

function StarHalo() {
  return (
    <g>
      <ellipse cx={0} cy={-26} rx={26} ry={6} fill="#fef9d7" opacity={0.5} />
      <text x={-22} y={-22} fill="#fde68a" fontSize={9}>✦</text>
      <text x={-2} y={-26} fill="#fef3c7" fontSize={11}>✦</text>
      <text x={16} y={-22} fill="#fde68a" fontSize={9}>✦</text>
    </g>
  );
}

function ShellBack() {
  return (
    <g>
      {/* Shell behind body — drawn first via z order. */}
      <path d="M -26 6 Q -22 -18 0 -22 Q 22 -18 26 6 Z" fill="#f9a8d4" />
      <path d="M -22 4 Q -18 -14 0 -18 Q 18 -14 22 4" stroke="#be185d" strokeWidth={0.8} fill="none" />
      <path d="M -16 0 Q -14 -10 0 -14 Q 14 -10 16 0" stroke="#be185d" strokeWidth={0.6} fill="none" opacity={0.6} />
    </g>
  );
}

function CatEars({ cfg }) {
  return (
    <g>
      <path d="M -22 -16 L -16 -32 L -8 -18 Z" fill={cfg.body} />
      <path d="M 22 -16 L 16 -32 L 8 -18 Z" fill={cfg.body} />
      <path d="M -19 -19 L -16 -28 L -12 -20 Z" fill="#fde68a" opacity={0.9} />
      <path d="M 19 -19 L 16 -28 L 12 -20 Z" fill="#fde68a" opacity={0.9} />
    </g>
  );
}

function FinTail({ cfg }) {
  return (
    <g>
      <path d="M -28 6 L -38 -4 L -34 12 Z" fill={cfg.bodyDeep} opacity={0.85} />
      <path d="M -28 12 L -36 18 L -30 18 Z" fill={cfg.bodyDeep} opacity={0.85} />
    </g>
  );
}

function BatWings() {
  return (
    <g>
      <path d="M -26 0 Q -38 -8 -36 8 Q -30 6 -26 8 Z" fill="#1e1b4b" stroke="#312e81" strokeWidth={0.8} />
      <path d="M 26 0 Q 38 -8 36 8 Q 30 6 26 8 Z" fill="#1e1b4b" stroke="#312e81" strokeWidth={0.8} />
    </g>
  );
}

function Ember() {
  return (
    <g>
      <circle cx={-22} cy={-24} r={2} fill="#fef3c7" opacity={0.85} />
      <circle cx={20} cy={-22} r={1.4} fill="#fef3c7" opacity={0.7} />
      <circle cx={-14} cy={-30} r={1.2} fill="#fbbf24" opacity={0.9} />
      <circle cx={14} cy={-30} r={1.2} fill="#fbbf24" opacity={0.9} />
    </g>
  );
}

function Sparkle() {
  return (
    <g>
      <text x={-26} y={-24} fontSize={10} fill="#fde68a">✦</text>
      <text x={18} y={-26} fontSize={9} fill="#fde68a">✦</text>
      <text x={-4} y={-30} fontSize={8} fill="#fed7aa">✧</text>
    </g>
  );
}
