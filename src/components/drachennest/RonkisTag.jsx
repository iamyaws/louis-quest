import React, { useEffect, useMemo, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { getCatStage } from '../../utils/helpers';
import MoodChibi from '../MoodChibi';
import { useQuestEater } from '../QuestEater';
import { flavorForQuest } from '../FireBreathPuff';
import ToothbrushTimer from '../ToothbrushTimer';
import VoiceAudio from '../../utils/voiceAudio';

/**
 * RonkisTag — daily surface as a vertical comic strip.
 *
 * Direct port of "Geschichten-Streifen" (Item 1 · Direction A) from
 * the Claude Design hi-fi handoff (26 Apr 2026, project hash
 * `qXRWfwWaiAoeAv1yh86HNw`). Reference at
 * `docs/design-incoming/meet-tonight/project/src/hifi-streifen.jsx`.
 *
 * Reads the same quest data the legacy TaskList uses; the action
 * layer (tap → mark done → Ronki eats the quest) is unchanged. What
 * changes is the *visual frame* — each task is a small painted scene
 * with prop art (toothbrush, t-shirt, book, pajamas, nightlight) and
 * Ronki appears inside specific scenes (Aufstehen, Hausaufgaben,
 * Pyjama). Past tasks stay illustrated but desaturate. The kid is
 * reading a comic of their day with Ronki, not ticking a checklist.
 *
 * Day-phase aware: cave-bg shifts gold-cream → umber → deep violet
 * across morning / afternoon / evening. After evening rolls in,
 * morning + afternoon collapse to small grids and evening fills the
 * surface. End-of-day flips to a nightsky scene linking to Tonight.
 *
 * Wired into the cave's "aufgaben" navigate target — replaces the
 * legacy TaskList for the kid-facing entry. TaskList still mounts
 * on `view==='quests'` for questline back-buttons.
 */

// ── Tokens ────────────────────────────────────────────────────────
// Type scale (Apr 2026 readability pass — 1st-grader minimums):
//   Voiced lines = the heart of the surface, must read at arm's length.
//   German is letter-dense (Hausaufgaben, Schlafanzug) so sizes bias
//   slightly above WCAG-for-adults floors. Body min = 16px on mobile.
const T = {
  cream: '#fff8f2',
  ink: '#1e1b17',
  mute: '#6b655b',
  gold: '#fcd34d',
  goldSoft: '#fde68a',
  goldDeep: '#b45309',
  warm: '#3a2818',
  inkScript: '#5a4a30',  // deepened from #7a6a4a for 4.5:1 on cream
  inkSoft: '#5a3a20',
  fHead: '"Fredoka", system-ui, sans-serif',
  fBody: '"Nunito", system-ui, sans-serif',
  fLabel: '"Plus Jakarta Sans", system-ui, sans-serif',
  fScript: '"Caveat", "Bradley Hand", cursive',
};

// Honor reduced-motion at module scope. Used to short-circuit the
// background-gradient transition and the nightsky twinkle loop.
const REDUCE_MOTION =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Quest IDs that detour through the toothbrush timer ────────────
// (mirrors TaskList — kept here as a small const to avoid a circular
// import.)
const TEETH_QUEST_IDS = new Set(['s3', 's12', 'v3', 'v10']);

// ── Helpers ───────────────────────────────────────────────────────

// Map a quest's source `anchor` field to one of three strip blocks.
// `evening` and `hobby` both fold into "afternoon" so the kid sees
// a 3-block day, not 4.
function blockFor(anchor) {
  if (anchor === 'morning') return 'morning';
  if (anchor === 'bedtime') return 'bedtime';
  return 'afternoon';
}

// Map a quest to a painted prop. The designer shipped a fixed roster
// of art (Toothbrush, TShirt, Book, Pajama, Nightlight, Plate,
// Homework, Sun); we route by quest icon family or quest id keyword.
// Falls back to a soft "moment" badge.
function artFor(quest) {
  const id = (quest?.id || '').toLowerCase();
  const name = (quest?.name || '').toLowerCase();
  const icon = (quest?.icon || '').toLowerCase();
  const all = `${id} ${name} ${icon}`;
  if (/zahn|tooth|brush/.test(all))         return 'toothbrush';
  if (/anzieh|kleid|wäsche|clothes|shirt/.test(all)) return 'shirt';
  if (/wasser|water|trinken|cup/.test(all))  return 'plate'; // closest substitute
  if (/essen|food|frühstück|mahlzeit/.test(all)) return 'plate';
  if (/lese|book|buch/.test(all))            return 'book';
  if (/hausaufgab|schule|homework/.test(all)) return 'homework';
  if (/pyjama|schlafan/.test(all))           return 'pajama';
  if (/nacht|licht|lampe|bett|sleep|ruhe/.test(all)) return 'nightlight';
  if (/aufsteh|wach|wake|morgen-start/.test(all))    return 'sun';
  return 'badge';
}

// Tasks where Ronki appears WITHIN the scene rather than as a side
// avatar — designer cited these explicitly.
function ronkiInScene(quest) {
  const id = (quest?.id || '').toLowerCase();
  const name = (quest?.name || '').toLowerCase();
  return /aufsteh|wach|hausaufgab|pyjama|schule/.test(`${id} ${name}`);
}

// Phase of day → which block is "now" right now.
function currentPhaseFromHour(h) {
  if (h < 11) return 'morning';
  if (h < 17) return 'afternoon';
  return 'bedtime';
}

// Verbal moment label per phase, used in the TopBar.
function momentLabel(phase) {
  if (phase === 'morning')   return 'früh';
  if (phase === 'afternoon') return 'Mittag';
  return 'Abend';
}

function dateLabelDe() {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  return days[new Date().getDay()];
}

// Voiced "moment" lines per phase + state. Soft observational, no
// instructions. Rotation pool — picker picks once per quest mount
// so it doesn't shimmer.
const MOMENT_LINES = {
  morning: {
    now:    ['Er sitzt schon am Fenster und schaut raus.', 'Er hat schon gewartet.', 'Er ist heute früh wach.'],
    past:   ['Sonne war rosa.', 'War schön mit dir.', 'Sind beide aufgewacht.'],
    future: ['', '', ''], // future = quiet
  },
  afternoon: {
    now:    ['Er hat sich neben den Tisch gelegt.', 'Er beobachtet leise.', 'Er rückt näher.'],
    past:   ['Hat er gemerkt.', 'Habt ihr zusammen.', 'War gut so.'],
    future: ['', '', ''],
  },
  bedtime: {
    now:    ['Er gähnt einmal.', 'Er macht die Augen schmal.', 'Er kuschelt sich ein.'],
    past:   ['Schon ruhig.', 'Hat geklappt.', 'Hat gut funktioniert.'],
    future: ['', '', ''],
  },
};

function pickMomentLine(phase, state, seed) {
  const pool = MOMENT_LINES[phase]?.[state] || [];
  if (!pool.length) return '';
  return pool[Math.abs(seed) % pool.length];
}

// ── Top-level component ──────────────────────────────────────────

export default function RonkisTag({ onClose, onOpenExpedition, onOpenTonight }) {
  const { state, actions } = useTask();
  const eater = useQuestEater();
  const variant = state?.companionVariant || 'forest';
  const stageIdx = getCatStage(state?.catEvo ?? 0) || 1;

  const quests = state?.quests || [];

  // Group quests into the 3 strip blocks; main quests only.
  const blocks = useMemo(() => {
    const main = quests.filter(q => !q.sideQuest);
    const byBlock = { morning: [], afternoon: [], bedtime: [] };
    for (const q of main) {
      const b = blockFor(q.anchor);
      if (byBlock[b]) byBlock[b].push(q);
    }
    for (const k of Object.keys(byBlock)) byBlock[k].sort((a, b) => (a.order || 0) - (b.order || 0));
    return byBlock;
  }, [quests]);

  // Phase of day = which block is "now."
  const phase = useMemo(() => currentPhaseFromHour(new Date().getHours()), []);

  // Voice on mount — Drachenmutter narrator framing + Ronki warmth.
  // Once per mount of the strip; gentle 600ms delay so the strip
  // settles in before audio kicks in. Apr 2026 voice pass.
  useEffect(() => {
    VoiceAudio.playNarrator('tag_intro_01', 600);
    const t = setTimeout(() => VoiceAudio.playLocalized('tag_warmth_01', 0), 4200);
    return () => clearTimeout(t);
  }, []);

  // Block completion
  const morningAll = blocks.morning.length > 0 && blocks.morning.every(q => q.done);
  const afternoonAll = blocks.afternoon.length > 0 && blocks.afternoon.every(q => q.done);
  const bedtimeAll = blocks.bedtime.length > 0 && blocks.bedtime.every(q => q.done);
  const fullDay =
    morningAll && afternoonAll && bedtimeAll;

  const expeditionReady = morningAll && state?.expedition?.state === 'home';

  // Toothbrush timer detour state
  const [teethTimerQuestId, setTeethTimerQuestId] = useState(null);

  const handleTap = (quest, evt) => {
    if (quest.done) return;
    if (TEETH_QUEST_IDS.has(quest.id)) {
      setTeethTimerQuestId(quest.id);
      return;
    }
    if (eater && evt?.currentTarget) {
      try {
        eater.eatQuest({
          fromRect: evt.currentTarget.getBoundingClientRect(),
          emoji: quest.icon || '⭐',
          hp: quest.xp || 0,
          flavor: flavorForQuest(quest, state.taughtBreaths),
        });
      } catch { /* surface-agnostic; never block the tap */ }
    }
    actions.complete(quest.id);
  };

  // Background gradient — shifts gold-cream → umber → deep violet
  // across the day. End-of-day flips to nightsky.
  // Bedtime gradient lifted Apr 2026 (Marc: "evening view super dark").
  // Was #6a5a8a → #4a3a5a → #2a1f3a; the bottom anchor at #2a1f3a was
  // crushing — the cards visually sank into pitch. Bumped each stop
  // ~12 lightness points: bedtime sky now reads as deep dusky violet
  // not midnight. fullDay (when the kid finishes the entire day)
  // stays its original near-black night palette — that's the
  // "tonight ritual is now" signal so it should read distinctly
  // darker than the in-progress bedtime view.
  const bg =
    fullDay                ? 'linear-gradient(180deg, #2d1b4e 0%, #1a0f3a 50%, #0a0a2e 100%)' :
    phase === 'morning'    ? 'linear-gradient(180deg, #fef3c7 0%, #fbe9b6 30%, #f9eed8 100%)' :
    phase === 'afternoon'  ? 'linear-gradient(180deg, #faecc8 0%, #f5e0b8 30%, #f4d8a8 100%)' :
                              'linear-gradient(180deg, #8a7aac 0%, #6a5a82 35%, #4a3d62 100%)';

  const inkOnDark = phase === 'bedtime' || fullDay;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ronkis Tag"
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: bg,
        transition: REDUCE_MOTION ? 'none' : 'background 1200ms ease',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        fontFamily: T.fBody,
      }}
    >
      <BackChrome onClose={onClose} dark={inkOnDark} />

      {/* End-of-day nightsky scene → link to Tonight ritual */}
      {fullDay ? (
        <EndOfDayScene
          variant={variant} stageIdx={stageIdx}
          onOpenTonight={onOpenTonight}
        />
      ) : (
        <>
          <TopBar phase={phase} />

          <div style={{ padding: '108px 18px 24px' }}>
            {/* Morning */}
            {blocks.morning.length > 0 && (
              <BlockStrip
                title="Morgen"
                phase={phase}
                blockId="morning"
                quests={blocks.morning}
                isCurrent={phase === 'morning'}
                allDone={morningAll}
                collapse={phase === 'bedtime' || phase === 'afternoon' && morningAll}
                variant={variant}
                stageIdx={stageIdx}
                onTap={handleTap}
              />
            )}

            {/* Anchor-complete transition for morning → expedition */}
            {expeditionReady && phase !== 'bedtime' && (
              <AnchorCompleteCard
                onOpenExpedition={onOpenExpedition}
              />
            )}

            {/* Afternoon */}
            {blocks.afternoon.length > 0 && (
              <BlockStrip
                title="Nachmittag"
                phase={phase}
                blockId="afternoon"
                quests={blocks.afternoon}
                isCurrent={phase === 'afternoon'}
                allDone={afternoonAll}
                collapse={phase === 'bedtime'}
                variant={variant}
                stageIdx={stageIdx}
                onTap={handleTap}
              />
            )}

            {/* Bedtime — always rendered with the dark theme regardless
                of current time-of-day. The card backgrounds are deep-violet
                gradients constantly (bedtime is bedtime, day or night), so
                the text + eyebrow + pill colors must always pair with that.
                Earlier wiring `onDark={phase === 'bedtime'}` only flipped
                colors when the current hour was past bedtime, which left
                a dark-on-dark title state during afternoon viewing. */}
            {blocks.bedtime.length > 0 && (
              <BlockStrip
                title="Abend"
                phase={phase}
                blockId="bedtime"
                quests={blocks.bedtime}
                isCurrent={phase === 'bedtime'}
                allDone={bedtimeAll}
                collapse={false}
                variant={variant}
                stageIdx={stageIdx}
                onTap={handleTap}
                onDark={true}
              />
            )}
          </div>
        </>
      )}

      {/* Toothbrush timer */}
      {teethTimerQuestId && (
        <ToothbrushTimer
          onClose={() => setTeethTimerQuestId(null)}
          onComplete={() => {
            actions.complete(teethTimerQuestId);
            setTeethTimerQuestId(null);
          }}
        />
      )}
    </div>
  );
}

