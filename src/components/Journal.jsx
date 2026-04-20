import React, { useState } from 'react';
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

const AFFIRMATIONS = [
  "Du bist genau richtig, so wie du bist. 💜",
  "Jeder Tag ist ein neues Abenteuer — und du bist der Held. ✨",
  "Du machst die Welt ein bisschen bunter. 🌈",
  "Morgen wartet schon das nächste Abenteuer auf dich. 🌟",
  "Du bist mutig, stark und wunderbar. 💪",
  "Schlaf gut — Ronki passt auf dich auf. 🐉",
  "Heute war ein guter Tag. Morgen wird noch besser. 🌻",
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
  const affirmations = Array.from({length: 7}, (_, i) => t(`journal.affirmation.${i + 1}`));
  const [gratitude, setGratitude] = useState(state?.journalGratitude || []);
  const [dayEmoji, setDayEmoji] = useState(state?.journalDayEmoji ?? null);
  const [achievements, setAchievements] = useState(state?.journalAchievements || []);
  const [memory, setMemory] = useState(state?.journalMemory || '');
  const [bookOpen, setBookOpen] = useState(!state?.journalSaved);
  const [viewingEntry, setViewingEntry] = useState(null); // date string of old entry being viewed

  if (!state) return null;

  const toggleItem = (arr, setArr, item) => {
    setArr(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const todayPrompt = dailyPrompts[getDailyIndex(dailyPrompts)];
  const todayAffirmation = affirmations[getDailyIndex(affirmations)];
  const base = import.meta.env.BASE_URL;
  const history = [...(state.journalHistory || [])].sort((a, b) => b.date.localeCompare(a.date));
  const hasTodayContent = memory || gratitude.length > 0 || dayEmoji !== null || achievements.length > 0;

  const handleSave = () => {
    actions.saveJournal({ memory, gratitude, dayEmoji, achievements });
    // Actual book close SFX (not Ronki's voice) + delayed Ronki encouragement
    SFX.play('pop');
    const encouragements = ['de_journal_done_01', 'de_journal_done_02', 'de_journal_done_03'];
    setTimeout(() => VoiceAudio.play(encouragements[Math.floor(Math.random() * encouragements.length)]), 800);
    setBookOpen(false);
  };

  const handleReopen = () => {
    SFX.play('tap');
    setBookOpen(true);
  };

  // View an old entry
  const selectedEntry = viewingEntry ? history.find(e => e.date === viewingEntry) : null;

  return (
    <div className="relative pb-32" style={{ backgroundColor: '#fff8f2', minHeight: '100dvh' }}>
      {/* Page bg — subtle navy texture stays (Buch is read against a calm,
           slightly darker backdrop). Design reference v2 keeps the dark-teal
           header card and renames the book to "Abenteuer-Buch". */}
      <img src={base + 'art/bg-navy-night.png'} alt="" className="fixed inset-0 w-full h-full object-cover -z-10 pointer-events-none opacity-20" />

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
                 className="w-24 h-auto -mb-3 -mr-1"
                 style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' }} />
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
          {/* ── Journal Info Card ── */}
          <section className="mb-6 rounded-2xl overflow-hidden"
                   style={{ background: 'linear-gradient(135deg, #0c3236, #124346)' }}>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                     style={{ background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.28)', boxShadow: '0 0 16px rgba(252,211,77,0.12)' }}>
                  <span className="material-symbols-outlined text-white text-3xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                </div>
                <div>
                  <p className="font-label font-bold text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('journal.bookOpen')}</p>
                  <p className="text-2xl font-black font-headline text-white">{t('journal.yourDay')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('common.today')}</p>
                <p className="text-sm font-bold font-label" style={{ color: '#fcd34d' }}>
                  {new Date().toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
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

          {/* ── Daily Memory Prompt ── */}
          <section className="mb-6 rounded-2xl p-6"
                   style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="font-label font-bold uppercase tracking-widest text-xs text-outline mb-2">{t('journal.memory.title')}</h3>
            <p className="font-body text-base text-primary font-bold mb-4">{todayPrompt}</p>
            <textarea
              className="w-full rounded-xl p-4 font-body text-base text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              style={{ background: 'rgba(252,211,77,0.08)', border: '1.5px solid rgba(18,67,70,0.15)', minHeight: 100 }}
              placeholder={t('journal.memory.placeholder')}
              value={memory}
              onChange={e => setMemory(e.target.value)}
              maxLength={300}
            />
            <p className="text-right font-label text-xs text-outline mt-1">{memory.length}/300</p>
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
              {/* Polish v2 .chip spec: flat pill, no rotation, no offset
                   shadow (audit call-out — the v1 "handmade sticker" look
                   was dropped). Rounded-full, padding 8/14, weight 700. */}
              <div className="flex flex-wrap gap-2">
                {GRATITUDE.map((g, i) => (
                  <button key={g}
                    className="font-label font-bold uppercase rounded-full transition-all active:scale-95"
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      letterSpacing: '0.04em',
                      background: gratitude.includes(g) ? '#124346' : '#ffffff',
                      color: gratitude.includes(g) ? '#fef3c7' : '#124346',
                      border: gratitude.includes(g)
                        ? '1.5px solid #124346'
                        : '1.5px solid rgba(18,67,70,0.12)',
                    }}
                    onClick={() => toggleItem(gratitude, setGratitude, g)}
                  >{gratitudeLabels[i]}</button>
                ))}
              </div>
            </div>

            {/* Day emoji — 3×3 grid */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                {t('journal.dayEmoji.title')}
              </label>
              {/* Day emoji grid — selected tile gets a sparkle ✨ crown
                   anchored top-right with an 1.8s sparkle pulse (Polish
                   .emoji-crown spec; previously missing — backlog fix). */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl"
                   style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.1)' }}>
                {DAY_EMOJIS.map((e, i) => {
                  const selected = dayEmoji === i;
                  return (
                    <button key={i}
                      className="relative aspect-square flex items-center justify-center text-3xl transition-all active:scale-95"
                      style={{
                        borderRadius: 16,
                        background: selected
                          ? 'linear-gradient(160deg, #fffdf5, #fef3c7)'
                          : 'rgba(255,255,255,0.5)',
                        border: selected
                          ? '1.5px solid rgba(180,83,9,0.35)'
                          : '1px solid transparent',
                        boxShadow: selected
                          ? '0 8px 18px -6px rgba(180,83,9,0.3)'
                          : '0 1px 3px rgba(0,0,0,0.05)',
                        transform: selected ? 'scale(1.08)' : 'scale(1)',
                      }}
                      onClick={() => { SFX.play('tap'); setDayEmoji(i); }}
                    >
                      <span>{e}</span>
                      {selected && (
                        <span aria-hidden="true"
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                fontSize: 18,
                                animation: 'emojiSparkle 1.8s ease-in-out infinite',
                                filter: 'drop-shadow(0 2px 4px rgba(180,83,9,0.35))',
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
                  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                  50% { transform: scale(1.2) rotate(15deg); opacity: 0.85; }
                }
              `}</style>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                {t('journal.achievements.title')}
              </label>
              <div className="flex flex-wrap gap-3">
                {ACHIEVEMENTS.map((a, i) => (
                  <button key={a}
                    className={`px-4 py-2 rounded-full font-label text-xs font-bold uppercase transition-all active:scale-95 ${
                      achievements.includes(a) ? 'bg-primary text-white' : 'text-primary'
                    }`}
                    style={!achievements.includes(a) ? {
                      background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.25)',
                    } : undefined}
                    onClick={() => toggleItem(achievements, setAchievements, a)}
                  >{achievementLabels[i]}</button>
                ))}
              </div>
            </div>

            {/* Save = close the book */}
            <div className="flex justify-center mt-6">
              <button className="px-12 py-4 rounded-full font-label font-black text-lg flex items-center gap-3 transition-all active:scale-95"
                      style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4)' }}
                      onClick={handleSave}>
                {t('journal.save')}
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </button>
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
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                const tint = d.mood !== null ? MOOD_COLORS[d.mood].tint : '#fffaf2';
                const ink = d.mood !== null ? MOOD_COLORS[d.mood].ink : 'rgba(123,116,134,0.45)';
                return (
                  <div key={i}
                       className="flex flex-col items-center justify-center rounded-xl transition-transform"
                       style={{
                         aspectRatio: '1/1',
                         background: tint,
                         border: d.isToday ? '2px solid #124346' : '1px solid rgba(0,0,0,0.04)',
                         boxShadow: d.isToday ? '0 4px 12px -4px rgba(18,67,70,0.3)' : '0 1px 2px rgba(0,0,0,0.04)',
                       }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>
                      {d.mood !== null ? MOOD_EMOJIS[d.mood] : '·'}
                    </span>
                    <span className="font-label font-bold uppercase"
                          style={{ fontSize: 9, color: ink, letterSpacing: '0.08em', marginTop: 3 }}>
                      {d.label}
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
                className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                style={{
                  background: viewingEntry === entry.date ? 'rgba(18,67,70,0.04)' : '#ffffff',
                  border: viewingEntry === entry.date ? '1.5px solid rgba(18,67,70,0.12)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                {/* Header row — mood + day emoji + date + chevron */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {entry.mood !== null && <span className="text-xl">{MOOD_EMOJIS[entry.mood]}</span>}
                    {entry.dayEmoji !== null && <span className="text-xl">{DAY_EMOJIS[entry.dayEmoji]}</span>}
                    <span className="font-headline font-semibold text-sm"
                          style={{ color: '#124346', letterSpacing: '-0.005em' }}>
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-sm" style={{ color: '#6b655b' }}>
                    {viewingEntry === entry.date ? 'expand_less' : 'chevron_right'}
                  </span>
                </div>
                {/* Memory preview (collapsed) */}
                {viewingEntry !== entry.date && entry.memory && (
                  <p className="font-body text-xs text-on-surface-variant italic truncate mt-1">„{entry.memory}"</p>
                )}
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

      {/* ── Closing Affirmation ── */}
      <section className="mb-8 rounded-2xl p-6 text-center"
               style={{ background: 'linear-gradient(135deg, rgba(18,67,70,0.07), rgba(252,211,77,0.12))', border: '1px solid rgba(18,67,70,0.08)' }}>
        <span className="material-symbols-outlined text-3xl text-primary mb-3 block"
              style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        <p className="font-headline text-lg font-bold text-on-surface leading-relaxed">
          {todayAffirmation}
        </p>
      </section>

      {/* ── Privacy Badge ── */}
      <div className="flex justify-center items-center gap-2 py-6" style={{ color: 'rgba(123,116,134,0.5)' }}>
        <span className="material-symbols-outlined text-sm">lock</span>
        <span className="font-label text-xs font-bold uppercase tracking-widest">{t('journal.privacy')}</span>
      </div>
      </div>
    </div>
  );
}
