import React, { useMemo } from 'react';
import { getVariant } from '../../data/companionVariants';

/**
 * RonkiAwayLoop — infinite parallax walk through the current biome.
 *
 * Marc 25 Apr 2026: "this view needs a rework — maybe more of an
 * infinite loop of ronki with his back just walking, jumping, going
 * on an adventure through the biome that he is in as a backdrop with
 * certain items in that biome that he can either find or that make
 * that biome unique for some character."
 *
 * Replaces the static "Ronki is gone, here's an empty campfire +
 * paw trail" placeholder with a moving scene:
 *  · Ronki anchored centre-bottom, back to camera, gentle walk-bob.
 *  · Three parallax layers behind him (mountains / treeline /
 *    ground items) sliding right-to-left at different speeds.
 *  · Biome-specific items in the foreground row — Morgenwald gets
 *    mushrooms / ferns / autumn leaves / mossy rocks.
 *  · Time-of-day tinting via the sky gradient prop (passed from
 *    Expedition so dawn/day/dusk/night reads consistently).
 *
 * Pure visual — no game logic, no taps. The Expedition surface
 * keeps its status strip + speech bubble ABOVE this scene.
 */

const BIOME_CONFIG = {
  morgenwald: {
    sky: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 35%, #d4a373 70%, #6b8e23 100%)',
    mountainColor: '#5a8f4a',
    mountainShadow: '#365314',
    treeColor: '#15803d',
    treeShadow: '#14532d',
    ground: 'linear-gradient(180deg, #6b5a3a 0%, #3a2f1a 100%)',
    items: [
      { glyph: '🍄', size: 22, y: 0 },
      { glyph: '🌿', size: 20, y: -2 },
      { glyph: '🍂', size: 18, y: 4 },
      { glyph: '🪨', size: 18, y: 2 },
      { glyph: '🍁', size: 18, y: -1 },
      { glyph: '🌱', size: 16, y: 3 },
    ],
  },
  // Reserved for future biomes — Sandküste, Hochmoor, Sterntal etc.
  // get their own item set + palette when those biomes unlock.
};

