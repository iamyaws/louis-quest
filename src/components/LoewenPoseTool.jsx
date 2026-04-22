import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';

/**
 * LoewenPoseTool — body-based self-regulation for 'besorgt' mood.
 *
 * First yoga pose in the Ronki universe (see backlog_ronki_yoga.md).
 * Kid teaches Ronki the Löwen-Pose by doing it alongside him:
 *   1. Sit like a lion — hands on knees, fingers spread
 *   2. Breathe in deep (4s)
 *   3. Open wide — eyes, mouth, tongue
 *   4. ROAR (release + haptic rumble)
 *   5. Settle — shoulders drop, Ronki giggles
 *
 * Hidden curriculum: somatic release of jaw/shoulder tension. Gives
 * sorgen a physical exit instead of a thought loop. Works because
 * stretching the fight-or-flight muscles (jaw, shoulders, tongue) in
 * a silly way tricks the autonomic system into parasympathetic mode.
 *
 * Same skill-learning pattern as Box-Atmung / Drei-Danke / Kraftwort:
 *   · Bumps state.ronkiSkillPractice.loewe
 *   · Ronki learns at 5 practices
 *
 * Total duration ~60s. Contract: <LoewenPoseTool onComplete={() => void} />.
 */

const STEPS = [
  {
    phase: 'setup',
    title: 'Setz dich wie ein Löwe',
    body: 'Hände auf die Knie. Finger gespreizt wie Krallen.',
    mood: 'besorgt',
    durationMs: 5000,
  },
  {
    phase: 'inhale',
    title: 'Atme tief ein',
    body: 'Nimm so viel Luft wie du kannst. Mund zu.',
    mood: 'besorgt',
    durationMs: 4000,
  },
  {
    phase: 'open',
    title: 'Mach dich ganz weit',
    body: 'Augen groß. Mund weit offen. Zunge raus!',
    mood: 'besorgt',
    durationMs: 3000,
  },
  {
    phase: 'roar',
    title: 'BRÜLLEN!',
    body: 'Brüll wie ein Löwe. HAAA!',
    mood: 'gut',
    durationMs: 3500,
    haptic: true,
  },
  {
    phase: 'settle',
    title: 'Schulter locker',
    body: 'Fühl die Schultern fallen. Ronki auch.',
    mood: 'normal',
    durationMs: 4000,
  },
  {
    phase: 'done',
    title: 'Bravo',
    body: 'Ronki fühlt sich leichter. Du hast ihm was Wichtiges gezeigt.',
    mood: 'magisch',
    durationMs: 5000,
    final: true,
  },
];

export default function LoewenPoseTool({ onComplete }) {
  const { state, actions } = useTask();
  const [stepIdx, setStepIdx] = useState(0);
  const [persisted, setPersisted] = useState(false);

  const step = STEPS[stepIdx];
  const variant = state?.companionVariant || 'amber';

  // Auto-advance each step after its duration elapses
  useEffect(() => {
    if (!step) return;
    if (step.haptic) {
      SFX.play('coin');
      try { if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 200]); } catch (_) {}
    } else {
      SFX.play('pop');
      try { if (navigator.vibrate) navigator.vibrate(20); } catch (_) {}
    }
    // On the final step, persist once
    if (step.final && !persisted) {
      setPersisted(true);
      const prevPractice = state?.ronkiSkillPractice?.loewe || 0;
      const nextPractice = Math.min(5, prevPractice + 1);
      const patch = {
        ronkiSkillPractice: {
          ...(state?.ronkiSkillPractice || {}),
          loewe: nextPractice,
        },
      };
      if (nextPractice >= 5 && !(state?.ronkiLearnedSkills || []).includes('loewe')) {
        patch.ronkiLearnedSkills = [
          ...(state?.ronkiLearnedSkills || []),
          'loewe',
        ];
      }
      actions.patchState?.(patch);
    }
    const t = setTimeout(() => {
      if (stepIdx < STEPS.length - 1) setStepIdx(i => i + 1);
    }, step.durationMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const progress = (stepIdx + 1) / STEPS.length;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background:
          step.phase === 'roar'
            ? 'linear-gradient(180deg, #fef3c7 0%, #fcd34d 50%, #fef3c7 100%)'
            : 'linear-gradient(180deg, #ede9fe 0%, #fff8f2 50%, #ede9fe 100%)',
        color: '#124346',
        fontFamily: 'Nunito, system-ui, sans-serif',
        transition: 'background 0.6s ease',
      }}
    >
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))',
      }}>
        <div>
          <p style={{
            margin: 0, fontSize: 10, letterSpacing: '0.22em', fontWeight: 800,
            textTransform: 'uppercase', color: '#6d28d9',
          }}>
            Löwen-Pose
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 500 }}>
            Zeig Ronki, wie Sorgen gehen können
          </p>
        </div>
        <button onClick={onComplete}
          style={{
            background: 'transparent', border: 'none', color: 'rgba(109,40,217,0.7)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          Schließen
        </button>
      </header>

      {/* Progress bar */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          height: 4, borderRadius: 999,
          background: 'rgba(109,40,217,0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, #a78bfa, #6d28d9)',
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Ronki mirrors the step. Roar step shows him with magisch glow. */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: 200, height: 200,
          position: 'relative',
          transform: step.phase === 'roar'
            ? 'scale(1.15)'
            : step.phase === 'open'
              ? 'scale(1.05)'
              : 'scale(1)',
          transition: 'transform 0.5s ease',
          filter: step.phase === 'roar'
            ? 'drop-shadow(0 0 30px rgba(252,211,77,0.9))'
            : step.phase === 'done'
              ? 'drop-shadow(0 0 20px rgba(249,168,212,0.8))'
              : 'none',
        }}>
          <MoodChibi size={200} mood={step.mood} variant={variant} stage={2} bare />
          {/* Roar visual — radial burst behind Ronki */}
          {step.phase === 'roar' && (
            <span aria-hidden="true" style={{
              position: 'absolute', inset: '-40%',
              background: 'radial-gradient(circle, rgba(252,211,77,0.55) 0%, transparent 60%)',
              zIndex: -1,
              animation: 'lpRoarBurst 1.4s ease-out',
            }} />
          )}
        </div>

        <p style={{
          margin: '28px 0 10px',
          textAlign: 'center',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: 28, fontWeight: 600,
          color: step.phase === 'roar' ? '#b45309' : '#124346',
          letterSpacing: '-0.02em',
          textWrap: 'balance',
        }}>
          {step.title}
        </p>
        <p style={{
          margin: 0,
          textAlign: 'center',
          fontSize: 15, lineHeight: 1.5,
          color: 'rgba(18,43,46,0.7)',
          maxWidth: 360,
        }}>
          {step.body}
        </p>

        {step.final && (
          <button onClick={onComplete}
            style={{
              marginTop: 28,
              padding: '14px 28px', borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
              color: '#fff',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 800, fontSize: 13, letterSpacing: '0.14em',
              textTransform: 'uppercase',
              boxShadow: '0 10px 24px -6px rgba(109,40,217,0.55)',
              cursor: 'pointer',
            }}>
            Fertig
          </button>
        )}
      </div>

      <style>{`
        @keyframes lpRoarBurst {
          0%   { opacity: 0; transform: scale(0.4); }
          30%  { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
