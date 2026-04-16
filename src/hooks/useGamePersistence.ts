import { useState, useEffect, useRef } from 'react';
import {
  WEEKLY_MISSIONS, MAX_MONTHLY_FREEZES, REWARDS, BOSSES, BOSS_TIERS, DEFAULT_BELOHNUNGEN, isSchoolVacation,
  BIRTHDAY_QUEST_CHAIN, buildBirthdayQuestChain,
} from '../constants';
import { buildDay, getCatStage, getTierForStage } from '../utils/helpers';
import storage from '../utils/storage';
import type { GameState, Hero } from '../types';
import { DEFAULT_FAMILY_CONFIG } from '../types/familyConfig';

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
        // Vacation check only needed when day transition didn't run (same-day reload)
        if (p.lastDate === new Date().toDateString()) {
          const vacNow = isSchoolVacation(new Date());
          if (p.vacMode !== vacNow.isVacation) {
            p.vacMode = vacNow.isVacation;
            p.quests = buildDay(p.vacMode).map(q => ({ ...q, done: false, streak: (p.sm || {})[q.id] || 0 }));
          }
        }
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
    // No streak reset — streaks never break. Just show welcome-back message.
    p.comebackActive = true;
    p.totalTaskDays = (p.totalTaskDays || 0);
  } else {
    p.comebackActive = false;
  }

  // Auto-detect Bavaria school vacations
  const vacCheck = isSchoolVacation(new Date());
  p.vacMode = vacCheck.isVacation;

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
  p.bossDefeatReward = null;
  // Cat care daily reset (no stat decay — stats only increase from care actions)
  p.catFed = false; p.catPetted = false; p.catPlayed = false;
  // Daily habits reset (dynamic)
  p.dailyHabits = {};
  p.dailyVitaminD = false;
  p.dailyBrother = false;
  // Daily game redemption + water reset
  p.dailyGameRedemptions = 0;
  p.dailyWaterCount = 0;
  // Journal commitment: move today's commitment to yesterday
  p.yesterdayCommitment = p.tomorrowCommitment;
  p.tomorrowCommitment = null;
  // Login bonus: reset claimed flag, advance day in cycle
  p.loginBonusClaimed = false;
  p.loginBonusDay = (p.loginBonusDay || 0) % 7;
  // If they missed a day (dayGap >= 2), reset the cycle
  if (dayGap >= 2) {
    p.loginBonusDay = 0;
    p.loginBonusStreak = 0;
  }
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
  }

  // Daily boss — fresh boss every day
  const companionStage = getCatStage(p.catEvo || 0);
  const highestTier = getTierForStage(companionStage);
  const tierBosses = BOSSES.filter(b => b.tier === highestTier.id);
  const b = tierBosses[Math.floor(Math.random() * tierBosses.length)];
  p.boss = { id: b.id, hp: b.hp, maxHp: b.hp };

  if (!p.graduated) p.graduated = [];
  Object.entries(p.totalQuestCompletions || {}).forEach(([qid, total]) => {
    if (total >= 30 && !p.graduated.includes(qid)) p.graduated.push(qid);
  });
}

