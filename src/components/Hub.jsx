import React, { useEffect, useState } from 'react';
import { WEEKLY_MISSIONS, MOOD_EMOJIS, BOSSES, BOSS_TIERS, GEAR_ITEMS, CAT_STAGES, COMPANION_STAGES } from '../constants';
import { useTask } from '../context/TaskContext';
import { getLevel, getLvlProg, getCatStage } from '../utils/helpers';
import useWeather, { getWeatherInfo, getWeatherCategory } from '../hooks/useWeather';
import { useGameAccess } from '../hooks/useGameAccess';
import SFX from '../utils/sfx';
import Egg from './Egg';
import { Pearl } from './CurrencyIcons';
import AnimatedCount from './AnimatedCount';
import { BADGES } from '../constants';
import { useTranslation } from '../i18n/LanguageContext';
import { useVoice } from '../companion/useVoice';
import VoiceBubble from './VoiceBubble';
// Arc system paused — see backlog_arc_offer_rework.md. Imports kept commented
// so the re-enable diff is a one-liner when the rework ships.
// import { useArc } from '../arcs/useArc';
// import ArcActiveBanner from './ArcActiveBanner';
import BeatCompletionModal from './BeatCompletionModal';
import ClothingSheet from './ClothingSheet';
import CloudWaves from './CloudWaves';
import CampfireScene from './CampfireScene';
import { pickTodaysVisitor } from './CampfireVisitorsGame';
import EveningRitual from './EveningRitual';
import Gefuehlsecke from './Gefuehlsecke';
// ForscherEcke / AttentionGlow / isForscherGraduated / useAttentionFlag
// imports removed with the Apr 2026 Hub simplification — Forscher-Ecke
// now lives inside MiniGames (Spielzimmer).
import ZeigMomentCard from './ZeigMomentCard';
import { isDevMode } from '../utils/mode';
import { getVariant } from '../data/companionVariants';
import { useAnalytics } from '../hooks/useAnalytics';

// Stable mood enum for analytics (index matches MOOD_EMOJIS / MOOD_LABELS).
// Never localized — analytics is language-agnostic and we never want a
// DE/EN split in the telemetry table.
const MOOD_ENUM = ['sad', 'worried', 'okay', 'good', 'magical', 'tired'];

// ── Egg art per onboarding type (stage 0) ──
const EGG_ART = {
  fire: 'art/onboarding/egg-fire.webp',
  golden: 'art/onboarding/egg-golden.webp',
  spirit: 'art/onboarding/egg-spirit.webp',
};

// ── Dragon evolution art per stage (1-4) ──
const COMPANION_ART = {
  dragon: [
    null, // stage 0 = egg (use EGG_ART)
    'art/companion/dragon-baby.webp',
    'art/companion/dragon-young.webp',
    'art/companion/dragon-majestic.webp',
    'art/companion/dragon-legendary.webp',
  ],
};

const MOOD_LABELS = ["Traurig", "Besorgt", "Okay", "Gut", "Magisch", "Müde"];

// Ronki's first-person quip pools — bubble text above the campfire Ronki.
// Pool chosen by time-of-day; tapping Ronki rotates to another random line
// from the same pool. Marc stripped the weather/°C suffix (Apr 21 2026)
// because it crowded the bubble and duplicated the Heute-tab weather chip.
const MORNING_QUIPS = [
  'Ich bin heute voller Vorfreude.',
  'Der Tag riecht gut — findest du nicht?',
  'Was machen wir heute zuerst?',
  'Ich hab die halbe Nacht geträumt.',
  'Hast du gut geschlafen?',
  'Ich rieche schon den Tag.',
];
const AFTERNOON_QUIPS = [
  'Das Feuer wärmt so schön.',
  'Ich hab auf dich gewartet.',
  'Setz dich, erzähl was.',
  'Das ist ein guter Tag.',
  'Ich mag dich, wenn du wiederkommst.',
  'Guck mal die Wolken.',
];
const EVENING_QUIPS = [
  'Die Sterne kommen raus.',
  'Heute war viel los, oder?',
  'Ich mag diese leise Stunde.',
  'Gleich schlafen wir gut.',
  'Langsam wird\u2019s kuschelig.',
  'Das Feuer summt noch ein bisschen.',
];

function pickQuip(hr, roll) {
  const pool = hr < 11 ? MORNING_QUIPS : hr < 17 ? AFTERNOON_QUIPS : EVENING_QUIPS;
  // Deterministic daily first quip (so Louis sees the same line when
  // he reopens within the day), but tap-to-roll uses a counter to pick
  // a different line each tap. Math.abs so negative indices don't fail.
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  const idx = Math.abs((dayIdx + roll * 2654435761) % pool.length);
  return pool[idx];
}

// Per-mood color palette — matches Journal's MOOD_COLORS so "Gut" feels
// warm-amber, "Magisch" rosa, "Traurig" cool-blue etc. Used for the
// logged mood chip on Hub so it reads as a MOOD BATH (claimed) instead
// of a faded placeholder at 8% opacity (Marc call-out). Tint = bg wash,
// ink = text / border accent. Indexed by MOOD_EMOJIS order.
const MOOD_COLORS = [
  { tint: '#dbeafe', ink: '#1e40af' }, // 0 Traurig — cool blue
  { tint: '#ede9fe', ink: '#6d28d9' }, // 1 Besorgt — quiet violet
  { tint: '#e5e7eb', ink: '#475569' }, // 2 Okay — neutral slate
  { tint: '#fef3c7', ink: '#b45309' }, // 3 Gut — warm amber
  { tint: '#fce7f3', ink: '#be185d' }, // 4 Magisch — rosa
  { tint: '#cffafe', ink: '#0e7490' }, // 5 Müde — cyan
];

const BOSS_ART = {
  schnarchling: { full: 'art/boss-schnarchling_the-snorer-fullpower.webp', defeated: 'art/boss-schnarchling_the-snorer-defeated.webp' },
  wusselwicht:  { full: 'art/boss-wusselwicht-the-chaos-imp-fullpower.webp', defeated: 'art/boss-wusselwicht-the-chaos-imp-defeated.webp' },
  flimmerfux:   { full: 'art/boss-flimmerfux_the-flicker-fox-fullpower.webp', defeated: 'art/boss-flimmerfux_the-flicker-fox-defeated.webp' },
};

