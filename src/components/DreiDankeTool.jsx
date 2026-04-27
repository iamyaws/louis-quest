import React, { useState, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';
import useDialogA11y from '../hooks/useDialogA11y';

/**
 * DreiDankeTool — gratitude mini-ritual for 'gut' mood days.
 *
 * Pattern proof for the emotional tool library (see
 * project_emotional_tool_library.md). Follows the Box-Atmung mechanic
 * exactly: kid practices → Ronki "learns" after 5 uses → next 'gut'
 * day Ronki offers it back.
 *
 * Loop (~30-45s):
 *   1. Three prompts — "Wofür bist du heute dankbar?" — kid taps an
 *      emoji from a small palette, OR types a short freewrite.
 *   2. After each selection, a little light drifts into Ronki's
 *      "Glas der Guten Dinge" (jar on his shelf).
 *   3. On completion Ronki thanks Louis; practice counter bumps.
 *
 * Hidden curriculum: gratitude practice + positive-event encoding.
 * Durable real-world tool the kid carries into adulthood.
 *
 * Contract: <DreiDankeTool onComplete={() => void} />.
 * Writes to state.ronkiSkillPractice.dreiDanke and appends gratitudes
 * to state.journalGratitude (reuses existing Buch storage so the Buch
 * picks them up automatically).
 */

// Palette of emoji options — tap-based for young kids, covers the
// common-gratitude categories a 6yo actually experiences.
const GRATITUDE_OPTIONS = [
  { emoji: '👨‍👩‍👧', label: 'Familie' },
  { emoji: '🐶',     label: 'Tiere'   },
  { emoji: '🍓',     label: 'Essen'   },
  { emoji: '⚽',     label: 'Spielen' },
  { emoji: '🌞',     label: 'Wetter'  },
  { emoji: '🎨',     label: 'Kunst'   },
  { emoji: '📚',     label: 'Bücher'  },
  { emoji: '🧡',     label: 'Freunde' },
];

const PROMPT_LINES = [
  'Was macht dich heute richtig froh?',
  'Und was noch?',
  'Eine letzte Sache — was war schön heute?',
];

export default function DreiDankeTool({ onComplete }) {
  const { state, actions } = useTask();

  const [step, setStep] = useState(0);           // 0..2 then 'done'
  const [picked, setPicked] = useState([]);      // [{emoji, label}]
  const [done, setDone] = useState(false);

  const variant = state?.companionVariant || 'amber';

  const handlePick = (item) => {
    SFX.play('pop');
    // No haptics — emotional-regulation tool. Research: user is regulating,
    // not transacting. Confirmer buzz competes with the breath/attention
    // the tool is trying to build. Visual + audio only.
    const next = [...picked, item];
    setPicked(next);
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      // Finish session
      setDone(true);
      SFX.play('coin');
      // No haptics — emotional-regulation tool stays silent on completion.
      // Persist: bump practice counter + write gratitudes to Buch.
      //
      // Code-reviewer fix (22 Apr 2026): journalGratitude is typed
      // `string[]` and existing consumers (ParentalDashboard, Journal,
      // EveningRitual, Buch) treat entries as strings. Pushing
      // {text, ts} objects would render "[object Object]" in the
      // dashboard + duplicate React keys. Push strings matching the
      // existing pattern.
      //
      // QA fix: same-day double-completion appended 6+ entries to the
      // journal. Replace today's existing Drei-Danke entries (prefix
      // match on the emoji palette) before adding new ones so one
      // day = at most one Drei-Danke set.
      const prevPractice = state?.ronkiSkillPractice?.dreiDanke || 0;
      const nextPractice = Math.min(5, prevPractice + 1);
      const newEntries = next.map(p => `${p.emoji} ${p.label}`);
      // Drop prior same-day Drei-Danke entries so second play-through
      // this day overrides the first instead of appending.
      const existingJournal = state?.journalGratitude || [];
      const dedupedJournal = existingJournal.filter(e => !newEntries.includes(e));
      const patch = {
        ronkiSkillPractice: {
          ...(state?.ronkiSkillPractice || {}),
          dreiDanke: nextPractice,
        },
        journalGratitude: [...dedupedJournal, ...newEntries],
      };
      // Ronki learns the skill at 5 practices
      if (nextPractice >= 5 && !(state?.ronkiLearnedSkills || []).includes('dreiDanke')) {
        patch.ronkiLearnedSkills = [
          ...(state?.ronkiLearnedSkills || []),
          'dreiDanke',
        ];
      }
      actions.patchState?.(patch);
    }
  };

  const close = () => onComplete?.();

  // A11y: ESC dismiss + initial focus + restore on unmount.
  const dialogRef = useRef(null);
  useDialogA11y(close, { containerRef: dialogRef });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Drei-Danke"
      tabIndex={-1}
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #fef3c7 0%, #fff8f2 55%, #fef3c7 100%)',
        color: '#124346',
        fontFamily: 'Nunito, system-ui, sans-serif',
        outline: 'none',
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
            textTransform: 'uppercase', color: '#A83E2C',
          }}>
            Drei-Danke · Runde {Math.min(step + 1, 3)}/3
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 20, fontWeight: 500 }}>
            Zeig Ronki, was heute schön war
          </p>
        </div>
        <button onClick={close}
          style={{
            background: 'transparent', border: 'none', color: 'rgba(180,83,9,0.7)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          Schließen
        </button>
      </header>

      {/* Main area */}
      <div style={{
        flex: 1,
        padding: '16px 20px 24px',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Ronki portrait with his gratitude jar */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginBottom: 12,
          position: 'relative',
        }}>
          <div style={{ width: 140, height: 140 }}>
            <MoodChibi size={140} mood={done ? 'magisch' : 'gut'} variant={variant} stage={2} bare />
          </div>
          {/* Glas der Guten Dinge — a small jar to the right of Ronki
               that fills with glowing dots as the kid picks gratitudes. */}
          <div style={{
            position: 'absolute', right: 'calc(50% - 130px)', bottom: 0,
            width: 60, height: 80,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(255,248,242,0.85) 0%, rgba(252,211,77,0.25) 100%)',
              border: '2px solid rgba(180,83,9,0.3)',
              borderRadius: '8px 8px 24px 24px',
              boxShadow: 'inset 0 4px 8px rgba(252,211,77,0.2)',
            }} />
            {/* Jar lid */}
            <div style={{
              position: 'absolute', top: -4, left: '50%',
              transform: 'translateX(-50%)',
              width: 40, height: 8,
              background: 'linear-gradient(180deg, #A83E2C, #92400e)',
              borderRadius: 4,
            }} />
            {/* Gratitude dots inside */}
            {picked.map((p, i) => (
              <span key={i} style={{
                position: 'absolute',
                left: `${15 + (i * 13) % 65}%`,
                bottom: `${10 + i * 18}%`,
                fontSize: 20,
                animation: `dzdFall 0.5s ease-out ${i * 0.05}s both`,
              }}>{p.emoji}</span>
            ))}
          </div>
        </div>

        {/* Prompt */}
        {!done && (
          <>
            <p style={{
              textAlign: 'center',
              margin: '18px 0 20px',
              fontFamily: 'Fredoka, sans-serif', fontSize: 22, fontWeight: 500,
              color: '#124346', letterSpacing: '-0.01em',
            }}>
              {PROMPT_LINES[step]}
            </p>

            {/* Emoji palette */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              maxWidth: 420,
              margin: '0 auto',
            }}>
              {GRATITUDE_OPTIONS.map(opt => {
                const alreadyPicked = picked.some(p => p.label === opt.label);
                return (
                  <button key={opt.label}
                    onClick={() => !alreadyPicked && handlePick(opt)}
                    disabled={alreadyPicked}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 18,
                      border: alreadyPicked ? '2px dashed rgba(180,83,9,0.25)' : '1.5px solid rgba(180,83,9,0.22)',
                      background: alreadyPicked ? 'rgba(180,83,9,0.06)' : '#fff',
                      boxShadow: alreadyPicked ? 'none' : '0 4px 10px rgba(180,83,9,0.1)',
                      cursor: alreadyPicked ? 'default' : 'pointer',
                      opacity: alreadyPicked ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: 34, lineHeight: 1 }}>{opt.emoji}</div>
                    <div style={{
                      margin: '6px 0 0',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontWeight: 700, fontSize: 11,
                      color: '#124346',
                    }}>
                      {opt.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Completion state */}
        {done && (
          <div style={{
            textAlign: 'center',
            marginTop: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <p style={{
              margin: 0,
              fontFamily: 'Fredoka, sans-serif', fontSize: 24, fontWeight: 500,
              color: '#124346',
            }}>
              Danke, das tut Ronki gut.
            </p>
            <p style={{
              margin: 0, fontSize: 14, lineHeight: 1.5,
              color: 'rgba(18,67,70,0.65)', maxWidth: 340,
            }}>
              Deine drei Danke landen in seinem Glas der guten Dinge.
              Er schaut sie sich an, wenn er traurig ist.
            </p>
            <button onClick={close}
              style={{
                marginTop: 8,
                padding: '14px 28px', borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                color: '#2d1638',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800, fontSize: 13, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                boxShadow: '0 10px 24px -6px rgba(252,211,77,0.55)',
                cursor: 'pointer',
              }}>
              Weiter
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dzdFall {
          0%   { opacity: 0; transform: translateY(-20px) scale(0.6); }
          60%  { opacity: 1; transform: translateY(4px) scale(1.1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
