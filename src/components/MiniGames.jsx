import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { useGameAccess } from '../hooks/useGameAccess';
import { useRonkiStamina } from '../hooks/useRonkiStamina';
import { getCatStage } from '../utils/helpers';
import StaminaExhausted from './StaminaExhausted';
import StaminaIndicator from './StaminaIndicator';
import VoiceAudio from '../utils/voiceAudio';
import { MINT_GAMES, isForscherGraduated } from '../data/mintGames';
import { useAnalytics } from '../hooks/useAnalytics';
// Adventure-mode modules relocated from the Hub (Apr 2026 Hub simplification).
// Cave = tile nav; Forscher-Ecke = inline MINT progression with its own
// NEU badge. See MEMORY.md → backlog_progressive_hub_disclosure.md.
import ForscherEcke from './ForscherEcke';
import AttentionGlow from './AttentionGlow';
import { useAttentionFlag } from '../hooks/useAttentionFlag';

// Module-level cooldown so stamina voice line doesn't repeat every Games mount
let lastStaminaVoiceMs = 0;
const STAMINA_VOICE_COOLDOWN_MS = 30 * 60 * 1000; // 30 min

const GAMES = [
  {
    id: 'memory',
    titleKey: 'game.magicMemory',
    descKey: 'game.magicMemory.desc',
    emoji: '🃏',
    bg: 'linear-gradient(160deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)',
    textColor: '#78350f',
    btnBg: 'rgba(120,53,15,0.12)',
    btnColor: '#78350f',
    ready: true,
  },
  {
    id: 'starfall',
    titleKey: 'game.starfall',
    descKey: 'game.starfall.desc',
    emoji: '⭐',
    bg: 'linear-gradient(160deg, #fef9c3 0%, #fde047 50%, #eab308 100%)',
    textColor: '#713f12',
    ready: true,
  },
  {
    id: 'potion',
    titleKey: 'game.colorMix',
    descKey: 'game.colorMix.desc',
    emoji: '🎨',
    bg: 'linear-gradient(160deg, #fef3c7 0%, #fdba74 50%, #f97316 100%)',
    textColor: '#7c2d12',
    btnBg: 'rgba(124,45,18,0.1)',
    btnColor: '#7c2d12',
    ready: true,
  },
  {
    id: 'clouds',
    titleKey: 'game.cloudJump',
    descKey: 'game.cloudJump.desc',
    emoji: '☁️',
    bg: 'linear-gradient(160deg, #e0f2fe 0%, #7dd3fc 50%, #38bdf8 100%)',
    textColor: '#0c4a6e',
    btnBg: 'rgba(12,74,110,0.1)',
    btnColor: '#0c4a6e',
    ready: true,
  },
  {
    id: 'starfighter',
    titleKey: 'game.starfighter',
    descKey: 'game.starfighter.desc',
    emoji: '🐉',
    bg: 'linear-gradient(160deg, #ecfdf5 0%, #6ee7b7 50%, #059669 100%)',
    textColor: '#064e3b',
    ready: true,
  },
];

