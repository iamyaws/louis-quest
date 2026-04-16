import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { EGG_TRIGGERS } from '../data/eggTriggers';

export function useEggSystem() {
  const { state, actions } = useTask();

  useEffect(() => {
    if (!state) return;
    if (state.pendingEgg) return; // wait for current egg to be collected

    const fired = state.eggTriggersFired || {};

    for (const trigger of EGG_TRIGGERS) {
      if (fired[trigger.id]) continue;
      if (trigger.condition(state)) {
        actions.spawnEgg({
          triggerId: trigger.id,
          view: trigger.view,
          labelDe: trigger.labelDe,
          labelEn: trigger.labelEn,
          accentColor: trigger.accentColor,
        });
        break; // only one at a time
      }
    }
  }, [state]);
}
