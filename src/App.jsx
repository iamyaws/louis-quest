import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth, LoginScreen } from './context/AuthContext';
import { TaskProvider, useTask } from './context/TaskContext';
import { useTranslation } from './i18n/LanguageContext';
import PinModal from './components/PinModal';
import NavBar from './components/NavBar';
import TabUnlockCelebration from './components/TabUnlockCelebration';
import SpendEffect from './components/SpendEffect';
import { QuestEaterProvider } from './components/QuestEater';
import TaskList from './components/TaskList';
import Belohnungsbank from './components/Belohnungsbank';
import Hub from './components/Hub';
import Sanctuary from './components/Sanctuary';
import Journal from './components/Journal';
import HeldenKodex from './components/HeldenKodex';
import Onboarding from './components/Onboarding';
import ParentalDashboard from './components/ParentalDashboard';
import Celebration from './components/Celebration';
// Arc offer system paused — see backlog_arc_offer_rework.md
// import ArcOfferCard from './components/ArcOfferCard';
import FreundCallbackCard from './components/FreundCallbackCard';
import MiniGames from './components/MiniGames';
import MemoryGame from './components/MemoryGame';
import PotionGame from './components/PotionGame';
import CloudJumpGame from './components/CloudJumpGame';
import StarCatcherGame from './components/StarCatcherGame';
import ZahlenjagdGame from './components/ZahlenjagdGame';
import MusterMemoryGame from './components/MusterMemoryGame';
import WurzelLabyrinthGame from './components/WurzelLabyrinthGame';
import PilzWaageGame from './components/PilzWaageGame';
// KristallSortiererGame deprecated Apr 2026 — replaced by Kristall-Kette
// (drag-a-line tactile loop, backlog_mint_crystal_game_rework pitches).
// Import kept commented for rollback reference.
// import KristallSortiererGame from './components/KristallSortiererGame';
import KristallKetteGame from './components/KristallKetteGame';
import CompanionToast from './components/CompanionToast';
import ParentIntroOverlay from './components/ParentIntroOverlay';
import ScreenTimer from './components/ScreenTimer';
import RonkiProfile from './components/RonkiProfile';
import Buch from './components/Buch';
import ChibiGallery from './components/ChibiGallery';
import RonkiCompendium from './components/RonkiCompendium';
import MemoryWall from './components/MemoryWall';
import DiscoveryLog from './components/DiscoveryLog';
import Micropedia from './components/Micropedia';
import PoemQuest from './components/PoemQuest';
import QuestLineView from './components/QuestLineView';
import StarfighterGame from './components/StarfighterGame';
import { useSpecialQuests } from './hooks/useSpecialQuests';
// Easter-egg system paused Apr 2026 — Marc: "don't feel it anymore".
// Hook + component files kept so we can re-enable by restoring these imports.
// import { useEggSystem } from './hooks/useEggSystem';
import { useMicropediaDiscovery } from './hooks/useMicropediaDiscovery';
import { useQuietAttention } from './hooks/useQuietAttention';
// import EggOverlay from './components/EggOverlay'; // paused Apr 2026 (see useEggSystem note)
import CreatureDiscoveryToast from './components/CreatureDiscoveryToast';
import AlphaBanner from './components/AlphaBanner';

