import React, { useEffect, useRef, useState } from 'react';
import { useTask } from '../../context/TaskContext';

/**
 * Expedition — the Reise surface (Drachennest, 25 Apr 2026).
 *
 * Direct port of the FEATURE 3 spec from the Ronki Feature Previews
 * design file. State machine:
 *
 *   home    — Ronki at the campfire, ritual % visible, CTA hint.
 *   leaving — Triggered when morning ritual hits 100%. Walk-out
 *             animation (~2.5s) carries Ronki off-frame, then we
 *             flip to 'away' via rangerDeparted() which sets
 *             departedAt + returnAt + pendingMemento.
 *   away    — Ronki gone. Folded map placeholder + paw-trail visible
 *             on the log. A polling effect checks every 30s; once
 *             now > returnAt we flip to 'waiting' via rangerArrived().
 *   waiting — Ronki returned. Glowing diary at the campfire pulses;
 *             tap opens the diary modal. Closing the modal calls
 *             receiveMemento(), which pushes pendingMemento into the
 *             expeditionLog and resets state to 'home'.
 *
 * v1 scope (per spec):
 *  - One biome: Morgenwald.
 *  - One memento per return.
 *  - No 'night-away' yet — that's a follow-up.
 *
 * Dev affordance: ?expedition=home|leaving|away|waiting forces a
 * state for QA so all four screens are reachable without waiting on
 * real timestamps. DEV-only.
 */

