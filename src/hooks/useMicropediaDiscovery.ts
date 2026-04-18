import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';

/**
 * useMicropediaDiscovery — unlocks creatures when conditions match.
 * Runs on every render, idempotent. Once unlocked, stays unlocked.
 *
 * Each trigger:
 *   - id: matches the creature ID in Micropedia SEED_CREATURES
 *   - chapter: which Micropedia chapter the creature belongs to
 *   - condition: pure function of state, true = unlock
 */

export interface DiscoveryTrigger {
  id: string;
  condition: (state: any) => boolean;
  chapter: 'forest' | 'sky' | 'water' | 'dream' | 'hearth';
}

export const CREATURE_TRIGGERS: DiscoveryTrigger[] = [
  // Forest — earned by doing daily tasks
  { id: 'forest_0', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 1 },
  { id: 'forest_1', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 3 },
  { id: 'forest_2', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 10 },
  { id: 'forest_3', chapter: 'forest', condition: s => (s.arcEngine?.completedArcIds || []).includes('first-adventure') },
  // Baumbart — rewards deep habit formation (30+ tasks done)
  { id: 'forest_4', chapter: 'forest', condition: s => (s.totalTasksDone || 0) >= 30 },
  // Mr. Shroom — unlocks after completing the Pilzhüter reunion arc (Freund-arc engagement)
  { id: 'forest_5', chapter: 'forest', condition: s => (s.freundArcsCompleted || []).includes('freund-pilzhueter') },
  // Pilz-Jeti — rewards closing the day well (3+ evening ritual completions, tracked via journalGratitude)
  { id: 'forest_6', chapter: 'forest', condition: s => (s.journalGratitude || []).length >= 3 },
  // Sky — game exploration
  { id: 'sky_0', chapter: 'sky', condition: s => (s.viewsVisited || []).includes('games') },
  // Water — care + journal
  { id: 'water_0', chapter: 'water', condition: s => (s.dailyWaterCount || 0) >= 6 },
  { id: 'water_1', chapter: 'water', condition: s => (s.journalHistory || []).length >= 1 },
  { id: 'water_2', chapter: 'water', condition: s => (s.catFed && s.catPetted && s.catPlayed) },
  { id: 'water_3', chapter: 'water', condition: s => (s.bossTrophies || []).length >= 1 },
  // Dream — reflection
  { id: 'dream_0', chapter: 'dream', condition: s => s.moodAM !== null && s.moodAM !== undefined },
  { id: 'dream_1', chapter: 'dream', condition: s => (s.journalHistory || []).length >= 3 },
  { id: 'dream_2', chapter: 'dream', condition: s => (s.arcEngine?.completedArcIds || []).length >= 2 },
  // Hearth — relationship-driven
  { id: 'hearth_0', chapter: 'hearth', condition: s => (s.catEvo || 0) >= 2 },
];

type DiscoveredEntry = { id: string; chapter: string; discoveredAt: string };

export function useMicropediaDiscovery(onDiscover?: (id: string) => void) {
  const { state, actions } = useTask();

  useEffect(() => {
    if (!state) return;
    const discovered: DiscoveredEntry[] = state.micropediaDiscovered || [];
    const discoveredIds = new Set(discovered.map(d => d.id));
    const newOnes = CREATURE_TRIGGERS.filter(t => !discoveredIds.has(t.id) && t.condition(state));

    if (newOnes.length === 0) return;

    const now = new Date().toISOString();
    const next = [
      ...discovered,
      ...newOnes.map(t => ({ id: t.id, chapter: t.chapter, discoveredAt: now })),
    ];
    actions.patchState({ micropediaDiscovered: next });

    // Notify UI of the first new discovery (toast one at a time)
    if (onDiscover && newOnes.length > 0) {
      onDiscover(newOnes[0].id);
    }
  }, [state, actions, onDiscover]);
}
