// ═══ Ronki — Shared Type Definitions ═══
import type { FamilyConfig } from './types/familyConfig';
import type { ArcEngineState } from './arcs/types';
import type { DreamHighlightsData } from './dream/types';

export interface Hero {
  name: string;
  shape: string;
  color: string;
  eyes: string;
  hair: string;
  skinTone?: string;
  hairColor?: string;
}

export interface Quest {
  id: string;
  name: string;
  icon: string;
  anchor: 'morning' | 'evening' | 'bedtime' | 'hobby';
  xp: number;
  minutes: number;
  done: boolean;
  streak: number;
  order?: number;
  target?: number;
  bonus?: number;
  completions?: number;
  sideQuest?: boolean;
  arcBeatId?: string;   // if set, completing this quest advances the given arc beat
}

export interface QuestChain {
  id: string;
  name: string;
  emoji: string;
  steps: QuestChainStep[];
  hp: number;
  completed: boolean;
  deadline?: string;  // ISO date string e.g. "2026-04-26"
}

export interface QuestChainStep {
  id: string;
  name: string;
  done: boolean;
}

export interface Reward {
  id: string;
  name: string;
  icon: string;
  minutes: number;
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  type: string;
}

export interface RareDrop {
  type: 'hp' | 'minutes' | 'emoji';
  amount?: number;
  label: string;
  icon: string;
  id?: string;
}

export interface ChestReward {
  type: 'hp' | 'item' | 'minutes' | 'xpboost';
  amount?: number;
  id?: string;
  label: string;
  icon: string;
}



export interface WeeklyMission {
  id: string;
  title: string;
  story: string;
  goal: string;
  target: number;
  reward: { hp: number; evo: number };
  icon: string;
  tag: string;
  tagColor: string;
  rewardLabel: string;
  rewardIcon: string;
}

export interface JournalQuestion {
  id: string;
  q: string;
  opts: { v: string; l: string }[];
}

export interface Badge {
  id: string;
  i: string;
  n: string;
  desc: string;
  check: string;
}

export type CatMood = 'sleepy' | 'neutral' | 'happy' | 'excited';

export interface Boss {
  id: string;
  hp: number;
  maxHp: number;
}

export interface BossTemplate {
  id: string;
  name: string;
  icon: string;
  hp: number;
  reward: { hp: number };
  desc: string;
  tier?: string;
}

export interface CatStageInfo {
  name: string;
  threshold: number;
  emoji: string;
  desc: string;
}

// ── New: Belohnungsbank ──
export interface Belohnung {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  active: boolean;
  currency?: 'hp' | 'eggs';  // which currency this costs (default: 'hp')
  minutes?: number;           // duration in real minutes for screen-time rewards
  availableAfter?: string;
  availableAfterFree?: string;
  weekendCost?: number;
}

// ── New: Spezial-Mission ──
export interface SpecialMission {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  done: boolean;
}

// ── New: Unlock Condition ──
export interface UnlockCondition {
  type: 'streak' | 'boss' | 'tasks' | 'catStage' | 'weeklyMission' | 'bossLoot';
  value: number;
  label: string;
  icon: string;
}

// ── New: Hero Tip ──
export interface HeroTip {
  char: string;
  emoji: string;
  tip: string;
}

export interface EggItem {
  triggerId: string;
  view: string;        // which view to show the egg in
  labelDe: string;
  labelEn: string;
  accentColor: string; // hex for glow
}

export interface CollectedEgg {
  triggerId: string;
  labelDe: string;
  labelEn: string;
  accentColor: string;
  collectedAt: number;
}

