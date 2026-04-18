import type { Arc } from './types';

/**
 * Freund arc: Pilzhüter — Ronki's reunion with the old forest guide.
 * 4 beats: Reunion (lore) → Baum-Pose (craft) → Real Life tie-in (routine)
 *         → Callback (lore, fires 5-7 days after beat 3).
 *
 * The callback beat is scheduled in TaskState.freundCallbacksPending by
 * useSpecialQuests when beat 3 completes.
 */
export const FREUND_PILZHUETER: Arc = {
  id: 'freund-pilzhueter',
  titleKey: 'arc.pilzhueter.title',
  chapterKey: 'arc.pilzhueter.chapter',
  freundId: 'pilzhueter',
  beats: [
    {
      id: 'pil-b1-reunion',
      kind: 'lore',
      text: 'arc.pilzhueter.beats.reunion.text',
      narrativeBefore: 'arc.pilzhueter.beats.reunion.before',
      narrativeAfter: 'arc.pilzhueter.beats.reunion.after',
    },
    {
      id: 'pil-b2-pose',
      kind: 'craft',
      title: 'arc.pilzhueter.beats.pose.title',
      steps: [
        'arc.pilzhueter.beats.pose.step1',
        'arc.pilzhueter.beats.pose.step2',
        'arc.pilzhueter.beats.pose.step3',
        'arc.pilzhueter.beats.pose.step4',
      ],
      narrativeBefore: 'arc.pilzhueter.beats.pose.before',
      narrativeAfter: 'arc.pilzhueter.beats.pose.after',
    },
    {
      id: 'pil-b3-realife',
      kind: 'routine',
      questId: 's3', // Zähne putzen (morning), same quest first-adventure ties to
      narrativeBefore: 'arc.pilzhueter.beats.realife.before',
      narrativeAfter: 'arc.pilzhueter.beats.realife.after',
    },
    {
      id: 'pil-b4-callback',
      kind: 'lore',
      text: 'arc.pilzhueter.beats.callback.text',
      narrativeBefore: 'arc.pilzhueter.beats.callback.before',
      narrativeAfter: 'arc.pilzhueter.beats.callback.after',
    },
  ],
  rewardOnComplete: {
    xp: 60,
    coins: 15,
    traitIds: ['gentle', 'patient'],
  },
  cooldownHours: 24,
};
