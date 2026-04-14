import type { VoiceLine } from '../types';

// 30 English lines — same IDs, same triggers, natural translation not mechanical.
// Keep the curious-younger-friend feel intact.

export const linesEn: VoiceLine[] = [
  // ── Greetings ──
  { id: 'en_greet_any_01', text: 'Louis! I was waiting for you!', triggers: ['hub_open'] },
  { id: 'en_greet_morning_01', text: 'Up already? Me too, just now.', triggers: ['hub_open'], timeOfDay: ['morning'] },
  { id: 'en_greet_afternoon_01', text: 'Afternoon! How was school?', triggers: ['hub_open'], timeOfDay: ['afternoon'] },
  { id: 'en_greet_evening_01', text: 'Evening. I had so many dreams today.', triggers: ['hub_open'], timeOfDay: ['evening'] },
  { id: 'en_greet_night_01', text: 'Bedtime is coming. Stay a bit?', triggers: ['hub_open'], timeOfDay: ['night'] },
  { id: 'en_greet_any_02', text: 'Hi! I saw something today. Ask me.', triggers: ['hub_open'] },

  // ── Sanctuary open ──
  { id: 'en_sanct_01', text: 'You\u2019re here! I was running in circles.', triggers: ['sanctuary_open'] },
  { id: 'en_sanct_02', text: 'Do you smell the flowers? I can smell them now.', triggers: ['sanctuary_open'] },
  { id: 'en_sanct_03', text: 'I heard a noise. Was that you?', triggers: ['sanctuary_open'] },
  { id: 'en_sanct_04', text: 'Look over there \u2014 a dragonfly!', triggers: ['sanctuary_open'] },
  { id: 'en_sanct_05', text: 'I missed you. Was it long?', triggers: ['sanctuary_open'] },
  { id: 'en_sanct_06', text: 'Did you laugh today? Me too.', triggers: ['sanctuary_open'] },

  // ── Weather ──
  { id: 'en_weather_rain_01', text: 'Louis! Did you hear the rain?', triggers: ['hub_open', 'sanctuary_open'], weather: ['rain'] },
  { id: 'en_weather_cold_01', text: 'It\u2019s cold! Brrr, cuddle up.', triggers: ['hub_open', 'sanctuary_open'], weather: ['cold'] },
  { id: 'en_weather_hot_01', text: 'The sun! I keep blinking.', triggers: ['hub_open', 'sanctuary_open'], weather: ['hot', 'clear'] },
  { id: 'en_weather_snow_01', text: 'Snow! I\u2019ve never seen snow\u2026 wait, yes, last year.', triggers: ['hub_open', 'sanctuary_open'], weather: ['snow'] },

  // ── Quest complete ──
  { id: 'en_quest_01', text: 'What \u2014 you did that? Show me!', triggers: ['quest_complete'] },
  { id: 'en_quest_02', text: 'I saw you. You were cool.', triggers: ['quest_complete'] },
  { id: 'en_quest_streak_01', text: 'Another? Wow, you\u2019re on a roll today.', triggers: ['quest_complete'], minQuestsToday: 3 },
  { id: 'en_quest_03', text: 'Psst. I\u2019m proud of you.', triggers: ['quest_complete'] },

  // ── Care actions ──
  { id: 'en_care_fed_01', text: 'Mmm! What was that? I want more!', triggers: ['care_action'], careAction: ['fed'] },
  { id: 'en_care_pet_01', text: 'That tickles. Haha, again!', triggers: ['care_action'], careAction: ['petted'] },
  { id: 'en_care_play_01', text: 'Play! Play! I\u2019m the fastest.', triggers: ['care_action'], careAction: ['played'] },

  // ── Streak milestones ──
  { id: 'en_streak_3_01', text: 'Three days in a row?! That\u2019s magic!', triggers: ['hub_open', 'sanctuary_open'], minStreak: 3 },
  { id: 'en_streak_7_01', text: 'Seven days. I\u2019m counting. You?', triggers: ['hub_open', 'sanctuary_open'], minStreak: 7 },
  { id: 'en_streak_14_01', text: 'Fourteen days! I think we\u2019re a team now.', triggers: ['hub_open', 'sanctuary_open'], minStreak: 14 },

  // ── Idle wonder ──
  { id: 'en_idle_01', text: 'I dreamed I could fly. Can you too?', triggers: ['idle'] },
  { id: 'en_idle_02', text: 'What did you learn today? I want to know.', triggers: ['idle'] },
  { id: 'en_idle_03', text: 'When I\u2019m big I\u2019ll be\u2026 I don\u2019t know. You?', triggers: ['idle'] },
  { id: 'en_idle_04', text: 'Do clouds feel soft, you think?', triggers: ['idle'] },
];
