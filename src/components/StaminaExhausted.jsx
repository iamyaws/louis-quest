import React from 'react';
import RonkiPortrait from './RonkiPortrait';

export default function StaminaExhausted({ nextRechargeMin, stage = 1, onClose }) {
  return (
    <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center px-8"
         style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)' }}
         onClick={onClose}>
      {/* Variant-aware tired chibi (replaces the old painted portrait
           which rendered amber regardless of variant; Marc 23 Apr 2026).
           mood="tired" adds the low-battery sway + closed eyes. */}
      <div className="mb-6 flex items-center justify-center"
           style={{ width: 160, height: 160, filter: 'brightness(0.85)' }}>
        <RonkiPortrait size={160} mood="tired" stage={stage} ringed />
      </div>
      <h2 className="font-headline font-bold text-2xl text-white mb-2 text-center"
          style={{ fontFamily: 'Fredoka, sans-serif' }}>
        Ronki ist platt
      </h2>
      <p className="font-body text-base text-white/70 text-center leading-relaxed mb-8 max-w-xs">
        Erholt sich in {nextRechargeMin} {nextRechargeMin === 1 ? 'Minute' : 'Minuten'}. Probier etwas anderes aus!
      </p>
      <button onClick={e => { e.stopPropagation(); onClose?.(); }}
        className="px-8 py-3.5 rounded-full font-label font-bold text-base min-h-[48px]"
        style={{ background: '#fcd34d', color: '#725b00' }}>
        Ronki schlafen lassen
      </button>
    </div>
  );
}
