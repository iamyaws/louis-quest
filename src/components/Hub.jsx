import React, { useEffect, useState } from 'react';
import { WEEKLY_MISSIONS, MOOD_EMOJIS, BOSSES, BOSS_TIERS, GEAR_ITEMS, CAT_STAGES, COMPANION_STAGES } from '../constants';
import { useTask } from '../context/TaskContext';
import { getLevel, getLvlProg, getCatStage } from '../utils/helpers';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import SFX from '../utils/sfx';
import Egg from './Egg';
import { Pearl } from './CurrencyIcons';
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
import EveningRitual from './EveningRitual';
import Gefuehlsecke from './Gefuehlsecke';
import ForscherEcke from './ForscherEcke';
import AttentionGlow from './AttentionGlow';
import { isForscherGraduated } from '../data/mintGames';
import { useAttentionFlag } from '../hooks/useAttentionFlag';
import ZeigMomentCard from './ZeigMomentCard';
import { isDevMode } from '../utils/mode';
import { getVariant } from '../data/companionVariants';

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

const BOSS_ART = {
  schnarchling: { full: 'art/boss-schnarchling_the-snorer-fullpower.webp', defeated: 'art/boss-schnarchling_the-snorer-defeated.webp' },
  wusselwicht:  { full: 'art/boss-wusselwicht-the-chaos-imp-fullpower.webp', defeated: 'art/boss-wusselwicht-the-chaos-imp-defeated.webp' },
  flimmerfux:   { full: 'art/boss-flimmerfux_the-flicker-fox-fullpower.webp', defeated: 'art/boss-flimmerfux_the-flicker-fox-defeated.webp' },
};

