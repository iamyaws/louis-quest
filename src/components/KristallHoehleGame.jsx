import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import MoodChibi from './MoodChibi';

/**
 * KristallHoehleGame — the Cave Mining extraction loop.
 *
 * First half of the Cave Mining → Campfire Visitors compound.
 * Kid chips crystals out of a cave wall by tapping; each tap sends
 * particles + a "chink" feedback. After N taps on a seam, a crystal
 * breaks free and flies into a collection ledge at the bottom. Those
 * crystals persist to state.crystalInventory so the Campfire Visitors
 * game can spend them.
 *
 * 60-second dig session. Depth tiers (shown via camera parallax) unlock
 * rarer spawn tables — by tier 3 there's a ~1-in-20 Sternen-Kristall
 * (the 'star' family) which is only obtainable here.
 *
 * Contract: <KristallHoehleGame onClose={() => void} />. No reward arg
 * — the payoff is the crystals added to inventory + flavor HP bump.
 *
 * See backlog_mint_crystal_game_rework.md for the full compound design.
 */

// Rarity tables per depth tier. Each tier the kid digs deeper → better drops.
const TIERS = [
  {
    label: 'Flacher Schacht',
    drops: { ember: 0.35, lagoon: 0.35, meadow: 0.20, blossom: 0.10, star: 0 },
    tapsPerCrystal: 2,
  },
  {
    label: 'Tiefer Gang',
    drops: { ember: 0.25, lagoon: 0.25, meadow: 0.22, blossom: 0.23, star: 0.05 },
    tapsPerCrystal: 3,
  },
  {
    label: 'Kristall-Grotte',
    drops: { ember: 0.20, lagoon: 0.20, meadow: 0.22, blossom: 0.28, star: 0.10 },
    tapsPerCrystal: 3,
  },
];

const FAMILY_COLORS = {
  ember:   { core: '#fef3c7', mid: '#f97316', deep: '#dc2626', glow: 'rgba(249,115,22,0.55)' },
  lagoon:  { core: '#e0f2fe', mid: '#38bdf8', deep: '#0369a1', glow: 'rgba(56,189,248,0.55)' },
  meadow:  { core: '#ecfccb', mid: '#84cc16', deep: '#3f6212', glow: 'rgba(132,204,22,0.55)' },
  blossom: { core: '#fce7f3', mid: '#ec4899', deep: '#9d174d', glow: 'rgba(236,72,153,0.55)' },
  // Rare — only drops from tier 2+
  star:    { core: '#ffffff', mid: '#fef3c7', deep: '#f59e0b', glow: 'rgba(252,211,77,0.85)' },
};

function pickFamily(tier) {
  const r = Math.random();
  let acc = 0;
  for (const [fam, p] of Object.entries(tier.drops)) {
    acc += p;
    if (r < acc) return fam;
  }
  return 'ember'; // fallback
}

// Seam = a crystal-to-be buried in the wall. Kid taps N times to break
// it free. Positioned as percentages so the layout reflows on any size.
function buildSeams(tier, count = 5) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `s${Date.now()}-${i}`,
    x: 12 + (i % 3) * 30 + (Math.random() - 0.5) * 6,
    y: 18 + Math.floor(i / 3) * 26 + (Math.random() - 0.5) * 4,
    family: pickFamily(tier),
    taps: 0,
    taken: false,
  }));
}

