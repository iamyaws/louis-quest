import React, { useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import { Pearl } from './CurrencyIcons';
import GearVault from './GearVault';
import { ORB_MILESTONES, ORB_META } from '../constants';
import { useVoice } from '../companion/useVoice';
import VoiceBubble from './VoiceBubble';
import { useZones } from '../world/useZones';
import ZoneSelector from './ZoneSelector';
import { isDevMode } from '../utils/mode';

const STAGES = [
  { name: 'Ei', emoji: '🥚', threshold: 0 },
  { name: 'Baby', emoji: '🐣', threshold: 3 },      // Day 1: all 3 care actions
  { name: 'Jungtier', emoji: '🐲', threshold: 9 },   // ~Day 3
  { name: 'Stolz', emoji: '🔥', threshold: 18 },     // ~Day 6 (1 week)
  { name: 'Legendär', emoji: '⭐', threshold: 30 },  // ~Day 10
];

export default function Sanctuary({ onNavigate }) {
  const { t } = useTranslation();
  const { state, actions } = useTask();
  const haptic = useHaptic();
  const voice = useVoice();
  const zones = useZones();
  const base = import.meta.env.BASE_URL;
  const stageName = (i) => [t('companion.stage.egg'), t('companion.stage.baby'), t('companion.stage.juvenile'), t('companion.stage.pride'), t('companion.stage.legendary')][i];

  // One greeting when the Sanctuary view opens.
  useEffect(() => {
    voice.say('sanctuary_open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  const evo = state.catEvo || 0;
  const currentStage = STAGES.reduce((acc, s, i) => evo >= s.threshold ? i : acc, 0);
  const nextStage = STAGES[currentStage + 1];
  const progressPct = nextStage
    ? Math.min(100, ((evo - STAGES[currentStage].threshold) / (nextStage.threshold - STAGES[currentStage].threshold)) * 100)
    : 100;
  const allCareDone = state.catFed && state.catPetted && state.catPlayed;
  const careDoneCount = [state.catFed, state.catPetted, state.catPlayed].filter(Boolean).length;

  const handleCare = (action, careKey) => {
    SFX.play('pop');
    haptic('success');
    action();
    if (careKey) voice.say('care_action', { careAction: careKey });
  };

  return (
    <div className="relative min-h-dvh pb-32">
      {/* Soft painted backdrop — contained gold halo + teal wash, fades to cream so cards stay readable */}
      <div className="fixed inset-0 -z-20" style={{ background: '#fff8f2' }} />
      {/* Biome backdrop — crossfades when zone changes */}
      <div
        className="fixed inset-x-0 top-0 h-[60vh] -z-10 pointer-events-none"
        style={{
          backgroundImage: `url(${base}${zones.activeZone.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          filter: zones.activeZone.bgFilter !== 'none' ? zones.activeZone.bgFilter : undefined,
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.75) 45%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.75) 45%, transparent 100%)',
          opacity: 0.8,
          transition: 'background-image 0s, opacity 400ms ease',
        }}
        aria-hidden="true"
      />

      <main className="px-5 max-w-lg mx-auto"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>

        {/* Zone selector — lets Louis wander between Sanctuary / Meadow / Nebel-Höhle */}
        <div className="mb-4">
          <ZoneSelector
            zones={zones.zones}
            activeZone={zones.activeZone}
            lockedAttemptZoneId={zones.lockedAttemptZoneId}
            onSelect={zones.setActiveZone}
            isUnlocked={zones.isUnlocked}
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg"
                 style={{ background: '#a2d0d4' }}>
              <img src={base + 'art/companion/' + (['dragon-egg','dragon-baby','dragon-young','dragon-majestic','dragon-legendary'][currentStage] || 'dragon-baby') + '.webp'} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-headline font-bold text-primary" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>
              {t('care.sanctuary')}
            </span>
          </div>
          <span className="material-symbols-outlined text-2xl"
                style={{ color: 'rgba(18,67,70,0.6)', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>

        {/* Companion Hero */}
        <section className="relative rounded-[2.5rem] overflow-hidden mb-6 p-6 pb-8"
                 style={{ background: 'rgba(249,243,235,0.6)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[60px]"
               style={{ background: 'rgba(252,211,77,0.2)' }} />

          <div className="relative z-10 flex justify-between mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-label shadow-sm"
                 style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              {allCareDone ? t('care.status.loved') : t('care.status.happy')}
            </div>
            {/* Stage pill — dev only. Public mode keeps Ronki's identity stable
                 (one companion, no ladder). */}
            {isDevMode() && (
              <div className="px-3 py-1 rounded-full shadow-sm font-label text-xs font-bold text-primary"
                   style={{ background: 'rgba(255,255,255,0.9)' }}>
                {stageName(currentStage)}
              </div>
            )}
          </div>

          {voice.line && (
            <div className="flex justify-center mb-3">
              <VoiceBubble line={voice.line} onDismiss={voice.dismiss} variant="chip" />
            </div>
          )}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <img src={base + 'art/companion/' + (['dragon-egg','dragon-baby','dragon-young','dragon-majestic','dragon-legendary'][currentStage] || 'dragon-baby') + '.webp'} alt="Ronki" className="w-full h-full object-contain" />
            </div>
            <div className="w-full mt-4 text-center">
              <h2 className="font-headline font-bold text-2xl text-primary">Ronki</h2>
              <p className="text-xs font-label text-outline uppercase" style={{ letterSpacing: '0.2em' }}>{t('care.mysticCompanion')}</p>
              {/* Zone flavor — one painterly line that changes with location */}
              <p
                className="text-sm font-body mt-2 italic transition-opacity duration-500"
                style={{ color: zones.activeZone.accent, opacity: 0.85 }}
                key={zones.activeZone.id}
              >
                {zones.activeZone.emoji} {t(zones.activeZone.flavorKey)}
              </p>
              {/* Evolution progress bar — dev only. Care mechanics still run
                   in public (hunger, thirst, play) but without a stage ladder. */}
              {isDevMode() && (
                <>
                  <div className="h-3 w-full rounded-full overflow-hidden shadow-inner mt-3"
                       style={{ background: 'rgba(255,255,255,0.5)' }}>
                    <div className="h-full rounded-full" style={{ width: progressPct + '%', background: 'linear-gradient(90deg, #124346, #2d5a5e)' }} />
                  </div>
                  {nextStage && (
                    <p className="text-xs font-label text-on-surface-variant mt-2">
                      {t('care.stepsTo', { count: nextStage.threshold - evo, name: stageName(currentStage + 1) })}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Tamagotchi Stat Meters — painted parchment with gradient-washed bars */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          {/* Hunger */}
          <div className="rounded-2xl p-3"
               style={{
                 background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(254,243,199,0.6) 100%)',
                 border: '1.5px solid rgba(234,179,8,0.22)',
                 boxShadow: '0 4px 10px -4px rgba(18,67,70,0.1), inset 0 1px 0 rgba(255,255,255,0.7)',
               }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#d97706', fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              <span className="font-label font-bold text-outline uppercase" style={{ fontSize: '12px', letterSpacing: '0.15em' }}>{t('care.hunger')}</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: 'rgba(234,179,8,0.15)', boxShadow: 'inset 0 1px 2px rgba(161,98,7,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: state.catFed ? '85%' : '40%',
                background: 'linear-gradient(90deg, #fde68a, #fcd34d 60%, #eab308)',
                boxShadow: '0 0 8px rgba(252,211,77,0.5)',
              }} />
            </div>
          </div>
          {/* Glück */}
          <div className="rounded-2xl p-3"
               style={{
                 background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(254,226,226,0.6) 100%)',
                 border: '1.5px solid rgba(186,26,26,0.2)',
                 boxShadow: '0 4px 10px -4px rgba(18,67,70,0.1), inset 0 1px 0 rgba(255,255,255,0.7)',
               }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ba1a1a', fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <span className="font-label font-bold text-outline uppercase" style={{ fontSize: '12px', letterSpacing: '0.15em' }}>{t('care.happiness')}</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: 'rgba(186,26,26,0.12)', boxShadow: 'inset 0 1px 2px rgba(147,0,10,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: (allCareDone ? 95 : Math.min(95, careDoneCount * 30 + 5)) + '%',
                background: 'linear-gradient(90deg, #fecaca, #f87171 55%, #dc2626)',
                boxShadow: '0 0 8px rgba(239,68,68,0.45)',
              }} />
            </div>
          </div>
          {/* Energie */}
          <div className="rounded-2xl p-3"
               style={{
                 background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(209,234,226,0.6) 100%)',
                 border: '1.5px solid rgba(18,67,70,0.2)',
                 boxShadow: '0 4px 10px -4px rgba(18,67,70,0.1), inset 0 1px 0 rgba(255,255,255,0.7)',
               }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#124346', fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="font-label font-bold text-outline uppercase" style={{ fontSize: '12px', letterSpacing: '0.15em' }}>{t('care.energy')}</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: 'rgba(18,67,70,0.12)', boxShadow: 'inset 0 1px 2px rgba(11,45,47,0.15)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: state.catPlayed ? '60%' : '30%',
                background: 'linear-gradient(90deg, #a2d0d4, #5eead4 55%, #0d9488)',
                boxShadow: '0 0 8px rgba(94,234,212,0.5)',
              }} />
            </div>
          </div>
        </section>

        {/* Care Actions */}
        <section className="grid grid-cols-3 gap-4 mb-6">
          {/* Feed */}
          <button className={'flex flex-col items-center gap-3 active:scale-90' + (state.catFed ? ' opacity-50' : '')}
            onClick={() => !state.catFed && handleCare(actions.feedCompanion, 'fed')}
            disabled={state.catFed}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: state.catFed ? '#d1fae5' : '#ffffff', border: state.catFed ? '2px solid #34d399' : '1px solid rgba(18,67,70,0.05)' }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catFed ? '#059669' : '#124346', fontVariationSettings: "'FILL' 1" }}>
                {state.catFed ? 'check_circle' : 'cookie'}
              </span>
            </div>
            <span className="font-headline font-bold text-sm">{t('care.feed')}</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ background: 'white' }}>
              {state.catFed
                ? <span className="text-xs font-label font-bold" style={{ color: '#059669' }}>{t('care.done')}</span>
                : <React.Fragment><Pearl size={12} /><span className="text-xs font-label font-bold" style={{ color: '#735c00' }}>+5</span></React.Fragment>
              }
            </div>
          </button>

          {/* Pet */}
          <button className={'flex flex-col items-center gap-3 active:scale-90' + (state.catPetted ? ' opacity-50' : '')}
            onClick={() => !state.catPetted && handleCare(actions.petCompanion, 'petted')}
            disabled={state.catPetted}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: state.catPetted ? '#d1fae5' : '#ffffff', border: state.catPetted ? '2px solid #34d399' : '1px solid rgba(18,67,70,0.05)' }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catPetted ? '#059669' : '#725b00', fontVariationSettings: "'FILL' 1" }}>
                {state.catPetted ? 'check_circle' : 'favorite'}
              </span>
            </div>
            <span className="font-headline font-bold text-sm">{t('care.pet')}</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ background: 'white' }}>
              {state.catPetted
                ? <span className="text-xs font-label font-bold" style={{ color: '#059669' }}>{t('care.done')}</span>
                : <React.Fragment><Pearl size={12} /><span className="text-xs font-label font-bold" style={{ color: '#735c00' }}>+3</span></React.Fragment>
              }
            </div>
          </button>

          {/* Play */}
          <button className={'flex flex-col items-center gap-3 active:scale-90' + (state.catPlayed ? ' opacity-50' : '')}
            onClick={() => !state.catPlayed && handleCare(actions.playCompanion, 'played')}
            disabled={state.catPlayed}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: state.catPlayed ? '#d1fae5' : '#ffffff', border: state.catPlayed ? '2px solid #34d399' : '1px solid rgba(18,67,70,0.05)' }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catPlayed ? '#059669' : '#124346', fontVariationSettings: "'FILL' 1" }}>
                {state.catPlayed ? 'check_circle' : 'sports_baseball'}
              </span>
            </div>
            <span className="font-headline font-bold text-sm">{t('care.play')}</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ background: 'white' }}>
              {state.catPlayed
                ? <span className="text-xs font-label font-bold" style={{ color: '#059669' }}>{t('care.done')}</span>
                : <React.Fragment><Pearl size={12} /><span className="text-xs font-label font-bold" style={{ color: '#735c00' }}>+8</span></React.Fragment>
              }
            </div>
          </button>
        </section>

        {/* Wohlbefinden */}
        <section className="rounded-3xl p-6 mb-6 relative overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
          <h3 className="font-headline font-bold text-xl mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
            {t('care.wellbeing')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(249,243,235,0.8)', border: '1px solid white' }}>
              <span className="text-xs font-label font-bold text-outline uppercase">{t('hub.boss.detail.heroPoints')}</span>
              <div className="flex items-center gap-2 mt-1">
                <Pearl size={24} />
                <span className="text-2xl font-headline font-bold">{state.hp || 0}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(249,243,235,0.8)', border: '1px solid white' }}>
              <span className="text-xs font-label font-bold text-outline uppercase">{t('care.affection')}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>heart_check</span>
                <span className="text-2xl font-headline font-bold">{allCareDone ? 'Max' : careDoneCount + '/3'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gear Vault — dev only, and only when player has at least 1 gear item ── */}
        {isDevMode() && (
          (state.equippedGear && Object.values(state.equippedGear).some(Boolean)) || (state.gearInventory || []).length > 0
            ? <GearVault />
            : null
        )}

        {/* ── Wachstums-Orbs — hidden for now, de-emphasized until Phase 2 rework ── */}
        {/* <OrbsSection state={state} nextStage={nextStage} progressPct={progressPct} evo={evo} /> */}

        {/* ── Ronkis Freunde — game-card style ── */}
        <button
          className="w-full rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-all"
          style={{ background: 'linear-gradient(160deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)', boxShadow: '0 4px 16px rgba(252,211,77,0.3)' }}
          onClick={() => onNavigate?.('micropedia')}
        >
          <span className="text-4xl select-none shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>🐾</span>
          <div className="flex-1">
            <h3 className="font-headline font-bold text-lg" style={{ color: '#78350f' }}>Ronkis Freunde</h3>
            <p className="font-body text-sm mt-0.5" style={{ color: '#78350f99' }}>Entdecke neue Freunde!</p>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
               style={{ background: '#ffffff', border: '2.5px solid rgba(120,53,15,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <span className="material-symbols-outlined text-xl" style={{ color: '#78350f', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </div>
        </button>

        {/* Evolution Path — dev only. This is the biggest surface that makes
             Ronki feel like a progression ladder; public mode hides it entirely. */}
        {isDevMode() && (
        <section className="rounded-2xl p-6 relative overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
          <h3 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
            {t('care.evolutionPath')}
          </h3>

          <div className="relative flex flex-col items-center space-y-12">
            {/* Vertical connecting line behind circles */}
            <div className="absolute left-1/2 top-10 bottom-10 w-1 -translate-x-1/2 rounded-full overflow-hidden" style={{ background: '#e8e1da' }}>
              <div className="w-full rounded-full transition-all duration-700" style={{ height: (currentStage / (STAGES.length - 1)) * 100 + '%', background: 'linear-gradient(180deg, #34d399, #fcd34d)' }} />
            </div>

            {STAGES.map((stage, i) => {
              const isCompleted = i < currentStage;
              const isCurrent = i === currentStage;
              const isLocked = i > currentStage;
              const alignSide = i % 2 === 0 ? 'flex-row' : 'flex-row-reverse';

              return (
                <div key={stage.name} className={'relative z-10 flex items-center gap-4 w-full ' + alignSide}>
                  {/* Stage circle */}
                  <div className="flex-1 flex items-center" style={{ justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                    <span className={'font-label font-bold' + (isLocked ? ' text-outline opacity-40' : isCompleted ? ' text-on-surface' : ' font-headline')}
                          style={{ fontSize: isCurrent ? '14px' : '12px', color: isCurrent ? '#725b00' : undefined }}>
                      {stageName(i)}
                    </span>
                  </div>

                  <div className="relative flex-shrink-0">
                    {/* Badge */}
                    {isCompleted && (
                      <span className="absolute -top-3 left-1/2 font-black font-label px-2 py-0.5 rounded-full z-20 shadow-sm whitespace-nowrap"
                            style={{ background: '#059669', color: 'white', transform: 'translateX(-50%)', fontSize: '12px', letterSpacing: '0.1em' }}>{t('care.stageComplete')}</span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 font-black font-label px-2 py-0.5 rounded-full z-20 shadow-sm whitespace-nowrap animate-pulse"
                            style={{ background: '#735c00', color: 'white', transform: 'translateX(-50%)', fontSize: '12px', letterSpacing: '0.1em' }}>{t('care.stageCurrent')}</span>
                    )}

                    <div className={'rounded-full flex items-center justify-center transition-all duration-300'
                          + (isCurrent ? ' shadow-xl' : isCompleted ? ' shadow-md' : '')}
                         style={{
                           width: isCurrent ? '7rem' : '5rem',
                           height: isCurrent ? '7rem' : '5rem',
                           background: isCompleted ? '#d1fae5' : isCurrent ? '#fffbeb' : '#e8e1da',
                           border: isCompleted ? '3px solid #34d399' : isCurrent ? '3px solid #fcd34d' : '2px solid #d5cdc5',
                           opacity: isLocked ? 0.4 : 1,
                           filter: isLocked ? 'grayscale(1)' : 'none',
                         }}>
                      <span style={{ fontSize: isCurrent ? '2.5rem' : '1.75rem' }}>{stage.emoji}</span>
                    </div>

                    {/* Sparkle on current */}
                    {isCurrent && (
                      <span className="absolute -right-1 -bottom-1 material-symbols-outlined animate-spin text-sm"
                            style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1", animationDuration: '3s' }}>auto_awesome</span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center" style={{ justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                    {isCompleted && (
                      <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                    {isCurrent && nextStage && (
                      <span className="text-xs font-label text-on-surface-variant text-center" style={{ maxWidth: '6rem' }}>
                        {t('care.questsTo', { count: nextStage.threshold - evo, name: stageName(currentStage + 1) })}
                      </span>
                    )}
                    {isLocked && (
                      <span className="material-symbols-outlined opacity-40" style={{ color: '#9e9e9e', fontSize: '20px' }}>lock</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        )}

      </main>
    </div>
  );
}

// ── Orbs Detail Section with Milestones ──
function OrbsSection({ state, nextStage, progressPct, evo }) {
  const { t } = useTranslation();
  const stageName = (i) => [t('companion.stage.egg'), t('companion.stage.baby'), t('companion.stage.juvenile'), t('companion.stage.pride'), t('companion.stage.legendary')][i];
  const [expandedOrb, setExpandedOrb] = useState(null);
  const orbs = state.orbs || { vitality: 0, radiance: 0, patience: 0, wisdom: 0 };
  const totalOrbs = Object.values(orbs).reduce((a, b) => a + b, 0);

  return (
    <section className="rounded-2xl p-6 mb-6 relative overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
      <h3 className="font-headline font-bold text-xl mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>blur_on</span>
        {t('care.growthOrbs')}
      </h3>
      <p className="text-xs font-label text-on-surface-variant mb-5">
        {t('care.orbsHint')}
      </p>

      {/* Total orb count badge */}
      <div className="flex items-center justify-center mb-5">
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full"
             style={{ background: 'rgba(18,67,70,0.06)', border: '1px solid rgba(18,67,70,0.1)' }}>
          <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          <span className="font-headline font-bold text-lg text-primary">{totalOrbs}</span>
          <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{t('care.total')}</span>
        </div>
      </div>

      {/* Orb Cards */}
      <div className="flex flex-col gap-3 mb-5">
        {ORB_META.map(orb => {
          const count = orbs[orb.key] || 0;
          const collected = count > 0;
          const isExpanded = expandedOrb === orb.key;
          // Find current and next milestone
          const currentMilestone = [...ORB_MILESTONES].reverse().find(m => count >= m.threshold);
          const milestoneIndex = currentMilestone ? ORB_MILESTONES.indexOf(currentMilestone) : -1;
          const nextMilestone = ORB_MILESTONES.find(m => count < m.threshold);
          const milestonePct = nextMilestone ? Math.min(1, count / nextMilestone.threshold) : 1;

          return (
            <div key={orb.key}>
              <button onClick={() => setExpandedOrb(isExpanded ? null : orb.key)}
                className="w-full rounded-xl p-4 flex items-center gap-3 transition-all text-left active:scale-[0.98]"
                style={{
                  background: collected ? orb.bg : 'rgba(232,225,218,0.3)',
                  border: isExpanded ? `2px solid ${orb.border}` : collected ? `1.5px solid ${orb.border}` : '1.5px dashed rgba(204,195,215,0.4)',
                  opacity: collected ? 1 : 0.6,
                  boxShadow: isExpanded ? `0 4px 16px ${orb.color}15` : 'none',
                }}>
                {/* Orb icon with mini ring */}
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke={orb.color} strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - milestonePct)}
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl"
                          style={{ color: collected ? orb.color : '#9e9e9e', fontVariationSettings: "'FILL' 1" }}>
                      {orb.icon}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-headline font-bold text-sm text-on-surface">{t('stat.' + orb.key)}</p>
                    {currentMilestone && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-label font-bold uppercase tracking-wider text-white"
                            style={{ background: orb.color }}>
                        {t('orb.milestone.' + milestoneIndex)}
                      </span>
                    )}
                  </div>
                  <p className="font-label text-xs text-on-surface-variant">{t('stat.' + orb.key + '.desc')}</p>
                </div>

                <span className="font-headline font-bold text-2xl" style={{ color: collected ? orb.color : '#c0c8c9' }}>
                  {count}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant/40 text-sm transition-transform"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                  expand_more
                </span>
              </button>

              {/* Expanded milestone progress */}
              {isExpanded && (
                <div className="mt-2 mx-2 p-4 rounded-xl space-y-3"
                     style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${orb.border}` }}>
                  {ORB_MILESTONES.map((ms, i) => {
                    const reached = count >= ms.threshold;
                    const isCurrent = !reached && (i === 0 || count >= ORB_MILESTONES[i - 1].threshold);
                    const pct = reached ? 100 : isCurrent ? (count / ms.threshold) * 100 : 0;
                    return (
                      <div key={ms.threshold} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                             style={{
                               background: reached ? orb.color : 'rgba(232,225,218,0.5)',
                               boxShadow: reached ? `0 0 8px ${orb.color}40` : 'none',
                             }}>
                          <span className="material-symbols-outlined text-sm"
                                style={{ color: reached ? '#ffffff' : '#c0c8c9', fontVariationSettings: "'FILL' 1" }}>
                            {reached ? 'check' : ms.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-label font-bold text-xs uppercase tracking-widest"
                                  style={{ color: reached ? orb.color : '#707979' }}>
                              {t('orb.milestone.' + i)} — {ms.threshold} Orbs
                            </span>
                            <span className="font-label text-xs font-bold" style={{ color: '#fcd34d' }}>
                              +{ms.reward}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                            <div className="h-full rounded-full transition-all duration-500"
                                 style={{ width: `${pct}%`, background: reached ? orb.color : isCurrent ? `${orb.color}80` : 'transparent' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next evolution preview */}
      {nextStage && (
        <div className="flex items-center gap-4 p-4 rounded-xl"
             style={{ background: 'rgba(249,243,235,0.8)', border: '1px solid white' }}>
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="27" fill="transparent" stroke="rgba(18,67,70,0.1)" strokeWidth="5" />
              <circle cx="32" cy="32" r="27" fill="transparent" stroke="#2d5a5e"
                strokeWidth="5" strokeLinecap="round"
                strokeDasharray="170" strokeDashoffset={170 - (progressPct / 100) * 170} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: '1.5rem', filter: 'blur(1px) grayscale(0.5)', opacity: 0.6 }}>{nextStage.emoji}</span>
            </div>
          </div>
          <div>
            <p className="font-label font-bold text-xs text-outline uppercase tracking-widest">{t('care.nextStage')}</p>
            <p className="font-headline font-bold text-lg text-primary">{stageName(STAGES.indexOf(nextStage))}</p>
            <p className="text-xs font-label text-on-surface-variant">{t('care.stepsMore', { count: nextStage.threshold - evo })}</p>
          </div>
        </div>
      )}
    </section>
  );
}
