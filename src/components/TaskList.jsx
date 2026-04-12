import React, { useState } from 'react';
import { ANCHORS } from '../constants';
import { useTask } from '../context/TaskContext';
import useWeather, { getWeatherInfo, getClothingRecs } from '../hooks/useWeather';
import SFX from '../utils/sfx';

const ANCHOR_META = {
  morning: { label: 'Morgen-Routine', sublabel: 'Morgen-Aufgaben', icon: 'light_mode', col: '#F97316' },
  evening: { label: 'Abend-Routine',  sublabel: 'Abend-Aufgaben',  icon: 'dark_mode',  col: '#6d28d9' },
};

// Kid-friendly subtitles that explain each task's purpose
const TASK_HINTS = {
  s1: 'Frisches Gesicht, frischer Start!',
  s3: '3 Minuten glänzen lassen',
  s4: 'Dein Helden-Outfit wählen',
  s2: 'Kissen glatt, Decke drauf!',
  s5: 'Bücher und Pausenbrot einpacken',
  s6b: 'Schutz für sonnige Tage',
  s_lunchbox: 'Ausspülen und trocknen lassen',
  s_water: 'Frisches Wasser für morgen',
  s_packcheck: 'Hefte, Bücher, Mäppchen — alles drin?',
  s_signature: 'Mama/Papa müssen noch unterschreiben?',
  s7: 'Erst die Arbeit, dann das Spiel',
  s8: 'Abenteuer im Kopf erleben',
  s9: 'Alles hat seinen Platz',
  s12: 'Vor dem Schlafen sauber putzen',
  s13: 'Gesicht sauber machen',
  s14: 'Pflege für deine Haut',
  s15: 'Ab in die Schlafklamotten',
  sq_geschirr: 'Teller & Gläser einräumen',
  sq_zimmer: 'Alles hat seinen Platz',
  ft: 'Volle Power auf dem Platz!',
  v1: 'Frisches Gesicht, frischer Start!',
  v3: '3 Minuten glänzen lassen',
  v4: 'Dein Helden-Outfit wählen',
  v2: 'Kissen glatt, Decke drauf!',
  v5b: 'Schutz für sonnige Tage',
  v6: 'Abenteuer im Kopf erleben',
  v7: 'Alles hat seinen Platz',
  v10: 'Vor dem Schlafen sauber putzen',
  v11: 'Gesicht sauber machen',
  v12: 'Pflege für deine Haut',
  v13: 'Ab in die Schlafklamotten',
};

