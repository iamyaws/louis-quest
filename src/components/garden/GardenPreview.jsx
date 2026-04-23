import React from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import GardenScene from './GardenScene';

/**
 * GardenPreview — Hub-sized card surface that replaces CampfireScene.
 *
 * Painted scene with hills, trees, fire, variant-aware chibi Ronki, and
 * a single always-visible "Garten erkunden" pill positioned cleanly
 * below the Hub's topbar. The whole card is one tap target.
 *
 * Iteration history (Marc feedback threads 23–24 Apr 2026):
 *   · v1 had three overlay elements (title corner pill, Öffnen corner
 *     pill, center banner) — too busy.
 *   · v2 switched to CSS :hover only — invisible on touch devices + on
 *     Marc's browser; missed the tap affordance entirely.
 *   · v3 (here) — ONE permanent pill, positioned at top 30% so it lands
 *     in the sky area cleanly below the topbar and above the hills,
 *     doesn't compete with trees/fire/Ronki.
 */

// Demo plants for day-1 users. Y-values spread across 6–24% from
// bottom so the garden has depth (sapling in front, mature tree
// deeper, pine middle). Copied spacing from the Claude Design v1
// mockup's preview scene after Marc flagged "arrangement was better
// in Claude Design attempt" (24 Apr 2026).
function makeDemoPlants() {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };
  return [
    // Mature oak (deep back-right, anchors the horizon)
    { id: 'demo-mature-oak',   species: 'oak',    plantedAt: daysAgo(180), position: { x: 88, y: 16 } },
    // Mid pine — moved from x=50 (too close to fire at x=55) → x=68 so
    // it sits between the fire and the right-edge oak without clashing.
    // Marc flag 24 Apr 2026: "tree too close to the campfire".
    { id: 'demo-mid-pine',     species: 'pine',   plantedAt: daysAgo(95),  position: { x: 68, y: 20 } },
    // Mid apple (left, forward)
    { id: 'demo-mid-apple',    species: 'apple',  plantedAt: daysAgo(60),  position: { x: 10, y: 12 } },
    // Young birch (right-middle, mid depth) — nudged right a touch to
    // make room for the pine
    { id: 'demo-young-birch',  species: 'birch',  plantedAt: daysAgo(20),  position: { x: 78, y: 8 } },
    // Fresh sapling (front-left, closest to the viewer)
    { id: 'demo-sprout',       species: 'linden', plantedAt: daysAgo(3),   position: { x: 20, y: 4 } },
  ];
}

export default function GardenPreview({ plants = [], decor = [], onOpen, lang = 'de', height = 210, inset = true }) {
  const { state } = useTask();
  const variant = state?.companionVariant || 'amber';
  const stageIdx = Math.min(3, getCatStage(state?.catEvo ?? 0));
  const mood = state?.ronkiMood || 'normal';

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
        ronkiPosition={{ left: '32%', bottom: '12%', size: 124 }}
        ronkiVariant={variant}
        ronkiStage={stageIdx}
        ronkiMood={mood}
        showFire
        // Fire raised from bottom 12% → 22% so the Hub's nameplate pill
        // (VEILCHEN-RONKI etc.) at y≈228 lands cleanly below the flame
        // instead of covering it. Marc flag 24 Apr 2026.
        firePosition={{ left: '55%', bottom: '22%', scale: 1.15 }}
        showSun
      />

      {/* Corner "Garten" pill — bottom-right, dark primary bg. Matches
          the "Öffnen" style from Claude Design but renamed to "Garten"
          per Marc 24 Apr 2026: "let's go back to the öffnen but rename
          to the arrow + Garten". Less scene-intrusive than the earlier
          center pill. pointer-events: none so card stays one tap target. */}
      <span
        className="absolute inline-flex items-center gap-1.5 pointer-events-none"
        style={{
          right: 12, bottom: 12, zIndex: 5,
          padding: '8px 14px 8px 10px',
          borderRadius: 999,
          background: 'rgba(18,67,70,.82)',
          backdropFilter: 'blur(10px)',
          color: '#fef3c7',
          font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          border: '1px solid rgba(254,243,199,.22)',
          boxShadow: '0 6px 14px -4px rgba(0,0,0,.4)',
          whiteSpace: 'nowrap',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_outward</span>
        {lang === 'de' ? 'Garten' : 'Garden'}
      </span>
    </button>
  );
}
