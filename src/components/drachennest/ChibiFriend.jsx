import React from 'react';

/**
 * ChibiFriend — SVG-based chibi creature renderer for Ronki's Freunde.
 *
 * Originally 12 friends sharing one body silhouette + one signature
 * accessory each. 25 Apr 2026 expansion (Marc — "continue more unique
 * chibi designs for ronkies and friends") pushed the kit further:
 *
 *  · Body shape variants — round (default) / tall / squat / pear /
 *    blob. Lets a sage-tree-friend be tall, a cat-like be squat, a
 *    moss-blob be irregular, etc., without redrawing the whole
 *    creature.
 *  · Eye style variants — default / sparkle / sleepy / lash / wide /
 *    dots. Sparkle eyes get extra ✦ glints, sleepy eyes are closed
 *    curves, lash eyes wear long lashes for night/dream creatures,
 *    dots are tiny pinpoints for shy/distant creatures.
 *  · Mouth style variants — smile (default) / closed / smallO /
 *    yawn / beak / frog. Yawning night creatures, closed-mouth shy
 *    ones, beaked birds, frog-mouth water creatures.
 *  · Per-creature flair — cheekDots (round blush), freckles
 *    (scattered nose dots), spot (single belly mark), stripe
 *    (horizontal band). Pick one per creature so they read distinct
 *    even before the accessory.
 *
 * Plus 8 new creatures, taking the roster from 12 → 20 across the
 * five biomes (forest / sky / water / dream / hearth). IDs match
 * the existing SEED_CREATURES so the in-app gallery + Micropedia
 * keep working unchanged.
 */

