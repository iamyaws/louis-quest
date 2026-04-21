import React from 'react';
import { getVariant } from '../data/companionVariants';

/**
 * MoodChibi — forward-facing chibi Ronki, variant-colored + mood-skinned.
 *
 * Reuses the SideRonki chibi construction from CampfireScene (pear-shaped
 * body + belly + two horns + eyes + small mouth + legs) but re-posed to
 * face the child. Used on the Ronki profile as the mood-window portrait.
 *
 * Three dimensions of variation:
 *   · Variant  — one of six colorways (amber / teal / rose / violet /
 *                forest / sunset). Drives body/belly/horn/leg gradients
 *                + eye ink + cheek tint. Set once at onboarding; Louis
 *                picks one egg and lives with that colorway forever.
 *   · Mood     — 'normal' / 'sad' / 'tired'. Drives the background
 *                circle (in non-bare mode), particle overlay, face
 *                expression (mouth + eyes), tear. Applies a saturation
 *                filter to desaturate the variant palette on bad days.
 *   · Stage    — 0..3 evolution. 0 = egg (no limbs/face), 1 = baby
 *                (proportions skewed toward the head), 2 = toddler
 *                (baseline — current chibi), 3 = final (wings + tail
 *                visible). Data-driven proportional tweaks on the same
 *                primitive shapes; same CSS construction for all.
 *
 * Per Marc (Apr 2026 + 23 Apr 2026): "use the character that we built
 * for the lager view also in the profile view from a different
 * perspective ... different moods that will effect the profile picture"
 * + "create all of the different ronki versions a kid could see" +
 * "how would evolutions look like if we created a 4-stage-evolution
 * scenario for Ronki (hatching egg → baby → toddler → final)?"
 *
 * Props:
 *   size     — outer square pixel size (default 180)
 *   mood     — 'normal' | 'sad' | 'tired' (default 'normal')
 *   bare     — if true, skips the outer circular bg + internal particles
 *              so the chibi sits directly on the parent (e.g. mood header
 *              card with card-scope particles)
 *   variant  — one of CompanionVariantId (default 'amber'). Falls back to
 *              'amber' if unknown.
 *   stage    — 0 egg | 1 baby | 2 toddler/default | 3 final (default 2)
 */
