import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { WEEKLY_MISSIONS } from '../constants';
import BirthdayEpic from './BirthdayEpic';
import { isDevMode } from '../utils/mode';

const TAG_STYLES = {
  emerald: { bg: 'rgba(16,185,129,0.1)', color: '#065f46' },
  amber:   { bg: 'rgba(245,158,11,0.1)', color: '#92400e' },
  violet:  { bg: 'rgba(139,92,246,0.1)', color: '#5b21b6' },
  sky:     { bg: 'rgba(14,165,233,0.1)', color: '#0c4a6e' },
  green:   { bg: 'rgba(34,197,94,0.1)', color: '#166534' },
  yellow:  { bg: 'rgba(234,179,8,0.1)', color: '#854d0e' },
};

const BTN_STYLES = {
  emerald: { bg: '#059669', text: '#ffffff' },
  amber:   { bg: '#fcd34d', text: '#1e1b17' },
  violet:  { bg: '#6d28d9', text: '#ffffff' },
  sky:     { bg: '#0ea5e9', text: '#ffffff' },
  green:   { bg: '#059669', text: '#ffffff' },
  yellow:  { bg: '#fcd34d', text: '#1e1b17' },
};

const REWARD_ICON_BG = {
  emerald: '#d3bbff',
  amber:   '#fcd34d',
  violet:  '#ffb68b',
  sky:     '#d3bbff',
  green:   '#d3bbff',
  yellow:  '#fcd34d',
};

function ProgressRing({ progress, target, size = 64 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, progress / target) : 0;
  const offset = circ * (1 - pct);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="transparent" stroke="currentColor"
                className="text-surface-container" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="transparent"
                stroke={pct >= 1 ? '#34d399' : '#fcd34d'} strokeWidth="4"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <span className="absolute font-label font-bold text-xs text-on-surface">{progress}/{target}</span>
    </div>
  );
}