export default function MiniGames({ onPlay, onPlayMint, onNavigate }) {
  const { t, lang } = useTranslation();
  const { state } = useTask();
  const { track } = useAnalytics();
  const access = useGameAccess();
  const { unlocked, reason, withinTimeWindow, windowStartHour, windowEndHour } = access;
  const stamina = useRonkiStamina();
  const [showExhausted, setShowExhausted] = useState(false);
  const voiceFiredRef = useRef(false);
  // Shared NEU-badge flag with the old Hub mount — same key so Louis
  // doesn't see a second "NEU" glow after graduating from the Hub card.
  const [forscherSeen, markForscherSeen] = useAttentionFlag('forscher-ecke-first-seen');

  const catStage = getCatStage(state?.catEvo || 0);
  const tasksDone = state?.totalTasksDone || 0;

  // ── Adventure-mode gates (relocated from Hub Apr 2026) ──
  //  Cave: 15+ tasks. Matches the Hub's old "settle-in" gate.
  //  Forscher-Ecke: 10+ tasks AND not yet graduated. Matches the Hub gate.
  const caveAvailable = tasksDone >= 15;
  const forscherAvailable = tasksDone >= 10 && !isForscherGraduated(state);

  // Earned MINT games — surface completed Knobel-Abenteuer as stables Louis
  // can replay any time once they're out of the Hub's Forscher-Ecke. Filtering
  // by badgeId (not gameId) mirrors the graduation check in TaskContext.
  const mintEarned = MINT_GAMES.filter(g =>
    (state?.mintBadgesEarned || []).includes(g.badgeId)
  );

  // Fire stamina voice line at most once per mount AND throttled to 30min cross-mount
  useEffect(() => {
    if (voiceFiredRef.current) return;
    const now = Date.now();
    if (now - lastStaminaVoiceMs < STAMINA_VOICE_COOLDOWN_MS) return;
    if (stamina.exhausted) {
      VoiceAudio.play('de_stamina_exhausted_01', 600);
      voiceFiredRef.current = true;
      lastStaminaVoiceMs = now;
    } else if (stamina.low) {
      VoiceAudio.play('de_stamina_low_01', 800);
      voiceFiredRef.current = true;
      lastStaminaVoiceMs = now;
    }
  }, [stamina.exhausted, stamina.low]);

  const handleTileClick = (game) => {
    if (!game.ready || !unlocked) return;
    if (stamina.exhausted) {
      setShowExhausted(true);
      return;
    }
    // Analytics: game.start. Fires only on the successful handoff to the
    // game view — gated tiles (locked / exhausted) don't pollute the
    // funnel. game.end is handled by the game components themselves if
    // we ever want duration/completion data; for now start-rate is the
    // signal we actually want.
    track('game.start', { gameId: game.id });
    onPlay(game.id);
  };

  return (
    <div className="px-6 pb-8">
      {/* Header — stamina pill lives here now (moved off Hub per public-mode cleanup) */}
      <section className="mb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-headline text-4xl font-bold text-primary tracking-tight">{t('game.header')}</h2>
            <p className="font-body text-on-surface-variant text-lg mt-1">{t('game.subtitle')}</p>
          </div>
          <div className="shrink-0 mt-2">
            <StaminaIndicator />
          </div>
        </div>
      </section>

      {/* Gate banner — shown when games are locked. Two distinct reasons:
           time-window (Ronki sleeps outside play hours) OR routine-not-done. */}
      {!unlocked && (
        <div className="mb-6 p-5 rounded-2xl flex items-center gap-4"
             style={{
               background: !withinTimeWindow
                 ? 'linear-gradient(135deg, #e0e7ff, #eef2ff)'
                 : 'linear-gradient(135deg, #fef3c7, #fffbeb)',
               border: !withinTimeWindow
                 ? '1.5px solid rgba(99,102,241,0.25)'
                 : '1.5px solid rgba(217,119,6,0.2)',
             }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
               style={{
                 background: !withinTimeWindow
                   ? 'rgba(99,102,241,0.14)'
                   : 'rgba(217,119,6,0.12)',
               }}>
            <span className="material-symbols-outlined text-2xl"
                  style={{
                    color: !withinTimeWindow ? '#4338ca' : '#b45309',
                    fontVariationSettings: "'FILL' 1",
                  }}>
              {!withinTimeWindow ? (reason === 'timeAfter' ? 'bedtime' : 'schedule') : 'lock'}
            </span>
          </div>
          <div>
            {reason === 'timeBefore' && (
              <>
                <p className="font-headline font-bold text-base text-on-surface">
                  Noch zu früh zum Spielen
                </p>
                <p className="font-body text-sm text-on-surface-variant mt-0.5">
                  Spielzeit öffnet um {windowStartHour} Uhr. Ronki wartet noch. ⏰
                </p>
              </>
            )}
            {reason === 'timeAfter' && (
              <>
                <p className="font-headline font-bold text-base text-on-surface">
                  Ronki ist müde
                </p>
                <p className="font-body text-sm text-on-surface-variant mt-0.5">
                  Spielzeit ist vorbei. Morgen ab {windowStartHour} Uhr wieder. 🌙
                </p>
              </>
            )}
            {withinTimeWindow && reason === 'noSection' && (
              <>
                <p className="font-headline font-bold text-base text-on-surface">Erst deine Aufgaben!</p>
                <p className="font-body text-sm text-on-surface-variant mt-0.5">
                  Schließe eine Routine ab, dann darfst du spielen. 💪
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stamina low warning — shows when stamina is low but not exhausted */}
      {unlocked && stamina.low && !stamina.exhausted && (
        <div className="mb-6 px-5 py-3 rounded-full flex items-center gap-3"
             style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1.5px solid rgba(217,119,6,0.25)' }}>
          <span className="text-xl select-none">😴</span>
          <p className="font-body text-sm font-bold" style={{ color: '#78350f' }}>
            Ronki wird langsam müde ...
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           ABENTEUER (relocated from Hub Apr 2026)
           Cave tile + Forscher-Ecke live here now instead of cluttering
           the Hub first-viewport. Adventure-mode activities sit above
           the "Klassische Mini-Spiele" list so a kid who wants the
           progression path finds it first. Only renders when unlocked
           (game-access gate passed) AND at least one adventure is
           gate-open, so this whole section hides for fresh kids.
           ══════════════════════════════════════════════════════════════ */}
      {unlocked && (caveAvailable || forscherAvailable) && (
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h3 className="font-headline font-bold text-lg text-primary">
              {t('game.adventures.section')}
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {/* Kristall-Höhle — restyled Apr 2026 to match the classic
                 Mini-Spiele tile aesthetic (light bg, emoji-forward,
                 horizontal card). The old dark-purple pill stuck out
                 visually next to the warm cream Mini-Spiele rail. */}
            {caveAvailable && (
              <button
                onClick={() => onNavigate?.('hoehle')}
                className="w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(160deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)',
                  boxShadow: '0 4px 14px -4px rgba(180,83,9,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <span className="text-5xl select-none shrink-0 leading-none"
                      style={{ filter: 'drop-shadow(0 2px 8px rgba(120,53,15,0.25))' }}>
                  💎
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-bold text-lg" style={{ color: '#78350f' }}>
                    {lang === 'de' ? 'Kristall-Höhle' : 'Crystal cave'}
                  </h3>
                  <p className="font-body text-sm mt-0.5" style={{ color: '#b45309' }}>
                    {lang === 'de' ? 'Grab ein paar Kristalle aus' : 'Dig up some crystals'}
                  </p>
                </div>
                <span className="material-symbols-outlined shrink-0"
                      style={{ color: '#b45309', fontSize: 20 }}>chevron_right</span>
              </button>
            )}

            {/* Forscher-Ecke — inline MINT progression with Dr. Funkel.
                 AttentionGlow wraps the whole card for the NEU badge
                 until Louis opens it once. Same voice line ID as the
                 old Hub mount so any sound cues line up. */}
            {forscherAvailable && (
              <AttentionGlow
                active={!forscherSeen}
                seenKey="forscher-ecke-first-seen"
                accent="#059669"
                intensity="medium"
                badgeLabel="NEU"
                voiceLineId="de_forscher_new_01"
              >
                <ForscherEcke
                  onPlayGame={(gameId) => {
                    markForscherSeen();
                    onPlayMint?.(gameId);
                  }}
                />
              </AttentionGlow>
            )}
          </div>
        </section>
      )}

      {/* ── Deine Knobel-Abenteuer — earned MINT games, replayable ── */}
      {unlocked && mintEarned.length > 0 && (
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h3 className="font-headline font-bold text-lg text-primary">
              {t('game.forscher.section')}
            </h3>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
              {t('game.forscher.replayHint')}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {mintEarned.map(game => (
              <button
                key={game.id}
                className="w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
                style={{
                  // Restyled Apr 2026 to match the Mini-Spiele classic-tile
                  // shape (p-5, text-5xl emoji) so all three sections —
                  // Abenteuer, Knobel, Mini-Spiele — share one visual
                  // grammar. Kept the mint accent so earned-badge cards
                  // still read as "the completed set."
                  background: 'linear-gradient(160deg, #ecfdf5 0%, rgba(110,231,183,0.4) 50%, rgba(52,211,153,0.3) 100%)',
                  cursor: stamina.exhausted ? 'not-allowed' : 'pointer',
                  opacity: stamina.exhausted ? 0.5 : 1,
                }}
                onClick={() => {
                  if (stamina.exhausted) { setShowExhausted(true); return; }
                  track('game.start', { gameId: game.id });
                  onPlayMint?.(game.id);
                }}
              >
                <span className="text-5xl select-none shrink-0 leading-none"
                      style={{ filter: 'drop-shadow(0 2px 8px rgba(5,150,105,0.2))' }}>
                  {game.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-bold text-lg" style={{ color: '#064e3b' }}>
                    {game.name.de}
                  </h3>
                  <p className="font-body text-sm mt-0.5" style={{ color: '#047857' }}>
                    <span className="material-symbols-outlined align-middle text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {' '}{game.badgeLabel.de}
                  </p>
                </div>
                <span className="material-symbols-outlined shrink-0"
                      style={{ color: '#059669', fontSize: 20 }}>chevron_right</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Klassische Mini-Spiele — always-available quickplays.
           Shown under a section header when the Abenteuer section
           above is also rendering, so the two layers read as distinct.
           Gates: unlocked (access hook) + game.ready flag per tile. ── */}
      {unlocked && (caveAvailable || forscherAvailable) && (
        <div className="flex items-baseline justify-between mb-3 px-1 mt-2">
          <h3 className="font-headline font-bold text-lg text-primary">
            {t('game.classic.section')}
          </h3>
        </div>
      )}

      {/* Game cards — light, clean, emoji-forward */}
      <div className="flex flex-col gap-4">
        {GAMES.map(game => (
          <button
            key={game.id}
            className="w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all active:scale-[0.98]"
            style={{
              background: game.bg,
              cursor: unlocked && game.ready ? 'pointer' : 'not-allowed',
              filter: unlocked ? 'none' : 'grayscale(0.5) brightness(0.85)',
              opacity: !unlocked ? 0.55 : (stamina.exhausted ? 0.4 : 1),
            }}
            onClick={() => handleTileClick(game)}
          >
            <span className="text-5xl select-none shrink-0 leading-none"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>
              {game.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-bold text-lg" style={{ color: game.textColor }}>
                {t(game.titleKey)}
              </h3>
              <p className="font-body text-sm mt-0.5" style={{ color: `${game.textColor}99` }}>
                {t(game.descKey)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                 style={{
                   background: '#ffffff',
                   border: `2.5px solid ${game.textColor}30`,
                   boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                 }}>
              <span className="material-symbols-outlined text-xl"
                    style={{ color: game.textColor, fontVariationSettings: "'FILL' 1" }}>
                {unlocked ? 'play_arrow' : 'lock'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Bestenliste (High Scores) — viewable without playing ── */}
      <HighScoreBoard />

      {showExhausted && (
        <StaminaExhausted
          nextRechargeMin={stamina.nextRechargeMin}
          stage={catStage}
          onClose={() => setShowExhausted(false)}
        />
      )}
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
