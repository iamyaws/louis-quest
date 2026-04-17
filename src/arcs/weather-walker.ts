import type { Arc } from './types';

/**
 * Arc 4: The Weather Walker
 * Theme: Getting dressed for the weather — independence and awareness.
 * Teaches: checking conditions, making choices, dressing yourself.
 *
 * 3 beats:
 *   1. Lore: Ronki got caught in the rain and learned that the sky gives hints.
 *   2. Craft: Louis draws what he would wear on a sunny day vs a rainy day.
 *   3. Routine: Complete "Anziehen" (getting dressed) — Ronki connects
 *      checking the weather to the morning routine.
 */
export const WEATHER_WALKER: Arc = {
  id: 'weather-walker',
  titleKey: 'arc.weather.title',
  chapterKey: 'arc.weather.chapter',
  beats: [
    {
      id: 'ww-b1-rain',
      kind: 'lore',
      text: 'arc.weather.beats.rain.text',
      narrativeBefore: 'arc.weather.beats.rain.before',
      narrativeAfter: 'arc.weather.beats.rain.after',
    },
    {
      id: 'ww-b2-draw',
      kind: 'craft',
      title: 'arc.weather.beats.draw.title',
      steps: [
        'arc.weather.beats.draw.step1',
        'arc.weather.beats.draw.step2',
        'arc.weather.beats.draw.step3',
        'arc.weather.beats.draw.step4',
      ],
      narrativeBefore: 'arc.weather.beats.draw.before',
      narrativeAfter: 'arc.weather.beats.draw.after',
    },
    {
      id: 'ww-b3-dress',
      kind: 'routine',
      questId: 's4', // Anziehen (morning)
      narrativeBefore: 'arc.weather.beats.dress.before',
      narrativeAfter: 'arc.weather.beats.dress.after',
    },
  ],
  rewardOnComplete: {
    xp: 50,
    coins: 10,
    traitIds: ['brave'],
  },
  cooldownHours: 24,
};
