import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';

/**
 * KraftwortTool — daily power-word affirmation for 'magisch' mood.
 *
 * Second tool in the emotional library (see
 * project_emotional_tool_library.md). Kid picks a Kraftwort today
 * from a small set; Ronki echoes it back with a glow; it appears
 * as the day's banner on the Hub chip until midnight.
 *
 * Hidden curriculum: identity-based self-talk. Replaces
 * "be more X" (performance frame) with "ich bin X heute" (identity
 * frame), which is what sticks past age 10 per the self-affirmation
 * literature. 30s total.
 *
 * Same skill-learning pattern as Box-Atmung + Drei-Danke:
 *   · Bumps state.ronkiSkillPractice.kraftwort
 *   · At 5 practices Ronki "learns" and can offer it back
 *
 * Also persists today's pick to state.todaysKraftwort so the Hub
 * can surface it in an ambient chip.
 *
 * Contract: <KraftwortTool onComplete={() => void} />.
 */

const KRAFTWOERTER = [
  { id: 'mutig',      label: 'mutig',      emoji: '🦁' },
  { id: 'geduldig',   label: 'geduldig',   emoji: '🌱' },
  { id: 'klug',       label: 'klug',       emoji: '🦉' },
  { id: 'freundlich', label: 'freundlich', emoji: '🧡' },
  { id: 'tapfer',     label: 'tapfer',     emoji: '⚔️' },
  { id: 'ruhig',      label: 'ruhig',      emoji: '🌊' },
];

export default function KraftwortTool({ onComplete }) {
  const { state, actions } = useTask();
  const [picked, setPicked] = useState(null);
  const [phase, setPhase] = useState('picking'); // picking | echoed

  const variant = state?.companionVariant || 'amber';

  const handlePick = (word) => {
    if (phase !== 'picking') return;
    SFX.play('pop');
    try { if (navigator.vibrate) navigator.vibrate(30); } catch (_) {}
    setPicked(word);
    // Briefly show picked state, then Ronki echoes
    setTimeout(() => {
      SFX.play('coin');
      try { if (navigator.vibrate) navigator.vibrate([40, 30, 80]); } catch (_) {}
      setPhase('echoed');
      // Persist — practice counter + today's kraftwort for Hub pickup
      const today = new Date().toISOString().slice(0, 10);
      const prevPractice = state?.ronkiSkillPractice?.kraftwort || 0;
      const nextPractice = Math.min(5, prevPractice + 1);
      const patch = {
        ronkiSkillPractice: {
          ...(state?.ronkiSkillPractice || {}),
          kraftwort: nextPractice,
        },
        todaysKraftwort: { word: word.id, label: word.label, emoji: word.emoji, date: today },
      };
      if (nextPractice >= 5 && !(state?.ronkiLearnedSkills || []).includes('kraftwort')) {
        patch.ronkiLearnedSkills = [
          ...(state?.ronkiLearnedSkills || []),
          'kraftwort',
        ];
      }
      actions.patchState?.(patch);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #fce7f3 0%, #fff8f2 50%, #fce7f3 100%)',
        color: '#124346',
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
            textTransform: 'uppercase', color: '#be185d',
          }}>
            Kraftwort
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 20, fontWeight: 500 }}>
            Welches Wort trägt dich heute?
          </p>
        </div>
        <button onClick={onComplete}
          style={{
            background: 'transparent', border: 'none', color: 'rgba(190,24,93,0.7)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          Schließen
        </button>
      </header>

      {/* Ronki above, chips below */}
      <div style={{
        flex: 1,
        padding: '16px 20px 24px',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{
            width: 160, height: 160,
            position: 'relative',
            filter: phase === 'echoed' ? 'drop-shadow(0 0 20px rgba(252,211,77,0.8))' : 'none',
            transition: 'filter 0.4s',
          }}>
            <MoodChibi size={160} mood={phase === 'echoed' ? 'magisch' : 'normal'} variant={variant} stage={2} bare />
          </div>
        </div>

        {phase === 'picking' && (
          <>
            <p style={{
              textAlign: 'center',
              margin: '8px 0 20px',
              fontSize: 14, lineHeight: 1.55, color: 'rgba(18,67,70,0.7)',
            }}>
              Wähle ein Wort. Ronki wiederholt es für dich — dein Wort für heute.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              maxWidth: 520,
              margin: '0 auto',
              width: '100%',
            }}>
              {KRAFTWOERTER.map(w => {
                const isPicked = picked?.id === w.id;
                return (
                  <button key={w.id}
                    onClick={() => handlePick(w)}
                    disabled={phase !== 'picking'}
                    style={{
                      padding: '16px 14px',
                      borderRadius: 18,
                      border: isPicked ? '2px solid #be185d' : '1.5px solid rgba(190,24,93,0.22)',
                      background: isPicked
                        ? 'linear-gradient(135deg, #fbcfe8, #f9a8d4)'
                        : '#fff',
                      boxShadow: isPicked
                        ? '0 12px 28px -8px rgba(190,24,93,0.55)'
                        : '0 4px 10px rgba(190,24,93,0.08)',
                      cursor: phase === 'picking' ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      transform: isPicked ? 'translateY(-3px)' : 'none',
                    }}>
                    <div style={{ fontSize: 30, lineHeight: 1 }}>{w.emoji}</div>
                    <div style={{
                      margin: '8px 0 0',
                      fontFamily: 'Fredoka, sans-serif',
                      fontWeight: 600, fontSize: 18,
                      color: isPicked ? '#9d174d' : '#124346',
                      letterSpacing: '-0.01em',
                    }}>
                      {w.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {phase === 'echoed' && picked && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 18, marginTop: 20,
          }}>
            <p style={{
              margin: 0,
              fontFamily: 'Fredoka, sans-serif',
              fontSize: 16, fontWeight: 500, color: 'rgba(18,67,70,0.7)',
            }}>
              Ronki sagt:
            </p>
            <p style={{
              margin: 0,
              fontFamily: 'Fredoka, sans-serif',
              fontSize: 46, fontWeight: 600,
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.02em',
              animation: 'kwEcho 0.7s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              Ich bin {picked.label}.
            </p>
            <p style={{
              margin: 0,
              fontSize: 14, lineHeight: 1.55, color: 'rgba(18,67,70,0.6)',
              textAlign: 'center', maxWidth: 320,
            }}>
              Das ist dein Wort für heute. Erinnerst du dich daran, wenn es schwer wird.
            </p>
            <button onClick={onComplete}
              style={{
                marginTop: 8,
                padding: '14px 28px', borderRadius: 999,
                border: 'none',
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                color: '#fff',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800, fontSize: 13, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                boxShadow: '0 10px 24px -6px rgba(236,72,153,0.55)',
                cursor: 'pointer',
              }}>
              Los geht's
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes kwEcho {
          0%   { opacity: 0; transform: scale(0.6); }
          60%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
