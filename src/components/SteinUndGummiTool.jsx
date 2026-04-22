import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';

/**
 * SteinUndGummiTool — progressive muscle relaxation for 'tired' mood.
 *
 * Body-scan guided flow, head to toes. Each body part:
 *   1. "Werde fest wie ein Stein" (tense 3s)
 *   2. "Und jetzt weich wie ein Gummibärchen" (release 3s)
 *
 * Ronki visibly tenses + releases alongside. Kid mirrors. Teaches
 * somatic awareness + the skill of intentionally releasing tension,
 * which is the cornerstone of the jacobson PMR literature for kids.
 *
 * Ships 6 body parts so a full session is ~90s. Enough rhythm to
 * settle, short enough that first-graders don't bail.
 *
 * Same skill-learning pattern as the rest of the tool library:
 *   · Bumps state.ronkiSkillPractice.steinUndGummi
 *   · Learns at 5 practices
 *
 * Contract: <SteinUndGummiTool onComplete={() => void} />.
 */

const BODY_PARTS = [
  { id: 'head',      name: 'Kopf',       hint: 'Augen fest zu, Stirn runzeln.',            bodyEmoji: '🧠' },
  { id: 'shoulders', name: 'Schultern',  hint: 'Zieh die Schultern zu den Ohren hoch.',    bodyEmoji: '💪' },
  { id: 'arms',      name: 'Arme',       hint: 'Fäuste ballen, Arme anspannen.',           bodyEmoji: '✊' },
  { id: 'tummy',     name: 'Bauch',      hint: 'Bauch ganz fest einziehen.',               bodyEmoji: '🫃' },
  { id: 'legs',      name: 'Beine',      hint: 'Beine strecken, Knie durchdrücken.',       bodyEmoji: '🦵' },
  { id: 'feet',      name: 'Füße',       hint: 'Zehen krallen, Fußsohlen fest.',           bodyEmoji: '🦶' },
];

// Each part has 3 phases: tense (3s) → release (3s) → pause (1s).
// Plus an intro + close.
const STEP_DURATION_TENSE   = 3000;
const STEP_DURATION_RELEASE = 3000;
const STEP_DURATION_PAUSE   = 800;

