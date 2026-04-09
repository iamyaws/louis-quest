import { useState, useEffect, useRef } from 'react';
import {
  WEEKLY_MISSIONS, MAX_MONTHLY_FREEZES, REWARDS, BOSSES, DEFAULT_BELOHNUNGEN,
} from '../constants';
import { buildDay } from '../utils/helpers';
import storage from '../utils/storage';
import type { GameState, Hero } from '../types';

const SAVE_DEBOUNCE_MS = 400;

export default function useGamePersistence() {
  const [state, setState] = useState<GameState | null>(null);
  const [boarding, setBoarding] = useState<boolean | null>(null);

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

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!state) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => storage.save(state), SAVE_DEBOUNCE_MS);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  return { state, setState, boarding, setBoarding };
}

function applyDayTransition(p: GameState, today: string): void {
  const todayD = new Date();
  todayD.setHours(0, 0, 0, 0);
  const lastD = new Date(p.lastDate);
  lastD.setHours(0, 0, 0, 0);
  const dayGap = Math.round((todayD.getTime() - lastD.getTime()) / (1000 * 60 * 60 * 24));

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
  // Cat care daily reset + stat decay
  p.catFed = false; p.catPetted = false; p.catPlayed = false;
  p.catHunger = Math.max(0, (p.catHunger ?? 100) - 30);
  p.catHappy = Math.max(0, (p.catHappy ?? 100) - 25);
  p.catEnergy = Math.max(0, (p.catEnergy ?? 100) - 20);
  // Daily habits reset
  p.dailyVitaminD = false;
  p.dailyBrother = false;
  // Clean up completed special missions
  if (p.specialMissions) {
    p.specialMissions = p.specialMissions.filter(m => !m.done);
  }

  const weekStart = p.weekStart ? new Date(p.weekStart) : new Date();
  const daysSinceStart = Math.floor((new Date().getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceStart >= 7 || !p.weeklyMission) {
    const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
    p.weeklyMission = wm.id;
    p.weeklyProgress = 0;
    p.weekStart = today;
    // Spawn new weekly boss
    const b = BOSSES[Math.floor(Math.random() * BOSSES.length)];
    p.boss = { id: b.id, hp: b.hp, maxHp: b.hp };
  }

  if (!p.graduated) p.graduated = [];
  Object.entries(p.sm || {}).forEach(([qid, streak]) => {
    if (streak >= 30 && !p.graduated.includes(qid)) p.graduated.push(qid);
  });
}

function applyDefaults(p: GameState): void {
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
  // Cat & boss migrations
  if (p.catEvo === undefined) p.catEvo = 0;
  if (p.catHunger === undefined) p.catHunger = 100;
  if (p.catHappy === undefined) p.catHappy = 100;
  if (p.catEnergy === undefined) p.catEnergy = 100;
  if (p.catFed === undefined) p.catFed = false;
  if (p.catPetted === undefined) p.catPetted = false;
  if (p.catPlayed === undefined) p.catPlayed = false;
  if (!p.boss) { const b = BOSSES[Math.floor(Math.random() * BOSSES.length)]; p.boss = { id: b.id, hp: b.hp, maxHp: b.hp }; }
  if (!p.bossTrophies) p.bossTrophies = [];
  // ── New field defaults (v4 migration) ──
  if (p.dailyVitaminD === undefined) p.dailyVitaminD = false;
  if (p.dailyBrother === undefined) p.dailyBrother = false;
  if (!p.belohnungen) p.belohnungen = DEFAULT_BELOHNUNGEN;
  if (!p.belohnungenLog) p.belohnungenLog = [];
  if (!p.specialMissions) p.specialMissions = [];
  // Add Liam's birthday gift mission if not already there and date hasn't passed
  if (!p.specialMissions.some(m => m.id === "sm_liam_bday") && new Date() < new Date("2026-04-27")) {
    p.specialMissions.push({ id: "sm_liam_bday", name: "Geburtstagsgeschenk f\u00FCr Liam kaufen", emoji: "\uD83C\uDF81", hp: 50, done: false });
  }
  if (!p.weeklyLunch) p.weeklyLunch = {};
  if (p.weeklyMissionsCompleted === undefined) p.weeklyMissionsCompleted = 0;
}

interface OnboardData {
  hero: Hero;
  catVariant: string;
  catName: string;
  startXP?: number;
  startCoins?: number;
}

export function createInitialState({ hero, catVariant, catName, startXP, startCoins }: OnboardData): GameState {
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
    catEvo: 0, catHunger: 100, catHappy: 100, catEnergy: 100,
    catFed: false, catPetted: false, catPlayed: false,
    boss: (() => { const b = BOSSES[Math.floor(Math.random() * BOSSES.length)]; return { id: b.id, hp: b.hp, maxHp: b.hp }; })(),
    bossTrophies: [],
    // New v4 fields
    dailyVitaminD: false, dailyBrother: false,
    belohnungen: DEFAULT_BELOHNUNGEN,
    belohnungenLog: [],
    specialMissions: [],
    weeklyLunch: {},
    weeklyMissionsCompleted: 0,
  };
}
