import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { getCatStage } from '../../utils/helpers';
import GardenScene from './GardenScene';
import PlantSeedSheet from './PlantSeedSheet';
import DecorPlacement from './DecorPlacement';
import { makeDemoPlants, makeDemoDecor, DEMO_HINT_SPOTS, AMBIENT_ORBS, DEMO_BENCH_POSITION } from './demoGarden';

/**
 * GardenMode — full-screen garden view (Frame 2 of the v1 mockup).
 *
 * Mounts as a fullscreen overlay when the Hub's GardenPreview is tapped.
 * Renders the garden at full bleed, with a discreet "Zurück" pill
 * top-left and "Dein Garten" badge top-right for context.
 *
 * From here the kid can:
 *   · Plant a seed (mode='plant') — opens PlantSeedSheet if it's the
 *     weekly ritual day OR via Ronki's invitation; tap the ground to
 *     pick a spot, confirm species, plant.
 *   · Place decor (mode='decor') — opens DecorPlacement rail + strip.
 *   · Just look / idle (default) — read-only, Ronki in scene, hint
 *     rings showing interactive spots.
 *
 * Props:
 *   · onClose (fn) — called when the "Zurück" pill is tapped
 *
 * Pulls data directly from TaskContext so Hub doesn't need to pipe
 * state through. Action callbacks (plantSeed/placeDecor) come from
 * the same context.
 */