export default function SteinUndGummiTool({ onComplete }) {
  const { state, actions } = useTask();
  // phase: 'intro' | 'tense' | 'release' | 'done'
  const [phase, setPhase] = useState('intro');
  const [partIdx, setPartIdx] = useState(0);
  const [persisted, setPersisted] = useState(false);

  const variant = state?.companionVariant || 'amber';
  const part = BODY_PARTS[partIdx];

  // State machine — intro → (tense → release → pause) × bodyParts → done
  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('tense'), 2800);
      return () => clearTimeout(t);
    }
    if (phase === 'tense') {
      SFX.play('pop');
      try { if (navigator.vibrate) navigator.vibrate(30); } catch (_) {}
      const t = setTimeout(() => setPhase('release'), STEP_DURATION_TENSE);
      return () => clearTimeout(t);
    }
    if (phase === 'release') {
      SFX.play('pop');
      try { if (navigator.vibrate) navigator.vibrate([20, 40, 20]); } catch (_) {}
      const t = setTimeout(() => {
        // Pause briefly, then advance to next body part or finish
        setTimeout(() => {
          if (partIdx < BODY_PARTS.length - 1) {
            setPartIdx(i => i + 1);
            setPhase('tense');
          } else {
            setPhase('done');
          }
        }, STEP_DURATION_PAUSE);
      }, STEP_DURATION_RELEASE);
      return () => clearTimeout(t);
    }
    if (phase === 'done' && !persisted) {
      setPersisted(true);
      SFX.play('coin');
      try { if (navigator.vibrate) navigator.vibrate([40, 30, 120]); } catch (_) {}
      // Persist practice + learn at 5
      const prevPractice = state?.ronkiSkillPractice?.steinUndGummi || 0;
      const nextPractice = Math.min(5, prevPractice + 1);
      const patch = {
        ronkiSkillPractice: {
          ...(state?.ronkiSkillPractice || {}),
          steinUndGummi: nextPractice,
        },
      };
      if (nextPractice >= 5 && !(state?.ronkiLearnedSkills || []).includes('steinUndGummi')) {
        patch.ronkiLearnedSkills = [
          ...(state?.ronkiLearnedSkills || []),
          'steinUndGummi',
        ];
      }
      actions.patchState?.(patch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, partIdx]);

  const totalSteps = BODY_PARTS.length * 2 + 2; // intro + (tense+release)×6 + done
  const stepNow = phase === 'intro'
    ? 0
    : phase === 'done'
      ? totalSteps
      : 1 + partIdx * 2 + (phase === 'tense' ? 0 : 1);
  const progress = stepNow / totalSteps;

  // Ronki mood + scale per phase
  const ronkiMood =
    phase === 'tense'   ? 'besorgt' :
    phase === 'release' ? 'normal'  :
    phase === 'done'    ? 'magisch' :
    'tired';
  const ronkiScale =
    phase === 'tense'   ? 0.92 :
    phase === 'release' ? 1.05 :
    phase === 'done'    ? 1.08 :
    1.0;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #cffafe 0%, #fff8f2 50%, #cffafe 100%)',
        color: '#0e7490',
        fontFamily: 'Nunito, system-ui, sans-serif',
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
            textTransform: 'uppercase', color: '#0e7490',
          }}>
            Stein und Gummi
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 500, color: '#0c4a6e' }}>
            Ronki wird ganz locker
          </p>
        </div>
        <button onClick={onComplete}
          style={{
            background: 'transparent', border: 'none', color: 'rgba(14,116,144,0.7)',
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
          background: 'rgba(14,116,144,0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, #22d3ee, #0e7490)',
            borderRadius: 999,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Main area — Ronki + current body part */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: 200, height: 200,
          position: 'relative',
          transform: `scale(${ronkiScale})`,
          transition: phase === 'tense'
            ? 'transform 0.3s cubic-bezier(0.68,-0.55,0.27,1.55)'
            : 'transform 0.6s ease-out',
          filter: phase === 'done'
            ? 'drop-shadow(0 0 24px rgba(252,211,77,0.85))'
            : 'none',
        }}>
          <MoodChibi size={200} mood={ronkiMood} variant={variant} stage={2} bare />
          {/* Body-part highlight — soft halo on the corresponding area */}
          {(phase === 'tense' || phase === 'release') && (
            <span aria-hidden="true" style={{
              position: 'absolute',
              left: '50%',
              top: part.id === 'head' ? '8%' :
                   part.id === 'shoulders' ? '28%' :
                   part.id === 'arms' ? '38%' :
                   part.id === 'tummy' ? '52%' :
                   part.id === 'legs' ? '72%' :
                   '88%',
              transform: 'translate(-50%, -50%)',
              width: 80, height: 60,
              background: phase === 'tense'
                ? 'radial-gradient(ellipse, rgba(244,114,182,0.55) 0%, transparent 65%)'
                : 'radial-gradient(ellipse, rgba(134,239,172,0.55) 0%, transparent 65%)',
              filter: 'blur(4px)',
              transition: 'background 0.4s',
            }} />
          )}
        </div>

        <p style={{
          margin: '32px 0 8px',
          textAlign: 'center',
          fontSize: 10, letterSpacing: '0.22em', fontWeight: 800,
          textTransform: 'uppercase', color: '#0e7490',
        }}>
          {phase === 'intro'   && 'Bereit?'}
          {phase === 'tense'   && part && `${part.bodyEmoji} ${part.name} · fest`}
          {phase === 'release' && part && `${part.bodyEmoji} ${part.name} · locker`}
          {phase === 'done'    && 'Fertig'}
        </p>

        <p style={{
          margin: 0,
          textAlign: 'center',
          fontFamily: 'Fredoka, sans-serif',
          fontSize: 30, fontWeight: 600,
          color: '#0c4a6e',
          letterSpacing: '-0.02em',
          textWrap: 'balance',
        }}>
          {phase === 'intro'   && 'Stein und Gummi'}
          {phase === 'tense'   && 'Werde fest wie ein Stein'}
          {phase === 'release' && 'Ganz weich wie ein Gummibärchen'}
          {phase === 'done'    && 'Schau, wie locker er ist.'}
        </p>

        <p style={{
          margin: '14px 0 0',
          textAlign: 'center',
          fontSize: 14, lineHeight: 1.55,
          color: 'rgba(14,116,144,0.7)',
          maxWidth: 360,
        }}>
          {phase === 'intro'   && 'Wir gehen durch deinen ganzen Körper. Ronki macht mit dir mit.'}
          {phase === 'tense'   && part && part.hint}
          {phase === 'release' && 'Lass los. Fühl den Unterschied.'}
          {phase === 'done'    && 'Du hast ihm etwas Wichtiges beigebracht.'}
        </p>

        {phase === 'done' && (
          <button onClick={onComplete}
            style={{
              marginTop: 28,
              padding: '14px 28px', borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, #22d3ee, #0e7490)',
              color: '#fff',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 800, fontSize: 13, letterSpacing: '0.14em',
              textTransform: 'uppercase',
              boxShadow: '0 10px 24px -6px rgba(14,116,144,0.55)',
              cursor: 'pointer',
            }}>
            Fertig
          </button>
        )}
      </div>
    </div>
  );
}
