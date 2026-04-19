import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Quest, GameState, Boss, EggItem, CollectedEgg } from '../types';
import type { FamilyConfig, DragonVariant } from '../types/familyConfig';
import type { ArcEngineState, RoutineBeat } from '../arcs/types';
import type { DreamHighlightsData, PrevDaySnapshot } from '../dream/types'; // used in applyDayTransition (Task 4)
import { buildHighlights } from '../dream/dreamHighlights';
import { advanceBeat, initialArcState } from '../arcs/ArcEngine';
import { findArc } from '../arcs/arcs';
import { DEFAULT_FAMILY_CONFIG } from '../types/familyConfig';
import { buildDay, getLevel, getLvlProg, getCatStage } from '../utils/helpers';
import { BOSSES, CAT_STAGES, WEEKLY_MISSIONS, GEAR_ITEMS, BADGES } from '../constants';
import { SPECIAL_QUESTS } from '../data/specialQuests';
import storage from '../utils/storage';
import { useAuth } from './AuthContext';

// ── Journal entry for history ──
export interface JournalEntry {
  date: string;
  memory: string;
  gratitude: string[];
  dayEmoji: number | null;
  achievements: string[];
  mood: number | null;
}

// ── Parent-created quest-lines ──
export interface ParentQuestLine {
  id: string;
  templateId: 'learn' | 'event' | 'skill';
  title: string;
  subtitle?: string;
  emoji?: string;
  createdAt: string;
  targetDate?: string;
  days: QuestLineDay[];
  completedDayIds: string[];
  completed: boolean;
  completedAt?: string;
  archived?: boolean;
}

export interface QuestLineDay {
  id: string;
  dayNumber: number;
  icon?: string;
  title: string;
  description: string;
  isMilestone?: boolean;
}

// ── Minimal state shape for the task list ──
export interface TaskState {
  quests: Quest[];
  sm: Record<string, number>;
  lastDate: string;
  vacMode: boolean;
  dt: number;
  hp: number;
  drachenEier: number;
  eggType: string | null;
  heroGender: string | null;
  eggProgress: number;
  eggHatched: boolean;
  moodAM: number | null;
  moodPM: number | null;
  dailyWaterCount: number;
  boss: Boss | null;
  bossTrophies: string[];
  catFed: boolean;
  catPetted: boolean;
  catPlayed: boolean;
  catEvo: number;
  loginBonusClaimed: boolean;
  onboardingDone: boolean;
  journalMemory: string;
  journalGratitude: string[];
  journalDayEmoji: number | null;
  journalAchievements: string[];
  journalHistory: JournalEntry[];
  journalSaved: boolean;
  bossDmgToday: number;
  orbs: { vitality: number; radiance: number; patience: number; wisdom: number };
  heroStats: { mut: number; fokus: number; ordnung: number };
  xp: number;
  chestsClaimed: number[];
  activeMissions: { id: string; progress: number; startDate: string }[];
  completedMissions: string[];
  gearInventory: string[];
  equippedGear: { head?: string; back?: string; neck?: string };
  unlockedBadges: string[];
  totalTasksDone: number;
  gamesPlayedToday: string[];
  birthdayEpic: { done: string[]; completed: boolean };
  earnedTraits: string[];
  /** ISO date (YYYY-MM-DD) when evening ritual was last completed. Resets daily. */
  eveningRitualCompletedAt?: string;
  /** Current Ronki stamina for minigames (0-5). Recharges +1 per 40min real-time. */
  ronkiStamina?: number;
  /** ISO timestamp of the last stamina update (used for lazy recharge). */
  ronkiStaminaUpdatedAt?: string;
  /** Creatures discovered via useMicropediaDiscovery. One entry per unlock. */
  micropediaDiscovered?: Array<{ id: string; chapter: string; discoveredAt: string }>;
  /** Freund reunion arcs Louis has completed end-to-end (all 4 beats). */
  freundArcsCompleted?: string[];
  /** Scheduled callback beats waiting to fire 5-7 days after beat 3. */
  freundCallbacksPending?: Array<{ freundId: string; triggerAt: string }>;
  /** Parent-created quest-lines. Lifecycle: active → completed → (optionally) archived. */
  parentQuestLines?: ParentQuestLine[];
  /** Set once Louis dismisses the parent-zone intro overlay. */
  louisSeenParentIntro?: boolean;
  /** Entries logged each time Louis uses Gefühlsecke. Tracks feeling patterns for parents (future). */
  feelingsLog?: Array<{ ts: string; feeling: 'gut' | 'wuetend' | 'traurig' | 'aengstlich' | 'muede'; note?: string }>;
  /** MINT game badges Louis has earned (one per game, awarded on first completion). */
  mintBadgesEarned?: string[];
  /** MINT games Louis has played at least once (first-play tracker, separate from badges). */
  mintGamesPlayed?: string[];
  /** True when all 5 MINT badges earned — unlocks the Forscher-Funkel bonus creature. */
  forscherFunkelUnlocked?: boolean;
  poemQuest?: { done: string[]; completed: boolean; title?: string };
  onboardingDate?: string; // ISO date string — set when onboarding completes
  familyConfig: FamilyConfig;
  _v2_economy_reset?: boolean;
  arcEngine?: ArcEngineState;
  bossKilledToday?: boolean;
  arcBeatAdvancedToday?: boolean;
  dreamHighlights?: DreamHighlightsData;
  totalQuestCompletions?: Record<string, number>;
  completedSpecialQuests?: Record<string, boolean>;
  viewsVisited?: string[];
  // Egg system
  pendingEgg?: EggItem | null;
  collectedEggs?: CollectedEgg[];
  eggTriggersFired?: Record<string, boolean>;
  gamesPlayedEver?: string[];
  /** Minutes of Funkelzeit consumed today. Resets at daily transition. */
  funkelzeitMinutesToday?: number;
  /** Log of Funkelzeit redemptions (last ~60-90 days kept, capped at 200 entries).
   *  Used by ParentalDashboard "Funkelzeit-Verlauf" and lets parents see what
   *  Louis actually redeemed vs. what he used. */
  funkelzeitLog?: Array<{
    ts: string;          // ISO timestamp when timer started
    minutes: number;     // reward.minutes — how many minutes were redeemed
    cost: number;        // reward.cost — cost in drachenEier/screen-minutes
    rewardName: string;  // Belohnungsbank reward name (localized string)
    actualUsed?: number; // minutes actually used (filled in on Store action)
  }>;
  /** ISO dates when the "zeig mama/papa"-confirmation was shown for each
   *  routine block. One per block per day to prevent re-triggering. */
  zeigMomentShownDates?: { morning?: string; evening?: string; bedtime?: string };
  /** Per-block count of confirmations seen. Teaching period fades once each
   *  block hits 14 (Louis has internalized the habit). */
  zeigMomentCounts?: { morning?: number; evening?: number; bedtime?: number };
}

