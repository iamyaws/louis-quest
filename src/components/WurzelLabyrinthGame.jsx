import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SFX from '../utils/sfx';
import { useTask } from '../context/TaskContext';
import { getCreatureSpritePath } from '../data/creatures';

/**
 * WurzelLabyrinthGame — tile-maze navigation MINT game hosted by Pilz-Jeti (forest_6).
 *
 * Mechanic (per Wave 2.6 spec):
 *   - Grid-based hand-authored mazes, increasing size per level (6x6 → 8x8).
 *   - Louis moves a leaf from Start (S) to Goal (G).
 *   - Tap an adjacent floor cell to move there, or swipe on the grid.
 *   - Walls block movement; a wrong tap triggers a gentle shake.
 *   - Reaching the goal completes the level; 5 levels total.
 *
 * Badge: first level-1 completion grants badge_mint_labyrinth.
 * Reward: +50 HP on Level 5 completion → onComplete({ hp: 50 }).
 */

const PILZ_JETI_SPRITE = getCreatureSpritePath({
  art: 'art/micropedia/creatures/pilz-jeti.webp',
});
const base =
  typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

// Hand-authored mazes. S = start, G = goal, . = floor, X = wall.
// Each string is one row; rows must be the same length per level.
const MAZES = [
  // Level 1 — 6x6 — gentle snake path
  [
    'S.....',
    'XXXX..',
    '.....X',
    '.XXXX.',
    '.....X',
    'XXXX.G',
  ],
  // Level 2 — 7x7 — a soft zigzag with an extra corridor
  [
    'S......',
    'XXXXX..',
    '..X.X..',
    '....X..',
    'X.XXX..',
    'X......',
    'XXXXXXG',
  ],
  // Level 3 — 8x8 — an S-curve serpentine with a small stub corridor
  [
    'S.......',
    'XXXXXX..',
    '........',
    '.XXXX.X.',
    '......X.',
    '.XXXXXX.',
    '........',
    'XXXXXX.G',
  ],
  // Level 4 — 8x8 — a deeper serpentine with a single dead-end interior cell
  [
    'S.......',
    '.XXXXX..',
    '.X....X.',
    '.X.XX.X.',
    '.X....X.',
    '.XXXXXX.',
    '.......X',
    'XXXXXX.G',
  ],
  // Level 5 — 8x8 — crisscross, still solvable but needs a look
  [
    'S...XX..',
    'XXX....X',
    '...XXX.X',
    '.X.....X',
    '.X.XXX.X',
    '.X.X...X',
    '.X...XXX',
    '.XXX...G',
  ],
];

// Level labels for the HUD
const LEVEL_LABELS = [
  'Stufe 1: Erste Pfade',
  'Stufe 2: Durch die Wurzeln',
  'Stufe 3: Tiefer hinein',
  'Stufe 4: Versteckter Weg',
  'Stufe 5: Pilz-Jetis Labyrinth',
];

// Parse a maze definition into { rows, cols, grid, start, goal }
function parseMaze(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const grid = rows.map((row) => row.split(''));
  let start = { r: 0, c: 0 };
  let goal = { r: 0, c: 0 };
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (grid[r][c] === 'S') start = { r, c };
      else if (grid[r][c] === 'G') goal = { r, c };
    }
  }
  return { rows: h, cols: w, grid, start, goal };
}

function isWalkable(grid, r, c, rows, cols) {
  if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
  return grid[r][c] !== 'X';
}

