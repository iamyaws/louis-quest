import React, { useState } from 'react';
import { MOOD_EMOJIS } from '../constants';
import { useTask } from '../context/TaskContext';
import SFX from '../utils/sfx';

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];
const GRATITUDE = ["Familie", "Freunde", "Spielen", "Essen", "Natur", "Schule", "Ronki"];
const DAY_EMOJIS = ["⭐", "🎈", "🍦", "🎨", "⚽", "🍕", "🎮", "🌈", "🐶", "🚀", "🌙", "🌻"];
const ACHIEVEMENTS = ["Quest erledigt", "Ronki gefüttert", "Draußen sein", "Lesen", "Geholfen"];

export default function Journal() {
  const { state, actions } = useTask();
  const [gratitude, setGratitude] = useState([]);
  const [dayEmoji, setDayEmoji] = useState(null);
  const [achievements, setAchievements] = useState([]);

  if (!state) return null;

  const toggleItem = (arr, setArr, item) => {
    setArr(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  return (
    <div className="px-6 pb-32">

      {/* ── Header ── */}
      <section className="mb-8">
        <h1 className="text-4xl font-bold font-headline text-on-surface mb-2">Mein Journal</h1>
        <p className="text-on-surface-variant font-body leading-relaxed">
          Wie fühlst du dich heute in deiner mystischen Wiese?
        </p>
      </section>

      {/* ── Mood Streak (cumulative, not punitive) ── */}
      <section className="mb-8 rounded-2xl overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #5300b7, #6d28d9)', padding: '2px' }}>
        <div className="rounded-[0.85rem] p-5 flex items-center justify-between"
             style={{ background: '#ffffff' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: '#6d28d9', boxShadow: '0 8px 16px rgba(109,40,217,0.4)' }}>
              <span className="material-symbols-outlined text-white text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div>
              <p className="font-label font-bold text-xs text-primary uppercase tracking-wider">Journal-Einträge</p>
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
      <section className="mb-8">
        <h3 className="font-label font-bold uppercase tracking-widest text-[10px] text-outline mb-4">Aktuelle Stimmung</h3>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2">
          {MOOD_EMOJIS.map((emoji, i) => {
            const isSelected = state.moodAM === i;
            return (
              <button key={i}
                className={`flex-shrink-0 flex flex-col items-center gap-3 p-4 w-20 rounded-[2rem] transition-all duration-300 active:scale-95 ${
                  isSelected
                    ? 'text-white shadow-xl scale-105'
                    : 'bg-white border-2 border-transparent shadow-sm'
                }`}
                style={isSelected ? {
                  background: '#6d28d9',
                  boxShadow: '0 8px 24px rgba(109,40,217,0.3)',
                  border: 'none',
                } : { border: '2px solid rgba(0,0,0,0.04)' }}
                onClick={() => { SFX.play('pop'); actions.setMood('moodAM', i); }}
              >
                <span className={`text-3xl ${!isSelected ? 'grayscale' : ''}`}>{emoji}</span>
                <span className="font-label text-[9px] font-bold uppercase">
                  {MOOD_LABELS[i]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Mood Calendar (placeholder - weekly dots) ── */}
      <section className="mb-8 rounded-2xl p-6"
               style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-label font-bold uppercase tracking-widest text-[10px] text-outline">Stimmungs-Kalender</h3>
          <span className="font-label text-[10px] font-bold text-primary uppercase">
            {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-y-3 gap-x-2">
          {['M','D','M','D','F','S','S'].map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold" style={{ color: 'rgba(123,116,134,0.4)' }}>{d}</span>
            </div>
          ))}
          {/* Simulated month dots — in real app these come from mood history */}
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
      </section>

      {/* ── Gedanken Heute ── */}
      <section className="mb-8 rounded-2xl p-6"
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
                  gratitude.includes(g)
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-primary border-2'
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

        {/* Day emoji */}
        <div className="mb-8">
          <label className="font-label text-xs font-bold text-primary block uppercase tracking-wide mb-3">
            Wie war dein Tag in einem Emoji?
          </label>
          <div className="grid grid-cols-4 gap-3 p-5 rounded-3xl"
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
                  achievements.includes(a)
                    ? 'bg-primary text-white'
                    : 'text-primary'
                }`}
                style={!achievements.includes(a) ? {
                  background: 'rgba(109,40,217,0.05)', border: '1px solid rgba(109,40,217,0.2)',
                } : undefined}
                onClick={() => toggleItem(achievements, setAchievements, a)}
              >{a}</button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-center mt-6">
          <button className="px-12 py-4 rounded-full font-label font-black text-lg flex items-center gap-3 transition-all active:scale-95"
                  style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4)' }}
                  onClick={() => SFX.play('pop')}>
            Speichern
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </button>
        </div>
      </section>

      {/* ── Privacy Badge ── */}
      <div className="flex justify-center items-center gap-2 py-6" style={{ color: 'rgba(123,116,134,0.5)' }}>
        <span className="material-symbols-outlined text-sm">lock</span>
        <span className="font-label text-[10px] font-bold uppercase tracking-widest">Ende-zu-Ende verschlüsselt</span>
      </div>
    </div>
  );
}