const FRIENDS = {
  // ── FOREST ──────────────────────────────────────────────────
  forest_0: {
    name: 'Glutfunke',
    body: '#fcd34d', bodyDeep: '#d97706', belly: '#fef9d7', eyeColor: '#3a1f12',
    shape: 'round', eyes: 'sparkle', mouth: 'smile',
    flair: 'cheekDots',
    accessory: 'ember',
    bg: '#fef3c7',
  },
  forest_1: {
    name: 'Moostänzer',
    body: '#65a30d', bodyDeep: '#3f6212', belly: '#d9f99d', eyeColor: '#1a2e05',
    shape: 'blob', eyes: 'default', mouth: 'smile',
    flair: 'spot',
    accessory: 'leafCrown',
    bg: '#ecfccb',
  },
  forest_2: {
    name: 'Knorrbart',
    body: '#a16207', bodyDeep: '#5c2a08', belly: '#fde68a', eyeColor: '#1a0e08',
    shape: 'tall', eyes: 'sleepy', mouth: 'closed',
    flair: 'stripe',
    accessory: 'leafCrown',
    bg: '#fef9d7',
  },
  forest_3: {
    name: 'Rotling',
    body: '#dc2626', bodyDeep: '#7f1d1d', belly: '#fee2e2', eyeColor: '#1a0e08',
    shape: 'squat', eyes: 'lash', mouth: 'smallO',
    flair: 'cheekDots',
    accessory: 'mushroomCap',
    bg: '#fef2f2',
    capColor: '#fbbf24',  // yellow cap to differentiate from Mr. Shroom
  },
  forest_4: {
    name: 'Baumbart',
    body: '#854d0e', bodyDeep: '#422006', belly: '#fde68a', eyeColor: '#1a0e08',
    shape: 'tall', eyes: 'sleepy', mouth: 'closed',
    flair: 'freckles',
    accessory: 'beard',
    bg: '#fef9d7',
  },
  forest_5: {
    name: 'Mr. Shroom',
    body: '#fef3c7', bodyDeep: '#d97706', belly: '#fffdf5', eyeColor: '#3a1f12',
    shape: 'pear', eyes: 'default', mouth: 'smile',
    flair: 'cheekDots',
    accessory: 'mushroomCap',
    bg: '#fef3c7',
  },
  forest_6: {
    name: 'Pilz-Jeti',
    body: '#fef9d7', bodyDeep: '#d4a373', belly: '#ffffff', eyeColor: '#3a1f12',
    shape: 'squat', eyes: 'wide', mouth: 'smile',
    flair: 'fluff',
    accessory: 'mushroomCap',
    bg: '#fef9d7',
    capColor: '#a16207',
  },

  // ── SKY ─────────────────────────────────────────────────────
  sky_0: {
    name: 'Sturmflügel',
    body: '#bae6fd', bodyDeep: '#0284c7', belly: '#e0f2fe', eyeColor: '#1e3a8a',
    shape: 'round', eyes: 'wide', mouth: 'smallO',
    flair: 'spot',
    accessory: 'cloudPuff',
    bg: '#e0f2fe',
  },
  sky_1: {
    name: 'Larson',
    body: '#fde68a', bodyDeep: '#d97706', belly: '#fef9d7', eyeColor: '#3a1f12',
    shape: 'pear', eyes: 'sparkle', mouth: 'beak',
    flair: 'cheekDots',
    accessory: 'beak',
    bg: '#fff8f2',
  },

  // ── WATER ───────────────────────────────────────────────────
  water_0: {
    name: 'Perlenfisch',
    body: '#a5f3fc', bodyDeep: '#0e7490', belly: '#f0fdfa', eyeColor: '#0c4a6e',
    shape: 'round', eyes: 'sparkle', mouth: 'smallO',
    flair: 'spot',
    accessory: 'finTail',
    bg: '#cffafe',
  },
  water_1: {
    name: 'Wellentänzer',
    body: '#86efac', bodyDeep: '#15803d', belly: '#fef9d7', eyeColor: '#1a0e08',
    shape: 'squat', eyes: 'wide', mouth: 'frog',
    flair: 'cheekDots',
    accessory: 'frogMouth',
    bg: '#dcfce7',
  },
  water_2: {
    name: 'Muscheljuwel',
    body: '#fbcfe8', bodyDeep: '#be185d', belly: '#fdf2f8', eyeColor: '#3a1f12',
    shape: 'round', eyes: 'sparkle', mouth: 'smile',
    flair: 'cheekDots',
    accessory: 'shellBack',
    bg: '#fce7f3',
  },
  water_3: {
    name: 'Nebelkrabbe',
    body: '#cbd5e1', bodyDeep: '#475569', belly: '#f1f5f9', eyeColor: '#0f172a',
    shape: 'squat', eyes: 'dots', mouth: 'closed',
    flair: 'stripe',
    accessory: 'pincers',
    bg: '#f1f5f9',
  },

  // ── DREAM ───────────────────────────────────────────────────
  dream_0: {
    name: 'Lichtflüstern',
    body: '#c4b5fd', bodyDeep: '#6d28d9', belly: '#f5f3ff', eyeColor: '#1e1b4b',
    shape: 'round', eyes: 'sparkle', mouth: 'smile',
    flair: 'freckles',
    accessory: 'starHalo',
    bg: '#ede9fe',
  },
  dream_1: {
    name: 'Nachtflügel',
    body: '#312e81', bodyDeep: '#0f0e3a', belly: '#a5b4fc', eyeColor: '#fef3c7',
    shape: 'round', eyes: 'lash', mouth: 'smile',
    flair: 'spot',
    accessory: 'batWings',
    bg: '#1e1b4b',
    onDark: true,
  },
  dream_2: {
    name: 'Sternenschatten',
    body: '#1e1b4b', bodyDeep: '#0f0e3a', belly: '#6366f1', eyeColor: '#fef3c7',
    shape: 'tall', eyes: 'lash', mouth: 'closed',
    flair: 'starSpots',
    accessory: 'starHalo',
    bg: '#1e1b4b',
    onDark: true,
  },
  dream_3: {
    name: 'Brie',
    body: '#fef9d7', bodyDeep: '#fbbf24', belly: '#ffffff', eyeColor: '#3a1f12',
    shape: 'blob', eyes: 'sleepy', mouth: 'smallO',
    flair: 'freckles',
    accessory: 'thoughtJar',
    bg: '#fef3c7',
  },

  // ── HEARTH ──────────────────────────────────────────────────
  hearth_0: {
    name: 'Goldauge',
    body: '#fbbf24', bodyDeep: '#92400e', belly: '#fde68a', eyeColor: '#3a1f12',
    shape: 'squat', eyes: 'sleepy', mouth: 'smile',
    flair: 'stripe',
    accessory: 'catEars',
    bg: '#fef3c7',
  },
  hearth_1: {
    name: 'Firecracker',
    body: '#fb923c', bodyDeep: '#9a3412', belly: '#fed7aa', eyeColor: '#1a0e08',
    shape: 'round', eyes: 'wide', mouth: 'smallO',
    flair: 'cheekDots',
    accessory: 'sparkle',
    bg: '#fed7aa',
  },
  hearth_2: {
    name: 'Doktor Funkel',
    body: '#a78bfa', bodyDeep: '#5b21b6', belly: '#ede9fe', eyeColor: '#1e1b4b',
    shape: 'tall', eyes: 'wide', mouth: 'smile',
    flair: 'freckles',
    accessory: 'goggles',
    bg: '#ede9fe',
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
        {withBg && (
          <ellipse cx={0} cy={36} rx={26} ry={4} fill="rgba(40,20,5,0.18)" />
        )}

        {/* Body — silhouette varies by shape mode. */}
        <BodyShape cfg={cfg} />

        {/* Belly patch — adapts width to body shape. */}
        <Belly cfg={cfg} />

        {/* Pre-face accessories (drawn behind eyes). */}
        {cfg.accessory === 'leafCrown' && <LeafCrown />}
        {cfg.accessory === 'cloudPuff' && <CloudPuff />}
        {cfg.accessory === 'mushroomCap' && <MushroomCap color={cfg.capColor} />}
        {cfg.accessory === 'starHalo' && <StarHalo dark={cfg.onDark} />}
        {cfg.accessory === 'shellBack' && <ShellBack />}
        {cfg.accessory === 'catEars' && <CatEars cfg={cfg} />}
        {cfg.accessory === 'finTail' && <FinTail cfg={cfg} />}
        {cfg.accessory === 'batWings' && <BatWings />}
        {cfg.accessory === 'goggles' && <Goggles />}
        {cfg.accessory === 'beard' && <Beard />}
        {cfg.accessory === 'pincers' && <Pincers />}
        {cfg.accessory === 'thoughtJar' && <ThoughtJar />}

        {/* Per-creature flair (drawn on body, behind face). */}
        {cfg.flair === 'spot' && <SpotMarking />}
        {cfg.flair === 'stripe' && <StripeMarking />}
        {cfg.flair === 'starSpots' && <StarSpots />}
        {cfg.flair === 'fluff' && <FluffMarking />}

        {/* Eyes — variant per cfg.eyes. */}
        <Eyes cfg={cfg} />

        {/* Cheek-side flair (in front of body, behind any post-face accessory). */}
        {cfg.flair === 'cheekDots' && <CheekDots />}
        {cfg.flair === 'freckles' && <Freckles />}

        {/* Mouth or beak. */}
        <Mouth cfg={cfg} />

        {/* Post-face accessories (drawn in front). */}
        {cfg.accessory === 'ember' && <Ember />}
        {cfg.accessory === 'sparkle' && <Sparkle />}
      </svg>
    </div>
  );
}

