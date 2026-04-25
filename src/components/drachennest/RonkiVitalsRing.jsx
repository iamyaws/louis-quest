import React from 'react';

/**
 * RonkiVitalsRing — three radial arcs around Ronki for Hunger / Liebe / Energie.
 *
 * Direct port of the Begleiter Polish design. Three arcs of ~100° each
 * with 20° gaps. Each arc has an icon badge at its midpoint. Background
 * arc shows the empty state; the foreground arc fills based on the
 * vital's value. Strokes are round-capped so partial fills don't read
 * as broken segments.
 *
 * Props:
 *   · needs — { hunger: number, liebe: number, energie: number } (0..100)
 *   · size  — outer container width/height (default 280)
 *   · radius — arc radius (default 118 — fits the 280 box with badge room)
 *
 * Renders inside a positioned wrapper; place it as a sibling/sister of
 * the chibi inside an absolute container so the ring wraps the chibi.
 */

const ARCS = [
  { key: 'hunger',  start: -150, color: '#f59e0b', icon: 'restaurant' },  // amber, top-left
  { key: 'liebe',   start: -30,  color: '#ec4899', icon: 'favorite'   },  // pink, top-right
  { key: 'energie', start: 90,   color: '#10b981', icon: 'bolt'       },  // emerald, bottom
];
const ARC_LEN = 100; // degrees per arc

function ArcSeg({ r, start, len, stroke, width, cap = 'butt' }) {
  if (len <= 0) return null;
  const end = start + len;
  const toXY = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return [r * Math.cos(rad), r * Math.sin(rad)];
  };
  const [x1, y1] = toXY(start);
  const [x2, y2] = toXY(end);
  const large = len > 180 ? 1 : 0;
  return (
    <path
      d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap={cap}
    />
  );
}

export default function RonkiVitalsRing({ needs, size = 280, radius = 118 }) {
  const safeNeeds = needs || { hunger: 70, liebe: 70, energie: 70 };
  // viewBox padding has to fit the icon badges. Each badge is a circle
  // of r=16 placed at distance (radius + 22) from center, so its outer
  // edge sits at radius + 38. Pad to radius + 42 for a small breathing
  // buffer; otherwise SVG's default overflow:hidden clips the badges
  // (Marc spotted this 25 Apr 2026 — top-left amber + right pink were
  // both shaving a chunk off the white badge circle).
  const view = radius + 42;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`-${view} -${view} ${view * 2} ${view * 2}`}
      style={{
        // Belt-and-suspenders: even with the expanded viewBox, allowing
        // overflow keeps the round-cap ends of the foreground arcs from
        // ever being shaved by the SVG box on retina rounding.
        overflow: 'visible',
        position: 'absolute',
        inset: 0,
        filter: 'drop-shadow(0 4px 10px rgba(18,67,70,.12))',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* background arcs (empty state) */}
      {ARCS.map(a => (
        <ArcSeg
          key={a.key + '-bg'}
          r={radius}
          start={a.start}
          len={ARC_LEN}
          stroke="rgba(18,67,70,.08)"
          width={7}
        />
      ))}
      {/* foreground arcs (filled to the vital's value) */}
      {ARCS.map(a => (
        <ArcSeg
          key={a.key + '-fg'}
          r={radius}
          start={a.start}
          len={ARC_LEN * (Math.max(0, Math.min(100, safeNeeds[a.key] ?? 0)) / 100)}
          stroke={a.color}
          width={8}
          cap="round"
        />
      ))}
      {/* icon badges at arc midpoints */}
      {ARCS.map(a => {
        const midAngle = a.start + ARC_LEN / 2;
        const rad = (midAngle * Math.PI) / 180;
        const cx = (radius + 22) * Math.cos(rad);
        const cy = (radius + 22) * Math.sin(rad);
        return (
          <g key={a.key + '-badge'} transform={`translate(${cx}, ${cy})`}>
            <circle r={16} fill="#fff" stroke={a.color} strokeWidth={2} />
            <foreignObject x={-12} y={-12} width={24} height={24}>
              <div style={{ display: 'grid', placeItems: 'center', width: 24, height: 24 }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 16,
                    color: a.color,
                    fontVariationSettings: "'FILL' 1, 'wght' 600",
                  }}
                >
                  {a.icon}
                </span>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
