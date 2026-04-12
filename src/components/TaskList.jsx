import React from 'react';
import { ANCHORS } from '../constants';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';

const ANCHOR_META = {
  morning: { label: 'Morgen-Routine', col: '#fcd34d' },
  evening: { label: 'Gute Nacht',    col: '#6d28d9' },
};

// Map quest icons to Material Symbols (fallback to emoji)
const ICON_MAP = {
  '🧼': 'wash',
  '🪥': 'brush',
  '👕': 'checkroom',
  '🛏️': 'bed',
  '🎒': 'backpack',
  '☀️': 'wb_sunny',
  '🍱': 'lunch_dining',
  '📚': 'school',
  '📖': 'menu_book',
  '🧹': 'cleaning_services',
  '✨': 'auto_awesome',
  '🌙': 'bedtime',
  '🍽️': 'restaurant',
  '⚽': 'sports_soccer',
  '🎨': 'palette',
  '🤝': 'handshake',
  '💡': 'lightbulb',
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
    <div className="px-6 pb-8">

      {/* ── Screen Title ── */}
      <header className="mb-8">
        <h1 className="font-headline text-4xl text-on-surface tracking-tight mb-6">
          Deine Abenteuer
        </h1>
        {/* Toggle: Heute / Wöchentlich */}
        <div className="bg-surface-container-low p-1.5 rounded-full flex w-full">
          <button className="flex-1 bg-surface-container-lowest text-on-surface py-2.5 rounded-full font-bold font-label shadow-sm transition-all text-sm">
            Heute
          </button>
          <button className="flex-1 text-on-surface/50 py-2.5 rounded-full font-bold font-label hover:bg-surface-container-high/50 transition-all text-sm">
            Wöchentlich
          </button>
        </div>
      </header>

      {/* ── Quest Sections ── */}
      <div className="space-y-10">

        {['morning', 'evening'].map(anchor => {
          const meta = ANCHOR_META[anchor];
          const quests = (byGroup[anchor] || []).filter(q => !q.sideQuest);
          if (!quests.length) return null;

          const secDone = quests.every(q => q.done);
          const doneCount = quests.filter(q => q.done).length;
          const isEvening = anchor === 'evening';

          return (
            <section key={anchor} className={`relative ${isEvening && !secDone ? 'opacity-70' : ''}`}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-5 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full" style={{ background: meta.col }} />
                  <h2 className="font-headline text-2xl text-on-surface">{meta.label}</h2>
                </div>
                <span className="material-symbols-outlined text-outline">expand_more</span>
              </div>

              {/* Task Cards */}
              <div className="space-y-4">
                {quests.map(q => {
                  const isRepeatable = q.target && q.target > 1;
                  const curCompletions = q.completions || 0;
                  const maxTaps = isRepeatable ? (q.bonus || q.target) : 1;
                  const fullyDone = isRepeatable ? curCompletions >= maxTaps : q.done;
                  const canTap = isRepeatable ? curCompletions < maxTaps : !q.done;
                  const matIcon = ICON_MAP[q.icon] || 'task_alt';

                  return (
                    <div key={q.id}
                      className={`bg-surface-container-lowest rounded-lg p-6 relative overflow-hidden group transition-all shadow-sm ${
                        fullyDone ? 'opacity-50' : 'hover:shadow-md'
                      }`}
                    >
                      {/* Lotus motif decoration */}
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-on-surface/[0.03] pointer-events-none"
                           style={{
                             maskImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10C50 10 35 35 35 50C35 65 50 90 50 90C50 90 65 65 65 50C65 35 50 10 50 10Z' fill='black'/%3E%3C/svg%3E\")",
                             WebkitMaskImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10C50 10 35 35 35 50C35 65 50 90 50 90C50 90 65 65 65 50C65 35 50 10 50 10Z' fill='black'/%3E%3C/svg%3E\")",
                             maskSize: 'contain', WebkitMaskSize: 'contain',
                             maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
                           }}
                      />

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                          {/* Icon circle */}
                          <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-primary">{matIcon}</span>
                          </div>
                          {/* Task info */}
                          <div>
                            <h3 className={`font-label font-bold text-lg ${fullyDone ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>
                              {q.name}
                            </h3>
                            <div className="flex gap-3 mt-1.5">
                              <span className="text-secondary font-bold text-sm bg-secondary-container/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                +{q.xp} XP
                              </span>
                              {isRepeatable && (
                                <span className="text-on-surface-variant font-bold text-sm bg-surface-container px-2 py-0.5 rounded-md">
                                  {curCompletions}/{q.target}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <button
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            fullyDone
                              ? 'bg-emerald text-white'
                              : 'border-2 border-outline-variant hover:border-primary cursor-pointer group-active:scale-95'
                          }`}
                          onClick={() => canTap && handleComplete(q.id)}
                          disabled={!canTap}
                          aria-label={`${q.name} ${fullyDone ? 'erledigt' : 'erledigen'}`}
                        >
                          {fullyDone && (
                            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ── Side Quests ── */}
        {(() => {
          const sideQuests = (state.quests || []).filter(q => q.sideQuest);
          if (!sideQuests.length) return null;
          return (
            <section>
              <div className="flex items-center gap-3 mb-5 px-2">
                <div className="w-1.5 h-8 bg-secondary rounded-full" />
                <h2 className="font-headline text-2xl text-on-surface">Bonus</h2>
                <span className="font-label text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <div className="space-y-4">
                {sideQuests.map(q => {
                  const matIcon = ICON_MAP[q.icon] || 'auto_awesome';
                  return (
                    <div key={q.id}
                      className={`bg-surface-container-lowest rounded-lg p-6 group transition-all shadow-sm ${q.done ? 'opacity-50' : 'hover:shadow-md'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-full bg-secondary/5 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-secondary">{matIcon}</span>
                          </div>
                          <div>
                            <h3 className={`font-label font-bold text-lg ${q.done ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>{q.name}</h3>
                            <div className="flex gap-3 mt-1.5">
                              <span className="text-secondary font-bold text-sm bg-secondary-container/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                +{q.xp} XP
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            q.done ? 'bg-emerald text-white' : 'border-2 border-outline-variant hover:border-secondary cursor-pointer'
                          }`}
                          onClick={() => !q.done && handleComplete(q.id)}
                          disabled={q.done}
                        >
                          {q.done && <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* ── Bento Stats Grid ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Daily goal */}
          <div className="bg-primary-container rounded-lg p-6 text-on-primary-container flex flex-col justify-between relative overflow-hidden" style={{ minHeight: 160 }}>
            <div className="relative z-10">
              <p className="font-label text-sm uppercase tracking-wider opacity-80">Tagesziel</p>
              <h4 className="font-headline text-2xl mt-1">{Math.round(pct * 100)}% Bereit</h4>
            </div>
            <div className="relative z-10 w-full bg-white/20 h-2 rounded-full mt-4">
              <div className="bg-secondary-container h-full rounded-full transition-all duration-500" style={{ width: `${pct * 100}%` }} />
            </div>
            <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-8xl text-white/10" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>

          {/* Streak */}
          <div className="bg-secondary-container rounded-lg p-6 text-on-secondary-container flex flex-col justify-between relative overflow-hidden" style={{ minHeight: 160 }}>
            <div className="relative z-10">
              <p className="font-label text-sm uppercase tracking-wider opacity-80">Strähne</p>
              <h4 className="font-headline text-2xl mt-1">{state.sd} Tage</h4>
            </div>
            <span className="material-symbols-outlined text-5xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          </div>
        </div>
      </div>

      {/* ── FAB ── */}
      <button className="fixed right-6 bottom-28 w-16 h-16 bg-primary-container text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