function AppContent() {
  const { t } = useTranslation();
  const { state, actions, loading, toastTrigger } = useTask();
  // Dev URL shortcuts — apply on mount so they propagate to every
  // component (not just the Ronki tab where RonkiProfile reads them).
  //   ?gallery=1            — jump to the standalone ChibiGallery
  //   ?variant=teal|...     — seed companionVariant (affects campfire
  //                            Ronki, profile, any future chibi)
  //   ?stage=0..3           — seed catEvo to the matching stage threshold
  const initialView = (() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('gallery') === '1') return 'gallery';
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
  const [activeQuestLineId, setActiveQuestLineId] = useState(null);
  const [activeMintGame, setActiveMintGame] = useState(null); // MINT game id when view==='mint-game'
  const [showParental, setShowParental] = useState(false);
  // PIN gate — intercepts every parental-dashboard entry (lock tap, long
  // press). Dashboard only opens after the correct 4-digit PIN.
  const [pinGateOpen, setPinGateOpen] = useState(false);
  const [pin, setPin] = useState('');
  const openPinGate = () => { setPin(''); setPinGateOpen(true); };
  const [screenTimer, setScreenTimer] = useState(null); // { totalSeconds, cost, rewardName }

  useSpecialQuests(); // side-effect only — silently completes special quests
  // useEggSystem(); // paused Apr 2026 — spawner disabled, no more egg triggers
  useQuietAttention(view); // gentle voice brake when Louis zooms through screens

  const [discoveryToast, setDiscoveryToast] = useState(null);
  useMicropediaDiscovery((id) => setDiscoveryToast(id));

  useEffect(() => {
    // Flush any queued feedback from previous offline sessions
    import('./utils/feedback').then(m => m.flushFeedbackQueue()).catch(() => {});
  }, []);


  // Scroll to top whenever the active view changes; also record first-time visits
  useEffect(() => {
    // Belt-and-suspenders: works across iOS PWA, Android WebView, desktop
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    actions.recordViewVisit(view); // track first-time feature discovery
  }, [view]);

  const startScreenTimer = (reward) => {
    setScreenTimer({
      totalSeconds: reward.minutes * 60,
      cost: reward.cost,
      rewardName: reward.name,
      // Preserve the full reward runtime so we can refund Funkelzeit-usage
      // proportionally when the user stores unused time.
      totalMinutes: reward.minutes,
    });
    // Append a Funkelzeit-Verlauf entry (capped at last 200 for long-term use).
    // actualUsed is left undefined; it gets filled on Store or stays empty if
    // the timer runs out / is dismissed.
    const prior = state?.funkelzeitLog || [];
    actions.patchState({
      funkelzeitLog: [
        ...prior,
        {
          ts: new Date().toISOString(),
          minutes: reward.minutes,
          cost: reward.cost,
          rewardName: reward.name,
        },
      ].slice(-200),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-surface">
        <p className="font-headline text-xl font-bold text-primary">{t('app.loading')}</p>
      </div>
    );
  }

  // Onboarding gate
  if (state && !state.onboardingDone) {
    return (
      <Onboarding onComplete={(cfg) => {
        actions.completeOnboarding(cfg);
      }} />
    );
  }

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
            onOpenQuestLine={(id) => {
              setActiveQuestLineId(id);
              setView('questline');
            }}
          />
        )}
        {view === 'shop' && <Belohnungsbank onNavigate={setView} onStartTimer={startScreenTimer} timerActive={!!screenTimer} onOpenParental={() => openPinGate()} />}
        {view === 'hub' && (
          <Hub
            onNavigate={setView}
            onPlayMint={(gameId) => {
              setActiveMintGame(gameId);
              setView('mint-game');
            }}
          />
        )}
        {view === 'care' && <Sanctuary onNavigate={setView} />}
        {view === 'journal' && <Journal onNavigate={setView} onOpenParental={() => openPinGate()} />}
        {view === 'kodex' && <HeldenKodex />}
        {view === 'ronki' && <RonkiProfile onNavigate={setView} />}
        {view === 'memories' && <MemoryWall />}
        {view === 'buch' && <Buch onNavigate={setView} />}
        {view === 'gallery' && <ChibiGallery onClose={() => setView('hub')} />}
        {view === 'discovery' && <DiscoveryLog onNavigate={setView} />}
        {view === 'micropedia' && <Micropedia onNavigate={setView} />}
        {view === 'poem' && <PoemQuest onBack={() => setView('quests')} />}
        {view === 'questline' && activeQuestLineId && (
          <QuestLineView
            questLineId={activeQuestLineId}
            onBack={() => { setActiveQuestLineId(null); setView('quests'); }}
          />
        )}
        {view === 'games' && (
          <MiniGames
            onPlay={(id) => setView(id)}
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
        <ZahlenjagdGame onComplete={(reward) => {
          if (reward?.hp > 0) actions.addHP(reward.hp);
          setActiveMintGame(null);
          setView('hub');
        }} />
      )}
      {view === 'mint-game' && activeMintGame === 'muster-memory' && (
        <MusterMemoryGame onComplete={(reward) => {
          if (reward?.hp > 0) actions.addHP(reward.hp);
          setActiveMintGame(null);
          setView('hub');
        }} />
      )}
      {view === 'mint-game' && activeMintGame === 'wurzel-labyrinth' && (
        <WurzelLabyrinthGame onComplete={(reward) => {
          if (reward?.hp > 0) actions.addHP(reward.hp);
          setActiveMintGame(null);
          setView('hub');
        }} />
      )}
      {view === 'mint-game' && activeMintGame === 'pilz-waage' && (
        <PilzWaageGame onComplete={(reward) => {
          if (reward?.hp > 0) actions.addHP(reward.hp);
          setActiveMintGame(null);
          setView('hub');
        }} />
      )}
      {view === 'mint-game' && activeMintGame === 'kristall-sortierer' && (
        <KristallKetteGame onComplete={(reward) => {
          if (reward?.hp > 0) actions.addHP(reward.hp);
          setActiveMintGame(null);
          setView('hub');
        }} />
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
      {view === 'clouds' && <CloudJumpGame onComplete={() => {
        actions.claimGameReward('clouds');
        setView('games');
      }} />}
      {view === 'starfall' && <StarCatcherGame onComplete={() => {
        actions.claimGameReward('starfall');
        setView('games');
      }} />}
      {view === 'starfighter' && <StarfighterGame onComplete={(reward) => {
        if (reward?.hp > 0) actions.addHP(reward.hp);
        actions.claimGameReward('starfighter');
        setView('games');
      }} />}
      {/* EggOverlay mount paused Apr 2026. Any lingering state.pendingEgg
          stays in storage but doesn't render. Re-enable by restoring the
          JSX block above with the useEggSystem() hook. */}
      <CompanionToast trigger={toastTrigger} />
      {state &&
        state.onboardingDone &&
        !state.louisSeenParentIntro &&
        (state.totalTasksDone || 0) >= 3 &&
        view === 'hub' && <ParentIntroOverlay />}
      {/* Variant-migration modal removed — Marc has already talked Louis through
          the change in person, so the in-app "Ronki hat eine neue Form" beat is
          redundant. The component file is kept for reference but no longer mounted. */}
      <Celebration />
      {/* <ArcOfferCard /> — paused, see backlog_arc_offer_rework.md */}
      <FreundCallbackCard />
      {screenTimer && (
        <ScreenTimer
          totalSeconds={screenTimer.totalSeconds}
          cost={screenTimer.cost}
          rewardName={screenTimer.rewardName}
          onFinish={() => {}}
          onStore={({ refundMinutes, refundTimeMinutes }) => {
            if (refundMinutes > 0) actions.addScreenMinutes(refundMinutes);
            // Funkelzeit-usage refund: unused minutes don't count against the daily cap.
            if (refundTimeMinutes > 0) actions.refundFunkelzeitUsage(refundTimeMinutes);
            // Patch last log entry with actualUsed = total runtime minus refunded
            // minutes, so the Verlauf shows what Louis really consumed.
            const log = state?.funkelzeitLog || [];
            if (log.length > 0) {
              const last = log[log.length - 1];
              const totalMin = screenTimer.totalMinutes ?? (screenTimer.totalSeconds / 60);
              const actualUsed = Math.max(0, Math.round(totalMin - refundTimeMinutes));
              actions.patchState({
                funkelzeitLog: [...log.slice(0, -1), { ...last, actualUsed }],
              });
            }
            setScreenTimer(null);
          }}
          onDismiss={() => setScreenTimer(null)}
        />
      )}
      {discoveryToast && (
        <CreatureDiscoveryToast
          creatureId={discoveryToast}
          onDismiss={() => setDiscoveryToast(null)}
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
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    if (p.get('compendium') === '1') {
      return <RonkiCompendium />;
    }
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <TaskProvider>
      <QuestEaterProvider>
        <AppContent />
      </QuestEaterProvider>
    </TaskProvider>
  );
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
  componentDidCatch(e) { this.props.onError(e); }
  render() { return this.state.hasError ? null : this.props.children; }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AlphaBanner />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
  );
}
