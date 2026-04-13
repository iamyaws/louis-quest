import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SFX from '../utils/sfx';

// ── Star types ──
const STAR_TYPES = {
  normal:   { points: 1, color: '#ffffff', glow: 'rgba(255,255,255,0.6)', size: 22, speed: [1.5, 3], spawnWeight: 60 },
  golden:   { points: 3, color: '#fcd34d', glow: 'rgba(252,211,77,0.6)',  size: 26, speed: [1.2, 2.5], spawnWeight: 25 },
  shooting: { points: 5, color: '#a78bfa', glow: 'rgba(167,139,250,0.7)', size: 20, speed: [3.5, 5.5], spawnWeight: 15 },
};

const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL_MS = 400; // new star every 400ms
const CATCH_RADIUS = 38; // tap detection radius (generous for kids)

const HS_KEY = 'ronki_stars_highscores';

function loadHighscores() {
  try { return JSON.parse(localStorage.getItem(HS_KEY) || '[]').slice(0, 5); }
  catch { return []; }
}

function saveHighscore(score) {
  const list = loadHighscores();
  const entry = { score, date: new Date().toLocaleDateString('de-DE') };
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const top5 = list.slice(0, 5);
  localStorage.setItem(HS_KEY, JSON.stringify(top5));
  return { list: top5, rank: top5.findIndex(e => e === entry) };
}

function pickStarType() {
  const roll = Math.random() * 100;
  let cum = 0;
  for (const [key, t] of Object.entries(STAR_TYPES)) {
    cum += t.spawnWeight;
    if (roll < cum) return key;
  }
  return 'normal';
}

