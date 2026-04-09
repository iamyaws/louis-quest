import { useState, useEffect, useRef } from 'react';
import {
  WEEKLY_MISSIONS, MAX_MONTHLY_FREEZES, REWARDS,
} from '../constants';
import { buildDay } from '../utils/helpers';
import storage from '../utils/storage';

const SAVE_DEBOUNCE_MS = 400;

/**
 * Handles loading game state from storage, day transitions
 * (streak recovery, weekly missions), default field initialization,
 * and auto-persisting state on change.
 */
export default function useGamePersistence() {
  const [state, setState] = useState(null);
  const [boarding, setBoarding] = useState(null); // null=loading, true=onboarding, false=ready

  // ── Load state on mount ──
  useEffect(() => {
    storage.load().then(p => {
      if (p) {
        const today = new Date().toDateString();
        if (p.lastDate !== today) {
          applyDayTransition(p, today);
        }
        applyDefaults(p);
        setState(p);
        setBoarding(false);
      } else {
        setBoarding(true);
      }
    });
  }, []);

  // ── Debounced auto-persist ──
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => storage.save(state), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  return { state, setState, boarding, setBoarding };
}

/**
 * Handles the logic for when a new day starts:
 * streak recovery, freeze tracking, quest reset, weekly missions, graduation.
 */
function applyDayTransition(p, today) {
  const todayD = new Date();
  todayD.setHours(0, 0, 0, 0);
  const lastD = new Date(p.lastDate);
  lastD.setHours(0, 0, 0, 0);
  const dayGap = Math.round((todayD - lastD) / (1000 * 60 * 60 * 24));

  // Monthly freeze reset
  const curMonth = `${todayD.getFullYear()}-${todayD.getMonth()}`;
  if ((p.lastFreezeMonth || "") !== curMonth) {
    p.streakFreezes = MAX_MONTHLY_FREEZES;
    p.freezesUsedThisMonth = 0;
    p.lastFreezeMonth = curMonth;
  }
  p.freezeUsedToday = false;

  // Streak recovery
  if (dayGap >= 2) {
    const missedDays = dayGap - 1;
    if ((p.sd || 0) > 0) {
      const avail = p.streakFreezes || 0;
      if (avail >= missedDays) {
        p.streakFreezes = avail - missedDays;
        p.freezesUsedThisMonth = (p.freezesUsedThisMonth || 0) + missedDays;
        p.freezeUsedToday = true;
      } else {
        if (avail > 0) {
          p.streakFreezes = 0;
          p.freezesUsedThisMonth = (p.freezesUsedThisMonth || 0) + avail;
        }
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

  // Reset daily state
  p.quests = buildDay(p.vacMode).map(q => ({ ...q, streak: (p.sm || {})[q.id] || 0 }));
  p.lastDate = today;
  p.dt = 0;
  p.moodAM = null;
  p.moodPM = null;
  p.journal = "";
  p.jAnswers = {};
  p.rainbow = [false, false, false, false, false, false];
  p.wheelSpun = false;
  p.memoryPlayed = false;
  p.chestMilestone = null;

  // Weekly mission rotation
  const weekStart = p.weekStart ? new Date(p.weekStart) : new Date();
  const daysSinceStart = Math.floor((new Date() - weekStart) / (1000 * 60 * 60 * 24));
  if (daysSinceStart >= 7 || !p.weeklyMission) {
    const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
    p.weeklyMission = wm.id;
    p.weeklyProgress = 0;
    p.weekStart = today;
  }

  // Graduation check
  if (!p.graduated) p.graduated = [];
  Object.entries(p.sm || {}).forEach(([qid, streak]) => {
    if (streak >= 30 && !p.graduated.includes(qid)) p.graduated.push(qid);
  });
}

/**
 * Ensures all expected fields exist with defaults (handles older save formats).
 */
function applyDefaults(p) {
  if (!p.purchased) p.purchased = [];
  if (!p.rainbow) p.rainbow = [false, false, false, false, false, false];
  if (p.moodAM === undefined) p.moodAM = null;
  if (p.moodPM === undefined) p.moodPM = null;
  if (p.journal === undefined) p.journal = "";
  if (!p.jAnswers) p.jAnswers = {};
  if (p.wheelSpun === undefined) p.wheelSpun = false;
  if (p.memoryPlayed === undefined) p.memoryPlayed = false;
  if (p.xpBoost === undefined) p.xpBoost = false;
  if (p.streakFreezes === undefined) p.streakFreezes = MAX_MONTHLY_FREEZES;
  if (p.freezesUsedThisMonth === undefined) p.freezesUsedThisMonth = 0;
  if (!p.lastFreezeMonth) p.lastFreezeMonth = "";
  if (p.comebackActive === undefined) p.comebackActive = false;
  if (p.bestStreak === undefined) p.bestStreak = p.sd || 0;
  if (p.freezeUsedToday === undefined) p.freezeUsedToday = false;
  if (!p.weeklyMission) {
    const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
    p.weeklyMission = wm.id;
    p.weeklyProgress = 0;
    p.weekStart = new Date().toDateString();
  }
  if (!p.graduated) p.graduated = [];
}

/**
 * Creates the initial state for a freshly onboarded user.
 */
export function createInitialState({ hero, catVariant, catName, startXP, startCoins }) {
  const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
  return {
    hero, catVariant, catName, xp: startXP || 0, coins: startCoins || 0,
    quests: buildDay(false), rewards: REWARDS, acc: [], sd: 0,
    lastDate: new Date().toDateString(), dt: 0, hist: [], vacMode: false,
    sm: {}, roomItems: [], purchased: [], moodAM: null, moodPM: null,
    journal: "", jAnswers: {}, rainbow: [false, false, false, false, false, false],
    wheelSpun: false, memoryPlayed: false, chestMilestone: null, xpBoost: false,
    weeklyMission: wm.id, weeklyProgress: 0, weekStart: new Date().toDateString(),
    graduated: [], streakFreezes: MAX_MONTHLY_FREEZES, freezesUsedThisMonth: 0,
    lastFreezeMonth: `${new Date().getFullYear()}-${new Date().getMonth()}`,
    comebackActive: false, bestStreak: 0, freezeUsedToday: false,
  };
}
