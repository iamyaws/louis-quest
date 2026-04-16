import React, { useEffect, useState } from 'react';

const IOS_STEPS = [
  { icon: 'ios_share', text: "Tippe auf 'Teilen' unten in Safari" },
  { icon: 'add_box',   text: "Wähle 'Zum Homescreen'" },
  { icon: 'check_circle', text: 'Fertig! Ronki ist installiert 🎉' },
];

/**
 * Bottom-sheet PWA install prompt.
 * Props: isIOS, androidPrompt, onInstall, onSkip
 */
export default function PWAInstallSheet({ isIOS, androidPrompt, onInstall, onSkip }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[800] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onSkip}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-lg bg-surface px-6 pb-10 pt-4"
        style={{
          borderRadius: '1.5rem 1.5rem 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 rounded-full"
             style={{ width: 40, height: 4, background: 'rgba(0,0,0,0.15)' }} />

        {/* Phone icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
             style={{ background: 'rgba(18,67,70,0.08)' }}>
          <span className="material-symbols-outlined text-3xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}>smartphone</span>
        </div>

        <h2 className="font-headline font-bold text-2xl text-on-surface text-center mb-2">
          Ronki auf den Homescreen!
        </h2>
        <p className="font-body text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
          Öffne Ronki jeden Tag direkt vom Homescreen — kein Browser nötig.
        </p>

        {/* ── iOS instructions ── */}
        {isIOS && (
          <>
            <div className="flex flex-col gap-3 mb-7">
              {IOS_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: 'rgba(18,67,70,0.08)' }}>
                    <span className="material-symbols-outlined text-lg text-primary"
                          style={{ fontVariationSettings: i === 2 ? "'FILL' 1" : undefined }}>
                      {s.icon}
                    </span>
                  </div>
                  <p className="font-body text-sm text-on-surface leading-snug">{s.text}</p>
                </div>
              ))}
            </div>
            <button onClick={onSkip}
              className="w-full py-4 rounded-full font-headline font-bold text-lg active:scale-95 transition-all"
              style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 20px rgba(252,211,77,0.35), 0 3px 0 #d4a830' }}>
              Verstanden!
            </button>
          </>
        )}

        {/* ── Android / desktop ── */}
        {!isIOS && androidPrompt && (
          <>
            <button onClick={onInstall}
              className="w-full py-4 rounded-full font-headline font-bold text-lg active:scale-95 transition-all mb-3"
              style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 20px rgba(252,211,77,0.35), 0 3px 0 #d4a830' }}>
              Jetzt installieren
            </button>
            <button onClick={onSkip}
              className="w-full py-3 font-label text-sm text-on-surface-variant active:scale-95 transition-all">
              Überspringen
            </button>
          </>
        )}

        {/* ── Already installed / unknown ── */}
        {!isIOS && !androidPrompt && (
          <button onClick={onSkip}
            className="w-full py-4 rounded-full font-headline font-bold text-lg active:scale-95 transition-all"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 20px rgba(252,211,77,0.35), 0 3px 0 #d4a830' }}>
            Weiter →
          </button>
        )}
      </div>
    </div>
  );
}