// ── Back-chrome ──────────────────────────────────────────────────

function BackChrome({ onClose, dark }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px',
      background: dark
        ? 'linear-gradient(180deg, rgba(20,16,40,0.65), transparent)'
        : 'linear-gradient(180deg, rgba(255,248,242,0.95), rgba(255,248,242,0.6) 70%, transparent)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      pointerEvents: 'none',
    }}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Zurück zur Höhle"
        style={{
          pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 18px', borderRadius: 999,
          background: dark ? 'rgba(255,248,242,0.92)' : '#ffffff',
          border: dark ? 'none' : '1.5px solid rgba(180,83,9,0.18)',
          color: '#124346',
          font: `700 14px/1 ${T.fLabel}`,
          letterSpacing: '0.04em',
          boxShadow: '0 4px 10px -4px rgba(18,67,70,0.18)',
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        Zurück
      </button>
      <div style={{ width: 76 }} aria-hidden="true" />
    </div>
  );
}

// ── TopBar (eyebrow + date + day-phase indicator) ────────────────

function TopBar({ phase }) {
  const phases = ['früh', 'Mittag', 'Nachm.', 'Abend'];
  const moment = momentLabel(phase);
  const date = dateLabelDe();
  return (
    <div style={{
      position: 'absolute', top: 56, left: 0, right: 0, padding: '0 22px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      pointerEvents: 'none',
    }}>
      <div>
        <div style={{
          font: `700 11px/1 ${T.fLabel}`, letterSpacing: '.22em',
          textTransform: 'uppercase', color: T.goldDeep, marginBottom: 5,
        }}>Heute mit Ronki</div>
        <div style={{
          font: `700 19px/1.1 ${T.fHead}`, color: T.ink, letterSpacing: '-0.01em',
        }}>{date}, {moment}</div>
      </div>
      <div style={{ display: 'flex', gap: 4, paddingBottom: 5 }}>
        {phases.map((m, i) => {
          const active = m.toLowerCase().startsWith(moment.toLowerCase().slice(0, 3));
          return (
            <div key={i} style={{
              width: 5, height: active ? 18 : 11,
              background: active ? T.goldDeep : 'rgba(180,83,9,.25)',
              borderRadius: 2,
              transition: REDUCE_MOTION ? 'none' : 'height 600ms ease, background 600ms ease',
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ── BlockStrip — one anchor section ──────────────────────────────

function BlockStrip({ title, phase, blockId, quests, isCurrent, allDone, collapse, variant, stageIdx, onTap, onDark }) {
  const hint =
    allDone   ? 'vorbei' :
    isCurrent ? 'jetzt' :
                phase === 'morning' && blockId === 'afternoon' ? 'kommt noch' :
                phase === 'morning' && blockId === 'bedtime'   ? 'später' :
                blockId === 'morning' && phase !== 'morning'   ? 'vorbei' :
                                                                 `${quests.length} Sachen`;
  const sectionColor = onDark ? T.gold : (isCurrent ? T.goldDeep : '#a07840');

  return (
    <>
      <StripSection color={sectionColor} hint={hint} onDark={onDark}>{title}</StripSection>
      {collapse ? (
        <CollapsedGrid quests={quests} blockId={blockId} variant={variant} stageIdx={stageIdx} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quests.map((q, i) => {
            const sceneState = q.done ? 'past' : (isCurrent && firstUndone(quests)?.id === q.id ? 'now' : 'future');
            return (
              <StripScene
                key={q.id}
                quest={q}
                state={sceneState}
                phase={blockId}
                variant={variant}
                stageIdx={stageIdx}
                onDark={onDark}
                onTap={onTap}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function firstUndone(list) {
  return list.find(q => !q.done);
}

// ── StripSection (eyebrow + script hint + dotted divider) ────────

function StripSection({ children, color, hint, onDark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 10,
      margin: `24px 4px 12px`,
    }}>
      <div style={{
        font: `800 13px/1.05 ${T.fLabel}`, color, letterSpacing: '.12em',
        textTransform: 'uppercase',
      }}>{children}</div>
      {hint && (
        <div style={{
          font: `500 17px/1.05 ${T.fScript}`,
          color: onDark ? 'rgba(254,243,199,.88)' : T.inkScript,
        }}>
          {hint}
        </div>
      )}
      <div style={{
        flex: 1, height: 1,
        background: onDark
          ? 'repeating-linear-gradient(90deg, rgba(252,211,77,.4) 0 3px, transparent 3px 6px)'
          : 'repeating-linear-gradient(90deg, rgba(184,140,80,.4) 0 3px, transparent 3px 6px)',
      }} />
    </div>
  );
}

// ── StripScene (one task as a comic panel) ───────────────────────

function StripScene({ quest, state, phase, variant, stageIdx, onDark, onTap }) {
  // Past-state fade is applied to the ART FRAME only — text stays at
  // full opacity so a 6yo can still read the quest name on review.
  const artOpacity = state === 'past' ? 0.62 : 1;
  const artSaturate = state === 'past' ? 0.78 : 1;
  const seed = useMemo(() => {
    let h = 0;
    for (const c of quest.id) h = (h * 31 + c.charCodeAt(0)) | 0;
    return h;
  }, [quest.id]);
  const line = pickMomentLine(phase, state === 'now' ? 'now' : state === 'past' ? 'past' : 'future', seed);
  const stateAria =
    state === 'past' ? ', fertig' :
    state === 'now'  ? ', jetzt dran' :
                       ', später';

  // Card gradient lifted Apr 2026 to match the page-bg lift — was
  // #4a3a6a → #2a1f3a, crushed against the new #4a3d62 bottom of the
  // page. Lifted to dusky-velvet so the cards read as a soft layer
  // floating on the bedtime sky, not sinking into pitch.
  const baseBg =
    onDark
      ? 'linear-gradient(135deg, #6a5a82 0%, #4a3a5a 100%)'
      : phase === 'morning'   ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
      : phase === 'afternoon' ? 'linear-gradient(135deg, #f4e2c8 0%, #ead09a 100%)'
                              : 'linear-gradient(135deg, #6a5a82 0%, #4a3a5a 100%)';

  return (
    <button
      type="button"
      onClick={(e) => onTap(quest, e)}
      disabled={state === 'past'}
      aria-label={`${quest.name || quest.id}${stateAria}`}
      aria-current={state === 'now' ? 'step' : undefined}
      className="active:scale-[0.96] transition-transform duration-150"
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: 0, margin: 0,
        borderRadius: 14, overflow: 'hidden',
        border: state === 'now'
          ? `1.5px solid rgba(252,211,77,.6)`
          : '1px solid rgba(0,0,0,.06)',
        boxShadow: state === 'now'
          ? '0 6px 14px -4px rgba(180,83,9,.4), inset 0 0 0 1.5px rgba(252,211,77,.5)'
          : '0 2px 6px rgba(0,0,0,.10)',
        cursor: state === 'past' ? 'default' : 'pointer',
        background: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      <div style={{
        background: baseBg,
        minHeight: 100,
        display: 'grid', gridTemplateColumns: '76px 1fr',
        gap: 12, padding: '12px 14px',
        position: 'relative',
      }}>
        {/* Art frame — past-state desaturate happens here only */}
        <div style={{
          width: 76, height: 78, borderRadius: 10,
          background: onDark ? 'rgba(50,40,80,.6)' : 'rgba(255,255,255,.35)',
          border: onDark ? '1px solid rgba(252,211,77,.2)' : '1px solid rgba(0,0,0,.08)',
          position: 'relative', overflow: 'hidden',
          display: 'grid', placeItems: 'center',
          opacity: artOpacity, filter: `saturate(${artSaturate})`,
        }}>
          <SceneArt
            quest={quest}
            phase={phase}
            state={state}
            variant={variant}
            stageIdx={stageIdx}
          />
        </div>

        {/* Text */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minWidth: 0,
        }}>
          <div style={{
            font: `700 17px/1.25 ${T.fHead}`,
            color: onDark ? '#fef3c7' : T.warm,
            letterSpacing: '-0.005em', marginBottom: 4,
            textDecoration: state === 'past' ? 'line-through' : 'none',
            textDecorationColor: state === 'past' ? 'rgba(58,40,24,0.35)' : undefined,
            textDecorationThickness: state === 'past' ? '1.5px' : undefined,
          }}>
            {quest.name || quest.id}
          </div>
          {line && (
            <div style={{
              font: `500 15px/1.4 ${T.fBody}`,
              color: onDark ? 'rgba(254,243,199,.92)' : T.inkSoft,
              fontStyle: 'italic',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>{line}</div>
          )}
        </div>

        {/* State mark */}
        {state === 'past' && <PastCheck />}
        {state === 'now'  && <JetztPill onDark={onDark} />}
      </div>
    </button>
  );
}

function PastCheck() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', top: 9, right: 10,
      width: 18, height: 18, borderRadius: '50%',
      background: '#86c084', display: 'grid', placeItems: 'center',
      boxShadow: '0 1px 3px rgba(58,90,42,0.3)',
    }}>
      <div style={{
        width: 6, height: 9, marginTop: -1, marginLeft: -0.5,
        borderRight: '2px solid #fff', borderBottom: '2px solid #fff',
        transform: 'rotate(45deg)',
      }} />
    </div>
  );
}

function JetztPill({ onDark }) {
  return (
    <div style={{
      position: 'absolute', top: 9, right: 10,
      font: `800 11px/1 ${T.fLabel}`, letterSpacing: '.14em',
      color: onDark ? '#5a3a18' : T.goldDeep, textTransform: 'uppercase',
      background: onDark ? T.gold : 'rgba(252,211,77,.55)',
      padding: '5px 9px',
      borderRadius: 6,
      boxShadow: '0 1px 3px rgba(180,83,9,0.18)',
    }}>jetzt</div>
  );
}

// ── CollapsedGrid (past anchors when evening rolls in) ───────────

function CollapsedGrid({ quests, blockId, variant, stageIdx }) {
  const cols = quests.length === 2 ? 2 : 3;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {quests.map(q => (
        <div key={q.id} style={{
          borderRadius: 9, padding: '8px 8px 7px',
          background: blockId === 'morning' ? 'rgba(254,243,199,.92)' : 'rgba(244,226,200,.92)',
          border: '1px solid rgba(0,0,0,.06)',
          // Past-state fade kept on the wrapper for hierarchy, but no
          // longer aggressive enough to make labels unreadable.
          opacity: 0.92,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            width: '100%', height: 38, borderRadius: 6,
            background: 'rgba(245,158,11,.18)',
            marginBottom: 6, display: 'grid', placeItems: 'center',
            overflow: 'hidden',
            opacity: 0.78, filter: 'saturate(0.85)',
          }}>
            <div style={{ transform: 'scale(0.78)' }}>
              <SceneArt quest={q} phase={blockId} state="past" variant={variant} stageIdx={stageIdx} compact />
            </div>
          </div>
          <div style={{
            font: `700 12px/1.15 ${T.fLabel}`, color: '#5a4a30', letterSpacing: '.02em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{q.name || q.id}</div>
          {q.done && (
            <div style={{
              position: 'absolute', top: 5, right: 5,
              width: 13, height: 13, borderRadius: '50%',
              background: '#86c084', display: 'grid', placeItems: 'center',
            }}>
              <div style={{
                width: 4, height: 6, marginTop: -1,
                borderRight: '1.5px solid #fff', borderBottom: '1.5px solid #fff',
                transform: 'rotate(45deg)',
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── AnchorCompleteCard (morning 100% → expedition) ──────────────

function AnchorCompleteCard({ onOpenExpedition }) {
  return (
    <button
      type="button"
      onClick={onOpenExpedition}
      aria-label="Reise verfolgen — Morgen ist gemacht"
      className="active:scale-[0.96] transition-transform duration-150"
      style={{
        width: '100%', marginTop: 18,
        padding: 0, border: 'none', borderRadius: 16, overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 8px 22px -8px rgba(180,90,40,.45)',
        textAlign: 'left',
        touchAction: 'manipulation',
      }}
    >
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #b8d8c4 0%, #e8e0c4 60%, #fef3c7 100%)',
        padding: '18px 18px 22px',
        minHeight: 132,
      }}>
        {/* Tiny forest path silhouette */}
        <ForestPathStrip />
        <div style={{
          position: 'relative', zIndex: 2,
          font: `800 12px/1 ${T.fLabel}`,
          letterSpacing: '.16em', textTransform: 'uppercase',
          color: '#5c2a08', marginBottom: 8,
        }}>Morgen ist gemacht</div>
        <div style={{
          position: 'relative', zIndex: 2,
          font: `600 17px/1.4 ${T.fHead}`, color: T.warm, fontStyle: 'italic',
        }}>"Ich geh mal kurz raus. Bin zum Mittag wieder da."</div>
        <div style={{
          position: 'relative', zIndex: 2,
          marginTop: 14,
          display: 'inline-block',
          font: `800 13px/1 ${T.fLabel}`,
          letterSpacing: '.10em', textTransform: 'uppercase',
          color: '#fef3c7',
          background: 'linear-gradient(180deg, #5a3a20 0%, #3a2818 100%)',
          padding: '10px 18px', borderRadius: 999,
        }}>Reise verfolgen →</div>
      </div>
    </button>
  );
}

function ForestPathStrip() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      opacity: 0.5,
    }}>
      {/* far hill */}
      <div style={{
        position: 'absolute', bottom: 22, left: -8, right: -8, height: 28,
        background: 'linear-gradient(180deg, #6a8a5a 0%, #4a6a3a 100%)',
        borderRadius: '50% 60% 0 0 / 100% 100% 0 0',
      }} />
      {/* path triangle */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '60px solid transparent', borderRight: '60px solid transparent',
        borderBottom: '36px solid #d8b878',
      }} />
      {/* tiny trees */}
      {[
        { l: '8%', s: 16 }, { l: '24%', s: 20 }, { r: '8%', s: 16 }, { r: '22%', s: 22 },
      ].map((t, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: 24,
          [t.l ? 'left' : 'right']: t.l || t.r,
          width: t.s, height: t.s + 8,
          background: 'radial-gradient(ellipse at 50% 60%, #3a5a2a, #2a4a1a)',
          borderRadius: '50% 50% 20% 20%',
        }} />
      ))}
    </div>
  );
}

// ── EndOfDayScene (full-day done → link to Tonight) ──────────────

function EndOfDayScene({ variant, stageIdx, onOpenTonight }) {
  return (
    <div style={{
      position: 'relative', minHeight: '100dvh',
      paddingTop: 110, paddingBottom: 40,
    }}>
      <NightSky />
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '0 24px',
      }}>
        <div style={{
          font: `600 12px/1.1 ${T.fLabel}`, letterSpacing: '.16em',
          textTransform: 'uppercase', color: 'rgba(254,243,199,.85)',
          marginBottom: 10,
        }}>{dateLabelDe()} · zu Ende</div>
        <div style={{
          font: `600 32px/1.15 ${T.fScript}`, color: '#fef3c7', letterSpacing: '-0.01em',
        }}>Ein guter Tag.</div>
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '16px 28px 0',
      }}>
        <div style={{
          font: `500 16px/1.45 ${T.fBody}`, color: 'rgba(254,243,199,.92)',
          fontStyle: 'italic',
        }}>"Wir haben heute alles geteilt. Sogar das Brot mit den Krümeln."</div>
      </div>

      {/* Sleeping Ronki silhouette */}
      <div style={{
        position: 'relative', zIndex: 2,
        margin: '34px auto 0',
        width: 110, height: 110,
        display: 'grid', placeItems: 'center',
        filter: 'drop-shadow(0 0 16px rgba(252,211,77,.45))',
      }}>
        <MoodChibi size={100} variant={variant} stage={stageIdx} mood="müde" bare />
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', padding: '36px 22px 0',
      }}>
        <button
          type="button"
          onClick={onOpenTonight}
          aria-label="Ins Lager — Tonight-Ritual öffnen"
          className="active:scale-[0.96] transition-transform duration-150"
          style={{
            display: 'inline-block',
            borderRadius: 999,
            background: 'rgba(252,211,77,.22)',
            border: '1.5px solid rgba(252,211,77,.65)',
            padding: '14px 26px',
            font: `700 14px/1 ${T.fLabel}`, letterSpacing: '.10em',
            textTransform: 'uppercase', color: '#fef3c7',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          ins Lager →
        </button>
      </div>
    </div>
  );
}

function NightSky() {
  // 24 stars, deterministic
  const stars = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      top: 8 + (i * 13) % 38,
      left: (i * 37) % 100,
      size: 1 + (i % 3) * 0.6,
      delay: (i * 0.4) % 3,
    }));
  }, []);
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 90% 70% at 50% 65%, #2d1b4e 0%, #1a0f3a 50%, #0a0a2e 100%)',
      pointerEvents: 'none',
    }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'white',
          boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,.6)`,
          opacity: REDUCE_MOTION ? 0.7 : undefined,
          animation: REDUCE_MOTION
            ? 'none'
            : `rt-twinkle ${3 + (i % 4)}s ease-in-out infinite ${s.delay}s`,
        }} />
      ))}
      <div style={{
        position: 'absolute', top: 60, right: 38, width: 30, height: 30,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #fef3c7 0%, #fde68a 60%, #f5d28a 100%)',
        boxShadow: '0 0 20px rgba(254,243,199,.5)',
      }} />
      <style>{`
        @keyframes rt-twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.95; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// ── SceneArt — picks the right painted prop per quest ────────────

function SceneArt({ quest, phase, state, variant, stageIdx, compact }) {
  const inScene = ronkiInScene(quest);
  const kind = artFor(quest);
  const sleep = phase === 'bedtime' && state !== 'past';

  // Aufstehen + Hausaufgaben + Pyjama get Ronki *inside* the scene.
  if (inScene) {
    if (kind === 'pajama') {
      return (
        <div style={{ position: 'relative', width: 56, height: 60, display: 'grid', placeItems: 'center' }}>
          <PajamaArt />
          <div style={{ position: 'absolute', bottom: -2, right: -4, transform: 'translateZ(0)' }}>
            <MoodChibi size={compact ? 22 : 30} variant={variant} stage={stageIdx} mood="müde" bare />
          </div>
        </div>
      );
    }
    if (kind === 'homework') {
      return (
        <div style={{ position: 'relative', width: 56, height: 60, display: 'grid', placeItems: 'center' }}>
          <HomeworkArt />
          <div style={{ position: 'absolute', bottom: 0, right: 2 }}>
            <MoodChibi size={compact ? 16 : 22} variant={variant} stage={stageIdx} mood="müde" bare />
          </div>
        </div>
      );
    }
    if (kind === 'sun') {
      return (
        <div style={{ position: 'relative', width: 56, height: 60, display: 'grid', placeItems: 'center' }}>
          <SunArt />
          <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, height: 5, borderRadius: 2, background: '#3a5a3a' }} />
          <MoodChibi size={compact ? 24 : 34} variant={variant} stage={stageIdx} mood="normal" bare />
        </div>
      );
    }
  }

  // Plain prop scenes
  switch (kind) {
    case 'toothbrush':  return <ToothbrushArt />;
    case 'shirt':       return <TShirtArt />;
    case 'book':        return <BookArt />;
    case 'pajama':      return <PajamaArt />;
    case 'nightlight':  return <NightlightArt />;
    case 'sun':         return <SunArt />;
    case 'plate':       return <PlateArt />;
    case 'homework':    return <HomeworkArt />;
    default:            return <Badge sleep={sleep} variant={variant} stageIdx={stageIdx} compact={compact} />;
  }
}

