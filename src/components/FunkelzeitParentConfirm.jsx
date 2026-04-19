import React, { useEffect } from 'react';

/**
 * FunkelzeitParentConfirm — parental go/no-go overlay shown before a
 * Funkelzeit (screen-time) reward timer starts.
 *
 * Shown when `funkelzeitMode === 'normal'` or `'strikt'` (below the daily cap).
 * Trust-based: no PIN. A parent simply taps "Los!" on the child's device.
 *
 * Props:
 *   - reward: { name, minutes, cost, ... }   the screen-time reward Louis chose
 *   - onApprove: () => void                  parent taps "Los!"
 *   - onDismiss: () => void                  close back to Belohnungsbank
 */
export default function FunkelzeitParentConfirm({ reward, onApprove, onDismiss }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onDismiss?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onDismiss?.();
  };

  const minutes = reward?.minutes ?? 0;

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[650] flex items-center justify-center px-5 overflow-y-auto py-8"
      style={{ background: 'rgba(10,20,22,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={{
          background: '#fff8f1',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.14)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        <div className="px-6 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Adult-zone label */}
          <p
            className="font-bold text-xs font-label uppercase tracking-[0.22em]"
            style={{ color: '#124346' }}
          >
            Eltern-Check
          </p>

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full mt-4 mb-5 flex items-center justify-center"
            style={{ background: 'rgba(18,67,70,0.08)', border: '1px solid rgba(18,67,70,0.15)' }}
          >
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_person
            </span>
          </div>

          {/* Large headline */}
          <h2
            className="font-headline font-bold text-on-surface leading-tight"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.65rem' }}
          >
            Zeig deinen Eltern den Bildschirm
          </h2>

          {/* Subtext */}
          <p
            className="font-body text-on-surface-variant mt-3 leading-relaxed"
            style={{ fontSize: '1rem' }}
          >
            Sie sagen Ja. Oder sagen Nein heute.
          </p>

          {/* Reward preview */}
          <div
            className="mt-6 px-5 py-4 rounded-2xl w-full"
            style={{
              background: 'linear-gradient(135deg, #ecfeff 0%, #ccfbf1 100%)',
              border: '1.5px solid rgba(0,150,150,0.22)',
            }}
          >
            <p
              className="font-label font-bold uppercase tracking-widest text-xs mb-1"
              style={{ color: '#00827e' }}
            >
              Belohnung
            </p>
            <p className="font-headline font-bold text-lg text-on-surface">
              {reward?.name}
            </p>
            <p
              className="font-headline font-bold mt-1"
              style={{ fontSize: '1.35rem', color: '#00827e' }}
            >
              {minutes} Minuten Funkelzeit
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8 w-full">
            <button
              onClick={onDismiss}
              className="flex-1 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{
                background: 'transparent',
                color: '#124346',
                border: '1.5px solid rgba(18,67,70,0.18)',
              }}
            >
              Nicht heute
            </button>
            <button
              onClick={onApprove}
              className="flex-1 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{
                background: '#fcd34d',
                color: '#725b00',
                boxShadow: '0 6px 18px rgba(252,211,77,0.4)',
              }}
            >
              Los!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