// ══════════════════════════════════════════════════════════════════════════
// HUB — Variant D layout (Marc's mix)
//   · Scroll-over painted scene (full-bleed) behind content
//   · Slim hero pill, no HP pill on this view
//   · Greeting chip with weather (taps to open ClothingSheet)
//   · Mood chip above HEUTE (collapsed, taps to expand picker inline)
//   · HEUTE card + 3-block anchor rail (morning / evening / bedtime)
//   · Als Nächstes CTA — navigates to Aufgaben
//   · Wasser pill — baseline care, adjacent to Als Nächstes
//   · Forscher-Ecke (sequential, hides after graduation)
//   · Extra-Aufgaben compact button (truly optional, bottom of main stack)
//   · Mood chip (top) + Wasser (primary) bookend daily care
//   · [dev: Boss / Achievement / Leitstern]
//   · Memory Wall moved to RonkiProfile (single source of truth for "our story")
//   · No Mehr-entdecken wrapper — flat tail, AttentionGlow NEU badge stays visible
//   · LoginBonus removed (retention-bait; see project_ronki_positioning.md)
//   · Arc system paused — see backlog_arc_offer_rework.md
// ══════════════════════════════════════════════════════════════════════════
export default function Hub({ onNavigate, onPlayMint }) {
  const { state, computed, actions } = useTask();
  const { done, total, allDone, pct } = computed;
  const { t, lang } = useTranslation();
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
  const [showEveningRitual, setShowEveningRitual] = useState(false);
  const [showGefuehlsecke, setShowGefuehlsecke] = useState(false);
  const [zeigBlock, setZeigBlock] = useState(null);

  const [forscherSeen, markForscherSeen] = useAttentionFlag('forscher-ecke-first-seen');

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

  // Zeig-Moment: once per block per day when that block's main quests are all done
  useEffect(() => {
    if (!state) return;
    if (zeigBlock) return;
    const enabled = state?.familyConfig?.zeigMomentEnabled !== false;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  // ── Time-of-day sky (page-level ambient, behind everything) ──
  const SKY_IMAGES = {
    dawn:   'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_an_early_morning_sky._S_882cfbe3-5eac-4403-87a0-5c66602cf76b_2.webp',
    midday: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_bright_midday_sky._Wa_e8eca682-4eb9-4da2-8c93-a4cb25ba363d_1.webp',
    golden: 'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_golden_hour_sky._Rich_a1deb403-56d2-4c34-9775-f174de32afb4_1.webp',
    night:  'art/background/IAMYAWS_Panoramic_mobile_wallpaper_of_a_deep_night_sky._Rich__c902cc19-afa0-4c99-a434-6e206610ddf9_0.webp',
  };
  const _h = new Date().getHours();
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
  const sceneSrc = `art/campfire/lager-stage${catStage + 1}.png`;
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

  // ── Next main quest for "Als Nächstes" ──
  const nextQuest = (state.quests || []).find(q => !q.done && !q.sideQuest);

  // ── Side quests for Bonus button ──
  const sideQuests = (state.quests || []).filter(q => q.sideQuest);
  const sideDone = sideQuests.filter(q => q.done).length;
  const sidePreview = sideQuests.filter(q => !q.done).map(q => t('quest.' + q.id)).join(' · ');

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
         B · SCROLL-OVER PAINTED SCENE
         Full-bleed at top, fades into cream paper. Content (z-10) layers
         on top. As the page scrolls, the scene scrolls with it.
         ═════════════════════════════════════════════════════════════════ */}
      <div className="absolute left-0 right-0 top-0 overflow-hidden pointer-events-none"
           style={{ height: 440, zIndex: 1 }}
           aria-hidden="true">
        <img
          src={base + sceneSrc}
          alt=""
          className="w-full h-full object-cover select-none companion-breathe"
          style={{ objectPosition: 'center 42%' }}
          draggable={false}
          onError={(e) => {
            if (!e.target.src.endsWith('lager-stage1.png')) {
              e.target.src = base + 'art/campfire/lager-stage1.png';
            }
          }}
        />
        {/* Fade into cream paper so cards below land on a clean surface */}
        <div className="absolute inset-x-0 bottom-0 h-32"
             style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,248,242,0.55) 55%, #fff8f2 100%)' }} />
        {/* Floating embers above the fire area */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="ember" style={{ bottom: '32%', left: '52%', '--delay': '0s',   '--dur': '4.8s', '--drift': '14px' }} />
          <span className="ember" style={{ bottom: '34%', left: '58%', '--delay': '1.2s', '--dur': '5.4s', '--drift': '-10px' }} />
          <span className="ember" style={{ bottom: '28%', left: '64%', '--delay': '2.0s', '--dur': '4.2s', '--drift': '6px' }} />
          <span className="ember" style={{ bottom: '36%', left: '48%', '--delay': '0.6s', '--dur': '5.0s', '--drift': '-14px' }} />
        </div>
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
              {t('hub.streakDay', { n: state.streak || 1 })}
            </span>
          </div>
        </button>

        {/* HP pill — Polish .hp spec. Tall "N / HELDENPUNKTE" shape,
             cream→amber vertical gradient, 22px pearl, primary-teal
             number + gold-ink label below. Proud score, not chip. */}
        <div className="flex items-center rounded-full shrink-0"
             style={{
               background: 'linear-gradient(180deg, #fff8e1 0%, #fde68a 100%)',
               border: '1px solid rgba(180,83,9,0.25)',
               padding: '7px 14px 7px 9px',
               gap: 8,
               boxShadow: '0 4px 12px -4px rgba(252,211,77,0.6), inset 0 1px 0 rgba(255,255,255,0.7)',
             }}>
          <Pearl size={22} />
          <div className="flex flex-col leading-none">
            <b className="font-label font-extrabold"
               style={{ color: '#124346', fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {state.hp || 0}
            </b>
            <span className="font-label font-semibold uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.16em', color: '#725b00', marginTop: 3, lineHeight: 1 }}>
              {lang === 'de' ? 'Heldenpunkte' : 'Hero points'}
            </span>
          </div>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════
         D · MAIN CONTENT — layers over scene (z-10), pt gives breathing
         room so the painted scene reads before content covers it.
         ═════════════════════════════════════════════════════════════════ */}
      <main className="relative px-6 max-w-lg mx-auto flex flex-col gap-4"
            style={{ zIndex: 10, paddingTop: 184 }}>

        {/* Greeting chip (+ weather) · Voice bubble · Companion nameplate */}
        <section className="flex flex-col items-center gap-2">
          {(() => {
            const hour = new Date().getHours();
            const greetKey = hour < 11 ? 'hub.greeting.morning'
              : hour < 17 ? 'hub.greeting.afternoon'
              : 'hub.greeting.evening';
            const hasWeather = !!weather?.current;
            const wi = hasWeather ? getWeatherInfo(weather.current.weatherCode) : null;
            return (
              <button
                onClick={() => hasWeather && setShowClothing(true)}
                disabled={!hasWeather}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full active:scale-95 transition-all"
                style={{
                  background: 'rgba(255,248,242,0.92)',
                  border: '1px solid rgba(18,67,70,0.14)',
                  boxShadow: '0 4px 12px -2px rgba(18,67,70,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
                  cursor: hasWeather ? 'pointer' : 'default',
                }}
                aria-label={hasWeather ? t('task.weather.outfitHint') : undefined}
              >
                <span className="font-body text-sm italic text-primary-container">
                  {t(greetKey)}, {heroName}
                </span>
                {hasWeather && (
                  <>
                    <span className="text-on-surface-variant">·</span>
                    <span aria-hidden="true" className="text-base leading-none">{wi.emoji}</span>
                    <span className="font-headline font-bold text-sm text-primary-container">
                      {weather.current.temp}°
                    </span>
                  </>
                )}
              </button>
            );
          })()}
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

        {/* ── Mood chip — collapsed by default, taps to expand picker inline.
               Presence without demand: if the kid skips, mood just doesn't get
               logged today. Sad/worried/tired → Gefühlsecke follow-up. ── */}
        {state.moodAM === null ? (
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
        ) : (
          <div className="w-full px-4 py-3 rounded-2xl flex items-center gap-3"
               style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.22)' }}>
            <span className="text-2xl" aria-hidden="true">{MOOD_EMOJIS[state.moodAM]}</span>
            <div className="flex-1 min-w-0">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                {t('hub.mood.label')}
              </p>
              <p className="font-headline font-bold text-sm text-primary truncate">
                {MOOD_LABELS_I18N[state.moodAM]}
              </p>
            </div>
          </div>
        )}

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
        </button>

        {/* ── Als Nächstes (B style) — navigates to Aufgaben ── */}
        {!allDone && nextQuest && (
          <button onClick={() => onNavigate?.('quests')}
                  className="w-full p-4 rounded-2xl flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                  style={{ background: '#fff', border: '1.5px solid #124346', boxShadow: '0 4px 14px -4px rgba(18,67,70,0.22)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(18,67,70,0.08)', fontSize: 22 }}>
              {nextQuest.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label font-bold text-[10px] uppercase tracking-[0.22em] text-primary mb-0.5">
                {t('hub.nextUp.label')}
              </p>
              <p className="font-body font-semibold text-[15px] leading-tight text-on-surface">
                {t('quest.' + nextQuest.id)}
              </p>
            </div>
            <span className="px-3 py-2 rounded-full font-label font-bold text-xs shrink-0"
                  style={{ background: '#124346', color: '#fff' }}>
              +{nextQuest.xp} HP
            </span>
          </button>
        )}

        {/* ── Wasser pill — baseline care, sits adjacent to Als Nächstes.
               Wasser is a daily-required tracker (not optional), so it lives
               in the primary cluster instead of after the "optional things
               to do". Mood chip (top) + Wasser bookend the day's care. ── */}
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

        {/* ── Forscher-Ecke — sequential progression.
               Optional activity. Hidden when Louis has graduated.
               See data/mintGames.ts for the sequence model. ── */}
        {!isForscherGraduated(state) && (
          <AttentionGlow
            active={!forscherSeen}
            seenKey="forscher-ecke-first-seen"
            accent="#059669"
            intensity="medium"
            badgeLabel="NEU"
            voiceLineId="de_forscher_new_01"
          >
            <ForscherEcke
              onPlayGame={(gameId) => {
                markForscherSeen();
                onPlayMint?.(gameId);
              }}
            />
          </AttentionGlow>
        )}

        {/* ── Extra-Aufgaben — truly optional, sits at the bottom of the
               main stack so Louis scrolls past his routine + baseline care
               before the "extra" appears. ── */}
        {sideQuests.length > 0 && (
          <button onClick={() => onNavigate?.('quests')}
                  className="w-full p-4 rounded-2xl flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                  style={{ background: '#fff', border: '1px solid rgba(18,67,70,0.08)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-headline font-bold text-base"
                 style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)', color: '#725b00' }}>
              {sideDone}/{sideQuests.length}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label font-bold text-[10px] uppercase tracking-[0.22em] mb-0.5" style={{ color: '#b45309' }}>
                {t('task.bonus')}
              </p>
              <p className="font-headline font-semibold text-[15px] leading-tight text-on-surface">
                {t('hub.bonus.headline')}
              </p>
              <p className="font-body text-[12px] leading-snug mt-0.5 text-on-surface-variant truncate">
                {sidePreview || t('hub.bonus.allDone')}
              </p>
            </div>
            <span className="material-symbols-outlined shrink-0" style={{ color: '#6b655b', fontSize: 20 }}>chevron_right</span>
          </button>
        )}

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
