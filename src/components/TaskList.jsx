import React, { useState } from 'react';
import { ANCHORS } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import useWeather, { getWeatherInfo, getClothingRecs } from '../hooks/useWeather';
import SFX from '../utils/sfx';
import { useSpecialQuests } from '../hooks/useSpecialQuests';
import ToothbrushTimer from './ToothbrushTimer';
import ClothingSheet from './ClothingSheet';

// Quest IDs that trigger the toothbrush timer
const TEETH_QUEST_IDS = new Set(['s3', 's12', 'v3', 'v10']);

// Pick a completion phrase that varies by anchor and day — same phrase per
// anchor all day (consistent), but rotates daily so it never feels stale.
const DONE_PHRASE_COUNT = 8;
const ANCHOR_ORDER = ['morning', 'evening', 'hobby', 'bedtime'];
function getDonePhrase(anchor, t) {
  const day = new Date().getDate();
  const anchorIdx = ANCHOR_ORDER.indexOf(anchor);
  const idx = ((day * 13) + (anchorIdx * 3)) % DONE_PHRASE_COUNT;
  return t(`task.status.complete.${idx}`);
}

const ANCHOR_META_BASE = {
  morning: { icon: 'light_mode', col: '#d97706', bg: '#fffbeb', border: 'rgba(217,119,6,0.1)', artFile: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_an_early_morning_sky._S_882cfbe3-5eac-4403-87a0-5c66602cf76b_2.webp' },
  evening: { icon: 'backpack', vacIcon: 'dark_mode', col: '#2d5a5e', bg: '#f0fdfa', border: 'rgba(45,90,94,0.1)', artFile: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp' },
  hobby: { icon: 'sports_soccer', col: '#059669', bg: '#ecfdf5', border: 'rgba(5,150,105,0.1)', artFile: 'art/bioms/Morgenwald_dawn-forest.webp' },
  bedtime: { icon: 'bedtime', col: '#4338ca', bg: '#eef2ff', border: 'rgba(67,56,202,0.1)', artFile: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_deep_night_sky._Rich__c902cc19-afa0-4c99-a434-6e206610ddf9_0.webp' },
};

// Vacation quests share the same hints as their school counterparts
const HINT_ALIAS = { v1: 's1', v3: 's3', v4: 's4', v2: 's2', v5b: 's6b', v6: 's8', v7: 'sq_zimmer', v10: 's12', v11: 's13', v12: 's14', v13: 's15' };

export default function TaskList({ onNavigate }) {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct, byGroup } = computed;
  const { weather } = useWeather();
  const [showWeather, setShowWeather] = useState(false);
  const [teethTimerQuestId, setTeethTimerQuestId] = useState(null);
  const { t, lang } = useTranslation();
  const { quests: specialQuests, completed: sqCompleted, totalDone: sqDone, total: sqTotal } = useSpecialQuests();

  const ANCHOR_META_I18N = {
    morning: { ...ANCHOR_META_BASE.morning, label: t('task.morning.title'), sublabel: t('task.morning.subtitle') },
    evening: { ...ANCHOR_META_BASE.evening, label: t('task.evening.title'), vacLabel: t('task.evening.vacTitle'), sublabel: t('task.evening.subtitle'), vacSublabel: t('task.evening.vacSubtitle') },
    hobby: { ...ANCHOR_META_BASE.hobby, label: t('task.hobby.title'), sublabel: t('task.hobby.subtitle') },
    bedtime: { ...ANCHOR_META_BASE.bedtime, label: t('task.bedtime.title'), sublabel: t('task.bedtime.subtitle') },
  };

  if (!state) return null;

  const base = import.meta.env.BASE_URL;

  // Remap old stored quests that still have anchor:"evening" but belong to bedtime or hobby
  const BEDTIME_IDS = new Set(['s8', 's12', 's13', 's14', 's15', 'v10', 'v11', 'v12', 'v13']);
  const HOBBY_IDS = new Set(['ft']);
  const groups = { ...byGroup };
  if (groups.evening) {
    const fromEvening = groups.evening.filter(q => BEDTIME_IDS.has(q.id));
    if (fromEvening.length) {
      groups.evening = groups.evening.filter(q => !BEDTIME_IDS.has(q.id));
      groups.bedtime = [...(groups.bedtime || []), ...fromEvening].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const fromHobby = groups.evening.filter(q => HOBBY_IDS.has(q.id));
    if (fromHobby.length) {
      groups.evening = groups.evening.filter(q => !HOBBY_IDS.has(q.id));
      groups.hobby = [...(groups.hobby || []), ...fromHobby].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  }

  // Weather data for clothing hints
  const todayWeather = weather?.daily?.[0];
  const currentWeather = weather?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weatherCode) : null;
  const clothingRecs = currentWeather
    ? getClothingRecs(currentWeather.temp, currentWeather.feelsLike, currentWeather.weatherCode, currentWeather.windSpeed)
    : [];

  const handleComplete = (id) => {
    // Teeth quests launch a brushing timer first
    if (TEETH_QUEST_IDS.has(id) && !state.quests?.find(q => q.id === id)?.done) {
      setTeethTimerQuestId(id);
      return;
    }
    actions.complete(id);
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(80);
  };

  return (
    <div className="px-6 pb-32">

      {/* ── Header ── */}
      <section className="mb-5">
        <h2 className="text-xl font-bold font-headline text-on-surface">{t('task.section.title')}</h2>
      </section>

      {/* ── Active Quest-Line Banner (Poem, Birthday, etc.) ── */}
      {state?.poemQuest && !state.poemQuest.completed ? (
        <button onClick={() => onNavigate?.('poem')}
          className="w-full rounded-2xl p-4 mb-5 flex items-center gap-4 active:scale-[0.98] transition-all text-left relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #124346, #2d5a5e)', border: '1.5px solid rgba(252,211,77,0.25)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'rgba(252,211,77,0.15)' }}>
            <span className="text-2xl">📖</span>
          </div>
          <div className="flex-1">
            <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: 'rgba(252,211,77,0.7)' }}>Spezial-Quest</p>
            <h4 className="font-headline font-bold text-lg text-white">Mein Gedicht</h4>
            <p className="font-label text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tag {(state.poemQuest.done?.length || 0) + 1} von 7
            </p>
          </div>
          <span className="material-symbols-outlined" style={{ color: 'rgba(252,211,77,0.5)' }}>chevron_right</span>
        </button>
      ) : !state?.poemQuest ? (
        /* Poem quest not started yet — show start button */
        <button onClick={() => {
            actions.patchState({ poemQuest: { done: [], completed: false, title: 'Mein Gedicht' } });
            onNavigate?.('poem');
          }}
          className="w-full rounded-2xl p-4 mb-5 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1.5px solid rgba(252,211,77,0.35)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'rgba(252,211,77,0.2)' }}>
            <span className="text-2xl">📖</span>
          </div>
          <div className="flex-1">
            <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#b45309' }}>Neu!</p>
            <h4 className="font-headline font-bold text-lg text-on-surface">Gedicht lernen</h4>
            <p className="font-body text-xs text-on-surface-variant">7-Tage-Quest — Tippe zum Starten!</p>
          </div>
          <span className="material-symbols-outlined" style={{ color: '#b45309' }}>play_arrow</span>
        </button>
      ) : null}

      {/* ── Epic Quest Groups ── */}
      <div className="flex flex-col gap-5">

        {['morning', 'evening', 'hobby', 'bedtime'].map(anchor => {
          const meta = ANCHOR_META_I18N[anchor];
          const quests = (groups[anchor] || []).filter(q => !q.sideQuest);
          if (!quests.length) return null;

          const secDone = quests.every(q => q.done);
          const doneCount = quests.filter(q => q.done).length;
          const isEvening = anchor === 'evening' || anchor === 'bedtime';
          const firstUndoneIdx = quests.findIndex(q => !q.done);
          const label = state.vacMode && meta.vacLabel ? meta.vacLabel : meta.label;
          const sublabel = state.vacMode && meta.vacSublabel ? meta.vacSublabel : meta.sublabel;
          const icon = state.vacMode && meta.vacIcon ? meta.vacIcon : meta.icon;

          return (
            <details key={anchor} className="group overflow-hidden" open={!secDone && !isEvening}
              style={{
                background: secDone ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : meta.bg,
                borderRadius: '1.25rem',
                border: secDone ? '1.5px solid rgba(52,211,153,0.25)' : `1.5px solid ${meta.border}`,
                boxShadow: secDone ? '0 4px 16px rgba(52,211,153,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* ── Epic Header (Summary) ── */}
              <summary className="p-6 cursor-pointer lotus-pattern list-none [&::-webkit-details-marker]:hidden relative overflow-hidden">
                {/* Painted sky backdrop — low opacity so content stays readable */}
                {meta.artFile && (
                  <img
                    src={base + meta.artFile}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ opacity: 0.13, objectPosition: 'center 30%' }}
                  />
                )}
                {/* Gradient overlay anchors left side text */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0.4) 100%)' }}
                />
                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {secDone ? (
                      /* Companion approval avatar when routine is complete */
                      <div className="relative w-14 h-14">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald/30"
                             style={{ background: 'rgba(52,211,153,0.1)' }}>
                          <img src={import.meta.env.BASE_URL + 'art/dragon-baby.webp'} alt=""
                               className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                             style={{ background: '#34d399', border: '2px solid #ecfdf5', lineHeight: 1 }}>
                          <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: 14 }}>thumb_up</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                           style={{ background: `${meta.col}15` }}>
                        <span className="material-symbols-outlined text-3xl"
                              style={{ color: meta.col }}>
                          {icon}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className={`text-xl font-bold font-headline ${secDone ? 'text-emerald-dark' : 'text-on-surface'}`}>{label}</h3>
                      <p className={`text-sm font-medium font-label ${secDone ? 'text-emerald-dark/70' : 'text-on-surface/60'}`}>
                        {secDone ? getDonePhrase(anchor, t) : t('task.tasksLeft', { count: quests.length - doneCount })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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
                      <span className={`absolute text-xs font-bold font-label ${secDone ? 'text-emerald-dark' : ''}`}>
                        {secDone ? (
                          <span className="material-symbols-outlined text-base text-emerald-dark" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        ) : `${doneCount}/${quests.length}`}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center group-open:rotate-180 transition-transform ${secDone ? 'bg-emerald-dark' : 'bg-primary'}`}>
                      <span className="material-symbols-outlined text-white text-lg">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </summary>

              {/* ── Task Items ── */}
              {(
                <div className="px-6 pb-6 pt-2">
                  {/* Section label */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-4 rounded-full" style={{ background: meta.col }} />
                    <h4 className="text-sm font-bold font-label uppercase tracking-wider text-on-surface/60">
                      {sublabel}
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
                      const hintKey = 'hint.' + (HINT_ALIAS[q.id] || q.id);
                      const hintRaw = t(hintKey);
                      const hint = hintRaw !== hintKey ? hintRaw : null;
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
                                    <p className="font-bold font-label line-through text-on-surface/50">{t('quest.' + q.id)}</p>
                                  </div>
                                  <span className="font-bold font-label text-xs" style={{ color: '#34d399' }}>+{q.xp} HP</span>
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
                                      {todayWeather.tempMin}°/{todayWeather.tempMax}° — {t('task.weather.viewOutfit')}
                                    </span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              /* ── Active task ── */
                              <div
                                className={`w-full flex items-center gap-3 rounded-xl transition-all text-left cursor-pointer active:scale-[0.97] ${isNext ? 'p-5' : 'p-4'}`}
                                style={{
                                  background: '#ffffff',
                                  border: isNext ? '2px solid rgba(18,67,70,0.18)' : '1px solid rgba(0,0,0,0.06)',
                                  boxShadow: isNext ? '0 4px 16px rgba(18,67,70,0.10), 0 0 0 3px rgba(252,211,77,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                                }}
                                onClick={() => canTap && handleComplete(q.id)}
                              >
                                <div className={`${isNext ? 'w-14 h-14' : 'w-11 h-11'} rounded-2xl flex items-center justify-center shrink-0 transition-all`}
                                     style={{ background: `${meta.col}${isNext ? '18' : '12'}` }}>
                                  <span className={isNext ? 'text-2xl' : 'text-lg'}>{q.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold font-label text-on-surface">{t('quest.' + q.id)}</p>
                                  {isAnziehen && todayWeather && weatherInfo ? (
                                    <button
                                      className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded-lg transition-all text-left"
                                      style={{ background: 'rgba(2,132,199,0.08)' }}
                                      onClick={(e) => { e.stopPropagation(); setShowWeather(true); }}
                                    >
                                      <span className="text-sm">{weatherInfo.emoji}</span>
                                      <span className="text-xs font-bold" style={{ color: '#0284C7' }}>
                                        {todayWeather.tempMin}°/{todayWeather.tempMax}° — {t('task.weather.outfitHint')}
                                      </span>
                                    </button>
                                  ) : hint ? (
                                    <p className="text-xs font-body text-on-surface/60 mt-0.5">{hint}</p>
                                  ) : null}
                                  {isRepeatable && (
                                    <p className="text-xs font-body text-on-surface/60 mt-0.5">
                                      {t('task.progress', { cur: curCompletions, target: q.target })}
                                    </p>
                                  )}
                                </div>
                                <span className="font-bold font-label text-xs text-primary">+{q.xp} HP</span>
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
            <section className="rounded-2xl overflow-hidden"
                     style={{
                       background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                       border: '1.5px solid rgba(115,92,0,0.18)',
                       boxShadow: '0 2px 12px rgba(115,92,0,0.08)',
                     }}>
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <div className="w-1.5 h-7 rounded-full" style={{ background: '#735c00' }} />
                <h2 className="font-headline text-xl text-on-surface">{t('task.bonus')}</h2>
              </div>
              <div className="flex flex-col">
                {sideQuests.map((q, idx) => (
                  <div key={q.id}
                    className={`flex items-center gap-4 px-4 py-3.5 transition-all ${q.done ? 'opacity-60' : ''}`}
                    style={{
                      borderTop: idx > 0 ? '1px solid rgba(115,92,0,0.1)' : undefined,
                    }}
                  >
                    {q.done ? (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                           style={{ background: '#34d399' }}>
                        <span className="material-symbols-outlined text-white text-xl"
                              style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    ) : (
                      <button
                        className="w-12 h-12 rounded-full border-[2.5px] flex items-center justify-center shrink-0 transition-all hover:border-secondary cursor-pointer active:scale-90"
                        style={{ borderColor: '#735c00', background: 'rgba(252,211,77,0.06)', boxShadow: '0 0 0 3px rgba(252,211,77,0.12)' }}
                        onClick={() => handleComplete(q.id)}
                        aria-label={`${t('quest.' + q.id)} ${t('task.complete')}`}
                      >
                        <span className="material-symbols-outlined text-secondary/40 text-lg">radio_button_unchecked</span>
                      </button>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{q.icon}</span>
                        <p className={`text-lg font-bold font-label ${q.done ? 'line-through text-on-surface/50' : 'text-on-surface'}`}>
                          {t('quest.' + q.id)}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold font-label text-xs ${q.done ? 'text-emerald-dark' : 'text-secondary'}`}>
                      +{q.xp} HP
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
               style={{ background: 'linear-gradient(135deg, #124346, #2d5a5e)', minHeight: 160 }}>
            <div className="relative z-10">
              <p className="font-label text-sm uppercase tracking-wider opacity-80">{t('task.bento.dailyGoal')}</p>
              <h4 className="font-headline text-2xl mt-1">{t('task.bento.ready', { pct: Math.round(pct * 100) })}</h4>
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
              <p className="font-label text-sm uppercase tracking-wider opacity-80">{t('task.bento.companion')}</p>
              <h4 className="font-headline text-2xl mt-1">{t('task.bento.steps', { done })}</h4>
              <p className="font-body text-xs mt-1 opacity-70">{t('task.bento.eggHelp')}</p>
            </div>
            <span className="material-symbols-outlined text-4xl relative z-10"
                  style={{ fontVariationSettings: "'FILL' 1" }}>egg</span>
          </div>
        </div>
      </div>

      {/* ── Explorer / Discovery Quests (collapsible, below routines) ── */}
      {sqTotal > 0 && (
        <details className="group mt-4 rounded-2xl overflow-hidden"
                 style={{ background: 'rgba(18,67,70,0.03)', border: '1.5px solid rgba(18,67,70,0.08)' }}>
          <summary className="p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(18,67,70,0.06)' }}>
                  <span className="material-symbols-outlined text-primary text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    {lang === 'de' ? 'Entdecker-Quests' : 'Explorer Quests'}
                  </h3>
                  <p className="font-label text-xs text-on-surface-variant">{sqDone}/{sqTotal} {lang === 'de' ? 'entdeckt' : 'discovered'}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-open:rotate-180 transition-transform"
                   style={{ background: 'rgba(18,67,70,0.06)' }}>
                <span className="material-symbols-outlined text-on-surface-variant text-lg">expand_more</span>
              </div>
            </div>
          </summary>
          <div className="px-4 pb-4 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(18,67,70,0.06)' }}>
            {specialQuests.map(q => {
              const isDone = !!sqCompleted[q.id];
              const title = lang === 'de' ? q.titleDe : q.titleEn;
              const desc  = lang === 'de' ? q.descDe  : q.descEn;
              return (
                <div key={q.id} className="flex items-center gap-3 py-2"
                     style={{ opacity: isDone ? 0.6 : 1 }}>
                  <span className="text-xl leading-none select-none shrink-0">{q.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-sm font-semibold ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{title}</p>
                    {!isDone && <p className="font-body text-xs text-on-surface-variant mt-0.5">{desc}</p>}
                  </div>
                  {isDone && <span className="material-symbols-outlined text-lg shrink-0" style={{ color: '#34d399', fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                </div>
              );
            })}
          </div>
        </details>
      )}

      {/* ── Bodhi leaf ── */}
      <div className="flex justify-center py-6 opacity-10">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none">
          <path d="M60 10C60 10 75 40 110 40C110 40 80 55 80 90C80 90 60 110 60 110C60 110 40 90 40 90C40 90 10 55 10 40C10 40 45 40 60 10Z" fill="#124346" />
        </svg>
      </div>

      {/* ── Weather Outfit Modal ── */}
      {showWeather && <ClothingSheet onClose={() => setShowWeather(false)} />}

      {/* ── Toothbrush Timer Overlay ── */}
      {teethTimerQuestId && (
        <ToothbrushTimer
          duration={120}
          onFinish={() => {
            actions.complete(teethTimerQuestId);
            SFX.play('coin');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setTeethTimerQuestId(null);
          }}
          onSkip={() => setTeethTimerQuestId(null)}
        />
      )}
    </div>
  );
}
