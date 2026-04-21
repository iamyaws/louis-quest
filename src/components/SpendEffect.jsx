import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTask } from '../context/TaskContext';

/**
 * SpendEffect — watches state.hp for decreases and spawns a short
 * sparkle burst at the currently-visible HP pill. Separate from the
 * QuestEater system (which handles the earn direction — a quest icon
 * FLYING IN to Ronki). This handles the spend direction — sparkles
 * PUFFING OUT of the Sterne counter when the kid redeems something.
 *
 * Mount once at the app level. No props. Self-contained.
 *
 * See backlog_claim_deduction_animation.md for the full spec (including
 * the "particles fly to reward card" follow-up we're deliberately
 * deferring — this scope is: tick-down + centered sparkle burst).
 */
export default function SpendEffect() {
  const { state } = useTask();
  const [bursts, setBursts] = useState([]); // { id, x, y }

  useEffect(() => {
    if (!state || typeof state.hp !== 'number') return;
    // Mounted the effect: nothing to do on first render (prev=hp=current).
    const last = spendWatchRef.last;
    spendWatchRef.last = state.hp;
    if (last === undefined) return;
    if (state.hp >= last) return;

    // Find the visible HP pill. Both Hub and TopBar render a Pearl icon
    // next to the HP number — we grep for the Pearl's container for the
    // spawn rect. Falls back to viewport center.
    const pearl = document.querySelector('[data-sterne-pill]')
      || document.querySelector('.pearl-container')
      || document.querySelector('[aria-label*="Sterne"]');
    const rect = pearl?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const id = Date.now() + Math.random();
    setBursts(b => [...b, { id, x, y }]);
    setTimeout(() => {
      setBursts(b => b.filter(burst => burst.id !== id));
    }, 900);
  }, [state?.hp]);

  if (bursts.length === 0) return null;

  return createPortal(
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
      {bursts.map(b => <Burst key={b.id} x={b.x} y={b.y} />)}
    </div>,
    document.body
  );
}

// Module-level ref so remounts don't reset the "last hp" baseline every
// render. First-ever render leaves it undefined so nothing fires on load.
const spendWatchRef = { last: undefined };

function Burst({ x, y }) {
  const particles = Array.from({ length: 6 }).map((_, i) => ({
    angle: (i / 6) * Math.PI * 2,
    delay: i * 40,
  }));
  return (
    <>
      {particles.map((p, i) => {
        const distance = 44;
        const dx = Math.cos(p.angle) * distance;
        const dy = Math.sin(p.angle) * distance;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fef3c7, #fcd34d 60%, #f59e0b 100%)',
              boxShadow: '0 0 8px 2px rgba(252,211,77,0.65)',
              opacity: 0,
              transform: `translate(-50%, -50%)`,
              animation: `seBurst 0.9s ease-out ${p.delay}ms forwards`,
              '--dx': `${dx}px`,
              '--dy': `${dy}px`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes seBurst {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.2); }
        }
      `}</style>
    </>
  );
}
