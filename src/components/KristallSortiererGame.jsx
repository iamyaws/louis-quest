import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SFX from '../utils/sfx';
import { useTask } from '../context/TaskContext';
import { getCreatureSpritePath } from '../data/creatures';

/**
 * KristallSortiererGame — color-sorting MINT game hosted by Mr. Shroom (forest_5).
 *
 * Mechanic (per Wave 2.7 spec):
 *   - Louis has a tray of crystals (different colors) and a row of colored bins.
 *   - Goal: tap a tray crystal → tap the matching-color bin to sort it there.
 *   - Wrong bin triggers a gentle shake + SFX, crystal stays selected for retry.
 *   - Level completes when all tray crystals are placed in the correct bins.
 *   - 4 levels: 3 colors / 4 colors / 5 colors / bonus mix with "Zwilling" pairs.
 *   - Keep under 90s total playtime for a kid's attention span.
 *
 * Badge: first level-1 completion grants badge_mint_kristall.
 * Reward: +50 HP on Level 4 completion → onComplete({ hp: 50 }).
 *
 * Host: Mr. Shroom's hat is "voll Kristalle" — story premise from introLine.
 */

const MR_SHROOM_SPRITE = getCreatureSpritePath({
  art: 'art/micropedia/creatures/mr-shroom.webp',
});
const base =
  typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

// The palette — each color is both a crystal style and a bin style.
// Chosen for strong visual contrast so a 6-year-old can distinguish at a glance.
const COLORS = {
  rose: {
    id: 'rose',
    label: 'Rosa',
    gem: 'radial-gradient(circle at 30% 25%, #fbcfe8 0%, #f472b6 55%, #be185d 100%)',
    bin: 'linear-gradient(180deg, #fbcfe8 0%, #f472b6 100%)',
    rim: '#9d174d',
    glow: 'rgba(244,114,182,0.5)',
  },
  lapis: {
    id: 'lapis',
    label: 'Blau',
    gem: 'radial-gradient(circle at 30% 25%, #bae6fd 0%, #38bdf8 55%, #0369a1 100%)',
    bin: 'linear-gradient(180deg, #bae6fd 0%, #38bdf8 100%)',
    rim: '#075985',
    glow: 'rgba(56,189,248,0.5)',
  },
  citrin: {
    id: 'citrin',
    label: 'Gelb',
    gem: 'radial-gradient(circle at 30% 25%, #fef3c7 0%, #fcd34d 55%, #b45309 100%)',
    bin: 'linear-gradient(180deg, #fef3c7 0%, #fcd34d 100%)',
    rim: '#78350f',
    glow: 'rgba(252,211,77,0.55)',
  },
  smaragd: {
    id: 'smaragd',
    label: 'Grün',
    gem: 'radial-gradient(circle at 30% 25%, #bbf7d0 0%, #34d399 55%, #065f46 100%)',
    bin: 'linear-gradient(180deg, #bbf7d0 0%, #34d399 100%)',
    rim: '#065f46',
    glow: 'rgba(52,211,153,0.5)',
  },
  amethyst: {
    id: 'amethyst',
    label: 'Lila',
    gem: 'radial-gradient(circle at 30% 25%, #e9d5ff 0%, #a855f7 55%, #6b21a8 100%)',
    bin: 'linear-gradient(180deg, #e9d5ff 0%, #a855f7 100%)',
    rim: '#581c87',
    glow: 'rgba(168,85,247,0.5)',
  },
};

// Each level: which colors, how many crystals per color on the tray.
// Tuned so a level fits in ~15-20s for a 6-year-old.
const LEVELS = [
  {
    label: 'Stufe 1: Drei Farben',
    tip: 'Bring jeden Kristall in sein Fach.',
    colorIds: ['rose', 'lapis', 'citrin'],
    trayCounts: { rose: 2, lapis: 2, citrin: 2 },
  },
  {
    label: 'Stufe 2: Vier Farben',
    tip: 'Die Grünen sind neu. Ruhig schauen.',
    colorIds: ['rose', 'lapis', 'citrin', 'smaragd'],
    trayCounts: { rose: 2, lapis: 2, citrin: 2, smaragd: 2 },
  },
  {
    label: 'Stufe 3: Fünf Farben',
    tip: 'Lila dazu. Du schaffst das.',
    colorIds: ['rose', 'lapis', 'citrin', 'smaragd', 'amethyst'],
    trayCounts: { rose: 2, lapis: 2, citrin: 2, smaragd: 2, amethyst: 2 },
  },
  {
    label: 'Stufe 4: Mr. Shrooms Hut',
    tip: 'Ein Schatz von jeder Farbe — und noch mehr Funkel.',
    colorIds: ['rose', 'lapis', 'citrin', 'smaragd', 'amethyst'],
    trayCounts: { rose: 3, lapis: 3, citrin: 2, smaragd: 3, amethyst: 2 },
  },
];

