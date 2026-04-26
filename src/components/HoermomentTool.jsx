import React, { useState, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';

/**
 * HoermomentTool — auditory sensory grounding.
 *
 * Adapted "5-4-3-2-1" grounding technique for first-graders.
 * Instead of the full sensory list (overwhelming for kids), focus
 * on listening only: hear three sounds, one at a time. Reliable
 * regardless of where the kid is — you can always hear *something*.
 *
 * Loop (~50s):
 *   1. intro    — "Mach kurz die Augen zu." Ronki sits, ears up.
 *   2. listen 1 — 12s. Soft progress ring. Tap "Hab eins!" when
 *                 the kid hears something. Auto-advances after 12s
 *                 if no tap.
 *   3. listen 2 — same, 12s.
 *   4. listen 3 — same, 12s.
 *   5. settle   — "Drei Sachen gehört." Ronki blinks slow.
 *
 * No labelling required ("what was it?"). The technique works at
 * any age because *noticing* is the regulation, not naming.
 *
 * Skill-learning pattern matches the rest of the tool library:
 *   · Bumps state.ronkiSkillPractice.hoermoment
 *   · Learns at 5 practices
 *
 * Contract: <HoermomentTool onComplete={() => void} />.
 */

const ROUND_DURATION_MS = 12000;

export default function HoermomentTool({ onComplete }) {
  const { state, actions } = useTask();
  // phase: 'intro' | 'listen' | 'settle'
  const [phase, setPhase] = useState('intro');
  // Round 0-indexed (0..2 listening rounds)
  const [round, setRound] = useState(0);
  const [heard, setHeard] = useState([false, false, false]);
  const [elapsed, setElapsed] = useState(0); // ms within current round
  const persistedRef = useRef(false);

  const variant = state?.companionVariant || 'amber';

  // intro → listen (auto, ~2.4s)
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('listen'), 2400);
    return () => clearTimeout(t);
  }, [phase]);

  // listen round timer — advances rounds via elapsed
  useEffect(() => {
    if (phase !== 'listen') return;
    setElapsed(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const e = Date.now() - start;
      setElapsed(e);
      if (e >= ROUND_DURATION_MS) {
        clearInterval(interval);
        if (round >= 2) {
          setPhase('settle');
        } else {
          setRound((r) => r + 1);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, round]);

  // settle → record practice once
  useEffect(() => {
    if (phase !== 'settle' || persistedRef.current) return;
    persistedRef.current = true;
    actions.practiceSkill?.('hoermoment');
  }, [phase, actions]);

  const handleHeard = () => {
    if (heard[round]) return;
    SFX.play('pop');
    setHeard((prev) => prev.map((v, i) => (i === round ? true : v)));
    // Don't auto-advance — let the round timer finish so the kid
    // gets the full quiet space. The check just becomes "Hab eins!"
  };

  const handleClose = () => {
    if (typeof onComplete === 'function') onComplete();
  };

  const pct = Math.min(1, elapsed / ROUND_DURATION_MS);
  const ringDegrees = pct * 360;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center px-5 py-8 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #ecfdf5 0%, #f0fdfa 60%, #fff8f1 100%)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl relative overflow-hidden"
        style={{
          background: '#fff8f1',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.9)',
          minHeight: 480,
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
            style={{ color: '#047857' }}
          >
            Hörmoment
          </p>

          {/* ── intro ── */}
          {phase === 'intro' && (
            <>
              <h3
                className="font-headline font-bold mt-3"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.55rem', color: '#3a2818' }}
              >
                Mach kurz die Augen zu.
              </h3>
              <div className="mt-7 mb-2" aria-hidden="true">
                <MoodChibi size={108} variant={variant} stage={1} mood="normal" bare />
              </div>
              <p className="font-body text-base text-on-surface-variant mt-3 italic max-w-xs">
                Ronki spitzt die Ohren.
              </p>
            </>
          )}

          {/* ── listen ── */}
          {phase === 'listen' && (
            <>
              <h3
                className="font-headline font-bold mt-3"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.45rem', color: '#3a2818' }}
              >
                Was hörst du gerade?
              </h3>

              <div className="relative mt-7 mb-2 flex items-center justify-center" style={{ width: 180, height: 180 }}>
                {/* Progress ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#10b981 ${ringDegrees}deg, rgba(16,185,129,0.12) ${ringDegrees}deg)`,
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: 8,
                    background: 'rgba(236,253,245,0.95)',
                    border: '2px solid rgba(16,185,129,0.30)',
                  }}
                />
                <div className="relative" aria-hidden="true">
                  <MoodChibi size={108} variant={variant} stage={1} mood={heard[round] ? 'gut' : 'normal'} bare />
                </div>
              </div>

              <button
                onClick={handleHeard}
                disabled={heard[round]}
                className="mt-5 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: heard[round] ? 'rgba(16,185,129,0.18)' : '#10b981',
                  color: heard[round] ? '#047857' : 'white',
                  border: heard[round] ? '1.5px solid rgba(16,185,129,0.35)' : 'none',
                  boxShadow: heard[round] ? 'none' : '0 6px 18px rgba(16,185,129,0.40)',
                }}
              >
                {heard[round] ? 'Gehört ✓' : 'Hab eins!'}
              </button>

              <div className="flex gap-2 mt-7" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 12,
                      height: 12,
                      background:
                        i < round       ? '#10b981'
                        : i === round   ? 'rgba(16,185,129,0.55)'
                        :                  'rgba(16,185,129,0.18)',
                      transition: 'background 200ms ease',
                    }}
                  />
                ))}
              </div>

              <p className="font-body text-sm text-on-surface-variant mt-4 italic">
                Lausch noch ein bisschen.
              </p>
            </>
          )}

          {/* ── settle ── */}
          {phase === 'settle' && (
            <>
              <div className="mt-6 mb-3" aria-hidden="true">
                <MoodChibi size={108} variant={variant} stage={1} mood="gut" bare />
              </div>
              <h3
                className="font-headline font-bold mt-2"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.6rem', color: '#047857' }}
              >
                Drei Sachen gehört.
              </h3>
              <p className="font-body text-base text-on-surface-variant mt-3 italic max-w-xs">
                Du warst ganz da.
              </p>

              <button
                onClick={handleClose}
                className="mt-9 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: '#10b981',
                  color: 'white',
                  boxShadow: '0 6px 18px rgba(16,185,129,0.40)',
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
