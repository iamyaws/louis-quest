import React from 'react';
import GardenScene from './GardenScene';

/**
 * GardenPreview — Hub-sized card surface that replaces CampfireScene.
 *
 * Shows a contained ~210px tall painted scene with hills, trees, fire,
 * and chibi Ronki. Tappable — taps bubble up via `onOpen` so the parent
 * (Hub) can transition into full-screen Garden mode.
 *
 * Intentionally minimal — this is backdrop for the Hub's daily cards.
 * The kid sees it on every open; it's atmosphere, not a task surface.
 *
 * Props:
 *   · plants    (array)  — state.garden.plants
 *   · decor     (array)  — state.garden.decor
 *   · onOpen    (fn)     — callback when the preview is tapped
 *   · lang      (string) — 'de' | 'en' for the title/tap-hint copy
 */
export default function GardenPreview({ plants = [], decor = [], onOpen, lang = 'de', height = 210, inset = true }) {
  const empty = plants.length === 0 && decor.length === 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={lang === 'de' ? 'Garten öffnen' : 'Open garden'}
      className="relative w-full block active:scale-[0.99] transition-transform"
      style={{
        height,
        borderRadius: inset ? 18 : 0,
        overflow: 'hidden',
        margin: inset ? '0 10px' : 0,
        width: inset ? 'calc(100% - 20px)' : '100%',
        boxShadow: inset
          ? '0 10px 24px -12px rgba(18,67,70,.35), inset 0 0 0 1px rgba(255,255,255,.12)'
          : 'none',
        border: 'none',
        background: 'none',
        padding: 0,
      }}
    >
      <GardenScene
        plants={plants}
        decor={decor}
        showRonki
        ronkiPosition={{ left: '28%', bottom: '10%', size: 36, mirror: true }}
        showFire
        showSun
      />

      {/* Title pill — "Dein Garten" with a pulsing green dot */}
      <div
        className="absolute inline-flex items-center gap-1.5"
        style={{
          left: 12, top: 10, zIndex: 4,
          font: '700 9px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.22em',
          textTransform: 'uppercase',
          color: '#fef3c7',
          textShadow: '0 1px 3px rgba(0,0,0,.35)',
        }}
      >
        <span
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#86efac',
            boxShadow: '0 0 8px rgba(134,239,172,.9)',
            animation: 'gp-pulse 2s ease-in-out infinite',
          }}
        />
        {lang === 'de' ? 'Dein Garten' : 'Your garden'}
      </div>

      {/* Expand pill — bottom-right */}
      <span
        className="absolute inline-flex items-center gap-1.5"
        style={{
          right: 10, bottom: 10, zIndex: 4,
          padding: '6px 11px 6px 9px',
          borderRadius: 999,
          background: 'rgba(18,67,70,.78)',
          backdropFilter: 'blur(10px)',
          color: '#fef3c7',
          font: '700 9px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          border: '1px solid rgba(254,243,199,.2)',
          boxShadow: '0 4px 10px -4px rgba(0,0,0,.4)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_outward</span>
        {lang === 'de' ? 'Öffnen' : 'Open'}
      </span>

      {/* First-planting nudge when garden is empty — subtle, one line */}
      {empty && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: 'rgba(255,248,242,.92)',
            color: '#124346',
            font: '600 10px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            border: '1px solid rgba(18,67,70,.15)',
            boxShadow: '0 6px 14px -4px rgba(0,0,0,.25)',
            zIndex: 5,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {lang === 'de' ? 'Tipp · hier wächst dein Garten' : 'Tap · your garden grows here'}
        </div>
      )}

      <style>{`
        @keyframes gp-pulse { 0%,100% { opacity: .6; } 50% { opacity: 1; } }
      `}</style>
    </button>
  );
}
