import React, { useMemo } from 'react';
import { getVariant } from '../../data/companionVariants';
import ChibiFriend, { hasChibiFriend } from './ChibiFriend';

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
    // Per-species tree palettes — kid reads a "real" forest with mixed
    // canopies (oak / pine / birch / maple) instead of one repeating
    // shape. Each entry feeds into <Tree kind=… /> below.
    treeKinds: [
      // Broadleaf oak — full canopy, default Wald look.
      { kind: 'oak',    canopy: '#15803d', shadow: '#14532d', trunk: '#5a3a22' },
      // Pine — taller, slimmer, slightly cooler green.
      { kind: 'pine',   canopy: '#166534', shadow: '#0f3a1f', trunk: '#3f2818' },
      // Birch — pale white-grey trunk + light green canopy.
      { kind: 'birch',  canopy: '#65a30d', shadow: '#365314', trunk: '#e7e5e4' },
      // Autumn maple — warm orange-tinted canopy, scattered amongst
      // the greens for visual variety.
      { kind: 'maple',  canopy: '#ea7c1a', shadow: '#9a3412', trunk: '#5a3a22' },
    ],
    ground: 'linear-gradient(180deg, #6b5a3a 0%, #3a2f1a 100%)',
    items: [
      { glyph: '🍄', size: 22, y: 0 },
      { glyph: '🌿', size: 20, y: -2 },
      { glyph: '🍂', size: 18, y: 4 },
      { glyph: '🪨', size: 18, y: 2 },
      { glyph: '🍁', size: 18, y: -1 },
      { glyph: '🌱', size: 16, y: 3 },
      // 25 Apr 2026 polish (Marc): Morgenwald felt sparse + repetitive
      // — added 6 more glyphs so the foreground row reads as a real
      // forest floor rather than a 6-icon loop.
      { glyph: '🌾', size: 18, y: 0 },
      { glyph: '🌻', size: 18, y: -1 },
      { glyph: '🪵', size: 18, y: 3 },
      { glyph: '🐌', size: 16, y: 2 },
      { glyph: '🪺', size: 18, y: 1 },
      { glyph: '🌸', size: 16, y: -2 },
    ],
  },
  // Reserved for future biomes — Sandküste, Hochmoor, Sterntal etc.
  // get their own item set + palette when those biomes unlock.
};

// Density of the midground treeline. Bumped from 18 → 28 (Marc 25 Apr
// 2026: "for a biom called morgenwald this is very few trees and very
// repetitive"). The trees alternate through cfg.treeKinds so neighbors
// never match.
const TREE_COUNT = 28;

