import React, { useState } from 'react';

const SKIN_TONES = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524'];
const HAIR_STYLES = [
  { icon: 'face_3', label: 'Kurz' },
  { icon: 'face_6', label: 'Lockig' },
  { icon: 'face_4', label: 'Glatt' },
  { icon: 'face_2', label: 'Lang' },
];
const HAIR_COLORS = ['#2C2C2C', '#4B3023', '#B16A46', '#E6BE8A', '#D4AF37'];
const OUTFITS = [
  { icon: 'checkroom', label: 'Klassisch' },
  { icon: 'apparel', label: 'Sportlich' },
  { icon: 'styler', label: 'Schick' },
];

const SELECTION_RING = '0 0 0 4px white, 0 0 0 8px #6d28d9';
const hideScrollbar = { scrollbarWidth: 'none', msOverflowStyle: 'none' };

export default function HeroCreator({ onComplete }) {
  const [skin, setSkin] = useState(0);
  const [hair, setHair] = useState(0);
  const [hairColor, setHairColor] = useState(1);
  const [outfit, setOutfit] = useState(1);

  return (
    <div className="fixed inset-0 flex flex-col bg-surface overflow-hidden">

      {/* ── Fixed header ── */}
      <header className="flex-none flex items-center justify-center h-16 bg-surface/60 backdrop-blur-md z-50">
        <h1 className="font-headline text-2xl font-bold text-primary">
          Wähle deinen Helden
        </h1>
      </header>

      {/* ── Scrollable content ── */}
      <main
        className="flex-1 overflow-y-auto"
        style={hideScrollbar}
      >
        <div className="flex flex-col items-center px-6 pb-36 pt-4">

          {/* ── Hero live preview ── */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-64 h-64 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <div
                className="w-48 h-48 rounded-full flex items-center justify-center"
                style={{ backgroundColor: SKIN_TONES[skin] }}
              >
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '6rem' }}>
                  {HAIR_STYLES[hair].icon}
                </span>
              </div>
            </div>
            <span className="text-sm text-on-surface-variant/60 mt-2 font-label">
              Vorschau
            </span>
          </div>

          {/* ── Hautton ── */}
          <Section title="Hautton">
            <ScrollRow>
              {SKIN_TONES.map((color, i) => (
                <button
                  key={color}
                  onClick={() => setSkin(i)}
                  className="flex-none w-16 h-16 rounded-full active:scale-90 transition-transform"
                  style={{
                    backgroundColor: color,
                    border: i === skin ? 'none' : '4px solid white',
                    boxShadow: i === skin ? SELECTION_RING : '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  aria-label={`Hautton ${i + 1}`}
                />
              ))}
            </ScrollRow>
          </Section>

          {/* ── Frisur ── */}
          <Section title="Frisur">
            <ScrollRow>
              {HAIR_STYLES.map((h, i) => (
                <button
                  key={h.icon}
                  onClick={() => setHair(i)}
                  className="flex-none w-20 h-20 rounded-xl flex flex-col items-center justify-center active:scale-90 transition-transform"
                  style={{
                    backgroundColor: i === hair ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                    boxShadow: i === hair ? SELECTION_RING : '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '2rem',
                      color: i === hair ? '#6d28d9' : 'rgba(30,27,23,0.7)',
                    }}
                  >
                    {h.icon}
                  </span>
                  <span
                    className="text-xs font-label mt-1"
                    style={{ color: i === hair ? '#6d28d9' : 'rgba(30,27,23,0.5)' }}
                  >
                    {h.label}
                  </span>
                </button>
              ))}
            </ScrollRow>
          </Section>

          {/* ── Haarfarbe ── */}
          <Section title="Haarfarbe">
            <ScrollRow>
              {HAIR_COLORS.map((color, i) => (
                <button
                  key={color}
                  onClick={() => setHairColor(i)}
                  className="flex-none w-14 h-14 rounded-full active:scale-90 transition-transform"
                  style={{
                    backgroundColor: color,
                    border: i === hairColor ? 'none' : '4px solid white',
                    boxShadow: i === hairColor ? SELECTION_RING : '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  aria-label={`Haarfarbe ${i + 1}`}
                />
              ))}
            </ScrollRow>
          </Section>

          {/* ── Outfit ── */}
          <Section title="Outfit">
            <ScrollRow>
              {OUTFITS.map((o, i) => (
                <button
                  key={o.icon}
                  onClick={() => setOutfit(i)}
                  className="flex-none w-20 h-20 rounded-xl flex flex-col items-center justify-center active:scale-90 transition-transform"
                  style={{
                    backgroundColor: i === outfit ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                    boxShadow: i === outfit ? SELECTION_RING : '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '2rem',
                      color: i === outfit ? '#6d28d9' : 'rgba(30,27,23,0.7)',
                    }}
                  >
                    {o.icon}
                  </span>
                  <span
                    className="text-xs font-label mt-1"
                    style={{ color: i === outfit ? '#6d28d9' : 'rgba(30,27,23,0.5)' }}
                  >
                    {o.label}
                  </span>
                </button>
              ))}
            </ScrollRow>
          </Section>

          {/* ── Reassurance ── */}
          <p className="italic text-sm text-on-surface-variant/50 text-center px-8 mt-6">
            Keine Sorge, du kannst das Aussehen deines Helden später jederzeit anpassen.
          </p>
        </div>
      </main>

      {/* ── Fixed footer ── */}
      <footer className="flex-none bg-gradient-to-t from-surface to-transparent p-6 flex justify-center z-50">
        <button
          onClick={() => onComplete({ skin, hair, hairColor, outfit })}
          className="w-full max-w-sm bg-primary text-white font-bold text-xl py-5 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-90 transition-transform font-headline"
        >
          Weiter
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>
            arrow_forward
          </span>
        </button>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ title, children }) {
  return (
    <div className="w-full mb-6">
      <h3 className="font-headline text-lg font-semibold text-on-surface mb-2 px-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ScrollRow({ children }) {
  return (
    <div
      className="flex gap-4 overflow-x-auto py-2 px-2"
      style={hideScrollbar}
    >
      {children}
    </div>
  );
}
