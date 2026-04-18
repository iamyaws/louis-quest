import React, { useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import VoiceAudio from '../utils/voiceAudio';

const base = import.meta.env.BASE_URL;

/**
 * ParentIntroOverlay — one-time Hub message explaining the parent-zone.
 * Shown to Louis ONCE after he's been using the app a few days, so the
 * PIN-protected parent area doesn't feel mysterious or locked-off when he
 * stumbles on the long-press gesture.
 */
export default function ParentIntroOverlay() {
  const { actions } = useTask();
  const firedRef = useRef(false);

  // Play Drachenmutter narration on mount if audio file exists
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    // narrator file path (optional — skip gracefully if missing)
    VoiceAudio.playNarrator('parent_zone_intro', 600);
  }, []);

  const handleDismiss = () => {
    actions.patchState({ louisSeenParentIntro: true });
  };

  return (
    <div
      className="fixed inset-0 z-[550] flex items-center justify-center px-6"
      style={{
        background: 'linear-gradient(160deg, rgba(10,26,30,0.72) 0%, rgba(20,38,44,0.76) 100%)',
        backdropFilter: 'blur(6px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-intro-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden relative"
        style={{
          background: '#fff8f1',
          boxShadow: '0 28px 64px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.16)',
          border: '1.5px solid rgba(255,255,255,0.6)',
        }}
      >
        {/* Drachenmutter portrait */}
        <div className="relative w-full aspect-[4/3] overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
          <img
            src={`${base}art/companion/drachenmutter.webp`}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Fallback icon if image 404s */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
               style={{ zIndex: -1 }}>
            <span className="material-symbols-outlined"
                  style={{ fontSize: 96, color: 'rgba(146,64,14,0.35)', fontVariationSettings: "'FILL' 1" }}>
              family_restroom
            </span>
          </div>
        </div>

        {/* Copy + CTA */}
        <div className="p-6 text-center">
          <h2
            id="parent-intro-title"
            className="font-headline font-bold text-xl text-on-surface leading-snug mb-3"
            style={{ fontFamily: 'Fredoka, sans-serif', color: '#78350f' }}
          >
            Ah, hier gibts noch was für Mama & Papa.
          </h2>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
            Leider komplett langweilig für euch Kinder. Aber dennoch wichtig!
          </p>
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 rounded-full font-label font-bold text-base min-h-[48px]"
            style={{
              background: '#fcd34d',
              color: '#725b00',
              boxShadow: '0 6px 18px rgba(252,211,77,0.4)',
            }}
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
