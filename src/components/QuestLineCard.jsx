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
      className="w-full rounded-2xl p-5 mb-3 flex items-stretch gap-4 active:scale-[0.98] transition-all text-left"
      style={{
        background: 'linear-gradient(135deg, #fff8f2 0%, #fef3c7 100%)',
        border: '1.5px solid rgba(252,211,77,0.45)',
        boxShadow: '0 4px 16px rgba(252,211,77,0.15)',
      }}
    >
      {/* Emoji column */}
      <div className="flex items-start">
        <span className="text-4xl select-none shrink-0" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }}>
          {emoji}
        </span>
      </div>

      {/* Main column */}
      <div className="flex-1 min-w-0">
        <p className="font-label font-bold text-xs uppercase tracking-widest mb-0.5" style={{ color: '#b45309' }}>
          {lang === 'de' ? 'Eltern-Quest' : 'Parent Quest'}
        </p>
        <h3 className="font-headline font-bold text-lg leading-tight" style={{ color: '#78350f' }}>
          {ql.title}
        </h3>
        {ql.subtitle && (
          <p className="font-body text-sm mt-0.5 leading-snug" style={{ color: '#78350f99' }}>
            {truncate(ql.subtitle, 48)}
          </p>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(120,53,15,0.15)' }}>
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${pct * 100}%`, background: 'linear-gradient(to right, #fcd34d, #f59e0b)' }} />
          </div>
          <span className="font-label font-bold text-xs shrink-0" style={{ color: '#78350f' }}>
            {doneCount} / {totalDays}
          </span>
        </div>

        {/* Today preview */}
        <div className="mt-3 pt-3" style={{ borderTop: '1px dashed rgba(120,53,15,0.2)' }}>
          <p className="font-label font-bold text-sm leading-snug" style={{ color: '#78350f' }}>
            {todayLabel}
          </p>
          {todayHint && (
            <p className="font-body text-xs mt-0.5 leading-snug" style={{ color: '#78350f99' }}>
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
