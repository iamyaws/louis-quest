import React from 'react';
import { useTask } from '../context/TaskContext';
import { CAT_STAGES, COMPANION_STAGES, GEAR_ITEMS, ORB_META, BADGES, BOSSES } from '../constants';
import { getLevel, getLvlProg, getCatStage } from '../utils/helpers';

const base = import.meta.env.BASE_URL;

const GEAR_SLOTS = [
  { key: 'head', label: 'Kopf', icon: 'person_play' },
  { key: 'neck', label: 'Amulett', icon: 'diamond' },
  { key: 'back', label: 'Rücken', icon: 'checkroom' },
];

export default function HeroProfile({ onNavigate }) {
  const { state } = useTask();
  if (!state) return null;

  const level = getLevel(state.xp || 0);
  const lvlProg = getLvlProg(state.xp || 0);
  const catStage = getCatStage(state.catEvo || 0);
  const eggType = state.eggType || 'dragon';
  const stages = COMPANION_STAGES[eggType] || COMPANION_STAGES.dragon;
  const stageName = stages[catStage]?.name || CAT_STAGES[catStage]?.name || 'Ei';
  const stageEmoji = stages[catStage]?.emoji || '🥚';

  const orbs = state.orbs || { vitality: 0, radiance: 0, patience: 0, wisdom: 0 };
  const trophyCount = (state.bossTrophies || []).length;
  const badgeCount = (state.unlockedBadges || []).length;
  const gear = state.equippedGear || {};
  const gearInv = state.gearInventory || [];

  // Level title
  const LEVEL_TITLES = [
    'Neuling', 'Entdecker', 'Spurensucher', 'Pfadfinder', 'Waldläufer',
    'Nebelkämpfer', 'Lichtbringer', 'Sternenwächter', 'Legendärer Held',
  ];
  const titleIdx = Math.min(Math.floor(level / 2), LEVEL_TITLES.length - 1);
  const heroTitle = `Level ${level} ${LEVEL_TITLES[titleIdx]}`;

  return (
    <div className="px-6 pb-32">

      {/* ── Hero & Companion Spotlight ── */}
      <section className="relative flex flex-col items-center justify-center pt-6 pb-2">
        <div className="absolute inset-0 rounded-full blur-3xl -z-10 scale-150"
             style={{ background: 'rgba(18,67,70,0.06)' }} />

        {/* Companion + Avatar */}
        <div className="relative w-48 h-48 flex items-end justify-center">
          {/* Main companion circle */}
          <div className="relative z-10 w-40 h-40 rounded-full overflow-hidden shadow-xl"
               style={{ border: '6px solid #e8e1db' }}>
            <img src={base + (catStage === 0 ? 'art/egg-glow.webp' : 'art/dragon-baby.webp')}
                 alt="Ronki" className="w-full h-full object-cover" />
          </div>
          {/* Stage emoji badge */}
          <div className="absolute -right-2 -bottom-1 z-20 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg"
               style={{ background: '#fcd34d', border: '3px solid white' }}>
            {stageEmoji}
          </div>
        </div>

        <h2 className="mt-5 text-3xl text-primary font-bold tracking-tight"
            style={{ fontFamily: 'Fredoka, sans-serif' }}>
          {stageName}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full font-headline font-bold text-sm">
            {heroTitle}
          </span>
        </div>

        {/* XP progress bar */}
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between items-center px-1 mb-1.5">
            <span className="font-label text-xs font-bold text-primary/50 uppercase tracking-widest">Erfahrung</span>
            <span className="font-label text-xs font-bold text-primary">{lvlProg.cur}/{lvlProg.need} XP</span>
          </div>
          <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                 style={{ width: `${Math.min(100, (lvlProg.cur / lvlProg.need) * 100)}%` }} />
          </div>
        </div>
      </section>

      {/* ── Quick Stats Row ── */}
      <section className="grid grid-cols-3 gap-3 mt-6">
        {[
          { icon: 'swords', label: 'Bosse', value: trophyCount, color: '#ba1a1a' },
          { icon: 'local_fire_department', label: 'Streak', value: `${state.sd || 0}d`, color: '#f59e0b' },
          { icon: 'task_alt', label: 'Quests', value: state.totalTasksDone || 0, color: '#124346' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col items-center gap-1"
               style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span className="material-symbols-outlined text-2xl"
                  style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            <span className="font-headline font-bold text-lg text-on-surface">{s.value}</span>
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Orb Stats (character growth bars) ── */}
      <section className="mt-8">
        <h3 className="font-headline font-bold text-lg text-primary mb-4 px-1"
            style={{ fontFamily: 'Fredoka, sans-serif' }}>Wachstums-Orbs</h3>
        <div className="rounded-2xl p-5 space-y-5"
             style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {ORB_META.map(orb => {
            const val = orbs[orb.key] || 0;
            const max = 50; // Stern milestone
            const pct = Math.min(100, (val / max) * 100);
            return (
              <div key={orb.key} className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl font-bold"
                          style={{ color: orb.color, fontVariationSettings: "'FILL' 1" }}>{orb.icon}</span>
                    <span className="font-headline font-bold text-primary">{orb.name}</span>
                  </div>
                  <span className="text-lg text-primary" style={{ fontFamily: 'Fredoka, sans-serif' }}>{val}/{max}</span>
                </div>
                <div className="h-5 w-full bg-surface-container-highest rounded-full overflow-hidden shadow-inner p-0.5">
                  <div className="h-full rounded-full transition-all duration-500 shadow-sm"
                       style={{ width: `${pct}%`, background: `linear-gradient(to right, ${orb.color}99, ${orb.color})` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Magical Satchel (Gear) ── */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="material-symbols-outlined text-xl" style={{ color: '#735c00', fontVariationSettings: "'FILL' 1" }}>backpack</span>
          <h3 className="font-headline font-bold text-lg text-primary"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>Magischer Rucksack</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {GEAR_SLOTS.map(slot => {
            const equippedId = gear[slot.key];
            const item = equippedId ? GEAR_ITEMS.find(g => g.id === equippedId) : null;
            return (
              <div key={slot.key}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                style={{
                  background: item ? '#ffffff' : '#f4ede6',
                  border: item ? '3px solid #fcd34d' : '3px solid #e8e1db',
                  boxShadow: item ? '0 4px 16px rgba(252,211,77,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                {item ? (
                  <>
                    {item.rarity === 'rare' && (
                      <div className="absolute -top-1.5 -right-1.5 bg-secondary-container rounded-full p-0.5 shadow-md">
                        <span className="material-symbols-outlined text-xs"
                              style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                         style={{ background: `${item.color}15` }}>
                      <span className="material-symbols-outlined text-2xl"
                            style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    </div>
                    <span className="font-headline text-[10px] font-bold uppercase tracking-widest text-primary text-center leading-tight px-1">
                      {item.name.split('-')[0].trim()}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary/25"
                            style={{ fontVariationSettings: "'FILL' 0" }}>{slot.icon}</span>
                    </div>
                    <span className="font-headline text-[10px] font-bold uppercase tracking-widest text-primary/35">{slot.label}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {gearInv.length === 0 && (
          <p className="text-center text-sm text-on-surface-variant mt-3 font-body">
            Schließe <button onClick={() => onNavigate?.('missions')} className="text-primary font-bold underline">Epische Missionen</button> ab, um Ausrüstung zu finden!
          </p>
        )}
      </section>

      {/* ── Trophäen & Abzeichen ── */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="material-symbols-outlined text-xl" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <h3 className="font-headline font-bold text-lg text-primary"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>Trophäen & Abzeichen</h3>
        </div>

        {/* Boss Trophies */}
        <div className="rounded-2xl p-5 mb-4"
             style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Besiegte Bosse</p>
          <div className="flex flex-wrap gap-3">
            {BOSSES.map(boss => {
              const defeated = (state.bossTrophies || []).includes(boss.id);
              return (
                <div key={boss.id}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all"
                  style={{
                    background: defeated ? 'rgba(252,211,77,0.15)' : 'rgba(0,0,0,0.04)',
                    border: defeated ? '2px solid #fcd34d' : '2px solid transparent',
                    opacity: defeated ? 1 : 0.35,
                    filter: defeated ? 'none' : 'grayscale(1)',
                  }}
                  title={boss.name}>
                  {boss.icon}
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-2xl p-5"
             style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Abzeichen</p>
          <div className="flex flex-wrap gap-3">
            {BADGES.map(badge => {
              const unlocked = (state.unlockedBadges || []).includes(badge.id);
              return (
                <div key={badge.id}
                  className="flex flex-col items-center gap-1 w-16"
                  style={{ opacity: unlocked ? 1 : 0.3, filter: unlocked ? 'none' : 'grayscale(1)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg"
                       style={{
                         background: unlocked ? 'rgba(252,211,77,0.15)' : 'rgba(0,0,0,0.04)',
                         border: unlocked ? '2px solid #fcd34d' : '2px solid transparent',
                       }}>
                    {badge.i}
                  </div>
                  <span className="font-label text-[9px] text-center text-on-surface-variant font-bold leading-tight">
                    {badge.n}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Thang Long Map (Teaser) ── */}
      <section className="mt-8">
        <div className="rounded-2xl p-6 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #124346, #2d5a5e)', border: '1.5px solid rgba(18,67,70,0.3)' }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl text-white font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>Thang Long Karte</h3>
              <div className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm">
                BALD VERFÜGBAR
              </div>
            </div>
            <p className="text-white/70 text-sm font-body leading-relaxed">
              Entdecke die Regionen von Thang Long! Besiege Bosse und schalte neue Gebiete frei.
            </p>
            {/* Mini map dots */}
            <div className="flex gap-3 mt-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: 'rgba(252,211,77,0.2)', border: '2px solid rgba(252,211,77,0.4)' }}>
                <span className="material-symbols-outlined text-sm text-secondary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-40"
                   style={{ background: 'rgba(255,255,255,0.1)', border: '2px dashed rgba(255,255,255,0.2)' }}>
                <span className="material-symbols-outlined text-sm text-white/40">lock</span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-30"
                   style={{ background: 'rgba(255,255,255,0.1)', border: '2px dashed rgba(255,255,255,0.2)' }}>
                <span className="material-symbols-outlined text-sm text-white/40">lock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero Codex ── */}
      <section className="mt-8 mb-4">
        <div className="rounded-2xl p-7 relative overflow-hidden"
             style={{ background: '#fff8f2', border: '2px dashed rgba(18,67,70,0.15)' }}>
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl"
               style={{ background: 'rgba(252,211,77,0.1)' }} />
          <div className="relative z-10 text-center space-y-4">
            <div className="w-10 h-0.5 bg-primary/10 mx-auto rounded-full" />
            <h3 className="text-xl text-primary" style={{ fontFamily: 'Fredoka, sans-serif' }}>Helden-Kodex</h3>
            <p className="text-primary/70 italic leading-relaxed font-body">
              "Ein wahrer Held von Thang Long hört auf die Bäume, hilft den kleinen Wesen und erledigt seine Morgen-Quest, bevor die Sonne den Gipfel erreicht!"
            </p>
            {state.familyConfig?.parentMessage?.body && (
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid rgba(18,67,70,0.05)' }}>
                <p className="font-label font-bold text-xs uppercase tracking-widest text-primary/35 mb-2">
                  {state.familyConfig.parentMessage.title || 'Nachricht von Mama & Papa'}
                </p>
                <p className="font-body text-primary font-bold">
                  "{state.familyConfig.parentMessage.body}"
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