export default function RonkiAwayLoop({ biome = 'morgenwald', variant = 'forest' }) {
  const cfg = BIOME_CONFIG[biome] || BIOME_CONFIG.morgenwald;
  const variantPalette = getVariant(variant)?.chibi || {};
  // Two repeats of each item set so the scroll loops seamlessly. A
  // useMemo so the random-x offsets don't shuffle on every render
  // (would jitter visibly during the parallax animation).
  const itemRow = useMemo(() => {
    const row = [...cfg.items, ...cfg.items, ...cfg.items];
    return row.map((item, i) => ({
      ...item,
      key: i,
      // Spread items evenly across 300% (three full widths) so the
      // loop hands off without a gap.
      left: `${(i / row.length) * 300 + (i * 1.7) % 5}%`,
    }));
  }, [cfg.items]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 360,
        overflow: 'hidden',
        background: cfg.sky,
        isolation: 'isolate',
      }}
    >
      {/* Layer 1: Distant mountains — slowest parallax. */}
      <div style={{
        position: 'absolute',
        bottom: '34%',
        left: 0,
        width: '300%',
        height: '24%',
        animation: 'rwl-scroll-slow 28s linear infinite',
        pointerEvents: 'none',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 300 60" preserveAspectRatio="none">
          <path
            d={`M 0 60 L 0 30 ${
              Array.from({ length: 30 }).map((_, i) => {
                const x = i * 10;
                const peak = 18 + ((i * 7) % 14);
                return `L ${x} ${60 - peak} L ${x + 5} 30`;
              }).join(' ')
            } L 300 30 L 300 60 Z`}
            fill={cfg.mountainColor}
            opacity={0.55}
          />
        </svg>
      </div>

      {/* Layer 2: Midground treeline — medium parallax. */}
      <div style={{
        position: 'absolute',
        bottom: '24%',
        left: 0,
        width: '300%',
        height: '22%',
        animation: 'rwl-scroll-med 16s linear infinite',
        pointerEvents: 'none',
      }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <Tree key={i} cfg={cfg} left={`${(i / 18) * 300}%`} scale={0.7 + ((i * 11) % 6) / 12} />
        ))}
      </div>

      {/* Layer 3: Ground band — flat, no scroll. */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: '24%',
        background: cfg.ground,
        boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.25)',
      }} />

      {/* Layer 4: Foreground items scrolling fast across the ground. */}
      <div style={{
        position: 'absolute',
        bottom: '14%',
        left: 0,
        width: '300%',
        height: 32,
        animation: 'rwl-scroll-fast 10s linear infinite',
        pointerEvents: 'none',
      }}>
        {itemRow.map(item => (
          <span
            key={item.key}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: item.left,
              bottom: item.y,
              fontSize: item.size,
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
            }}
          >
            {item.glyph}
          </span>
        ))}
      </div>

      {/* Ronki, back-view, anchored centre-bottom. Bobs in place
          while the world scrolls past. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '18%',
          transform: 'translateX(-50%)',
          width: 90, height: 110,
          animation: 'rwl-walk 0.85s ease-in-out infinite',
          zIndex: 5,
        }}
      >
        <RonkiBack palette={variantPalette} />
      </div>

      {/* Soft heat shimmer over the ground — small upward drifting
          dots that suggest air over warm earth. */}
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${20 + i * 14}%`,
            bottom: '20%',
            width: 3, height: 3, borderRadius: '50%',
            background: 'rgba(254,243,199,0.7)',
            animation: `rwl-shimmer ${4 + i * 0.6}s ease-out infinite ${i * 0.5}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <style>{`
        @keyframes rwl-scroll-slow { from { transform: translateX(0); } to { transform: translateX(-66.67%); } }
        @keyframes rwl-scroll-med  { from { transform: translateX(0); } to { transform: translateX(-66.67%); } }
        @keyframes rwl-scroll-fast { from { transform: translateX(0); } to { transform: translateX(-66.67%); } }
        @keyframes rwl-walk {
          0%, 100% { transform: translateX(-50%) translateY(0) rotate(-1deg); }
          50%      { transform: translateX(-50%) translateY(-3px) rotate(1deg); }
        }
        @keyframes rwl-shimmer {
          0%   { opacity: 0; transform: translateY(0) scale(0.6); }
          30%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-30px) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Tree (midground parallax) ──────────────────────────────

function Tree({ cfg, left, scale }) {
  return (
    <div style={{
      position: 'absolute',
      left,
      bottom: 0,
      width: 36, height: 56,
      transform: `scale(${scale})`,
      transformOrigin: 'bottom center',
    }}>
      {/* Trunk */}
      <div style={{
        position: 'absolute', bottom: 0,
        left: '46%', width: '8%', height: '38%',
        background: '#5a3a22',
        transform: 'translateX(-50%)',
      }} />
      {/* Canopy */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '28%',
        transform: 'translateX(-50%)',
        width: 32, height: 44,
        background: `radial-gradient(ellipse at 40% 30%, ${cfg.treeColor}, ${cfg.treeShadow} 75%)`,
        borderRadius: '50% 60% 55% 45% / 40% 50% 55% 45%',
      }} />
    </div>
  );
}

// ─── Ronki, back view ──────────────────────────────────────
//
// Simple silhouette: round body in variant colour, two horns
// peeking up, small triangle wing nubs at the shoulders, a tail
// curling out one side, two tiny legs at the base. Drawn in SVG
// so it scales cleanly + variant palette pipes through.

function RonkiBack({ palette }) {
  const body = palette.body || 'linear-gradient(180deg, #86efac, #15803d)';
  const horn = palette.horn || 'linear-gradient(180deg, #fde68a, #f59e0b)';
  const leg  = palette.leg  || 'linear-gradient(180deg, #15803d, #14532d)';
  return (
    <svg viewBox="-50 -55 100 110" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        {/* Use the variant gradients via a foreignObject-free trick:
            extract the deepest stop-color and render solid for
            simplicity. The chibi palette stores CSS-gradient strings
            we can't pipe directly to SVG, so we build SVG-native
            gradients here from the same colour family. */}
        <linearGradient id="rwl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={parseGradient(body, 0)} />
          <stop offset="60%" stopColor={parseGradient(body, 1)} />
          <stop offset="100%" stopColor={parseGradient(body, 2)} />
        </linearGradient>
        <linearGradient id="rwl-leg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={parseGradient(leg, 0)} />
          <stop offset="100%" stopColor={parseGradient(leg, 1)} />
        </linearGradient>
        <linearGradient id="rwl-horn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={parseGradient(horn, 0)} />
          <stop offset="100%" stopColor={parseGradient(horn, 1)} />
        </linearGradient>
      </defs>

      {/* Tail — curls out the right side. */}
      <path
        d="M 16 14 Q 28 18 32 8 Q 26 12 20 10 Z"
        fill="url(#rwl-body)"
      />
      {/* Tail tip — gold tuft. */}
      <circle cx={32} cy={8} r={4} fill="url(#rwl-horn)" />

      {/* Body — back of Ronki, oval. */}
      <ellipse cx={0} cy={0} rx={28} ry={26} fill="url(#rwl-body)" />
      {/* Body shading — back midline. */}
      <ellipse cx={0} cy={2} rx={16} ry={20} fill="rgba(0,0,0,0.10)" />

      {/* Wing nubs — small triangles either side of the spine. */}
      <path d="M -20 -6 L -28 -16 L -14 -12 Z" fill="url(#rwl-body)" stroke="rgba(0,0,0,0.18)" strokeWidth={0.6} />
      <path d="M 20 -6 L 28 -16 L 14 -12 Z" fill="url(#rwl-body)" stroke="rgba(0,0,0,0.18)" strokeWidth={0.6} />

      {/* Horns — two peeking up from the head/back-of-skull area. */}
      <path d="M -10 -22 L -6 -34 L -2 -22 Z" fill="url(#rwl-horn)" />
      <path d="M 2 -22 L 6 -34 L 10 -22 Z" fill="url(#rwl-horn)" />

      {/* Head crown — soft dome on top of body. */}
      <ellipse cx={0} cy={-22} rx={12} ry={6} fill="url(#rwl-body)" />

      {/* Legs — two stubs at the base, alternating step via parent
          walk animation (legs rendered statically here). */}
      <ellipse cx={-10} cy={26} rx={5} ry={4} fill="url(#rwl-leg)" />
      <ellipse cx={10} cy={26} rx={5} ry={4} fill="url(#rwl-leg)" />

      {/* Backpack — small rounded square between the wings, telling
          the kid Ronki's on a trip. */}
      <rect x={-9} y={-8} width={18} height={18} rx={3} fill="#5c3e1f" />
      <rect x={-11} y={-10} width={22} height={3} rx={1} fill="#3a2212" />
      <circle cx={0} cy={1} r={2} fill="#d4a373" />
    </svg>
  );
}

// Tiny helper — pull the first colour from a CSS linear-gradient
// string. Returns a fallback hex if parsing fails.
function parseGradient(grad, idx = 0) {
  if (!grad || typeof grad !== 'string') return '#86efac';
  const matches = grad.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
  if (!matches || matches.length === 0) return '#86efac';
  return matches[Math.min(idx, matches.length - 1)];
}
