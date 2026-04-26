import React from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { findArc } from '../arcs/arcs';

/**
 * Discovery Log — chronological timeline of arcs survived.
 * A story of the relationship between Louis and Ronki.
 *
 * Data source: state.arcEngine.completedArcIds[]
 * Each completed arc becomes a timeline entry with title, chapter, and beat summary.
 */

const base = import.meta.env.BASE_URL;

export default function DiscoveryLog({ onNavigate }) {
  const { t, lang } = useTranslation();
  const { state } = useTask();

  if (!state) return null;

  const completedArcs = state.arcEngine?.completedArcIds || [];
  const heroName = (state.familyConfig?.childName || '').trim();

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
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
               style={{ background: 'rgba(18,67,70,0.06)' }}>
            <span className="material-symbols-outlined text-2xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}>timeline</span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-on-surface"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {lang === 'de' ? 'Abenteuer-Chronik' : 'Discovery Log'}
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {heroName
              ? (lang === 'de'
                  ? `Die Geschichte von ${heroName} & Ronki`
                  : `The story of ${heroName} & Ronki`)
              : (lang === 'de'
                  ? 'Deine Abenteuer mit Ronki'
                  : 'Your adventures with Ronki')}
          </p>
        </div>

        {/* Timeline */}
        {completedArcs.length > 0 ? (
          <div className="relative pl-8">
            {/* Vertical timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 rounded-full"
                 style={{ background: 'linear-gradient(to bottom, #124346, rgba(18,67,70,0.1))' }} />

            <div className="flex flex-col gap-6">
              {/* Origin entry — always first */}
              <TimelineEntry
                icon="egg"
                iconColor="#f59e0b"
                title={lang === 'de' ? 'Ronki schlüpft' : 'Ronki hatches'}
                subtitle={lang === 'de' ? 'Der Anfang von allem' : 'Where it all began'}
                body={lang === 'de'
                  ? `${heroName} wählte ein Ei und Ronki erblickte das Licht der Welt. Ein neues Abenteuer begann.`
                  : `${heroName} chose an egg and Ronki saw the light of day. A new adventure began.`}
                accent="#f59e0b"
              />

              {/* Completed arcs */}
              {completedArcs.map((arcId, i) => {
                const arc = findArc(arcId);
                if (!arc) return null;

                const beatSummaries = arc.beats.map(beat => {
                  if (beat.kind === 'lore') return { icon: 'auto_stories', text: t(beat.text).slice(0, 60) + '…' };
                  if (beat.kind === 'craft') return { icon: 'brush', text: t(beat.title) };
                  if (beat.kind === 'routine') return { icon: 'task_alt', text: t(beat.narrativeAfter || beat.narrativeBefore || '') };
                  return null;
                }).filter(Boolean);

                return (
                  <TimelineEntry
                    key={arcId}
                    icon="auto_awesome"
                    iconColor="#124346"
                    title={t(arc.titleKey)}
                    subtitle={arc.chapterKey ? t(arc.chapterKey) : `${lang === 'de' ? 'Abenteuer' : 'Adventure'} ${i + 1}`}
                    accent="#124346"
                    body={
                      <div className="flex flex-col gap-2 mt-2">
                        {beatSummaries.map((bs, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-sm mt-0.5"
                                  style={{ color: '#707979', fontVariationSettings: "'FILL' 1" }}>{bs.icon}</span>
                            <span className="font-body text-xs text-on-surface-variant leading-snug">{bs.text}</span>
                          </div>
                        ))}
                        {arc.rewardOnComplete.xp > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-xs" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>diamond</span>
                            <span className="font-label font-bold text-xs" style={{ color: '#A83E2C' }}>
                              +{arc.rewardOnComplete.xp}
                            </span>
                          </div>
                        )}
                      </div>
                    }
                  />
                );
              })}

              {/* Future — what's next */}
              <TimelineEntry
                icon="more_horiz"
                iconColor="#c0c8c9"
                title={lang === 'de' ? 'Was kommt als Nächstes?' : 'What comes next?'}
                subtitle={lang === 'de' ? 'Die Geschichte geht weiter…' : 'The story continues…'}
                accent="#c0c8c9"
                faded
              />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl p-8 text-center"
               style={{ background: 'rgba(18,67,70,0.03)', border: '1.5px dashed rgba(18,67,70,0.12)' }}>
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 block mb-3">timeline</span>
            <p className="font-headline font-bold text-lg text-on-surface mb-2">
              {lang === 'de' ? 'Noch keine Abenteuer' : 'No adventures yet'}
            </p>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              {lang === 'de'
                ? 'Wenn Ronki dir ein Abenteuer anbietet, nimm es an! Hier erscheint dann eure gemeinsame Geschichte.'
                : "When Ronki offers you an adventure, accept it! Your shared story will appear here."}
            </p>
          </div>
        )}

        {/* Stats footer */}
        {completedArcs.length > 0 && (
          <div className="flex justify-center gap-6 mt-8 py-4">
            <div className="text-center">
              <p className="font-headline font-bold text-2xl text-primary">{completedArcs.length}</p>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                {lang === 'de' ? 'Abenteuer' : 'Adventures'}
              </p>
            </div>
            <div className="w-px bg-surface-container" />
            <div className="text-center">
              <p className="font-headline font-bold text-2xl text-primary">{state.totalTaskDays || 0}</p>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                {lang === 'de' ? 'Tage' : 'Days'}
              </p>
            </div>
            <div className="w-px bg-surface-container" />
            <div className="text-center">
              <p className="font-headline font-bold text-2xl text-primary">
                {completedArcs.reduce((sum, id) => {
                  const arc = findArc(id);
                  return sum + (arc?.beats?.length || 0);
                }, 0)}
              </p>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                {lang === 'de' ? 'Etappen' : 'Beats'}
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ── Timeline entry sub-component ──
function TimelineEntry({ icon, iconColor, title, subtitle, body, accent, faded }) {
  return (
    <div className={`relative ${faded ? 'opacity-40' : ''}`}>
      {/* Timeline dot */}
      <div className="absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center"
           style={{ background: `${iconColor}15`, border: `2px solid ${iconColor}40` }}>
        <span className="material-symbols-outlined"
              style={{ fontSize: 14, color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>

      {/* Card */}
      <div className="rounded-2xl p-4"
           style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <p className="font-label font-bold text-xs uppercase tracking-widest mb-0.5"
           style={{ color: accent }}>{subtitle}</p>
        <h3 className="font-headline font-bold text-base text-on-surface">{title}</h3>
        {typeof body === 'string'
          ? <p className="font-body text-sm text-on-surface-variant mt-1.5 leading-relaxed">{body}</p>
          : body
        }
      </div>
    </div>
  );
}
