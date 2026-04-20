import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * QuestLineCard — prominent entry card for a parent-created quest-line.
 * Shows at the top of Louis's quest list, warmer than regular routine tasks.
 *
 * Props:
 *  - questLine: ParentQuestLine
 *  - onOpen: (id: string) => void
 */

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1).trimEnd() + '…' : str;
}

export default function QuestLineCard({ questLine, onOpen }) {
  const { lang } = useTranslation();
  const ql = questLine;
  if (!ql) return null;

  const completed = ql.completedDayIds || [];
  const doneCount = completed.length;
  const totalDays = ql.days?.length || 0;
  const pct = totalDays > 0 ? doneCount / totalDays : 0;

  const isMilestones = ql.days?.length > 0 && ql.days.every(d => d.isMilestone);
  const emoji = ql.emoji
    || (ql.templateId === 'learn' ? '📚'
      : ql.templateId === 'event' ? '🎁'
      : ql.templateId === 'skill' ? '🎯'
      : '✨');

  // Current day (first uncompleted, for daily quest-lines)
  const todayDay = isMilestones ? null : ql.days?.find(d => !completed.includes(d.id));

  const todayLabel = isMilestones
    ? (lang === 'de'
        ? `${doneCount} von ${totalDays} Meilensteinen`
        : `${doneCount} of ${totalDays} milestones`)
    : todayDay
      ? `${lang === 'de' ? 'Heute' : 'Today'}: ${truncate(todayDay.title, 40)}`
      : (lang === 'de' ? 'Alles geschafft!' : 'All done!');

  const todayHint = !isMilestones && todayDay?.description
    ? truncate(todayDay.description, 64)
    : null;

  return (
    <button
      onClick={() => onOpen?.(ql.id)}
      className="relative w-full rounded-2xl p-5 mb-3 flex items-stretch gap-4 active:scale-[0.98] transition-all text-left overflow-hidden"
      style={{
        // Cream-gradient card matching DailyHabits + Dr Funkel card.
        // Earlier brown/amber palette clashed with the blue Heute biome
        // (Marc call-out). Dashed gold border kept as the "from a parent"
        // signal — Polish v2 color system: cream bg + teal text + gold
        // border + gold progress bar.
        background: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
        border: '1.5px dashed rgba(180,83,9,0.4)',
        boxShadow: '0 6px 18px -10px rgba(180,83,9,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      {/* "Von Mama" stamp — absolutely placed so the headline can breathe.
           Quieter gold-deep now that the card is cream, not brown. */}
      <span className="absolute top-3 right-4 font-label font-extrabold uppercase"
            style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(180,83,9,0.55)' }}
            aria-hidden="true">
        {lang === 'de' ? 'Von Mama' : 'From Mum'}
      </span>

      {/* Emoji column */}
      <div className="flex items-start">
        <span className="text-4xl select-none shrink-0" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }}>
          {emoji}
        </span>
      </div>

      {/* Main column — teal palette, no "Quest" word (Marc removed that
           vocabulary app-wide). Title carries enough context with the
           Von Mama stamp on the right. */}
      <div className="flex-1 min-w-0">
        <h3 className="font-headline font-bold text-lg leading-tight" style={{ color: '#124346', paddingRight: 72 }}>
          {ql.title}
        </h3>
        {ql.subtitle && (
          <p className="font-body text-sm mt-0.5 leading-snug" style={{ color: 'rgba(18,67,70,0.65)' }}>
            {truncate(ql.subtitle, 48)}
          </p>
        )}

        {/* Progress bar — gold gradient fill on a muted teal track */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(18,67,70,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${pct * 100}%`, background: 'linear-gradient(to right, #fcd34d, #f59e0b)' }} />
          </div>
          <span className="font-label font-bold text-xs shrink-0" style={{ color: '#124346' }}>
            {doneCount} / {totalDays}
          </span>
        </div>

        {/* Today preview — teal text on cream, hairline divider gold */}
        <div className="mt-3 pt-3" style={{ borderTop: '1px dashed rgba(180,83,9,0.25)' }}>
          <p className="font-label font-bold text-sm leading-snug" style={{ color: '#124346' }}>
            {todayLabel}
          </p>
          {todayHint && (
            <p className="font-body text-xs mt-0.5 leading-snug" style={{ color: 'rgba(18,67,70,0.6)' }}>
              {todayHint}
            </p>
          )}
        </div>
      </div>

      {/* Arrow column */}
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
             style={{ background: '#ffffff', border: '2px solid rgba(120,53,15,0.2)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <span className="material-symbols-outlined text-lg" style={{ color: '#78350f', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
        </div>
      </div>
    </button>
  );
}
