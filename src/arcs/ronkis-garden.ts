import type { Arc } from './types';

/**
 * Arc 3: Ronki's Garden
 * Theme: Daily care and responsibility — nurturing something that grows.
 * Teaches: the connection between daily small actions and visible growth.
 *
 * 3 beats:
 *   1. Lore: Ronki finds a tiny seed in the meadow and wonders what it could become.
 *   2. Craft: Louis plants a real seed (or draws a plant) and puts it by the window.
 *   3. Routine: Complete "Bett machen" (making the bed) — Ronki connects
 *      tidying your space to tending a garden.
 */
export const RONKIS_GARDEN: Arc = {
  id: 'ronkis-garden',
  titleKey: 'arc.garden.title',
  chapterKey: 'arc.garden.chapter',
  beats: [
    {
      id: 'rg-b1-seed',
      kind: 'lore',
      text: 'arc.garden.beats.seed.text',
      narrativeBefore: 'arc.garden.beats.seed.before',
      narrativeAfter: 'arc.garden.beats.seed.after',
    },
    {
      id: 'rg-b2-plant',
      kind: 'craft',
      title: 'arc.garden.beats.plant.title',
      steps: [
        'arc.garden.beats.plant.step1',
        'arc.garden.beats.plant.step2',
        'arc.garden.beats.plant.step3',
        'arc.garden.beats.plant.step4',
      ],
      narrativeBefore: 'arc.garden.beats.plant.before',
      narrativeAfter: 'arc.garden.beats.plant.after',
    },
    {
      id: 'rg-b3-tidy',
      kind: 'routine',
      questId: 's2', // Bett machen (morning)
      narrativeBefore: 'arc.garden.beats.tidy.before',
      narrativeAfter: 'arc.garden.beats.tidy.after',
    },
  ],
  rewardOnComplete: {
    xp: 55,
    coins: 10,
    traitIds: ['patient'],
  },
  cooldownHours: 48,
};