// ─── Building blocks ──────────────────────────────────────────

const BODY_DIMS = {
  // [rx, ry, cy] — body ellipse + vertical centre.
  round: [28, 28, 4],
  tall:  [22, 32, 2],
  squat: [32, 24, 8],
  pear:  [24, 30, 6],   // narrower up top, wider bottom (rendered with two stacked ellipses)
  blob:  [29, 27, 5],
};

function BodyShape({ cfg }) {
  const [rx, ry, cy] = BODY_DIMS[cfg.shape] || BODY_DIMS.round;
  if (cfg.shape === 'pear') {
    // Pear: smaller upper ellipse + larger lower ellipse, fused.
    return (
      <>
        <ellipse cx={0} cy={cy - 6} rx={rx - 4} ry={ry - 4} fill={cfg.body} />
        <ellipse cx={0} cy={cy + 6} rx={rx} ry={ry - 6} fill={cfg.body} />
        <ellipse cx={0} cy={cy + 16} rx={rx - 2} ry={14} fill={cfg.bodyDeep} opacity={0.30} style={{ mixBlendMode: 'multiply' }} />
      </>
    );
  }
  if (cfg.shape === 'blob') {
    // Blob: irregular body via overlapping circles for an organic edge.
    return (
      <>
        <ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={cfg.body} />
        <circle cx={-22} cy={cy + 4} r={10} fill={cfg.body} />
        <circle cx={22} cy={cy - 2} r={9} fill={cfg.body} />
        <ellipse cx={0} cy={cy + 12} rx={rx - 2} ry={ry - 8} fill={cfg.bodyDeep} opacity={0.30} style={{ mixBlendMode: 'multiply' }} />
      </>
    );
  }
  return (
    <>
      <ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={cfg.body} />
      <ellipse cx={0} cy={cy + 10} rx={rx} ry={ry - 8} fill={cfg.bodyDeep} opacity={0.30} style={{ mixBlendMode: 'multiply' }} />
    </>
  );
}

