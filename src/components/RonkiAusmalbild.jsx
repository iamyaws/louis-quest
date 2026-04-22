import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import SFX from '../utils/sfx';
import { useAnalytics } from '../hooks/useAnalytics';

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

// Scenes built as proper Ronki chibi compositions — the same silhouette
// the kid sees across the whole app (MoodChibi), now drawn as SVG paths
// with black outlines + white fill so it reads as a real coloring page.
// Marc Apr 2026: "this is abstract art at best — use the chibi Ronki."
//
// Each region id matches a MoodChibi body-part so kids intuitively
// know what they're painting (belly, horn, wing, etc).
const SCENES = [
  {
    id: 'portrait',
    title: 'Ronki-Portrait',
    // Big head-on toddler chibi. Centered, simple scene — just Ronki.
    decor: [
      // Ground shadow
      { d: 'M 120 290 Q 200 300 280 290',                stroke: '#1a1a1a', strokeWidth: 2, dash: '4 4' },
    ],
    regions: [
      // Background (optional sky wash — so the kid gets a full picture)
      { id: 'background', d: 'M 10 10 L 390 10 L 390 290 L 10 290 Z', defaultFill: '#fff' },
      // Left wing (behind body)
      { id: 'wingL', d: 'M 155 160 Q 110 150 105 195 Q 120 210 165 195 Q 170 175 155 160 Z' },
      // Right wing (behind body)
      { id: 'wingR', d: 'M 245 160 Q 290 150 295 195 Q 280 210 235 195 Q 230 175 245 160 Z' },
      // Torso — classic pear shape
      { id: 'body',  d: 'M 200 90 Q 135 105 135 190 Q 135 265 200 280 Q 265 265 265 190 Q 265 105 200 90 Z' },
      // Belly panel
      { id: 'belly', d: 'M 200 175 Q 165 175 165 225 Q 165 255 200 260 Q 235 255 235 225 Q 235 175 200 175 Z' },
      // Left horn
      { id: 'hornL', d: 'M 165 100 Q 150 60 170 50 Q 180 80 175 100 Z' },
      // Right horn
      { id: 'hornR', d: 'M 235 100 Q 250 60 230 50 Q 220 80 225 100 Z' },
      // Left eye (white)
      { id: 'eyeL',  d: 'M 170 150 Q 155 150 155 165 Q 155 180 170 180 Q 185 180 185 165 Q 185 150 170 150 Z' },
      // Right eye (white)
      { id: 'eyeR',  d: 'M 230 150 Q 215 150 215 165 Q 215 180 230 180 Q 245 180 245 165 Q 245 150 230 150 Z' },
      // Left cheek blush
      { id: 'cheekL', d: 'M 158 195 Q 148 195 148 205 Q 148 215 158 215 Q 168 215 168 205 Q 168 195 158 195 Z' },
      // Right cheek blush
      { id: 'cheekR', d: 'M 242 195 Q 232 195 232 205 Q 232 215 242 215 Q 252 215 252 205 Q 252 195 242 195 Z' },
      // Left leg
      { id: 'legL',  d: 'M 170 265 Q 160 265 160 285 Q 160 295 175 295 Q 185 295 185 285 Q 185 265 170 265 Z' },
      // Right leg
      { id: 'legR',  d: 'M 230 265 Q 220 265 220 285 Q 220 295 235 295 Q 245 295 245 285 Q 245 265 230 265 Z' },
    ],
    // Overlay details drawn on top but not colorable — pupils + mouth
    // outline. These stay black so the face reads at a glance.
    overlays: [
      { type: 'circle', cx: 170, cy: 168, r: 4, fill: '#1a1a1a' },
      { type: 'circle', cx: 230, cy: 168, r: 4, fill: '#1a1a1a' },
      { type: 'path',   d: 'M 180 215 Q 200 230 220 215', fill: 'none', stroke: '#1a1a1a', strokeWidth: 3 },
    ],
  },
  {
    id: 'fliegender-ronki',
    title: 'Fliegender Ronki',
    // Wings outstretched, in mid-air over mountains + cloud + sun.
    decor: [],
    regions: [
      { id: 'sky',       d: 'M 0 0 L 400 0 L 400 210 L 0 210 Z' },
      { id: 'sun',       d: 'M 340 50 Q 320 50 320 72 Q 320 94 340 94 Q 360 94 360 72 Q 360 50 340 50 Z' },
      { id: 'cloud',     d: 'M 50 80 Q 25 80 25 100 Q 25 115 45 115 Q 55 130 75 125 Q 95 130 105 115 Q 125 115 125 100 Q 125 80 100 80 Q 95 65 75 70 Q 60 65 50 80 Z' },
      { id: 'mountainL', d: 'M 0 300 L 70 200 L 140 300 Z' },
      { id: 'mountainR', d: 'M 110 300 L 200 170 L 290 300 Z' },
      { id: 'mountainF', d: 'M 240 300 L 330 220 L 400 300 Z' },
      // Wings — dramatic outstretched
      { id: 'wingL',     d: 'M 180 145 Q 100 115 85 165 Q 100 195 175 175 Q 190 165 180 145 Z' },
      { id: 'wingR',     d: 'M 220 145 Q 300 115 315 165 Q 300 195 225 175 Q 210 165 220 145 Z' },
      // Body (in flight — compact pose)
      { id: 'body',      d: 'M 200 115 Q 165 120 170 175 Q 175 205 200 215 Q 225 205 230 175 Q 235 120 200 115 Z' },
      // Belly
      { id: 'belly',     d: 'M 200 165 Q 180 165 180 195 Q 180 210 200 210 Q 220 210 220 195 Q 220 165 200 165 Z' },
      // Horns
      { id: 'hornL',     d: 'M 185 120 Q 175 95 190 88 Q 197 105 195 120 Z' },
      { id: 'hornR',     d: 'M 215 120 Q 225 95 210 88 Q 203 105 205 120 Z' },
      // Tail trailing back
      { id: 'tail',      d: 'M 220 205 Q 255 220 275 240 Q 260 245 240 230 Q 225 220 220 205 Z' },
      // Sparkle trail
      { id: 'trail1',    d: 'M 130 230 Q 120 222 110 232 Q 118 240 130 230 Z' },
      { id: 'trail2',    d: 'M 90 255 Q 82 250 75 258 Q 82 264 90 255 Z' },
    ],
    overlays: [
      // Eyes (flying determined look — closed-slits)
      { type: 'path', d: 'M 178 148 L 192 148', stroke: '#1a1a1a', strokeWidth: 3 },
      { type: 'path', d: 'M 208 148 L 222 148', stroke: '#1a1a1a', strokeWidth: 3 },
      // Little smile
      { type: 'path', d: 'M 192 170 Q 200 178 208 170', fill: 'none', stroke: '#1a1a1a', strokeWidth: 2.5 },
    ],
  },
  {
    id: 'campfire',
    title: 'Ronki am Lagerfeuer',
    // Ronki sits beside a painterly campfire with trees behind.
    decor: [],
    regions: [
      { id: 'sky',     d: 'M 0 0 L 400 0 L 400 180 L 0 180 Z' },
      { id: 'moon',    d: 'M 340 40 Q 320 40 320 62 Q 320 84 340 84 Q 360 84 360 62 Q 360 40 340 40 Z' },
      { id: 'ground',  d: 'M 0 180 L 400 180 L 400 300 L 0 300 Z' },
      // Trees — two simple triangle canopies with trunks
      { id: 'tree1Can', d: 'M 50 200 L 20 130 L 80 130 Z' },
      { id: 'tree1Tr',  d: 'M 45 200 L 55 200 L 55 220 L 45 220 Z' },
      { id: 'tree2Can', d: 'M 360 205 L 330 140 L 390 140 Z' },
      { id: 'tree2Tr',  d: 'M 355 205 L 365 205 L 365 225 L 355 225 Z' },
      // Fire log
      { id: 'log',      d: 'M 180 255 Q 200 247 230 255 Q 215 263 180 260 Z' },
      // Fire
      { id: 'fire',     d: 'M 205 220 Q 185 245 200 260 Q 205 250 210 260 Q 225 245 205 220 Z' },
      // Ronki sitting on the left
      { id: 'wingL',    d: 'M 80 210 Q 55 205 55 230 Q 70 240 95 225 Q 95 215 80 210 Z' },
      { id: 'body',     d: 'M 115 155 Q 70 165 70 215 Q 70 265 115 275 Q 160 265 160 215 Q 160 165 115 155 Z' },
      { id: 'belly',    d: 'M 115 215 Q 92 215 92 245 Q 92 260 115 262 Q 138 260 138 245 Q 138 215 115 215 Z' },
      { id: 'hornL',    d: 'M 95 160 Q 85 130 100 123 Q 105 145 102 160 Z' },
      { id: 'hornR',    d: 'M 135 160 Q 145 130 130 123 Q 125 145 128 160 Z' },
      { id: 'legL',     d: 'M 95 265 Q 85 265 85 282 Q 85 292 98 292 Q 108 292 108 282 Q 108 265 95 265 Z' },
      { id: 'legR',     d: 'M 135 265 Q 125 265 125 282 Q 125 292 138 292 Q 148 292 148 282 Q 148 265 135 265 Z' },
    ],
    overlays: [
      // Face
      { type: 'circle', cx: 100, cy: 195, r: 5, fill: '#1a1a1a' },
      { type: 'circle', cx: 130, cy: 195, r: 5, fill: '#1a1a1a' },
      { type: 'path',   d: 'M 105 225 Q 115 232 125 225', fill: 'none', stroke: '#1a1a1a', strokeWidth: 2.5 },
      // Stars
      { type: 'circle', cx: 80,  cy: 40, r: 2, fill: '#1a1a1a' },
      { type: 'circle', cx: 160, cy: 60, r: 2, fill: '#1a1a1a' },
      { type: 'circle', cx: 250, cy: 45, r: 2, fill: '#1a1a1a' },
      { type: 'circle', cx: 290, cy: 70, r: 2, fill: '#1a1a1a' },
    ],
  },
];