interface TaskComputed {
  done: number;
  total: number;
  allDone: boolean;
  pct: number;
  byGroup: Record<string, Quest[]>;
  level: number;
  xpProgress: { cur: number; need: number };
}

interface TaskActions {
  complete: (id: string) => void;
  setMood: (period: string, val: number) => void;
  drinkWater: () => void;
  feedCompanion: () => void;
  petCompanion: () => void;
  playCompanion: () => void;
  collectLoginBonus: () => void;
  completeOnboarding: (cfg?: { eggType?: string; dragonVariant?: DragonVariant; heroName?: string; heroGender?: string }) => void;
  saveJournal: (data: { memory: string, gratitude: string[], dayEmoji: number | null, achievements: string[] }) => void;
  redeemReward: (currency: 'hp' | 'eggs', cost: number) => void;
  dismissCelebration: () => void;
  startMission: (id: string) => void;
  abandonMission: (id: string) => void;
  addHP: (amount: number) => void;
  claimGameReward: (gameId: string) => void;
  addScreenMinutes: (amount: number) => void;
  addFunkelzeitUsage: (minutes: number) => void;
  refundFunkelzeitUsage: (minutes: number) => void;
  consumeStamina: () => void;
  restoreStamina: () => void;
  equipGear: (gearId: string) => void;
  unequipGear: (slot: 'head' | 'back' | 'neck') => void;
  updateBirthdayEpic: (data: { done: string[]; completed: boolean }) => void;
  updateFamilyConfig: (config: FamilyConfig) => void;
  patchState: (partial: Partial<TaskState>) => void;
  completeSpecialQuest: (id: string) => void;
  recordViewVisit: (view: string) => void;
  spawnEgg: (egg: EggItem) => void;
  collectEgg: () => void;
  fireCelebration: () => void;
  createQuestLine: (ql: ParentQuestLine) => void;
  updateQuestLine: (id: string, patch: Partial<ParentQuestLine>) => void;
  completeQuestLineDay: (questLineId: string, dayId: string) => void;
  archiveQuestLine: (id: string) => void;
  logFeeling: (feeling: 'gut' | 'wuetend' | 'traurig' | 'aengstlich' | 'muede', note?: string) => void;
  claimMintBadge: (badgeId: string, gameId: string) => void;
  recordMintGamePlay: (gameId: string) => void;
}

interface CelebrationEvent {
  type: 'victory' | 'levelUp' | 'evolution' | 'chest';
  payload?: Record<string, any>;
}

interface TaskContextValue {
  state: TaskState | null;
  computed: TaskComputed;
  actions: TaskActions;
  loading: boolean;
  celebration: CelebrationEvent | null;
  toastTrigger: number;
}

