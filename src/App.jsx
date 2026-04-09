import React from 'react';
import { T } from './constants';
import { GameProvider, useGame } from './context/GameContext';
import SFX from './utils/sfx';

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
import Weather from './components/Weather';
import ErrorBoundary from './components/ErrorBoundary';

const TABS = [
  { id: "weather", label: "Wetter", icon: "\u{1F324}\uFE0F" },
  { id: "stats", label: "Erfolge", icon: "\u{1F3C6}" },
  { id: "quest", label: "", icon: "\u2694\uFE0F", isCta: true },
  { id: "room", label: "Zimmer", icon: "\u{1F3E0}" },
  { id: "shop", label: "Shop", icon: "\u{1F6CD}\uFE0F" },
];

function BottomTabBar() {
  const { ui } = useGame();
  const { view, setView, setQuestOpen } = ui;

  return (
    <div className="tab-bar">
      {TABS.map(tab => {
        if (tab.isCta) {
          return (
            <button key={tab.id} className="tab-cta" onClick={() => { SFX.play("tap"); setQuestOpen(true); }} aria-label="Quests öffnen">
              {tab.icon}
            </button>
          );
        }
        const isActive = view === tab.id;
        return (
          <button
            key={tab.id}
            className={`tab-item ${isActive ? "tab-item-active" : ""}`}
            onClick={() => { SFX.play("tap"); setView(tab.id); }}
            aria-label={tab.label}
          >
            <div className={`tab-icon ${isActive ? "tab-icon-active" : ""}`}>{tab.icon}</div>
            <span className={`tab-label ${isActive ? "tab-label-active" : ""}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AppContent() {
  const { state, boarding, computed, actions, onBoard, ui } = useGame();

  if (boarding === null) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0369E8", color: "white", fontFamily: "'Nunito',sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>Laden...</div>;
  if (boarding) return <Onboarding onComplete={onBoard} />;
  if (!state) return null;

  const showChrome = !boarding && state;

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

      {/* Persistent chrome */}

      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #3B9FFF 0%, #60B3FF 40%, #7DC4FF 100%)", fontFamily: "'Nunito',sans-serif", color: T.textPrimary, paddingTop: ui.view === "hub" ? 0 : 60, paddingBottom: 80 }}>
        {ui.view === "hub" && <Hub />}
        {ui.view === "time" && <TimeBank />}
        {ui.view === "stats" && <Achievements />}
        {ui.view === "room" && <Room />}
        {ui.view === "shop" && <Shop />}
        {ui.view === "journal" && <Journal />}
        {ui.view === "weather" && <Weather />}
        {ui.questOpen && <QuestBoard />}
      </div>

      {showChrome && <BottomTabBar />}
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
