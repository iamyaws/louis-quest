import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { getCatStage } from '../../utils/helpers';
import MoodChibi from '../MoodChibi';
import RonkiVitalsRing from './RonkiVitalsRing';
import CareVerbs from './CareVerbs';
import RonkiSpeechBubble from './RonkiSpeechBubble';
import Expedition from './Expedition';

/**
 * RoomHub — the Drachennest reframe of the Hub. v2 polish 24 Apr 2026.
 *
 * Single primary surface. Ronki sits centered on a square painterly
 * stage with the 3-arc vitals ring around him (Hunger / Liebe / Energie).
 * A speech bubble cycles every ~4s; tapping him spawns a floating heart
 * at the click position. Care verbs (Füttern / Streicheln / Spielen)
 * sit below as standing actions. A wall-scroll preview shows "Ronki's
 * asks today" grouped by anchor and routes into TaskList. A 4-tile
 * object row (Truhe / Buch / Spielzeug / Karte) makes the rest of the
 * app reachable. The Karte tile lights gold once morning + bedtime
 * routines are done — Ronki's ready for an expedition.
 *
 * Design lineage:
 * - Drachennest direction (room as primary surface, no tab metaphor)
 * - Begleiter Polish (3-arc vitals ring, care verbs, speech bubble)
 * - Laden Polish (square painterly stage, Ronki-sit-bob animation,
 *   warm sand/wood backdrop with inset depth shadows)
 *
 * Drives state.ronkiVitals via actions.careForRonki + the complete()
 * reducer's anchor-routed vital top-up. Existing NavBar stays visible.
 */

const ANCHOR_TO_VITAL = {
  morning: { vital: 'hunger',  color: '#f59e0b', label: 'Morgens' },
  evening: { vital: 'liebe',   color: '#ec4899', label: 'Nachmittag' },
  hobby:   { vital: 'liebe',   color: '#ec4899', label: 'Hobby' },
  bedtime: { vital: 'energie', color: '#10b981', label: 'Abends' },
};

