import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { DECOR, DECOR_CATEGORIES, DECOR_BY_ID } from '../../data/gardenConstants';
import { Pearl } from '../CurrencyIcons';

/**
 * DecorPlacement — side-rail + bottom strip + placement flow.
 * (Frame 4 of the v1 mockup.)
 *
 * Four-category side-rail (Natur / Magie / Struktur / Lebewesen) on
 * the left; horizontal decor tile strip at the bottom. Tapping a tile
 * either (a) places the item at the captured `pendingPosition` and
 * deducts Sterne if not yet owned, or (b) waits until the kid taps
 * the scene to capture a position.
 *
 * Owned items place free. Unowned items deduct their Sterne price
 * on first placement, then are added to ownedDecor so re-placing
 * later costs nothing.
 *
 * Top-right: live Sterne budget badge. Top-left: "Fertig" dismiss.
 *
 * Props:
 *   · ownedDecor (DecorType[])
 *   · currentSterne (number) — state.hp for the budget display
 *   · pendingPosition ({x,y} | null)
 *   · onPlace(type, position) => boolean — returns false if HP insufficient
 *   · onCancel () => void — from the "Fertig" pill
 *   · onDone () => void — (currently aliased to onCancel; kept for
 *                         future "after X placements → done" flow)
 *   · lang (string)
 */
