import React from 'react';
import { BADGES } from '../constants';
import { useTask } from '../context/TaskContext';

export default function BadgeGrid() {
  const { state } = useTask();
  if (!state) return null;

  const unlocked = state.unlockedBadges || [];
  const count = unlocked.length;

  return (
    <section className="rounded-2xl p-6 relative overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          Abzeichen
        </h3>
        <span className="font-label font-bold text-sm text-on-surface-variant">{count}/{BADGES.length}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {BADGES.map(badge => {
          const isUnlocked = unlocked.includes(badge.id);
          return (
            <div key={badge.id}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
              style={{
                background: isUnlocked ? 'rgba(252,211,77,0.1)' : 'rgba(232,225,218,0.4)',
                border: isUnlocked ? '1.5px solid rgba(252,211,77,0.3)' : '1.5px solid transparent',
                opacity: isUnlocked ? 1 : 0.4,
              }}>
              <span className="text-3xl" style={{ filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                {badge.i}
              </span>
              <span className="font-label font-bold text-xs text-on-surface text-center leading-tight">
                {badge.n}
              </span>
              {isUnlocked && (
                <span className="text-xs font-label text-on-surface-variant text-center leading-snug">
                  {badge.desc}
                </span>
              )}
              {!isUnlocked && (
                <span className="material-symbols-outlined text-sm" style={{ color: '#ccc3d7' }}>lock</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
