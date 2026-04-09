import React, { createContext, useContext, useState } from 'react';
import useGamePersistence, { createInitialState } from '../hooks/useGamePersistence';
import useGameActions from '../hooks/useGameActions';
import useComputedState from '../hooks/useComputedState';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { state, setState, boarding, setBoarding } = useGamePersistence();

  // ── UI state ──
  const [view, setView] = useState("hub");
  const [questOpen, setQuestOpen] = useState(false);
  const [celeb, setCeleb] = useState(false);
  const [pMode, setPMode] = useState(false);
  const [pinShow, setPinShow] = useState(false);
  const [pin, setPin] = useState("");
  const [nq, setNq] = useState({ name: "", icon: "\u2B50", anchor: "morning", xp: 15, minutes: 5 });
  const [shopTab, setShopTab] = useState("hero");
  const [showWheel, setShowWheel] = useState(false);
  const [showChest, setShowChest] = useState(false);
  const [rareDrop, setRareDrop] = useState(null);
  const [showVictory, setShowVictory] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  // ── Actions ──
  const actions = useGameActions(setState, {
    setCeleb, setShowVictory, setShowChest, setRareDrop,
    setShowWheel, setShowMemory,
  });

  // ── Computed ──
  const computed = useComputedState(state);

  // ── Onboarding ──
  const onBoard = (data) => {
    setState(createInitialState(data));
    setBoarding(false);
  };

  const handleResetAll = () => {
    actions.resetAll();
    setBoarding(true);
  };

  const value = {
    // Core state
    state,
    boarding,
    computed,

    // All game actions
    actions: { ...actions, resetAll: handleResetAll },

    // Onboarding
    onBoard,

    // UI state
    ui: {
      view, setView,
      questOpen, setQuestOpen,
      celeb, setCeleb,
      pMode, setPMode,
      pinShow, setPinShow,
      pin, setPin,
      nq, setNq,
      shopTab, setShopTab,
      showWheel, setShowWheel,
      showChest, setShowChest,
      rareDrop, setRareDrop,
      showVictory, setShowVictory,
      showMemory, setShowMemory,
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}

export default GameContext;
