import React from 'react';
import { useTask } from '../context/TaskContext';
import { WEEKLY_MISSIONS } from '../constants';

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
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ background: tag.bg, color: tag.color }}>
            {mission.tag}
          </span>
          <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">{mission.title}</h3>
          <p className="font-body text-on-surface-variant text-sm leading-relaxed">{mission.story}</p>
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
          <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Belohnung</p>
          <p className="font-body font-bold text-on-surface">{mission.rewardLabel}</p>
          <p className="font-label text-[10px] text-on-surface-variant">
            +{mission.reward.hp} HP &middot; +{mission.reward.evo} Evo
          </p>
        </div>
      </div>

      {/* Action button */}
      {completed ? (
        <div className="w-full py-4 rounded-full font-label font-bold text-center flex items-center justify-center gap-2"
             style={{ background: 'rgba(52,211,153,0.1)', color: '#059669' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Abgeschlossen!
        </div>
      ) : active ? (
        <div className="flex gap-3">
          <div className="flex-1 py-4 rounded-full font-label font-bold text-center"
               style={{ background: 'rgba(252,211,77,0.15)', color: '#735c00' }}>
            Aktiv &middot; {progress}/{mission.target}
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
          Mission starten
        </button>
      )}
    </div>
  );
}

export default function EpicMissions() {
  const { state, actions } = useTask();
  if (!state) return null;

  const activeMissions = state.activeMissions || [];
  const completedMissions = state.completedMissions || [];

  return (
    <div className="px-6 pt-4 pb-8">
      {/* Header */}
      <section className="mb-8">
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Epische Missionen</h2>
        <p className="font-body text-on-surface-variant text-lg">
          Wähle dein nächstes großes Abenteuer, kleiner Held!
        </p>
      </section>

      {/* Active missions first */}
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
