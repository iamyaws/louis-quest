import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';

/**
 * CampfireVisitorsGame — the "spend" half of the Pikmin/ACPC compound.
 *
 * A Freund character visits Ronki's campfire at dusk. They want a
 * specific crystal-family (shown as an icon in their speech bubble).
 * Kid taps their inventory to gift. Right match → friendship +1,
 * ceremony animation, scene evolution at milestone tiers. Wrong match →
 * shy head-shake (no fail state). No visitor = "kommt morgen wieder".
 *
 * One visitor per day. Rotation logic is idempotent — calling open()
 * twice same-day doesn't re-pick. Date is the daily refresh boundary.
 *
 * Contract: <CampfireVisitorsGame onClose={() => void} />. Reads and
 * writes state.crystalInventory, state.freundFriendship, and
 * state.todaysVisitor via actions.
 */

const FAMILIES = {
  ember:   { de: 'Feuer',   core: '#fef3c7', mid: '#f97316', deep: '#dc2626', glow: 'rgba(249,115,22,0.55)' },
  lagoon:  { de: 'Wasser',  core: '#e0f2fe', mid: '#38bdf8', deep: '#0369a1', glow: 'rgba(56,189,248,0.55)' },
  meadow:  { de: 'Wiesen',  core: '#ecfccb', mid: '#84cc16', deep: '#3f6212', glow: 'rgba(132,204,22,0.55)' },
  blossom: { de: 'Blüten',  core: '#fce7f3', mid: '#ec4899', deep: '#9d174d', glow: 'rgba(236,72,153,0.55)' },
  star:    { de: 'Stern',   core: '#ffffff', mid: '#fef3c7', deep: '#f59e0b', glow: 'rgba(252,211,77,0.85)' },
};

// The visitor roster — 5 friends, each with a favorite family + dialog.
// Ordered by unlock: Drachenmutter first (tutorial), rarer friends later.
const VISITORS = [
  {
    id: 'drachenmutter',
    name: 'Drachenmutter',
    emoji: '🐉',
    favorite: 'ember',
    wish: 'Ein Feuerkristall wärmt mein Ei. Hättest du einen?',
    thanks: 'Oh, wie er leuchtet! Danke dir.',
    sceneFinal: 'Drachenmutters Nest ist richtig kuschelig geworden.',
    unlockAt: 0,
  },
  {
    id: 'pilzhueter',
    name: 'Pilzhüter',
    emoji: '🍄',
    favorite: 'meadow',
    wish: 'Mein Moos braucht einen grünen Kristall zum Wachsen.',
    thanks: 'Danke! Das Moos wird sich freuen.',
    sceneFinal: 'Der Pilz-Hain ist jetzt doppelt so hoch.',
    unlockAt: 2, // friendship(drachenmutter) >= 2
  },
  {
    id: 'eulenhueterin',
    name: 'Eulenhüterin',
    emoji: '🦉',
    favorite: 'lagoon',
    wish: 'Ein Wasserkristall für den Mond-Teich, bitte.',
    thanks: 'Perfekt. Der Teich wird heute Nacht spiegeln.',
    sceneFinal: 'Der Mond-Teich glitzert jetzt immer.',
    unlockAt: 3, // friendship(drachenmutter) >= 3
  },
  {
    id: 'wolfbruder',
    name: 'Wolfbruder',
    emoji: '🐺',
    favorite: 'blossom',
    wish: 'Die Blüten-Wiese braucht etwas Farbe.',
    thanks: 'Hab Dank. Die Wiese leuchtet jetzt.',
    sceneFinal: 'Die Blüten-Wiese blüht in allen Farben.',
    unlockAt: 2, // friendship(pilzhueter) >= 2
  },
  {
    id: 'sternenkind',
    name: 'Sternenkind',
    emoji: '✨',
    favorite: 'star',
    wish: 'Ich suche einen Sternen-Kristall. Ganz selten.',
    thanks: 'Ein Stück Himmel! Danke, ich trag ihn sicher nach Hause.',
    sceneFinal: 'Nachts kommt das Sternenkind nun regelmäßig vorbei.',
    unlockAt: 4, // rarest — needs friendship milestones AND a star crystal
  },
];

