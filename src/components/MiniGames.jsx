import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import { useGameAccess } from '../hooks/useGameAccess';

const GAMES = [
  {
    id: 'memory',
    titleKey: 'game.magicMemory',
    descKey: 'game.magicMemory.desc',
    visualIcon: 'style',
    bg: 'linear-gradient(160deg, #7c4a00 0%, #b45309 50%, #fcd34d 100%)',
    glowColor: 'rgba(252,211,77,0.4)',
    iconColor: '#fef3c7',
    panelBg: 'rgba(20,10,0,0.45)',
    ready: true,
  },
  {
    id: 'starfall',
    titleKey: 'game.starfall',
    descKey: 'game.starfall.desc',
    visualIcon: 'auto_awesome',
    bg: 'linear-gradient(160deg, #1e0650 0%, #4c1d95 50%, #7c3aed 100%)',
    glowColor: 'rgba(167,139,250,0.4)',
    iconColor: '#f5f3ff',
    panelBg: 'rgba(10,2,30,0.45)',
    ready: true,
  },
  {
    id: 'potion',
    titleKey: 'game.colorMix',
    descKey: 'game.colorMix.desc',
    visualIcon: 'palette',
    bg: 'linear-gradient(160deg, #7c2d12 0%, #ea580c 40%, #fbbf24 100%)',
    glowColor: 'rgba(251,191,36,0.35)',
    iconColor: '#fef3c7',
    panelBg: 'rgba(40,10,0,0.45)',
    ready: true,
  },
  {
    id: 'clouds',
    titleKey: 'game.cloudJump',
    descKey: 'game.cloudJump.desc',
    visualIcon: 'air',
    bg: 'linear-gradient(160deg, #0c1a4e 0%, #1d4ed8 50%, #7dd3fc 100%)',
    glowColor: 'rgba(125,211,252,0.35)',
    iconColor: '#e0f2fe',
    panelBg: 'rgba(4,8,24,0.45)',
    ready: true,
  },
  {
    id: 'starfighter',
    titleKey: 'game.starfighter',
    descKey: 'game.starfighter.desc',
    visualIcon: 'rocket_launch',
    bg: 'linear-gradient(160deg, #1a0030 0%, #4c1d95 50%, #a78bfa 100%)',
    glowColor: 'rgba(167,139,250,0.35)',
    iconColor: '#ede9fe',
    panelBg: 'rgba(10,0,20,0.45)',
    ready: true,
  },
];