export default function TaskList() {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct, byGroup } = computed;
  const { weather } = useWeather();
  const [showWeather, setShowWeather] = useState(false);

  if (!state) return null;

  // Weather data for clothing hints
  const todayWeather = weather?.daily?.[0];
  const currentWeather = weather?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weatherCode) : null;
  const clothingRecs = currentWeather
    ? getClothingRecs(currentWeather.temp, currentWeather.feelsLike, currentWeather.weatherCode, currentWeather.windSpeed)
    : [];

  const handleComplete = (id) => {
    actions.complete(id);
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(80);
  };

  return (
    <div className="px-6 pb-32">

      {/* ── Header ── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold font-headline text-on-surface">Deine Tages-Epics</h2>
          <button className="text-sm font-bold font-label text-primary flex items-center gap-1 px-3 py-1 rounded-full hover:bg-surface-container-low transition-colors">
            Alle ansehen
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </section>

      {/* ── Epic Quest Groups ── */}
      <div className="flex flex-col gap-5">

        {['morning', 'evening'].map(anchor => {
          const meta = ANCHOR_META[anchor];
          const quests = (byGroup[anchor] || []).filter(q => !q.sideQuest);
          if (!quests.length) return null;

          const secDone = quests.every(q => q.done);
          const doneCount = quests.filter(q => q.done).length;
          const isEvening = anchor === 'evening';
          const firstUndoneIdx = quests.findIndex(q => !q.done);

          return (
            <details key={anchor} className="group overflow-hidden" open={!secDone && !isEvening}
              style={{
                background: isEvening && !secDone ? '#f9f3eb' : '#ffffff',
                borderRadius: '1.25rem',
                border: isEvening && !secDone ? 'none' : '1px solid rgba(83,0,183,0.05)',
                boxShadow: isEvening && !secDone ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* ── Epic Header (Summary) ── */}
              <summary className="p-6 cursor-pointer lotus-pattern" style={{ opacity: isEvening && !secDone ? 0.7 : 1 }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                         style={{ background: isEvening && !secDone ? 'rgba(74,68,85,0.05)' : `${meta.col}15` }}>
                      <span className="material-symbols-outlined text-3xl"
                            style={{ color: isEvening && !secDone ? '#4a4455' : meta.col }}>
                        {meta.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-headline text-on-surface">{meta.label}</h3>
                      <p className="text-sm font-medium font-label text-on-surface/60">
                        {secDone ? 'Geschafft!' : isEvening && !secDone ? 'Gesperrt bis 18:00 Uhr' : `Noch ${quests.length - doneCount} Aufgaben`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Progress ring or badge */}
                    {isEvening && !secDone ? (
                      <div className="px-3 py-1 rounded-full text-[10px] font-bold font-label uppercase"
                           style={{ background: '#e8e1da' }}>
                        {quests.length} Aufgaben
                      </div>
                    ) : (
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="24" cy="24" fill="transparent" r="20"
                                  stroke="rgba(204,195,215,0.2)" strokeWidth="4" />
                          <circle cx="24" cy="24" fill="transparent" r="20"
                                  stroke={secDone ? '#34d399' : '#fcd34d'}
                                  strokeWidth="4" strokeLinecap="round"
                                  strokeDasharray="125.6"
                                  strokeDashoffset={125.6 - (doneCount / quests.length) * 125.6} />
                        </svg>
                        <span className="absolute text-[10px] font-bold font-label">
                          {doneCount}/{quests.length}
                        </span>
                      </div>
                    )}
                    <span className="material-symbols-outlined text-on-surface/40 group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </div>
                </div>
              </summary>

              {/* ── Task Items ── */}
              {isEvening && !secDone && doneCount === 0 ? (
                <div className="px-6 pb-6 pt-2 text-center text-sm font-medium font-label text-on-surface/40">
                  Schalte diese Quest am Abend frei, um Belohnungen zu sammeln!
                </div>
              ) : (
                <div className="px-6 pb-6 pt-2">
                  {/* Section label */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-4 rounded-full" style={{ background: meta.col }} />
                    <h4 className="text-sm font-bold font-label uppercase tracking-wider text-on-surface/60">
                      {meta.sublabel}
                    </h4>
                  </div>

                  {/* Quest steps with connector line */}
                  <div className="flex flex-col gap-0">
                    {quests.map((q, idx) => {
                      const isRepeatable = q.target && q.target > 1;
                      const curCompletions = q.completions || 0;
                      const maxTaps = isRepeatable ? (q.bonus || q.target) : 1;
                      const fullyDone = isRepeatable ? curCompletions >= maxTaps : q.done;
                      const canTap = isRepeatable ? curCompletions < maxTaps : !q.done;
                      const isNext = idx === firstUndoneIdx;
                      const isLast = idx === quests.length - 1;
                      const hint = TASK_HINTS[q.id];
                      const isAnziehen = q.id === 's4' || q.id === 'v4';

                      return (
                        <div key={q.id} className="flex gap-3 relative">
                          {/* Step indicator + connector line */}
                          <div className="flex flex-col items-center" style={{ width: 32 }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                                 style={{
                                   background: fullyDone ? '#34d399' : isNext ? '#fcd34d' : '#e8e1da',
                                   color: fullyDone ? 'white' : '#1e1b17',
                                   boxShadow: isNext ? '0 0 0 3px rgba(252,211,77,0.3)' : 'none',
                                 }}>
                              {fullyDone ? '✓' : idx + 1}
                            </div>
                            {!isLast && (
                              <div className="flex-1 w-0.5 my-1" style={{ background: fullyDone ? '#34d399' : '#e8e1da', minHeight: 12 }} />
                            )}
                          </div>

                          {/* Task card */}
                          <div className="flex-1 mb-3">
                            {fullyDone ? (
                              /* ── Done task ── */
                              <div className={`rounded-xl p-4 ${isAnziehen && todayWeather ? '' : 'opacity-60'}`}
                                   style={{ background: 'rgba(249,243,235,0.5)' }}>
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                       style={{ background: 'rgba(52,211,153,0.15)' }}>
                                    <span className="text-lg">{q.icon}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold font-label line-through text-on-surface/50">{q.name}</p>
                                  </div>
                                  <span className="font-bold font-label text-xs" style={{ color: '#34d399' }}>+{q.xp} XP</span>
                                </div>
                                {/* Weather hint persists after completion */}
                                {isAnziehen && todayWeather && weatherInfo && (
                                  <button
                                    className="flex items-center gap-1.5 mt-2 ml-14 px-2 py-1 rounded-lg transition-all text-left"
                                    style={{ background: 'rgba(2,132,199,0.08)' }}
                                    onClick={() => setShowWeather(true)}
                                  >
                                    <span className="text-sm">{weatherInfo.emoji}</span>
                                    <span className="text-xs font-bold" style={{ color: '#0284C7' }}>
                                      {todayWeather.tempMin}°/{todayWeather.tempMax}° — Outfit ansehen
                                    </span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              /* ── Active task ── */
                              <div
                                className="w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left cursor-pointer active:scale-[0.98]"
                                style={{
                                  background: '#ffffff',
                                  border: isNext ? '1.5px solid rgba(83,0,183,0.1)' : '1px solid rgba(0,0,0,0.06)',
                                  boxShadow: isNext ? '0 2px 12px rgba(83,0,183,0.06)' : '0 1px 4px rgba(0,0,0,0.04)',
                                }}
                                onClick={() => canTap && handleComplete(q.id)}
                              >
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                     style={{ background: `${meta.col}12` }}>
                                  <span className="text-lg">{q.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold font-label text-on-surface">{q.name}</p>
                                  {isAnziehen && todayWeather && weatherInfo ? (
                                    <button
                                      className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded-lg transition-all text-left"
                                      style={{ background: 'rgba(2,132,199,0.08)' }}
                                      onClick={(e) => { e.stopPropagation(); setShowWeather(true); }}
                                    >
                                      <span className="text-sm">{weatherInfo.emoji}</span>
                                      <span className="text-xs font-bold" style={{ color: '#0284C7' }}>
                                        {todayWeather.tempMin}°/{todayWeather.tempMax}° — Tippe für Outfit-Tipp!
                                      </span>
                                    </button>
                                  ) : hint ? (
                                    <p className="text-xs font-body text-on-surface/60 mt-0.5">{hint}</p>
                                  ) : null}
                                  {isRepeatable && (
                                    <p className="text-xs font-body text-on-surface/60 mt-0.5">
                                      {curCompletions}/{q.target} erledigt
                                    </p>
                                  )}
                                </div>
                                <span className="font-bold font-label text-xs text-primary">+{q.xp} XP</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </details>
          );
        })}

        {/* ── Side Quests ── */}
        {(() => {
          const sideQuests = (state.quests || []).filter(q => q.sideQuest);
          if (!sideQuests.length) return null;
          return (
            <section>
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-1.5 h-8 rounded-full" style={{ background: '#735c00' }} />
                <h2 className="font-headline text-xl text-on-surface">Bonus</h2>
                <span className="font-label text-xs text-on-surface-variant px-2 py-0.5 rounded-full"
                      style={{ background: '#f4ede5' }}>Optional</span>
              </div>
              <div className="flex flex-col gap-3">
                {sideQuests.map(q => (
                  <div key={q.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${q.done ? 'opacity-60' : ''}`}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {q.done ? (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                           style={{ background: '#34d399' }}>
                        <span className="material-symbols-outlined text-white text-xl"
                              style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    ) : (
                      <button
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all hover:border-secondary cursor-pointer active:scale-95"
                        style={{ borderColor: 'rgba(204,195,215,0.5)' }}
                        onClick={() => handleComplete(q.id)}
                        aria-label={`${q.name} erledigen`}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{q.icon}</span>
                        <p className={`text-lg font-bold font-label ${q.done ? 'line-through text-on-surface/50' : 'text-on-surface'}`}>
                          {q.name}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold font-label text-xs ${q.done ? 'text-emerald-dark' : 'text-secondary'}`}>
                      +{q.xp} XP
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── Bento Stats Grid ── */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #5300b7, #6d28d9)', minHeight: 160 }}>
            <div className="relative z-10">
              <p className="font-label text-sm uppercase tracking-wider opacity-80">Tagesziel</p>
              <h4 className="font-headline text-2xl mt-1">{Math.round(pct * 100)}% Bereit</h4>
            </div>
            <div className="relative z-10 w-full h-2 rounded-full mt-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                   style={{ width: `${pct * 100}%`, background: '#fcd34d' }} />
            </div>
            <span className="absolute -right-4 -bottom-4 material-symbols-outlined text-8xl text-white/10"
                  style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>

          <div className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
               style={{ background: '#fcd34d', color: '#725b00', minHeight: 160 }}>
            <div className="relative z-10">
              <p className="font-label text-sm uppercase tracking-wider opacity-80">Begleiter</p>
              <h4 className="font-headline text-2xl mt-1">{done} Schritte</h4>
              <p className="font-body text-xs mt-1 opacity-70">Jede Aufgabe hilft deinem Ei!</p>
            </div>
            <span className="material-symbols-outlined text-4xl relative z-10"
                  style={{ fontVariationSettings: "'FILL' 1" }}>egg</span>
          </div>
        </div>
      </div>

      {/* ── Bodhi leaf ── */}
      <div className="flex justify-center py-6 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
        </svg>
      </div>

      {/* ── FAB ── */}
      <div className="fixed right-6 bottom-28 z-40">
        <button className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                style={{ background: '#fcd34d', color: '#725b00' }}>
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {/* ── Weather Outfit Modal ── */}
      {showWeather && currentWeather && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center"
             onClick={() => setShowWeather(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Sheet */}
          <div className="relative w-full max-w-lg rounded-t-[2rem] pb-10 pt-6 px-6 overflow-auto"
               style={{ background: '#fff8f1', maxHeight: '80vh', animation: 'slideUp 0.3s ease' }}
               onClick={e => e.stopPropagation()}>

            {/* Handle */}
            <div className="w-11 h-1.5 rounded-full mx-auto mb-6" style={{ background: 'rgba(0,0,0,0.12)' }} />

            {/* Weather header */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">{weatherInfo?.emoji}</div>
              <h2 className="font-headline text-2xl text-on-surface">Heute anziehen</h2>
              <p className="font-body text-on-surface-variant mt-1">
                {weatherInfo?.label} · {currentWeather.temp}° (fühlt sich an wie {currentWeather.feelsLike}°)
              </p>
              {todayWeather && (
                <p className="font-label text-sm text-on-surface-variant mt-1">
                  {todayWeather.tempMin}° — {todayWeather.tempMax}°
                  {todayWeather.precipProb > 20 && ` · ${todayWeather.precipProb}% Regen`}
                </p>
              )}
            </div>

            {/* Clothing recommendations */}
            <div className="flex flex-col gap-3 mb-6">
              {clothingRecs.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                     style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="text-3xl shrink-0">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="font-label font-bold text-on-surface">{item.name}</p>
                    <p className="font-body text-sm text-on-surface-variant">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Close */}
            <button
              className="w-full py-4 rounded-full font-label font-bold text-lg transition-all active:scale-95"
              style={{ background: '#fcd34d', color: '#725b00' }}
              onClick={() => setShowWeather(false)}
            >
              Verstanden!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