function applyDefaults(p: GameState): void {
  // v5 migration: migrate afternoon anchor to morning, add completions
  if (p.quests) {
    p.quests = p.quests.map(q => ({
      ...q,
      anchor: (q.anchor as string) === 'afternoon' ? 'morning' as const : q.anchor,
      completions: q.completions ?? (q.done ? (q.target || 1) : 0),
      order: q.order ?? 0,
    }));
  }
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
  if (p.bestStreak === undefined) p.bestStreak = 0;
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
  // ── Daily habits migration ──
  if (!p.dailyHabits) p.dailyHabits = {};
  // Migrate legacy booleans into dynamic map
  if (p.dailyVitaminD) p.dailyHabits['habit_vitaminD'] = true;
  if (p.dailyBrother) p.dailyHabits['habit_sibling'] = true;
  if (p.dailyVitaminD === undefined) p.dailyVitaminD = false;
  if (p.dailyBrother === undefined) p.dailyBrother = false;
  if (!p.belohnungen) p.belohnungen = DEFAULT_BELOHNUNGEN;
  // Migration: replace old belohnungen with new two-currency version
  if (p.belohnungen && !p.belohnungen.some((b: any) => b.currency)) {
    p.belohnungen = DEFAULT_BELOHNUNGEN;
  }
  // Dragon eggs currency
  if (p.drachenEier === undefined) p.drachenEier = 0;
  if (!p.belohnungenLog) p.belohnungenLog = [];
  if (!p.specialMissions) p.specialMissions = [];
  // Auto-add birthday gift mission for each sibling with a birthday
  const cfg = p.familyConfig || DEFAULT_FAMILY_CONFIG;
  for (const sib of cfg.siblings || []) {
    if (!sib.birthday) continue;
    const missionId = `sm_${sib.name.toLowerCase()}_bday`;
    const dayAfter = new Date(sib.birthday);
    dayAfter.setDate(dayAfter.getDate() + 1);
    if (!p.specialMissions.some(m => m.id === missionId) && new Date() < dayAfter) {
      p.specialMissions.push({ id: missionId, name: `Geburtstagsgeschenk f\u00FCr ${sib.name} kaufen`, emoji: "\uD83C\uDF81", hp: 50, done: false });
    }
  }
  if (!p.weeklyLunch) p.weeklyLunch = {};
  if (p.weeklyMissionsCompleted === undefined) p.weeklyMissionsCompleted = 0;
  // Login bonus migration
  if (p.loginBonusDay === undefined) p.loginBonusDay = 0;
  if (p.loginBonusClaimed === undefined) p.loginBonusClaimed = false;
  if (p.loginBonusStreak === undefined) p.loginBonusStreak = 0;
  // Companion + egg migration
  if (!p.equippedGear) p.equippedGear = {};
  if (!p.questChains) p.questChains = [];
  // Auto-add birthday quest chains for siblings with birthdays
  for (const sib of (cfg.siblings || [])) {
    if (!sib.birthday) continue;
    const chainId = `qc_${sib.name.toLowerCase()}_bday`;
    if (!(p.questChains || []).some(c => c.id === chainId) && new Date() < new Date(sib.birthday)) {
      p.questChains.push(buildBirthdayQuestChain(sib.name, sib.birthday));
    }
  }
  if (!p.companionType) p.companionType = "cat";
  if (p.eggType === undefined) p.eggType = null;
  if (p.eggProgress === undefined) p.eggProgress = 0;
  if (p.eggHatched === undefined) p.eggHatched = true; // existing users already have companion
  // Hero avatar migration
  if (!p.hero.skinTone) p.hero.skinTone = "#F5D0B0";
  if (!p.hero.hairColor) p.hero.hairColor = "#5B3A1A";
  // Evolution celebration
  if (p.evolutionEvent === undefined) p.evolutionEvent = null;
  // Room customization
  if (!p.roomTheme) p.roomTheme = { wallColor: "#F5EDE3", floorType: "wood", windowStyle: "standard" };
  // Daily game redemption limit
  if (p.dailyGameRedemptions === undefined) p.dailyGameRedemptions = 0;
  // Journal tomorrow commitment
  if (p.tomorrowCommitment === undefined) p.tomorrowCommitment = null;
  if (p.yesterdayCommitment === undefined) p.yesterdayCommitment = null;
  // Water drinking tracker
  if (p.dailyWaterCount === undefined) p.dailyWaterCount = 0;
  // Total task days migration
  if (p.totalTaskDays === undefined) p.totalTaskDays = 0;
  // Special / discovery quests
  if (!p.completedSpecialQuests) p.completedSpecialQuests = {};
  if (!p.viewsVisited) p.viewsVisited = [];
  // Egg system
  if (!p.pendingEgg) p.pendingEgg = null;
  if (!p.collectedEggs) p.collectedEggs = [];
  if (!p.eggTriggersFired) p.eggTriggersFired = {};
  if (!p.gamesPlayedEver) p.gamesPlayedEver = [];
}

interface OnboardData {
  hero: Hero;
  catVariant: string;
  catName: string;
  startXP?: number;
  startCoins?: number;
  companionType?: string;
  eggType?: string;
}

export function createInitialState({ hero, catVariant, catName, startXP, startCoins, companionType, eggType }: OnboardData): GameState {
  const wm = WEEKLY_MISSIONS[Math.floor(Math.random() * WEEKLY_MISSIONS.length)];
  return {
    hero, catVariant, catName, xp: startXP || 0, coins: startCoins || 0, drachenEier: 0,
    quests: buildDay(false), rewards: REWARDS, acc: [],
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
    // Companion + egg
    companionType: companionType || "cat",
    eggType: eggType || null,
    eggProgress: eggType ? 0 : 100,
    eggHatched: !eggType,
    // Daily habits (dynamic)
    dailyHabits: {},
    dailyVitaminD: false, dailyBrother: false,
    belohnungen: DEFAULT_BELOHNUNGEN,
    belohnungenLog: [],
    specialMissions: [],
    weeklyLunch: {},
    weeklyMissionsCompleted: 0,
    // Login bonus
    loginBonusDay: 0, loginBonusClaimed: false, loginBonusStreak: 0,
    // Boss defeat reward overlay
    bossDefeatReward: null,
    // Quest chains
    questChains: [],
    // Gear
    equippedGear: {},
    // Evolution celebration
    evolutionEvent: null,
    // Room customization
    roomTheme: { wallColor: "#F5EDE3", floorType: "wood", windowStyle: "standard" },
    // Daily game redemption limit
    dailyGameRedemptions: 0,
    // Journal tomorrow commitment
    tomorrowCommitment: null,
    yesterdayCommitment: null,
    // Water drinking tracker
    dailyWaterCount: 0,
    // Total task days (never resets)
    totalTaskDays: 0,
  };
}
