import React, { useState, useMemo, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { getCatStage, getDragonArt } from '../utils/helpers';
import { ARCS, findArc } from '../arcs/arcs';
import { Pearl } from './CurrencyIcons';
import { SEED_BY_ID, SEED_CREATURES } from '../data/creatures';
import { isDevMode } from '../utils/mode';
import { getVariant } from '../data/companionVariants';
import SFX from '../utils/sfx';
import { useGameAccess } from '../hooks/useGameAccess';
import { biomeBackground } from '../utils/biomeBackgrounds';
import MoodChibi from './MoodChibi';

/**
 * Companion Profile — Ronki Profile Polish v2.
 * Living Scene hero (CSS gold-hour stage with hills, embers, breathing portrait)
 * Rarity banner · Name block
 * Pflege card (kickered, cream→amber)
 * Mini-Spiele hero CTA (gold unlocked / dashed locked)
 * Freunde circle-thumb card
 * Tab bar (teal-filled active)
 * About: plain italic bio + Material-icon fun facts + flat Chronik links
 * Details: evolution (dev) + stats + weight/height
 * Strengths: progress-bar rows with scores
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
// Labels kept to first-grade-readable German (per Marc: "wesenszüge und sanftmütig
// are not really words that kids know"). "Stärken" replaces the "Wesenszüge" frame.
// `score` is a progress-bar heuristic (0-100) based on live state so the strengths
// tab feels responsive without waiting on Phase 2 arc grants.
const TRAIT_POOL = [
  { id: 'brave',    label: { de: 'Mutig',      en: 'Brave' },    icon: 'shield',        color: '#f59e0b', when: (s) => (s.arcEngine?.completedArcIds?.length || 0) >= 1, score: (s) => clamp(40 + (s.arcEngine?.completedArcIds?.length || 0) * 15) },
  { id: 'gentle',   label: { de: 'Lieb',       en: 'Kind' },     icon: 'favorite',      color: '#f472b6', when: (s) => (s.catEvo || 0) >= 3,                                score: (s) => clamp(30 + (s.catEvo || 0) * 10) },
  { id: 'curious',  label: { de: 'Neugierig',  en: 'Curious' },  icon: 'explore',       color: '#0ea5e9', when: (s) => true,                                                score: (s) => clamp(55 + (s.micropediaDiscovered?.length || 0) * 6) },
  { id: 'loyal',    label: { de: 'Treu',       en: 'Loyal' },    icon: 'handshake',     color: '#34d399', when: (s) => (s.totalTaskDays || 0) >= 3,                         score: (s) => clamp(35 + (s.totalTaskDays || 0) * 4) },
  { id: 'dreamer',  label: { de: 'Träumer',    en: 'Dreamer' },  icon: 'auto_awesome',  color: '#a855f7', when: (s) => (s.journalHistory?.length || 0) >= 3,                score: (s) => clamp(35 + (s.journalHistory?.length || 0) * 8) },
  { id: 'mapmaker', label: { de: 'Entdecker',  en: 'Explorer' }, icon: 'map',           color: '#fb923c', when: (s) => (s.arcEngine?.completedArcIds || []).includes('first-adventure'), score: (s) => (s.arcEngine?.completedArcIds || []).includes('first-adventure') ? 90 : 40 },
];

function clamp(n) { return Math.max(20, Math.min(100, Math.round(n))); }

const base = import.meta.env.BASE_URL;

// ── Bonding Agent ──
// Sad-day reaction cards. Returned as a plain array so the component
// stays simple. If Louis has taught Ronki a skill (e.g. Box-Atmung), a
// 4th card appears letting Ronki offer it back — the Rollentausch
// moment the Feature Previews spec calls "the deepest bonding move of
// all engagement reports".
function SAD_REACTIONS(lang, hasLearnedBox) {
  const base = [
    {
      id: 'kuscheln',
      emoji: '🫂',
      iconBg: 'rgba(236,72,153,0.15)',
      title: lang === 'de' ? 'Kuscheln' : 'Cuddle',
      sub: lang === 'de' ? 'Leise neben ihm sitzen · nichts müssen' : 'Sit beside him · no pressure',
    },
    {
      id: 'stille',
      emoji: '🪷',
      iconBg: 'rgba(167,139,250,0.18)',
      title: lang === 'de' ? 'Still zusammen sitzen' : 'Sit in silence',
      sub: lang === 'de' ? 'Einfach da sein · 3 Min Stille' : 'Just be there · 3 min silence',
    },
    {
      id: 'tee',
      emoji: '🍵',
      iconBg: 'rgba(52,211,153,0.18)',
      title: lang === 'de' ? 'Warmen Tee kochen' : 'Make warm tea',
      sub: lang === 'de' ? 'Für Ronki und dich · kleine Geste' : 'For Ronki and you · small gesture',
    },
  ];
  if (hasLearnedBox) {
    base.push({
      id: 'atmen',
      emoji: '🌬️',
      iconBg: 'rgba(14,165,233,0.18)',
      title: lang === 'de' ? 'Atmen mit Ronki' : 'Breathe with Ronki',
      sub: lang === 'de' ? 'Box-Atmung · die er von dir gelernt hat' : 'Box breathing · the skill he learned from you',
    });
  }
  return base;
}

// Section kicker — Plus Jakarta 800/10 uppercase, .22em letter-spacing, teal.
// Used above each major card per Polish v2 spec.
function Kicker({ children }) {
  return (
    <p className="mb-2 ml-1" style={{
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontWeight: 800,
      fontSize: 10,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: '#124346',
      margin: '0 0 8px 4px',
    }}>
      {children}
    </p>
  );
}

export default function RonkiProfile({ onNavigate }) {
  const { t, lang } = useTranslation();
  const { state, actions } = useTask();
  const { unlocked: gamesUnlocked } = useGameAccess();
  const [tab, setTab] = useState('about');
  const [thankYou, setThankYou] = useState(null); // thank-you bubble after a reaction choice
  const dev = isDevMode();

  // Bonding Agent sync — run once per mount. Expires yesterday's bad
  // mood and fires a new scheduled bad day if due. Idempotent per-day.
  useEffect(() => {
    actions.syncRonkiMood?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Care action wrapper — plays pop, triggers haptic, runs the action.
  // Pulled up from Sanctuary so Louis can Füttern/Streicheln/Spielen
  // without a separate Pflege tab (nav merged April 2026).
  const handleCare = (action, alreadyDone) => {
    if (alreadyDone) return;
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(100);
    action();
  };

  // Gentle reaction on a bad-Ronki day. All choices are "right" — no
  // XP, no winner. Writes a journal memory via TaskContext + shows a
  // brief thank-you bubble, then reverts to normal mood.
  const handleSadReaction = (reactionId) => {
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(40);
    actions.pickRonkiSadReaction?.(reactionId);
    const thanks = lang === 'de' ? 'Danke, Louis.' : 'Thank you, Louis.';
    setThankYou(thanks);
    setTimeout(() => setThankYou(t => (t === thanks ? null : t)), 2800);
  };

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

  // Rarity label under Ronki (stage · rarity). Stage name in dev mode,
  // variant name in public mode — same identity rule as before.
  const rarityLabel = dev
    ? stageName
    : (state.companionVariant
      ? (getVariant(state.companionVariant).name[lang] || getVariant(state.companionVariant).name.de)
      : stageName);
  const rarityRare = lang === 'de' ? 'Rar' : 'Rare';

  // ── Bonding Agent ──
  // Ronki's mood drives portrait + Pflege action set. On a bad day
  // ('sad' / 'tired'), the mood-portrait takes on a tinted circle with
  // rain or z particles; the Pflege card replaces Füttern/Streicheln/
  // Spielen with three gentle reactions. Louis's mood (moodAM/moodPM)
  // is untouched — this is Ronki's state, not Louis's.
  const ronkiMood = state.ronkiMood || 'normal';
  const isBadDay = ronkiMood === 'sad' || ronkiMood === 'tired';
  const practiceCount = state.ronkiSkillPractice?.boxAtmung || 0;
  const hasLearnedBox = (state.ronkiLearnedSkills || []).includes('boxAtmung');
  const showLearnBanner = hasLearnedBox && !(state.ronkiLearnBannerSeen || {}).boxAtmung;

  return (
    <div className="relative min-h-dvh pb-32">
      {/* Biome-tinted forest-sage backdrop — Ronki = earthy biome where
           the companion lives. Cream wash dominates at the fold; sage
           green tint bleeds through at the top giving this tab its own
           creature-world mood. Cream-brush texture stays on top of the
           biome tint for painterly depth. */}
      <div className="fixed inset-0 pointer-events-none -z-20"
           style={{
             background: biomeBackground('care'),
             backgroundColor: '#fff8f2',
           }}
           aria-hidden="true" />
      <img src={base + 'art/bg-cream-brush.webp'} alt="" className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none -z-10" />

      {/* Polish v2 keyframes — gold-hour scene elements. Scoped via unique
           class names so they don't collide with other CSS in the app. */}
      <style>{`
        @keyframes rp-breathe { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.035) translateY(-3px); } }
        @keyframes rp-aura-pulse { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.12); opacity: 1; } }
        @keyframes rp-ember-rise {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-220px); opacity: 0; }
        }
      `}</style>

      <main className="max-w-lg mx-auto"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))', paddingLeft: 0, paddingRight: 0 }}>

        {/* ═══ MOOD PORTRAIT — forward-facing CSS chibi on a cream card.
             Reuses the SideRonki chibi construction; mood-skinned via
             MoodChibi (normal / sad+rain+tear / tired+zzz). Replaces the
             old img portrait per Marc's Apr 2026 brief: same character
             as the Lager view, just facing the child. ═══ */}
        <section className="relative mx-4 overflow-hidden flex flex-col items-center justify-end"
                 style={{
                   height: 320,
                   borderRadius: 24,
                   paddingTop: 16, paddingBottom: 16,
                   boxShadow: '0 14px 30px -14px rgba(18,67,70,0.35)',
                   background: ronkiMood === 'sad'
                     ? 'linear-gradient(180deg, #dbe7f2 0%, #b5c7dc 100%)'
                     : ronkiMood === 'tired'
                     ? 'linear-gradient(180deg, #e6ecf2 0%, #c5ced8 100%)'
                     : 'linear-gradient(180deg, #fffdf5 0%, #fef3c7 60%, #fcd34d 100%)',
                   transition: 'background 0.6s ease',
                 }}>
          <MoodChibi size={220} mood={ronkiMood} />

          {/* Rarity banner — gradient pill pinned at the bottom */}
          <div style={{
                 marginTop: 14,
                 display: 'inline-flex', alignItems: 'center', gap: 6,
                 padding: '7px 16px', borderRadius: 999,
                 background: ronkiMood === 'sad'
                   ? 'linear-gradient(160deg, #8ea5c0, #4f6a8a)'
                   : ronkiMood === 'tired'
                   ? 'linear-gradient(160deg, #9faab8, #5d6d7e)'
                   : 'linear-gradient(160deg, #fcd34d, #f59e0b)',
                 color: '#fff',
                 fontFamily: 'Plus Jakarta Sans, sans-serif',
                 fontWeight: 800, fontSize: 11, lineHeight: 1,
                 letterSpacing: '0.16em',
                 textTransform: 'uppercase',
                 boxShadow: '0 6px 14px -4px rgba(0,0,0,0.25)',
               }}>
            <span className="material-symbols-outlined"
                  style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            {rarityLabel.toUpperCase()} · {rarityRare.toUpperCase()}
          </div>
        </section>

        {/* ═══ NAME BLOCK — Ronki + MYSTISCHER BEGLEITER ═══ */}
        <div className="text-center" style={{ padding: '18px 16px 10px' }}>
          <h1 style={{
            margin: '0 0 4px',
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1,
            letterSpacing: '-0.015em',
            color: '#124346',
          }}>
            Ronki
          </h1>
          <p style={{
            margin: 0,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 800,
            fontSize: 10,
            lineHeight: 1,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#6b655b',
          }}>
            {ronkiMood === 'sad'
              ? (lang === 'de' ? 'Braucht dich heute' : 'Needs you today')
              : ronkiMood === 'tired'
              ? (lang === 'de' ? 'Ruht sich aus' : 'Resting')
              : (lang === 'de' ? 'Mystischer Begleiter' : 'Mystical Companion')}
          </p>
        </div>

        <div className="px-4">

          {/* ═══ PFLEGE — mood-aware care card.
               Normal days: Füttern / Streicheln / Spielen with XP rewards.
               Bad days (ronkiMood sad/tired): card morphs into the
               Bonding Agent sad-hero + 3 gentle reactions (Kuscheln /
               Stille / Tee). Louis picks one, memory lands in the Buch,
               Ronki feels seen, bad mood ends. No XP on the reactions —
               per spec "alle drei sind richtig, es gibt keinen Verlierer".
               If Ronki has learned a skill (e.g. Box-Atmung via 5× in
               Gefühlsecke), a 4th reaction "Atmen mit Ronki" appears —
               the Rollentausch moment. ═══ */}
          {isBadDay ? (
            <>
              {/* Sad hero card — kicker + name + "9 von 22 Tagen" rhythm copy.
                   Inspired by the Feature Previews sad-hero layout. */}
              <section style={{
                     padding: '18px 18px 16px',
                     borderRadius: 20,
                     background: ronkiMood === 'sad'
                       ? 'linear-gradient(160deg, #dbe7f2 0%, #b5c7dc 100%)'
                       : 'linear-gradient(160deg, #e6ecf2 0%, #c5ced8 100%)',
                     border: '1px solid rgba(90,115,150,0.22)',
                     boxShadow: '0 6px 14px -8px rgba(18,67,70,0.22)',
                     marginBottom: 14,
                   }}>
                <p className="font-label font-bold"
                   style={{ fontSize: 10, lineHeight: 1, letterSpacing: '0.22em', textTransform: 'uppercase', color: ronkiMood === 'sad' ? '#2f3d5a' : '#26333c', margin: '0 0 8px 0' }}>
                  {lang === 'de' ? 'Heute' : 'Today'}
                </p>
                <h2 className="font-headline font-bold"
                    style={{ fontSize: 22, lineHeight: 1.15, color: ronkiMood === 'sad' ? '#1f2d47' : '#1a2530', margin: '0 0 6px 0' }}>
                  {ronkiMood === 'sad'
                    ? (lang === 'de' ? 'Ronki ist heute traurig.' : 'Ronki is sad today.')
                    : (lang === 'de' ? 'Ronki ist heute müde.' : 'Ronki is tired today.')}
                </h2>
                <p className="font-body"
                   style={{ fontSize: 13, lineHeight: 1.4, color: ronkiMood === 'sad' ? 'rgba(47,61,90,0.78)' : 'rgba(38,51,60,0.78)', margin: 0 }}>
                  {lang === 'de'
                    ? 'Manchmal passiert das einfach. Was soll Louis tun?'
                    : 'It just happens sometimes. What should Louis do?'}
                </p>
              </section>

              {/* 3 (or 4) gentle reactions — no XP. */}
              <Kicker>{lang === 'de' ? 'Wähle eine sanfte Reaktion' : 'Pick a gentle response'}</Kicker>
              <p className="font-body italic"
                 style={{ fontSize: 13, color: '#5a6b8c', margin: '0 0 10px 4px' }}>
                {lang === 'de' ? '„Was braucht Ronki gerade von dir?"' : '"What does Ronki need from you right now?"'}
              </p>
              <section style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SAD_REACTIONS(lang, hasLearnedBox).map(r => (
                  <button key={r.id}
                    onClick={() => handleSadReaction(r.id)}
                    className="w-full flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                    style={{
                      padding: '14px 16px',
                      borderRadius: 18,
                      background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.85))',
                      border: '1.5px solid rgba(90,115,150,0.2)',
                      boxShadow: '0 4px 12px -6px rgba(18,67,70,0.18)',
                    }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: r.iconBg,
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 22 }}>{r.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <b className="font-headline" style={{ fontSize: 15, lineHeight: 1.2, color: '#124346', display: 'block' }}>
                        {r.title}
                      </b>
                      <span className="font-body" style={{ fontSize: 12, lineHeight: 1.3, color: 'rgba(18,67,70,0.65)' }}>
                        {r.sub}
                      </span>
                    </div>
                  </button>
                ))}
              </section>
            </>
          ) : (
            <>
              <Kicker>{lang === 'de' ? 'Pflege heute' : 'Care today'}</Kicker>
              <section style={{
                         padding: '14px 16px',
                         borderRadius: 20,
                         background: 'linear-gradient(160deg, #fffdf5, #fef3c7)',
                         border: '1px solid rgba(245,158,11,0.2)',
                         boxShadow: '0 6px 14px -8px rgba(245,158,11,0.2)',
                         marginBottom: 14,
                       }}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'fed',    state: state.catFed,    onTap: actions.feedCompanion, icon: 'cookie',          label: t('care.feed'), reward: 5, color: '#f59e0b' },
                    { key: 'petted', state: state.catPetted, onTap: actions.petCompanion,  icon: 'favorite',        label: t('care.pet'),  reward: 3, color: '#ec4899' },
                    { key: 'played', state: state.catPlayed, onTap: actions.playCompanion, icon: 'sports_baseball', label: t('care.play'), reward: 8, color: '#124346' },
                  ].map(a => (
                    <button key={a.key}
                      onClick={() => handleCare(a.onTap, a.state)}
                      disabled={a.state}
                      className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                      style={{ opacity: a.state ? 0.7 : 1 }}>
                      <div className="w-full aspect-square rounded-2xl flex items-center justify-center"
                           style={{
                             background: a.state
                               ? 'rgba(52,211,153,0.12)'
                               : 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                             border: a.state ? '1.5px solid rgba(52,211,153,0.45)' : '1.5px solid rgba(255,255,255,0.9)',
                             boxShadow: a.state
                               ? '0 2px 8px rgba(5,150,105,0.1)'
                               : '0 4px 14px -4px rgba(245,158,11,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
                           }}>
                        <span className="material-symbols-outlined"
                              style={{
                                fontSize: 34,
                                color: a.state ? '#059669' : a.color,
                                fontVariationSettings: "'FILL' 1",
                              }}>
                          {a.state ? 'check_circle' : a.icon}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-headline font-bold text-sm text-on-surface leading-none">
                          {a.label}
                        </span>
                        {a.state ? (
                          <span className="font-label font-bold text-[10px] uppercase tracking-widest" style={{ color: '#059669' }}>
                            {t('care.done')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-label font-bold text-[11px]" style={{ color: '#725b00' }}>
                            <Pearl size={10} />+{a.reward}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ═══ BOX-ATMUNG TEACHING BLOCK ═══
               Persistent — visible on normal days AND bad days. Shows a
               live "Dein Fortschritt X von 5" counter that Louis advances
               by using the breathing exercise in Gefühlsecke. At 5:
               Ronki "learns" it (see ronkiLearnedSkills). The teal square
               diagram is a visual cue of the 4-step pattern (Einatmen /
               Halten / Ausatmen / Ruhen, 4 seconds each). This is the
               spec's "Louis bringt Ronki bei" moment. */}
          {!hasLearnedBox && (
            <>
              <Kicker>{lang === 'de' ? 'Louis bringt Ronki bei' : 'Louis teaches Ronki'}</Kicker>
              <section style={{
                         padding: '16px 18px',
                         borderRadius: 20,
                         background: 'linear-gradient(160deg, #e0f2fe, #bae6fd)',
                         border: '1px solid rgba(14,165,233,0.25)',
                         boxShadow: '0 6px 14px -8px rgba(14,165,233,0.25)',
                         marginBottom: 14,
                       }}>
                <div className="flex items-start gap-3 mb-3">
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #38bdf8, #0369a1)',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    boxShadow: '0 3px 8px -3px rgba(14,165,233,0.5)',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>air</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="font-headline" style={{ fontSize: 16, lineHeight: 1.15, color: '#0c4a6e', display: 'block' }}>
                      {lang === 'de' ? 'Box-Atmung' : 'Box breathing'}
                    </b>
                    <span className="font-body" style={{ fontSize: 12, lineHeight: 1.35, color: 'rgba(12,74,110,0.72)' }}>
                      {lang === 'de'
                        ? 'Übe sie 5× in der Gefühlsecke. Dann lernt Ronki sie von dir.'
                        : 'Practice 5× in the Gefühlsecke. Then Ronki learns it from you.'}
                    </span>
                  </div>
                </div>
                {/* Progress row + 5 tick dots */}
                <div className="flex items-center justify-between" style={{ marginTop: 10, marginBottom: 8 }}>
                  <span className="font-label" style={{ fontSize: 11, color: 'rgba(12,74,110,0.7)', letterSpacing: '0.06em' }}>
                    {lang === 'de' ? 'Dein Fortschritt' : 'Your progress'}
                  </span>
                  <b className="font-label" style={{ fontSize: 13, color: '#0c4a6e', fontWeight: 800 }}>
                    {practiceCount} / 5
                  </b>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{
                      flex: 1, height: 8, borderRadius: 999,
                      background: i < practiceCount
                        ? 'linear-gradient(90deg, #38bdf8, #0369a1)'
                        : 'rgba(14,165,233,0.18)',
                      transition: 'background 0.4s ease',
                    }} />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ═══ LEARN BANNER ═══
               Fires the once Ronki crosses the learn threshold for a skill.
               Golden, dismissable, marks ronkiLearnBannerSeen so it
               doesn't re-show on next app open. Next bad-Ronki day Ronki
               will offer the skill back to Louis (Rollentausch). */}
          {showLearnBanner && (
            <section style={{
                     padding: '14px 16px',
                     borderRadius: 18,
                     marginBottom: 14,
                     background: 'linear-gradient(160deg, #fef3c7, #fcd34d)',
                     border: '1.5px solid rgba(245,158,11,0.45)',
                     boxShadow: '0 6px 16px -6px rgba(245,158,11,0.45)',
                     display: 'flex', alignItems: 'center', gap: 12,
                   }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.85)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 22 }}>🌬️</span>
              </div>
              <div className="flex-1 min-w-0">
                <b className="font-headline" style={{ fontSize: 14, color: '#78350f', display: 'block', lineHeight: 1.2 }}>
                  {lang === 'de' ? 'Ronki hat Box-Atmung gelernt!' : 'Ronki learned box breathing!'}
                </b>
                <span className="font-body" style={{ fontSize: 11, color: 'rgba(120,53,15,0.75)', lineHeight: 1.3 }}>
                  {lang === 'de' ? 'Nächstes Mal atmet er mit dir — ohne Worte.' : 'Next time he\'ll breathe with you — without words.'}
                </span>
              </div>
              <button
                aria-label={lang === 'de' ? 'Schließen' : 'Close'}
                onClick={() => actions.markLearnBannerSeen?.('boxAtmung')}
                className="active:scale-95 transition-transform"
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.7)', border: 'none',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                  flexShrink: 0,
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#78350f' }}>close</span>
              </button>
            </section>
          )}

          {/* ═══ SPIELE MIT RONKI — hero CTA (Polish v2 .rp-hero-cta variant).
               Most interactive card after the hero, so it sits directly under
               Pflege and above Freunde. Unlocked = gold gradient with white
               icon circle; locked = dashed amber stroke on cream. ═══ */}
          <button
            onClick={() => gamesUnlocked ? onNavigate?.('games') : null}
            disabled={!gamesUnlocked}
            className={`w-full grid items-center text-left transition-all ${gamesUnlocked ? 'active:scale-[0.98]' : ''}`}
            style={{
              gridTemplateColumns: '40px 1fr 32px',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 18,
              marginBottom: 14,
              background: gamesUnlocked
                ? 'linear-gradient(160deg, #fcd34d, #f59e0b)'
                : 'linear-gradient(160deg, #fffdf5, #fef3c7)',
              border: gamesUnlocked
                ? '1.5px solid transparent'
                : '1.5px dashed rgba(245,158,11,0.5)',
              boxShadow: gamesUnlocked
                ? '0 8px 18px -6px rgba(245,158,11,0.45)'
                : '0 4px 10px -6px rgba(245,158,11,0.18)',
              opacity: gamesUnlocked ? 1 : 0.95,
            }}
          >
            {/* 40px white icon circle (unlocked) / amber tinted (locked) */}
            <div className="flex items-center justify-center shrink-0"
                 style={{
                   width: 40, height: 40, borderRadius: '50%',
                   background: gamesUnlocked ? '#ffffff' : 'rgba(245,158,11,0.12)',
                   boxShadow: gamesUnlocked ? '0 2px 6px rgba(120,53,15,0.18)' : 'none',
                 }}>
              <span className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: '#b45309',
                      fontVariationSettings: "'FILL' 1, 'wght' 600",
                    }}>
                {gamesUnlocked ? 'sports_esports' : 'lock'}
              </span>
            </div>

            {/* Body: kicker + title + subtitle */}
            <div className="min-w-0">
              <span style={{
                display: 'block',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800, fontSize: 10, lineHeight: 1,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: gamesUnlocked ? 'rgba(255,255,255,0.9)' : '#b45309',
                marginBottom: 3,
              }}>
                {lang === 'de' ? 'Mini-Spiele' : 'Mini games'}
              </span>
              <b style={{
                display: 'block',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 800, fontSize: 15, lineHeight: 1.1,
                color: gamesUnlocked ? '#2a2005' : '#124346',
              }}>
                {t('ronki.playWithRonki')}
              </b>
              <span style={{
                display: 'block',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 500, fontSize: 11, lineHeight: 1.3,
                color: gamesUnlocked ? '#5c4508' : '#6b655b',
                marginTop: 2,
              }}>
                {gamesUnlocked ? t('ronki.playWithRonki.subtitle') : t('ronki.playWithRonki.locked')}
              </span>
            </div>

            {/* Chev / lock on right */}
            <div className="flex items-center justify-center shrink-0"
                 style={{
                   width: 32, height: 32, borderRadius: '50%',
                   background: gamesUnlocked ? 'rgba(255,255,255,0.9)' : 'transparent',
                 }}>
              <span className="material-symbols-outlined"
                    style={{ fontSize: 18, color: '#b45309', fontVariationSettings: "'FILL' 1" }}>
                {gamesUnlocked ? 'arrow_forward' : 'lock_open'}
              </span>
            </div>
          </button>

          {/* ═══ FREUNDE — kickered card, circular 48px thumbnails ═══ */}
          <Kicker>{lang === 'de' ? 'Freunde' : 'Friends'}</Kicker>
          <button
            onClick={() => onNavigate?.('micropedia')}
            className="w-full rounded-2xl p-4 active:scale-[0.98] transition-transform text-left"
            style={{
              background: 'linear-gradient(135deg, #fff8f2 0%, #fef3c7 100%)',
              border: '1.5px solid rgba(252,211,77,0.3)',
              boxShadow: '0 4px 16px rgba(252,211,77,0.15)',
              marginBottom: 14,
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
                       className="w-12 h-12 rounded-full overflow-hidden"
                       style={{ border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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

          {/* ═══ HELDEN-KODEX BUTTON (public mode) — independent feature,
               kept distinct from the v2 kickered cards. Remains loud gold
               because it's the only CTA toward the lighter Kodex page. ═══ */}
          {!dev && (
            <button
              onClick={() => onNavigate?.('kodex')}
              className="w-full rounded-2xl p-5 mb-5 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
              style={{
                background: 'linear-gradient(160deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)',
                boxShadow: '0 4px 16px rgba(252,211,77,0.3)',
              }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: '#ffffff', border: '2.5px solid rgba(120,53,15,0.15)', boxShadow: '0 2px 8px rgba(120,53,15,0.12)' }}>
                <span className="material-symbols-outlined text-2xl"
                      style={{ color: '#dc2626', fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </div>
              <div className="flex-1">
                <p className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: '#78350f' }}>
                  {lang === 'de' ? 'Für Helden' : 'For heroes'}
                </p>
                <h4 className="font-headline font-bold text-lg leading-tight" style={{ color: '#78350f' }}>
                  {lang === 'de' ? 'Was einen Helden ausmacht' : 'What makes a hero'}
                </h4>
              </div>
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: '#ffffff', border: '2.5px solid rgba(120,53,15,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <span className="material-symbols-outlined text-xl"
                      style={{ color: '#78350f', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
              </div>
            </button>
          )}

          {/* ═══ TAB BAR — v2 flipped: active = filled teal with cream text ═══ */}
          <Kicker>{lang === 'de' ? 'Mein Drache' : 'My dragon'}</Kicker>
          <div className="flex gap-1 mb-5"
               style={{
                 padding: 4,
                 borderRadius: 14,
                 background: 'rgba(18,67,70,0.06)',
               }}>
            {[
              { id: 'about', label: lang === 'de' ? 'Über' : 'About', icon: 'info' },
              { id: 'details', label: 'Details', icon: 'analytics' },
              { id: 'traits', label: lang === 'de' ? 'Stärken' : 'Strengths', icon: 'psychology' },
            ].map(tb => (
              <button key={tb.id}
                onClick={() => setTab(tb.id)}
                className="flex-1 flex items-center justify-center gap-1.5 transition-all"
                style={{
                  padding: '10px 6px',
                  borderRadius: 11,
                  background: tab === tb.id ? '#124346' : 'transparent',
                  color: tab === tb.id ? '#fef3c7' : '#6b655b',
                  boxShadow: tab === tb.id ? '0 3px 8px -3px rgba(18,67,70,0.35)' : 'none',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.06em',
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
              {/* Bio — no card chrome (v2 .rp-about): plain italic teal */}
              <p style={{
                margin: 0,
                padding: '4px 2px 0',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 500,
                fontSize: 13,
                lineHeight: 1.5,
                color: '#124346',
                fontStyle: 'italic',
                textWrap: 'pretty',
              }}>
                {completedArcs.length > 0
                  ? (lang === 'de'
                    ? `Ronki schlüpfte am Tag, als ${heroName} sein erstes Abenteuer begann. Seitdem haben die beiden ${completedArcs.length} Abenteuer bestanden und ${daysTogether} Tage Seite an Seite verbracht. ${FACTS.motto.de}`
                    : `Ronki hatched on the day ${heroName} started their first adventure. Since then, they've survived ${completedArcs.length} adventure${completedArcs.length !== 1 ? 's' : ''} and spent ${daysTogether} days side by side. ${FACTS.motto.en}`)
                  : (lang === 'de'
                    ? `Ronki ist gerade erst geschlüpft und wartet auf das erste gemeinsame Abenteuer mit ${heroName}. ${FACTS.motto.de}`
                    : `Ronki just hatched and is waiting for their first adventure with ${heroName}. ${FACTS.motto.en}`)
                }
              </p>

              {/* Fun facts grid — Material Symbols, Plus Jakarta 800/9 labels */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: lang === 'de' ? 'Spezies' : 'Species', value: FACTS.species[lang] || FACTS.species.de, icon: 'pets' },
                  { label: lang === 'de' ? 'Größe' : 'Height',    value: FACTS.heights[stage],                    icon: 'straighten' },
                  { label: lang === 'de' ? 'Mag' : 'Likes',       value: FACTS.likes[lang] || FACTS.likes.de,     icon: 'favorite' },
                  { label: lang === 'de' ? 'Talent' : 'Talent',   value: FACTS.talent[lang] || FACTS.talent.de,   icon: 'star' },
                ].map((fact, i) => (
                  <div key={i} className="rounded-xl px-4 py-3"
                       style={{ background: 'rgba(18,67,70,0.03)', border: '1px solid rgba(18,67,70,0.06)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined"
                            style={{ fontSize: 16, color: '#b45309', fontVariationSettings: "'FILL' 1" }}>
                        {fact.icon}
                      </span>
                      <span style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontWeight: 800, fontSize: 9, lineHeight: 1,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: '#124346',
                      }}>
                        {fact.label}
                      </span>
                    </div>
                    <p className="font-headline font-bold text-sm text-on-surface leading-tight">{fact.value}</p>
                  </div>
                ))}
              </div>

              {/* CHRONIK section — kicker over both flat links */}
              <div>
                <Kicker>{lang === 'de' ? 'Chronik' : 'Chronicle'}</Kicker>

                {/* Memory card — demoted to flat white chronik-link */}
                <button className="w-full p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                     style={{
                       borderRadius: 14,
                       background: '#fff',
                       border: '1px solid rgba(18,67,70,0.12)',
                       marginBottom: 8,
                     }}
                     onClick={() => onNavigate?.('discovery')}>
                  <span className="material-symbols-outlined"
                        style={{ fontSize: 22, color: '#b45309', fontVariationSettings: "'FILL' 1" }}>
                    auto_stories
                  </span>
                  <div className="flex-1 min-w-0">
                    <b style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, lineHeight: 1.2, color: '#124346' }}>
                      {completedArcs.length > 0 ? (() => {
                        const arc = findArc(completedArcs[completedArcs.length - 1]);
                        return arc ? t(arc.titleKey) : (lang === 'de' ? 'Abenteuer' : 'Adventure');
                      })() : (lang === 'de' ? 'Abenteuer-Chronik' : 'Discovery Log')}
                    </b>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 11, lineHeight: 1.3, color: '#6b655b' }}>
                      {completedArcs.length > 0
                        ? `${completedArcs.length} ${lang === 'de' ? 'Abenteuer bestanden' : 'adventures survived'}`
                        : (lang === 'de' ? 'Deine Geschichte beginnt bald!' : 'Your story begins soon!')}
                    </span>
                  </div>
                  <span className="material-symbols-outlined"
                        style={{ fontSize: 18, color: '#6b655b' }}>
                    chevron_right
                  </span>
                </button>

                {/* Erinnerungen — demoted to flat white chronik-link
                     (bosses + badges summary preserved). */}
                <button className="w-full p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                     style={{
                       borderRadius: 14,
                       background: '#fff',
                       border: '1px solid rgba(18,67,70,0.12)',
                     }}
                     onClick={() => onNavigate?.('memories')}>
                  <span className="material-symbols-outlined"
                        style={{ fontSize: 22, color: '#b45309', fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <div className="flex-1 min-w-0">
                    <b style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, lineHeight: 1.2, color: '#124346' }}>
                      {lang === 'de' ? 'Erinnerungen' : 'Memories'}
                    </b>
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 11, lineHeight: 1.3, color: '#6b655b' }}>
                      {(() => {
                        const parts = [];
                        const bosses = state.bossTrophies?.length ? [...new Set(state.bossTrophies)].length : 0;
                        const badges = state.unlockedBadges?.length || 0;
                        if (bosses) parts.push(lang === 'de' ? `${bosses} Bosse` : `${bosses} boss${bosses !== 1 ? 'es' : ''}`);
                        if (badges) parts.push(lang === 'de' ? `${badges} Abzeichen` : `${badges} badge${badges !== 1 ? 's' : ''}`);
                        return parts.join(' · ') || (lang === 'de' ? 'Deine Geschichte beginnt hier' : 'Your story begins here');
                      })()}
                    </span>
                  </div>
                  <span className="material-symbols-outlined"
                        style={{ fontSize: 18, color: '#6b655b' }}>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ═══ DETAILS TAB ═══ */}
          {tab === 'details' && (
            <div className="flex flex-col gap-5">
              {/* Evolution progress (dev only) */}
              {dev && (
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
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: lang === 'de' ? 'Tage zusammen' : 'Days together', value: daysTogether, icon: 'calendar_month', color: '#124346' },
                  { label: lang === 'de' ? 'Sterne' : 'Stars', value: state.hp || 0, icon: 'diamond', color: '#f59e0b' },
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

          {/* ═══ TRAITS (STÄRKEN) TAB — progress-bar rows per v2 ═══ */}
          {tab === 'traits' && (
            <div className="flex flex-col gap-5">
              {/* Earned strengths with progress bars + numeric scores */}
              <div className="rounded-2xl p-5"
                   style={{ background: '#ffffff', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  <span className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest">
                    {lang === 'de' ? 'Ronkis Wesen' : "Ronki's Traits"}
                  </span>
                </div>
                <div className="flex flex-col gap-2" style={{ padding: '4px 2px 0' }}>
                  {earnedTraits.map(tr => {
                    const score = tr.score(state);
                    return (
                      <div key={tr.id}
                           className="grid items-center"
                           style={{ gridTemplateColumns: '80px 1fr 32px', gap: 10 }}>
                        <b style={{
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          fontWeight: 700, fontSize: 12, lineHeight: 1,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          color: '#124346',
                        }}>
                          {tr.label[lang] || tr.label.de}
                        </b>
                        <div style={{
                          height: 8, borderRadius: 999,
                          background: 'rgba(18,67,70,0.08)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${score}%`, height: '100%',
                            background: 'linear-gradient(90deg, #fcd34d, #f59e0b)',
                            borderRadius: 999,
                            transition: 'width .7s ease',
                          }} />
                        </div>
                        <span style={{
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          fontWeight: 800, fontSize: 12, lineHeight: 1,
                          color: '#b45309',
                          textAlign: 'right',
                        }}>
                          {score}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="font-body text-xs text-on-surface-variant mt-4 italic leading-relaxed">
                  {lang === 'de'
                    ? 'Ronki wird bei jedem Abenteuer stärker.'
                    : 'Ronki grows stronger with every adventure.'}
                </p>
              </div>

              {/* Locked preview — kept simple, dashed card */}
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
                      {lang === 'de' ? 'Alle Stärken entdeckt!' : 'All strengths discovered!'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Thank-you bubble — shown for ~2.8s after Louis picks a gentle
           reaction on a bad-Ronki day. Simple centered pill; does not
           block interaction. "Alle drei sind richtig" per spec. The
           `<style>` block lives OUTSIDE role="status" so screen readers
           don't announce the raw CSS with aria-live. */}
      <style>{`
        @keyframes rp-thx-in {
          from { opacity: 0; transform: translateY(10px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {thankYou && (
        <div role="status" aria-live="polite"
             className="fixed inset-x-0 flex justify-center pointer-events-none"
             style={{ bottom: 120, zIndex: 400 }}>
          <div style={{
            padding: '10px 18px',
            borderRadius: 999,
            background: 'linear-gradient(160deg, #fef3c7, #fcd34d)',
            border: '1.5px solid rgba(245,158,11,0.55)',
            boxShadow: '0 8px 20px -6px rgba(245,158,11,0.55)',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontStyle: 'italic', fontWeight: 600,
            fontSize: 16, color: '#78350f',
            animation: 'rp-thx-in 0.3s ease-out',
          }}>
            {thankYou}
          </div>
        </div>
      )}
    </div>
  );
}
