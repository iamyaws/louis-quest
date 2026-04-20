import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOOD_EMOJIS } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import VoiceAudio from '../utils/voiceAudio';
import TopBar from './TopBar';

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

// Per-mood color palette (tint = soft bg wash, ink = text/border accent).
// Design reference Ronki Buch Polish v2: "Magisch wird rosa, Müde cyan" —
// each mood gets a warm personal tone so selection feels like a colour
// bath, not a radio button. Indexed by MOOD_EMOJIS order.
const MOOD_COLORS = [
  { tint: '#dbeafe', ink: '#1e40af' }, // 0 Traurig — cool blue
  { tint: '#ede9fe', ink: '#6d28d9' }, // 1 Besorgt — quiet violet
  { tint: '#e5e7eb', ink: '#475569' }, // 2 Okay — neutral slate
  { tint: '#fef3c7', ink: '#b45309' }, // 3 Gut — warm amber (default)
  { tint: '#fce7f3', ink: '#be185d' }, // 4 Magisch — rosa
  { tint: '#cffafe', ink: '#0e7490' }, // 5 Müde — cyan
];
const GRATITUDE = ["Familie", "Freunde", "Spielen", "Essen", "Natur", "Schule", "Ronki"];
const DAY_EMOJIS = ["⭐", "🎈", "🍦", "🎨", "⚽", "🍕", "🎮", "🌈", "🐶"];
const ACHIEVEMENTS = ["Quest erledigt", "Ronki gefüttert", "Draußen sein", "Lesen", "Geholfen"];

const DAILY_PROMPTS = [
  "Was hat dich heute zum Lachen gebracht?",
  "Was war das Beste an deinem Tag?",
  "Worüber hast du heute nachgedacht?",
  "Was hast du heute Neues gelernt?",
  "Was hat dich heute überrascht?",
  "Wem hast du heute ein Lächeln geschenkt?",
  "Was war dein mutigstes Abenteuer heute?",
];

function getDailyIndex(arr) {
  const day = Math.floor(Date.now() / 86400000);
  return day % arr.length;
}

