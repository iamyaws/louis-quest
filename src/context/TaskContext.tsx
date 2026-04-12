import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Quest, GameState, Boss } from '../types';
import { buildDay } from '../utils/helpers';
import { BOSSES } from '../constants';
import storage from '../utils/storage';

// ── Minimal state shape for the task list ──
interface TaskState {
  quests: Quest[];
  sm: Record<string, number>;
  sd: number;
  lastDate: string;
  vacMode: boolean;
  dt: number;
  hp: number;
  drachenEier: number;
  eggType: string | null;
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
}

interface TaskComputed {
  done: number;
  total: number;
  allDone: boolean;
  pct: number;
  byGroup: Record<string, Quest[]>;
}

interface TaskActions {
  complete: (id: string) => void;
  setMood: (period: string, val: number) => void;
  drinkWater: () => void;
  feedCompanion: () => void;
  petCompanion: () => void;
  playCompanion: () => void;
  collectLoginBonus: () => void;
}

interface TaskContextValue {
  state: TaskState | null;
  computed: TaskComputed;
  actions: TaskActions;
  loading: boolean;
}

function assignBoss(): Boss {
  // Tier 1 bosses for now (tier system can expand later)
  const tier1 = BOSSES.filter(b => b.tier === 'tier1');
  const b = tier1[Math.floor(Math.random() * tier1.length)];
  return { id: b.id, hp: b.hp, maxHp: b.hp };
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function useTask() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyComputed: TaskComputed = { done: 0, total: 0, allDone: false, pct: 0, byGroup: {} };

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TaskState | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Load on mount ──
  useEffect(() => {
    (async () => {
      const raw = await storage.load() as (GameState & TaskState) | null;
      if (raw && raw.quests) {
        let s: TaskState = {
          quests: raw.quests,
          sm: raw.sm || {},
          sd: raw.sd || 0,
          lastDate: raw.lastDate || '',
          vacMode: raw.vacMode || false,
          dt: raw.dt || 0,
          hp: raw.coins || raw.hp || 0,
          drachenEier: raw.drachenEier || 0,
          eggType: raw.eggType || 'dragon',
          eggProgress: raw.eggProgress || 0,
          eggHatched: raw.eggHatched || false,
          moodAM: raw.moodAM ?? null,
          moodPM: raw.moodPM ?? null,
          dailyWaterCount: raw.dailyWaterCount || 0,
          boss: raw.boss || null,
          bossTrophies: raw.bossTrophies || [],
          catFed: raw.catFed || false,
          catPetted: raw.catPetted || false,
          catPlayed: raw.catPlayed || false,
          catEvo: raw.catEvo || 0,
          loginBonusClaimed: raw.loginBonusClaimed || false,
        };
        // Day transition: rebuild quests if date changed
        if (s.lastDate !== today()) {
          s = applyDayTransition(s);
        }
        // Ensure boss exists and has art (migrate old tier2/3 bosses)
        const tier1Ids = BOSSES.filter(b => b.tier === 'tier1').map(b => b.id);
        if (!s.boss || !tier1Ids.includes(s.boss.id)) s.boss = assignBoss();
        setState(s);
      } else {
        // Fresh start
        const quests = buildDay(false);
        setState({
          quests,
          sm: {},
          sd: 0,
          lastDate: today(),
          vacMode: false,
          dt: 0,
          hp: 0,
          drachenEier: 0,
          eggType: 'dragon',
          eggProgress: 0,
          eggHatched: false,
          moodAM: null,
          moodPM: null,
          dailyWaterCount: 0,
          boss: assignBoss(),
          bossTrophies: [],
          catFed: false,
          catPetted: false,
          catPlayed: false,
          catEvo: 0,
          loginBonusClaimed: false,
        });
      }
      setLoading(false);
    })();
  }, []);

  // ── Save on state change (debounced) ──
  useEffect(() => {
    if (!state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      // Merge into full GameState for storage compatibility
      const raw = await storage.load() as GameState | null;
      const merged = { ...(raw || {}), ...state } as GameState;
      await storage.save(merged);
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

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
    const newSd = allDoneYesterday ? s.sd + 1 : 0;

    // Rebuild quests for today, preserve streaks
    const quests = buildDay(s.vacMode).map(q => ({
      ...q,
      streak: newSm[q.id] || 0,
    }));

    return {
      ...s,
      quests,
      sm: newSm,
      sd: newSd,
      lastDate: today(),
      dt: 0,
      moodAM: null,
      moodPM: null,
      dailyWaterCount: 0,
      boss: assignBoss(),
      catFed: false,
      catPetted: false,
      catPlayed: false,
      loginBonusClaimed: false,
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

      // Boss damage
      let boss = prev.boss ? { ...prev.boss } : null;
      let bossTrophies = [...(prev.bossTrophies || [])];
      if (boss && boss.hp > 0) {
        const dmg = Math.max(5, Math.floor(q.xp * 0.8));
        boss.hp = Math.max(0, boss.hp - dmg);
        if (boss.hp <= 0) {
          const bd = BOSSES.find(b => b.id === boss!.id);
          if (bd) hp += bd.reward.hp;
          if (!bossTrophies.includes(boss.id)) bossTrophies.push(boss.id);
        }
      }

      return { ...prev, quests, dt, hp, boss, bossTrophies };
    });
  }, []);

  // ── Set mood ──
  const setMood = useCallback((period: string, val: number) => {
    setState(prev => prev ? { ...prev, [period]: val } : prev);
  }, []);

  // ── Drink water ──
  const drinkWater = useCallback(() => {
    setState(prev => {
      if (!prev || (prev.dailyWaterCount || 0) >= 6) return prev;
      return { ...prev, dailyWaterCount: (prev.dailyWaterCount || 0) + 1, hp: (prev.hp || 0) + 2 };
    });
  }, []);

  // ── Companion care ──
  const feedCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catFed) return prev;
      return { ...prev, catFed: true, hp: (prev.hp || 0) + 5, catEvo: (prev.catEvo || 0) + 1 };
    });
  }, []);

  const petCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPetted) return prev;
      return { ...prev, catPetted: true, hp: (prev.hp || 0) + 3, catEvo: (prev.catEvo || 0) + 1 };
    });
  }, []);

  const playCompanion = useCallback(() => {
    setState(prev => {
      if (!prev || prev.catPlayed) return prev;
      return { ...prev, catPlayed: true, hp: (prev.hp || 0) + 8, catEvo: (prev.catEvo || 0) + 1 };
    });
  }, []);

  // ── Login bonus ──
  const collectLoginBonus = useCallback(() => {
    setState(prev => {
      if (!prev || prev.loginBonusClaimed) return prev;
      return { ...prev, loginBonusClaimed: true, hp: (prev.hp || 0) + 5 };
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
    return { done, total, allDone, pct, byGroup };
  })() : emptyComputed;

  return (
    <TaskContext.Provider value={{ state, computed, actions: { complete, setMood, drinkWater, feedCompanion, petCompanion, playCompanion, collectLoginBonus }, loading }}>
      {children}
    </TaskContext.Provider>
  );
}