export default function DecorPlacement({ ownedDecor = [], currentSterne = 0, pendingPosition, onPlace, onCancel, lang = 'de' }) {
  const [category, setCategory] = useState('natur');
  const [selectedType, setSelectedType] = useState(null);

  const tiles = useMemo(() => DECOR.filter(d => d.category === category), [category]);

  // When a type is selected AND we have a pending position, commit.
  React.useEffect(() => {
    if (selectedType && pendingPosition) {
      const ok = onPlace(selectedType, pendingPosition);
      if (ok) {
        setSelectedType(null);  // clear so next pick starts fresh
      }
    }
  }, [selectedType, pendingPosition, onPlace]);

  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Fertig pill — top-left */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 pointer-events-auto active:scale-95 transition-transform"
        style={{
          paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))',
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
          marginTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>check</span>
        {lang === 'de' ? 'Fertig' : 'Done'}
      </button>

      {/* Sterne budget — top-right */}
      <div
        className="absolute top-4 right-4 inline-flex items-center gap-1.5"
        style={{
          paddingTop: 'calc(7px + env(safe-area-inset-top, 0px))',
          padding: '7px 14px 7px 6px',
          borderRadius: 999,
          background: 'linear-gradient(180deg, #fff8e1 0%, #fde68a 100%)',
          border: '1px solid rgba(180,83,9,.3)',
          boxShadow: '0 4px 10px -4px rgba(252,211,77,.55)',
          marginTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <Pearl size={20} />
        <div style={{ lineHeight: 1 }}>
          <div style={{ font: '800 14px/1 "Plus Jakarta Sans", sans-serif', color: '#124346' }}>
            {currentSterne}
          </div>
          <div style={{ font: '600 8px/1 "Plus Jakarta Sans", sans-serif', color: '#725b00', letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 2 }}>
            Sterne
          </div>
        </div>
      </div>

      {/* "Platz finden" whisper when a type is selected but no position */}
      {selectedType && !pendingPosition && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: '40%',
            padding: '7px 14px',
            borderRadius: 999,
            background: 'rgba(18,67,70,.82)',
            backdropFilter: 'blur(8px)',
            color: '#fef3c7',
            font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            boxShadow: '0 6px 14px -4px rgba(0,0,0,.4)',
            border: '1px solid rgba(254,243,199,.25)',
          }}
        >
          ✦ {lang === 'de' ? 'Platz finden' : 'Find a spot'} ✦
        </div>
      )}

      {/* Category rail — vertical on the left */}
      <div
        className="absolute left-3 pointer-events-auto"
        style={{
          top: '42%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: 6,
          borderRadius: 16,
          background: 'rgba(26,18,10,.72)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(254,243,199,.14)',
          boxShadow: '0 10px 24px -10px rgba(0,0,0,.5)',
        }}
      >
        {DECOR_CATEGORIES.map(c => {
          const isSel = c.id === category;
          const hasContent = DECOR.some(d => d.category === c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => hasContent && setCategory(c.id)}
              disabled={!hasContent}
              className="active:scale-90 transition-all"
              style={{
                width: 40, height: 40,
                borderRadius: 12,
                background: isSel
                  ? 'linear-gradient(180deg, #fde68a 0%, #f59e0b 100%)'
                  : hasContent ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                border: isSel ? '1px solid rgba(180,83,9,.35)' : '1px solid transparent',
                color: isSel ? '#5c3a08' : hasContent ? 'rgba(254,243,199,.75)' : 'rgba(254,243,199,.3)',
                display: 'grid',
                placeItems: 'center',
                opacity: hasContent ? 1 : 0.5,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                {c.icon}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom strip — horizontally scrollable decor tiles */}
      <div
        className="absolute left-0 right-0 pointer-events-auto"
        style={{
          bottom: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '12px 14px',
            background: 'rgba(26,18,10,.72)',
            backdropFilter: 'blur(14px)',
            borderTop: '1px solid rgba(254,243,199,.1)',
          }}
        >
          {tiles.map(d => {
            const info = DECOR_BY_ID[d.id];
            const owned = ownedDecor.includes(d.id);
            const affordable = owned || currentSterne >= info.price;
            const isSel = selectedType === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => affordable && setSelectedType(d.id)}
                disabled={!affordable}
                className="active:scale-95 transition-transform shrink-0"
                style={{
                  width: 84,
                  padding: '10px 8px 8px',
                  borderRadius: 14,
                  background: isSel
                    ? 'linear-gradient(180deg, #fef9e7 0%, rgba(252,211,77,.3) 100%)'
                    : affordable ? 'rgba(255,248,242,.94)' : 'rgba(255,248,242,.45)',
                  border: isSel
                    ? '1.5px solid rgba(252,211,77,.7)'
                    : '1px solid rgba(18,67,70,.1)',
                  boxShadow: isSel
                    ? '0 6px 14px -4px rgba(252,211,77,.5)'
                    : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: affordable ? 1 : 0.55,
                }}
              >
                {/* Mini art — reuse the decor shapes at small size */}
                <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center' }}>
                  <DecorPreview type={d.id} />
                </div>
                <div style={{ font: '700 10px/1.1 "Nunito", sans-serif', color: '#124346', textAlign: 'center' }}>
                  {lang === 'de' ? info.labelDe : info.labelEn}
                </div>
                {!owned && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '3px 7px',
                      borderRadius: 999,
                      background: 'linear-gradient(180deg, #fff8e1 0%, #fde68a 100%)',
                      border: '1px solid rgba(180,83,9,.25)',
                    }}
                  >
                    <Pearl size={10} />
                    <span style={{ font: '800 10px/1 "Plus Jakarta Sans", sans-serif', color: '#b45309' }}>
                      {info.price}
                    </span>
                  </div>
                )}
                {owned && (
                  <div
                    style={{
                      font: '800 8px/1 "Plus Jakarta Sans", sans-serif',
                      color: '#059669',
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {lang === 'de' ? 'Deins' : 'Yours'}
                  </div>
                )}
              </button>
            );
          })}

          {tiles.length === 0 && (
            <div style={{
              padding: 20,
              color: 'rgba(254,243,199,.7)',
              font: '500 12px/1.4 "Nunito", sans-serif',
              textAlign: 'center',
              flex: 1,
            }}>
              {lang === 'de' ? 'Bald verfügbar ✦' : 'Coming soon ✦'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Small preview of a decor item inside a tile — uses the same CSS classes
// as in-scene rendering (garden-scene.css must be loaded for this to work;
// it's imported by GardenScene which is always mounted when this sheet is).
function DecorPreview({ type }) {
  const base = { transform: 'scale(0.75)', transformOrigin: 'center' };
  switch (type) {
    case 'stone':    return <span className="g-stone" style={base} />;
    case 'stone-sm': return <span className="g-stone sm" style={base} />;
    case 'mushroom': return <span className="g-mushroom" style={base}><span className="cap" /><span className="stem" /></span>;
    case 'lantern':  return <span className="g-lantern" style={{ ...base, height: 34 }}><span className="pole" /><span className="lamp" /></span>;
    case 'bench':    return <span className="g-bench" style={base}><span className="back" /><span className="seat" /><span className="leg l" /><span className="leg r" /></span>;
    case 'fence':    return <span className="g-fence" style={base}><span className="rail" /></span>;
    case 'crystal':  return <span className="g-crystal" style={base} />;
    case 'runestone':return <span className="g-runestone" style={base} />;
    case 'faerie-ring': return <span className="g-faerie-ring" style={base}><span className="fm fm1"><span className="cap"/><span className="stem"/></span><span className="fm fm2"><span className="cap"/><span className="stem"/></span><span className="fm fm3"><span className="cap"/><span className="stem"/></span></span>;
    case 'shrine':   return <span className="g-shrine" style={base}><span className="flame" /><span className="top" /><span className="pillar l" /><span className="pillar r" /><span className="base" /></span>;
    case 'orb':      return <span className="g-orb" style={base} />;
    case 'dreamcatcher': return <span className="g-dream" style={base}><span className="hoop"/><span className="feather l"/><span className="feather m"/><span className="feather r"/></span>;
    case 'idol':     return <span className="g-idol" style={base}><span className="body"/><span className="horn l"/><span className="horn r"/><span className="eye l"/><span className="eye r"/><span className="base"/></span>;
    case 'totem':    return <span className="g-totem" style={base}><span className="seg s1"/><span className="seg s2"/><span className="seg s3"/></span>;
    default: return null;
  }
}
