import React, { useState } from 'react';
import { MOOD_EMOJIS } from '../constants';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function Journal() {
  const { state, actions } = useTask();
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

  const todayPrompt = DAILY_PROMPTS[getDailyIndex(DAILY_PROMPTS)];
  const todayAffirmation = AFFIRMATIONS[getDailyIndex(AFFIRMATIONS)];
  const base = import.meta.env.BASE_URL;
  const history = [...(state.journalHistory || [])].sort((a, b) => b.date.localeCompare(a.date));
  const hasTodayContent = memory || gratitude.length > 0 || dayEmoji !== null || achievements.length > 0;

  const handleSave = () => {
    SFX.play('pop');
    actions.saveJournal({ memory, gratitude, dayEmoji, achievements });
    setBookOpen(false);
  };

  const handleReopen = () => {
    SFX.play('tap');
    setBookOpen(true);
  };

  // View an old entry
  const selectedEntry = viewingEntry ? history.find(e => e.date === viewingEntry) : null;

  return (
    <div className="relative px-6 pb-32">
      {/* Background texture */}
      <img src={base + 'art/bg-navy-night.png'} alt="" className="fixed inset-0 w-full h-full object-cover -z-10 pointer-events-none opacity-20" />

      {/* ── Header ── */}
      <section className="mb-6">
        <h1 className="text-4xl font-bold font-headline text-on-surface mb-2">Abenteuer-Buch</h1>
        <p className="text-on-surface-variant font-body leading-relaxed">
          Dein persönliches Tagebuch voller Erinnerungen
        </p>
      </section>

      {/* ── Today's Entry ── */}
      {!bookOpen ? (
        /* ══ CLOSED BOOK — summary card ══ */
        <section className="mb-8 rounded-2xl overflow-hidden"
                 style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          {/* Book cover */}
          <div className="p-6 flex items-center gap-4"
               style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.08), rgba(252,211,77,0.08))' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                 style={{ background: '#6d28d9', boxShadow: '0 4px 12px rgba(109,40,217,0.3)' }}>
              <span className="material-symbols-outlined text-white text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div className="flex-1">
              <p className="font-label font-bold text-xs text-primary uppercase tracking-wider">Heutiger Eintrag</p>
              <p className="text-lg font-bold font-headline text-on-surface">
                {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                <span className="font-label text-sm text-on-surface-variant">{MOOD_LABELS[state.moodAM]}</span>
              </div>
            )}
            {/* Day emoji */}
            {dayEmoji !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xl">{DAY_EMOJIS[dayEmoji]}</span>
                <span className="font-label text-sm text-on-surface-variant">Tages-Emoji</span>
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
                  <span key={g} className="px-2.5 py-1 rounded-full font-label text-[10px] font-bold text-primary"
                        style={{ background: 'rgba(109,40,217,0.08)' }}>
                    {g}
                  </span>
                ))}
              </div>
            )}
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {achievements.map(a => (
                  <span key={a} className="px-2.5 py-1 rounded-full font-label text-[10px] font-bold"
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
              style={{ background: 'rgba(109,40,217,0.06)', color: '#6d28d9', border: '1px solid rgba(109,40,217,0.12)' }}>
              <span className="material-symbols-outlined text-lg">edit</span>
              Eintrag bearbeiten
            </button>
          </div>
        </section>
      ) : (
        /* ══ OPEN BOOK — full editor ══ */
        <>
          {/* ── Journal Info Card ── */}
          <section className="mb-6 rounded-2xl overflow-hidden"
                   style={{ background: 'linear-gradient(135deg, #5300b7, #6d28d9)', padding: '2px' }}>
            <div className="rounded-[0.85rem] p-5 flex items-center justify-between"
                 style={{ background: '#ffffff' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                     style={{ background: '#6d28d9', boxShadow: '0 8px 16px rgba(109,40,217,0.4)' }}>
                  <span className="material-symbols-outlined text-white text-3xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                </div>
                <div>
                  <p className="font-label font-bold text-xs text-primary uppercase tracking-wider">Buch geöffnet</p>
                  <p className="text-2xl font-black font-headline text-on-surface">Dein Tag</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label text-[10px] font-bold text-outline uppercase">Heute</p>
                <p className="text-sm font-bold font-label text-primary">
                  {new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </section>

          {/* ── Mood Selector ── */}
          <section className="mb-6">
            <h3 className="font-label font-bold uppercase tracking-widest text-[10px] text-outline mb-4">Aktuelle Stimmung</h3>
            <div className="grid grid-cols-3 gap-3">
              {MOOD_EMOJIS.map((emoji, i) => {
                const isSelected = state.moodAM === i;
                return (
                  <button key={i}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 active:scale-95 ${
                      isSelected ? 'text-white shadow-xl scale-105' : 'bg-white shadow-sm'
                    }`}
                    style={isSelected ? {
                      background: '#6d28d9',
                      boxShadow: '0 8px 24px rgba(109,40,217,0.3)',
                    } : { border: '2px solid rgba(0,0,0,0.04)' }}
                    onClick={() => { SFX.play('pop'); actions.setMood('moodAM', i); }}
                  >
                    <span className={`text-3xl ${!isSelected ? 'grayscale' : ''}`}>{emoji}</span>
                    <span className="font-label text-[10px] font-bold uppercase">{MOOD_LABELS[i]}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Daily Memory Prompt ── */}
          <section className="mb-6 rounded-2xl p-6"
                   style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="font-label font-bold uppercase tracking-widest text-[10px] text-outline mb-2">Tages-Erinnerung</h3>
            <p className="font-body text-base text-primary font-bold mb-4">{todayPrompt}</p>
            <textarea
              className="w-full rounded-xl p-4 font-body text-base text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              style={{ background: 'rgba(109,40,217,0.04)', border: '1.5px solid rgba(109,40,217,0.12)', minHeight: 100 }}
              placeholder="Schreib hier deine Gedanken..."
              value={memory}
              onChange={e => setMemory(e.target.value)}
              maxLength={300}
            />
            <p className="text-right font-label text-[10px] text-outline mt-1">{memory.length}/300</p>
          </section>

          {/* ── Gedanken Heute ── */}
          <section className="mb-6 rounded-2xl p-6"
                   style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 className="font-label font-bold uppercase tracking-widest text-[10px] text-outline mb-6">Gedanken heute</h3>

            {/* Gratitude stickers */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                Wofür bist du heute dankbar?
              </label>
              <div className="flex flex-wrap gap-3">
                {GRATITUDE.map(g => (
                  <button key={g}
                    className={`px-5 py-2.5 rounded-xl font-label text-[11px] font-black uppercase transition-all active:scale-95 ${
                      gratitude.includes(g) ? 'bg-primary text-white shadow-lg' : 'bg-white text-primary border-2'
                    }`}
                    style={!gratitude.includes(g) ? {
                      border: '2px solid rgba(109,40,217,0.1)',
                      boxShadow: '4px 4px 0px rgba(109,40,217,0.1)',
                      transform: `rotate(${(g.length % 5) - 2}deg)`,
                    } : undefined}
                    onClick={() => toggleItem(gratitude, setGratitude, g)}
                  >{g}</button>
                ))}
              </div>
            </div>

            {/* Day emoji — 3×3 grid */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                Wie war dein Tag in einem Emoji?
              </label>
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl"
                   style={{ background: 'rgba(109,40,217,0.05)', border: '1px solid rgba(109,40,217,0.1)' }}>
                {DAY_EMOJIS.map((e, i) => (
                  <button key={i}
                    className={`aspect-square flex items-center justify-center text-3xl rounded-2xl shadow-sm transition-all active:scale-95 ${
                      dayEmoji === i ? 'ring-4 ring-primary/30 scale-110' : ''
                    }`}
                    style={{ background: dayEmoji === i ? 'rgba(109,40,217,0.1)' : 'rgba(255,255,255,0.5)' }}
                    onClick={() => { SFX.play('tap'); setDayEmoji(i); }}
                  >{e}</button>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
                Was hast du heute geschafft?
              </label>
              <div className="flex flex-wrap gap-3">
                {ACHIEVEMENTS.map(a => (
                  <button key={a}
                    className={`px-4 py-2 rounded-full font-label text-[11px] font-bold uppercase transition-all active:scale-95 ${
                      achievements.includes(a) ? 'bg-primary text-white' : 'text-primary'
                    }`}
                    style={!achievements.includes(a) ? {
                      background: 'rgba(109,40,217,0.05)', border: '1px solid rgba(109,40,217,0.2)',
                    } : undefined}
                    onClick={() => toggleItem(achievements, setAchievements, a)}
                  >{a}</button>
                ))}
              </div>
            </div>

            {/* Save = close the book */}
            <div className="flex justify-center mt-6">
              <button className="px-12 py-4 rounded-full font-label font-black text-lg flex items-center gap-3 transition-all active:scale-95"
                      style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4)' }}
                      onClick={handleSave}>
                Buch zuklappen
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </button>
            </div>
          </section>
        </>
      )}

      {/* ── Stimmungs-Kalender ── */}
      <details className="mb-6 rounded-2xl"
               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <summary className="flex justify-between items-center p-5 cursor-pointer select-none list-none">
          <h3 className="font-label font-bold uppercase tracking-widest text-[10px] text-outline">Stimmungs-Kalender</h3>
          <div className="flex items-center gap-2">
            <span className="font-label text-[10px] font-bold text-primary uppercase">
              {new Date().toLocaleDateString('de-DE', { month: 'long' })}
            </span>
            <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
          </div>
        </summary>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-7 gap-y-3 gap-x-2">
            {['M','D','M','D','F','S','S'].map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[9px] font-bold" style={{ color: 'rgba(123,116,134,0.4)' }}>{d}</span>
              </div>
            ))}
            {Array.from({ length: 28 }, (_, i) => {
              const dayNum = i + 1;
              const today = new Date().getDate();
              const isPast = dayNum < today;
              const isToday = dayNum === today;
              const colors = ['#34d399', '#a78bfa', '#fbbf24', '#6d28d9', '#d1fae5'];
              const col = isPast ? colors[dayNum % colors.length] : '#f4ede5';
              return (
                <div key={i} className={`w-4 h-4 rounded-full mx-auto transition-transform hover:scale-125 ${isToday ? 'ring-4 ring-primary/20' : ''}`}
                     style={{ background: isToday && state.moodAM !== null ? '#6d28d9' : col }} />
              );
            })}
          </div>
        </div>
      </details>

      {/* ── Past Entries (Alte Abenteuer) ── */}
      {history.length > 0 && (
        <section className="mb-8">
          <h3 className="font-label font-bold uppercase tracking-widest text-[10px] text-outline mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            Alte Abenteuer ({history.length})
          </h3>
          <div className="flex flex-col gap-3">
            {history.map(entry => (
              <button key={entry.date}
                onClick={() => { SFX.play('tap'); setViewingEntry(viewingEntry === entry.date ? null : entry.date); }}
                className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                style={{
                  background: viewingEntry === entry.date ? 'rgba(109,40,217,0.04)' : '#ffffff',
                  border: viewingEntry === entry.date ? '1.5px solid rgba(109,40,217,0.2)' : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                {/* Header row */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    {entry.mood !== null && <span className="text-lg">{MOOD_EMOJIS[entry.mood]}</span>}
                    {entry.dayEmoji !== null && <span className="text-lg">{DAY_EMOJIS[entry.dayEmoji]}</span>}
                    <span className="font-headline font-bold text-sm text-on-surface">{formatDate(entry.date)}</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-outline">
                    {viewingEntry === entry.date ? 'expand_less' : 'expand_more'}
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
                        <p className="font-label text-[9px] font-bold text-outline uppercase mb-1.5">Dankbar für</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.gratitude.map(g => (
                            <span key={g} className="px-2.5 py-1 rounded-full font-label text-[10px] font-bold text-primary"
                                  style={{ background: 'rgba(109,40,217,0.08)' }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {entry.achievements.length > 0 && (
                      <div>
                        <p className="font-label text-[9px] font-bold text-outline uppercase mb-1.5">Geschafft</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.achievements.map(a => (
                            <span key={a} className="px-2.5 py-1 rounded-full font-label text-[10px] font-bold"
                                  style={{ background: 'rgba(252,211,77,0.15)', color: '#b45309' }}>
                              ⭐ {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {!entry.memory && entry.gratitude.length === 0 && entry.achievements.length === 0 && (
                      <p className="font-body text-xs text-on-surface-variant">Kein Text gespeichert</p>
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
               style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.08), rgba(252,211,77,0.12))', border: '1px solid rgba(109,40,217,0.1)' }}>
        <span className="material-symbols-outlined text-3xl text-primary mb-3 block"
              style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        <p className="font-headline text-lg font-bold text-on-surface leading-relaxed">
          {todayAffirmation}
        </p>
      </section>

      {/* ── Privacy Badge ── */}
      <div className="flex justify-center items-center gap-2 py-6" style={{ color: 'rgba(123,116,134,0.5)' }}>
        <span className="material-symbols-outlined text-sm">lock</span>
        <span className="font-label text-[10px] font-bold uppercase tracking-widest">Ende-zu-Ende verschlüsselt</span>
      </div>
    </div>
  );
}
