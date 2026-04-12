import React from 'react';
import { WEEKLY_MISSIONS, MOOD_EMOJIS, BOSSES } from '../constants';
import { useTask } from '../context/TaskContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import SFX from '../utils/sfx';
import Egg from './Egg';

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

export default function Hub() {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct } = computed;
  const { weather } = useWeather();
  const base = import.meta.env.BASE_URL;
  const remaining = total - done;

  if (!state) return null;

  return (
    <div className="relative min-h-screen pb-32">
      {/* ── Background: time-of-day sky ── */}
      <div className="fixed inset-0 -z-20">
        <img src={base + 'art/bg-golden.webp'} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(255,248,241,0.45)' }} />

      {/* ── Minimal Top Bar ── */}
      <header className="flex justify-between items-center px-6 pt-6 pb-2"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg"
               style={{ background: '#ebddff' }}>
            <img src={base + 'art/dragon-baby.webp'} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-headline font-bold text-primary" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>
            Ronki
          </span>
        </div>
        <div className="px-4 py-1.5 rounded-full flex items-center gap-2"
             style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <span className="font-bold text-[11px] font-label text-primary">Lv. 1 · {state.hp || 0} HP</span>
        </div>
      </header>

      <main className="px-6 max-w-lg mx-auto flex flex-col gap-6">

        {/* ── Companion Egg ── */}
        <section className="relative flex flex-col items-center py-4">
          <div className="absolute w-72 h-72 rounded-full blur-[80px] -z-10"
               style={{ background: 'rgba(252,211,77,0.25)', animation: 'pulse 3s ease-in-out infinite' }} />

          <div className="relative w-48 h-56 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] overflow-hidden border-4 border-white shadow-2xl"
               style={{ boxShadow: '0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(252,211,77,0.2)' }}>
            <img src={base + 'art/egg-glow.webp'} alt="Dragon Egg" className="w-full h-full object-cover scale-110" />
          </div>

          <div className="absolute -bottom-2 px-6 py-2 rounded-full z-20"
               style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)' }}>
            <p className="font-bold text-[12px] font-label uppercase tracking-[0.2em] text-primary-container">
              Stufe 1 Ei
            </p>
          </div>
        </section>

        {/* ── Heldenpunkte ── */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full"
               style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="font-extrabold font-label text-sm text-primary-container">{state.hp || 0} Heldenpunkte</span>
          </div>
        </div>

        {/* ── Daily Summary Card ── */}
        <div className="p-6 rounded-2xl relative overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-xl text-primary-container">
                {allDone ? 'Alles geschafft!' : `Noch ${remaining} Aufgaben heute`}
              </h3>
              <p className="font-body text-on-surface-variant text-sm">
                {allDone ? 'Du bist ein wahrer Held!' : 'Bleib dran, dein Drache wächst!'}
              </p>
            </div>
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(83,0,183,0.1)" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="#fcd34d"
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray="176" strokeDashoffset={176 - pct * 176} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mood + Water Grid ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mood */}
          <div className="p-5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center"
               style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
            {state.moodAM !== null ? (
              <>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                     style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid white', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}>
                  {MOOD_EMOJIS[state.moodAM]}
                </div>
                <p className="font-bold text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Stimmung</p>
                <p className="font-headline font-bold text-lg text-primary-container">{MOOD_LABELS[state.moodAM]}</p>
              </>
            ) : (
              <>
                <p className="font-bold text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Stimmung</p>
                <div className="flex gap-1 flex-wrap justify-center">
                  {MOOD_EMOJIS.slice(0, 5).map((e, i) => (
                    <button key={i} onClick={() => { SFX.play("pop"); actions.setMood?.("moodAM", i); }}
                      className="text-2xl p-1 rounded-full hover:bg-white/50 transition-all active:scale-90"
                      style={{ minWidth: 36, minHeight: 36 }}>{e}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Water */}
          <div className="p-5 rounded-2xl flex flex-col justify-between"
               style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Wasser</p>
              <span className="material-symbols-outlined text-primary text-lg">water_drop</span>
            </div>
            <div className="grid grid-cols-3 gap-2 justify-items-center">
              {[0,1,2,3,4,5].map(i => (
                <button key={i}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    i < (state.dailyWaterCount || 0) ? 'bg-primary border-primary' : 'border-primary/20'
                  }`}
                  style={{ background: i < (state.dailyWaterCount || 0) ? undefined : 'rgba(83,0,183,0.05)' }}
                  onClick={() => i === (state.dailyWaterCount || 0) && actions.drinkWater?.()}
                />
              ))}
            </div>
            <p className="text-center font-bold text-[10px] font-label mt-2 text-on-surface-variant">
              {state.dailyWaterCount || 0}/6 Gläser
            </p>
          </div>
        </div>

        {/* ── Boss Card ── */}
        {state.boss && (() => {
          const bd = BOSSES.find(b => b.id === state.boss.id);
          if (!bd) return null;
          const defeated = state.boss.hp <= 0;
          return (
            <div className="p-5 rounded-2xl"
                 style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
              {defeated ? (
                <div className="text-center py-2">
                  <span className="text-4xl">🏆</span>
                  <h4 className="font-headline font-bold text-lg text-primary-container mt-2">Boss besiegt!</h4>
                  <p className="text-sm text-on-surface-variant font-body">{bd.icon} {bd.name} wurde besiegt!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ background: 'rgba(186,26,26,0.1)', border: '1px solid rgba(186,26,26,0.2)' }}>
                      <span className="text-2xl">{bd.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-[10px] font-label text-error uppercase tracking-widest">Boss-Kampf</p>
                        <p className="font-bold text-xs font-label text-error">{state.boss.hp}/{state.boss.maxHp} HP</p>
                      </div>
                      <h4 className="font-headline font-bold text-lg text-primary-container">{bd.name}</h4>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(232,225,218,0.5)' }}>
                    <div className="h-full bg-error rounded-full transition-all duration-500"
                         style={{ width: `${(state.boss.hp / state.boss.maxHp) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-body italic mt-1.5">{bd.desc}</p>
                </>
              )}
            </div>
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
                <h4 className="font-bold text-sm font-label text-primary uppercase tracking-tight">Neben-Quests</h4>
              </div>
              <div className="flex flex-col gap-3">
                {sideQuests.slice(0, 3).map(q => (
                  <div key={q.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ background: 'rgba(83,0,183,0.05)' }}>
                      <span className="text-xl">{q.icon}</span>
                    </div>
                    <p className="font-body text-xs text-on-surface font-semibold flex-1">{q.name}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Weekly Mission ── */}
        {(() => {
          const wm = WEEKLY_MISSIONS?.find(m => m.id === state.weeklyMission);
          if (!wm) return null;
          const wp = state.weeklyProgress || 0;
          return (
            <div className="p-5 rounded-2xl"
                 style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', border: '1px dashed rgba(83,0,183,0.3)' }}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary/80">sports_soccer</span>
                  <h4 className="font-bold text-sm font-label text-primary/80 uppercase tracking-tight">Wochen-Mission</h4>
                </div>
                <span className="font-bold text-xs font-label text-primary/60">{Math.min(wp, wm.target)}/{wm.target}</span>
              </div>
              <p className="font-headline font-bold text-base text-primary-container mb-1">{wm.title}</p>
              <p className="font-body text-xs text-on-surface-variant">{wm.story}</p>
            </div>
          );
        })()}

        {/* ── Bodhi leaf ── */}
        <div className="flex justify-center py-2 opacity-20">
          <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
            <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#5300b7" />
          </svg>
        </div>
      </main>
    </div>
  );
}
