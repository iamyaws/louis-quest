import React, { useEffect, useState } from 'react';
import { WEEKLY_MISSIONS, MOOD_EMOJIS, BOSSES, BOSS_TIERS, GEAR_ITEMS, CAT_STAGES, COMPANION_STAGES } from '../constants';
import { useTask } from '../context/TaskContext';
import { getLevel, getLvlProg, getCatStage } from '../utils/helpers';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import SFX from '../utils/sfx';
import Egg from './Egg';
import { Pearl } from './CurrencyIcons';
import { BADGES } from '../constants';
import { useTranslation } from '../i18n/LanguageContext';
import { useVoice } from '../companion/useVoice';
import VoiceBubble from './VoiceBubble';

// ── Egg art per onboarding type (stage 0) ──
const EGG_ART = {
  fire: 'art/onboarding/egg-fire.webp',
  golden: 'art/onboarding/egg-golden.webp',
  spirit: 'art/onboarding/egg-spirit.webp',
};

// ── Dragon evolution art per stage (1-4) ──
const COMPANION_ART = {
  dragon: [
    null, // stage 0 = egg (use EGG_ART)
    'art/companion/dragon-baby.webp',
    'art/companion/dragon-young.webp',
    'art/companion/dragon-majestic.webp',
    'art/companion/dragon-legendary.webp',
  ],
  // TODO: add art for other companion types (wolf, phoenix, cat)
};

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

const BOSS_ART = {
  schnarchling: { full: 'art/boss-schnarchling_the-snorer-fullpower.webp', defeated: 'art/boss-schnarchling_the-snorer-defeated.webp' },
  wusselwicht:  { full: 'art/boss-wusselwicht-the-chaos-imp-fullpower.webp', defeated: 'art/boss-wusselwicht-the-chaos-imp-defeated.webp' },
  flimmerfux:   { full: 'art/boss-flimmerfux_the-flicker-fox-fullpower.webp', defeated: 'art/boss-flimmerfux_the-flicker-fox-defeated.webp' },
};