export default function Expedition({ onClose }) {
  const { state, actions } = useTask();
  const expedition = state?.expedition || { state: 'home', biome: 'morgenwald' };
  const log = state?.expeditionLog || [];

  const [showDiary, setShowDiary] = useState(false);
  // Local "diary just received the bar fill" trigger so the progress
  // bar inside the diary modal animates in after mount, matching the
  // spec.
  const [diaryFillKey, setDiaryFillKey] = useState(0);

  // Dev URL param: force a state for QA. One-shot on mount so the
  // forced value isn't reapplied on every re-render.
  const devForcedRef = useRef(false);
  useEffect(() => {
    if (devForcedRef.current) return;
    if (typeof window === 'undefined' || !import.meta.env?.DEV) return;
    const p = new URLSearchParams(window.location.search).get('expedition');
    if (!p) return;
    devForcedRef.current = true;
    if (p === 'home') {
      actions.setExpedition?.({ state: 'home', biome: 'morgenwald' });
    } else if (p === 'leaving') {
      actions.setExpedition?.({ state: 'leaving', biome: 'morgenwald' });
    } else if (p === 'away') {
      actions.rangerDeparted?.();
    } else if (p === 'waiting') {
      // Force a return: depart, then arrive, then bypass the wait.
      actions.rangerDeparted?.();
      setTimeout(() => actions.rangerArrived?.(), 50);
    }
  }, [actions]);

  // 'leaving' → 'away' transition: the walk-out animation runs ~2.4s,
  // then we hand off to the reducer (which stamps departedAt +
  // returnAt + pendingMemento). Guarded so re-renders during the
  // animation don't double-trigger.
  const departingRef = useRef(false);
  useEffect(() => {
    if (expedition.state !== 'leaving') {
      departingRef.current = false;
      return;
    }
    if (departingRef.current) return;
    departingRef.current = true;
    const t = setTimeout(() => {
      actions.rangerDeparted?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [expedition.state, actions]);

  // 'away' → 'waiting' poll: once a minute, check if now > returnAt.
  // Cheap; the surface is rarely on-screen for long.
  useEffect(() => {
    if (expedition.state !== 'away') return;
    const tick = () => {
      const target = expedition.returnAt ? new Date(expedition.returnAt).getTime() : 0;
      if (target && Date.now() >= target) {
        actions.rangerArrived?.();
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [expedition.state, expedition.returnAt, actions]);

  const morningQuests = (state?.quests || []).filter(q => q.anchor === 'morning');
  const morningDone = morningQuests.filter(q => q.done).length;
  const morningTotal = morningQuests.length;
  const morningPct = morningTotal > 0 ? Math.round((morningDone / morningTotal) * 100) : 0;
  const ritualDone = morningTotal > 0 && morningDone === morningTotal;

  // Status strip copy per state. Mirrors the spec's CAMP_STATES table.
  const statusByState = {
    home:    { biome: '🌲', title: '',                              sub: '' },
    leaving: { biome: '🌲', title: 'Ronki packt den Rucksack.',     sub: 'Bis zum Nachmittag' },
    away:    { biome: '🌲', title: 'Ronki ist im Morgenwald.',      sub: returnLabel(expedition.returnAt) },
    waiting: { biome: '✉️', title: 'Ronki ist zurück.',             sub: 'Er hat etwas mitgebracht' },
  };
  const status = statusByState[expedition.state] || statusByState.home;

  const titleByState = {
    home:    'Guten Morgen.',
    leaving: 'Bis zum Nachmittag.',
    away:    'Ronki ist unterwegs.',
    waiting: 'Etwas Neues wartet.',
  };

  const ctaSubByState = {
    home:    'Wenn fertig, zieht Ronki los',
    leaving: 'Ronki ist gleich unterwegs',
    away:    'Das Ritual ist fertig',
    waiting: 'Tipp auf die Seite',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'linear-gradient(180deg, #fff8f2 0%, #f5e3c1 100%)',
        overflowY: 'auto',
        fontFamily: '"Nunito", sans-serif',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Back chrome */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px',
        background: 'linear-gradient(180deg, rgba(255,248,242,0.95), rgba(255,248,242,0.7) 70%, rgba(255,248,242,0))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zurück ins Zimmer"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 999,
            background: '#ffffff',
            border: '1.5px solid rgba(180,83,9,0.18)',
            color: '#124346',
            font: '700 12px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.06em',
            boxShadow: '0 4px 10px -4px rgba(18,67,70,0.18)',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Zurück
        </button>
        <div style={{
          font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#b45309',
        }}>
          Ronkis Reise
        </div>
        <div style={{ width: 76 }} aria-hidden="true" />
      </div>

      {/* ── Campfire scene ── */}
      <CampfireScene
        expState={expedition.state}
        biome={expedition.biome}
        onTapDiary={() => { setShowDiary(true); setDiaryFillKey(k => k + 1); }}
        status={status}
      />

      {/* ── Below-fold ── */}
      <section style={{ padding: '18px 18px 32px' }}>
        <div style={{
          textAlign: 'center',
          paddingBottom: 14,
          borderBottom: '1px solid rgba(18,67,70,0.06)',
          marginBottom: 18,
        }}>
          <div style={{
            font: '600 10px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(18,67,70,0.55)',
            marginBottom: 4,
          }}>
            Lagerfeuer
          </div>
          <h2 style={{
            margin: 0,
            font: '500 24px/1.1 "Fredoka", sans-serif',
            color: '#124346',
            letterSpacing: '-0.01em',
          }}>
            {titleByState[expedition.state]}
          </h2>
        </div>

        {/* Ritual row */}
        <div style={{
          padding: '14px 16px',
          borderRadius: 16,
          background: '#fff',
          border: '1px solid rgba(18,67,70,0.08)',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            display: 'grid', placeItems: 'center',
            background: ritualDone
              ? 'linear-gradient(160deg, #a7f3d0, #10b981)'
              : 'linear-gradient(160deg, #fef3c7, #fcd34d)',
            color: ritualDone ? '#fff' : '#5c4508',
            fontSize: 22,
            flexShrink: 0,
          }}>
            {ritualDone ? '✓' : '☀️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: 'block', font: '700 13px/1.2 "Nunito", sans-serif', color: '#124346' }}>
              Morgen-Ritual
            </b>
            <span style={{ font: '600 11px/1 "Plus Jakarta Sans", sans-serif', color: 'rgba(18,67,70,0.6)', letterSpacing: '0.03em', display: 'block', marginTop: 2 }}>
              {morningTotal === 0
                ? 'Heute keine Aufgaben'
                : `${morningDone} von ${morningTotal} Aufgaben${ritualDone ? ' · erledigt' : ''}`}
            </span>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 999,
            background: ritualDone ? '#10b981' : 'rgba(18,67,70,0.08)',
            color: ritualDone ? '#fff' : '#124346',
            font: '800 11px/1 "Plus Jakarta Sans", sans-serif',
          }}>
            {morningPct}%
          </div>
        </div>

        {/* CTA — disabled when there are no morning quests left to do */}
        <div
          role={expedition.state === 'home' && !ritualDone ? 'button' : undefined}
          onClick={() => {
            if (expedition.state === 'waiting') {
              setShowDiary(true);
              setDiaryFillKey(k => k + 1);
            } else if (expedition.state === 'home') {
              // Tap goes home to do the ritual. Surface owns no
              // "force complete" — that lives in the kid's TaskList.
              onClose?.();
            }
          }}
          style={{
            padding: '14px 18px', borderRadius: 16,
            background: expedition.state === 'waiting' ? '#f59e0b' : '#124346',
            color: '#fef3c7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            font: '700 14px/1.1 "Nunito", sans-serif',
            cursor: 'pointer',
            boxShadow: expedition.state === 'waiting'
              ? '0 6px 16px -6px rgba(245,158,11,0.5)'
              : '0 6px 16px -6px rgba(18,67,70,0.4)',
            marginBottom: 18,
          }}
        >
          <div>
            <div>{
              expedition.state === 'waiting' ? 'Tagebuch öffnen' :
              expedition.state === 'home' && !ritualDone ? 'Zur Schriftrolle' :
              'Ronki ist unterwegs'
            }</div>
            <span style={{
              font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              opacity: 0.7,
            }}>
              {ctaSubByState[expedition.state]}
            </span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            {expedition.state === 'waiting' ? 'auto_stories' : 'arrow_forward'}
          </span>
        </div>

        {/* Naturtagebuch — Mementos shelf + recent pages */}
        <Naturtagebuch log={log} />
      </section>

      {/* Diary modal */}
      {showDiary && expedition.pendingMemento && (
        <DiaryModal
          key={diaryFillKey}
          memento={expedition.pendingMemento}
          totalCollected={log.length + 1}
          onClose={() => {
            setShowDiary(false);
            actions.receiveMemento?.();
          }}
        />
      )}

      {/* Dev affordance: when ?expedition is set, expose a small
          state-cycle bar so QA can hop between states without
          reloading. Hidden in prod. */}
      {import.meta.env?.DEV && (
        <DevStateCycler current={expedition.state} actions={actions} />
      )}

      <style>{`
        @keyframes exp-walk {
          0%   { transform: translateX(0) translateY(0); opacity: 1; }
          12%  { transform: translateX(0) translateY(-2px); }
          22%  { transform: translateX(4px) translateY(0); }
          30%  { transform: translateX(8px) translateY(-4px); }
          40%  { transform: translateX(20px) translateY(-1px); }
          70%  { transform: translateX(150px) translateY(-3px); opacity: 0.8; }
          100% { transform: translateX(280px) translateY(-2px); opacity: 0; }
        }
        @keyframes exp-fire-flick {
          0%   { transform: translateX(-50%) scale(.95, 1) rotate(-2deg); }
          100% { transform: translateX(-50%) scale(1.05, .95) rotate(2deg); }
        }
        @keyframes exp-wing-flap {
          0%, 100% { transform: rotate(-15deg); }
          50%      { transform: rotate(-5deg); }
        }
        @keyframes exp-diary-pulse {
          0%, 100% {
            box-shadow:
              0 0 24px 8px rgba(252,211,77,0.6),
              0 0 48px 12px rgba(252,165,73,0.3),
              inset 0 -2px 0 rgba(180,90,30,0.2);
          }
          50% {
            box-shadow:
              0 0 34px 12px rgba(252,211,77,0.8),
              0 0 60px 18px rgba(252,165,73,0.45),
              inset 0 -2px 0 rgba(180,90,30,0.2);
          }
        }
        @keyframes exp-sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes exp-bar-fill {
          from { width: 0%; }
          to   { width: var(--target, 14%); }
        }
        @keyframes exp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Campfire scene ──────────────────────────────────────────────

function CampfireScene({ expState, biome, onTapDiary, status }) {
  const showRonki = expState === 'home' || expState === 'leaving' || expState === 'waiting';
  const showPlaceholder = expState === 'away';
  const showPawTrail = expState === 'away';
  const showDiary = expState === 'waiting';
  const showStatus = expState !== 'home';
  const walking = expState === 'leaving';

  return (
    <div
      style={{
        position: 'relative',
        height: 360,
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 50% 12%, #fde68a 0%, transparent 32%),
          linear-gradient(180deg, #e7d8b9 0%, #d4b894 38%, #8a8455 66%, #3f4a2e 100%)
        `,
        isolation: 'isolate',
      }}
    >
      {/* Distant trees */}
      <Tree style={{ left: '8%', transform: 'scale(0.8)', opacity: 0.75 }} />
      <Tree style={{ left: '72%', transform: 'scale(0.9)' }} />
      <Tree style={{ right: '6%', transform: 'scale(0.7)', opacity: 0.6 }} />

      {/* Ground */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '28%',
        background: 'linear-gradient(180deg, #6b5a3a 0%, #3a2f1a 100%)',
        boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.25)',
      }} />

      {/* Log */}
      <div style={{
        position: 'absolute', left: '18%', bottom: '14%',
        width: 110, height: 18,
        background: 'linear-gradient(180deg, #9b7447 0%, #5c3e1f 70%)',
        borderRadius: 10,
        boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.1)',
      }}>
        <div style={{
          position: 'absolute', right: -5, top: 2,
          width: 14, height: 14,
          background: '#ead5a0',
          border: '2px solid #8c6a3a',
          borderRadius: '50%',
        }} />
      </div>

      {/* Fire */}
      <div style={{ position: 'absolute', left: '46%', bottom: '12%', width: 44, height: 50 }}>
        <div style={{
          position: 'absolute', left: -40, bottom: -20,
          width: 130, height: 60,
          background: 'radial-gradient(ellipse, rgba(252,165,73,0.4), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '50%', bottom: 8, transform: 'translateX(-50%)',
          width: 28, height: 36,
          background: 'radial-gradient(ellipse at 50% 80%, #fef3c7 0%, #fcd34d 20%, #f97316 55%, #dc2626 100%)',
          borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
          animation: 'exp-fire-flick 1.1s ease-in-out infinite alternate',
          filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.6))',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 50, height: 10,
          background: '#3a2212',
          borderRadius: 4,
          boxShadow: '0 -2px 4px rgba(252,165,73,0.4)',
        }} />
      </div>

      {/* Ronki side-view */}
      {showRonki && (
        <CampRonki walking={walking} />
      )}

      {/* Away placeholder: folded map on log */}
      {showPlaceholder && (
        <div style={{
          position: 'absolute', left: '22%', bottom: '20%',
          width: 40, height: 28,
          background: 'linear-gradient(160deg, #f5ecd6, #d9c7a2)',
          borderRadius: 3,
          boxShadow: '0 4px 6px rgba(0,0,0,0.25), inset 0 -2px 0 rgba(0,0,0,0.15)',
          transform: 'rotate(-4deg)',
        }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0,0,0,0.08)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(0,0,0,0.08)' }} />
        </div>
      )}

      {/* Paw trail */}
      {showPawTrail && (
        <div style={{
          position: 'absolute', right: '4%', bottom: '20%',
          display: 'flex', gap: 10, opacity: 0.75,
        }}>
          {[0, 4, -2, 5, 0].map((dy, i) => (
            <div key={i} style={{
              width: 8, height: 10,
              background: 'rgba(30,20,10,0.4)',
              borderRadius: '50%',
              filter: 'blur(0.5px)',
              transform: `translateY(${dy}px)`,
              opacity: i >= 3 ? 0.4 : (i === 2 ? 0.6 : 1),
            }} />
          ))}
        </div>
      )}

      {/* Glowing diary */}
      {showDiary && (
        <button
          type="button"
          onClick={onTapDiary}
          aria-label="Tagebuch öffnen"
          style={{
            position: 'absolute', left: '40%', bottom: '22%',
            width: 44, height: 34,
            background: 'linear-gradient(160deg, #fef9d7, #fcd34d)',
            borderRadius: 4,
            transform: 'rotate(-6deg)',
            cursor: 'pointer',
            border: 'none',
            padding: 0,
            animation: 'exp-diary-pulse 2.4s ease-in-out infinite',
            zIndex: 6,
          }}
        >
          <div style={{
            position: 'absolute', top: 4, left: 6, right: 6, height: 2,
            background: 'rgba(180,90,30,0.25)',
            borderRadius: 2,
            boxShadow: '0 5px 0 rgba(180,90,30,0.2), 0 10px 0 rgba(180,90,30,0.15)',
            pointerEvents: 'none',
          }} />
        </button>
      )}

      {/* Status strip */}
      {showStatus && (
        <div style={{
          position: 'absolute', left: 14, right: 14, top: 14,
          padding: '10px 14px', borderRadius: 14,
          background: 'rgba(255,248,242,0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(18,67,70,0.1)',
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#124346',
          boxShadow: '0 6px 14px -4px rgba(18,67,70,0.15)',
          zIndex: 10,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: expState === 'waiting'
              ? 'radial-gradient(circle at 40% 35%, #fde68a, #f59e0b)'
              : 'radial-gradient(circle at 40% 35%, #a3c677, #5a8f4a)',
            display: 'grid', placeItems: 'center',
            fontSize: 12,
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
            {status.biome}
          </div>
          <div style={{ minWidth: 0 }}>
            <b style={{ display: 'block', font: '700 13px/1.1 "Nunito", sans-serif', marginBottom: 1 }}>{status.title}</b>
            <span style={{ font: '600 11px/1 "Plus Jakarta Sans", sans-serif', color: 'rgba(18,67,70,0.6)', letterSpacing: '0.04em' }}>
              {status.sub}
            </span>
          </div>
        </div>
      )}

      {/* Speech bubbles per state */}
      {expState === 'home' && (
        <CampSpeech text="Ich bin heute voller Vorfreude." />
      )}
      {expState === 'leaving' && (
        <CampSpeech text="Ich schnapp mir meinen Rucksack. Bis zum Nachmittag." />
      )}
      {expState === 'waiting' && (
        <CampSpeech text="Ich hab dir was mitgebracht. Willst du es sehen?" rightAligned />
      )}
    </div>
  );
}

function Tree({ style }) {
  return (
    <div style={{
      position: 'absolute', bottom: '28%', width: 40, height: 70,
      ...style,
    }}>
      <div style={{
        position: 'absolute', bottom: 0,
        left: '46%', width: '8%', height: '40%',
        background: '#5a3a22',
        transform: 'translateX(-50%)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', bottom: '30%',
        transform: 'translateX(-50%)',
        width: 36, height: 50,
        background: 'radial-gradient(ellipse at 40% 30%, #7d9a4a, #4a6628 70%)',
        borderRadius: '50% 60% 55% 45% / 40% 50% 55% 45%',
      }} />
    </div>
  );
}

function CampRonki({ walking }) {
  return (
    <div style={{
      position: 'absolute',
      left: '22%', bottom: '17%',
      width: 78, height: 72,
      zIndex: 5,
      animation: walking ? 'exp-walk 2.4s cubic-bezier(0.5, 0, 0.5, 1) forwards' : undefined,
      transition: 'opacity 0.4s, transform 0.4s',
    }}>
      {/* Tail */}
      <div style={{
        position: 'absolute', top: '60%', left: '-4%',
        width: 22, height: 14,
        background: 'linear-gradient(135deg, #f97e5a 0%, #b23a1c 100%)',
        borderRadius: '60% 30% 50% 40%',
        transform: 'rotate(-20deg)',
      }}>
        <div style={{
          position: 'absolute', left: -3, top: 2,
          width: 10, height: 10,
          background: 'linear-gradient(180deg, #fde68a, #f59e0b)',
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(252,211,77,0.5)',
        }} />
      </div>
      {/* Wing */}
      <div style={{
        position: 'absolute', top: '24%', left: '-2%',
        width: 22, height: 30,
        background: 'linear-gradient(160deg, #f97e5a, #b23a1c)',
        borderRadius: '50% 10% 50% 50% / 55% 20% 55% 55%',
        transform: 'rotate(-15deg)',
        animation: 'exp-wing-flap 2s ease-in-out infinite',
        transformOrigin: '100% 30%',
      }} />
      {/* Body */}
      <div style={{
        position: 'absolute', left: '10%', top: '20%',
        width: 56, height: 54,
        background: 'linear-gradient(175deg, #fed7aa 0%, #f97316 62%, #c2410c 100%)',
        borderRadius: '58% 50% 40% 50% / 62% 56% 44% 48%',
        boxShadow: 'inset -4px -6px 0 rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.22)',
      }} />
      {/* Belly */}
      <div style={{
        position: 'absolute', left: '16%', top: '45%',
        width: 26, height: 22,
        background: '#fde0a8',
        borderRadius: '50% 40% 50% 50%',
      }} />
      {/* Horns */}
      <div style={{
        position: 'absolute', top: '18%', left: '26%',
        width: 8, height: 14,
        background: 'linear-gradient(180deg, #fde68a, #f59e0b)',
        borderRadius: '50% 50% 10% 10%',
        transform: 'rotate(-8deg)',
      }} />
      <div style={{
        position: 'absolute', top: '18%', left: '38%',
        width: 8, height: 12,
        background: 'linear-gradient(180deg, #fde68a, #f59e0b)',
        borderRadius: '50% 50% 10% 10%',
        transform: 'rotate(6deg)',
      }} />
      {/* Eye */}
      <div style={{
        position: 'absolute', top: '34%', left: '46%',
        width: 6, height: 8,
        background: '#1a0e08',
        borderRadius: '50%',
      }}>
        <div style={{
          position: 'absolute', top: 1, right: 0,
          width: 2, height: 2, background: '#fff', borderRadius: '50%',
        }} />
      </div>
      {/* Mouth */}
      <div style={{
        position: 'absolute', top: '50%', left: '52%',
        width: 8, height: 3,
        borderBottom: '1.5px solid #3a1f12',
        borderRadius: '0 0 4px 4px',
      }} />
      {/* Bag (only when leaving) */}
      {walking && (
        <div style={{
          position: 'absolute', top: '15%', left: '22%',
          width: 18, height: 18,
          background: 'linear-gradient(180deg, #8a6a3e, #5c3e1f)',
          borderRadius: '8px 8px 6px 6px',
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.3), 0 2px 2px rgba(0,0,0,0.2)',
          transform: 'rotate(-6deg)',
        }}>
          <div style={{
            position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
            width: 4, height: 4, background: '#5c3e1f', borderRadius: 2,
          }} />
        </div>
      )}
      {/* Legs */}
      <div style={{ position: 'absolute', bottom: '-4%', left: '28%', width: 8, height: 14, background: '#c2410c', borderRadius: '40% 40% 30% 30%' }} />
      <div style={{ position: 'absolute', bottom: '-4%', left: '52%', width: 8, height: 14, background: '#c2410c', borderRadius: '40% 40% 30% 30%' }} />
    </div>
  );
}

