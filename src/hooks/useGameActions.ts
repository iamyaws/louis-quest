import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  RARE_DROPS, RARE_DROP_CHANCE, CHEST_MILESTONES,
  WEEKLY_MISSIONS,
} from '../constants';
import { getLevel, buildDay } from '../utils/helpers';
import storage from '../utils/storage';
import SFX from '../utils/sfx';
import type { GameState, RareDrop, ChestReward, WheelSegment } from '../types';

interface UICallbacks {
  setCeleb: Dispatch<SetStateAction<boolean>>;
  setShowVictory: Dispatch<SetStateAction<boolean>>;
  setShowChest: Dispatch<SetStateAction<boolean>>;
  setRareDrop: Dispatch<SetStateAction<RareDrop | null>>;
  setShowWheel: Dispatch<SetStateAction<boolean>>;
  setShowMemory: Dispatch<SetStateAction<boolean>>;
}

export default function useGameActions(
  setState: Dispatch<SetStateAction<GameState | null>>,
  uiCallbacks: UICallbacks,
) {
  const {
    setCeleb, setShowVictory, setShowChest, setRareDrop,
    setShowWheel, setShowMemory,
  } = uiCallbacks;

  const complete = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      const q = prev.quests.find(x => x.id === id);
      if (!q || q.done) return prev;
      setCeleb(true);
      SFX.play("pop");
      setTimeout(() => SFX.play("coin"), 200);

      const nq2 = prev.quests.map(x => x.id === id ? { ...x, done: true, streak: x.streak + 1 } : x);
      const all = nq2.every(x => x.done);

      if (all) setTimeout(() => { SFX.play("celeb"); setShowVictory(true); }, 600);

      const xpMult = prev.xpBoost ? 2 : 1;
      const earnedXP = (q.xp + (all ? 30 : 0)) * xpMult;
      const prevLvl = getLevel(prev.xp);
      const newXP = prev.xp + earnedXP;
      const newLvl = getLevel(newXP);
      if (newLvl > prevLvl) setTimeout(() => SFX.play("levelup"), 300);

      const sm = { ...prev.sm, [id]: (prev.sm[id] || 0) + 1 };
      const newSD = all ? prev.sd + 1 : prev.sd;
      const newBest = Math.max(prev.bestStreak || 0, newSD);

      const isRare = Math.random() < RARE_DROP_CHANCE;
      if (isRare) {
        const drop = RARE_DROPS[Math.floor(Math.random() * RARE_DROPS.length)];
        setTimeout(() => setRareDrop(drop), 600);
      }

      const chestEarned = all && CHEST_MILESTONES.includes(newSD as typeof CHEST_MILESTONES[number]) && !prev.chestMilestone;
      if (chestEarned) setTimeout(() => setShowChest(true), all ? 2500 : 800);

      let bonusXP = 0, bonusCoins = 0, bonusMin = 0;
      if (isRare) {
        const drop = RARE_DROPS[Math.floor(Math.random() * RARE_DROPS.length)];
        if (drop.type === "xp") bonusXP = drop.amount || 0;
        if (drop.type === "coins") bonusCoins = drop.amount || 0;
        if (drop.type === "minutes") bonusMin = drop.amount || 0;
      }

      const wm = WEEKLY_MISSIONS.find(m => m.id === prev.weeklyMission);
      let wp = prev.weeklyProgress || 0;
      if (wm && all) {
        if (wm.goal === "allDone5" || wm.goal === "allDone7") wp++;
        if (wm.goal === "allMorning5") { if (nq2.filter(q2 => q2.anchor === "morning").every(q2 => q2.done)) wp++; }
        if (wm.goal === "allEvening7") { if (nq2.filter(q2 => q2.anchor === "evening").every(q2 => q2.done)) wp++; }
      }
      if (wm && q.id === "ft" && wm.goal === "football2") wp++;
      if (wm && q.id === "s8" && wm.goal === "read7") wp++;
      const wmComplete = wm && wp >= wm.target && (prev.weeklyProgress || 0) < wm.target;
      let wmBonusXP = 0, wmBonusCoins = 0;
      if (wmComplete) {
        if (wm.reward.type === "coins") wmBonusCoins = wm.reward.amount;
        if (wm.reward.type === "xp") wmBonusXP = wm.reward.amount;
      }

      return {
        ...prev, quests: nq2,
        xp: newXP + bonusXP + wmBonusXP,
        coins: prev.coins + Math.floor(q.xp / 3) + (all ? 15 : 0) + bonusCoins + wmBonusCoins,
        dt: prev.dt + q.minutes + bonusMin, sd: newSD,
        hist: [...prev.hist, { id, d: Date.now() }], sm, bestStreak: newBest,
        chestMilestone: chestEarned ? newSD : prev.chestMilestone,
        xpBoost: all ? false : prev.xpBoost,
        weeklyProgress: wp,
      };
    });
  }, [setState, setCeleb, setShowVictory, setShowChest, setRareDrop]);

  const addQuest = useCallback((nq: { name: string; icon: string; anchor: string; xp: number; minutes: number }, resetName: () => void) => {
    if (!nq.name.trim()) return;
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        quests: [...prev.quests, {
          id: "c_" + Date.now(), name: nq.name.trim(), icon: nq.icon,
          anchor: nq.anchor as 'morning' | 'afternoon' | 'evening',
          xp: nq.xp, minutes: nq.minutes, done: false, streak: 0,
        }],
      };
    });
    resetName();
  }, [setState]);

  const completeComeback = useCallback(() => {
    SFX.play("celeb");
    setCeleb(true);
    setState(prev => prev ? { ...prev, comebackActive: false, xp: prev.xp + 15, coins: prev.coins + 10 } : prev);
  }, [setState, setCeleb]);

  const rmQuest = useCallback((id: string) => {
    setState(prev => prev ? { ...prev, quests: prev.quests.filter(q => q.id !== id) } : prev);
  }, [setState]);

  const togVac = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const nv = !prev.vacMode;
      return { ...prev, vacMode: nv, quests: buildDay(nv).map(q => ({ ...q, streak: (prev.sm || {})[q.id] || 0 })), dt: 0 };
    });
  }, [setState]);

  const resetDay = useCallback(() => {
    setState(prev => prev ? { ...prev, quests: prev.quests.map(q => ({ ...q, done: false })), dt: 0, lastDate: new Date().toDateString() } : prev);
  }, [setState]);

  const resetAll = useCallback(() => {
    storage.clear();
    setState(null);
  }, [setState]);

  const buyItem = useCallback((id: string, cost: number) => {
    setState(prev => {
      if (!prev || prev.coins < cost || (prev.purchased || []).includes(id)) return prev;
      SFX.play("buy");
      return { ...prev, coins: prev.coins - cost, purchased: [...(prev.purchased || []), id] };
    });
  }, [setState]);

  const setMood = useCallback((period: string, val: number) => {
    setState(prev => prev ? { ...prev, [period]: val } : prev);
  }, [setState]);

  const setJournal = useCallback((val: string) => {
    setState(prev => prev ? { ...prev, journal: val } : prev);
  }, [setState]);

  const setJAnswer = useCallback((qid: string, val: string) => {
    setState(prev => prev ? { ...prev, jAnswers: { ...(prev.jAnswers || {}), [qid]: val } } : prev);
  }, [setState]);

  const toggleRainbow = useCallback((idx: number) => {
    setState(prev => {
      if (!prev) return prev;
      const r = [...(prev.rainbow || [false, false, false, false, false, false])];
      r[idx] = !r[idx];
      const allDone = r.every(Boolean);
      return {
        ...prev, rainbow: r,
        xp: allDone && !prev.rainbow.every(Boolean) ? prev.xp + 25 : prev.xp,
        coins: allDone && !prev.rainbow.every(Boolean) ? prev.coins + 20 : prev.coins,
      };
    });
  }, [setState]);

  const collectWheel = useCallback((result: WheelSegment) => {
    setState(prev => {
      if (!prev) return prev;
      const u = { ...prev, wheelSpun: true };
      if (result.type === "coins") u.coins += result.amount || 0;
      if (result.type === "xp") u.xp += result.amount || 0;
      if (result.type === "minutes") u.dt += result.amount || 0;
      if (result.type === "rare") {
        const r = RARE_DROPS[Math.floor(Math.random() * RARE_DROPS.length)];
        if (r.type === "coins") u.coins += r.amount || 30;
        if (r.type === "xp") u.xp += r.amount || 25;
        if (r.type === "minutes") u.dt += r.amount || 5;
      }
      return u;
    });
    setShowWheel(false);
  }, [setState, setShowWheel]);

  const collectMemory = useCallback((reward: { xp: number; coins: number }) => {
    setState(prev => prev ? { ...prev, xp: prev.xp + reward.xp, coins: prev.coins + reward.coins, memoryPlayed: true } : prev);
    setShowMemory(false);
  }, [setState, setShowMemory]);

  const collectChest = useCallback((reward: ChestReward) => {
    setState(prev => {
      if (!prev) return prev;
      const u = { ...prev, chestMilestone: null };
      if (reward.type === "coins") u.coins += reward.amount || 0;
      if (reward.type === "xp") u.xp += reward.amount || 0;
      if (reward.type === "minutes") u.dt += reward.amount || 0;
      if (reward.type === "item" && reward.id && !u.purchased.includes(reward.id)) u.purchased = [...u.purchased, reward.id];
      if (reward.type === "xpboost") u.xpBoost = true;
      return u;
    });
    setShowChest(false);
  }, [setState, setShowChest]);

  const exportState = useCallback((currentState: GameState) => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `herodex-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importState = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (validateImportData(data)) {
          setState(data);
        }
      } catch { /* invalid JSON ignored */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [setState]);

  return {
    complete, addQuest, completeComeback, rmQuest,
    togVac, resetDay, resetAll, buyItem,
    setMood, setJournal, setJAnswer, toggleRainbow,
    collectWheel, collectMemory, collectChest,
    exportState, importState,
  };
}

export function validateImportData(data: unknown): data is GameState {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

  const d = data as Record<string, unknown>;

  if (!d.hero || typeof d.hero !== 'object') return false;
  if (!Array.isArray(d.quests)) return false;

  const hero = d.hero as Record<string, unknown>;
  if (typeof hero.name !== 'string' || !hero.shape || !hero.color) return false;

  if (typeof d.xp !== 'number' || typeof d.coins !== 'number') return false;

  if (!(d.quests as unknown[]).every((q: unknown) => {
    if (!q || typeof q !== 'object') return false;
    const quest = q as Record<string, unknown>;
    return typeof quest.id === 'string' && typeof quest.name === 'string';
  })) return false;

  return true;
}
