import React from 'react';
import { ANCHORS } from '../constants';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';

const ANCHOR_META = {
  morning: { label: 'Morgen-Routine', icon: 'light_mode', col: '#F97316' },
  evening: { label: 'Gute Nacht',    icon: 'dark_mode',  col: '#6d28d9' },
};

export default function TaskList() {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct, byGroup } = computed;

  if (!state) return null;

  const handleComplete = (id) => {
    actions.complete(id);
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(80);
  };

  return (
    <div className="lotus-pattern px-5 pb-8 flex flex-col gap-6">

      {/* ── Header ── */}
      <section className="flex items-center justify-between">
        <div>
          <p className="text-sm font-label font-medium text-on-surface/60">Hallo, Hero!</p>
          <h1 className="text-2xl font-headline font-bold text-primary">Abenteuer</h1>
        </div>
        <div className="bg-secondary-container px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="material-symbols-outlined text-on-secondary-container text-sm">stars</span>
          <span className="text-sm font-bold font-label text-on-secondary-container">
            {done}/{total}
          </span>
        </div>
      </section>

      {/* ── Overall Progress ── */}
      <section className={`mm-card p-6 ${allDone ? 'border-emerald/30' : ''}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`font-label font-bold text-sm uppercase tracking-wider ${allDone ? 'text-emerald-dark' : 'text-on-surface'}`}>
            {allDone ? 'Durchgehalten!' : `${done}/${total} Aufgaben`}
          </span>
          {state.dt > 0 && (
            <span className="font-label font-bold text-sm text-primary">+{state.dt} Min</span>
          )}
        </div>
        <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct * 100}%`,
              background: allDone
                ? 'linear-gradient(90deg, #34D399, #6EE7B7)'
                : 'linear-gradient(90deg, #5300b7, #6d28d9)',
            }}
          />
        </div>
      </section>

      {/* ── All-done celebration ── */}
      {allDone && (
        <div className="text-center py-4">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-headline text-xl font-bold text-primary">Alle Aufgaben geschafft!</h3>
          <p className="font-body text-on-surface-variant mt-1">Du bist ein wahrer Held!</p>
        </div>
      )}

      {/* ── Epic Quest Groups (collapsible) ── */}
      {['morning', 'evening'].map(anchor => {
        const meta = ANCHOR_META[anchor];
        const quests = (byGroup[anchor] || []).filter(q => !q.sideQuest);
        if (!quests.length) return null;

        const secDone = quests.every(q => q.done);
        const doneCount = quests.filter(q => q.done).length;
        const firstUndoneIdx = quests.findIndex(q => !q.done);

        return (
          <details key={anchor} className="group mm-card overflow-hidden" open={!secDone}>
            {/* ── Epic Header ── */}
            <summary className="p-6 cursor-pointer list-none lotus-pattern">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                       style={{ background: `${meta.col}15` }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: meta.col }}>
                      {meta.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline text-on-surface">{meta.label}</h3>
                    <p className="text-sm font-medium font-label text-on-surface/60">
                      {secDone ? 'Geschafft!' : `Noch ${quests.length - doneCount} Aufgaben`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Progress ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-outline-variant/20" cx="24" cy="24" fill="transparent" r="20"
                              stroke="currentColor" strokeWidth="4" />
                      <circle cx="24" cy="24" fill="transparent" r="20" strokeWidth="4"
                              stroke={secDone ? '#34d399' : meta.col}
                              strokeDasharray={125.6}
                              strokeDashoffset={125.6 - (doneCount / quests.length) * 125.6}
                              strokeLinecap="round" />
                    </svg>
                    <span className="absolute font-label text-[10px] font-bold">
                      {doneCount}/{quests.length}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface/40 group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </div>
              </div>
            </summary>

            {/* ── Task Items ── */}
            <div className="px-6 pb-6 pt-2 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-4 rounded-full" style={{ background: meta.col }} />
                <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface/60">
                  {meta.label}-Aufgaben
                </span>
              </div>

              {quests.map((q, idx) => {
                const isRepeatable = q.target && q.target > 1;
                const curCompletions = q.completions || 0;
                const maxTaps = isRepeatable ? (q.bonus || q.target) : 1;
                const fullyDone = isRepeatable ? curCompletions >= maxTaps : q.done;
                const canTap = isRepeatable ? curCompletions < maxTaps : !q.done;
                const isNext = idx === firstUndoneIdx;

                return (
                  <div key={q.id}
                    className={`flex items-center gap-4 p-5 rounded-xl transition-all ${
                      fullyDone
                        ? 'bg-surface-container-low/50 opacity-60'
                        : isNext
                          ? 'mm-card border-2 border-primary/10'
                          : 'mm-card'
                    }`}
                    style={{ minHeight: 64 }}
                  >
                    {/* Checkbox */}
                    <button
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        fullyDone
                          ? 'bg-emerald text-white'
                          : 'border-2 border-outline-variant hover:border-primary cursor-pointer'
                      }`}
                      onClick={() => canTap && handleComplete(q.id)}
                      disabled={!canTap}
                      aria-label={`${q.name} ${fullyDone ? 'erledigt' : 'erledigen'}`}
                    >
                      {fullyDone && (
                        <span className="material-symbols-outlined text-white text-xl"
                              style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </button>

                    {/* Icon + Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xl shrink-0">{q.icon}</span>
                      <div className="flex-1">
                        <p className={`font-label font-bold text-lg leading-tight ${
                          fullyDone ? 'line-through text-on-surface/40' : 'text-on-surface'
                        }`}>
                          {q.name}
                        </p>
                        {isRepeatable && (
                          <p className="font-label text-xs font-bold text-on-surface-variant mt-0.5">
                            {curCompletions}/{q.target}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* XP Reward */}
                    <div className={`font-label font-bold text-sm whitespace-nowrap ${
                      fullyDone ? 'text-emerald-dark' : 'text-primary'
                    }`}>
                      +{q.xp} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}

      {/* ── Side Quests (Bonus) ── */}
      {(() => {
        const sideQuests = (state.quests || []).filter(q => q.sideQuest);
        if (!sideQuests.length) return null;
        return (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
                Bonus-Aufgaben
              </span>
              <span className="font-label text-xs text-on-surface-variant">Optional</span>
            </div>
            <div className="flex flex-col gap-3">
              {sideQuests.map(q => {
                const canTap = !q.done;
                return (
                  <button
                    key={q.id}
                    className={`btn-tap w-full flex items-center gap-4 p-5 rounded-xl transition-all text-left ${
                      q.done ? 'mm-card opacity-60' : 'mm-card'
                    }`}
                    onClick={() => canTap && handleComplete(q.id)}
                    disabled={!canTap}
                    style={{ minHeight: 64 }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                      q.done ? 'bg-emerald text-white' : 'bg-secondary-fixed/30'
                    }`}>
                      {q.done ? '✅' : q.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-label font-bold text-lg ${
                        q.done ? 'line-through text-on-surface/40' : 'text-on-surface'
                      }`}>{q.name}</p>
                    </div>
                    <div className={`font-label font-bold text-sm ${
                      q.done ? 'text-emerald-dark' : 'text-secondary'
                    }`}>
                      +{q.xp} XP
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* ── Bodhi leaf ── */}
      <div className="flex justify-center py-4 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
        </svg>
      </div>
    </div>
  );
}
