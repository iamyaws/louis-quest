import React from 'react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { getCatStage } from '../../utils/helpers';
import GardenScene from './GardenScene';
import { makeDemoPlants } from './demoGarden';

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

// makeDemoPlants is imported from ./demoGarden (single source of truth
// shared with GardenMode). Prior inline copy drifted from the canonical
// set; code-review I4 / P3 cleanup 24 Apr 2026.

export default function GardenPreview({ plants = [], decor = [], onOpen, height = 210, inset = true }) {
  const { state } = useTask();
  const { t } = useTranslation();
  const variant = state?.companionVariant || 'amber';
  // No stage cap — MoodChibi supports 0–5 natively (code-review I5).
  const stageIdx = getCatStage(state?.catEvo ?? 0);
  const mood = state?.ronkiMood || 'normal';

  // Demo atmosphere fills in until the kid has 5+ real plants. Real
  // and demo render as SEPARATE prop lists so the scene doesn't have
  // to id-prefix-filter downstream (demo isolation refactor 24 Apr 2026).
  const demoPlants = plants.length >= 5 ? [] : makeDemoPlants();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('garden.openCta')}
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
        plants={plants}
        demoPlants={demoPlants}
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
        {t('garden.openPillShort')}
      </span>
    </button>
  );
}
