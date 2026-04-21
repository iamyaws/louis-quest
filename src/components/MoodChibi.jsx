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
    mood === 'sad'     ? 'saturate(0.6) brightness(0.92)' :
    mood === 'tired'   ? 'saturate(0.5) brightness(0.88)' :
    mood === 'besorgt' ? 'saturate(0.8) brightness(0.96)' :
    mood === 'magisch' ? 'saturate(1.2) brightness(1.05)' :
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

  // Per-mood idle loop — each emotion gets its own signature motion so
  // the kid reads the feeling from across the room without needing the
  // label. CSS-only; one transform/opacity animation per mood (perf).
  let ronkiAnim;
  if (mood === 'sad')           ronkiAnim = 'mc-sway 4s ease-in-out infinite';
  else if (mood === 'tired')    ronkiAnim = bare
      ? 'mc-sway 5s ease-in-out infinite'
      : 'mc-breathe-slow 5s ease-in-out infinite';
  else if (mood === 'besorgt')  ronkiAnim = 'mc-fidget 3s ease-in-out infinite';
  else if (mood === 'gut')      ronkiAnim = 'mc-bounce 2.6s ease-in-out infinite';
  else if (mood === 'magisch')  ronkiAnim = 'mc-shimmer 3.2s ease-in-out infinite';
  else                          ronkiAnim = 'mc-breathe 3.4s ease-in-out infinite';

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
      {!bare && palette.particles === 'sparkle' && <SparkleDrift />}
      {!bare && palette.particles === 'fidget' && <FidgetDots />}
      {/* Magisch aura — gold-rose halo behind the chibi, pulsing slowly */}
      {!bare && moodSkin.aura && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '88%', height: '88%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,168,212,0.45) 0%, rgba(249,168,212,0) 65%)',
          animation: 'mc-aura 2.8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

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
        /* 6-mood expansion loops — one subtle motion per emotion */
        @keyframes mc-fidget {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          20%      { transform: translateX(-52%) rotate(-2deg); }
          50%      { transform: translateX(-50%) rotate(0deg); }
          80%      { transform: translateX(-48%) rotate(2deg); }
        }
        @keyframes mc-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
          30%      { transform: translateX(-50%) translateY(-6%) scale(1.03); }
          50%      { transform: translateX(-50%) translateY(-4%) scale(1.02); }
          70%      { transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes mc-shimmer {
          0%, 100% { transform: translateX(-50%) scale(1); filter: brightness(1); }
          50%      { transform: translateX(-50%) scale(1.04); filter: brightness(1.15) drop-shadow(0 0 10px rgba(249,168,212,0.6)); }
        }
        @keyframes mc-aura {
          0%, 100% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.92); }
          50%      { opacity: 0.7;  transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes mc-sparkle-drift {
          0%   { opacity: 0; transform: translate(0, 0) scale(0.4); }
          30%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-6px, -36px) scale(1); }
        }
        @keyframes mc-fidget-dot {
          0%, 100% { opacity: 0; }
          40%, 60% { opacity: 0.7; }
        }
        /* Legend + Teen crown effects */
        @keyframes mc-horn-tip {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
          50%      { opacity: 1;   transform: translateX(-50%) scale(1.2); }
        }
        @keyframes mc-legend-rays {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes mc-legend-pulse {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.94); }
          50%      { opacity: 0.9;  transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes mc-legend-crystal {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.9)) brightness(1); }
          50%      { filter: drop-shadow(0 0 10px rgba(255,255,255,1)) brightness(1.4); }
        }
        /* Egg hatch-beam — soft column of golden light escaping the crack */
        @keyframes mc-egg-beam {
          0%, 100% { opacity: 0.35; transform: translateX(-50%) scaleY(0.85); }
          50%      { opacity: 0.75; transform: translateX(-50%) scaleY(1.05); }
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
// (1.1). Egg uses its own Egg component, not the chibi. Stages 4
// (Teen/Heranwachsend) + 5 (Legend) extend the scale ramp.
const STAGE_SCALE = { 0: 1, 1: 0.78, 2: 1, 3: 1.1, 4: 1.22, 5: 1.38 };
// Wing size per stage — dragons have wings from hatch (Marc Apr 2026).
// 0 has no wings (egg). 1-5 scale up from barely-visible nubs to fully
// extended majestic wings.
const WING_SCALE = {
  0: 0,     // egg — no wings
  1: 0.35,  // baby — tiny nubs
  2: 0.65,  // toddler — small
  3: 1.0,   // stolz — current size (baseline)
  4: 1.25,  // teen — bigger
  5: 1.55,  // legend — fully extended
};

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
  // ── 6-mood expansion (Apr 2026) ──
  // Adds besorgt / gut / magisch so the Stimmung card's full 6-emotion
  // taxonomy has chibi coverage. Normal + sad + tired stay as-is so
  // existing states don't drift.
  besorgt: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #e9dbff 0%, #c4b5fd 45%, #8b5cf6 90%)',
    bgInset: 'rgba(55,30,110,0.28)',
    mouth: 'worried',
    particles: 'fidget',
  },
  gut: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #fcd34d 45%, #d97706 90%)',
    bgInset: 'rgba(180,83,9,0.22)',
    mouth: 'wide-happy',
    particles: 'ember',
    bounce: true,
  },
  magisch: {
    bgCircle: 'radial-gradient(ellipse at 50% 30%, #fce7f3 0%, #f9a8d4 45%, #db2777 90%)',
    bgInset: 'rgba(190,25,105,0.24)',
    mouth: 'happy',
    particles: 'sparkle',
    aura: true,
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
  if (kind === 'worried') {
    // Slight open oval — concerned expression
    return (
      <div style={wrapper}>
        <div style={{
          width: '60%', height: '100%',
          border: '2px solid #3a1f12',
          borderRadius: '50%',
          margin: '0 auto',
          background: 'rgba(58,31,18,0.08)',
        }} />
      </div>
    );
  }
  if (kind === 'wide-happy') {
    // Wider smile — Gut mood
    return (
      <div style={{ ...wrapper, width: '26%', height: '8%' }}>
        <div style={{
          width: '100%', height: '100%',
          borderBottom: '2.5px solid #3a1f12',
          borderRadius: '0 0 12px 12px',
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
  // horns relative to body. Wings render from stage 1 onward (Marc Apr
  // 2026 — "dragons have wings from hatch") at sizes controlled by
  // WING_SCALE. Stages 3+ show a visible tail. Stages 4-5 add a legendary
  // aura ring behind the whole chibi.
  //
  // `face` mode renders only the head — no legs, slit eyes on sad (per
  // Feature Previews .sad-ronki reference: eyes are 2-3px down-slanted
  // lines, not round eyes with pupils). Matches Marc's "just the face"
  // feedback 23 Apr 2026.
  const isBaby = stage === 1;
  const isFinal = stage === 3;
  const isTeen = stage === 4;
  const isLegend = stage === 5;
  const hasTail = stage >= 3;
  const hasAura = stage >= 5;
  const wingScale = WING_SCALE[stage] ?? 0;
  const isSadFace = face && palette.mouth === 'sad';
  // Wing dimensions in percent — scale from base (stage 3 = 30% × 36%).
  const wingW = 30 * wingScale;
  const wingH = 36 * wingScale;
  // Wings tilt further out on bigger stages
  const wingRot = 22 + (stage - 3) * 4;
  return (
    <>
      {/* Teen aura — pre-Legend glow, less dramatic than Legend's rays
          but more than the plain stage-3 chibi. */}
      {isTeen && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '130%', height: '130%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.cheek || '#fcd34d'}40 0%, transparent 65%)`,
          filter: 'blur(8px)',
          zIndex: 0,
          pointerEvents: 'none',
        }} />
      )}

      {/* Legendary aura — pulsing starburst of light rays behind the
          chibi, rotating slowly, with a bright radial halo underneath
          for depth. All CSS — no new assets. */}
      {hasAura && (
        <>
          {/* Rotating starburst rays — drawn as a repeating conic wedge */}
          <div aria-hidden="true" style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '170%', height: '170%',
            borderRadius: '50%',
            background: `conic-gradient(from 0deg,
              ${palette.cheek || '#fcd34d'}00 0deg,
              ${palette.cheek || '#fcd34d'}55 8deg,
              ${palette.cheek || '#fcd34d'}00 18deg,
              ${palette.cheek || '#fcd34d'}00 44deg,
              ${palette.cheek || '#fcd34d'}66 52deg,
              ${palette.cheek || '#fcd34d'}00 62deg,
              ${palette.cheek || '#fcd34d'}00 88deg,
              ${palette.cheek || '#fcd34d'}55 96deg,
              ${palette.cheek || '#fcd34d'}00 106deg,
              ${palette.cheek || '#fcd34d'}00 132deg,
              ${palette.cheek || '#fcd34d'}66 140deg,
              ${palette.cheek || '#fcd34d'}00 150deg,
              ${palette.cheek || '#fcd34d'}00 176deg,
              ${palette.cheek || '#fcd34d'}55 184deg,
              ${palette.cheek || '#fcd34d'}00 194deg,
              ${palette.cheek || '#fcd34d'}00 220deg,
              ${palette.cheek || '#fcd34d'}66 228deg,
              ${palette.cheek || '#fcd34d'}00 238deg,
              ${palette.cheek || '#fcd34d'}00 264deg,
              ${palette.cheek || '#fcd34d'}55 272deg,
              ${palette.cheek || '#fcd34d'}00 282deg,
              ${palette.cheek || '#fcd34d'}00 308deg,
              ${palette.cheek || '#fcd34d'}66 316deg,
              ${palette.cheek || '#fcd34d'}00 326deg,
              ${palette.cheek || '#fcd34d'}00 352deg,
              ${palette.cheek || '#fcd34d'}55 360deg)`,
            opacity: 0.5,
            filter: 'blur(2px)',
            animation: 'mc-legend-rays 14s linear infinite',
            zIndex: 0,
            pointerEvents: 'none',
          }} />
          {/* Inner radial halo — warm core glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150%', height: '150%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.cheek || '#fcd34d'}70 0%, ${palette.cheek || '#fcd34d'}22 40%, transparent 70%)`,
            filter: 'blur(10px)',
            animation: 'mc-legend-pulse 3s ease-in-out infinite',
            zIndex: 0,
            pointerEvents: 'none',
          }} />
          {/* Chest crystal — a small glowing gem on the torso centerline */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            left: '50%', top: '44%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8%', height: '8%',
            background: `linear-gradient(135deg, #fff, ${palette.cheek || '#fcd34d'})`,
            boxShadow: `0 0 12px ${palette.cheek || '#fcd34d'}, 0 0 4px #fff`,
            zIndex: 5,
            animation: 'mc-legend-crystal 2.4s ease-in-out infinite',
          }} />
        </>
      )}

      {/* Wings — scaled per stage (0 = hidden). Drawn first so they sit
          beneath the torso. Teen/Legend get membrane veining (darker
          radial) + gold glow halo on Legend, making big wings read as
          dragon-grade instead of soft pillow-flaps. */}
      {wingScale > 0 && (
        <>
          <div style={{
            position: 'absolute', top: `${28 - stage * 0.8}%`,
            left: `${-wingW * 0.35}%`,
            width: `${wingW}%`, height: `${wingH}%`,
            background: stage >= 4
              ? `radial-gradient(ellipse at 90% 50%, ${palette.body} 0%, ${palette.body} 60%, rgba(0,0,0,0.22) 100%)`
              : palette.body,
            borderRadius: '70% 20% 60% 30% / 60% 20% 70% 40%',
            transform: `rotate(-${wingRot}deg)`,
            opacity: 0.95,
            zIndex: 1,
            boxShadow: stage >= 5
              ? `inset -4px -4px 0 rgba(0,0,0,0.18), 0 0 14px ${palette.cheek || '#fcd34d'}88`
              : 'inset -4px -4px 0 rgba(0,0,0,0.15)',
          }} />
          <div style={{
            position: 'absolute', top: `${28 - stage * 0.8}%`,
            right: `${-wingW * 0.35}%`,
            width: `${wingW}%`, height: `${wingH}%`,
            background: stage >= 4
              ? `radial-gradient(ellipse at 10% 50%, ${palette.body} 0%, ${palette.body} 60%, rgba(0,0,0,0.22) 100%)`
              : palette.body,
            borderRadius: '20% 70% 30% 60% / 20% 60% 40% 70%',
            transform: `rotate(${wingRot}deg)`,
            opacity: 0.95,
            zIndex: 1,
            boxShadow: stage >= 5
              ? `inset 4px -4px 0 rgba(0,0,0,0.18), 0 0 14px ${palette.cheek || '#fcd34d'}88`
              : 'inset 4px -4px 0 rgba(0,0,0,0.15)',
          }} />
        </>
      )}

      {/* Tail — shows from stage 3 onward. Slimmer on Teen/Legend and
          tip glows brighter on Legend. */}
      {hasTail && (
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
            boxShadow: `0 0 ${isLegend ? '14px' : '8px'} ${palette.cheek}`,
          }} />
        </div>
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

      {/* Horns — symmetric, pointing up. Baby has tiny nubs; Final curves
          a bit; Teen grows taller; Legend gets crown-style dual spikes
          with a bright glowing tip. */}
      {(() => {
        // Horn metrics per stage
        const hornTop = isBaby ? '8%' : isLegend ? '-2%' : isTeen ? '0%' : isFinal ? '2%' : '6%';
        const hornW =
          isLegend ? '14%' : isTeen ? '13%' : isBaby ? '9%' : '12%';
        const hornH =
          isLegend ? '28%' : isTeen ? '24%' : isBaby ? '12%' : isFinal ? '22%' : '18%';
        const rotL = isLegend ? -20 : isTeen ? -18 : isFinal ? -16 : -12;
        const rotR = -rotL;
        // Legend horns get a richer gradient (crown jewel feel)
        const hornBg = isLegend
          ? `linear-gradient(180deg, ${palette.horn} 0%, ${palette.body} 100%)`
          : palette.horn;
        // Crown tip glow for Teen + Legend — small radial at the pointed end
        const showTipGlow = isTeen || isLegend;
        return (
          <>
            <div style={{
              position: 'absolute',
              top: hornTop, left: '24%',
              width: hornW, height: hornH,
              background: hornBg,
              borderRadius: '50% 50% 10% 10%',
              transform: `rotate(${rotL}deg)`,
              boxShadow: isLegend ? `inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -2px 2px rgba(0,0,0,0.25)` : undefined,
              zIndex: 4,
            }}>
              {showTipGlow && (
                <span aria-hidden="true" style={{
                  position: 'absolute', top: '-6px', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '14px', height: '14px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${palette.cheek || '#fcd34d'} 0%, transparent 65%)`,
                  filter: 'blur(2px)',
                  animation: 'mc-horn-tip 2.4s ease-in-out infinite',
                }} />
              )}
            </div>
            <div style={{
              position: 'absolute',
              top: hornTop, right: '24%',
              width: hornW, height: hornH,
              background: hornBg,
              borderRadius: '50% 50% 10% 10%',
              transform: `rotate(${rotR}deg)`,
              boxShadow: isLegend ? `inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -2px 2px rgba(0,0,0,0.25)` : undefined,
              zIndex: 4,
            }}>
              {showTipGlow && (
                <span aria-hidden="true" style={{
                  position: 'absolute', top: '-6px', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '14px', height: '14px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${palette.cheek || '#fcd34d'} 0%, transparent 65%)`,
                  filter: 'blur(2px)',
                  animation: 'mc-horn-tip 2.4s ease-in-out infinite 0.6s',
                }} />
              )}
            </div>
            {/* Legend only: a third central mini-horn, forming a crown */}
            {isLegend && (
              <div style={{
                position: 'absolute',
                top: '-4%', left: '50%',
                transform: 'translateX(-50%)',
                width: '9%', height: '22%',
                background: hornBg,
                borderRadius: '50% 50% 10% 10%',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -2px 2px rgba(0,0,0,0.25)',
                zIndex: 4,
              }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', top: '-6px', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '14px', height: '14px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${palette.cheek || '#fcd34d'} 0%, transparent 65%)`,
                  filter: 'blur(2px)',
                  animation: 'mc-horn-tip 2.4s ease-in-out infinite 1.2s',
                }} />
              </div>
            )}
          </>
        );
      })()}

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
      {/* Light beams escaping the top crack — two soft golden cones that
          pulse with the glow. Reads as "something alive is about to
          break through" instead of a static painted egg. */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: '-24%', left: '50%',
        width: '24%', height: '38%',
        transform: 'translateX(-50%)',
        background: `linear-gradient(to top, ${palette.cheek || '#fcd34d'}, transparent)`,
        clipPath: 'polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)',
        filter: 'blur(4px)',
        animation: 'mc-egg-beam 2.6s ease-in-out infinite',
        zIndex: 3,
        pointerEvents: 'none',
      }} />
      <span aria-hidden="true" style={{
        position: 'absolute', top: '-18%', left: '46%',
        width: '10%', height: '30%',
        transform: 'translateX(-50%) rotate(-12deg)',
        background: `linear-gradient(to top, #fff, transparent)`,
        filter: 'blur(3px)',
        opacity: 0.6,
        animation: 'mc-egg-beam 2.6s ease-in-out infinite 0.5s',
        zIndex: 3,
        pointerEvents: 'none',
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

// Magisch — 3 small stars drifting up-and-leftward on rotating delays.
// Delivers the "twinkly aura" without a heavy particle system.
function SparkleDrift() {
  const stars = [
    { left: '30%', top: '40%', delay: '0s',   dur: '3s' },
    { left: '62%', top: '34%', delay: '1.2s', dur: '3.4s' },
    { left: '48%', top: '56%', delay: '2.3s', dur: '3.2s' },
  ];
  return (
    <>
      {stars.map((s, i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute', left: s.left, top: s.top,
          fontFamily: 'Fredoka, sans-serif',
          fontSize: 14, lineHeight: 1, color: '#fbcfe8',
          filter: 'drop-shadow(0 0 5px rgba(251,207,232,0.9))',
          animation: `mc-sparkle-drift ${s.dur} ease-out ${s.delay} infinite`,
          zIndex: 6,
        }}>✦</span>
      ))}
    </>
  );
}

// Besorgt — three tiny worry dots hovering near Ronki's head, fading
// in/out in sync. Implies fidget / "what if" without being loud.
function FidgetDots() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute',
          top: '24%',
          left: `${52 + i * 6}%`,
          width: 3, height: 3,
          borderRadius: '50%',
          background: 'rgba(139,92,246,0.7)',
          boxShadow: '0 0 4px rgba(139,92,246,0.5)',
          animation: `mc-fidget-dot 1.8s ease-in-out ${i * 0.25}s infinite`,
          zIndex: 6,
        }} />
      ))}
    </>
  );
}