export default function MiniGames({ onPlay }) {
  const { t } = useTranslation();
  const { unlocked, reason } = useGameAccess();

  return (
    <div className="px-6 pb-8">
      {/* Header */}
      <section className="mb-8">
        <h2 className="font-headline text-4xl font-bold text-primary tracking-tight">{t('game.header')}</h2>
        <p className="font-body text-on-surface-variant text-lg mt-1">{t('game.subtitle')}</p>
      </section>

      {/* Gate banner — shown when games are locked */}
      {!unlocked && (
        <div className="mb-6 p-5 rounded-2xl flex items-center gap-4"
             style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', border: '1.5px solid rgba(217,119,6,0.2)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'rgba(217,119,6,0.12)' }}>
            <span className="material-symbols-outlined text-2xl" style={{ color: '#b45309', fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <div>
            <p className="font-headline font-bold text-base text-on-surface">Erst deine Aufgaben!</p>
            <p className="font-body text-sm text-on-surface-variant mt-0.5">
              Schließe eine Routine ab, dann darfst du spielen. 💪
            </p>
          </div>
        </div>
      )}

      {/* Feature cards */}
      <div className="flex flex-col gap-6">
        {GAMES.map(game => (
          <div
            key={game.id}
            className="relative overflow-hidden active:scale-[0.97] transition-transform duration-150"
            style={{
              borderRadius: '1.25rem',
              minHeight: '200px',
              background: game.bg,
              cursor: unlocked ? 'pointer' : 'not-allowed',
              filter: unlocked ? 'none' : 'grayscale(0.7) brightness(0.7)',
              opacity: unlocked ? 1 : 0.6,
            }}
            onClick={() => game.ready && unlocked && onPlay(game.id)}
          >
            {/* Radial glow behind icon */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -70%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: game.glowColor,
                filter: 'blur(24px)',
                pointerEvents: 'none',
              }}
            />

            {/* Centered floating icon — upper 60% */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: '40%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.span
                className="material-symbols-outlined"
                whileTap={{ scale: 1.15 }}
                style={{
                  display: 'block',
                  fontSize: '80px',
                  color: game.iconColor,
                  fontVariationSettings: "'FILL' 1",
                  filter: `drop-shadow(0 4px 16px ${game.glowColor})`,
                  lineHeight: 1,
                }}
              >
                {game.visualIcon}
              </motion.span>
            </div>

            {/* Frosted-glass bottom panel */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1rem 1.25rem 1.25rem',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background: game.panelBg,
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                className="font-headline font-bold text-xl"
                style={{ color: '#ffffff', marginBottom: '0.15rem' }}
              >
                {t(game.titleKey)}
              </h3>
              <p
                className="font-body text-sm"
                style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}
              >
                {t(game.descKey)}
              </p>

              {game.ready ? (
                <button
                  onClick={e => { e.stopPropagation(); if (unlocked) onPlay(game.id); }}
                  disabled={!unlocked}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-label font-bold text-sm active:scale-95 transition-transform"
                  style={{ background: '#fcd34d', color: '#725b00' }}
                >
                  {t('game.play')}
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </button>
              ) : (
                <div
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-label font-bold text-sm"
                  style={{ background: 'rgba(232,225,218,0.2)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <span className="material-symbols-outlined text-lg">lock</span>
                  {t('game.comingSoon')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bestenliste (High Scores) — viewable without playing ── */}
      <HighScoreBoard />
    </div>
  );
}

// ── High Score Board sub-component ──
function HighScoreBoard() {
  const HS_KEYS = [
    { key: 'ronki_memory_highscores', label: 'Memory', icon: 'style', color: '#b45309', metric: 'Züge' },
    { key: 'ronki_clouds_highscores', label: 'Wolkensprung', icon: 'cloud', color: '#1e40af', metric: 'Punkte' },
    { key: 'ronki_stars_highscores', label: 'Sternenfänger', icon: 'star', color: '#6d28d9', metric: 'Sterne' },
  ];

  const allScores = HS_KEYS.map(game => {
    try {
      const data = JSON.parse(localStorage.getItem(game.key) || '[]');
      return { ...game, scores: data.slice(0, 3) };
    } catch {
      return { ...game, scores: [] };
    }
  }).filter(g => g.scores.length > 0);

  if (!allScores.length) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
        <h3 className="font-label font-bold text-sm text-on-surface uppercase tracking-widest">Bestenliste</h3>
      </div>
      <div className="flex flex-col gap-3">
        {allScores.map(game => (
          <div key={game.key} className="rounded-2xl p-4"
               style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-base" style={{ color: game.color, fontVariationSettings: "'FILL' 1" }}>{game.icon}</span>
              <span className="font-label font-bold text-sm text-on-surface">{game.label}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {game.scores.map((hs, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg"
                     style={{ background: i === 0 ? 'rgba(252,211,77,0.08)' : 'transparent' }}>
                  <span className="font-headline font-bold text-base w-6 text-center"
                        style={{ color: i === 0 ? '#b45309' : i === 1 ? '#6b7280' : '#9ca3af' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className="flex-1 font-label font-bold text-sm text-on-surface">
                    {hs.moves ?? hs.score ?? hs.stars ?? '?'} {game.metric}
                  </span>
                  {hs.date && (
                    <span className="font-label text-xs text-on-surface-variant">
                      {new Date(hs.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
