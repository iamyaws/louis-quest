import { useState, useEffect, useRef } from 'react';
import {
  WEEKLY_MISSIONS, MAX_MONTHLY_FREEZES, REWARDS, BOSSES, BOSS_TIERS, DEFAULT_BELOHNUNGEN, isSchoolVacation,
} from '../constants';
import { buildDay, getCatStage } from '../utils/helpers';
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
        // Always check vacation status on load (not just day transition)
        const vacNow = isSchoolVacation(new Date());
        if (p.vacMode !== vacNow.isVacation) {
          p.vacMode = vacNow.isVacation;
          p.quests = buildDay(p.vacMode).map(q => ({ ...q, done: false, streak: (p.sm || {})[q.id] || 0 }));
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
