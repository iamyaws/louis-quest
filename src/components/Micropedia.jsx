import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * Micropedia — creature collection grid, patterned on Finch's bestiary.
 *
 * Phase 1 (skeleton): chapter headers + silhouette placeholders.
 * Phase 2: actual creature data tied to arc discoveries, painted portraits.
 *
 * Chapters: Forest / Sky / Water / Dream / Hearth
 * Each chapter holds ~12 creatures. Grid shows silhouettes until discovered.
 */

const base = import.meta.env.BASE_URL;

// ── Seed creatures (Phase 1: static data; Phase 2: arc-discovery driven) ──
const SEED_CREATURES = [
  { id: 'forest_0', chapter: 'forest', name: { de: 'Glutfunke', en: 'Emberspark' }, art: 'art/micropedia/creatures/creature-1.webp', flavor: { de: 'Gefunden am ersten Tag im Wald.', en: 'Found on the first day in the forest.' } },
  { id: 'forest_1', chapter: 'forest', name: { de: 'Moostänzer', en: 'Mossdancer' }, art: 'art/micropedia/creatures/creature-2.webp', flavor: { de: 'Tanzt zwischen den Farnen, wenn niemand hinsieht.', en: 'Dances between the ferns when nobody looks.' } },
  { id: 'forest_2', chapter: 'forest', name: { de: 'Knorrbart', en: 'Gnarlfang' }, art: 'art/micropedia/creatures/creature-3.webp', flavor: { de: 'Sieht grimmig aus, ist aber ganz sanft.', en: 'Looks fierce, but is quite gentle.' } },
  { id: 'forest_3', chapter: 'forest', name: { de: 'Rotling', en: 'Redling' }, art: 'art/micropedia/creatures/creature-6.webp', flavor: { de: 'Versteckt sich unter Pilzen.', en: 'Hides under mushrooms.' } },
  { id: 'dream_0', chapter: 'dream', name: { de: 'Lichtflüstern', en: 'Glowwhisper' }, art: 'art/micropedia/creatures/creature-4.webp', flavor: { de: 'Erscheint nur im Mondlicht.', en: 'Appears only in moonlight.' } },
  { id: 'dream_1', chapter: 'dream', name: { de: 'Nachtflügel', en: 'Nightwing' }, art: 'art/micropedia/creatures/creature-9.webp', flavor: { de: 'Fliegt durch die Träume mutiger Kinder.', en: 'Flies through the dreams of brave children.' } },
  { id: 'dream_2', chapter: 'dream', name: { de: 'Sternenschatten', en: 'Starshadow' }, art: 'art/micropedia/creatures/creature-10.webp', flavor: { de: 'Vom Sternenmeer hierher gereist.', en: 'Traveled here from the sea of stars.' } },
  { id: 'hearth_0', chapter: 'hearth', name: { de: 'Goldauge', en: 'Goldeye' }, art: 'art/micropedia/creatures/creature-7.webp', flavor: { de: 'Sitzt am liebsten am warmen Kamin.', en: 'Loves sitting by the warm fireplace.' } },
  { id: 'sky_0', chapter: 'sky', name: { de: 'Sturmflügel', en: 'Stormwing' }, art: 'art/micropedia/creatures/creature-8.webp', flavor: { de: 'Reitet auf Gewitterwolken.', en: 'Rides on thunderclouds.' } },
];

// ── Chapter definitions ──
const CHAPTERS = [
  {
    id: 'forest',
    nameKey: { de: 'Wald', en: 'Forest' },
    icon: 'forest',
    color: '#059669',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    border: 'rgba(5,150,105,0.2)',
    headerArt: 'art/micropedia/chapter-forest.webp',
    creatureCount: 12,
  },
  {
    id: 'sky',
    nameKey: { de: 'Himmel', en: 'Sky' },
    icon: 'cloud',
    color: '#0ea5e9',
    bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: 'rgba(14,165,233,0.2)',
    headerArt: 'art/micropedia/chapter-sky.webp',
    creatureCount: 12,
  },
  {
    id: 'water',
    nameKey: { de: 'Wasser', en: 'Water' },
    icon: 'water_drop',
    color: '#0891b2',
    bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
    border: 'rgba(8,145,178,0.2)',
    headerArt: 'art/micropedia/chapter-water.webp',
    creatureCount: 12,
  },
  {
    id: 'dream',
    nameKey: { de: 'Traum', en: 'Dream' },
    icon: 'nights_stay',
    color: '#7c3aed',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    border: 'rgba(124,58,237,0.2)',
    headerArt: 'art/micropedia/chapter-dream.webp',
    creatureCount: 12,
  },
  {
    id: 'hearth',
    nameKey: { de: 'Zuhause', en: 'Hearth' },
    icon: 'fireplace',
    color: '#d97706',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: 'rgba(217,119,6,0.2)',
    headerArt: 'art/micropedia/chapter-hearth.webp',
    creatureCount: 12,
  },
];

