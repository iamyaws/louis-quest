import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SPECIES } from '../../data/gardenConstants';

/**
 * PlantSeedSheet — bottom sheet for picking a species to plant.
 * (Frame 3 of the v1 mockup.)
 *
 * Shows six painted species cards in a 3×2 grid with speed-class
 * label ("mittel" / "langsam"). Ronki bubble above: "Was pflanzt
 * du diese Woche?" — kid picks + taps "Hier pflanzen" → onPlant(species).
 *
 * Accepts an optional `pendingPosition` — if set, the kid already
 * tapped a ground patch and we'll plant there. If null, the sheet
 * still works (parent supplies a fallback position).
 *
 * Props:
 *   · pendingPosition ({x,y} | null)
 *   · onPlant (species) => void
 *   · onCancel () => void
 *   · lang (string)
 */
export default function PlantSeedSheet({ pendingPosition, onPlant, onCancel, lang = 'de' }) {
  const [selected, setSelected] = useState(SPECIES[1].id);  // default to apple (mittel)

  return (
    <>
      {/* Scrim — covers only the area ABOVE the sheet so the kid can
          still tap the ground in the visible lower portion to set a
          pendingPosition. pointer-events: auto on the scrim itself
          so tap-outside-sheet still dismisses. Code-review C2 flag
          24 Apr 2026: previous inset-0 scrim ate every scene tap. */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          height: '40%',  // upper 40% — sheet occupies the lower 60%
          background: 'linear-gradient(180deg, rgba(26,18,10,.45) 0%, rgba(26,18,10,.25) 60%, rgba(26,18,10,0) 100%)',
        }}
        onClick={onCancel}
      />

      {/* Ronki-bubble prompt above the sheet */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          bottom: 'calc(50% + 40px)',
          padding: '8px 14px',
          borderRadius: 14,
          background: 'rgba(255,248,242,.96)',
          border: '1px solid rgba(18,67,70,.15)',
          boxShadow: '0 4px 12px -4px rgba(0,0,0,.2)',
          font: '600 12px/1.3 "Nunito", sans-serif',
          color: '#124346',
          maxWidth: 220,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {lang === 'de' ? 'Was pflanzt du diese Woche?' : 'What are you planting this week?'}
      </motion.div>

      {/* Bottom sheet */}
      <motion.div
        className="absolute left-0 right-0 bottom-0 z-30"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        style={{
          background: '#fff8f2',
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          padding: '10px 18px calc(22px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -20px 40px -10px rgba(0,0,0,.35)',
        }}
      >
        {/* Grip */}
        <div style={{ width: 42, height: 4, borderRadius: 999, background: 'rgba(18,67,70,.22)', margin: '4px auto 14px' }} />

        {/* Header */}
        <div style={{ padding: '0 2px 10px' }}>
          <div style={{
            font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.24em',
            textTransform: 'uppercase',
            color: '#b45309',
            marginBottom: 4,
          }}>
            {lang === 'de' ? 'Sonntag · Pflanztag' : 'Sunday · planting day'}
          </div>
          <h3 style={{ margin: 0, font: '500 19px/1.2 "Fredoka", sans-serif', color: '#124346', letterSpacing: '-0.01em' }}>
            {lang === 'de' ? 'Was kommt diese Woche in die Erde?' : 'What goes in the ground this week?'}
          </h3>
        </div>

        {/* Species grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {SPECIES.map(s => {
            const isSel = s.id === selected;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                className="flex flex-col items-center active:scale-[0.97] transition-transform"
                style={{
                  padding: '12px 8px 10px',
                  borderRadius: 14,
                  background: isSel ? 'linear-gradient(180deg, #ecfdf5 0%, rgba(134,239,172,.3) 100%)' : '#ffffff',
                  border: isSel ? '1.5px solid rgba(5,150,105,.45)' : '1.5px solid rgba(18,67,70,.08)',
                  boxShadow: isSel
                    ? '0 4px 12px -4px rgba(5,150,105,.35)'
                    : '0 2px 8px -4px rgba(18,67,70,.15)',
                  gap: 4,
                }}
              >
                <SpeciesArt species={s.id} />
                <div style={{
                  font: '700 12px/1.1 "Plus Jakarta Sans", sans-serif',
                  color: '#124346',
                  marginTop: 4,
                }}>
                  {s.labelDe}
                </div>
                <div style={{
                  font: '600 9px/1 "Plus Jakarta Sans", sans-serif',
                  color: s.speedClass === 'langsam' ? '#7c3aed' : '#b45309',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                }}>
                  {s.speedClass}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => onPlant(selected)}
          className="w-full active:scale-[0.98] transition-transform"
          style={{
            padding: '14px 20px',
            borderRadius: 999,
            background: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
            color: '#ffffff',
            font: '800 13px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            boxShadow: '0 8px 20px -6px rgba(5,150,105,.45)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>grass</span>
          {lang === 'de' ? 'Hier pflanzen' : 'Plant here'}
        </button>

        {!pendingPosition && (
          <div style={{
            textAlign: 'center',
            marginTop: 10,
            font: '500 11px/1.4 "Nunito", sans-serif',
            color: '#6b655b',
          }}>
            {/* Softened from "Tipp auf eine freie Stelle..." (imperative +
                also a typo — "Tippe" would be correct) to an invitational
                question that reads as Ronki asking, not the app instructing.
                Agent feedback 24 Apr 2026. */}
            {lang === 'de'
              ? 'Wo möchtest du dein Bäumchen pflanzen?'
              : 'Where would you like your sapling to go?'}
          </div>
        )}
      </motion.div>
    </>
  );
}

// Tiny painted icons for the species palette. Each is a stylized
// silhouette in the species-appropriate shape + color.
function SpeciesArt({ species }) {
  const palette = {
    oak:    { canopy: 'radial-gradient(ellipse at 30% 30%, #a8dd8d, #4a8044)', shape: 'round' },
    apple:  { canopy: 'radial-gradient(ellipse at 30% 30%, #b6e69c, #5b8f49)', shape: 'round' },
    birch:  { canopy: 'radial-gradient(ellipse at 30% 30%, #b5d092, #7cb060)', shape: 'round' },
    pine:   { canopy: '#4a6b3a', shape: 'cone' },
    linden: { canopy: 'radial-gradient(ellipse at 30% 30%, #9ed884, #5b8f49)', shape: 'round' },
    fir:    { canopy: '#355a32', shape: 'cone' },
  }[species] || { canopy: '#5b8f49', shape: 'round' };

  if (palette.shape === 'cone') {
    return (
      <div style={{ position: 'relative', width: 40, height: 48 }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: `32px solid ${palette.canopy}` }} />
        <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 5, height: 6, background: 'linear-gradient(180deg, #7a5030, #4c2f18)', borderRadius: 2 }} />
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', width: 40, height: 48 }}>
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 34, height: 34, borderRadius: '50%', background: palette.canopy, boxShadow: 'inset -2px -3px 5px rgba(0,0,0,.15)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 6, height: 14, background: 'linear-gradient(180deg, #8a5a35, #5c3a1f)', borderRadius: 2 }} />
    </div>
  );
}