export default function RonkiAwayLoop({ biome = 'morgenwald', variant = 'forest', discovered = [] }) {
  const cfg = BIOME_CONFIG[biome] || BIOME_CONFIG.morgenwald;
  const variantPalette = getVariant(variant)?.chibi || {};
  // Two repeats of each item set so the scroll loops seamlessly. A
  // useMemo so the random-x offsets don't shuffle on every render
  // (would jitter visibly during the parallax animation).
  const itemRow = useMemo(() => {
    const row = [...cfg.items, ...cfg.items];
    return row.map((item, i) => ({
      ...item,
      key: i,
      // Spread items evenly across 300% (three full widths) so the
      // loop hands off without a gap.
      left: `${(i / row.length) * 300 + (i * 1.7) % 5}%`,
    }));
  }, [cfg.items]);

  // Tree row — alternate through species + vary scale, keeping the
  // assignment stable across renders so the line doesn't shimmer.
  const treeRow = useMemo(() => {
    return Array.from({ length: TREE_COUNT }).map((_, i) => ({
      key: i,
      species: cfg.treeKinds[i % cfg.treeKinds.length],
      left: `${(i / TREE_COUNT) * 300 + ((i * 13) % 7) * 0.3}%`,
      scale: 0.6 + ((i * 11) % 6) / 12,
      flip:  ((i * 7) % 2) === 0,
    }));
  }, [cfg.treeKinds]);

  // Friend cameos (Marc 25 Apr 2026: "maybe also see some of the
  // friends we already have discovered when we do a expedition like
  // this"). Pick up to 3 discovered creatures that have a chibi
  // renderer + spread them across the scroll. Stable across renders
  // so they don't pop in/out as the parallax runs.
  const cameos = useMemo(() => {
    const ids = (discovered || [])
      .map(d => (typeof d === 'string' ? d : d?.id))
      .filter(id => id && hasChibiFriend(id));
    if (ids.length === 0) return [];
    const pick = ids.slice(0, 3);
    return pick.map((id, i) => ({
      key: `${id}-${i}`,
      id,
      // Place at evenly-spaced positions across the 300% scroll
      // width with a small offset per index so they don't all line
      // up vertically.
      left: `${20 + i * 90 + (i * 7) % 11}%`,
      bob: i * 0.3,
    }));
  }, [discovered]);

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

      {/* Layer 1.5: Drifting clouds — even slower than mountains.
          Two wispy shapes at slightly different y positions help
          fill the upper sky band so the scene reads "alive" even
          before the foreground items pass. */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '6%',
        left: 0,
        width: '300%',
        height: '14%',
        animation: 'rwl-scroll-cloud 50s linear infinite',
        pointerEvents: 'none',
      }}>
        {[
          { left: '8%',  top: 4,  scale: 1.0 },
          { left: '38%', top: 16, scale: 0.7 },
          { left: '64%', top: 0,  scale: 1.1 },
          { left: '82%', top: 12, scale: 0.85 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: c.left, top: c.top,
            transform: `scale(${c.scale})`, transformOrigin: 'left top',
            opacity: 0.78,
          }}>
            <div style={{
              width: 64, height: 18, borderRadius: 999,
              background: 'rgba(255,255,255,0.85)',
              boxShadow: '14px -8px 0 -2px rgba(255,255,255,0.85), 28px 0 0 -4px rgba(255,255,255,0.85)',
              filter: 'blur(0.4px)',
            }} />
          </div>
        ))}
      </div>

      {/* Layer 2: Midground treeline — medium parallax. Mixed
          species (oak / pine / birch / maple) at varying scale
          + horizontal flip so neighbouring trees don't twin. */}
      <div style={{
        position: 'absolute',
        bottom: '24%',
        left: 0,
        width: '300%',
        height: '24%',
        animation: 'rwl-scroll-med 16s linear infinite',
        pointerEvents: 'none',
      }}>
        {treeRow.map(t => (
          <Tree key={t.key} species={t.species} left={t.left} scale={t.scale} flip={t.flip} />
        ))}
      </div>

      {/* Layer 2.5: Friend cameos — discovered creatures peek up
          from the ground line as Ronki glides over. Same scroll
          speed as the foreground items so they feel earth-bound
          rather than floating. Hidden when nothing's discovered. */}
      {cameos.length > 0 && (
        <div aria-hidden="true" style={{
          position: 'absolute',
          bottom: '22%',
          left: 0,
          width: '300%',
          height: 64,
          animation: 'rwl-scroll-fast 10s linear infinite',
          pointerEvents: 'none',
          zIndex: 3,
        }}>
          {cameos.map(c => (
            <div key={c.key} style={{
              position: 'absolute',
              left: c.left,
              bottom: 0,
              width: 56,
              height: 56,
              animation: `rwl-cameo-bob 1.8s ease-in-out infinite ${c.bob}s`,
              filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.35))',
            }}>
              <ChibiFriend id={c.id} size={56} withBg={false} />
            </div>
          ))}
        </div>
      )}

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

      {/* Ronki, flying — top-down/aerial view (Marc 25 Apr 2026:
          'his tummy should face the ground'). Anchored mid-scene
          and gently bobbing in place while the biome scrolls past
          below him. Wings spread, backpack visible on his back,
          tail trailing behind. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '36%',
          transform: 'translateX(-50%)',
          width: 140, height: 100,
          animation: 'rwl-fly 1.6s ease-in-out infinite',
          zIndex: 5,
          filter: 'drop-shadow(0 12px 8px rgba(0,0,0,0.20))',
        }}
      >
        <RonkiFlying palette={variantPalette} />
      </div>

      {/* Soft moving shadow on the ground beneath Ronki — sells
          the height of the flight. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '18%',
          transform: 'translateX(-50%)',
          width: 80, height: 16,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 75%)',
          animation: 'rwl-shadow 1.6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

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
        @keyframes rwl-scroll-slow  { from { transform: translateX(0); } to { transform: translateX(-66.67%); } }
        @keyframes rwl-scroll-med   { from { transform: translateX(0); } to { transform: translateX(-66.67%); } }
        @keyframes rwl-scroll-fast  { from { transform: translateX(0); } to { transform: translateX(-66.67%); } }
        @keyframes rwl-scroll-cloud { from { transform: translateX(0); } to { transform: translateX(-66.67%); } }
        @keyframes rwl-cameo-bob {
          /* Tiny up-down + sway — cameo creatures look "alive" rather
             than floating stickers as the parallax glides past. */
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50%      { transform: translateY(-3px) rotate(1.5deg); }
        }
        @keyframes rwl-fly {
          /* Subtle vertical bob + slight tilt — selling the glide
             without being jittery. */
          0%, 100% { transform: translateX(-50%) translateY(0) rotate(-2deg); }
          50%      { transform: translateX(-50%) translateY(-8px) rotate(2deg); }
        }
        @keyframes rwl-shadow {
          /* Shadow slightly shrinks + grows in sync with Ronki's
             altitude bob. */
          0%, 100% { transform: translateX(-50%) scale(1, 1); opacity: 0.35; }
          50%      { transform: translateX(-50%) scale(0.8, 0.7); opacity: 0.18; }
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
// `species.kind` selects the silhouette: oak (default broad),
// pine (tall triangle stack), birch (slim canopy + pale trunk),
// maple (oak shape but warm autumn palette). `flip` mirrors the
// canopy horizontally so neighbouring trees don't twin.

function Tree({ species, left, scale, flip = false }) {
  const { kind, canopy, shadow, trunk } = species;
  const palette = { canopy, shadow, trunk };

  if (kind === 'pine') {
    return (
      <div style={{
        position: 'absolute', left, bottom: 0,
        width: 32, height: 64,
        transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`.trim(),
        transformOrigin: 'bottom center',
      }}>
        {/* Trunk */}
        <div style={{
          position: 'absolute', bottom: 0, left: '46%',
          width: '8%', height: '22%',
          background: palette.trunk,
          transform: 'translateX(-50%)',
        }} />
        {/* Three-tier triangle stack */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            left: '50%',
            bottom: `${20 + i * 18}%`,
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: `${14 - i * 3}px solid transparent`,
            borderRight: `${14 - i * 3}px solid transparent`,
            borderBottom: `${22 - i * 3}px solid ${i === 2 ? palette.canopy : palette.shadow}`,
            filter: `drop-shadow(0 1px 0 ${palette.shadow})`,
          }} />
        ))}
      </div>
    );
  }

  // oak / maple / birch share the broadleaf shape but with their
  // own palette. Birch trunk is pale (white-grey).
  return (
    <div style={{
      position: 'absolute', left, bottom: 0,
      width: 38, height: 58,
      transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`.trim(),
      transformOrigin: 'bottom center',
    }}>
      {/* Trunk */}
      <div style={{
        position: 'absolute', bottom: 0,
        left: '46%', width: kind === 'birch' ? '7%' : '8%', height: '38%',
        background: kind === 'birch'
          ? `linear-gradient(180deg, ${palette.trunk} 0%, #c7c4be 100%)`
          : palette.trunk,
        transform: 'translateX(-50%)',
        boxShadow: kind === 'birch' ? 'inset -1px 0 0 rgba(0,0,0,0.15)' : undefined,
      }} />
      {/* Birch's signature dark dashes */}
      {kind === 'birch' && (
        <>
          {[0.18, 0.28, 0.36, 0.48, 0.58].map((t, i) => (
            <div key={i} style={{
              position: 'absolute', bottom: `${t * 38}%`,
              left: i % 2 === 0 ? '46%' : '50%',
              width: 3, height: 1,
              background: 'rgba(60,40,28,0.65)',
              transform: 'translateX(-50%)',
            }} />
          ))}
        </>
      )}
      {/* Canopy */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '28%',
        transform: 'translateX(-50%)',
        width: 34, height: 46,
        background: `radial-gradient(ellipse at 40% 30%, ${palette.canopy}, ${palette.shadow} 78%)`,
        borderRadius: '50% 60% 55% 45% / 40% 50% 55% 45%',
        boxShadow: 'inset 0 -4px 6px rgba(0,0,0,0.18)',
      }} />
    </div>
  );
}

// ─── Ronki, flying (top-down / aerial view) ──────────────────
//
// Marc 25 Apr 2026: 'tummy should face the ground.' So the camera
// is above Ronki, looking down on his back as he glides forward.
// Body is laid out along the X axis (head right, tail left), wings
// spread out either side of the spine, backpack centered on his
// back, four legs tucked under, head-crown nose-cone visible at
// the front. Variant palette pipes through via SVG gradients.

function RonkiFlying({ palette }) {
  const body = palette.body || 'linear-gradient(180deg, #86efac, #15803d)';
  const horn = palette.horn || 'linear-gradient(180deg, #fde68a, #f59e0b)';
  return (
    <svg viewBox="-70 -50 140 100" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="rwl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={parseGradient(body, 0)} />
          <stop offset="60%" stopColor={parseGradient(body, 1)} />
          <stop offset="100%" stopColor={parseGradient(body, 2)} />
        </linearGradient>
        <linearGradient id="rwl-horn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={parseGradient(horn, 0)} />
          <stop offset="100%" stopColor={parseGradient(horn, 1)} />
        </linearGradient>
        <radialGradient id="rwl-wing" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={parseGradient(body, 0)} />
          <stop offset="100%" stopColor={parseGradient(body, 2)} />
        </radialGradient>
      </defs>

      {/* Tail — trails behind to the LEFT, since Ronki flies right.
          Drawn first so the body covers its base. */}
      <path
        d="M -28 0 Q -52 -4 -60 4 Q -52 8 -28 6 Z"
        fill="url(#rwl-body)"
      />
      <ellipse cx={-58} cy={4} rx={6} ry={5} fill="url(#rwl-horn)" />

      {/* Wings — spread either side of the spine, flapping. The
          'rwl-wing-flap' anim oscillates rotation around the wing
          base near the body. */}
      <g style={{ transformOrigin: '0px -2px', animation: 'rwl-wing-flap 0.5s ease-in-out infinite alternate' }}>
        <path
          d="M -8 -4 Q -12 -34 14 -28 Q 6 -16 6 -6 Z"
          fill="url(#rwl-wing)"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth={0.6}
        />
        <path
          d="M -8 4 Q -12 34 14 28 Q 6 16 6 6 Z"
          fill="url(#rwl-wing)"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth={0.6}
        />
      </g>

      {/* Body — long oval along the X axis, head end (right) tapers
          toward a snout. */}
      <ellipse cx={0} cy={0} rx={32} ry={18} fill="url(#rwl-body)" />
      {/* Spine shading — darker stripe down the middle so the kid
          reads the up-down depth. */}
      <ellipse cx={0} cy={0} rx={26} ry={5} fill="rgba(0,0,0,0.18)" />

      {/* Snout / head — slightly tapered front of the body. */}
      <ellipse cx={26} cy={0} rx={12} ry={10} fill="url(#rwl-body)" />
      {/* Horns — two small bumps on the head, viewed from above
          they read as ears. */}
      <ellipse cx={20} cy={-9} rx={3} ry={4} fill="url(#rwl-horn)" />
      <ellipse cx={20} cy={9}  rx={3} ry={4} fill="url(#rwl-horn)" />

      {/* Eye dot — single eye visible from this angle, on the side
          of the head facing the camera (top of head from this POV). */}
      <circle cx={30} cy={-3} r={1.5} fill="#1a0e08" />
      <circle cx={30.4} cy={-3.4} r={0.5} fill="#ffffff" />

      {/* Four legs tucked under — small ellipses peeking out from
          the body silhouette. */}
      <ellipse cx={-14} cy={-14} rx={3} ry={5} fill="url(#rwl-body)" opacity={0.85} />
      <ellipse cx={14}  cy={-14} rx={3} ry={5} fill="url(#rwl-body)" opacity={0.85} />
      <ellipse cx={-14} cy={14}  rx={3} ry={5} fill="url(#rwl-body)" opacity={0.85} />
      <ellipse cx={14}  cy={14}  rx={3} ry={5} fill="url(#rwl-body)" opacity={0.85} />

      {/* Backpack — strapped to his back, centered on the spine,
         visible from this aerial POV. The kid reads "he's on a
         trip" from this single detail. */}
      <rect x={-10} y={-10} width={20} height={20} rx={4} fill="#5c3e1f" />
      <rect x={-12} y={-12} width={24} height={3} rx={1} fill="#3a2212" />
      <circle cx={0} cy={0} r={2.5} fill="#d4a373" />
      <circle cx={0} cy={0} r={1} fill="#5c3e1f" />
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
