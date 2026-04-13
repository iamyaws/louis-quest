import React from 'react';
import { useTask } from '../context/TaskContext';

export default function EggProfile() {
  const { state, computed } = useTask();
  const { done, total, pct } = computed;
  const remaining = total - done;
  const base = import.meta.env.BASE_URL;

  return (
    <div className="pb-32 relative overflow-hidden">

      {/* ── Hero Art — Egg illustration ── */}
      <div className="relative w-full overflow-hidden rounded-b-[2rem]" style={{ height: 320 }}>
        <img
          src={base + 'art/egg-glow.webp'}
          alt="Mystisches Ei"
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, transparent 40%, rgba(255,248,241,0.6) 70%, #fff8f1 100%)'
        }} />
        {/* Progress ring overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20">
          <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="rgba(255,248,241,0.8)" stroke="#eee7df" strokeWidth="6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#fcd34d"
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray="276"
              strokeDashoffset={276 - (pct * 276)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-headline font-bold text-lg text-on-surface">{Math.round(pct * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10">

        {/* ── Title ── */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl text-primary mb-1">Ei ausbrüten</h1>
          <p className="text-on-surface-variant font-body text-base">
            Ein neues Leben erwacht in der mystischen Wiese.
          </p>
        </div>

        {/* ── Status Card ── */}
        <div className="rounded-2xl p-6 mb-8 text-center relative overflow-hidden"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">Fortschritt</span>
          <div className="text-4xl font-headline text-on-surface mt-2">{Math.round(pct * 100)}% Fertig</div>
          <p className="font-body text-on-surface-variant mt-2 max-w-xs mx-auto">
            {remaining > 0
              ? `Noch ${remaining} Aufgaben, bis dein Begleiter aus dem Ei schlüpft!`
              : 'Dein Ei ist bereit zum Schlüpfen!'
            }
          </p>
        </div>

        {/* ── Today's Milestones ── */}
        <div className="mb-6">
          <h3 className="font-label text-sm font-bold uppercase tracking-wider text-on-surface-variant px-2 mb-4">
            Heutige Meilensteine
          </h3>

          <div className="flex flex-col gap-3">
            {(state?.quests || []).filter(q => !q.sideQuest).slice(0, 5).map(q => (
              <div key={q.id}
                className={`rounded-2xl p-5 flex items-center justify-between transition-all ${q.done ? 'opacity-60' : ''}`}
                style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    q.done ? 'bg-[#d1fae5]' : 'bg-[#f4ede5]'
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${q.done ? 'text-emerald-dark' : 'text-primary'}`}
                          style={q.done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {q.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <span className={`font-label font-bold ${q.done ? 'text-on-surface/40 line-through' : 'text-on-surface'}`}>
                    {q.name}
                  </span>
                </div>
                {q.done && (
                  <span className="material-symbols-outlined text-emerald text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Companion Preview ── */}
        <div className="rounded-2xl overflow-hidden relative mb-6"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <img
            src={base + 'art/dragon-baby.webp'}
            alt="Dein zukünftiger Begleiter"
            className="w-full h-40 object-cover object-top"
          />
          <div className="p-5 text-center">
            <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary mb-1">Dein Begleiter</p>
            <p className="font-headline text-lg text-on-surface">Wartet darauf zu schlüpfen...</p>
          </div>
        </div>

        {/* Bodhi leaf */}
        <div className="flex justify-center py-4 opacity-10">
          <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
            <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#0f766e" />
          </svg>
        </div>
      </div>
    </div>
  );
}
