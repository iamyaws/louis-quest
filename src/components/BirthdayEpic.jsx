import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import { DEFAULT_FAMILY_CONFIG, pronouns } from '../types/familyConfig';

export default function BirthdayEpic({ onBack }) {
  const { state, actions } = useTask();
  const haptic = useHaptic();
  const { t } = useTranslation();
  const base = import.meta.env.BASE_URL;

  // Family config
  const config = state?.familyConfig || DEFAULT_FAMILY_CONFIG;
  const sibling = config.siblings?.[0] || { name: 'dein Geschwister', relationship: 'Geschwister' };
  const sibP = pronouns(config.childPronouns || 'er');
  const p = pronouns(config.childPronouns || 'er');

  const BIRTHDAY_TASKS = [
    { id: 'qcs1', name: t('birthday.task.giftIdea'),  icon: '💡', xp: 30,  hint: t('birthday.task.giftIdea.hint', { name: sibling.name }) },
    { id: 'qcs2', name: t('birthday.task.makeCard'),   icon: '✂️', xp: 75,  hint: t('birthday.task.makeCard.hint') },
    { id: 'qcs3', name: t('birthday.task.shopping'),   icon: '🛒', xp: 40,  hint: t('birthday.task.shopping.hint') },
    { id: 'qcs4', name: t('birthday.task.wrapGift'),   icon: '🎁', xp: 50,  hint: t('birthday.task.wrapGift.hint') },
    { id: 'qcs5', name: t('birthday.task.hideSpot'),   icon: '🔍', xp: 20,  hint: t('birthday.task.hideSpot.hint', { pronoun: p.nom }) },
    { id: 'qcs6', name: t('birthday.task.celebrate'),  icon: '🎂', xp: 100, hint: t('birthday.task.celebrate.hint', { name: sibling.name }) },
  ];

  const REWARDS = [
    { label: t('birthday.badge.hp'), icon: 'diamond', bg: '#2d5a5e', color: '#a2d0d4' },
    { label: sibling.relationship === 'Bruder' ? t('birthday.badge.superBrother') : sibling.relationship === 'Schwester' ? t('birthday.badge.superSister') : t('birthday.badge.superSibling'), icon: 'military_tech', bg: '#fcd34d', color: '#725b00', emoji: '🎖️' },
    { label: t('birthday.badge.cake'), icon: 'cake', bg: '#ffdbc8', color: '#6b3000', emoji: '🎂' },
  ];

  // Birthday epic state stored in main state
  const bdState = state?.birthdayEpic || { done: [], completed: false };
  const doneTasks = bdState.done || [];
  const allDone = doneTasks.length >= BIRTHDAY_TASKS.length;
  const isCompleted = bdState.completed;

  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = (taskId) => {
    if (doneTasks.includes(taskId)) return;
    const newDone = [...doneTasks, taskId];
    const nowAllDone = newDone.length >= BIRTHDAY_TASKS.length;

    actions.updateBirthdayEpic?.({ done: newDone, completed: nowAllDone });
    SFX.play('pop');
    haptic('success');

    if (nowAllDone) {
      actions.addHP?.(500);
      setTimeout(() => setShowCelebration(true), 400);
    }
  };

  const doneCount = doneTasks.length;
  const totalTasks = BIRTHDAY_TASKS.length;
  const pct = totalTasks > 0 ? doneCount / totalTasks : 0;
  const firstUndoneIdx = BIRTHDAY_TASKS.findIndex(t => !doneTasks.includes(t.id));

  // ── Celebration View ──
  if (showCelebration || isCompleted) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-surface overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Close button — respects safe-area so it never hides under the notch */}
        <button onClick={onBack}
          aria-label={t('birthday.close') || 'Schließen'}
          className="fixed right-3 z-[300] w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          }}>
          <span className="material-symbols-outlined text-on-surface text-2xl">close</span>
        </button>

        {/* Hero illustration */}
        <div className="relative w-full aspect-square max-h-[45vh] overflow-hidden">
          <img src={base + 'art/birthday-celebration.png'} alt="Celebration"
               className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #fff8f2 0%, transparent 50%)' }} />
        </div>

        {/* Success message */}
        <div className="px-6 -mt-8 relative z-10 text-center">
          <h1 className="font-headline text-4xl font-bold text-primary">
            {t('birthday.missionComplete')}
          </h1>
          <p className="font-headline text-xl font-bold text-on-surface mt-2">
            {t('birthday.superSibling', { relationship: sibling.relationship })}
          </p>
        </div>

        {/* Rewards */}
        <div className="px-6 mt-8 pb-32">
          <div className="flex flex-col gap-3">
            {REWARDS.map((r, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl flex items-center gap-4"
                   style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: r.bg }}>
                  <span className="material-symbols-outlined text-2xl"
                        style={{ color: r.color, fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                </div>
                <div>
                  <p className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant">{t('birthday.reward')}</p>
                  <p className="font-headline font-bold text-base text-on-surface">{r.label} {r.emoji || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="fixed bottom-0 left-0 w-full z-50 p-6"
             style={{ background: 'linear-gradient(to top, #fff8f2 70%, transparent)' }}>
          <button onClick={onBack}
            className="w-full max-w-lg mx-auto block py-4 rounded-full font-label font-extrabold text-lg active:scale-95 transition-all"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
            {t('birthday.backToHub')}
          </button>
        </div>
      </div>
    );
  }

  // ── Quest View ──
  return (
    <div className="fixed inset-0 z-[200] bg-surface overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Hero banner */}
      <div className="relative w-full" style={{ height: '40vh', minHeight: 240 }}>
        <img src={base + 'art/birthday-prep.png'} alt="Birthday Prep"
             className="w-full h-full object-cover" />
        <div className="absolute inset-0"
             style={{ background: 'linear-gradient(to top, #fff8f2 0%, rgba(255,248,241,0.3) 40%, transparent 60%)' }} />

        {/* Back button — fixed + respects safe-area so it's always tappable */}
        <button onClick={onBack}
          aria-label={t('birthday.back') || 'Zurück'}
          className="fixed left-3 z-[300] w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
          }}>
          <span className="material-symbols-outlined text-on-surface text-2xl">arrow_back</span>
        </button>

        {/* Epic Quest badge */}
        <div className="absolute top-16 left-6 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
               style={{ background: '#fcd34d', color: '#725b00' }}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-label font-bold text-xs uppercase tracking-widest">Epic Quest</span>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 z-10">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            {t('birthday.missionTitle')}
          </h1>
          <p className="font-body text-on-surface-variant mt-1">
            {t('birthday.missionSubtitle', { name: sibling.name })}
          </p>
        </div>
      </div>

      {/* Progress section */}
      <div className="px-6 pt-4">
        <div className="p-5 rounded-2xl"
             style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-label font-bold text-sm text-primary">{t('birthday.progress')}</span>
            <span className="font-headline font-bold text-xl text-primary">{Math.round(pct * 100)}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(18,67,70,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${pct * 100}%`, background: '#fcd34d' }} />
          </div>
          <div className="flex items-center gap-3 mt-3 p-3 rounded-xl" style={{ background: '#f9f2ec' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(252,211,77,0.2)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color: '#d97706', fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <div>
              <p className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest">{t('birthday.rewardLabel')}</p>
              <p className="font-body font-bold text-on-surface">{t('birthday.rewardXp')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="px-6 pt-6 pb-32">
        <h2 className="font-headline font-bold text-lg text-on-surface mb-4">{t('birthday.tasksTitle')}</h2>

        <div className="flex flex-col gap-0">
          {BIRTHDAY_TASKS.map((task, idx) => {
            const isDone = doneTasks.includes(task.id);
            const isNext = idx === firstUndoneIdx;
            const isLocked = !isDone && idx > firstUndoneIdx;
            const isLast = idx === BIRTHDAY_TASKS.length - 1;

            return (
              <div key={task.id} className="flex gap-3 relative">
                {/* Step indicator + connector */}
                <div className="flex flex-col items-center" style={{ width: 32 }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                       style={{
                         background: isDone ? '#34d399' : isNext ? '#fcd34d' : '#e8e1da',
                         color: isDone ? 'white' : '#1e1b17',
                         boxShadow: isNext ? '0 0 0 3px rgba(252,211,77,0.3)' : 'none',
                       }}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  {!isLast && (
                    <div className="flex-1 w-0.5 my-1" style={{ background: isDone ? '#34d399' : '#e8e1da', minHeight: 12 }} />
                  )}
                </div>

                {/* Task card */}
                <div className="flex-1 mb-3">
                  {isDone ? (
                    <div className="rounded-xl p-4 opacity-60" style={{ background: 'rgba(249,243,235,0.5)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                             style={{ background: 'rgba(52,211,153,0.15)' }}>
                          <span className="text-lg">{task.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-label font-bold text-on-surface/50 line-through">{task.name}</p>
                        </div>
                        <span className="font-label font-bold text-xs" style={{ color: '#34d399' }}>+{task.xp} XP</span>
                      </div>
                    </div>
                  ) : isLocked ? (
                    <div className="rounded-xl p-4 opacity-50" style={{ background: 'rgba(249,243,235,0.3)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                             style={{ background: 'rgba(0,0,0,0.04)' }}>
                          <span className="text-lg">{task.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-label font-bold text-on-surface">{task.name}</p>
                          <p className="font-body text-xs text-on-surface-variant">{task.hint}</p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full rounded-xl p-4 text-left transition-all active:scale-[0.98]"
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid rgba(18,67,70,0.15)',
                        boxShadow: '0 2px 12px rgba(18,67,70,0.08)',
                      }}
                      onClick={() => handleComplete(task.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                             style={{ background: 'rgba(252,211,77,0.15)' }}>
                          <span className="text-lg">{task.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-label font-bold text-on-surface">{task.name}</p>
                          <p className="font-body text-xs text-on-surface-variant">{task.hint}</p>
                        </div>
                        <span className="font-label font-bold text-xs text-primary">+{task.xp} XP</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tip card */}
        <div className="mt-4 p-5 rounded-2xl"
             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderTop: '4px solid #fcd34d' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-lg" style={{ color: '#d97706' }}>lightbulb</span>
            <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant">{t('birthday.tipTitle')}</h3>
          </div>
          <p className="font-body text-on-surface-variant italic leading-relaxed">
            {t('birthday.tipBody', { name: sibling.name, possessive: sibP.pos })}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-label font-bold text-on-surface-variant">{t('birthday.tipFrom')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
