import React from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import GardenScene from './GardenScene';

/**
 * GardenPreview — Hub-sized card surface that replaces CampfireScene.
 *
 * Scene with hills, trees, fire, and variant-aware chibi Ronki. Taps
 * anywhere bubble up via `onOpen`. On mouse hover a "Garten erkunden"
 * pill fades in (pure CSS :hover) — it's invisible by default so the
 * Hub's topbar area stays clean, and the tap target is always the
 * whole card (no need to aim at the pill).
 *
 * Marc feedback 24 Apr 2026:
 *   · No permanent text overlay (removed "Dein Garten" title, "Öffnen"
 *     corner pill, and the center "Tipp · hier wächst dein Garten"
 *     banner — they crowded the scene and peeked behind the topbar).
 *   · Ronki 2× size (62 → 124) so he reads as a companion, not a speck.
 *   · Fire + Ronki raised so the nameplate pill below doesn't cover them.
 *   · One sapling in the demo plants so not every tree is full-grown.
 *   · Variant-aware — routes state.companionVariant through to the chibi.
 *
 * Props:
 *   · plants    (array)  — state.garden.plants
 *   · decor     (array)  — state.garden.decor
 *   · onOpen    (fn)     — callback when the preview is tapped
 *   · lang      (string) — 'de' | 'en'
 *   · height    (number) — scene height in px (Hub uses 340)
 *   · inset     (bool)   — card mode (rounded + margin) vs edge-to-edge
 */

// Demo plants for day-1 users so the preview reads as alive. Includes
// a recent sapling (plantedAt = this week) and a mix of older stages
// so the garden doesn't look like a fully-mature orchard. Real state
// plants take over as soon as the kid plants.
function makeDemoPlants() {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };
  return [
    // Mature oak (planted ~6 months ago)
    { id: 'demo-mature-oak',  species: 'oak',    plantedAt: daysAgo(180), position: { x: 82, y: 4 } },
    // Mid-stage apple tree (planted ~2 months ago)
    { id: 'demo-mid-apple',   species: 'apple',  plantedAt: daysAgo(60),  position: { x: 12, y: 10 } },
    // Mid-stage pine (planted ~3 months ago)
    { id: 'demo-mid-pine',    species: 'pine',   plantedAt: daysAgo(95),  position: { x: 48, y: 12 } },
    // Young birch (planted ~2 weeks ago)
    { id: 'demo-young-birch', species: 'birch',  plantedAt: daysAgo(14),  position: { x: 72, y: 8 } },
    // Fresh sapling (planted this week) — gives the kid an anchor to
    // remember "the small one is recent" even before they plant anything
    { id: 'demo-sprout',      species: 'linden', plantedAt: daysAgo(3),   position: { x: 22, y: 5 } },
  ];
}

export default function GardenPreview({ plants = [], decor = [], onOpen, lang = 'de', height = 210, inset = true }) {
  const { state } = useTask();
  const variant = state?.companionVariant || 'amber';
  const stageIdx = Math.min(3, getCatStage(state?.catEvo ?? 0));
  const mood = state?.ronkiMood || 'normal';

  // If the kid has nothing planted yet, show demo plants so the scene
  // reads as alive. Real plants take over the moment they plant.
  const plantsToRender = plants.length > 0 ? plants : makeDemoPlants();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={lang === 'de' ? 'Garten erkunden' : 'Explore garden'}
      className="g-preview relative w-full block active:scale-[0.99] transition-transform"
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
        // Ronki stands ON the ground next to the fire. bottom 12% puts
        // his feet on the ground surface (ground tops out around bottom
        // 42%) and his 124px body reaches to ~48% from bottom — which
        // is above the Hub's nameplate pill at y=228 but NOT floating
        // in the sky. Earlier value bottom 40% put him in the sky next
        // to the moon (Marc flag 24 Apr 2026).
        ronkiPosition={{ left: '32%', bottom: '12%', size: 124 }}
        ronkiVariant={variant}
        ronkiStage={stageIdx}
        ronkiMood={mood}
        showFire
        showSun
      />

      {/* Hover-only CTA — fades in on mouse hover (desktop). On touch
          the whole card is tappable so no persistent label needed.
          Matches Claude Design v1 mockup's behavior. */}
      <span
        className="g-preview-cta absolute left-1/2 inline-flex items-center gap-2 pointer-events-none"
        style={{
          top: '46%',
          transform: 'translate(-50%, -50%)',
          padding: '9px 18px 9px 14px',
          borderRadius: 999,
          background: 'rgba(255,248,242,.94)',
          backdropFilter: 'blur(10px)',
          color: '#124346',
          font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          border: '1px solid rgba(18,67,70,.15)',
          boxShadow: '0 6px 14px -4px rgba(0,0,0,.22)',
          zIndex: 5,
          whiteSpace: 'nowrap',
          opacity: 0,
          transition: 'opacity .2s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#b45309' }}>arrow_outward</span>
        {lang === 'de' ? 'Garten erkunden' : 'Explore garden'}
      </span>

      <style>{`
        .g-preview:hover .g-preview-cta { opacity: 1; }
      `}</style>
    </button>
  );
}
