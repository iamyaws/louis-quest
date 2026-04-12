import React from 'react';
import { useTask } from '../context/TaskContext';
import { getCatStage } from '../utils/helpers';
import SFX from '../utils/sfx';

const STAGES = [
  { name: 'Ei', icon: 'egg_alt', threshold: 0 },
  { name: 'Baby', icon: 'child_care', threshold: 10 },
  { name: 'Jungtier', icon: 'pets', threshold: 30 },
  { name: 'Stolz', icon: 'leaderboard', threshold: 60 },
  { name: 'Legendär', icon: 'military_tech', threshold: 100 },
];

export default function Sanctuary() {
  const { state, actions } = useTask();
  const base = import.meta.env.BASE_URL;
  if (!state) return null;

  const evo = state.catEvo || 0;
  const currentStage = STAGES.reduce((acc, s, i) => evo >= s.threshold ? i : acc, 0);
  const nextStage = STAGES[currentStage + 1];
  const progressToNext = nextStage
    ? Math.min(100, ((evo - STAGES[currentStage].threshold) / (nextStage.threshold - STAGES[currentStage].threshold)) * 100)
    : 100;
  const allCareDone = state.catFed && state.catPetted && state.catPlayed;

  const handleCare = (action, sfx = 'pop') => {
    SFX.play(sfx);
    if (navigator.vibrate) navigator.vibrate(100);
    action();
  };

  return (
    <div className="relative min-h-screen pb-32">
      {/* Background */}
      <div className="fixed inset-0 -z-20">
        <img src={base + 'art/bg-golden.webp'} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(255,248,241,0.35)' }} />

      <main className="px-5 max-w-lg mx-auto pt-6">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg"
                 style={{ background: '#ebddff' }}>
              <img src={base + 'art/dragon-baby.webp'} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-headline font-bold text-primary" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>
              Sanctuary
            </span>
          </div>
          <span className="material-symbols-outlined text-primary/60 text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>

        {/* ── Companion Hero ── */}
        <section className="relative rounded-2xl overflow-hidden mb-6" style={{ minHeight: 320 }}>
          {/* Garden backdrop */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden"
               style={{ background: 'rgba(249,243,235,0.6)' }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[60px]"
                 style={{ background: 'rgba(252,211,77,0.2)' }} />
            <div className="absolute top-20 -left-10 w-32 h-32 rounded-full blur-[40px]"
                 style={{ background: 'rgba(83,0,183,0.1)' }} />
          </div>

          {/* Companion */}
          <div className="relative z-10 flex flex-col items-center pt-8 pb-6">
            <div className="w-56 h-56 flex items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-110"
                 style={{ filter: 'drop-shadow(0 20px 30px rgba(83,0,183,0.25))' }}>
              <img src={base + 'art/dragon-baby.webp'} alt="Ronki" className="w-full h-full object-contain" />
              {/* Sparkle */}
              <div className="absolute top-2 right-4 animate-bounce">
                <span className="material-symbols-outlined text-[#fcd34d]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
            </div>

            {/* Status bar */}
            <div className="w-full px-6 mt-4">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline font-bold text-lg text-primary">Ronki</span>
                <span className="font-label text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                  {STAGES[currentStage].name}
                </span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden p-0.5 shadow-inner"
                   style={{ background: 'rgba(255,255,255,0.6)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                     style={{ width: `${progressToNext}%`, background: 'linear-gradient(90deg, #5300b7, #6d28d9)' }} />
              </div>
              {nextStage && (
                <p className="text-xs font-label text-on-surface-variant mt-1.5 text-right">
                  Noch {nextStage.threshold - evo} Schritte bis {nextStage.name}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Care Actions ── */}
        <section className="grid grid-cols-3 gap-4 mb-8">
          {/* Feed */}
          <button
            className={`flex flex-col items-center gap-3 transition-all active:scale-90 ${state.catFed ? 'opacity-50' : ''}`}
            onClick={() => !state.catFed && handleCare(actions.feedCompanion)}
            disabled={state.catFed}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{
                   background: state.catFed ? '#d1fae5' : '#ffffff',
                   border: state.catFed ? '2px solid #34d399' : '2px solid rgba(83,0,183,0.05)',
                   boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                 }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catFed ? '#059669' : '#5300b7', fontVariationSettings: "'FILL' 1" }}>
                {state.catFed ? 'check_circle' : 'cookie'}
              </span>
            </div>
            <div className="text-center">
              <span className="block font-headline font-bold text-on-surface text-sm">Füttern</span>
              <span className="text-xs font-label font-bold" style={{ color: state.catFed ? '#059669' : '#fcd34d' }}>
                {state.catFed ? 'Erledigt!' : '+5 HP'}
              </span>
            </div>
          </button>

          {/* Pet — center, bigger */}
          <button
            className={`flex flex-col items-center gap-3 transition-all active:scale-90 ${state.catPetted ? 'opacity-50' : ''}`}
            onClick={() => !state.catPetted && handleCare(actions.petCompanion)}
            disabled={state.catPetted}
          >
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{
                   background: state.catPetted ? '#d1fae5' : '#fcd34d',
                   border: state.catPetted ? '2px solid #34d399' : 'none',
                   boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                 }}>
              <span className="material-symbols-outlined text-5xl"
                    style={{ color: state.catPetted ? '#059669' : '#725b00', fontVariationSettings: "'FILL' 1" }}>
                {state.catPetted ? 'check_circle' : 'favorite'}
              </span>
            </div>
            <div className="text-center">
              <span className="block font-headline font-bold text-on-surface text-sm">Streicheln</span>
              <span className="text-xs font-label font-bold" style={{ color: state.catPetted ? '#059669' : '#fcd34d' }}>
                {state.catPetted ? 'Erledigt!' : '+3 HP'}
              </span>
            </div>
          </button>

          {/* Play */}
          <button
            className={`flex flex-col items-center gap-3 transition-all active:scale-90 ${state.catPlayed ? 'opacity-50' : ''}`}
            onClick={() => !state.catPlayed && handleCare(actions.playCompanion)}
            disabled={state.catPlayed}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{
                   background: state.catPlayed ? '#d1fae5' : '#ffffff',
                   border: state.catPlayed ? '2px solid #34d399' : '2px solid rgba(83,0,183,0.05)',
                   boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                 }}>
              <span className="material-symbols-outlined text-4xl"
                    style={{ color: state.catPlayed ? '#059669' : '#5300b7', fontVariationSettings: "'FILL' 1" }}>
                {state.catPlayed ? 'check_circle' : 'sports_baseball'}
              </span>
            </div>
            <div className="text-center">
              <span className="block font-headline font-bold text-on-surface text-sm">Spielen</span>
              <span className="text-xs font-label font-bold" style={{ color: state.catPlayed ? '#059669' : '#fcd34d' }}>
                {state.catPlayed ? 'Erledigt!' : '+8 HP'}
              </span>
            </div>
          </button>
        </section>

        {/* ── All Care Done ── */}
        {allCareDone && (
          <div className="rounded-2xl p-5 mb-6 text-center"
               style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <span className="text-3xl">💚</span>
            <p className="font-headline font-bold text-lg mt-2" style={{ color: '#059669' }}>
              Ronki fühlt sich geliebt!
            </p>
            <p className="font-body text-sm text-on-surface-variant mt-1">
              Du hast heute alle Pflege-Aufgaben erledigt.
            </p>
          </div>
        )}

        {/* ── Evolution Path ── */}
        <section className="rounded-2xl p-6 relative overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
          <div className="absolute -bottom-4 -right-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">filter_vintage</span>
          </div>
          <h3 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_fix_high</span>
            Entwicklungspfad
          </h3>

          <div className="flex items-center justify-between relative">
            {/* Connection line */}
            <div className="absolute top-6 left-6 right-6 h-1 rounded-full" style={{ background: '#e8e1da' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                   style={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%`, background: 'linear-gradient(90deg, #34d399, #fcd34d)' }} />
            </div>

            {STAGES.map((stage, i) => {
              const unlocked = i <= currentStage;
              const active = i === currentStage;
              return (
                <div key={stage.name} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    active ? 'scale-125 shadow-lg' : ''
                  }`} style={{
                    background: unlocked ? (active ? '#fcd34d' : '#34d399') : '#e8e1da',
                    border: active ? '3px solid white' : 'none',
                  }}>
                    <span className="material-symbols-outlined text-xl"
                          style={{ color: unlocked ? 'white' : '#7b7486', fontVariationSettings: unlocked ? "'FILL' 1" : undefined }}>
                      {stage.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] font-label font-bold ${unlocked ? 'text-on-surface' : 'text-outline'}`}>
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bodhi leaf */}
        <div className="flex justify-center py-6 opacity-20">
          <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
            <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
          </svg>
        </div>
      </main>
    </div>
  );
}
