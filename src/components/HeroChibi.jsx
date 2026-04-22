import React from 'react';

/**
 * HeroChibi — kid-character CSS-native chibi composition.
 *
 * Purpose: give Louis (and other kids) a self-representation in the
 * top-bar avatar. The app already renders Ronki as a vibrant customized
 * companion (MoodChibi) but the HERO was stuck on a stock `hero-default.webp`
 * image. That's asymmetric — Louis is THE HERO; he should look like
 * himself, not like a generic cartoon kid.
 *
 * Design choices:
 *   - Pure CSS / SVG construction — no art assets. Borrows the same
 *     border-radius + gradient vocabulary MoodChibi uses for Ronki.
 *   - 3 × orthogonal pickers (skin / hair / expression) compose into
 *     5 × 6 × 4 = 120 unique appearances. Enough variety without
 *     drowning a 6yo in options.
 *   - Single `size` prop drives all internal dimensions so the same
 *     component works in a 38px top-bar pill and in a 180px preview
 *     inside the builder.
 *
 * Progressive discovery: this component is NEVER shown unless
 * state.heroFace is set. The builder (HeroBuilder.jsx) writes it on
 * save. Until then, the stock image renders — the kid has to tap
 * their own avatar to trigger the reveal. No coachmark, no onboarding
 * step. "Kid explores by himself" per Marc's directive.
 */

// ── Palettes (exported so HeroBuilder can render swatches) ──
export const SKIN_TONES = [
  { id: 'pale',   color: '#fde7d0', blush: '#f9cfc0' },
  { id: 'light',  color: '#f6d5a7', blush: '#ebb890' },
  { id: 'warm',   color: '#e8b085', blush: '#d89468' },
  { id: 'tan',    color: '#c68963', blush: '#a86c49' },
  { id: 'deep',   color: '#8b5a3c', blush: '#6d4229' },
];

export const HAIR_STYLES = [
  { id: 'short-brown',    color: '#6b3a1f', style: 'short',    label: { de: 'Kurz braun',   en: 'Short brown' } },
  { id: 'short-blonde',   color: '#d4a857', style: 'short',    label: { de: 'Kurz blond',   en: 'Short blond' } },
  { id: 'long-black',     color: '#1f1a17', style: 'long',     label: { de: 'Lang schwarz', en: 'Long black' } },
  { id: 'long-blonde',    color: '#e0b968', style: 'long',     label: { de: 'Lang blond',   en: 'Long blond' } },
  { id: 'curly-red',      color: '#b84a1e', style: 'curly',    label: { de: 'Locken rot',   en: 'Curly red' } },
  { id: 'bun-brown',      color: '#5a2e17', style: 'bun',      label: { de: 'Dutt braun',   en: 'Bun brown' } },
];

export const EXPRESSIONS = [
  { id: 'happy',   label: { de: 'Fröhlich',  en: 'Happy' } },
  { id: 'curious', label: { de: 'Neugierig', en: 'Curious' } },
  { id: 'cool',    label: { de: 'Cool',      en: 'Cool' } },
  { id: 'shy',     label: { de: 'Schüchtern',en: 'Shy' } },
];

export const DEFAULT_FACE = {
  skin: 'warm',
  hair: 'short-brown',
  expression: 'happy',
};

export function resolveFace(face) {
  const skin = SKIN_TONES.find(s => s.id === face?.skin) || SKIN_TONES[2];
  const hair = HAIR_STYLES.find(h => h.id === face?.hair) || HAIR_STYLES[0];
  const expression = EXPRESSIONS.find(e => e.id === face?.expression) || EXPRESSIONS[0];
  return { skin, hair, expression };
}

/**
 * Render a chibi composition.
 *
 * Props:
 *   - face: { skin, hair, expression } — ids into the palettes
 *   - size: pixel edge length of the square chibi (default 80)
 *   - className: passthrough for outer positioning
 */