export default function RoomHub({ onNavigate }) {
  const { state } = useTask();
  const { t, lang } = useTranslation();
  // Drachennest reframe: the "Karte" tile + window in the back of the
  // room both open the Expedition surface (Reise / Naturtagebuch).
  // Earlier prototypes routed to GardenMode as a placeholder; that's
  // gone now that the real expedition state machine is wired up.
  const [showExpedition, setShowExpedition] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const variant = state?.companionVariant || 'forest';
  const stageIdx = getCatStage(state?.catEvo ?? 0);
  const mood = state?.ronkiMood || 'normal';
  const vitals = state?.ronkiVitals || { hunger: 70, liebe: 70, energie: 70 };
  const wellbeing = Math.round((vitals.hunger + vitals.liebe + vitals.energie) / 3);
  const heroName = state?.familyConfig?.childName || state?.heroName || 'du';

  // Ronki is sized off the stage's measured width so the chibi + vitals
  // ring scale together as the viewport changes. useLayoutEffect keeps
  // the size in sync with mount/resize before paint to avoid the "Ronki
  // pops in" flicker the earlier inset-based layout had.
  const stageRef = useRef(null);
  const [stagePx, setStagePx] = useState(240);
  useLayoutEffect(() => {
    if (!stageRef.current) return;
    const measure = () => {
      if (stageRef.current) setStagePx(stageRef.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);
  // 82% of the stage leaves room for the vitals arcs (drawn at ~90% of
  // stage) to visibly wrap Ronki without clipping through him.
  const ronkiPx = Math.floor(stagePx * 0.82);

  const quests = state?.quests || [];
  const undoneByAnchor = ['morning', 'evening', 'bedtime'].map(anchor => {
    const items = quests.filter(q => q.anchor === anchor && !q.done);
    return { anchor, label: ANCHOR_TO_VITAL[anchor].label, color: ANCHOR_TO_VITAL[anchor].color, count: items.length };
  });
  const morningDone = quests.filter(q => q.anchor === 'morning').every(q => q.done) && quests.some(q => q.anchor === 'morning');
  const bedtimeDone = quests.filter(q => q.anchor === 'bedtime').every(q => q.done) && quests.some(q => q.anchor === 'bedtime');
  const expeditionUnlocked = morningDone && bedtimeDone;

  const tapRonki = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFloatingHearts(prev => [...prev, { id, x, y }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 950);
  };

  // ?time=dawn|day|dusk|night forces the scene tone for QA preview; otherwise
  // the clock decides. DEV-gated so prod builds ignore the override.
  const urlTime = (() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search).get('time');
    return ['dawn', 'day', 'dusk', 'night'].includes(p) ? p : null;
  })();
  const time = urlTime || pickTimeOfDay();
  const sceneTone = SCENE_TONES[time];

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #f9eed8 0%, #f5e3c1 60%, #e9d4a8 100%)',
        paddingBottom: 110,
        overflow: 'hidden',
        fontFamily: '"Nunito", sans-serif',
      }}
    >
      {/* Painted-paper hatching as base texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'repeating-linear-gradient(135deg, transparent 0 8px, rgba(40,36,28,0.04) 8px 9px), ' +
            'radial-gradient(900px 500px at 30% -20%, rgba(252,211,77,0.18) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top status strip */}
      <header
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 8px',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#b45309', marginBottom: 5,
          }}>
            Ronkis Zimmer
          </div>
          <div style={{
            font: '500 22px/1.05 "Fredoka", sans-serif', color: '#124346',
            letterSpacing: '-0.01em',
          }}>
            Hallo {heroName}!
          </div>
        </div>
        <div style={{
          padding: '7px 12px',
          borderRadius: 999,
          background: 'rgba(18,67,70,0.08)',
          font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: '#124346',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {wellbeing}% glücklich
        </div>
      </header>

      {/* The painterly square scene with Ronki + ring + window */}
      <section style={{ padding: '14px 18px 0', position: 'relative', zIndex: 3 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 26,
            overflow: 'hidden',
            background: sceneTone.bg,
            boxShadow:
              '0 18px 36px -14px rgba(40, 20, 8, 0.40), ' +
              'inset 0 2px 0 rgba(255,255,255,0.30), ' +
              'inset 0 -6px 18px rgba(78, 42, 20, 0.25)',
          }}
        >
          {/* Painted hills */}
          <div style={{
            position: 'absolute', left: -20, right: -20, bottom: -10, height: '38%',
            background: sceneTone.hills,
            borderRadius: '50% 50% 0 0 / 80% 80% 0 0',
            opacity: 0.85,
          }} />
          <div style={{
            position: 'absolute', left: -40, right: -40, bottom: -20, height: '28%',
            background: sceneTone.hillsBack,
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            opacity: 0.65,
          }} />

          {/* Window — a narrow tall opening showing time-of-day sky.
              Doubles as a second portal to the Reise / Garden surface
              (Marc 25 Apr 2026 — "by clicking on the window in the back
              of Ronki you get to the garden"). The Karte tile keeps the
              explicit text affordance; the window adds a spatial one
              that reads as "look out at the world." */}
          <button
            type="button"
            onClick={() => setShowExpedition(true)}
            aria-label="Aus dem Fenster schauen"
            className="active:scale-[0.96] transition-transform"
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 72, height: 92,
              background: sceneTone.sky,
              border: `3px solid ${sceneTone.frame}`,
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 4px 12px -4px rgba(40,20,5,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
              padding: 0,
              cursor: 'pointer',
              zIndex: 4,
            }}
          >
            {/* Sash cross */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: sceneTone.frame, transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: sceneTone.frame, transform: 'translateY(-50%)' }} />
            </div>
            {/* Sun or moon */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              width: 20, height: 20, borderRadius: '50%',
              background: sceneTone.celestial,
              boxShadow: `0 0 16px ${sceneTone.celestial}`,
              pointerEvents: 'none',
            }} />
            {time === 'night' && (
              <>
                <div style={{ position: 'absolute', top: 28, left: 14, width: 2, height: 2, borderRadius: '50%', background: '#fef3c7', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 50, left: 28, width: 2, height: 2, borderRadius: '50%', background: '#fef3c7', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 70, left: 12, width: 2, height: 2, borderRadius: '50%', background: '#fef3c7', pointerEvents: 'none' }} />
              </>
            )}
          </button>

          {/* Ronki + vitals stage — ring wraps chibi at matched size so
              the arcs clearly belong to him (v2 had them floating too far).
              The stage sits a little below center, anchored on the ground. */}
          <div
            ref={stageRef}
            className="rh-ronki-stage"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '12%',
              transform: 'translateX(-50%)',
              width: '72%',
              maxWidth: 280,
              aspectRatio: '1 / 1',
              animation: 'rh-sit 5s ease-in-out infinite',
            }}
          >
            {/* Vitals ring fills the stage — arcs render at ~90% of stage width */}
            <RonkiVitalsRing needs={vitals} size={stagePx} />
            {/* Speech bubble sits above stage */}
            <RonkiSpeechBubble />
            {/* Ronki centered inside the ring — sized to ~82% of stage so
                the arcs form a visible halo around him rather than a
                distant frame. */}
            <button
              type="button"
              onClick={tapRonki}
              aria-label="Ronki streicheln"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                zIndex: 3,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {/* The chibi is bottom-anchored inside MoodChibi (bottom: 5%
                  in bare mode), so a 1:1 wrapper centred in the stage puts
                  Ronki at the lower half of the ring. Translating the
                  whole wrapper up by ~12% pulls his vertical center toward
                  the stage centroid, where the three vital meters average
                  out — closer to the ring's middle so all three badges
                  read as orbiting him rather than floating above. */}
              <div style={{
                position: 'relative',
                width: ronkiPx,
                height: ronkiPx,
                transform: 'translateY(-9%)',
              }}>
                <MoodChibi
                  size={ronkiPx}
                  variant={variant}
                  stage={stageIdx}
                  mood={mood}
                  bare
                />
                {floatingHearts.map(h => (
                  <span
                    key={h.id}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: h.x,
                      top: h.y,
                      pointerEvents: 'none',
                      font: '600 32px/1 sans-serif',
                      animation: 'rh-heart 0.95s ease-out forwards',
                      zIndex: 12,
                    }}
                  >
                    💚
                  </span>
                ))}
              </div>
            </button>
            {/* Soft ground shadow */}
            <div aria-hidden="true" style={{
              position: 'absolute',
              left: '50%',
              bottom: '2%',
              transform: 'translateX(-50%)',
              width: '50%',
              height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(40,20,5,0.30), transparent 70%)',
              filter: 'blur(3px)',
              zIndex: 1,
            }} />
          </div>

          {/* Floating sparkles for atmosphere */}
          <span aria-hidden="true" style={{ position: 'absolute', top: '18%', left: '14%', fontSize: 14, color: 'rgba(254,243,199,0.7)', animation: 'rh-spark1 6s ease-in-out infinite' }}>✦</span>
          <span aria-hidden="true" style={{ position: 'absolute', top: '32%', left: '24%', fontSize: 10, color: 'rgba(254,243,199,0.5)', animation: 'rh-spark2 7s ease-in-out infinite' }}>✦</span>
          <span aria-hidden="true" style={{ position: 'absolute', top: '22%', right: '24%', fontSize: 12, color: 'rgba(254,243,199,0.6)', animation: 'rh-spark3 8s ease-in-out infinite' }}>✧</span>
        </div>
      </section>

      {/* Care verbs row */}
      <section style={{ padding: '20px 18px 0' }}>
        <CareVerbs />
      </section>

      {/* Wall scroll: Ronki's asks today.
          Each anchor pill is its own button (Marc 25 Apr 2026 spotted
          they were dead taps before), and the card title tap-target sits
          at the top so the parent surface stays openable as a whole. The
          pills route to TaskList with a hash so future TaskList work can
          scroll to that anchor section. */}
      <section style={{ padding: '22px 18px 0' }}>
        <div style={{
          font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#b45309', marginBottom: 8, paddingLeft: 4,
        }}>
          Ronki bittet dich heute um Hilfe
        </div>
        <div
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, #fffdf5 0%, #fef3c7 100%)',
            border: '1.5px solid rgba(180,83,9,0.25)',
            borderRadius: 18,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 8px 18px -8px rgba(180,83,9,0.30), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate?.('aufgaben')}
            className="active:scale-[0.99] transition-transform"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
            aria-label="Alle Aufgaben anzeigen"
          >
            <b style={{ font: '500 18px/1.15 "Fredoka", sans-serif', color: '#124346' }}>
              Heute auf der Schriftrolle
            </b>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#b45309' }}>chevron_right</span>
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {undoneByAnchor.map(a => (
              <button
                key={a.anchor}
                type="button"
                onClick={() => onNavigate?.('aufgaben', { anchor: a.anchor })}
                className="active:scale-[0.96] transition-transform"
                aria-label={`${a.label}: ${a.count > 0 ? `${a.count} offen` : 'fertig'}`}
                style={{
                  borderRadius: 14,
                  background: a.count > 0 ? `${a.color}1a` : 'rgba(34,197,94,0.16)',
                  border: `1.5px solid ${a.count > 0 ? a.color + '55' : '#22c55e55'}`,
                  padding: '10px 8px 8px',
                  display: 'flex', flexDirection: 'column', gap: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: a.count > 0 ? a.color : '#059669',
                }}>
                  {a.label}
                </span>
                <span style={{
                  font: '700 18px/1 "Fredoka", sans-serif',
                  color: a.count > 0 ? '#124346' : '#059669',
                }}>
                  {a.count > 0 ? a.count : '✓'}
                </span>
                <span style={{
                  font: '500 9px/1 "Plus Jakarta Sans", sans-serif',
                  color: a.count > 0 ? '#6b655b' : '#059669',
                  letterSpacing: '0.06em',
                }}>
                  {a.count > 0 ? 'offen' : 'fertig'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Object row: Truhe / Buch / Spielzeug / Karte */}
      <section style={{
        padding: '18px 18px 0',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      }}>
        <ObjectTile icon="redeem"         label="Truhe"     onClick={() => onNavigate?.('belohnungen')} />
        <ObjectTile icon="menu_book"      label="Buch"      onClick={() => onNavigate?.('buch')} />
        <ObjectTile icon="sports_esports" label="Spielzeug" onClick={() => onNavigate?.('spiele')} />
        <ObjectTile icon="explore"        label={expeditionUnlocked ? 'Karte ✦' : 'Karte'} highlight={expeditionUnlocked} onClick={() => setShowExpedition(true)} />
      </section>

      {/* Expedition hint when unlocked */}
      {expeditionUnlocked && (
        <div style={{
          margin: '14px 18px 0',
          padding: '12px 14px',
          borderRadius: 16,
          background: 'linear-gradient(180deg, #fce7f3, #fef3c7)',
          border: '1.5px solid #fb7185',
          font: '600 13px/1.35 "Nunito", sans-serif',
          color: '#124346',
          textAlign: 'center',
          boxShadow: '0 8px 18px -8px rgba(251,113,133,0.40)',
        }}>
          Ronki ist startklar für ein Abenteuer. Tipp auf <b>Karte</b>.
        </div>
      )}

      <style>{`
        @keyframes rh-sit {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-5px); }
        }
        @keyframes rh-heart {
          0%   { opacity: 0; transform: translate(-50%, 0) scale(0.6); }
          18%  { opacity: 1; transform: translate(-50%, -10px) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -70px) scale(0.85); }
        }
        @keyframes rh-spark1 { 0%,100% { opacity: 0.4; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-6px); } }
        @keyframes rh-spark2 { 0%,100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 0.9; transform: translateY(-4px); } }
        @keyframes rh-spark3 { 0%,100% { opacity: 0.5; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-8px); } }
      `}</style>

      {/* Karte + window → Expedition (Reise / Naturtagebuch surface).
          The state machine (home / leaving / away / waiting) lives in
          TaskContext; this surface mostly observes + transitions. */}
      {showExpedition && <Expedition onClose={() => setShowExpedition(false)} />}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function ObjectTile({ icon, label, highlight, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="active:scale-[0.96] transition-transform"
      style={{
        padding: '14px 6px 10px',
        borderRadius: 18,
        background: highlight
          ? 'linear-gradient(180deg, #fbbf24, #f97316)'
          : 'linear-gradient(180deg, #ffffff, #fff8f2)',
        border: highlight ? '1.5px solid #f59e0b' : '1.5px solid rgba(18,67,70,0.10)',
        boxShadow: highlight
          ? '0 8px 18px -6px rgba(249,115,22,0.50), inset 0 1px 0 rgba(255,255,255,0.5)'
          : '0 4px 10px -4px rgba(18,67,70,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        minHeight: 86,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 28,
          color: highlight ? '#5c2a08' : '#124346',
          fontVariationSettings: "'FILL' 1, 'wght' 600",
        }}
      >
        {icon}
      </span>
      <span style={{
        font: '700 11px/1.1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '0.04em',
        color: highlight ? '#3a1c05' : '#124346',
      }}>
        {label}
      </span>
    </button>
  );
}

function pickTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'dawn';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

const SCENE_TONES = {
  dawn: {
    // Morning warmth: soft apricot sky transitioning to mint hills. Keeps
    // the hero feeling like fresh morning rather than the brown autumn
    // palette the first pass landed on.
    bg: 'linear-gradient(180deg, #fde68a 0%, #fbcfe8 55%, #bbf7d0 100%)',
    hills: 'linear-gradient(180deg, #34d399, #047857)',
    hillsBack: 'linear-gradient(180deg, #6ee7b7, #059669)',
    sky: 'linear-gradient(180deg, #fecaca, #fde68a)',
    frame: '#5c2a08',
    celestial: '#fbbf24',
  },
  day: {
    bg: 'linear-gradient(180deg, #fde68a 0%, #fef3c7 50%, #fffbeb 100%)',
    hills: 'linear-gradient(180deg, #15803d, #14532d)',
    hillsBack: 'linear-gradient(180deg, #22c55e, #15803d)',
    sky: 'linear-gradient(180deg, #bae6fd, #a7f3d0)',
    frame: '#5c4508',
    celestial: '#fbbf24',
  },
  dusk: {
    bg: 'linear-gradient(180deg, #fed7aa 0%, #fbcfe8 50%, #c4b5fd 100%)',
    hills: 'linear-gradient(180deg, #9a3412, #4a1d96)',
    hillsBack: 'linear-gradient(180deg, #c2410c, #6b21a8)',
    sky: 'linear-gradient(180deg, #c4b5fd, #fdba74)',
    frame: '#5c2a08',
    celestial: '#f97316',
  },
  night: {
    bg: 'linear-gradient(180deg, #1e1b4b 0%, #3730a3 50%, #1e3a8a 100%)',
    hills: 'linear-gradient(180deg, #1e293b, #0f172a)',
    hillsBack: 'linear-gradient(180deg, #334155, #1e293b)',
    sky: 'linear-gradient(180deg, #1e1b4b, #3730a3)',
    frame: '#1e1b4b',
    celestial: '#fef3c7',
  },
};
