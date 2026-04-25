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

// Spielen flipped from emerald to sky-blue (Marc 25 Apr 2026) so the
// verb + the matching vital arc don't collide with a green Ronki
// variant or the room's interior. Hunger amber + liebe pink stay
// because they map to food + heart and don't conflict with the chibi
// palette.
const VERBS = [
  { kind: 'hunger',  label: 'Füttern',     icon: 'restaurant', color: '#f59e0b', amt: 20 },
  { kind: 'liebe',   label: 'Streicheln',  icon: 'favorite',   color: '#ec4899', amt: 15 },
  { kind: 'energie', label: 'Spielen',     icon: 'bolt',       color: '#3b82f6', amt: 25 },
];

export default function CareVerbs() {
  const { state, actions } = useTask();
  const [flashed, setFlashed] = useState(null);  // { kind, amt } | null
  // Currency consolidation (Marc 25 Apr 2026 — "I do think it
  // needs to option to have funkelzeit and sterne, otherwise there
  // will be kids that tend to reward themselves only with screentime
  // and save their stars for that"). Care now spends Sterne (state.hp)
  // instead of the dedicated careTokens. Funkelzeit (drachenEier)
  // stays a separate spend lane for screentime, so a kid can't
  // collapse their whole reward budget into screen time at the cost
  // of caring for Ronki. Two currencies total.
  const tokens = state?.hp || 0;
  const COST_PER_TAP = 5;  // mirrors careForRonki reducer (rebalanced 25 Apr 2026)
  const vitals = state?.ronkiVitals || { hunger: 70, liebe: 70, energie: 70 };

  const tap = (verb) => {
    if (tokens < COST_PER_TAP) return;
    if ((vitals[verb.kind] || 0) >= 100) return;
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
        const vitalFull = (vitals[v.kind] || 0) >= 100;
        const noFunken = tokens < COST_PER_TAP;
        // Disabled = either out of Funken OR this vital is already at
        // the cap. Funken-empty also dims the icon and badge so the
        // kid reads "do a quest first" at a glance.
        const disabled = noFunken || vitalFull;
        return (
          <button
            key={v.kind}
            type="button"
            onClick={() => tap(v)}
            disabled={disabled}
            aria-label={
              vitalFull ? `${v.label} — voll` :
              noFunken ? `${v.label} — erst eine Aufgabe machen` :
              v.label
            }
            className="active:scale-[0.96] transition-transform"
            style={{
              padding: '14px 8px 12px',
              borderRadius: 18,
              background: disabled ? 'rgba(255,255,255,0.6)' : '#ffffff',
              border: `1.5px solid ${disabled ? 'rgba(180,83,9,0.18)' : v.color + '40'}`,
              boxShadow: disabled ? 'none' : `0 4px 12px -4px ${v.color}33`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: disabled ? 'default' : 'pointer',
              position: 'relative',
              minHeight: 92,
              opacity: disabled ? 0.55 : 1,
              transition: 'opacity 0.25s ease, background 0.25s ease',
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
