import { useMemo } from 'react';
import type { GardenState, GardenPlant, PlantStage } from '../types';

/**
 * useGardenWitness — detects plants that crossed a stage boundary since
 * they were last witnessed by the kid.
 *
 * Phase 2 of the core-gameloop-time-stack (Q7 C+ milestone-aged + Q8 D
 * Ronki invites). The rule:
 *
 *   1. Each plant's CURRENT stage is computed as a pure function of
 *      `today - plantedAt` (the same thresholds GardenScene uses to
 *      pick which shape to render).
 *   2. state.garden.witnessedStages[plantId] records the highest stage
 *      the kid has seen + dismissed. When current > witnessed, a
 *      witness beat is pending.
 *   3. Only ONE pending beat at a time surfaces (the oldest plant with
 *      a pending crossing) — keeps Ronki's invitations calm, not a
 *      flurry. Others queue naturally on subsequent opens.
 *   4. Sprout doesn't fire — it's the plant's initial state. First
 *      real witness is young (~7 days after plantedAt). This avoids a
 *      "Ronki invites you back within seconds" gotcha.
 *
 * Returns either null (no pending beat) or an object:
 *   { plant: GardenPlant; newStage: PlantStage; prevStage: PlantStage | null }
 *
 * Demo plants (id prefix "demo-") are filtered out — they're rendered
 * as atmosphere in empty-state, not part of the kid's lived time-stack.
 */

const STAGE_ORDER: PlantStage[] = ['sprout', 'young', 'mid', 'mature'];

function stageIndex(s: PlantStage | null | undefined): number {
  if (!s) return -1;
  return STAGE_ORDER.indexOf(s);
}

/** Pure-function stage computation. Matches GardenScene.defaultStage
 *  so the UI + scheduler agree on "what stage are we in". Duplicated
 *  intentionally (hook can't import from GardenScene without pulling
 *  in CSS). */
function currentStage(plantedAt: string): PlantStage {
  const d = new Date(plantedAt);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 7) return 'sprout';
  if (days < 30) return 'young';
  if (days < 90) return 'mid';
  return 'mature';
}

export interface PendingWitness {
  plant: GardenPlant;
  newStage: PlantStage;
  prevStage: PlantStage | null;
}

export function useGardenWitness(garden: GardenState | undefined): PendingWitness | null {
  return useMemo(() => {
    if (!garden) return null;
    const seen = garden.witnessedStages || {};

    // state.garden.plants only ever holds REAL kid-planted trees —
    // demo atmosphere plants live in a separate render-only list on
    // GardenScene (isolation refactor 24 Apr 2026), never stored in
    // state. So we can trust this array directly without filtering.
    const realPlants = garden.plants;
    if (realPlants.length === 0) return null;

    // Find the oldest plant whose current stage exceeds what the kid
    // has witnessed AND isn't still at sprout (we don't fire on sprout).
    // Oldest-first so the first thing the kid planted gets its witness
    // beat before newer ones.
    const sortedByAge = [...realPlants].sort((a, b) =>
      a.plantedAt.localeCompare(b.plantedAt)
    );

    for (const plant of sortedByAge) {
      const now = currentStage(plant.plantedAt);
      if (now === 'sprout') continue;
      const witnessedLevel = stageIndex(seen[plant.id] ?? null);
      const currentLevel = stageIndex(now);
      if (currentLevel > witnessedLevel) {
        return {
          plant,
          newStage: now,
          prevStage: seen[plant.id] ?? null,
        };
      }
    }
    return null;
  }, [garden]);
}

/** Localized voice line for Ronki's invitation + witness narration.
 *  v1 keeps these inline (no i18n file change required). Phase 3 can
 *  move into de.json / en.json for proper localization. */
export function witnessVoiceLine(
  plantedSpecies: string,
  stage: PlantStage,
  lang: 'de' | 'en' = 'de'
): { invite: string; reveal: string } {
  const speciesName = lang === 'de'
    ? { oak: 'Eiche', apple: 'Apfel', birch: 'Birke', pine: 'Kiefer', linden: 'Linde', fir: 'Tanne' }[plantedSpecies] ?? 'Bäumchen'
    : { oak: 'Oak', apple: 'Apple', birch: 'Birch', pine: 'Pine', linden: 'Linden', fir: 'Fir' }[plantedSpecies] ?? 'sapling';

  const de = {
    young: {
      invite: 'Komm mal — du musst was sehen.',
      reveal: `Dein ${speciesName} ist zum Bäumchen geworden.`,
    },
    mid: {
      invite: 'Hast du das gesehen?',
      reveal: `Dein ${speciesName} ist echt gewachsen.`,
    },
    mature: {
      invite: 'Schau nur …',
      reveal: `Dein ${speciesName} ist ein richtiger Baum geworden.`,
    },
    sprout: {
      invite: '',
      reveal: '',
    },
  } as const;

  const en = {
    young: {
      invite: 'Come here — you have to see this.',
      reveal: `Your ${speciesName} has grown into a little tree.`,
    },
    mid: {
      invite: 'Did you see that?',
      reveal: `Your ${speciesName} has really grown.`,
    },
    mature: {
      invite: 'Look at this …',
      reveal: `Your ${speciesName} has become a real tree.`,
    },
    sprout: {
      invite: '',
      reveal: '',
    },
  } as const;

  return lang === 'en' ? en[stage] : de[stage];
}
