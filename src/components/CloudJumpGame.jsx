import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SFX from '../utils/sfx';
import { useTranslation } from '../i18n/LanguageContext';
import CooldownButton from './CooldownButton';

// ── Physics (logical 400px-wide coordinate space) ──
const P = {
  LW: 400,
  GRAVITY: 0.25,       // gentler fall for a 6-year-old
  FLAP: -5.5,          // softer, more controllable jumps
  MAX_FALL: 5.5,
  DW: 44,
  DH: 44,
  DX: 80,
  CLOUD_SPEED: 1.4,    // clouds approach slower
  CLOUD_W: 60,         // slightly narrower pillars = more room
  GAP: 210,            // much wider opening
  SPAWN_DIST: 240,     // more time between clouds
  MIN_GAP: 165,        // gap never gets punishingly small
  GAP_SHRINK: 0.8,     // difficulty increases very slowly
  SPEED_INC: 0.008,    // speed barely ramps up
  MAX_SPEED: 2.2,      // never gets crazy fast
  HITBOX_SHRINK: 14,   // more forgiving collision
};

const HS_KEY = 'ronki_clouds_highscores';

function loadHighscores() {
  try { return JSON.parse(localStorage.getItem(HS_KEY) || '[]').slice(0, 5); }
  catch { return []; }
}

function saveHighscore(score, locale) {
  const list = loadHighscores();
  const entry = { score, date: new Date().toLocaleDateString(locale) };
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const top5 = list.slice(0, 5);
  localStorage.setItem(HS_KEY, JSON.stringify(top5));
  return { list: top5, rank: top5.findIndex(e => e === entry) };
}

