import React, { useState, useEffect, useRef, useCallback } from 'react';
import SFX from '../utils/sfx';
import { useTask } from '../context/TaskContext';
import { getCreatureSpritePath } from '../data/creatures';

/**
 * ZahlenjagdGame — falling-numbers MINT game hosted by Sturmflügel (sky_0).
 *
 * Mechanic (per Wave 2.5 spec):
 *   - Numbers fall from the top of a canvas.
 *   - A target is announced ("Fang die 7!").
 *   - Louis taps the matching number before it reaches the bottom.
 *   - Wrong tap costs a life; a miss is free (number just disappears).
 *   - 5 correct catches per level. 3 lives. Lose all lives → level restart.
 *
 * Levels:
 *   1) Single digits 1-9  ("Fang die 7")
 *   2) Teens 10-20        ("Fang die 14")
 *   3) Addition            ("Fang: 3 + 4")
 *   4) Subtraction         ("Fang: 10 - 3")
 *   5) Bonus mix + faster falls
 *
 * Badge: first full-level-1 completion grants badge_mint_zahlen via claimMintBadge.
 * Reward: on full run (or first level-1 win) → +50 HP via onComplete({ hp: 50 }).
 */

const STURMFLUEGEL_SPRITE = getCreatureSpritePath({
  art: 'art/micropedia/creatures/creature-8.webp',
});
const base =
  typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';

const CATCHES_PER_LEVEL = 5;
const START_LIVES = 3;
const CATCH_RADIUS = 42;       // generous for 6-year-old taps
const SPAWN_INTERVAL_MS = 850; // default; bonus level slightly faster
const FALL_SPEED = [0.9, 1.7]; // px/frame, slowed for kid pacing

const LEVEL_PROMPTS = {
  1: 'Stufe 1: Einzelne Zahlen',
  2: 'Stufe 2: Zwei Ziffern',
  3: 'Stufe 3: Plus-Aufgabe',
  4: 'Stufe 4: Minus-Aufgabe',
  5: 'Stufe 5: Bonusrunde',
};

// Pick a fresh target for the given level. Returns { answer, label }.
function pickTarget(level) {
  if (level === 1) {
    const n = 1 + Math.floor(Math.random() * 9); // 1..9
    return { answer: n, label: `Fang die ${n}!` };
  }
  if (level === 2) {
    const n = 10 + Math.floor(Math.random() * 11); // 10..20
    return { answer: n, label: `Fang die ${n}!` };
  }
  if (level === 3) {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * (15 - a));
    return { answer: a + b, label: `Fang: ${a} + ${b}` };
  }
  if (level === 4) {
    const a = 5 + Math.floor(Math.random() * 11); // 5..15
    const b = 1 + Math.floor(Math.random() * (a - 1));
    return { answer: a - b, label: `Fang: ${a} - ${b}` };
  }
  // level 5 — mix add + subtract
  const op = Math.random() < 0.5 ? '+' : '-';
  if (op === '+') {
    const a = 1 + Math.floor(Math.random() * 9);
    const b = 1 + Math.floor(Math.random() * (15 - a));
    return { answer: a + b, label: `Fang: ${a} + ${b}` };
  }
  const a = 5 + Math.floor(Math.random() * 11);
  const b = 1 + Math.floor(Math.random() * (a - 1));
  return { answer: a - b, label: `Fang: ${a} - ${b}` };
}