// ── Painted prop primitives (ported from designer) ───────────────

function ToothbrushArt() {
  return (
    <div style={{
      width: 18, height: 36, borderRadius: '4px 4px 2px 2px',
      background: 'linear-gradient(180deg, #7ec0d4 0%, #5a8aa0 100%)',
      position: 'relative',
      boxShadow: 'inset -2px -2px 4px rgba(0,0,0,.15), inset 1px 1px 2px rgba(255,255,255,.3)',
    }}>
      <div style={{
        position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
        width: 12, height: 6, borderRadius: 2,
        background: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 2px)',
      }} />
    </div>
  );
}

function TShirtArt() {
  return (
    <div style={{
      width: 40, height: 32, position: 'relative',
      background: 'linear-gradient(180deg, #6aa0c0 0%, #4a7a98 100%)',
      borderRadius: '6px 6px 0 0',
      boxShadow: 'inset -2px -3px 6px rgba(0,0,0,.15), inset 1px 1px 2px rgba(255,255,255,.3)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: -6, width: 10, height: 12,
        background: 'linear-gradient(180deg, #6aa0c0 0%, #4a7a98 100%)',
        borderRadius: '4px 0 0 4px',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: -6, width: 10, height: 12,
        background: 'linear-gradient(180deg, #6aa0c0 0%, #4a7a98 100%)',
        borderRadius: '0 4px 4px 0',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 5, background: '#3a6080', borderRadius: '0 0 7px 7px',
      }} />
    </div>
  );
}

