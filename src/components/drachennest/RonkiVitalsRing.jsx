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
  const view = radius + 17; // viewBox padding for icon badges
  return (
    <svg
      width={size}
      height={size}
      viewBox={`-${view} -${view} ${view * 2} ${view * 2}`}
      style={{
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
