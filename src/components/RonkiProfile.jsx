import React, { useState, useMemo } from 'react';
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
  const dev = isDevMode();

  // Care action wrapper — plays pop, triggers haptic, runs the action.
  // Pulled up from Sanctuary so Louis can Füttern/Streicheln/Spielen
  // without a separate Pflege tab (nav merged April 2026).
  const handleCare = (action, alreadyDone) => {
    if (alreadyDone) return;
    SFX.play('pop');
    if (navigator.vibrate) navigator.vibrate(100);
    action();
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

        {/* ═══ LIVING SCENE — gold-hour stage (Polish v2 .rp-scene) ═══
             Full-width 320px rounded card with radial sun, two silhouette
             hills, ground band, 3 rising embers, Ronki portrait with breath
             + aura, and a gold rarity banner pinned inside at the bottom.
             All pure CSS — no new art assets. */}
        <section className="relative mx-4 overflow-hidden"
                 style={{
                   height: 320,
                   borderRadius: 24,
                   boxShadow: '0 14px 30px -14px rgba(18,67,70,0.35)',
                   background: 'radial-gradient(ellipse at 50% 0%, #fff3c8 0%, #fcd34d 28%, #f59e0b 58%, #9a3f1b 100%)',
                 }}>
          {/* Sun / golden orb glow (top-right-ish, behind portrait) */}
          <div aria-hidden="true"
               style={{
                 position: 'absolute', top: 30, right: 40,
                 width: 60, height: 60, borderRadius: '50%',
                 background: 'radial-gradient(circle at 35% 30%, #fff3c8, #f59e0b 60%, #c2410c)',
                 boxShadow: '0 0 60px rgba(245,158,11,0.6)',
                 zIndex: 1,
               }} />

          {/* Back hill — darker, further away */}
          <div aria-hidden="true"
               style={{
                 position: 'absolute', left: '-10%', right: '-10%', bottom: '26%',
                 height: 80, opacity: 0.85,
                 borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                 background: '#6d3a45',
                 zIndex: 2,
               }} />
          {/* Front hill — closer, darker */}
          <div aria-hidden="true"
               style={{
                 position: 'absolute', left: '-5%', right: '-5%', bottom: '20%',
                 height: 100,
                 borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                 background: '#4a2536',
                 zIndex: 3,
               }} />

          {/* Ground band (tod-golden) */}
          <div aria-hidden="true"
               style={{
                 position: 'absolute', left: 0, right: 0, bottom: 0,
                 height: '22%',
                 background: 'linear-gradient(180deg, #4a3a2f, #2a1f18)',
                 boxShadow: 'inset 0 6px 16px rgba(0,0,0,0.25)',
                 zIndex: 2,
               }} />

          {/* 3 ember particles — rising, staggered timing */}
          {[
            { left: '28%', delay: '0s',    duration: '4s'   },
            { left: '52%', delay: '1.3s',  duration: '4.4s' },
            { left: '72%', delay: '2.6s',  duration: '3.8s' },
          ].map((e, i) => (
            <div key={i} aria-hidden="true"
                 style={{
                   position: 'absolute', left: e.left, bottom: '18%',
                   width: 4, height: 4, borderRadius: '50%',
                   background: 'radial-gradient(circle, #fcd34d, #f59e0b)',
                   boxShadow: '0 0 6px #fcd34d',
                   animation: `rp-ember-rise ${e.duration} ease-in infinite`,
                   animationDelay: e.delay,
                   zIndex: 4,
                 }} />
          ))}

          {/* Ronki portrait — composited at bottom: 14%, circular with
               breathing scale. Blurred gold aura pulses behind. */}
          <div style={{
                 position: 'absolute', left: '50%', bottom: '14%',
                 transform: 'translateX(-50%)',
                 width: 140, height: 140,
                 zIndex: 5,
                 animation: 'rp-breathe 3s ease-in-out infinite',
               }}>
            <div aria-hidden="true"
                 style={{
                   position: 'absolute', inset: '-14%',
                   borderRadius: '50%',
                   background: 'radial-gradient(circle, rgba(252,211,77,0.55) 0%, transparent 65%)',
                   filter: 'blur(12px)',
                   animation: 'rp-aura-pulse 3s ease-in-out infinite',
                 }} />
            <div style={{
                   position: 'relative',
                   width: '100%', height: '100%',
                   borderRadius: '50%',
                   overflow: 'hidden',
                   border: '3px solid rgba(255,248,242,0.85)',
                   boxShadow: '0 10px 22px -8px rgba(60,20,5,0.55)',
                 }}>
              <img src={`${base}art/companion/${artFile}.webp`} alt="Ronki"
                   className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Rarity banner — gold-gradient pill pinned inside the scene */}
          <div style={{
                 position: 'absolute', left: '50%', bottom: '4%',
                 transform: 'translateX(-50%)',
                 display: 'inline-flex', alignItems: 'center', gap: 6,
                 padding: '7px 16px', borderRadius: 999,
                 background: 'linear-gradient(160deg, #fcd34d, #f59e0b)',
                 color: '#fff',
                 fontFamily: 'Plus Jakarta Sans, sans-serif',
                 fontWeight: 800, fontSize: 11, lineHeight: 1,
                 letterSpacing: '0.16em',
                 textTransform: 'uppercase',
                 boxShadow: '0 6px 14px -4px rgba(245,158,11,0.55)',
                 zIndex: 6,
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
            {lang === 'de' ? 'Mystischer Begleiter' : 'Mystical Companion'}
          </p>
        </div>

        <div className="px-4">

          {/* ═══ PFLEGE — kickered cream→amber card wrapping 3 care actions.
               Absorbed from Sanctuary when the Pflege tab merged into Ronki's
               page (April 2026). State lives on the same TaskContext fields
               (catFed / catPetted / catPlayed) so the existing reducers work
               unchanged. One tap per action per day; done state shows a check. */}
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
    </div>
  );
}