function HomeworkArt() {
  return (
    <div style={{
      width: 40, height: 28, position: 'relative',
      background: 'linear-gradient(180deg, #f9eed8 0%, #e8d4a8 100%)',
      borderRadius: 2,
      boxShadow: '0 2px 4px rgba(60,40,20,.3), inset -1px -2px 3px rgba(0,0,0,.1)',
      transform: 'rotate(-3deg)',
    }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          position: 'absolute', top: 5 + i * 5, left: 5, right: 5,
          height: 1, background: 'rgba(140,100,40,.3)',
        }} />
      ))}
      <div style={{
        position: 'absolute', top: -4, right: -8,
        width: 22, height: 4,
        background: 'linear-gradient(90deg, #d97706 0%, #f5a830 80%, #5a3a20 100%)',
        borderRadius: 1,
        transform: 'rotate(-25deg)',
      }} />
    </div>
  );
}

function BookArt() {
  return (
    <div style={{
      width: 30, height: 36, position: 'relative',
      background: 'linear-gradient(90deg, #a06840 0%, #7a4818 100%)',
      borderRadius: '2px 4px 4px 2px',
      boxShadow: 'inset -2px -2px 5px rgba(0,0,0,.3)',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: 3, right: 3, bottom: 3,
        background: '#f9eed8', borderRadius: 1,
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute', top: 6 + i * 6, left: 4, right: 4,
            height: 1, background: 'rgba(140,100,40,.5)',
          }} />
        ))}
      </div>
    </div>
  );
}

