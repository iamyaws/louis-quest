import React from 'react';
import { useRonkiStamina } from '../hooks/useRonkiStamina';

/**
 * StaminaIndicator — small pill next to the Hub header showing Ronki's current
 * stamina (5 pips) plus a recharge countdown. Addresses Louis's question
 * "when does Ronki recharge?" by making the +1 cadence visible.
 *
 * Behavior:
 *  - Fully charged: 5 filled pips, no countdown text.
 *  - Recharging: dimmed empty pips + "+1 in N′" countdown (minutes).
 *  - Exhausted (0): red pulse + "müde" label.
 */
export default function StaminaIndicator() {
  const s = useRonkiStamina();
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
         style={{
           background: s.exhausted ? 'rgba(239,68,68,0.10)' : 'rgba(252,211,77,0.15)',
           border: `1px solid ${s.exhausted ? 'rgba(239,68,68,0.3)' : 'rgba(252,211,77,0.3)'}`,
           animation: s.exhausted ? 'stamina-pulse 2s ease-in-out infinite' : 'none',
         }}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: s.max }).map((_, i) => (
          <span key={i}
            className="inline-block rounded-full"
            style={{
              width: 5, height: 10,
              background: i < s.current ? '#fcd34d' : 'rgba(252,211,77,0.2)',
              transition: 'background 300ms',
            }} />
        ))}
      </div>
      {s.recharging && !s.exhausted && (
        <span className="font-label text-[10px] text-[#92400e] tabular-nums" style={{ lineHeight: 1 }}>
          +1 in {s.nextRechargeMin}′
        </span>
      )}
      {s.exhausted && (
        <span className="font-label text-[10px] text-red-600 tabular-nums" style={{ lineHeight: 1 }}>
          müde
        </span>
      )}
      <style>{`
        @keyframes stamina-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
      `}</style>
    </div>
  );
}