// Pool of numbers that may fall on a given level.
function fallPool(level) {
  if (level === 1) return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (level === 2) return [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  // levels 3-5: small answers 1..15
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
}

export default function ZahlenjagdGame({ onComplete }) {
  const { actions } = useTask();
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const animRef = useRef(null);
  const spawnRef = useRef(null);
  const badgeClaimedRef = useRef(false);

  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState('playing'); // playing | levelDone | gameDone
  const [lives, setLives] = useState(START_LIVES);
  const [catches, setCatches] = useState(0);
  const [target, setTarget] = useState(() => pickTarget(1));
  const [effects, setEffects] = useState([]); // { id, x, y, kind, ts }
  const [wingFlap, setWingFlap] = useState(0);

  // Canvas sizing
  const sizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
  }, []);

  const getCanvasSize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return { w: 320, h: 480 };
    const rect = c.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }, []);

  const initGame = useCallback(() => {
    gameRef.current = {
      numbers: [], // { id, value, x, y, size, speed }
      frame: 0,
    };
  }, []);

  useEffect(() => {
    sizeCanvas();
    initGame();
    window.addEventListener('resize', sizeCanvas);
    return () => window.removeEventListener('resize', sizeCanvas);
  }, [sizeCanvas, initGame]);

  // Spawn falling numbers
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = level === 5 ? 650 : SPAWN_INTERVAL_MS;
    const speedMod = level === 5 ? 1.35 : 1.0;
    spawnRef.current = setInterval(() => {
      const g = gameRef.current;
      if (!g) return;
      const { w } = getCanvasSize();
      const pool = fallPool(level);
      // Bias ~35% of spawns to the current answer so it shows up often enough.
      const value = Math.random() < 0.35
        ? target.answer
        : pool[Math.floor(Math.random() * pool.length)];
      const size = value >= 10 ? 56 : 48;
      const [minS, maxS] = FALL_SPEED;
      g.numbers.push({
        id: Date.now() + Math.random(),
        value,
        x: size / 2 + 10 + Math.random() * Math.max(1, w - size - 20),
        y: -size,
        size,
        speed: (minS + Math.random() * (maxS - minS)) * speedMod,
      });
    }, interval);
    return () => clearInterval(spawnRef.current);
  }, [phase, level, target, getCanvasSize]);

  // Draw
  const draw = useCallback(() => {
    const c = canvasRef.current;
    const g = gameRef.current;
    if (!c || !g) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = getCanvasSize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Soft sky gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.55, '#bae6fd');
    grad.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Fluffy cloud wisps
    g.frame++;
    for (let i = 0; i < 5; i++) {
      const t = (g.frame * 0.15 + i * 100) % (w + 200);
      const cx = ((w + 200) - t) - 100;
      const cy = 40 + ((i * 60) % Math.max(1, h - 80));
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Falling number bubbles
    for (const n of g.numbers) {
      // shadow
      ctx.fillStyle = 'rgba(14,165,233,0.18)';
      ctx.beginPath();
      ctx.arc(n.x, n.y + 3, n.size / 2, 0, Math.PI * 2);
      ctx.fill();
      // bubble
      const bg = ctx.createRadialGradient(
        n.x - n.size * 0.2, n.y - n.size * 0.2, 2,
        n.x, n.y, n.size / 2
      );
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = bg;
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // number label
      ctx.fillStyle = '#075985';
      ctx.font = `bold ${Math.round(n.size * 0.52)}px Fredoka, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n.value), n.x, n.y + 1);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [getCanvasSize]);

  // Game loop
  const tick = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const { h } = getCanvasSize();
    for (const n of g.numbers) {
      n.y += n.speed;
    }
    g.numbers = g.numbers.filter((n) => n.y < h + n.size);
    draw();
    animRef.current = requestAnimationFrame(tick);
  }, [draw, getCanvasSize]);

  useEffect(() => {
    if (phase !== 'playing') {
      cancelAnimationFrame(animRef.current);
      return;
    }
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, tick]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(spawnRef.current);
    };
  }, []);

  // Claim badge on first-ever level-1 completion (idempotent — handled by action)
  const claimBadgeOnce = useCallback(() => {
    if (badgeClaimedRef.current) return;
    badgeClaimedRef.current = true;
    try {
      actions.claimMintBadge('badge_mint_zahlen', 'zahlenjagd');
    } catch {
      // silent — action is idempotent and optional
    }
  }, [actions]);

  // Finish level: show overlay with Weiter / Fertig
  const finishLevel = useCallback((wonAll) => {
    clearInterval(spawnRef.current);
    cancelAnimationFrame(animRef.current);
    SFX.play('celeb');
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
    // Always attempt to claim after a clean level
    claimBadgeOnce();
    if (wonAll) {
      setPhase('gameDone');
    } else {
      setPhase('levelDone');
    }
  }, [claimBadgeOnce]);

  // Advance to next level (level 5 → gameDone)
  const nextLevel = useCallback(() => {
    if (level >= 5) {
      setPhase('gameDone');
      return;
    }
    const newLevel = level + 1;
    setLevel(newLevel);
    setLives(START_LIVES);
    setCatches(0);
    setTarget(pickTarget(newLevel));
    initGame();
    setPhase('playing');
  }, [level, initGame]);

  // Restart current level (lost all lives)
  const restartLevel = useCallback(() => {
    setLives(START_LIVES);
    setCatches(0);
    setTarget(pickTarget(level));
    initGame();
    // phase already 'playing'
  }, [level, initGame]);

  // Handle tap on canvas: find nearest number within CATCH_RADIUS
  const handleTap = useCallback((e) => {
    if (phase !== 'playing') return;
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    let clientX, clientY;
    if (e.type === 'touchstart') {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const tapX = clientX - rect.left;
    const tapY = clientY - rect.top;

    const g = gameRef.current;
    if (!g) return;

    let hit = null;
    let closest = Infinity;
    for (const n of g.numbers) {
      const dx = tapX - n.x;
      const dy = tapY - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CATCH_RADIUS + n.size / 2 && dist < closest) {
        closest = dist;
        hit = n;
      }
    }

    if (!hit) return; // tap on empty space — no penalty

    // Correct?
    if (hit.value === target.answer) {
      g.numbers = g.numbers.filter((n) => n.id !== hit.id);
      const newCatches = catches + 1;
      setCatches(newCatches);
      setEffects((prev) => [
        ...prev,
        { id: hit.id, x: hit.x, y: hit.y, kind: 'good', ts: Date.now() },
      ]);
      SFX.play('coin');
      if (navigator.vibrate) navigator.vibrate(30);
      setWingFlap((n) => n + 1);
      if (newCatches >= CATCHES_PER_LEVEL) {
        finishLevel(level >= 5);
      } else {
        setTarget(pickTarget(level));
      }
    } else {
      // wrong
      g.numbers = g.numbers.filter((n) => n.id !== hit.id);
      setEffects((prev) => [
        ...prev,
        { id: hit.id, x: hit.x, y: hit.y, kind: 'bad', ts: Date.now() },
      ]);
      SFX.play('crash');
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        // restart the level
        setTimeout(() => restartLevel(), 600);
      }
    }
  }, [phase, target, catches, lives, level, finishLevel, restartLevel]);

  // Clean up effects
  useEffect(() => {
    if (!effects.length) return;
    const timer = setTimeout(() => {
      setEffects((prev) => prev.filter((e) => Date.now() - e.ts < 700));
    }, 750);
    return () => clearTimeout(timer);
  }, [effects]);

  const livesDisplay = '❤'.repeat(lives) + '♡'.repeat(Math.max(0, START_LIVES - lives));

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col overflow-hidden"
      style={{ background: '#e0f2fe' }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3"
        style={{
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1.5px solid rgba(14,165,233,0.18)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl" aria-hidden="true">🎯</span>
          <div className="min-w-0">
            <h1
              className="font-headline font-bold text-lg leading-none truncate"
              style={{ color: '#0369a1', fontFamily: 'Fredoka, sans-serif' }}
            >
              Zahlenjagd
            </h1>
            <p className="font-label text-[11px] leading-tight" style={{ color: '#0284c7' }}>
              {LEVEL_PROMPTS[level]}
            </p>
          </div>
        </div>
        <button
          onClick={() => onComplete?.({ hp: 0 })}
          className="px-4 py-2 rounded-full font-label font-bold text-sm min-h-[40px] active:scale-95 transition-transform"
          style={{ background: 'rgba(14,165,233,0.15)', color: '#075985' }}
        >
          Beenden
        </button>
      </header>

      {/* HUD: target + lives + catches */}
      <div
        className="fixed z-[401] left-0 right-0 px-4 flex flex-col items-center gap-2"
        style={{ top: 'calc(4.25rem + env(safe-area-inset-top, 0px))' }}
      >
        <div
          className="px-6 py-2.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            boxShadow: '0 6px 18px rgba(14,165,233,0.35)',
          }}
        >
          <p
            className="font-headline font-bold text-white text-xl text-center"
            style={{ fontFamily: 'Fredoka, sans-serif', letterSpacing: 0.3 }}
          >
            {target.label}
          </p>
        </div>
        <div
          className="flex items-center gap-4 px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1.5px solid rgba(14,165,233,0.25)',
          }}
        >
          <div className="flex items-center gap-1">
            <span className="font-label text-[11px] font-bold uppercase tracking-wider" style={{ color: '#0284c7' }}>
              Stufe
            </span>
            <span className="font-headline font-bold text-base" style={{ color: '#0369a1' }}>
              {level}/5
            </span>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(14,165,233,0.25)' }} />
          <div className="flex items-center gap-1">
            <span className="text-base leading-none">{livesDisplay}</span>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(14,165,233,0.25)' }} />
          <div className="flex items-center gap-1">
            <span className="text-base leading-none">🎯</span>
            <span className="font-headline font-bold text-base" style={{ color: '#0369a1' }}>
              {catches}/{CATCHES_PER_LEVEL}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full flex-1"
        style={{
          marginTop: 'calc(9.25rem + env(safe-area-inset-top, 0px))',
          marginBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
          touchAction: 'none',
        }}
        onTouchStart={handleTap}
        onClick={handleTap}
      />

      {/* Sturmflügel companion sprite — bottom-right, watching */}
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
          key={wingFlap}
          src={base + STURMFLUEGEL_SPRITE}
          alt="Sturmflügel"
          className="w-full h-full object-contain drop-shadow-lg select-none"
          style={{ animation: 'zjFlap 0.5s ease-out' }}
          draggable={false}
        />
      </div>

      {/* Catch/miss effects */}
      {effects.map((fx) => (
        <div
          key={fx.id}
          className="fixed z-[402] pointer-events-none"
          style={{
            left: fx.x - 28,
            top:
              fx.y +
              (canvasRef.current
                ? canvasRef.current.getBoundingClientRect().top
                : 0) -
              6,
            animation: 'zjFloat 0.7s ease-out forwards',
          }}
        >
          <span
            className="font-headline font-bold text-3xl"
            style={{
              color: fx.kind === 'good' ? '#16a34a' : '#dc2626',
              textShadow:
                fx.kind === 'good'
                  ? '0 0 10px rgba(34,197,94,0.6)'
                  : '0 0 10px rgba(239,68,68,0.6)',
            }}
          >
            {fx.kind === 'good' ? '✨ +1' : '✕'}
          </span>
        </div>
      ))}

      {/* Level-done overlay */}
      {phase === 'levelDone' && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{ background: 'rgba(2,132,199,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1.5px solid rgba(14,165,233,0.25)',
            }}
          >
            <p className="text-6xl mb-2">🌟</p>
            <h2
              className="font-headline font-bold text-2xl mb-1"
              style={{ color: '#0369a1', fontFamily: 'Fredoka, sans-serif' }}
            >
              Stufe {level} geschafft!
            </h2>
            <p className="font-body text-sm mb-6" style={{ color: '#0284c7' }}>
              Sturmflügel ist stolz. Magst du weiter?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={nextLevel}
                className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: 'white',
                  boxShadow: '0 8px 22px rgba(14,165,233,0.4)',
                }}
              >
                Weiter
              </button>
              <button
                onClick={() => setPhase('gameDone')}
                className="w-full py-3 rounded-full font-label font-bold text-sm min-h-[44px] active:scale-95 transition-transform"
                style={{
                  background: 'transparent',
                  color: '#075985',
                  border: '1.5px solid rgba(14,165,233,0.3)',
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
            background: 'linear-gradient(135deg, rgba(186,230,253,0.95), rgba(125,211,252,0.95))',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-7 text-center"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1.5px solid rgba(14,165,233,0.3)',
            }}
          >
            <div className="text-7xl mb-2">🏆</div>
            <p
              className="font-label font-bold text-xs uppercase tracking-[0.22em] mb-1"
              style={{ color: '#0369a1' }}
            >
              Neuer Titel
            </p>
            <h2
              className="font-headline font-bold text-3xl mb-2"
              style={{ color: '#0369a1', fontFamily: 'Fredoka, sans-serif' }}
            >
              Zahlenjäger!
            </h2>
            <p className="font-body text-base mb-5" style={{ color: '#0284c7' }}>
              Du hast Sturmflügels Sterne gezählt.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(252,211,77,0.2)', color: '#92620a' }}
            >
              <span className="text-lg">💛</span>
              <span className="font-label font-bold text-sm">+50 Sterne für Ronki</span>
            </div>
            <button
              onClick={() => onComplete?.({ hp: 50 })}
              className="w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: 'white',
                boxShadow: '0 8px 22px rgba(14,165,233,0.4)',
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zjFloat {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-46px) scale(1.25); }
        }
        @keyframes zjFlap {
          0%   { transform: translateY(0) rotate(0deg); }
          30%  { transform: translateY(-8px) rotate(-4deg); }
          70%  { transform: translateY(-3px) rotate(3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
