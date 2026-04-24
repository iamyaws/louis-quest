import React, { useState } from 'react';
import { useTask } from '../../context/TaskContext';

/**
 * CareVerbs — Füttern / Streicheln / Spielen tap targets.
 *
 * Three big buttons under Ronki, each tied to a vital. Pure standing
 * actions — independent of any quest completion. The kid can top up
 * Ronki at any time, which keeps care-as-loop alive between routines.
 *
 * Each tap calls actions.careForRonki(kind) which mutates the matching
 * vital and re-renders the VitalsRing wrapping Ronki. Visual feedback:
 * a small "+N" pill flashes briefly above the button to confirm.
 */

const VERBS = [
  { kind: 'hunger',  label: 'Füttern',     icon: 'restaurant', color: '#f59e0b', amt: 20 },
  { kind: 'liebe',   label: 'Streicheln',  icon: 'favorite',   color: '#ec4899', amt: 15 },
  { kind: 'energie', label: 'Spielen',     icon: 'bolt',       color: '#10b981', amt: 25 },
];

export default function CareVerbs() {
  const { actions } = useTask();
  const [flashed, setFlashed] = useState(null);  // { kind, amt } | null

  const tap = (verb) => {
    actions.careForRonki(verb.kind);
    setFlashed({ kind: verb.kind, amt: verb.amt });
    setTimeout(() => setFlashed(null), 900);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        padding: '0 4px',
      }}
    >
      {VERBS.map(v => {
        const flashing = flashed?.kind === v.kind;
        return (
          <button
            key={v.kind}
            type="button"
            onClick={() => tap(v)}
            className="active:scale-[0.96] transition-transform"
            style={{
              padding: '14px 8px 12px',
              borderRadius: 18,
              background: '#ffffff',
              border: `1.5px solid ${v.color}40`,
              boxShadow: `0 4px 12px -4px ${v.color}33`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              position: 'relative',
              minHeight: 92,
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `${v.color}1a`,
                display: 'grid', placeItems: 'center',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,
                  color: v.color,
                  fontVariationSettings: "'FILL' 1, 'wght' 600",
                }}
              >
                {v.icon}
              </span>
            </div>
            <b style={{
              font: '700 14px/1.1 "Plus Jakarta Sans", sans-serif',
              color: '#124346',
            }}>
              {v.label}
            </b>
            {flashing && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -10,
                  right: 8,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: v.color,
                  color: '#ffffff',
                  font: '800 11px/1 "Plus Jakarta Sans", sans-serif',
                  letterSpacing: '0.06em',
                  boxShadow: `0 4px 10px -2px ${v.color}80`,
                  animation: 'cv-pop 0.9s ease-out',
                }}
              >
                +{v.amt}
              </span>
            )}
          </button>
        );
      })}
      <style>{`
        @keyframes cv-pop {
          0%   { opacity: 0; transform: translateY(6px) scale(0.85); }
          18%  { opacity: 1; transform: translateY(0) scale(1.05); }
          70%  { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