export default function KristallHoehleGame({ onClose }) {
  const { t, lang } = useTranslation();
  const { state, actions } = useTask();

  const SESSION_SECS = 60;
  const [timeLeft, setTimeLeft] = useState(SESSION_SECS);
  const [tierIndex, setTierIndex] = useState(0);
  const [seams, setSeams] = useState(() => buildSeams(TIERS[0]));
  const [particles, setParticles] = useState([]);    // [{id, x, y, family}]
  const [flyouts, setFlyouts] = useState([]);        // crystal-to-ledge animations
  const [bigReveal, setBigReveal] = useState(null);  // { family } for rare drop celebration
  const [sessionHaul, setSessionHaul] = useState({}); // summary for footer
  const particleIdRef = useRef(0);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Auto-refresh seams when most are taken
  useEffect(() => {
    const left = seams.filter(s => !s.taken).length;
    if (left === 0 && timeLeft > 0) {
      // Advance tier every 2 refresh cycles
      const nextTier = Math.min(TIERS.length - 1, tierIndex + (seams.length >= 5 ? 1 : 0));
      setTierIndex(nextTier);
      setSeams(buildSeams(TIERS[nextTier]));
    }
  }, [seams, timeLeft, tierIndex]);

  // Finish when timer runs out
  useEffect(() => {
    if (timeLeft > 0) return;
    // Session ended — trigger a small delay so the last animation plays
    const timer = setTimeout(() => onClose?.(), 1200);
    return () => clearTimeout(timer);
  }, [timeLeft, onClose]);

  const handleTap = (seamId, ev) => {
    if (timeLeft <= 0) return;
    const seam = seams.find(s => s.id === seamId);
    if (!seam || seam.taken) return;
    const tapsNeeded = TIERS[tierIndex].tapsPerCrystal;
    const nextTaps = seam.taps + 1;
    try { if (navigator.vibrate) navigator.vibrate(20); } catch (_) {}
    SFX.play('pop');
    // Spawn a couple of rock-dust particles at tap point
    const rect = ev.currentTarget.getBoundingClientRect();
    const parentRect = ev.currentTarget.parentElement.getBoundingClientRect();
    const localX = ((rect.left + rect.width / 2) - parentRect.left) / parentRect.width * 100;
    const localY = ((rect.top + rect.height / 2) - parentRect.top) / parentRect.height * 100;
    const newParticles = Array.from({ length: 4 }).map(() => ({
      id: ++particleIdRef.current,
      x: localX + (Math.random() - 0.5) * 6,
      y: localY + (Math.random() - 0.5) * 4,
      family: seam.family,
    }));
    setParticles(p => [...p, ...newParticles]);
    setTimeout(() => {
      setParticles(p => p.filter(pt => !newParticles.some(np => np.id === pt.id)));
    }, 600);

    if (nextTaps >= tapsNeeded) {
      // Crystal breaks free
      SFX.play('coin');
      try { if (navigator.vibrate) navigator.vibrate([30, 20, 40]); } catch (_) {}
      setSeams(prev => prev.map(s => s.id === seamId ? { ...s, taken: true } : s));
      // Fly-to-ledge animation
      const flyId = particleIdRef.current++;
      setFlyouts(f => [...f, {
        id: flyId,
        startX: localX,
        startY: localY,
        family: seam.family,
      }]);
      setTimeout(() => {
        setFlyouts(f => f.filter(fl => fl.id !== flyId));
      }, 900);
      // Commit to inventory + session summary
      actions.addCrystals?.(seam.family, 1);
      setSessionHaul(h => ({ ...h, [seam.family]: (h[seam.family] || 0) + 1 }));
      // Rare celebration on star
      if (seam.family === 'star') {
        setBigReveal({ family: 'star' });
        setTimeout(() => setBigReveal(null), 2000);
      }
    } else {
      setSeams(prev => prev.map(s => s.id === seamId ? { ...s, taps: nextTaps } : s));
    }
  };

  const tier = TIERS[tierIndex];

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0f0a1e 0%, #1a1028 40%, #2a1a3a 100%)',
        color: '#fff8f2',
      }}
    >
      {/* Header — tier label + timer + close */}
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
            Kristall-Höhle · {tier.label}
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 18, fontWeight: 500 }}>
            {timeLeft > 0 ? `${timeLeft}s` : 'Fertig!'}
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

      {/* Cave wall — the main interactive area */}
      <div style={{
        position: 'relative',
        flex: 1,
        margin: '0 16px',
        borderRadius: 24,
        background: `
          radial-gradient(ellipse at 50% 40%, #2d1a40 0%, #1a0e28 70%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 10px, transparent 10px 20px)
        `,
        boxShadow: 'inset 0 0 48px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        // Slight camera-parallax offset per tier — the deeper you go,
        // the more you've "pushed down" into the cave.
        backgroundPositionY: `${-tierIndex * 20}px`,
      }}>
        {/* Tier-specific atmospheric element */}
        {tierIndex >= 1 && (
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 30% 80%, rgba(252,211,77,0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />
        )}
        {tierIndex >= 2 && (
          <div aria-hidden="true" style={{
            position: 'absolute', top: '8%', right: '14%',
            width: 10, height: 10,
            borderRadius: '50%', background: '#fef3c7',
            boxShadow: '0 0 12px 3px rgba(252,211,77,0.7)',
            animation: 'khGlowPulse 2.4s ease-in-out infinite',
          }} />
        )}

        {/* Seams (crystals to chip out) */}
        {seams.filter(s => !s.taken).map(s => {
          const colors = FAMILY_COLORS[s.family];
          const progress = s.taps / tier.tapsPerCrystal;
          return (
            <button
              key={s.id}
              onClick={(e) => handleTap(s.id, e)}
              aria-label="Kristall abbauen"
              style={{
                position: 'absolute',
                left: `${s.x}%`, top: `${s.y}%`,
                transform: `translate(-50%, -50%) scale(${0.85 + progress * 0.25})`,
                width: '18%', aspectRatio: '1',
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 40% 30%, ${colors.core} 0%, ${colors.mid} 50%, ${colors.deep} 100%)
                `,
                border: 'none',
                padding: 0,
                boxShadow: `0 0 ${10 + progress * 14}px ${progress * 4}px ${colors.glow}, inset 0 -4px 8px rgba(0,0,0,0.4)`,
                cursor: 'pointer',
                // Rocky overlay to show "buried in wall" vs "nearly free"
                opacity: 0.55 + progress * 0.45,
                filter: progress < 1 ? `contrast(0.85) brightness(${0.7 + progress * 0.3})` : 'none',
                transition: 'transform 0.1s',
              }}
            >
              {/* Fake rock chunks around the crystal (fade as it emerges) */}
              {[...Array(3)].map((_, i) => (
                <span key={i} aria-hidden="true" style={{
                  position: 'absolute',
                  left: `${15 + i * 30}%`,
                  top: `${20 + (i % 2) * 55}%`,
                  width: 8, height: 8,
                  borderRadius: '40% 60% 50% 50%',
                  background: 'rgba(60,40,70,0.8)',
                  opacity: Math.max(0, 1 - progress),
                  transition: 'opacity 0.2s',
                }} />
              ))}
            </button>
          );
        })}

        {/* Tap particles */}
        {particles.map(p => {
          const colors = FAMILY_COLORS[p.family];
          return (
            <span key={p.id} aria-hidden="true" style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: 4, height: 4,
              borderRadius: '50%',
              background: colors.core,
              boxShadow: `0 0 6px ${colors.glow}`,
              animation: 'khParticle 0.6s ease-out forwards',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }} />
          );
        })}

        {/* Crystals flying to the ledge */}
        {flyouts.map(f => {
          const colors = FAMILY_COLORS[f.family];
          return (
            <span key={f.id} aria-hidden="true" style={{
              position: 'absolute',
              left: `${f.startX}%`, top: `${f.startY}%`,
              width: '10%', aspectRatio: '1',
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${colors.core} 0%, ${colors.mid} 55%, ${colors.deep} 100%)`,
              boxShadow: `0 0 20px 4px ${colors.glow}`,
              transform: 'translate(-50%, -50%)',
              animation: 'khFlyToLedge 0.9s cubic-bezier(0.65,0,0.35,1) forwards',
              pointerEvents: 'none',
            }} />
          );
        })}

        {/* Big reveal — Sternen-Kristall celebration */}
        {bigReveal && (
          <div aria-hidden="true" style={{
            position: 'absolute', left: '50%', top: '40%',
            transform: 'translate(-50%, -50%)',
            animation: 'khBigReveal 2s ease-out forwards',
          }}>
            <div style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 30%, #fff 0%, #fef3c7 40%, #f59e0b 100%)',
              boxShadow: '0 0 60px 20px rgba(252,211,77,0.95)',
            }} />
            <p style={{
              margin: '16px 0 0', fontFamily: 'Fredoka, sans-serif',
              fontSize: 22, fontWeight: 600, color: '#fcd34d',
              textAlign: 'center', letterSpacing: '0.02em',
            }}>
              Sternen-Kristall!
            </p>
          </div>
        )}

        {/* Ronki watcher — bottom-left corner, cheers on rare pops */}
        <div style={{
          position: 'absolute', left: '4%', bottom: '4%',
          width: 70, height: 70, pointerEvents: 'none',
        }}>
          <MoodChibi
            size={70}
            mood={bigReveal ? 'magisch' : 'normal'}
            variant={state?.companionVariant || 'amber'}
            stage={2}
            bare
          />
        </div>

        {/* Ledge — shows the running haul total at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 12,
          padding: '10px 16px 14px',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.45))',
        }}>
          {['ember', 'lagoon', 'meadow', 'blossom', 'star'].map(fam => {
            const n = sessionHaul[fam] || 0;
            if (n === 0 && fam !== 'ember') return null; // only always-show one tile
            const colors = FAMILY_COLORS[fam];
            return (
              <div key={fam} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px',
                borderRadius: 999,
                background: n > 0 ? `${colors.glow}` : 'rgba(255,255,255,0.06)',
                border: n > 0 ? `1px solid ${colors.mid}` : '1px solid rgba(255,255,255,0.08)',
                fontSize: 12, fontWeight: 700,
                color: n > 0 ? '#fff' : 'rgba(255,255,255,0.4)',
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: `radial-gradient(circle, ${colors.core}, ${colors.mid})`,
                }} />
                {n}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer tip */}
      <footer style={{
        padding: '16px 20px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(252,211,77,0.55)',
        letterSpacing: '0.06em',
      }}>
        Tippe auf die Kristalle. Je tiefer, desto seltener!
      </footer>

      <style>{`
        @keyframes khParticle {
          0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -250%) scale(0.3); }
        }
        @keyframes khFlyToLedge {
          0%   { opacity: 1; }
          80%  { opacity: 1; top: 90%; left: 10%; }
          100% { opacity: 0; top: 94%; left: 10%; transform: translate(-50%, -50%) scale(0.4); }
        }
        @keyframes khGlowPulse {
          0%, 100% { opacity: 0.55; transform: scale(0.9); }
          50%      { opacity: 1; transform: scale(1.15); }
        }
        @keyframes khBigReveal {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          25%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          75%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
