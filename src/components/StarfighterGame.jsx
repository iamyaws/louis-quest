import React, { useState, useEffect, useRef, useCallback } from 'react';
import SFX from '../utils/sfx';
import { useTranslation } from '../i18n/LanguageContext';
import CooldownButton from './CooldownButton';
import VoiceAudio from '../utils/voiceAudio';

/**
 * StarfighterGame — Galaga-style vertical shooter.
 * Ronki flies upward, enemies come from the top.
 * 5 levels + 1 bonus. Each level = 3 waves of 30s.
 * Low-dopamine: fixed waves, no endless mode.
 *
 * Controls: touch/mouse to move Ronki left-right. Auto-fire.
 */

const LEVELS = [
  { name: { de: 'Wald',          en: 'Forest' },       color: '#059669', enemies: 4,  speed: 1.0, waves: 3, bg: 'art/games/starfighter/bg-forest.webp' },
  { name: { de: 'Wolken',        en: 'Clouds' },       color: '#0ea5e9', enemies: 5,  speed: 1.2, waves: 3, bg: 'art/games/starfighter/bg-clouds.webp' },
  { name: { de: 'Sternenmeer',   en: 'Stars' },        color: '#6d28d9', enemies: 6,  speed: 1.4, waves: 3, bg: 'art/games/starfighter/bg-stars.webp' },
  { name: { de: 'Vulkan',        en: 'Volcano' },      color: '#dc2626', enemies: 7,  speed: 1.6, waves: 3, bg: 'art/games/starfighter/bg-volcano.webp' },
  { name: { de: 'Kristallpalast', en: 'Crystal Palace' }, color: '#0891b2', enemies: 8, speed: 1.8, waves: 3, bg: 'art/games/starfighter/bg-crystal.webp' },
  { name: { de: 'Traumwelt ⭐',  en: 'Dream World ⭐' }, color: '#a855f7', enemies: 10, speed: 2.0, waves: 4, bonus: true, bg: 'art/games/starfighter/bg-dream.webp' },
];

const W = 360;
const H = 640;
const PLAYER_W = 36;
const PLAYER_H = 36;
const BULLET_R = 4;
const ENEMY_R = 16;
const FIRE_RATE = 280; // ms between shots

const base = import.meta.env.BASE_URL;