function PajamaArt() {
  return (
    <div style={{
      width: 40, height: 32, position: 'relative',
      background: 'linear-gradient(180deg, #b89ac8 0%, #8a6aa0 100%)',
      borderRadius: '6px 6px 0 0',
      boxShadow: 'inset -2px -3px 6px rgba(0,0,0,.2), inset 1px 1px 2px rgba(255,255,255,.3)',
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          position: 'absolute', top: 6 + i * 7, left: 0, right: 0,
          height: 2, background: 'rgba(254,243,199,.4)',
        }} />
      ))}
      <div style={{
        position: 'absolute', top: 0, left: -6, width: 10, height: 14,
        background: '#9a7ab8', borderRadius: '4px 0 0 4px',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: -6, width: 10, height: 14,
        background: '#9a7ab8', borderRadius: '0 4px 4px 0',
      }} />
    </div>
  );
}

function NightlightArt() {
  return (
    <div style={{ width: 26, height: 30, position: 'relative' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 4, right: 4, height: 8,
        background: 'linear-gradient(180deg, #5a4030 0%, #3a2818 100%)',
        borderRadius: '2px 2px 4px 4px',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 22,
        background: 'radial-gradient(ellipse at 50% 50%, #fde68a 0%, #f5b840 60%, #d97706 100%)',
        borderRadius: '50% 50% 30% 30%',
        boxShadow: '0 0 20px rgba(252,211,77,.7)',
      }} />
    </div>
  );
}

