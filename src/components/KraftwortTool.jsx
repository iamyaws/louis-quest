import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';

/**
 * KraftwortTool — quiet affirmation moment.
 *
 * Replacement for the deleted KraftwortTool (cut #8, Apr 2026 —
 * "sticker-of-the-day with heavy plumbing"). Northstar: BeiRonkiSein-tier
 * voice, no streaks, no praise toasts, tactile not gamified.
 *
 * Loop (~30s):
 *   1. intro    — "Manchmal hilft ein Wort." Ronki sits, listening.
 *   2. picker   — kid picks one of four soft cards: Mutig / Stark /
 *                 Lieb / Geduldig. Tap-to-pick, no time pressure.
 *   3. hold     — picked word swells gently for 3s while Ronki nods.
 *                 No instruction "say it now" — Marc's rule, no shoulds.
 *                 The kid says it if they want.
 *   4. settle   — "Du bist [wort]." Ronki blinks slow.
 *
 * Hidden curriculum: positive self-statement / affirmation, anchored
 * to a felt sense (the swell). The skill being taught is "I can
 * choose what to remember about myself today."
 *
 * Skill-learning pattern matches the rest of the tool library:
 *   · Bumps state.ronkiSkillPractice.kraftwort
 *   · Learns at 5 practices
 *
 * Contract: <KraftwortTool onComplete={() => void} />.
 */

const WORDS = [
  { id: 'mutig',     label: 'Mutig',     color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  ring: 'rgba(245,158,11,0.32)' },
  { id: 'stark',     label: 'Stark',     color: '#dc2626', bg: 'rgba(220,38,38,0.10)',   ring: 'rgba(220,38,38,0.32)' },
  { id: 'lieb',      label: 'Lieb',      color: '#ec4899', bg: 'rgba(236,72,153,0.10)',  ring: 'rgba(236,72,153,0.32)' },
  { id: 'geduldig',  label: 'Geduldig',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)',  ring: 'rgba(14,165,233,0.32)' },
];

export default function KraftwortTool({ onComplete }) {
  const { state, actions } = useTask();
  // phase: 'intro' | 'picker' | 'hold' | 'settle'
  const [phase, setPhase] = useState('intro');
  const [picked, setPicked] = useState(null);
  const [persisted, setPersisted] = useState(false);

  const variant = state?.companionVariant || 'amber';

  // intro → picker (auto, ~2.4s) so the kid has time to read the line
  // before the cards appear.
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('picker'), 2400);
    return () => clearTimeout(t);
  }, [phase]);

  // hold → settle after 3s of swell
  useEffect(() => {
    if (phase !== 'hold') return;
    const t = setTimeout(() => setPhase('settle'), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  // settle → record practice (once) so re-renders during the
  // close-tap don't double-count
  useEffect(() => {
    if (phase !== 'settle' || persisted) return;
    setPersisted(true);
    actions.practiceSkill?.('kraftwort');
  }, [phase, persisted, actions]);

  const handlePick = (word) => {
    SFX.play('pop');
    setPicked(word);
    setPhase('hold');
  };

  const handleClose = () => {
    if (typeof onComplete === 'function') onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center px-5 py-8 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(255,248,242,0.96) 0%, rgba(252,231,243,0.92) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl relative overflow-hidden"
        style={{
          background: '#fff8f1',
          boxShadow: '0 24px 64px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.9)',
          minHeight: 460,
        }}
      >
        <button
          onClick={handleClose}
          aria-label="Schließen"
          className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center z-20 active:scale-95 transition-transform"
          style={{ background: 'rgba(18,67,70,0.08)', border: '1px solid rgba(18,67,70,0.12)' }}
        >
          <span className="material-symbols-outlined text-xl text-primary">close</span>
        </button>

        <div className="px-6 pt-12 pb-10 flex flex-col items-center text-center">
          <p
            className="font-bold text-xs font-label uppercase tracking-[0.18em]"
            style={{ color: '#A83E2C' }}
          >
            Kraftwort
          </p>

          {/* ── intro ── */}
          {phase === 'intro' && (
            <>
              <h3
                className="font-headline font-bold mt-3"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.6rem', color: '#3a2818' }}
              >
                Manchmal hilft ein Wort.
              </h3>
              <div className="mt-7 mb-2" aria-hidden="true">
                <MoodChibi size={108} variant={variant} stage={1} mood="normal" bare />
              </div>
              <p className="font-body text-base text-on-surface-variant mt-3 italic max-w-xs">
                Ronki hört zu.
              </p>
            </>
          )}

          {/* ── picker ── */}
          {phase === 'picker' && (
            <>
              <h3
                className="font-headline font-bold mt-3"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.55rem', color: '#3a2818' }}
              >
                Welches passt heute?
              </h3>
              <p className="font-body text-base text-on-surface-variant mt-2 max-w-xs">
                Tipp eins an.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-7">
                {WORDS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handlePick(w)}
                    className="rounded-2xl flex items-center justify-center p-5 active:scale-95 transition-transform"
                    style={{
                      minHeight: 88,
                      background: w.bg,
                      border: `2px solid ${w.ring}`,
                      boxShadow: '0 4px 10px rgba(30,27,23,0.06)',
                    }}
                  >
                    <span
                      className="font-headline font-bold"
                      style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.55rem', color: w.color }}
                    >
                      {w.label}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── hold ── */}
          {phase === 'hold' && picked && (
            <>
              <div className="mt-8 mb-4" aria-hidden="true">
                <MoodChibi size={88} variant={variant} stage={1} mood="gut" bare />
              </div>
              <div
                className="rounded-3xl px-10 py-7 flex items-center justify-center"
                style={{
                  background: picked.bg,
                  border: `2.5px solid ${picked.ring}`,
                  boxShadow: `0 0 40px ${picked.color}22`,
                  animation: 'kraftwort-swell 3.2s ease-in-out',
                }}
              >
                <span
                  className="font-headline font-bold"
                  style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '2.6rem', color: picked.color }}
                >
                  {picked.label}
                </span>
              </div>
              <style>{`
                @keyframes kraftwort-swell {
                  0%   { transform: scale(0.92); opacity: 0.7; }
                  35%  { transform: scale(1.08); opacity: 1; }
                  70%  { transform: scale(1.02); opacity: 1; }
                  100% { transform: scale(1.05); opacity: 1; }
                }
              `}</style>
            </>
          )}

          {/* ── settle ── */}
          {phase === 'settle' && picked && (
            <>
              <div className="mt-8 mb-4" aria-hidden="true">
                <MoodChibi size={108} variant={variant} stage={1} mood="gut" bare />
              </div>
              <h3
                className="font-headline font-bold mt-3"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.7rem', color: picked.color }}
              >
                Du bist {picked.label.toLowerCase()}.
              </h3>
              <p className="font-body text-base text-on-surface-variant mt-3 italic max-w-xs">
                Ronki nickt langsam.
              </p>

              <button
                onClick={handleClose}
                className="mt-9 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: picked.color,
                  color: 'white',
                  boxShadow: `0 6px 18px ${picked.color}55`,
                }}
              >
                Fertig
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