export default function WurzelLabyrinthGame({ onComplete }) {
  const { actions } = useTask();
  const badgeClaimedRef = useRef(false);
  const touchStartRef = useRef(null);
  const shakeTimerRef = useRef(null);

  const [levelIdx, setLevelIdx] = useState(0);
  const [pos, setPos] = useState(() => parseMaze(MAZES[0]).start);
  const [phase, setPhase] = useState('playing'); // playing | levelDone | gameDone
  const [shakeCell, setShakeCell] = useState(null); // { r, c, ts }
  const [moves, setMoves] = useState(0);
  const [jetiWatch, setJetiWatch] = useState(0);

  const maze = useMemo(() => parseMaze(MAZES[levelIdx]), [levelIdx]);
  const { rows, cols, grid, start, goal } = maze;

  // Reset position on level change
  useEffect(() => {
    setPos(start);
    setMoves(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIdx]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const claimBadgeOnce = useCallback(() => {
    if (badgeClaimedRef.current) return;
    badgeClaimedRef.current = true;
    try {
      actions.claimMintBadge('badge_mint_labyrinth', 'wurzel-labyrinth');
    } catch {
      // idempotent, silent
    }
  }, [actions]);

  const triggerShake = useCallback((r, c) => {
    setShakeCell({ r, c, ts: Date.now() });
    SFX.play('crash');
    if (navigator.vibrate) navigator.vibrate(40);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => setShakeCell(null), 350);
  }, []);

  const tryMove = useCallback(
    (nr, nc) => {
      if (phase !== 'playing') return;
      // must be adjacent (Manhattan distance of 1)
      const dr = Math.abs(nr - pos.r);
      const dc = Math.abs(nc - pos.c);
      if (dr + dc !== 1) {
        triggerShake(nr, nc);
        return;
      }
      if (!isWalkable(grid, nr, nc, rows, cols)) {
        triggerShake(nr, nc);
        return;
      }
      // valid move
      setPos({ r: nr, c: nc });
      setMoves((m) => m + 1);
      setJetiWatch((n) => n + 1);
      SFX.play('pop');
      if (navigator.vibrate) navigator.vibrate(15);

      // reached goal?
      if (nr === goal.r && nc === goal.c) {
        SFX.play('celeb');
        if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
        claimBadgeOnce();
        if (levelIdx >= MAZES.length - 1) {
          setPhase('gameDone');
        } else {
          setPhase('levelDone');
        }
      }
    },
    [phase, pos, grid, rows, cols, goal, levelIdx, claimBadgeOnce, triggerShake]
  );

  const handleCellTap = useCallback(
    (r, c) => {
      tryMove(r, c);
    },
    [tryMove]
  );

  // Swipe handling on the grid container
  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const MIN_SWIPE = 28;
      if (Math.max(absX, absY) < MIN_SWIPE) return; // too small, treat as tap (cell handler already fired)
      let nr = pos.r;
      let nc = pos.c;
      if (absX > absY) {
        nc = pos.c + (dx > 0 ? 1 : -1);
      } else {
        nr = pos.r + (dy > 0 ? 1 : -1);
      }
      tryMove(nr, nc);
    },
    [pos, tryMove]
  );

  const nextLevel = useCallback(() => {
    if (levelIdx >= MAZES.length - 1) {
      setPhase('gameDone');
      return;
    }
    setLevelIdx(levelIdx + 1);
    setPhase('playing');
  }, [levelIdx]);

  const currentLevel = levelIdx + 1;

  // Compute shake cell key for comparison (unique per shake)
  const shakeKey = shakeCell ? `${shakeCell.r}-${shakeCell.c}-${shakeCell.ts}` : null;

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 60%, #a7f3d0 100%)',
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3"
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1.5px solid rgba(5,150,105,0.18)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl" aria-hidden="true">🗺️</span>
          <div className="min-w-0">
            <h1
              className="font-headline font-bold text-lg leading-none truncate"
              style={{ color: '#047857', fontFamily: 'Fredoka, sans-serif' }}
            >
              Wurzel-Labyrinth
            </h1>
            <p className="font-label text-[11px] leading-tight" style={{ color: '#059669' }}>
              {LEVEL_LABELS[levelIdx]}
            </p>
          </div>
        </div>
        <button
          onClick={() => onComplete?.({ hp: 0 })}
          className="px-4 py-2 rounded-full font-label font-bold text-sm min-h-[40px] active:scale-95 transition-transform"
          style={{ background: 'rgba(5,150,105,0.15)', color: '#065f46' }}
        >
          Beenden
        </button>
      </header>

      {/* HUD */}
      <div
        className="fixed z-[401] left-0 right-0 px-4 flex flex-col items-center gap-2"
        style={{ top: 'calc(4.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <div
          className="px-6 py-2.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            boxShadow: '0 6px 18px rgba(5,150,105,0.35)',
          }}
        >
          <p
            className="font-headline font-bold text-white text-base text-center"
            style={{ fontFamily: 'Fredoka, sans-serif', letterSpacing: 0.3 }}
          >
            Finde den Weg zu Pilz-Jeti!
          </p>
        </div>
        <div
          className="flex items-center gap-4 px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1.5px solid rgba(5,150,105,0.25)',
          }}
        >
          <div className="flex items-center gap-1">
            <span
              className="font-label text-[11px] font-bold uppercase tracking-wider"
              style={{ color: '#059669' }}
            >
              Stufe
            </span>
            <span
              className="font-headline font-bold text-base"
              style={{ color: '#047857' }}
            >
              {currentLevel}/{MAZES.length}
            </span>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(5,150,105,0.25)' }} />
          <div className="flex items-center gap-1">
            <span className="text-base leading-none">👣</span>
            <span
              className="font-headline font-bold text-base"
              style={{ color: '#047857' }}
            >
              {moves}
            </span>
          </div>
        </div>
      </div>

      {/* Maze grid area */}
      <div
        className="flex-1 flex items-center justify-center px-4"
        style={{
          marginTop: 'calc(9rem + env(safe-area-inset-top, 0px))',
          marginBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="grid w-full rounded-2xl"
          style={{
            maxWidth: 360,
            aspectRatio: `${cols} / ${rows}`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: 4,
            padding: 10,
            background: 'rgba(255,255,255,0.7)',
            border: '2px solid rgba(5,150,105,0.25)',
            boxShadow: '0 6px 20px rgba(5,150,105,0.15)',
            touchAction: 'none',
          }}
        >
          {grid.map((row, r) =>
            row.map((ch, c) => {
              const isWall = ch === 'X';
              const isStart = r === start.r && c === start.c;
              const isGoal = r === goal.r && c === goal.c;
              const isHere = r === pos.r && c === pos.c;
              const isShaking =
                shakeCell && shakeCell.r === r && shakeCell.c === c;
              const disabled = isWall || phase !== 'playing';
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => !isWall && handleCellTap(r, c)}
                  disabled={disabled}
                  aria-label={
                    isWall
                      ? 'Wurzel'
                      : isGoal
                      ? 'Ziel'
                      : isStart
                      ? 'Start'
                      : 'Boden'
                  }
                  className="relative rounded-lg flex items-center justify-center"
                  style={{
                    background: isWall
                      ? 'linear-gradient(135deg, #78350f, #92400e)'
                      : isGoal
                      ? 'radial-gradient(circle at 50% 45%, #fde68a 0%, #fcd34d 70%)'
                      : isStart
                      ? 'radial-gradient(circle at 50% 45%, #bbf7d0 0%, #86efac 70%)'
                      : '#fff8f1',
                    border: isWall
                      ? '1.5px solid #451a03'
                      : '1.5px solid rgba(5,150,105,0.18)',
                    boxShadow: isHere
                      ? '0 0 0 3px rgba(34,197,94,0.45), 0 4px 12px rgba(34,197,94,0.35)'
                      : isGoal
                      ? '0 0 0 3px rgba(252,211,77,0.45), 0 4px 10px rgba(252,211,77,0.3)'
                      : 'none',
                    cursor: disabled ? 'default' : 'pointer',
                    animation: isShaking ? 'wlShake 0.35s ease-in-out' : 'none',
                    transition: 'box-shadow 200ms ease-out',
                  }}
                >
                  {/* Start marker */}
                  {isStart && !isHere && (
                    <span
                      className="font-headline font-bold text-sm"
                      style={{ color: '#047857' }}
                      aria-hidden="true"
                    >
                      S
                    </span>
                  )}
                  {/* Goal marker — small pilz emoji */}
                  {isGoal && (
                    <span
                      className="select-none leading-none"
                      style={{ fontSize: 22 }}
                      aria-hidden="true"
                    >
                      🍄
                    </span>
                  )}
                  {/* Player marker on top */}
                  {isHere && (
                    <span
                      key={`${pos.r}-${pos.c}-${moves}`}
                      className="select-none leading-none absolute"
                      style={{
                        fontSize: 26,
                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
                        animation: 'wlBounce 0.2s ease-out',
                      }}
                      aria-hidden="true"
                    >
                      🌿
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Pilz-Jeti host — bottom right, watching */}
      <div
        className="fixed z-[401] pointer-events-none"
        style={{
          right: 8,
          bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          width: 104,
          height: 104,
        }}
      >
        <img
          key={jetiWatch}
          src={base + PILZ_JETI_SPRITE}
          alt="Pilz-Jeti"
          className="w-full h-full object-contain drop-shadow-lg select-none"
          style={{ animation: 'wlJetiNudge 0.5s ease-out' }}
          draggable={false}
        />
      </div>

      {/* Level-done overlay */}
      {phase === 'levelDone' && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{
            background: 'rgba(5,150,105,0.55)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1.5px solid rgba(5,150,105,0.25)',
            }}
          >
            <p className="text-6xl mb-2">🍄</p>
            <h2
              className="font-headline font-bold text-2xl mb-1"
              style={{ color: '#047857', fontFamily: 'Fredoka, sans-serif' }}
            >
              Stufe {currentLevel} geschafft!
            </h2>
            <p className="font-body text-sm mb-6" style={{ color: '#059669' }}>
              Pilz-Jeti freut sich. Magst du weiter?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={nextLevel}
                className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  boxShadow: '0 8px 22px rgba(5,150,105,0.4)',
                }}
              >
                Weiter
              </button>
              <button
                onClick={() => setPhase('gameDone')}
                className="w-full py-3 rounded-full font-label font-bold text-sm min-h-[44px] active:scale-95 transition-transform"
                style={{
                  background: 'transparent',
                  color: '#065f46',
                  border: '1.5px solid rgba(5,150,105,0.3)',
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
              'linear-gradient(135deg, rgba(167,243,208,0.95), rgba(110,231,183,0.95))',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-7 text-center"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1.5px solid rgba(5,150,105,0.3)',
            }}
          >
            <div className="text-7xl mb-2">🏆</div>
            <p
              className="font-label font-bold text-xs uppercase tracking-[0.22em] mb-1"
              style={{ color: '#047857' }}
            >
              Neuer Titel
            </p>
            <h2
              className="font-headline font-bold text-3xl mb-2"
              style={{ color: '#047857', fontFamily: 'Fredoka, sans-serif' }}
            >
              Labyrinth-Löser!
            </h2>
            <p className="font-body text-base mb-5" style={{ color: '#059669' }}>
              Pilz-Jeti zeigt dir ein glückliches Lächeln.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(252,211,77,0.2)', color: '#92620a' }}
            >
              <span className="text-lg">💛</span>
              <span className="font-label font-bold text-sm">+50 HP für Ronki</span>
            </div>
            <button
              onClick={() => onComplete?.({ hp: 50 })}
              className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                boxShadow: '0 8px 22px rgba(5,150,105,0.4)',
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wlShake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-4px); }
          40%      { transform: translateX(4px); }
          60%      { transform: translateX(-3px); }
          80%      { transform: translateX(3px); }
        }
        @keyframes wlBounce {
          0%   { transform: scale(0.8); }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes wlJetiNudge {
          0%   { transform: translateY(0) rotate(0deg); }
          40%  { transform: translateY(-4px) rotate(-3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
