import React, { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import CooldownButton from './CooldownButton';

/**
 * QuestLineView — generalized runtime for parent-created quest-lines.
 * Adapts PoemQuest's visual pattern to render any ParentQuestLine from state.
 *
 * Props:
 *  - questLineId: string  — the id of the ParentQuestLine to render
 *  - onBack: () => void   — navigate back to the quest list
 *
 * Policy: the first uncompleted day IS "heute". No date gating.
 * For milestone quest-lines (every day isMilestone), all items render as a
 * check-off list with no "heute" singling-out.
 */

const base = import.meta.env.BASE_URL;

// Template-specific celebration copy
function getCompletionCopy(templateId, lang) {
  if (lang === 'en') {
    switch (templateId) {
      case 'learn': return 'You pushed through the whole project! Ronki is so proud!';
      case 'event': return 'What a day!';
      case 'skill': return 'All milestones done! You\'re a real pro!';
      default: return 'You did it!';
    }
  }
  switch (templateId) {
    case 'learn': return 'Du hast das ganze Projekt durchgezogen! Ronki ist mega stolz!';
    case 'event': return 'Was für ein Tag!';
    case 'skill': return 'Alle Meilensteine geschafft! Du bist ein echter Profi!';
    default: return 'Du hast es geschafft!';
  }
}

export default function QuestLineView({ questLineId, onBack }) {
  const { state, actions } = useTask();
  const haptic = useHaptic();
  const { lang } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);

  const ql = (state?.parentQuestLines || []).find(q => q.id === questLineId);

  // Quest-line not found — schedule the parent navigation via effect
  // so we don't setState during render (React anti-pattern).
  useEffect(() => {
    if (!ql && typeof onBack === 'function') onBack();
  }, [ql, onBack]);

  if (!ql) return null;

  // Archived — show a quiet state + back button
  if (ql.archived) {
    return (
      <div className="relative min-h-dvh pb-32">
        <div className="fixed inset-0 -z-20" style={{ background: '#fff8f2' }} />
        <main className="px-5 max-w-lg mx-auto flex flex-col items-center justify-center min-h-dvh">
          <span className="text-5xl mb-4 opacity-60">📦</span>
          <p className="font-body text-base text-on-surface-variant text-center mb-6 max-w-sm">
            {lang === 'de'
              ? 'Diese Quest-Linie wurde archiviert.'
              : 'This quest-line has been archived.'}
          </p>
          <button onClick={onBack}
            className="px-6 py-3 rounded-full font-headline font-bold text-base active:scale-95 transition-all"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 4px 12px rgba(252,211,77,0.3)' }}>
            {lang === 'de' ? 'Zurück' : 'Back'}
          </button>
        </main>
      </div>
    );
  }

  const completed = ql.completedDayIds || [];
  const doneCount = completed.length;
  const totalDays = ql.days.length;
  const allDone = ql.completed;
  const isMilestones = ql.days.length > 0 && ql.days.every(d => d.isMilestone);
  const emoji = ql.emoji || (ql.templateId === 'learn' ? '📚' : ql.templateId === 'event' ? '🎁' : ql.templateId === 'skill' ? '🎯' : '✨');

  const handleCompleteDay = (dayId) => {
    if (completed.includes(dayId)) return;
    actions.completeQuestLineDay(questLineId, dayId);
    SFX.play('pop');
    haptic('success');

    // Will this be the last day?
    if (doneCount + 1 >= totalDays) {
      actions.addHP?.(100);
      setTimeout(() => setShowCelebration(true), 400);
    }
  };

  // Today's day for non-milestone quest-lines (first uncompleted)
  const todayIdx = isMilestones ? -1 : ql.days.findIndex(d => !completed.includes(d.id));
  const todayDay = todayIdx >= 0 ? ql.days[todayIdx] : null;
  const upcoming = isMilestones ? [] : (todayIdx >= 0 ? ql.days.slice(todayIdx + 1) : []);
  const doneDays = isMilestones ? [] : ql.days.filter(d => completed.includes(d.id));

  const pct = totalDays > 0 ? doneCount / totalDays : 0;

  // ── Celebration (live trigger this session) ──
  if (showCelebration) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-8 text-center"
           style={{ background: 'linear-gradient(160deg, #0c3236 0%, #124346 50%, #1a5e52 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="ember"
                 style={{
                   left: `${10 + Math.random() * 80}%`,
                   '--dur': `${3 + Math.random() * 3}s`,
                   '--delay': `${Math.random() * 2}s`,
                   '--drift': `${(Math.random() - 0.5) * 30}px`,
                 }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-8xl mb-4">{emoji}</span>
          <h2 className="font-headline font-bold text-3xl text-white mb-3"
              style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            {ql.title} {lang === 'de' ? 'geschafft!' : 'done!'}
          </h2>
          <p className="font-body text-lg mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {getCompletionCopy(ql.templateId, lang)}
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full mt-4 mb-8"
               style={{ background: 'rgba(252,211,77,0.2)', border: '1px solid rgba(252,211,77,0.3)' }}>
            <span className="material-symbols-outlined text-sm" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-label font-bold text-sm" style={{ color: '#fcd34d' }}>+100</span>
          </div>

          <CooldownButton delay={4} onClick={onBack} icon="arrow_forward"
            className="w-full max-w-xs py-5 rounded-full font-headline font-bold text-xl text-white"
            style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4)' }}>
            {lang === 'de' ? 'Zurück' : 'Back'}
          </CooldownButton>
        </div>
      </div>
    );
  }

  // ── Read-only review when revisiting an already-complete quest-line ──
  // (celebration already fired on the completing session — don't retrigger)
  const readOnlyDone = allDone && !showCelebration;

  // ── Main Quest View ──
  return (
    <div className="relative min-h-dvh pb-32">
      <div className="fixed inset-0 -z-20" style={{ background: '#fff8f2' }} />

      <main className="px-5 max-w-lg mx-auto"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>

        {/* Back button */}
        <button onClick={onBack} className="flex items-center gap-1.5 mb-5 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-lg text-primary">arrow_back</span>
          <span className="font-label font-bold text-sm text-primary">
            {lang === 'de' ? 'Zurück' : 'Back'}
          </span>
        </button>

        {/* Header card */}
        <div className="rounded-2xl mb-6 p-5 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #fff8f2 0%, #fef3c7 100%)', border: '1.5px solid rgba(252,211,77,0.35)', boxShadow: '0 4px 16px rgba(252,211,77,0.12)' }}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-label font-bold text-xs uppercase tracking-widest mb-0.5" style={{ color: '#b45309' }}>
                {readOnlyDone
                  ? (lang === 'de' ? 'Geschafft!' : 'Completed!')
                  : (lang === 'de' ? 'Eltern-Quest' : 'Parent Quest')}
              </p>
              <h1 className="font-headline font-bold text-2xl text-on-surface leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {ql.title}
              </h1>
              {ql.subtitle && (
                <p className="font-body text-sm text-on-surface-variant mt-0.5 leading-snug">{ql.subtitle}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(120,53,15,0.12)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                   style={{ width: `${pct * 100}%`, background: 'linear-gradient(to right, #fcd34d, #f59e0b)' }} />
            </div>
            <span className="font-label font-bold text-sm shrink-0" style={{ color: '#78350f' }}>
              {doneCount} / {totalDays}
            </span>
          </div>
        </div>

        {/* ── Read-only review message ── */}
        {readOnlyDone && (
          <div className="rounded-2xl p-5 mb-6 text-center"
               style={{ background: 'rgba(52,211,153,0.08)', border: '1.5px solid rgba(52,211,153,0.25)' }}>
            <span className="text-3xl block mb-2">🌟</span>
            <p className="font-headline font-bold text-base mb-1" style={{ color: '#065f46' }}>
              {lang === 'de' ? 'Nochmal anschauen' : 'Looking back'}
            </p>
            <p className="font-body text-sm" style={{ color: '#047857' }}>
              {lang === 'de'
                ? 'Du hast alles geschafft. Ronki erinnert sich noch genau!'
                : 'You finished everything. Ronki still remembers it all!'}
            </p>
          </div>
        )}

        {/* ── Milestone list ── */}
        {isMilestones && (
          <div className="flex flex-col gap-3">
            {ql.days.map((day) => {
              const isDone = completed.includes(day.id);
              const canTap = !isDone && !readOnlyDone;
              return (
                <button
                  key={day.id}
                  onClick={() => canTap && handleCompleteDay(day.id)}
                  disabled={!canTap}
                  className={`w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all ${canTap ? 'active:scale-[0.98]' : ''}`}
                  style={{
                    background: isDone ? 'rgba(52,211,153,0.08)' : '#ffffff',
                    border: isDone ? '1.5px solid rgba(52,211,153,0.3)' : '1.5px solid rgba(0,0,0,0.06)',
                    boxShadow: isDone ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                    cursor: canTap ? 'pointer' : 'default',
                  }}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                       style={{ background: isDone ? 'rgba(52,211,153,0.15)' : 'rgba(252,211,77,0.12)' }}>
                    {isDone ? '✓' : (day.icon || '⭐')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-headline font-bold text-base leading-snug ${isDone ? 'line-through text-on-surface/50' : 'text-on-surface'}`}>
                      {day.title}
                    </h3>
                    {day.description && (
                      <p className={`font-body text-sm mt-0.5 leading-snug ${isDone ? 'text-on-surface/40' : 'text-on-surface-variant'}`}>
                        {day.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Daily list ── */}
        {!isMilestones && (
          <>
            {/* Completed days (compact strip at top) */}
            {doneDays.length > 0 && (
              <div className="mb-5">
                <p className="font-label font-bold text-xs uppercase tracking-widest mb-2 text-on-surface-variant">
                  {lang === 'de' ? 'Gemacht' : 'Done'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {doneDays.map(d => (
                    <div key={d.id}
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                         style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                      <span className="material-symbols-outlined text-sm" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check</span>
                      <span className="font-label font-bold text-xs" style={{ color: '#065f46' }}>
                        {lang === 'de' ? 'Tag' : 'Day'} {d.dayNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Heute card — with optional painterly beat art above.
                 P_GEDICHT's 7 beats each ship with `art/quests/poem-day-N.webp`
                 (Marc: "we had a really cool poem arc with art"). Other
                 beats without `artFile` fall back to the emoji-only
                 layout. */}
            {todayDay && !readOnlyDone && (
              <div className="mb-5">
                <p className="font-label font-bold text-xs uppercase tracking-widest mb-2" style={{ color: '#b45309' }}>
                  {lang === 'de' ? 'Heute' : 'Today'}
                </p>
                <div className="rounded-2xl overflow-hidden"
                     style={{ background: '#ffffff', border: '2px solid rgba(252,211,77,0.45)', boxShadow: '0 4px 16px rgba(252,211,77,0.15)' }}>
                  {/* Painterly beat banner — only when artFile exists */}
                  {todayDay.artFile && (
                    <div className="relative w-full" style={{ aspectRatio: '16/9', background: '#faf3e8' }}>
                      <img
                        src={`${base}${todayDay.artFile}`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                      />
                      {/* Day-number pill pinned top-left on the art */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full flex items-center gap-1"
                           style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
                        <span className="font-label font-extrabold uppercase"
                              style={{ fontSize: 10, letterSpacing: '0.2em', color: '#b45309' }}>
                          {lang === 'de' ? 'Tag' : 'Day'} {todayDay.dayNumber}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      {!todayDay.artFile && (
                        <span className="text-3xl shrink-0">{todayDay.icon || '✨'}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        {!todayDay.artFile && (
                          <p className="font-label font-bold text-xs uppercase tracking-widest mb-0.5" style={{ color: '#b45309' }}>
                            {lang === 'de' ? 'Tag' : 'Day'} {todayDay.dayNumber}
                          </p>
                        )}
                        <h3 className="font-headline font-bold text-lg text-on-surface leading-tight">
                          {todayDay.title}
                        </h3>
                        {todayDay.description && (
                          <p className="font-body text-sm text-on-surface-variant mt-1 leading-snug">
                            {todayDay.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteDay(todayDay.id)}
                      className="w-full py-3.5 rounded-full font-headline font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
                      style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 4px 12px rgba(252,211,77,0.3)' }}
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                      {lang === 'de' ? 'Gemacht' : 'Done'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming days */}
            {upcoming.length > 0 && !readOnlyDone && (
              <div>
                <p className="font-label font-bold text-xs uppercase tracking-widest mb-2 text-on-surface-variant">
                  {lang === 'de' ? 'Bald' : 'Coming up'}
                </p>
                <div className="flex flex-col gap-2">
                  {upcoming.map(d => (
                    <div key={d.id}
                         className="rounded-xl p-3 flex items-center gap-3 opacity-60"
                         style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span className="text-xl shrink-0">{d.icon || '·'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#6b7280' }}>
                          {lang === 'de' ? 'Tag' : 'Day'} {d.dayNumber}
                        </p>
                        <h4 className="font-headline font-bold text-sm text-on-surface/70 leading-snug truncate">
                          {d.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If all days are done and we're in read-only, show the full list as checked */}
            {readOnlyDone && (
              <div className="flex flex-col gap-2">
                {ql.days.map(d => (
                  <div key={d.id}
                       className="rounded-xl p-3 flex items-center gap-3"
                       style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <span className="text-xl shrink-0">{d.icon || '·'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#059669' }}>
                        {lang === 'de' ? 'Tag' : 'Day'} {d.dayNumber}
                      </p>
                      <h4 className="font-headline font-bold text-sm line-through text-on-surface/60 leading-snug">
                        {d.title}
                      </h4>
                    </div>
                    <span className="material-symbols-outlined text-xl" style={{ color: '#34d399', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer: HP hint + attribution */}
        {!readOnlyDone && (
          <div className="mt-8 flex flex-col gap-2">
            <p className="font-body text-sm text-center text-on-surface-variant italic">
              {lang === 'de' ? 'Fertig machen bringt +100 Sterne!' : 'Finishing brings +100 Stars!'}
            </p>
            <p className="font-label text-xs text-center text-on-surface/50 flex items-center justify-center gap-1.5">
              <span>💛</span>
              <span>{lang === 'de' ? 'Quest-Linie von Mama oder Papa' : 'Quest-line from a parent'}</span>
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