export default function MoodChibi({
  size = 180,
  mood = 'normal',
  bare = false,
  variant = 'amber',
  stage = 2,
  face = false,
}) {
  const moodSkin = MOOD_SKINS[mood] || MOOD_SKINS.normal;
  const variantPalette = getVariant(variant).chibi;
  // Variant provides the colorway; mood provides mouth + particles +
  // tear + closedEyes + the bg circle. Sad/tired desaturate the whole
  // chibi via a CSS filter so we don't duplicate palettes per mood.
  const palette = {
    ...variantPalette,
    mouth: moodSkin.mouth,
    particles: moodSkin.particles,
    tear: moodSkin.tear,
    closedEyes: moodSkin.closedEyes,
    bgCircle: moodSkin.bgCircle,
    bgInset: moodSkin.bgInset,
  };
  const chibiFilter =
    mood === 'sad'   ? 'saturate(0.6) brightness(0.92)' :
    mood === 'tired' ? 'saturate(0.5) brightness(0.88)' :
    'none';

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

      {/* Stage 0 — egg. No face/limbs; the egg itself is the whole
          figure. Small wobble to feel alive + optional crack as the
          hatching signal. */}
      {stage === 0 ? (
        <div style={{
          position: 'absolute', left: '50%', bottom: bare ? '5%' : '12%',
          transform: 'translateX(-50%)',
          width: `${size * 0.6}px`,
          height: `${size * 0.72}px`,
          animation: 'mc-egg-wobble 3.8s ease-in-out infinite',
          transformOrigin: '50% 90%',
          filter: chibiFilter,
        }}>
          <Egg palette={palette} />
        </div>
      ) : (
        <div style={{
          position: 'absolute', left: '50%', bottom: bare ? '5%' : '14%',
          transform: 'translateX(-50%)',
          // Stage scales the whole chibi: baby is smaller, final is
          // bigger. Scale factor on both dimensions.
          width: `${size * 0.56 * STAGE_SCALE[stage]}px`,
          height: `${size * 0.6 * STAGE_SCALE[stage]}px`,
          animation: ronkiAnim,
          transformOrigin: '50% 90%',
          filter: chibiFilter,
        }}>
          <Chibi palette={palette} stage={stage} face={face} />
        </div>
      )}

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
        @keyframes mc-egg-wobble {
          0%,100% { transform: translateX(-50%) rotate(-3deg); }
          25%     { transform: translateX(-50%) rotate(2deg); }
          50%     { transform: translateX(-50%) rotate(-2deg); }
          75%     { transform: translateX(-50%) rotate(3deg); }
        }
        @keyframes mc-egg-glow {
          0%,100% { opacity: 0.4; transform: scale(0.95); }
          50%     { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

// ── Skins ─────────────────────────────────────────────────────────────
// Mood-specific overlay only (mouth, particles, tear, closed eyes, and
// the bg-circle palette used when not in bare mode). Body/belly/horn/
// leg colors come from the variant so each colorway renders its own
// Ronki. Sad/tired also apply a CSS saturate filter at the parent
// component level rather than a pre-desaturated palette — keeps this
// table thin.

// Stage scale factor — how much to scale the whole chibi relative to
// the default toddler build. Baby is smaller (0.78), final is taller
// (1.1). Egg uses its own Egg component, not the chibi.
const STAGE_SCALE = { 0: 1, 1: 0.78, 2: 1, 3: 1.1 };

const MOOD_SKINS = {
  normal: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #fff3c8 0%, #fcd34d 45%, #f59e0b 90%)',
    bgInset: 'rgba(180,80,10,0.18)',
    mouth: 'happy',
    particles: 'ember',
  },
  sad: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #c8d6e4 0%, #8fa6c2 45%, #5a7396 90%)',
    bgInset: 'rgba(30,45,75,0.32)',
    mouth: 'sad',
    particles: 'rain',
    tear: true,
  },
  tired: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #e2e8f0 0%, #94a3b8 45%, #475569 90%)',
    bgInset: 'rgba(30,41,59,0.32)',
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

function Chibi({ palette, stage = 2, face = false }) {
  // Stage-dependent tweaks. Baby (1) has bigger eyes and slightly shorter
  // horns relative to body. Final (3) grows the horns + adds wings and
  // a visible tail behind the torso. Toddler (2) is the current baseline.
  //
  // `face` mode renders only the head — no legs, slit eyes on sad (per
  // Feature Previews .sad-ronki reference: eyes are 2-3px down-slanted
  // lines, not round eyes with pupils). Matches Marc's "just the face"
  // feedback 23 Apr 2026.
  const isBaby = stage === 1;
  const isFinal = stage === 3;
  const isSadFace = face && palette.mouth === 'sad';
  return (
    <>
      {/* Stage 3 — wings behind the torso (drawn first so they sit
          beneath the body). Small triangular flaps that breathe with
          the body. */}
      {isFinal && (
        <>
          <div style={{
            position: 'absolute', top: '26%', left: '-10%',
            width: '30%', height: '36%',
            background: palette.body,
            borderRadius: '70% 20% 60% 30% / 60% 20% 70% 40%',
            transform: 'rotate(-22deg)',
            opacity: 0.95,
            zIndex: 1,
            boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.15)',
          }} />
          <div style={{
            position: 'absolute', top: '26%', right: '-10%',
            width: '30%', height: '36%',
            background: palette.body,
            borderRadius: '20% 70% 30% 60% / 20% 60% 40% 70%',
            transform: 'rotate(22deg)',
            opacity: 0.95,
            zIndex: 1,
            boxShadow: 'inset 4px -4px 0 rgba(0,0,0,0.15)',
          }} />

          {/* Tail — long slim arc from behind-right, tip glowing */}
          <div style={{
            position: 'absolute', right: '-4%', bottom: '8%',
            width: '32%', height: '14%',
            background: palette.body,
            borderRadius: '50% 80% 60% 70% / 60% 60% 50% 50%',
            transform: 'rotate(-16deg)',
            zIndex: 1,
            boxShadow: 'inset 2px -3px 0 rgba(0,0,0,0.18)',
          }}>
            <span style={{
              position: 'absolute', right: -4, top: -4,
              width: 10, height: 10, borderRadius: '50%',
              background: palette.horn,
              boxShadow: `0 0 8px ${palette.cheek}`,
            }} />
          </div>
        </>
      )}

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

      {/* Horns — symmetric, pointing up. Baby has tiny nubs; final has
          longer curved horns; toddler (default) is in between. */}
      <div style={{
        position: 'absolute',
        top: isBaby ? '8%' : (isFinal ? '2%' : '6%'),
        left: '24%',
        width: isBaby ? '9%' : '12%',
        height: isBaby ? '12%' : (isFinal ? '22%' : '18%'),
        background: palette.horn,
        borderRadius: '50% 50% 10% 10%',
        transform: `rotate(${isFinal ? '-16deg' : '-12deg'})`,
        zIndex: 4,
      }} />
      <div style={{
        position: 'absolute',
        top: isBaby ? '8%' : (isFinal ? '2%' : '6%'),
        right: '24%',
        width: isBaby ? '9%' : '12%',
        height: isBaby ? '12%' : (isFinal ? '22%' : '18%'),
        background: palette.horn,
        borderRadius: '50% 50% 10% 10%',
        transform: `rotate(${isFinal ? '16deg' : '12deg'})`,
        zIndex: 4,
      }} />

      {/* Eyes — three modes. Tired: horizontal closed slits. Sad in
          face mode: down-slanted lines (reference .sr-eye rotated
          ±10deg). Otherwise: round white eye with pupil. */}
      {palette.closedEyes ? (
        <>
          <div style={{ position: 'absolute', top: '38%', left: '24%', width: '16%', height: '2.5px', background: palette.eyeInk, borderRadius: 2, zIndex: 5 }} />
          <div style={{ position: 'absolute', top: '38%', right: '24%', width: '16%', height: '2.5px', background: palette.eyeInk, borderRadius: 2, zIndex: 5 }} />
        </>
      ) : isSadFace ? (
        <>
          <div style={{ position: 'absolute', top: '36%', left: '26%', width: '14%', height: '3px', background: palette.eyeInk, borderRadius: 2, transform: 'rotate(-10deg)', zIndex: 5 }} />
          <div style={{ position: 'absolute', top: '36%', right: '26%', width: '14%', height: '3px', background: palette.eyeInk, borderRadius: 2, transform: 'rotate(10deg)', zIndex: 5 }} />
        </>
      ) : (
        <>
          <Eye side="left" eyeInk={palette.eyeInk} big={isBaby} />
          <Eye side="right" eyeInk={palette.eyeInk} big={isBaby} />
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

      {/* Legs — two little feet under the torso. Hidden in face mode,
          matching the Feature Previews .sad-ronki portrait (no legs
          visible, the torso IS the head silhouette). */}
      {!face && (
        <>
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
      )}
    </>
  );
}

function Eye({ side, eyeInk, big = false }) {
  const posStyle = side === 'left'
    ? { left: big ? '22%' : '24%' }
    : { right: big ? '22%' : '24%' };
  return (
    <div style={{
      position: 'absolute',
      top: big ? '30%' : '32%',
      ...posStyle,
      width: big ? '18%' : '14%',
      height: big ? '21%' : '16%',
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

// ── Egg — stage 0 ─────────────────────────────────────────────────────
// Variant gradient in an egg silhouette. One diagonal crack line hints
// at hatching; a soft pulsing glow suggests "something's alive in
// there." No face, no limbs — those arrive at stage 1 (baby).

function Egg({ palette }) {
  return (
    <>
      {/* Glow behind the egg — rhythmic pulse */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: '-8%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${palette.cheek} 0%, transparent 65%)`,
        filter: 'blur(10px)',
        animation: 'mc-egg-glow 2.6s ease-in-out infinite',
      }} />
      {/* Egg body */}
      <div style={{
        position: 'absolute', inset: 0,
        background: palette.body,
        borderRadius: '50% 50% 45% 45% / 62% 62% 38% 38%',
        boxShadow: 'inset -8px -12px 0 rgba(0,0,0,0.18), inset 6px 6px 0 rgba(255,255,255,0.28), 0 8px 18px -6px rgba(0,0,0,0.3)',
        zIndex: 2,
      }}>
        {/* Hatching crack — diagonal darker line across mid-body */}
        <span style={{
          position: 'absolute',
          top: '42%', left: '22%',
          width: '56%', height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.55) 70%, transparent 100%)',
          borderRadius: 3,
          transform: 'rotate(-8deg)',
          zIndex: 3,
        }} />
        {/* Secondary smaller crack, offset, gives the egg "texture" */}
        <span style={{
          position: 'absolute',
          top: '58%', left: '35%',
          width: '28%', height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.35), transparent)',
          borderRadius: 2,
          transform: 'rotate(6deg)',
          zIndex: 3,
        }} />
        {/* Subtle spots for speckled-egg feel */}
        <span style={{
          position: 'absolute', top: '20%', left: '30%',
          width: '6%', height: '6%', borderRadius: '50%',
          background: 'rgba(0,0,0,0.18)', zIndex: 3,
        }} />
        <span style={{
          position: 'absolute', top: '30%', right: '26%',
          width: '4%', height: '4%', borderRadius: '50%',
          background: 'rgba(0,0,0,0.22)', zIndex: 3,
        }} />
        <span style={{
          position: 'absolute', bottom: '26%', right: '30%',
          width: '5%', height: '5%', borderRadius: '50%',
          background: 'rgba(0,0,0,0.15)', zIndex: 3,
        }} />
      </div>
    </>
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