export interface GameState {
  // ── Family config ──
  familyConfig?: FamilyConfig;
  hero: Hero;
  catVariant: string;
  catName: string;
  xp: number;
  coins: number;
  drachenEier: number;  // dragon eggs — scarce media/screen time currency
  quests: Quest[];
  rewards: Reward[];
  acc: string[];
  lastDate: string;
  dt: number;
  hist: { id: string; d: number }[];
  vacMode: boolean;
  sm: Record<string, number>;
  roomItems: string[];
  purchased: string[];
  moodAM: number | null;
  moodPM: number | null;
  journal: string;
  jAnswers: Record<string, string>;
  rainbow: boolean[];
  wheelSpun: boolean;
  memoryPlayed: boolean;
  chestMilestone: number | null;
  xpBoost: boolean;
  weeklyMission: string;
  weeklyProgress: number;
  weekStart: string;
  graduated: string[];
  streakFreezes: number;
  freezesUsedThisMonth: number;
  lastFreezeMonth: string;
  comebackActive: boolean;
  bestStreak: number;
  freezeUsedToday: boolean;
  // Cat care / evolution
  catEvo: number;
  catHunger: number;
  catHappy: number;
  catEnergy: number;
  catFed: boolean;
  catPetted: boolean;
  catPlayed: boolean;
  // Boss battles
  boss: Boss | null;
  bossTrophies: string[];
  // Companion
  companionType: string;
  // Egg hatching
  eggType: string | null;
  eggProgress: number;
  eggHatched: boolean;
  // ── Daily habits (dynamic, keyed by habit id) ──
  dailyHabits: Record<string, boolean>;
  // Legacy compat — migrated on load
  dailyVitaminD?: boolean;
  dailyBrother?: boolean;
  belohnungen: Belohnung[];
  belohnungenLog: { id: string; date: string }[];
  specialMissions: SpecialMission[];
  weeklyLunch: Record<string, string>;
  weeklyMissionsCompleted: number;
  // Login bonus calendar
  loginBonusDay: number;
  loginBonusClaimed: boolean;
  loginBonusStreak: number;
  // Boss defeat reward overlay
  bossDefeatReward: { bossName: string; bossIcon: string; hp: number; item: { name: string; icon: string } | null } | null;
  // Quest chains
  questChains: QuestChain[];
  // Companion gear
  equippedGear: { head?: string; body?: string; accessory?: string };
  // Evolution celebration overlay
  evolutionEvent: { oldStage: number; newStage: number; newBossTier?: string } | null;
  // Room customization
  roomTheme: { wallColor: string; floorType: string; windowStyle: string };
  // Daily game redemption limit
  dailyGameRedemptions: number;
  // Journal tomorrow commitment
  tomorrowCommitment: { type: string; text: string } | null;
  yesterdayCommitment: { type: string; text: string } | null;
  // Water drinking tracker
  dailyWaterCount: number;
  // Total task days (never resets)
  totalTaskDays: number;
  // ── Arc Engine (narrative episodes) ──
  arcEngine?: ArcEngineState;
  bossKilledToday?: boolean;
  arcBeatAdvancedToday?: boolean;
  dreamHighlights?: DreamHighlightsData;
  totalQuestCompletions?: Record<string, number>;
  // ── Special / Discovery Quests ──
  completedSpecialQuests?: Record<string, boolean>;
  viewsVisited?: string[];
  // Egg system
  pendingEgg?: EggItem | null;
  collectedEggs?: CollectedEgg[];
  eggTriggersFired?: Record<string, boolean>;
  gamesPlayedEver?: string[]; // cumulative, never resets daily
  // ── Garden (core-gameloop-time-stack Phase 1) ──
  // The Pflanzen garden that lives as the Hub's backdrop. Cumulative-over-
  // countable artefact — plants accumulate week-over-week and visibly
  // mature at horizon boundaries (Q7 C+ milestone-aged, computed from
  // plantedAt rather than stored as transitions). Decor items are free-
  // placed by the kid with no rating or completion meter (Q9 Hub-backdrop
  // pivot). See docs/discovery/2026-04-23-core-gameloop-time-stack/.
  garden?: GardenState;
}

// ── Garden types ──────────────────────────────────────────────────────
export type PlantSpecies = 'oak' | 'apple' | 'birch' | 'pine' | 'linden' | 'fir';
export type DecorType =
  // Natur
  | 'stone' | 'stone-sm' | 'lantern' | 'bench' | 'fence' | 'mushroom'
  // Magie
  | 'crystal' | 'runestone' | 'faerie-ring' | 'shrine' | 'orb' | 'dreamcatcher'
  | 'idol' | 'totem';

export type DecorCategory = 'natur' | 'magie' | 'struktur' | 'lebewesen';

export interface GardenPlant {
  id: string;              // 'oak-2026-04-23-<rand>'
  species: PlantSpecies;
  plantedAt: string;       // ISO date (yyyy-mm-dd)
  position: { x: number; y: number };  // % of scene (0–100)
}

export interface GardenDecor {
  id: string;
  type: DecorType;
  position: { x: number; y: number };  // % of scene (0–100)
}

export interface GardenState {
  plants: GardenPlant[];
  decor: GardenDecor[];
  /** Last Sunday planting offer fulfillment — prevents duplicate offers same week */
  lastWeeklyPlanting: string | null;  // ISO date of the *Sunday* when last planted
  /** Decor types the kid has access to (defaults seeded on first load) */
  ownedDecor: DecorType[];
}

export interface ComputedState {
  level: number;
  xpP: { cur: number; need: number };
  done: number;
  total: number;
  allDone: boolean;
  pct: number;
  mood: CatMood;
  dayN: string;
  byA: Record<string, Quest[]>;
}