// Build the tray gems for a given level. Each gem has a stable id so tap-select
// works even with duplicates of the same color.
function buildTray(levelIdx) {
  const lv = LEVELS[levelIdx];
  const items = [];
  let k = 0;
  lv.colorIds.forEach((cid) => {
    const count = lv.trayCounts[cid] || 1;
    for (let i = 0; i < count; i++) {
      items.push({
        id: `${levelIdx}-${cid}-${i}-${k++}`,
        color: cid,
        placed: null, // null | binColorId (same as correct color when placed)
      });
    }
  });
  // Shuffle so colors aren't already grouped — a light random
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export default function KristallSortiererGame({ onComplete }) {
  const { actions } = useTask();
  const badgeClaimedRef = useRef(false);
  const shakeTimerRef = useRef(null);

  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState('playing'); // playing | levelDone | gameDone
  const [tray, setTray] = useState(() => buildTray(0));
  const [selectedId, setSelectedId] = useState(null);
  const [shakeBinId, setShakeBinId] = useState(null); // color id of bin that wrong-tapped
  const [shroomNudge, setShroomNudge] = useState(0);

  const level = LEVELS[levelIdx];

  // Load a level
  const loadLevel = useCallback((idx) => {
    setTray(buildTray(idx));
    setSelectedId(null);
    setShakeBinId(null);
    setPhase('playing');
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const claimBadgeOnce = useCallback(() => {
    if (badgeClaimedRef.current) return;
    badgeClaimedRef.current = true;
    try {
      actions.claimMintBadge('badge_mint_kristall', 'kristall-sortierer');
    } catch {
      // idempotent / silent
    }
  }, [actions]);

  // Crystals still waiting in the tray (not yet sorted)
  const trayItems = useMemo(() => tray.filter((g) => g.placed === null), [tray]);
  const allSorted = trayItems.length === 0;

  // Per-bin placed counts, for displaying stacked gems inside each bin.
  const binItems = useMemo(() => {
    const m = {};
    level.colorIds.forEach((cid) => (m[cid] = []));
    tray.forEach((g) => {
      if (g.placed) {
        if (!m[g.placed]) m[g.placed] = [];
        m[g.placed].push(g);
      }
    });
    return m;
  }, [tray, level.colorIds]);

  // Level-complete check: all tray crystals placed (always correctly, because we
  // only accept correct placements) → advance / finish.
  useEffect(() => {
    if (phase !== 'playing') return;
    if (!allSorted) return;
    const t = setTimeout(() => {
      SFX.play('celeb');
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      claimBadgeOnce();
      if (levelIdx >= LEVELS.length - 1) {
        setPhase('gameDone');
      } else {
        setPhase('levelDone');
      }
    }, 380);
    return () => clearTimeout(t);
  }, [allSorted, phase, levelIdx, claimBadgeOnce]);

  const tapTrayGem = useCallback(
    (id) => {
      if (phase !== 'playing') return;
      SFX.play('pop');
      if (navigator.vibrate) navigator.vibrate(12);
      setSelectedId((cur) => (cur === id ? null : id));
    },
    [phase]
  );

  const tapBin = useCallback(
    (binColor) => {
      if (phase !== 'playing') return;
      if (!selectedId) return;
      const gem = tray.find((g) => g.id === selectedId);
      if (!gem) return;

      if (gem.color === binColor) {
        // correct placement
        setTray((prev) =>
          prev.map((g) =>
            g.id === selectedId ? { ...g, placed: binColor } : g
          )
        );
        setSelectedId(null);
        setShroomNudge((n) => n + 1);
        SFX.play('coin');
        if (navigator.vibrate) navigator.vibrate(20);
      } else {
        // wrong bin — shake + keep selection for retry
        setShakeBinId(binColor);
        SFX.play('crash');
        if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
        if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = setTimeout(() => setShakeBinId(null), 400);
      }
    },
    [phase, selectedId, tray]
  );

  const tapPlacedGem = useCallback(
    (id) => {
      if (phase !== 'playing') return;
      setTray((prev) =>
        prev.map((g) => (g.id === id ? { ...g, placed: null } : g))
      );
      setSelectedId(null);
      SFX.play('pop');
      if (navigator.vibrate) navigator.vibrate(12);
    },
    [phase]
  );

  const nextLevel = useCallback(() => {
    if (levelIdx >= LEVELS.length - 1) {
      setPhase('gameDone');
      return;
    }
    const newIdx = levelIdx + 1;
    setLevelIdx(newIdx);
    loadLevel(newIdx);
  }, [levelIdx, loadLevel]);

  const currentLevel = levelIdx + 1;

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col overflow-hidden"
      style={{
        // Crystal-cave backdrop: deep teal → amethyst → warm cream at the bottom.
        background:
          'linear-gradient(180deg, #0f2e31 0%, #1f1243 35%, #3b2166 65%, #fff8f2 100%)',
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3"
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1.5px solid rgba(18,67,70,0.18)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl" aria-hidden="true">🔷</span>
          <div className="min-w-0">
            <h1
              className="font-headline font-bold text-lg leading-none truncate"
              style={{ color: '#124346', fontFamily: 'Fredoka, sans-serif' }}
            >
              Kristall-Sortierer
            </h1>
            <p
              className="font-label text-[11px] leading-tight"
              style={{ color: '#725b00' }}
            >
              {level.label}
            </p>
          </div>
        </div>
        <button
          onClick={() => onComplete?.({ hp: 0 })}
          className="px-4 py-2 rounded-full font-label font-bold text-sm min-h-[40px] active:scale-95 transition-transform"
          style={{ background: 'rgba(18,67,70,0.15)', color: '#124346' }}
        >
          Beenden
        </button>
      </header>

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center px-5"
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Level pill + tip */}
        <div
          className="flex items-center gap-3 px-4 py-1.5 rounded-full mt-1"
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1.5px solid rgba(252,211,77,0.45)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <span
            className="font-label text-[11px] font-bold uppercase tracking-wider"
            style={{ color: '#725b00' }}
          >
            Stufe
          </span>
          <span
            className="font-headline font-bold text-base"
            style={{ color: '#124346' }}
          >
            {currentLevel}/{LEVELS.length}
          </span>
        </div>
        <p
          className="font-body text-sm text-center mt-3 mb-2 max-w-xs"
          style={{ color: '#fff8f2', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          {level.tip}
        </p>

        {/* Bins row — one bin per color in the level */}
        <div
          className="mt-3 w-full max-w-md grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${level.colorIds.length}, minmax(0, 1fr))`,
          }}
        >
          {level.colorIds.map((cid) => {
            const c = COLORS[cid];
            const stacked = binItems[cid] || [];
            const isShaking = shakeBinId === cid;
            const selected = selectedId
              ? tray.find((g) => g.id === selectedId)
              : null;
            const isTarget = selected && selected.color === cid;
            return (
              <button
                key={cid}
                onClick={() => tapBin(cid)}
                aria-label={`${c.label}-Fach`}
                className="relative flex flex-col items-center justify-end rounded-2xl p-2 active:scale-95 transition-transform"
                style={{
                  aspectRatio: '3 / 4',
                  background: c.bin,
                  border: `2.5px solid ${c.rim}`,
                  boxShadow: isTarget
                    ? `0 0 0 4px ${c.glow}, 0 6px 16px ${c.glow}`
                    : '0 4px 12px rgba(0,0,0,0.25)',
                  animation: isShaking ? 'ksShake 0.4s ease-in-out' : 'none',
                  minHeight: 110,
                }}
              >
                {/* Stacked placed crystals inside the bin */}
                <div className="flex flex-wrap items-end justify-center gap-1 w-full">
                  {stacked.map((g) => (
                    <span
                      key={g.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        tapPlacedGem(g.id);
                      }}
                      role="button"
                      aria-label={`${c.label}-Kristall (antippen zum Zurücklegen)`}
                      className="inline-block rounded-lg cursor-pointer select-none"
                      style={{
                        width: 22,
                        height: 28,
                        background: c.gem,
                        border: `1.5px solid ${c.rim}`,
                        transform: `rotate(${(g.id.length * 7) % 14 - 7}deg)`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                  ))}
                </div>
                {/* Label strip along the bottom */}
                <span
                  className="absolute bottom-1 left-1 right-1 text-center font-label font-bold text-[10px] uppercase tracking-wider rounded-full px-1 py-0.5"
                  style={{
                    color: '#fff',
                    background: c.rim,
                    textShadow: '0 1px 1px rgba(0,0,0,0.3)',
                  }}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tray area */}
        <div className="mt-5 w-full max-w-md">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <p
              className="font-label font-bold text-[11px] uppercase tracking-[0.2em]"
              style={{ color: '#fcd34d' }}
            >
              Mr. Shrooms Kristalle
            </p>
            <span
              className="font-label font-bold text-[11px]"
              style={{ color: '#fff8f2' }}
            >
              {trayItems.length} übrig
            </span>
          </div>
          <div
            className="rounded-2xl p-3 flex flex-wrap items-center justify-center gap-2 min-h-[80px]"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(252,211,77,0.35)',
              backdropFilter: 'blur(14px)',
            }}
          >
            {trayItems.length === 0 && (
              <p
                className="font-body text-xs italic"
                style={{ color: '#fff8f2' }}
              >
                Alle Kristalle sortiert.
              </p>
            )}
            {trayItems.map((g) => {
              const c = COLORS[g.color];
              const selected = g.id === selectedId;
              return (
                <button
                  key={g.id}
                  onClick={() => tapTrayGem(g.id)}
                  aria-label={`${c.label}-Kristall${selected ? ' (gewählt)' : ''}`}
                  className="relative inline-flex items-center justify-center select-none active:scale-95 transition-transform"
                  style={{
                    width: 52,
                    height: 62,
                    background: c.gem,
                    border: selected ? `3px solid #fcd34d` : `2px solid ${c.rim}`,
                    borderRadius: '12px 12px 26px 26px / 28px 28px 14px 14px',
                    boxShadow: selected
                      ? `0 0 0 4px rgba(252,211,77,0.55), 0 6px 14px ${c.glow}`
                      : `0 4px 10px ${c.glow}`,
                    transform: selected ? 'scale(1.12) translateY(-2px)' : 'scale(1)',
                    transition: 'transform 180ms, box-shadow 180ms',
                  }}
                >
                  {/* Sparkle highlight */}
                  <span
                    aria-hidden="true"
                    className="absolute"
                    style={{
                      top: 8,
                      left: 10,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.7)',
                      filter: 'blur(1px)',
                    }}
                  />
                </button>
              );
            })}
          </div>
          <p
            className="font-body text-[11px] text-center mt-2"
            style={{ color: '#fcd34d' }}
          >
            {selectedId
              ? 'Tippe auf das richtige Fach.'
              : 'Tippe einen Kristall.'}
          </p>
        </div>
      </div>

      {/* Mr. Shroom host sprite — bottom-right, watching */}
      <div
        className="fixed z-[401] pointer-events-none"
        style={{
          right: 6,
          bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          width: 96,
          height: 96,
        }}
      >
        <img
          key={shroomNudge}
          src={base + MR_SHROOM_SPRITE}
          alt="Mr. Shroom"
          className="w-full h-full object-contain drop-shadow-lg select-none"
          style={{ animation: 'ksShroomNudge 0.5s ease-out' }}
          draggable={false}
        />
      </div>

      {/* Level-done overlay */}
      {phase === 'levelDone' && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{
            background: 'rgba(31,18,67,0.65)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{
              background: '#fff8f2',
              boxShadow: '0 24px 64px rgba(0,0,0,0.32)',
              border: '1.5px solid rgba(252,211,77,0.45)',
            }}
          >
            <p className="text-6xl mb-2">🔷</p>
            <h2
              className="font-headline font-bold text-2xl mb-1"
              style={{ color: '#124346', fontFamily: 'Fredoka, sans-serif' }}
            >
              Stufe {currentLevel} geschafft!
            </h2>
            <p className="font-body text-sm mb-6" style={{ color: '#725b00' }}>
              Mr. Shroom lüftet seinen Hut. Magst du weiter?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={nextLevel}
                className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #6b21a8)',
                  color: 'white',
                  boxShadow: '0 8px 22px rgba(107,33,168,0.45)',
                }}
              >
                Weiter
              </button>
              <button
                onClick={() => setPhase('gameDone')}
                className="w-full py-3 rounded-full font-label font-bold text-sm min-h-[44px] active:scale-95 transition-transform"
                style={{
                  background: 'transparent',
                  color: '#124346',
                  border: '1.5px solid rgba(18,67,70,0.3)',
                }}
              >
                Fertig für heute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-game celebration overlay */}
      {phase === 'gameDone' && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(168,85,247,0.92), rgba(56,189,248,0.92))',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-7 text-center"
            style={{
              background: '#fff8f2',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(252,211,77,0.45)',
            }}
          >
            <div className="text-7xl mb-2">🏆</div>
            <p
              className="font-label font-bold text-xs uppercase tracking-[0.22em] mb-1"
              style={{ color: '#124346' }}
            >
              Neuer Titel
            </p>
            <h2
              className="font-headline font-bold text-3xl mb-2"
              style={{ color: '#124346', fontFamily: 'Fredoka, sans-serif' }}
            >
              Kristall-Kenner!
            </h2>
            <p className="font-body text-base mb-5" style={{ color: '#725b00' }}>
              Mr. Shrooms Hut funkelt wieder in allen Farben.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(252,211,77,0.25)', color: '#725b00' }}
            >
              <span className="text-lg">💛</span>
              <span className="font-label font-bold text-sm">+50 Sterne für Ronki</span>
            </div>
            <button
              onClick={() => onComplete?.({ hp: 50 })}
              className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #6b21a8)',
                color: 'white',
                boxShadow: '0 8px 22px rgba(107,33,168,0.45)',
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ksShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-5px); }
          40%      { transform: translateX(5px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes ksShroomNudge {
          0%   { transform: translateY(0) rotate(0deg); }
          40%  { transform: translateY(-4px) rotate(-3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
