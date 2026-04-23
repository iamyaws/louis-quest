import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import { useHaptic } from '../hooks/useHaptic';
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

// ── Mood-description card copy + palette ──
// Compact horizontal card shown under the portrait on every day. Day
// count ("3 Tage · Heute") + bold mood title + short body. On bad days
// the body nudges toward the three reaction cards below.

const MOOD_CARD_BG = {
  normal: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
  sad:    'linear-gradient(160deg, #eef4fa 0%, #d6e3f0 100%)',
  tired:  'linear-gradient(160deg, #eef2f6 0%, #d1dae3 100%)',
};
const MOOD_CARD_BORDER = {
  normal: 'rgba(245,158,11,0.2)',
  sad:    'rgba(90,115,150,0.22)',
  tired:  'rgba(93,125,148,0.22)',
};
const MOOD_CARD_INK = { normal: '#A83E2C', sad: '#2f3d5a', tired: '#26333c' };
const MOOD_CARD_HEAD = { normal: '#124346', sad: '#1f2d47', tired: '#1a2530' };
const MOOD_CARD_SUB = { normal: 'rgba(18,67,70,0.72)', sad: 'rgba(47,61,90,0.78)', tired: 'rgba(38,51,60,0.78)' };

const MOOD_CARD_COPY = {
  normal: {
    title: { de: 'Ronki ist gut drauf.', en: 'Ronki is doing well.' },
    body:  { de: 'Ein normaler Tag zusammen. Alles gut.', en: 'A normal day together. All good.' },
  },
  sad: {
    title: { de: 'Ronki ist heute traurig.', en: 'Ronki is sad today.' },
    body:  { de: 'Manchmal passiert das einfach. Was könnte Ronki helfen?', en: 'It just happens sometimes. What could help Ronki?' },
  },
  tired: {
    title: { de: 'Ronki ist heute müde.', en: 'Ronki is tired today.' },
    body:  { de: 'Leise Tage sind auch wichtig. Was tut ihm gut?', en: 'Quiet days matter too. What would feel good?' },
  },
};

// Profile-card quips — Ronki occasionally says something first-person
// on the mood card (tap the chibi to hear another line). Per Marc's
// Begleiter Polish ask 24 Apr 2026: "text things he says randomly."
// Pool per mood so a sad Ronki doesn't say chirpy lines.
const PROFILE_QUIPS = {
  normal: [
    'Die Sonne mag mich.',
    'Mein Lieblingsstein hat einen Namen.',
    'Ich könnte ewig hier sitzen.',
    'Riech mal — das ist Abenteuer.',
    'Du siehst wach aus.',
    'Erzähl mir was Neues.',
  ],
  sad: [
    'Ich bin heute leise.',
    'Bleib einfach kurz bei mir.',
    'Mein Herz ist schwer.',
    'Du musst nichts sagen.',
  ],
  tired: [
    'Mhhh, ich blinzel nur kurz.',
    'Meine Augen sind schwer.',
    'Nach dem Schläfchen spielen wir.',
    'Kuscheln ist auch Abenteuer.',
  ],
};

