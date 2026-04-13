import React from 'react';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';
import { Pearl } from './CurrencyIcons';

const STAGES = [
  { name: 'Ei', emoji: '🥚', threshold: 0 },
  { name: 'Baby', emoji: '🐣', threshold: 10 },
  { name: 'Jungtier', emoji: '🐲', threshold: 30 },
  { name: 'Stolz', emoji: '🔥', threshold: 60 },
  { name: 'Legendär', emoji: '⭐', threshold: 100 },
];

export default function Sanctuary() {
  const { state, actions } = useTask();
  const base = import.meta.env.BASE_URL;
  if (!state) return null;

  const evo = state.catEvo || 0;
  const currentStage = STAGES.reduce((acc, s, i) => evo >= s.threshold ? i : acc, 0);
  const nextStage = STAGES[currentStage + 1];
  const progressPct = nextStage
    ? Math.min(100, ((evo - STAGES[currentStage].threshold) / (nextStage.threshold - STAGES[currentStage].threshold)) * 100)
    : 100;
  const allCareDone = state.catFed && state.catPetted && state.catPlayed;
  const careDoneCount = [state.catFed, state.catPetted, state.catPlayed].filter(Boolean).length;

  const handleCare = (action) => {
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(100);
    action();
  };

  return (
    <div className="relative min-h-screen pb-32">
      <div className="fixed inset-0 -z-20">
        <img src={base + 'art/bg-golden.webp'} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(255,248,241,0.35)' }} />

      <main className="px-5 max-w-lg mx-auto pt-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg"
                 style={{ background: '#ebddff' }}>
              <img src={base + (currentStage === 0 ? 'art/egg-glow.webp' : 'art/dragon-baby.webp')} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-headline font-bold text-primary" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>
              Magical Sanctuary
            </span>
          </div>
          <span className="material-symbols-outlined text-2xl"
                style={{ color: 'rgba(83,0,183,0.6)', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
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
              {allCareDone ? 'Geliebt!' : 'Glücklich'}
            </div>
            <div className="px-3 py-1 rounded-full shadow-sm font-label text-xs font-bold text-primary"
                 style={{ background: 'rgba(255,255,255,0.9)' }}>
              {STAGES[currentStage].name}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-56 h-56 flex items-center justify-center">
              <img src={base + (currentStage === 0 ? 'art/egg-glow.webp' : 'art/dragon-baby.webp')} alt="Ronki" className="w-full h-full object-contain" />
            </div>
            <div className="w-full mt-4 text-center">
              <h2 className="font-headline font-bold text-2xl text-primary">Ronki</h2>
              <p className="text-xs font-label text-outline uppercase" style={{ letterSpacing: '0.2em' }}>Mystic Companion</p>
              <div className="h-3 w-full rounded-full overflow-hidden shadow-inner mt-3"
                   style={{ background: 'rgba(255,255,255,0.5)' }}>
                <div className="h-full rounded-full" style={{ width: progressPct + '%', background: 'linear-gradient(90deg, #5300b7, #6d28d9)' }} />
              </div>
              {nextStage && (
                <p className="text-xs font-label text-on-surface-variant mt-2">
                  Noch {nextStage.threshold - evo} bis <strong>{nextStage.name}</strong>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Tamagotchi Stat Meters */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          {/* Hunger */}
          <div className="rounded-2xl p-3 shadow-sm" style={{ background: '#ffffff', border: '1px solid rgba(83,0,183,0.05)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              <span className="font-label font-bold text-outline uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>Hunger</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(252,211,77,0.2)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: state.catFed ? '85%' : '40%', background: '#fcd34d' }} />
            </div>
          </div>
          {/* Glück */}
          <div className="rounded-2xl p-3 shadow-sm" style={{ background: '#ffffff', border: '1px solid rgba(83,0,183,0.05)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ba1a1a', fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <span className="font-label font-bold text-outline uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>Glück</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(186,26,26,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: (allCareDone ? 95 : Math.min(95, careDoneCount * 30 + 5)) + '%', background: '#ba1a1a' }} />
            </div>
          </div>
          {/* Energie */}
          <div className="rounded-2xl p-3 shadow-sm" style={{ background: '#ffffff', border: '1px solid rgba(83,0,183,0.05)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#5300b7', fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="font-label font-bold text-outline uppercase" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>Energie</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(83,0,183,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: state.catPlayed ? '60%' : '30%', background: '#5300b7' }} />
            </div>
          </div>
        </section>

        {/* Care Actions */}
        <section className="grid grid-cols-3 gap-4 mb-6">
          {/* Feed */}
          <button className={'flex flex-col items-center gap-3 active:scale-90' + (state.catFed ? ' opacity-50' : '')}
            onClick={() => !state.catFed && handleCare(actions.feedCompanion)}
            disabled={state.catFed}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: state.catFed ? '#d1fae5' : '#ffffff', border: state.catFed ? '2px solid #34d399' : '1px solid rgba(83,0,183,0.05)' }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catFed ? '#059669' : '#5300b7', fontVariationSettings: "'FILL' 1" }}>
                {state.catFed ? 'check_circle' : 'cookie'}
              </span>
            </div>
            <span className="font-headline font-bold text-sm">Füttern</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ background: 'white' }}>
              {state.catFed
                ? <span className="text-xs font-label font-bold" style={{ color: '#059669' }}>Erledigt!</span>
                : <React.Fragment><Pearl size={12} /><span className="text-xs font-label font-bold" style={{ color: '#735c00' }}>5 HP</span></React.Fragment>
              }
            </div>
          </button>

          {/* Pet */}
          <button className={'flex flex-col items-center gap-3 active:scale-90' + (state.catPetted ? ' opacity-50' : '')}
            onClick={() => !state.catPetted && handleCare(actions.petCompanion)}
            disabled={state.catPetted}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: state.catPetted ? '#d1fae5' : '#fcd34d', border: state.catPetted ? '2px solid #34d399' : 'none' }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catPetted ? '#059669' : '#725b00', fontVariationSettings: "'FILL' 1" }}>
                {state.catPetted ? 'check_circle' : 'favorite'}
              </span>
            </div>
            <span className="font-headline font-bold text-sm">Streicheln</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ background: 'white' }}>
              {state.catPetted
                ? <span className="text-xs font-label font-bold" style={{ color: '#059669' }}>Erledigt!</span>
                : <React.Fragment><Pearl size={12} /><span className="text-xs font-label font-bold" style={{ color: '#735c00' }}>3 HP</span></React.Fragment>
              }
            </div>
          </button>

          {/* Play */}
          <button className={'flex flex-col items-center gap-3 active:scale-90' + (state.catPlayed ? ' opacity-50' : '')}
            onClick={() => !state.catPlayed && handleCare(actions.playCompanion)}
            disabled={state.catPlayed}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: state.catPlayed ? '#d1fae5' : '#ffffff', border: state.catPlayed ? '2px solid #34d399' : '1px solid rgba(83,0,183,0.05)' }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catPlayed ? '#059669' : '#5300b7', fontVariationSettings: "'FILL' 1" }}>
                {state.catPlayed ? 'check_circle' : 'sports_baseball'}
              </span>
            </div>
            <span className="font-headline font-bold text-sm">Spielen</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ background: 'white' }}>
              {state.catPlayed
                ? <span className="text-xs font-label font-bold" style={{ color: '#059669' }}>Erledigt!</span>
                : <React.Fragment><Pearl size={12} /><span className="text-xs font-label font-bold" style={{ color: '#735c00' }}>8 HP</span></React.Fragment>
              }
            </div>
          </button>
        </section>

        {/* Wohlbefinden */}
        <section className="rounded-3xl p-6 mb-6 relative overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
          <h3 className="font-headline font-bold text-xl mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
            Tägliches Wohlbefinden
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(249,243,235,0.8)', border: '1px solid white' }}>
              <span className="text-xs font-label font-bold text-outline uppercase">Heldenpunkte</span>
              <div className="flex items-center gap-2 mt-1">
                <Pearl size={24} />
                <span className="text-2xl font-headline font-bold">{state.hp || 0}</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(249,243,235,0.8)', border: '1px solid white' }}>
              <span className="text-xs font-label font-bold text-outline uppercase">Zuneigung</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>heart_check</span>
                <span className="text-2xl font-headline font-bold">{allCareDone ? 'Max' : careDoneCount + '/3'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Wachstums-Orbs ── */}
        <section className="rounded-2xl p-6 mb-6 relative overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
          <h3 className="font-headline font-bold text-xl mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>blur_on</span>
            Wachstums-Orbs
          </h3>
          <p className="text-xs font-label text-on-surface-variant mb-5">Sammle Orbs durch Quests für die Evolution!</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { key: 'vitality', name: 'Vitalität', icon: 'favorite', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)' },
              { key: 'radiance', name: 'Leuchten', icon: 'light_mode', color: '#fcd34d', bg: 'rgba(252,211,77,0.12)', border: 'rgba(252,211,77,0.4)' },
              { key: 'patience', name: 'Geduld', icon: 'self_improvement', color: '#5300b7', bg: 'rgba(83,0,183,0.06)', border: 'rgba(83,0,183,0.15)' },
              { key: 'wisdom', name: 'Weisheit', icon: 'psychology', color: '#00CEC9', bg: 'rgba(0,206,201,0.1)', border: 'rgba(0,206,201,0.3)' },
            ].map(orb => {
              const count = (state.orbs || {})[orb.key] || 0;
              const collected = count > 0;
              return (
                <div key={orb.key}
                  className="relative rounded-xl p-4 flex items-center gap-3 transition-all"
                  style={{
                    background: collected ? orb.bg : 'transparent',
                    border: collected ? `2px solid ${orb.border}` : '2px dashed rgba(204,195,215,0.4)',
                    opacity: collected ? 1 : 0.5,
                  }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: collected ? orb.color + '22' : 'rgba(232,225,218,0.5)' }}>
                    <span className="material-symbols-outlined text-xl"
                          style={{ color: collected ? orb.color : '#9e9e9e', fontVariationSettings: "'FILL' 1" }}>
                      {orb.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label font-bold text-xs" style={{ color: collected ? orb.color : '#7b7486' }}>{orb.name}</p>
                    <p className="font-headline font-bold text-lg text-on-surface">{count}</p>
                  </div>
                  {collected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white font-label font-bold shadow-md"
                         style={{ background: orb.color, fontSize: '10px' }}>
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next stage preview with progress ring */}
          {nextStage && (
            <div className="flex items-center gap-4 p-4 rounded-xl"
                 style={{ background: 'rgba(249,243,235,0.8)', border: '1px solid white' }}>
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="27" fill="transparent" stroke="rgba(83,0,183,0.1)" strokeWidth="5" />
                  <circle cx="32" cy="32" r="27" fill="transparent" stroke="#6d28d9"
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="170" strokeDashoffset={170 - (progressPct / 100) * 170} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontSize: '1.5rem', filter: 'blur(1px) grayscale(0.5)', opacity: 0.6 }}>{nextStage.emoji}</span>
                </div>
              </div>
              <div>
                <p className="font-label font-bold text-[10px] text-outline uppercase tracking-widest">Nächste Stufe</p>
                <p className="font-headline font-bold text-lg text-primary">{nextStage.name}</p>
                <p className="text-xs font-label text-on-surface-variant">
                  Noch {nextStage.threshold - evo} Schritte
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Evolution Path — Vertical Winding */}
        <section className="rounded-2xl p-6 relative overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
          <h3 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
            Entwicklungspfad
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
                      {stage.name}
                    </span>
                  </div>

                  <div className="relative flex-shrink-0">
                    {/* Badge */}
                    {isCompleted && (
                      <span className="absolute -top-3 left-1/2 font-black font-label px-2 py-0.5 rounded-full z-20 shadow-sm whitespace-nowrap"
                            style={{ background: '#059669', color: 'white', transform: 'translateX(-50%)', fontSize: '8px', letterSpacing: '0.1em' }}>FERTIG</span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 font-black font-label px-2 py-0.5 rounded-full z-20 shadow-sm whitespace-nowrap animate-pulse"
                            style={{ background: '#735c00', color: 'white', transform: 'translateX(-50%)', fontSize: '8px', letterSpacing: '0.1em' }}>AKTUELL</span>
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
                        Noch {nextStage.threshold - evo} Quests bis <strong>{nextStage.name}</strong>
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

      </main>
    </div>
  );
}
