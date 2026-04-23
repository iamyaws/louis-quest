import React from 'react';
import GardenScene from './GardenScene';

/**
 * GardenPreview — Hub-sized card surface that replaces CampfireScene.
 *
 * Shows a painted scene with hills, trees, fire, and chibi Ronki. Taps
 * anywhere bubble up via `onOpen` so the parent (Hub) transitions into
 * full-screen Garden mode.
 *
 * Intentionally minimal — this is backdrop for the Hub's daily cards.
 * The kid sees it on every open; it's atmosphere, not a task surface.
 *
 * Props:
 *   · plants    (array)  — state.garden.plants
 *   · decor     (array)  — state.garden.decor
 *   · onOpen    (fn)     — callback when the preview is tapped
 *   · lang      (string) — 'de' | 'en' for the title/tap-hint copy
 *   · height    (number) — scene height in px (default 210; Hub uses 340)
 *   · inset     (bool)   — card mode (rounded + margin) vs edge-to-edge
 */

// Demo plants shown when the kid hasn't planted anything yet. Gives
// day-1 users a populated garden so the preview never looks empty. All
// positioned at low bottom% (0–18%) so they sit on the ground line and
// can't peek behind the Hub's top chrome (Marc's 23 Apr 2026 bug:
// mature-tree canopy overlapping the Marc pill). These are visual-only —
// real state.garden.plants takes precedence as soon as the kid plants.
const DEMO_PLANTS = [
  { id: 'demo-mature-r', species: 'oak',    plantedAt: '2025-10-01', position: { x: 82, y: 4 } },
  { id: 'demo-mid-l',    species: 'apple',  plantedAt: '2025-12-01', position: { x: 12, y: 10 } },
  { id: 'demo-pine-c',   species: 'pine',   plantedAt: '2026-01-15', position: { x: 42, y: 18 } },
  { id: 'demo-young-r',  species: 'birch',  plantedAt: '2026-02-20', position: { x: 72, y: 8 } },
];

export default function GardenPreview({ plants = [], decor = [], onOpen, lang = 'de', height = 210, inset = true }) {
  // If the kid has nothing planted yet, show demo plants so the scene
  // reads as alive. Real plants take over the moment they plant.
  const plantsToRender = plants.length > 0 ? plants : DEMO_PLANTS;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={lang === 'de' ? 'Garten erkunden' : 'Explore garden'}
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
        cursor: 'pointer',
      }}
    >
      <GardenScene
        plants={plantsToRender}
        decor={decor}
        showRonki
        // Ronki sits mid-scene (higher than ground) — matches the old
        // CampfireScene placement Marc wants preserved. Size bumped from
        // 36 → 62 so he reads as a companion, not a speck.
        ronkiPosition={{ left: '30%', bottom: '30%', size: 62, mirror: true }}
        showFire
        showSun
      />

      {/* Single permanent CTA pill — centered, always visible (not hover-
          gated). Replaces the older two-pill setup ("Dein Garten" corner
          title + "Öffnen" pill + empty-state banner). Marc's 23 Apr 2026
          feedback: "show 'Garten erkunden' always, remove 'Öffnen',
          remove the 'hier wächst dein Garten' banner." */}
      <span
        className="absolute left-1/2 inline-flex items-center gap-2 pointer-events-none"
        style={{
          top: '18%',
          transform: 'translateX(-50%)',
          padding: '9px 18px 9px 14px',
          borderRadius: 999,
          background: 'rgba(255,248,242,.92)',
          backdropFilter: 'blur(10px)',
          color: '#124346',
          font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          border: '1px solid rgba(18,67,70,.15)',
          boxShadow: '0 6px 14px -4px rgba(0,0,0,.22)',
          zIndex: 5,
          whiteSpace: 'nowrap',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#b45309' }}>arrow_outward</span>
        {lang === 'de' ? 'Garten erkunden' : 'Explore garden'}
      </span>
    </button>
  );
}