function assignBoss(catEvo: number = 0): Boss {
  const stage = getCatStage(catEvo);
  // Tier pool grows with companion evolution
  const allowedTiers = ['tier1'];
  if (stage >= 2) allowedTiers.push('tier2');
  if (stage >= 3) allowedTiers.push('tier3');
  const pool = BOSSES.filter(b => allowedTiers.includes(b.tier));
  const b = pool[Math.floor(Math.random() * pool.length)];
  return { id: b.id, hp: b.hp, maxHp: b.hp };
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function useTask() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyComputed: TaskComputed = { done: 0, total: 0, allDone: false, pct: 0, byGroup: {}, level: 1, xpProgress: { cur: 0, need: 50 } };

export function createInitialState(): TaskState {
  return {
    quests: buildDay(false),
    sm: {},
    lastDate: new Date().toISOString().slice(0, 10),
    vacMode: false,
    dt: 0,
    hp: 0,
    drachenEier: 0,
    eggType: 'dragon',
    heroGender: null,
    eggProgress: 0,
    eggHatched: false,
    moodAM: null,
    moodPM: null,
    dailyWaterCount: 0,
    boss: assignBoss(0),
    bossTrophies: [],
    catFed: false,
    catPetted: false,
    catPlayed: false,
    catEvo: 0,
    loginBonusClaimed: false,
    onboardingDone: false,
    journalMemory: '',
    journalGratitude: [],
    journalDayEmoji: null,
    journalAchievements: [],
    journalHistory: [],
    journalSaved: false,
    bossDmgToday: 0,
    orbs: { vitality: 0, radiance: 0, patience: 0, wisdom: 0 },
    heroStats: { mut: 0, fokus: 0, ordnung: 0 },
    xp: 0,
    chestsClaimed: [],
    activeMissions: [],
    completedMissions: [],
    gearInventory: [],
    equippedGear: {},
    unlockedBadges: [],
    totalTasksDone: 0,
    gamesPlayedToday: [],
    birthdayEpic: { done: [], completed: false },
    earnedTraits: [],
    eveningRitualCompletedAt: undefined,
    ronkiStamina: 5,
    ronkiStaminaUpdatedAt: new Date().toISOString(),
    micropediaDiscovered: [],
    freundArcsCompleted: [],
    freundCallbacksPending: [],
    parentQuestLines: [],
    louisSeenParentIntro: false,
    feelingsLog: [],
    mintBadgesEarned: [],
    mintGamesPlayed: [],
    forscherFunkelUnlocked: false,
    familyConfig: DEFAULT_FAMILY_CONFIG,
    arcEngine: initialArcState(),
    bossKilledToday: false,
    arcBeatAdvancedToday: false,
    completedSpecialQuests: {},
    viewsVisited: [],
    pendingEgg: null,
    collectedEggs: [],
    eggTriggersFired: {},
    gamesPlayedEver: [],
    funkelzeitMinutesToday: 0,
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<TaskState | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const [toastTrigger, setToastTrigger] = useState(0);
  const celebQueue = useRef<CelebrationEvent[]>([]);
  const [celebTick, setCelebTick] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const cloudTimer = useRef<ReturnType<typeof setTimeout>>();

  const queueCelebration = useCallback((evt: CelebrationEvent) => {
    celebQueue.current.push(evt);
    setCelebTick(t => t + 1); // trigger effect
  }, []);

  // Drain celebration queue one at a time
  useEffect(() => {
    if (celebration || celebQueue.current.length === 0) return;
    const next = celebQueue.current.shift();
    if (next) setCelebration(next);
  }, [celebration, celebTick]);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const fireCelebration = useCallback(() => {
    queueCelebration({ type: 'victory' });
  }, [queueCelebration]);

  // ── Load on mount (cloud-aware) ──
  useEffect(() => {
    (async () => {
      const raw = (user
        ? await storage.syncLoad(user.id)
        : await storage.load()
      ) as (GameState & TaskState) | null;
      if (raw && raw.quests) {
        let s: TaskState = {
          quests: raw.quests,
          sm: raw.sm || {},
          lastDate: raw.lastDate || '',
          vacMode: raw.vacMode || false,
          dt: raw.dt || 0,
          hp: raw.coins || raw.hp || 0,
          drachenEier: raw.drachenEier || 0,
          eggType: raw.eggType || 'dragon',
          heroGender: raw.heroGender || null,
          eggProgress: raw.eggProgress || 0,
          eggHatched: raw.eggHatched || false,
          moodAM: raw.moodAM ?? null,
          moodPM: raw.moodPM ?? null,
          dailyWaterCount: raw.dailyWaterCount || 0,
          boss: raw.boss || null,
          bossTrophies: raw.bossTrophies || [],
          bossKilledToday: raw.bossKilledToday ?? false,
          arcBeatAdvancedToday: raw.arcBeatAdvancedToday ?? false,
          dreamHighlights: raw.dreamHighlights?.highlights && typeof raw.dreamHighlights.seen === 'boolean'
            ? raw.dreamHighlights
            : undefined,
          catFed: raw.catFed || false,
          catPetted: raw.catPetted || false,
          catPlayed: raw.catPlayed || false,
          catEvo: raw.catEvo || 0,
          loginBonusClaimed: raw.loginBonusClaimed || false,
          onboardingDone: raw.onboardingDone || false,
          journalMemory: raw.journalMemory || '',
          journalGratitude: raw.journalGratitude || [],
          journalDayEmoji: raw.journalDayEmoji ?? null,
          journalAchievements: raw.journalAchievements || [],
          journalHistory: raw.journalHistory || [],
          journalSaved: raw.journalSaved || false,
          bossDmgToday: raw.bossDmgToday || 0,
          orbs: raw.orbs || { vitality: 0, radiance: 0, patience: 0, wisdom: 0 },
          heroStats: raw.heroStats || { mut: 0, fokus: 0, ordnung: 0 },
          xp: raw.xp || raw.coins || 0,
          chestsClaimed: raw.chestsClaimed || [],
          activeMissions: raw.activeMissions || [],
          completedMissions: raw.completedMissions || [],
          gearInventory: raw.gearInventory || [],
          equippedGear: raw.equippedGear || {},
          unlockedBadges: raw.unlockedBadges || [],
          totalTasksDone: raw.totalTasksDone || 0,
          gamesPlayedToday: raw.gamesPlayedToday || [],
          birthdayEpic: raw.birthdayEpic || { done: [], completed: false },
          earnedTraits: raw.earnedTraits || [],
          eveningRitualCompletedAt: raw.eveningRitualCompletedAt || undefined,
          ronkiStamina: raw.ronkiStamina ?? 5,
          ronkiStaminaUpdatedAt: raw.ronkiStaminaUpdatedAt || new Date().toISOString(),
          micropediaDiscovered: raw.micropediaDiscovered || [],
          freundArcsCompleted: raw.freundArcsCompleted || [],
          freundCallbacksPending: raw.freundCallbacksPending || [],
          parentQuestLines: raw.parentQuestLines || [],
          louisSeenParentIntro: raw.louisSeenParentIntro ?? false,
          feelingsLog: raw.feelingsLog || [],
          mintBadgesEarned: raw.mintBadgesEarned || [],
          mintGamesPlayed: raw.mintGamesPlayed || [],
          forscherFunkelUnlocked: raw.forscherFunkelUnlocked ?? false,
          familyConfig: raw.familyConfig || DEFAULT_FAMILY_CONFIG,
          completedSpecialQuests: raw.completedSpecialQuests || {},
          viewsVisited: raw.viewsVisited || [],
          pendingEgg: raw.pendingEgg || null,
          collectedEggs: raw.collectedEggs || [],
          eggTriggersFired: raw.eggTriggersFired || {},
          gamesPlayedEver: raw.gamesPlayedEver || [],
          funkelzeitMinutesToday: raw.funkelzeitMinutesToday || 0,
        };
        // One-time migration: reset inflated HP from old economy
        if (!raw._v2_economy_reset) {
          s.hp = Math.min(s.hp, 50); // cap at 50 from pre-rebalance inflation
          s.heroStats = s.heroStats || { mut: 0, fokus: 0, ordnung: 0 };
          s._v2_economy_reset = true;
        }
        // Day transition: rebuild quests if date changed
        if (s.lastDate !== today()) {
          s = applyDayTransition(s);
        }
        // Ensure boss exists
        const allBossIds = BOSSES.map(b => b.id);
        if (!s.boss || !allBossIds.includes(s.boss.id)) s.boss = assignBoss(s.catEvo || 0);
        setState(s);
      } else {
        // Fresh start
        setState(createInitialState());
      }
      setLoading(false);
    })();
  }, []);

  // ── Save on state change (debounced local + cloud) ──
  useEffect(() => {
    if (!state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      // Merge into full GameState for storage compatibility
      const raw = await storage.load() as GameState | null;
      const merged = { ...(raw || {}), ...state } as GameState;
      await storage.save(merged);
    }, 400);

    // Cloud sync (debounced, slightly longer)
    if (user) {
      clearTimeout(cloudTimer.current);
      cloudTimer.current = setTimeout(async () => {
        const raw = await storage.load() as GameState | null;
        const merged = { ...(raw || {}), ...state } as GameState;
        await storage.cloudSave(user.id, merged);
      }, 1500);
    }

    return () => {
      clearTimeout(saveTimer.current);
      clearTimeout(cloudTimer.current);
    };
  }, [state, user]);

  // ── Arc on-accept hydration: tag routine beats onto matching quests ──
  useEffect(() => {
    if (state?.arcEngine?.phase !== 'active' || !state.arcEngine.activeArcId) return;
    const arc = findArc(state.arcEngine.activeArcId);
    if (!arc) return;
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        quests: prev.quests.map(q => {
          const matchingBeat = arc.beats.find(
            (b): b is RoutineBeat => b.kind === 'routine' && (b as RoutineBeat).questId === q.id
          );
          return matchingBeat ? { ...q, arcBeatId: matchingBeat.id } : q;
        }),
      };
    });
  }, [state?.arcEngine?.phase]);

  // ── Day transition ──
  function applyDayTransition(s: TaskState): TaskState {
    // Update streak map from yesterday's completed quests
    const newSm = { ...s.sm };
    for (const q of s.quests) {
      if (q.sideQuest) continue;
      if (q.done) {
        newSm[q.id] = (newSm[q.id] || 0) + 1;
      } else {
        newSm[q.id] = 0;
      }
    }
    // Check if all main quests were done yesterday
    const mainQuests = s.quests.filter(q => !q.sideQuest);
    const allDoneYesterday = mainQuests.length > 0 && mainQuests.every(q => q.done);

    // Chest milestone check (streak-based milestones removed in Phase 1)
    const chestsClaimed = [...(s.chestsClaimed || [])];

    // Mission progress from yesterday's quests
    const morningDone = s.quests.filter(q => q.anchor === 'morning' && q.done && !q.sideQuest);
    const eveningDone = s.quests.filter(q => q.anchor === 'evening' && q.done && !q.sideQuest);
    const allMorningDone = morningDone.length > 0 && s.quests.filter(q => q.anchor === 'morning' && !q.sideQuest).every(q => q.done);
    const allEveningDone = eveningDone.length > 0 && s.quests.filter(q => q.anchor === 'evening' && !q.sideQuest).every(q => q.done);
    const readDone = s.quests.some(q => q.id === 's8' && q.done) || s.quests.some(q => q.id === 'v6' && q.done);
    const footballDone = s.quests.some(q => q.id === 'ft' && q.done);

    let activeMissions = [...(s.activeMissions || [])];
    let completedMissions = [...(s.completedMissions || [])];
    let missionHp = 0;
    let missionEvo = 0;
    const gearAwarded: string[] = [];

    activeMissions = activeMissions.map(m => {
      const def = WEEKLY_MISSIONS.find(wm => wm.id === m.id);
      if (!def || m.progress >= def.target) return m;
      let inc = 0;
      if (def.goal === 'allMorning' && allMorningDone) inc = 1;
      if (def.goal === 'allEvening' && allEveningDone) inc = 1;
      if (def.goal === 'allDone' && allDoneYesterday) inc = 1;
      if (def.goal === 'read' && readDone) inc = 1;
      if (def.goal === 'football' && footballDone) inc = 1;
      if (def.goal === 'water') inc = 0; // water tracked in real-time
      const newProg = Math.min(m.progress + inc, def.target);
      if (newProg >= def.target && !completedMissions.includes(m.id)) {
        completedMissions.push(m.id);
        missionHp += def.reward.hp;
        missionEvo += def.reward.evo;
        // Award gear for this mission
        const gear = GEAR_ITEMS.find(g => g.missionId === def.id);
        if (gear && !gearAwarded.includes(gear.id)) gearAwarded.push(gear.id);
        queueCelebration({ type: 'victory', payload: { mission: def.title, hp: def.reward.hp, evo: def.reward.evo } });
      }
      return { ...m, progress: newProg };
    });
    // Remove completed missions from active
    activeMissions = activeMissions.filter(m => !completedMissions.includes(m.id) || !s.completedMissions?.includes(m.id));
    s = { ...s, hp: (s.hp || 0) + missionHp, catEvo: (s.catEvo || 0) + missionEvo, gearInventory: [...(s.gearInventory || []), ...gearAwarded] };

    // Rebuild quests for today, preserve streaks
    const quests = buildDay(s.vacMode).map(q => ({
      ...q,
      streak: newSm[q.id] || 0,
    }));

    // Archive yesterday's journal entry if it had content
    let journalHistory = [...(s.journalHistory || [])];
    if (s.journalMemory || (s.journalGratitude && s.journalGratitude.length > 0) || s.journalDayEmoji !== null) {
      const entry: JournalEntry = {
        date: s.lastDate,
        memory: s.journalMemory || '',
        gratitude: s.journalGratitude || [],
        dayEmoji: s.journalDayEmoji ?? null,
        achievements: s.journalAchievements || [],
        mood: s.moodAM ?? null,
      };
      const existingIdx = journalHistory.findIndex(e => e.date === entry.date);
      if (existingIdx >= 0) journalHistory[existingIdx] = entry;
      else journalHistory.push(entry);
    }

    // ── Dream Strip snapshot ──
    // Capture yesterday's highlights before the daily reset so DreamStrip
    // can show Ronki's impressions when Louis opens the app tomorrow.
    const dreamSnap: PrevDaySnapshot = {
      bossKilledToday: s.bossKilledToday ?? false,
      allCareDone: Boolean(s.catFed && s.catPetted && s.catPlayed),
      allQuestsDone: allDoneYesterday,
      arcBeatAdvancedToday: s.arcBeatAdvancedToday ?? false,
    };
    const dreamHighlights = buildHighlights(dreamSnap);

    return {
      ...s,
      quests,
      sm: newSm,
      chestsClaimed,
      activeMissions,
      completedMissions,
      lastDate: today(),
      dt: 0,
      moodAM: null,
      moodPM: null,
      dailyWaterCount: 0,
      boss: assignBoss(s?.catEvo || 0),
      catFed: false,
      catPetted: false,
      catPlayed: false,
      loginBonusClaimed: false,
      journalMemory: '',
      journalGratitude: [],
      journalDayEmoji: null,
      journalAchievements: [],
      journalHistory,
      journalSaved: false,
      bossDmgToday: 0,
      gamesPlayedToday: [],
      ronkiStamina: 5,
      ronkiStaminaUpdatedAt: new Date().toISOString(),
      dreamHighlights,
      bossKilledToday: false,
      arcBeatAdvancedToday: false,
      funkelzeitMinutesToday: 0,
    };
  }

  // ── Complete a quest ──
  const complete = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      const q = prev.quests.find(q => q.id === id);
      if (!q) return prev;

      const quests = prev.quests.map(quest => {
        if (quest.id !== id) return quest;
        const completions = (quest.completions || 0) + 1;
        const target = quest.target || 1;
        const done = completions >= target;
        return { ...quest, completions, done };
      });

      const dt = prev.dt + (q.minutes || 0);
      const hpGain = q.xp; // 1:1 XP to HP
      let hp = (prev.hp || 0) + hpGain;
      let screenMin = (prev.drachenEier || 0) + 1; // +1 screen minute per quest
      const prevXp = prev.xp || 0;
      const newXp = prevXp + q.xp;

      // Boss damage — gear courage boosts damage, defense boosts loot
      let boss = prev.boss ? { ...prev.boss } : null;
      let bossTrophies = [...(prev.bossTrophies || [])];
      let bossDmgToday = prev.bossDmgToday || 0;
      let bossKilledToday = prev.bossKilledToday ?? false;
      let arcBeatAdvancedToday = prev.arcBeatAdvancedToday ?? false;
      if (boss && boss.hp > 0) {
        // Calculate gear bonus from equipped courage stat
        const equipped = prev.equippedGear || {};
        let gearCourage = 0;
        let gearDefense = 0;
        for (const slotId of Object.values(equipped)) {
          const g = GEAR_ITEMS.find(gi => gi.id === slotId);
          if (g) {
            gearCourage += g.stats.courage || 0;
            gearDefense += g.stats.defense || 0;
          }
        }
        // Base damage + courage bonus (1 extra dmg per 5 courage)
        const baseDmg = Math.max(5, Math.floor(q.xp * 0.8));
        const courageBonus = Math.floor(gearCourage / 5);
        const dmg = baseDmg + courageBonus;
        boss.hp = Math.max(0, boss.hp - dmg);
        bossDmgToday += dmg;
        if (boss.hp <= 0) {
          const bd = BOSSES.find(b => b.id === boss!.id);
          // Defense bonus: extra HP on defeat (1 per 5 defense)
          const defenseBonus = Math.floor(gearDefense / 5);
          if (bd) hp += bd.reward.hp + defenseBonus;
          screenMin += 3; // bonus screen minutes on boss defeat
          if (!bossTrophies.includes(boss.id)) bossTrophies.push(boss.id);
          bossKilledToday = true;
        }
      }

      // Award orb based on quest category
      const orbMap: Record<string, keyof typeof prev.orbs> = {
        // Vitalität — hygiene & body care
        s1: 'vitality', s3: 'vitality', s12: 'vitality', s13: 'vitality', s14: 'vitality',
        s15: 'vitality', s6b: 'vitality', v1: 'vitality', v3: 'vitality', v10: 'vitality',
        v11: 'vitality', v12: 'vitality', v13: 'vitality', v5b: 'vitality',
        // Weisheit — learning & reading
        s7: 'wisdom', s8: 'wisdom', v6: 'wisdom', s_signature: 'wisdom',
        // Geduld — responsibility & chores
        s2: 'patience', s4: 'patience', s5: 'patience', s_lunchbox: 'patience',
        s_water: 'patience', s_packcheck: 'patience', v2: 'patience', v4: 'patience',
        v7: 'patience', sq_geschirr: 'patience', sq_zimmer: 'patience',
        // Leuchten — physical & outdoors
        sq_draussen: 'radiance', sq_fussball: 'radiance', ft: 'radiance',
      };
      const orbTypes = ['vitality', 'radiance', 'patience', 'wisdom'] as const;
      const orbTotal = (Object.values(prev.orbs) as number[]).reduce((a, b) => a + b, 0);
      const orbKey = orbMap[id] || orbTypes[orbTotal % 4];
      const orbs = { ...(prev.orbs || { vitality: 0, radiance: 0, patience: 0, wisdom: 0 }) };
      orbs[orbKey] += 1;

      // Accumulate hero stats (long-term progression)
      const heroStats = { ...(prev.heroStats || { mut: 0, fokus: 0, ordnung: 0 }) };
      const anchor = q.anchor || '';
      if (anchor === 'morning' || anchor === 'bedtime') heroStats.ordnung += 1;
      else if (anchor === 'evening') heroStats.fokus += 1;
      if (q.sideQuest || anchor === 'hobby') heroStats.mut += 2;
      if (boss && boss.hp <= 0 && prev.boss && prev.boss.hp > 0) heroStats.mut += 3; // boss defeat bonus

      // Level-up detection
      const prevLevel = getLevel(prevXp);
      const newLevel = getLevel(newXp);
      if (newLevel > prevLevel) {
        queueCelebration({ type: 'levelUp', payload: { level: newLevel, prevLevel } });
      }

      // Victory detection — all main quests done
      const mainQuests = quests.filter(qq => !qq.sideQuest);
      const allDone = mainQuests.length > 0 && mainQuests.every(qq => qq.done);
      const wasDone = prev.quests.filter(qq => !qq.sideQuest).every(qq => qq.done);
      if (allDone && !wasDone) {
        queueCelebration({ type: 'victory' });
        screenMin += 3; // bonus screen minutes for completing all quests
      }

      // Track total tasks done
      const totalTasksDone = (prev.totalTasksDone || 0) + 1;

      // Badge checking
      const unlockedBadges = [...(prev.unlockedBadges || [])];
      const checkVals: Record<string, boolean> = {
        sd1: totalTasksDone >= 1,
        sd3: false,
        sd7: false,
        sd30: false,
        lvl5: getLevel(newXp) >= 5,
        lvl10: getLevel(newXp) >= 10,
        tasks50: totalTasksDone >= 50,
        tasks100: totalTasksDone >= 100,
        gear3: (prev.gearInventory || []).length >= 3,
      };
      for (const badge of BADGES) {
        if (!unlockedBadges.includes(badge.id) && checkVals[badge.check]) {
          unlockedBadges.push(badge.id);
        }
      }

      // If the completed quest is tagged as an arc beat, advance the arc state.
      let arcEngine = prev.arcEngine ?? initialArcState();
      if (q.arcBeatId) {
        const prevBeatIndex = arcEngine.activeBeatIndex;
        const prevCompletedLen = arcEngine.completedArcIds.length;
        arcEngine = advanceBeat(arcEngine, q.arcBeatId);
        if (
          arcEngine.activeBeatIndex !== prevBeatIndex ||
          arcEngine.completedArcIds.length !== prevCompletedLen
        ) {
          arcBeatAdvancedToday = true;
        }
      }

      const prevTotal = (prev.totalQuestCompletions ?? {})[id] || 0;
      const totalQuestCompletions = { ...(prev.totalQuestCompletions ?? {}), [id]: prevTotal + 1 };

      return { ...prev, quests, dt, hp, drachenEier: screenMin, xp: newXp, boss, bossTrophies, bossDmgToday, orbs, heroStats, totalTasksDone, unlockedBadges, arcEngine, bossKilledToday, arcBeatAdvancedToday, totalQuestCompletions };
    });
    setToastTrigger(t => t + 1);
  }, []);

  // ── Set mood ──
  const setMood = useCallback((period: string, val: number) => {
    setState(prev => prev ? { ...prev, [period]: val } : prev);
  }, []);

  // ── Drink water (also tracks water missions) ──
  const drinkWater = useCallback(() => {
    setState(prev => {
      if (!prev || (prev.dailyWaterCount || 0) >= 6) return prev;
      let activeMissions = [...(prev.activeMissions || [])];
      let completedMissions = [...(prev.completedMissions || [])];
      let bonusHp = 0;
      let bonusEvo = 0;
      const newGear: string[] = [];
      activeMissions = activeMissions.map(m => {
        const def = WEEKLY_MISSIONS.find(wm => wm.id === m.id);
        if (!def || def.goal !== 'water' || m.progress >= def.target) return m;
        const newProg = m.progress + 1;
        if (newProg >= def.target && !completedMissions.includes(m.id)) {
          completedMissions.push(m.id);
          bonusHp += def.reward.hp;
          bonusEvo += def.reward.evo;
          const gear = GEAR_ITEMS.find(g => g.missionId === def.id);
          if (gear && !(prev.gearInventory || []).includes(gear.id)) newGear.push(gear.id);
          queueCelebration({ type: 'victory', payload: { mission: def.title, hp: def.reward.hp, evo: def.reward.evo } });
        }
        return { ...m, progress: newProg };
      });
      return {
        ...prev,
        dailyWaterCount: (prev.dailyWaterCount || 0) + 1,
        hp: (prev.hp || 0) + 2 + bonusHp,
        catEvo: (prev.catEvo || 0) + bonusEvo,
        activeMissions,
        completedMissions,
        gearInventory: [...(prev.gearInventory || []), ...newGear],
      };
    });
  }, [queueCelebration]);

  // ── Companion care (with evolution detection) ──
  const evolveCheck = useCallback((prevEvo: number, newEvo: number) => {
    const prevStage = getCatStage(prevEvo);
    const newStage = getCatStage(newEvo);
    if (newStage > prevStage) {
      const stageInfo = CAT_STAGES[newStage];
      queueCelebration({ type: 'evolution', payload: { stage: newStage, name: stageInfo.name, emoji: stageInfo.emoji } });
    }
  }, []);

  const feedCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catFed) return prev;
      const newEvo = (prev.catEvo || 0) + 1;
      evolveCheck(prev.catEvo || 0, newEvo);
      return { ...prev, catFed: true, hp: (prev.hp || 0) + 5, catEvo: newEvo };
    });
  }, [evolveCheck]);

  const petCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPetted) return prev;
      const newEvo = (prev.catEvo || 0) + 1;
      evolveCheck(prev.catEvo || 0, newEvo);
      return { ...prev, catPetted: true, hp: (prev.hp || 0) + 3, catEvo: newEvo };
    });
  }, [evolveCheck]);

  const playCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPlayed) return prev;
      const newEvo = (prev.catEvo || 0) + 1;
      evolveCheck(prev.catEvo || 0, newEvo);
      return { ...prev, catPlayed: true, hp: (prev.hp || 0) + 8, catEvo: newEvo };
    });
  }, [evolveCheck]);

  // ── Login bonus ──
  const collectLoginBonus = useCallback(() => {
    setState(prev => {
      if (!prev || prev.loginBonusClaimed) return prev;
      return { ...prev, loginBonusClaimed: true, hp: (prev.hp || 0) + 5 };
    });
  }, []);

  const completeOnboarding = useCallback((cfg?: { eggType?: string; dragonVariant?: DragonVariant; heroName?: string; heroGender?: string }) => {
    setState(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        onboardingDone: true,
        onboardingDate: prev.onboardingDate || new Date().toISOString().slice(0, 10),
        eggType: cfg?.eggType || prev.eggType,
        heroGender: cfg?.heroGender || prev.heroGender || null,
      };
      const familyConfigPatch: Partial<FamilyConfig> = {};
      if (cfg?.heroName) familyConfigPatch.childName = cfg.heroName;
      if (cfg?.dragonVariant) familyConfigPatch.dragonVariant = cfg.dragonVariant;
      if (Object.keys(familyConfigPatch).length > 0) {
        updated.familyConfig = { ...prev.familyConfig, ...familyConfigPatch };
      }
      return updated;
    });
  }, []);

  // ── Save journal (also archives to history) ──
  const saveJournal = useCallback((data: { memory: string, gratitude: string[], dayEmoji: number | null, achievements: string[] }) => {
    setState(prev => {
      if (!prev) return prev;
      const entry: JournalEntry = {
        date: prev.lastDate,
        memory: data.memory,
        gratitude: data.gratitude,
        dayEmoji: data.dayEmoji,
        achievements: data.achievements,
        mood: prev.moodAM ?? null,
      };
      const history = [...(prev.journalHistory || [])];
      const existingIdx = history.findIndex(e => e.date === entry.date);
      if (existingIdx >= 0) history[existingIdx] = entry;
      else history.push(entry);
      return {
        ...prev,
        journalMemory: data.memory,
        journalGratitude: data.gratitude,
        journalDayEmoji: data.dayEmoji,
        journalAchievements: data.achievements,
        journalHistory: history,
        journalSaved: true,
      };
    });
  }, []);

  // ── Redeem reward ──
  const redeemReward = useCallback((currency: 'hp' | 'eggs', cost: number) => {
    setState(prev => {
      if (!prev) return prev;
      if (currency === 'hp') {
        if ((prev.hp || 0) < cost) return prev;
        return { ...prev, hp: prev.hp - cost };
      } else {
        if ((prev.drachenEier || 0) < cost) return prev;
        return { ...prev, drachenEier: prev.drachenEier - cost };
      }
    });
  }, []);

  // ── Mission management ──
  const startMission = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.activeMissions.some(m => m.id === id)) return prev;
      if (prev.completedMissions.includes(id)) return prev;
      return {
        ...prev,
        activeMissions: [...prev.activeMissions, { id, progress: 0, startDate: today() }],
      };
    });
  }, []);

  const abandonMission = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activeMissions: prev.activeMissions.filter(m => m.id !== id),
      };
    });
  }, []);

  // ── Add HP (used by birthday epic etc. — NOT for mini-games) ──
  const addHP = useCallback((amount: number) => {
    setState(prev => prev ? { ...prev, hp: (prev.hp || 0) + amount } : prev);
  }, []);

  // ── Mini-game reward: +1 screen minute per unique game per day (max 4) ──
  /** Mark a minigame complete: grant daily reward (once/day) AND consume 1 stamina.
   *  Stamina always drops on completion, even for repeat plays of the same game. */
  const claimGameReward = useCallback((gameId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const played = prev.gamesPlayedToday || [];
      const alreadyClaimed = played.includes(gameId);
      return {
        ...prev,
        // Reward only on first claim of the day
        drachenEier: alreadyClaimed ? prev.drachenEier : (prev.drachenEier || 0) + 1,
        gamesPlayedToday: alreadyClaimed ? played : [...played, gameId],
        gamesPlayedEver: prev.gamesPlayedEver?.includes(gameId)
          ? prev.gamesPlayedEver
          : [...(prev.gamesPlayedEver || []), gameId],
        // Stamina always drops — the dopamine cost of playing, not of claiming
        ronkiStamina: Math.max(0, (prev.ronkiStamina ?? 5) - 1),
        ronkiStaminaUpdatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // ── Add screen minutes (refund unused timer time) ──
  const addScreenMinutes = useCallback((amount: number) => {
    setState(prev => prev ? { ...prev, drachenEier: (prev.drachenEier || 0) + amount } : prev);
  }, []);

  // ── Funkelzeit daily usage tracking (for 'strikt' mode cap) ──
  // Called when a Funkelzeit timer starts: commits the full reward minutes.
  const addFunkelzeitUsage = useCallback((minutes: number) => {
    setState(prev => prev ? {
      ...prev,
      funkelzeitMinutesToday: Math.max(0, (prev.funkelzeitMinutesToday || 0) + minutes),
    } : prev);
  }, []);

  // Called when user stores unused timer: refunds the unused minutes against
  // the daily usage counter (parallels drachenEier refund).
  const refundFunkelzeitUsage = useCallback((minutes: number) => {
    setState(prev => prev ? {
      ...prev,
      funkelzeitMinutesToday: Math.max(0, (prev.funkelzeitMinutesToday || 0) - minutes),
    } : prev);
  }, []);

  // ── Stamina actions ──
  const consumeStamina = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ronkiStamina: Math.max(0, (prev.ronkiStamina ?? 5) - 1),
        ronkiStaminaUpdatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const restoreStamina = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ronkiStamina: 5,
        ronkiStaminaUpdatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const equipGear = useCallback((gearId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const gear = GEAR_ITEMS.find(g => g.id === gearId);
      if (!gear || !prev.gearInventory.includes(gearId)) return prev;
      return { ...prev, equippedGear: { ...prev.equippedGear, [gear.slot]: gearId } };
    });
  }, []);

  const unequipGear = useCallback((slot: 'head' | 'back' | 'neck') => {
    setState(prev => {
      if (!prev) return prev;
      const eq = { ...prev.equippedGear };
      delete eq[slot];
      return { ...prev, equippedGear: eq };
    });
  }, []);

  const updateBirthdayEpic = useCallback((data: { done: string[]; completed: boolean }) => {
    setState(prev => prev ? { ...prev, birthdayEpic: data } : prev);
  }, []);

  const updateFamilyConfig = useCallback((config: FamilyConfig) => {
    setState(prev => prev ? { ...prev, familyConfig: config } : prev);
  }, []);

  const patchState = useCallback((partial: Partial<TaskState>) => {
    setState(prev => prev ? { ...prev, ...partial } : prev);
  }, []);

  // ── Complete a special/discovery quest (idempotent, silent) ──
  const completeSpecialQuest = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.completedSpecialQuests?.[id]) return prev; // idempotent
      const quest = SPECIAL_QUESTS.find(q => q.id === id);
      const xpBonus = quest?.xpReward ?? 0;
      return {
        ...prev,
        completedSpecialQuests: { ...(prev.completedSpecialQuests || {}), [id]: true },
        xp: (prev.xp || 0) + xpBonus,
      };
    });
  }, []);

  // ── Record first visit to a view (idempotent) ──
  const recordViewVisit = useCallback((view: string) => {
    setState(prev => {
      if (!prev) return prev;
      if ((prev.viewsVisited || []).includes(view)) return prev; // idempotent
      return { ...prev, viewsVisited: [...(prev.viewsVisited || []), view] };
    });
  }, []);

  // ── Egg system actions ──
  const spawnEgg = useCallback((egg: EggItem) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.pendingEgg) return prev; // already one pending
      if (prev.eggTriggersFired?.[egg.triggerId]) return prev; // already fired
      return {
        ...prev,
        pendingEgg: egg,
        eggTriggersFired: { ...(prev.eggTriggersFired || {}), [egg.triggerId]: true },
      };
    });
  }, []);

  const collectEgg = useCallback(() => {
    setState(prev => {
      if (!prev?.pendingEgg) return prev;
      const egg = prev.pendingEgg;
      return {
        ...prev,
        pendingEgg: null,
        collectedEggs: [
          ...(prev.collectedEggs || []),
          {
            triggerId: egg.triggerId,
            labelDe: egg.labelDe,
            labelEn: egg.labelEn,
            accentColor: egg.accentColor,
            collectedAt: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ── Parent-created quest-line actions ──
  const createQuestLine = useCallback((ql: ParentQuestLine) => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, parentQuestLines: [...(prev.parentQuestLines || []), ql] };
    });
  }, []);

  const updateQuestLine = useCallback((id: string, patch: Partial<ParentQuestLine>) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        parentQuestLines: (prev.parentQuestLines || []).map(q => q.id === id ? { ...q, ...patch } : q),
      };
    });
  }, []);

  const completeQuestLineDay = useCallback((questLineId: string, dayId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const updated = (prev.parentQuestLines || []).map(q => {
        if (q.id !== questLineId) return q;
        if (q.completedDayIds.includes(dayId)) return q;
        const newDone = [...q.completedDayIds, dayId];
        const allDone = newDone.length >= q.days.length;
        return {
          ...q,
          completedDayIds: newDone,
          completed: allDone,
          completedAt: allDone ? new Date().toISOString() : q.completedAt,
        };
      });
      return { ...prev, parentQuestLines: updated };
    });
  }, []);

  const archiveQuestLine = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        parentQuestLines: (prev.parentQuestLines || []).map(q => q.id === id ? { ...q, archived: true } : q),
      };
    });
  }, []);

  // ── Gefühlsecke: log a feeling check-in ──
  const logFeeling = useCallback((feeling: 'gut' | 'wuetend' | 'traurig' | 'aengstlich' | 'muede', note?: string) => {
    setState(prev => prev ? {
      ...prev,
      feelingsLog: [...(prev.feelingsLog || []), { ts: new Date().toISOString(), feeling, note }],
    } : prev);
  }, []);

  // ── Forscher-Ecke: claim a MINT badge (idempotent) ──
  const claimMintBadge = useCallback((badgeId: string, gameId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const badges = prev.mintBadgesEarned || [];
      const played = prev.mintGamesPlayed || [];
      const newBadges = badges.includes(badgeId) ? badges : [...badges, badgeId];
      const newPlayed = played.includes(gameId) ? played : [...played, gameId];
      const allComplete = newBadges.length >= 5;
      return {
        ...prev,
        mintBadgesEarned: newBadges,
        mintGamesPlayed: newPlayed,
        forscherFunkelUnlocked: allComplete,
      };
    });
  }, []);

  // ── Forscher-Ecke: record first play of a MINT game (idempotent, no badge) ──
  const recordMintGamePlay = useCallback((gameId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const played = prev.mintGamesPlayed || [];
      if (played.includes(gameId)) return prev;
      return { ...prev, mintGamesPlayed: [...played, gameId] };
    });
  }, []);

  // ── Computed values ──
  const computed: TaskComputed = state ? (() => {
    const mainQuests = state.quests.filter(q => !q.sideQuest);
    const done = mainQuests.filter(q => q.done).length;
    const total = mainQuests.length;
    const allDone = total > 0 && done === total;
    const pct = total > 0 ? done / total : 0;
    const byGroup: Record<string, Quest[]> = {};
    for (const q of state.quests) {
      const key = q.anchor;
      if (!byGroup[key]) byGroup[key] = [];
      byGroup[key].push(q);
    }
    // Sort each group by order
    for (const key of Object.keys(byGroup)) {
      byGroup[key].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const level = getLevel(state.xp || 0);
    const xpProgress = getLvlProg(state.xp || 0);
    return { done, total, allDone, pct, byGroup, level, xpProgress };
  })() : emptyComputed;

  return (
    <TaskContext.Provider value={{ state, computed, actions: { complete, setMood, drinkWater, feedCompanion, petCompanion, playCompanion, collectLoginBonus, completeOnboarding, saveJournal, redeemReward, dismissCelebration, startMission, abandonMission, addHP, claimGameReward, addScreenMinutes, addFunkelzeitUsage, refundFunkelzeitUsage, consumeStamina, restoreStamina, equipGear, unequipGear, updateBirthdayEpic, updateFamilyConfig, patchState, completeSpecialQuest, recordViewVisit, spawnEgg, collectEgg, fireCelebration, createQuestLine, updateQuestLine, completeQuestLineDay, archiveQuestLine, logFeeling, claimMintBadge, recordMintGamePlay }, loading, celebration, toastTrigger }}>
      {children}
    </TaskContext.Provider>
  );
}