// ── Visitor frequency ────────────────────────────────────────────────
// Marc Apr 2026: "I would especially recommend for new users not to
// overwhelm them and let them settle in for 4-5 days before this
// feature gets into action and then this could be randomized."
//
// Two gates:
//   1. Settle-in period — require `totalTasksDone >= 15` before any
//      visitor appears (~3-5 days of a morning routine at 4-5 main
//      quests a day). Fresh kids get quiet evenings.
//   2. Randomized frequency — after settle-in, ~45% of days have a
//      visitor. Date-seeded so same-day reopen = same answer. Silent
//      days are a FEATURE, not a bug — matches "quiet aspiration"
//      positioning. The in-game fallback copy ("Heute ist kein Freund
//      da. Morgen kommt wieder jemand vorbei") already handles this.
const VISITOR_SETTLE_IN_TASKS = 15;
const VISITOR_FREQUENCY_PCT = 45; // 0..100

function seedHash(today) {
  // Deterministic hash per date so the randomized frequency is stable
  // within a day (reopening the game doesn't flip visitor in/out).
  const [y, m, d] = today.split('-').map(Number);
  // Simple FNV-like mix; avoids the leading-zero parseInt problem that
  // would bias toward certain day-of-month values.
  return (y * 31 + m) * 31 + d;
}

// Pick today's visitor — idempotent by date. Rotates through unlocked
// visitors using the date string as the seed so same day = same visitor.
export function pickTodaysVisitor(state, today) {
  // Gate 1 — settle-in. Fresh kid hasn't done enough routine yet; keep
  // the campfire quiet so the early app experience isn't "strangers show
  // up and want things."
  if ((state.totalTasksDone || 0) < VISITOR_SETTLE_IN_TASKS) return null;

  // Gate 2 — randomized frequency. On a given day we either have a
  // visitor or we don't, seeded by the date. No "the fox skipped
  // today, Ronki is sad" — just absence as a neutral state.
  const hash = seedHash(today);
  if ((Math.abs(hash) % 100) >= VISITOR_FREQUENCY_PCT) return null;

  const friendships = state.freundFriendship || {};
  const unlocked = VISITORS.filter(v => {
    if (v.id === 'drachenmutter') return true;
    if (v.id === 'pilzhueter')    return (friendships.drachenmutter || 0) >= 2;
    if (v.id === 'eulenhueterin') return (friendships.drachenmutter || 0) >= 3;
    if (v.id === 'wolfbruder')    return (friendships.pilzhueter || 0) >= 2;
    if (v.id === 'sternenkind')   return (friendships.eulenhueterin || 0) >= 2;
    return false;
  });
  if (unlocked.length === 0) return null;
  const idx = Math.abs(hash) % unlocked.length;
  const chosen = unlocked[idx];
  return {
    freundId: chosen.id,
    wish: chosen.favorite,
    date: today,
  };
}

