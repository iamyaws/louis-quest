import React, { useState, useRef } from 'react';
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
import EpicMissions from './components/EpicMissions';
import MiniGames from './components/MiniGames';
import MemoryGame from './components/MemoryGame';
import PotionGame from './components/PotionGame';
import CloudJumpGame from './components/CloudJumpGame';
import StarCatcherGame from './components/StarCatcherGame';
import CompanionToast from './components/CompanionToast';
import ScreenTimer from './components/ScreenTimer';
import HeroProfile from './components/HeroProfile';

function AppContent() {
  const { t } = useTranslation();
  const { state, actions, loading, toastTrigger } = useTask();
  const [view, setView] = useState('hub');
  const [showParental, setShowParental] = useState(false);
  const longPressTimer = useRef(null);
  const [screenTimer, setScreenTimer] = useState(null); // { totalSeconds, cost, rewardName }

  const startScreenTimer = (reward) => {
    setScreenTimer({
      totalSeconds: reward.minutes * 60,
      cost: reward.cost,
      rewardName: reward.name,
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
        {view === 'quests' && <TaskList />}
        {view === 'shop' && <Belohnungsbank onNavigate={setView} onStartTimer={startScreenTimer} timerActive={!!screenTimer} onOpenParental={() => setShowParental(true)} />}
        {view === 'hub' && <Hub onNavigate={setView} />}
        {view === 'care' && <Sanctuary />}
        {view === 'journal' && <Journal />}
        {view === 'kodex' && <HeldenKodex />}
        {view === 'hero' && <HeroProfile onNavigate={setView} />}
        {view === 'missions' && <EpicMissions />}
        {view === 'games' && <MiniGames onPlay={(id) => {
          if (id === 'memory') setView('memory');
          if (id === 'potion') setView('potion');
          if (id === 'clouds') setView('clouds');
          if (id === 'starfall') setView('starfall');
        }} />}
      </div>
      <NavBar active={view} onNavigate={setView} />
      {showParental && <ParentalDashboard onClose={() => setShowParental(false)} />}
      {view === 'memory' && <MemoryGame onComplete={() => {
        actions.claimGameReward('memory'); // +1 screen min (once/day)
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
      <CompanionToast trigger={toastTrigger} />
      <Celebration />
      {screenTimer && (
        <ScreenTimer
          totalSeconds={screenTimer.totalSeconds}
          cost={screenTimer.cost}
          rewardName={screenTimer.rewardName}
          onFinish={() => {}}
          onStore={({ refundMinutes }) => {
            if (refundMinutes > 0) actions.addScreenMinutes(refundMinutes);
            setScreenTimer(null);
          }}
          onDismiss={() => setScreenTimer(null)}
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
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ErrorBoundary>
  );
}