function Belly({ cfg }) {
  const [rx, ry, cy] = BODY_DIMS[cfg.shape] || BODY_DIMS.round;
  return (
    <ellipse
      cx={0}
      cy={cy + 4}
      rx={Math.min(20, rx - 6)}
      ry={Math.min(15, ry - 13)}
      fill={cfg.belly}
      opacity={0.9}
    />
  );
}

function Eyes({ cfg }) {
  const style = cfg.eyes || 'default';
  if (style === 'sleepy') {
    // Two closed-curve arcs.
    return (
      <>
        <path d="M -13 -3 Q -9 -6 -5 -3" stroke={cfg.eyeColor} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <path d="M 5 -3 Q 9 -6 13 -3" stroke={cfg.eyeColor} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (style === 'dots') {
    return (
      <>
        <circle cx={-8} cy={-2} r={1.8} fill={cfg.eyeColor} />
        <circle cx={8} cy={-2} r={1.8} fill={cfg.eyeColor} />
      </>
    );
  }
  if (style === 'wide') {
    return (
      <>
        <ellipse cx={-9} cy={-2} rx={4.6} ry={5.6} fill={cfg.eyeColor} />
        <ellipse cx={9} cy={-2} rx={4.6} ry={5.6} fill={cfg.eyeColor} />
        <circle cx={-7.4} cy={-3.8} r={1.6} fill="#ffffff" />
        <circle cx={10.6} cy={-3.8} r={1.6} fill="#ffffff" />
      </>
    );
  }
  if (style === 'lash') {
    return (
      <>
        <ellipse cx={-9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
        <ellipse cx={9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
        <circle cx={-7.6} cy={-3.6} r={1.2} fill="#ffffff" />
        <circle cx={10.4} cy={-3.6} r={1.2} fill="#ffffff" />
        <path d="M -13 -6 Q -10 -8 -8 -6" stroke={cfg.eyeColor} strokeWidth={0.9} fill="none" strokeLinecap="round" />
        <path d="M 8 -6 Q 10 -8 13 -6" stroke={cfg.eyeColor} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      </>
    );
  }
  if (style === 'sparkle') {
    return (
      <>
        <ellipse cx={-9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
        <ellipse cx={9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
        <circle cx={-7.6} cy={-3.6} r={1.4} fill="#ffffff" />
        <circle cx={10.4} cy={-3.6} r={1.4} fill="#ffffff" />
        <circle cx={-10} cy={0} r={0.7} fill="#ffffff" />
        <circle cx={8} cy={0} r={0.7} fill="#ffffff" />
      </>
    );
  }
  // default
  return (
    <>
      <ellipse cx={-9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
      <ellipse cx={9} cy={-2} rx={3.6} ry={4.6} fill={cfg.eyeColor} />
      <circle cx={-7.6} cy={-3.6} r={1.2} fill="#ffffff" />
      <circle cx={10.4} cy={-3.6} r={1.2} fill="#ffffff" />
    </>
  );
}

function Mouth({ cfg }) {
  const style = cfg.mouth || 'smile';
  if (cfg.accessory === 'beak') return <Beak />;
  if (cfg.accessory === 'frogMouth' || style === 'frog') return <FrogMouth />;
  if (style === 'closed') {
    return <line x1={-3} y1={7} x2={3} y2={7} stroke={cfg.eyeColor} strokeWidth={1.4} strokeLinecap="round" />;
  }
  if (style === 'smallO') {
    return <ellipse cx={0} cy={8} rx={1.6} ry={2.0} fill={cfg.eyeColor} />;
  }
  if (style === 'yawn') {
    return <ellipse cx={0} cy={8} rx={3} ry={3.2} fill={cfg.eyeColor} />;
  }
  // smile (default)
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

// ─── Per-creature flair ──────────────────────────────────────

function CheekDots() {
  return (
    <>
      <ellipse cx={-13} cy={4} rx={3} ry={2} fill="rgba(244,114,182,0.55)" />
      <ellipse cx={13} cy={4} rx={3} ry={2} fill="rgba(244,114,182,0.55)" />
    </>
  );
}

function Freckles() {
  return (
    <>
      <circle cx={-5} cy={2} r={0.8} fill="rgba(120,53,15,0.55)" />
      <circle cx={-2} cy={3} r={0.7} fill="rgba(120,53,15,0.55)" />
      <circle cx={2} cy={2} r={0.7} fill="rgba(120,53,15,0.55)" />
      <circle cx={5} cy={3} r={0.8} fill="rgba(120,53,15,0.55)" />
    </>
  );
}

function SpotMarking() {
  return (
    <ellipse cx={-14} cy={14} rx={4} ry={3} fill="rgba(0,0,0,0.18)" />
  );
}

function StripeMarking() {
  return (
    <ellipse cx={0} cy={-4} rx={28} ry={2.5} fill="rgba(0,0,0,0.18)" />
  );
}

function StarSpots() {
  return (
    <>
      <text x={-18} y={2} fontSize={6} fill="#fef9d7" opacity={0.8}>✦</text>
      <text x={10} y={6} fontSize={5} fill="#fef9d7" opacity={0.7}>✦</text>
      <text x={-6} y={16} fontSize={5} fill="#fef9d7" opacity={0.7}>✧</text>
    </>
  );
}

function FluffMarking() {
  return (
    <>
      <circle cx={-16} cy={-2} r={4} fill="#ffffff" opacity={0.7} />
      <circle cx={18} cy={2} r={3.5} fill="#ffffff" opacity={0.7} />
      <circle cx={0} cy={-12} r={3} fill="#ffffff" opacity={0.7} />
    </>
  );
}

// ─── Accessories ─────────────────────────────────────────────

function MushroomCap({ color = '#dc2626' }) {
  return (
    <g>
      <ellipse cx={0} cy={-30} rx={32} ry={16} fill={color} />
      <ellipse cx={0} cy={-32} rx={32} ry={6} fill={color === '#dc2626' ? '#ef4444' : color === '#fbbf24' ? '#fcd34d' : '#a16207'} />
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

function StarHalo({ dark }) {
  return (
    <g>
      <ellipse cx={0} cy={-26} rx={26} ry={6} fill={dark ? '#fde68a' : '#fef9d7'} opacity={dark ? 0.4 : 0.5} />
      <text x={-22} y={-22} fill="#fde68a" fontSize={9}>✦</text>
      <text x={-2} y={-26} fill="#fef3c7" fontSize={11}>✦</text>
      <text x={16} y={-22} fill="#fde68a" fontSize={9}>✦</text>
    </g>
  );
}

function ShellBack() {
  return (
    <g>
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

function Goggles() {
  // Doktor Funkel — round goggles strapped on top of the eyes.
  return (
    <g>
      <line x1={-26} y1={-4} x2={26} y2={-4} stroke="#1e1b4b" strokeWidth={1.4} />
      <circle cx={-9} cy={-2} r={6.5} fill="rgba(167,139,250,0.45)" stroke="#1e1b4b" strokeWidth={1.6} />
      <circle cx={9} cy={-2} r={6.5} fill="rgba(167,139,250,0.45)" stroke="#1e1b4b" strokeWidth={1.6} />
      <circle cx={-9} cy={-3.5} r={1.6} fill="#ffffff" opacity={0.9} />
      <circle cx={9} cy={-3.5} r={1.6} fill="#ffffff" opacity={0.9} />
    </g>
  );
}

function Beard() {
  // Knorrbart / Baumbart — long mossy beard hanging from the chin.
  return (
    <g>
      <path d="M -14 14 Q -12 26 -8 30" stroke="#365314" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M -6 18 Q -4 30 0 32" stroke="#365314" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M 6 18 Q 4 30 0 32" stroke="#365314" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M 14 14 Q 12 26 8 30" stroke="#365314" strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={26} rx={10} ry={6} fill="#3f6212" opacity={0.6} />
    </g>
  );
}

function Pincers() {
  // Nebelkrabbe — two stubby claws either side of the body.
  return (
    <g>
      <path d="M -32 6 Q -38 0 -34 -6" stroke="#475569" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <path d="M -34 -6 L -28 -2" stroke="#475569" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M 32 6 Q 38 0 34 -6" stroke="#475569" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <path d="M 34 -6 L 28 -2" stroke="#475569" strokeWidth={3.5} strokeLinecap="round" />
    </g>
  );
}

function ThoughtJar() {
  // Brie — collects dreaming thoughts in a small jar floating above.
  return (
    <g>
      <rect x={-8} y={-32} width={16} height={14} rx={2} fill="rgba(252,211,77,0.45)" stroke="#92400e" strokeWidth={1} />
      <rect x={-10} y={-34} width={20} height={3} rx={1} fill="#92400e" />
      <circle cx={-3} cy={-26} r={1.5} fill="#fef9d7" opacity={0.9} />
      <circle cx={3} cy={-23} r={1.2} fill="#fef9d7" opacity={0.7} />
      <circle cx={0} cy={-29} r={1} fill="#fef9d7" opacity={0.6} />
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