function pickProfileQuip(mood, rollKey) {
  const pool = PROFILE_QUIPS[mood] || PROFILE_QUIPS.normal;
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  const idx = Math.abs((dayIdx + rollKey * 2654435761) % pool.length);
  return pool[idx];
}

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
  const haptic = useHaptic();
  const { unlocked: gamesUnlocked } = useGameAccess();
  const [tab, setTab] = useState('about');
  // Finch-style drawer (Marc 23 Apr 2026): the Mein Drache tab block
  // is a collapsible card. Tapping the currently-selected tab toggles
  // the drawer open/closed; tapping a different tab switches content
  // AND opens the drawer. Default: closed, so the profile starts tidy
  // and Louis reaches for info when he wants it.
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Profile-card quip (Marc 24 Apr Begleiter Polish ask). Starts hidden
  // on mount; auto-appears after ~900 ms so the mood card has a moment
  // to settle first. Tap the chibi to roll a new line + reset the
  // auto-fade. Goes away after ~7 s.
  const [quipRollKey, setQuipRollKey] = useState(0);
  const [quipVisible, setQuipVisible] = useState(false);
  const quipTimerRef = useRef(null);
  const onDrawerTab = (id) => {
    if (id === tab) {
      setDrawerOpen(v => !v);
    } else {
      setTab(id);
      setDrawerOpen(true);
    }
  };
  // Top segmented control — 4 destinations inside the Ronki world.
  // Pflege is the landing (mood portrait + today's care); Freunde /
  // Spiele / Erinnerungen are first-class siblings instead of drill-ins.
  // Bottom app-nav stays the single "home" — switching segments doesn't
  // replace the main tab bar (Marc: "kids get confused by two nav bars").
  const [segment, setSegment] = useState('pflege');
  const [thankYou, setThankYou] = useState(null); // thank-you bubble after a reaction choice
  const dev = isDevMode();

  // Bonding Agent sync — run once per mount. Expires yesterday's bad
  // mood and fires a new scheduled bad day if due. Idempotent per-day.
  useEffect(() => {
    actions.syncRonkiMood?.();
    // Dev shortcut: allow ?ronkiMood=sad|tired|normal in the URL so
    // parents (and Marc during testing) can force a mood without
    // pasting into the console — Chrome blocks that on first paste.
    // Also accepts ?boxAtmung=learned and ?boxAtmung=N to seed the
    // practice counter for quick verification of the teaching flow.
    const params = new URLSearchParams(window.location.search);
    const mood = params.get('ronkiMood');
    const boxParam = params.get('boxAtmung');
    const patch = {};
    if (mood === 'sad' || mood === 'tired' || mood === 'normal' || mood === 'besorgt' || mood === 'gut' || mood === 'magisch') {
      patch.ronkiMood = mood;
      patch.ronkiMoodSetDate = mood === 'normal' ? undefined : new Date().toISOString().slice(0, 10);
    }
    if (boxParam === 'learned') {
      patch.ronkiSkillPractice = { boxAtmung: 5 };
      patch.ronkiLearnedSkills = ['boxAtmung'];
      patch.ronkiLearnBannerSeen = { boxAtmung: true };
    } else if (boxParam === 'learning') {
      patch.ronkiSkillPractice = { boxAtmung: 4 };
      patch.ronkiLearnedSkills = [];
      patch.ronkiLearnBannerSeen = {};
    } else if (boxParam && /^\d+$/.test(boxParam)) {
      const n = Math.min(5, Math.max(0, parseInt(boxParam, 10)));
      patch.ronkiSkillPractice = { boxAtmung: n };
      patch.ronkiLearnedSkills = n >= 5 ? ['boxAtmung'] : [];
    }
    // ?variant=amber|teal|rose|violet|forest|sunset — preview each
    // colorway. ?stage=0..3 — preview evolution stage. Both apply to
    // the profile mood chibi + the Begleiter icon; persist into state
    // so Louis sees the chosen combo until reset.
    const variantParam = params.get('variant');
    if (/^(amber|teal|rose|violet|forest|sunset)$/.test(variantParam || '')) {
      patch.companionVariant = variantParam;
    }
    const stageParam = params.get('stage');
    if (stageParam && /^[0-5]$/.test(stageParam)) {
      // Thresholds from constants.ts CAT_STAGES — 0 Ei, 1 Baby, 2 Jungtier,
      // 3 Stolz, 4 Heranwachsend (Teen), 5 Legendär.
      patch.catEvo = [0, 3, 9, 18, 30, 45][parseInt(stageParam, 10)];
    }
    if (Object.keys(patch).length > 0) actions.patchState?.(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Care action wrapper — plays pop, triggers haptic, runs the action.
  // Pulled up from Sanctuary so Louis can Füttern/Streicheln/Spielen
  // without a separate Pflege tab (nav merged April 2026).
  const handleCare = (action, alreadyDone) => {
    if (alreadyDone) return;
    SFX.play('pop');
    haptic('success');
    action();
  };

  // Gentle reaction on a bad-Ronki day. All choices are "right" — no
  // XP, no winner. Writes a journal memory via TaskContext + shows a
  // brief thank-you bubble, then reverts to normal mood.
  const handleSadReaction = (reactionId) => {
    SFX.play('pop');
    // 'select' — kid picks a comfort gesture, mirrors mood/variant-pick
    // category. Intentionally softer than a care-success since the ritual
    // is gentle-empathy, not a transaction.
    haptic('select');
    actions.pickRonkiSadReaction?.(reactionId);
    const thanks = lang === 'de' ? 'Danke, Louis.' : 'Thank you, Louis.';
    setThankYou(thanks);
    setTimeout(() => setThankYou(t => (t === thanks ? null : t)), 2800);
  };

  // Profile quip — show a Ronki-says bubble on mount after a short
  // delay, auto-fade at ~7s. Tapping the chibi rolls a new line +
  // resets the timer. Timer cleaned up on unmount.
  useEffect(() => {
    const showAfter = setTimeout(() => setQuipVisible(true), 900);
    const hideAfter = setTimeout(() => setQuipVisible(false), 7900);
    return () => { clearTimeout(showAfter); clearTimeout(hideAfter); };
    // Re-fires when the roll key changes so tapping resets the fade.
  }, [quipRollKey]);
  useEffect(() => () => {
    if (quipTimerRef.current) clearTimeout(quipTimerRef.current);
  }, []);
  const handleChibiTap = () => {
    SFX.play('tap');
    // 'tap' — chibi-tap rolls a new quip, UI-nav feel, not a commit.
    haptic('tap');
    setQuipRollKey(k => k + 1);
    setQuipVisible(true);
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

        <div className="px-4">

          {/* ═══ MOOD HEADER CARD — top of the profile.
               Feature-Previews sad-hero treatment (per Marc's ref image
               23 Apr 2026): card is the scene, Ronki sits directly on
               the card (no inner locket), rain / zzz / embers fall
               across the whole card. MoodChibi runs in bare mode so
               its own circular bg doesn't double-up with the card bg.
               Ronki gently sways on sad + tired days (tired-sway). */}
          <section
               className="relative overflow-hidden"
               style={{
                 display: 'grid',
                 // 60 / 40 split per Marc 23 Apr 2026.
                 gridTemplateColumns: '3fr 2fr',
                 alignItems: 'center',
                 gap: 20,
                 padding: '20px',
                 // Card needs enough vertical room for the 2.5×-bigger
                 // chibi to breathe without clipping at the card edges.
                 minHeight: 260,
                 // Top corners round; bottom is flat so it seams
                 // directly into the Mein Drache drawer below per
                 // Marc's Finch reference (one attached card).
                 borderRadius: '20px 20px 0 0',
                 background: ronkiMood === 'sad'
                   ? 'linear-gradient(160deg, #cfd8de 0%, #a4b3be 100%)'
                   : ronkiMood === 'tired'
                   ? 'linear-gradient(160deg, #d6dde4 0%, #9aa6b4 100%)'
                   : MOOD_CARD_BG.normal,
                 // Shadow only below — the drawer shares the same
                 // footprint and carries the lower shadow.
                 boxShadow: '0 -2px 0 rgba(0,0,0,0) inset',
                 marginBottom: 0,
                 transition: 'background 0.5s ease',
               }}>
            {/* Card-level highlight (sad-hero ::before) — soft radial
                 light at the top-right so the card has some dimension. */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.2), transparent 50%)',
            }} />

            {/* Ambient painterly bg blobs — Marc's Begleiter Polish ask:
                 soft color blobs behind Ronki that feel like atmosphere,
                 not pattern. Two large radial ellipses tinted by the
                 variant palette (so each colorway has its own mood
                 ambience). Low opacity + blur for a painterly feel.
                 Suppressed on sad/tired so those moods stay quiet. */}
            {ronkiMood === 'normal' && (() => {
              const variantPalette = getVariant(state?.companionVariant || 'amber').chibi;
              return (
                <>
                  <div aria-hidden="true" style={{
                    position: 'absolute',
                    top: '-15%', left: '-10%',
                    width: 220, height: 220,
                    background: `radial-gradient(circle, ${variantPalette.cheek} 0%, transparent 60%)`,
                    filter: 'blur(12px)',
                    opacity: 0.55,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }} />
                  <div aria-hidden="true" style={{
                    position: 'absolute',
                    bottom: '-20%', right: '-12%',
                    width: 260, height: 200,
                    background: `radial-gradient(ellipse, ${variantPalette.belly} 0%, transparent 65%)`,
                    filter: 'blur(14px)',
                    opacity: 0.4,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }} />
                </>
              );
            })()}

            {/* Card-scope particle layer — per-mood atmosphere that falls
                 across the WHOLE card (not just inside the chibi), matching
                 the Feature Previews .sad-hero pattern. Rain on sad days,
                 drifting z's on tired days, rising embers on normal days.
                 All mood-specific per Marc's 23 Apr 2026 directive. */}
            {ronkiMood === 'sad' && (
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
              }}>
                {[
                  { left: '10%', delay: '0s'   },
                  { left: '22%', delay: '0.3s' },
                  { left: '38%', delay: '0.7s' },
                  { left: '55%', delay: '0.2s' },
                  { left: '72%', delay: '0.9s' },
                  { left: '86%', delay: '0.5s' },
                ].map((d, i) => (
                  <span key={i} style={{
                    position: 'absolute', top: 0, left: d.left,
                    width: 1.5, height: 14,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)',
                    animation: `mc-card-rain 1.2s linear ${d.delay} infinite`,
                  }} />
                ))}
              </div>
            )}

            {ronkiMood === 'tired' && (
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
              }}>
                {[
                  { right: '18%', top: '45%', delay: '0s',   size: 18 },
                  { right: '12%', top: '35%', delay: '1.2s', size: 22 },
                  { right: '24%', top: '30%', delay: '2.4s', size: 16 },
                ].map((z, i) => (
                  <span key={i} style={{
                    position: 'absolute', right: z.right, top: z.top,
                    fontFamily: 'Fredoka, sans-serif', fontWeight: 600,
                    fontSize: z.size,
                    color: 'rgba(230,240,248,0.75)',
                    animation: `rp-card-zzz 3.6s ease-out ${z.delay} infinite`,
                  }}>z</span>
                ))}
              </div>
            )}

            {ronkiMood === 'normal' && (
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
              }}>
                {[
                  { left: '18%', delay: '0s',   duration: '4.2s' },
                  { left: '48%', delay: '1.5s', duration: '3.6s' },
                  { left: '78%', delay: '3s',   duration: '4.5s' },
                ].map((e, i) => (
                  <span key={i} style={{
                    position: 'absolute', bottom: 8, left: e.left,
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'radial-gradient(circle, #fef3c7, #f59e0b)',
                    boxShadow: '0 0 6px rgba(245,158,11,0.5)',
                    animation: `rp-card-ember ${e.duration} ease-in ${e.delay} infinite`,
                  }} />
                ))}
              </div>
            )}

            {/* Chibi column — 60% of the card (3fr side of the 3fr:2fr
                 grid). Chibi size 220 fills the column comfortably on
                 a 390 px phone without squeezing the 40% text column.
                 Centered both axes per Marc 23 Apr 2026. Tap the chibi
                 to hear another Ronki-says quip (Marc 24 Apr Begleiter
                 Polish). */}
            <div style={{
              zIndex: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              minWidth: 0,
              minHeight: 220,
            }}>
              {/* Profile-card speech bubble — Ronki says. Positioned
                   above the chibi, tail pointing down. Fades in on mount
                   + on re-tap; fades out at ~7s. */}
              <div aria-live="polite"
                   style={{
                     position: 'absolute',
                     top: 2, left: '50%',
                     transform: `translateX(-50%) translateY(${quipVisible ? 0 : 4}px) scale(${quipVisible ? 1 : 0.92})`,
                     opacity: quipVisible ? 1 : 0,
                     transition: 'opacity 0.4s ease, transform 0.4s ease',
                     pointerEvents: 'none',
                     zIndex: 3,
                     maxWidth: 180,
                     padding: '8px 12px',
                     borderRadius: 14,
                     background: '#ffffff',
                     border: '1px solid rgba(18,67,70,0.12)',
                     boxShadow: '0 8px 20px -6px rgba(18,67,70,0.2)',
                     fontFamily: 'Nunito, sans-serif',
                     fontSize: 12,
                     fontWeight: 500,
                     lineHeight: 1.3,
                     color: '#124346',
                     textAlign: 'center',
                     textWrap: 'pretty',
                   }}>
                {pickProfileQuip(ronkiMood, quipRollKey)}
                <span aria-hidden="true" style={{
                  position: 'absolute',
                  bottom: -5,
                  left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                  width: 10, height: 10,
                  background: '#fff',
                  borderRight: '1px solid rgba(18,67,70,0.12)',
                  borderBottom: '1px solid rgba(18,67,70,0.12)',
                }} />
              </div>
              <button
                onClick={handleChibiTap}
                aria-label={lang === 'de' ? 'Ronki antippen' : 'Tap Ronki'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                }}>
                <MoodChibi size={220} mood={ronkiMood} bare
                           variant={state.companionVariant}
                           stage={Math.min(3, stage)} />
              </button>
            </div>
            <div className="min-w-0" style={{ position: 'relative', zIndex: 2, minWidth: 0 }}>
              <p className="font-label font-bold"
                 style={{ fontSize: 11, lineHeight: 1, letterSpacing: '0.2em', textTransform: 'uppercase',
                          color: ronkiMood === 'sad' || ronkiMood === 'tired' ? 'rgba(30,42,54,0.65)' : MOOD_CARD_INK.normal,
                          margin: '0 0 4px 0' }}>
                {daysTogether > 0
                  ? `${lang === 'de' ? 'Heute' : 'Today'} · ${daysTogether} ${daysTogether === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}`
                  : (lang === 'de' ? 'Heute' : 'Today')}
              </p>
              {/* Stage label — quiet second line under the kicker.
                  "Baby · Stufe 1" shape. Bundles with evolution work
                  (backlog_ronki_chibi_expansion.md). Per Marc 24 Apr
                  2026 Begleiter Polish list. */}
              <p className="font-label"
                 style={{ fontSize: 10, lineHeight: 1, letterSpacing: '0.1em',
                          color: ronkiMood === 'sad' || ronkiMood === 'tired' ? 'rgba(30,42,54,0.5)' : 'rgba(18,67,70,0.5)',
                          margin: '0 0 10px 0', fontWeight: 600 }}>
                {stageName} · {lang === 'de' ? 'Stufe' : 'Stage'} {stage}
              </p>
              <h1 className="font-headline font-bold"
                  style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em',
                           color: ronkiMood === 'sad' || ronkiMood === 'tired' ? '#1e2a36' : MOOD_CARD_HEAD.normal,
                           margin: '0 0 8px 0', textWrap: 'balance' }}>
                {MOOD_CARD_COPY[ronkiMood]?.title[lang] || MOOD_CARD_COPY.normal.title[lang] || MOOD_CARD_COPY.normal.title.de}
              </h1>
              <p className="font-body"
                 style={{ fontSize: 15, lineHeight: 1.4,
                          color: ronkiMood === 'sad' || ronkiMood === 'tired' ? 'rgba(30,42,54,0.85)' : MOOD_CARD_SUB.normal,
                          margin: 0, textWrap: 'pretty' }}>
                {MOOD_CARD_COPY[ronkiMood]?.body[lang] || MOOD_CARD_COPY.normal.body[lang] || MOOD_CARD_COPY.normal.body.de}
              </p>
            </div>
          </section>

          {/* Mein Drache drawer is now always visible regardless of
               segment — per Marc 23 Apr 2026 Finch reference, the
               identity tabs are attached to the Ronki profile card
               at all times. Segment gating moves below, wrapping only
               the Pflege-specific flow (actions, Box-Atmung, etc.).
               The sub-nav (Pflege / Freunde / Spiele / Erinnerungen)
               moved down to live AFTER this attached card unit, per
               Marc 23 Apr 2026 "attach the two cards together". */}

          {/* ═══ MEIN DRACHE DRAWER — Finch-style collapsible card.
               One container holds the three tab buttons + the content
               below; tapping the active tab closes the drawer, tapping
               a different tab opens with content swap. Content area
               uses grid-template-rows 0fr → 1fr for a smooth auto-height
               expand that doesn't require JS-measured max-heights.
               Tabs feel connected to the card because they live INSIDE
               it — not a separate row above. Per Marc 23 Apr 2026
               Finch/Piper benchmark. ═══ */}
          <section className="mb-4 overflow-hidden"
                   style={{
                     // Top flat — seams with the mood card above
                     // (attached per Marc's Finch reference). Bottom
                     // rounds so the unit reads as one card.
                     borderRadius: '0 0 20px 20px',
                     background: '#fff',
                     border: '1px solid rgba(18,67,70,0.08)',
                     borderTop: 'none',
                     boxShadow: '0 10px 24px -10px rgba(50,60,75,0.35)',
                     transition: 'box-shadow 0.3s ease',
                   }}>

            {/* Tab row — lives inside the same card as the content */}
            <div className="flex gap-1"
                 style={{
                   padding: '8px 10px 0',
                   background: '#fff',
                 }}>
              {[
                { id: 'about', label: lang === 'de' ? 'Über' : 'About', icon: 'info' },
                { id: 'details', label: 'Details', icon: 'analytics' },
                { id: 'traits', label: lang === 'de' ? 'Stärken' : 'Strengths', icon: 'psychology' },
              ].map(tb => {
                const active = tab === tb.id;
                const openAndActive = active && drawerOpen;
                return (
                  <button key={tb.id}
                    onClick={() => onDrawerTab(tb.id)}
                    aria-expanded={openAndActive}
                    className="flex-1 flex items-center justify-center gap-1.5"
                    style={{
                      padding: '10px 6px',
                      borderRadius: '11px 11px 0 0',
                      background: openAndActive ? 'rgba(18,67,70,0.06)' : 'transparent',
                      color: openAndActive ? '#124346' : (active ? '#124346' : '#6b655b'),
                      borderBottom: openAndActive ? '2px solid #124346' : '2px solid transparent',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontWeight: openAndActive ? 800 : 700,
                      fontSize: 12,
                      letterSpacing: '0.06em',
                      transition: 'all 0.2s ease',
                    }}>
                    <span className="material-symbols-outlined text-base"
                          style={{ fontVariationSettings: openAndActive ? "'FILL' 1" : undefined }}>
                      {tb.icon}
                    </span>
                    {tb.label}
                    <span className="material-symbols-outlined"
                          style={{
                            fontSize: 14,
                            marginLeft: 2,
                            transform: openAndActive ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.25s ease',
                            opacity: active ? 0.8 : 0.3,
                          }}>
                      expand_more
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content area — grid-template-rows trick for smooth
                 height animation without measuring DOM. When closed,
                 `0fr` collapses to zero; when open, `1fr` expands to
                 natural content height. The inner `min-height: 0`
                 prevents the child from fighting the collapse. */}
            <div style={{
              display: 'grid',
              gridTemplateRows: drawerOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.32s ease, padding 0.32s ease',
              padding: drawerOpen ? '12px 18px 18px' : '0 18px',
              background: '#fff',
            }}>
              <div style={{ overflow: 'hidden', minHeight: 0 }}>

          {/* About tab */}
          {tab === 'about' && (
            <div className="flex flex-col gap-5">
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
              {/* Über fact-card grid — Polish v2 Variant A v1 styling
                   (Marc 24 Apr 2026): bigger colored icon at the top-
                   left, per-card tint on both icon + label, bold value
                   below on its own line. Each card has a soft bg that
                   echoes the icon color at low opacity. */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: lang === 'de' ? 'Spezies' : 'Species', value: FACTS.species[lang] || FACTS.species.de, icon: 'pets',       tint: '#A83E2C', bg: 'rgba(245,158,11,0.08)' },
                  { label: lang === 'de' ? 'Größe'   : 'Height',  value: FACTS.heights[stage],                    icon: 'straighten', tint: '#0369a1', bg: 'rgba(14,165,233,0.08)' },
                  { label: lang === 'de' ? 'Mag'     : 'Likes',   value: FACTS.likes[lang] || FACTS.likes.de,     icon: 'favorite',   tint: '#be185d', bg: 'rgba(236,72,153,0.08)' },
                  { label: lang === 'de' ? 'Talent'  : 'Talent',  value: FACTS.talent[lang] || FACTS.talent.de,   icon: 'local_fire_department', tint: '#c2410c', bg: 'rgba(249,115,22,0.08)' },
                ].map((fact, i) => (
                  <div key={i} className="rounded-2xl"
                       style={{
                         background: fact.bg,
                         border: `1px solid ${fact.tint}24`,
                         padding: '14px 14px 16px',
                         display: 'flex', flexDirection: 'column', gap: 10,
                       }}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined"
                            style={{ fontSize: 22, color: fact.tint, fontVariationSettings: "'FILL' 1" }}>
                        {fact.icon}
                      </span>
                      <span style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontWeight: 800, fontSize: 10, lineHeight: 1,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: fact.tint,
                      }}>
                        {fact.label}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 800, fontSize: 14, lineHeight: 1.25,
                      color: '#124346',
                    }}>
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details tab */}
          {tab === 'details' && (
            <div className="flex flex-col gap-5 mb-4">
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

          {/* Traits tab */}
          {tab === 'traits' && (
            <div className="flex flex-col gap-5 mb-4">
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
                          color: '#A83E2C',
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
            </div>
          </section>
          {/* ═══ END MEIN DRACHE DRAWER ═══ */}

          {/* ═══ SEGMENTED CONTROL — four destinations inside the Ronki
               world. Sits BELOW the merged profile+identity card (per
               Marc's Finch reference). Pill-shaped with teal "selected"
               fill. Bottom app-nav stays the single way home so kids
               don't get two competing nav bars (Marc call 21 Apr 2026). ═══ */}
          <div className="flex gap-1 mb-4 mt-4"
               style={{
                 padding: 4,
                 borderRadius: 14,
                 background: 'rgba(18,67,70,0.18)',
                 boxShadow: 'inset 0 1px 2px rgba(18,67,70,0.1)',
               }}>
            {[
              { id: 'pflege',       label: lang === 'de' ? 'Pflege'       : 'Care',     icon: 'favorite' },
              { id: 'freunde',      label: lang === 'de' ? 'Freunde'      : 'Friends',  icon: 'groups' },
              { id: 'spiele',       label: lang === 'de' ? 'Spiele'       : 'Games',    icon: 'sports_esports' },
              // Erinnerungen segment dropped 24 Apr 2026 (Marc) — memory
              // access now lives as a single "Eure Chronik" CTA inside
              // the Pflege flow that opens the Buch directly.
            ].map(s => (
              <button key={s.id}
                onClick={() => setSegment(s.id)}
                className="flex-1 flex items-center justify-center gap-1.5 transition-all"
                style={{
                  padding: '10px 4px',
                  borderRadius: 11,
                  background: segment === s.id ? '#124346' : 'transparent',
                  color: segment === s.id ? '#fef3c7' : '#6b655b',
                  boxShadow: segment === s.id ? '0 3px 8px -3px rgba(18,67,70,0.35)' : 'none',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
                }}>
                <span className="material-symbols-outlined"
                      style={{ fontSize: 16, fontVariationSettings: segment === s.id ? "'FILL' 1" : undefined }}>
                  {s.icon}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          {segment === 'pflege' && (<>
          {/* ═══ PFLEGE — mood-aware care card.
               Normal days: Füttern / Streicheln / Spielen with XP rewards.
               Bad days (ronkiMood sad/tired): card morphs into the
               Bonding Agent sad-hero + 3 gentle reactions.
               Box-Atmung teaching block + Helden-Kodex follow. ═══ */}

          {isBadDay ? (
            <>
              {/* 3 (or 4) gentle reactions — no XP. */}
              <Kicker>{lang === 'de' ? 'Wähle eine sanfte Reaktion' : 'Pick a gentle response'}</Kicker>
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
              {/* Normal-day Pflege — same horizontal-card layout as the
                   sanfte-Reaktion cards on bad days (Marc's ask 22 Apr 2026
                   "bring Pflege heute in a look like the screenshoted
                   version"). Circle-icon-left, title + sub + reward on
                   the right. Checked style when the action is done today. */}
              <Kicker>{lang === 'de' ? 'Pflege heute' : 'Care today'}</Kicker>
              <section style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'fed',    state: state.catFed,    onTap: actions.feedCompanion, icon: 'cookie',          title: t('care.feed'), sub: lang === 'de' ? 'Einen kleinen Snack für Ronki' : 'A small snack for Ronki',      reward: 5, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b' },
                  { key: 'petted', state: state.catPetted, onTap: actions.petCompanion,  icon: 'favorite',        title: t('care.pet'),  sub: lang === 'de' ? 'Kurz den Kopf kraulen' : 'Ruffle his head gently',                  reward: 3, iconBg: 'rgba(236,72,153,0.15)', iconColor: '#ec4899' },
                  { key: 'played', state: state.catPlayed, onTap: actions.playCompanion, icon: 'sports_baseball', title: t('care.play'), sub: lang === 'de' ? 'Ball werfen, zusammen rennen' : 'Throw a ball, run together',      reward: 8, iconBg: 'rgba(18,67,70,0.12)',    iconColor: '#124346' },
                ].map(a => (
                  <button key={a.key}
                    onClick={() => handleCare(a.onTap, a.state)}
                    disabled={a.state}
                    className="w-full flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                    style={{
                      padding: '14px 16px',
                      borderRadius: 18,
                      background: a.state
                        ? 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.02))'
                        : 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.85))',
                      border: a.state
                        ? '1.5px solid rgba(52,211,153,0.35)'
                        : '1.5px solid rgba(245,158,11,0.2)',
                      boxShadow: '0 4px 12px -6px rgba(245,158,11,0.18)',
                      opacity: a.state ? 0.85 : 1,
                    }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: a.state ? 'rgba(52,211,153,0.15)' : a.iconBg,
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined"
                            style={{
                              fontSize: 24,
                              color: a.state ? '#059669' : a.iconColor,
                              fontVariationSettings: "'FILL' 1",
                            }}>
                        {a.state ? 'check_circle' : a.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <b className="font-headline" style={{ fontSize: 15, lineHeight: 1.2, color: '#124346', display: 'block' }}>
                        {a.title}
                      </b>
                      <span className="font-body" style={{ fontSize: 12, lineHeight: 1.3, color: a.state ? '#059669' : 'rgba(18,67,70,0.65)' }}>
                        {a.state ? t('care.done') : a.sub}
                      </span>
                    </div>
                    {!a.state && (
                      <span className="flex items-center gap-1 font-label font-bold shrink-0"
                            style={{ fontSize: 12, color: '#A83E2C' }}>
                        <Pearl size={12} />+{a.reward}
                      </span>
                    )}
                  </button>
                ))}
              </section>
            </>
          )}

          {/* ═══ BOX-ATMUNG TEACHING BLOCK ═══
               Dashed cyan square with a traveling dot — the visual
               breathing rhythm (4s Einatmen / Halten / Ausatmen / Ruhen).
               Dot loops continuously so Louis can breathe along at any
               time. The actual practice count advances when Louis uses
               the exercise in Gefühlsecke (WuetendFlow). At 5 Ronki
               "learns" the skill — ronkiLearnedSkills flips, this block
               hides, and the golden learn banner fires. On the next
               bad-Ronki day, Ronki offers Box-Atmung back to Louis as
               a 4th reaction option. */}
          {/* Visible when Louis has already practiced at least once, OR
               when Ronki is having a bad day — surfaces the tool during
               the moment it's actually useful instead of hiding it until
               Louis stumbles into Gefühlsecke. Marc Apr 2026: "when mood=sad
               there should also be the box breathing thingy." */}
          {!hasLearnedBox && (practiceCount > 0 || ronkiMood === 'sad' || ronkiMood === 'tired') && (
            <>
              <Kicker>{lang === 'de' ? 'Louis bringt Ronki bei' : 'Louis teaches Ronki'}</Kicker>
              <section style={{
                         padding: '16px 18px 18px',
                         borderRadius: 20,
                         background: 'linear-gradient(160deg, #ecfeff, #cffafe)',
                         border: '1px solid rgba(8,145,178,0.15)',
                         boxShadow: '0 6px 14px -8px rgba(14,165,233,0.18)',
                         marginBottom: 14,
                       }}>
                <div className="flex items-start gap-3 mb-2">
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #67e8f9, #0891b2)',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    boxShadow: '0 3px 8px -3px rgba(8,145,178,0.4)',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>air</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <b className="font-headline" style={{ fontSize: 17, lineHeight: 1.2, color: '#164e63', display: 'block' }}>
                      {lang === 'de' ? 'Box-Atmung' : 'Box breathing'}
                    </b>
                    <span className="font-body" style={{ fontSize: 12, lineHeight: 1.4, color: '#155e75' }}>
                      {lang === 'de'
                        ? 'Benutze sie 5× in der Gefühlsecke. Dann lernt Ronki sie von dir.'
                        : 'Use it 5× in the Gefühlsecke. Then Ronki learns it from you.'}
                    </span>
                  </div>
                </div>

                {/* Dashed square with traveling dot — 16s loop matching
                     the 4-4-4-4 rhythm. Labels sit further outside so
                     RUHEN/HALTEN don't kiss the dashed edge (Marc feedback
                     22 Apr 2026). "4s ·" prefix dropped — label alone is
                     clearer for a first-grader, seconds are implicit. */}
                <div style={{
                  position: 'relative',
                  width: 140, height: 140,
                  margin: '30px auto 38px',
                  border: '2.5px dashed #0891b2',
                  borderRadius: 16,
                }}>
                  <span style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', font: '800 10px/1 "Plus Jakarta Sans", sans-serif', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0e7490', whiteSpace: 'nowrap' }}>
                    {lang === 'de' ? 'Einatmen' : 'Inhale'}
                  </span>
                  <span style={{ position: 'absolute', top: '50%', right: -78, transform: 'translateY(-50%)', font: '800 10px/1 "Plus Jakarta Sans", sans-serif', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0e7490', whiteSpace: 'nowrap' }}>
                    {lang === 'de' ? 'Halten' : 'Hold'}
                  </span>
                  <span style={{ position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)', font: '800 10px/1 "Plus Jakarta Sans", sans-serif', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0e7490', whiteSpace: 'nowrap' }}>
                    {lang === 'de' ? 'Ausatmen' : 'Exhale'}
                  </span>
                  <span style={{ position: 'absolute', top: '50%', left: -70, transform: 'translateY(-50%)', font: '800 10px/1 "Plus Jakarta Sans", sans-serif', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0e7490', whiteSpace: 'nowrap' }}>
                    {lang === 'de' ? 'Ruhen' : 'Rest'}
                  </span>
                  <div aria-hidden="true" style={{
                    position: 'absolute',
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #67e8f9, #0891b2)',
                    boxShadow: '0 0 16px rgba(8,145,178,0.5)',
                    top: -9, left: -9,
                    animation: 'rp-box-travel 16s linear infinite',
                  }} />
                </div>

                {/* Progress row + 5 tick bars */}
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span className="font-label" style={{ fontSize: 11, color: '#155e75', letterSpacing: '0.06em' }}>
                    {lang === 'de' ? 'Dein Fortschritt' : 'Your progress'}
                  </span>
                  <b className="font-label" style={{ fontSize: 13, color: '#0e7490', fontWeight: 800 }}>
                    {practiceCount} {lang === 'de' ? 'von' : 'of'} 5
                  </b>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{
                      flex: 1, height: 6, borderRadius: 999,
                      background: i < practiceCount
                        ? 'linear-gradient(90deg, #67e8f9, #0891b2)'
                        : 'rgba(14,165,233,0.18)',
                      transition: 'background 0.4s ease',
                    }} />
                  ))}
                </div>
              </section>

              {/* Keyframes for the traveling dot. Corners align exactly
                   with the dashed square's edges; linear timing keeps
                   each side at 4s. */}
              <style>{`
                @keyframes rp-box-travel {
                  0%,100% { top: -9px;  left: -9px; }
                  25%     { top: -9px;  left: calc(100% - 9px); }
                  50%     { top: calc(100% - 9px); left: calc(100% - 9px); }
                  75%     { top: calc(100% - 9px); left: -9px; }
                }
              `}</style>
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

          {/* Mini-Spiele CTA + Freunde card moved to their dedicated
               segments below — no longer duplicated on the Pflege landing.
               Helden-Kodex stays because it's a standalone hero, not one
               of the 4 sub-nav destinations. */}

          {/* ═══ EURE CHRONIK — gold CTA linking to the Buch.
               Replaces the dropped Erinnerungen segment (Marc 24 Apr 2026:
               "create a card like this also from the Profile Polish v2
               Variant A below the pflege actions"). Single tappable card
               showing days together + new-pages hint. */}
          <ChronikCta state={state} lang={lang} onNavigate={onNavigate} />

          {/* ═══ HELDEN-KODEX — Band-Streak style flat pill (Marc 24
               Apr 2026): was competing with the Eure Chronik gold CTA
               above. Now a subtle white pill with a rose-red accent
               stripe on the left, small heart icon, single-line copy.
               Stops shouting; the Chronik CTA owns the gold tier. ═══ */}
          {!dev && (
            <button
              onClick={() => onNavigate?.('kodex')}
              className="w-full mb-4 flex items-center gap-3 active:scale-[0.98] transition-all text-left relative overflow-hidden"
              style={{
                padding: '12px 14px 12px 18px',
                borderRadius: 14,
                background: '#ffffff',
                border: '1px solid rgba(18,67,70,0.1)',
                boxShadow: '0 2px 8px -4px rgba(18,67,70,0.15)',
              }}>
              {/* Rose-red left accent stripe — bookmark-ribbon cue */}
              <span aria-hidden="true" style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 4,
                background: 'linear-gradient(180deg, #f472b6, #dc2626)',
              }} />
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(220,38,38,0.08)' }}>
                <span className="material-symbols-outlined"
                      style={{ fontSize: 18, color: '#dc2626', fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label font-bold uppercase block"
                      style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(18,67,70,0.5)', marginBottom: 1 }}>
                  {lang === 'de' ? 'Für Helden' : 'For heroes'}
                </span>
                <span className="font-body" style={{ fontSize: 13, fontWeight: 700, color: '#124346', lineHeight: 1.25 }}>
                  {lang === 'de' ? 'Was einen Helden ausmacht' : 'What makes a hero'}
                </span>
              </div>
              <span className="material-symbols-outlined shrink-0"
                    style={{ fontSize: 18, color: 'rgba(18,67,70,0.5)' }}>
                chevron_right
              </span>
            </button>
          )}

          {/* Mein Drache tabs were here — moved to the top of the Pflege
               segment (23 Apr 2026) per Marc: "right below the sub-nav". */}

          </>)}

          {/* ═══ FREUNDE SEGMENT ═══
               Louis's preferred style (22 Apr 2026): single tappable
               card, cream→amber gradient, groups icon + "Ronkis
               Freunde" + "X von Y getroffen" subtitle + chevron.
               Horizontal strip of 6 circle avatars — discovered first,
               dashed locked slots filling the rest. The card itself
               navigates to the full Micropedia, so no separate CTA
               button (fewer tap targets = less visual noise). */}
          {segment === 'freunde' && (
            <section style={{ marginBottom: 14 }}>
              <Kicker>{lang === 'de' ? 'Ronkis Freunde' : "Ronki's Friends"}</Kicker>
              <button
                onClick={() => onNavigate?.('micropedia')}
                className="w-full rounded-2xl p-4 active:scale-[0.98] transition-transform text-left"
                style={{
                  background: 'linear-gradient(135deg, #fff8f2 0%, #fef3c7 100%)',
                  border: '1.5px solid rgba(252,211,77,0.3)',
                  boxShadow: '0 4px 16px rgba(252,211,77,0.15)',
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-2xl"
                        style={{ color: '#92400e', fontVariationSettings: "'FILL' 1" }}>
                    groups
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-base text-on-surface">
                      {lang === 'de' ? 'Ronkis Freunde' : "Ronki's Friends"}
                    </h3>
                    <p className="font-label text-xs text-on-surface-variant">
                      {totalFound} {lang === 'de' ? 'von' : 'of'} {totalCreatures} {lang === 'de' ? 'getroffen' : 'met'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </div>
                {/* Compact strip of 6 circle avatars — discovered first,
                     dashed locked circles filling the rest. Scrolls
                     horizontally if Louis has met more than 6 creatures. */}
                <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {recentFreunde.slice(0, 6).map(f => (
                    <div key={f.id}
                         className="w-14 h-14 rounded-full overflow-hidden shrink-0"
                         style={{ border: '2px solid #fff', boxShadow: '0 2px 6px rgba(120,53,15,0.15)' }}>
                      {f.art ? (
                        <img src={base + f.art} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                             style={{ background: 'rgba(252,211,77,0.18)' }}>
                          <span className="material-symbols-outlined text-base"
                                style={{ color: '#92400e', fontVariationSettings: "'FILL' 1" }}>pets</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Locked slots — fill out to 6 with dashed circles
                       so the row always reads "part of a bigger set". */}
                  {Array.from({ length: Math.max(0, 6 - recentFreunde.length) }).map((_, i) => (
                    <div key={`locked-${i}`}
                         className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center"
                         style={{
                           border: '2px dashed rgba(120,53,15,0.25)',
                           background: 'rgba(255,255,255,0.35)',
                         }}>
                      <span className="material-symbols-outlined"
                            style={{ fontSize: 18, color: 'rgba(120,53,15,0.4)', fontVariationSettings: "'FILL' 1" }}>
                        lock
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            </section>
          )}

          {/* ═══ SPIELE SEGMENT ═══
               Thin pass for now — the Spiele destination links through
               to the existing games hub. When locked (gamesUnlocked=false),
               shows a quiet locked state that tells Louis what he needs
               to do first (finish today's quests) rather than a dashed
               tease. Future: embed a small games thumbnail grid. */}
          {segment === 'spiele' && (
            <section style={{ marginBottom: 14 }}>
              <Kicker>{lang === 'de' ? 'Mini-Spiele' : 'Mini games'}</Kicker>
              {gamesUnlocked ? (
                <button
                  onClick={() => onNavigate?.('games')}
                  className="w-full rounded-2xl p-5 text-left active:scale-[0.98] transition-all"
                  style={{
                    background: 'linear-gradient(160deg, #fcd34d, #f59e0b)',
                    boxShadow: '0 8px 18px -6px rgba(245,158,11,0.45)',
                  }}>
                  <div className="flex items-center gap-4">
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(120,53,15,0.18)',
                    }}>
                      <span className="material-symbols-outlined"
                            style={{ fontSize: 24, color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>
                        sports_esports
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ display: 'block', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', marginBottom: 3 }}>
                        {lang === 'de' ? 'Bereit' : 'Ready'}
                      </span>
                      <b style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 16, lineHeight: 1.15, color: '#2a2005' }}>
                        {t('ronki.playWithRonki')}
                      </b>
                      <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 12, lineHeight: 1.3, color: '#5c4508', marginTop: 2 }}>
                        {t('ronki.playWithRonki.subtitle')}
                      </span>
                    </div>
                    <span className="material-symbols-outlined"
                          style={{ fontSize: 24, color: '#78350f', fontVariationSettings: "'FILL' 1" }}>
                      arrow_forward
                    </span>
                  </div>
                </button>
              ) : (
                <div className="rounded-2xl p-5 text-center"
                     style={{
                       background: 'linear-gradient(160deg, #fffdf5, #fef3c7)',
                       border: '1.5px dashed rgba(245,158,11,0.5)',
                     }}>
                  <span className="material-symbols-outlined block mb-2"
                        style={{ fontSize: 36, color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                  <b className="font-headline block mb-1" style={{ fontSize: 16, color: '#124346' }}>
                    {lang === 'de' ? 'Noch nicht bereit' : 'Not ready yet'}
                  </b>
                  <p className="font-body text-sm" style={{ color: '#92400e', lineHeight: 1.4 }}>
                    {t('ronki.playWithRonki.locked')}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ═══ ERINNERUNGEN SEGMENT ═══
               Merged destination combining what were two drill-ins in
               the Über tab (Abenteuer-Chronik = completed arcs; and
               Erinnerungen = bosses + badges) PLUS the full journal
               history (state.journalHistory), including the bonding-
               agent memory entries written when Louis picks a gentle
               reaction on a bad-Ronki day. Chronological scrollable list.
               Interim surface — the full storybook treatment lives in
               the Buch v2 backlog. */}
          {segment === 'erinnerungen' && (
            <ErinnerungenList state={state} lang={lang} t={t} onNavigate={onNavigate} />
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
        /* Card-scope mood atmosphere keyframes — live on the parent
           card surrounding MoodChibi (bare mode), per Marc's brief:
           particles across the whole card, not inside a locket. */
        @keyframes rp-card-zzz {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          25%  { opacity: 0.9; }
          100% { transform: translate(-22px, -40px) scale(1.1); opacity: 0; }
        }
        @keyframes rp-card-ember {
          0%   { transform: translateY(0) scale(0.8); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(-80%) scale(0.4); opacity: 0; }
        }
        /* Abenteuer-Buch excited-state glow + sparkle animations */
        @keyframes abCtaGlow {
          0%,100% { box-shadow: 0 8px 22px -6px rgba(245,158,11,0.55); }
          50%     { box-shadow: 0 10px 28px -4px rgba(245,158,11,0.85); }
        }
        @keyframes abCtaSparkle {
          0%,100% { opacity: 0; transform: scale(0.4); }
          30%     { opacity: 1; transform: scale(1); }
          60%     { opacity: 0.85; transform: scale(1.1); }
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

// ── Erinnerungen segment — merged memories list ───────────────────────
// Folds three previously-separate destinations into one chronological
// scroll: journal memories (state.journalHistory), completed quest arcs
// (state.arcEngine.completedArcIds → arc title + completion date), and
// boss/badge milestones. The bonding-agent writes into journalHistory
// when Louis picks a sad-day reaction, so those moments naturally flow
// in too. Interim surface — Buch v2 will be the full storybook home.

// ── ChronikCta — "Abenteuer-Buch" card that opens the Buch ──
// Renamed from "Chronik" (not first-grade-friendly) → "Abenteuer-Buch"
// per Marc 24 Apr 2026. Two visual states:
//   · default  — subtle white pill matching the Helden-Kodex style so
//                 it doesn't shout on every visit
//   · excited  — gold-amber gradient + star sprinkle animation when a
//                 new chapter just dropped (new journal entry today
//                 or all daily routines completed). The "unread" tier.
// Visual separation means Louis only sees the bright gold pull when
// there's actually something fresh to open.

function ChronikCta({ state, lang, onNavigate }) {
  const totalDays = state?.totalTaskDays || 0;
  const today = new Date().toISOString().slice(0, 10);
  // Excited state fires when EITHER today's journal has an entry
  // (chapter just written) OR all main quests done today (new chapter
  // at end-of-day). Kid sees the glow once per day of real progress.
  const todaysJournal = (state?.journalHistory || []).find(j => j.date === today);
  const mainQuests = (state?.quests || []).filter(q => !q.sideQuest);
  const allRoutinesDone = mainQuests.length > 0 && mainQuests.every(q => q.done);
  const isExcited = !!todaysJournal || allRoutinesDone;
  // Count journal entries written in the last 7 days as "new pages".
  const weekAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  })();
  const newPages = (state?.journalHistory || []).filter(j => j.date && j.date >= weekAgo).length;

  const title = lang === 'de' ? 'Abenteuer-Buch' : 'Adventure Book';
  const subtitle = newPages > 0
    ? (lang === 'de' ? `${newPages} neue Seite${newPages === 1 ? '' : 'n'} diese Woche` : `${newPages} new page${newPages === 1 ? '' : 's'} this week`)
    : (lang === 'de' ? 'Eure Geschichte, Kapitel für Kapitel.' : 'Your story, chapter by chapter.');

  if (!isExcited) {
    // State A — subtle pill (matches Helden-Kodex row style)
    return (
      <button
        onClick={() => onNavigate?.('buch')}
        className="w-full mb-4 flex items-center gap-3 active:scale-[0.98] transition-all text-left relative overflow-hidden"
        style={{
          padding: '12px 14px 12px 18px',
          borderRadius: 14,
          background: '#ffffff',
          border: '1px solid rgba(18,67,70,0.1)',
          boxShadow: '0 2px 8px -4px rgba(18,67,70,0.15)',
        }}>
        <span aria-hidden="true" style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 4,
          background: 'linear-gradient(180deg, #fcd34d, #A83E2C)',
        }} />
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
             style={{ background: 'rgba(245,158,11,0.1)' }}>
          <span className="material-symbols-outlined"
                style={{ fontSize: 18, color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>
            menu_book
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-label font-bold uppercase block"
                style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(18,67,70,0.5)', marginBottom: 1 }}>
            {totalDays > 0 ? `${totalDays} ${totalDays === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}` : (lang === 'de' ? 'Buch' : 'Book')}
          </span>
          <span className="font-body" style={{ fontSize: 13, fontWeight: 700, color: '#124346', lineHeight: 1.25 }}>
            {title}
          </span>
        </div>
        <span className="material-symbols-outlined shrink-0"
              style={{ fontSize: 18, color: 'rgba(18,67,70,0.5)' }}>
          chevron_right
        </span>
      </button>
    );
  }

  // State B — excited (new chapter waiting). Gold gradient + sparkles.
  return (
    <button
      onClick={() => onNavigate?.('buch')}
      className="w-full rounded-2xl p-5 mb-4 flex items-center gap-4 active:scale-[0.98] transition-all text-left relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #fef3c7 0%, #fcd34d 45%, #f59e0b 100%)',
        boxShadow: '0 8px 22px -6px rgba(245,158,11,0.65)',
        animation: 'abCtaGlow 2.6s ease-in-out infinite',
      }}>
      {/* Sparkle star overlay — 5 tiny stars drifting in at staggered
          delays to catch the kid's eye. aria-hidden so SR doesn't
          announce them. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { left: '12%',  top: '20%', delay: '0s',    size: 10 },
          { left: '38%',  top: '68%', delay: '0.6s',  size: 8  },
          { left: '62%',  top: '18%', delay: '1.1s',  size: 12 },
          { left: '82%',  top: '55%', delay: '1.7s',  size: 9  },
          { left: '25%',  top: '52%', delay: '2.2s',  size: 7  },
        ].map((s, i) => (
          <span key={i} style={{
            position: 'absolute', left: s.left, top: s.top,
            width: s.size, height: s.size,
            background: 'radial-gradient(circle, #fff 0%, #fef3c7 60%, transparent 80%)',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(255,255,255,0.9)',
            animation: `abCtaSparkle 2.2s ease-in-out ${s.delay} infinite`,
          }} />
        ))}
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative"
           style={{ background: '#fff', border: '2px solid rgba(120,53,15,0.15)', boxShadow: '0 2px 8px rgba(120,53,15,0.12)', zIndex: 2 }}>
        <span className="material-symbols-outlined"
              style={{ fontSize: 24, color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>
          auto_stories
        </span>
      </div>
      <div className="flex-1 min-w-0 relative" style={{ zIndex: 2 }}>
        <span className="font-label font-bold uppercase"
              style={{ fontSize: 10, letterSpacing: '0.22em', color: 'rgba(120,53,15,0.78)', display: 'block', marginBottom: 2 }}>
          {lang === 'de' ? 'Neues Kapitel' : 'New chapter'}
        </span>
        <b style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, lineHeight: 1.15, color: '#78350f' }}>
          {title}
          {totalDays > 0 && ` · ${totalDays} ${totalDays === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}`}
        </b>
        <span style={{ display: 'block', fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 12, lineHeight: 1.3, color: 'rgba(120,53,15,0.8)', marginTop: 2 }}>
          {subtitle}
        </span>
      </div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative"
           style={{ background: '#fff', border: '2px solid rgba(120,53,15,0.15)', zIndex: 2 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#A83E2C' }}>
          chevron_right
        </span>
      </div>
    </button>
  );
}

function ErinnerungenList({ state, lang, t, onNavigate }) {
  const entries = React.useMemo(() => {
    const out = [];
    // Journal memories (bonding-agent reactions + daily journal saves)
    (state?.journalHistory || []).forEach((j, i) => {
      if (!j?.memory) return;
      const isBondingAgent = (j.achievements || []).includes('ronki-bad-day');
      out.push({
        key: `j-${i}-${j.date}`,
        date: j.date,
        icon: isBondingAgent ? '🫂' : '📔',
        title: isBondingAgent
          ? (lang === 'de' ? 'Für Ronki da gewesen' : 'Being there for Ronki')
          : (lang === 'de' ? 'Tagebuch' : 'Journal'),
        body: j.memory,
      });
    });
    // Completed arcs
    (state?.arcEngine?.completedArcIds || []).forEach((arcId, i) => {
      const arc = findArc(arcId);
      if (!arc) return;
      out.push({
        key: `a-${arcId}-${i}`,
        date: state?.arcEngine?.completedAt?.[arcId] || null,
        icon: '📜',
        title: t ? t(arc.titleKey) : arcId,
        body: lang === 'de' ? 'Abenteuer bestanden' : 'Adventure survived',
      });
    });
    // Boss trophies removed from the Erinnerungen list (Marc 23 Apr
    // 2026: "let's remove boss besiegt under eure geschichte"). Bosses
    // live in the Boss tab / trophy wall instead — they don't belong
    // in the memory scroll alongside narrative journal entries.
    // Badges
    (state?.unlockedBadges || []).forEach((badgeId, i) => {
      out.push({
        key: `badge-${badgeId}-${i}`,
        date: null,
        icon: '⭐',
        title: lang === 'de' ? 'Abzeichen' : 'Badge',
        body: badgeId,
      });
    });
    // Sort newest first — entries without dates bubble to the end.
    out.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
    return out;
  }, [state?.journalHistory, state?.arcEngine?.completedArcIds, state?.unlockedBadges, lang, t]);

  const totalDays = state?.totalTaskDays || 0;

  return (
    <section style={{ marginBottom: 14 }}>
      {/* Header — day count + memory count, matching the Polish v2
           Chronik card pattern ("47 Tage · 5 neue Seiten seit letzter
           Woche") but scaled down to a plain header for now. */}
      <div className="flex items-baseline justify-between mb-3 px-1">
        <b className="font-headline" style={{ fontSize: 22, color: '#124346' }}>
          {totalDays > 0
            ? `${totalDays} ${totalDays === 1 ? (lang === 'de' ? 'Tag' : 'day') : (lang === 'de' ? 'Tage' : 'days')}`
            : (lang === 'de' ? 'Eure Geschichte' : 'Your story')}
        </b>
        <span className="font-label font-bold uppercase tracking-widest"
              style={{ fontSize: 10, color: '#A83E2C' }}>
          {entries.length} {entries.length === 1
            ? (lang === 'de' ? 'Erinnerung' : 'memory')
            : (lang === 'de' ? 'Erinnerungen' : 'memories')}
        </span>
      </div>

      {/* Open-in-Buch CTA — the storybook view is the richer home;
           this card pitches itself to the Buch's chapter layout with a
           warm cream gradient + "auto_stories" icon. Always visible
           (even when Erinnerungen is empty) so kids discover the Buch
           from day one. */}
      <button
        onClick={() => onNavigate?.('buch')}
        className="w-full flex items-center gap-3 active:scale-[0.98] transition-transform text-left mb-3"
        style={{
          padding: '14px 16px',
          borderRadius: 18,
          background: 'linear-gradient(160deg, #fff8f2 0%, #fef3c7 100%)',
          border: '1.5px solid rgba(180,83,9,0.22)',
          boxShadow: '0 6px 14px -6px rgba(180,83,9,0.25)',
        }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, #fcd34d, #A83E2C)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          boxShadow: '0 3px 8px -3px rgba(180,83,9,0.4)',
        }}>
          <span className="material-symbols-outlined"
                style={{ color: '#fff8f2', fontSize: 24, fontVariationSettings: "'FILL' 1" }}>
            auto_stories
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <b className="font-headline" style={{ fontSize: 15, lineHeight: 1.2, color: '#124346', display: 'block' }}>
            {lang === 'de' ? 'Euer Buch öffnen' : 'Open your Book'}
          </b>
          <span className="font-body" style={{ fontSize: 12, lineHeight: 1.3, color: 'rgba(18,67,70,0.7)' }}>
            {lang === 'de'
              ? 'Eure Geschichte als Kapitel-Buch.'
              : 'Your story as a chapter book.'}
          </span>
        </div>
        <span className="material-symbols-outlined"
              style={{ fontSize: 22, color: '#A83E2C' }}>
          chevron_right
        </span>
      </button>

      {entries.length === 0 ? (
        <div className="rounded-2xl p-6 text-center"
             style={{ background: '#fff', border: '1px solid rgba(18,67,70,0.1)' }}>
          <span className="material-symbols-outlined block mb-2"
                style={{ fontSize: 32, color: '#A83E2C', fontVariationSettings: "'FILL' 1" }}>
            auto_stories
          </span>
          <b className="font-headline block mb-1" style={{ fontSize: 15, color: '#124346' }}>
            {lang === 'de' ? 'Eure Geschichte beginnt bald' : 'Your story begins soon'}
          </b>
          <p className="font-body text-sm italic" style={{ color: '#6b655b' }}>
            {lang === 'de'
              ? 'Jedes Abenteuer, jeder kleine Moment landet hier.'
              : 'Every adventure, every small moment lands here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.slice(0, 30).map(e => (
            <div key={e.key}
                 className="flex items-start gap-3 p-3 rounded-2xl"
                 style={{ background: '#fff', border: '1px solid rgba(18,67,70,0.08)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'rgba(245,158,11,0.1)',
                display: 'grid', placeItems: 'center', fontSize: 22,
              }}>
                {e.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <b className="font-headline" style={{ fontSize: 13, color: '#124346', lineHeight: 1.2 }}>
                    {e.title}
                  </b>
                  {e.date && (
                    <span className="font-label" style={{ fontSize: 10, color: '#6b655b', whiteSpace: 'nowrap' }}>
                      {e.date}
                    </span>
                  )}
                </div>
                <p className="font-body" style={{ fontSize: 12, color: '#124346', lineHeight: 1.4, margin: '3px 0 0' }}>
                  {e.body}
                </p>
              </div>
            </div>
          ))}
          {entries.length > 30 && (
            <p className="font-label text-xs text-center mt-2 italic" style={{ color: '#6b655b' }}>
              {lang === 'de'
                ? `${entries.length - 30} weitere werden im Buch gesammelt.`
                : `${entries.length - 30} more collected in the Buch.`}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
