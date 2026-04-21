import React, { useState, useRef, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';

/**
 * RonkiAusmalbild — the 50-Sterne coloring-page reward delivery.
 *
 * MVP ships: two inline-SVG line-art scenes (Lagerfeuer + Fliegender
 * Ronki) + an 8-color kid-friendly palette + click-to-fill mechanic.
 * Completed pages land in state.completedColoringPages and show up as
 * polaroids on the Buch screen (follow-up).
 *
 * Each colorable region is an SVG path with fill="white" and a unique
 * id; clicking a palette color + clicking a region sets that region's
 * fill. No flood-fill algorithm needed — the SVG regions are pre-cut
 * by the artist so every tap is deterministic.
 *
 * Contract: <RonkiAusmalbild onClose={() => void} />.
 *
 * See backlog_ronki_coloring_page_reward.md. This is the MVP — later
 * passes add:
 *   · "Drucken" option (client-side SVG→PDF)
 *   · More scenes (Freunde portrait, Kristall-Höhle, etc.)
 *   · Save to Buch as polaroid (needs Buch v2)
 */

// 8-color kid-friendly palette. High saturation but not eye-searing.
const PALETTE = [
  { id: 'red',     hex: '#ef4444', label: 'Rot' },
  { id: 'orange',  hex: '#f97316', label: 'Orange' },
  { id: 'yellow',  hex: '#fcd34d', label: 'Gelb' },
  { id: 'green',   hex: '#84cc16', label: 'Grün' },
  { id: 'blue',    hex: '#38bdf8', label: 'Blau' },
  { id: 'violet',  hex: '#a78bfa', label: 'Lila' },
  { id: 'pink',    hex: '#ec4899', label: 'Pink' },
  { id: 'brown',   hex: '#92400e', label: 'Braun' },
];

const SCENES = [
  {
    id: 'lagerfeuer',
    title: 'Ronki am Lagerfeuer',
    // Simple illustration: a Ronki silhouette next to a campfire,
    // stars, moon, trees. Each region is a separate <path>.
    regions: [
      // Sky
      { id: 'sky',    d: 'M 0 0 L 400 0 L 400 180 L 0 180 Z',           defaultFill: '#fff' },
      // Moon
      { id: 'moon',   d: 'M 320 50 A 30 30 0 1 1 319.9 50',              defaultFill: '#fff' },
      // Ground
      { id: 'ground', d: 'M 0 180 L 400 180 L 400 300 L 0 300 Z',       defaultFill: '#fff' },
      // Left tree
      { id: 'tree1',  d: 'M 40 220 L 20 150 L 60 150 Z M 36 220 L 44 220 L 44 240 L 36 240 Z', defaultFill: '#fff' },
      // Right tree
      { id: 'tree2',  d: 'M 360 225 L 340 155 L 380 155 Z M 356 225 L 364 225 L 364 245 L 356 245 Z', defaultFill: '#fff' },
      // Firelog (left)
      { id: 'log1',   d: 'M 170 240 L 230 240 L 240 255 L 160 255 Z',   defaultFill: '#fff' },
      // Fire
      { id: 'fire',   d: 'M 200 180 Q 180 210 195 240 Q 200 225 205 240 Q 220 210 200 180 Z', defaultFill: '#fff' },
      // Ronki body
      { id: 'body',   d: 'M 100 230 Q 80 200 110 185 Q 140 190 145 220 L 140 260 L 100 260 Z', defaultFill: '#fff' },
      // Ronki belly
      { id: 'belly',  d: 'M 115 220 Q 115 240 130 245 L 130 255 L 115 255 Z', defaultFill: '#fff' },
      // Ronki left horn
      { id: 'hornL',  d: 'M 110 185 L 105 170 L 115 180 Z',             defaultFill: '#fff' },
      // Ronki right horn
      { id: 'hornR',  d: 'M 135 185 L 140 170 L 130 180 Z',             defaultFill: '#fff' },
      // Ronki left wing
      { id: 'wingL',  d: 'M 90 205 Q 70 200 75 225 Q 95 220 95 210 Z',  defaultFill: '#fff' },
      // Ronki right wing
      { id: 'wingR',  d: 'M 145 205 Q 165 200 160 225 Q 145 220 145 210 Z', defaultFill: '#fff' },
    ],
    stars: [
      { cx: 60, cy: 40 }, { cx: 120, cy: 25 }, { cx: 260, cy: 40 },
      { cx: 180, cy: 20 }, { cx: 220, cy: 60 },
    ],
  },
  {
    id: 'fliegender-ronki',
    title: 'Fliegender Ronki',
    regions: [
      { id: 'sky',    d: 'M 0 0 L 400 0 L 400 300 L 0 300 Z',           defaultFill: '#fff' },
      // Sun
      { id: 'sun',    d: 'M 340 60 A 32 32 0 1 1 339.9 60',              defaultFill: '#fff' },
      // Cloud 1
      { id: 'cloud1', d: 'M 40 80 Q 20 70 30 55 Q 40 45 60 55 Q 80 45 90 60 Q 95 75 80 80 Z', defaultFill: '#fff' },
      // Cloud 2
      { id: 'cloud2', d: 'M 250 120 Q 230 110 240 95 Q 250 85 270 95 Q 290 85 300 100 Q 305 115 290 120 Z', defaultFill: '#fff' },
      // Mountains
      { id: 'mountain1', d: 'M 0 300 L 80 180 L 160 300 Z',             defaultFill: '#fff' },
      { id: 'mountain2', d: 'M 140 300 L 240 170 L 340 300 Z',          defaultFill: '#fff' },
      // Ronki body (flying, wings outstretched)
      { id: 'body',   d: 'M 180 165 Q 160 140 180 125 Q 210 125 220 150 Q 220 180 200 190 Z', defaultFill: '#fff' },
      // Left wing (outstretched)
      { id: 'wingL',  d: 'M 170 150 Q 120 130 110 160 Q 130 175 170 165 Z', defaultFill: '#fff' },
      // Right wing (outstretched)
      { id: 'wingR',  d: 'M 215 150 Q 265 130 275 160 Q 255 175 215 165 Z', defaultFill: '#fff' },
      // Belly
      { id: 'belly',  d: 'M 185 155 Q 185 180 200 185 L 200 188 L 190 188 Z', defaultFill: '#fff' },
      // Left horn
      { id: 'hornL',  d: 'M 185 130 L 180 115 L 190 125 Z',             defaultFill: '#fff' },
      // Right horn
      { id: 'hornR',  d: 'M 210 130 L 215 115 L 205 125 Z',             defaultFill: '#fff' },
      // Trailing sparkle path
      { id: 'trail',  d: 'M 100 220 Q 140 200 180 185 Q 160 210 100 220 Z', defaultFill: '#fff' },
    ],
    stars: [
      { cx: 50, cy: 25 }, { cx: 180, cy: 55 }, { cx: 330, cy: 130 },
    ],
  },
];

export default function RonkiAusmalbild({ onClose }) {
  const { state, actions } = useTask();
  const { t } = useTranslation();

  const [sceneIdx, setSceneIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(PALETTE[3].hex); // default green
  const [fills, setFills] = useState({}); // { sceneId: { regionId: hex } }
  const [saved, setSaved] = useState(false);

  const scene = SCENES[sceneIdx];
  const sceneFills = fills[scene.id] || {};

  const handleRegionTap = (regionId) => {
    SFX.play('pop');
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (_) {}
    setFills(prev => ({
      ...prev,
      [scene.id]: {
        ...(prev[scene.id] || {}),
        [regionId]: selectedColor,
      },
    }));
  };

  const handleSave = () => {
    SFX.play('coin');
    try { if (navigator.vibrate) navigator.vibrate([40, 30, 80]); } catch (_) {}
    // Persist the completed page to state
    const completed = state?.completedColoringPages || [];
    actions.patchState?.({
      completedColoringPages: [
        ...completed,
        {
          sceneId: scene.id,
          fills: sceneFills,
          completedAt: new Date().toISOString(),
        },
      ],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const filledCount = Object.keys(sceneFills).length;
  const totalRegions = scene.regions.length;
  const pct = totalRegions > 0 ? filledCount / totalRegions : 0;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #fff8f2 0%, #fef3c7 100%)',
        color: '#124346',
        fontFamily: 'Nunito, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        paddingTop: 'calc(14px + env(safe-area-inset-top, 0px))',
      }}>
        <div>
          <p style={{
            margin: 0, fontSize: 10, letterSpacing: '0.22em', fontWeight: 800,
            textTransform: 'uppercase', color: '#b45309',
          }}>
            Ausmalbild
          </p>
          <p style={{ margin: '4px 0 0', fontFamily: 'Fredoka, sans-serif', fontSize: 20, fontWeight: 500 }}>
            {scene.title}
          </p>
        </div>
        <button onClick={onClose}
          style={{
            background: 'transparent', border: 'none', color: 'rgba(180,83,9,0.7)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
          Schließen
        </button>
      </header>

      {/* Canvas */}
      <div style={{
        flex: 1,
        margin: '0 16px',
        borderRadius: 20,
        background: '#fff',
        border: '1.5px solid rgba(180,83,9,0.22)',
        boxShadow: '0 10px 28px -10px rgba(180,83,9,0.2)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 10,
      }}>
        <svg
          viewBox="0 0 400 300"
          style={{ width: '100%', height: 'auto', maxHeight: '100%' }}
        >
          {/* Regions — tap to fill with selectedColor */}
          {scene.regions.map(r => (
            <path
              key={r.id}
              d={r.d}
              fill={sceneFills[r.id] || r.defaultFill}
              stroke="#1e2b2e"
              strokeWidth="2.5"
              strokeLinejoin="round"
              onClick={() => handleRegionTap(r.id)}
              style={{ cursor: 'pointer' }}
            />
          ))}
          {/* Stars — decorative, not colorable */}
          {scene.stars.map((s, i) => (
            <g key={i}>
              <circle cx={s.cx} cy={s.cy} r="2" fill="#1e2b2e" />
            </g>
          ))}
        </svg>
      </div>

      {/* Scene switcher */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '10px 20px 0',
      }}>
        {SCENES.map((s, i) => (
          <button key={s.id} onClick={() => setSceneIdx(i)}
            style={{
              padding: '6px 14px', borderRadius: 999,
              border: sceneIdx === i ? '1.5px solid #b45309' : '1px solid rgba(180,83,9,0.2)',
              background: sceneIdx === i ? '#fcd34d' : '#fff',
              color: '#124346',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}>
            {s.title}
          </button>
        ))}
      </div>

      {/* Palette */}
      <div style={{
        padding: '14px 20px',
        display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        {PALETTE.map(c => (
          <button key={c.id}
            onClick={() => setSelectedColor(c.hex)}
            aria-label={c.label}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: c.hex,
              border: selectedColor === c.hex ? '3px solid #124346' : '2px solid rgba(18,67,70,0.15)',
              boxShadow: selectedColor === c.hex ? `0 0 0 4px ${c.hex}33, 0 6px 14px -4px ${c.hex}88` : '0 3px 6px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transform: selectedColor === c.hex ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.15s',
            }}
          />
        ))}
      </div>

      {/* Footer — progress + save */}
      <footer style={{
        padding: '14px 20px',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 10, letterSpacing: '0.2em', fontWeight: 800,
            textTransform: 'uppercase', color: '#b45309',
          }}>
            Ausgemalt · {filledCount}/{totalRegions}
          </p>
          <div style={{
            marginTop: 4, height: 6,
            background: 'rgba(180,83,9,0.12)',
            borderRadius: 999,
          }}>
            <div style={{
              width: `${pct * 100}%`, height: '100%',
              background: 'linear-gradient(90deg, #fcd34d, #f59e0b)',
              borderRadius: 999,
              transition: 'width 0.4s',
            }} />
          </div>
        </div>
        <button onClick={handleSave}
          disabled={filledCount === 0}
          style={{
            padding: '12px 22px', borderRadius: 999,
            border: 'none',
            background: saved
              ? 'linear-gradient(135deg, #34d399, #059669)'
              : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
            color: saved ? '#fff' : '#2d1638',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 800, fontSize: 12, letterSpacing: '0.14em',
            textTransform: 'uppercase',
            boxShadow: saved
              ? '0 8px 18px -6px rgba(52,211,153,0.55)'
              : '0 8px 20px -6px rgba(252,211,77,0.55)',
            cursor: filledCount === 0 ? 'default' : 'pointer',
            opacity: filledCount === 0 ? 0.45 : 1,
            transition: 'all 0.2s',
          }}>
          {saved ? '💾 Gespeichert!' : 'Fertig speichern'}
        </button>
      </footer>
    </div>
  );
}