function CampSpeech({ text, rightAligned }) {
  return (
    <div style={{
      position: 'absolute',
      [rightAligned ? 'right' : 'left']: rightAligned ? '14%' : '18%',
      [rightAligned ? 'top' : 'bottom']: rightAligned ? '34%' : '58%',
      padding: '10px 14px',
      borderRadius: rightAligned ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
      background: 'rgba(255,248,242,0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(18,67,70,0.1)',
      boxShadow: '0 8px 18px -6px rgba(18,67,70,0.25)',
      font: '500 12px/1.35 "Nunito", sans-serif',
      color: '#124346',
      maxWidth: 200,
      zIndex: 7,
      animation: 'exp-fade-in 0.4s ease',
    }}>
      {text}
    </div>
  );
}

// ─── Naturtagebuch shelf ────────────────────────────────────────

function Naturtagebuch({ log }) {
  // Show 8 slots; fill with what we have, dash the rest. Recent 3
  // pages go below as the "Seiten" detail strip.
  const SHELF_SLOTS = 8;
  const slots = Array.from({ length: SHELF_SLOTS }, (_, i) => log[log.length - 1 - i] || null);
  const recent = log.slice(-3).reverse();

  return (
    <>
      <div style={{ marginTop: 4 }}>
        <div style={{
          font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.20em', textTransform: 'uppercase',
          color: 'rgba(18,67,70,0.55)', marginBottom: 4,
        }}>
          Naturtagebuch
        </div>
        <h3 style={{
          margin: 0,
          font: '500 18px/1.15 "Fredoka", sans-serif',
          color: '#124346',
        }}>
          Was Ronki gesammelt hat
        </h3>
        <p style={{
          margin: '4px 0 0',
          font: '500 12px/1.4 "Nunito", sans-serif',
          color: 'rgba(18,67,70,0.6)',
        }}>
          Jede Seite ein kleiner Streifzug. Keine Punkte, keine Serie, nur was er mitbringt.
        </p>
      </div>

      {/* Mini map */}
      <ScrapMap label={`Morgenwald · ${Math.min(99, Math.round((log.length / 24) * 100))}%`} />

      {/* Mementos shelf */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0 4px' }}>
        <h4 style={{ margin: 0, font: '600 15px/1 "Fredoka", sans-serif', color: '#124346' }}>Mementos</h4>
        <small style={{ font: '700 10px/1 "Plus Jakarta Sans", sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(18,67,70,0.55)' }}>
          {log.length} von 24
        </small>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {slots.map((m, i) => m ? (
          <div key={m.id} style={{
            aspectRatio: 1, borderRadius: 12,
            background: `radial-gradient(ellipse at 40% 30%, rgba(252,211,77,0.3), transparent 40%), linear-gradient(135deg, #fff8f2, #fef3c7)`,
            border: '1px solid rgba(180,120,40,0.15)',
            display: 'grid', placeItems: 'center',
            fontSize: 26,
            filter: 'drop-shadow(0 2px 3px rgba(180,90,30,0.15))',
          }}>
            {m.emoji}
          </div>
        ) : (
          <div key={`empty-${i}`} style={{
            aspectRatio: 1, borderRadius: 12,
            background: 'rgba(18,67,70,0.04)',
            border: '1px dashed rgba(18,67,70,0.15)',
          }} />
        ))}
      </div>

      {/* Recent pages */}
      {recent.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0 8px' }}>
            <h4 style={{ margin: 0, font: '600 15px/1 "Fredoka", sans-serif', color: '#124346' }}>Seiten</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map(m => (
              <div key={m.id} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12,
                alignItems: 'center',
                padding: '10px 12px', borderRadius: 14,
                background: '#fff',
                border: '1px solid rgba(18,67,70,0.06)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: 'linear-gradient(160deg, #d3e5c0, #7a9a5d)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 22,
                }}>
                  {m.emoji}
                </div>
                <div style={{ minWidth: 0 }}>
                  <b style={{ display: 'block', font: '600 14px/1.2 "Fredoka", sans-serif', color: '#124346' }}>{m.name}</b>
                  <span style={{ font: '500 11px/1.35 "Nunito", sans-serif', color: 'rgba(18,67,70,0.6)' }}>
                    Morgenwald · {m.location}
                  </span>
                </div>
                <time style={{ font: '600 11px/1 "Plus Jakarta Sans", sans-serif', color: 'rgba(18,67,70,0.5)', letterSpacing: '0.04em' }}>
                  {relativeTime(m.ts)}
                </time>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ScrapMap({ label }) {
  return (
    <div style={{
      margin: '10px 0 0',
      height: 160,
      borderRadius: 16,
      position: 'relative',
      overflow: 'hidden',
      background: `
        radial-gradient(ellipse at 30% 60%, rgba(163,198,119,0.35), transparent 40%),
        radial-gradient(ellipse at 70% 40%, rgba(252,211,77,0.18), transparent 30%),
        linear-gradient(180deg, #f5eedc 0%, #e9dec3 100%)
      `,
      boxShadow: 'inset 0 0 0 1px rgba(180,120,40,0.15)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          radial-gradient(circle at 22% 32%, #7a9a5d 0%, transparent 8%),
          radial-gradient(circle at 42% 55%, #7a9a5d 0%, transparent 10%),
          radial-gradient(circle at 64% 38%, #a3c677 0%, transparent 9%),
          radial-gradient(circle at 76% 68%, #5a8f4a 0%, transparent 7%),
          radial-gradient(circle at 30% 80%, #7a9a5d 0%, transparent 6%)
        `,
        opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute', top: 10, left: 12,
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(255,248,242,0.85)',
        display: 'grid', placeItems: 'center',
        font: '800 10px/1 "Plus Jakarta Sans", sans-serif', color: '#124346',
        letterSpacing: '0.04em',
      }}>
        N
      </div>
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        padding: '4px 10px', borderRadius: 999,
        background: 'rgba(255,248,242,0.9)',
        font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: '#124346',
      }}>
        {label}
      </div>
    </div>
  );
}

// ─── Diary modal ────────────────────────────────────────────────

function DiaryModal({ memento, totalCollected, onClose }) {
  const pct = Math.min(99, Math.round((totalCollected / 24) * 100));
  // Animate the bar fill in after mount
  const [fillTarget, setFillTarget] = useState('0%');
  useEffect(() => {
    const t = setTimeout(() => setFillTarget(`${pct}%`), 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: 'rgba(18,42,54,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'exp-fade-in 0.3s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          borderRadius: '24px 24px 0 0',
          background: `
            radial-gradient(ellipse at 30% 15%, rgba(252,211,77,0.15), transparent 40%),
            linear-gradient(180deg, #fdf6e3 0%, #f2e4c3 100%)
          `,
          padding: '24px 20px 22px',
          maxHeight: '92%',
          overflowY: 'auto',
          boxShadow: '0 -20px 50px -20px rgba(0,0,0,0.4)',
          position: 'relative',
          animation: 'exp-sheet-up 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        {/* Drag handle */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 40, height: 4, borderRadius: 999,
          background: 'rgba(180,120,40,0.35)',
        }} />

        <div style={{
          font: '600 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#b45309', textAlign: 'center', marginBottom: 6,
        }}>
          Heute · {timeOfDay()}
        </div>
        <h3 style={{
          margin: '0 0 14px',
          font: '500 22px/1.15 "Fredoka", sans-serif',
          color: '#124346', textAlign: 'center', letterSpacing: '-0.01em',
        }}>
          Ein {memento.name}
        </h3>

        {/* Banner */}
        <div style={{
          height: 110,
          borderRadius: 12,
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
          background: `
            radial-gradient(ellipse at 20% 25%, rgba(253,230,138,0.5), transparent 40%),
            linear-gradient(180deg, #c3dcad 0%, #7a9a5d 55%, #4a6628 100%)
          `,
          boxShadow: 'inset 0 0 0 1px rgba(74,102,40,0.25), 0 4px 10px rgba(74,102,40,0.2)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(circle at 30% 80%, rgba(74,102,40,0.4) 0%, transparent 15%),
              radial-gradient(circle at 70% 75%, rgba(74,102,40,0.3) 0%, transparent 14%),
              radial-gradient(circle at 88% 90%, rgba(74,102,40,0.3) 0%, transparent 12%)
            `,
          }} />
          <div style={{
            position: 'absolute', left: 12, bottom: 10,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(255,248,242,0.85)',
            backdropFilter: 'blur(6px)',
            font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#124346',
          }}>
            Morgenwald
          </div>
        </div>

        <p style={{
          margin: '0 0 16px',
          padding: '0 4px',
          font: '500 15px/1.55 "Fredoka", sans-serif',
          color: '#3a2818',
          fontStyle: 'italic',
        }}>
          „{memento.quote}"
        </p>

        {/* Memento card */}
        <div style={{
          background: 'rgba(255,248,242,0.7)',
          border: '1px solid rgba(180,90,30,0.15)',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'grid', gridTemplateColumns: '68px 1fr', gap: 14,
          alignItems: 'center',
          marginBottom: 14,
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: 14,
            background: `
              radial-gradient(ellipse at 40% 30%, #f59e0b 0%, transparent 40%),
              linear-gradient(135deg, #fef9d7, #fde68a)
            `,
            display: 'grid', placeItems: 'center',
            fontSize: 38,
            filter: 'drop-shadow(0 2px 4px rgba(180,90,30,0.2))',
          }}>
            {memento.emoji}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#b45309', marginBottom: 3,
            }}>
              Spur · Für dich
            </div>
            <div style={{
              font: '600 15px/1.2 "Fredoka", sans-serif',
              color: '#124346', marginBottom: 3,
            }}>
              {memento.name}
            </div>
            <div style={{ font: '500 11px/1.35 "Nunito", sans-serif', color: 'rgba(18,67,70,0.6)' }}>
              {memento.location}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(18,67,70,0.05)',
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <b style={{ font: '700 12px/1 "Nunito", sans-serif', color: '#124346' }}>Morgenwald entdeckt</b>
            <span style={{ font: '700 11px/1 "Plus Jakarta Sans", sans-serif', color: 'rgba(18,67,70,0.6)', letterSpacing: '0.04em' }}>{pct}%</span>
          </div>
          <div style={{
            height: 8, borderRadius: 999,
            background: 'rgba(18,67,70,0.1)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #7a9a5d 0%, #a3c677 60%, #fcd34d 100%)',
              borderRadius: 999,
              width: fillTarget,
              transition: 'width 1.2s cubic-bezier(0.5, 0, 0.2, 1)',
              boxShadow: '0 0 10px rgba(163,198,119,0.5)',
            }} />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '13px 20px', borderRadius: 999,
            background: '#124346', color: '#fef3c7',
            font: '800 11px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Aufs Regal stellen
        </button>
      </div>
    </div>
  );
}

// ─── Dev-only state cycler (visible in DEV builds) ─────────────

function DevStateCycler({ current, actions }) {
  const STATES = ['home', 'leaving', 'away', 'waiting'];
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      zIndex: 70,
      padding: '6px 10px', borderRadius: 999,
      background: 'rgba(18,67,70,0.85)',
      color: '#fef3c7',
      font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      display: 'flex', gap: 4, alignItems: 'center',
      boxShadow: '0 6px 14px -4px rgba(0,0,0,0.4)',
      pointerEvents: 'auto',
    }}>
      <span style={{ opacity: 0.6 }}>DEV</span>
      {STATES.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => {
            if (s === 'away') actions.rangerDeparted?.();
            else if (s === 'waiting') {
              actions.rangerDeparted?.();
              setTimeout(() => actions.rangerArrived?.(), 50);
            }
            else actions.setExpedition?.({ state: s, biome: 'morgenwald' });
          }}
          style={{
            padding: '4px 8px', borderRadius: 999,
            background: current === s ? '#fde68a' : 'transparent',
            color: current === s ? '#124346' : '#fef3c7',
            border: '1px solid rgba(254,243,199,0.25)',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function returnLabel(returnAt) {
  if (!returnAt) return '';
  const t = new Date(returnAt);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  return `Zurück gegen ${hh}:${mm}`;
}

function timeOfDay() {
  const t = new Date();
  return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

function relativeTime(iso) {
  if (!iso) return '';
  const t = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - t.getTime()) / 86_400_000);
  if (diffDays < 1) return 'Heute';
  if (diffDays < 2) return 'Gestern';
  if (diffDays < 7) return ['So','Mo','Di','Mi','Do','Fr','Sa'][t.getDay()];
  return t.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}
