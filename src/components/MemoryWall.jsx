// src/components/MemoryWall.jsx
import React from 'react';
import { useTask } from '../context/TaskContext';
import { BOSSES, BADGES, ANCHORS } from '../constants';
import { useTranslation } from '../i18n/LanguageContext';
import { SPECIAL_QUESTS } from '../data/specialQuests';

const BOSS_TIER_COLORS = { tier1: '#34d399', tier2: '#f59e0b', tier3: '#ef4444' };

function Stamp({ emoji, label, accentColor = '#fcd34d', index = 0 }) {
  const tilts = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2, -1, 1.5];
  const tilt = tilts[index % tilts.length];
  return (
    <div
      className="flex flex-col items-center gap-2 p-3 rounded-2xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0c1a2e 0%, #0d1f1a 100%)',
        border: `1.5px solid ${accentColor}30`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
        transform: `rotate(${tilt}deg)`,
        minWidth: 100,
      }}
    >
      {/* Subtle warm glow behind emoji */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 60, height: 60, borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <span className="relative text-4xl leading-none select-none" style={{ filter: 'drop-shadow(0 0 6px rgba(252,211,77,0.4))' }}>{emoji}</span>
      <p className="relative font-headline font-bold text-xs text-center leading-tight text-white" style={{ maxWidth: 80 }}>{label}</p>
      {/* Stamp border decoration */}
      <div style={{
        position: 'absolute', inset: 3, borderRadius: '0.85rem',
        border: `1px dashed ${accentColor}20`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

export default function MemoryWall() {
  const { state } = useTask();
  const { locale } = useTranslation();
  const lang = locale || 'de';
  const base = import.meta.env.BASE_URL;

  if (!state) return null;

  // Boss trophies — deduplicated
  const defeatedBossIds = [...new Set(state.bossTrophies || [])];
  const defeatedBosses = defeatedBossIds.map(id => BOSSES.find(b => b.id === id)).filter(Boolean);

  // Badges — state.unlockedBadges maps to the acc field from spec
  const earnedBadges = (state.unlockedBadges || []).map(id => BADGES.find(b => b.id === id)).filter(Boolean);

  // Mastered quests — quests completed ≥ 30 times (totalQuestCompletions)
  const completions = state.totalQuestCompletions || {};
  const masteredQuests = Object.entries(completions)
    .filter(([, count]) => count >= 30)
    .map(([id]) => {
      const anchor = Object.values(ANCHORS).find(a => a.label && id.includes(a.label)) || null;
      // Try to match by quest id prefix to anchor key
      const anchorByKey = ANCHORS[id];
      return {
        id,
        label: anchorByKey?.label || id,
        icon: anchorByKey?.icon || '⭐',
      };
    });

  // Completed discovery quests
  const completedSQ = SPECIAL_QUESTS.filter(q => state.completedSpecialQuests?.[q.id]);

  // Milestone stamps
  const totalTasksDone = state.totalTasksDone || 0;
  const completedMissionsCount = (state.completedMissions || []).length;

  const milestoneStamps = [
    totalTasksDone >= 1 && { emoji: '🗓️', label: `${totalTasksDone} Aufgaben`, color: '#fcd34d' },
    completedMissionsCount >= 1 && { emoji: '🎯', label: `${completedMissionsCount} Missionen`, color: '#34d399' },
  ].filter(Boolean);

  const totalStamps = defeatedBosses.length + earnedBadges.length + masteredQuests.length + milestoneStamps.length + completedSQ.length;
  let stampIndex = 0;

  return (
    <div className="relative min-h-dvh pb-32">
      {/* ── Header ── */}
      <section className="mb-6 -mx-0">
        <div className="relative rounded-b-3xl overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #0c1a2e, #0c3236)' }}>
          {/* Star field backdrop */}
          <img
            src={base + 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_deep_night_sky._Rich__c902cc19-afa0-4c99-a434-6e206610ddf9_0.webp'}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
          />
          <div className="relative px-6 pt-10 pb-6">
            <p className="font-label font-bold text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(252,211,77,0.7)' }}>
              {totalStamps} {totalStamps === 1 ? 'Erinnerung' : 'Erinnerungen'}
            </p>
            <h1 className="font-headline font-bold text-3xl text-white mb-1">Erinnerungen</h1>
            <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Deine Geschichte mit Ronki
            </p>
          </div>
        </div>
      </section>

      <div className="px-6">
        {totalStamps === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl mb-4">✨</span>
            <p className="font-headline font-bold text-xl text-on-surface mb-2">Noch keine Erinnerungen</p>
            <p className="font-body text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Schließe Quests ab, besiege Bosse und erledige Missionen — deine Geschichte beginnt hier.
            </p>
          </div>
        ) : (
          <>
            {/* Boss Trophies */}
            {defeatedBosses.length > 0 && (
              <section className="mb-8">
                <h2 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <span>⚔️</span> Besiegte Bosse
                </h2>
                <div className="flex flex-wrap gap-4">
                  {defeatedBosses.map((boss) => (
                    <Stamp
                      key={boss.id}
                      emoji={boss.icon}
                      label={boss.name}
                      accentColor={BOSS_TIER_COLORS[boss.tier] || '#fcd34d'}
                      index={stampIndex++}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Badges */}
            {earnedBadges.length > 0 && (
              <section className="mb-8">
                <h2 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <span>🏅</span> Abzeichen
                </h2>
                <div className="flex flex-wrap gap-4">
                  {earnedBadges.map((badge) => (
                    <Stamp
                      key={badge.id}
                      emoji={badge.i}
                      label={badge.n}
                      accentColor="#fcd34d"
                      index={stampIndex++}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Mastered quests */}
            {masteredQuests.length > 0 && (
              <section className="mb-8">
                <h2 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <span>🌟</span> Gemeisterte Quests
                </h2>
                <div className="flex flex-wrap gap-4">
                  {masteredQuests.map((q) => (
                    <Stamp
                      key={q.id}
                      emoji={q.icon}
                      label={q.label}
                      accentColor="#a78bfa"
                      index={stampIndex++}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Milestone stamps */}
            {milestoneStamps.length > 0 && (
              <section className="mb-8">
                <h2 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <span>⭐</span> Meilensteine
                </h2>
                <div className="flex flex-wrap gap-4">
                  {milestoneStamps.map((ms) => (
                    <Stamp
                      key={ms.label}
                      emoji={ms.emoji}
                      label={ms.label}
                      accentColor={ms.color}
                      index={stampIndex++}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Discovery quest stamps */}
            {completedSQ.length > 0 && (
              <section className="mb-8">
                <h2 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <span>🗺️</span> {lang === 'de' ? 'Entdeckungen' : 'Discoveries'}
                </h2>
                <div className="flex flex-wrap gap-4">
                  {completedSQ.map((q) => (
                    <Stamp
                      key={q.id}
                      emoji={q.emoji}
                      label={lang === 'de' ? q.titleDe : q.titleEn}
                      accentColor="#fcd34d"
                      index={stampIndex++}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
