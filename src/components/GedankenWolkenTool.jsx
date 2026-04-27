import React, { useState, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';
import useDialogA11y from '../hooks/useDialogA11y';

/**
 * GedankenWolkenTool — releasing swirling thoughts.
 *
 * For days when the head is too full. Three thought-cloud bubbles
 * drift gently across the screen; the kid taps each to pop it. As
 * each one pops, Ronki exhales a soft puff and the cloud drifts
 * upward and dissolves. After the third pop, Ronki settles and
 * acknowledges that the head is a bit lighter.
 *
 * Loop (~50s):
 *   1. intro    — "Manchmal ist viel los im Kopf." Ronki listens.
 *   2. clouds   — three drifting bubbles, taps to release. Each
 *                 release softly fades + lifts. Cycle until all gone
 *                 OR a 30s soft-timeout (then auto-dissolve any left).
 *   3. settle   — "Etwas freier?" Ronki rests, head a little lower.
 *
 * The bubble texts are *neutral examples* — "Etwas Schweres",
 * "Streit gehabt", "Hausaufgabe". Kids don't have to identify the
 * thought, the metaphor is enough at this age.
 *
 * Skill-learning pattern matches the rest of the tool library:
 *   · Bumps state.ronkiSkillPractice.gedankenWolken
 *   · Learns at 5 practices
 *
 * Contract: <GedankenWolkenTool onComplete={() => void} />.
 */

const SAMPLE_THOUGHTS = [
  'Etwas Schweres',
  'Was ich vergessen habe',
  'Ein Streit',
  'Eine Sorge',
  'Was morgen kommt',
  'Etwas Lautes',
];

// Three clouds with staggered horizontal drift positions and delays.
// Picked so the kid can reach all three on a phone viewport without
// scrolling — each cloud sits in its own vertical band.
const CLOUD_BANDS = [
  { top: '18%', driftFrom: -20, driftTo: 110, durationMs: 26000, delay:    0 },
  { top: '38%', driftFrom: 110, driftTo: -20, durationMs: 28000, delay: 1800 },
  { top: '58%', driftFrom: -20, driftTo: 110, durationMs: 24000, delay: 3600 },
];

function pickThree() {
  // Deterministic-ish pick to keep variety across opens but not random per render.
  const seed = new Date().getDate();
  const rotated = [...SAMPLE_THOUGHTS.slice(seed % SAMPLE_THOUGHTS.length), ...SAMPLE_THOUGHTS.slice(0, seed % SAMPLE_THOUGHTS.length)];
  return rotated.slice(0, 3);
}

export default function GedankenWolkenTool({ onComplete }) {
  const { state, actions } = useTask();
  // phase: 'intro' | 'clouds' | 'settle'
  const [phase, setPhase] = useState('intro');
  const [thoughts] = useState(pickThree);
  // popped[i] = true if cloud i has been tapped
  const [popped, setPopped] = useState([false, false, false]);
  const persistedRef = useRef(false);

  const variant = state?.companionVariant || 'amber';

  // intro → clouds (auto, ~2.6s)
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('clouds'), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  // clouds → settle when all popped, OR 30s soft timeout
  useEffect(() => {
    if (phase !== 'clouds') return;
    if (popped.every(Boolean)) {
      const t = setTimeout(() => setPhase('settle'), 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('settle'), 30000);
    return () => clearTimeout(t);
  }, [phase, popped]);

  // settle → record practice once
  useEffect(() => {
    if (phase !== 'settle' || persistedRef.current) return;
    persistedRef.current = true;
    actions.practiceSkill?.('gedankenWolken');
  }, [phase, actions]);

  const handlePop = (idx) => {
    if (popped[idx]) return;
    SFX.play('pop');
    setPopped((prev) => prev.map((v, i) => (i === idx ? true : v)));
  };

  const handleClose = () => {
    if (typeof onComplete === 'function') onComplete();
  };

  // A11y: ESC dismiss + initial focus + restore on unmount.
  const dialogRef = useRef(null);
  useDialogA11y(handleClose, { containerRef: dialogRef });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Gedanken-Wolken"
      tabIndex={-1}
      className="fixed inset-0 z-[500] flex items-center justify-center px-5 py-8 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #e0f2fe 0%, #ddd6fe 60%, #fff8f2 100%)',
        backdropFilter: 'blur(6px)',
        outline: 'none',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #f0f9ff 0%, #fff8f1 100%)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10)',
          border: '1px solid rgba(255,255,255,0.9)',
          minHeight: 540,
        }}
      >
        <button
          onClick={handleClose}
          aria-label="Schließen"
          className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center z-30 active:scale-95 transition-transform"
          style={{ background: 'rgba(18,67,70,0.08)', border: '1px solid rgba(18,67,70,0.12)' }}
        >
          <span className="material-symbols-outlined text-xl text-primary">close</span>
        </button>

        <div className="relative w-full" style={{ minHeight: 540 }}>
          <p
            className="font-bold text-xs font-label uppercase tracking-[0.18em] absolute top-6 left-0 right-0 text-center z-20"
            style={{ color: '#5b21b6' }}
          >
            Gedanken-Wolken
          </p>

          {/* ── intro ── */}
          {phase === 'intro' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h3
                className="font-headline font-bold"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.55rem', color: '#3a2818' }}
              >
                Manchmal ist viel los im Kopf.
              </h3>
              <div className="mt-6 mb-2" aria-hidden="true">
                <MoodChibi size={104} variant={variant} stage={1} mood="besorgt" bare />
              </div>
              <p className="font-body text-base text-on-surface-variant mt-3 italic max-w-xs">
                Wir lassen ein paar ziehen.
              </p>
            </div>
          )}

          {/* ── clouds ── */}
          {phase === 'clouds' && (
            <>
              {/* Ronki sits at the bottom, watching */}
              <div
                className="absolute bottom-6 left-1/2 z-10"
                style={{ transform: 'translateX(-50%)' }}
                aria-hidden="true"
              >
                <MoodChibi size={84} variant={variant} stage={1} mood="besorgt" bare />
              </div>

              {/* Drifting clouds */}
              {CLOUD_BANDS.map((band, i) => {
                const isPopped = popped[i];
                return (
                  <button
                    key={i}
                    onClick={() => handlePop(i)}
                    aria-label={`Gedanke loslassen: ${thoughts[i]}`}
                    disabled={isPopped}
                    className="absolute z-20"
                    style={{
                      top: band.top,
                      left: 0,
                      animation: isPopped
                        ? 'wolke-fade 1.05s ease-out forwards'
                        : `wolke-drift-${i} ${band.durationMs}ms ${band.delay}ms linear infinite`,
                      pointerEvents: isPopped ? 'none' : 'auto',
                      // Animation overrides set left via translateX in keyframes,
                      // so initial left:0 is fine.
                    }}
                  >
                    <CloudBubble text={thoughts[i]} faded={isPopped} />
                  </button>
                );
              })}

              <p
                className="absolute bottom-1 left-0 right-0 text-center font-body text-sm italic z-10"
                style={{ color: '#5b21b6' }}
              >
                {popped.every(Boolean)
                  ? 'Alle drei losgelassen.'
                  : `Tipp die Wolken an. (${popped.filter(Boolean).length} von 3)`}
              </p>

              <style>{`
                @keyframes wolke-drift-0 {
                  0%   { transform: translateX(${CLOUD_BANDS[0].driftFrom}vw); opacity: 0; }
                  6%   { opacity: 0.95; }
                  94%  { opacity: 0.95; }
                  100% { transform: translateX(${CLOUD_BANDS[0].driftTo}vw); opacity: 0; }
                }
                @keyframes wolke-drift-1 {
                  0%   { transform: translateX(${CLOUD_BANDS[1].driftFrom}vw); opacity: 0; }
                  6%   { opacity: 0.95; }
                  94%  { opacity: 0.95; }
                  100% { transform: translateX(${CLOUD_BANDS[1].driftTo}vw); opacity: 0; }
                }
                @keyframes wolke-drift-2 {
                  0%   { transform: translateX(${CLOUD_BANDS[2].driftFrom}vw); opacity: 0; }
                  6%   { opacity: 0.95; }
                  94%  { opacity: 0.95; }
                  100% { transform: translateX(${CLOUD_BANDS[2].driftTo}vw); opacity: 0; }
                }
                @keyframes wolke-fade {
                  0%   { opacity: 0.95; transform: translateY(0) scale(1); }
                  100% { opacity: 0;    transform: translateY(-60px) scale(0.85); }
                }
              `}</style>
            </>
          )}

          {/* ── settle ── */}
          {phase === 'settle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="mb-4" aria-hidden="true">
                <MoodChibi size={112} variant={variant} stage={1} mood="normal" bare />
              </div>
              <h3
                className="font-headline font-bold mt-2"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.6rem', color: '#3a2818' }}
              >
                Etwas freier?
              </h3>
              <p className="font-body text-base text-on-surface-variant mt-3 italic max-w-xs">
                Ronki atmet ruhig.
              </p>

              <button
                onClick={handleClose}
                className="mt-9 px-10 py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: '#7c3aed',
                  color: 'white',
                  boxShadow: '0 6px 18px rgba(124,58,237,0.40)',
                }}
              >
                Fertig
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CloudBubble({ text, faded }) {
  return (
    <div
      className="rounded-full px-5 py-3 flex items-center justify-center"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1.5px solid rgba(91,33,182,0.28)',
        boxShadow: '0 6px 16px rgba(91,33,182,0.18), inset 0 1px 0 rgba(255,255,255,0.8)',
        minHeight: 52,
        minWidth: 144,
        opacity: faded ? 0.4 : 1,
        // Soft pillowy shape via border-radius variants
        borderRadius: '999px 999px 999px 999px',
      }}
    >
      <span
        className="font-body font-medium"
        style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#3a2818' }}
      >
        {text}
      </span>
    </div>
  );
}
