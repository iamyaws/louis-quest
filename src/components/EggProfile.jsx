import React from 'react';
import { useTask } from '../context/TaskContext';
import Egg from './Egg';

export default function EggProfile() {
  const { state, computed } = useTask();
  const { done, total, pct } = computed;
  const eggProgress = state?.eggProgress || Math.round(pct * 100);
  const remaining = total - done;

  return (
    <div className="px-6 pb-32 relative overflow-hidden">

      {/* ── Background motif ── */}
      <div className="absolute top-20 right-[-10%] opacity-5 pointer-events-none">
        <svg fill="currentColor" width="300" height="300" viewBox="0 0 100 100">
          <path d="M50 10 C30 10 10 30 10 55 C10 80 50 95 50 95 C50 95 90 80 90 55 C90 30 70 10 50 10 Z" />
        </svg>
      </div>

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <h1 className="font-headline text-4xl text-primary mb-2">Ei ausbrüten</h1>
        <p className="text-on-surface-variant font-body text-lg">
          Ein neues Leben erwacht in der mystischen Wiese.
        </p>
      </div>

      {/* ── The Hatching Chamber ── */}
      <div className="relative mx-auto flex items-center justify-center mb-10" style={{ width: 280, height: 280 }}>
        {/* Progress Ring */}
        <div className="absolute inset-0 p-4">
          <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#eee7df" strokeWidth="4" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="#fcd34d"
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray="289"
              strokeDashoffset={289 - (pct * 289)}
              className="transition-all duration-1000"
            />
          </svg>
        </div>

        {/* Egg */}
        <div className="relative z-10" style={{ filter: 'drop-shadow(0 0 20px rgba(252, 211, 77, 0.3))' }}>
          <Egg type={state?.eggType || "dragon"} size={140} progress={eggProgress} />
        </div>

        {/* Floating particles */}
        <div className="absolute w-2 h-2 rounded-full top-16 right-8 blur-[1px]" style={{ background: 'rgba(252,211,77,0.4)' }} />
        <div className="absolute w-3 h-3 rounded-full bottom-20 left-6 blur-[2px]" style={{ background: 'rgba(252,211,77,0.3)' }} />
        <div className="absolute w-1.5 h-1.5 rounded-full top-1/2 left-3 blur-[1px]" style={{ background: 'rgba(252,211,77,0.5)' }} />
      </div>

      {/* ── Status Card ── */}
      <div className="rounded-2xl p-8 mb-8 text-center relative overflow-hidden"
           style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {/* Ghosted lotus */}
        <div className="absolute -bottom-3 -right-3 opacity-[0.03] text-on-surface pointer-events-none">
          <svg fill="currentColor" width="120" height="120" viewBox="0 0 24 24">
            <path d="M12 22s-8-6.5-8-12 8-8 8-8 8 2.5 8 8-8 12-8 12z" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-3 relative z-10">
          <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">Fortschritt</span>
          <div className="text-4xl font-headline text-on-surface">{Math.round(pct * 100)}% Fertig</div>
          <p className="font-body text-on-surface-variant max-w-xs mx-auto">
            {remaining > 0
              ? `Noch ${remaining} Aufgaben, bis dein Begleiter aus dem Ei schlüpft!`
              : 'Dein Ei ist bereit zum Schlüpfen!'
            }
          </p>
        </div>
      </div>

      {/* ── Today's Milestones ── */}
      <div className="mb-6">
        <h3 className="font-label text-sm font-bold uppercase tracking-wider text-on-surface-variant px-2 mb-4">
          Heutige Meilensteine
        </h3>

        <div className="flex flex-col gap-3">
          {(state?.quests || []).filter(q => !q.sideQuest).slice(0, 4).map(q => (
            <div key={q.id}
              className="rounded-2xl p-5 flex items-center justify-between group transition-all"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  q.done ? 'bg-[#d1fae5]' : 'bg-[#f4ede5]'
                }`}>
                  <span className={`material-symbols-outlined ${q.done ? 'text-emerald-dark' : 'text-primary'}`}>
                    {q.done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <div>
                  <h4 className={`font-label font-bold ${q.done ? 'text-on-surface/40 line-through' : 'text-on-surface'}`}>
                    {q.name}
                  </h4>
                  {!q.done && (
                    <p className="font-body text-sm text-on-surface-variant">{q.icon} Erledigen für Fortschritt</p>
                  )}
                </div>
              </div>
              {q.done ? (
                <span className="material-symbols-outlined text-emerald" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-outline-variant" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bodhi leaf ── */}
      <div className="flex justify-center py-4 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
        </svg>
      </div>
    </div>
  );
}
