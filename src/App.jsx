import React, { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth, LoginScreen } from './context/AuthContext';
import { TaskProvider, useTask } from './context/TaskContext';
import { useTranslation } from './i18n/LanguageContext';
import TopBar from './components/TopBar';
import NavBar from './components/NavBar';
import TaskList from './components/TaskList';
import Belohnungsbank from './components/Belohnungsbank';
import Hub from './components/Hub';
import Sanctuary from './components/Sanctuary';
import Journal from './components/Journal';
import HeldenKodex from './components/HeldenKodex';
import Onboarding from './components/Onboarding';
import ParentalDashboard from './components/ParentalDashboard';
import Celebration from './components/Celebration';
import ArcOfferCard from './components/ArcOfferCard';
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
import CompanionToast from './components/CompanionToast';
import ParentIntroOverlay from './components/ParentIntroOverlay';
import ScreenTimer from './components/ScreenTimer';
import RonkiProfile from './components/RonkiProfile';
import MemoryWall from './components/MemoryWall';
import DiscoveryLog from './components/DiscoveryLog';
import Micropedia from './components/Micropedia';
import PoemQuest from './components/PoemQuest';
import QuestLineView from './components/QuestLineView';
import StarfighterGame from './components/StarfighterGame';
import { useSpecialQuests } from './hooks/useSpecialQuests';
import { useEggSystem } from './hooks/useEggSystem';
import { useMicropediaDiscovery } from './hooks/useMicropediaDiscovery';
import { useQuietAttention } from './hooks/useQuietAttention';
import EggOverlay from './components/EggOverlay';
import CreatureDiscoveryToast from './components/CreatureDiscoveryToast';
import AlphaBanner from './components/AlphaBanner';

function AppContent() {
  const { t } = useTranslation();
  const { state, actions, loading, toastTrigger } = useTask();
  const [view, setView] = useState('hub');
  const [activeQuestLineId, setActiveQuestLineId] = useState(null);
  const [activeMintGame, setActiveMintGame] = useState(null); // MINT game id when view==='mint-game'
  const [showParental, setShowParental] = useState(false);
  const longPressTimer = useRef(null);
  const [screenTimer, setScreenTimer] = useState(null); // { totalSeconds, cost, rewardName }

  useSpecialQuests(); // side-effect only — silently completes special quests
  useEggSystem(); // silently spawns eggs when trigger conditions are met
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

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => setShowParental(true), 1500);
  };
  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  return (
    <>
      {!['hub', 'care'].includes(view) && (
        <div onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd}
             onMouseDown={handleLongPressStart} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd}>
          <TopBar onNavigate={setView} />
        </div>
      )}
      <div className={`min-h-dvh max-w-lg mx-auto ${['hub', 'care'].includes(view) ? '' : 'bg-surface'}`}
           style={{
             paddingTop: ['hub', 'care'].includes(view) ? 0 : 'calc(72px + env(safe-area-inset-top, 0px))',
             paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
           }}>
        {view === 'quests' && (
          <TaskList
            onNavigate={setView}
            onOpenQuestLine={(id) => {
              setActiveQuestLineId(id);
              setView('questline');
            }}
          />
        )}
        {view === 'shop' && <Belohnungsbank onNavigate={setView} onStartTimer={startScreenTimer} timerActive={!!screenTimer} onOpenParental={() => setShowParental(true)} />}
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
        {view === 'journal' && <Journal />}
        {view === 'kodex' && <HeldenKodex />}
        {view === 'ronki' && <RonkiProfile onNavigate={setView} />}
        {view === 'memories' && <MemoryWall />}
        {view === 'discovery' && <DiscoveryLog onNavigate={setView} />}
        {view === 'micropedia' && <Micropedia onNavigate={setView} />}
        {view === 'poem' && <PoemQuest onBack={() => setView('quests')} />}
        {view === 'questline' && activeQuestLineId && (
          <QuestLineView
            questLineId={activeQuestLineId}
            onBack={() => { setActiveQuestLineId(null); setView('quests'); }}
          />
        )}
        {view === 'games' && <MiniGames onPlay={(id) => setView(id)} />}
        {view === 'mint-game' && activeMintGame && (
          <>
            {activeMintGame === 'zahlenjagd' && (
              <ZahlenjagdGame onComplete={(reward) => {
                if (reward?.hp > 0) actions.addHP(reward.hp);
                setActiveMintGame(null);
                setView('hub');
              }} />
            )}
            {activeMintGame === 'muster-memory' && (
              <MusterMemoryGame onComplete={(reward) => {
                if (reward?.hp > 0) actions.addHP(reward.hp);
                setActiveMintGame(null);
                setView('hub');
              }} />
            )}
            {activeMintGame === 'wurzel-labyrinth' && (
              <WurzelLabyrinthGame onComplete={(reward) => {
                if (reward?.hp > 0) actions.addHP(reward.hp);
                setActiveMintGame(null);
                setView('hub');
              }} />
            )}
            {activeMintGame === 'pilz-waage' && (
              <PilzWaageGame onComplete={(reward) => {
                if (reward?.hp > 0) actions.addHP(reward.hp);
                setActiveMintGame(null);
                setView('hub');
              }} />
            )}
          </>
        )}
      </div>
      <NavBar active={view} onNavigate={setView} />
      {showParental && <ParentalDashboard onClose={() => setShowParental(false)} currentView={view} />}
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
      {state?.pendingEgg && state.pendingEgg.view === view && (
        <EggOverlay
          egg={state.pendingEgg}
          onCollect={() => actions.collectEgg()}
        />
      )}
      <CompanionToast trigger={toastTrigger} />
      {state &&
        state.onboardingDone &&
        !state.louisSeenParentIntro &&
        (state.totalTasksDone || 0) >= 3 &&
        view === 'hub' && <ParentIntroOverlay />}
      <Celebration />
      <ArcOfferCard />
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

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <TaskProvider>
      <AppContent />
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
