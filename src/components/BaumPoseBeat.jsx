import React, { useState, useEffect } from 'react';

/**
 * BaumPoseBeat — custom craft-beat UI for the Pilzhüter arc's Tree Pose beat.
 * Replaces the default step-list with a guided 30-second hold timer and a
 * kid-friendly tree-pose illustration that gently wobbles while held.
 *
 * Wired via `CRAFT_BEAT_COMPONENTS` dispatch in BeatCompletionModal — future
 * Freund skills (box breathing, brief meditation, etc.) register their own
 * component under their beat id without branching logic.
 *
 * Phases:
 *   ready    — "Ich bin bereit" CTA
 *   holding  — 30-second countdown ring, tree wobbles
 *   done     — "Fertig" CTA (calls onComplete → advances the arc engine)
 */
export default function BaumPoseBeat({ onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, secondsLeft]);

  const pct = ((30 - secondsLeft) / 30) * 100;
  const done = started && secondsLeft <= 0;

  return (
    <div className="flex flex-col items-center px-6 py-8">
      <TreePoseSVG wobble={started && !done} />
      <p className="font-headline font-bold text-xl text-on-surface mt-6 text-center"
         style={{ fontFamily: 'Fredoka, sans-serif' }}>
        {!started ? 'Bereit, ein Baum zu werden?' : done ? 'Gut gemacht!' : 'Halte die Pose...'}
      </p>
      <p className="font-body text-sm text-on-surface-variant mt-2 text-center max-w-xs">
        {!started ? 'Heb einen Fuß. Streck die Arme hoch. Atme tief.' : 'Du bist ein Baum.'}
      </p>

      {/* Timer ring */}
      {started && (
        <div className="relative w-32 h-32 mt-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(5,150,105,0.15)" strokeWidth="8" />
            <circle cx="64" cy="64" r="58" fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 - (pct / 100) * 364.4}
                    style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-headline font-bold text-4xl text-[#059669] tabular-nums"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {secondsLeft}
            </span>
          </div>
        </div>
      )}

      {!started ? (
        <button onClick={() => setStarted(true)}
          className="mt-8 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px]"
          style={{ background: '#059669', color: 'white', boxShadow: '0 6px 18px rgba(5,150,105,0.35)' }}>
          Ich bin bereit
        </button>
      ) : done ? (
        <button onClick={onComplete}
          className="mt-8 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px]"
          style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 6px 18px rgba(252,211,77,0.4)' }}>
          Fertig
        </button>
      ) : null}
    </div>
  );
}

function TreePoseSVG({ wobble }) {
  return (
    <svg viewBox="0 0 200 260" className="w-40 h-52"
         style={wobble ? { animation: 'treeWobble 3s ease-in-out infinite' } : undefined}>
      {/* Arms up as branches */}
      <path d="M 100 90 L 60 30" stroke="#065f46" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 100 90 L 140 30" stroke="#065f46" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Small branches */}
      <path d="M 70 45 L 55 50" stroke="#065f46" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 130 45 L 145 50" stroke="#065f46" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Leaves clusters */}
      <circle cx="55" cy="25" r="14" fill="#10b981" opacity="0.85" />
      <circle cx="145" cy="25" r="14" fill="#10b981" opacity="0.85" />
      <circle cx="42" cy="50" r="9" fill="#10b981" opacity="0.7" />
      <circle cx="158" cy="50" r="9" fill="#10b981" opacity="0.7" />
      {/* Head */}
      <circle cx="100" cy="90" r="22" fill="#fcd34d" />
      {/* Smile */}
      <path d="M 92 92 Q 100 98 108 92" stroke="#725b00" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <circle cx="93" cy="85" r="2" fill="#725b00" />
      <circle cx="107" cy="85" r="2" fill="#725b00" />
      {/* Body/trunk */}
      <path d="M 100 112 L 100 180" stroke="#92400e" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Standing leg */}
      <path d="M 100 180 L 100 230" stroke="#92400e" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Raised leg — foot against calf */}
      <path d="M 100 180 L 118 200 L 100 210" stroke="#92400e" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Ground */}
      <ellipse cx="100" cy="240" rx="40" ry="4" fill="#78350f" opacity="0.2" />
      <style>{`
        @keyframes treeWobble {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
      `}</style>
    </svg>
  );
}
