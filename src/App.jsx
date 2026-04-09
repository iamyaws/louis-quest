import React from 'react';
import { T } from './constants';
import { GameProvider, useGame } from './context/GameContext';

import Onboarding from './components/Onboarding';
import Hub from './components/Hub';
import QuestBoard from './components/QuestBoard';
import TimeBank from './components/TimeBank';
import Achievements from './components/Achievements';
import Room from './components/Room';
import Shop from './components/Shop';
import Journal from './components/Journal';
import VictoryScreen from './components/VictoryScreen';
import Celebration from './components/Celebration';
import { RareDropToast } from './components/Celebration';
import SpinWheel from './components/SpinWheel';
import SurpriseChest from './components/SurpriseChest';
import PinModal from './components/PinModal';
import MemoryGame from './components/MemoryGame';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { state, boarding, computed, actions, onBoard, ui } = useGame();

  // ── Loading / Onboarding ──
  if (boarding === null) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, color: T.textPrimary, fontFamily: "'Nunito',sans-serif" }}>Laden...</div>;
  if (boarding) return <Onboarding onComplete={onBoard} />;
  if (!state) return null;

  const { level, xpP, done, total, allDone, pct, mood, dayN, byA } = computed;

  return (
    <>
      {/* Overlays */}
      <Celebration active={ui.celeb} onDone={() => ui.setCeleb(false)} />
      <RareDropToast drop={ui.rareDrop} onDone={() => ui.setRareDrop(null)} />
      {ui.showWheel && <SpinWheel onResult={actions.collectWheel} />}
      {ui.showChest && <SurpriseChest onOpen={actions.collectChest} streakDays={state.sd} />}
      {ui.pinShow && <PinModal pin={ui.pin} setPin={ui.setPin} onSuccess={() => { ui.setPMode(true); ui.setPinShow(false); }} onClose={() => { ui.setPinShow(false); ui.setPin(""); }} />}
      {ui.showVictory && <VictoryScreen onClose={() => ui.setShowVictory(false)} onSpinWheel={() => { ui.setShowVictory(false); ui.setShowWheel(true); }} onMemoryGame={() => { ui.setShowVictory(false); ui.setShowMemory(true); }} />}
      {ui.showMemory && <MemoryGame onComplete={actions.collectMemory} />}

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", color: T.textPrimary }}>
        {ui.view === "hub" && <Hub />}
        {ui.view === "time" && <TimeBank />}
        {ui.view === "stats" && <Achievements />}
        {ui.view === "room" && <Room />}
        {ui.view === "shop" && <Shop />}
        {ui.view === "journal" && <Journal />}
        {ui.questOpen && <QuestBoard />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}
