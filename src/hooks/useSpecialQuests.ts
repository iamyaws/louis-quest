import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { SPECIAL_QUESTS } from '../data/specialQuests';
import type { TaskState } from '../context/TaskContext';

function checkTrigger(trigger: string, state: TaskState): boolean {
  switch (trigger) {
    case 'totalTasks_1':  return (state.totalTasksDone || 0) >= 1;
    case 'totalTasks_10': return (state.totalTasksDone || 0) >= 10;
    case 'firstBoss':     return (state.bossTrophies || []).length >= 1;
    case 'firstJournal':  return (state.journalHistory || []).length >= 1;
    case 'screenMin':     return (state.drachenEier || 0) >= 1;
    case 'careVisit':     return (state.viewsVisited || []).includes('care');
    case 'gamesVisit':    return (state.viewsVisited || []).includes('games');
    case 'memoriesVisit': return (state.viewsVisited || []).includes('memories');
    case 'moodSet':       return state.moodAM !== null;
    case 'waterFull':     return (state.dailyWaterCount || 0) >= 6;
    default: return false;
  }
}

export function useSpecialQuests() {
  const { state, actions } = useTask();

  useEffect(() => {
    if (!state) return;
    const completed = state.completedSpecialQuests || {};
    SPECIAL_QUESTS.forEach(quest => {
      if (completed[quest.id]) return;
      if (checkTrigger(quest.trigger, state)) {
        actions.completeSpecialQuest(quest.id);
      }
    });
  }, [state]);

  const completed = state?.completedSpecialQuests || {};
  const totalDone = Object.values(completed).filter(Boolean).length;

  return {
    quests: SPECIAL_QUESTS,
    completed,
    totalDone,
    total: SPECIAL_QUESTS.length,
  };
}
