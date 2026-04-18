import React, { useState, useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { CREATURE_CONTENT, SEED_BY_ID, CHAPTERS } from '../data/creatures';
import ChapterAmbient from './ChapterAmbient';

/** Format an ISO discovery timestamp in the app's language. */
function formatDiscoveredDate(iso, lang) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const formatted = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return lang === 'de' ? `Entdeckt am ${formatted}` : `Discovered on ${formatted}`;
}

/**
 * Micropedia — creature collection grid (Freunde).
 * Chapters: Forest / Sky / Water / Dream / Hearth.
 */

const base = import.meta.env.BASE_URL;
const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function Micropedia({ onNavigate }) {
  const { lang } = useTranslation();
  const { state } = useTask();
  const [expandedChapter, setExpandedChapter] = useState('forest');
  const [selectedCreature, setSelectedCreature] = useState(null);

  // Enrich discovered IDs with seed data once per state change (O(n) via Map lookup)
  const { discovered, foundById } = useMemo(() => {
    const raw = state?.micropediaDiscovered || [];
    const enriched = [];
    const byId = new Map();
    for (const d of raw) {
      const seed = SEED_BY_ID.get(d.id);
      if (!seed) continue;
      const discoveredAtMs = d.discoveredAt ? new Date(d.discoveredAt).getTime() : 0;
      const entry = { ...seed, discoveredAt: d.discoveredAt, discoveredAtMs };
      enriched.push(entry);
      byId.set(seed.id, entry);
    }
    return { discovered: enriched, foundById: byId };
  }, [state?.micropediaDiscovered]);

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
            {lang === 'de' ? 'Ronkis Freunde' : "Ronki's Friends"}
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {lang === 'de' ? 'Entdecke neue Freunde!' : 'Discover new friends!'}
          </p>
          {/* Global counter */}
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full"
               style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)' }}>
            <span className="text-sm">🐾</span>
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
                        const found = foundById.get(creatureId);
                        const isNew = found && Date.now() - found.discoveredAtMs < NEW_WINDOW_MS;
                        return (
                          <div key={i} className="relative">
                            <button
                              onClick={() => found?.art && setSelectedCreature(found)}
                              className="w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center transition-all active:scale-95"
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
                            {isNew && (
                              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#f59e0b] text-white font-label font-bold text-[9px] tracking-wider pointer-events-none"
                                   style={{ animation: 'neuPulse 1.5s ease-in-out infinite' }}>
                                NEU
                              </div>
                            )}
                          </div>
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
        const content = CREATURE_CONTENT[selectedCreature.id];
        const discoveredLabel = formatDiscoveredDate(selectedCreature.discoveredAt, lang);
        const chapterColor = ch?.color || '#124346';
        return (
          <div className="fixed inset-0 z-[500] flex items-end justify-center overflow-y-auto"
               style={{ background: 'rgba(0,0,0,0.5)' }}
               onClick={() => setSelectedCreature(null)}>
            <div className="w-full max-w-lg bg-surface rounded-t-3xl overflow-hidden my-auto"
                 style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}
                 onClick={e => e.stopPropagation()}>
              {/* Portrait */}
              <div className="relative w-full aspect-square overflow-hidden"
                   style={{ background: ch?.bgGradient || '#fff8f2' }}>
                {/* Ambient overlay */}
                <ChapterAmbient chapter={selectedCreature.chapter} color={chapterColor} />
                {/* Breathing portrait */}
                {selectedCreature.art && (
                  <img src={base + selectedCreature.art} alt=""
                       className="relative w-full h-full object-cover"
                       style={{ animation: 'breathe 3s ease-in-out infinite' }} />
                )}
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none"
                     style={{ background: 'linear-gradient(to top, #fff8f2, transparent)' }} />
                {/* Close */}
                <button onClick={() => setSelectedCreature(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>

              {/* Info */}
              <div className="px-6 pb-8 -mt-8 relative z-10">
                {/* Chapter tag */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: chapterColor, fontVariationSettings: "'FILL' 1" }}>{ch?.icon || 'pets'}</span>
                  <span className="font-label font-bold text-xs uppercase tracking-widest"
                        style={{ color: chapterColor }}>
                    {ch?.nameKey[lang] || ch?.nameKey.de || ''}
                  </span>
                </div>

                {/* Name */}
                <h2 className="font-headline font-bold text-2xl text-on-surface mb-1"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  {selectedCreature.name?.[lang] || selectedCreature.name?.de || '???'}
                </h2>

                {/* Discovered date */}
                {discoveredLabel && (
                  <p className="font-label text-xs text-on-surface-variant/70 mb-3">
                    {discoveredLabel}
                  </p>
                )}

                {/* Original flavor text (kept as secondary) */}
                {selectedCreature.flavor?.[lang] && (
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed italic mb-4">
                    {selectedCreature.flavor[lang]}
                  </p>
                )}

                {/* Ronki's note (quote) */}
                {content?.ronkiNote && (
                  <div className="rounded-xl p-4 mb-4"
                       style={{ background: `${chapterColor}10`, borderLeft: `3px solid ${chapterColor}` }}>
                    <div className="flex items-start gap-2">
                      <span className="text-base leading-none mt-0.5">💬</span>
                      <p className="font-body text-sm text-on-surface leading-relaxed italic flex-1">
                        {content.ronkiNote}
                      </p>
                    </div>
                  </div>
                )}

                {/* How we met */}
                {content?.howMet && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">📖</span>
                      <h3 className="font-label font-bold text-xs uppercase tracking-wider text-on-surface">
                        {lang === 'de' ? 'Wie wir uns trafen' : 'How we met'}
                      </h3>
                    </div>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                      {content.howMet}
                    </p>
                  </div>
                )}

                {/* Favorite place + food row */}
                {(content?.favoritePlace || content?.favoriteFood) && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {content?.favoritePlace && (
                      <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.03)' }}>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm">🏠</span>
                          <h4 className="font-label font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {lang === 'de' ? 'Lieblingsort' : 'Favorite place'}
                          </h4>
                        </div>
                        <p className="font-body text-xs text-on-surface leading-snug">
                          {content.favoritePlace}
                        </p>
                      </div>
                    )}
                    {content?.favoriteFood && (
                      <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.03)' }}>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm">🍯</span>
                          <h4 className="font-label font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {lang === 'de' ? 'Lieblingsessen' : 'Favorite food'}
                          </h4>
                        </div>
                        <p className="font-body text-xs text-on-surface leading-snug">
                          {content.favoriteFood}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fun facts */}
                {content?.funFacts && content.funFacts.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">✨</span>
                      <h3 className="font-label font-bold text-xs uppercase tracking-wider text-on-surface">
                        {lang === 'de' ? 'Wusstest du schon?' : 'Did you know?'}
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {content.funFacts.map((fact, i) => (
                        <li key={i} className="font-body text-sm text-on-surface-variant leading-relaxed flex gap-2">
                          <span style={{ color: chapterColor }}>•</span>
                          <span className="flex-1">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Likes + dislikes */}
                {(content?.likes?.length || content?.dislikes?.length) && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {content?.likes?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm">❤️</span>
                          <h4 className="font-label font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {lang === 'de' ? 'Mag' : 'Likes'}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {content.likes.map((like, i) => (
                            <span key={i}
                              className="font-label text-[11px] px-2 py-0.5 rounded-full"
                              style={{
                                background: `${chapterColor}15`,
                                color: chapterColor,
                                border: `1px solid ${chapterColor}30`,
                              }}>
                              {like}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {content?.dislikes?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm">🚫</span>
                          <h4 className="font-label font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
                            {lang === 'de' ? 'Mag nicht' : 'Dislikes'}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {content.dislikes.map((d, i) => (
                            <span key={i}
                              className="font-label text-[11px] px-2 py-0.5 rounded-full"
                              style={{
                                background: 'rgba(0,0,0,0.04)',
                                color: 'rgba(0,0,0,0.55)',
                                border: '1px solid rgba(0,0,0,0.08)',
                              }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Secret (muted italic) */}
                {content?.secret && (
                  <div className="mt-4 pt-4"
                       style={{ borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                    <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed italic flex gap-1.5">
                      <span>🤫</span>
                      <span className="flex-1">{content.secret}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Animation keyframes */}
      <style>{`
        @keyframes neuPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }
      `}</style>
    </div>
  );
}