export default function Journal({ onNavigate, onOpenParental }) {
  const { state, actions } = useTask();
  const { t, locale, lang } = useTranslation();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const moodLabels = [t('mood.sad'), t('mood.worried'), t('mood.okay'), t('mood.good'), t('mood.magical'), t('mood.tired')];
  const gratitudeLabels = [t('journal.gratitude.family'), t('journal.gratitude.friends'), t('journal.gratitude.play'), t('journal.gratitude.food'), t('journal.gratitude.nature'), t('journal.gratitude.school'), t('journal.gratitude.ronki')];
  const achievementLabels = [t('journal.achievement.quest'), t('journal.achievement.fed'), t('journal.achievement.outside'), t('journal.achievement.read'), t('journal.achievement.helped')];
  const dailyPrompts = Array.from({length: 7}, (_, i) => t(`journal.prompt.${i + 1}`));
  const [gratitude, setGratitude] = useState(state?.journalGratitude || []);
  const [dayEmoji, setDayEmoji] = useState(state?.journalDayEmoji ?? null);
  const [achievements, setAchievements] = useState(state?.journalAchievements || []);
  const [memory, setMemory] = useState(state?.journalMemory || '');
  const [bookOpen, setBookOpen] = useState(!state?.journalSaved);
  const [viewingEntry, setViewingEntry] = useState(null); // date string of old entry being viewed
  // Zuklapp-Feier overlay (v3 lines 1894–1960): a small celebration card
  // appears on save BEFORE the closed-summary view, with a nodding Ronki
  // and HP pills. On dismiss we flip bookOpen → false and continue.
  const [overlayOpen, setOverlayOpen] = useState(false);

  if (!state) return null;

  const toggleItem = (arr, setArr, item) => {
    setArr(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const todayPrompt = dailyPrompts[getDailyIndex(dailyPrompts)];
  const base = import.meta.env.BASE_URL;
  const history = [...(state.journalHistory || [])].sort((a, b) => b.date.localeCompare(a.date));
  const hasTodayContent = memory || gratitude.length > 0 || dayEmoji !== null || achievements.length > 0;

  const handleSave = () => {
    actions.saveJournal({ memory, gratitude, dayEmoji, achievements });
    // Actual book close SFX (not Ronki's voice) + delayed Ronki encouragement
    SFX.play('pop');
    const encouragements = ['de_journal_done_01', 'de_journal_done_02', 'de_journal_done_03'];
    setTimeout(() => VoiceAudio.play(encouragements[Math.floor(Math.random() * encouragements.length)]), 800);
    // v3 Zuklapp-Feier: show the celebration overlay first, then bookOpen
    // flips only when the child taps "Schön!". Keeps the ritual felt.
    setOverlayOpen(true);
  };

  const dismissOverlay = () => {
    SFX.play('tap');
    setOverlayOpen(false);
    setBookOpen(false);
  };

  // v3 line 1994: close-book CTA gates on ≥2 filled fields. Count what the
  // child has put in today (mood, memo, gratitude, dayEmoji, achievements)
  // and show a soft fill-bar hint under the button when < 2.
  const filledCount = [
    state.moodAM !== null,
    memory.length > 0,
    gratitude.length > 0,
    dayEmoji !== null,
    achievements.length > 0,
  ].filter(Boolean).length;
  const canClose = filledCount >= 2;

  const handleReopen = () => {
    SFX.play('tap');
    setBookOpen(true);
  };

  // View an old entry
  const selectedEntry = viewingEntry ? history.find(e => e.date === viewingEntry) : null;

  return (
    <div className="relative pb-32" style={{ minHeight: '100dvh' }}>
      {/* Viewport-level ambient sky (Hub pattern) — same cream-over-sky
           backdrop as Hub/Aufgaben/Laden so the TopBar pills never sit
           on a cream band. The dark-teal journal hero card sits as a
           floating tile on top. */}
      <div className="fixed inset-0 pointer-events-none"
           style={{
             zIndex: 0,
             background: `linear-gradient(rgba(255,248,242,0.35) 0%, rgba(255,248,242,0.55) 40%, rgba(255,248,242,0.88) 75%, #fff8f2 100%), url(${base}art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp) center top / cover no-repeat`,
             backgroundColor: '#fff8f2',
           }}
           aria-hidden="true" />
      {/* Relative wrapper so all content floats above the sky backdrop */}
      <div className="relative" style={{ zIndex: 1 }}>

      {/* TopBar sits ABOVE the hero card on cream page bg (Polish v2
           .journal-hero spec: hero is a 24px-rounded teal card in 16px
           outer margin, TopBar is outside above it). Audit fix for the
           prior full-bleed dark-teal slab. */}
      <TopBar onNavigate={onNavigate} view="journal" onOpenParental={onOpenParental} />

      {/* ── Hero card — floating dark teal tile with 24px rounded corners,
             16px outer margin, 22px/500 headline, 100px hero img. Matches
             Polish v2 .journal-hero spec exactly. ── */}
      <section style={{ padding: '6px 16px 0' }}>
        <div className="relative overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, #0c3236, #124346)',
               borderRadius: 24,
               boxShadow: '0 16px 36px -14px rgba(12,50,54,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
             }}>
          <div className="flex items-end" style={{ padding: '18px 20px 16px' }}>
            <div className="flex-1 z-10 pb-1">
              <h1 className="font-headline mb-0.5"
                  style={{
                    fontFamily: 'Fredoka, sans-serif',
                    fontWeight: 500,
                    fontSize: 22,
                    letterSpacing: '-0.015em',
                    color: '#fff',
                    lineHeight: 1.1,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}>
                {lang === 'de' ? 'Abenteuer-Buch' : 'Adventure Book'}
              </h1>
              <p className="font-body leading-snug"
                 style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.35 }}>
                {lang === 'de' ? 'Dein Tagebuch voller Erinnerungen' : 'Your journal full of memories'}
              </p>
            </div>
            <img src={base + 'art/hero-journal.webp'}
                 alt=""
                 className="h-auto -mb-3 -mr-1"
                 style={{ width: 100, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' }} />
          </div>
          <div className="absolute bottom-0 right-8 w-24 h-16 rounded-full blur-2xl opacity-30 pointer-events-none"
               style={{ background: '#f59e0b' }} />
        </div>
      </section>
      <div style={{ paddingLeft: 24, paddingRight: 24, marginTop: 20 }}>

      {/* ── Today's Entry ── */}
      {!bookOpen ? (
        /* ══ CLOSED BOOK — summary card ══ */
        <section className="mb-8 rounded-2xl overflow-hidden"
                 style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          {/* Book cover — painted parchment + burgundy leather */}
          <div className="p-6 flex items-center gap-4"
               style={{ background: 'linear-gradient(135deg, rgba(252,211,77,0.18), rgba(18,67,70,0.08))' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(140deg, #b45309 0%, #7c2d12 100%)', boxShadow: '0 4px 12px rgba(124,45,18,0.35), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
              <span className="material-symbols-outlined text-white text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div className="flex-1">
              <p className="font-label font-bold text-xs text-primary uppercase tracking-wider">{t('journal.todayEntry')}</p>
              <p className="text-lg font-bold font-headline text-on-surface">
                {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <span className="material-symbols-outlined text-2xl" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 flex flex-col gap-3">
            {/* Mood */}
            {state.moodAM !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xl">{MOOD_EMOJIS[state.moodAM]}</span>
                <span className="font-label text-sm text-on-surface-variant">{moodLabels[state.moodAM]}</span>
              </div>
            )}
            {/* Day emoji */}
            {dayEmoji !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xl">{DAY_EMOJIS[dayEmoji]}</span>
                <span className="font-label text-sm text-on-surface-variant">{t('journal.dayEmoji')}</span>
              </div>
            )}
            {/* Memory snippet */}
            {memory && (
              <p className="font-body text-sm text-on-surface-variant italic leading-relaxed line-clamp-2">
                „{memory}"
              </p>
            )}
            {/* Gratitude tags */}
            {gratitude.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {gratitude.map(g => (
                  <span key={g} className="px-2.5 py-1 rounded-full font-label text-xs font-bold"
                        style={{ background: 'rgba(252,211,77,0.12)', color: '#b45309' }}>
                    {g}
                  </span>
                ))}
              </div>
            )}
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {achievements.map(a => (
                  <span key={a} className="px-2.5 py-1 rounded-full font-label text-xs font-bold"
                        style={{ background: 'rgba(252,211,77,0.15)', color: '#b45309' }}>
                    ⭐ {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reopen button */}
          <div className="px-6 pb-5">
            <button onClick={handleReopen}
              className="w-full py-3 rounded-xl font-label font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ background: 'rgba(180,83,9,0.06)', color: '#b45309', border: '1px solid rgba(180,83,9,0.15)' }}>
              <span className="material-symbols-outlined text-lg">edit</span>
              {t('journal.edit')}
            </button>
          </div>
        </section>
      ) : (
        /* ══ OPEN BOOK — full editor ══ */
        <>
          {/* ── Today strip (v3 .today-strip lines 1593–1629).
               Grid 48/1fr/auto, solid #124346 (no gradient), radius 18,
               padding 14/16. Icon tile 48×48 rounded 14 on translucent
               gold. Title "DEIN TAG" at weight 500/18 (not 900/2xl).
               Right cluster is HEUTE eyebrow + gold date — no extra
               "BUCH IST OFFEN" line (dropped in v3). ── */}
          <section className="mb-6 overflow-hidden"
                   style={{
                     background: '#124346',
                     borderRadius: 18,
                     boxShadow: '0 8px 18px -10px rgba(18,67,70,0.4)',
                     color: '#fef3c7',
                   }}>
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(252,211,77,0.18)',
                border: '1px solid rgba(252,211,77,0.3)',
                display: 'grid', placeItems: 'center',
              }}>
                <span className="material-symbols-outlined"
                      style={{ color: '#fcd34d', fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                  auto_stories
                </span>
              </div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: 500, fontSize: 18, lineHeight: 1,
                  letterSpacing: '-0.01em', color: '#fff',
                }}>
                  {t('journal.yourDay')}
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'block',
                  fontWeight: 800, fontSize: 9, lineHeight: 1,
                  letterSpacing: '0.24em', textTransform: 'uppercase',
                  color: 'rgba(254,243,199,0.55)', marginBottom: 3,
                }}>
                  {t('common.today')}
                </span>
                <b style={{
                  fontWeight: 700, fontSize: 13, lineHeight: 1,
                  color: '#fcd34d', letterSpacing: '0.02em',
                }}>
                  {new Date().toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                </b>
              </div>
            </div>
          </section>

          {/* ── Mood Selector — v2 "Stimmungen mit Charakter".
               Each mood washes the tile in its own warm tone when selected:
               Magisch rosa, Müde cyan, etc. See MOOD_COLORS. Non-selected
               tiles stay white with a neutral emoji halo — selection reads
               as a colour bath, not a radio toggle. ── */}
          <section className="mb-6">
            <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline mb-4">{t('journal.mood.title')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 2, 0, 1, 5].map((idx) => {
                const emoji = MOOD_EMOJIS[idx];
                const isSelected = state.moodAM === idx;
                const c = MOOD_COLORS[idx];
                return (
                  <button key={idx}
                    aria-pressed={isSelected}
                    className="flex flex-col items-center gap-1.5 rounded-2xl transition-all duration-200 active:scale-[0.96]"
                    style={{
                      padding: '14px 8px 10px',
                      background: isSelected ? c.tint : '#ffffff',
                      border: `1.5px solid ${isSelected ? c.ink : 'rgba(18,67,70,0.08)'}`,
                      boxShadow: isSelected ? `0 6px 14px -4px ${c.ink}40` : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    onClick={() => { SFX.play('pop'); actions.setMood('moodAM', idx); }}
                  >
                    {/* Mood face — white halo when selected, quiet neutral otherwise */}
                    <div className="flex items-center justify-center rounded-full transition-all"
                         style={{
                           width: 44, height: 44,
                           background: isSelected ? '#ffffff' : 'rgba(18,67,70,0.05)',
                           boxShadow: isSelected ? 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.06)' : 'none',
                         }}>
                      <span className="leading-none select-none" style={{ fontSize: 26 }}>{emoji}</span>
                    </div>
                    <span className="font-label font-extrabold uppercase text-center leading-none"
                          style={{
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            color: isSelected ? c.ink : '#6b655b',
                          }}>
                      {moodLabels[idx]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Daily Memory Prompt — v3 .memo spec (lines 1709–1724).
               min-height 84 (not 100), padding 12/14/22 so counter sits
               inside, border rgba(180,83,9,0.18) warm, counter absolutely
               positioned inside bottom-right in weight 700. ── */}
          <section className="mb-6 rounded-2xl p-6"
                   style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline mb-2">{t('journal.memory.title')}</h3>
            <p className="font-body text-base text-primary font-bold mb-4">{todayPrompt}</p>
            <div style={{ position: 'relative' }}>
              <textarea
                className="w-full font-body text-on-surface resize-none focus:outline-none transition-all"
                style={{
                  minHeight: 84,
                  padding: '12px 14px 22px',
                  background: 'rgba(252,211,77,0.08)',
                  border: '1px solid rgba(180,83,9,0.18)',
                  borderRadius: 16,
                  fontSize: 13, lineHeight: 1.5, fontWeight: 500,
                  color: '#124346',
                }}
                placeholder={t('journal.memory.placeholder')}
                value={memory}
                onChange={e => setMemory(e.target.value)}
                maxLength={300}
              />
              <span style={{
                position: 'absolute', bottom: 8, right: 14,
                fontWeight: 700, fontSize: 11, lineHeight: 1,
                color: '#2d5a5e', letterSpacing: '0.02em',
                pointerEvents: 'none',
              }}>
                {memory.length}/300
              </span>
            </div>
          </section>

          {/* ── Gedanken Heute ── */}
          <section className="mb-6 rounded-2xl p-6"
                   style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline mb-6">{t('journal.thoughts')}</h3>

            {/* Gratitude stickers */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                {t('journal.gratitude.title')}
              </label>
              {/* v3 .chip (lines 1728–1744): 12px/700/.06em/uppercase,
                   gap-1.5 (6px), selected prepends a 14px filled gold
                   Material check icon (2px right margin). */}
              <div className="flex flex-wrap gap-1.5">
                {GRATITUDE.map((g, i) => {
                  const selected = gratitude.includes(g);
                  return (
                    <button key={g}
                      className="font-label rounded-full transition-all active:scale-95 inline-flex items-center"
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        gap: 5,
                        background: selected ? '#124346' : '#ffffff',
                        color: selected ? '#fef3c7' : '#124346',
                        border: selected
                          ? '1.5px solid #124346'
                          : '1.5px solid rgba(18,67,70,0.12)',
                        boxShadow: selected ? '0 4px 10px -3px rgba(18,67,70,0.35)' : 'none',
                      }}
                      onClick={() => toggleItem(gratitude, setGratitude, g)}
                    >
                      {selected && (
                        <span className="material-symbols-outlined"
                              style={{
                                fontSize: 14,
                                color: '#fcd34d',
                                marginRight: 2,
                                fontVariationSettings: "'FILL' 1, 'wght' 700",
                              }}>
                          check
                        </span>
                      )}
                      {gratitudeLabels[i]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day emoji — 3×3 grid */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                {t('journal.dayEmoji.title')}
              </label>
              {/* v3 .emoji-grid (lines 1751–1781): panel padding 12,
                   tile radius 14, emoji 34px, no shadow/border on
                   unselected tiles. Selected uses cream→amber gradient
                   + rgba(180,83,9,0.35) border, NO scale(1.08). Crown:
                   fontSize 16, color #b45309, rotate -5deg → 5deg. */}
              <div className="grid grid-cols-3"
                   style={{ gap: 8, padding: 12, borderRadius: 16, background: 'rgba(18,67,70,0.04)' }}>
                {DAY_EMOJIS.map((e, i) => {
                  const selected = dayEmoji === i;
                  return (
                    <button key={i}
                      className="relative flex items-center justify-center transition-all active:scale-95"
                      style={{
                        aspectRatio: '1 / 1',
                        borderRadius: 14,
                        background: selected
                          ? 'linear-gradient(160deg, #fffdf5, #fef3c7)'
                          : '#ffffff',
                        border: selected
                          ? '1.5px solid rgba(180,83,9,0.35)'
                          : '1.5px solid transparent',
                        boxShadow: selected
                          ? '0 8px 18px -6px rgba(180,83,9,0.3)'
                          : 'none',
                      }}
                      onClick={() => { SFX.play('tap'); setDayEmoji(i); }}
                    >
                      <span style={{ fontSize: 34, lineHeight: 1 }}>{e}</span>
                      {selected && (
                        <span aria-hidden="true"
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                fontSize: 16,
                                color: '#b45309',
                                textShadow: '0 2px 4px rgba(252,211,77,0.6)',
                                animation: 'emojiSparkle 1.8s ease-in-out infinite',
                              }}>
                          ✨
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <style>{`
                @keyframes emojiSparkle {
                  0%, 100% { transform: scale(1) rotate(-5deg); opacity: 1; }
                  50% { transform: scale(1.15) rotate(5deg); opacity: 0.85; }
                }
              `}</style>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                {t('journal.achievements.title')}
              </label>
              {/* v3 .chip parity: 6px gap, .06em tracking, gold check
                   icon prepended on selected state. */}
              <div className="flex flex-wrap gap-1.5">
                {ACHIEVEMENTS.map((a, i) => {
                  const selected = achievements.includes(a);
                  return (
                    <button key={a}
                      className="font-label rounded-full transition-all active:scale-95 inline-flex items-center"
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        gap: 5,
                        background: selected ? '#124346' : '#ffffff',
                        color: selected ? '#fef3c7' : '#124346',
                        border: selected
                          ? '1.5px solid #124346'
                          : '1.5px solid rgba(18,67,70,0.12)',
                        boxShadow: selected ? '0 4px 10px -3px rgba(18,67,70,0.35)' : 'none',
                      }}
                      onClick={() => toggleItem(achievements, setAchievements, a)}
                    >
                      {selected && (
                        <span className="material-symbols-outlined"
                              style={{
                                fontSize: 14,
                                color: '#fcd34d',
                                marginRight: 2,
                                fontVariationSettings: "'FILL' 1, 'wght' 700",
                              }}>
                          check
                        </span>
                      )}
                      {achievementLabels[i]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* v3 close-book CTA (lines 1783–1817, 1994).
                 Hard-disable was cruel. When < 2 fields filled: soft
                 variant (cream bg, non-uppercase, column layout) with a
                 3px gold filled-bar showing progress toward the gate +
                 warm hint text. When ≥ 2: full gold CTA with book icon. */}
            <div className="flex flex-col items-center mt-6 gap-3">
              {canClose ? (
                <button
                  className="inline-flex items-center justify-center transition-all active:scale-[0.98]"
                  style={{
                    width: '100%',
                    gap: 10,
                    padding: '18px 20px',
                    borderRadius: 999,
                    background: 'linear-gradient(160deg, #fcd34d 0%, #f59e0b 100%)',
                    color: '#2a2005',
                    fontFamily: 'var(--f-label, Nunito, sans-serif)',
                    fontWeight: 800, fontSize: 14, lineHeight: 1,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    boxShadow: '0 10px 22px -6px rgba(252,211,77,0.5)',
                  }}
                  onClick={handleSave}>
                  <span className="material-symbols-outlined"
                        style={{ fontSize: 18, fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                    menu_book
                  </span>
                  {t('journal.save')}
                </button>
              ) : (
                <>
                  <button
                    className="flex flex-col items-center justify-center"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: 999,
                      background: 'rgba(18,67,70,0.08)',
                      color: '#6b655b',
                      fontFamily: 'var(--f-label, Nunito, sans-serif)',
                      fontWeight: 700, fontSize: 14, lineHeight: 1,
                      letterSpacing: '0.04em',
                      gap: 6,
                      cursor: 'default',
                    }}
                    disabled
                    aria-disabled="true">
                    {t('journal.save')}
                  </button>
                  <div style={{
                    width: '80%', height: 3, borderRadius: 999,
                    background: 'rgba(18,67,70,0.12)', overflow: 'hidden',
                  }}>
                    <span style={{
                      display: 'block', height: '100%',
                      width: `${Math.min(100, (filledCount / 5) * 100)}%`,
                      background: 'linear-gradient(90deg, #fcd34d, #f59e0b)',
                      borderRadius: 999,
                      transition: 'width .4s ease',
                    }} />
                  </div>
                  <p className="font-label"
                     style={{
                       fontSize: 11, color: '#6b655b',
                       letterSpacing: '0.04em', textAlign: 'center',
                       margin: 0,
                     }}>
                    {t('journal.fillHint')} ({filledCount}/5)
                  </p>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Stimmungs-Kalender — 7-day strip per Polish .kalender-strip.
             Replaces the old 28-day grid of tiny dots (backlog fix, Marc
             endorsed). Each tile shows the last 7 days' mood emoji on a
             per-mood tint wash. Full month stays behind a "mehr" details. ── */}
      {(() => {
        // Build last 7 days (today at right) from journalHistory + today's live mood.
        const today = new Date();
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const iso = d.toISOString().slice(0, 10);
          const isToday = i === 0;
          const entry = isToday
            ? { mood: state.moodAM }
            : (state.journalHistory || []).find(h => h.date === iso);
          days.push({
            iso,
            label: d.toLocaleDateString(locale, { weekday: 'narrow' }),
            mood: entry?.mood ?? null,
            isToday,
          });
        }
        return (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline">
                {t('journal.moodCalendar')}
              </h3>
              <span className="font-label text-xs font-bold text-primary uppercase">
                {lang === 'de' ? 'letzte 7 Tage' : 'last 7 days'}
              </span>
            </div>
            {/* v3 .kalender-strip (lines 1838–1864). Portrait 1/1.2
                 tiles. TODAY → solid #124346 bg + gold #fcd34d border,
                 weekday label in gold, emoji dimmed to rgba(254,243,199,.4).
                 Past tiles keep the warm-gold wash. Empty days stay muted. */}
            <div className="grid grid-cols-7" style={{ gap: 4 }}>
              {days.map((d, i) => {
                const hasMood = d.mood !== null;
                let bg, borderColor, emojiColor, labelColor, emojiSize = 16;
                if (d.isToday) {
                  bg = '#124346';
                  borderColor = '#fcd34d';
                  emojiColor = 'rgba(254,243,199,0.4)';
                  labelColor = '#fcd34d';
                } else if (hasMood) {
                  bg = 'rgba(252,211,77,0.12)';
                  borderColor = 'transparent';
                  emojiColor = 'inherit';
                  labelColor = '#6b655b';
                } else {
                  bg = 'rgba(18,67,70,0.04)';
                  borderColor = 'transparent';
                  emojiColor = 'rgba(18,67,70,0.25)';
                  labelColor = '#6b655b';
                  emojiSize = 12;
                }
                return (
                  <div key={i}
                       className="flex flex-col items-center justify-center"
                       style={{
                         aspectRatio: '1 / 1.2',
                         borderRadius: 10,
                         background: bg,
                         border: `1px solid ${borderColor}`,
                         boxShadow: d.isToday ? '0 4px 10px -4px rgba(18,67,70,0.35)' : 'none',
                         gap: 2,
                       }}>
                    <span className="font-label uppercase"
                          style={{
                            fontSize: 8, fontWeight: 800, lineHeight: 1,
                            letterSpacing: '0.1em', color: labelColor,
                          }}>
                      {d.label}
                    </span>
                    <span style={{ fontSize: emojiSize, lineHeight: 1, color: emojiColor }}>
                      {hasMood ? MOOD_EMOJIS[d.mood] : '·'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Month expansion hidden behind details (legacy 28-day view) */}
            <details className="mt-4 rounded-2xl"
                     style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <summary className="flex justify-between items-center px-4 py-3 cursor-pointer select-none list-none">
                <span className="font-label font-bold text-xs uppercase tracking-widest text-outline">
                  {lang === 'de' ? 'Ganzer Monat' : 'Full month'}
                </span>
                <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
              </summary>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-y-2 gap-x-1.5">
                  {['M','D','M','D','F','S','S'].map((d, i) => (
                    <span key={i} className="text-[10px] font-bold text-center" style={{ color: 'rgba(123,116,134,0.4)' }}>{d}</span>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => {
                    const dayNum = i + 1;
                    const td = today.getDate();
                    const isPast = dayNum < td;
                    const isToday = dayNum === td;
                    const colors = ['#34d399', '#fcd34d', '#fbbf24', '#5eead4', '#d1fae5'];
                    const col = isPast ? colors[dayNum % colors.length] : '#f4ede5';
                    return (
                      <div key={i} className={`w-3 h-3 rounded-full mx-auto ${isToday ? 'ring-2 ring-primary/30' : ''}`}
                           style={{ background: isToday && state.moodAM !== null ? '#b45309' : col }} />
                    );
                  })}
                </div>
              </div>
            </details>
          </section>
        );
      })()}

      {/* ── Alte Abenteuer — past journal entries.
             Design-ref v2 (Ronki Buch Polish v2): "ALTE ABENTEUER" with a
             small count pill. Each entry is a clean white card showing
             mood + day emoji + formatted date + memory snippet + chevron. ── */}
      {history.length > 0 && (
        <section className="mb-8">
          <h3 className="font-label font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"
              style={{ color: '#6b655b' }}>
            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            {lang === 'de' ? 'Alte Abenteuer' : 'Past adventures'}
            <span className="ml-1 px-2 py-0.5 rounded-full font-label font-extrabold"
                  style={{ fontSize: 10, background: 'rgba(18,67,70,0.08)', color: '#124346', letterSpacing: '0.06em' }}>
              {history.length}
            </span>
          </h3>
          <div className="flex flex-col gap-3">
            {history.map(entry => (
              <button key={entry.date}
                onClick={() => { SFX.play('tap'); setViewingEntry(viewingEntry === entry.date ? null : entry.date); }}
                className="w-full text-left transition-all active:scale-[0.98]"
                style={{
                  background: viewingEntry === entry.date ? 'rgba(18,67,70,0.04)' : '#ffffff',
                  border: viewingEntry === entry.date ? '1.5px solid rgba(18,67,70,0.12)' : '1px solid rgba(18,67,70,0.08)',
                  borderRadius: 16,
                  padding: '12px 14px 12px 12px',
                }}>
                {/* v3 .past-entry (lines 1867–1892): 32/24/1fr/20 grid.
                     Mood 24px, extra dayEmoji 16px @ 70% opacity,
                     date label 12/700/.02em, memory snippet on its own
                     line 12/500. */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 24px 1fr 20px',
                  gap: 10,
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 24, lineHeight: 1, textAlign: 'center' }}>
                    {entry.mood !== null ? MOOD_EMOJIS[entry.mood] : ''}
                  </span>
                  <span style={{ fontSize: 16, lineHeight: 1, opacity: 0.7, textAlign: 'center' }}>
                    {entry.dayEmoji !== null ? DAY_EMOJIS[entry.dayEmoji] : ''}
                  </span>
                  <div>
                    <b className="font-label uppercase block"
                       style={{
                         fontSize: 12, fontWeight: 700, lineHeight: 1.1,
                         color: '#124346', letterSpacing: '0.02em',
                         marginBottom: 2,
                       }}>
                      {formatDate(entry.date)}
                    </b>
                    {viewingEntry !== entry.date && entry.memory && (
                      <span className="font-body"
                            style={{
                              fontSize: 12, fontWeight: 500, lineHeight: 1.2,
                              color: '#6b655b',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                        „{entry.memory}"
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-outlined"
                        style={{ color: '#6b655b', fontSize: 18, textAlign: 'center' }}>
                    {viewingEntry === entry.date ? 'expand_less' : 'chevron_right'}
                  </span>
                </div>
                {/* Expanded detail */}
                {viewingEntry === entry.date && (
                  <div className="mt-3 pt-3 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    {entry.memory && (
                      <p className="font-body text-sm text-on-surface-variant italic leading-relaxed">„{entry.memory}"</p>
                    )}
                    {entry.gratitude.length > 0 && (
                      <div>
                        <p className="font-label text-xs font-bold text-outline uppercase mb-1.5">{t('journal.gratefulFor')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.gratitude.map(g => (
                            <span key={g} className="px-2.5 py-1 rounded-full font-label text-xs font-bold"
                                  style={{ background: 'rgba(252,211,77,0.12)', color: '#b45309' }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {entry.achievements.length > 0 && (
                      <div>
                        <p className="font-label text-xs font-bold text-outline uppercase mb-1.5">{t('journal.achieved')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.achievements.map(a => (
                            <span key={a} className="px-2.5 py-1 rounded-full font-label text-xs font-bold"
                                  style={{ background: 'rgba(252,211,77,0.15)', color: '#b45309' }}>
                              ⭐ {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {!entry.memory && entry.gratitude.length === 0 && entry.achievements.length === 0 && (
                      <p className="font-body text-xs text-on-surface-variant">{t('journal.empty')}</p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* v3 drops the separate Affirmation card — the rotating Ronki
           voice line at save handles the "felt" closing moment, and v3
           keeps the end of the scroll clean.  Privacy badge kept for
           kid-trust (Louis readability memo). */}

      {/* ── Privacy Badge ── */}
      <div className="flex justify-center items-center gap-2 py-6" style={{ color: 'rgba(123,116,134,0.5)' }}>
        <span className="material-symbols-outlined text-sm">lock</span>
        <span className="font-label text-xs font-bold uppercase tracking-widest">{t('journal.privacy')}</span>
      </div>
      </div>
      </div>

      {/* ── Zuklapp-Feier overlay (v3 lines 1894–1960).
             Teal-dim backdrop w/ 8px blur, cream-gradient card with 24px
             radius spring entrance, 90×90 nodding Ronki (hero-journal img
             reused), HP reward pills, "Schön!" dismiss CTA. Shown between
             handleSave → setBookOpen(false) so the ritual has a moment. ── */}
      <AnimatePresence>
        {overlayOpen && (
          <motion.div
            key="close-overlay"
            className="fixed inset-0 grid place-items-center"
            style={{
              zIndex: 100,
              background: 'rgba(18,67,70,0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: 24,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={dismissOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-overlay-title">
            <motion.div
              className="text-center"
              style={{
                width: '100%',
                maxWidth: 300,
                padding: '22px 22px 18px',
                borderRadius: 24,
                background: 'linear-gradient(160deg, #fff 0%, #fffaf0 100%)',
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)',
              }}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.8 }}
              onClick={e => e.stopPropagation()}>
              {/* Nodding Ronki — reuse hero-journal art (no new asset needed).
                   1.2s rotate -3deg ↔ 3deg with a tiny y-float. */}
              <div style={{
                width: 90, height: 90, margin: '0 auto 14px',
                display: 'grid', placeItems: 'center',
                animation: 'ronkiNod 1.2s ease-in-out infinite',
              }}>
                <img src={base + 'art/hero-journal.webp'}
                     alt=""
                     style={{
                       width: '100%', height: '100%', objectFit: 'contain',
                       filter: 'drop-shadow(0 6px 10px rgba(180,83,9,0.3))',
                     }} />
              </div>
              <h3 id="close-overlay-title"
                  style={{
                    margin: '0 0 6px',
                    fontFamily: 'Fredoka, sans-serif',
                    fontWeight: 500, fontSize: 20, lineHeight: 1.15,
                    color: '#124346', letterSpacing: '-0.015em',
                  }}>
                {t('journal.celebrateTitle')}
              </h3>
              <p style={{
                margin: '0 0 14px',
                fontWeight: 500, fontSize: 13, lineHeight: 1.4,
                color: '#6b655b',
              }}>
                {t('journal.celebrateBody')}
              </p>
              <div className="flex flex-wrap justify-center"
                   style={{ gap: 6, marginBottom: 16 }}>
                <span className="inline-flex items-center font-label"
                      style={{
                        gap: 5,
                        padding: '6px 12px', borderRadius: 999,
                        background: 'rgba(252,211,77,0.2)',
                        border: '1px solid rgba(180,83,9,0.2)',
                        fontWeight: 800, fontSize: 11, lineHeight: 1,
                        letterSpacing: '0.06em', color: '#b45309',
                      }}>
                  <span className="material-symbols-outlined"
                        style={{ fontSize: 14, color: '#b45309', fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                  {t('journal.celebrateHp')}
                </span>
                <span className="inline-flex items-center font-label"
                      style={{
                        gap: 5,
                        padding: '6px 12px', borderRadius: 999,
                        background: 'rgba(147,51,234,0.12)',
                        border: '1px solid rgba(147,51,234,0.22)',
                        fontWeight: 800, fontSize: 11, lineHeight: 1,
                        letterSpacing: '0.06em', color: '#7e22ce',
                      }}>
                  <span className="material-symbols-outlined"
                        style={{ fontSize: 14, color: '#7e22ce', fontVariationSettings: "'FILL' 1" }}>
                    bookmark
                  </span>
                  {t('journal.celebrateChapter')}
                </span>
              </div>
              <button
                onClick={dismissOverlay}
                className="w-full active:scale-[0.98] transition-transform font-label"
                style={{
                  padding: '14px 20px', borderRadius: 999,
                  background: '#124346', color: '#fef3c7',
                  fontWeight: 800, fontSize: 12, lineHeight: 1,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  boxShadow: '0 6px 14px -4px rgba(18,67,70,0.4)',
                }}>
                {t('journal.celebrateDone')}
              </button>
            </motion.div>
            <style>{`
              @keyframes ronkiNod {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg) translateY(-2px); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