export default function GardenMode({ onClose }) {
  const { state, actions } = useTask();
  const { t, lang } = useTranslation();
  const [mode, setMode] = useState('idle');  // 'idle' | 'plant' | 'decor'

  // A pending-placement position captured when the kid taps an empty
  // ground patch. The sheet/rail then confirms species/type, and we
  // call plantSeed(...)/placeDecor(...) at the captured position.
  const [pendingPosition, setPendingPosition] = useState(null);

  const realPlants = state?.garden?.plants || [];
  const realDecor = state?.garden?.decor || [];
  const ownedDecor = state?.garden?.ownedDecor || [];

  // Variant-aware chibi props — Ronki renders with the kid's picked
  // colorway (forest=green, violet=lavender, rose=pink, etc.).
  // No Math.min cap on stage — MoodChibi supports stages 4 (teen) + 5
  // (legend) with extra aura/wing treatments. Code-review flag 24 Apr 2026:
  // prior Math.min(3, ...) cap was blocking evolved kids from seeing their
  // fully-grown Ronki.
  const variant = state?.companionVariant || 'amber';
  const stageIdx = getCatStage(state?.catEvo ?? 0);
  const mood = state?.ronkiMood || 'normal';

  // Empty state fallback — when the kid hasn't planted or decorated
  // anything yet, show pre-arranged demo content so the scene reads
  // as alive (matches Claude Design v1 Frame 2). Real state takes
  // over the moment they interact.
  const plants = realPlants.length > 0 ? realPlants : makeDemoPlants();
  const decor = realDecor.length > 0 ? realDecor : makeDemoDecor();

  // Hint rings — 3 pre-defined spots marking "tap here to add something."
  // Always shown in idle mode; hidden during plant/decor flows (the
  // pendingPosition ghost takes over then).
  const hintSpots = mode === 'idle' ? DEMO_HINT_SPOTS : [];

  // Weekly ritual — Pflanzen is Sunday-only (Q6 A pick from the discovery;
  // Marc re-confirmed 24 Apr 2026). On other days the Pflanzen chip is
  // hidden so the kid learns the weekly rhythm by discovery. Dekorieren
  // is always available — it's a make-it-yours loop, not a time artefact.
  // Also hide if the kid already planted this Sunday (lastWeeklyPlanting
  // matches today's ISO).
  const today = new Date();
  const isPflanztag = today.getDay() === 0;  // 0 = Sunday
  const plantedToday = state?.garden?.lastWeeklyPlanting === today.toISOString().slice(0, 10);
  const canPlant = isPflanztag && !plantedToday;

  // Memoized handlers so DecorPlacement's placing effect doesn't re-fire
  // on every parent render (code-review flag: onPlace was a fresh
  // function each render, making the effect dep-unstable).
  const handlePlace = useCallback((type, position) => {
    const ok = actions.placeDecor(type, position);
    if (ok) setPendingPosition(null);
    return ok;
  }, [actions]);

  const handlePlantConfirm = useCallback((species) => {
    if (!pendingPosition) {
      const fallback = { x: 50 + (Math.random() * 20 - 10), y: 22 };
      actions.plantSeed(species, fallback);
    } else {
      actions.plantSeed(species, pendingPosition);
    }
    setMode('idle');
    setPendingPosition(null);
  }, [actions, pendingPosition]);

  // Scene tap handler — in plant/decor mode captures the position
  // where the kid wants to place the item. In idle mode it's inert
  // (the hint-ring pills + "Pflanzen" / "Dekorieren" chips drive flow).
  const handleSceneTap = (pos) => {
    if (mode === 'plant' || mode === 'decor') {
      // pos.y here is viewport-% from TOP (0 = top, 100 = bottom).
      // GardenScene positions use bottom-%, so we flip. Reject taps
      // in the upper 45% of the scene (sky/hills) — accept only the
      // lower 55% (ground area). That ensures plants/decor land on
      // the ground and never clip behind the Hub's top chrome.
      if (pos.y < 45) return;
      setPendingPosition({ x: pos.x, y: 100 - pos.y });  // flip → bottom%
    }
  };

  // Exits the current sub-mode back to idle; used by sheet cancel.
  const backToIdle = () => {
    setMode('idle');
    setPendingPosition(null);
  };

  return (
    <motion.div
      className="fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ background: '#000', zIndex: 9999 }}
    >
      {/* The scene fills the whole viewport */}
      <div className="absolute inset-0">
        <GardenScene
          plants={plants}
          decor={decor}
          showRonki
          // Ronki sits ON the bench (DEMO_BENCH_POSITION shared with demo
          // decor so they stay aligned). Left 30% matches bench left, and
          // bottom 7% = bench base 2% + ~5% seat-height so the chibi reads
          // as seated on it (Marc flag 24 Apr 2026: "arrangement of Ronki
          // on a tiny bench is amazing").
          ronkiPosition={{
            left: `${DEMO_BENCH_POSITION.x}%`,
            bottom: mode === 'plant' ? '32%' : '7%',
            size: 72,
          }}
          ronkiVariant={variant}
          ronkiStage={stageIdx}
          ronkiMood={mood}
          showFire
          firePosition={{ left: '58%', bottom: '8%', scale: 1.05 }}
          showSun
          hintSpots={hintSpots}
          onSceneTap={handleSceneTap}
          // In decor mode, tapping a placed item removes it (ownership
          // persists — it flows back to the strip for free re-placement).
          onDecorClick={mode === 'decor' ? actions.removeDecor : undefined}
        >
          {/* Ambient gold orbs floating in the sky — atmospheric depth
              lifted from Claude Design Frame 4. Purely decorative. */}
          {AMBIENT_ORBS.map((o, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="g-orb"
              style={{
                position: 'absolute',
                left: `${o.x}%`,
                bottom: `${o.y}%`,
                transform: `translate(-50%, 50%) scale(${o.scale})`,
                animationDelay: `${o.delay}s`,
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          ))}

          {/* Pending-position marker — dashed drop-target ellipse where
              the tap landed, matches Claude Design's .drop-target. */}
          {pendingPosition && (
            <div
              style={{
                position: 'absolute',
                left: `${pendingPosition.x}%`,
                bottom: `${pendingPosition.y}%`,
                transform: 'translate(-50%, 50%)',
                width: 50, height: 14,
                borderRadius: '50%',
                background: 'rgba(252,211,77,.18)',
                border: '2px dashed rgba(254,243,199,.85)',
                boxShadow: '0 0 18px rgba(252,211,77,.3)',
                animation: 'g-ring-pulse 1.6s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 7,
              }}
            />
          )}
        </GardenScene>
      </div>

      {/* Top chrome — Zurück pill (left) + "Dein Garten" badge (right) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10"
           style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 active:scale-95 transition-transform"
          style={{
            padding: '12px 18px 12px 14px',
            minHeight: 48,
            borderRadius: 999,
            background: 'rgba(255,248,242,.94)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(18,67,70,.12)',
            boxShadow: '0 4px 14px -4px rgba(18,67,70,.22)',
            color: '#124346',
            font: '700 12px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          {lang === 'de' ? 'Zurück' : 'Back'}
        </button>

        <div
          className="inline-flex items-center"
          style={{
            padding: '8px 14px',
            borderRadius: 999,
            background: 'rgba(18,67,70,.78)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(254,243,199,.2)',
            color: '#fef3c7',
            font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 10px -4px rgba(0,0,0,.4)',
          }}
        >
          {lang === 'de' ? 'Dein Garten' : 'Your garden'}
        </div>
      </div>

      {/* Action chips — idle mode. Pflanzen is Sunday-only (weekly
          ritual per Q6 A); hidden on other days so the kid discovers
          the rhythm. Dekorieren is always available. */}
      {mode === 'idle' && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
             style={{ bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}>
          {canPlant && (
            <button
              type="button"
              onClick={() => setMode('plant')}
              className="inline-flex items-center gap-2 active:scale-95 transition-transform"
              style={{
                padding: '12px 20px 12px 16px',
                minHeight: 48,
                borderRadius: 999,
                background: 'linear-gradient(180deg, #86efac 0%, #059669 100%)',
                color: '#053b26',
                font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 18px -6px rgba(5,150,105,.5)',
                border: '1px solid rgba(5,80,40,.2)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>grass</span>
              {lang === 'de' ? 'Pflanzen' : 'Plant'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode('decor')}
            className="inline-flex items-center gap-2 active:scale-95 transition-transform"
            style={{
              padding: '12px 20px 12px 16px',
              minHeight: 48,
              borderRadius: 999,
              background: 'linear-gradient(180deg, #fde68a 0%, #f59e0b 100%)',
              color: '#5c3a08',
              font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 18px -6px rgba(180,83,9,.4)',
              border: '1px solid rgba(120,70,10,.2)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            {lang === 'de' ? 'Dekorieren' : 'Decorate'}
          </button>
        </div>
      )}

      {/* Plant-a-seed flow — Frame 3 */}
      <AnimatePresence>
        {mode === 'plant' && (
          <PlantSeedSheet
            pendingPosition={pendingPosition}
            onCancel={backToIdle}
            onPlant={handlePlantConfirm}
            lang={lang}
          />
        )}
      </AnimatePresence>

      {/* Decor placement flow — Frame 4 */}
      <AnimatePresence>
        {mode === 'decor' && (
          <DecorPlacement
            ownedDecor={ownedDecor}
            currentSterne={state?.hp || 0}
            pendingPosition={pendingPosition}
            onCancel={backToIdle}
            onPlace={handlePlace}
            onDone={backToIdle}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
