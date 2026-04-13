import React, { useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';

// ── Evolution Celebration ──
function EvolutionCelebration({ stage, name, emoji, onDismiss }) {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-16 pb-24 text-center">
      {/* Gold dust texture */}
      <img src={import.meta.env.BASE_URL + 'art/bg-gold-dust.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
      {/* Background motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 opacity-5">
          <span className="material-symbols-outlined" style={{ fontSize: '15rem' }}>energy_savings_leaf</span>
        </div>
        <div className="absolute bottom-20 -right-20 opacity-5">
          <span className="material-symbols-outlined" style={{ fontSize: '20rem' }}>filter_vintage</span>
        </div>
      </div>

      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Sparkle gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none z-0"
             style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.4) 0%, rgba(109,40,217,0) 70%)' }} />

        {/* Evolution illustration */}
        <div className="relative z-10 mb-8 p-4">
          <div className="relative w-64 h-64 mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={import.meta.env.BASE_URL + 'art/dragon-baby.webp'} alt="Evolution"
                   className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            {/* Floating motifs */}
            <div className="absolute -top-4 -right-4 text-secondary-container">
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div className="absolute bottom-8 -left-8 text-primary-container opacity-60">
              <span className="material-symbols-outlined text-4xl">auto_awesome</span>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="relative z-10 space-y-4 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-2"
               style={{ background: 'rgba(252,211,77,0.2)' }}>
            <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <span className="text-secondary font-bold text-xs tracking-widest uppercase">Level Aufgestiegen</span>
          </div>
          <h2 className="font-headline font-bold text-5xl text-primary leading-tight">
            Evolution vollendet!
          </h2>
          <p className="font-body text-xl text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Dein <span className="font-bold text-primary">Ronki</span> ist jetzt: <span className="font-bold text-primary">{name}</span> {emoji}
          </p>
        </div>

        {/* Stats cards */}
        <div className="relative z-10 w-full mt-12 grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl text-left" style={{ boxShadow: '0 8px 24px rgba(30,27,23,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">bolt</span>
              <span className="text-on-surface-variant font-bold text-sm">Energie</span>
            </div>
            <div className="text-2xl font-headline font-bold text-on-surface">+250</div>
          </div>
          <div className="bg-white p-6 rounded-2xl text-left translate-y-4" style={{ boxShadow: '0 8px 24px rgba(30,27,23,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary">favorite</span>
              <span className="text-on-surface-variant font-bold text-sm">Bindung</span>
            </div>
            <div className="text-2xl font-headline font-bold text-on-surface">Stufe {(stage || 0) + 1}</div>
          </div>
        </div>

        {/* CTA */}
        <div className="relative z-10 mt-16 w-full px-4">
          <button onClick={onDismiss}
            className="w-full bg-primary-container text-white py-5 rounded-full font-headline font-bold text-xl active:scale-95 transition-all flex items-center justify-center gap-3">
            Weiter geht's
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </main>
  );
}

// ── Task Completion / Level Up ──
function LevelUpCelebration({ level, onDismiss }) {
  return (
    <main className="min-h-screen w-full max-w-2xl px-6 pt-24 pb-32 flex flex-col items-center justify-center relative overflow-hidden mx-auto">
      {/* Gold dust texture */}
      <img src={import.meta.env.BASE_URL + 'art/bg-gold-dust.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
      {/* Ambient blurs */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(252,211,77,0.1)' }} />
      <div className="absolute bottom-24 -right-12 w-48 h-48 rounded-full blur-2xl" style={{ background: 'rgba(18,67,70,0.05)' }} />

      <div className="relative z-10 w-full flex flex-col items-center text-center">
        {/* Sparkle checkmark */}
        <div className="relative mb-8">
          <div className="absolute -inset-8 flex items-center justify-center opacity-40">
            <span className="material-symbols-outlined text-secondary text-6xl absolute -top-4 -left-4">auto_awesome</span>
            <span className="material-symbols-outlined text-secondary text-5xl absolute top-8 -right-8">stars</span>
          </div>
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative z-10"
               style={{ boxShadow: '0 8px 24px rgba(30,27,23,0.06)' }}>
            <div className="flex flex-col items-center">
              <span className="font-headline font-bold text-5xl text-primary">{level}</span>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">Level</span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="font-headline font-bold text-5xl text-on-surface mb-6 tracking-tight">Level Up!</h2>

        {/* Reward card */}
        <div className="rounded-2xl p-8 w-full max-w-sm mb-12 flex flex-col items-center relative"
             style={{ background: '#f9f2ec', boxShadow: '0 8px 24px rgba(30,27,23,0.06)' }}>
          <div className="absolute bottom-2 right-2 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: '60px' }}>filter_vintage</span>
          </div>
          <div className="mb-4 relative">
            <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: '#fcd34d' }} />
            <span className="material-symbols-outlined relative z-10 text-secondary" style={{ fontSize: '5rem', fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </div>
          <p className="font-body text-lg text-on-surface/80 leading-relaxed max-w-[240px]">
            Du bist jetzt <span className="font-bold text-on-surface">Level {level}</span>! Deine Macht wächst!
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={onDismiss}
            className="bg-primary-container text-white font-headline font-bold text-xl px-8 py-5 rounded-full active:scale-95 transition-all"
            style={{ boxShadow: '0 8px 24px rgba(18,67,70,0.2)' }}>
            Stark!
          </button>
        </div>
      </div>
    </main>
  );
}

// ── Victory / All Quests Done ──
function VictoryCelebration({ onDismiss }) {
  const { state, computed } = useTask();
  const streak = state?.sd || 0;

  return (
    <main className="min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden lotus-pattern">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: '#fcd34d' }} />
      </div>

      <section className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
        {/* Hero illustration */}
        <div className="relative w-72 h-72 mb-8">
          <div className="absolute inset-0 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(252,211,77,0.3)' }} />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <span className="text-[10rem] drop-shadow-2xl">&#x1f3c6;</span>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4 mb-12">
          <h2 className="font-headline font-bold text-5xl text-primary leading-tight">Alle Quests geschafft!</h2>
          <p className="text-xl text-on-surface-variant font-body px-4">
            Du bist heute ein wahrer Held!
          </p>
        </div>

        {/* Streak bento card */}
        <div className="w-full bg-white rounded-2xl p-8 relative overflow-hidden mb-10"
             style={{ boxShadow: '0 8px 24px rgba(30,27,23,0.06)' }}>
          <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>local_florist</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="font-headline font-bold text-3xl text-on-surface">{streak + 1} Tage in Folge!</span>
            </div>
            <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant/60">Aktuelle Serie</p>
            {/* Progress dots */}
            <div className="flex gap-2 mt-6">
              {Array.from({ length: Math.min(streak + 1, 7) }, (_, i) => (
                <div key={i} className={`h-2 rounded-full ${i === Math.min(streak, 6) ? 'w-12 bg-secondary ring-4' : 'w-8 bg-secondary-container'}`}
                     style={i === Math.min(streak, 6) ? { ringColor: 'rgba(252,211,77,0.2)' } : {}} />
              ))}
            </div>
          </div>
        </div>

        {/* Quest log summary */}
        <div className="w-full mb-10">
          <h3 className="font-headline font-bold text-2xl text-on-surface mb-6 text-center">Heutige Taten</h3>
          <div className="rounded-2xl p-6 space-y-3" style={{ background: '#f9f2ec' }}>
            {(state?.quests || []).filter(q => q.done && !q.sideQuest).slice(0, 5).map(q => (
              <div key={q.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="flex-1 pl-4 text-left" style={{ borderLeft: '2px solid rgba(204,195,215,0.2)' }}>
                  <p className="font-headline font-bold text-lg text-on-surface">{q.icon} {q.name}</p>
                </div>
              </div>
            ))}
            {(state?.quests || []).filter(q => q.done && !q.sideQuest).length > 5 && (
              <p className="font-label text-sm text-on-surface-variant text-center">
                +{(state?.quests || []).filter(q => q.done && !q.sideQuest).length - 5} weitere
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full max-w-sm space-y-4">
          <button onClick={onDismiss}
            className="w-full py-5 px-8 bg-primary-container text-white font-headline font-bold text-xl rounded-full active:scale-95 transition-all flex items-center justify-center gap-3"
            style={{ boxShadow: '0 8px 24px rgba(18,67,70,0.2)' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
            Weiter!
          </button>
        </div>
      </section>
    </main>
  );
}

// ── Chest / Streak Milestone ──
function ChestCelebration({ milestone, reward, onDismiss }) {
  return (
    <main className="min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden lotus-pattern">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: '#fcd34d' }} />
      </div>

      <section className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
        {/* Chest illustration */}
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 rounded-full blur-3xl animate-pulse" style={{ background: 'rgba(252,211,77,0.3)' }} />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <span className="text-[9rem] drop-shadow-2xl">&#x1f381;</span>
          </div>
          {/* Sparkle accents */}
          <div className="absolute -top-4 -right-4">
            <span className="material-symbols-outlined text-secondary text-4xl opacity-60">auto_awesome</span>
          </div>
          <div className="absolute bottom-4 -left-4">
            <span className="material-symbols-outlined text-secondary text-3xl opacity-40">stars</span>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4 mb-10">
          <h2 className="font-headline font-bold text-5xl text-primary leading-tight">Streak-Truhe!</h2>
          <p className="text-xl text-on-surface-variant font-body px-4">
            {milestone} Tage in Folge! Eine Belohnung wartet auf dich!
          </p>
        </div>

        {/* Reward card */}
        <div className="w-full bg-white rounded-2xl p-8 relative overflow-hidden mb-10"
             style={{ boxShadow: '0 8px 24px rgba(30,27,23,0.06)' }}>
          <div className="absolute bottom-2 right-2 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: '80px' }}>local_florist</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
                   style={{ background: 'rgba(252,211,77,0.15)' }}>
                <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: '#fcd34d' }} />
                <span className="material-symbols-outlined relative z-10 text-secondary" style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1" }}>diamond</span>
              </div>
            </div>
            <p className="font-body text-xl text-on-surface/80 leading-relaxed">
              Du hast <span className="font-bold text-on-surface">+{reward} Heldenpunkte</span> verdient!
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full max-w-sm">
          <button onClick={onDismiss}
            className="w-full py-5 px-8 bg-primary-container text-white font-headline font-bold text-xl rounded-full active:scale-95 transition-all flex items-center justify-center gap-3"
            style={{ boxShadow: '0 8px 24px rgba(18,67,70,0.2)' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
            Einsammeln!
          </button>
        </div>
      </section>
    </main>
  );
}

export default function Celebration() {
  const { celebration, actions } = useTask();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (celebration) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [celebration]);

  if (!celebration) return null;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => actions.dismissCelebration(), 300);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-surface overflow-y-auto transition-all duration-300"
         style={{
           opacity: visible ? 1 : 0,
           transform: visible ? 'translateY(0)' : 'translateY(20px)',
         }}>
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-6 h-16"
              style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <button onClick={handleDismiss} className="material-symbols-outlined text-primary hover:opacity-80 transition-opacity">close</button>
        <h1 className="font-headline font-bold text-2xl text-primary">Quest Complete!</h1>
        <div className="w-6" />
      </header>

      {celebration.type === 'victory' && <VictoryCelebration onDismiss={handleDismiss} />}
      {celebration.type === 'levelUp' && <LevelUpCelebration level={celebration.payload?.level} onDismiss={handleDismiss} />}
      {celebration.type === 'evolution' && <EvolutionCelebration {...(celebration.payload || {})} onDismiss={handleDismiss} />}
      {celebration.type === 'chest' && <ChestCelebration {...(celebration.payload || {})} onDismiss={handleDismiss} />}
    </div>
  );
}