export default function CampfireVisitorsGame({ onClose }) {
  const { t, lang } = useTranslation();
  const { state, actions } = useTask();

  // Today's visitor — read from state if already picked today, else pick now
  const today = new Date().toISOString().slice(0, 10);
  const [visitor, setVisitor] = useState(() => {
    const v = state?.todaysVisitor;
    if (v && v.date === today) return v;
    return pickTodaysVisitor(state || {}, today);
  });
  // Simple two-state phase — the old 'picking' intermediate was a
  // closure trap: setPhase('picking') + setTimeout(handlePickCrystal)
  // ran the handler with the stale 'greeting' closure, so it early-
  // returned. Removed. Marc saw: "drag and drop nothing happens."
  const [phase, setPhase] = useState('greeting'); // greeting | gifted
  const [wrongHint, setWrongHint] = useState(false);
  const [evolutionMsg, setEvolutionMsg] = useState(null);

  const freund = visitor ? VISITORS.find(v => v.id === visitor.freundId) : null;
  const friendshipLevel = freund ? (state?.freundFriendship || {})[freund.id] || 0 : 0;
  const wishedFam = visitor?.wish;
  const wishedColors = wishedFam ? FAMILIES[wishedFam] : null;

  const hasNone = !visitor || !freund;

  const handlePickCrystal = (family) => {
    if (!freund || !wishedFam || phase !== 'greeting') return;
    const inv = state?.crystalInventory || {};
    const have = inv[family] || 0;
    if (have <= 0) return;
    if (family !== wishedFam) {
      // Shy head-shake — no fail state
      setWrongHint(true);
      try { if (navigator.vibrate) navigator.vibrate(40); } catch (_) {}
      setTimeout(() => setWrongHint(false), 700);
      return;
    }
    // Right match → spend + gift
    const success = actions.spendCrystals?.(family, 1);
    if (!success) {
      setWrongHint(true);
      setTimeout(() => setWrongHint(false), 700);
      return;
    }
    SFX.play('coin');
    try { if (navigator.vibrate) navigator.vibrate([40, 20, 60, 20, 80]); } catch (_) {}
    actions.giftCrystalToFreund?.(freund.id);
    const nextLevel = Math.min(5, friendshipLevel + 1);
    if (nextLevel >= 5 && friendshipLevel < 5) {
      setEvolutionMsg(freund.sceneFinal);
    }
    setPhase('gifted');
  };

  const inv = state?.crystalInventory || {};

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #3a2d1e 0%, #2a2018 50%, #1a1410 100%)',
        color: '#fff8f2',
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
            textTransform: 'uppercase', color: 'rgba(252,211,77,0.7)',
          }}>
            Besuch am Lagerfeuer
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 500 }}>
            {hasNone ? 'Heute still' : freund.name}
          </p>
        </div>
        <button onClick={onClose}
          style={{
            background: 'transparent', border: 'none', color: 'rgba(252,211,77,0.7)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          Schließen
        </button>
      </header>

      {/* Scene — painterly fire + visitor */}
      <div style={{
        flex: 1,
        margin: '0 16px',
        borderRadius: 24,
        background: `
          radial-gradient(ellipse at 50% 75%, rgba(252,140,40,0.45) 0%, transparent 40%),
          linear-gradient(180deg, #3e2818 0%, #2a1a10 70%, #1a1008 100%)
        `,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Starry sky */}
        {[...Array(10)].map((_, i) => (
          <span key={i} aria-hidden="true" style={{
            position: 'absolute',
            top: `${5 + (i * 4.5)}%`,
            left: `${10 + (i * 8.5) % 85}%`,
            width: 2, height: 2, borderRadius: '50%',
            background: '#fef9c3',
            boxShadow: '0 0 4px rgba(252,211,77,0.8)',
            animation: `cvStarTwinkle ${3 + (i % 3)}s ease-in-out infinite ${i * 0.3}s`,
          }} />
        ))}

        {/* Campfire at bottom-center */}
        <div style={{
          position: 'absolute', bottom: '14%', left: '50%',
          transform: 'translateX(-50%)',
          width: 80, height: 100,
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 72, height: 18,
            background: '#4a2818',
            borderRadius: '50%',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: 16, left: '50%',
            transform: 'translateX(-50%)',
            width: 56, height: 72,
            background: 'radial-gradient(ellipse at 50% 80%, #fef3c7 0%, #f97316 40%, #dc2626 90%)',
            borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
            filter: 'drop-shadow(0 0 18px rgba(249,115,22,0.8))',
            animation: 'cvFireFlick 1.1s ease-in-out infinite',
          }} />
        </div>

        {/* Ronki on the left */}
        <div style={{
          position: 'absolute', left: '16%', bottom: '12%',
          width: 110, height: 110,
          pointerEvents: 'none',
        }}>
          <MoodChibi
            size={110}
            mood={phase === 'gifted' ? 'magisch' : 'normal'}
            variant={state?.companionVariant || 'amber'}
            stage={3}
            bare
          />
        </div>

        {/* Visitor on the right (or "kommt morgen" if none) */}
        {hasNone ? (
          <div style={{
            position: 'absolute', right: '14%', bottom: '16%',
            width: 200, textAlign: 'center',
            padding: '16px 14px',
            borderRadius: 16,
            background: 'rgba(255,248,242,0.12)',
            border: '1px solid rgba(252,211,77,0.22)',
          }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#fde68a' }}>
              Heute ist kein Freund da. Morgen kommt wieder jemand vorbei.
            </p>
          </div>
        ) : (
          <>
            {/* Visitor avatar */}
            <div style={{
              position: 'absolute', right: '14%', bottom: '14%',
              width: 100, height: 100,
              display: 'grid', placeItems: 'center',
              background: 'radial-gradient(circle at 50% 40%, rgba(252,211,77,0.22) 0%, transparent 60%)',
              animation: wrongHint ? 'cvHeadShake 0.4s ease-in-out' : 'cvVisitorBreathe 3.2s ease-in-out infinite',
              fontSize: 72,
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))',
            }}>
              {freund.emoji}
            </div>

            {/* Wish speech bubble */}
            {phase === 'greeting' && (
              <div style={{
                position: 'absolute', right: '28%', bottom: '54%',
                maxWidth: 260,
                padding: '12px 16px',
                borderRadius: '18px 18px 4px 18px',
                background: '#fff8f2',
                color: '#1e2a36',
                fontSize: 14, lineHeight: 1.4,
                boxShadow: '0 10px 24px -8px rgba(0,0,0,0.55)',
                animation: 'cvBubbleIn 0.3s ease-out',
              }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{freund.wish}</p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: `${wishedColors.glow}`,
                  border: `1px solid ${wishedColors.mid}`,
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: `radial-gradient(circle at 40% 30%, ${wishedColors.core}, ${wishedColors.mid}, ${wishedColors.deep})`,
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: wishedColors.deep }}>
                    {wishedColors.de}
                  </span>
                </div>
              </div>
            )}

            {/* Gifted thank-you */}
            {phase === 'gifted' && (
              <div style={{
                position: 'absolute', right: '28%', bottom: '54%',
                maxWidth: 260,
                padding: '12px 16px',
                borderRadius: '18px 18px 4px 18px',
                background: 'linear-gradient(135deg, #fff8f2 0%, #fef3c7 100%)',
                color: '#1e2a36',
                fontSize: 14, lineHeight: 1.4,
                boxShadow: `0 10px 24px -8px ${wishedColors.glow}`,
                border: `1.5px solid ${wishedColors.mid}`,
                animation: 'cvBubbleIn 0.3s ease-out',
              }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{freund.thanks}</p>
              </div>
            )}

            {/* Evolution flourish — on reaching friendship 5 */}
            {evolutionMsg && (
              <div style={{
                position: 'absolute', left: '50%', top: '8%',
                transform: 'translateX(-50%)',
                padding: '10px 18px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                color: '#2d1638',
                fontWeight: 800, fontSize: 12,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                boxShadow: '0 12px 28px -8px rgba(252,211,77,0.6)',
              }}>
                ✨ {evolutionMsg}
              </div>
            )}

            {/* Friendship hearts meter */}
            <div style={{
              position: 'absolute', right: '10%', bottom: '6%',
              display: 'flex', gap: 3,
            }}>
              {[0,1,2,3,4].map(i => (
                <span key={i} style={{
                  fontSize: 14,
                  filter: i < friendshipLevel ? 'none' : 'grayscale(1) opacity(0.35)',
                }}>❤️</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Inventory / action row */}
      {!hasNone && phase === 'greeting' && (
        <div style={{
          padding: '14px 20px 10px',
          textAlign: 'center',
        }}>
          <p style={{
            margin: '0 0 12px',
            fontSize: 11, letterSpacing: '0.2em', fontWeight: 800,
            textTransform: 'uppercase', color: 'rgba(252,211,77,0.6)',
          }}>
            Tippe einen Kristall — zum Verschenken
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            {['ember', 'lagoon', 'meadow', 'blossom', 'star'].map(fam => {
              const have = inv[fam] || 0;
              if (have === 0) return null;
              const c = FAMILIES[fam];
              return (
                <button key={fam}
                  onClick={() => handlePickCrystal(fam)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px',
                    borderRadius: 999,
                    border: `1.5px solid ${c.mid}`,
                    background: `radial-gradient(circle at 30% 30%, ${c.glow}, rgba(0,0,0,0.25))`,
                    color: '#fff',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontWeight: 800, fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: `0 6px 14px -4px ${c.glow}`,
                  }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: `radial-gradient(circle at 40% 30%, ${c.core}, ${c.mid}, ${c.deep})`,
                    boxShadow: `0 0 6px ${c.glow}`,
                  }} />
                  <span>{c.de}</span>
                  <span style={{
                    padding: '2px 7px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.22)',
                    fontSize: 11,
                  }}>{have}</span>
                </button>
              );
            })}
          </div>
          {Object.values(inv).reduce((a, b) => a + b, 0) === 0 && (
            <p style={{
              marginTop: 14, fontSize: 12, color: 'rgba(252,211,77,0.5)',
              fontStyle: 'italic',
            }}>
              Du hast noch keine Kristalle. Grab welche in der Höhle aus!
            </p>
          )}
        </div>
      )}

      {phase === 'gifted' && (
        <div style={{ padding: '14px 20px 24px', textAlign: 'center' }}>
          <button onClick={onClose}
            style={{
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

      <style>{`
        @keyframes cvFireFlick {
          0%, 100% { transform: translateX(-50%) scaleY(1) scaleX(1); }
          50%      { transform: translateX(-50%) scaleY(1.06) scaleX(0.95); }
        }
        @keyframes cvStarTwinkle {
          0%, 100% { opacity: 0.5; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes cvVisitorBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }
        @keyframes cvHeadShake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-8px); }
          75%      { transform: translateX(8px); }
        }
        @keyframes cvBubbleIn {
          from { opacity: 0; transform: translateY(6px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
