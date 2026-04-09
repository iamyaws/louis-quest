// ═══ HeroDex — Shared Type Definitions ═══

export interface Hero {
  name: string;
  shape: string;
  color: string;
  eyes: string;
  hair: string;
}

export interface Quest {
  id: string;
  name: string;
  icon: string;
  anchor: 'morning' | 'afternoon' | 'evening';
  xp: number;
  minutes: number;
  done: boolean;
  streak: number;
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
  type: 'coins' | 'xp' | 'minutes' | 'emoji';
  amount?: number;
  label: string;
  icon: string;
  id?: string;
}

export interface ChestReward {
  type: 'coins' | 'xp' | 'item' | 'minutes' | 'xpboost';
  amount?: number;
  id?: string;
  label: string;
  icon: string;
}

export interface WheelSegment {
  type: 'coins' | 'xp' | 'minutes' | 'rare';
  amount?: number;
  label: string;
  icon: string;
  color: string;
}

export interface WeeklyMission {
  id: string;
  title: string;
  story: string;
  goal: string;
  target: number;
  reward: { type: 'coins' | 'xp'; amount: number };
  icon: string;
}

export interface JournalQuestion {
  id: string;
  q: string;
  opts: { v: string; l: string }[];
}

export interface Badge {
  i: string;
  n: string;
}

export type CatMood = 'sleepy' | 'neutral' | 'happy' | 'excited';

export interface GameState {
  hero: Hero;
  catVariant: string;
  catName: string;
  xp: number;
  coins: number;
  quests: Quest[];
  rewards: Reward[];
  acc: string[];
  sd: number;
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
