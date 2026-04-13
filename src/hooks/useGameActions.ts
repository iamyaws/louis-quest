import { useCallback, type Dispatch, type SetStateAction } from 'react';
import {
  CHEST_MILESTONES, MILESTONE_REWARDS,
  WEEKLY_MISSIONS, BOSSES, UNLOCK_CONDITIONS, SHOP_ITEMS,
} from '../constants';
import { getLevel, buildDay, getCatStage, getTierForStage } from '../utils/helpers';
import storage from '../utils/storage';
import SFX from '../utils/sfx';
import type { GameState } from '../types';

interface UICallbacks {
  setCeleb: Dispatch<SetStateAction<boolean>>;
  setShowVictory: Dispatch<SetStateAction<boolean>>;
  setShowChest: Dispatch<SetStateAction<boolean>>;
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
    setCeleb, setShowVictory, setShowChest,
    setShowMemory,
  } = uiCallbacks;

  const complete = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      const q = prev.quests.find(x => x.id === id);
      if (!q) return prev;

      // Repeatable quest logic
      const target = q.target || 1;
      const bonus = q.bonus || target;
      const curCompletions = q.completions || 0;

      // Already fully done (including bonus)
      if (q.done && curCompletions >= bonus) return prev;
      // For non-repeatable: skip if done
      if (q.done && target <= 1) return prev;

      setCeleb(true);
      SFX.play("pop");
      setTimeout(() => SFX.play("coin"), 200);

      const newCompletions = curCompletions + 1;
      const isDone = newCompletions >= target;
      const isBonus = curCompletions >= target; // this tap is a bonus tap

      const nq2 = prev.quests.map(x => x.id === id ? {
        ...x,
        done: isDone,
        streak: isDone && !q.done ? x.streak + 1 : x.streak,
        completions: newCompletions,
      } : x);
      const mainQuests = nq2.filter(x => !x.sideQuest);
      const all = mainQuests.every(x => x.done) && mainQuests.length > 0;

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
      const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100];
      const hitMilestone = all && prev.sd !== newSD && STREAK_MILESTONES.includes(newSD);
      if (hitMilestone) {
        setTimeout(() => SFX.play("celeb"), 1000);
      }
      const newBest = Math.max(prev.bestStreak || 0, newSD);
      const newTotalDays = all && prev.sd !== newSD ? (prev.totalTaskDays || 0) + 1 : (prev.totalTaskDays || 0);

      // Every 8th task gives a guaranteed bonus
      const taskCount = prev.hist.length + 1;
      const bonusHP = (taskCount % 8 === 0) ? 20 : 0;
      const bonusMin = 0;

      const chestEarned = all && CHEST_MILESTONES.includes(newSD as typeof CHEST_MILESTONES[number]) && !prev.chestMilestone;
      if (chestEarned) setTimeout(() => setShowChest(true), all ? 2500 : 800);

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
      const newUnlocksFromBoss: string[] = [];
      let bossDefeatData: { bossName: string; bossIcon: string; hp: number; item: { name: string; icon: string } | null } | null = null;
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
          // Boss loot: deterministic rotation based on trophies count
          const allItems = [...(SHOP_ITEMS.hero || []), ...(SHOP_ITEMS.cat || []), ...(SHOP_ITEMS.room || [])];
          const locked = allItems.filter(item => !(prev.purchased || []).includes(item.id) && !newUnlocksFromBoss.includes(item.id));
          let lootItem: { id: string; name: string; icon: string } | null = null;
          if (locked.length > 0) {
            const lootIdx = (prev.bossTrophies || []).length % locked.length;
            const loot = locked[lootIdx];
            newUnlocksFromBoss.push(loot.id);
            lootItem = loot;
          }
          // Store boss defeat reward data for BossChest overlay
          bossDefeatData = {
            bossName: bd?.name || "Boss",
            bossIcon: bd?.icon || "\u{1F47E}",
            hp: bossRewardHP,
            item: lootItem ? { name: lootItem.name, icon: lootItem.icon } : null,
          };
          // SFX is handled by BossChest component
        }
      }

      // Companion care through quest completion
      // Morning tasks restore hunger, evening tasks restore energy, any task boosts happy
      const isEvening = q.anchor === "evening";
      const companionHungerGain = !isEvening ? 5 : 2;   // morning tasks feed more
      const companionEnergyGain = isEvening ? 5 : 2;    // evening tasks rest more
      const companionHappyGain = 3;                       // every task makes companion happy
      const newHunger = Math.min(100, (prev.catHunger || 0) + companionHungerGain);
      const newEnergy = Math.min(100, (prev.catEnergy || 0) + companionEnergyGain);
      const newHappy = Math.min(100, (prev.catHappy || 0) + companionHappyGain);

      // Cat evolution
      const catEvoGain = all ? 3 : 1;
      const newCatEvo = (prev.catEvo || 0) + catEvoGain;
      const prevCatStage = getCatStage(prev.catEvo || 0);
      const newCatStage = getCatStage(newCatEvo);
      if (newCatStage > prevCatStage) setTimeout(() => SFX.play("evolve"), 800);

      // Evolution event for celebration overlay
      // Check if a new boss tier unlocked with this evolution
      const prevMaxTier = getTierForStage(prevCatStage);
      const newMaxTier = getTierForStage(newCatStage);
      const bossUnlock = newMaxTier?.id !== prevMaxTier?.id ? newMaxTier?.name : undefined;

      const evolutionEvent = newCatStage > prevCatStage
        ? { oldStage: prevCatStage, newStage: newCatStage, newBossTier: bossUnlock }
        : null;

      const totalHP = earned + bonusHP + wmBonusHP + bossRewardHP;
      // Dragon eggs: 1 per task, +3 bonus for all-done, boss gives extra
      const eggsEarned = 1 + (all ? 3 : 0) + (bossRewardHP > 0 ? 5 : 0);
      const result: GameState = {
        ...prev, quests: nq2,
        xp: prev.xp + totalHP,
        coins: prev.coins + totalHP,
        drachenEier: (prev.drachenEier || 0) + eggsEarned,
        dt: prev.dt + q.minutes + bonusMin, sd: newSD,
        hist: [...prev.hist, { id, d: Date.now() }], sm, bestStreak: newBest,
        chestMilestone: chestEarned ? newSD : prev.chestMilestone,
        xpBoost: all ? false : prev.xpBoost,
        weeklyProgress: wp,
        weeklyMissionsCompleted: wmcCount,
        boss: bossUpdate, bossTrophies: trophies,
        catEvo: newCatEvo,
        catHunger: newHunger, catHappy: newHappy, catEnergy: newEnergy,
        bossDefeatReward: bossDefeatData,
        evolutionEvent,
        totalTaskDays: newTotalDays,
      };

      // Egg hatching progress — each task adds fixed +25 toward hatching
      if (result.eggType && !result.eggHatched) {
        result.eggProgress = Math.min(100, (result.eggProgress || 0) + 25);
        if (result.eggProgress >= 100) {
          result.eggHatched = true;
          // Deterministic variant from the egg type based on task count
          const variantMaps: Record<string, string[]> = {
            dragon: ["fire", "ice", "shadow", "gold"],
            wolf: ["forest", "snow", "night", "fire"],
            phoenix: ["sun", "storm", "rose", "star"],
          };
          const variants = variantMaps[result.eggType] || ["fire"];
          result.catVariant = variants[prev.hist.length % variants.length];
          result.companionType = result.eggType;
          setTimeout(() => SFX.play("celeb"), 500);
        }
      }

      // Boss loot unlocks
      if (newUnlocksFromBoss.length > 0) {
        result.purchased = [...(result.purchased || []), ...newUnlocksFromBoss];
      }

      // Check passive milestone unlocks
      const newUnlocks = checkUnlocks(result);
      if (newUnlocks.length > 0) {
        result.purchased = [...(result.purchased || []), ...newUnlocks];
      }

      return result;
    });
  }, [setState, setCeleb, setShowVictory, setShowChest]);

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


  const collectMemory = useCallback((reward: { xp: number; coins: number }) => {
    setState(prev => prev ? { ...prev, xp: prev.xp + 5, coins: prev.coins + 5, memoryPlayed: true } : prev);
    setShowMemory(false);
  }, [setState, setShowMemory]);

  const collectChest = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const streakDays = prev.sd || 0;
      const milestone = MILESTONE_REWARDS[streakDays];
      const u = { ...prev, chestMilestone: null };
      if (milestone && !u.purchased.includes(milestone.itemId)) {
        u.purchased = [...u.purchased, milestone.itemId];
      }
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
      const habits = prev.dailyHabits || {};
      if (habits[habitId]) return prev; // already done

      // Look up reward from config
      const cfg = prev.familyConfig || { dailyHabits: [
        { id: 'habit_vitaminD', xp: 5 },
        { id: 'habit_sibling', xp: 10 },
      ] };
      // Support both old IDs ("vitaminD"/"brother") and new IDs ("habit_vitaminD"/"habit_sibling")
      const habitDef = (cfg.dailyHabits || []).find(h => h.id === habitId);
      const reward = habitDef?.xp || 5;

      SFX.play("pop");
      return {
        ...prev,
        dailyHabits: { ...habits, [habitId]: true },
        ...addHP(prev, reward),
      };
    });
  }, [setState]);

  // ── NEW: Belohnungsbank ──

  const redeemReward = useCallback((belohnungId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const bel = (prev.belohnungen || []).find(b => b.id === belohnungId);
      if (!bel || !bel.active) return prev;
      // Daily game limit: max 2 per day
      if (belohnungId === "bel_game20" && (prev.dailyGameRedemptions || 0) >= 2) return prev;
      const now = new Date();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const isFreeDay = isWeekend || prev.vacMode;
      // Time-of-day lock (looser on weekends/vacations)
      const timeLimit = isFreeDay ? (bel.availableAfterFree || bel.availableAfter) : bel.availableAfter;
      if (timeLimit) {
        const [h, m] = timeLimit.split(":").map(Number);
        if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m)) return prev;
      }
      // Weekend/vacation pricing
      const effectiveCost = (isFreeDay && bel.weekendCost) ? bel.weekendCost : bel.cost;
      const isEggs = bel.currency === "eggs";
      const balance = isEggs ? (prev.drachenEier || 0) : prev.coins;
      if (balance < effectiveCost) return prev;
      SFX.play("buy");
      // Launch mini-games
      if (belohnungId === "bel_memory") setTimeout(() => setShowMemory(true), 300);
      // Evo boost: add +5 to catEvo
      if (belohnungId === "bel_evoboost") {
        return {
          ...prev,
          coins: prev.coins - effectiveCost,
          catEvo: (prev.catEvo || 0) + 5,
          belohnungenLog: [...(prev.belohnungenLog || []), { id: belohnungId, date: new Date().toISOString() }],
        };
      }
      return {
        ...prev,
        coins: isEggs ? prev.coins : prev.coins - effectiveCost,
        drachenEier: isEggs ? (prev.drachenEier || 0) - effectiveCost : (prev.drachenEier || 0),
        dailyGameRedemptions: belohnungId === "bel_game20" ? (prev.dailyGameRedemptions || 0) + 1 : (prev.dailyGameRedemptions || 0),
        belohnungenLog: [...(prev.belohnungenLog || []), { id: belohnungId, date: new Date().toISOString() }],
      };
    });
  }, [setState, setShowMemory]);

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

  // ── NEW: Login bonus ──

  const collectLoginBonus = useCallback(() => {
    setState(prev => {
      if (!prev || prev.loginBonusClaimed) return prev;
      SFX.play("pop");
      return {
        ...prev,
        loginBonusClaimed: true,
        xp: prev.xp + 5,
        coins: prev.coins + 5,
      };
    });
  }, [setState]);

  // ── NEW: Weekly lunch ──

  const updateWeeklyLunch = useCallback((lunch: Record<string, string>) => {
    setState(prev => prev ? { ...prev, weeklyLunch: lunch } : prev);
  }, [setState]);

  // ── Boss reward overlay ──

  const clearBossReward = useCallback(() => {
    setState(prev => prev ? { ...prev, bossDefeatReward: null } : prev);
  }, [setState]);

  // ── Evolution celebration overlay ──

  const clearEvolution = useCallback(() => {
    setState(prev => prev ? { ...prev, evolutionEvent: null } : prev);
  }, [setState]);

  // ── NEW: Quest Chains ──

  const completeChainStep = useCallback((chainId: string, stepId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const chains = (prev.questChains || []).map(c => {
        if (c.id !== chainId) return c;
        const steps = c.steps.map(s => s.id === stepId ? { ...s, done: true } : s);
        const allDone = steps.every(s => s.done);
        if (allDone && !c.completed) {
          SFX.play("celeb");
          setCeleb(true);
          return { ...c, steps, completed: true };
        }
        SFX.play("pop");
        return { ...c, steps };
      });
      // Award HP if chain just completed
      const chain = chains.find(c => c.id === chainId);
      const wasCompleted = (prev.questChains || []).find(c => c.id === chainId)?.completed;
      const justCompleted = chain?.completed && !wasCompleted;
      return {
        ...prev,
        questChains: chains,
        xp: justCompleted ? prev.xp + (chain?.hp || 0) : prev.xp,
        coins: justCompleted ? prev.coins + (chain?.hp || 0) : prev.coins,
      };
    });
  }, [setState, setCeleb]);

  const addQuestChain = useCallback((chain: import('../types').QuestChain) => {
    setState(prev => prev ? { ...prev, questChains: [...(prev.questChains || []), chain] } : prev);
  }, [setState]);

  const removeQuestChain = useCallback((chainId: string) => {
    setState(prev => prev ? { ...prev, questChains: (prev.questChains || []).filter(c => c.id !== chainId) } : prev);
  }, [setState]);

  // ── Gear ──

  const equipGear = useCallback((slot: string, itemId: string) => {
    setState(prev => {
      if (!prev) return prev;
      // Must own the item
      if (!(prev.purchased || []).includes(itemId)) return prev;
      SFX.play("pop");
      return {
        ...prev,
        equippedGear: { ...(prev.equippedGear || {}), [slot]: itemId },
      };
    });
  }, [setState]);

  const unequipGear = useCallback((slot: string) => {
    setState(prev => {
      if (!prev) return prev;
      const gear = { ...(prev.equippedGear || {}) };
      delete gear[slot as keyof typeof gear];
      return { ...prev, equippedGear: gear };
    });
  }, [setState]);

  // ── Room Customization ──

  const setRoomTheme = useCallback((theme: Partial<{ wallColor: string; floorType: string; windowStyle: string }>) => {
    setState(prev => prev ? { ...prev, roomTheme: { ...(prev.roomTheme || { wallColor: "#F5EDE3", floorType: "wood", windowStyle: "standard" }), ...theme } } : prev);
  }, [setState]);

  // ── Export / Import ──

  const exportState = useCallback((currentState: GameState) => {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ronki-backup-${new Date().toISOString().slice(0, 10)}.json`;
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

  // ── NEW: Journal tomorrow commitment ──

  const commitTomorrow = useCallback((commitment: { type: string; text: string }) => {
    setState(prev => prev ? { ...prev, tomorrowCommitment: commitment } : prev);
  }, [setState]);

  // ── NEW: Water drinking tracker ──

  const drinkWater = useCallback(() => {
    setState(prev => {
      if (!prev || (prev.dailyWaterCount || 0) >= 6) return prev;
      SFX.play("pop");
      return { ...prev, dailyWaterCount: (prev.dailyWaterCount || 0) + 1, ...addHP(prev, 2) };
    });
  }, [setState]);

  return {
    complete, addQuest, completeComeback, rmQuest,
    togVac, resetDay, resetAll,
    setMood, setJournal, setJAnswer, toggleRainbow,
    collectMemory, collectChest,
    feedCat, petCat, playCat,
    completeHabit, redeemReward, updateBelohnungen,
    addSpecialMission, completeSpecialMission, removeSpecialMission,
    updateWeeklyLunch, collectLoginBonus,
    clearBossReward, clearEvolution,
    completeChainStep, addQuestChain, removeQuestChain,
    equipGear, unequipGear,
    setRoomTheme,
    exportState, importState,
    commitTomorrow, drinkWater,
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