export default function StarfighterGame({ onComplete }) {
  const { lang } = useTranslation();
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu | playing | chooseUpgrade | levelComplete | dead
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);
  // Weapon upgrades — accumulate across levels
  const [laserCount, setLaserCount] = useState(1); // 1, 2, or 3
  const [bulletSize, setBulletSize] = useState(4); // radius: 4, 7, or 10

  const stateRef = useRef({ playerX: W / 2, bullets: [], enemies: [], particles: [], lastFire: 0, targetX: W / 2, enemiesKilled: 0, waveEnemiesSpawned: 0, spawnTimer: 0 });
  const shipImgRef = useRef(null);
  const bgImgRef = useRef(null);

  const levelData = LEVELS[level] || LEVELS[0];

  // Preload ship sprite once
  useEffect(() => {
    const img = new Image();
    img.src = base + 'art/games/starfighter/ronki-ship.webp';
    img.onload = () => { shipImgRef.current = img; };
  }, []);

  // Preload level background when level changes
  useEffect(() => {
    const bgPath = levelData?.bg;
    if (!bgPath) { bgImgRef.current = null; return; }
    const img = new Image();
    img.src = base + bgPath;
    img.onload = () => { bgImgRef.current = img; };
  }, [level, levelData?.bg]);

  // Sync lives to ref so game loop doesn't reset on hit
  useEffect(() => { livesRef.current = lives; }, [lives]);

  // ── Touch/mouse controls ──
  const handlePointerMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    stateRef.current.targetX = Math.max(PLAYER_W / 2, Math.min(W - PLAYER_W / 2, x));
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const x = (touch.clientX - rect.left) * scaleX;
    stateRef.current.targetX = Math.max(PLAYER_W / 2, Math.min(W - PLAYER_W / 2, x));
  }, []);

  // ── Game loop ──
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const st = stateRef.current;

    // Reset for new level/wave
    st.bullets = [];
    st.enemies = [];
    st.particles = [];
    st.lastFire = 0;
    st.enemiesKilled = 0;
    st.waveEnemiesSpawned = 0;
    st.spawnTimer = 0;

    const lvl = LEVELS[level];
    const totalEnemies = lvl.enemies * lvl.waves;
    let raf;
    let lastTime = performance.now();

    const spawnEnemy = () => {
      const x = 20 + Math.random() * (W - 40);
      const speed = (0.8 + Math.random() * 0.8) * lvl.speed;
      const wobble = Math.random() > 0.5;
      st.enemies.push({ x, y: -ENEMY_R, speed, wobble, wobbleOffset: Math.random() * Math.PI * 2, hp: 1 });
      st.waveEnemiesSpawned++;
    };

    const addParticles = (x, y, color, count = 6) => {
      for (let i = 0; i < count; i++) {
        st.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          color,
          size: 2 + Math.random() * 3,
        });
      }
    };

    const tick = (now) => {
      const dt = Math.min(32, now - lastTime) / 16.67;
      lastTime = now;

      // Clear
      ctx.fillStyle = '#0c1a2e';
      ctx.fillRect(0, 0, W, H);

      // Level background image — scrolls vertically for parallax
      const bgImg = bgImgRef.current;
      if (bgImg) {
        const bgScroll = (now * 0.03) % H;
        ctx.drawImage(bgImg, 0, -bgScroll, W, H);
        ctx.drawImage(bgImg, 0, H - bgScroll, W, H);
        // Dark overlay to keep enemies/bullets readable
        ctx.fillStyle = 'rgba(12,26,46,0.45)';
        ctx.fillRect(0, 0, W, H);
      }

      // Foreground twinkle stars (always on)
      for (let i = 0; i < 20; i++) {
        const sx = (i * 127 + level * 37) % W;
        const sy = ((i * 89 + now * 0.02 * (1 + i % 3)) % H);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.1})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Move player toward target
      const dx = st.targetX - st.playerX;
      st.playerX += dx * 0.12 * dt;

      // Auto-fire with weapon upgrades
      if (now - st.lastFire > FIRE_RATE) {
        if (laserCount >= 3) {
          st.bullets.push({ x: st.playerX - 10, y: H - 60, r: bulletSize });
          st.bullets.push({ x: st.playerX, y: H - 65, r: bulletSize });
          st.bullets.push({ x: st.playerX + 10, y: H - 60, r: bulletSize });
        } else if (laserCount >= 2) {
          st.bullets.push({ x: st.playerX - 7, y: H - 60, r: bulletSize });
          st.bullets.push({ x: st.playerX + 7, y: H - 60, r: bulletSize });
        } else {
          st.bullets.push({ x: st.playerX, y: H - 60, r: bulletSize });
        }
        st.lastFire = now;
        SFX.play('tap');
        if (st.bullets.length % 10 === 0) {
          VoiceAudio.play(Math.random() > 0.5 ? 'sfx_pew' : 'sfx_pew2');
        }
      }

      // Spawn enemies
      st.spawnTimer += dt;
      if (st.spawnTimer > (30 / lvl.speed) && st.waveEnemiesSpawned < totalEnemies) {
        spawnEnemy();
        st.spawnTimer = 0;
      }

      // Update bullets
      st.bullets = st.bullets.filter(b => {
        b.y -= 6 * dt;
        return b.y > -10;
      });

      // Update enemies
      let hit = false;
      st.enemies = st.enemies.filter(e => {
        e.y += e.speed * dt;
        if (e.wobble) e.x += Math.sin(performance.now() * 0.003 + e.wobbleOffset) * 0.8 * dt;

        // Check bullet collision
        for (let i = st.bullets.length - 1; i >= 0; i--) {
          const b = st.bullets[i];
          const bRadius = b.r || BULLET_R;
          const dist = Math.hypot(b.x - e.x, b.y - e.y);
          if (dist < ENEMY_R + bRadius) {
            st.bullets.splice(i, 1);
            e.hp--;
            addParticles(e.x, e.y, lvl.color);
            if (e.hp <= 0) {
              st.enemiesKilled++;
              setScore(s => s + 10);
              SFX.play('pop');
              return false;
            }
          }
        }

        // Check player collision
        if (Math.abs(e.x - st.playerX) < (PLAYER_W / 2 + ENEMY_R) * 0.7 && Math.abs(e.y - (H - 50)) < (PLAYER_H / 2 + ENEMY_R) * 0.7) {
          hit = true;
          addParticles(st.playerX, H - 50, '#ef4444', 10);
          return false;
        }

        // Off screen
        if (e.y > H + 20) return false;

        return true;
      });

      if (hit) {
        setLives(l => {
          if (l <= 1) {
            setGameState('dead');
            return 0;
          }
          // Lost a life — visual hit flash + SFX only, no haptic.
          // Research: error/penalty haptics on kids' apps read like
          // punishment; a hit is where that lands hardest.
          return l - 1;
        });
      }

      // Update particles
      st.particles = st.particles.filter(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.03 * dt;
        return p.life > 0;
      });

      // ── Draw ──

      // Bullets (golden bolts — size varies with upgrades)
      st.bullets.forEach(b => {
        const r = b.r || BULLET_R;
        ctx.fillStyle = r > 6 ? '#f97316' : '#fcd34d'; // orange for fireballs
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (r > 6) {
          // Fireball glow
          ctx.fillStyle = 'rgba(249,115,22,0.3)';
          ctx.beginPath();
          ctx.arc(b.x, b.y, r * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Enemies (colored circles with face)
      st.enemies.forEach(e => {
        ctx.fillStyle = lvl.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, ENEMY_R, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(e.x - 5, e.y - 3, 3, 0, Math.PI * 2);
        ctx.arc(e.x + 5, e.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(e.x - 5, e.y - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(e.x + 5, e.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particles
      st.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // Player (Ronki flying) — painted sprite with engine glow behind
      const px = st.playerX;
      const py = H - 50;
      // Glow halo behind sprite
      ctx.fillStyle = 'rgba(252,211,77,0.35)';
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_W * 0.75 + Math.sin(now * 0.008) * 2, 0, Math.PI * 2);
      ctx.fill();
      const shipImg = shipImgRef.current;
      if (shipImg) {
        const size = PLAYER_W * 1.8;
        ctx.drawImage(shipImg, px - size / 2, py - size / 2, size, size);
      } else {
        // Fallback triangle while sprite loads
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(px, py - PLAYER_H / 2);
        ctx.lineTo(px - PLAYER_W / 2, py + PLAYER_H / 2);
        ctx.lineTo(px + PLAYER_W / 2, py + PLAYER_H / 2);
        ctx.closePath();
        ctx.fill();
      }
      // Engine glow trail below
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(px, py + PLAYER_H / 2 + 6, 4 + Math.sin(now * 0.01) * 2, 0, Math.PI * 2);
      ctx.fill();

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Fredoka, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`⭐ ${st.enemiesKilled}/${totalEnemies}`, 12, 24);
      ctx.textAlign = 'right';
      for (let i = 0; i < livesRef.current; i++) {
        ctx.fillText('❤️', W - 12 - i * 22, 24);
      }

      // Check level complete — go to upgrade selection if there's a next level
      if (st.enemiesKilled >= totalEnemies && st.enemies.length === 0) {
        const nextLvl = level + 1;
        setGameState(nextLvl < LEVELS.length ? 'chooseUpgrade' : 'levelComplete');
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gameState, level, laserCount, bulletSize]);

  // ── Menu ──
  if (gameState === 'menu') {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
           style={{ background: 'linear-gradient(160deg, #0c1a2e 0%, #1a0030 50%, #0c3236 100%)' }}>
        <span className="text-7xl mb-4">🐉</span>
        <h1 className="font-headline font-bold text-3xl text-white mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Ronki Starfighter
        </h1>
        <p className="font-body text-sm text-white/60 mb-8 text-center">
          {lang === 'de' ? 'Hilf Ronki durch 5 Level + Bonus! Bewege deinen Finger um zu fliegen.' : 'Help Ronki through 5 levels + bonus! Move your finger to fly.'}
        </p>

        {/* Level select */}
        <div className="flex flex-col gap-2 w-full max-w-xs mb-8">
          {LEVELS.map((lvl, i) => {
            const unlocked = i === 0 || score > 0; // Phase 2: track per-level completion
            return (
              <button key={i}
                onClick={() => { setLevel(i); setLives(3); setScore(0); setGameState('playing'); }}
                className="flex items-center gap-3 p-3 rounded-xl text-left active:scale-[0.97] transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${lvl.color}40`,
                  opacity: unlocked ? 1 : 0.4,
                }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ background: `${lvl.color}25` }}>
                  <span className="font-headline font-bold text-white">{lvl.bonus ? '⭐' : i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-label font-bold text-sm text-white">{lvl.name[lang] || lvl.name.de}</p>
                  <p className="font-label text-xs" style={{ color: `${lvl.color}aa` }}>
                    {lvl.enemies * lvl.waves} {lang === 'de' ? 'Gegner' : 'enemies'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-white/30">play_arrow</span>
              </button>
            );
          })}
        </div>

        <button onClick={() => onComplete({ xp: 0, hp: 0 })}
          className="font-label text-sm text-white/40 active:opacity-70">
          {lang === 'de' ? 'Zurück' : 'Back'}
        </button>
      </div>
    );
  }

  // ── Choose Upgrade (between levels) ──
  if (gameState === 'chooseUpgrade') {
    const nextLevel = level + 1;
    const canDoubleLaser = laserCount < 3;
    const canBiggerFireball = bulletSize < 10;
    // If both upgrades are maxed, neither button is tappable. Without a
    // fallback CTA the kid is stuck — found by a tester 25 Apr 2026. We
    // still render the celebration copy so beating the level feels
    // rewarded, but surface a "Weiter" button so there is always a
    // forward path.
    const bothMaxed = !canDoubleLaser && !canBiggerFireball;

    const pickUpgrade = (type) => {
      if (type === 'laser' && canDoubleLaser) setLaserCount(c => c + 1);
      if (type === 'fireball' && canBiggerFireball) setBulletSize(s => s + 3);
      VoiceAudio.play('sfx_wow');
      SFX.play('coin');
      setLevel(nextLevel);
      setGameState('playing');
    };

    const skipUpgrade = () => {
      SFX.play('coin');
      setLevel(nextLevel);
      setGameState('playing');
    };

    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
           style={{ background: 'linear-gradient(160deg, #0c1a2e, #0c3236)' }}>
        <span className="text-5xl mb-3">⚡</span>
        <h2 className="font-headline font-bold text-2xl text-white mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          {lang === 'de' ? 'Level geschafft!' : 'Level cleared!'}
        </h2>
        <p className="font-body text-sm text-white/60 mb-2">
          {levelData.name[lang] || levelData.name.de}
        </p>
        <p className="font-headline font-bold text-lg mb-8" style={{ color: '#fcd34d' }}>
          {lang === 'de' ? 'Wähle eine Verbesserung!' : 'Choose an upgrade!'}
        </p>

        <div className="flex gap-4 w-full max-w-sm">
          {/* Double Laser */}
          <button
            onClick={() => pickUpgrade('laser')}
            disabled={!canDoubleLaser}
            className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            style={{
              background: canDoubleLaser ? 'linear-gradient(160deg, #e0f2fe, #38bdf8)' : 'rgba(255,255,255,0.05)',
              border: canDoubleLaser ? '2px solid rgba(56,189,248,0.4)' : '2px solid rgba(255,255,255,0.1)',
              opacity: canDoubleLaser ? 1 : 0.4,
            }}>
            <span className="text-4xl">⚡</span>
            <h3 className="font-headline font-bold text-base" style={{ color: canDoubleLaser ? '#0c4a6e' : '#666' }}>
              {lang === 'de' ? 'Doppel-Laser' : 'Double Laser'}
            </h3>
            <p className="font-body text-xs" style={{ color: canDoubleLaser ? '#0c4a6e99' : '#666' }}>
              {laserCount === 1 ? '1 → 2' : laserCount === 2 ? '2 → 3' : 'Max!'} {lang === 'de' ? 'Schüsse' : 'shots'}
            </p>
          </button>

          {/* Bigger Fireball */}
          <button
            onClick={() => pickUpgrade('fireball')}
            disabled={!canBiggerFireball}
            className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            style={{
              background: canBiggerFireball ? 'linear-gradient(160deg, #fef3c7, #f97316)' : 'rgba(255,255,255,0.05)',
              border: canBiggerFireball ? '2px solid rgba(249,115,22,0.4)' : '2px solid rgba(255,255,255,0.1)',
              opacity: canBiggerFireball ? 1 : 0.4,
            }}>
            <span className="text-4xl">🔥</span>
            <h3 className="font-headline font-bold text-base" style={{ color: canBiggerFireball ? '#7c2d12' : '#666' }}>
              {lang === 'de' ? 'Feuerball' : 'Fireball'}
            </h3>
            <p className="font-body text-xs" style={{ color: canBiggerFireball ? '#7c2d1299' : '#666' }}>
              {bulletSize === 4 ? 'Klein → Mittel' : bulletSize === 7 ? 'Mittel → Groß' : 'Max!'}
            </p>
          </button>
        </div>

        {/* Fallback CTA when both upgrades are maxed. Kid keeps their
             current loadout and advances to the next level. */}
        {bothMaxed && (
          <button
            onClick={skipUpgrade}
            className="mt-8 px-8 py-4 rounded-full font-headline font-bold text-lg text-white active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.35)' }}
          >
            {lang === 'de' ? 'Weiter' : 'Continue'}
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        )}
      </div>
    );
  }

  // ── Level Complete (final level — no more upgrades) ──
  if (gameState === 'levelComplete') {
    const nextLevel = level + 1;
    const hasNext = nextLevel < LEVELS.length;
    const isLastLevel = !hasNext;
    const reward = { xp: 0, hp: Math.max(4, (level + 1) * 3) };

    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
           style={{ background: 'linear-gradient(160deg, #0c1a2e, #0c3236)' }}>
        <span className="text-6xl mb-3">{isLastLevel ? '🏆' : '⭐'}</span>
        <h2 className="font-headline font-bold text-2xl text-white mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          {isLastLevel
            ? (lang === 'de' ? 'Alle Level geschafft!' : 'All levels cleared!')
            : `${levelData.name[lang] || levelData.name.de} ${lang === 'de' ? 'geschafft!' : 'cleared!'}`}
        </h2>
        <p className="font-body text-sm text-white/60 mb-6">
          {lang === 'de' ? `${score} Punkte` : `${score} points`}
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {hasNext && (
            <button onClick={() => { setLevel(nextLevel); setGameState('playing'); }}
              className="w-full py-4 rounded-full font-headline font-bold text-lg text-white active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ background: LEVELS[nextLevel].color, boxShadow: `0 4px 16px ${LEVELS[nextLevel].color}60` }}>
              {lang === 'de' ? 'Nächstes Level' : 'Next Level'}
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          )}
          <CooldownButton delay={3} onClick={() => onComplete(reward)}
            className="w-full py-3.5 rounded-full font-label font-bold text-sm text-white/70"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            {lang === 'de' ? 'Zurück zum Laden' : 'Back to shop'}
          </CooldownButton>
        </div>
      </div>
    );
  }

  // ── Dead ──
  if (gameState === 'dead') {
    const reward = { xp: 0, hp: Math.max(2, Math.floor(score / 20)) };
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
           style={{ background: 'linear-gradient(160deg, #1a0000, #2d0000)' }}>
        <span className="text-6xl mb-3">💥</span>
        <h2 className="font-headline font-bold text-2xl text-white mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          {lang === 'de' ? 'Leider verloren!' : 'You crashed!'}
        </h2>
        <p className="font-body text-sm text-white/60 mb-6">
          {lang === 'de' ? `${score} Punkte — Versuch es nochmal!` : `${score} points — try again!`}
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <CooldownButton delay={5} onClick={() => { setLives(3); setScore(0); setGameState('playing'); }}
            className="flex-1 py-4 rounded-full font-headline font-bold text-base"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            {lang === 'de' ? 'Nochmal' : 'Retry'}
          </CooldownButton>
          <CooldownButton delay={2} onClick={() => onComplete(reward)} icon="redeem"
            className="flex-1 py-4 rounded-full font-headline font-bold text-base text-white"
            style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
            {lang === 'de' ? 'Stark! Weiter 💪' : 'Continue 💪'}
          </CooldownButton>
        </div>
      </div>
    );
  }

  // ── Playing ──
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
         style={{ background: '#0c1a2e', touchAction: 'none' }}>
      <canvas ref={canvasRef} width={W} height={H}
        className="w-full max-w-sm h-auto"
        style={{ maxHeight: '100dvh', imageRendering: 'pixelated' }}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
      />
      {/* Quit button overlay */}
      <button onClick={() => onComplete({ xp: 0, hp: 0 })}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', marginTop: 'env(safe-area-inset-top, 0px)' }}>
        <span className="material-symbols-outlined text-white text-xl">close</span>
      </button>
      {/* Level indicator */}
      <div className="fixed top-4 left-4 z-50 px-3 py-1.5 rounded-full"
           style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', marginTop: 'env(safe-area-inset-top, 0px)' }}>
        <span className="font-label font-bold text-xs text-white">
          {levelData.name[lang] || levelData.name.de}
        </span>
      </div>
    </div>
  );
}
