import React from 'react';

/**
 * MiniRonki — chibi CSS dragon Louis recognises as his companion.
 *
 * Built from layered divs with border-radius + gradients + inset shadows
 * (the technique Claude Design used in the Feature Previews file that
 * Louis loved). Zero images, fully scalable, animation-ready.
 *
 * Scales with the `size` prop (default 30px). Pairs perfectly with
 * `<PinnedRonki>` for a circular gold-haloed pill, but can also be used
 * bare (e.g. inline in speech bubbles, reaction toasts, achievement cards).
 *
 * Moods:
 *   - 'happy'   — default, warm orange, subtle smile
 *   - 'sad'     — desaturated body, tilted eyes, a single tear
 *   - 'sleepy'  — closed eyes, soft arc mouth (bedtime)
 *   - 'proud'   — same as happy but with a brighter highlight (reward moment)
 *
 * Animations:
 *   - `breathing` (default true) → gentle 3s scale pulse
 *   - pair with <PinnedRonki burp /> for a flame puff overlay on completions
 *
 * All styles are scoped inline + via a local <style> block using a
 * component-unique class prefix so there's no global CSS mutation. The
 * breathing keyframe lives in index.css once, reused here.
 */

export default function MiniRonki({
  size = 30,
  mood = 'happy',
  breathing = true,
  className = '',
  style,
}) {
  const isSad = mood === 'sad';
  const isSleepy = mood === 'sleepy';
  const isProud = mood === 'proud';

  // Body tint: happy/proud warm orange, sad desaturated dusty-orange,
  // sleepy same as happy (bedtime is calm, not sad).
  const bodyGradient = isSad
    ? 'linear-gradient(175deg, #fbcfa8 0%, #ea8f4f 65%, #9d4714 100%)'
    : 'linear-gradient(175deg, #fed7aa 0%, #f97316 65%, #c2410c 100%)';

  // Highlight strength: proud gets a stronger white catchlight for a
  // "glowing from within" feel on achievement moments.
  const highlightAlpha = isProud ? 0.5 : 0.3;

  return (
    <div
      className={`mr-dragon ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        animation: breathing ? 'mrBreathe 3s ease-in-out infinite' : undefined,
        filter: isSad ? 'saturate(0.75) brightness(0.9)' : undefined,
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Body — chibi egg shape with inset volume shadows */}
      <div
        style={{
          position: 'absolute',
          inset: '6.6% 13.3% 13.3% 13.3%',
          background: bodyGradient,
          borderRadius: '50% 50% 45% 45% / 58% 58% 42% 42%',
          boxShadow: `inset -2px -3px 0 rgba(0,0,0,0.18), inset 1px 1px 0 rgba(255,255,255,${highlightAlpha})`,
        }}
      />

      {/* Belly — lighter cream panel on lower half */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '15%',
          transform: 'translateX(-50%)',
          width: '45%',
          height: '32%',
          background: isSad ? '#f5cf9f' : '#fde0a8',
          borderRadius: '50% 50% 40% 40%',
        }}
      />

      {/* Horns — small gold stubs tilted outward. Lay them UNDER the eyes
          (z-wise they render first) since they sit at the head-top. */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '30%',
          width: '8%',
          height: '18%',
          background: 'linear-gradient(180deg, #fde68a, #f59e0b)',
          borderRadius: '50% 50% 10% 10%',
          transform: 'rotate(-14deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '5%',
          right: '30%',
          width: '8%',
          height: '18%',
          background: 'linear-gradient(180deg, #fde68a, #f59e0b)',
          borderRadius: '50% 50% 10% 10%',
          transform: 'rotate(14deg)',
        }}
      />

      {/* Eyes — black dots on happy, tilted downward on sad, closed arc
          on sleepy. Positioning matches Claude Design: 28% / 72% / 36% */}
      {isSleepy ? (
        <>
          <div style={eyeSleepy('l')} />
          <div style={eyeSleepy('r')} />
        </>
      ) : (
        <>
          <div style={eyeOpen('l', isSad)} />
          <div style={eyeOpen('r', isSad)} />
        </>
      )}

      {/* Mouth — subtle smile on happy/proud, downturned on sad, gentle
          closed line on sleepy. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '58%',
          transform: `translateX(-50%) ${isSad ? 'rotate(180deg)' : ''}`,
          width: '20%',
          height: '6%',
          borderBottom: '1.5px solid #3a1f12',
          borderRadius: isSleepy ? '0' : (isSad ? '6px 6px 0 0' : '0 0 6px 6px'),
        }}
      />

      {/* Tear (sad only) — single blue drop under left eye */}
      {isSad && (
        <div
          style={{
            position: 'absolute',
            top: '48%',
            left: '30%',
            width: '7%',
            height: '13%',
            background: 'radial-gradient(ellipse at 50% 30%, #93c5fd, #3b82f6)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: '0 0 3px rgba(59,130,246,0.5)',
            animation: 'mrTearPulse 1.8s ease-in-out infinite',
          }}
        />
      )}

      {/* Scoped keyframes — breath + tear pulse. Cheap to duplicate per
          mount; React doesn't dedupe <style> tags but the CSS is tiny. */}
      <style>{`
        @keyframes mrBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes mrTearPulse {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.75; transform: translateY(1px); }
        }
      `}</style>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────

function eyeOpen(side, sad) {
  return {
    position: 'absolute',
    top: '36%',
    [side === 'l' ? 'left' : 'right']: '28%',
    width: '12%',
    height: '15%',
    borderRadius: '50%',
    background: '#1a0e08',
    transform: sad ? `rotate(${side === 'l' ? -10 : 10}deg)` : undefined,
  };
}

function eyeSleepy(side) {
  return {
    position: 'absolute',
    top: '40%',
    [side === 'l' ? 'left' : 'right']: '26%',
    width: '14%',
    height: '3%',
    borderRadius: '2px',
    background: '#1a0e08',
    transform: `rotate(${side === 'l' ? -8 : 8}deg)`,
  };
}
