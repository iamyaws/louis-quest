import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SFX from '../utils/sfx';
import { useTask } from '../context/TaskContext';
import { getFreundSpritePath } from '../data/freunde';

/**
 * PilzWaageGame — balance-scale puzzle MINT game hosted by Pilzhüter.
 *
 * Mechanic (per Wave 2.6 spec):
 *   - Louis has a tray of mushrooms with number weights.
 *   - Goal: place mushrooms on left and right pans so both sides weigh the same.
 *   - Tap-to-select for accessibility (no drag-drop on small fingers).
 *     - Tap a tray mushroom → selected (highlighted)
 *     - Tap a pan → places selected mushroom there
 *     - Tap a placed mushroom → returns it to the tray
 *   - Scale tilts based on weight difference. Green glow + "Gleich!" when balanced
 *     AND all tray mushrooms have been placed.
 *   - 5 levels, small numbers 1..5 growing to 1..9 with pre-placed weights.
 *
 * Badge: first level-1 completion grants badge_mint_waage.
 * Reward: +50 HP on Level 5 completion → onComplete({ hp: 50 }).
 */

const PILZHUETER_SPRITE = getFreundSpritePath({
  portrait: 'art/freunde/pilzhueter.webp',
});
const base =
  typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

// Each level is an authored puzzle.
//   tray:        weights available in Louis's tray (numbers)
//   fixedLeft:   preplaced weights on left pan (cannot be moved)
//   fixedRight:  preplaced weights on right pan (cannot be moved)
//
// A puzzle is solved when:
//   1) all tray mushrooms have been placed, AND
//   2) left sum === right sum
//
// Level tuning is verified in a sandbox BFS to ensure a valid placement exists.
const LEVELS = [
  // Level 1 — warm-up: 2 + 1 on left against 3 on right (placed by Louis)
  {
    label: 'Stufe 1: Ganz einfach',
    tray: [1, 2, 3],
    fixedLeft: [],
    fixedRight: [],
    tip: 'Leg die Pilze so auf, dass beide Seiten gleich sind.',
  },
  // Level 2 — even split
  {
    label: 'Stufe 2: Gleich verteilt',
    tray: [1, 2, 3, 4],
    fixedLeft: [],
    fixedRight: [],
    tip: 'Teile die Pilze in zwei Gruppen.',
  },
  // Level 3 — one fixed weight
  {
    label: 'Stufe 3: Schon ein Pilz liegt',
    tray: [1, 2, 4],
    fixedLeft: [3],
    fixedRight: [],
    tip: 'Der Pilz links bleibt. Balanciere den Rest.',
  },
  // Level 4 — larger numbers
  {
    label: 'Stufe 4: Grössere Pilze',
    tray: [1, 3, 4, 6],
    fixedLeft: [2],
    fixedRight: [],
    tip: 'Mehr Gewichte. Gleich verteilt?',
  },
  // Level 5 — two fixed weights, multiple solutions
  {
    label: 'Stufe 5: Pilzhüters Rätsel',
    tray: [1, 2, 3, 5, 7],
    fixedLeft: [4],
    fixedRight: [2],
    tip: 'Stelle die Waage ruhig.',
  },
];

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export default function PilzWaageGame({ onComplete }) {
  const { actions } = useTask();
  const badgeClaimedRef = useRef(false);

  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState('playing'); // playing | levelDone | gameDone

  // mushroom state per level
  // Each tray mushroom has a stable unique id so tap-select works even with duplicate weights.
  const [tray, setTray] = useState([]);      // [{ id, w, placed: 'left'|'right'|null }]
  const [leftFixed, setLeftFixed] = useState([]);
  const [rightFixed, setRightFixed] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [wobble, setWobble] = useState(0); // increments on placement for scale animation

  // Load a level into state
  const loadLevel = useCallback((idx) => {
    const lv = LEVELS[idx];
    const trayItems = lv.tray.map((w, i) => ({
      id: `${idx}-${i}-${w}`,
      w,
      placed: null,
    }));
    setTray(trayItems);
    setLeftFixed(lv.fixedLeft);
    setRightFixed(lv.fixedRight);
    setSelectedId(null);
    setPhase('playing');
  }, []);

  useEffect(() => {
    loadLevel(0);
  }, [loadLevel]);

  const claimBadgeOnce = useCallback(() => {
    if (badgeClaimedRef.current) return;
    badgeClaimedRef.current = true;
    try {
      actions.claimMintBadge('badge_mint_waage', 'pilz-waage');
    } catch {
      // silent / idempotent
    }
  }, [actions]);

  // Compute pan totals
  const leftItems = useMemo(
    () => tray.filter((t) => t.placed === 'left'),
    [tray]
  );
  const rightItems = useMemo(
    () => tray.filter((t) => t.placed === 'right'),
    [tray]
  );
  const leftSum = sum(leftFixed) + sum(leftItems.map((i) => i.w));
  const rightSum = sum(rightFixed) + sum(rightItems.map((i) => i.w));
  const trayItems = tray.filter((t) => t.placed === null);
  const allPlaced = trayItems.length === 0;
  const balanced = allPlaced && leftSum === rightSum;

  // Detect balance and complete level
  useEffect(() => {
    if (phase !== 'playing') return;
    if (!balanced) return;
    // debounce a tick so the final placement animation reads
    const t = setTimeout(() => {
      SFX.play('celeb');
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      claimBadgeOnce();
      if (levelIdx >= LEVELS.length - 1) {
        setPhase('gameDone');
      } else {
        setPhase('levelDone');
      }
    }, 420);
    return () => clearTimeout(t);
  }, [balanced, phase, levelIdx, claimBadgeOnce]);

  const tapTrayMushroom = useCallback(
    (id) => {
      if (phase !== 'playing') return;
      SFX.play('pop');
      if (navigator.vibrate) navigator.vibrate(12);
      setSelectedId((cur) => (cur === id ? null : id));
    },
    [phase]
  );

  const tapPan = useCallback(
    (side) => {
      if (phase !== 'playing') return;
      if (!selectedId) return;
      // place the selected tray mushroom on this side
      setTray((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, placed: side } : t
        )
      );
      setSelectedId(null);
      setWobble((w) => w + 1);
      SFX.play('pop');
      if (navigator.vibrate) navigator.vibrate(18);
    },
    [phase, selectedId]
  );

  const tapPlacedMushroom = useCallback(
    (id) => {
      if (phase !== 'playing') return;
      setTray((prev) =>
        prev.map((t) => (t.id === id ? { ...t, placed: null } : t))
      );
      setSelectedId(null);
      setWobble((w) => w + 1);
      SFX.play('pop');
      if (navigator.vibrate) navigator.vibrate(12);
    },
    [phase]
  );

  const resetLevel = useCallback(() => {
    if (phase !== 'playing') return;
    setTray((prev) => prev.map((t) => ({ ...t, placed: null })));
    setSelectedId(null);
    setWobble((w) => w + 1);
    SFX.play('pop');
  }, [phase]);

  const nextLevel = useCallback(() => {
    if (levelIdx >= LEVELS.length - 1) {
      setPhase('gameDone');
      return;
    }
    const newIdx = levelIdx + 1;
    setLevelIdx(newIdx);
    loadLevel(newIdx);
  }, [levelIdx, loadLevel]);

  // Scale tilt: negative (left heavier) to positive (right heavier)
  const diff = leftSum - rightSum;
  const maxTilt = 14; // degrees
  const tiltRaw = Math.max(-maxTilt, Math.min(maxTilt, -diff * 3)); // left heavier → positive rotation (left pan drops)
  // CSS transform: beam rotates around its center
  const beamRotation = balanced ? 0 : tiltRaw;

  const level = LEVELS[levelIdx];
  const currentLevel = levelIdx + 1;

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 45%, #ecfdf5 100%)',
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3"
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1.5px solid rgba(180,83,9,0.18)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl" aria-hidden="true">⚖️</span>
          <div className="min-w-0">
            <h1
              className="font-headline font-bold text-lg leading-none truncate"
              style={{ color: '#7c2d12', fontFamily: 'Fredoka, sans-serif' }}
            >
              Pilz-Waage
            </h1>
            <p
              className="font-label text-[11px] leading-tight"
              style={{ color: '#92400e' }}
            >
              {level.label}
            </p>
          </div>
        </div>
        <button
          onClick={() => onComplete?.({ hp: 0 })}
          className="px-4 py-2 rounded-full font-label font-bold text-sm min-h-[40px] active:scale-95 transition-transform"
          style={{ background: 'rgba(180,83,9,0.15)', color: '#7c2d12' }}
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
        {/* Level + tip */}
        <div
          className="flex items-center gap-3 px-4 py-1.5 rounded-full mt-1"
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1.5px solid rgba(180,83,9,0.25)',
          }}
        >
          <span
            className="font-label text-[11px] font-bold uppercase tracking-wider"
            style={{ color: '#92400e' }}
          >
            Stufe
          </span>
          <span
            className="font-headline font-bold text-base"
            style={{ color: '#7c2d12' }}
          >
            {currentLevel}/{LEVELS.length}
          </span>
        </div>
        <p
          className="font-body text-sm text-center mt-3 mb-1 max-w-xs"
          style={{ color: '#78350f' }}
        >
          {level.tip}
        </p>

        {/* The scale */}
        <div
          className="relative mx-auto mt-3 mb-3"
          style={{ width: 320, height: 200 }}
        >
          {/* Central post */}
          <div
            className="absolute"
            style={{
              left: 156,
              top: 40,
              width: 8,
              height: 150,
              background: 'linear-gradient(180deg, #78350f, #451a03)',
              borderRadius: 4,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
          {/* Base */}
          <div
            className="absolute rounded-xl"
            style={{
              left: 80,
              top: 180,
              width: 160,
              height: 16,
              background: 'linear-gradient(180deg, #78350f, #451a03)',
              boxShadow: '0 4px 10px rgba(120,53,15,0.25)',
            }}
          />
          {/* Pivot */}
          <div
            className="absolute rounded-full"
            style={{
              left: 152,
              top: 32,
              width: 16,
              height: 16,
              background: '#fcd34d',
              border: '2px solid #92400e',
              zIndex: 3,
            }}
          />
          {/* Rotating beam + pans */}
          <div
            className="absolute"
            style={{
              left: 20,
              top: 40,
              width: 280,
              height: 4,
              transform: `rotate(${beamRotation}deg)`,
              transformOrigin: '50% 50%',
              transition: 'transform 500ms cubic-bezier(.34,1.56,.64,1)',
            }}
          >
            {/* Beam */}
            <div
              className="absolute rounded-full"
              style={{
                left: 0,
                top: 0,
                width: 280,
                height: 4,
                background: 'linear-gradient(90deg, #92400e, #78350f, #92400e)',
                boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
              }}
            />
            {/* Left rope */}
            <div
              className="absolute"
              style={{
                left: 30,
                top: 2,
                width: 1.5,
                height: 44,
                background: '#78350f',
              }}
            />
            {/* Right rope */}
            <div
              className="absolute"
              style={{
                left: 248.5,
                top: 2,
                width: 1.5,
                height: 44,
                background: '#78350f',
              }}
            />
            {/* Left pan */}
            <button
              onClick={() => tapPan('left')}
              aria-label="Linke Waagschale"
              className="absolute rounded-t-[40px] rounded-b-xl flex flex-wrap items-center justify-center gap-1 p-2 active:scale-95 transition-transform"
              style={{
                left: -20,
                top: 46,
                width: 100,
                height: 64,
                background: balanced
                  ? 'radial-gradient(circle at 50% 30%, #bbf7d0 0%, #86efac 100%)'
                  : selectedId
                  ? 'radial-gradient(circle at 50% 30%, #fef3c7 0%, #fcd34d 100%)'
                  : 'radial-gradient(circle at 50% 30%, #fef3c7 0%, #fde68a 100%)',
                border: '2.5px solid #92400e',
                boxShadow: balanced
                  ? '0 0 0 4px rgba(34,197,94,0.35)'
                  : '0 4px 10px rgba(120,53,15,0.22)',
                cursor: 'pointer',
              }}
            >
              {leftFixed.map((w, i) => (
                <span
                  key={`lf-${i}`}
                  className="inline-flex items-center justify-center rounded-full font-headline font-bold select-none"
                  style={{
                    width: 28,
                    height: 28,
                    fontSize: 14,
                    background:
                      'radial-gradient(circle at 30% 30%, #fca5a5, #b91c1c)',
                    color: 'white',
                    border: '1.5px solid #7f1d1d',
                    textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                    fontFamily: 'Fredoka, sans-serif',
                    opacity: 0.9,
                  }}
                  aria-label={`Fest: ${w}`}
                >
                  {w}
                </span>
              ))}
              {leftItems.map((m) => (
                <span
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    tapPlacedMushroom(m.id);
                  }}
                  className="inline-flex items-center justify-center rounded-full font-headline font-bold select-none cursor-pointer"
                  style={{
                    width: 30,
                    height: 30,
                    fontSize: 15,
                    background:
                      'radial-gradient(circle at 30% 30%, #fed7aa, #c2410c)',
                    color: 'white',
                    border: '1.5px solid #7c2d12',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    fontFamily: 'Fredoka, sans-serif',
                  }}
                  aria-label={`Pilz ${m.w} (antippen zum Zurücklegen)`}
                >
                  {m.w}
                </span>
              ))}
            </button>
            {/* Right pan */}
            <button
              onClick={() => tapPan('right')}
              aria-label="Rechte Waagschale"
              className="absolute rounded-t-[40px] rounded-b-xl flex flex-wrap items-center justify-center gap-1 p-2 active:scale-95 transition-transform"
              style={{
                left: 200,
                top: 46,
                width: 100,
                height: 64,
                background: balanced
                  ? 'radial-gradient(circle at 50% 30%, #bbf7d0 0%, #86efac 100%)'
                  : selectedId
                  ? 'radial-gradient(circle at 50% 30%, #fef3c7 0%, #fcd34d 100%)'
                  : 'radial-gradient(circle at 50% 30%, #fef3c7 0%, #fde68a 100%)',
                border: '2.5px solid #92400e',
                boxShadow: balanced
                  ? '0 0 0 4px rgba(34,197,94,0.35)'
                  : '0 4px 10px rgba(120,53,15,0.22)',
                cursor: 'pointer',
              }}
            >
              {rightFixed.map((w, i) => (
                <span
                  key={`rf-${i}`}
                  className="inline-flex items-center justify-center rounded-full font-headline font-bold select-none"
                  style={{
                    width: 28,
                    height: 28,
                    fontSize: 14,
                    background:
                      'radial-gradient(circle at 30% 30%, #fca5a5, #b91c1c)',
                    color: 'white',
                    border: '1.5px solid #7f1d1d',
                    textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                    fontFamily: 'Fredoka, sans-serif',
                    opacity: 0.9,
                  }}
                  aria-label={`Fest: ${w}`}
                >
                  {w}
                </span>
              ))}
              {rightItems.map((m) => (
                <span
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    tapPlacedMushroom(m.id);
                  }}
                  className="inline-flex items-center justify-center rounded-full font-headline font-bold select-none cursor-pointer"
                  style={{
                    width: 30,
                    height: 30,
                    fontSize: 15,
                    background:
                      'radial-gradient(circle at 30% 30%, #fed7aa, #c2410c)',
                    color: 'white',
                    border: '1.5px solid #7c2d12',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    fontFamily: 'Fredoka, sans-serif',
                  }}
                  aria-label={`Pilz ${m.w} (antippen zum Zurücklegen)`}
                >
                  {m.w}
                </span>
              ))}
            </button>
          </div>
        </div>

        {/* Sum readout */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <div
            className="px-3 py-1.5 rounded-full text-center"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1.5px solid rgba(120,53,15,0.25)',
              minWidth: 70,
            }}
          >
            <span
              className="font-headline font-bold text-lg"
              style={{ color: '#7c2d12', fontFamily: 'Fredoka, sans-serif' }}
            >
              {leftSum}
            </span>
          </div>
          <span
            className="font-headline font-bold text-xl"
            style={{
              color: balanced ? '#15803d' : '#7c2d12',
              fontFamily: 'Fredoka, sans-serif',
            }}
          >
            {balanced ? '=' : leftSum === rightSum ? '=' : leftSum > rightSum ? '>' : '<'}
          </span>
          <div
            className="px-3 py-1.5 rounded-full text-center"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1.5px solid rgba(120,53,15,0.25)',
              minWidth: 70,
            }}
          >
            <span
              className="font-headline font-bold text-lg"
              style={{ color: '#7c2d12', fontFamily: 'Fredoka, sans-serif' }}
            >
              {rightSum}
            </span>
          </div>
        </div>

        {/* Tray */}
        <div className="mt-4 w-full max-w-sm">
          <div
            className="flex items-center justify-between px-2 mb-1.5"
          >
            <p
              className="font-label font-bold text-[11px] uppercase tracking-[0.2em]"
              style={{ color: '#92400e' }}
            >
              Dein Pilzkorb
            </p>
            <button
              onClick={resetLevel}
              className="font-label text-[11px] font-bold px-3 py-1 rounded-full active:scale-95 transition-transform"
              style={{
                color: '#7c2d12',
                background: 'rgba(180,83,9,0.12)',
              }}
            >
              Zurück
            </button>
          </div>
          <div
            className="rounded-2xl p-3 flex flex-wrap items-center justify-center gap-2 min-h-[64px]"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(180,83,9,0.25)',
            }}
          >
            {trayItems.length === 0 && (
              <p
                className="font-body text-xs italic"
                style={{ color: '#92400e' }}
              >
                {balanced ? 'Perfekt im Gleichgewicht.' : 'Alle Pilze liegen. Hmm, schon gleich?'}
              </p>
            )}
            {trayItems.map((m) => {
              const selected = m.id === selectedId;
              return (
                <button
                  key={m.id}
                  onClick={() => tapTrayMushroom(m.id)}
                  aria-label={`Pilz mit Gewicht ${m.w}${selected ? ' (gewählt)' : ''}`}
                  className="inline-flex items-center justify-center rounded-full font-headline font-bold select-none active:scale-95 transition-transform"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 20,
                    background:
                      'radial-gradient(circle at 30% 30%, #fed7aa, #c2410c)',
                    color: 'white',
                    border: selected
                      ? '3px solid #f59e0b'
                      : '2px solid #7c2d12',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    fontFamily: 'Fredoka, sans-serif',
                    boxShadow: selected
                      ? '0 0 0 4px rgba(245,158,11,0.35), 0 6px 14px rgba(120,53,15,0.3)'
                      : '0 3px 8px rgba(120,53,15,0.22)',
                    transform: selected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 180ms, box-shadow 180ms',
                  }}
                >
                  {m.w}
                </button>
              );
            })}
          </div>
          <p
            className="font-body text-[11px] text-center mt-2"
            style={{ color: '#92400e' }}
          >
            {selectedId
              ? 'Tippe auf eine Waagschale.'
              : 'Tippe einen Pilz aus dem Korb.'}
          </p>
        </div>
      </div>

      {/* Pilzhüter host sprite */}
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
          key={wobble}
          src={base + PILZHUETER_SPRITE}
          alt="Pilzhüter"
          className="w-full h-full object-contain drop-shadow-lg select-none"
          style={{ animation: 'pwNudge 0.5s ease-out' }}
          draggable={false}
        />
      </div>

      {/* Level-done overlay */}
      {phase === 'levelDone' && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{
            background: 'rgba(124,45,18,0.55)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1.5px solid rgba(180,83,9,0.25)',
            }}
          >
            <p className="text-6xl mb-2">⚖️</p>
            <h2
              className="font-headline font-bold text-2xl mb-1"
              style={{ color: '#7c2d12', fontFamily: 'Fredoka, sans-serif' }}
            >
              Gleich!
            </h2>
            <p className="font-body text-sm mb-1" style={{ color: '#92400e' }}>
              Stufe {currentLevel} geschafft.
            </p>
            <p className="font-body text-xs mb-6" style={{ color: '#92400e' }}>
              Pilzhüter nickt zufrieden.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={nextLevel}
                className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #c2410c, #7c2d12)',
                  color: 'white',
                  boxShadow: '0 8px 22px rgba(124,45,18,0.4)',
                }}
              >
                Weiter
              </button>
              <button
                onClick={() => setPhase('gameDone')}
                className="w-full py-3 rounded-full font-label font-bold text-sm min-h-[44px] active:scale-95 transition-transform"
                style={{
                  background: 'transparent',
                  color: '#7c2d12',
                  border: '1.5px solid rgba(180,83,9,0.3)',
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
              'linear-gradient(135deg, rgba(254,243,199,0.95), rgba(253,230,138,0.95))',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-7 text-center"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1.5px solid rgba(180,83,9,0.3)',
            }}
          >
            <div className="text-7xl mb-2">🏆</div>
            <p
              className="font-label font-bold text-xs uppercase tracking-[0.22em] mb-1"
              style={{ color: '#7c2d12' }}
            >
              Neuer Titel
            </p>
            <h2
              className="font-headline font-bold text-3xl mb-2"
              style={{ color: '#7c2d12', fontFamily: 'Fredoka, sans-serif' }}
            >
              Waagen-Weise!
            </h2>
            <p className="font-body text-base mb-5" style={{ color: '#92400e' }}>
              Pilzhüter zeigt ein breites Lächeln.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(252,211,77,0.25)', color: '#92620a' }}
            >
              <span className="text-lg">💛</span>
              <span className="font-label font-bold text-sm">+50 Sterne für Ronki</span>
            </div>
            <button
              onClick={() => onComplete?.({ hp: 50 })}
              className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #c2410c, #7c2d12)',
                color: 'white',
                boxShadow: '0 8px 22px rgba(124,45,18,0.4)',
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pwNudge {
          0%   { transform: translateY(0) rotate(0deg); }
          40%  { transform: translateY(-3px) rotate(-3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
