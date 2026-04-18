import React from 'react';
import { getDragonArt } from '../utils/helpers';

const base = import.meta.env.BASE_URL;

export default function StaminaExhausted({ nextRechargeMin, stage = 1, onClose }) {
  const artFile = getDragonArt(stage);
  return (
    <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center px-8"
         style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)' }}
         onClick={onClose}>
      <div className="w-40 h-40 rounded-full overflow-hidden mb-6 relative"
           style={{ border: '2px solid rgba(252,211,77,0.35)', boxShadow: '0 0 40px rgba(252,211,77,0.2)' }}>
        <img src={`${base}art/companion/${artFile}.webp`} alt=""
             className="w-full h-full object-cover"
             style={{ filter: 'brightness(0.55) saturate(0.7)' }} />
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
