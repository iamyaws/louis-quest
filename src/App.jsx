import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AuthProvider, useAuth, LoginScreen } from './context/AuthContext';
import { TaskProvider, useTask } from './context/TaskContext';
import { CelebrationQueueProvider, useCelebrationQueue } from './context/CelebrationQueue';
import { useTranslation } from './i18n/LanguageContext';
import PinModal from './components/PinModal';
import NavBar from './components/NavBar';
import TabUnlockCelebration from './components/TabUnlockCelebration';
import SpendEffect from './components/SpendEffect';
import { QuestEaterProvider } from './components/QuestEater';
import TaskList from './components/TaskList';
import Belohnungsbank from './components/Belohnungsbank';
// Cuts #4–#5 (25 Apr 2026 northstar): Hub.jsx + Sanctuary +
// HeldenKodex deleted. RoomHub is the only primary surface.
import RoomHub from './components/drachennest/RoomHub';
import Journal from './components/Journal';
import Onboarding from './components/Onboarding';
import TeachFirePreview from './components/TeachFirePreview';
import TeachRitualPreview from './components/TeachRitualPreview';
import ParentOnboarding from './components/ParentOnboarding';
import KidIntro from './components/KidIntro';
import HandoffBackCard from './components/HandoffBackCard';
import PWAInstallSheet from './components/PWAInstallSheet';
import { usePWAInstall } from './hooks/usePWAInstall';
import { usePWAPromptGate } from './hooks/usePWAPromptGate';
import ParentalDashboard from './components/ParentalDashboard';
import Celebration from './components/Celebration';
// Arc offer system paused — see backlog_arc_offer_rework.md
// import ArcOfferCard from './components/ArcOfferCard';
import FreundCallbackCard from './components/FreundCallbackCard';
import MiniGames from './components/MiniGames';
import MemoryGame from './components/MemoryGame';
import PotionGame from './components/PotionGame';
import StarCatcherGame from './components/StarCatcherGame';
import ToolErrorBoundary from './components/ToolErrorBoundary';
// ── Lazy-loaded tools + games ──────────────────────────────────────────
// These surfaces are mounted conditionally (URL param shortcuts, post-
// routine tool launches, MINT-game selection) and account for the
// majority of our JS bundle weight despite most users never opening
// them in a given session. Code-split via React.lazy + dynamic import
// so the initial chunk ships only the core Hub/Aufgaben/Care/Journal
// flow — each tool/game arrives on demand when Louis actually opens it.
//
// KristallSortiererGame + StarfighterGame + CloudJumpGame deleted in
// cut #5 (25 Apr 2026 — wrong-genre minigames don't serve the
// companion thesis).
const ZahlenjagdGame = lazy(() => import('./components/ZahlenjagdGame'));
const MusterMemoryGame = lazy(() => import('./components/MusterMemoryGame'));
const WurzelLabyrinthGame = lazy(() => import('./components/WurzelLabyrinthGame'));
const PilzWaageGame = lazy(() => import('./components/PilzWaageGame'));
const KristallKetteGame = lazy(() => import('./components/KristallKetteGame'));
const KristallHoehleGame = lazy(() => import('./components/KristallHoehleGame'));
const CampfireVisitorsGame = lazy(() => import('./components/CampfireVisitorsGame'));
const DreiDankeTool = lazy(() => import('./components/DreiDankeTool'));
// KraftwortTool deleted in cut #8 (UX audit flagged it as
// sticker-of-the-day with heavy state plumbing — worst friction-to-
// emotional-payoff ratio in the tool library). Replacement to come
// when we have a tactile-companion-beat design ready.
const LoewenPoseTool = lazy(() => import('./components/LoewenPoseTool'));
const SteinUndGummiTool = lazy(() => import('./components/SteinUndGummiTool'));
const RonkiAusmalbild = lazy(() => import('./components/RonkiAusmalbild'));
const RonkiCompendium = lazy(() => import('./components/RonkiCompendium'));
// ── End lazy tools/games ───────────────────────────────────────────────
import CompanionToast from './components/CompanionToast';
import ParentIntroOverlay from './components/ParentIntroOverlay';
// ScreenTimer deleted in cut #6 (25 Apr 2026 — Funkelzeit removal).
import RonkiProfile from './components/RonkiProfile';
import Buch from './components/Buch';
import ChibiGallery from './components/ChibiGallery';
import MemoryWall from './components/MemoryWall';
import DiscoveryLog from './components/DiscoveryLog';
import Micropedia from './components/Micropedia';
// QuestLineView deleted Apr 2026 (cut #10f). NORTHSTAR: "not a skill tree".
import { useSpecialQuests } from './hooks/useSpecialQuests';
// Easter-egg system paused Apr 2026 — Marc: "don't feel it anymore".
// Hook + component files kept so we can re-enable by restoring these imports.
// import { useEggSystem } from './hooks/useEggSystem';
import { useMicropediaDiscovery } from './hooks/useMicropediaDiscovery';
import { useQuietAttention } from './hooks/useQuietAttention';
// import EggOverlay from './components/EggOverlay'; // paused Apr 2026 (see useEggSystem note)
import CreatureDiscoveryToast from './components/CreatureDiscoveryToast';
import FriendIntroCeremony from './components/drachennest/FriendIntroCeremony';
import MeetRonki from './components/drachennest/MeetRonki';
import TonightRitual from './components/drachennest/TonightRitual';
import RonkisTag from './components/drachennest/RonkisTag';
import AlphaBanner from './components/AlphaBanner';
import SWUpdateBanner from './components/SWUpdateBanner';
import { useAnalytics } from './hooks/useAnalytics';

