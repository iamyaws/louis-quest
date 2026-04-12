import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Quest, GameState } from '../types';
import { buildDay } from '../utils/helpers';
import storage from '../utils/storage';

// ── Minimal state shape for the task list ──
interface TaskState {
  quests: Quest[];
  sm: Record<string, number>;  // streak map
  sd: number;                   // streak days
  lastDate: string;
  vacMode: boolean;
  dt: number;                   // earned minutes today
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
}

interface TaskContextValue {
  state: TaskState | null;
  computed: TaskComputed;
  actions: TaskActions;
  loading: boolean;
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
        };
        // Day transition: rebuild quests if date changed
        if (s.lastDate !== today()) {
          s = applyDayTransition(s);
        }
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
    };
  }

  // ── Complete a quest ──
  const complete = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      const quests = prev.quests.map(q => {
        if (q.id !== id) return q;
        const completions = (q.completions || 0) + 1;
        const target = q.target || 1;
        const done = completions >= target;
        return { ...q, completions, done };
      });
      const dt = prev.dt + (prev.quests.find(q => q.id === id)?.minutes || 0);
      return { ...prev, quests, dt };
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
    <TaskContext.Provider value={{ state, computed, actions: { complete }, loading }}>
      {children}
    </TaskContext.Provider>
  );
}