function SunArt() {
  return (
    <div style={{ position: 'relative', width: 32, height: 30 }}>
      <div style={{
        position: 'absolute', bottom: 0, left: -4, right: -4, height: 12,
        background: '#3a5a3a', borderRadius: '50% 50% 0 0',
      }} />
      <div style={{
        position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
        width: 16, height: 16, borderRadius: '50%',
        background: 'radial-gradient(circle, #fde68a 0%, #f59e0b 100%)',
        boxShadow: '0 0 10px rgba(252,211,77,.6)',
      }} />
    </div>
  );
}

function PlateArt() {
  return (
    <div style={{
      width: 36, height: 36, position: 'relative',
      background: 'radial-gradient(circle at 30% 30%, #fff 0%, #f4e8d4 30%, #d4b890 100%)',
      borderRadius: '50%',
      boxShadow: '0 2px 4px rgba(60,40,20,.25), inset -2px -3px 6px rgba(0,0,0,.15)',
    }}>
      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8, bottom: 10,
        background: 'radial-gradient(circle at 40% 40%, #d97706 0%, #92400e 80%)',
        borderRadius: '50%',
      }} />
    </div>
  );
}

function Badge({ variant, stageIdx, sleep, compact }) {
  return (
    <MoodChibi size={compact ? 22 : 36} variant={variant} stage={stageIdx} mood={sleep ? 'müde' : 'normal'} bare />
  );
}
