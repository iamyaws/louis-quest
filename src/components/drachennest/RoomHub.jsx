import React, { useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { getCatStage } from '../../utils/helpers';
import MoodChibi from '../MoodChibi';
import GardenMode from '../garden/GardenMode';
import RonkiVitalsRing from './RonkiVitalsRing';
import CareVerbs from './CareVerbs';
import RonkiSpeechBubble from './RonkiSpeechBubble';

/**
 * RoomHub — the Drachennest reframe of the Hub.
 *
 * Single primary surface. Ronki sits in the centre of his room with a
 * 3-arc vitals ring around him (Hunger / Liebe / Energie). A speech
 * bubble cycles his mood lines every ~4s; tapping him spawns a floating
 * heart at the click position. Three care verbs (Füttern / Streicheln /
 * Spielen) sit below as standing actions. Quest-anchor scrolls along
 * the wall preview "what Ronki has asked you for today" and route into
 * the existing TaskList when tapped. A Karte button bottom-right opens
 * GardenMode for now (will become the Reise expedition map later).
 *
 * Design source: Drachennest direction (d1) + Begleiter Polish vitals.
 * Drives state.ronkiVitals via actions.careForRonki + the
 * complete()-reducer's anchor-routed vital top-up.
 *
 * Existing NavBar stays visible (per strategy: "keep visible but
 * de-emphasized" until validation). Aufgaben / Buch / Spiele tabs are
 * still reachable, just shown as room objects too so the kid learns
 * the metaphor without losing the safety net.
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
  const [showGarden, setShowGarden] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const variant = state?.companionVariant || 'amber';
  const stageIdx = getCatStage(state?.catEvo ?? 0);
  const mood = state?.ronkiMood || 'normal';
  const vitals = state?.ronkiVitals || { hunger: 70, liebe: 70, energie: 70 };
  const wellbeing = Math.round((vitals.hunger + vitals.liebe + vitals.energie) / 3);

  // Group quests by anchor for the wall scroll preview
  const quests = state?.quests || [];
  const undoneByAnchor = ['morning', 'evening', 'bedtime'].map(anchor => {
    const items = quests.filter(q => q.anchor === anchor && !q.done);
    return { anchor, label: ANCHOR_TO_VITAL[anchor].label, color: ANCHOR_TO_VITAL[anchor].color, count: items.length };
  });
  const morningDone = quests.filter(q => q.anchor === 'morning').every(q => q.done) && quests.some(q => q.anchor === 'morning');
  const eveningDone = quests.filter(q => q.anchor === 'bedtime').every(q => q.done) && quests.some(q => q.anchor === 'bedtime');
  const expeditionUnlocked = morningDone && eveningDone;

  const tapRonki = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFloatingHearts(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 950);
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #f9eed8 0%, #f5e3c1 60%, #e9d4a8 100%)',
        paddingBottom: 110,
        overflow: 'hidden',
      }}
    >
      {/* Soft wall hatching for the room feel */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(135deg, transparent 0 8px, rgba(40,36,28,0.04) 8px 9px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top status strip — wellbeing + companion name */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px 8px',
        }}
      >
        <div>
          <div style={{
            font: '700 9px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#6b655b', marginBottom: 4,
          }}>
            Ronkis Zimmer
          </div>
          <div style={{
            font: '700 18px/1 "Fredoka", sans-serif', color: '#124346',
          }}>
            {wellbeing}% zufrieden
          </div>
        </div>
        <div style={{
          padding: '8px 14px',
          borderRadius: 999,
          background: 'rgba(18,67,70,0.08)',
          font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#124346',
        }}>
          Stufe {stageIdx + 1}
        </div>
      </div>

      {/* Window — simple SVG showing time-of-day vibe */}
      <Window time={pickTimeOfDay()} />

      {/* Ronki + vitals stage (the centerpiece) */}
      <div
        style={{
          position: 'relative',
          width: 'min(280px, 80vw)',
          aspectRatio: '1 / 1',
          margin: '24px auto 12px',
        }}
      >
        <RonkiVitalsRing needs={vitals} size={undefined} />
        {/* Speech bubble (rotating mood line) */}
        <RonkiSpeechBubble />
        {/* Chibi tap target */}
        <button
          type="button"
          onClick={tapRonki}
          aria-label="Ronki streicheln"
          style={{
            position: 'absolute',
            inset: '15% 15% 12% 15%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            zIndex: 3,
          }}
        >
          <MoodChibi
            size={Math.min(220, window.innerWidth * 0.6)}
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
                font: '600 28px/1 sans-serif',
                animation: 'rh-heart 0.95s ease-out forwards',
                zIndex: 12,
              }}
            >
              💚
            </span>
          ))}
        </button>
      </div>

      {/* Care verbs */}
      <div style={{ padding: '0 16px', marginTop: 4 }}>
        <CareVerbs />
      </div>

      {/* Wall scroll: Ronki's asks today */}
      <section style={{ padding: '20px 16px 0' }}>
        <div style={{
          font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#6b655b', marginBottom: 8,
        }}>
          Ronki bittet dich heute um Hilfe
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('aufgaben')}
          className="active:scale-[0.99] transition-transform"
          style={{
            width: '100%',
            background: '#fff8f2',
            border: '1.5px solid #c0c8c9',
            borderRadius: 18,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 12px -4px rgba(18,67,70,0.10)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ font: '700 14px/1.2 "Nunito", sans-serif', color: '#124346' }}>
              Heute auf der Schriftrolle
            </b>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#6b655b' }}>chevron_right</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {undoneByAnchor.map(a => (
              <div
                key={a.anchor}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  background: a.count > 0 ? `${a.color}1a` : 'rgba(34,197,94,0.12)',
                  border: `1px solid ${a.count > 0 ? a.color + '55' : '#22c55e55'}`,
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span style={{
                  font: '700 9px/1 "Plus Jakarta Sans", sans-serif',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: a.count > 0 ? a.color : '#059669',
                }}>
                  {a.label}
                </span>
                <span style={{
                  font: '800 16px/1 "Fredoka", sans-serif',
                  color: a.count > 0 ? '#124346' : '#059669',
                }}>
                  {a.count > 0 ? `${a.count} offen` : '✓ fertig'}
                </span>
              </div>
            ))}
          </div>
        </button>
      </section>

      {/* Object row: Truhe (rewards) / Buch (journal) / Spielzeug (games) / Karte (expedition) */}
      <section style={{
        padding: '16px 16px 0',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      }}>
        <ObjectTile icon="redeem"            label="Truhe"     onClick={() => onNavigate?.('belohnungen')} />
        <ObjectTile icon="menu_book"         label="Buch"      onClick={() => onNavigate?.('buch')} />
        <ObjectTile icon="sports_esports"    label="Spielzeug" onClick={() => onNavigate?.('spiele')} />
        <ObjectTile icon="explore"           label={expeditionUnlocked ? 'Karte ✦' : 'Karte'} highlight={expeditionUnlocked} onClick={() => setShowGarden(true)} />
      </section>

      {/* Gentle "Karte" hint when expedition unlocked */}
      {expeditionUnlocked && (
        <div style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          borderRadius: 14,
          background: 'linear-gradient(180deg, #fce7f3, #fef3c7)',
          border: '1.5px solid #fb7185',
          font: '600 12px/1.3 "Nunito", sans-serif',
          color: '#124346',
          textAlign: 'center',
        }}>
          Ronki ist startklar für ein Abenteuer. Tipp auf <b>Karte</b>.
        </div>
      )}

      <style>{`
        @keyframes rh-heart {
          0%   { opacity: 0; transform: translate(-50%, 0) scale(0.6); }
          18%  { opacity: 1; transform: translate(-50%, -10px) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -60px) scale(0.85); }
        }
      `}</style>

      {/* Karte → existing GardenMode (Reise stub) */}
      {showGarden && <GardenMode onClose={() => setShowGarden(false)} />}
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
        borderRadius: 16,
        background: highlight ? 'linear-gradient(180deg, #fbbf24, #f97316)' : '#fff8f2',
        border: highlight ? '1.5px solid #f59e0b' : '1.5px solid #c0c8c9',
        boxShadow: highlight ? '0 6px 16px -4px rgba(249,115,22,0.45)' : '0 3px 8px -3px rgba(18,67,70,0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        minHeight: 80,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 26,
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

