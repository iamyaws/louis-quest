import React, { useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { findArc } from '../arcs/arcs';

/**
 * Buch — storybook chapter view (Polish v2 treatment).
 *
 * Marc Apr 2026: "start the v2 storybook redesign so that we can fold
 * it into the Erinnerungen tab in the profile." This is the full home
 * for Louis's story with Ronki — every journaled day, every adventure
 * survived, every boss defeated lives here as a chapter card.
 *
 * Architecture:
 *   · Data source = same as the profile's ErinnerungenList but richer:
 *     journalHistory entries + completed arcs + boss trophies + badges.
 *   · One chapter per journal-history day, ordered newest-first.
 *     Arc/boss/badge milestones fold into the chapter for the day they
 *     happened; if no journal entry exists for that date, a synthetic
 *     "milestone-only" chapter is created.
 *   · Chapter card (.chapter from Buch Polish v2): number + date top,
 *     narrative title, scene gradient (warm for milestones, cool for
 *     normal days), log entries (Louis voice + optional parent tag),
 *     polaroid + sticker strip + XP pill at the bottom.
 *   · Cream wallpaper background carries the "book paper" feel without
 *     committing to a full paper texture image.
 *
 * This is an interim surface — future polish can add the per-chapter
 * hand-painted scene artwork the Polish v2 doc illustrates, but the
 * chapter chrome + narrative framing is the important part. The look-
 * and-feel matches the Buch Polish v2 reference spec.
 */

export default function Buch({ onNavigate }) {
  const { state } = useTask();
  const { t, locale, lang } = useTranslation();

  const chapters = useMemo(() => buildChapters(state, t, lang), [state, t, lang]);
  const totalDays = state?.totalTaskDays || chapters.length;

  return (
    <div className="relative min-h-dvh pb-32"
         style={{ background: 'linear-gradient(180deg, #fdf0d9 0%, #fff8f2 40%, #fff8f2 100%)' }}>
      {/* Header — wordmark + meta */}
      <header className="max-w-lg mx-auto px-5"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => onNavigate?.('ronki')}
            aria-label={lang === 'de' ? 'Zurück' : 'Back'}
            className="flex items-center gap-1 active:opacity-70 transition-opacity"
            style={{
              padding: '6px 12px 6px 8px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(18,67,70,0.1)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700, fontSize: 12, color: '#124346',
              letterSpacing: '0.04em',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            {lang === 'de' ? 'Ronki' : 'Ronki'}
          </button>
          <span className="font-label font-bold uppercase tracking-widest"
                style={{ fontSize: 10, color: '#b45309', letterSpacing: '0.22em' }}>
            {lang === 'de' ? 'Buch' : 'Book'}
          </span>
        </div>
        <h1 className="font-headline font-bold mb-1"
            style={{ fontFamily: 'Fredoka, sans-serif', fontSize: 34, letterSpacing: '-0.015em', color: '#124346' }}>
          {lang === 'de' ? 'Euer Buch' : 'Your Book'}
        </h1>
        <p className="font-body italic"
           style={{ fontSize: 13, color: '#6b655b', lineHeight: 1.4, maxWidth: 340 }}>
          {totalDays > 0
            ? (lang === 'de'
              ? `${totalDays} ${totalDays === 1 ? 'Tag' : 'Tage'} · ${chapters.length} ${chapters.length === 1 ? 'Kapitel' : 'Kapitel'}`
              : `${totalDays} ${totalDays === 1 ? 'day' : 'days'} · ${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'}`)
            : (lang === 'de' ? 'Eure Geschichte beginnt bald.' : 'Your story begins soon.')}
        </p>
      </header>

      {/* Chapters */}
      <main className="max-w-lg mx-auto px-5 pt-6">
        {chapters.length === 0 ? (
          <div className="rounded-2xl p-6 text-center"
               style={{ background: '#fff', border: '1px solid rgba(18,67,70,0.1)' }}>
            <span className="material-symbols-outlined block mb-2"
                  style={{ fontSize: 36, color: '#b45309', fontVariationSettings: "'FILL' 1" }}>
              auto_stories
            </span>
            <b className="font-headline block mb-1" style={{ fontSize: 16, color: '#124346' }}>
              {lang === 'de' ? 'Das erste Kapitel wartet' : 'The first chapter is waiting'}
            </b>
            <p className="font-body text-sm italic" style={{ color: '#6b655b', lineHeight: 1.5 }}>
              {lang === 'de'
                ? 'Schreib heute etwas ins Tagebuch, und Ronki erinnert sich daran.'
                : 'Write something in the journal today, and Ronki will remember.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {chapters.map((c, idx) => (
              <ChapterCard key={c.key}
                           chapter={c}
                           chapterNum={chapters.length - idx}
                           locale={locale}
                           lang={lang} />
            ))}
            <p className="text-center font-body italic py-6"
               style={{ fontSize: 12, color: '#6b655b' }}>
              {lang === 'de' ? 'Mehr Kapitel folgen.' : 'More chapters to come.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ── ChapterCard ───────────────────────────────────────────────────────
// One chapter = one day worth of memories. The .milestone variant uses
// a warm cream→gold gradient for days with boss defeats / badges /
// completed arcs, giving them visual weight without breaking the list.

function ChapterCard({ chapter, chapterNum, locale, lang }) {
  const dateText = formatDate(chapter.date, locale);
  const isMilestone = chapter.milestones.length > 0;

  return (
    <article
      className="relative overflow-hidden"
      style={{
        padding: '18px 18px 16px',
        borderRadius: 22,
        background: isMilestone
          ? 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)'
          : '#fff',
        border: isMilestone
          ? '1px solid rgba(180,83,9,0.25)'
          : '1px solid rgba(18,67,70,0.08)',
        boxShadow: isMilestone
          ? '0 14px 28px -10px rgba(180,83,9,0.3)'
          : '0 10px 22px -12px rgba(18,67,70,0.22)',
      }}>
      {/* Head: chapter number + date + small meta bubbles */}
      <header className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="block font-label font-bold uppercase"
                style={{ fontSize: 9, letterSpacing: '0.28em', color: '#b45309', marginBottom: 4 }}>
            {lang === 'de' ? `Kapitel ${chapterNum}` : `Chapter ${chapterNum}`}
          </span>
          <span className="font-body" style={{ fontSize: 11, color: '#6b655b', fontWeight: 600 }}>
            {dateText}
          </span>
        </div>
        {chapter.metaBubbles.length > 0 && (
          <div className="flex gap-1.5">
            {chapter.metaBubbles.slice(0, 3).map((m, i) => (
              <div key={i}
                   style={{
                     width: 28, height: 28, borderRadius: '50%',
                     background: 'rgba(18,67,70,0.06)',
                     display: 'grid', placeItems: 'center',
                     fontSize: 14,
                   }}>
                {m}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Chapter title — narrative phrase */}
      <h2 className="font-headline mb-3"
          style={{
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: 500, fontSize: 20, lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: isMilestone ? '#723b00' : '#124346',
            margin: '0 0 14px 0',
            textWrap: 'balance',
          }}>
          {chapter.title}
      </h2>

      {/* Scene — gradient placeholder. Only rendered on milestone
          chapters (completed arcs) where the gradient carries meaning.
          Normal-day chapters skip it so they don't read as empty
          colored rectangles (Marc 24 Apr 2026: "all look flawed"). */}
      {isMilestone && (
      <div className="relative mb-4"
           style={{
             width: '100%', aspectRatio: '16 / 7',
             borderRadius: 16,
             overflow: 'hidden',
             background: chapter.sceneGradient,
             boxShadow: 'inset 0 -20px 30px -10px rgba(18,67,70,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
           }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(255,248,242,0.3) 100%)',
        }} />
        {isMilestone && (
          <div className="absolute top-2 right-2"
               style={{
                 display: 'inline-flex', alignItems: 'center', gap: 4,
                 padding: '5px 10px', borderRadius: 999,
                 background: 'rgba(255,248,242,0.95)',
                 backdropFilter: 'blur(6px)',
                 border: '1px solid rgba(180,83,9,0.3)',
                 fontSize: 9, letterSpacing: '0.18em',
                 fontWeight: 800, textTransform: 'uppercase',
                 color: '#b45309',
                 fontFamily: 'Plus Jakarta Sans, sans-serif',
                 boxShadow: '0 4px 10px -3px rgba(180,83,9,0.3)',
               }}>
            <span className="material-symbols-outlined"
                  style={{ fontSize: 13, color: '#b45309', fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
              military_tech
            </span>
            {lang === 'de' ? 'Meilenstein' : 'Milestone'}
          </div>
        )}
      </div>
      )}

      {/* Log — dashed leader, Louis-voice entries + optional parent tag */}
      {chapter.logEntries.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          padding: '0 2px 0 12px',
          marginBottom: 14,
          borderLeft: '2px dashed rgba(180,83,9,0.2)',
        }}>
          {chapter.logEntries.map((entry, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div className="flex items-center gap-1.5 mb-1"
                   style={{
                     font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
                     letterSpacing: '0.12em', textTransform: 'uppercase',
                     color: '#6b655b',
                   }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #fef3c7 0%, #f59e0b 70%, #b45309 100%)',
                  boxShadow: '0 0 0 2px #fff, 0 0 0 3px rgba(180,83,9,0.2)',
                  marginLeft: -18,
                }} />
                {entry.tag && (
                  <span style={{
                    padding: '2px 7px', borderRadius: 999,
                    background: 'rgba(236,72,153,0.12)',
                    color: '#be185d',
                    font: '800 8px/1 "Plus Jakarta Sans", sans-serif',
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    border: '1px solid rgba(236,72,153,0.25)',
                  }}>{entry.tag}</span>
                )}
              </div>
              <p style={{
                margin: 0,
                font: `500 13px/1.5 Nunito, sans-serif`,
                color: '#124346',
                fontStyle: entry.tag ? 'italic' : 'normal',
                textWrap: 'pretty',
              }}>
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer: polaroid + sticker wall + XP pill */}
      <footer className="grid gap-4 pt-3"
              style={{
                gridTemplateColumns: chapter.polaroid || chapter.stickers.length > 0 ? '1fr 1.2fr' : '1fr',
                borderTop: '1px dashed rgba(18,67,70,0.14)',
              }}>
        {chapter.polaroid && (
          <div
            style={{
              padding: '8px 8px 14px',
              background: '#fff',
              border: '1px solid rgba(18,67,70,0.1)',
              boxShadow: '0 6px 14px -6px rgba(18,67,70,0.25)',
              transform: 'rotate(-1.5deg)',
              transformOrigin: 'center',
            }}>
            <div style={{
              aspectRatio: '1 / 1',
              background: chapter.polaroidBg,
              display: 'grid', placeItems: 'center',
              borderRadius: 4,
              marginBottom: 8,
              fontSize: 34,
            }}>
              {chapter.polaroid}
            </div>
            <p style={{
              margin: 0, textAlign: 'center',
              font: '600 10px/1.2 Fredoka, sans-serif',
              color: '#124346',
              letterSpacing: 0,
            }}>
              {chapter.polaroidCaption}
            </p>
          </div>
        )}
        {(chapter.stickers.length > 0 || chapter.xpEarned > 0) && (
          <div className="flex flex-col gap-2">
            {chapter.stickers.length > 0 && (
              <>
                <span className="font-label font-bold uppercase"
                      style={{ fontSize: 9, letterSpacing: '0.24em', color: '#6b655b' }}>
                  {lang === 'de' ? 'Was lebendig blieb' : 'What stayed alive'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {chapter.stickers.map((s, i) => (
                    <div key={i}
                         title={s.label}
                         style={{
                           width: 30, height: 30, borderRadius: 10,
                           background: 'linear-gradient(160deg, #fff, #fef3c7)',
                           border: '1px solid rgba(180,83,9,0.14)',
                           display: 'grid', placeItems: 'center',
                           fontSize: 16,
                           boxShadow: '0 3px 6px -2px rgba(180,83,9,0.2)',
                         }}>
                      {s.emoji}
                    </div>
                  ))}
                </div>
              </>
            )}
            {chapter.xpEarned > 0 && (
              <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px', borderRadius: 999,
                  background: 'rgba(252,211,77,0.2)',
                  border: '1px solid rgba(180,83,9,0.2)',
                  font: '800 11px/1 "Plus Jakarta Sans", sans-serif',
                  letterSpacing: '0.06em',
                  color: '#b45309',
                }}>
                  <span style={{ fontSize: 13 }}>⭐</span>
                  <b>+{chapter.xpEarned}</b>
                </span>
              </div>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}

// ── Chapter builder ───────────────────────────────────────────────────
// Groups raw state into one chapter per date. Journal entries provide
// the narrative body + polaroid emoji; arcs/bosses/badges land as
// milestones that tint the chapter warm + pin a "Meilenstein" ribbon.

const GRATITUDE_EMOJI = {
  Familie: '👨‍👩‍👧', Freunde: '👋', Spielen: '🎮', Essen: '🍎',
  Natur: '🌳', Schule: '🏫', Ronki: '🐉',
  Family: '👨‍👩‍👧', Friends: '👋', Play: '🎮', Food: '🍎', Nature: '🌳', School: '🏫',
};

function buildChapters(state, t, lang) {
  if (!state) return [];
  const byDate = new Map();

  const ensureBucket = (date) => {
    if (!byDate.has(date)) {
      byDate.set(date, { date, logEntries: [], milestones: [], stickers: [], metaBubbles: [], polaroid: null, polaroidBg: 'linear-gradient(160deg, #fef9e7, #fcd34d)', polaroidCaption: '', xpEarned: 0 });
    }
    return byDate.get(date);
  };

  // 1. Journal history — the primary narrative source.
  (state.journalHistory || []).forEach(j => {
    if (!j?.date) return;
    const bucket = ensureBucket(j.date);
    const isBondingAgent = (j.achievements || []).includes('ronki-bad-day');
    if (j.memory) {
      bucket.logEntries.push({
        text: j.memory,
        tag: isBondingAgent ? (lang === 'de' ? 'Ronki-Moment' : 'Ronki moment') : null,
      });
    }
    if (j.dayEmoji !== null && j.dayEmoji !== undefined) {
      const dayEmojis = ["⭐", "🎈", "🍦", "🎨", "⚽", "🍕", "🎮", "🌈", "🐶"];
      const emoji = dayEmojis[j.dayEmoji] || '📔';
      bucket.polaroid = emoji;
      bucket.polaroidCaption = formatDate(j.date, lang === 'de' ? 'de-DE' : 'en-US');
    } else if (isBondingAgent && !bucket.polaroid) {
      bucket.polaroid = '🫂';
      bucket.polaroidCaption = lang === 'de' ? 'Für Ronki da' : 'For Ronki';
      bucket.polaroidBg = 'linear-gradient(160deg, #e8eef8, #bcc9de)';
    }
    (j.gratitude || []).forEach(g => {
      bucket.stickers.push({ emoji: GRATITUDE_EMOJI[g] || '💛', label: g });
    });
    if (typeof j.mood === 'number') {
      const moodEmojis = ['😢', '😰', '😐', '🙂', '✨', '😴'];
      bucket.metaBubbles.push(moodEmojis[j.mood] || '🙂');
    }
  });

  // 2. Completed arcs — milestones with their own synthetic logline.
  const completedAt = state?.arcEngine?.completedAt || {};
  (state?.arcEngine?.completedArcIds || []).forEach(arcId => {
    const arc = findArc(arcId);
    if (!arc) return;
    const date = completedAt[arcId] || null;
    if (!date) return; // skip arcs without a landing date
    const bucket = ensureBucket(date);
    const arcTitle = t ? t(arc.titleKey) : arcId;
    bucket.milestones.push({ kind: 'arc', label: arcTitle });
    bucket.logEntries.push({
      text: lang === 'de'
        ? `„${arcTitle}" bestanden. Ronki und ich waren tapfer.`
        : `Survived "${arcTitle}". Ronki and I were brave.`,
      tag: null,
    });
    bucket.metaBubbles.push('📜');
  });

  // 3. Badges — attach to today (no dated log exists) with a synthetic
  // milestone. Boss trophies removed from the Buch chapter builder
  // (Marc 23 Apr 2026: "let's remove boss besiegt under eure geschichte").
  // Bosses belong on the trophy wall, not mixed into the memory chapters.
  const today = new Date().toISOString().slice(0, 10);
  (state?.unlockedBadges || []).forEach(badgeId => {
    const bucket = ensureBucket(today);
    bucket.milestones.push({ kind: 'badge', label: badgeId });
    bucket.metaBubbles.push('⭐');
  });

  // Build the ordered list + synthesize titles, scene gradients, XP totals.
  // Drop buckets with NO real content (no log entries, no milestone,
  // no polaroid, no stickers) — otherwise we render hollow "Ein leiser
  // Tag" chapters with empty scene blocks (Marc 24 Apr 2026: "the book
  // so far doesn't really create real entries as they all look flawed").
  const list = Array.from(byDate.values())
    .filter(b =>
      b.logEntries.length > 0 ||
      b.milestones.length > 0 ||
      !!b.polaroid ||
      b.stickers.length > 0
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return list.map(bucket => {
    const isMilestone = bucket.milestones.length > 0;
    const title = synthesizeTitle(bucket, lang);
    const sceneGradient = sceneGradientFor(bucket, isMilestone);
    const xpEarned = bucket.milestones.length * 10 + bucket.logEntries.length * 2;
    return {
      ...bucket,
      key: bucket.date,
      title,
      sceneGradient,
      xpEarned,
    };
  });
}

// Synthesize a narrative title for the chapter. Uses milestone info
// when it exists; otherwise pulls from the first log entry or falls
// back to a gentle default. Future: LLM-assisted naming; for now,
// template-driven keeps it predictable.
function synthesizeTitle(bucket, lang) {
  const de = lang === 'de';
  // If an arc is the main milestone, use its title prefixed with "Der Tag…"
  const arcMs = bucket.milestones.find(m => m.kind === 'arc');
  if (arcMs) {
    return de ? `Der Tag, an dem wir „${arcMs.label}" bestanden` : `The day we survived "${arcMs.label}"`;
  }
  // Boss-milestone titles removed with the boss-entries removal above
  // (Marc 23 Apr 2026). If future trophies re-enter the Buch, add the
  // kind === 'boss' branch back here.
  const bondingEntry = bucket.logEntries.find(e => e.tag);
  if (bondingEntry) {
    return de ? 'Der Tag, an dem Ronki mich brauchte' : 'The day Ronki needed me';
  }
  if (bucket.logEntries.length > 0) {
    const firstLine = bucket.logEntries[0].text;
    // Use the first sentence as the title, truncated if needed
    const firstSentence = firstLine.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 0 && firstSentence.length < 60) {
      return firstSentence;
    }
  }
  return de ? 'Ein leiser Tag' : 'A quiet day';
}

// Scene gradient by day mood. Milestones = warm amber; normal days with
// Ronki bonding = cool dusk; everything else = soft teal morning.
function sceneGradientFor(bucket, isMilestone) {
  if (isMilestone) {
    return 'linear-gradient(160deg, #fff3c8 0%, #fcd34d 35%, #f59e0b 70%, #c2410c 100%)';
  }
  const hasBondingEntry = bucket.logEntries.some(e => e.tag);
  if (hasBondingEntry) {
    return 'linear-gradient(160deg, #dbe7f2 0%, #8fa6c2 60%, #3d2b4a 100%)';
  }
  return 'linear-gradient(160deg, #e8f1f3 0%, #b5d4d8 55%, #5a8d93 100%)';
}

function formatDate(dateStr, locale) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString(locale || 'de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch (_) {
    return dateStr;
  }
}