// Tiny Suspense fallback for lazy-loaded tools/games. Intentionally
// minimal — the chunks are small and a full "loading screen" treatment
// would flash on fast networks. Shows a breath-sized pause message so a
// 6yo knows something's arriving rather than assuming the tap broke.
function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-dvh bg-surface">
      <p className="font-label text-sm text-on-surface-variant">Einen Moment…</p>
    </div>
  );
}

// View → tool-id map for analytics. These names match the spec enum
// (box_atmung / drei_danke / kraftwort / loewe / stein_gummi / ausmalbild).
// Views not in this map don't fire tool.open (Hub / Aufgaben / etc.).
const TOOL_VIEW_IDS = {
  'drei-danke': 'drei_danke',
  kraftwort: 'kraftwort',
  loewe: 'loewe',
  'stein-gummi': 'stein_gummi',
  ausmalbild: 'ausmalbild',
};

function AppContent() {
  const { t } = useTranslation();
  const { state, actions, loading, toastTrigger } = useTask();
  const { track } = useAnalytics();
  // Dev URL shortcuts — apply on mount so they propagate to every
  // component (not just the Ronki tab where RonkiProfile reads them).
  //   ?gallery=1            — jump to the standalone ChibiGallery
  //   ?variant=teal|...     — seed companionVariant (affects campfire
  //                            Ronki, profile, any future chibi)
  //   ?stage=0..3           — seed catEvo to the matching stage threshold
  //
  // All of these param shortcuts are QA/dev affordances — gated behind
  // import.meta.env.DEV so production bundles don't accept them. The
  // actual in-app entries to each tool (Gefühlsecke → Box-Atmung etc.)
  // remain untouched; only the ?loewe=1 / ?cave=1 / ?dreiDanke=1 style
  // URL shortcuts are dev-only.
  const initialView = (() => {
    if (!import.meta.env.DEV) return 'hub';
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('gallery') === '1') return 'gallery';
      if (p.get('cave') === '1') return 'hoehle';
      if (p.get('visitors') === '1') return 'visitors';
      if (p.get('dreiDanke') === '1') return 'drei-danke';
      if (p.get('kraftwort') === '1') return 'kraftwort';
      if (p.get('loewe') === '1') return 'loewe';
      if (p.get('steinGummi') === '1') return 'stein-gummi';
      if (p.get('ausmalbild') === '1') return 'ausmalbild';
      // Claude Design hi-fi previews (26 Apr 2026 handoff)
      if (p.get('meet') === '1') return 'meet';
      if (p.get('tonight') === '1') return 'tonight';
      if (p.get('streifen') === '1') return 'streifen';
    }
    return 'hub';
  })();
  const [view, setView] = useState(initialView);
  const urlParamsAppliedRef = useRef(false);
  useEffect(() => {
    // Wait for the persisted state to load before patching — firing at
    // bare App mount would either no-op (actions not wired) or get
    // overwritten when TaskContext loads from storage. Guarded with a
    // ref so the patch fires exactly once.
    if (!state || urlParamsAppliedRef.current) return;
    urlParamsAppliedRef.current = true;
    if (typeof window === 'undefined') return;
    // All state-seed params (?variant, ?stage, ?ronkiMood, ?boxAtmung)
    // exist purely for QA previews across devices. Gating them behind
    // import.meta.env.DEV means production builds ignore the query even
    // if someone bookmarks an old preview URL.
    if (!import.meta.env.DEV) return;
    const p = new URLSearchParams(window.location.search);
    const patch = {};
    const v = p.get('variant');
    if (/^(amber|teal|rose|violet|forest|sunset)$/.test(v || '')) {
      patch.companionVariant = v;
    }
    const s = p.get('stage');
    if (s && /^[0-5]$/.test(s)) {
      // Thresholds match CAT_STAGES in constants.ts — 0 Ei, 1 Baby,
      // 2 Jungtier, 3 Stolz, 4 Heranwachsend, 5 Legendär.
      patch.catEvo = [0, 3, 9, 18, 30, 45][parseInt(s, 10)];
    }
    const mood = p.get('ronkiMood');
    if (['sad', 'tired', 'normal', 'besorgt', 'gut', 'magisch'].includes(mood)) {
      patch.ronkiMood = mood;
      patch.ronkiMoodSetDate = mood === 'normal'
        ? undefined
        : new Date().toISOString().slice(0, 10);
    }
    const boxParam = p.get('boxAtmung');
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
    if (Object.keys(patch).length > 0 && actions?.patchState) {
      actions.patchState(patch);
    }
  }, [state, actions]);
  // activeQuestLineId state removed Apr 2026 (cut #10f, QuestLine deletion).
  const [activeMintGame, setActiveMintGame] = useState(null); // MINT game id when view==='mint-game'
  const [showParental, setShowParental] = useState(false);
  // PIN gate — intercepts every parental-dashboard entry (lock tap, long
  // press). Dashboard only opens after the correct 4-digit PIN.
  const [pinGateOpen, setPinGateOpen] = useState(false);
  const [pin, setPin] = useState('');
  const openPinGate = () => { setPin(''); setPinGateOpen(true); };
  // Cut #6 (25 Apr 2026): screenTimer state removed alongside Funkelzeit.

  // Post-engagement PWA install prompt. Replaces the upfront step-7 prompt
  // the old Onboarding.jsx fired. Opens only after kid+parent onboarding
  // are done AND the first habit is complete (totalTasksDone >= 1), AND
  // the app isn't already installed as standalone. Fires at most twice
  // per user (day-1 + day-2 retry). See src/hooks/usePWAPromptGate.js.
  const { shouldPrompt: shouldPromptPWA, markShown: markPWAShown } = usePWAPromptGate();
  const { isIOS, androidPrompt, promptInstall } = usePWAInstall();

  useSpecialQuests(); // side-effect only — silently completes special quests
  // useEggSystem(); // paused Apr 2026 — spawner disabled, no more egg triggers
  useQuietAttention(view); // gentle voice brake when Louis zooms through screens

  // Creature discovery — Drachennest reframe (Marc 25 Apr 2026):
  // first-time encounters fire the FriendIntroCeremony full-screen
  // takeover; small in-app toasts only fire on celebrations the
  // kid has already seen the ceremony for. Routed through the
  // CelebrationQueue's modal slot so the ceremony serializes with
  // any other celebration in flight (no two takeovers at once).
  const { enqueue: enqueueCelebration } = useCelebrationQueue();
  const [introCreatureId, setIntroCreatureId] = useState(null);
  useMicropediaDiscovery((id) => {
    // useMicropediaDiscovery only fires on creatures NOT in
    // state.micropediaDiscovered, so every fire is a first-ever
    // encounter — perfect entry point for the ceremony. Queued as
    // a modal so it owns the screen until the kid taps through.
    enqueueCelebration({
      id: `discover-${id}`,
      kind: 'modal',
      sfx: 'coin',
      render: ({ dismiss }) => (
        <FriendIntroCeremony
          creatureId={id}
          onClose={() => { setIntroCreatureId(null); dismiss(); }}
        />
      ),
    });
    setIntroCreatureId(id);
  });

  useEffect(() => {
    // Flush any queued feedback from previous offline sessions
    import('./utils/feedback').then(m => m.flushFeedbackQueue()).catch(() => {});
  }, []);

  // Stamp lastLoginDate after hydration settles. Intentionally delayed so
  // usePWAPromptGate's day-2 retry effect observes the pre-stamp value —
  // without the delay, the hook would always see lastLoginDate === today
  // and the retry would never fire.
  //
  // Guarded by a ref so it runs once per mount; the 150ms timeout lets
  // the PWA hook's useEffect schedule (it runs on state load via its own
  // dependencies) before we clobber the old date.
  const lastLoginStampedRef = useRef(false);
  useEffect(() => {
    if (!state || lastLoginStampedRef.current) return;
    if (!actions?.patchState) return;
    const todayIso = new Date().toISOString().slice(0, 10);
    if (state.lastLoginDate === todayIso) {
      lastLoginStampedRef.current = true;
      return;
    }
    const id = setTimeout(() => {
      actions.patchState({ lastLoginDate: todayIso });
      lastLoginStampedRef.current = true;
    }, 150);
    return () => clearTimeout(id);
  }, [state, actions]);

  // app.open — one per session. The analytics module dedups via
  // sessionStorage so hot-reloads / StrictMode double-mounts don't
  // double-count. Fires as soon as AppContent mounts (post-auth,
  // post-onboarding) so we measure actual engaged sessions, not
  // login-screen bounces.
  useEffect(() => {
    track('app.open');
  }, [track]);

  // tool.open / tool.complete — bridged from view transitions. We keep a
  // ref to the currently-open tool + its open timestamp; when view moves
  // off the tool, fire tool.complete with the elapsed duration. This
  // keeps per-tool files untouched (DreiDankeTool / KraftwortTool / etc.
  // remain out of the wiring scope). A tool that transitions to another
  // tool fires complete-then-open correctly.
  const activeToolRef = useRef(null); // { id, startedAt }
  useEffect(() => {
    const prev = activeToolRef.current;
    const nextId = TOOL_VIEW_IDS[view] || null;

    // Leaving a tool — fire tool.complete first.
    if (prev && prev.id !== nextId) {
      const durationSec = Math.max(0, Math.round((Date.now() - prev.startedAt) / 1000));
      track('tool.complete', { tool: prev.id, durationSec });
      activeToolRef.current = null;
    }

    // Entering a tool — fire tool.open + record start time for duration.
    if (nextId && (!prev || prev.id !== nextId)) {
      track('tool.open', { tool: nextId });
      activeToolRef.current = { id: nextId, startedAt: Date.now() };
    }
  }, [view, track]);

  // Scroll to top whenever the active view changes; also record first-time visits
  useEffect(() => {
    // Belt-and-suspenders: works across iOS PWA, Android WebView, desktop
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    actions.recordViewVisit(view); // track first-time feature discovery
  }, [view]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-surface">
        <p className="font-headline text-xl font-bold text-primary">{t('app.loading')}</p>
      </div>
    );
  }

  // ── Parent-first onboarding choreography (23 Apr 2026 rework) ──
  // [DRACHENNEST EXPERIMENT BRANCH] Both onboardings auto-bypassed via
  // ExperimentAutoPrime mounted further up the provider tree (sibling
  // to AppContent so the prime hooks don't disturb AppContent's hook
  // ordering — early attempt put the useEffect inline here and React
  // caught a hook-count mismatch). When experiment graduates to main,
  // restore the gated returns from `git log -- src/App.jsx`.

  // Long-press backdoor removed — the lock button on Buch + Laden gives a
  // focused, intentional parental entry, and a 1.5s anywhere-hold was
  // triggering on scroll holds. If parents need backdoor access on views
  // without a lock (Aufgaben), we'll add the lock there instead.

  return (
    <>
      <div className="min-h-dvh max-w-lg mx-auto"
           style={{
             // Transparent wrapper — no cream bg. Each view hosts its own
             // TopBar internally (Hub pattern: pill floats over the view's
             // own sky/scene backdrop instead of sitting on a cream band).
             // Hub + Care render their own headers; other views pull in the
             // shared TopBar as the first child inside their own relative
             // container so the pills always sit on whatever sky that view
             // paints underneath.
             paddingTop: ['hub', 'care'].includes(view) ? 0 : 'var(--alpha-banner-h, 0px)',
             paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
           }}>
        {view === 'quests' && (
          <TaskList
            onNavigate={setView}
            onOpenParental={() => openPinGate()}
          />
        )}
        {view === 'shop' && <Belohnungsbank onNavigate={setView} onOpenParental={() => openPinGate()} />}
        {view === 'hub' && (
          // Cut #4 (Marc 25 Apr 2026 — northstar lock-in): RoomHub
          // is the only primary surface. The legacy Hub.jsx
          // chore-tracker is no longer reachable; the `?legacyHub=1`
          // dev fallback was removed when the northstar locked the
          // companion direction. Hub.jsx + its mission/boss/gear
          // surfaces get deleted entirely in cut #5.
          <RoomHub
            onNavigate={(target, opts) => {
              // 'aufgaben' from the cave routes to RonkisTag
              // (Streifen, hi-fi Direction A from the 26 Apr 2026
              // brief) — the daily surface as a story-of-the-day
              // strip rather than a checklist. The legacy TaskList
              // still mounts on view==='quests' for questline
              // back-buttons and any direct setView('quests') call,
              // but the cave's primary entry now lands on Streifen.
              // The anchor hint is preserved on the URL hash for a
              // future scroll-to-anchor pass.
              if (target === 'aufgaben') {
                if (opts?.anchor && typeof window !== 'undefined') {
                  history.replaceState(null, '', `#anchor=${opts.anchor}`);
                }
                setView('streifen');
              }
              else if (target === 'belohnungen') setView('shop');
              else if (target === 'buch') setView('buch');
              else if (target === 'spiele') setView('games');
              else setView(target);
            }}
          />
        )}
        {view === 'journal' && <Journal onNavigate={setView} onOpenParental={() => openPinGate()} />}
        {view === 'meet' && (
          <MeetRonki onComplete={() => setView('hub')} />
        )}
        {view === 'tonight' && (
          <TonightRitual onClose={() => setView('hub')} />
        )}
        {view === 'streifen' && (
          <RonkisTag
            onClose={() => setView('hub')}
            onOpenExpedition={() => {
              actions?.startExpedition?.();
              setView('hub');
            }}
            onOpenTonight={() => setView('tonight')}
          />
        )}
        {view === 'ronki' && <RonkiProfile onNavigate={setView} />}
        {view === 'memories' && <MemoryWall />}
        {view === 'buch' && <Buch onNavigate={setView} />}
        {view === 'gallery' && <ChibiGallery onClose={() => setView('hub')} />}
        {view === 'discovery' && <DiscoveryLog onNavigate={setView} />}
        {view === 'micropedia' && <Micropedia onNavigate={setView} />}
        {/* view==='questline' route removed Apr 2026 (cut #10f). */}
        {view === 'games' && (
          <MiniGames
            onPlay={(id) => setView(id)}
            onNavigate={setView}
            onPlayMint={(id) => {
              setActiveMintGame(id);
              setView('mint-game');
            }}
          />
        )}
      </div>
      <NavBar active={view} onNavigate={setView} />
      <TabUnlockCelebration view={view} />
      <SpendEffect />
      {/* ── MINT games — rendered OUTSIDE the max-w-lg wrapper so they
             cover the full viewport (same pattern as MemoryGame/PotionGame
             below). Previously nested inside the wrapper they got clipped
             to the max-w-lg "banner" width. Marc flagged WurzelLabyrinth
             opening "within the banner" — this moves all MINT games to the
             top-level overlay layer. ── */}
      {view === 'mint-game' && activeMintGame === 'zahlenjagd' && (
        <ToolErrorBoundary toolName="ZahlenjagdGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <ZahlenjagdGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'muster-memory' && (
        <ToolErrorBoundary toolName="MusterMemoryGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <MusterMemoryGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'wurzel-labyrinth' && (
        <ToolErrorBoundary toolName="WurzelLabyrinthGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <WurzelLabyrinthGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'pilz-waage' && (
        <ToolErrorBoundary toolName="PilzWaageGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <PilzWaageGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'mint-game' && activeMintGame === 'kristall-sortierer' && (
        <ToolErrorBoundary toolName="KristallKetteGame" onBack={() => { setActiveMintGame(null); setView('hub'); }}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <KristallKetteGame onComplete={(reward) => {
              if (reward?.hp > 0) actions.addHP(reward.hp);
              setActiveMintGame(null);
              setView('hub');
            }} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'hoehle' && (
        <ToolErrorBoundary toolName="KristallHoehleGame" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <KristallHoehleGame onClose={() => setView('hub')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'visitors' && (
        <ToolErrorBoundary toolName="CampfireVisitorsGame" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <CampfireVisitorsGame onClose={() => setView('hub')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'drei-danke' && (
        <ToolErrorBoundary toolName="DreiDankeTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <DreiDankeTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {/* kraftwort view route deleted in cut #8 (KraftwortTool removed). */}
      {view === 'loewe' && (
        <ToolErrorBoundary toolName="LoewenPoseTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <LoewenPoseTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'stein-gummi' && (
        <ToolErrorBoundary toolName="SteinUndGummiTool" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <SteinUndGummiTool onComplete={() => setView('ronki')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {view === 'ausmalbild' && (
        <ToolErrorBoundary toolName="RonkiAusmalbild" onBack={() => setView('hub')}>
          <Suspense fallback={<ToolLoadingFallback />}>
            <RonkiAusmalbild onClose={() => setView('hub')} />
          </Suspense>
        </ToolErrorBoundary>
      )}
      {pinGateOpen && (
        <PinModal
          pin={pin}
          setPin={setPin}
          onSuccess={() => {
            setPinGateOpen(false);
            setPin('');
            setShowParental(true);
          }}
          onClose={() => { setPinGateOpen(false); setPin(''); }}
        />
      )}
      {showParental && <ParentalDashboard onClose={() => setShowParental(false)} currentView={view} preauthorized />}
      {view === 'memory' && <MemoryGame onComplete={() => {
        actions.claimGameReward('memory');
        setView('games');
      }} />}
      {view === 'potion' && <PotionGame onComplete={() => {
        actions.claimGameReward('potion');
        setView('games');
      }} />}
      {/* CloudJumpGame + StarfighterGame JSX deleted (Apr 2026 cut #10b).
          Imports were already gone (cut #5) but the JSX remained, which
          would have ReferenceError'd if anyone routed view==='clouds' or
          'starfighter'. StarCatcherGame still mounts; it's deleted in
          cut #10g (legacy MINT games). */}
      {view === 'starfall' && <StarCatcherGame onComplete={() => {
        actions.claimGameReward('starfall');
        setView('games');
      }} />}
      {/* EggOverlay mount paused Apr 2026. Any lingering state.pendingEgg
          stays in storage but doesn't render. Re-enable by restoring the
          JSX block above with the useEggSystem() hook. */}
      <CompanionToast trigger={toastTrigger} />
      {/* ParentIntroOverlay retired 25 Apr 2026. The ParentOnboarding
          flow now introduces the parent area up-front (and the Eltern-
          Bereich entry icon in the top chrome makes it discoverable),
          so a later "ah, hier gibts noch was für Mama & Papa" resume
          popup is redundant. Component + state flag stay for history. */}
      {/* Variant-migration modal removed — Marc has already talked Louis through
          the change in person, so the in-app "Ronki hat eine neue Form" beat is
          redundant. The component file is kept for reference but no longer mounted. */}
      <Celebration />
      {/* <ArcOfferCard /> — paused, see backlog_arc_offer_rework.md */}
      <FreundCallbackCard />
      {/* ScreenTimer mount deleted in cut #6 (Funkelzeit removal). */}
      {/* CreatureDiscoveryToast is rendered by CelebrationQueue's
           current-surface slot; it mounts only when the queue pops a
           `discover-*` event. See useMicropediaDiscovery wiring above. */}
      {/* Post-engagement PWA install prompt. Fires at the app-shell layer
          (not inside Onboarding) after the first habit completes. Only
          shown outside the Hub tab would feel disruptive, so we let it
          render anywhere — the bottom sheet is already z-[800] and the
          Gate hook's guards (onboardingDone, totalTasksDone >= 1,
          !standalone, !pwaPromptShown) prevent it from firing mid-
          onboarding or on an already-installed instance. */}
      {shouldPromptPWA && (
        <PWAInstallSheet
          isIOS={isIOS}
          androidPrompt={androidPrompt}
          onInstall={async () => {
            await promptInstall();
            markPWAShown();
          }}
          onSkip={() => {
            markPWAShown();
          }}
        />
      )}
    </>
  );
}

function AuthGate() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-surface">
        <div className="text-center">
          <img src={`${import.meta.env.BASE_URL}art/ronki-egg-logo.svg`} alt="Ronki" className="w-20 h-auto mx-auto mb-4 drop-shadow-lg" />
          <p className="font-headline text-xl font-bold text-primary">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  // Public routes — no auth required. ?compendium=1 renders the
  // Ronki-Sammelbuch for website visitors and for showing Louis.
  // ?onboardingPreview=1 renders the onboarding flow for QA across
  // viewports/browsers without needing an auth session.
  //
  // Both remain reachable in production — they're intentional public
  // routes (Sammelbuch is linked from the marketing site; onboarding
  // preview is how we smoke-test cross-device). Everything else that
  // reads URL params is gated behind import.meta.env.DEV further down.
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    if (p.get('compendium') === '1') {
      // RonkiCompendium is lazy — wrap in Suspense so the chunk can load,
      // and ToolErrorBoundary so a chunk-load failure surfaces the warm
      // fallback rather than blanking the public URL.
      return (
        <ToolErrorBoundary
          toolName="RonkiCompendium"
          onBack={() => { window.location.search = ''; }}
        >
          <Suspense fallback={<ToolLoadingFallback />}>
            <RonkiCompendium />
          </Suspense>
        </ToolErrorBoundary>
      );
    }
    if (p.get('onboardingPreview') === '1') {
      const startStep = parseInt(p.get('step') || '0', 10) || 0;
      return <Onboarding startStep={startStep} onComplete={() => {}} />;
    }
    // Dedicated iteration harness for TeachFireStep v2 — replay pill +
    // variant swatches so Marc can loop the fire/smoke sequence without
    // refreshing the browser between runs. Public route like
    // onboardingPreview — no auth required. See TeachFirePreview.jsx.
    if (p.get('teachFirePreview') === '1') {
      return <TeachFirePreview />;
    }
    // Harness for the post-onboarding unlock rituals (Herzfeuer /
    // Funkenstern / Glut / Regenbogenfeuer). Replay pill + flavor
    // swatches let Marc iterate on copy + palette per flavor without
    // triggering the real milestone gates. See TeachRitualPreview.jsx.
    if (p.get('teachRitualPreview') === '1') {
      return <TeachRitualPreview />;
    }
    // QA route for the parent-first onboarding choreography (23 Apr 2026
    // rework). Lets Marc smoke-test the full KidIntro → ParentOnboarding →
    // HandoffBack → Onboarding sequence across viewports without a real
    // Supabase account. Each phase advances the local pointer on
    // onComplete; the last phase loops back to phase 0 so a designer can
    // keep cycling. Use ?parentFirstPreview=1 or add &phase=N to jump.
    if (p.get('parentFirstPreview') === '1') {
      const startPhase = parseInt(p.get('phase') || '0', 10) || 0;
      return <ParentFirstPreview startPhase={startPhase} />;
    }

    // Dev fast-path — lands straight on the Hub, skipping auth + all
    // onboarding gates. Useful for UI iteration + local testing without
    // a Supabase user. Use `?devHub=1` (optionally `&variant=forest`
    // to set the chibi colorway). DEV-only — the flag is ignored in
    // production builds.
    if (p.get('devHub') === '1' && import.meta.env.DEV) {
      const variant = p.get('variant') || 'forest';
      return (
        <TaskProvider>
          <CelebrationQueueProvider>
            <QuestEaterProvider>
              <DevHubPrime variant={variant} />
              <AppContent />
            </QuestEaterProvider>
          </CelebrationQueueProvider>
        </TaskProvider>
      );
    }
  }

  // [DRACHENNEST EXPERIMENT BRANCH] LoginScreen bypassed — the
  // experiment runs locally with the supabase stub (no real auth) so
  // user is always null. Marc's call 24 Apr 2026: "deactivate both
  // onboardings" + "preview within Claude Code". Logging in is one
  // gate too many for prototype iteration. AppContent's auto-prime
  // useEffect handles the parent-first onboarding bypass downstream.
  // Restore the `if (!user) return <LoginScreen />;` block when the
  // experiment graduates to main.

  return (
    <TaskProvider>
      <CelebrationQueueProvider>
        <QuestEaterProvider>
          {/* [DRACHENNEST] Auto-prime sits as a sibling so its hook
              stack stays separate from AppContent's. Onboarding gates
              get bypassed without disturbing AppContent rendering. */}
          <ExperimentAutoPrime />
          <AppContent />
        </QuestEaterProvider>
      </CelebrationQueueProvider>
    </TaskProvider>
  );
}

// [DRACHENNEST EXPERIMENT BRANCH] One-shot auto-prime for the
// onboarding flags so the prototype always boots straight to RoomHub.
// Renders nothing; runs an effect that patches state once. Lives as a
// sibling of AppContent so its hooks don't disturb that component's
// hook ordering.
function ExperimentAutoPrime() {
  const { state, actions } = useTask();
  React.useEffect(() => {
    if (!state || !actions) return;
    if (!state.kidIntroSeen || !state.parentOnboardingDone || !state.parentHandoffBackSeen) {
      actions.patchState?.({
        kidIntroSeen: true,
        parentOnboardingDone: true,
        parentHandoffBackSeen: true,
      });
    }
    if (!state.onboardingDone) {
      actions.completeOnboarding?.({
        companionVariant: 'forest',
        heroName: 'Louis',
        heroGender: 'boy',
      });
    }
  }, [state?.kidIntroSeen, state?.parentOnboardingDone, state?.parentHandoffBackSeen, state?.onboardingDone, actions]);
  return null;
}

function ErrorBoundary({ children }) {
  const { t } = useTranslation();
  const [error, setError] = React.useState(null);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-surface px-6 text-center">
        <div className="text-5xl mb-4">😿</div>
        <h2 className="font-headline text-xl font-bold text-error mb-2">{t('app.error.title')}</h2>
        <p className="font-body text-on-surface-variant mb-6">{t('app.error.desc')}</p>
        <button
          onClick={() => { setError(null); window.location.reload(); }}
          className="bg-primary-container text-white px-8 py-3 rounded-full font-label font-bold"
        >
          {t('app.error.retry')}
        </button>
      </div>
    );
  }
  return (
    <ErrorBoundaryInner onError={setError}>
      {children}
    </ErrorBoundaryInner>
  );
}

class ErrorBoundaryInner extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, info) {
    // Surface real error during dev so it's debuggable. Without this
    // the ErrorBoundary's UI just says "Etwas ist schiefgelaufen" with
    // no clue what threw.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught:', e, info?.componentStack);
    if (typeof window !== 'undefined') {
      window.__lastError = { message: e?.message, stack: e?.stack, componentStack: info?.componentStack };
    }
    this.props.onError(e);
  }
  render() { return this.state.hasError ? null : this.props.children; }
}

// ── DevHubPrime ───────────────────────────────────────────────────────
// On-mount prime that flips every onboarding gate true so the app
// renders straight into the Hub. DEV-only — gated by import.meta.env.DEV
// in AuthGate before this ever mounts. No-op when state is already
// onboarded (kid using the fast-path after the first prime).
function DevHubPrime({ variant = 'forest' }) {
  const { state, actions } = useTask();
  React.useEffect(() => {
    if (!state || !actions) return;
    if (!state.onboardingDone) {
      actions.completeOnboarding({
        companionVariant: variant,
        heroName: 'Dev',
        heroGender: 'boy',
      });
    }
    if (!state.kidIntroSeen || !state.parentHandoffBackSeen) {
      actions.patchState?.({
        kidIntroSeen: true,
        parentHandoffBackSeen: true,
      });
    }
    // Dev-only pendingRitual priming — useful for testing the Feuer tab
    // without grinding to the milestone threshold. Usage:
    //   ?devHub=1&pendingRitual=sparkle
    //   ?devHub=1&pendingRitual=heart
    //   ?devHub=1&pendingRitual=ember
    //   ?devHub=1&pendingRitual=rainbow
    const p = new URLSearchParams(window.location.search);
    const pendingFlag = p.get('pendingRitual');
    const validFlavors = ['sparkle', 'heart', 'ember', 'rainbow'];
    if (pendingFlag && validFlavors.includes(pendingFlag) && state.pendingRitual !== pendingFlag) {
      actions.patchState?.({ pendingRitual: pendingFlag });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.onboardingDone, state?.kidIntroSeen, state?.parentHandoffBackSeen, state?.pendingRitual]);
  return null;
}

// ── ParentFirstPreview ────────────────────────────────────────────────
// QA harness for the 23-Apr-2026 onboarding rework. Walks through the
// new choreography end-to-end (KidIntro → ParentOnboarding → HandoffBack
// → Onboarding) using local state, no Supabase account required.
// Reached via ?parentFirstPreview=1 (optionally &phase=N to jump in).
// The final phase loops back to phase 0 so designers can cycle. For
// Phase-6 (Lagerfeuer greeting) QA, open the real flow after signing
// in — the bubble + visual thread render on Hub.jsx, not here.
function ParentFirstPreview({ startPhase = 0 }) {
  const [phase, setPhase] = React.useState(startPhase);
  const next = () => setPhase((p) => (p >= 3 ? 0 : p + 1));

  if (phase === 0) {
    return <KidIntro onComplete={next} />;
  }
  if (phase === 1) {
    return (
      <ParentOnboarding
        existingFamilyConfig={undefined}
        onComplete={() => next()}
      />
    );
  }
  if (phase === 2) {
    return <HandoffBackCard onContinue={next} />;
  }
  // phase 3 — kid Onboarding (existing component). Loops back to 0 on complete.
  return <Onboarding onComplete={next} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AlphaBanner />
      <SWUpdateBanner />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
  );
}
