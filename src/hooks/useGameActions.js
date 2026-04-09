import { useCallback } from 'react';
import {
  RARE_DROPS, RARE_DROP_CHANCE, CHEST_MILESTONES,
  WEEKLY_MISSIONS,
} from '../constants';
import { getLevel, buildDay } from '../utils/helpers';
import storage from '../utils/storage';
import SFX from '../utils/sfx';

/**
 * All game state mutation actions.
 * Receives setState and a bag of UI side-effect callbacks.
 */
export default function useGameActions(setState, uiCallbacks) {
  const {
    setCeleb, setShowVictory, setShowChest, setRareDrop,
    setShowWheel, setShowMemory,
  } = uiCallbacks;

  const complete = useCallback(id => {
    setState(prev => {
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

      // Rare drop
      const isRare = Math.random() < RARE_DROP_CHANCE;
      if (isRare) {
        const drop = RARE_DROPS[Math.floor(Math.random() * RARE_DROPS.length)];
        setTimeout(() => setRareDrop(drop), 600);
      }

      // Chest milestone
      const chestEarned = all && CHEST_MILESTONES.includes(newSD) && !prev.chestMilestone;
      if (chestEarned) setTimeout(() => setShowChest(true), all ? 2500 : 800);

      // Rare drop rewards
      let bonusXP = 0, bonusCoins = 0, bonusMin = 0;
      if (isRare) {
        const drop = RARE_DROPS[Math.floor(Math.random() * RARE_DROPS.length)];
        if (drop.type === "xp") bonusXP = drop.amount;
        if (drop.type === "coins") bonusCoins = drop.amount;
        if (drop.type === "minutes") bonusMin = drop.amount;
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

  const addQuest = useCallback((nq, resetName) => {
    if (!nq.name.trim()) return;
    setState(p => ({
      ...p,
      quests: [...p.quests, {
        id: "c_" + Date.now(), name: nq.name.trim(), icon: nq.icon,
        anchor: nq.anchor, xp: nq.xp, minutes: nq.minutes, done: false, streak: 0,
      }],
    }));
    resetName();
  }, [setState]);

  const completeComeback = useCallback(() => {
    SFX.play("celeb");
    setCeleb(true);
    setState(p => ({ ...p, comebackActive: false, xp: p.xp + 15, coins: p.coins + 10 }));
  }, [setState, setCeleb]);

  const rmQuest = useCallback(id => {
    setState(p => ({ ...p, quests: p.quests.filter(q => q.id !== id) }));
  }, [setState]);

  const togVac = useCallback(() => {
    setState(p => {
      const nv = !p.vacMode;
      return { ...p, vacMode: nv, quests: buildDay(nv).map(q => ({ ...q, streak: (p.sm || {})[q.id] || 0 })), dt: 0 };
    });
  }, [setState]);

  const resetDay = useCallback(() => {
    setState(p => ({ ...p, quests: p.quests.map(q => ({ ...q, done: false })), dt: 0, lastDate: new Date().toDateString() }));
  }, [setState]);

  const resetAll = useCallback(() => {
    storage.clear();
    setState(null);
  }, [setState]);

  const buyItem = useCallback((id, cost) => {
    setState(p => {
      if (p.coins < cost || (p.purchased || []).includes(id)) return p;
      SFX.play("buy");
      return { ...p, coins: p.coins - cost, purchased: [...(p.purchased || []), id] };
    });
  }, [setState]);

  const setMood = useCallback((period, val) => {
    setState(p => ({ ...p, [period]: val }));
  }, [setState]);

  const setJournal = useCallback((val) => {
    setState(p => ({ ...p, journal: val }));
  }, [setState]);

  const setJAnswer = useCallback((qid, val) => {
    setState(p => ({ ...p, jAnswers: { ...(p.jAnswers || {}), [qid]: val } }));
  }, [setState]);

  const toggleRainbow = useCallback((idx) => {
    setState(p => {
      const r = [...(p.rainbow || [false, false, false, false, false, false])];
      r[idx] = !r[idx];
      const allDone = r.every(Boolean);
      return {
        ...p, rainbow: r,
        xp: allDone && !p.rainbow.every(Boolean) ? p.xp + 25 : p.xp,
        coins: allDone && !p.rainbow.every(Boolean) ? p.coins + 20 : p.coins,
      };
    });
  }, [setState]);

  const collectWheel = useCallback((result) => {
    setState(p => {
      let u = { ...p, wheelSpun: true };
      if (result.type === "coins") u.coins += result.amount;
      if (result.type === "xp") u.xp += result.amount;
      if (result.type === "minutes") u.dt += result.amount;
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

  const collectMemory = useCallback((reward) => {
    setState(p => ({ ...p, xp: p.xp + reward.xp, coins: p.coins + reward.coins, memoryPlayed: true }));
    setShowMemory(false);
  }, [setState, setShowMemory]);

  const collectChest = useCallback((reward) => {
    setState(p => {
      let u = { ...p, chestMilestone: null };
      if (reward.type === "coins") u.coins += reward.amount;
      if (reward.type === "xp") u.xp += reward.amount;
      if (reward.type === "minutes") u.dt += reward.amount;
      if (reward.type === "item" && !u.purchased.includes(reward.id)) u.purchased = [...u.purchased, reward.id];
      if (reward.type === "xpboost") u.xpBoost = true;
      return u;
    });
    setShowChest(false);
  }, [setState, setShowChest]);

  const exportState = useCallback((state) => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `herodex-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importState = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data && data.hero && data.quests) {
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
