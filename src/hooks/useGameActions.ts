import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  RARE_DROPS, RARE_DROP_CHANCE, CHEST_MILESTONES,
  WEEKLY_MISSIONS, BOSSES, UNLOCK_CONDITIONS,
} from '../constants';
import { getLevel, buildDay, getCatStage } from '../utils/helpers';
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

/** Add Heldenpunkte: same amount to both xp (lifetime) and coins (balance) */
function addHP(state: GameState, amount: number): { xp: number; coins: number } {
  return { xp: state.xp + amount, coins: state.coins + amount };
}

/** Check and apply passive item unlocks based on current state */
function checkUnlocks(state: GameState): string[] {
  const current = state.purchased || [];
  const newUnlocks: string[] = [];
  for (const [itemId, cond] of Object.entries(UNLOCK_CONDITIONS)) {
    if (current.includes(itemId)) continue;
    let met = false;
    switch (cond.type) {
      case "streak": met = (state.sd || 0) >= cond.value || (state.bestStreak || 0) >= cond.value; break;
      case "boss": met = (state.bossTrophies || []).length >= cond.value; break;
      case "tasks": met = (state.hist || []).length >= cond.value; break;
      case "catStage": met = getCatStage(state.catEvo || 0) >= cond.value; break;
      case "weeklyMission": met = (state.weeklyMissionsCompleted || 0) >= cond.value; break;
    }
    if (met) newUnlocks.push(itemId);
  }
  return newUnlocks;
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

      // Unified HP earning: quest.xp goes to both xp and coins
      const xpMult = prev.xpBoost ? 2 : 1;
      const earned = (q.xp + (all ? 30 : 0)) * xpMult;
      const prevLvl = getLevel(prev.xp);
      const newXP = prev.xp + earned;
      const newCoins = prev.coins + earned;
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

      // Rare drop bonus — unified HP
      let bonusHP = 0, bonusMin = 0;
      if (isRare) {
        const drop = RARE_DROPS[Math.floor(Math.random() * RARE_DROPS.length)];
        if (drop.type === "hp") bonusHP = drop.amount || 0;
        if (drop.type === "minutes") bonusMin = drop.amount || 0;
      }

      // Weekly mission progress
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
      let wmBonusHP = 0;
      let wmcCount = prev.weeklyMissionsCompleted || 0;
      if (wmComplete) {
        wmBonusHP = wm.reward.amount;
        wmcCount++;
      }

      // Boss damage
      let bossUpdate = prev.boss ? { ...prev.boss } : null;
      let bossRewardHP = 0;
      const trophies = [...(prev.bossTrophies || [])];
      if (bossUpdate && bossUpdate.hp > 0) {
        const dmg = Math.max(5, Math.floor(q.xp * 0.8));
        const prevHp = bossUpdate.hp;
        bossUpdate.hp = Math.max(0, bossUpdate.hp - dmg);
        if (prevHp > 0) setTimeout(() => SFX.play("bossHit"), 100);
        if (bossUpdate.hp <= 0 && prevHp > 0) {
          const bd = BOSSES.find(b => b.id === bossUpdate!.id);
          if (bd) bossRewardHP = bd.reward.hp;
          if (!trophies.includes(bossUpdate.id)) trophies.push(bossUpdate.id);
          setTimeout(() => SFX.play("bossDefeat"), 400);
        }
      }

      // Cat evolution
      const catEvoGain = all ? 3 : 1;
      const newCatEvo = (prev.catEvo || 0) + catEvoGain;
      const prevCatStage = getCatStage(prev.catEvo || 0);
      const newCatStage = getCatStage(newCatEvo);
      if (newCatStage > prevCatStage) setTimeout(() => SFX.play("evolve"), 800);

      const totalHP = earned + bonusHP + wmBonusHP + bossRewardHP;
      const result: GameState = {
        ...prev, quests: nq2,
        xp: prev.xp + totalHP,
        coins: prev.coins + totalHP,
        dt: prev.dt + q.minutes + bonusMin, sd: newSD,
        hist: [...prev.hist, { id, d: Date.now() }], sm, bestStreak: newBest,
        chestMilestone: chestEarned ? newSD : prev.chestMilestone,
        xpBoost: all ? false : prev.xpBoost,
        weeklyProgress: wp,
        weeklyMissionsCompleted: wmcCount,
        boss: bossUpdate, bossTrophies: trophies,
        catEvo: newCatEvo,
      };

      // Check passive unlocks
      const newUnlocks = checkUnlocks(result);
      if (newUnlocks.length > 0) {
        result.purchased = [...(result.purchased || []), ...newUnlocks];
      }

      return result;
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
    setState(prev => prev ? { ...prev, comebackActive: false, ...addHP(prev, 15) } : prev);
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

  // ── REMOVED buyItem (replaced by passive unlocks) ──
  // Items now unlock through milestones, not purchase

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
      const bonus = allDone && !prev.rainbow.every(Boolean) ? 25 : 0;
      return {
        ...prev, rainbow: r,
        xp: prev.xp + bonus,
        coins: prev.coins + bonus,
      };
    });
  }, [setState]);

  const collectWheel = useCallback((result: WheelSegment) => {
    setState(prev => {
      if (!prev) return prev;
      const u = { ...prev, wheelSpun: true };
      if (result.type === "hp") { u.xp += result.amount || 0; u.coins += result.amount || 0; }
      if (result.type === "minutes") u.dt += result.amount || 0;
      if (result.type === "rare") {
        const r = RARE_DROPS[Math.floor(Math.random() * RARE_DROPS.length)];
        if (r.type === "hp") { u.xp += r.amount || 30; u.coins += r.amount || 30; }
        if (r.type === "minutes") u.dt += r.amount || 5;
      }
      return u;
    });
    setShowWheel(false);
  }, [setState, setShowWheel]);

  const collectMemory = useCallback((reward: { xp: number; coins: number }) => {
    // Legacy: add same amount to both
    const amt = reward.xp + reward.coins;
    setState(prev => prev ? { ...prev, xp: prev.xp + amt, coins: prev.coins + amt, memoryPlayed: true } : prev);
    setShowMemory(false);
  }, [setState, setShowMemory]);

  const collectChest = useCallback((reward: ChestReward) => {
    setState(prev => {
      if (!prev) return prev;
      const u = { ...prev, chestMilestone: null };
      if (reward.type === "hp") { u.xp += reward.amount || 0; u.coins += reward.amount || 0; }
      if (reward.type === "minutes") u.dt += reward.amount || 0;
      if (reward.type === "item" && reward.id && !u.purchased.includes(reward.id)) u.purchased = [...u.purchased, reward.id];
      if (reward.type === "xpboost") u.xpBoost = true;
      return u;
    });
    setShowChest(false);
  }, [setState, setShowChest]);

  // ── Cat care: unified HP ──

  const feedCat = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catFed) return prev;
      SFX.play("feed");
      return { ...prev, catFed: true, catHunger: Math.min(100, (prev.catHunger || 0) + 40), catEvo: (prev.catEvo || 0) + 1, ...addHP(prev, 5) };
    });
  }, [setState]);

  const petCat = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPetted) return prev;
      SFX.play("purr");
      return { ...prev, catPetted: true, catHappy: Math.min(100, (prev.catHappy || 0) + 40), catEvo: (prev.catEvo || 0) + 1, ...addHP(prev, 5) };
    });
  }, [setState]);

  const playCat = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPlayed) return prev;
      SFX.play("pop");
      return { ...prev, catPlayed: true, catEnergy: Math.min(100, (prev.catEnergy || 0) + 40), catEvo: (prev.catEvo || 0) + 1, ...addHP(prev, 5) };
    });
  }, [setState]);

  // ── NEW: Daily habits ──

  const completeHabit = useCallback((habitId: string) => {
    setState(prev => {
      if (!prev) return prev;
      if (habitId === "vitaminD" && !prev.dailyVitaminD) {
        SFX.play("pop");
        return { ...prev, dailyVitaminD: true, ...addHP(prev, 5) };
      }
      if (habitId === "brother" && !prev.dailyBrother) {
        SFX.play("pop");
        return { ...prev, dailyBrother: true, ...addHP(prev, 10) };
      }
      return prev;
    });
  }, [setState]);

  // ── NEW: Belohnungsbank ──

  const redeemReward = useCallback((belohnungId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const bel = (prev.belohnungen || []).find(b => b.id === belohnungId);
      if (!bel || !bel.active || prev.coins < bel.cost) return prev;
      SFX.play("buy");
      return {
        ...prev,
        coins: prev.coins - bel.cost,
        belohnungenLog: [...(prev.belohnungenLog || []), { id: belohnungId, date: new Date().toISOString() }],
      };
    });
  }, [setState]);

  const updateBelohnungen = useCallback((belohnungen: import('../types').Belohnung[]) => {
    setState(prev => prev ? { ...prev, belohnungen } : prev);
  }, [setState]);

  // ── NEW: Spezial-Missionen ──

  const addSpecialMission = useCallback((mission: { name: string; emoji: string; hp: number }) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        specialMissions: [...(prev.specialMissions || []), { id: "sm_" + Date.now(), ...mission, done: false }],
      };
    });
  }, [setState]);

  const completeSpecialMission = useCallback((missionId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const mission = (prev.specialMissions || []).find(m => m.id === missionId);
      if (!mission || mission.done) return prev;
      SFX.play("celeb");
      setCeleb(true);
      const hp = mission.hp || 0;
      return {
        ...prev,
        specialMissions: prev.specialMissions.map(m => m.id === missionId ? { ...m, done: true } : m),
        xp: prev.xp + hp,
        coins: prev.coins + hp,
      };
    });
  }, [setState, setCeleb]);

  const removeSpecialMission = useCallback((missionId: string) => {
    setState(prev => prev ? { ...prev, specialMissions: (prev.specialMissions || []).filter(m => m.id !== missionId) } : prev);
  }, [setState]);

  // ── NEW: Weekly lunch ──

  const updateWeeklyLunch = useCallback((lunch: Record<string, string>) => {
    setState(prev => prev ? { ...prev, weeklyLunch: lunch } : prev);
  }, [setState]);

  // ── Export / Import ──

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
    togVac, resetDay, resetAll,
    setMood, setJournal, setJAnswer, toggleRainbow,
    collectWheel, collectMemory, collectChest,
    feedCat, petCat, playCat,
    completeHabit, redeemReward, updateBelohnungen,
    addSpecialMission, completeSpecialMission, removeSpecialMission,
    updateWeeklyLunch,
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
