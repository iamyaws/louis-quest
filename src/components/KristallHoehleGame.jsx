import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
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

// Each family now has a distinct gem silhouette (CSS clip-path) so
// they read as different stone types — rubin / diamant / smaragd /
// rosenquarz — instead of identical coloured circles. Marc feedback:
// "if those are crystals they should also look more crystal like in
// different shapes."
const FAMILY_COLORS = {
  ember: {
    name: 'Rubin',
    core: '#fef3c7', mid: '#f97316', deep: '#dc2626', glow: 'rgba(249,115,22,0.55)',
    // Faceted ruby — tall hexagonal cut
    clip: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    facet: 'polygon(50% 0%, 100% 25%, 50% 50%, 0% 25%)',
  },
  lagoon: {
    name: 'Diamant',
    core: '#e0f2fe', mid: '#38bdf8', deep: '#0369a1', glow: 'rgba(56,189,248,0.55)',
    // Brilliant-cut diamond — kite over narrow base
    clip: 'polygon(50% 0%, 100% 40%, 80% 100%, 20% 100%, 0% 40%)',
    facet: 'polygon(50% 0%, 100% 40%, 50% 50%, 0% 40%)',
  },
  meadow: {
    name: 'Smaragd',
    core: '#ecfccb', mid: '#84cc16', deep: '#3f6212', glow: 'rgba(132,204,22,0.55)',
    // Emerald step-cut — long rectangle with clipped corners
    clip: 'polygon(15% 0%, 85% 0%, 100% 20%, 100% 80%, 85% 100%, 15% 100%, 0% 80%, 0% 20%)',
    facet: 'polygon(15% 0%, 85% 0%, 85% 35%, 15% 35%)',
  },
  blossom: {
    name: 'Rosenquarz',
    core: '#fce7f3', mid: '#ec4899', deep: '#9d174d', glow: 'rgba(236,72,153,0.55)',
    // Rose-cut teardrop
    clip: 'polygon(50% 0%, 100% 45%, 85% 100%, 15% 100%, 0% 45%)',
    facet: 'polygon(50% 0%, 100% 45%, 50% 55%, 0% 45%)',
  },
  star: {
    name: 'Sternen-Kristall',
    core: '#ffffff', mid: '#fef3c7', deep: '#f59e0b', glow: 'rgba(252,211,77,0.95)',
    // 8-point star — legendary silhouette
    clip: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    facet: 'polygon(50% 0%, 61% 35%, 39% 35%)',
  },
};

