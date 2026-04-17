import type { Arc } from './types';

/**
 * Arc 2: The Listening Game
 * Theme: Evening routine — winding down, putting things away, reading before bed.
 * Teaches: transitioning from active play to calm bedtime preparation.
 *
 * 3 beats:
 *   1. Lore: Ronki describes a strange sound in the meadow — something is whispering.
 *   2. Craft: Louis makes a "listening jar" (a jar he fills with things he heard today).
 *   3. Routine: Complete the "5 Min lesen" bedtime quest to hear the whisper's secret.
 */
export const LISTENING_GAME: Arc = {
  id: 'listening-game',
  titleKey: 'arc.listening.title',
  chapterKey: 'arc.listening.chapter',
  beats: [
    {
      id: 'lg-b1-whisper',
      kind: 'lore',
      text: 'arc.listening.beats.whisper.text',
      narrativeBefore: 'arc.listening.beats.whisper.before',
      narrativeAfter: 'arc.listening.beats.whisper.after',
    },
    {
      id: 'lg-b2-jar',
      kind: 'craft',
      title: 'arc.listening.beats.jar.title',
      steps: [
        'arc.listening.beats.jar.step1',
        'arc.listening.beats.jar.step2',
        'arc.listening.beats.jar.step3',
        'arc.listening.beats.jar.step4',
      ],
      narrativeBefore: 'arc.listening.beats.jar.before',
      narrativeAfter: 'arc.listening.beats.jar.after',
    },
    {
      id: 'lg-b3-read',
      kind: 'routine',
      questId: 's8', // 5 Min lesen (bedtime)
      narrativeBefore: 'arc.listening.beats.read.before',
      narrativeAfter: 'arc.listening.beats.read.after',
    },
  ],
  rewardOnComplete: {
    xp: 60,
    coins: 12,
    traitIds: ['gentle'],
  },
  cooldownHours: 24,
};