export default function HeroChibi({ face, size = 80, className = '' }) {
  const { skin, hair, expression } = resolveFace(face);
  const s = size;
  // Proportional sub-sizes so a 38px avatar and a 180px preview both
  // read correctly. The face fills ~70% of the box; hair sits on top;
  // there's room for a small torso hint at the bottom.
  const headSize = s * 0.82;
  const headTop = s * 0.05;
  const headLeft = (s - headSize) / 2;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: s,
        height: s,
        borderRadius: '50%',
        background: 'linear-gradient(180deg, #fef3c7 0%, #fcd34d 100%)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Head — warm oval with subtle inset shadow for depth */}
      <div
        style={{
          position: 'absolute',
          top: headTop,
          left: headLeft,
          width: headSize,
          height: headSize,
          borderRadius: '52% 52% 48% 48% / 56% 56% 44% 44%',
          background: `radial-gradient(circle at 30% 30%, ${skin.color} 0%, ${skin.color} 60%, ${shade(skin.color, -8)} 100%)`,
          boxShadow: `inset -${s * 0.04}px -${s * 0.06}px ${s * 0.08}px rgba(0,0,0,0.1)`,
        }}
      />

      {/* Hair — shape depends on style id. Rendered AFTER head so it
           sits on top without being clipped by the head's overflow. */}
      <Hair style={hair.style} color={hair.color} size={s} />

      {/* Cheeks — soft blush dots, always present */}
      <span style={cheekStyle(s, skin.blush, 'left')} />
      <span style={cheekStyle(s, skin.blush, 'right')} />

      {/* Eyes + mouth — expression-dependent */}
      <Face expression={expression.id} size={s} />
    </div>
  );
}

// ── Hair shapes ───────────────────────────────────────────────────────

function Hair({ style, color, size: s }) {
  const common = {
    position: 'absolute',
    background: color,
    boxShadow: `inset ${s * 0.03}px ${s * 0.03}px ${s * 0.05}px rgba(255,255,255,0.15)`,
  };
  if (style === 'short') {
    // Short cap — covers top half of head, slight sideburns
    return (
      <div style={{
        ...common,
        top: s * 0.05,
        left: s * 0.11,
        width: s * 0.78,
        height: s * 0.38,
        borderRadius: '60% 60% 40% 40% / 90% 90% 25% 25%',
      }} />
    );
  }
  if (style === 'long') {
    // Long hair — longer drop down the sides past the jaw
    return (
      <>
        <div style={{
          ...common,
          top: s * 0.04,
          left: s * 0.08,
          width: s * 0.84,
          height: s * 0.82,
          borderRadius: '52% 52% 40% 40% / 40% 40% 60% 60%',
        }} />
        {/* Face cutout — re-open the face area so hair doesn't cover eyes */}
        <div style={{
          position: 'absolute',
          top: s * 0.28,
          left: s * 0.18,
          width: s * 0.64,
          height: s * 0.58,
          borderRadius: '48% 48% 48% 48% / 54% 54% 46% 46%',
          background: 'transparent',
          boxShadow: `inset 0 0 0 ${s * 0.5}px transparent`,
          pointerEvents: 'none',
        }} />
      </>
    );
  }
  if (style === 'curly') {
    // Curly — render 5 overlapping circles at top for pompom effect
    const circles = [
      { x: 0.18, y: 0.02, r: 0.26 },
      { x: 0.40, y: -0.02, r: 0.30 },
      { x: 0.56, y: 0.02, r: 0.26 },
      { x: 0.10, y: 0.14, r: 0.22 },
      { x: 0.65, y: 0.14, r: 0.22 },
    ];
    return (
      <>
        {circles.map((c, i) => (
          <div key={i} style={{
            ...common,
            top: s * c.y,
            left: s * c.x,
            width: s * c.r * 2,
            height: s * c.r * 2,
            borderRadius: '50%',
          }} />
        ))}
      </>
    );
  }
  if (style === 'bun') {
    // Bun — small circle on top + cap around the head
    return (
      <>
        <div style={{
          ...common,
          top: s * 0.08,
          left: s * 0.13,
          width: s * 0.74,
          height: s * 0.32,
          borderRadius: '60% 60% 40% 40% / 90% 90% 25% 25%',
        }} />
        <div style={{
          ...common,
          top: -s * 0.04,
          left: s * 0.34,
          width: s * 0.32,
          height: s * 0.26,
          borderRadius: '50%',
        }} />
      </>
    );
  }
  return null;
}

