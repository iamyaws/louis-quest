import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import CooldownButton from './CooldownButton';

/**
 * PoemQuest — 7-day quest-line for learning a poem.
 * Each day has a practice step. Louis checks off each day's step.
 * On completion: celebration + "Gedicht-Meister" badge.
 *
 * State stored in: state.poemQuest = { done: string[], completed: boolean, title: string }
 * Uses patchState to update.
 */

const base = import.meta.env.BASE_URL;

const DAYS = [
  { id: 'poem_d1', day: 1, icon: '📖', titleDe: 'Gedicht lesen',         titleEn: 'Read the poem',         descDe: 'Lies das Gedicht einmal mit Mama oder Papa.',       descEn: 'Read the poem once with a parent.' },
  { id: 'poem_d2', day: 2, icon: '🗣️', titleDe: 'Erste Strophe üben',    titleEn: 'Practice first verse',   descDe: 'Übe die erste Strophe — 3 mal laut vorlesen!',     descEn: 'Practice the first verse — read it aloud 3 times!' },
  { id: 'poem_d3', day: 3, icon: '🌟', titleDe: 'Zweite Strophe üben',   titleEn: 'Practice second verse',  descDe: 'Übe die zweite Strophe — 3 mal laut vorlesen!',    descEn: 'Practice the second verse — read it aloud 3 times!' },
  { id: 'poem_d4', day: 4, icon: '💪', titleDe: 'Alles zusammen',         titleEn: 'Put it all together',    descDe: 'Sag das ganze Gedicht einmal komplett auf!',        descEn: 'Recite the whole poem from start to finish!' },
  { id: 'poem_d5', day: 5, icon: '🐉', titleDe: 'Ronki vortragen',        titleEn: 'Perform for Ronki',      descDe: 'Trag das Gedicht Ronki vor — er hört zu!',         descEn: 'Recite the poem for Ronki — he\'s listening!' },
  { id: 'poem_d6', day: 6, icon: '🎭', titleDe: 'Generalprobe!',          titleEn: 'Dress rehearsal!',       descDe: 'Noch einmal üben — morgen ist der große Tag!',      descEn: 'One more practice — tomorrow is the big day!' },
  { id: 'poem_d7', day: 7, icon: '🎤', titleDe: 'Der große Tag!',         titleEn: 'The big day!',           descDe: 'Du schaffst das! Ronki glaubt an dich! 🌟',         descEn: 'You can do it! Ronki believes in you! 🌟' },
];

