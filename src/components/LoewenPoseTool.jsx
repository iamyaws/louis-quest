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
    // Cue row shown above the title — what the body actually does
    cue: { icon: '🧎', label: 'Hinsetzen', hand: '🖐️' },
  },
  {
    phase: 'inhale',
    title: 'Atme tief ein',
    body: 'Nimm so viel Luft wie du kannst. Mund zu.',
    mood: 'besorgt',
    durationMs: 4000,
    cue: { icon: '🫁', label: 'Einatmen', arrow: 'up' },
  },
  {
    phase: 'open',
    title: 'Mach dich ganz weit',
    body: 'Augen groß. Mund weit offen. Zunge raus!',
    mood: 'besorgt',
    durationMs: 3000,
    cue: { icon: '😮', label: 'Weit auf' },
  },
  {
    phase: 'roar',
    title: 'BRÜLLEN!',
    body: 'Brüll wie ein Löwe. HAAA!',
    mood: 'gut',
    durationMs: 3500,
    haptic: true,
    cue: { icon: '🦁', label: 'Brüllen', big: true },
  },
  {
    phase: 'settle',
    title: 'Schulter locker',
    body: 'Fühl die Schultern fallen. Ronki auch.',
    mood: 'normal',
    durationMs: 4000,
    cue: { icon: '🌬️', label: 'Ausatmen', arrow: 'down' },
  },
  {
    phase: 'done',
    title: 'Bravo',
    body: 'Ronki fühlt sich leichter. Du hast ihm was Wichtiges gezeigt.',
    mood: 'magisch',
    durationMs: 5000,
    final: true,
    cue: { icon: '✨', label: 'Geschafft' },
  },
];

// Simplified kid silhouette — shows the pose the CHILD should be doing
// per step. SVG so it scales cleanly on phones. Each phase changes the
// head + arms + mouth + breath indicator. Paired with chibi-Ronki so
// the kid sees "what I do" + "Ronki mirrors me."
function KidPose({ phase }) {
  const headR = 18;
  const cx = 80;
  const cy = 60;
  // Arm positions — arms always on knees in this pose
  const armLeftEnd = { x: 55, y: 110 };
  const armRightEnd = { x: 105, y: 110 };
  // Open mouth sizing varies per phase
  const mouthW = phase === 'open' ? 18 : phase === 'roar' ? 22 : 6;
  const mouthH = phase === 'open' ? 12 : phase === 'roar' ? 18 : 2;
  const eyeRadius = phase === 'roar' ? 3.5 : phase === 'open' ? 3 : 2;
  // Breath indicator — expanding ring at chest for inhale
  const showBreath = phase === 'inhale';
  // Radial roar lines
  const showRoar = phase === 'roar';
  // Slight shoulder drop on settle
  const shoulderY = phase === 'settle' || phase === 'done' ? 82 : 78;

  return (
    <svg viewBox="0 0 160 180" width="100%" height="100%" aria-hidden="true" style={{ maxHeight: 180 }}>
      {/* Roar radial burst */}
      {showRoar && (
        <g opacity="0.75">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line
              key={deg}
              x1={cx} y1={cy}
              x2={cx + Math.cos((deg * Math.PI) / 180) * 45}
              y2={cy + Math.sin((deg * Math.PI) / 180) * 45}
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
      {/* Inhale breath ring */}
      {showBreath && (
        <circle cx={cx} cy={110} r="22"
          fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3 4"
          style={{ animation: 'lpBreathRing 2s ease-in-out infinite' }}
        />
      )}
      {/* Torso */}
      <path
        d={`M ${cx - 22} ${shoulderY} Q ${cx} ${shoulderY - 4} ${cx + 22} ${shoulderY} L ${cx + 26} 130 Q ${cx} 134 ${cx - 26} 130 Z`}
        fill="#fef3c7"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Legs — crossed-ish */}
      <path
        d={`M ${cx - 26} 130 Q ${cx - 32} 150 ${cx - 16} 156 L ${cx + 16} 156 Q ${cx + 32} 150 ${cx + 26} 130`}
        fill="#fef3c7"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Arms — from shoulders to knees, elbows bent */}
      <path
        d={`M ${cx - 20} ${shoulderY + 4} Q ${cx - 38} 98 ${armLeftEnd.x} ${armLeftEnd.y}`}
        fill="none" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"
      />
      <path
        d={`M ${cx + 20} ${shoulderY + 4} Q ${cx + 38} 98 ${armRightEnd.x} ${armRightEnd.y}`}
        fill="none" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"
      />
      {/* "Claw" finger spreads on hands — 3 lines per hand fanning out */}
      {[-1, 0, 1].map(i => (
        <React.Fragment key={`l${i}`}>
          <line
            x1={armLeftEnd.x} y1={armLeftEnd.y}
            x2={armLeftEnd.x + i * 3} y2={armLeftEnd.y + 7 + Math.abs(i) * 1.5}
            stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"
          />
        </React.Fragment>
      ))}
      {[-1, 0, 1].map(i => (
        <React.Fragment key={`r${i}`}>
          <line
            x1={armRightEnd.x} y1={armRightEnd.y}
            x2={armRightEnd.x + i * 3} y2={armRightEnd.y + 7 + Math.abs(i) * 1.5}
            stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"
          />
        </React.Fragment>
      ))}
      {/* Head */}
      <circle cx={cx} cy={cy} r={headR} fill="#fff3c8" stroke="#1a1a1a" strokeWidth="2.2" />
      {/* Eyes */}
      <circle cx={cx - 6} cy={cy - 2} r={eyeRadius} fill="#1a1a1a" />
      <circle cx={cx + 6} cy={cy - 2} r={eyeRadius} fill="#1a1a1a" />
      {/* Mouth */}
      <ellipse cx={cx} cy={cy + 8} rx={mouthW / 2} ry={mouthH / 2}
        fill={phase === 'open' || phase === 'roar' ? '#dc2626' : '#1a1a1a'}
        stroke="#1a1a1a" strokeWidth="1.5"
      />
      {/* Tongue on roar */}
      {showRoar && (
        <path
          d={`M ${cx - 3} ${cy + 10} Q ${cx} ${cy + 20} ${cx + 3} ${cy + 10} Z`}
          fill="#f472b6" stroke="#1a1a1a" strokeWidth="1.2"
        />
      )}
      <style>{`
        @keyframes lpBreathRing {
          0%, 100% { r: 16; opacity: 0.4; }
          50%      { r: 28; opacity: 0.9; }
        }
      `}</style>
    </svg>
  );
}