// ── Face (eyes + mouth) ─────────────────────────────────────────────

function Face({ expression, size: s }) {
  const eyeY = s * 0.44;
  const eyeLeftX = s * 0.30;
  const eyeRightX = s * 0.62;
  const eyeSize = s * 0.08;
  const mouthY = s * 0.62;
  const mouthLeftX = s * 0.42;
  const mouthWidth = s * 0.16;
  const mouthHeight = s * 0.06;

  // Eye renderer — varies by expression
  const renderEye = (x) => {
    if (expression === 'cool') {
      // Half-closed eyes, slight upward tilt
      return (
        <div style={{
          position: 'absolute',
          top: eyeY + s * 0.015,
          left: x,
          width: eyeSize * 1.4,
          height: eyeSize * 0.5,
          background: '#1f1a17',
          borderRadius: '50%',
          transform: 'rotate(-8deg)',
        }} />
      );
    }
    if (expression === 'curious') {
      // One eyebrow-hint-over dot eyes — bigger
      return (
        <div style={{
          position: 'absolute',
          top: eyeY,
          left: x,
          width: eyeSize * 1.2,
          height: eyeSize * 1.2,
          background: '#1f1a17',
          borderRadius: '50%',
        }} />
      );
    }
    if (expression === 'shy') {
      // Small eyes, slightly shifted down
      return (
        <div style={{
          position: 'absolute',
          top: eyeY + s * 0.02,
          left: x,
          width: eyeSize * 0.8,
          height: eyeSize * 0.8,
          background: '#1f1a17',
          borderRadius: '50%',
        }} />
      );
    }
    // happy — default, round dots
    return (
      <div style={{
        position: 'absolute',
        top: eyeY,
        left: x,
        width: eyeSize,
        height: eyeSize,
        background: '#1f1a17',
        borderRadius: '50%',
      }} />
    );
  };

  const renderMouth = () => {
    if (expression === 'happy') {
      // Upward arc
      return (
        <div style={{
          position: 'absolute',
          top: mouthY,
          left: mouthLeftX,
          width: mouthWidth,
          height: mouthHeight,
          borderBottom: `${s * 0.025}px solid #8b3a1a`,
          borderRadius: '0 0 50% 50% / 0 0 100% 100%',
        }} />
      );
    }
    if (expression === 'cool') {
      // Straight half-smirk
      return (
        <div style={{
          position: 'absolute',
          top: mouthY + s * 0.01,
          left: mouthLeftX + s * 0.02,
          width: mouthWidth * 0.7,
          height: s * 0.015,
          background: '#8b3a1a',
          borderRadius: 2,
          transform: 'rotate(-4deg)',
        }} />
      );
    }
    if (expression === 'curious') {
      // Small open O
      return (
        <div style={{
          position: 'absolute',
          top: mouthY,
          left: mouthLeftX + s * 0.04,
          width: s * 0.08,
          height: s * 0.06,
          background: '#8b3a1a',
          borderRadius: '50%',
        }} />
      );
    }
    // shy — tiny gentle smile
    return (
      <div style={{
        position: 'absolute',
        top: mouthY + s * 0.015,
        left: mouthLeftX + s * 0.04,
        width: s * 0.08,
        height: s * 0.02,
        borderBottom: `${s * 0.02}px solid #8b3a1a`,
        borderRadius: '0 0 50% 50% / 0 0 100% 100%',
      }} />
    );
  };

  return (
    <>
      {renderEye(eyeLeftX)}
      {renderEye(eyeRightX)}
      {renderMouth()}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function cheekStyle(s, color, side) {
  return {
    position: 'absolute',
    top: s * 0.58,
    [side]: s * 0.16,
    width: s * 0.11,
    height: s * 0.07,
    background: color,
    borderRadius: '50%',
    opacity: 0.7,
    filter: 'blur(1px)',
  };
}

// Tiny shade util — darken a hex by percent (used for head depth).
function shade(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * (percent / 100))));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * (percent / 100))));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(255 * (percent / 100))));
  return `rgb(${r}, ${g}, ${b})`;
}