// Decorative cave rubble — fills the wall between seams so digging feels
// like working through a real cave, not plucking from emptiness. Purely
// visual; not interactive. Marc feedback: "I miss some Geröll aside from
// the ones you can dig out."
const RUBBLE_CHUNKS = Array.from({ length: 22 }).map((_, i) => ({
  id: `r${i}`,
  x: (i * 31 + 7) % 100,
  y: (i * 23 + 11) % 95 + 2,
  size: 4 + (i % 5) * 2,   // 4..12 px
  rot: (i * 47) % 360,
  shade: i % 3, // 3 rock shades
}));

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
  const haptic = useHaptic();

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
    haptic('select');
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
      haptic('success');
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
        {/* Cave rubble — decorative rock chunks scattered across the wall.
             Drawn below the interactive crystals so taps still hit the
             buttons. Purely visual — not interactive. */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        }}>
          {RUBBLE_CHUNKS.map(r => {
            const shades = [
              'linear-gradient(135deg, #3a2a42 0%, #1e1428 100%)',
              'linear-gradient(135deg, #463452 0%, #28203a 100%)',
              'linear-gradient(135deg, #322238 0%, #181020 100%)',
            ];
            return (
              <span key={r.id} style={{
                position: 'absolute',
                left: `${r.x}%`, top: `${r.y}%`,
                width: r.size, height: r.size,
                background: shades[r.shade],
                borderRadius: '40% 60% 55% 45% / 55% 45% 60% 40%',
                transform: `translate(-50%, -50%) rotate(${r.rot}deg)`,
                boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.5), inset 1px 1px 1px rgba(255,255,255,0.08)',
                opacity: 0.82,
              }} />
            );
          })}
          {/* Tiny dust-scatter sprinkled over the rubble for texture */}
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={`dust${i}`} style={{
              position: 'absolute',
              left: `${(i * 37 + 3) % 100}%`,
              top: `${(i * 19 + 7) % 95 + 2}%`,
              width: 1.5, height: 1.5,
              borderRadius: '50%',
              background: 'rgba(180,160,200,0.32)',
            }} />
          ))}
        </div>

        {/* Tier-specific atmospheric element */}
        {tierIndex >= 1 && (
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, zIndex: 1,
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

        {/* Seams — faceted gem silhouettes, each family with its own cut.
             Progress goes 0..1 as kid taps; rock fragments around the
             gem fade out as it "emerges." */}
        {seams.filter(s => !s.taken).map(s => {
          const colors = FAMILY_COLORS[s.family];
          const progress = s.taps / tier.tapsPerCrystal;
          const isStar = s.family === 'star';
          const tilt = ((parseInt(s.id.slice(-2), 36) || 0) % 20) - 10; // -10° to +10°
          return (
            <button
              key={s.id}
              onClick={(e) => handleTap(s.id, e)}
              aria-label="Kristall abbauen"
              style={{
                position: 'absolute',
                left: `${s.x}%`, top: `${s.y}%`,
                transform: `translate(-50%, -50%) scale(${0.85 + progress * 0.25})`,
                width: isStar ? '22%' : '18%',
                aspectRatio: '1',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'transform 0.1s',
                zIndex: 3,
              }}
            >
              {/* Rock fragments hugging the gem — fade out as progress hits 1.
                   These live BEHIND the gem so they look like rock giving way.
                   Positioned at the gem's silhouette edge (roughly). */}
              {progress < 1 && [
                { left: '8%',  top: '22%', w: 12, h: 10, rot: 25 },
                { left: '78%', top: '18%', w: 11, h: 11, rot: -15 },
                { left: '18%', top: '72%', w: 13, h: 10, rot: 40 },
                { left: '72%', top: '76%', w: 10, h: 12, rot: -30 },
                { left: '50%', top: '92%', w: 9,  h: 7,  rot: 10 },
              ].map((rock, i) => (
                <span key={i} aria-hidden="true" style={{
                  position: 'absolute',
                  left: rock.left, top: rock.top,
                  width: rock.w, height: rock.h,
                  background: 'linear-gradient(135deg, #3a2a42 0%, #1e1428 100%)',
                  borderRadius: '40% 60% 55% 45% / 55% 45% 60% 40%',
                  transform: `translate(-50%, -50%) rotate(${rock.rot}deg)`,
                  boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.6)',
                  opacity: Math.max(0, 1 - progress * 1.1),
                  transition: 'opacity 0.15s',
                }} />
              ))}

              {/* The gem itself — clip-path polygon for real shape. */}
              <span aria-hidden="true" style={{
                position: 'absolute', inset: 0,
                clipPath: colors.clip,
                WebkitClipPath: colors.clip,
                background: `linear-gradient(135deg, ${colors.core} 0%, ${colors.mid} 50%, ${colors.deep} 100%)`,
                filter: progress < 1
                  ? `drop-shadow(0 0 ${4 + progress * 10}px ${colors.glow}) contrast(0.9) brightness(${0.75 + progress * 0.25})`
                  : `drop-shadow(0 0 14px ${colors.glow})`,
                opacity: 0.65 + progress * 0.35,
                transform: `rotate(${tilt}deg)`,
              }} />

              {/* Top-face facet highlight — catches imaginary light. */}
              <span aria-hidden="true" style={{
                position: 'absolute', inset: 0,
                clipPath: colors.facet,
                WebkitClipPath: colors.facet,
                background: `linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.05) 100%)`,
                transform: `rotate(${tilt}deg)`,
                opacity: 0.5 + progress * 0.35,
                mixBlendMode: 'screen',
              }} />

              {/* Sternen-Kristall — extra rotating sparkle ring around it */}
              {isStar && (
                <>
                  <span aria-hidden="true" style={{
                    position: 'absolute', inset: '-25%',
                    background: `conic-gradient(from 0deg,
                      transparent 0deg, rgba(255,255,255,0.5) 10deg, transparent 30deg,
                      transparent 90deg, rgba(255,255,255,0.5) 100deg, transparent 120deg,
                      transparent 180deg, rgba(255,255,255,0.5) 190deg, transparent 210deg,
                      transparent 270deg, rgba(255,255,255,0.5) 280deg, transparent 300deg,
                      transparent 360deg)`,
                    filter: 'blur(3px)',
                    opacity: progress,
                    animation: 'khStarRays 6s linear infinite',
                    borderRadius: '50%',
                  }} />
                  <span aria-hidden="true" style={{
                    position: 'absolute', inset: '-10%',
                    background: 'radial-gradient(circle, rgba(252,211,77,0.45) 0%, transparent 60%)',
                    borderRadius: '50%',
                    opacity: progress * 0.9,
                    animation: 'khGlowPulse 2s ease-in-out infinite',
                  }} />
                </>
              )}
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

        {/* Crystals flying to the ledge — use the faceted silhouette so
             they match the seam they came from, not a generic ball. */}
        {flyouts.map(f => {
          const colors = FAMILY_COLORS[f.family];
          return (
            <span key={f.id} aria-hidden="true" style={{
              position: 'absolute',
              left: `${f.startX}%`, top: `${f.startY}%`,
              width: '10%', aspectRatio: '1',
              transform: 'translate(-50%, -50%)',
              animation: 'khFlyToLedge 0.9s cubic-bezier(0.65,0,0.35,1) forwards',
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              <span style={{
                position: 'absolute', inset: 0,
                clipPath: colors.clip,
                WebkitClipPath: colors.clip,
                background: `linear-gradient(135deg, ${colors.core} 0%, ${colors.mid} 50%, ${colors.deep} 100%)`,
                filter: `drop-shadow(0 0 10px ${colors.glow})`,
              }} />
              <span style={{
                position: 'absolute', inset: 0,
                clipPath: colors.facet,
                WebkitClipPath: colors.facet,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.7), transparent)',
              }} />
            </span>
          );
        })}

        {/* Big reveal — Sternen-Kristall celebration.
             Multi-layer starburst: rotating rays + faceted 8-point star
             gem + pulsing aura. Much more "legendary" than the old flat
             gold ball. */}
        {bigReveal && (
          <div aria-hidden="true" style={{
            position: 'absolute', left: '50%', top: '40%',
            transform: 'translate(-50%, -50%)',
            animation: 'khBigReveal 2.2s ease-out forwards',
            width: 220, height: 220,
            display: 'grid', placeItems: 'center',
            zIndex: 20,
          }}>
            {/* Outer rotating starburst rays */}
            <span style={{
              position: 'absolute', inset: 0,
              background: `conic-gradient(from 0deg,
                transparent 0deg, rgba(255,255,255,0.7) 6deg, transparent 22deg,
                transparent 38deg, rgba(252,211,77,0.8) 46deg, transparent 62deg,
                transparent 82deg, rgba(255,255,255,0.7) 90deg, transparent 106deg,
                transparent 130deg, rgba(252,211,77,0.8) 138deg, transparent 154deg,
                transparent 170deg, rgba(255,255,255,0.7) 178deg, transparent 194deg,
                transparent 218deg, rgba(252,211,77,0.8) 226deg, transparent 242deg,
                transparent 260deg, rgba(255,255,255,0.7) 268deg, transparent 284deg,
                transparent 308deg, rgba(252,211,77,0.8) 316deg, transparent 332deg,
                transparent 360deg)`,
              filter: 'blur(2px)',
              animation: 'khStarRays 5s linear infinite',
              borderRadius: '50%',
              opacity: 0.9,
            }} />
            {/* Pulsing aura halo */}
            <span style={{
              position: 'absolute', inset: '20%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(252,211,77,0.85) 0%, rgba(252,211,77,0.35) 40%, transparent 75%)',
              filter: 'blur(6px)',
              animation: 'khGlowPulse 1.4s ease-in-out infinite',
            }} />
            {/* The star gem itself — same 8-point silhouette as in the
                 seam, but huge and prismatic. */}
            <span style={{
              position: 'absolute', inset: '28%',
              clipPath: FAMILY_COLORS.star.clip,
              WebkitClipPath: FAMILY_COLORS.star.clip,
              background: 'conic-gradient(from 0deg at 50% 50%, #fef3c7 0deg, #fff 45deg, #fcd34d 90deg, #fff 135deg, #fef3c7 180deg, #fff 225deg, #fcd34d 270deg, #fff 315deg, #fef3c7 360deg)',
              filter: 'drop-shadow(0 0 18px rgba(252,211,77,1)) drop-shadow(0 0 6px #fff)',
              animation: 'khStarSpin 6s linear infinite',
            }} />
            {/* Center-top sparkle accent */}
            <span style={{
              position: 'absolute', inset: '40%',
              clipPath: 'polygon(50% 0%, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0% 50%, 45% 45%)',
              background: '#ffffff',
              filter: 'drop-shadow(0 0 8px #fff)',
              animation: 'khGlowPulse 1s ease-in-out infinite',
            }} />
          </div>
        )}
        {bigReveal && (
          <p aria-hidden="true" style={{
            position: 'absolute', left: '50%', top: '72%',
            transform: 'translateX(-50%)',
            margin: 0, fontFamily: 'Fredoka, sans-serif',
            fontSize: 26, fontWeight: 600,
            background: 'linear-gradient(135deg, #fff 0%, #fcd34d 50%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textAlign: 'center', letterSpacing: '0.02em',
            filter: 'drop-shadow(0 4px 10px rgba(252,211,77,0.65))',
            animation: 'khBigRevealText 2.2s ease-out forwards',
            zIndex: 20,
          }}>
            Sternen-Kristall!
          </p>
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
        @keyframes khBigRevealText {
          0%   { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
          25%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          85%  { opacity: 1; transform: translateX(-50%) translateY(-4px) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.95); }
        }
        @keyframes khStarRays {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes khStarSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