export default function RonkiAusmalbild({ onClose }) {
  const { state, actions } = useTask();
  const haptic = useHaptic();
  const { track } = useAnalytics();

  const [sceneIdx, setSceneIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(PALETTE[3].hex); // default green
  const [fills, setFills] = useState({}); // { sceneId: { regionId: hex } }
  const [saved, setSaved] = useState(false);

  const scene = SCENES[sceneIdx];
  const sceneFills = fills[scene.id] || {};

  const handleRegionTap = (regionId) => {
    SFX.play('pop');
    haptic('tap');
    setFills(prev => ({
      ...prev,
      [scene.id]: {
        ...(prev[scene.id] || {}),
        [regionId]: selectedColor,
      },
    }));
  };

  const handleSave = () => {
    if (saved) return; // idempotent — don't double-save same tap cycle
    SFX.play('coin');
    haptic('success');
    // Persist the completed page to state. Dedup by sceneId so repeat
    // saves update the existing entry instead of appending a 2nd, 3rd,
    // 4th copy (code-reviewer + QA both caught: kid taps save multiple
    // times, Buch v2 sees unbounded duplicates).
    const completed = state?.completedColoringPages || [];
    const withoutPrior = completed.filter(p => p.sceneId !== scene.id);
    actions.patchState?.({
      completedColoringPages: [
        ...withoutPrior,
        {
          sceneId: scene.id,
          fills: sceneFills,
          completedAt: new Date().toISOString(),
        },
      ],
    });
    setSaved(true);
    // Analytics: ausmalbild.redeem. sceneId is a stable enum defined in
    // the SCENES array, never user input — safe to send. The idempotent
    // guard above (`if (saved) return`) means we don't double-fire on
    // rapid taps within the 2.2s post-save window; later saves to the
    // same scene (e.g. recoloring) do fire a fresh event, which matches
    // the product question we want to answer ("how often do kids
    // revisit?").
    track('ausmalbild.redeem', { sceneId: scene.id });
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
          role="img"
          aria-label={scene.title}
        >
          {/* Regions — tap to fill with selectedColor. Default fill is
               white so kids see clear line-art to paint INTO. */}
          {scene.regions.map(r => (
            <path
              key={r.id}
              d={r.d}
              fill={sceneFills[r.id] || r.defaultFill || '#fff'}
              stroke="#1a1a1a"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              onClick={() => handleRegionTap(r.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRegionTap(r.id);
                }
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            />
          ))}
          {/* Decorative lines (ground shadows, dashed details). */}
          {(scene.decor || []).map((d, i) => (
            <path
              key={`decor-${i}`}
              d={d.d}
              fill="none"
              stroke={d.stroke || '#1a1a1a'}
              strokeWidth={d.strokeWidth || 2}
              strokeDasharray={d.dash}
              strokeLinecap="round"
            />
          ))}
          {/* Overlays — non-colorable detail (pupils, mouth, stars). */}
          {(scene.overlays || []).map((o, i) => {
            if (o.type === 'circle') {
              return <circle key={`ov-${i}`} cx={o.cx} cy={o.cy} r={o.r} fill={o.fill} />;
            }
            return (
              <path
                key={`ov-${i}`}
                d={o.d}
                fill={o.fill || '#1a1a1a'}
                stroke={o.stroke}
                strokeWidth={o.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
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