export default function Hub({ onNavigate }) {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct } = computed;
  const { t, lang } = useTranslation();
  const { weather } = useWeather();
  const voice = useVoice();
  const base = import.meta.env.BASE_URL;
  const remaining = total - done;
  const MOOD_LABELS_I18N = [t('mood.sad'), t('mood.worried'), t('mood.okay'), t('mood.good'), t('mood.magical'), t('mood.tired')];

  const [showBossDetail, setShowBossDetail] = useState(false);

  // Ronki greets Louis once when Hub mounts.
  useEffect(() => {
    voice.say('hub_open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  const level = getLevel(state.xp || 0);
  const lvlProg = getLvlProg(state.xp || 0);
  const xpPct = lvlProg.need > 0 ? Math.min(100, (lvlProg.cur / lvlProg.need) * 100) : 0;
  const heroName = state.familyConfig?.childName || t('hero.fallback');
  const heroAvatar = state.heroGender === 'girl' ? 'art/hero-default-girl.webp' : 'art/hero-default.webp';

  return (
    <div className="relative min-h-dvh bg-surface pb-32">

      {/* ── Top Bar (matches TopBar component style) ── */}
      <header className="flex justify-between items-center px-6 pb-2"
              style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>
        <button onClick={() => onNavigate?.('hero')} className="flex items-center gap-2 active:scale-95 transition-all">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shadow-sm"
                 style={{ border: '2px solid rgba(18,67,70,0.15)' }}>
              <img src={base + heroAvatar} alt={heroName} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md"
                 style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', border: '2px solid white', color: '#1a1a1a', lineHeight: 1 }}>
              {level}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-headline font-bold text-primary leading-tight">{heroName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(18,67,70,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #124346, #5eead4)' }} />
              </div>
              <span className="font-label text-xs text-outline">{lvlProg.cur}/{lvlProg.need}</span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
             style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)' }}>
          <Pearl size={20} />
          <span className="text-primary font-bold text-sm font-label">{state.hp || 0}</span>
        </div>
      </header>

      <main className="px-6 max-w-lg mx-auto flex flex-col gap-6">

        {/* ── Companion ── */}
        {(() => {
          const eggType = state.eggType || 'fire';
          const catStage = getCatStage(state.catEvo || 0);
          const companionType = 'dragon'; // TODO: map eggType → companion type
          const stages = COMPANION_STAGES[companionType] || COMPANION_STAGES.dragon;
          const stageName = t('companion.' + companionType + '.' + catStage) || t('companion.stage.egg');
          const stageNum = catStage + 1;

          // Pick art: stage 0 = egg type, stage 1+ = evolution art
          const artSrc = catStage === 0
            ? (EGG_ART[eggType] || EGG_ART.fire)
            : (COMPANION_ART[companionType]?.[catStage] || 'art/companion/dragon-baby.webp');

          // Egg shape for stage 0, round for hatched
          const isEgg = catStage === 0;

          // Painted campfire scene — contained illustration (not wallpaper).
          // Per-stage variants can swap in under `campfire/lager-stage{N}.png`.
          const sceneSrc = `art/campfire/lager-stage1.png`;

          return (
            <section className="relative flex flex-col items-center pt-2 pb-4">
              {/* Ronki's greeting chip — above the scene so it doesn't fight the painted border */}
              {voice.line && (
                <div className="relative z-10 flex justify-center w-full px-6 mb-2">
                  <VoiceBubble line={voice.line} onDismiss={voice.dismiss} variant="chip" />
                </div>
              )}

              {/* Painted campfire scene — framed illustration with its own cream painted border.
                  Fades to surface at the bottom so cards below land on cream paper. */}
              <div className="relative w-full max-w-[420px]">
                <img
                  src={base + sceneSrc}
                  alt={t('hub.campfire.alt') || `${heroName} am Lagerfeuer`}
                  className="w-full h-auto companion-breathe select-none"
                  style={{ filter: 'drop-shadow(0 14px 22px rgba(18,67,70,0.22))' }}
                  draggable={false}
                />

                {/* Fade-to-cream at the bottom so the illustration dissolves into the page */}
                <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
                     style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,248,242,0.45) 50%, #fff8f2 100%)' }}
                     aria-hidden="true" />

                {/* Floating embers rising from the fire area (roughly centered-right above the flame) */}
                <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
                  <span className="ember" style={{ bottom: '32%', left: '52%', '--delay': '0s',   '--dur': '4.8s', '--drift': '14px' }} />
                  <span className="ember" style={{ bottom: '34%', left: '58%', '--delay': '1.2s', '--dur': '5.4s', '--drift': '-10px' }} />
                  <span className="ember" style={{ bottom: '28%', left: '64%', '--delay': '2.0s', '--dur': '4.2s', '--drift': '6px' }} />
                  <span className="ember" style={{ bottom: '36%', left: '48%', '--delay': '0.6s', '--dur': '5.0s', '--drift': '-14px' }} />
                </div>
              </div>

              {/* Stage nameplate — painted banner under the scene */}
              <div className="-mt-4 relative z-10 px-5 py-1.5 rounded-full"
                   style={{
                     background: 'rgba(255,248,242,0.95)',
                     border: '1px solid rgba(18,67,70,0.15)',
                     boxShadow: '0 6px 14px -4px rgba(18,67,70,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
                   }}>
                <p className="font-bold text-[11px] font-label uppercase tracking-[0.22em] text-primary-container whitespace-nowrap">
                  {t('hub.companion.stage', { stage: stageNum })} · {stageName}
                </p>
              </div>
            </section>
          );
        })()}

        {/* ── Heldenpunkte ── */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full"
               style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <Pearl size={24} />
            <span className="font-extrabold font-label text-sm text-primary-container">{`${state.hp || 0} ${t('hero.hp')}`}</span>
          </div>
        </div>

        {/* ── Login Bonus ── */}
        {!state.loginBonusClaimed && (
          <button
            className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}
            onClick={() => { SFX.play('pop'); actions.collectLoginBonus(); }}
          >
            <span className="text-3xl">👋</span>
            <div className="flex-1">
              <p className="font-headline font-bold text-base text-secondary">{t('hub.loginBonus.title')}</p>
              <p className="font-body text-sm text-on-surface-variant">{t('hub.loginBonus.subtitle')}</p>
            </div>
            <span className="px-3 py-1.5 rounded-full font-label font-bold text-xs"
                  style={{ background: '#fcd34d', color: '#725b00' }}>+5 HP</span>
          </button>
        )}

        {/* ── Daily Summary Card ── */}
        <button onClick={() => onNavigate?.('quests')}
                className="w-full p-6 rounded-2xl relative overflow-hidden text-left active:scale-[0.98] transition-transform"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(252,235,200,0.78) 60%, rgba(162,208,212,0.55) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 12px 36px -8px rgba(18,67,70,0.18), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}>
          {/* decorative corner sparkle */}
          <span className="absolute top-3 right-20 text-base opacity-60 select-none" aria-hidden="true">✦</span>
          <span className="absolute bottom-3 left-5 text-xs opacity-40 select-none" aria-hidden="true">✦</span>

          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] font-label uppercase tracking-[0.18em] text-secondary mb-1.5">
                {lang === 'de' ? 'HEUTE' : 'TODAY'}
              </p>
              <h3 className="font-headline font-extrabold text-2xl text-primary-container leading-tight">
                {allDone ? t('hub.allDone.title') : t('hub.remaining', { count: remaining })}
              </h3>
              <p className="font-body text-on-surface-variant text-sm mt-1">
                {allDone ? t('hub.allDone.subtitle') : t('hub.keepGoing')}
              </p>
            </div>

            {/* Progress ring with quest count in center */}
            <div className="relative w-20 h-20 shrink-0">
              <svg key={done} className="progress-ring-anim w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(18,67,70,0.12)" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="transparent"
                  stroke={allDone ? '#34d399' : '#fcd34d'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="176" strokeDashoffset={176 - pct * 176} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                {allDone ? (
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                ) : (
                  <>
                    <span className="font-headline font-extrabold text-xl text-primary-container">{done}</span>
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">/ {total}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>

        {/* ── Daily Check-in (collapsible mood + water) ── */}
        <details className="group rounded-2xl overflow-hidden"
                 style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                 open={state.moodAM === null || (state.dailyWaterCount || 0) < 6}>
          {/* Summary row — always visible */}
          <summary className="p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                     style={{ background: 'rgba(252,211,77,0.12)' }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: '#d97706', fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">{t('hub.checkin.title')}</h3>
                  <p className="font-label text-sm text-on-surface-variant">
                    {state.moodAM !== null ? `${MOOD_EMOJIS[state.moodAM]} ${MOOD_LABELS_I18N[state.moodAM]}` : t('hub.mood.hint')}
                    {' · '}
                    {t('hub.water.count', { count: state.dailyWaterCount || 0 })}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center group-open:rotate-180 transition-transform bg-surface-container">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">expand_more</span>
              </div>
            </div>
          </summary>

          {/* Expanded: Mood + Water full-width */}
          <div className="px-5 pb-5 flex flex-col gap-5 border-t border-surface-container" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>

            {/* Mood */}
            <div className="pt-4">
              {state.moodAM !== null ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                       style={{ background: 'rgba(252,211,77,0.1)', border: '2px solid rgba(252,211,77,0.2)' }}>
                    {MOOD_EMOJIS[state.moodAM]}
                  </div>
                  <div>
                    <p className="font-bold text-sm font-label text-on-surface-variant uppercase tracking-widest">{t('hub.mood.label')}</p>
                    <p className="font-headline font-bold text-xl text-primary">{MOOD_LABELS_I18N[state.moodAM]}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-bold text-sm font-label uppercase tracking-widest mb-3" style={{ color: '#b45309' }}>
                    {t('hub.mood.title')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {MOOD_EMOJIS.map((e, i) => (
                      <button key={i} onClick={() => { SFX.play("pop"); actions.setMood("moodAM", i); }}
                        className="w-[60px] h-[60px] text-3xl rounded-2xl transition-all active:scale-90 flex items-center justify-center"
                        style={{ background: 'rgba(252,211,77,0.08)', border: '2px solid rgba(252,211,77,0.2)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>{e}</button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Water */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-sm font-label text-on-surface-variant uppercase tracking-widest">{t('hub.water.title')}</p>
                <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
              </div>
              <div className="flex justify-center gap-4">
                {[0,1,2,3,4,5].map(i => {
                  const filled = i < (state.dailyWaterCount || 0);
                  const isNext = i === (state.dailyWaterCount || 0);
                  return (
                    <button key={i}
                      className={`w-12 h-12 rounded-full border-[2.5px] transition-all flex items-center justify-center ${filled ? 'bg-primary border-primary' : isNext ? 'border-primary animate-pulse' : 'border-primary/15'}`}
                      style={{ background: filled ? undefined : isNext ? 'rgba(18,67,70,0.08)' : 'rgba(18,67,70,0.03)', boxShadow: isNext ? '0 0 0 4px rgba(18,67,70,0.06)' : 'none' }}
                      onClick={() => isNext && actions.drinkWater?.()}
                    >
                      {filled && <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                      {isNext && <span className="material-symbols-outlined text-primary text-lg">add</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-center font-bold text-sm font-label mt-3 text-on-surface-variant">
                {t('hub.water.count', { count: state.dailyWaterCount || 0 })}
              </p>
              {(state.dailyWaterCount || 0) < 6 && (
                <p className="text-center font-body text-sm mt-1" style={{ color: '#b45309' }}>{t('hub.water.hint')}</p>
              )}
            </div>
          </div>
        </details>

        {/* ── Boss Card (compact with tappable portrait) ── */}
        {state.boss && (() => {
          const bd = BOSSES.find(b => b.id === state.boss.id);
          if (!bd) return null;
          const defeated = state.boss.hp <= 0;
          const art = BOSS_ART[bd.id];
          const artSrc = art ? base + (defeated ? art.defeated : art.full) : null;
          const hpPct = state.boss.maxHp > 0 ? (state.boss.hp / state.boss.maxHp) * 100 : 0;
          return (
            <>
              <div className="p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden"
                   style={{ background: '#1a1a3e', border: '1.5px solid rgba(252,211,77,0.2)', boxShadow: '0 4px 20px rgba(26,26,62,0.25)' }}
                   onClick={() => setShowBossDetail(true)}>
                <img src={base + 'art/tex-sternenmeer.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(26,26,62,0.7), rgba(35,35,80,0.6))' }} />
                {/* Round portrait */}
                <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden shrink-0 cursor-pointer shadow-lg"
                     style={{ border: '3px solid #fcd34d', boxShadow: '0 0 12px rgba(252,211,77,0.3)' }}>
                  {artSrc ? (
                    <img src={artSrc} alt={t('boss.' + bd.id)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'rgba(186,26,26,0.1)' }}>{bd.icon}</div>
                  )}
                </div>
                {/* Stats */}
                <div className="relative z-10 flex-1">
                  {defeated ? (
                    <>
                      <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fcd34d' }}>{t('hub.boss.defeated')}</p>
                      <h4 className="font-headline font-bold text-lg text-white">{t('boss.' + bd.id)}</h4>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fca5a5' }}>{t('hub.boss.fight')}</p>
                        <p className="font-bold text-xs font-label" style={{ color: '#fca5a5' }}>{state.boss.hp}/{state.boss.maxHp} HP</p>
                      </div>
                      <h4 className="font-headline font-bold text-lg text-white">{t('boss.' + bd.id)}</h4>
                      <div className="w-full h-2 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hpPct}%`, background: '#f87171' }} />
                      </div>
                      {(state.bossDmgToday || 0) > 0 && (
                        <p className="font-label font-bold text-xs mt-1" style={{ color: '#fcd34d' }}>
                          {t('hub.boss.todayDmg', { dmg: state.bossDmgToday })}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: 'rgba(252,211,77,0.5)' }}>chevron_right</span>
              </div>

              {/* Full-screen Boss Battle Detail */}
              {showBossDetail && (
                <div className="fixed inset-0 z-[200] flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  {/* Background texture */}
                  <img src={base + 'art/bg-emerald-mist.png'} alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: -1 }} />
                  {/* Close button */}
                  <button onClick={() => setShowBossDetail(false)}
                    className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                    <span className="material-symbols-outlined text-white text-xl">close</span>
                  </button>

                  {/* VS Face-off */}
                  <div className="relative flex items-center justify-center pt-12 pb-6 px-6"
                       style={{ background: 'linear-gradient(135deg, #1a0030 0%, #2d0060 50%, #400000 100%)' }}>
                    {/* Hero side */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
                           style={{ borderColor: '#fcd34d', boxShadow: '0 0 20px rgba(252,211,77,0.4)' }}>
                        <img src={base + 'art/egg-glow.webp'} alt={t('hero.fallback')} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-headline font-bold text-white text-sm mt-2">{t('hub.boss.detail.hero')}</p>
                    </div>

                    {/* VS badge */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 mx-2"
                         style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', boxShadow: '0 0 30px rgba(252,211,77,0.5)' }}>
                      <span className="font-headline font-black text-xl" style={{ color: '#725b00' }}>VS</span>
                    </div>

                    {/* Boss side */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
                           style={{ borderColor: '#ba1a1a', boxShadow: '0 0 20px rgba(186,26,26,0.4)' }}>
                        {artSrc ? (
                          <img src={artSrc} alt={t('boss.' + bd.id)} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: '#ba1a1a33' }}>{bd.icon}</div>
                        )}
                      </div>
                      <p className="font-headline font-bold text-white text-sm mt-2">{t('boss.' + bd.id)}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-t-[2rem] -mt-4 relative z-10 px-6 pt-8 pb-36"
                       style={{ background: '#fff8f2' }}>

                    {/* Gear Bonus Indicator */}
                    {(() => {
                      const eq = state.equippedGear || {};
                      let totalCourage = 0, totalDefense = 0;
                      for (const slotId of Object.values(eq)) {
                        const g = GEAR_ITEMS.find(gi => gi.id === slotId);
                        if (g) { totalCourage += g.stats.courage || 0; totalDefense += g.stats.defense || 0; }
                      }
                      const courageBonus = Math.floor(totalCourage / 5);
                      const defenseBonus = Math.floor(totalDefense / 5);
                      if (courageBonus <= 0 && defenseBonus <= 0) return null;
                      return (
                        <div className="flex gap-3 mb-5">
                          {courageBonus > 0 && (
                            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                                 style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)' }}>
                              <span className="material-symbols-outlined text-base" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                              <span className="font-label font-bold text-xs" style={{ color: '#b45309' }}>{t('hub.boss.detail.gearDmg', { bonus: courageBonus })}</span>
                              <span className="font-label text-xs text-on-surface-variant">{t('hub.boss.detail.gearCourage')}</span>
                            </div>
                          )}
                          {defenseBonus > 0 && (
                            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                                 style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                              <span className="material-symbols-outlined text-base" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>shield</span>
                              <span className="font-label font-bold text-xs" style={{ color: '#059669' }}>{t('hub.boss.detail.gearLoot', { bonus: defenseBonus })}</span>
                              <span className="font-label text-xs text-on-surface-variant">{t('hub.boss.detail.gearDefense')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Boss Tier Badge */}
                    {(() => {
                      const tier = BOSS_TIERS.find(bt => bt.id === bd.tier);
                      return tier ? (
                        <div className="flex items-center gap-2 mb-5">
                          <span className="text-sm">{tier.icon}</span>
                          <span className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: tier.color }}>
                            {t('hub.boss.detail.tierClass', { name: t('boss.tier.' + tier.id) })}
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* HP Bar */}
                    {!defeated ? (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-label font-bold text-xs text-error uppercase tracking-widest">{t('hub.boss.detail.hp')}</span>
                          <span className="font-label font-bold text-sm text-error">{state.boss.hp} / {state.boss.maxHp}</span>
                        </div>
                        <div className="w-full h-5 rounded-full overflow-hidden relative"
                             style={{ background: '#ffdad6', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                          <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                               style={{ width: `${hpPct}%`, background: 'linear-gradient(90deg, #ba1a1a, #ff6b6b)' }}>
                            <div className="absolute inset-0 opacity-30"
                                 style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px)', animation: 'slide 1s linear infinite' }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 text-center py-4 rounded-2xl" style={{ background: 'rgba(52,211,153,0.1)', border: '2px solid #34d399' }}>
                        <span className="material-symbols-outlined text-4xl mb-1 block" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        <p className="font-headline font-bold text-xl" style={{ color: '#059669' }}>{t('hub.boss.detail.bossDefeated')}</p>
                      </div>
                    )}

                    {/* Combat progress — damage log */}
                    {(state.bossDmgToday || 0) > 0 && (() => {
                      const doneQuests = (state.quests || []).filter(q => q.done && !q.sideQuest);
                      const dmgLog = doneQuests.map(q => ({
                        name: t('quest.' + q.id),
                        icon: q.icon || '',
                        dmg: Math.max(5, Math.floor((q.xp || 0) * 0.8)),
                      }));
                      return (
                        <div className="mb-6 rounded-2xl overflow-hidden"
                             style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                          {/* Header */}
                          <div className="flex items-center gap-3 p-4 pb-2">
                            <span className="material-symbols-outlined text-xl shrink-0" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>swords</span>
                            <div className="flex-1">
                              <p className="font-label font-bold text-sm" style={{ color: '#059669' }}>
                                {t('hub.boss.detail.power', { dmg: state.bossDmgToday })}
                              </p>
                            </div>
                          </div>
                          {/* Quest damage list */}
                          {dmgLog.length > 0 && (
                            <div className="px-4 pb-4 pt-1">
                              <div className="flex flex-col gap-1.5">
                                {dmgLog.map((entry, i) => (
                                  <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl"
                                       style={{ background: 'rgba(255,255,255,0.7)' }}>
                                    <span className="text-base">{entry.icon}</span>
                                    <span className="font-body text-xs text-on-surface flex-1 truncate">{entry.name}</span>
                                    <span className="font-label font-bold text-xs whitespace-nowrap" style={{ color: '#059669' }}>
                                      -{entry.dmg} HP
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Boss lore card */}
                    <div className="mb-6 rounded-2xl overflow-hidden"
                         style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      {artSrc && (
                        <img src={artSrc} alt={t('boss.' + bd.id)} className="w-full h-40 object-cover" />
                      )}
                      <div className="p-5">
                        <p className="font-label font-bold text-xs text-error uppercase tracking-widest">
                          {defeated ? t('hub.boss.detail.defeated') : t('hub.boss.detail.dailyBoss')}
                        </p>
                        <h3 className="font-headline font-bold text-2xl text-on-surface mt-1">{t('boss.' + bd.id)}</h3>
                        <p className="font-body text-on-surface-variant mt-2 leading-relaxed">{t('boss.' + bd.id + '.desc')}</p>
                      </div>
                    </div>

                    {/* Loot section */}
                    {defeated && (
                      <div className="mb-6">
                        <h4 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-3">{t('hub.boss.detail.loot')}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl text-center"
                               style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.1)' }}>
                            <span className="material-symbols-outlined text-2xl text-primary mb-1 block"
                                  style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                            <p className="font-label font-bold text-lg text-primary">+{bd.reward.hp}</p>
                            <p className="font-label text-xs text-on-surface-variant uppercase">{t('hub.boss.detail.heroPoints')}</p>
                          </div>
                          <div className="p-4 rounded-2xl text-center"
                               style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)' }}>
                            <span className="material-symbols-outlined text-2xl mb-1 block"
                                  style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            <p className="font-label font-bold text-lg" style={{ color: '#b45309' }}>+1</p>
                            <p className="font-label text-xs text-on-surface-variant uppercase">{t('hub.boss.detail.evoEssence')}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trophy Gallery */}
                    {(state.bossTrophies || []).length > 0 && (
                      <div className="mb-6 mm-card p-5">
                        <h4 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                          {t('hub.boss.detail.trophies')}
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {BOSSES.map(boss => {
                            const isDefeated = (state.bossTrophies || []).includes(boss.id);
                            const tier = BOSS_TIERS.find(bt => bt.id === boss.tier);
                            return (
                              <div key={boss.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                                   style={{
                                     background: isDefeated ? 'rgba(252,211,77,0.08)' : 'rgba(232,225,218,0.3)',
                                     border: isDefeated ? '1.5px solid rgba(252,211,77,0.3)' : '1.5px dashed rgba(204,195,215,0.3)',
                                     opacity: isDefeated ? 1 : 0.4,
                                   }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                     style={{
                                       background: isDefeated ? 'rgba(252,211,77,0.15)' : 'rgba(232,225,218,0.5)',
                                       boxShadow: isDefeated ? '0 0 12px rgba(252,211,77,0.2)' : 'none',
                                     }}>
                                  {isDefeated ? boss.icon : (
                                    <span className="material-symbols-outlined text-base" style={{ color: '#c0c8c9' }}>lock</span>
                                  )}
                                </div>
                                <span className="font-label font-bold text-xs text-center leading-tight text-on-surface"
                                      style={{ opacity: isDefeated ? 1 : 0.5 }}>
                                  {isDefeated ? t('boss.' + boss.id) : '???'}
                                </span>
                                {tier && isDefeated && (
                                  <span className="text-xs font-label font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ background: `${tier.color}15`, color: tier.color }}>
                                    {tier.icon}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="font-label text-xs text-on-surface-variant text-center mt-3">
                          {t('hub.boss.detail.bossCount', { done: (state.bossTrophies || []).length, total: BOSSES.length })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom CTA */}
                  <div className="fixed bottom-0 left-0 w-full z-50 p-6"
                       style={{ background: 'linear-gradient(to top, #fff8f2 70%, transparent)' }}>
                    <button onClick={() => setShowBossDetail(false)}
                      className="w-full max-w-lg mx-auto block py-4 rounded-full font-label font-extrabold text-lg active:scale-95 transition-all"
                      style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
                      {defeated ? t('hub.boss.detail.celebrate') : t('hub.boss.detail.keepFighting')}
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* ── Side Quests ── */}
        {(() => {
          const sideQuests = (state.quests || []).filter(q => q.sideQuest && !q.done);
          if (!sideQuests.length) return null;
          return (
            <div className="p-5 rounded-2xl"
                 style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">explore</span>
                <h4 className="font-bold text-sm font-label text-primary uppercase tracking-tight">{t('hub.sideQuests')}</h4>
              </div>
              <div className="flex flex-col gap-3">
                {sideQuests.slice(0, 3).map(q => (
                  <div key={q.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ background: 'rgba(18,67,70,0.05)' }}>
                      <span className="text-xl">{q.icon}</span>
                    </div>
                    <p className="font-body text-xs text-on-surface font-semibold flex-1">{t('quest.' + q.id)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Epic Missions Entry — Kristallgold ── */}
        {(() => {
          const hasActive = (state.activeMissions || []).length > 0;
          return (
            <button
              className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] relative overflow-hidden"
              style={{ background: '#451a03', border: '1.5px solid rgba(252,211,77,0.2)', boxShadow: '0 4px 20px rgba(69,26,3,0.25)' }}
              onClick={() => onNavigate?.('missions')}
            >
              <img src={base + 'art/tex-wolkengrat.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(69,26,3,0.55), rgba(120,53,15,0.45))' }} />
              <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: '3px solid #fcd34d', boxShadow: '0 0 12px rgba(252,211,77,0.3)' }}>
                <span className="material-symbols-outlined text-white text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
                {/* Red notification dot when no mission selected */}
                {!hasActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full animate-pulse"
                        style={{ background: '#ef4444', border: '2px solid #fcd34d', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />
                )}
              </div>
              <div className="relative z-10 flex-1">
                <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fcd34d' }}>{t('hub.missions.title')}</p>
                <h4 className="font-headline font-bold text-lg text-white">
                  {hasActive
                    ? t('hub.missions.active', { count: state.activeMissions.length })
                    : t('hub.missions.choose')}
                </h4>
              </div>
              <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: 'rgba(252,211,77,0.5)' }}>chevron_right</span>
            </button>
          );
        })()}

        {/* ── Latest Achievement Spotlight ── */}
        {(() => {
          const unlocked = state.unlockedBadges || [];
          if (unlocked.length === 0) return null;
          const latestId = unlocked[unlocked.length - 1];
          const badge = BADGES.find(b => b.id === latestId);
          if (!badge) return null;
          return (
            <button className="w-full p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden text-left active:scale-[0.98] transition-all"
                 style={{ border: '1.5px solid rgba(252,211,77,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                 onClick={() => onNavigate?.('kodex')}>
              {/* Background texture */}
              <img src={base + 'art/bg-achievement.webp'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none" />
              <div className="absolute inset-0 bg-white/70 pointer-events-none" />
              <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(252,211,77,0.2)', border: '2px solid rgba(252,211,77,0.4)' }}>
                <span className="text-3xl">{badge.i}</span>
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#92400e' }}>{t('hub.achievement.latest')}</p>
                <h4 className="font-headline font-bold text-lg truncate" style={{ color: '#1a1a1a' }}>{t('badge.' + badge.id)}</h4>
                <p className="font-body text-sm truncate" style={{ color: '#5c4813' }}>{t('badge.' + badge.id + '.desc')}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-xl" style={{ color: '#92400e' }}>chevron_right</span>
                <span className="font-label font-bold text-xs" style={{ color: '#78350f' }}>{unlocked.length}/{BADGES.length}</span>
              </div>
            </button>
          );
        })()}

        {/* ── Helden-Kodex Card — Morgenwald ── */}
        <button
          className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] relative overflow-hidden"
          style={{ background: '#fef9c3', border: '1.5px solid rgba(101,163,13,0.15)', boxShadow: '0 4px 16px rgba(101,163,13,0.08)' }}
          onClick={() => onNavigate?.('kodex')}
        >
          <img src={base + 'art/tex-morgenwald.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(254,249,195,0.55), rgba(236,252,203,0.5))' }} />
          <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, #65a30d, #84cc16)', boxShadow: '0 2px 8px rgba(101,163,13,0.3)' }}>
            <span className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div className="relative z-10 flex-1">
            <p className="font-headline font-bold text-lg" style={{ color: '#1a2e05' }}>{t('hub.kodex.title')}</p>
            <p className="font-body text-base" style={{ color: '#365314' }}>{t('hub.kodex.subtitle')}</p>
          </div>
          <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: '#4d7c0f' }}>chevron_right</span>
        </button>

        {/* ── Bodhi leaf ── */}
        <div className="flex justify-center py-2 opacity-20">
          <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
            <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#124346" />
          </svg>
        </div>
      </main>
    </div>
  );
}