export default function CloudJumpGame({ onComplete }) {
  const { t, locale } = useTranslation();
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const animRef = useRef(null);
  const dragonImgRef = useRef(null);

  const [phase, setPhase] = useState('idle'); // idle | playing | dead
  const [score, setScore] = useState(0);
  const [imgReady, setImgReady] = useState(false);
  const [highscores, setHighscores] = useState(loadHighscores);
  const [currentRank, setCurrentRank] = useState(-1);

  // Preload dragon image
  useEffect(() => {
    const img = new Image();
    img.src = import.meta.env.BASE_URL + 'art/dragon-baby.webp';
    img.onload = () => { dragonImgRef.current = img; setImgReady(true); };
  }, []);

  // Compute logical height from canvas size
  const getLogicalH = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return 600;
    const rect = c.getBoundingClientRect();
    return rect.height / (rect.width / P.LW);
  }, []);

  // Initialize game state
  const initGame = useCallback(() => {
    const lh = getLogicalH();
    gameRef.current = {
      dragonY: lh / 2 - P.DH / 2,
      velocity: 0,
      clouds: [],
      score: 0,
      phase: 'idle',
      lh,
      bgClouds: Array.from({ length: 4 }, (_, i) => ({
        x: i * 120 + Math.random() * 60,
        y: 40 + Math.random() * (lh * 0.5),
        w: 50 + Math.random() * 40,
        speed: 0.3 + Math.random() * 0.3,
      })),
    };
  }, [getLogicalH]);

  // Size canvas
  const sizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
  }, []);

  useEffect(() => {
    sizeCanvas();
    initGame();
    window.addEventListener('resize', sizeCanvas);
    return () => window.removeEventListener('resize', sizeCanvas);
  }, [sizeCanvas, initGame]);

  // Draw one frame
  const draw = useCallback((ctx, g) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scale = rect.width / P.LW;

    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, g.lh);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#E8F4FD');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, P.LW, g.lh);

    // Background decorative clouds
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (const bc of g.bgClouds) {
      ctx.beginPath();
      ctx.ellipse(bc.x, bc.y, bc.w / 2, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloud pillars
    for (const cloud of g.clouds) {
      const gap = Math.max(P.MIN_GAP, P.GAP - g.score * P.GAP_SHRINK);
      drawCloudPillar(ctx, cloud.x, 0, P.CLOUD_W, cloud.gapY);
      drawCloudPillar(ctx, cloud.x, cloud.gapY + gap, P.CLOUD_W, g.lh - cloud.gapY - gap);
    }

    // Dragon
    const img = dragonImgRef.current;
    if (img) {
      ctx.save();
      const cx = P.DX + P.DW / 2;
      const cy = g.dragonY + P.DH / 2;
      const rot = Math.min(45, Math.max(-25, g.velocity * 3)) * Math.PI / 180;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(img, -P.DW / 2, -P.DH / 2, P.DW, P.DH);
      ctx.restore();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, []);

  // Game loop
  const tick = useCallback(() => {
    const g = gameRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!g || !ctx || g.phase !== 'playing') return;

    // Gravity
    g.velocity = Math.min(g.velocity + P.GRAVITY, P.MAX_FALL);
    g.dragonY += g.velocity;

    // Move clouds
    const speed = Math.min(P.CLOUD_SPEED + g.score * P.SPEED_INC, P.MAX_SPEED);
    for (const c of g.clouds) c.x -= speed;

    // Move background clouds
    for (const bc of g.bgClouds) {
      bc.x -= bc.speed;
      if (bc.x + bc.w < 0) bc.x = P.LW + 20;
    }

    // Remove off-screen clouds
    g.clouds = g.clouds.filter(c => c.x + P.CLOUD_W > -10);

    // Spawn new clouds
    const gap = Math.max(P.MIN_GAP, P.GAP - g.score * P.GAP_SHRINK);
    const lastX = g.clouds.length ? g.clouds[g.clouds.length - 1].x : -P.SPAWN_DIST;
    if (lastX < P.LW - P.SPAWN_DIST) {
      const margin = 60;
      const gapY = margin + Math.random() * (g.lh - gap - margin * 2);
      g.clouds.push({ x: P.LW + 20, gapY, scored: false });
    }

    // Collision detection (with forgiving hitbox)
    const s = P.HITBOX_SHRINK;
    const dx1 = P.DX + s, dy1 = g.dragonY + s;
    const dx2 = P.DX + P.DW - s, dy2 = g.dragonY + P.DH - s;

    for (const c of g.clouds) {
      const cx1 = c.x, cx2 = c.x + P.CLOUD_W;
      if (dx2 > cx1 && dx1 < cx2) {
        const topBottom = c.gapY;
        const botTop = c.gapY + gap;
        if (dy1 < topBottom || dy2 > botTop) {
          die(g);
          return;
        }
      }
    }

    // Floor / ceiling
    if (g.dragonY < 0 || g.dragonY + P.DH > g.lh) {
      die(g);
      return;
    }

    // Scoring
    for (const c of g.clouds) {
      if (!c.scored && c.x + P.CLOUD_W < P.DX) {
        c.scored = true;
        g.score++;
        setScore(g.score);
        SFX.play('coin');
      }
    }

    draw(ctx, g);
    animRef.current = requestAnimationFrame(tick);
  }, [draw]);

  const die = useCallback((g) => {
    g.phase = 'dead';
    setPhase('dead');
    setScore(g.score);
    SFX.play('crash');
    if (navigator.vibrate) navigator.vibrate(100);
    cancelAnimationFrame(animRef.current);
    const { list, rank } = saveHighscore(g.score, locale);
    setHighscores(list);
    setCurrentRank(rank);
  }, []);

  // Draw idle state
  useEffect(() => {
    if (phase !== 'idle' || !imgReady) return;
    const ctx = canvasRef.current?.getContext('2d');
    const g = gameRef.current;
    if (ctx && g) draw(ctx, g);
  }, [phase, imgReady, draw]);

  const handleTap = useCallback((e) => {
    if (e.type === 'touchstart') e.preventDefault();
    const g = gameRef.current;
    if (!g) return;

    if (g.phase === 'idle') {
      g.phase = 'playing';
      g.velocity = P.FLAP;
      setPhase('playing');
      SFX.play('flap');
      animRef.current = requestAnimationFrame(tick);
    } else if (g.phase === 'playing') {
      g.velocity = P.FLAP;
      SFX.play('flap');
    }
  }, [tick]);

  const handleRestart = useCallback(() => {
    initGame();
    setScore(0);
    setPhase('idle');
    setCurrentRank(-1);
    // Redraw idle
    setTimeout(() => {
      const ctx = canvasRef.current?.getContext('2d');
      const g = gameRef.current;
      if (ctx && g) draw(ctx, g);
    }, 50);
  }, [initGame, draw]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const reward = useMemo(() => {
    if (score >= 20) return { xp: 0, hp: 8 };
    if (score >= 10) return { xp: 0, hp: 5 };
    if (score >= 3) return { xp: 0, hp: 3 };
    return { xp: 0, hp: 2 };
  }, [score]);

  return (
    <div className="fixed inset-0 z-[400] bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-3"
              style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
          <h1 className="text-xl font-bold tracking-tight text-primary font-headline">{t('game.cloud.title')}</h1>
        </div>
        <button onClick={() => onComplete({ xp: 0, hp: 0 })}
          className="bg-primary-container text-white px-5 py-2 rounded-full font-label font-bold text-sm active:scale-95 transition-transform">
          {t('game.cloud.quit')}
        </button>
      </header>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full flex-1"
        style={{ marginTop: 'calc(4rem + env(safe-area-inset-top, 0px))', touchAction: 'none' }}
        onTouchStart={phase !== 'dead' ? handleTap : undefined}
        onClick={phase !== 'dead' ? handleTap : undefined}
      />

      {/* Score overlay during gameplay */}
      {phase === 'playing' && (
        <div className="fixed z-[401] left-1/2 -translate-x-1/2"
             style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
          <span className="font-headline font-bold text-5xl text-white drop-shadow-lg"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {score}
          </span>
        </div>
      )}

      {/* Idle overlay */}
      {phase === 'idle' && imgReady && (
        <div className="fixed inset-0 z-[401] flex flex-col items-center justify-center pointer-events-none">
          <div className="px-6 py-4 rounded-2xl text-center"
               style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
            <p className="font-headline font-bold text-2xl text-primary mb-2">{t('game.cloud.tapToFly')}</p>
            <p className="font-body text-sm text-on-surface-variant">
              {t('game.cloud.helpDragon')}
            </p>
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {phase === 'dead' && (
        <div className="fixed inset-0 z-[402] flex items-center justify-center px-6"
             style={{ background: 'rgba(255,248,242,0.92)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm flex flex-col items-center text-center">
            <div className="text-7xl mb-4">
              {score >= 20 ? '\u{1F389}' : score >= 10 ? '\u{1F60E}' : '\u2601\uFE0F'}
            </div>
            <h2 className="font-headline text-4xl font-bold text-on-surface mb-2">{t('game.cloud.gameOver')}</h2>
            <p className="font-body text-lg text-on-surface-variant mb-6">
              {t('game.cloud.cleared', { count: score, unit: score === 1 ? t('game.cloud.cloudSingular') : t('game.cloud.cloudPlural') })}
            </p>

            {score >= 20 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                   style={{ background: 'rgba(52,211,153,0.1)', color: '#059669' }}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label font-bold text-xs uppercase tracking-widest">{t('game.cloud.masterBadge')}</span>
              </div>
            )}

            {/* Reward cards */}
            <div className="flex gap-4 mb-6">
              <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(83,0,183,0.06)', minWidth: 100 }}>
                <p className="font-headline text-3xl font-bold text-primary">+{reward.xp}</p>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">XP</p>
              </div>
              <div className="p-5 rounded-2xl text-center" style={{ background: 'rgba(252,211,77,0.15)', minWidth: 100 }}>
                <p className="font-headline text-3xl font-bold" style={{ color: '#735c00' }}>+{reward.hp}</p>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">Sterne</p>
              </div>
            </div>

            {/* Highscores */}
            {highscores.length > 0 && (
              <div className="w-full mb-8 rounded-2xl overflow-hidden"
                   style={{ background: 'rgba(18,67,70,0.04)', border: '1px solid rgba(18,67,70,0.08)' }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(18,67,70,0.06)' }}>
                  <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  <span className="font-headline font-bold text-sm text-primary">{t('game.cloud.leaderboard')}</span>
                </div>
                {highscores.map((hs, i) => {
                  const isMe = i === currentRank;
                  const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5"
                         style={{
                           background: isMe ? 'rgba(252,211,77,0.15)' : 'transparent',
                           borderBottom: i < highscores.length - 1 ? '1px solid rgba(18,67,70,0.04)' : 'none',
                         }}>
                      <div className="flex items-center gap-3">
                        <span className="text-base w-6 text-center">{i < 3 ? medals[i] : `${i + 1}.`}</span>
                        <span className={`font-label text-sm ${isMe ? 'font-bold text-primary' : 'text-on-surface'}`}>
                          {t('game.cloud.pointsUnit', { count: hs.score })}
                        </span>
                        {isMe && (
                          <span className="font-label text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(252,211,77,0.3)', color: '#735c00' }}>{t('game.cloud.new')}</span>
                        )}
                      </div>
                      <span className="font-label text-xs text-outline">{hs.date}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 w-full">
              <CooldownButton delay={5} onClick={handleRestart}
                className="flex-1 py-4 rounded-full font-headline font-bold text-lg"
                style={{ background: 'rgba(18,67,70,0.06)', color: '#124346' }}>
                {t('game.cloud.again')}
              </CooldownButton>
              <CooldownButton delay={3} onClick={() => onComplete(reward)} icon="redeem"
                className="flex-1 py-4 rounded-full font-headline font-bold text-lg text-white"
                style={{ background: 'linear-gradient(135deg, #059669, #34d399)', boxShadow: '0 8px 24px rgba(5,150,105,0.2)' }}>
                {t('game.cloud.collect')}
              </CooldownButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cloud pillar drawing helper ──
function drawCloudPillar(ctx, x, y, w, h) {
  if (h <= 0) return;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  // Puffy highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(200,230,255,0.35)';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 6, w - 12, Math.min(16, h - 12), 8);
  ctx.fill();
  ctx.restore();
}
