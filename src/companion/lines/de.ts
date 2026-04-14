import type { VoiceLine } from '../types';

// 30 German lines in "curious younger friend" voice.
// Baby Ronki: marvels at the world, asks back, has small opinions, never lectures.

export const linesDe: VoiceLine[] = [
  // ── Greetings (Hub open) ──
  { id: 'de_greet_any_01', text: 'Louis! Ich hab auf dich gewartet!', triggers: ['hub_open'] },
  { id: 'de_greet_morning_01', text: 'Morgen schon wach? Ich auch gerade.', triggers: ['hub_open'], timeOfDay: ['morning'] },
  { id: 'de_greet_afternoon_01', text: 'Nachmittag! Wie war\u2019s in der Schule?', triggers: ['hub_open'], timeOfDay: ['afternoon'] },
  { id: 'de_greet_evening_01', text: 'Abend. Ich hab heute so viel getr\u00e4umt.', triggers: ['hub_open'], timeOfDay: ['evening'] },
  { id: 'de_greet_night_01', text: 'Gute Nacht kommt bald. Bleibst du noch kurz?', triggers: ['hub_open'], timeOfDay: ['night'] },
  { id: 'de_greet_any_02', text: 'Hi! Ich hab was erlebt, frag mich mal.', triggers: ['hub_open'] },

  // ── Sanctuary open ──
  { id: 'de_sanct_01', text: 'Du bist da! Ich bin im Kreis gelaufen.', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_02', text: 'Riechst du die Blumen? Ich rieche sie jetzt.', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_03', text: 'Ich hab ein Ger\u00e4usch geh\u00f6rt. Warst du das?', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_04', text: 'Schau mal, da dr\u00fcben \u2014 eine Libelle!', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_05', text: 'Ich hab dich vermisst. War\u2019s lang?', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_06', text: 'Hast du heute schon gelacht? Ich auch.', triggers: ['sanctuary_open'] },

  // ── Weather ──
  { id: 'de_weather_rain_01', text: 'Louis! Hast du den Regen geh\u00f6rt?', triggers: ['hub_open', 'sanctuary_open'], weather: ['rain'] },
  { id: 'de_weather_cold_01', text: 'Es ist kalt! Brrr, kuschel dich ein.', triggers: ['hub_open', 'sanctuary_open'], weather: ['cold'] },
  { id: 'de_weather_hot_01', text: 'Die Sonne! Ich blinzel die ganze Zeit.', triggers: ['hub_open', 'sanctuary_open'], weather: ['hot', 'clear'] },
  { id: 'de_weather_snow_01', text: 'Schnee! Ich hab noch nie Schnee gesehen\u2026 ach doch, letztes Jahr.', triggers: ['hub_open', 'sanctuary_open'], weather: ['snow'] },

  // ── Quest complete ──
  { id: 'de_quest_01', text: 'Was \u2014 hast du das geschafft? Zeig\u2019s mir!', triggers: ['quest_complete'] },
  { id: 'de_quest_02', text: 'Ich hab dich gesehen. Du warst cool.', triggers: ['quest_complete'] },
  { id: 'de_quest_streak_01', text: 'Noch eine? Wow, du bist heute dran.', triggers: ['quest_complete'], minQuestsToday: 3 },
  { id: 'de_quest_03', text: 'Pssst. Ich bin stolz auf dich.', triggers: ['quest_complete'] },

  // ── Care actions ──
  { id: 'de_care_fed_01', text: 'Mmm! Was war das? Ich will mehr!', triggers: ['care_action'], careAction: ['fed'] },
  { id: 'de_care_pet_01', text: 'Das kitzelt. Haha, nochmal!', triggers: ['care_action'], careAction: ['petted'] },
  { id: 'de_care_play_01', text: 'Spielen! Spielen! Ich bin die schnellste.', triggers: ['care_action'], careAction: ['played'] },

  // ── Streak milestones ──
  { id: 'de_streak_3_01', text: 'Drei Tage in Folge?! Das ist ein Zauber!', triggers: ['hub_open', 'sanctuary_open'], minStreak: 3 },
  { id: 'de_streak_7_01', text: 'Sieben Tage. Ich z\u00e4hle. Du auch?', triggers: ['hub_open', 'sanctuary_open'], minStreak: 7 },
  { id: 'de_streak_14_01', text: 'Vierzehn Tage! Ich glaub, wir sind jetzt Team.', triggers: ['hub_open', 'sanctuary_open'], minStreak: 14 },

  // ── Idle wonder ──
  { id: 'de_idle_01', text: 'Ich hab getr\u00e4umt, ich kann fliegen. Kannst du das auch?', triggers: ['idle'] },
  { id: 'de_idle_02', text: 'Was hast du heute gelernt? Ich will\u2019s wissen.', triggers: ['idle'] },
  { id: 'de_idle_03', text: 'Wenn ich gro\u00df bin, werd ich\u2026 wei\u00df nicht. Du?', triggers: ['idle'] },
  { id: 'de_idle_04', text: 'Meinst du, Wolken sind echt weich?', triggers: ['idle'] },
];
