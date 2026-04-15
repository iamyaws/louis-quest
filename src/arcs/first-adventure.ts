import type { Arc } from './types';

/**
 * Phase 1 test arc. 3 beats:
 *   1. Lore beat — Ronki describes his strange dream
 *   2. Craft beat — Louis draws a map of a favorite place
 *   3. Routine beat — Louis completes any morning routine to "wake Ronki fully"
 *
 * This arc teaches the mechanic and ships the end-to-end flow.
 */
export const FIRST_ADVENTURE: Arc = {
  id: 'first-adventure',
  titleKey: 'arc.first.title',
  chapterKey: 'arc.first.chapter',
  beats: [
    {
      id: 'fa-b1-dream',
      kind: 'lore',
      text: 'arc.first.beats.dream.text',
      narrativeBefore: 'arc.first.beats.dream.before',
      narrativeAfter: 'arc.first.beats.dream.after',
    },
    {
      id: 'fa-b2-map',
      kind: 'craft',
      title: 'arc.first.beats.map.title',
      steps: [
        'arc.first.beats.map.step1',
        'arc.first.beats.map.step2',
        'arc.first.beats.map.step3',
        'arc.first.beats.map.step4',
      ],
      narrativeBefore: 'arc.first.beats.map.before',
      narrativeAfter: 'arc.first.beats.map.after',
    },
    {
      id: 'fa-b3-wake',
      kind: 'routine',
      // Zähne putzen (brush teeth) — the most iconic morning quest.
      // On school days this is SCHOOL_QUESTS 's3' (morning). On vacation days
      // the equivalent is VACATION_QUESTS 'v3'; the beat will only auto-advance
      // on school days for Phase 1. Phase 2 may unify quest ids or teach the
      // engine to match on name rather than id.
      questId: 's3',
      narrativeBefore: 'arc.first.beats.wake.before',
      narrativeAfter: 'arc.first.beats.wake.after',
    },
  ],
  rewardOnComplete: {
    xp: 50,
    coins: 10,
    // Phase 2: add eggId + decorId
  },
  cooldownHours: 48,
};