export default function Micropedia({ onNavigate }) {
  const { lang } = useTranslation();
  const { state } = useTask();
  const [expandedChapter, setExpandedChapter] = useState('forest');
  const [selectedCreature, setSelectedCreature] = useState(null);

  // Merge seed creatures (always visible in Phase 1) with future arc discoveries
  const dynamicDiscovered = state?.micropediaDiscovered || [];
  const discovered = [...SEED_CREATURES, ...dynamicDiscovered.filter(d => !SEED_CREATURES.find(s => s.id === d.id))];
  const totalCreatures = CHAPTERS.reduce((sum, ch) => sum + ch.creatureCount, 0);
  const totalFound = discovered.length;

  return (
    <div className="relative min-h-dvh pb-32">
      {/* Background */}
      <div className="fixed inset-0 -z-20" style={{ background: '#fff8f2' }} />
      <img src={base + 'art/bg-cream-brush.webp'} alt=""
           className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none -z-10" />

      <main className="px-5 max-w-lg mx-auto"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>

        {/* Back button */}
        <button onClick={() => onNavigate?.('ronki')}
          className="flex items-center gap-1.5 mb-5 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-lg text-primary">arrow_back</span>
          <span className="font-label font-bold text-sm text-primary">Ronki</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-headline font-bold text-2xl text-on-surface"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Micropedia
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {lang === 'de' ? 'Kreaturen-Sammlung' : 'Creature Collection'}
          </p>
          {/* Global counter */}
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full"
               style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)' }}>
            <span className="material-symbols-outlined text-sm" style={{ color: '#b45309', fontVariationSettings: "'FILL' 1" }}>catching_pokemon</span>
            <span className="font-label font-bold text-sm" style={{ color: '#92400e' }}>
              {totalFound} / {totalCreatures}
            </span>
          </div>
        </div>

        {/* Chapter accordion */}
        <div className="flex flex-col gap-4">
          {CHAPTERS.map(chapter => {
            const isOpen = expandedChapter === chapter.id;
            const chapterDiscovered = discovered.filter(d => d.chapter === chapter.id);
            const count = chapterDiscovered.length;
            const name = chapter.nameKey[lang] || chapter.nameKey.de;

            return (
              <div key={chapter.id} className="rounded-2xl overflow-hidden transition-all"
                   style={{
                     background: isOpen ? chapter.bgGradient : '#ffffff',
                     border: `1.5px solid ${isOpen ? chapter.border : 'rgba(0,0,0,0.08)'}`,
                     boxShadow: isOpen ? `0 4px 16px ${chapter.color}12` : '0 2px 8px rgba(0,0,0,0.04)',
                   }}>
                {/* Chapter header — always visible */}
                <button onClick={() => setExpandedChapter(isOpen ? null : chapter.id)}
                  className="w-full flex items-center gap-4 p-4 text-left transition-all">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all"
                       style={{ background: isOpen ? chapter.color : `${chapter.color}12` }}>
                    <span className="material-symbols-outlined text-xl transition-colors"
                          style={{ color: isOpen ? '#ffffff' : chapter.color, fontVariationSettings: "'FILL' 1" }}>
                      {chapter.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-base text-on-surface">{name}</h3>
                    <p className="font-label text-xs text-on-surface-variant">
                      {count}/{chapter.creatureCount} {lang === 'de' ? 'entdeckt' : 'found'}
                    </p>
                  </div>
                  {/* Progress ring */}
                  <div className="relative w-10 h-10 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                      <circle cx="20" cy="20" r="16" fill="none"
                              stroke={count > 0 ? chapter.color : 'rgba(0,0,0,0.06)'}
                              strokeWidth="3" strokeLinecap="round"
                              strokeDasharray="100.5"
                              strokeDashoffset={100.5 - (count / chapter.creatureCount) * 100.5} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-label font-bold text-xs"
                          style={{ color: count > 0 ? chapter.color : '#c0c8c9' }}>
                      {count}
                    </span>
                  </div>
                </button>

                {/* Expanded grid */}
                {isOpen && (
                  <div className="px-4 pb-4">
                    {/* Chapter art banner (placeholder if art doesn't exist yet) */}
                    <div className="w-full h-24 rounded-xl mb-4 overflow-hidden relative"
                         style={{ background: `${chapter.color}10`, border: `1px solid ${chapter.border}` }}>
                      <img src={base + chapter.headerArt} alt=""
                           className="w-full h-full object-cover"
                           onError={e => { e.target.style.display = 'none'; }} />
                      {/* Fallback gradient if art missing */}
                      <div className="absolute inset-0 flex items-center justify-center"
                           style={{ background: `linear-gradient(135deg, ${chapter.color}15, ${chapter.color}05)` }}>
                        <span className="material-symbols-outlined"
                              style={{ fontSize: 48, color: `${chapter.color}25`, fontVariationSettings: "'FILL' 1" }}>
                          {chapter.icon}
                        </span>
                      </div>
                    </div>

                    {/* Creature grid — 3 columns for larger portraits */}
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: chapter.creatureCount }, (_, i) => {
                        const creatureId = `${chapter.id}_${i}`;
                        const found = chapterDiscovered.find(d => d.id === creatureId);
                        return (
                          <button key={i}
                            onClick={() => found?.art && setSelectedCreature(found)}
                            className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center transition-all active:scale-95"
                            style={{
                              background: found?.art ? 'transparent' : found ? `${chapter.color}12` : `${chapter.color}04`,
                              border: found?.art ? `2px solid ${chapter.color}30` : found ? `1.5px solid ${chapter.color}30` : `1.5px dashed ${chapter.color}12`,
                              boxShadow: found?.art ? `0 4px 12px ${chapter.color}15` : 'none',
                            }}>
                            {found?.art ? (
                              <img src={base + found.art} alt={found.name?.[lang] || ''} className="w-full h-full object-cover" />
                            ) : found ? (
                              <span className="material-symbols-outlined text-xl"
                                    style={{ color: chapter.color, fontVariationSettings: "'FILL' 1" }}>
                                pets
                              </span>
                            ) : (
                              /* Undiscovered — creature silhouette with soft pulse */
                              <div className="flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined"
                                      style={{ fontSize: 28, color: `${chapter.color}18`, fontVariationSettings: "'FILL' 1" }}>
                                  {['pets', 'bug_report', 'flutter_dash', 'cruelty_free'][i % 4]}
                                </span>
                                <span className="font-label font-bold" style={{ fontSize: 8, color: `${chapter.color}25`, letterSpacing: '0.1em' }}>???</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Chapter hint */}
                    {count === 0 && (
                      <p className="font-body text-xs text-on-surface-variant italic text-center mt-3">
                        {lang === 'de'
                          ? 'Bestehe Abenteuer, um Kreaturen in diesem Kapitel zu entdecken.'
                          : 'Complete adventures to discover creatures in this chapter.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center font-body text-xs text-on-surface-variant/40 mt-8 mb-4 italic">
          {lang === 'de'
            ? 'Neue Kreaturen erscheinen nach jedem Abenteuer.'
            : 'New creatures appear after each adventure.'}
        </p>

      </main>

      {/* ═══ Creature Detail Modal ═══ */}
      {selectedCreature && (() => {
        const ch = CHAPTERS.find(c => c.id === selectedCreature.chapter);
        return (
          <div className="fixed inset-0 z-[500] flex items-end justify-center"
               style={{ background: 'rgba(0,0,0,0.5)' }}
               onClick={() => setSelectedCreature(null)}>
            <div className="w-full max-w-lg bg-surface rounded-t-3xl overflow-hidden"
                 style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}
                 onClick={e => e.stopPropagation()}>
              {/* Portrait */}
              <div className="relative w-full aspect-square">
                {selectedCreature.art && (
                  <img src={base + selectedCreature.art} alt="" className="w-full h-full object-cover" />
                )}
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-1/3"
                     style={{ background: 'linear-gradient(to top, #fff8f2, transparent)' }} />
                {/* Close */}
                <button onClick={() => setSelectedCreature(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>
              {/* Info */}
              <div className="px-6 pb-8 -mt-8 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: ch?.color || '#124346', fontVariationSettings: "'FILL' 1" }}>{ch?.icon || 'pets'}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest"
                        style={{ color: ch?.color || '#124346' }}>
                    {ch?.nameKey[lang] || ch?.nameKey.de || ''}
                  </span>
                </div>
                <h2 className="font-headline font-bold text-2xl text-on-surface mb-2"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  {selectedCreature.name?.[lang] || selectedCreature.name?.de || '???'}
                </h2>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed italic">
                  {selectedCreature.flavor?.[lang] || selectedCreature.flavor?.de || ''}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
