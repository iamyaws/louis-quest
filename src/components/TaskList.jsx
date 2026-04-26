import React, { useState } from 'react';
import { ANCHORS } from '../constants';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import { useTranslation } from '../i18n/LanguageContext';
import useWeather, { getWeatherInfo, getClothingRecs } from '../hooks/useWeather';
import { getCatStage } from '../utils/helpers';
import SFX from '../utils/sfx';
import { useSpecialQuests } from '../hooks/useSpecialQuests';
import ToothbrushTimer from './ToothbrushTimer';
import ToothBrushGuide from './ToothBrushGuide';
import ClothingSheet from './ClothingSheet';
import QuestLineCard from './QuestLineCard';
import TopBar from './TopBar';
import DailyHabits from './DailyHabits';
import MoodChibi from './MoodChibi';
import VoiceAudio from '../utils/voiceAudio';
import { biomeBackground } from '../utils/biomeBackgrounds';
import { useQuestEater } from './QuestEater';
import { flavorForQuest } from './FireBreathPuff';
import { useAnalytics } from '../hooks/useAnalytics';
import { useVoice } from '../companion/useVoice';

// Quest IDs that trigger the toothbrush timer
const TEETH_QUEST_IDS = new Set(['s3', 's12', 'v3', 'v10']);
// Evening brushing uses the guided 6-zone screen; morning keeps the simple timer
const TEETH_GUIDE_IDS = new Set(['s12', 'v10']);

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
  morning: { icon: 'light_mode', col: '#d97706', bg: '#fffbeb', border: 'rgba(217,119,6,0.1)', artFile: 'art/routines/morning-prep.webp' },
  // Unified backpack icon for both school + vacation modes. "Für Morgen" reads
  // the same in either context — prep for whatever tomorrow brings.
  evening: { icon: 'backpack', vacIcon: 'backpack', col: '#2d5a5e', bg: '#f0fdfa', border: 'rgba(45,90,94,0.1)', artFile: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp' },
  hobby: { icon: 'sports_soccer', col: '#059669', bg: '#ecfdf5', border: 'rgba(5,150,105,0.1)', artFile: 'art/bioms/Morgenwald_dawn-forest.webp' },
  bedtime: { icon: 'bedtime', col: '#4338ca', bg: '#eef2ff', border: 'rgba(67,56,202,0.1)', artFile: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_deep_night_sky._Rich__c902cc19-afa0-4c99-a434-6e206610ddf9_0.webp' },
};

// Vacation quests share the same hints as their school counterparts
const HINT_ALIAS = { v1: 's1', v3: 's3', v4: 's4', v2: 's2', v5b: 's6b', v6: 's8', v7: 'sq_zimmer', v10: 's12', v11: 's13', v12: 's14', v13: 's15' };

export default function TaskList({ onNavigate, onOpenQuestLine, onOpenParental }) {
  const { state, computed, actions } = useTask();
  const haptic = useHaptic();
  const { track } = useAnalytics();
  const voice = useVoice();
  const { done, total, allDone, pct, byGroup } = computed;
  const { weather } = useWeather();
  const [showWeather, setShowWeather] = useState(false);
  const [teethTimerQuestId, setTeethTimerQuestId] = useState(null);
  const { t, lang } = useTranslation();
  const { quests: specialQuests, completed: sqCompleted, totalDone: sqDone, total: sqTotal } = useSpecialQuests();
  const eater = useQuestEater();

  const ANCHOR_META_I18N = {
    morning: { ...ANCHOR_META_BASE.morning, label: t('task.morning.title'), sublabel: t('task.morning.subtitle') },
    evening: { ...ANCHOR_META_BASE.evening, label: t('task.evening.title'), vacLabel: t('task.evening.vacTitle'), sublabel: t('task.evening.subtitle'), vacSublabel: t('task.evening.vacSubtitle') },
    hobby: { ...ANCHOR_META_BASE.hobby, label: t('task.hobby.title'), sublabel: t('task.hobby.subtitle') },
    bedtime: { ...ANCHOR_META_BASE.bedtime, label: t('task.bedtime.title'), sublabel: t('task.bedtime.subtitle') },
  };

  if (!state) return null;

  const base = import.meta.env.BASE_URL;

  // Remap old stored quests that still have anchor:"evening" but belong to bedtime
  const BEDTIME_IDS = new Set(['s8', 's12', 's13', 's14', 's15', 'v10', 'v11', 'v12', 'v13']);
  const groups = { ...byGroup };
  if (groups.evening) {
    const fromEvening = groups.evening.filter(q => BEDTIME_IDS.has(q.id));
    if (fromEvening.length) {
      groups.evening = groups.evening.filter(q => !BEDTIME_IDS.has(q.id));
      groups.bedtime = [...(groups.bedtime || []), ...fromEvening].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  }
  // Streifen-aligned section model (Apr 2026): fold hobby into the afternoon
  // section so the kid sees Morgen / Nachmittag / Abend, not four sections.
  // RonkisTag.jsx uses the same blockFor() collapse — keeping HEUTE in sync
  // means a kid who switches between surfaces sees one consistent day shape.
  if (groups.hobby?.length) {
    groups.evening = [...(groups.evening || []), ...groups.hobby]
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    groups.hobby = [];
  }

  // Weather data for clothing hints
  const todayWeather = weather?.daily?.[0];
  const currentWeather = weather?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weatherCode) : null;
  const clothingRecs = currentWeather
    ? getClothingRecs(currentWeather.temp, currentWeather.feelsLike, currentWeather.weatherCode, currentWeather.windSpeed)
    : [];

  const handleComplete = (id, evt) => {
    // Teeth quests launch a brushing timer first
    if (TEETH_QUEST_IDS.has(id) && !state.quests?.find(q => q.id === id)?.done) {
      setTeethTimerQuestId(id);
      return;
    }
    const quest = state.quests?.find(q => q.id === id);

    // "Ronki eats the quest" animation — fly the quest's icon from the
    // tapped card into the pinned Ronki in the TopBar, who burps a
    // flame + briefly shows "+N ⭐". Core-loop audit #1 fix: the loop
    // stops being silent. Gracefully no-ops if no TopBar (e.g. Hub).
    if (eater && evt?.currentTarget && quest) {
      const fromRect = evt.currentTarget.getBoundingClientRect();
      eater.eatQuest({
        fromRect,
        emoji: quest.icon || '⭐',
        hp: quest.xp || 0,
        // Flavor is gated on taughtBreaths — non-flame animations fall
        // back to flame until the matching teach ritual has unlocked
        // them. See backlog_fire_breath_progression.md.
        flavor: flavorForQuest(quest, state.taughtBreaths),
      });
    }

    actions.complete(id);
    // ── Final-tap detection — mirrors the routine.complete analytics
    //    logic so we can fire the "everything done" voice instead of the
    //    normal quest_complete one. State here is stale (pre-mutation),
    //    so we subtract this tap's quest from the remaining count by id.
    //    mainQuests only — side-quests don't gate routine completion.
    let isFinalTap = false;
    if (quest && !quest.sideQuest) {
      const mainQuests = (state.quests || []).filter(q => !q.sideQuest);
      const remaining = mainQuests.filter(q => !q.done && q.id !== id).length;
      const priorAllDone = mainQuests.every(q => q.done);
      if (!priorAllDone && remaining === 0) {
        isFinalTap = true;
        track('routine.complete');
      }
    }

    // ── Ronki voice: 'all_done' when this tap flips the day complete
    //    (peak-warmth celebration lines), otherwise 'quest_complete'
    //    (per-tap reaction). Engine's 24h per-line cooldown keeps both
    //    pools from feeling repetitive. 300ms delay inside VoiceAudio.play
    //    keeps the voice from clashing with the tap SFX.
    voice.say(isFinalTap ? 'all_done' : 'quest_complete');

    // ── Analytics: fire quest.complete with questId + anchor.
    const anchor = quest?.anchor || 'unknown';
    track('quest.complete', { questId: id, anchor });

    // Ronki reacts with voice instead of generic pop
    const reactions = ['sfx_complete', 'sfx_wow', 'sfx_proud', 'sfx_excited', 'sfx_tap_happy'];
    VoiceAudio.play(reactions[Math.floor(Math.random() * reactions.length)]);
    SFX.play('pop');
    haptic('success');
  };

  // Hero name + today's weekday for the personalised header.
  const heroName = state.familyConfig?.childName || t('topbar.heroFallback');
  const weekday = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { weekday: 'long' });

  // Use the same midday sky asset as the Hub's ambient backdrop. 0.5 opacity
  // gives a soft bluish wash that fades cleanly into the cream content.
  const SKY_FILE = 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp';

  return (
    <div className="relative px-6 pb-32">

      {/* ── Biome-tinted morning-sky backdrop.
             Heute (Routine view) gets the "morning sky" biome: soft blue
             with cloud depth. Cream wash dominates at the fold so chapter
             cards read cleanly, but the blue tint bleeds through at the
             TopBar zone giving this tab its own distinct mood — matches
             the per-tab palette system (Lager amber, Heute blue, Laden
             gold, Tagebuch teal, Ronki sage). See utils/biomeBackgrounds.js. ── */}
      <div className="fixed inset-0 pointer-events-none"
           style={{
             zIndex: 0,
             background: biomeBackground('quests'),
             backgroundColor: '#fff8f2',
           }}
           aria-hidden="true" />

      {/* Relative wrapper so all content floats above the sky backdrop */}
      <div className="relative" style={{ zIndex: 1 }}>

      {/* ── Shared TopBar (back-pill to Lager). Rendered inside the view so
             the cream pills sit over this view's sky backdrop instead of a
             separate cream band (Hub pattern). -mx-6 cancels the parent's
             px-6 so the pills hug the viewport edges exactly like the
             Polish mockups. ── */}
      <div className="-mx-6" style={{ marginBottom: 6 }}>
        <TopBar onNavigate={onNavigate} view="quests" onOpenParental={onOpenParental} />
      </div>

      {/* ── Personalised header + overall progress bar ──
             Moved up from the Bento card at the bottom so Louis gets an
             orienting "where am I today" signal in the first fold. Design
             reference: Ronki Aufgaben Polish.html ("ein Fortschritt, nicht
             fünf"). ── */}
      <section className="mb-5">
        {/* Heute eyebrow: primary teal — matches the blue-sky biome on
             this view (was gold #A83E2C which clashed). Louis stays
             gold-deep as a personal accent against the teal headline. */}
        <p className="font-label font-bold text-[11px] uppercase tracking-[0.22em] mb-2"
           style={{ color: '#124346' }}>
          {lang === 'de' ? 'Heute' : 'Today'} · {weekday}
        </p>
        <h1 className="font-headline text-2xl leading-[1.1]"
            style={{ letterSpacing: '-0.015em', fontWeight: 500, textWrap: 'balance', color: '#124346' }}>
          {allDone
            ? <>{lang === 'de' ? 'Alles geschafft, ' : 'All done, '}<em className="not-italic" style={{ color: '#A83E2C' }}>{heroName}</em>.</>
            : <>{lang === 'de' ? 'Deine Aufgaben, ' : 'Your tasks, '}<em className="not-italic" style={{ color: '#A83E2C' }}>{heroName}</em>.</>}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden"
               style={{ background: 'rgba(18,67,70,0.12)', boxShadow: 'inset 0 1px 2px rgba(18,67,70,0.15)' }}>
            <div className="h-full rounded-full transition-all duration-700"
                 style={{
                   width: `${pct * 100}%`,
                   background: allDone
                     ? 'linear-gradient(90deg, #34d399 0%, #059669 100%)'
                     : 'linear-gradient(90deg, #fcd34d 0%, #f59e0b 100%)',
                   boxShadow: '0 0 8px rgba(252,211,77,0.4)',
                 }} />
          </div>
          <span className="font-label font-bold text-xs shrink-0 text-on-surface-variant">
            <b className="text-primary text-sm">{done}</b> {lang === 'de' ? 'von' : 'of'} {total}
          </span>
        </div>
      </section>

      {/* Daily habits moved BELOW routines (just above Bonus section).
           Rationale: Morgen-/Abend-/Nachtroutine is the main ritual; small
           checkpoints like Vitamin D or Zeit-mit-Liam belong as add-ons,
           not as prelude. See new mount point further down. */}

      {/* ── Parent-created quest-lines (top of list, show up to 3) ── */}
      {(() => {
        const allActive = (state?.parentQuestLines || [])
          .filter(q => !q.completed && !q.archived);
        if (!allActive.length) return null;
        const shown = allActive.slice(0, 3);
        const remainder = allActive.length - shown.length;
        return (
          <div className="mb-5">
            {shown.map(ql => (
              <QuestLineCard key={ql.id} questLine={ql} onOpen={onOpenQuestLine} />
            ))}
            {remainder > 0 && (
              <p className="font-label text-xs text-on-surface-variant/70 text-center italic mt-2">
                {remainder === 1
                  ? 'Noch eine Quest-Linie wartet. Frag Mama oder Papa.'
                  : `Noch ${remainder} Quest-Linien warten. Frag Mama oder Papa.`}
              </p>
            )}
          </div>
        );
      })()}

      {/* ── Active Poem Quest Banner ──
       *   Legacy surface from before quest-line templates existed. The 'NEU! Gedicht lernen'
       *   CTA for starting a fresh poem quest was removed (parents now use the generic
       *   Lern-Projekt quest-line template for poems, Einmaleins, Referate, etc.).
       *   The active banner stays so Louis (and anyone mid-quest) can finish what they started. */}
      {state?.poemQuest && !state.poemQuest.completed && (
        <button onClick={() => onNavigate?.('poem')}
          className="w-full rounded-2xl p-5 mb-5 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #6ee7b7 50%, #059669 100%)' }}>
          <span className="text-4xl select-none shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>📖</span>
          <div className="flex-1">
            <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#064e3b' }}>Spezial-Quest</p>
            <h4 className="font-headline font-bold text-lg" style={{ color: '#064e3b' }}>Mein Gedicht</h4>
            <p className="font-body text-sm mt-0.5" style={{ color: '#064e3b99' }}>
              Tag {(state.poemQuest.done?.length || 0) + 1} von 7
            </p>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
               style={{ background: '#ffffff', border: '2.5px solid rgba(6,78,59,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <span className="material-symbols-outlined text-xl" style={{ color: '#064e3b', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </div>
        </button>
      )}

      {/* ── Epic Quest Groups ── */}
      <div className="flex flex-col gap-5">

        {/* 3-section streifen-aligned day: Morgen / Nachmittag / Abend.
            Hobby quests are folded into evening above; iterating over
            'hobby' here is unreachable but harmless. */}
        {['morning', 'evening', 'bedtime'].map(anchor => {
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
                      // Companion approval avatar when routine is complete.
                      // Replaced the legacy amber-only dragon-baby.webp with
                      // the kid's actual variant-coloured chibi (Marc 25 Apr
                      // 2026 QA: "old art for completed quests"). Mirrors
                      // the canonical pattern from RoomHub: getCatStage()||1
                      // fallback so we never render the egg here.
                      <div className="relative w-14 h-14">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald/30 grid place-items-center"
                             style={{ background: 'rgba(52,211,153,0.1)' }}>
                          <MoodChibi
                            size={52}
                            variant={state?.companionVariant || 'forest'}
                            stage={getCatStage(state?.catEvo ?? 0) || 1}
                            mood="happy"
                            bare
                          />
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
                    {/* Chapter ring — Polish spec 28px (audit #4: old 36px
                         donuts were too big). Stroke 2.5, radius 11. */}
                    <div className="relative w-7 h-7 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" fill="transparent" r="11"
                                stroke="rgba(18,67,70,0.14)" strokeWidth="2.5" />
                        <circle cx="14" cy="14" fill="transparent" r="11"
                                stroke={secDone ? '#34d399' : '#fcd34d'}
                                strokeWidth="2.5" strokeLinecap="round"
                                strokeDasharray="69.1"
                                strokeDashoffset={69.1 - (doneCount / quests.length) * 69.1} />
                      </svg>
                      <span className="absolute font-bold font-label"
                            style={{ fontSize: 9 }}>
                        {secDone ? (
                          <span className="material-symbols-outlined" style={{ color: '#059669', fontVariationSettings: "'FILL' 1", fontSize: 11 }}>check</span>
                        ) : `${doneCount}/${quests.length}`}
                      </span>
                    </div>
                    {/* Chevron — Polish .chev spec: quiet 28×28 cream tile,
                         not solid primary pill (audit #13). */}
                    <div className="w-7 h-7 rounded-[10px] flex items-center justify-center group-open:rotate-180 transition-transform"
                         style={{
                           background: 'rgba(255,255,255,0.7)',
                           border: '1px solid rgba(18,67,70,0.08)',
                         }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#124346' }}>
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              </summary>

              {/* ── Task Items ── */}
              {(
                <div className="px-6 pb-6 pt-2">
                  {/* Section label — amber-brown accent matches the chapter's
                       anchor colour instead of generic grey (design-ref: the
                       "— SO STARTET DEIN TAG." orange-tinted subtitle). */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-[2px] rounded-full shrink-0" style={{ background: meta.col }} />
                    <h4 className="font-label font-extrabold uppercase"
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.22em',
                          color: meta.col,
                        }}>
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
                          {/* Step indicator + connector line.
                               Design-ref: dashed "path" connector before done,
                               solid emerald after. Pulse glow on the next-up
                               step draws the eye. */}
                          <div className="flex flex-col items-center" style={{ width: 32 }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                                 style={{
                                   background: fullyDone ? '#34d399' : isNext ? '#fcd34d' : 'rgba(18,67,70,0.08)',
                                   color: fullyDone ? 'white' : isNext ? '#725b00' : 'rgba(18,67,70,0.55)',
                                   border: fullyDone
                                     ? '1.5px solid #34d399'
                                     : isNext
                                     ? '1.5px solid #A83E2C'
                                     : '1.5px solid rgba(18,67,70,0.14)',
                                   boxShadow: isNext
                                     ? '0 0 0 3px rgba(252,211,77,0.25), 0 2px 6px -1px rgba(252,211,77,0.5)'
                                     : fullyDone
                                     ? '0 2px 6px -1px rgba(52,211,153,0.45)'
                                     : 'none',
                                 }}>
                              {fullyDone ? '✓' : idx + 1}
                            </div>
                            {!isLast && (
                              <div className="flex-1 w-0.5 my-1"
                                   style={{
                                     minHeight: 12,
                                     background: fullyDone
                                       ? 'linear-gradient(180deg, #34d399 0%, rgba(52,211,153,0.4) 100%)'
                                       : 'repeating-linear-gradient(180deg, rgba(18,67,70,0.18) 0 4px, transparent 4px 8px)',
                                   }} />
                            )}
                          </div>

                          {/* Task card */}
                          <div className="flex-1 mb-3">
                            {fullyDone ? (
                              /* ── Done task — mint-green tint makes "done" visually
                                   distinct from pending/active (design-ref: .qcard.done-card).
                                   XP pill drops the "HP" suffix so done reads
                                   quieter than active's verbose "+10 HP". ── */
                              <div className="rounded-xl p-4"
                                   style={{
                                     background: 'rgba(236,253,245,0.7)',
                                     border: '1px solid rgba(52,211,153,0.2)',
                                   }}>
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                       style={{ background: 'rgba(52,211,153,0.22)' }}>
                                    <span className="text-lg">{q.icon}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-body font-medium"
                                       style={{
                                         color: '#065f46',
                                         textDecoration: 'line-through',
                                         textDecorationColor: 'rgba(5,150,105,0.4)',
                                         textDecorationThickness: '1.5px',
                                       }}>
                                      {t('quest.' + q.id)}
                                    </p>
                                  </div>
                                  <span className="font-label font-extrabold text-[11px] shrink-0 whitespace-nowrap"
                                        style={{
                                          background: 'rgba(52,211,153,0.14)',
                                          color: '#059669',
                                          border: '1px solid rgba(5,150,105,0.15)',
                                          padding: '6px 9px',
                                          borderRadius: 8,
                                          letterSpacing: '0.04em',
                                        }}>+{q.xp}</span>
                                </div>
                                {/* Weather hint persists after completion */}
                                {isAnziehen && todayWeather && weatherInfo && (
                                  <button
                                    className="inline-flex items-center gap-1.5 mt-2 ml-14 px-2 py-0.5 rounded-md transition-all whitespace-nowrap"
                                    style={{ background: 'rgba(2,132,199,0.08)' }}
                                    onClick={() => setShowWeather(true)}
                                    aria-label={t('task.weather.viewOutfit')}
                                  >
                                    <span className="text-sm leading-none">{weatherInfo.emoji}</span>
                                    <span className="text-xs font-bold leading-none" style={{ color: '#0284C7' }}>
                                      {todayWeather.tempMin}°/{todayWeather.tempMax}°
                                    </span>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#0284C7' }}>info</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              /* ── Active task — Polish .qcard + .qcard.next
                                   spec: next-card uses gold border+glow +
                                   cream gradient (audit #9). Anchor icon
                                   tile 44×44 radius 14 regardless of state
                                   (audit #6). ── */
                              <div
                                className={`w-full flex items-center gap-3 transition-all text-left cursor-pointer active:scale-[0.97]`}
                                style={{
                                  background: isNext
                                    ? 'linear-gradient(180deg, #ffffff 0%, #fffaf0 100%)'
                                    : '#ffffff',
                                  border: isNext
                                    ? '1.5px solid rgba(252,211,77,0.55)'
                                    : '1px solid rgba(0,0,0,0.06)',
                                  boxShadow: isNext
                                    ? '0 10px 22px -8px rgba(252,211,77,0.4)'
                                    : '0 1px 4px rgba(0,0,0,0.04)',
                                  padding: isNext ? '16px' : '12px 14px',
                                  borderRadius: 14,
                                }}
                                onClick={(e) => canTap && handleComplete(q.id, e)}
                              >
                                <div className="w-11 h-11 flex items-center justify-center shrink-0 transition-all"
                                     style={{ background: `${meta.col}18`, borderRadius: 14 }}>
                                  <span className="text-xl">{q.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold font-label text-on-surface">{t('quest.' + q.id)}</p>
                                  {isAnziehen && todayWeather && weatherInfo ? (
                                    <button
                                      className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md transition-all whitespace-nowrap"
                                      style={{ background: 'rgba(2,132,199,0.08)' }}
                                      onClick={(e) => { e.stopPropagation(); setShowWeather(true); }}
                                      aria-label={t('task.weather.outfitHint')}
                                    >
                                      <span className="text-sm leading-none">{weatherInfo.emoji}</span>
                                      <span className="text-xs font-bold leading-none" style={{ color: '#0284C7' }}>
                                        {todayWeather.tempMin}°/{todayWeather.tempMax}°
                                      </span>
                                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#0284C7' }}>info</span>
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
                                {/* XP pill — routine cards show bare "+N"
                                     per Polish .qxp (audit #10). Only bonus
                                     cards carry the "HP · BONUS" suffix. */}
                                <span className="font-label font-extrabold text-[11px] shrink-0 whitespace-nowrap"
                                      style={{
                                        background: 'rgba(252,211,77,0.22)',
                                        color: '#A83E2C',
                                        border: '1px solid rgba(180,83,9,0.18)',
                                        padding: '6px 9px',
                                        borderRadius: 8,
                                        letterSpacing: '0.04em',
                                      }}>+{q.xp}</span>
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

        {/* Daily habits — small checkpoints (Vitamin D, Zeit mit Liam)
             sit here, after the main routines and just above Bonus.
             Renamed user-facing title to "Nicht vergessen" (kid-friendly
             German). Auto-hides if nothing configured. */}
        <DailyHabits />

        {/* ── Bonus-Quests — vertical stack, design-ref .side-card.
               Parchment/amber container, full-width cards with icon tile,
               title + "+HP · BONUS" label, tap-action on the right.
               Done cards get a mint tint + line-through. ── */}
        {(() => {
          const sideQuests = (state.quests || []).filter(q => q.sideQuest);
          if (!sideQuests.length) return null;
          return (
            <section className="rounded-2xl overflow-hidden p-4"
                     style={{
                       background: 'linear-gradient(160deg, #fef3c7 0%, #fde68a 100%)',
                       border: '1px solid rgba(180,83,9,0.18)',
                       boxShadow: '0 8px 20px -8px rgba(180,83,9,0.2)',
                     }}>
              <div className="flex items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-[2.5px] rounded-full" style={{ background: '#A83E2C' }} />
                  <h2 className="font-headline text-base"
                      style={{ color: '#124346', fontWeight: 500, letterSpacing: '-0.005em' }}>
                    {t('task.bonus')}
                  </h2>
                </div>
                <span className="font-label font-extrabold text-[11px] shrink-0"
                      style={{
                        color: '#A83E2C',
                        background: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(180,83,9,0.2)',
                        padding: '5px 9px',
                        borderRadius: 8,
                        letterSpacing: '0.08em',
                      }}>
                  {sideQuests.filter(q => q.done).length}/{sideQuests.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {sideQuests.map(q => (
                  <button key={q.id}
                    onClick={(e) => !q.done && handleComplete(q.id, e)}
                    disabled={q.done}
                    className="w-full text-left transition-all active:scale-[0.98]"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr 20px',
                      gap: 10,
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 14,
                      background: q.done ? 'rgba(236,253,245,0.85)' : 'rgba(255,255,255,0.78)',
                      border: q.done ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(180,83,9,0.14)',
                      cursor: q.done ? 'default' : 'pointer',
                    }}
                    aria-label={q.done ? t('quest.' + q.id) : `${t('quest.' + q.id)} ${t('task.complete')}`}
                  >
                    <div className="flex items-center justify-center rounded-[10px]"
                         style={{
                           width: 36, height: 36,
                           background: q.done ? 'rgba(52,211,153,0.16)' : 'rgba(252,211,77,0.26)',
                         }}>
                      <span className="text-lg leading-none select-none">{q.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-sm leading-tight"
                         style={{
                           color: q.done ? '#065f46' : '#124346',
                           textDecoration: q.done ? 'line-through' : 'none',
                           textDecorationColor: q.done ? 'rgba(5,150,105,0.4)' : undefined,
                           fontWeight: q.done ? 500 : 600,
                         }}>
                        {t('quest.' + q.id)}
                      </p>
                      <span className="font-label font-bold uppercase mt-0.5 inline-block"
                            style={{
                              color: q.done ? '#059669' : '#A83E2C',
                              fontSize: 10,
                              letterSpacing: '0.1em',
                            }}>
                        +{q.xp} · {t('task.bonus')}
                      </span>
                    </div>
                    {q.done ? (
                      <span className="material-symbols-outlined text-lg"
                            style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-lg"
                            style={{ color: 'rgba(180,83,9,0.7)' }}>
                        add_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Bento Stats Grid removed — overall progress is now at the top
             of the page (one source of truth). Companion step-count was
             cosmetic; catEvo progress lives on RonkiProfile. */}
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

      </div>{/* close z-index:1 content wrapper (sky sits behind it) */}

      {/* ── Weather Outfit Modal ── */}
      {showWeather && <ClothingSheet onClose={() => setShowWeather(false)} />}

      {/* ── Toothbrush Timer Overlay ──
           Morning brushing (s3/v3) → ToothbrushTimer (simple 3-min countdown)
           Evening brushing (s12/v10) → ToothBrushGuide (6-zone guided, from TEETH_GUIDE_IDS)
           Both receive onParentOverride so a parent can PIN-complete the
           quest when the kid finished brushing faster than the clock (e.g.
           Louis did 2 minutes of proper brushing but the timer wants 3).
           Without this, evening brushing was stranded — the inconsistency
           Marc hit during playtest. */}
      {teethTimerQuestId && (() => {
        const completeQuestFromParent = () => {
          actions.complete(teethTimerQuestId);
          SFX.play('coin');
          haptic('success');
          setTeethTimerQuestId(null);
        };
        return TEETH_GUIDE_IDS.has(teethTimerQuestId) ? (
          <ToothBrushGuide
            onFinish={completeQuestFromParent}
            onCancel={() => setTeethTimerQuestId(null)}
            onParentOverride={completeQuestFromParent}
          />
        ) : (
          <ToothbrushTimer
            duration={180}
            onFinish={completeQuestFromParent}
            onSkip={() => setTeethTimerQuestId(null)}
            onParentOverride={completeQuestFromParent}
          />
        );
      })()}
    </div>
  );
}
