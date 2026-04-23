import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import GardenScene from './GardenScene';
import PlantSeedSheet from './PlantSeedSheet';
import DecorPlacement from './DecorPlacement';

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

  const plants = state?.garden?.plants || [];
  const decor = state?.garden?.decor || [];
  const ownedDecor = state?.garden?.ownedDecor || [];

  // Hint rings (shown in idle mode, hidden during plant/decor flows).
  // In v1 we hint at two spots: an empty ground patch for planting
  // if it's the weekly ritual day, and Ronki himself if a witness
  // beat is pending (Phase 2 wires the second; v1 shows the first
  // only when the last weekly planting was more than 6 days ago).
  const hintSpots = useMemo(() => {
    if (mode !== 'idle') return [];
    const hints = [];
    const last = state?.garden?.lastWeeklyPlanting;
    const daysSincePlant = last
      ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000)
      : 999;
    if (daysSincePlant >= 6 || plants.length === 0) {
      hints.push({ x: 50, y: 22 });  // center ground — "plant something here"
    }
    return hints;
  }, [mode, state?.garden?.lastWeeklyPlanting, plants.length]);

  // Scene tap handler — in plant/decor mode captures the position
  // where the kid wants to place the item. In idle mode it's inert
  // (the hint-ring pills + "Pflanzen" / "Dekorieren" chips drive flow).
  const handleSceneTap = (pos) => {
    if (mode === 'plant' || mode === 'decor') {
      // Only accept taps in the lower 60% (the ground area)
      if (pos.y > 40) return;
      setPendingPosition({ x: pos.x, y: 100 - pos.y });  // flip y → bottom%
    }
  };

  // Exits the current sub-mode back to idle; used by sheet cancel.
  const backToIdle = () => {
    setMode('idle');
    setPendingPosition(null);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ background: '#000' }}
    >
      {/* The scene fills the whole viewport */}
      <div className="absolute inset-0">
        <GardenScene
          plants={plants}
          decor={decor}
          showRonki
          ronkiPosition={{
            left: '32%',
            bottom: mode === 'plant' ? '30%' : '8%',
            size: 58,
            mirror: false,
          }}
          showFire
          showSun
          hintSpots={hintSpots}
          onSceneTap={handleSceneTap}
        >
          {/* Pending-position marker (ghost circle where the tap landed) */}
          {pendingPosition && (
            <div
              style={{
                position: 'absolute',
                left: `${pendingPosition.x}%`,
                bottom: `${pendingPosition.y}%`,
                transform: 'translate(-50%, 50%)',
                width: 34, height: 34,
                borderRadius: '50%',
                border: '2px dashed rgba(254,243,199,.9)',
                background: 'rgba(252,211,77,.25)',
                boxShadow: '0 0 14px rgba(252,211,77,.6)',
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
            padding: '8px 14px 8px 10px',
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
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
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

      {/* Action chips — idle mode shows "Pflanzen" and "Dekorieren" */}
      {mode === 'idle' && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
             style={{ bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}>
          <button
            type="button"
            onClick={() => setMode('plant')}
            className="inline-flex items-center gap-2 active:scale-95 transition-transform"
            style={{
              padding: '10px 18px 10px 14px',
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
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>grass</span>
            {lang === 'de' ? 'Pflanzen' : 'Plant'}
          </button>
          <button
            type="button"
            onClick={() => setMode('decor')}
            className="inline-flex items-center gap-2 active:scale-95 transition-transform"
            style={{
              padding: '10px 18px 10px 14px',
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
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
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
            onPlant={(species) => {
              if (!pendingPosition) {
                // If the kid hasn't tapped a spot yet, default to a
                // center ground patch so the sheet's "Hier pflanzen"
                // button always works.
                const fallback = { x: 50 + (Math.random() * 20 - 10), y: 22 };
                actions.plantSeed(species, fallback);
              } else {
                actions.plantSeed(species, pendingPosition);
              }
              backToIdle();
            }}
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
            onPlace={(type, position) => {
              const ok = actions.placeDecor(type, position);
              if (ok) setPendingPosition(null);
              return ok;
            }}
            onDone={backToIdle}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