export default function PoemQuest({ onBack }) {
  const { state, actions } = useTask();
  const { lang } = useTranslation();

  const poemState = state?.poemQuest || { done: [], completed: false, title: '' };
  const doneTasks = poemState.done || [];
  const allDone = doneTasks.length >= DAYS.length;
  const isCompleted = poemState.completed;

  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = (taskId) => {
    if (doneTasks.includes(taskId)) return;
    const newDone = [...doneTasks, taskId];
    const nowAllDone = newDone.length >= DAYS.length;

    actions.patchState({ poemQuest: { ...poemState, done: newDone, completed: nowAllDone } });
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(80);

    if (nowAllDone) {
      actions.addHP?.(100);
      setTimeout(() => setShowCelebration(true), 400);
    }
  };

  const doneCount = doneTasks.length;
  const pct = DAYS.length > 0 ? doneCount / DAYS.length : 0;

  // ── Celebration ──
  if (showCelebration || isCompleted) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-8 text-center"
           style={{ background: 'linear-gradient(160deg, #0c3236 0%, #124346 50%, #1a5e52 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="ember"
                 style={{ left: `${10 + Math.random() * 80}%`, '--dur': `${3 + Math.random() * 3}s`, '--delay': `${Math.random() * 2}s`, '--drift': `${(Math.random() - 0.5) * 30}px` }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-8xl mb-4">🎤</span>
          <h2 className="font-headline font-bold text-3xl text-white mb-3"
              style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            {lang === 'de' ? 'Gedicht-Meister!' : 'Poem Master!'}
          </h2>
          <p className="font-body text-lg mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {lang === 'de'
              ? 'Du hast das ganze Gedicht gelernt! Ronki ist mega stolz!'
              : 'You learned the whole poem! Ronki is so proud!'}
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full mt-4 mb-8"
               style={{ background: 'rgba(252,211,77,0.2)', border: '1px solid rgba(252,211,77,0.3)' }}>
            <span className="material-symbols-outlined text-sm" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-label font-bold text-sm" style={{ color: '#fcd34d' }}>+100 HP</span>
          </div>

          <CooldownButton delay={4} onClick={onBack} icon="arrow_forward"
            className="w-full max-w-xs py-5 rounded-full font-headline font-bold text-xl text-white"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4)' }}>
            {lang === 'de' ? 'Du bist der Beste!' : 'You\'re the best!'}
          </CooldownButton>
        </div>
      </div>
    );
  }

  // ── Main Quest View ──
  return (
    <div className="relative min-h-dvh pb-32">
      <div className="fixed inset-0 -z-20" style={{ background: '#fff8f2' }} />
      <img src={base + 'art/bg-cream-brush.webp'} alt="" className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none -z-10" />

      <main className="px-5 max-w-lg mx-auto"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>

        {/* Back button */}
        <button onClick={onBack} className="flex items-center gap-1.5 mb-5 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-lg text-primary">arrow_back</span>
          <span className="font-label font-bold text-sm text-primary">
            {lang === 'de' ? 'Zurück' : 'Back'}
          </span>
        </button>

        {/* Header with painted illustration */}
        {(() => {
          // Show the art for the current active day (or final day if complete)
          const artDay = Math.min(doneCount + 1, 7);
          return (
            <div className="rounded-2xl overflow-hidden mb-6 relative"
                 style={{ background: 'linear-gradient(135deg, #124346, #2d5a5e)' }}>
              {/* Painted hero image */}
              <div className="relative w-full" style={{ aspectRatio: '1 / 1', maxHeight: '240px' }}>
                <img src={`${base}art/quests/poem-day-${artDay}.webp`} alt=""
                     className="w-full h-full object-cover" />
                {/* Dark gradient overlay at bottom for text legibility */}
                <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                     style={{ background: 'linear-gradient(to top, rgba(12,50,54,0.95), transparent)' }} />
              </div>
              {/* Text + progress overlaid on bottom */}
              <div className="px-5 py-4 flex items-center gap-4 -mt-14 relative z-10">
                <div className="flex-1">
                  <p className="font-label font-bold text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(252,211,77,0.9)' }}>
                    {lang === 'de' ? 'Spezial-Quest' : 'Special Quest'}
                  </p>
                  <h1 className="font-headline font-bold text-2xl text-white"
                      style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {lang === 'de' ? 'Mein Gedicht' : 'My Poem'}
                  </h1>
                  <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {lang === 'de' ? '7 Tage bis zur Aufführung' : '7 days to the performance'}
                  </p>
                </div>
                {/* Progress ring */}
                <div className="relative w-16 h-16 shrink-0"
                     style={{ background: 'rgba(12,50,54,0.85)', borderRadius: '50%', backdropFilter: 'blur(8px)' }}>
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                    <circle cx="32" cy="32" r="26" fill="none"
                            stroke="#fcd34d" strokeWidth="5" strokeLinecap="round"
                            strokeDasharray="163.4" strokeDashoffset={163.4 - pct * 163.4} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-headline font-bold text-sm text-white">{doneCount}/{DAYS.length}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Day cards */}
        <div className="relative pl-8">
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 rounded-full"
               style={{ background: `linear-gradient(to bottom, #124346 ${pct * 100}%, rgba(18,67,70,0.12) ${pct * 100}%)` }} />

          <div className="flex flex-col gap-4">
            {DAYS.map((day, idx) => {
              const isDone = doneTasks.includes(day.id);
              const isNext = !isDone && idx === doneTasks.length;
              const isFuture = !isDone && !isNext;
              const title = lang === 'de' ? day.titleDe : day.titleEn;
              const desc = lang === 'de' ? day.descDe : day.descEn;

              return (
                <div key={day.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-8 top-3 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                       style={{
                         background: isDone ? '#34d399' : isNext ? '#fcd34d' : 'rgba(18,67,70,0.08)',
                         border: isNext ? '2px solid #fcd34d' : isDone ? '2px solid #34d399' : '2px solid rgba(18,67,70,0.12)',
                         boxShadow: isNext ? '0 0 8px rgba(252,211,77,0.4)' : 'none',
                       }}>
                    {isDone
                      ? <span className="material-symbols-outlined text-white" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>check</span>
                      : <span className="font-label font-bold text-on-surface-variant" style={{ fontSize: 10 }}>{day.day}</span>
                    }
                  </div>

                  {/* Card */}
                  <div className={`rounded-2xl transition-all ${isFuture ? 'opacity-50' : ''}`}
                       style={{
                         background: isDone ? 'rgba(52,211,153,0.06)' : isNext ? '#ffffff' : 'rgba(0,0,0,0.02)',
                         border: isNext ? '2px solid rgba(252,211,77,0.4)' : isDone ? '1.5px solid rgba(52,211,153,0.2)' : '1.5px solid rgba(0,0,0,0.06)',
                         boxShadow: isNext ? '0 4px 16px rgba(252,211,77,0.12)' : 'none',
                         padding: isNext ? '1.25rem' : '1rem',
                       }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{day.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label font-bold text-xs uppercase tracking-widest mb-0.5"
                           style={{ color: isDone ? '#059669' : isNext ? '#b45309' : '#9ca3af' }}>
                          Tag {day.day}
                        </p>
                        <h3 className={`font-headline font-bold ${isNext ? 'text-lg' : 'text-base'} ${isDone ? 'line-through text-on-surface/50' : 'text-on-surface'}`}>
                          {title}
                        </h3>
                        {(isNext || isDone) && (
                          <p className="font-body text-sm text-on-surface-variant mt-1 leading-snug">{desc}</p>
                        )}
                      </div>
                      {isDone && (
                        <span className="material-symbols-outlined text-xl shrink-0"
                              style={{ color: '#34d399', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                    </div>

                    {/* Complete button — only on current day */}
                    {isNext && (
                      <button onClick={() => handleComplete(day.id)}
                        className="w-full mt-4 py-3.5 rounded-full font-headline font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
                        style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 4px 12px rgba(252,211,77,0.3)' }}>
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                        {lang === 'de' ? 'Geschafft!' : 'Done!'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ronki encouragement */}
        <div className="mt-8 p-5 rounded-2xl flex items-start gap-4"
             style={{ background: 'rgba(18,67,70,0.04)', border: '1px solid rgba(18,67,70,0.08)' }}>
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
            <img src={base + 'art/companion/dragon-baby.webp'} alt="Ronki" className="w-full h-full object-cover" />
          </div>
          <p className="font-body text-sm text-on-surface-variant italic leading-relaxed">
            {doneCount === 0 && (lang === 'de' ? 'Wir schaffen das zusammen! Ein Tag nach dem anderen. 🐉' : 'We\'ll do this together! One day at a time. 🐉')}
            {doneCount > 0 && doneCount < 4 && (lang === 'de' ? 'Super Anfang! Du lernst so schnell — ich bin beeindruckt! ✨' : 'Great start! You learn so fast — I\'m impressed! ✨')}
            {doneCount >= 4 && doneCount < 7 && (lang === 'de' ? 'Fast geschafft! Du wirst das Gedicht perfekt aufsagen! 💪' : 'Almost there! You\'ll recite the poem perfectly! 💪')}
            {doneCount >= 7 && (lang === 'de' ? 'Du hast es geschafft! Ich bin so stolz auf dich! 🎉' : 'You did it! I\'m so proud of you! 🎉')}
          </p>
        </div>

      </main>
    </div>
  );
}