function Window({ time }) {
  const palette = {
    dawn: { sky: 'linear-gradient(180deg, #fbcfe8, #fde68a)', sun: '#f59e0b', stars: false },
    day:  { sky: 'linear-gradient(180deg, #bae6fd, #a7f3d0)', sun: '#fbbf24', stars: false },
    dusk: { sky: 'linear-gradient(180deg, #c4b5fd, #fdba74)', sun: '#f97316', stars: false },
    night:{ sky: 'linear-gradient(180deg, #1e1b4b, #3730a3)', sun: '#fef3c7', stars: true },
  }[time];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 56,
        right: 16,
        width: 92,
        height: 110,
        background: palette.sky,
        border: '3px solid #5c4508',
        borderRadius: 6,
        boxShadow: '0 4px 12px -4px rgba(18,67,70,0.30)',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* sash cross */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: '#5c4508', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: '#5c4508', transform: 'translateY(-50%)' }} />
      </div>
      {/* sun or moon */}
      {!palette.stars ? (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 22, height: 22, borderRadius: '50%',
          background: palette.sun,
          boxShadow: `0 0 18px ${palette.sun}`,
        }} />
      ) : (
        <>
          <div style={{
            position: 'absolute', top: 18, right: 18,
            width: 18, height: 18, borderRadius: '50%',
            background: palette.sun,
            boxShadow: '0 0 14px #fef3c7',
          }} />
          <div style={{ position: 'absolute', top: 30, left: 18, width: 2, height: 2, borderRadius: '50%', background: '#fff' }} />
          <div style={{ position: 'absolute', top: 50, left: 32, width: 2, height: 2, borderRadius: '50%', background: '#fff' }} />
          <div style={{ position: 'absolute', top: 70, left: 16, width: 2, height: 2, borderRadius: '50%', background: '#fff' }} />
        </>
      )}
    </div>
  );
}