export default function LoewenPoseTool({ onComplete }) {
  const { state, actions } = useTask();
  const [stepIdx, setStepIdx] = useState(0);
  const [persisted, setPersisted] = useState(false);

  const step = STEPS[stepIdx];
  const variant = state?.companionVariant || 'amber';

  // Auto-advance each step after its duration elapses
  useEffect(() => {
    if (!step) return;
    // No haptics — emotional-regulation tool. Research: a roar-synced buzz
    // competes with the breath/body attention the pose is trying to build.
    // Visual + audio carry the pose; the haptic flag on step stays for
    // future opt-in but we honor "silent during regulation" today.
    if (step.haptic) {
      SFX.play('coin');
    } else {
      SFX.play('pop');
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

      {/* Two-figure row: KidPose (what YOU do) + Ronki (mirrors you).
           Kid sees both so the imitation is explicit — not just
           "interpret Ronki's mood" which was too subtle last pass. */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, marginBottom: 18,
          width: '100%', maxWidth: 440,
        }}>
          {/* Kid silhouette — "du" */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <p style={{
              margin: '0 0 6px', fontSize: 10, fontWeight: 800,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#6d28d9',
            }}>Du</p>
            <div style={{
              width: 160, height: 180,
              padding: 8, borderRadius: 20,
              background: 'rgba(255,255,255,0.55)',
              border: '1.5px solid rgba(109,40,217,0.25)',
            }}>
              <KidPose phase={step.phase} />
            </div>
          </div>
          {/* Chibi Ronki — "Ronki macht mit" */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <p style={{
              margin: '0 0 6px', fontSize: 10, fontWeight: 800,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#6d28d9',
            }}>Ronki</p>
            <div style={{
              width: 160, height: 180,
              padding: 8, borderRadius: 20,
              background: 'rgba(255,255,255,0.55)',
              border: '1.5px solid rgba(109,40,217,0.25)',
              position: 'relative',
              display: 'grid', placeItems: 'center',
            }}>
              <div style={{
                width: 130, height: 130, position: 'relative',
                transform: step.phase === 'roar'
                  ? 'scale(1.15)'
                  : step.phase === 'open'
                    ? 'scale(1.05)'
                    : 'scale(1)',
                transition: 'transform 0.5s ease',
                filter: step.phase === 'roar'
                  ? 'drop-shadow(0 0 24px rgba(252,211,77,0.9))'
                  : step.phase === 'done'
                    ? 'drop-shadow(0 0 18px rgba(249,168,212,0.8))'
                    : 'none',
              }}>
                <MoodChibi size={130} mood={step.mood} variant={variant} stage={2} bare />
                {step.phase === 'roar' && (
                  <span aria-hidden="true" style={{
                    position: 'absolute', inset: '-40%',
                    background: 'radial-gradient(circle, rgba(252,211,77,0.55) 0%, transparent 60%)',
                    zIndex: -1,
                    animation: 'lpRoarBurst 1.4s ease-out',
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cue row — big emoji + short label for instant-read of the
             body action, above the descriptive title/body text. */}
        {step.cue && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 14px', borderRadius: 999,
            background: step.phase === 'roar'
              ? 'linear-gradient(135deg, #fcd34d, #f59e0b)'
              : 'rgba(109,40,217,0.12)',
            color: step.phase === 'roar' ? '#7c2d12' : '#6d28d9',
            marginBottom: 12,
            fontWeight: 800, fontSize: 12,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            <span style={{ fontSize: step.cue.big ? 28 : 20, lineHeight: 1 }}>
              {step.cue.icon}
            </span>
            <span>{step.cue.label}</span>
          </div>
        )}

        <p style={{
          margin: '0 0 10px',
          textAlign: 'center',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: 26, fontWeight: 600,
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
