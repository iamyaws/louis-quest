import React, { useRef } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import SFX from '../utils/sfx';
import { useQuestEater } from './QuestEater';

/**
 * DailyHabits — parent-defined daily checkpoints.
 *
 * Parents configure these in Eltern-Bereich → Familie → Tägliche Gewohnheiten
 * (e.g. "Vitamin D", "Zeit mit Liam"). Rendered at the top of TaskList so
 * Louis can tick them off as part of his daily ritual.
 *
 * Was orphan code before Apr 2026 — component existed but nothing imported
 * it, so Marc's configured habits never rendered anywhere. Now wired into
 * TaskList above the personalised header. Returns null if no habits are
 * configured so the view doesn't show an empty container.
 *
 * Visual language matches the "Heute" block: cream-gradient card with 4px
 * teal accent bar + Fredoka section header, each habit as a pill-row with
 * emoji/name/xp chip and a mint-green completed state.
 */
export default function DailyHabits() {
  const { state, actions } = useTask();
  const { lang } = useTranslation();
  const eater = useQuestEater();

  const habits = state?.familyConfig?.dailyHabits || [];
  const doneMap = state?.dailyHabits || {};

  // Filter empty-name habits (parent created an empty row and never filled
  // it). No point showing a blank pill to Louis.
  const activeHabits = habits.filter(h => h.name && h.name.trim().length > 0);
  if (activeHabits.length === 0) return null;

  const handleTap = (habit, evt) => {
    if (doneMap[habit.id]) return; // already done today
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(50);
    // Habits get the sparkle flavor — star-drift fire-breath. Teaches
    // the kid that habits (vs routine quests) are something different,
    // and the ambient sparkle feels fitting for growing-over-time.
    if (eater && evt?.currentTarget) {
      const fromRect = evt.currentTarget.getBoundingClientRect();
      eater.eatQuest({
        fromRect,
        emoji: habit.icon || '✨',
        hp: habit.xp || 5,
        flavor: 'sparkle',
      });
    }
    actions.completeHabit?.(habit.id);
  };

  const doneCount = activeHabits.filter(h => !!doneMap[h.id]).length;
  const allDone = doneCount === activeHabits.length;

  return (
    <section className="mb-5 rounded-2xl"
             style={{
               background: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
               border: '1px solid rgba(180,83,9,0.2)',
               boxShadow: '0 6px 18px -10px rgba(180,83,9,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
               padding: '14px 16px 16px',
             }}>
      {/* Section header — 4px gold accent bar + Fredoka 18/500 + counter pill */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="shrink-0" style={{ width: 4, height: 18, borderRadius: 2, background: '#b45309' }} aria-hidden="true" />
        <h3 className="font-headline flex-1"
            style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 16, color: '#124346', letterSpacing: '-0.01em' }}>
          {lang === 'de' ? 'Nicht vergessen' : "Don't forget"}
        </h3>
        <span className="font-label font-extrabold uppercase"
              style={{
                fontSize: 10,
                letterSpacing: '0.16em',
                color: allDone ? '#059669' : '#b45309',
                padding: '3px 8px',
                borderRadius: 999,
                background: allDone ? 'rgba(52,211,153,0.18)' : 'rgba(180,83,9,0.1)',
              }}>
          {doneCount}/{activeHabits.length}
        </span>
      </div>

      {/* Habit pills — one row per habit */}
      <div className="flex flex-col gap-2">
        {activeHabits.map(habit => {
          const isDone = !!doneMap[habit.id];
          return (
            <button
              key={habit.id}
              onClick={(e) => handleTap(habit, e)}
              disabled={isDone}
              className="w-full flex items-center gap-3 transition-all active:scale-[0.98]"
              style={{
                padding: '10px 12px 10px 10px',
                borderRadius: 14,
                background: isDone ? 'rgba(236,253,245,0.8)' : '#ffffff',
                border: isDone ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(180,83,9,0.12)',
                boxShadow: isDone ? 'none' : '0 2px 6px rgba(180,83,9,0.05)',
                cursor: isDone ? 'default' : 'pointer',
              }}
            >
              {/* Icon tile — swaps to iconDone on completion */}
              <div className="flex items-center justify-center shrink-0"
                   style={{
                     width: 40,
                     height: 40,
                     borderRadius: 12,
                     background: isDone ? 'rgba(52,211,153,0.18)' : 'rgba(252,211,77,0.18)',
                     fontSize: 22,
                   }}>
                <span aria-hidden="true">{isDone ? (habit.iconDone || '✅') : habit.icon}</span>
              </div>

              {/* Name */}
              <span className="flex-1 text-left font-body font-semibold"
                    style={{
                      fontSize: 14,
                      color: isDone ? '#065f46' : '#124346',
                      textDecoration: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.75 : 1,
                    }}>
                {habit.name}
              </span>

              {/* XP chip — hides once done */}
              {!isDone && (
                <span className="font-label font-extrabold shrink-0"
                      style={{
                        fontSize: 11,
                        padding: '5px 9px',
                        borderRadius: 8,
                        background: 'rgba(252,211,77,0.22)',
                        color: '#b45309',
                        border: '1px solid rgba(180,83,9,0.18)',
                        letterSpacing: '0.04em',
                      }}>
                  +{habit.xp || 5}
                </span>
              )}
              {isDone && (
                <span className="material-symbols-outlined shrink-0"
                      style={{ fontSize: 20, color: '#059669', fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
