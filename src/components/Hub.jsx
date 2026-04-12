import React, { useState } from 'react';
import { WEEKLY_MISSIONS, MOOD_EMOJIS, BOSSES } from '../constants';
import { useTask } from '../context/TaskContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import SFX from '../utils/sfx';
import Egg from './Egg';
import { Pearl } from './CurrencyIcons';

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

const BOSS_ART = {
  schnarchling: { full: 'art/boss-schnarchling_the-snorer-fullpower.webp', defeated: 'art/boss-schnarchling_the-snorer-defeated.webp' },
  wusselwicht:  { full: 'art/boss-wusselwicht-the-chaos-imp-fullpower.webp', defeated: 'art/boss-wusselwicht-the-chaos-imp-defeated.webp' },
  flimmerfux:   { full: 'art/boss-flimmerfux_the-flicker-fox-fullpower.webp', defeated: 'art/boss-flimmerfux_the-flicker-fox-defeated.webp' },
};

export default function Hub({ onNavigate }) {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct } = computed;
  const { weather } = useWeather();
  const base = import.meta.env.BASE_URL;
  const remaining = total - done;

  const [showBossDetail, setShowBossDetail] = useState(false);

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
            <Pearl size={24} />
            <span className="font-extrabold font-label text-sm text-primary-container">{state.hp || 0} Heldenpunkte</span>
          </div>
        </div>

        {/* ── Login Bonus ── */}
        {!state.loginBonusClaimed && (
          <button
            className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}
            onClick={() => { SFX.play('pop'); actions.collectLoginBonus(); }}
          >
            <span className="text-3xl">👋</span>
            <div className="flex-1">
              <p className="font-headline font-bold text-base text-secondary">Willkommen zurück!</p>
              <p className="font-body text-sm text-on-surface-variant">Tippe für deinen täglichen Heldenpunkt</p>
            </div>
            <span className="px-3 py-1.5 rounded-full font-label font-bold text-xs"
                  style={{ background: '#fcd34d', color: '#725b00' }}>+5 HP</span>
          </button>
        )}

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
                <p className="font-bold text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Wie geht's dir?</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {MOOD_EMOJIS.map((e, i) => (
                    <button key={i} onClick={() => { SFX.play("pop"); actions.setMood("moodAM", i); }}
                      className="text-2xl p-1.5 rounded-xl hover:bg-white/50 transition-all active:scale-90 flex items-center justify-center"
                      style={{ minHeight: 40 }}>{e}</button>
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

        {/* ── Boss Card (compact with tappable portrait) ── */}
        {state.boss && (() => {
          const bd = BOSSES.find(b => b.id === state.boss.id);
          if (!bd) return null;
          const defeated = state.boss.hp <= 0;
          const art = BOSS_ART[bd.id];
          const artSrc = art ? base + (defeated ? art.defeated : art.full) : null;
          const hpPct = state.boss.maxHp > 0 ? (state.boss.hp / state.boss.maxHp) * 100 : 0;
          return (
            <>
              <div className="p-5 rounded-2xl flex items-center gap-4"
                   style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}
                   onClick={() => setShowBossDetail(true)}>
                {/* Round portrait */}
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 cursor-pointer shadow-lg"
                     style={{ border: defeated ? '3px solid #34d399' : '3px solid rgba(186,26,26,0.3)' }}>
                  {artSrc ? (
                    <img src={artSrc} alt={bd.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'rgba(186,26,26,0.1)' }}>{bd.icon}</div>
                  )}
                </div>
                {/* Stats */}
                <div className="flex-1">
                  {defeated ? (
                    <>
                      <p className="font-bold text-[10px] font-label uppercase tracking-widest" style={{ color: '#059669' }}>Boss besiegt!</p>
                      <h4 className="font-headline font-bold text-lg text-on-surface">{bd.name}</h4>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-[10px] font-label text-error uppercase tracking-widest">Boss-Kampf</p>
                        <p className="font-bold text-xs font-label text-error">{state.boss.hp}/{state.boss.maxHp} HP</p>
                      </div>
                      <h4 className="font-headline font-bold text-lg text-on-surface">{bd.name}</h4>
                      <div className="w-full h-2 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(232,225,218,0.5)' }}>
                        <div className="h-full bg-error rounded-full transition-all duration-500" style={{ width: `${hpPct}%` }} />
                      </div>
                      {(state.bossDmgToday || 0) > 0 && (
                        <p className="font-label font-bold text-xs mt-1" style={{ color: '#059669' }}>
                          Heute: -{state.bossDmgToday} Schaden!
                        </p>
                      )}
                    </>
                  )}
                </div>
                <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
              </div>

              {/* Boss detail popup */}
              {showBossDetail && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={() => setShowBossDetail(false)}>
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                  <div className="relative rounded-2xl overflow-hidden max-w-sm w-full" onClick={e => e.stopPropagation()}
                       style={{ background: '#fff8f1', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                    {artSrc && <img src={artSrc} alt={bd.name} className="w-full h-56 object-cover" />}
                    <div className="p-6">
                      <p className="font-bold text-[10px] font-label text-error uppercase tracking-widest">{defeated ? 'Besiegt!' : 'Tages-Boss'}</p>
                      <h3 className="font-headline font-bold text-2xl text-on-surface mt-1">{bd.name}</h3>
                      <p className="font-body text-on-surface-variant mt-2">{bd.desc}</p>
                      {!defeated && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm font-label font-bold mb-1">
                            <span className="text-error">Lebensenergie</span>
                            <span className="text-error">{state.boss.hp}/{state.boss.maxHp}</span>
                          </div>
                          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#e8e1da' }}>
                            <div className="h-full bg-error rounded-full" style={{ width: `${hpPct}%` }} />
                          </div>
                          <p className="font-body text-xs text-on-surface-variant italic mt-2">Erledige Quests, um Schaden zu verursachen!</p>
                        </div>
                      )}
                      <button className="w-full mt-5 py-3 rounded-full font-label font-bold text-base"
                              style={{ background: '#fcd34d', color: '#725b00' }}
                              onClick={() => setShowBossDetail(false)}>
                        {defeated ? 'Super gemacht!' : 'Verstanden!'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
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

        {/* ── Helden-Kodex Card ── */}
        <button
          className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98]"
          style={{ background: 'rgba(83,0,183,0.05)', border: '1px solid rgba(83,0,183,0.1)' }}
          onClick={() => onNavigate?.('kodex')}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'rgba(83,0,183,0.1)' }}>
            <span className="material-symbols-outlined text-primary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div className="flex-1">
            <p className="font-headline font-bold text-base text-primary">Helden-Kodex</p>
            <p className="font-body text-sm text-on-surface-variant">Unsere Familien-Werte</p>
          </div>
          <span className="material-symbols-outlined text-primary/40">chevron_right</span>
        </button>

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