export default function StarCatcherGame({ onComplete }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const animRef = useRef(null);
  const spawnRef = useRef(null);
  const timerRef = useRef(null);

  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [highscores, setHighscores] = useState(loadHighscores);
  const [currentRank, setCurrentRank] = useState(-1);
  const [catchEffects, setCatchEffects] = useState([]); // sparkle effects

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
    if (!c) return { w: 400, h: 700 };
    const rect = c.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }, []);

  // Initialize game state
  const initGame = useCallback(() => {
    const { w, h } = getCanvasSize();
    // Pre-generate background stars (static twinkling)
    const bgStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.5,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
      twinklePhase: Math.random() * Math.PI * 2,
    }));
    gameRef.current = {
      stars: [],      // falling catchable stars
      score: 0,
      frame: 0,
      bgStars,
    };
  }, [getCanvasSize]);

  useEffect(() => {
    sizeCanvas();
    initGame();
    window.addEventListener('resize', sizeCanvas);
    return () => window.removeEventListener('resize', sizeCanvas);
  }, [sizeCanvas, initGame]);

  // Spawn stars at interval during gameplay
  useEffect(() => {
    if (phase !== 'playing') return;
    spawnRef.current = setInterval(() => {
      const g = gameRef.current;
      if (!g) return;
      const { w } = getCanvasSize();
      const type = pickStarType();
      const t = STAR_TYPES[type];
      const [minS, maxS] = t.speed;
      g.stars.push({
        id: Date.now() + Math.random(),
        type,
        x: t.size + Math.random() * (w - t.size * 2),
        y: -t.size,
        speed: minS + Math.random() * (maxS - minS),
        size: t.size,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
      });
    }, SPAWN_INTERVAL_MS);
    return () => clearInterval(spawnRef.current);
  }, [phase, getCanvasSize]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        if (prev <= 6) SFX.play('tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const endGame = useCallback(() => {
    setPhase('done');
    clearInterval(spawnRef.current);
    clearInterval(timerRef.current);
    cancelAnimationFrame(animRef.current);
    const g = gameRef.current;
    const finalScore = g?.score || 0;
    setScore(finalScore);
    SFX.play('celeb');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    const { list, rank } = saveHighscore(finalScore);
    setHighscores(list);
    setCurrentRank(rank);
  }, []);

  // Draw
  const draw = useCallback(() => {
    const c = canvasRef.current;
    const g = gameRef.current;
    if (!c || !g) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = getCanvasSize();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Night sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0f0c29');
    grad.addColorStop(0.5, '#302b63');
    grad.addColorStop(1, '#24243e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Background twinkling stars
    g.frame++;
    for (const s of g.bgStars) {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(g.frame * s.twinkleSpeed + s.twinklePhase));
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Falling stars
    for (const star of g.stars) {
      const t = STAR_TYPES[star.type];
      drawStar(ctx, star.x, star.y, star.size, star.rotation, t.color, t.glow);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [getCanvasSize]);

  // Game loop
  const tick = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const { h } = getCanvasSize();

    // Move stars
    for (const s of g.stars) {
      s.y += s.speed;
      s.rotation += s.rotSpeed;
    }

    // Remove off-screen stars
    g.stars = g.stars.filter(s => s.y < h + s.size);

    draw();
    animRef.current = requestAnimationFrame(tick);
  }, [draw, getCanvasSize]);

  // Start game
  const startGame = useCallback(() => {
    initGame();
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setPhase('playing');
    setCatchEffects([]);
    setCurrentRank(-1);
    SFX.play('pop');
    animRef.current = requestAnimationFrame(tick);
  }, [initGame, tick]);

  // Handle tap on canvas
  const handleTap = useCallback((e) => {
    if (phase === 'idle') {
      startGame();
      return;
    }
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

    // Check if tap hits any star (check from top to bottom, catch nearest)
    let caught = null;
    let closestDist = Infinity;
    for (const star of g.stars) {
      const dx = tapX - star.x;
      const dy = tapY - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CATCH_RADIUS && dist < closestDist) {
        closestDist = dist;
        caught = star;
      }
    }

    if (caught) {
      const t = STAR_TYPES[caught.type];
      g.stars = g.stars.filter(s => s.id !== caught.id);
      g.score += t.points;
      setScore(g.score);

      // Sparkle effect
      setCatchEffects(prev => [...prev, {
        id: caught.id,
        x: caught.x,
        y: caught.y,
        color: t.color,
        points: t.points,
        ts: Date.now(),
      }]);

      SFX.play(caught.type === 'shooting' ? 'match' : caught.type === 'golden' ? 'coin' : 'pop');
      if (navigator.vibrate) navigator.vibrate(40);
    }
  }, [phase, startGame]);

  // Clean up catch effects after animation
  useEffect(() => {
    if (!catchEffects.length) return;
    const timer = setTimeout(() => {
      setCatchEffects(prev => prev.filter(e => Date.now() - e.ts < 600));
    }, 700);
    return () => clearTimeout(timer);
  }, [catchEffects]);

  // Draw idle
  useEffect(() => {
    if (phase !== 'idle') return;
    const g = gameRef.current;
    if (g) {
      g.frame = 0;
      draw();
    }
  }, [phase, draw]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(spawnRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const reward = useMemo(() => {
    if (score >= 50) return { xp: 40, hp: 30 };
    if (score >= 30) return { xp: 25, hp: 20 };
    if (score >= 10) return { xp: 15, hp: 10 };
    return { xp: 5, hp: 5 };
  }, [score]);

  return (
    <div className="fixed inset-0 z-[400] flex flex-col overflow-hidden" style={{ background: '#0f0c29' }}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-3"
              style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))', background: 'rgba(15,12,41,0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>stars</span>
          <h1 className="text-xl font-bold tracking-tight font-headline" style={{ color: '#fcd34d' }}>Sternenf&auml;nger</h1>
        </div>
        <button onClick={() => onComplete({ xp: 0, hp: 0 })}
          className="px-5 py-2 rounded-full font-label font-bold text-sm active:scale-95 transition-transform"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#a78bfa' }}>
          Beenden
        </button>
      </header>

      {/* HUD: score + timer during gameplay */}
      {phase === 'playing' && (
        <div className="fixed z-[401] left-0 right-0 flex justify-center"
             style={{ top: 'calc(4.5rem + env(safe-area-inset-top, 0px))' }}>
          <div className="flex items-center gap-6 px-6 py-2.5 rounded-full"
               style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-headline font-bold text-xl text-white">{score}</span>
            </div>
            <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={{ color: timeLeft <= 5 ? '#ef4444' : '#a78bfa', fontVariationSettings: "'FILL' 1" }}>timer</span>
              <span className={`font-headline font-bold text-xl ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full flex-1"
        style={{ marginTop: 'calc(4rem + env(safe-area-inset-top, 0px))', touchAction: 'none' }}
        onTouchStart={handleTap}
        onClick={handleTap}
      />

      {/* Catch sparkle effects (DOM overlays for smooth CSS animation) */}
      {catchEffects.map(fx => (
        <div key={fx.id} className="fixed z-[401] pointer-events-none"
             style={{ left: fx.x - 20, top: fx.y + 60, animation: 'catchFloat 0.6s ease-out forwards' }}>
          <span className="font-headline font-bold text-2xl" style={{ color: fx.color, textShadow: `0 0 12px ${fx.color}` }}>
            +{fx.points}
          </span>
        </div>
      ))}

      {/* Idle overlay */}
      {phase === 'idle' && (
        <div className="fixed inset-0 z-[401] flex flex-col items-center justify-center pointer-events-none">
          <div className="px-8 py-6 rounded-2xl text-center"
               style={{ background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <span className="material-symbols-outlined text-5xl mb-3 block" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <p className="font-headline font-bold text-2xl text-white mb-2">Tippe zum Starten!</p>
            <p className="font-body text-sm" style={{ color: '#a78bfa' }}>
              Fange die fallenden Sterne!
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs font-label font-bold text-white/60">
                <span style={{ color: '#ffffff' }}>&#x2B50;</span> = 1
              </div>
              <div className="flex items-center gap-1.5 text-xs font-label font-bold text-white/60">
                <span style={{ color: '#fcd34d' }}>&#x2B50;</span> = 3
              </div>
              <div className="flex items-center gap-1.5 text-xs font-label font-bold text-white/60">
                <span style={{ color: '#a78bfa' }}>&#x2B50;</span> = 5
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {phase === 'done' && (
        <div className="fixed inset-0 z-[402] flex items-center justify-center px-6"
             style={{ background: 'rgba(15,12,41,0.92)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            <div className="text-7xl mb-4">
              {score >= 50 ? '\u{1F31F}' : score >= 30 ? '\u2728' : '\u2B50'}
            </div>
            <h2 className="font-headline text-4xl font-bold text-white mb-2">Spielende!</h2>
            <p className="font-body text-lg mb-6" style={{ color: '#a78bfa' }}>
              {score} {score === 1 ? 'Stern' : 'Sterne'} gefangen!
            </p>

            {score >= 50 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                   style={{ background: 'rgba(252,211,77,0.15)', color: '#fcd34d' }}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label font-bold text-xs uppercase tracking-widest">Stern-Meister!</span>
              </div>
            )}

            {/* Reward cards */}
            <div className="flex gap-4 mb-6">
              <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(167,139,250,0.15)', minWidth: 100 }}>
                <p className="font-headline text-3xl font-bold" style={{ color: '#a78bfa' }}>+{reward.xp}</p>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(167,139,250,0.6)' }}>XP</p>
              </div>
              <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(252,211,77,0.15)', minWidth: 100 }}>
                <p className="font-headline text-3xl font-bold" style={{ color: '#fcd34d' }}>+{reward.hp}</p>
                <p className="font-label text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(252,211,77,0.6)' }}>HP</p>
              </div>
            </div>

            {/* Highscores */}
            {highscores.length > 0 && (
              <div className="w-full mb-8 rounded-2xl overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(167,139,250,0.1)' }}>
                  <span className="material-symbols-outlined text-lg" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  <span className="font-headline font-bold text-sm" style={{ color: '#fcd34d' }}>Bestenliste</span>
                </div>
                {highscores.map((hs, i) => {
                  const isMe = i === currentRank;
                  const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5"
                         style={{
                           background: isMe ? 'rgba(252,211,77,0.1)' : 'transparent',
                           borderBottom: i < highscores.length - 1 ? '1px solid rgba(167,139,250,0.06)' : 'none',
                         }}>
                      <div className="flex items-center gap-3">
                        <span className="text-base w-6 text-center">{i < 3 ? medals[i] : `${i + 1}.`}</span>
                        <span className={`font-label text-sm ${isMe ? 'font-bold text-white' : 'text-white/70'}`}>
                          {hs.score} Sterne
                        </span>
                        {isMe && (
                          <span className="font-label text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(252,211,77,0.2)', color: '#fcd34d' }}>Neu</span>
                        )}
                      </div>
                      <span className="font-label text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{hs.date}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <button onClick={() => { setPhase('idle'); initGame(); }}
                className="flex-1 py-4 rounded-full font-headline font-bold text-lg active:scale-95 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#a78bfa' }}>
                Nochmal
              </button>
              <button onClick={() => onComplete(reward)}
                className="flex-1 py-4 rounded-full font-headline font-bold text-lg text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', boxShadow: '0 8px 24px rgba(109,40,217,0.3)' }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                Einsammeln!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catch float animation */}
      <style>{`
        @keyframes catchFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}

// ── Draw a 4-pointed star shape ──
function drawStar(ctx, x, y, size, rotation, color, glow) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Glow
  ctx.shadowColor = glow;
  ctx.shadowBlur = 16;
  ctx.fillStyle = color;

  // 4-pointed star path
  const outer = size / 2;
  const inner = outer * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();

  // Inner highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, inner * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
