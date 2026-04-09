import React, { useState, useEffect, useCallback } from 'react';
import {
  T, REWARDS, WEEKLY_MISSIONS, RARE_DROPS, RARE_DROP_CHANCE,
  CHEST_MILESTONES, CHEST_REWARDS, SCHOOL_QUESTS, VACATION_QUESTS,
  MAX_MONTHLY_FREEZES,
} from './constants';
import { getLevel, getLvlProg, buildDay, getMood, getDayName } from './utils/helpers';
import storage from './utils/storage';
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

export default function App() {
  const [state, setState] = useState(null);
  const [boarding, setBoarding] = useState(null);
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

  // ── Load state ──
  useEffect(() => {
    const p = storage.load();
    if (p) {
      const today = new Date().toDateString();
      if (p.lastDate !== today) {
        // ── Streak Recovery ──
        const todayD = new Date(); todayD.setHours(0, 0, 0, 0);
        const lastD = new Date(p.lastDate); lastD.setHours(0, 0, 0, 0);
        const dayGap = Math.round((todayD - lastD) / (1000 * 60 * 60 * 24));
        const curMonth = `${todayD.getFullYear()}-${todayD.getMonth()}`;
        if ((p.lastFreezeMonth || "") !== curMonth) {
          p.streakFreezes = MAX_MONTHLY_FREEZES;
          p.freezesUsedThisMonth = 0;
          p.lastFreezeMonth = curMonth;
        }
        p.freezeUsedToday = false;
        if (dayGap >= 2) {
          const missedDays = dayGap - 1;
          if ((p.sd || 0) > 0) {
            const avail = p.streakFreezes || 0;
            if (avail >= missedDays) {
              p.streakFreezes = avail - missedDays;
              p.freezesUsedThisMonth = (p.freezesUsedThisMonth || 0) + missedDays;
              p.freezeUsedToday = true;
            } else {
              if (avail > 0) { p.streakFreezes = 0; p.freezesUsedThisMonth = (p.freezesUsedThisMonth || 0) + avail; }
              p.bestStreak = Math.max(p.bestStreak || 0, p.sd || 0);
              p.sd = 0;
              p.comebackActive = true;
            }
          } else {
            p.comebackActive = true;
          }
        } else {
          p.comebackActive = false;
        }

        p.quests = buildDay(p.vacMode).map(q => ({ ...q, streak: (p.sm || {})[q.id] || 0 }));
        p.lastDate = today; p.dt = 0; p.moodAM = null; p.moodPM = null;
        p.journal = ""; p.jAnswers = {};
        p.rainbow = [false, false, false, false, false, false];
        p.wheelSpun = false; p.chestMilestone = null;
        const weekStart = p.weekStart ? new Date(p.weekStart) : new Date();
        const daysSinceStart = Math.floor((new Date() - weekStart) / (1000 * 60 * 60 * 24));
        if (daysSinceStart >= 7 || !p.weeklyMission) {
          const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
          p.weeklyMission = wm.id; p.weeklyProgress = 0; p.weekStart = today;
        }
        if (!p.graduated) p.graduated = [];
        Object.entries(p.sm || {}).forEach(([qid, streak]) => {
          if (streak >= 30 && !p.graduated.includes(qid)) p.graduated.push(qid);
        });
      }
      if (!p.purchased) p.purchased = [];
      if (!p.rainbow) p.rainbow = [false, false, false, false, false, false];
      if (p.moodAM === undefined) p.moodAM = null;
      if (p.moodPM === undefined) p.moodPM = null;
      if (p.journal === undefined) p.journal = "";
      if (!p.jAnswers) p.jAnswers = {};
      if (p.wheelSpun === undefined) p.wheelSpun = false;
      if (p.xpBoost === undefined) p.xpBoost = false;
      if (p.streakFreezes === undefined) p.streakFreezes = MAX_MONTHLY_FREEZES;
      if (p.freezesUsedThisMonth === undefined) p.freezesUsedThisMonth = 0;
      if (!p.lastFreezeMonth) p.lastFreezeMonth = "";
      if (p.comebackActive === undefined) p.comebackActive = false;
      if (p.bestStreak === undefined) p.bestStreak = p.sd || 0;
      if (p.freezeUsedToday === undefined) p.freezeUsedToday = false;
      if (!p.weeklyMission) {
        const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
        p.weeklyMission = wm.id; p.weeklyProgress = 0; p.weekStart = new Date().toDateString();
      }
      if (!p.graduated) p.graduated = [];
      setState(p); setBoarding(false);
    } else {
      setBoarding(true);
    }
  }, []);

  // ── Persist ──
  useEffect(() => { if (state) storage.save(state); }, [state]);

  // ── Onboarding complete ──
  const onBoard = ({ hero, catVariant, catName, startXP, startCoins }) => {
    const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
    setState({
      hero, catVariant, catName, xp: startXP || 0, coins: startCoins || 0,
      quests: buildDay(false), rewards: REWARDS, acc: [], sd: 0,
      lastDate: new Date().toDateString(), dt: 0, hist: [], vacMode: false,
      sm: {}, roomItems: [], purchased: [], moodAM: null, moodPM: null,
      journal: "", jAnswers: {}, rainbow: [false, false, false, false, false, false],
      wheelSpun: false, chestMilestone: null, xpBoost: false,
      weeklyMission: wm.id, weeklyProgress: 0, weekStart: new Date().toDateString(),
      graduated: [], streakFreezes: MAX_MONTHLY_FREEZES, freezesUsedThisMonth: 0,
      lastFreezeMonth: `${new Date().getFullYear()}-${new Date().getMonth()}`,
      comebackActive: false, bestStreak: 0, freezeUsedToday: false,
    });
    setBoarding(false);
  };

  // ── Quest complete ──
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
  }, []);

  // ── Actions ──
  const addQuest = () => {
    if (!nq.name.trim()) return;
    setState(p => ({ ...p, quests: [...p.quests, { id: "c_" + Date.now(), name: nq.name.trim(), icon: nq.icon, anchor: nq.anchor, xp: nq.xp, minutes: nq.minutes, done: false, streak: 0 }] }));
    setNq(n => ({ ...n, name: "" }));
  };
  const completeComeback = useCallback(() => {
    SFX.play("celeb"); setCeleb(true);
    setState(p => ({ ...p, comebackActive: false, xp: p.xp + 15, coins: p.coins + 10 }));
  }, []);
  const rmQuest = id => setState(p => ({ ...p, quests: p.quests.filter(q => q.id !== id) }));
  const togVac = () => setState(p => { const nv = !p.vacMode; return { ...p, vacMode: nv, quests: buildDay(nv).map(q => ({ ...q, streak: (p.sm || {})[q.id] || 0 })), dt: 0 }; });
  const resetDay = () => setState(p => ({ ...p, quests: p.quests.map(q => ({ ...q, done: false })), dt: 0, lastDate: new Date().toDateString() }));
  const resetAll = () => { storage.clear(); setState(null); setBoarding(true); };
  const buyItem = (id, cost) => { if (state.coins < cost || (state.purchased || []).includes(id)) return; SFX.play("buy"); setState(p => ({ ...p, coins: p.coins - cost, purchased: [...(p.purchased || []), id] })); };
  const setMood = (period, val) => setState(p => ({ ...p, [period]: val }));
  const setJournal = (val) => setState(p => ({ ...p, journal: val }));
  const setJAnswer = (qid, val) => setState(p => ({ ...p, jAnswers: { ...(p.jAnswers || {}), [qid]: val } }));
  const toggleRainbow = (idx) => setState(p => {
    const r = [...(p.rainbow || [false, false, false, false, false, false])];
    r[idx] = !r[idx];
    const allDone = r.every(Boolean);
    return { ...p, rainbow: r, xp: allDone && !p.rainbow.every(Boolean) ? p.xp + 25 : p.xp, coins: allDone && !p.rainbow.every(Boolean) ? p.coins + 20 : p.coins };
  });
  const collectWheel = (result) => {
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
  };
  const collectChest = (reward) => {
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
  };

  // ── Loading / Onboarding ──
  if (boarding === null) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, color: T.textPrimary, fontFamily: "'Nunito',sans-serif" }}>Laden...</div>;
  if (boarding) return <Onboarding onComplete={onBoard} />;
  if (!state) return null;

  // ── Computed ──
  const level = getLevel(state.xp);
  const xpP = getLvlProg(state.xp);
  const done = state.quests.filter(q => q.done).length;
  const total = state.quests.length;
  const allDone = done === total && total > 0;
  const pct = total > 0 ? done / total : 0;
  const mood = getMood(allDone, pct);
  const dayN = getDayName();
  const byA = {};
  state.quests.forEach(q => { if (!byA[q.anchor]) byA[q.anchor] = []; byA[q.anchor].push(q); });

  return (
    <>
      {/* Overlays */}
      <Celebration active={celeb} onDone={() => setCeleb(false)} />
      <RareDropToast drop={rareDrop} onDone={() => setRareDrop(null)} />
      {showWheel && <SpinWheel onResult={collectWheel} />}
      {showChest && <SurpriseChest onOpen={collectChest} streakDays={state.sd} />}
      {pinShow && <PinModal pin={pin} setPin={setPin} onSuccess={() => { setPMode(true); setPinShow(false); }} onClose={() => { setPinShow(false); setPin(""); }} />}
      {showVictory && <VictoryScreen state={state} level={level} done={done} total={total} onClose={() => setShowVictory(false)} onSpinWheel={() => { setShowVictory(false); setShowWheel(true); }} />}

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", color: T.textPrimary }}>
        {view === "hub" && <Hub state={state} level={level} xpP={xpP} done={done} total={total} allDone={allDone} pct={pct} mood={mood} dayN={dayN} setQuestOpen={setQuestOpen} setView={setView} setMood={setMood} setCeleb={setCeleb} pMode={pMode} setPMode={setPMode} setPinShow={setPinShow} />}
        {view === "time" && <TimeBank state={state} allDone={allDone} done={done} total={total} setView={setView} />}
        {view === "stats" && <Achievements state={state} level={level} setView={setView} />}
        {view === "room" && <Room state={state} level={level} mood={mood} setView={setView} setShopTab={setShopTab} />}
        {view === "shop" && <Shop state={state} shopTab={shopTab} setShopTab={setShopTab} buyItem={buyItem} setView={setView} />}
        {view === "journal" && <Journal state={state} done={done} total={total} setView={setView} setMood={setMood} setJournal={setJournal} setJAnswer={setJAnswer} />}
        {questOpen && <QuestBoard state={state} allDone={allDone} done={done} total={total} pct={pct} byA={byA} pMode={pMode} complete={complete} completeComeback={completeComeback} rmQuest={rmQuest} toggleRainbow={toggleRainbow} setMood={setMood} setQuestOpen={setQuestOpen} togVac={togVac} resetDay={resetDay} resetAll={resetAll} addQuest={addQuest} nq={nq} setNq={setNq} level={level} />}
      </div>
    </>
  );
}
