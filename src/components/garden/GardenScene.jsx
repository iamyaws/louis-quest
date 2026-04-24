import React from 'react';
import MoodChibi from '../MoodChibi';
import { useTranslation } from '../../i18n/LanguageContext';
import { DECOR_BY_ID } from '../../data/gardenConstants';
import './garden-scene.css';

/**
 * GardenScene — shared reusable painterly scene-kit.
 *
 * Renders the sky + hills + treeline + ground + fire + plants + decor
 * + Ronki chibi in one painted place. Shape and CSS ported from the
 * Claude Design v1 mockup:
 *   docs/discovery/2026-04-23-core-gameloop-time-stack/screens/06-garden-hub-backdrop.html
 *
 * Consumed by:
 *   · GardenPreview — Hub-card size (~210px tall, rounded card)
 *   · GardenMode — full-screen
 *   · PlantSeedSheet / DecorPlacement — as background with foreground overlay
 *
 * Zero-asset: everything here is CSS gradients + border-radius + box-shadows,
 * same construction as CampfireScene.jsx so asset weight stays at zero.
 * Plants and decor are rendered from props (arrays of GardenPlant /
 * GardenDecor) — the caller owns all data.
 *
 * Props:
 *   · plants       (array)   — GardenPlant[] from state.garden.plants
 *   · decor        (array)   — GardenDecor[] from state.garden.decor
 *   · sky          (string)  — 'dawn' | 'day' | 'dusk' | 'night'
 *                              (auto-derived from clock hour if omitted)
 *   · season       (string)  — 'spring' | 'summer' | 'autumn' | 'winter'
 *                              (auto-derived from calendar month if omitted)
 *   · showFire     (boolean) — render the Lagerfeuer (default true)
 *   · showRonki    (boolean) — render the chibi Ronki in-scene (default true)
 *   · ronkiPosition ({left, bottom, size}) — override Ronki's position
 *   · hintSpots    (array)   — optional [{x, y}] list — renders pulse rings
 *   · showSun      (boolean) — render sun/moon (default true)
 *   · className    (string)  — extra class on root
 *   · onSceneTap   (fn)      — tap anywhere on ground (for planting/placing)
 *   · children     (node)    — extra foreground content (ghosts, prompts)
 *   · plantStageFn (fn)      — optional (plant) => 'sprout'|'young'|'mid'|'mature'
 *                              Defaults to 'sprout' for <7d, 'young' <30d,
 *                              'mid' <90d, 'mature' otherwise.
 */

function autoSky() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'dawn';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