// ══════════════════════════════════════════════════════════════════════════
// HUB — Simplified layout (Apr 2026 density pass)
//   · Scroll-over painted scene (full-bleed) behind content
//   · Slim hero pill + HP pill
//   · HEUTE card + 3-block anchor rail (morning / evening / bedtime)
//     — single nav-to-quests CTA (Als Nächstes removed as duplicate)
//   · Mood chip → Wasser pill — body-care bookend
//   · Visitor card (conditional, silent days = no card)
//   · Spielzimmer card (entry to MiniGames, which now hosts Cave +
//     Forscher-Ecke tiles that used to live here)
//   · [dev: Boss / Achievement / Leitstern]
//   · Memory Wall moved to RonkiProfile (single source of truth for "our story")
//   · LoginBonus removed (retention-bait; see project_ronki_positioning.md)
//   · Arc system paused — see backlog_arc_offer_rework.md
//   · Apr 2026 density pass removed: Als Nächstes, Kristall-Höhle,
//     Forscher-Ecke, Extra-Aufgaben cards. First-viewport element count
//     dropped from 10-14 → 6 for the 6yo target readability bar.
// ══════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
export default function Hub({ onNavigate, onPlayMint }) {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct } = computed;
  const { t, lang } = useTranslation();
  const { track } = useAnalytics();
  const { weather } = useWeather();
  const voice = useVoice();
  const base = import.meta.env.BASE_URL;
  const remaining = total - done;
  const MOOD_LABELS_I18N = [t('mood.sad'), t('mood.worried'), t('mood.okay'), t('mood.good'), t('mood.magical'), t('mood.tired')];

  // Arc system paused — no auto-offer, no active banner. See
  // backlog_arc_offer_rework.md for reactivation criteria (when to deliver the
  // first adventure, fixing "Vielleicht später", etc).
  // const { phase: arcPhase, offer, offeredArc, activeArc, inCooldown } = useArc();
  // useEffect(() => {
  //   if (arcPhase === 'idle' && !offeredArc) offer();
  // }, [arcPhase, offeredArc, offer]);
  const arcPhase = 'idle';

  const [showBossDetail, setShowBossDetail] = useState(false);
  const [openBeat, setOpenBeat] = useState(null);
  const [showClothing, setShowClothing] = useState(false);
  const [quipRollKey, setQuipRollKey] = useState(0);
  const [showEveningRitual, setShowEveningRitual] = useState(false);
  const [showGefuehlsecke, setShowGefuehlsecke] = useState(false);
  const [zeigBlock, setZeigBlock] = useState(null);

  // Expedition state — stubs for now. CampfireScene accepts 'idle' /
  // 'away' / 'returning' and renders Ronki sitting by the fire / a paw
  // trail / a glowing diary pickup respectively. The simplified state
  // machine (surprise-based, not routine-gated per Marc's call-out)
  // lands in a follow-up; for now Ronki is always home so Louis sees
  // the baseline scene every time.
  const expeditionState = 'idle';
  const expeditionStatusText = null;
  const expeditionStatusSub = null;

  // forscherSeen attention flag removed with the Hub simplification —
  // the Forscher-Ecke card no longer mounts here, so the NEU badge is
  // handled inside MiniGames instead.

  // Trigger evening ritual when: evening + all bedtime quests done + hasn't happened today yet
  useEffect(() => {
    const hour = new Date().getHours();
    const today = new Date().toISOString().slice(0, 10);
    const alreadyDone = state?.eveningRitualCompletedAt === today;
    const bedtimeQuests = (state?.quests || []).filter(q => q.anchor === 'bedtime' && !q.sideQuest);
    const bedtimeDone = bedtimeQuests.length > 0 && bedtimeQuests.every(q => q.done);
    if (hour >= 18 && bedtimeDone && !alreadyDone && !showEveningRitual) {
      setShowEveningRitual(true);
    }
  }, [state?.quests, state?.eveningRitualCompletedAt]);

  // Zeig-Moment: once per block per day when that block's main quests are all done.
  // Opt-in — default off (Marc Apr 2026 "rather annoying" on first-run).
  useEffect(() => {
    if (!state) return;
    if (zeigBlock) return;
    const enabled = state?.familyConfig?.zeigMomentEnabled === true;
    if (!enabled) return;
    const today = new Date().toISOString().slice(0, 10);
    const counts = state?.zeigMomentCounts || {};
    const shown = state?.zeigMomentShownDates || {};
    const hour = new Date().getHours();

    const checkBlock = (block, hourWindow) => {
      if (!hourWindow(hour)) return false;
      if (shown[block] === today) return false;
      if ((counts[block] || 0) >= 14) return false;
      const quests = (state.quests || []).filter(q => q.anchor === block && !q.sideQuest);
      if (quests.length === 0) return false;
      return quests.every(q => q.done);
    };

    if (checkBlock('morning', h => h >= 6 && h < 12)) { setZeigBlock('morning'); return; }
    if (checkBlock('evening', h => h >= 12 && h < 18)) { setZeigBlock('evening'); return; }
    if (checkBlock('bedtime', h => h >= 18 || h < 6)) { setZeigBlock('bedtime'); return; }
  }, [state?.quests, state?.zeigMomentShownDates, state?.zeigMomentCounts, state?.familyConfig?.zeigMomentEnabled, zeigBlock]);

  // Ronki greets Louis once when Hub mounts.
  useEffect(() => {
    voice.say('hub_open', { arcPhase });
    // Re-evaluate organic mood triggers on every Hub entry. This is how
    // Ronki flips to 'gut' after Louis finished all his quests on the
    // Heute tab and came back — without opening the Ronki profile. See
    // syncRonkiMood in TaskContext for the trigger ladder.
    actions.syncRonkiMood?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  // ── Progressive disclosure — stage-reveal Hub sections by totalTasksDone.
  //    See backlog_progressive_hub_disclosure.md. Fresh kids + parents
  //    (Hector Apr 2026, Louis density feedback) land on a quiet screen
  //    with just the quest list; Mood/Wasser/Als-Nächstes/Forscher/Extras
  //    fade in as tasks get ticked off.
  //    Dev override via URL: ?reveal=all (show everything) or
  //    ?reveal=N (simulate at task count N).
  const _tasksReal = state.totalTasksDone || 0;
  const _revealParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('reveal')
    : null;
  const _tasksEffective = _revealParam === 'all'
    ? Infinity
    : (_revealParam != null && !Number.isNaN(Number(_revealParam)))
      ? Number(_revealParam)
      : _tasksReal;
  const reveal = (n) => _tasksEffective >= n;

  // ── Time-of-day sky (page-level ambient, behind everything) ──
  const SKY_IMAGES = {
    dawn:   'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_an_early_morning_sky._S_882cfbe3-5eac-4403-87a0-5c66602cf76b_2.webp',
    midday: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp',
    golden: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_golden_hour_sky._Rich_a1deb403-56d2-4c34-9775-f174de32afb4_1.webp',
    night:  'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_deep_night_sky._Rich__c902cc19-afa0-4c99-a434-6e206610ddf9_0.webp',
  };
  const _h = new Date().getHours();
  // Current quip for the campfire bubble. Re-derived each render so
  // tapping Ronki (which bumps quipRollKey) swaps to a different line
  // from the same time-of-day pool.
  //
  // Unlock hint placement test (Apr 2026, see backlog_progressive_hub_disclosure.md):
  //   ?hint=heute  → small footer pill inside the HEUTE card
  //   ?hint=ronki  → override Ronki's campfire quip with a first-person
  //                  unlock invitation ("Mach deine erste Aufgabe — dann wach
  //                  ich auf"). Only applies while Ronki tab is locked.
  //   default      → neither (ship current behavior until Marc picks a variant)
  const hintPlacement = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('hint')
    : null;
  const ronkiLocked = (state.totalTasksDone || 0) < 1;
  const showHeuteHint = hintPlacement === 'heute' && ronkiLocked;
  const showRonkiVoiceHint = hintPlacement === 'ronki' && ronkiLocked;
  const baseQuip = pickQuip(_h, quipRollKey);
  const currentQuip = showRonkiVoiceHint ? t('unlockHint.ronki.voice') : baseQuip;

  // Tagebuch + Laden unlock hints (always-on on the relevant Hub cards
  // when those tabs are locked; Marc Apr 2026: "showcase it on the
  // Stimmungs-card"). Hint copy adapts to what's missing, so a kid who
  // logged mood but hasn't finished 3 tasks sees a different nudge than
  // a kid at 4 tasks who still hasn't logged mood.
  const tasksDone = state.totalTasksDone || 0;
  const moodLogged = state.moodAM != null || state.moodPM != null;
  const journalTasksRemaining = Math.max(0, 3 - tasksDone);
  const journalLocked = !(tasksDone >= 3 && moodLogged);
  let journalUnlockHint = null;
  if (journalLocked) {
    if (!moodLogged && journalTasksRemaining > 0) {
      journalUnlockHint = t('unlockHint.journal.needMood', { tasks: journalTasksRemaining });
    } else if (!moodLogged) {
      journalUnlockHint = t('unlockHint.journal.needMoodOnly');
    } else if (journalTasksRemaining > 0) {
      journalUnlockHint = t('unlockHint.journal.needTasks', { tasks: journalTasksRemaining });
    }
  }
  const shopLocked = (state.hp || 0) < 50;
  const shopUnlockHint = shopLocked
    ? t('unlockHint.shop.progress', { current: state.hp || 0 })
    : null;
  const skyFile = SKY_IMAGES[
    _h >= 6  && _h < 10 ? 'dawn' :
    _h >= 10 && _h < 17 ? 'midday' :
    _h >= 17 && _h < 20 ? 'golden' :
    'night'
  ];

  const level = getLevel(state.xp || 0);
  const lvlProg = getLvlProg(state.xp || 0);
  const xpPct = lvlProg.need > 0 ? Math.min(100, (lvlProg.cur / lvlProg.need) * 100) : 0;
  const heroName = state.familyConfig?.childName || t('topbar.heroFallback');
  const heroAvatar = state.heroGender === 'girl' ? 'art/hero-default-girl.webp' : 'art/hero-default.webp';

  // ── Companion + scene ──
  const eggType = state.eggType || 'fire';
  const catStage = getCatStage(state.catEvo || 0);
  const companionType = 'dragon';
  const stageName = t('companion.' + companionType + '.' + catStage) || t('companion.stage.egg');
  const stageNum = catStage + 1;
  // sceneSrc (lager-stageN.png) removed — CampfireScene handles the hub
  // backdrop now with CSS. Freed ~8MB of Midjourney PNGs.
  const variantMeta = state.companionVariant ? getVariant(state.companionVariant) : null;
  const nameplateLabel = isDevMode()
    ? `${t('hub.companion.stage', { stage: stageNum })} · ${stageName}`
    : variantMeta
      ? (variantMeta.name[lang] || variantMeta.name.de)
      : null;

  // ── Anchor rail data (3 blocks: morning, evening, bedtime). Hobby lives in Bonus. ──
  const ANCHOR_ORDER = ['morning', 'evening', 'bedtime'];
  const anchorProgress = ANCHOR_ORDER.map(a => {
    const items = (state.quests || []).filter(q => q.anchor === a && !q.sideQuest);
    if (!items.length) return null;
    const gDone = items.filter(q => q.done).length;
    return { anchor: a, pct: items.length ? gDone / items.length : 0, count: items.length };
  }).filter(Boolean);

  // Als Nächstes removed with the Apr 2026 Hub simplification — HEUTE
  // card already covers the "go to quests" CTA; see comment below.

  // ── Today's visitor (for the Campfire Visitors card). Runs the same
  //    settle-in + frequency gates as the game itself; null on silent
  //    days is a FEATURE. Only shown once Louis has the habit ≥ 3 tasks
  //    to match existing Hub card-reveal pacing.
  const todayISO = new Date().toISOString().slice(0, 10);
  const visitor = reveal(3) ? pickTodaysVisitor(state, todayISO) : null;
  const visitorFreundMeta = visitor
    ? { drachenmutter: '🐉', pilzhueter: '🍄', eulenhueterin: '🦉', wolfbruder: '🐺', sternenkind: '✨' }[visitor.freundId]
    : null;

  // Cave availability check moved into MiniGames (Spielzimmer) along
  // with the entry tile itself. Hub no longer renders the Cave card.

  // ── Minispiele / Spielzimmer — consulted per parent's chosen mode.
  //    'frei' → always unlocked, card always visible after reveal(3).
  //    'routine' → card shows after at least one routine section done.
  //    'zeitfenster' → card shows only during the parent-set window.
  //    See useGameAccess.ts for the full logic. Placed next to the
  //    Cave card in the Hub hero stack so games are discoverable where
  //    Louis already looks, not buried in Ronki's profile.
  const gameAccess = useGameAccess();
  const spielzimmerAvailable = reveal(3) && gameAccess.unlocked;

  // Side-quest preview computation removed — Extras card no longer on
  // Hub. Side quests continue to render inside TaskList (Aufgaben tab).

  return (
    <div className="relative min-h-dvh pb-32" style={{ backgroundColor: '#fff8f2' }}>

      {/* ═════════════════════════════════════════════════════════════════
         A · AMBIENT PAGE BACKGROUND (fixed) — Hub keeps its time-of-day
         sky variation (dawn/midday/golden/night). This already gives the
         Lager its own strong identity independent of the biome tint
         system the other tabs use.
         ═════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none"
           style={{
             zIndex: 0,
             background: `linear-gradient(rgba(255,248,242,0.82) 0%, rgba(255,248,242,0.92) 100%), url(${base}${skyFile}) center top / cover no-repeat`,
             backgroundColor: '#fff8f2',
           }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <CloudWaves fill="253,248,240" opacity={1.2} />
      </div>

      {/* ═════════════════════════════════════════════════════════════════
         DEV badge — unobtrusive, top-right (dev mode only)
         ═════════════════════════════════════════════════════════════════ */}
      {isDevMode() && (
        <div
          className="fixed z-[100] px-2 py-0.5 rounded-md font-label font-bold text-[10px] uppercase tracking-widest pointer-events-none select-none"
          style={{
            top: 'calc(var(--alpha-banner-h, 0px) + 6px)',
            right: 'calc(env(safe-area-inset-right, 0px) + 6px)',
            background: 'rgba(18,67,70,0.55)',
            color: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
          }}
          aria-hidden="true"
        >
          DEV
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
         B · CAMPFIRE SCENE — zero-asset CSS scene with day/golden/night
         variants that shift automatically with the clock hour. Replaces
         the old lager-stage1-4.png Midjourney sequence (-8MB of assets)
         with a painterly CSS scene Louis loved in Claude Design's
         Feature Previews. Includes side-view chibi Ronki sitting by
         the fire, flame flicker, wing flap, and night stars.
         `state='idle'` = Ronki home; 'away' / 'returning' hooks are
         wired for the simplified Expedition feature landing next.
         ═════════════════════════════════════════════════════════════════ */}
      <div className="absolute left-0 right-0 top-0 overflow-hidden"
           style={{ zIndex: 1 }}>
        <CampfireScene
          hour={_h}
          state={expeditionState}
          statusText={expeditionStatusText}
          statusSub={expeditionStatusSub}
          greetingText={currentQuip}
          onRonkiTap={() => setQuipRollKey(k => k + 1)}
          onDiaryTap={() => setOpenBeat('expedition-diary')}
          variant={state?.companionVariant || 'amber'}
          stage={getCatStage(state?.catEvo || 0)}
          mood={state?.ronkiMood || 'normal'}
          weather={weather?.current ? getWeatherCategory(weather.current.weatherCode) : undefined}
          height={340}
        />
        {/* Fade into cream paper so cards below land on a clean surface */}
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,248,242,0.55) 55%, #fff8f2 100%)' }} />
      </div>

      {/* ═════════════════════════════════════════════════════════════════
         C · TOP BAR — avatar-pill (left) + HP pill (right).
         Floats over the painted scene. Polish .topbar spec: balanced
         layout. Audit call-out: Marc flagged missing HP pill on Hub —
         added here so every view has consistent top chrome. The right HP
         pill matches Polish .hp spec (cream→amber gradient, 22px pearl,
         primary number + gold-ink label below).
         ═════════════════════════════════════════════════════════════════ */}
      <header className="relative flex justify-between items-center gap-3"
              style={{
                zIndex: 10,
                padding: '10px 20px 14px',
                paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
              }}>
        <button onClick={() => onNavigate?.('ronki')}
                className="inline-flex items-center active:scale-95 transition-all rounded-full shrink-0"
                style={{
                  background: 'rgba(255,248,242,0.82)',
                  backdropFilter: 'blur(14px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                  padding: '5px 14px 5px 5px',
                  gap: 10,
                  border: '1px solid rgba(18,67,70,0.12)',
                  boxShadow: '0 4px 14px -4px rgba(18,67,70,0.22)',
                }}>
          <div className="relative">
            <div className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
                 style={{ width: 38, height: 38, background: '#fef3c7', border: '2px solid #fff' }}>
              <img src={base + heroAvatar} alt={heroName} className="w-full h-full object-cover" />
            </div>
            {isDevMode() && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow"
                   style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', border: '2px solid white', color: '#1a1a1a', lineHeight: 1 }}>
                {level}
              </div>
            )}
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="font-headline whitespace-nowrap"
                  style={{ fontSize: 15, fontWeight: 600, color: '#124346', lineHeight: 1 }}>
              {heroName}
            </span>
            <span className="font-label font-bold uppercase whitespace-nowrap"
                  style={{ fontSize: 10, letterSpacing: '0.16em', color: '#725b00', marginTop: 3, lineHeight: 1 }}>
              {/* Tag N pill: reads totalTaskDays — # days the kid has
                   completed the main routine. Previously read the
                   phantom `state.streak` field (removed in Apr 2026
                   rebuild), which meant the fallback kicked in every
                   time → "TAG 1" stuck forever, no matter how long
                   the app had been used. Now matches the same counter
                   RonkiProfile / Buch / DiscoveryLog already surface. */}
              {t('hub.streakDay', { n: Math.max(1, state.totalTaskDays || 0) })}
            </span>
          </div>
        </button>

        {/* HP pill — Polish .hp spec. Tall "N / HELDENPUNKTE" shape,
             cream→amber vertical gradient, 22px pearl, primary-teal
             number + gold-ink label below. Proud score, not chip. */}
        <div data-sterne-pill className="flex items-center rounded-full shrink-0"
             style={{
               background: 'linear-gradient(180deg, #fff8e1 0%, #fde68a 100%)',
               border: '1px solid rgba(180,83,9,0.25)',
               padding: '7px 14px 7px 9px',
               gap: 8,
               boxShadow: '0 4px 12px -4px rgba(252,211,77,0.6), inset 0 1px 0 rgba(255,255,255,0.7)',
             }}>
          <Pearl size={22} />
          <div className="flex flex-col leading-none">
            <AnimatedCount
              value={state.hp || 0}
              className="font-label font-extrabold"
              style={{ color: '#124346', fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1 }}
            />
            <span className="font-label font-semibold uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.16em', color: '#725b00', marginTop: 3, lineHeight: 1 }}>
              {lang === 'de' ? 'Sterne' : 'Stars'}
            </span>
          </div>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════
         D · MAIN CONTENT — layers below scene now. paddingTop pushes the
         first card past the scene's 340px so Ronki + campfire are fully
         visible above (Marc call-out). The Lagerfeuer section title acts
         as the page-structure break between "scene" and "cards".
         ═════════════════════════════════════════════════════════════════ */}
      <main className="relative px-6 max-w-lg mx-auto flex flex-col gap-4"
            style={{ zIndex: 10, paddingTop: 228 }}>

        {/* Lagerfeuer kicker/headline removed entirely — Marc: "way too
             much spacing for my taste". Scene itself carries the
             time-of-day; no text header needed. paddingTop 184→228
             gives "just a tiny bit more" so Ronki + flame read clearly,
             cards then kiss the bottom of the scene. */}

        {/* Weather chip removed — lives in Ronki's morning bubble now. */}
        <section className="flex flex-col items-center gap-2">
          {voice.line && (
            <div className="w-full max-w-md px-2 mt-1">
              <VoiceBubble line={voice.line} onDismiss={voice.dismiss} variant="chip" />
            </div>
          )}
          {nameplateLabel && (
            <div className="px-5 py-1.5 rounded-full"
                 style={{
                   background: 'rgba(255,248,242,0.96)',
                   border: '1px solid rgba(18,67,70,0.14)',
                   boxShadow: '0 6px 14px -4px rgba(18,67,70,0.22), inset 0 1px 0 rgba(255,255,255,0.9)',
                 }}>
              <p className="font-bold text-[11px] font-label uppercase tracking-[0.22em] text-primary-container whitespace-nowrap">
                {nameplateLabel}
              </p>
            </div>
          )}
        </section>

        {/* ── Urgent surfaces kept primary (rare + actionable) ── */}
        {/* Arc banner + cooldown hint paused — see backlog_arc_offer_rework.md */}
        {/* Login bonus card removed — retention-bait contradicts "companion that
            fades by design" positioning. See project_ronki_positioning.md. */}

        {state.familyConfig?.parentMessage?.enabled && state.familyConfig?.parentMessage?.body && (
          <div className="w-full p-5 rounded-2xl"
               style={{ background: 'linear-gradient(135deg, #0c2a2e, #0f3236)', border: '1px solid rgba(94,234,212,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">💌</span>
              <div className="flex-1 min-w-0">
                {state.familyConfig.parentMessage.title && (
                  <p className="font-label text-xs uppercase tracking-widest mb-1"
                     style={{ color: 'rgba(161,207,211,0.7)' }}>
                    {state.familyConfig.parentMessage.title}
                  </p>
                )}
                <p className="font-body text-sm leading-relaxed text-white">
                  {state.familyConfig.parentMessage.body}
                </p>
                {state.familyConfig.parentMessage.signature && (
                  <p className="font-body text-xs mt-2 italic"
                     style={{ color: 'rgba(252,211,77,0.6)' }}>
                    {state.familyConfig.parentMessage.signature}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {state.yesterdayCommitment && state.moodAM === null && (
          <div className="w-full p-4 rounded-2xl"
               style={{ background: 'rgba(252,211,77,0.07)', border: '1px solid rgba(252,211,77,0.22)' }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0" aria-hidden="true">🌅</span>
              <div>
                <p className="font-label text-xs uppercase tracking-widest mb-1" style={{ color: '#b45309' }}>
                  {t('hub.commitment.label')}
                </p>
                <p className="font-body text-sm text-on-surface">
                  {state.yesterdayCommitment.text}
                </p>
                <p className="font-label text-xs mt-1.5 text-on-surface-variant">
                  {t('hub.commitment.hint')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mood chip moved DOWN next to Wasser (pair as body-care bookend,
             per Marc) — see new mount point below the Als-Nächstes card. */}

        {/* ── HEUTE card (Aufgabentracker from A) + anchor rail ── */}
        <button onClick={() => onNavigate?.('quests')}
                className="w-full p-6 rounded-2xl relative overflow-hidden text-left active:scale-[0.98] transition-transform"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,244,224,0.88) 80%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 12px 36px -8px rgba(18,67,70,0.18), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}>
          <span className="absolute top-3 right-20 text-base opacity-60 select-none" aria-hidden="true">✦</span>
          <span className="absolute bottom-3 left-5 text-xs opacity-40 select-none" aria-hidden="true">✦</span>

          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] font-label uppercase tracking-[0.22em] text-secondary mb-1.5">
                {lang === 'de' ? 'HEUTE' : 'TODAY'}
              </p>
              <h3 className="font-headline text-2xl text-primary-container leading-[1.1]"
                  style={{ fontWeight: 500, letterSpacing: '-0.015em', textWrap: 'balance' }}>
                {allDone ? t('hub.allDone.title') : t('hub.remaining', { count: remaining })}
              </h3>
              <p className="font-body text-on-surface-variant text-sm mt-1">
                {allDone ? t('hub.allDone.subtitle') : t('hub.keepGoing')}
              </p>
            </div>

            <div className="relative w-20 h-20 shrink-0">
              <svg key={done} className="progress-ring-anim w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(18,67,70,0.12)" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="transparent"
                  stroke={allDone ? '#34d399' : '#fcd34d'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="176" strokeDashoffset={176 - pct * 176} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                {allDone ? (
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                ) : (
                  <>
                    <span className="font-headline font-extrabold text-xl text-primary-container">{done}</span>
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">/ {total}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Anchor rail */}
          {anchorProgress.length > 0 && (
            <div className="flex gap-2 mt-5">
              {anchorProgress.map(({ anchor, pct: pctG }) => {
                const active = pctG > 0 && pctG < 1;
                return (
                  <div key={anchor} className="flex-1">
                    <div className="h-1.5 rounded-full overflow-hidden"
                         style={{ background: 'rgba(18,67,70,0.1)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                           style={{ width: `${pctG * 100}%`, background: pctG === 1 ? '#34d399' : '#fcd34d' }} />
                    </div>
                    <div className="text-center mt-2 font-label font-semibold text-[9px] uppercase tracking-[0.14em]"
                         style={{ color: active ? '#124346' : 'rgba(107,101,91,1)' }}>
                      {t('anchor.short.' + anchor)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unlock hint — variant A (?hint=heute). Small gold footer pill
               inside the HEUTE card. Only shows while Ronki tab is locked. */}
          {showHeuteHint && (
            <div
              className="mt-4 -mx-1 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5"
              style={{
                background: 'rgba(252,211,77,0.14)',
                border: '1px solid rgba(180,83,9,0.22)',
              }}
            >
              <span
                className="font-label font-bold uppercase text-center"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: '#b45309',
                }}
              >
                {t('unlockHint.ronki.heute')}
              </span>
            </div>
          )}
        </button>

        {/* ── Als Nächstes REMOVED (Apr 2026 Hub simplification).
               Decision: HEUTE card already takes Louis to the Aufgaben tab
               and shows "N Aufgaben bleiben" + the anchor rail. Duplicating
               the "go to quests" CTA with a specific next-quest preview
               created two targets for the same action. Playtest ("too much
               on the Lager") + first-viewport density research (6yo target
               4-6 elements max) drove the removal. The specific next quest
               now only lives inside Aufgaben, where Louis is already
               oriented to pick. ── */}

        {/* ── Mood chip — body-care pair with Wasser (Marc reordering).
               Collapsed by default, taps to expand picker inline.
               Sad/worried/tired → Gefühlsecke follow-up.
               Progressive disclosure: unlocks after 1st task so a fresh
               kid isn't handed feelings + quests on the same screen. ── */}
        {reveal(1) && (state.moodAM === null ? (
          <details className="group rounded-2xl overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(252,211,77,0.26)', boxShadow: '0 2px 10px rgba(217,119,6,0.05)' }}>
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden active:scale-[0.99] transition-all">
              <div className="flex items-center gap-2.5">
                <span className="text-lg" aria-hidden="true">🌤️</span>
                <span className="font-body font-semibold text-sm text-on-surface">
                  {t('hub.mood.title')}
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-base group-open:rotate-180 transition-transform">
                expand_more
              </span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap justify-center gap-2.5">
                {[3, 4, 2, 0, 1, 5].map((idx) => (
                  <button key={idx} onClick={() => {
                      SFX.play("pop");
                      actions.setMood("moodAM", idx);
                      // Analytics: mood.pick. The `mood` prop is a stable
                      // enum ID, not a localized label (never the user-
                      // facing string). slot is 'AM' on Hub since Hub
                      // only writes moodAM. Truncation to the hour is
                      // handled in the analytics module.
                      track('mood.pick', { mood: MOOD_ENUM[idx] || 'unknown', slot: 'AM' });
                      if (idx === 0 || idx === 1 || idx === 5) {
                        setTimeout(() => setShowGefuehlsecke(true), 400);
                      }
                    }}
                    className="w-[56px] h-[56px] text-2xl rounded-2xl transition-all active:scale-90 flex items-center justify-center"
                    style={{ background: 'rgba(252,211,77,0.08)', border: '2px solid rgba(252,211,77,0.22)' }}>
                    {MOOD_EMOJIS[idx]}
                  </button>
                ))}
              </div>
            </div>
          </details>
        ) : (() => {
          // Per-mood color bath — "Gut" = amber, "Magisch" = rosa,
          // "Traurig" = blue etc. Replaces the old 8%-opacity ghost chip
          // so the logged mood feels CLAIMED, not placeholder (Marc
          // call-out). Tint drives bg + halo; ink drives text + border.
          const mc = MOOD_COLORS[state.moodAM] || MOOD_COLORS[3];
          return (
            <button
              onClick={() => actions.setMood('moodAM', null)}
              className="w-full px-4 py-3.5 rounded-2xl flex items-center gap-3.5 active:scale-[0.99] transition-all text-left"
              style={{
                background: `linear-gradient(160deg, ${mc.tint} 0%, ${mc.tint}dd 100%)`,
                border: `1.5px solid ${mc.ink}33`,
                boxShadow: `0 6px 18px -8px ${mc.ink}55, inset 0 1px 0 rgba(255,255,255,0.5)`,
              }}
              aria-label={`Stimmung: ${MOOD_LABELS_I18N[state.moodAM]}. Tippe zum Ändern.`}
            >
              {/* Emoji in a small white halo — echoes Journal's mood-tile
                   face pattern so the chip looks like a claimed badge */}
              <span
                className="flex items-center justify-center shrink-0 rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: '#ffffff',
                  boxShadow: `0 0 0 3px ${mc.tint}, 0 2px 6px -2px ${mc.ink}40`,
                  fontSize: 24,
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                {MOOD_EMOJIS[state.moodAM]}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-label font-extrabold uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.22em', color: mc.ink, opacity: 0.85 }}
                >
                  {t('hub.mood.label')}
                </p>
                <p
                  className="font-headline font-bold truncate"
                  style={{ fontSize: 18, color: mc.ink, letterSpacing: '-0.01em', fontWeight: 600 }}
                >
                  {MOOD_LABELS_I18N[state.moodAM]}
                </p>
              </div>
              {/* Subtle change hint — parent-safe tiny edit icon */}
              <span
                className="material-symbols-outlined shrink-0"
                style={{ fontSize: 18, color: `${mc.ink}70` }}
                aria-hidden="true"
              >
                edit
              </span>
            </button>
          );
        })())}

        {/* Tagebuch unlock hint — quiet gold caption under the Stimmung
             card. Copy adapts based on what the kid still needs (log mood
             / finish more tasks / both). Only shows while Tagebuch is
             locked AND the Stimmung card itself is revealed. */}
        {reveal(1) && journalUnlockHint && (
          <div
            className="-mt-2 self-center px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(252,211,77,0.16)',
              border: '1px solid rgba(180,83,9,0.22)',
            }}
          >
            <span
              className="font-label font-bold uppercase text-center"
              style={{ fontSize: 10, letterSpacing: '0.08em', color: '#b45309' }}
            >
              {journalUnlockHint}
            </span>
          </div>
        )}

        {/* ── Wasser pill — baseline care, now paired with Mood above.
               Daily-required tracker. Together Stimmung + Wasser form the
               "body care" bookend on the Hub (Marc's reorder Apr 2026).
               Progressive disclosure: joins at 3 tasks, same threshold as
               Als Nächstes — baseline-care layer arrives together. ── */}
        {reveal(3) && (
          <div className="w-full px-4 py-3 rounded-2xl flex items-center gap-2.5"
               style={{ background: '#fff', border: '1px solid rgba(18,67,70,0.06)' }}>
          <span className="material-symbols-outlined shrink-0"
                style={{ color: '#124346', fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
            water_drop
          </span>
          <span className="font-label font-semibold text-[11px] uppercase tracking-[0.14em] shrink-0"
                style={{ color: '#124346' }}>
            {t('hub.water.title')}
          </span>
          <div className="flex-1 flex gap-1">
            {[0,1,2,3,4,5].map(i => {
              const filled = i < (state.dailyWaterCount || 0);
              const isNext = i === (state.dailyWaterCount || 0);
              return (
                <button
                  key={i}
                  className="flex-1 h-2 rounded-md transition-all"
                  style={{
                    background: filled ? '#124346' : (isNext ? 'rgba(18,67,70,0.22)' : 'rgba(18,67,70,0.08)'),
                    border: 'none',
                    cursor: isNext ? 'pointer' : 'default',
                  }}
                  disabled={!isNext && !filled}
                  onClick={() => isNext && actions.drinkWater?.()}
                  aria-label={isNext ? t('hub.water.hint') : undefined}
                />
              );
            })}
          </div>
          <span className="font-label font-bold text-[12px] shrink-0 text-right"
                style={{ color: '#6b655b', minWidth: 30 }}>
            {(state.dailyWaterCount || 0)}/6
          </span>
          </div>
        )}

        {/* Laden unlock hint — shows current Sterne progress toward the
             50-star shop unlock. Gated on reveal(1) (first task done) so
             fresh-install screen 0 stays quiet, but from task 1 onwards
             Louis sees his Sterne count ticking toward the shop opening.
             Rides just above the Wasser pill (or in its slot when Wasser
             is still gated). */}
        {reveal(1) && shopUnlockHint && (
          <div
            className="-mt-2 self-center px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(252,211,77,0.16)',
              border: '1px solid rgba(180,83,9,0.22)',
            }}
          >
            <span
              className="font-label font-bold uppercase text-center"
              style={{ fontSize: 10, letterSpacing: '0.08em', color: '#b45309' }}
            >
              {shopUnlockHint}
            </span>
          </div>
        )}

        {/* ── Campfire Visitor card — only shows on days a Freund stops
               by (settle-in + frequency gates inside pickTodaysVisitor).
               Silent days intentionally show NOTHING; Marc Apr 2026:
               absence is neutral, no "Ronki sad no fox today" chrome. ── */}
        {visitor && (
          <button
            onClick={() => onNavigate?.('visitors')}
            className="w-full p-4 rounded-2xl flex items-center gap-3 text-left active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fff8f2 100%)',
              border: '1.5px solid rgba(252,211,77,0.55)',
              boxShadow: '0 8px 20px -8px rgba(252,211,77,0.45)',
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 48, height: 48, borderRadius: 16,
                background: 'radial-gradient(circle at 50% 40%, rgba(252,211,77,0.35), rgba(255,248,242,0.8))',
                fontSize: 28,
              }}
            >
              {visitorFreundMeta}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label font-bold text-[10px] uppercase tracking-[0.22em] mb-0.5"
                 style={{ color: '#b45309' }}>
                {lang === 'de' ? 'Besuch am Lagerfeuer' : 'Visitor at the campfire'}
              </p>
              <p className="font-headline font-semibold text-[15px] leading-tight text-on-surface">
                {lang === 'de' ? 'Jemand wartet auf dich' : 'Someone is waiting for you'}
              </p>
            </div>
            <span className="material-symbols-outlined shrink-0" style={{ color: '#b45309', fontSize: 20 }}>chevron_right</span>
          </button>
        )}

        {/* ── Kristall-Höhle RELOCATED (Apr 2026 Hub simplification).
               Moved into the Spielzimmer (MiniGames.jsx) so the Hub's
               first viewport stays under the 4-6 element ceiling for
               6yos. Cave route (setView('hoehle')) is unchanged — only
               the entry tile moved. Same settle-in gate (15+ tasks)
               is enforced inside MiniGames via useTask(). ── */}

        {/* ── Spielzimmer — Ronki's game room, access-aware.
               Visibility driven by useGameAccess → canAccessMinigames:
                 'frei'        → always visible from reveal(3)
                 'routine'     → visible when today's routine is done
                 'zeitfenster' → visible inside the parent-set window
               Surfaces games on the Hub instead of burying them in the
               Ronki-tab teaser (22 Apr 2026 playtest: Louis couldn't
               find them). Warm amber gradient to sit visually next to
               the Cave without competing. ── */}
        {spielzimmerAvailable && (
          <button
            onClick={() => onNavigate?.('games')}
            className="w-full p-4 rounded-2xl flex items-center gap-3 text-left active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1.5px solid rgba(217,119,6,0.45)',
              boxShadow: '0 10px 22px -10px rgba(217,119,6,0.45)',
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 48, height: 48, borderRadius: 16,
                background: 'radial-gradient(circle at 40% 30%, #fcd34d 0%, #f59e0b 70%, #b45309 100%)',
                boxShadow: '0 0 14px rgba(245,158,11,0.55)',
                fontSize: 26,
              }}
              aria-hidden="true"
            >
              🎮
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label font-bold text-[10px] uppercase tracking-[0.22em] mb-0.5"
                 style={{ color: '#b45309' }}>
                {lang === 'de' ? 'Spielzimmer' : 'Play room'}
              </p>
              <p className="font-headline font-semibold text-[15px] leading-tight" style={{ color: '#78350f' }}>
                {lang === 'de' ? 'Spiel mit Ronki' : 'Play with Ronki'}
              </p>
            </div>
            <span className="material-symbols-outlined shrink-0" style={{ color: '#b45309', fontSize: 20 }}>chevron_right</span>
          </button>
        )}

        {/* ── Forscher-Ecke RELOCATED (Apr 2026 Hub simplification).
               Moved into the Spielzimmer (MiniGames.jsx). The MINT
               progression grid is still a core activity but the big
               Dr. Funkel card was crowding first-viewport on the Hub.
               reveal(10) gate still applies inside MiniGames so the
               sequence doesn't surface for fresh kids. AttentionGlow
               NEU treatment preserved in the relocated mount. ── */}

        {/* ── Extra-Aufgaben REMOVED from Hub (Apr 2026 simplification).
               The bonus/side-quest count + preview already lives inside
               the Aufgaben tab (TaskList), which Louis reaches via the
               HEUTE card. Surfacing it here was adding a fourth
               nav-to-quests CTA. Side quests are unchanged in
               TaskContext — only the Hub entry tile is gone. ── */}

        {/* ═════════════════════════════════════════════════════════════════
           E · DEV-ONLY SURFACES (flat, unwrapped)
           Memory Wall lives on RonkiProfile now (single source of truth for
           "our story so far"), so the Hub tail stays minimal. Below this
           only renders in dev mode.
           ═════════════════════════════════════════════════════════════════ */}

            {/* ── Boss Card (dev only) + full-screen detail ── */}
            {isDevMode() && state.boss && (() => {
              const bd = BOSSES.find(b => b.id === state.boss.id);
              if (!bd) return null;
              const defeated = state.boss.hp <= 0;
              const art = BOSS_ART[bd.id];
              const artSrc = art ? base + (defeated ? art.defeated : art.full) : null;
              const hpPct = state.boss.maxHp > 0 ? (state.boss.hp / state.boss.maxHp) * 100 : 0;
              return (
                <>
                  <div className="p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden"
                       style={{ background: '#1a1a3e', border: '1.5px solid rgba(252,211,77,0.2)', boxShadow: '0 4px 20px rgba(26,26,62,0.25)' }}
                       onClick={() => setShowBossDetail(true)}>
                    <img src={base + 'art/tex-sternenmeer.png'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-55 pointer-events-none" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(26,26,62,0.35), rgba(35,35,80,0.18))' }} />
                    <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden shrink-0 cursor-pointer shadow-lg"
                         style={{ border: '3px solid #fcd34d', boxShadow: '0 0 12px rgba(252,211,77,0.3)' }}>
                      {artSrc ? (
                        <img src={artSrc} alt={t('boss.' + bd.id)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'rgba(186,26,26,0.1)' }}>{bd.icon}</div>
                      )}
                    </div>
                    <div className="relative z-10 flex-1">
                      {defeated ? (
                        <>
                          <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fcd34d' }}>{t('hub.boss.defeated')}</p>
                          <h4 className="font-headline font-bold text-lg text-white">{t('boss.' + bd.id)}</h4>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#fca5a5' }}>{t('hub.boss.fight')}</p>
                            <p className="font-bold text-xs font-label" style={{ color: '#fca5a5' }}>{state.boss.hp}/{state.boss.maxHp} HP</p>
                          </div>
                          <h4 className="font-headline font-bold text-lg text-white">{t('boss.' + bd.id)}</h4>
                          <div className="w-full h-2 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hpPct}%`, background: '#f87171' }} />
                          </div>
                          {(state.bossDmgToday || 0) > 0 && (
                            <p className="font-label font-bold text-xs mt-1" style={{ color: '#fcd34d' }}>
                              {t('hub.boss.todayDmg', { dmg: state.bossDmgToday })}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <span className="relative z-10 material-symbols-outlined text-2xl" style={{ color: 'rgba(252,211,77,0.5)' }}>chevron_right</span>
                  </div>

                  {showBossDetail && (
                    <div className="fixed inset-0 z-[200] flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                      <img src={base + 'art/bg-emerald-mist.png'} alt="" className="fixed inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: -1 }} />
                      <button onClick={() => setShowBossDetail(false)}
                        aria-label="Schließen"
                        className="fixed right-3 z-[300] w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                        style={{
                          top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
                          background: 'rgba(0,0,0,0.35)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.25)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                        }}>
                        <span className="material-symbols-outlined text-white text-2xl">close</span>
                      </button>

                      <div className="relative flex items-center justify-center pt-12 pb-6 px-6"
                           style={{ background: 'linear-gradient(135deg, #1a0030 0%, #2d0060 50%, #400000 100%)' }}>
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
                               style={{ borderColor: '#fcd34d', boxShadow: '0 0 20px rgba(252,211,77,0.4)' }}>
                            <img src={base + 'art/egg-glow.webp'} alt={heroName} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-headline font-bold text-white text-sm mt-2">{t('hub.boss.detail.hero')}</p>
                        </div>

                        <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 mx-2"
                             style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', boxShadow: '0 0 30px rgba(252,211,77,0.5)' }}>
                          <span className="font-headline font-black text-xl" style={{ color: '#725b00' }}>VS</span>
                        </div>

                        <div className="flex flex-col items-center flex-1">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
                               style={{ borderColor: '#ba1a1a', boxShadow: '0 0 20px rgba(186,26,26,0.4)' }}>
                            {artSrc ? (
                              <img src={artSrc} alt={t('boss.' + bd.id)} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: '#ba1a1a33' }}>{bd.icon}</div>
                            )}
                          </div>
                          <p className="font-headline font-bold text-white text-sm mt-2">{t('boss.' + bd.id)}</p>
                        </div>
                      </div>

                      <div className="flex-1 rounded-t-[2rem] -mt-4 relative z-10 px-6 pt-8 pb-36"
                           style={{ background: '#fff8f2' }}>

                        {(() => {
                          const eq = state.equippedGear || {};
                          let totalCourage = 0, totalDefense = 0;
                          for (const slotId of Object.values(eq)) {
                            const g = GEAR_ITEMS.find(gi => gi.id === slotId);
                            if (g) { totalCourage += g.stats.courage || 0; totalDefense += g.stats.defense || 0; }
                          }
                          const courageBonus = Math.floor(totalCourage / 5);
                          const defenseBonus = Math.floor(totalDefense / 5);
                          if (courageBonus <= 0 && defenseBonus <= 0) return null;
                          return (
                            <div className="flex gap-3 mb-5">
                              {courageBonus > 0 && (
                                <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                                     style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)' }}>
                                  <span className="material-symbols-outlined text-base" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                  <span className="font-label font-bold text-xs" style={{ color: '#b45309' }}>{t('hub.boss.detail.gearDmg', { bonus: courageBonus })}</span>
                                  <span className="font-label text-xs text-on-surface-variant">{t('hub.boss.detail.gearCourage')}</span>
                                </div>
                              )}
                              {defenseBonus > 0 && (
                                <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                                     style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                  <span className="material-symbols-outlined text-base" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>shield</span>
                                  <span className="font-label font-bold text-xs" style={{ color: '#059669' }}>{t('hub.boss.detail.gearLoot', { bonus: defenseBonus })}</span>
                                  <span className="font-label text-xs text-on-surface-variant">{t('hub.boss.detail.gearDefense')}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {(() => {
                          const tier = BOSS_TIERS.find(bt => bt.id === bd.tier);
                          return tier ? (
                            <div className="flex items-center gap-2 mb-5">
                              <span className="text-sm">{tier.icon}</span>
                              <span className="font-label font-bold text-xs uppercase tracking-widest" style={{ color: tier.color }}>
                                {t('hub.boss.detail.tierClass', { name: t('boss.tier.' + tier.id) })}
                              </span>
                            </div>
                          ) : null;
                        })()}

                        {!defeated ? (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-label font-bold text-xs text-error uppercase tracking-widest">{t('hub.boss.detail.hp')}</span>
                              <span className="font-label font-bold text-sm text-error">{state.boss.hp} / {state.boss.maxHp}</span>
                            </div>
                            <div className="w-full h-5 rounded-full overflow-hidden relative"
                                 style={{ background: '#ffdad6', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                              <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                                   style={{ width: `${hpPct}%`, background: 'linear-gradient(90deg, #ba1a1a, #ff6b6b)' }}>
                                <div className="absolute inset-0 opacity-30"
                                     style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 12px)', animation: 'slide 1s linear infinite' }} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-6 text-center py-4 rounded-2xl" style={{ background: 'rgba(52,211,153,0.1)', border: '2px solid #34d399' }}>
                            <span className="material-symbols-outlined text-4xl mb-1 block" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                            <p className="font-headline font-bold text-xl" style={{ color: '#059669' }}>{t('hub.boss.detail.bossDefeated')}</p>
                          </div>
                        )}

                        {(state.bossDmgToday || 0) > 0 && (() => {
                          const doneQuests = (state.quests || []).filter(q => q.done && !q.sideQuest);
                          const dmgLog = doneQuests.map(q => ({
                            name: t('quest.' + q.id),
                            icon: q.icon || '',
                            dmg: Math.max(5, Math.floor((q.xp || 0) * 0.8)),
                          }));
                          return (
                            <div className="mb-6 rounded-2xl overflow-hidden"
                                 style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                              <div className="flex items-center gap-3 p-4 pb-2">
                                <span className="material-symbols-outlined text-xl shrink-0" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>swords</span>
                                <div className="flex-1">
                                  <p className="font-label font-bold text-sm" style={{ color: '#059669' }}>
                                    {t('hub.boss.detail.power', { dmg: state.bossDmgToday })}
                                  </p>
                                </div>
                              </div>
                              {dmgLog.length > 0 && (
                                <div className="px-4 pb-4 pt-1">
                                  <div className="flex flex-col gap-1.5">
                                    {dmgLog.map((entry, i) => (
                                      <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl"
                                           style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <span className="text-base">{entry.icon}</span>
                                        <span className="font-body text-xs text-on-surface flex-1 truncate">{entry.name}</span>
                                        <span className="font-label font-bold text-xs whitespace-nowrap" style={{ color: '#059669' }}>
                                          -{entry.dmg} HP
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="mb-6 rounded-2xl overflow-hidden"
                             style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                          {artSrc && (
                            <img src={artSrc} alt={t('boss.' + bd.id)} className="w-full h-40 object-cover" />
                          )}
                          <div className="p-5">
                            <p className="font-label font-bold text-xs text-error uppercase tracking-widest">
                              {defeated ? t('hub.boss.detail.defeated') : t('hub.boss.detail.dailyBoss')}
                            </p>
                            <h3 className="font-headline font-bold text-2xl text-on-surface mt-1">{t('boss.' + bd.id)}</h3>
                            <p className="font-body text-on-surface-variant mt-2 leading-relaxed">{t('boss.' + bd.id + '.desc')}</p>
                          </div>
                        </div>

                        {defeated && (
                          <div className="mb-6">
                            <h4 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-3">{t('hub.boss.detail.loot')}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 rounded-2xl text-center"
                                   style={{ background: 'rgba(18,67,70,0.05)', border: '1px solid rgba(18,67,70,0.1)' }}>
                                <span className="material-symbols-outlined text-2xl text-primary mb-1 block"
                                      style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
                                <p className="font-label font-bold text-lg text-primary">+{bd.reward.hp}</p>
                                <p className="font-label text-xs text-on-surface-variant uppercase">{t('hub.boss.detail.heroPoints')}</p>
                              </div>
                              <div className="p-4 rounded-2xl text-center"
                                   style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
                                <span className="material-symbols-outlined text-2xl mb-1 block"
                                      style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                <p className="font-label font-bold text-lg" style={{ color: '#059669' }}>{t('hub.boss.detail.evoEssence')}</p>
                                <p className="font-label text-xs text-on-surface-variant uppercase">Ronki</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {(state.bossTrophies || []).length > 0 && (
                          <div className="mb-6 mm-card p-5">
                            <h4 className="font-label font-bold text-xs uppercase tracking-widest text-outline mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                              {t('hub.boss.detail.trophies')}
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                              {BOSSES.map(boss => {
                                const isDefeated = (state.bossTrophies || []).includes(boss.id);
                                const tier = BOSS_TIERS.find(bt => bt.id === boss.tier);
                                return (
                                  <div key={boss.id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                                       style={{
                                         background: isDefeated ? 'rgba(252,211,77,0.08)' : 'rgba(232,225,218,0.3)',
                                         border: isDefeated ? '1.5px solid rgba(252,211,77,0.3)' : '1.5px dashed rgba(204,195,215,0.3)',
                                         opacity: isDefeated ? 1 : 0.4,
                                       }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                         style={{
                                           background: isDefeated ? 'rgba(252,211,77,0.15)' : 'rgba(232,225,218,0.5)',
                                           boxShadow: isDefeated ? '0 0 12px rgba(252,211,77,0.2)' : 'none',
                                         }}>
                                      {isDefeated ? boss.icon : (
                                        <span className="material-symbols-outlined text-base" style={{ color: '#c0c8c9' }}>lock</span>
                                      )}
                                    </div>
                                    <span className="font-label font-bold text-xs text-center leading-tight text-on-surface"
                                          style={{ opacity: isDefeated ? 1 : 0.5 }}>
                                      {isDefeated ? t('boss.' + boss.id) : '???'}
                                    </span>
                                    {tier && isDefeated && (
                                      <span className="text-xs font-label font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: `${tier.color}15`, color: tier.color }}>
                                        {tier.icon}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <p className="font-label text-xs text-on-surface-variant text-center mt-3">
                              {t('hub.boss.detail.bossCount', { done: (state.bossTrophies || []).length, total: BOSSES.length })}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="fixed bottom-0 left-0 w-full z-50 p-6"
                           style={{ background: 'linear-gradient(to top, #fff8f2 70%, transparent)' }}>
                        <button onClick={() => {
                            setShowBossDetail(false);
                            if (defeated) actions.fireCelebration?.();
                          }}
                          className="w-full max-w-lg mx-auto block py-4 rounded-full font-label font-extrabold text-lg active:scale-95 transition-all"
                          style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 8px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
                          {defeated ? t('hub.boss.detail.celebrate') : t('hub.boss.detail.keepFighting')}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* ── Latest Achievement Spotlight (dev only) ── */}
            {isDevMode() && (() => {
              const unlocked = state.unlockedBadges || [];
              if (unlocked.length === 0) return null;
              const latestId = unlocked[unlocked.length - 1];
              const badge = BADGES.find(b => b.id === latestId);
              if (!badge) return null;
              return (
                <button className="w-full p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden text-left active:scale-[0.98] transition-all"
                     style={{ border: '1.5px solid rgba(252,211,77,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                     onClick={() => onNavigate?.('kodex')}>
                  <img src={base + 'art/bg-achievement.webp'} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none" />
                  <div className="absolute inset-0 bg-white/70 pointer-events-none" />
                  <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: 'rgba(252,211,77,0.2)', border: '2px solid rgba(252,211,77,0.4)' }}>
                    <span className="text-3xl">{badge.i}</span>
                  </div>
                  <div className="relative z-10 flex-1 min-w-0">
                    <p className="font-bold text-xs font-label uppercase tracking-widest" style={{ color: '#92400e' }}>{t('hub.achievement.latest')}</p>
                    <h4 className="font-headline font-bold text-lg truncate" style={{ color: '#1a1a1a' }}>{t('badge.' + badge.id)}</h4>
                    <p className="font-body text-sm truncate" style={{ color: '#5c4813' }}>{t('badge.' + badge.id + '.desc')}</p>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-xl" style={{ color: '#92400e' }}>chevron_right</span>
                    <span className="font-label font-bold text-xs" style={{ color: '#78350f' }}>{unlocked.length}/{BADGES.length}</span>
                  </div>
                </button>
              );
            })()}

        {/* ── Leitstern widget (dev only) — standalone, no grid wrapper.
               Weather widget removed, weather now lives in the greeting chip. ── */}
        {isDevMode() && (
          <button
            className="px-4 py-3 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.97] relative overflow-hidden"
            style={{
              background: '#140e02',
              border: '1.5px solid rgba(252,211,77,0.3)',
              boxShadow: '0 4px 16px rgba(15,11,4,0.45)',
              minHeight: 110,
            }}
            onClick={() => onNavigate?.('kodex')}
          >
            <div aria-hidden="true" style={{
              position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)',
              width: '130%', height: '85%',
              background: 'radial-gradient(ellipse at 50% 90%, rgba(180,83,9,0.55) 0%, rgba(120,40,5,0.22) 50%, transparent 72%)',
              pointerEvents: 'none',
            }} />
            <div aria-hidden="true" style={{ position: 'absolute', top: '18%', right: '12%', width: 2, height: 2, borderRadius: '50%', background: '#fde68a', boxShadow: '0 0 4px 2px rgba(252,211,77,0.8)', animation: 'dream-spark 1.8s ease-in-out infinite' }} />
            <div aria-hidden="true" style={{ position: 'absolute', top: '55%', right: '8%', width: 1.5, height: 1.5, borderRadius: '50%', background: 'white', boxShadow: '0 0 3px 1px rgba(255,255,255,0.7)', animation: 'dream-spark 2.4s ease-in-out infinite 0.7s' }} />
            <div aria-hidden="true" style={{ position: 'absolute', top: '28%', right: '28%', width: 1.5, height: 1.5, borderRadius: '50%', background: '#fde68a', boxShadow: '0 0 3px 1px rgba(252,211,77,0.6)', animation: 'dream-spark 2.1s ease-in-out infinite 1.2s' }} />
            <p className="relative z-10 leading-none select-none flex-shrink-0"
               style={{ fontSize: 44, filter: 'drop-shadow(0 0 10px rgba(252,211,77,0.6))' }}>⭐</p>
            <div className="relative z-10 min-w-0">
              <p className="font-headline font-extrabold leading-none text-white" style={{ fontSize: 28 }}>
                {t('hub.leitstern.title')}
              </p>
              <p className="font-label text-xs mt-1 leading-tight truncate"
                 style={{ color: 'rgba(252,211,77,0.65)' }}>Helden-Kodex</p>
            </div>
          </button>
        )}

      </main>

      {/* ── Modals (unchanged) ── */}
      {/* BeatCompletionModal only mounts when a beat is actually set. Avoids
          the useArc render loop it inherits just by existing (see
          backlog_arc_offer_rework.md — same root cause). */}
      {openBeat && <BeatCompletionModal beat={openBeat} onClose={() => setOpenBeat(null)} />}

      {showEveningRitual && (
        <EveningRitual
          stage={getCatStage(state?.catEvo || 0)}
          onClose={() => setShowEveningRitual(false)}
        />
      )}

      {showGefuehlsecke && (
        <Gefuehlsecke onClose={() => setShowGefuehlsecke(false)} />
      )}

      {zeigBlock && (
        <ZeigMomentCard block={zeigBlock} onClose={() => setZeigBlock(null)} />
      )}

      {showClothing && <ClothingSheet onClose={() => setShowClothing(false)} />}
    </div>
  );
}
