import React, { useState, useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { getCatStage, getDragonArt } from '../utils/helpers';
import { ARCS, findArc } from '../arcs/arcs';
import { Pearl } from './CurrencyIcons';
import { SEED_BY_ID, SEED_CREATURES } from '../data/creatures';

/**
 * Companion Profile — patterned on Finch's Piper page.
 * Header: portrait + name + stage pill
 * Tabs: About / Details / Traits
 * Memory card: last arc completed
 * Quick links: Ronkis Freunde + Discovery Log (both Phase 2)
 */

const STAGE_NAMES_DE = ['Ei', 'Baby', 'Jungtier', 'Stolz', 'Legendär'];
const STAGE_NAMES_EN = ['Egg', 'Baby', 'Juvenile', 'Proud', 'Legendary'];
const STAGE_COLORS = ['#94a3b8', '#34d399', '#0ea5e9', '#f59e0b', '#a855f7'];

// Fun facts about Ronki — data from the old CompanionProfile
const FACTS = {
  species: { de: 'Rồng (Drache)', en: 'Rồng (Dragon)' },
  likes: { de: 'Feuer, Flüge, Abenteuer', en: 'Fire, flights, adventures' },
  dislikes: { de: 'Kälte, Langeweile', en: 'Cold weather, boredom' },
  talent: { de: 'Kann kleine Flammen pusten', en: 'Can blow tiny flames' },
  motto: { de: 'Mut ist stärker als Feuer!', en: 'Courage is stronger than fire!' },
  heights: ['20 cm', '45 cm', '80 cm', '1.2 m', '2 m'],
  weights: ['1 kg', '5 kg', '15 kg', '40 kg', '100 kg'],
};

// Trait seeds — Phase 2 will earn these from arcs. For now, derive from milestones.
const TRAIT_POOL = [
  { id: 'brave', label: { de: 'Mutig', en: 'Brave' }, icon: 'shield', color: '#f59e0b', when: (s) => (s.arcEngine?.completedArcIds?.length || 0) >= 1 },
  { id: 'gentle', label: { de: 'Sanftmütig', en: 'Gentle' }, icon: 'favorite', color: '#f472b6', when: (s) => (s.catEvo || 0) >= 3 },
  { id: 'curious', label: { de: 'Neugierig', en: 'Curious' }, icon: 'explore', color: '#0ea5e9', when: (s) => true },
  { id: 'loyal', label: { de: 'Treu', en: 'Loyal' }, icon: 'handshake', color: '#34d399', when: (s) => (s.totalTaskDays || 0) >= 3 },
  { id: 'dreamer', label: { de: 'Träumer', en: 'Dreamer' }, icon: 'auto_awesome', color: '#a855f7', when: (s) => (s.journalHistory?.length || 0) >= 3 },
  { id: 'mapmaker', label: { de: 'Kartenmacher', en: 'Mapmaker' }, icon: 'map', color: '#fb923c', when: (s) => (s.arcEngine?.completedArcIds || []).includes('first-adventure') },
];

const base = import.meta.env.BASE_URL;

export default function RonkiProfile({ onNavigate }) {
  const { t, lang } = useTranslation();
  const { state } = useTask();
  const [tab, setTab] = useState('about');

  if (!state) return null;

  const evo = state.catEvo || 0;
  const stage = getCatStage(evo);
  const artFile = getDragonArt(stage);
  const stageName = (lang === 'en' ? STAGE_NAMES_EN : STAGE_NAMES_DE)[stage];
  const stageColor = STAGE_COLORS[stage];
  const daysTogether = state.totalTaskDays || 0;
  const heroName = state.familyConfig?.heroName || 'Louis';
  // Freund arcs don't count as "complete" until the delayed callback (beat 4)
  // has fired. Until then, they live in engine.completedArcIds but not in
  // freundArcsCompleted — so we filter them out here to avoid spoiling the
  // delayed-return moment in the profile.
  const freundArcsDone = state.freundArcsCompleted || [];
  const completedArcs = (state.arcEngine?.completedArcIds || []).filter(arcId => {
    const arc = findArc(arcId);
    if (arc?.freundId) return freundArcsDone.includes(arcId);
    return true;
  });
  const stateTraits = state.earnedTraits || [];
  // Combine: traits granted by arcs (state) + milestone-inferred (legacy visual feedback)
  const earnedTraits = TRAIT_POOL.filter(tr => stateTraits.includes(tr.id) || tr.when(state));

  // Next evo threshold
  const THRESHOLDS = [0, 3, 9, 18, 30];
  const nextThreshold = THRESHOLDS[stage + 1];
  const evoPct = nextThreshold ? Math.min(100, ((evo - THRESHOLDS[stage]) / (nextThreshold - THRESHOLDS[stage])) * 100) : 100;

  // Freunde preview — last 4 discoveries, enriched from seeds.
  // Denominator = SEED_CREATURES.length (what Louis can actually find today),
  // not the 60-slot grid ceiling which is aspirational.
  const { recentFreunde, totalFound, totalCreatures } = useMemo(() => {
    const raw = state.micropediaDiscovered || [];
    const sorted = [...raw]
      .sort((a, b) => {
        const ta = a.discoveredAt ? new Date(a.discoveredAt).getTime() : 0;
        const tb = b.discoveredAt ? new Date(b.discoveredAt).getTime() : 0;
        return tb - ta;
      });
    const recent = sorted
      .slice(0, 4)
      .map(d => SEED_BY_ID.get(d.id))
      .filter(Boolean);
    return { recentFreunde: recent, totalFound: raw.length, totalCreatures: SEED_CREATURES.length };
  }, [state.micropediaDiscovered]);

  return (
    <div className="relative min-h-dvh pb-32">
      {/* Cream base */}
      <div className="fixed inset-0 -z-20" style={{ background: '#fff8f2' }} />
      <img src={base + 'art/bg-cream-brush.webp'} alt="" className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none -z-10" />

      <main className="px-5 max-w-lg mx-auto"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Dragon portrait with glow ring */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30"
                 style={{ background: stageColor, transform: 'scale(1.3)' }} />
            <div className="relative w-36 h-36 rounded-full overflow-hidden"
                 style={{ border: `3px solid ${stageColor}`, boxShadow: `0 8px 32px ${stageColor}40` }}>
              <img src={`${base}art/companion/${artFile}.webp`} alt="Ronki"
                   className="w-full h-full object-cover" />
            </div>
            {/* Stage badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-label font-bold text-xs uppercase tracking-widest text-white"
                 style={{ background: stageColor, boxShadow: `0 2px 8px ${stageColor}50` }}>
              {stageName}
            </div>
          </div>

          {/* Name */}
          <h1 className="font-headline font-bold text-3xl text-on-surface mt-2"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Ronki
          </h1>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            {lang === 'de' ? 'Mystischer Begleiter' : 'Mystical Companion'}
          </p>
        </div>

        {/* ═══ FREUNDE HERO CARD ═══ */}
        <button
          onClick={() => onNavigate?.('micropedia')}
          className="w-full rounded-2xl p-4 mb-5 active:scale-[0.98] transition-transform text-left"
          style={{
            background: 'linear-gradient(135deg, #fff8f2 0%, #fef3c7 100%)',
            border: '1.5px solid rgba(252,211,77,0.3)',
            boxShadow: '0 4px 16px rgba(252,211,77,0.15)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-2xl"
                  style={{ color: '#92400e', fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-bold text-base text-on-surface">
                {lang === 'de' ? 'Ronkis Freunde' : "Ronki's Friends"}
              </h3>
              <p className="font-label text-xs text-on-surface-variant">
                {totalFound} / {totalCreatures} {lang === 'de' ? 'entdeckt' : 'found'}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>
          {recentFreunde.length > 0 && (
            <div className="flex gap-2 mt-1">
              {recentFreunde.slice(0, 4).map(f => (
                <div key={f.id}
                     className="w-12 h-12 rounded-xl overflow-hidden"
                     style={{ border: '2px solid rgba(255,255,255,0.6)' }}>
                  {f.art ? (
                    <img src={base + f.art} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                         style={{ background: 'rgba(252,211,77,0.18)' }}>
                      <span className="material-symbols-outlined text-base"
                            style={{ color: '#92400e', fontVariationSettings: "'FILL' 1" }}>
                        pets
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </button>

        {/* ═══ TAB BAR ═══ */}
        <div className="flex gap-1 p-1 rounded-full mb-6"
             style={{ background: 'rgba(18,67,70,0.06)' }}>
          {[
            { id: 'about', label: lang === 'de' ? 'Über' : 'About', icon: 'info' },
            { id: 'details', label: 'Details', icon: 'analytics' },
            { id: 'traits', label: lang === 'de' ? 'Wesen' : 'Traits', icon: 'psychology' },
          ].map(tb => (
            <button key={tb.id}
              onClick={() => setTab(tb.id)}
              className="flex-1 py-2.5 rounded-full font-label font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: tab === tb.id ? '#ffffff' : 'transparent',
                color: tab === tb.id ? '#124346' : '#707979',
                boxShadow: tab === tb.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}>
              <span className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: tab === tb.id ? "'FILL' 1" : undefined }}>
                {tb.icon}
              </span>
              {tb.label}
            </button>
          ))}
        </div>

        {/* ═══ ABOUT TAB ═══ */}
        {tab === 'about' && (
          <div className="flex flex-col gap-5">
            {/* Bio card */}
            <div className="rounded-2xl p-5"
                 style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p className="font-body text-sm text-on-surface leading-relaxed italic"
                 style={{ color: '#4a4458' }}>
                {completedArcs.length > 0
                  ? (lang === 'de'
                    ? `Ronki schlüpfte am Tag, als ${heroName} sein erstes Abenteuer begann. Seitdem haben die beiden ${completedArcs.length} Abenteuer bestanden und ${daysTogether} Tage Seite an Seite verbracht. ${FACTS.motto.de}`
                    : `Ronki hatched on the day ${heroName} started their first adventure. Since then, they've survived ${completedArcs.length} adventure${completedArcs.length !== 1 ? 's' : ''} and spent ${daysTogether} days side by side. ${FACTS.motto.en}`)
                  : (lang === 'de'
                    ? `Ronki ist gerade erst geschlüpft und wartet auf das erste gemeinsame Abenteuer mit ${heroName}. ${FACTS.motto.de}`
                    : `Ronki just hatched and is waiting for their first adventure with ${heroName}. ${FACTS.motto.en}`)
                }
              </p>
            </div>

            {/* Fun facts grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: lang === 'de' ? 'Spezies' : 'Species', value: FACTS.species[lang] || FACTS.species.de, emoji: '🐲' },
                { label: lang === 'de' ? 'Größe' : 'Height', value: FACTS.heights[stage], emoji: '📏' },
                { label: lang === 'de' ? 'Mag' : 'Likes', value: FACTS.likes[lang] || FACTS.likes.de, emoji: '❤️' },
                { label: lang === 'de' ? 'Talent' : 'Talent', value: FACTS.talent[lang] || FACTS.talent.de, emoji: '⭐' },
              ].map((fact, i) => (
                <div key={i} className="rounded-xl px-4 py-3"
                     style={{ background: 'rgba(18,67,70,0.03)', border: '1px solid rgba(18,67,70,0.06)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm leading-none">{fact.emoji}</span>
                    <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-wider">{fact.label}</span>
                  </div>
                  <p className="font-headline font-bold text-sm text-on-surface leading-tight">{fact.value}</p>
                </div>
              ))}
            </div>

            {/* Memory card — game-card style */}
            <button className="w-full rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-all"
                 style={{ background: 'linear-gradient(160deg, #fef9c3 0%, #fde047 50%, #eab308 100%)' }}
                 onClick={() => onNavigate?.('discovery')}>
              <span className="text-4xl select-none shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>📖</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline font-bold text-lg" style={{ color: '#713f12' }}>
                  {completedArcs.length > 0 ? (() => {
                    const arc = findArc(completedArcs[completedArcs.length - 1]);
                    return arc ? t(arc.titleKey) : (lang === 'de' ? 'Abenteuer' : 'Adventure');
                  })() : (lang === 'de' ? 'Abenteuer-Chronik' : 'Discovery Log')}
                </h3>
                <p className="font-body text-sm mt-0.5" style={{ color: '#713f1299' }}>
                  {completedArcs.length > 0
                    ? `${completedArcs.length} ${lang === 'de' ? 'Abenteuer bestanden' : 'adventures survived'}`
                    : (lang === 'de' ? 'Deine Geschichte beginnt bald!' : 'Your story begins soon!')}
                </p>
              </div>
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: '#ffffff', border: '2.5px solid rgba(113,63,18,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <span className="material-symbols-outlined text-xl" style={{ color: '#713f12', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
              </div>
            </button>
          </div>
        )}

        {/* ═══ DETAILS TAB ═══ */}
        {tab === 'details' && (
          <div className="flex flex-col gap-5">
            {/* Evolution progress */}
            <div className="rounded-2xl p-5"
                 style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>upgrade</span>
                  <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest">
                    {lang === 'de' ? 'Entwicklung' : 'Evolution'}
                  </span>
                </div>
                <span className="font-label font-bold text-sm" style={{ color: stageColor }}>{stageName}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(18,67,70,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${evoPct}%`, background: `linear-gradient(90deg, ${stageColor}, ${stageColor}cc)` }} />
              </div>
              <p className="font-label text-xs text-on-surface-variant">
                {nextThreshold
                  ? `${evo} / ${nextThreshold} ${lang === 'de' ? 'Pflege-Punkte' : 'care points'}`
                  : (lang === 'de' ? 'Maximale Entwicklung erreicht!' : 'Max evolution reached!')}
              </p>
              {nextThreshold && (
                <p className="font-label text-xs mt-1" style={{ color: stageColor }}>
                  {lang === 'de'
                    ? `Noch ${nextThreshold - evo} bis ${(lang === 'en' ? STAGE_NAMES_EN : STAGE_NAMES_DE)[stage + 1]}`
                    : `${nextThreshold - evo} more to ${STAGE_NAMES_EN[stage + 1]}`}
                </p>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: lang === 'de' ? 'Tage zusammen' : 'Days together', value: daysTogether, icon: 'calendar_month', color: '#124346' },
                { label: 'HP', value: state.hp || 0, icon: 'diamond', color: '#f59e0b' },
                { label: lang === 'de' ? 'Abenteuer' : 'Adventures', value: completedArcs.length, icon: 'auto_stories', color: '#6d28d9' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4 text-center"
                     style={{ background: `${stat.color}08`, border: `1.5px solid ${stat.color}18` }}>
                  <span className="material-symbols-outlined text-xl block mb-1"
                        style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  <p className="font-headline font-bold text-2xl" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="font-label text-xs text-on-surface-variant mt-0.5 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Today's care */}
            <div className="rounded-2xl p-5"
                 style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest">
                  {lang === 'de' ? 'Pflege heute' : 'Care today'}
                </span>
              </div>
              <div className="flex justify-around">
                {[
                  { label: lang === 'de' ? 'Füttern' : 'Feed', done: state.catFed, icon: 'cookie', color: '#f59e0b' },
                  { label: lang === 'de' ? 'Streicheln' : 'Pet', done: state.catPetted, icon: 'favorite', color: '#f472b6' },
                  { label: lang === 'de' ? 'Spielen' : 'Play', done: state.catPlayed, icon: 'sports_baseball', color: '#0ea5e9' },
                ].map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                         style={{
                           background: c.done ? `${c.color}15` : 'rgba(0,0,0,0.04)',
                           border: c.done ? `2px solid ${c.color}40` : '2px solid rgba(0,0,0,0.08)',
                         }}>
                      <span className="material-symbols-outlined text-2xl"
                            style={{ color: c.done ? c.color : '#c0c8c9', fontVariationSettings: "'FILL' 1" }}>
                        {c.done ? 'check_circle' : c.icon}
                      </span>
                    </div>
                    <span className="font-label text-xs font-bold uppercase tracking-wider"
                          style={{ color: c.done ? c.color : '#707979' }}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight & height */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 text-center"
                   style={{ background: 'rgba(18,67,70,0.03)', border: '1px solid rgba(18,67,70,0.06)' }}>
                <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest block mb-1">
                  {lang === 'de' ? 'Gewicht' : 'Weight'}
                </span>
                <span className="font-headline font-bold text-xl text-on-surface">{FACTS.weights[stage]}</span>
              </div>
              <div className="rounded-xl p-4 text-center"
                   style={{ background: 'rgba(18,67,70,0.03)', border: '1px solid rgba(18,67,70,0.06)' }}>
                <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest block mb-1">
                  {lang === 'de' ? 'Größe' : 'Height'}
                </span>
                <span className="font-headline font-bold text-xl text-on-surface">{FACTS.heights[stage]}</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TRAITS TAB ═══ */}
        {tab === 'traits' && (
          <div className="flex flex-col gap-5">
            {/* Earned traits */}
            <div className="rounded-2xl p-5"
                 style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest">
                  {lang === 'de' ? 'Ronkis Wesen' : "Ronki's Traits"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {earnedTraits.map(tr => (
                  <div key={tr.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full"
                    style={{ background: `${tr.color}12`, border: `1.5px solid ${tr.color}30` }}>
                    <span className="material-symbols-outlined text-base"
                          style={{ color: tr.color, fontVariationSettings: "'FILL' 1" }}>{tr.icon}</span>
                    <span className="font-label font-bold text-sm" style={{ color: tr.color }}>
                      {tr.label[lang] || tr.label.de}
                    </span>
                  </div>
                ))}
              </div>
              <p className="font-body text-xs text-on-surface-variant mt-4 italic leading-relaxed">
                {lang === 'de'
                  ? 'Ronki entdeckt neue Wesenszüge bei jedem Abenteuer.'
                  : 'Ronki discovers new traits with every adventure.'}
              </p>
            </div>

            {/* Locked traits preview */}
            <div className="rounded-2xl p-5"
                 style={{ background: 'rgba(18,67,70,0.03)', border: '1.5px dashed rgba(18,67,70,0.12)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest">
                  {lang === 'de' ? 'Noch zu entdecken' : 'Yet to discover'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRAIT_POOL.filter(tr => !tr.when(state)).map(tr => (
                  <div key={tr.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
                    <span className="material-symbols-outlined text-base text-on-surface-variant/40">help</span>
                    <span className="font-label font-bold text-sm text-on-surface-variant/40">???</span>
                  </div>
                ))}
                {TRAIT_POOL.filter(tr => !tr.when(state)).length === 0 && (
                  <p className="font-body text-sm text-on-surface-variant italic">
                    {lang === 'de' ? 'Alle Wesenszüge entdeckt!' : 'All traits discovered!'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ MOTTO ═══ */}
        <div className="flex justify-center mt-8 mb-4">
          <p className="font-body text-sm text-on-surface-variant/50 italic text-center max-w-xs">
            „{FACTS.motto[lang] || FACTS.motto.de}"
          </p>
        </div>

      </main>
    </div>
  );
}
