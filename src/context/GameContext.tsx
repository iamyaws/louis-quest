import React, { createContext, useContext, useState } from 'react';
import useGamePersistence, { createInitialState } from '../hooks/useGamePersistence';
import useGameActions from '../hooks/useGameActions';
import useComputedState from '../hooks/useComputedState';
import type { GameState, ComputedState, RareDrop, Hero } from '../types';

interface GameContextValue {
  state: GameState | null;
  boarding: boolean | null;
  computed: ComputedState | null;
  actions: ReturnType<typeof useGameActions> & { resetAll: () => void };
  onBoard: (data: { hero: Hero; catVariant: string; catName: string; startXP?: number; startCoins?: number }) => void;
  ui: {
    view: string; setView: React.Dispatch<React.SetStateAction<string>>;
    questOpen: boolean; setQuestOpen: React.Dispatch<React.SetStateAction<boolean>>;
    celeb: boolean; setCeleb: React.Dispatch<React.SetStateAction<boolean>>;
    pMode: boolean; setPMode: React.Dispatch<React.SetStateAction<boolean>>;
    pinShow: boolean; setPinShow: React.Dispatch<React.SetStateAction<boolean>>;
    pin: string; setPin: React.Dispatch<React.SetStateAction<string>>;
    nq: { name: string; icon: string; anchor: string; xp: number; minutes: number };
    setNq: React.Dispatch<React.SetStateAction<{ name: string; icon: string; anchor: string; xp: number; minutes: number }>>;
    shopTab: string; setShopTab: React.Dispatch<React.SetStateAction<string>>;
    showWheel: boolean; setShowWheel: React.Dispatch<React.SetStateAction<boolean>>;
    showChest: boolean; setShowChest: React.Dispatch<React.SetStateAction<boolean>>;
    rareDrop: RareDrop | null; setRareDrop: React.Dispatch<React.SetStateAction<RareDrop | null>>;
    showVictory: boolean; setShowVictory: React.Dispatch<React.SetStateAction<boolean>>;
    showMemory: boolean; setShowMemory: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { state, setState, boarding, setBoarding } = useGamePersistence();

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
  const [rareDrop, setRareDrop] = useState<RareDrop | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  const actions = useGameActions(setState, {
    setCeleb, setShowVictory, setShowChest, setRareDrop,
    setShowWheel, setShowMemory,
  });

  const computed = useComputedState(state);

  const onBoard = (data: { hero: Hero; catVariant: string; catName: string; startXP?: number; startCoins?: number }) => {
    setState(createInitialState(data));
    setBoarding(false);
  };

  const handleResetAll = () => {
    actions.resetAll();
    setBoarding(true);
  };

  const value: GameContextValue = {
    state,
    boarding,
    computed,
    actions: { ...actions, resetAll: handleResetAll },
    onBoard,
    ui: {
      view, setView, questOpen, setQuestOpen,
      celeb, setCeleb, pMode, setPMode,
      pinShow, setPinShow, pin, setPin,
      nq, setNq, shopTab, setShopTab,
      showWheel, setShowWheel, showChest, setShowChest,
      rareDrop, setRareDrop, showVictory, setShowVictory,
      showMemory, setShowMemory,
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}

export default GameContext;