function MissionCard({ mission, active, completed, onStart, onAbandon }) {
  const { t } = useTranslation();
  const tag = TAG_STYLES[mission.tagColor] || TAG_STYLES.violet;
  const btn = BTN_STYLES[mission.tagColor] || BTN_STYLES.violet;
  const iconBg = REWARD_ICON_BG[mission.tagColor] || '#d3bbff';
  const progress = active?.progress || 0;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-6 transition-all duration-300"
         style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
      {/* Background motif */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 pointer-events-none translate-x-4 translate-y-4">
        <span className="material-symbols-outlined" style={{ fontSize: '8rem' }}>filter_vintage</span>
      </div>

      {/* Header: tag + title + progress */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="max-w-[70%]">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
                style={{ background: tag.bg, color: tag.color }}>
            {t('mission.' + mission.id + '.tag')}
          </span>
          <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">{t('mission.' + mission.id + '.title')}</h3>
          <p className="font-body text-on-surface-variant text-sm leading-relaxed">{t('mission.' + mission.id + '.story')}</p>
        </div>
        <ProgressRing progress={progress} target={mission.target} />
      </div>

      {/* Reward preview */}
      <div className="flex items-center gap-4 mb-5 p-3 rounded-xl" style={{ background: '#f9f3eb' }}>
        <div className="w-12 h-12 flex items-center justify-center rounded-2xl"
             style={{ background: iconBg }}>
          <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
            {mission.rewardIcon}
          </span>
        </div>
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('mission.reward.label')}</p>
          <p className="font-body font-bold text-on-surface">{t('mission.' + mission.id + '.reward')}</p>
          <p className="font-label text-xs text-on-surface-variant">
            +{mission.reward.hp} &middot; +{mission.reward.evo} Evo
          </p>
        </div>
      </div>

      {/* Action button */}
      {completed ? (
        <div className="w-full py-4 rounded-full font-label font-bold text-center flex items-center justify-center gap-2"
             style={{ background: 'rgba(52,211,153,0.1)', color: '#059669' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {t('mission.complete')}
        </div>
      ) : active ? (
        <div className="flex gap-3">
          <div className="flex-1 py-4 rounded-full font-label font-bold text-center"
               style={{ background: 'rgba(252,211,77,0.15)', color: '#735c00' }}>
            {t('mission.active')} &middot; {progress}/{mission.target}
          </div>
          <button onClick={() => onAbandon(mission.id)}
            className="px-4 py-4 rounded-full font-label font-bold active:scale-95 transition-all"
            style={{ background: 'rgba(186,26,26,0.08)', color: '#ba1a1a' }}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      ) : (
        <button onClick={() => onStart(mission.id)}
          className="w-full py-4 rounded-full font-label font-bold active:scale-95 transition-all"
          style={{ background: btn.bg, color: btn.text, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          {t('mission.start')}
        </button>
      )}
    </div>
  );
}

export default function EpicMissions() {
  const { t } = useTranslation();
  const { state, actions } = useTask();
  const [showBirthday, setShowBirthday] = useState(false);
  const base = import.meta.env.BASE_URL;
  if (!state) return null;
  // Public mode hides Epic Missions (RPG-y surface). State keeps running;
  // activeMissions progress still accumulates silently.
  if (!isDevMode()) return null;

  const activeMissions = state.activeMissions || [];
  const completedMissions = state.completedMissions || [];
  const bdState = state.birthdayEpic || { done: [], completed: false };
  const bdDone = bdState.done?.length || 0;
  const bdCompleted = bdState.completed;

  if (showBirthday) {
    return <BirthdayEpic onBack={() => setShowBirthday(false)} />;
  }

  return (
    <div className="px-6 pt-4 pb-8 relative">
      <img src={import.meta.env.BASE_URL + 'art/bg-purple-depth.png'} alt="" className="fixed inset-0 w-full h-full object-cover opacity-10 -z-10 pointer-events-none" />
      {/* Header */}
      <section className="mb-8">
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">{t('mission.header')}</h2>
        <p className="font-body text-on-surface-variant text-lg">
          {t('mission.subtitle')}
        </p>
      </section>

      {/* Birthday Epic — Featured Quest */}
      <div className="mb-6">
        <button
          className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98] relative"
          style={{ boxShadow: '0 4px 20px rgba(217,119,6,0.15)' }}
          onClick={() => setShowBirthday(true)}
        >
          <div className="relative h-44 overflow-hidden">
            <img src={base + 'art/birthday-prep.png'} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #451a03 0%, rgba(69,26,3,0.4) 40%, transparent 70%)' }} />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-label uppercase tracking-widest"
                    style={{ background: '#fcd34d', color: '#725b00' }}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                {t('mission.eventQuest')}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fcd34d' }}>
                {bdCompleted ? t('mission.complete') : t('mission.tasks', { done: bdDone, total: 6 })}
              </p>
              <h3 className="font-headline font-bold text-xl text-white mt-1">{t('mission.birthdayTitle')}</h3>
            </div>
          </div>
          {!bdCompleted && (
            <div className="bg-white p-4 flex items-center justify-between"
                 style={{ borderTop: '3px solid #fcd34d' }}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg" style={{ color: '#d97706', fontVariationSettings: "'FILL' 1" }}>cake</span>
                <span className="font-body text-sm text-on-surface-variant">{t('mission.birthdayHint')}</span>
              </div>
              <span className="material-symbols-outlined text-xl" style={{ color: '#d97706' }}>chevron_right</span>
            </div>
          )}
          {bdCompleted && (
            <div className="p-4 flex items-center justify-center gap-2"
                 style={{ background: 'rgba(52,211,153,0.1)' }}>
              <span className="material-symbols-outlined" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label font-bold text-sm" style={{ color: '#059669' }}>{t('mission.birthdayBadge')}</span>
            </div>
          )}
        </button>
      </div>

      {/* Regular missions */}
      <div className="flex flex-col gap-6">
        {WEEKLY_MISSIONS.map(mission => {
          const active = activeMissions.find(m => m.id === mission.id);
          const completed = completedMissions.includes(mission.id);
          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              active={active}
              completed={completed}
              onStart={actions.startMission}
              onAbandon={actions.abandonMission}
            />
          );
        })}
      </div>
    </div>
  );
}
