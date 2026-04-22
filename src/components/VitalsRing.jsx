import React from 'react';

/**
 * VitalsRing — three colored SVG arcs around Ronki that visualize the
 * day's care state.
 *
 * Distilled from Ronki Begleiter Polish.html lines 2046–2075 + the
 * reference begleiter.jsx ArcSeg helper. Adapted to the Ronki economy
 * decision: we do NOT model hunger/energy as Tamagotchi decay bars.
 * Each arc is a binary per-action state — fed / petted / played — that
 * fills 0 → 100% when the matching care action fires and resets at the
 * day transition. Kid can only build up, never lose.
 *
 * Props:
 *   fed     — boolean, true after actions.feedCompanion()
 *   petted  — boolean, true after actions.petCompanion()
 *   played  — boolean, true after actions.playCompanion()
 *   size    — outer SVG pixel size (default 280, matches ronki-hero)
 */
export default function VitalsRing({ fed, petted, played, size = 280 }) {
  const R = 118;
  const ARC_LEN = 100; // degrees per arc, with ~20° gaps between

  const arcs = [
    { key: 'hunger',    startAngle: -150, filled: fed,    color: '#f59e0b', icon: 'restaurant' },
    { key: 'affection', startAngle: -30,  filled: petted, color: '#ec4899', icon: 'favorite'   },
    { key: 'energy',    startAngle: 90,   filled: played, color: '#10b981', icon: 'bolt'       },
  ];

  return (
    <svg
      viewBox="-135 -135 270 270"
      width={size}
      height={size}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        filter: 'drop-shadow(0 4px 10px rgba(18,67,70,0.12))',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* background arcs */}
      {arcs.map(a => (
        <ArcSeg
          key={a.key + '-bg'}
          r={R}
          start={a.startAngle}
          len={ARC_LEN}
          stroke="rgba(18,67,70,0.08)"
          width={7}
        />
      ))}
      {/* filled arcs — binary: 0% or 100% of ARC_LEN.
          .4s transition so the arc fills animatedly on tap. */}
      {arcs.map(a => (
        <ArcSeg
          key={a.key + '-fg'}
          r={R}
          start={a.startAngle}
          len={a.filled ? ARC_LEN : 0.01}
          stroke={a.color}
          width={8}
          cap="round"
        />
      ))}
      {/* icon badges at each arc midpoint */}
      {arcs.map(a => {
        const midAngle = a.startAngle + ARC_LEN / 2;
        const rad = (midAngle * Math.PI) / 180;
        const x = (R + 22) * Math.cos(rad);
        const y = (R + 22) * Math.sin(rad);
        return (
          <g key={a.key + '-badge'} transform={`translate(${x}, ${y})`}>
            <circle r={16} fill="#fff" stroke={a.color} strokeWidth={2} />
            <foreignObject x={-12} y={-12} width={24} height={24}>
              <div style={{ display: 'grid', placeItems: 'center', width: 24, height: 24 }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 16,
                    color: a.color,
                    fontVariationSettings: "'FILL' 1, 'wght' 600",
                    opacity: a.filled ? 1 : 0.75,
                    transition: 'opacity .4s ease',
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
      style={{ transition: 'all .4s ease' }}
    />
  );
}
