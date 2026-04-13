import React, { useState } from 'react';
import { WEEKLY_MISSIONS, MOOD_EMOJIS, BOSSES, BOSS_TIERS, GEAR_ITEMS } from '../constants';
import { useTask } from '../context/TaskContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import SFX from '../utils/sfx';
import Egg from './Egg';
import { Pearl } from './CurrencyIcons';
import { BADGES } from '../constants';

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
        <img src={base + 'art/bg-warm-cream.webp'} alt="" className="w-full h-full object-cover" />
      </div>

      {/* ── Minimal Top Bar ── */}
      <header className="flex justify-between items-center px-6 pb-2"
              style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg"
               style={{ background: '#a2d0d4' }}>
            <img src={base + 'art/dragon-baby.webp'} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-headline font-bold text-primary" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.5)' }}>
            Ronki
          </span>
        </div>
        <div className="px-4 py-1.5 rounded-full flex items-center gap-2"
             style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <span className="font-bold text-[11px] font-label text-primary">Lv. 1</span>
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
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(18,67,70,0.1)" strokeWidth="5" />
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
                  style={{ background: i < (state.dailyWaterCount || 0) ? undefined : 'rgba(18,67,70,0.05)' }}
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
              <div className="p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden"
                   style={{ background: '#1a1a3e', border: '1.5px solid rgba(252,211,77,0.2)', boxShadow: '0 4px 20px rgba(26,26,62,0.25)' }}
                   onClick={() => setShowBossDetail(true)}>
                <img src={base + 'art/tex-sternenmeer.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(26,26,62,0.7), rgba(35,35,80,0.6))' }} />
                {/* Round portrait */}
                <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden shrink-0 cursor-pointer shadow-lg"
                     style={{ border: '3px solid #fcd34d', boxShadow: '0 0 12px rgba(252,211,77,0.3)' }}>
                  {artSrc ? (
                    <img src={artSrc} alt={bd.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'rgba(186,26,26,0.1)' }}>{bd.icon}</div>
                  )}
                </div>
                {/* Stats */}
                <div className="relative z-10 flex-1">
                  {defeated ? (
                    <>
                      <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fcd34d' }}>Boss besiegt!</p>
                      <h4 className="font-headline font-bold text-lg text-white">{bd.name}</h4>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fca5a5' }}>Boss-Kampf</p>
                        <p className="font-bold text-xs font-label" style={{ color: '#fca5a5' }}>{state.boss.hp}/{state.boss.maxHp} HP</p>
                      </div>
                      <h4 className="font-headline font-bold text-lg text-white">{bd.name}</h4>
                      <div className="w-full h-2 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hpPct}%`, background: '#f87171' }} />
                      </div>
                      {(state.bossDmgToday || 0) > 0 && (
                        <p className="font-label font-bold text-xs mt-1" style={{ color: '#fcd34d' }}>
                          Heute: -{state.bossDmgToday} Schaden!
                        </p>
                      )}
                    </>
                  )}
                </div>
                <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: 'rgba(252,211,77,0.5)' }}>chevron_right</span>
              </div>

              {/* Full-screen Boss Battle Detail */}
              {showBossDetail && (
                <div className="fixed inset-0 z-[200] flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  {/* Background texture */}
                  <img src={base + 'art/bg-emerald-mist.png'} alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: -1 }} />
                  {/* Close button */}
                  <button onClick={() => setShowBossDetail(false)}
                    className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                    <span className="material-symbols-outlined text-white text-xl">close</span>
                  </button>

                  {/* VS Face-off */}
                  <div className="relative flex items-center justify-center pt-12 pb-6 px-6"
                       style={{ background: 'linear-gradient(135deg, #1a0030 0%, #2d0060 50%, #400000 100%)' }}>
                    {/* Hero side */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
                           style={{ borderColor: '#fcd34d', boxShadow: '0 0 20px rgba(252,211,77,0.4)' }}>
                        <img src={base + 'art/egg-glow.webp'} alt="Held" className="w-full h-full object-cover" />
                      </div>
                      <p className="font-headline font-bold text-white text-sm mt-2">Dein Held</p>
                    </div>

                    {/* VS badge */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 mx-2"
                         style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', boxShadow: '0 0 30px rgba(252,211,77,0.5)' }}>
                      <span className="font-headline font-black text-xl" style={{ color: '#725b00' }}>VS</span>
                    </div>

                    {/* Boss side */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
                           style={{ borderColor: '#ba1a1a', boxShadow: '0 0 20px rgba(186,26,26,0.4)' }}>
                        {artSrc ? (
                          <img src={artSrc} alt={bd.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: '#ba1a1a33' }}>{bd.icon}</div>
                        )}
                      </div>
                      <p className="font-headline font-bold text-white text-sm mt-2">{bd.name}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-t-[2rem] -mt-4 relative z-10 px-6 pt-8 pb-36"
                       style={{ background: '#fff8f2' }}>

                    {/* Gear Bonus Indicator */}
                    {(() => {
                      const eq = state.equippedGear || {};
                      let totalCourage = 0, totalDefense = 0;
                      for (const slotId of Object.values(eq)) {
                        const g = GEAR_ITEMS.find(gi => gi.id === slotId);
                        if (g) { totalCourage += g.stats.courage || 0; totalDefense += g.stats.defense || 0; }
                      }
                      const courageBonus = Math.floor(totalCourage / 5);
                      const defenseBonus = Math.floor(totalDefense / 5);
                      if (courageBonus <= 0 && defenseBonus <= 0) return null;
                      return (
                        <div className="flex gap-3 mb-5">
                          {courageBonus > 0 && (
                            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                                 style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)' }}>
                              <span className="material-symbols-outlined text-base" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                              <span className="font-label font-bold text-xs" style={{ color: '#b45309' }}>+{courageBonus} Schaden</span>
                              <span className="font-label text-[9px] text-on-surface-variant">(Mut)</span>
                            </div>
                          )}
                          {defenseBonus > 0 && (
                            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                                 style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                              <span className="material-symbols-outlined text-base" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>shield</span>
                              <span className="font-label font-bold text-xs" style={{ color: '#059669' }}>+{defenseBonus} Beute</span>
                              <span className="font-label text-[9px] text-on-surface-variant">(Schutz)</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Boss Tier Badge */}
                    {(() => {
                      const tier = BOSS_TIERS.find(t => t.id === bd.tier);
                      return tier ? (
                        <div className="flex items-center gap-2 mb-5">
                          <span className="text-sm">{tier.icon}</span>
                          <span className="font-label font-bold text-[10px] uppercase tracking-widest" style={{ color: tier.color }}>
                            {tier.name}-Klasse
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* HP Bar */}
                    {!defeated ? (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-label font-bold text-xs text-error uppercase tracking-widest">Boss-Lebensenergie</span>
                          <span className="font-label font-bold text-sm text-error">{state.boss.hp} / {state.boss.maxHp}</span>
                        </div>
                        <div className="w-full h-5 rounded-full overflow-hidden relative"
                             style={{ background: '#ffdad6', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                          <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                               style={{ width: `${hpPct}%`, background: 'linear-gradient(90deg, #ba1a1a, #ff6b6b)' }}>
                            <div className="absolute inset-0 opacity-30"
                                 style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px)', animation: 'slide 1s linear infinite' }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 text-center py-4 rounded-2xl" style={{ background: 'rgba(52,211,153,0.1)', border: '2px solid #34d399' }}>
                        <span className="material-symbols-outlined text-4xl mb-1 block" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        <p className="font-headline font-bold text-xl" style={{ color: '#059669' }}>Boss besiegt!</p>
                      </div>
                    )}

                    {/* Combat progress — damage log */}
                    {(state.bossDmgToday || 0) > 0 && (() => {
                      const doneQuests = (state.quests || []).filter(q => q.done && !q.sideQuest);
                      const dmgLog = doneQuests.map(q => ({
                        name: q.name || q.id,
                        icon: q.icon || '',
                        dmg: Math.max(5, Math.floor((q.xp || 0) * 0.8)),
                      }));
                      return (
                        <div className="mb-6 rounded-2xl overflow-hidden"
                             style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                          {/* Header */}
                          <div className="flex items-center gap-3 p-4 pb-2">
                            <span className="material-symbols-outlined text-xl shrink-0" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>swords</span>
                            <div className="flex-1">
                              <p className="font-label font-bold text-sm" style={{ color: '#059669' }}>
                                Heutige Power: +{state.bossDmgToday} Schaden
                              </p>
                            </div>
                          </div>
                          {/* Quest damage list */}
                          {dmgLog.length > 0 && (
                            <div className="px-4 pb-4 pt-1">
                              <div className="flex flex-col gap-1.5">
                                {dmgLog.map((entry, i) => (
                                  <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl"
                                       style={{ background: 'rgba(255,255,255,0.7)' }}>
                                    <span className="text-base">{entry.icon}</span>
                                    <span className="font-body text-xs text-on-surface flex-1 truncate">{entry.name}</span>
                                    <span className="font-label font-bold text-xs whitespace-nowrap" style={{ color: '#059669' }}>
                                      -{entry.dmg} HP
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Boss lore card */}
                    <div className="mb-6 rounded-2xl overflow-hidden"
                         style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      {artSrc && (
                        <img src={artSrc} alt={bd.name} className="w-full h-40 object-cover" />
                      )}
                      <div className="p-5">
                        <p className="font-label font-bold text-[10px] text-error uppercase tracking-widest">
                          {defeated ? 'Bezwungen' : 'Tages-Boss'}
                        </p>
                        <h3 className="font-headline font-bold text-2xl text-on-surface mt-1">{bd.name}</h3>
                        <p className="font-body text-on-surface-variant mt-2 leading-relaxed">{bd.desc}</p>
                      </div>
                    </div>

                    {/* Loot section */}
                    {defeated && (
                      <div className="mb-6">
                        <h4 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-3">Beute erhalten</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl text-center"
                               style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.1)' }}>
                            <span className="material-symbols-outlined text-2xl text-primary mb-1 block"
                                  style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                            <p className="font-label font-bold text-lg text-primary">+{bd.reward.hp}</p>
                            <p className="font-label text-[10px] text-on-surface-variant uppercase">Heldenpunkte</p>
                          </div>
                          <div className="p-4 rounded-2xl text-center"
                               style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)' }}>
                            <span className="material-symbols-outlined text-2xl mb-1 block"
                                  style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            <p className="font-label font-bold text-lg" style={{ color: '#b45309' }}>+1</p>
                            <p className="font-label text-[10px] text-on-surface-variant uppercase">Evo-Essenz</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trophy Gallery */}
                    {(state.bossTrophies || []).length > 0 && (
                      <div className="mb-6 mm-card p-5">
                        <h4 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                          Trophäen-Sammlung
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {BOSSES.map(boss => {
                            const isDefeated = (state.bossTrophies || []).includes(boss.id);
                            const tier = BOSS_TIERS.find(t => t.id === boss.tier);
                            return (
                              <div key={boss.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                                   style={{
                                     background: isDefeated ? 'rgba(252,211,77,0.08)' : 'rgba(232,225,218,0.3)',
                                     border: isDefeated ? '1.5px solid rgba(252,211,77,0.3)' : '1.5px dashed rgba(204,195,215,0.3)',
                                     opacity: isDefeated ? 1 : 0.4,
                                   }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                     style={{
                                       background: isDefeated ? 'rgba(252,211,77,0.15)' : 'rgba(232,225,218,0.5)',
                                       boxShadow: isDefeated ? '0 0 12px rgba(252,211,77,0.2)' : 'none',
                                     }}>
                                  {isDefeated ? boss.icon : (
                                    <span className="material-symbols-outlined text-base" style={{ color: '#c0c8c9' }}>lock</span>
                                  )}
                                </div>
                                <span className="font-label font-bold text-[9px] text-center leading-tight text-on-surface"
                                      style={{ opacity: isDefeated ? 1 : 0.5 }}>
                                  {isDefeated ? boss.name : '???'}
                                </span>
                                {tier && isDefeated && (
                                  <span className="text-[8px] font-label font-bold px-1.5 py-0.5 rounded-full"
                                        style={{ background: `${tier.color}15`, color: tier.color }}>
                                    {tier.icon}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="font-label text-[10px] text-on-surface-variant text-center mt-3">
                          {(state.bossTrophies || []).length} / {BOSSES.length} Bosse besiegt
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom CTA */}
                  <div className="fixed bottom-0 left-0 w-full z-50 p-6"
                       style={{ background: 'linear-gradient(to top, #fff8f2 70%, transparent)' }}>
                    <button onClick={() => setShowBossDetail(false)}
                      className="w-full max-w-lg mx-auto block py-4 rounded-full font-label font-extrabold text-lg active:scale-95 transition-all"
                      style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
                      {defeated ? 'Sieg feiern!' : 'Weiter kämpfen!'}
                    </button>
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
                         style={{ background: 'rgba(18,67,70,0.05)' }}>
                      <span className="text-xl">{q.icon}</span>
                    </div>
                    <p className="font-body text-xs text-on-surface font-semibold flex-1">{q.name}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Epic Missions Entry — Kristallgold ── */}
        <button
          className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] relative overflow-hidden"
          style={{ background: '#451a03', border: '1.5px solid rgba(252,211,77,0.2)', boxShadow: '0 4px 20px rgba(69,26,3,0.25)' }}
          onClick={() => onNavigate?.('missions')}
        >
          <img src={base + 'art/tex-wolkengrat.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(69,26,3,0.55), rgba(120,53,15,0.45))' }} />
          <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', border: '3px solid #fcd34d', boxShadow: '0 0 12px rgba(252,211,77,0.3)' }}>
            <span className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>swords</span>
          </div>
          <div className="relative z-10 flex-1">
            <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fcd34d' }}>Epische Missionen</p>
            <h4 className="font-headline font-bold text-lg text-white">
              {(state.activeMissions || []).length > 0
                ? `${state.activeMissions.length} aktiv`
                : 'Wähle dein Abenteuer!'}
            </h4>
          </div>
          <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: 'rgba(252,211,77,0.5)' }}>chevron_right</span>
        </button>

        {/* ── Latest Achievement Spotlight ── */}
        {(() => {
          const unlocked = state.unlockedBadges || [];
          if (unlocked.length === 0) return null;
          const latestId = unlocked[unlocked.length - 1];
          const badge = BADGES.find(b => b.id === latestId);
          if (!badge) return null;
          return (
            <div className="p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.08)' }}
                 onClick={() => onNavigate?.('kodex')}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(252,211,77,0.15)', border: '2px solid rgba(252,211,77,0.3)' }}>
                <span className="text-3xl">{badge.i}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[10px] font-label uppercase tracking-widest" style={{ color: '#b45309' }}>Neueste Errungenschaft</p>
                <h4 className="font-headline font-bold text-base text-on-surface truncate">{badge.n}</h4>
                <p className="font-body text-xs text-on-surface-variant truncate">{badge.desc}</p>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-xl" style={{ color: 'rgba(18,67,70,0.3)' }}>chevron_right</span>
                <span className="font-label font-bold text-[10px] text-on-surface-variant">{unlocked.length}/{BADGES.length}</span>
              </div>
            </div>
          );
        })()}

        {/* ── Helden-Kodex Card — Morgenwald ── */}
        <button
          className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all active:scale-[0.98] relative overflow-hidden"
          style={{ background: '#fef9c3', border: '1.5px solid rgba(101,163,13,0.15)', boxShadow: '0 4px 16px rgba(101,163,13,0.08)' }}
          onClick={() => onNavigate?.('kodex')}
        >
          <img src={base + 'art/tex-morgenwald.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(254,249,195,0.55), rgba(236,252,203,0.5))' }} />
          <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'linear-gradient(135deg, #65a30d, #84cc16)', boxShadow: '0 2px 8px rgba(101,163,13,0.3)' }}>
            <span className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div className="relative z-10 flex-1">
            <p className="font-headline font-bold text-lg" style={{ color: '#1a2e05' }}>Helden-Kodex</p>
            <p className="font-body text-base" style={{ color: '#365314' }}>Unsere Familien-Werte</p>
          </div>
          <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: '#4d7c0f' }}>chevron_right</span>
        </button>

        {/* ── Bodhi leaf ── */}
        <div className="flex justify-center py-2 opacity-20">
          <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
            <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#124346" />
          </svg>
        </div>
      </main>
    </div>
  );
}
