import React from 'react';

/**
 * MoodChibi — forward-facing chibi Ronki with mood-driven skins.
 *
 * Reuses the SideRonki chibi construction from CampfireScene (pear-shaped
 * body + belly + two horns + eyes + small mouth + legs) but re-posed to
 * face the child. Used on the Ronki profile as the mood-window portrait.
 *
 * The "skin" is the whole composite — background circle, face
 * expression, particle overlays (rain / z / ember) — not just a tint.
 * On sad days Ronki's face droops and a single tear runs down his cheek
 * with rain falling behind him. On tired days eyes close and z particles
 * drift up. Normal days: bright eyes, soft ember puff, cream→amber bg.
 *
 * Per Marc (Apr 2026): "I want to use the character that we have build
 * for the lager view also in the profile view just from a different
 * perspective (facing the child looking at him) as in the example.
 * that character than will have different moods that will effect the
 * characters profile picture."
 *
 * Props:
 *   size  — outer square pixel size (default 180)
 *   mood  — 'normal' | 'sad' | 'tired'
 */
export default function MoodChibi({ size = 180, mood = 'normal', bare = false }) {
  const palette = MOOD_SKINS[mood] || MOOD_SKINS.normal;

  // `bare` mode drops the outer circular background + inner particles
  // so the chibi sits DIRECTLY on its parent (e.g. the mood header
  // card), matching the Feature Previews .sad-hero layout where rain
  // falls across the whole card and Ronki isn't inside a locket.
  // Parent is expected to provide its own bg + particles in bare mode.
  // Also swaps the breathe animation for a gentle tired-sway when sad
  // or tired, per the reference `tired-sway` keyframe.
  const outerStyle = bare
    ? {
        position: 'relative',
        width: size, height: size,
      }
    : {
        position: 'relative',
        width: size, height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: palette.bgCircle,
        boxShadow: `inset 0 -12px 24px ${palette.bgInset}, 0 10px 22px -8px rgba(60,20,5,0.35)`,
        transition: 'background 0.6s ease',
      };

  const swayAnim = (mood === 'sad' || mood === 'tired') ? 'mc-sway 4s ease-in-out infinite' : null;
  const ronkiAnim = bare
    ? (swayAnim || (mood === 'tired' ? 'mc-breathe-slow 5s ease-in-out infinite' : 'mc-breathe 3.4s ease-in-out infinite'))
    : (mood === 'tired' ? 'mc-breathe-slow 5s ease-in-out infinite' : 'mc-breathe 3.4s ease-in-out infinite');

  return (
    <div
      aria-hidden="true"
      style={outerStyle}
    >
      {/* Mood-specific particle layers — only in the locket version;
          bare mode lets the parent render particles at card scope. */}
      {!bare && palette.particles === 'rain' && <Rain />}
      {!bare && palette.particles === 'zzz' && <ZZZ />}
      {!bare && palette.particles === 'ember' && <EmberPuff />}

      {/* Ground pad — soft shadow ellipse where Ronki sits. Skipped in
          bare mode since the card has its own visual anchoring. */}
      {!bare && (
        <div style={{
          position: 'absolute', left: '50%', bottom: '8%',
          transform: 'translateX(-50%)',
          width: '62%', height: '6%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.22), transparent 70%)',
          filter: 'blur(2px)',
        }} />
      )}

      {/* Ronki — absolutely centered, breathing (or swaying on sad/
          tired days when bare, matching the reference tired-sway). */}
      <div style={{
        position: 'absolute', left: '50%', bottom: bare ? '5%' : '14%',
        transform: 'translateX(-50%)',
        width: `${size * 0.56}px`,
        height: `${size * 0.6}px`,
        animation: ronkiAnim,
        transformOrigin: '50% 90%',
      }}>
        <Chibi palette={palette} />
      </div>

      <style>{`
        @keyframes mc-breathe {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%     { transform: translateX(-50%) scale(1.04) translateY(-2%); }
        }
        @keyframes mc-breathe-slow {
          0%,100% { transform: translateX(-50%) scale(0.98); }
          50%     { transform: translateX(-50%) scale(1.02); }
        }
        @keyframes mc-rain {
          0%   { transform: translateY(-10%); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(110%); opacity: 0; }
        }
        @keyframes mc-zzz {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          20%  { opacity: 0.9; }
          100% { transform: translate(-18px, -40px) scale(1.1); opacity: 0; }
        }
        @keyframes mc-ember {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(-60%) scale(0.4); opacity: 0; }
        }
        @keyframes mc-tear {
          0%   { transform: translateY(0); opacity: 0; }
          15%  { opacity: 1; }
          80%  { transform: translateY(14px); opacity: 1; }
          100% { transform: translateY(18px); opacity: 0; }
        }
        @keyframes mc-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          94%, 97%      { transform: scaleY(0.1); }
        }
        @keyframes mc-sway {
          0%,100% { transform: translateX(-50%) rotate(-2deg); }
          50%     { transform: translateX(-50%) rotate(2deg); }
        }
        @keyframes mc-card-rain {
          0%   { transform: translateY(-10%); opacity: 0; }
          15%  { opacity: 0.55; }
          85%  { opacity: 0.55; }
          100% { transform: translateY(140%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Skins ─────────────────────────────────────────────────────────────
// Each skin is a plain config object — bg, body/belly/horn gradients,
// mouth kind ('happy' | 'sad' | 'neutral'), particle overlay kind,
// optional extras (closedEyes, tear).

const MOOD_SKINS = {
  normal: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #fff3c8 0%, #fcd34d 45%, #f59e0b 90%)',
    bgInset: 'rgba(180,80,10,0.18)',
    body: 'linear-gradient(175deg, #fed7aa 0%, #f97316 62%, #c2410c 100%)',
    belly: '#fde0a8',
    horn: 'linear-gradient(180deg, #fde68a, #f59e0b)',
    leg: 'linear-gradient(180deg, #f97316, #9a3412)',
    eyeInk: '#1a0e08',
    cheek: 'rgba(255,105,105,0.45)',
    mouth: 'happy',
    particles: 'ember',
  },
  sad: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #c8d6e4 0%, #8fa6c2 45%, #5a7396 90%)',
    bgInset: 'rgba(30,45,75,0.32)',
    body: 'linear-gradient(175deg, #f3d2a8 0%, #d97842 62%, #934220 100%)',
    belly: '#e8c48a',
    horn: 'linear-gradient(180deg, #e8d5a0, #b88429)',
    leg: 'linear-gradient(180deg, #c76a42, #7a2e18)',
    eyeInk: '#1a0e08',
    cheek: 'rgba(220,100,100,0.28)',
    mouth: 'sad',
    particles: 'rain',
    tear: true,
  },
  tired: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #e2e8f0 0%, #94a3b8 45%, #475569 90%)',
    bgInset: 'rgba(30,41,59,0.32)',
    body: 'linear-gradient(175deg, #f5d4ad 0%, #e68548 62%, #9a4c24 100%)',
    belly: '#ecc996',
    horn: 'linear-gradient(180deg, #ecd7a5, #b88a38)',
    leg: 'linear-gradient(180deg, #d1724a, #7e361c)',
    eyeInk: '#1a0e08',
    cheek: 'rgba(180,120,120,0.35)',
    mouth: 'neutral',
    particles: 'zzz',
    closedEyes: true,
  },
};

// ── Mouth sub-component ───────────────────────────────────────────────
// Three mouth kinds: 'happy' (smile curve down), 'sad' (frown curve up),
// 'neutral' (small line). Rendered as a short border segment — same
// technique as SideRonki's mouth but larger and centered.

function Mouth({ kind }) {
  const wrapper = {
    position: 'absolute',
    left: '50%', top: '54%',
    transform: 'translateX(-50%)',
    width: '18%', height: '6%',
    zIndex: 6,
  };
  if (kind === 'sad') {
    return (
      <div style={wrapper}>
        <div style={{
          width: '100%', height: '100%',
          borderTop: '2px solid #3a1f12',
          borderRadius: '10px 10px 0 0',
        }} />
      </div>
    );
  }
  if (kind === 'neutral') {
    return (
      <div style={wrapper}>
        <div style={{
          width: '100%', height: '2px',
          background: '#3a1f12',
          borderRadius: 2,
          marginTop: '40%',
        }} />
      </div>
    );
  }
  // happy (default)
  return (
    <div style={wrapper}>
      <div style={{
        width: '100%', height: '100%',
        borderBottom: '2px solid #3a1f12',
        borderRadius: '0 0 10px 10px',
      }} />
    </div>
  );
}

// ── Chibi body ────────────────────────────────────────────────────────

function Chibi({ palette }) {
  return (
    <>
      {/* Torso — pear-shape with inset volume shadow */}
      <div style={{
        position: 'absolute', left: '5%', top: '18%',
        width: '90%', height: '68%',
        background: palette.body,
        borderRadius: '50% 50% 46% 46% / 58% 58% 42% 42%',
        boxShadow: 'inset -6px -10px 0 rgba(0,0,0,0.16), inset 4px 4px 0 rgba(255,255,255,0.22)',
        zIndex: 3,
      }} />

      {/* Belly — lighter cream panel, centered lower */}
      <div style={{
        position: 'absolute', left: '28%', bottom: '18%',
        width: '44%', height: '30%',
        background: palette.belly,
        borderRadius: '50% 50% 42% 42%',
        boxShadow: 'inset 0 -2px 3px rgba(180,90,30,0.18)',
        zIndex: 4,
      }} />

      {/* Horns — symmetric, pointing up and slightly outward */}
      <div style={{
        position: 'absolute', top: '6%', left: '24%',
        width: '12%', height: '18%',
        background: palette.horn,
        borderRadius: '50% 50% 10% 10%',
        transform: 'rotate(-12deg)',
        zIndex: 4,
      }} />
      <div style={{
        position: 'absolute', top: '6%', right: '24%',
        width: '12%', height: '18%',
        background: palette.horn,
        borderRadius: '50% 50% 10% 10%',
        transform: 'rotate(12deg)',
        zIndex: 4,
      }} />

      {/* Eyes — facing forward. Tired mood collapses them to closed slits. */}
      {palette.closedEyes ? (
        <>
          <div style={{ position: 'absolute', top: '38%', left: '24%', width: '16%', height: '2.5px', background: palette.eyeInk, borderRadius: 2, zIndex: 5 }} />
          <div style={{ position: 'absolute', top: '38%', right: '24%', width: '16%', height: '2.5px', background: palette.eyeInk, borderRadius: 2, zIndex: 5 }} />
        </>
      ) : (
        <>
          <Eye side="left" eyeInk={palette.eyeInk} />
          <Eye side="right" eyeInk={palette.eyeInk} />
        </>
      )}

      {/* Cheeks — soft blush circles flanking the mouth */}
      <div style={{
        position: 'absolute', top: '46%', left: '14%',
        width: '10%', height: '6%',
        borderRadius: '50%',
        background: palette.cheek,
        filter: 'blur(1px)',
        zIndex: 6,
      }} />
      <div style={{
        position: 'absolute', top: '46%', right: '14%',
        width: '10%', height: '6%',
        borderRadius: '50%',
        background: palette.cheek,
        filter: 'blur(1px)',
        zIndex: 6,
      }} />

      {/* Mouth — shape per mood */}
      <Mouth kind={palette.mouth} />

      {/* Tear — only for sad mood */}
      {palette.tear && (
        <div style={{
          position: 'absolute',
          top: '42%', left: '26%',
          width: '4px', height: '8px',
          background: 'linear-gradient(180deg, #9dd1f5, #5a93c9)',
          borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
          boxShadow: '0 0 4px rgba(120,180,230,0.7)',
          animation: 'mc-tear 2.4s ease-in infinite',
          zIndex: 7,
        }} />
      )}

      {/* Legs — two little feet under the torso */}
      <div style={{
        position: 'absolute', left: '25%', bottom: '-2%',
        width: '15%', height: '18%',
        background: palette.leg,
        borderRadius: '34% 34% 45% 45%',
        boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2)',
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', right: '25%', bottom: '-2%',
        width: '15%', height: '18%',
        background: palette.leg,
        borderRadius: '34% 34% 45% 45%',
        boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2)',
        zIndex: 2,
      }} />
    </>
  );
}

function Eye({ side, eyeInk }) {
  const posStyle = side === 'left' ? { left: '24%' } : { right: '24%' };
  return (
    <div style={{
      position: 'absolute',
      top: '32%',
      ...posStyle,
      width: '14%',
      height: '16%',
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.18)',
      zIndex: 5,
      animation: 'mc-blink 5.2s ease-in-out infinite',
    }}>
      <div style={{
        position: 'absolute',
        width: '60%', height: '70%',
        top: '15%', left: '20%',
        background: eyeInk,
        borderRadius: '50%',
      }}>
        <span style={{
          position: 'absolute',
          top: '15%', right: '10%',
          width: '30%', height: '30%',
          background: '#fff',
          borderRadius: '50%',
        }} />
      </div>
    </div>
  );
}

// ── Particle overlays ─────────────────────────────────────────────────

function Rain() {
  const drops = [
    { left: '12%', delay: '0s' },
    { left: '28%', delay: '0.4s' },
    { left: '42%', delay: '0.9s' },
    { left: '58%', delay: '0.2s' },
    { left: '72%', delay: '1.1s' },
    { left: '86%', delay: '0.6s' },
  ];
  return (
    <>
      {drops.map((d, i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute', top: 0, left: d.left,
          width: '1.5px', height: '16%',
          background: 'linear-gradient(180deg, transparent, rgba(200,220,240,0.85))',
          borderRadius: 2,
          animation: `mc-rain 1.7s linear ${d.delay} infinite`,
          zIndex: 1,
        }} />
      ))}
    </>
  );
}

function ZZZ() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', top: '22%', right: '26%',
      fontFamily: 'Fredoka, sans-serif',
      fontWeight: 600, fontSize: 18,
      color: 'rgba(230,240,248,0.8)',
      animation: 'mc-zzz 3.8s ease-out infinite',
      zIndex: 6,
    }}>z</div>
  );
}

function EmberPuff() {
  const puffs = [
    { left: '44%', delay: '0s' },
    { left: '56%', delay: '1.4s' },
  ];
  return (
    <>
      {puffs.map((p, i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute', bottom: '18%', left: p.left,
          width: 5, height: 5, borderRadius: '50%',
          background: 'radial-gradient(circle, #fef3c7, #f59e0b)',
          boxShadow: '0 0 6px #fcd34d',
          animation: `mc-ember 3.2s ease-in ${p.delay} infinite`,
          zIndex: 6,
        }} />
      ))}
    </>
  );
}