function autoSeason() {
  const m = new Date().getMonth();  // 0–11
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

function daysSince(iso) {
  const d = new Date(iso);
  const today = new Date();
  return Math.floor((today - d) / 86400000);
}

function defaultStage(plant) {
  const d = daysSince(plant.plantedAt);
  if (d < 7) return 'sprout';
  if (d < 30) return 'young';
  if (d < 90) return 'mid';
  return 'mature';
}

// ── Plant renderers ────────────────────────────────────────────────────
function PlantSprout() {
  return (
    <div className="g-sprout">
      <span className="g-sprout-leaf l" />
      <span className="g-sprout-leaf r" />
      <span className="g-sprout-stem" />
    </div>
  );
}
function PlantYoung() {
  return (
    <div className="g-young">
      <span className="g-young-canopy" />
      <span className="g-young-trunk" />
    </div>
  );
}
function PlantMid({ species }) {
  // Pine-family renders cone-shape even at mid stage
  if (species === 'pine' || species === 'fir') {
    return (
      <div className="g-pine">
        <span className="g-pine-c c1" />
        <span className="g-pine-c c2" />
        <span className="g-pine-c c3" />
        <span className="g-pine-trunk" />
      </div>
    );
  }
  return (
    <div className="g-mid">
      <span className="g-mid-canopy" />
      <span className="g-mid-trunk" />
    </div>
  );
}
function PlantMature({ species }) {
  if (species === 'pine' || species === 'fir') {
    return (
      <div className="g-pine" style={{ transform: 'scale(1.3)', transformOrigin: 'bottom' }}>
        <span className="g-pine-c c1" />
        <span className="g-pine-c c2" />
        <span className="g-pine-c c3" />
        <span className="g-pine-trunk" />
      </div>
    );
  }
  return (
    <div className="g-mature">
      <span className="g-mature-canopy" />
      <span className="g-mature-trunk" />
    </div>
  );
}

function PlantByStage({ plant, stage }) {
  if (stage === 'sprout') return <PlantSprout />;
  if (stage === 'young') return <PlantYoung />;
  if (stage === 'mid') return <PlantMid species={plant.species} />;
  return <PlantMature species={plant.species} />;
}

// ── Decor renderers ────────────────────────────────────────────────────
function Decor({ type }) {
  switch (type) {
    case 'stone':    return <span className="g-stone" />;
    case 'stone-sm': return <span className="g-stone sm" />;
    case 'mushroom': return (
      <span className="g-mushroom">
        <span className="cap" />
        <span className="stem" />
      </span>
    );
    case 'lantern': return (
      <span className="g-lantern">
        <span className="pole" />
        <span className="lamp" />
      </span>
    );
    case 'bench': return (
      <span className="g-bench">
        <span className="back" />
        <span className="seat" />
        <span className="leg l" />
        <span className="leg r" />
      </span>
    );
    case 'fence': return (
      <span className="g-fence">
        <span className="rail" />
      </span>
    );
    case 'crystal': return <span className="g-crystal" />;
    case 'runestone': return <span className="g-runestone" />;
    case 'faerie-ring': return (
      <span className="g-faerie-ring">
        <span className="fm fm1"><span className="cap" /><span className="stem" /></span>
        <span className="fm fm2"><span className="cap" /><span className="stem" /></span>
        <span className="fm fm3"><span className="cap" /><span className="stem" /></span>
      </span>
    );
    case 'shrine': return (
      <span className="g-shrine">
        <span className="flame" />
        <span className="top" />
        <span className="pillar l" />
        <span className="pillar r" />
        <span className="base" />
      </span>
    );
    case 'orb': return <span className="g-orb" />;
    case 'dreamcatcher': return (
      <span className="g-dream">
        <span className="hoop" />
        <span className="feather l" />
        <span className="feather m" />
        <span className="feather r" />
      </span>
    );
    case 'idol': return (
      <span className="g-idol">
        <span className="body" />
        <span className="horn l" />
        <span className="horn r" />
        <span className="eye l" />
        <span className="eye r" />
        <span className="base" />
      </span>
    );
    case 'totem': return (
      <span className="g-totem">
        <span className="seg s1" />
        <span className="seg s2" />
        <span className="seg s3" />
      </span>
    );
    default: return null;
  }
}

// ── Ronki chibi — delegates to MoodChibi so the scene respects the
// kid's picked variant (forest → green, violet → lavender, etc.).
// Before this, we had a local CSS Ronki with a hardcoded amber palette,
// which meant the Hub garden always showed a yellow dragon regardless
// of what the kid picked at hatch. Marc flag 23 Apr 2026.
function RonkiChibi({ size = 62, variant = 'amber', stage = 2, mood = 'normal' }) {
  return (
    <div style={{ width: size, height: size, pointerEvents: 'none' }}>
      <MoodChibi size={size} variant={variant} stage={stage} mood={mood} bare />
    </div>
  );
}

// ── Fire ──────────────────────────────────────────────────────────────
function Fire({ left = '50%', bottom = '12%', scale = 1 }) {
  return (
    <div className="g-fire" style={{ left, bottom, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'bottom' }}>
      <span className="glow" />
      <span className="pit" />
      <span className="log a" />
      <span className="log b" />
      <span className="flame" />
      <span className="flame b" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function GardenScene({
  plants = [],              // real kid-planted trees (state.garden.plants)
  decor = [],               // real kid-placed decor (state.garden.decor)
  demoPlants = [],          // optional atmosphere plants (no interaction)
  demoDecor = [],           // optional atmosphere decor (no interaction)
  sky,
  season,
  showFire = true,
  firePosition,
  showRonki = true,
  ronkiPosition,
  ronkiVariant = 'amber',
  ronkiStage = 2,
  ronkiMood = 'normal',
  hintSpots,
  showSun = true,
  className = '',
  onSceneTap,
  onDecorClick,          // (id) => void — if set, REAL decor items are tappable (decor mode).
                         //                Demo decor stays non-interactive regardless.
  children,
  plantStageFn = defaultStage,
}) {
  const { t, lang } = useTranslation();
  const resolvedSky = sky ?? autoSky();
  const resolvedSeason = season ?? autoSeason();
  const ronki = ronkiPosition ?? { left: '30%', bottom: '6%', size: 52 };

  // Fixed tree-line tick count — tiny treeline at horizon (15 ticks)
  const treelineTicks = Array.from({ length: 15 });

  const handleClick = onSceneTap
    ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onSceneTap({ x, y }, e);
      }
    : undefined;

  return (
    <div
      className={`g-scene ${className}`}
      data-sky={resolvedSky}
      data-season={resolvedSeason}
      onClick={handleClick}
    >
      {showSun && <div className="g-sun" aria-hidden="true" />}

      <div className="g-hills" aria-hidden="true">
        <span className="hill h1" />
        <span className="hill h2" />
        <span className="hill h3" />
      </div>

      <div className="g-treeline" aria-hidden="true">
        {treelineTicks.map((_, i) => (
          <span key={i} className="tl-t" />
        ))}
      </div>

      <div className="g-ground" aria-hidden="true" />

      {/* Demo atmosphere plants — rendered first, BEHIND real plants in
          DOM order. Non-interactive (no tap-to-remove even in decor mode).
          Kid-owned plants visually overlap these. Isolation refactor
          24 Apr 2026: separate list + non-interactive rendering removes
          the id-prefix filtering that was scattered in 3 places. */}
      {demoPlants.map((p) => {
        const stage = plantStageFn(p);
        return (
          <div
            key={p.id}
            className="g-plant"
            style={{ left: `${p.position.x}%`, bottom: `${p.position.y}%` }}
            data-species={p.species}
            data-stage={stage}
            data-demo="true"
            aria-hidden="true"
          >
            <PlantByStage plant={p} stage={stage} />
            <span className="g-plant-shadow" />
          </div>
        );
      })}

      {/* Real kid-planted trees — rendered AFTER demo plants so they sit
          in front. Position is % so the garden scales with any scene size. */}
      {plants.map((p) => {
        const stage = plantStageFn(p);
        return (
          <div
            key={p.id}
            className="g-plant"
            style={{ left: `${p.position.x}%`, bottom: `${p.position.y}%` }}
            data-species={p.species}
            data-stage={stage}
          >
            <PlantByStage plant={p} stage={stage} />
            <span className="g-plant-shadow" />
          </div>
        );
      })}

      {/* Demo atmosphere decor — rendered BEFORE real decor + always
          non-interactive (no tappable button, no onDecorClick wiring). */}
      {demoDecor.map((d) => (
        <div
          key={d.id}
          className="g-decor-item"
          style={{ left: `${d.position.x}%`, bottom: `${d.position.y}%` }}
          data-type={d.type}
          data-demo="true"
          aria-hidden="true"
        >
          <Decor type={d.type} />
        </div>
      ))}

      {/* Real kid-placed decor. In decor mode (onDecorClick set), each
          REAL item becomes tappable (ownership persists, so tap removes
          from scene but keeps in owned). */}
      {decor.map((d) => {
        const style = { left: `${d.position.x}%`, bottom: `${d.position.y}%` };
        if (onDecorClick) {
          const info = DECOR_BY_ID[d.type];
          const typeLabel = info ? (lang === 'de' ? info.labelDe : info.labelEn) : d.type;
          return (
            <button
              key={d.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); onDecorClick(d.id); }}
              aria-label={t('garden.decor.removeAria', { type: typeLabel })}
              className="g-decor-item g-decor-tappable"
              style={{
                ...style,
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
              data-type={d.type}
            >
              <Decor type={d.type} />
            </button>
          );
        }
        return (
          <div
            key={d.id}
            className="g-decor-item"
            style={style}
            data-type={d.type}
          >
            <Decor type={d.type} />
          </div>
        );
      })}

      {/* Fire — optional. In GardenPreview + GardenMode, always visible;
          in planting/decor modes, optional depending on composition.
          firePosition prop overrides default placement (preview raises
          it so the Hub's nameplate pill doesn't cover the flame). */}
      {showFire && (
        <Fire
          left={firePosition?.left ?? '52%'}
          bottom={firePosition?.bottom ?? '8%'}
          scale={firePosition?.scale ?? 1}
        />
      )}

      {/* Ronki — optional. Size tunes with viewport (smaller in preview).
          Variant/stage/mood pulled from props so the scene respects the
          kid's picked colorway (Marc flag 24 Apr 2026: Veilchen-Ronki
          still showed yellow on the Hub). */}
      {showRonki && (
        <div
          className="g-ronki-wrap"
          style={{ left: ronki.left, bottom: ronki.bottom, transform: 'translateX(-50%)' }}
        >
          <RonkiChibi size={ronki.size} variant={ronkiVariant} stage={ronkiStage} mood={ronkiMood} />
        </div>
      )}

      {/* Hint rings — pulse on interactive spots (e.g., when Ronki invites
          the kid to plant or when a new witness beat is pending). */}
      {hintSpots?.map((h, i) => (
        <span
          key={i}
          className="g-hint-ring"
          style={{ left: `${h.x}%`, bottom: `${h.y}%` }}
        />
      ))}

      {/* Foreground content — ghosts during placement, speech bubbles,
          season/weather overlays, etc. */}
      {children}
    </div>
  );
}

export { autoSky, autoSeason, defaultStage };
