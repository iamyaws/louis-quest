import type { VoiceLine } from '../types';

/**
 * English voice bank — Harry voice. Mirrors lines/de.ts 1:1 with `en_`
 * prefix on every ID so a bilingual family hears the same Ronki when
 * switching languages. Same engine-routed scope (no direct-play here —
 * those are managed by feature code via VoiceAudio.playLocalized).
 *
 * 2026-04-26 northstar pass — restructured to match the rewritten DE
 * bank: cuts (over-loud, redundant, paused-feature) and tone-downs
 * applied symmetrically. Translations are natural English, not
 * mechanical — keeps the curious-younger-friend voice intact.
 */

export const linesEn: VoiceLine[] = [
  // ── Greetings ──
  { id: 'en_greet_01', text: 'You’re here! Finally!', triggers: ['hub_open'] },
  { id: 'en_greet_morning_01', text: 'Morning! I just yawned too.', triggers: ['hub_open'], timeOfDay: ['morning'] },
  { id: 'en_greet_afternoon_01', text: 'How was school? Tell me.', triggers: ['hub_open'], timeOfDay: ['afternoon'] },
  { id: 'en_greet_evening_01', text: 'Evening. It’s about to get cosy.', triggers: ['hub_open'], timeOfDay: ['evening'] },
  { id: 'en_greet_night_01', text: 'Dark outside. Warm in here.', triggers: ['hub_open'], timeOfDay: ['night'] },

  // ── Sanctuary open ──
  { id: 'en_sanct_01', text: 'You’re here! I was running in circles.', triggers: ['sanctuary_open'] },
  { id: 'en_sanct_02', text: 'Smell that? The meadow smells like adventure.', triggers: ['sanctuary_open'] },
  { id: 'en_sanct_03', text: 'You know what? I tried catching a butterfly today. Didn’t go great.', triggers: ['sanctuary_open'] },

  // ── Weather ──
  { id: 'en_w_rain_01', text: 'It’s raining! Puddles are the best.', triggers: ['hub_open', 'sanctuary_open'], weather: ['rain'] },
  { id: 'en_w_cold_01', text: 'Brrr! Bundle up. I’ve got scales, I’m fine.', triggers: ['hub_open', 'sanctuary_open'], weather: ['cold'] },
  { id: 'en_w_hot_01', text: 'So warm. I’m lying in the sun all day.', triggers: ['hub_open', 'sanctuary_open'], weather: ['hot', 'clear'] },
  { id: 'en_w_snow_01', text: 'Snow! I’ve never— okay, yes, last year. Still beautiful.', triggers: ['hub_open', 'sanctuary_open'], weather: ['snow'] },

  // ── Idle wonder ──
  { id: 'en_idle_01', text: 'Do you think clouds are as soft as they look?', triggers: ['idle'] },
  { id: 'en_idle_02', text: 'I tried catching my own tail. Didn’t work.', triggers: ['idle'] },
  { id: 'en_idle_03', text: 'What would you be if you weren’t a person? I’d be a… dragon. Oh wait, right.', triggers: ['idle'] },

  // ── Mood-aware ──
  { id: 'en_mood_sad_01',     text: 'Hey... I’m a bit quiet today too. Want to just sit together?', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'en_mood_tired_01',   text: 'I’m yawning too. Let’s take it slow today.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'en_mood_happy_01',   text: 'You’re glowing today. What happened?', triggers: ['hub_open'], mood: ['magisch', 'gut'] },
  { id: 'en_mood_okay_01',    text: 'Somewhere-in-between is good too. Not every day has to sparkle.', triggers: ['hub_open'], mood: ['okay'] },
  { id: 'en_mood_worried_01', text: 'Did something happen? You can tell me — or just be here.', triggers: ['hub_open'], mood: ['besorgt'] },

  // ── Quest complete ──
  { id: 'en_quest_01', text: 'Did you just do that? Nice.', triggers: ['quest_complete'] },
  { id: 'en_quest_02', text: 'I was watching. That was really really good.', triggers: ['quest_complete'] },
  { id: 'en_quest_streak_01', text: 'Three already. You’re keeping a steady pace, I like that.', triggers: ['quest_complete'], minQuestsToday: 3 },

  // ── All done — calm celebration ──
  { id: 'en_alldone_recognition_01', text: 'All done today. I see it, I see it.', triggers: ['all_done'] },
  { id: 'en_alldone_recognition_02', text: 'Today was a good day with you. Let’s sit a moment.', triggers: ['all_done'] },

  // ── Care actions ──
  { id: 'en_care_fed_01',  text: 'Mmmm! Yum! Did you eat too?', triggers: ['care_action'], careAction: ['fed'] },
  { id: 'en_care_pet_01',  text: 'Hihihi! That tickles! Again.', triggers: ['care_action'], careAction: ['petted'] },
  { id: 'en_care_play_01', text: 'Play! Come, catch me!', triggers: ['care_action'], careAction: ['played'] },

  // ── Freund met ──
  { id: 'en_freund_met_01', text: 'Look who’s here.', triggers: ['freund_met'] },
  { id: 'en_freund_met_02', text: 'My heart goes thumpthumpthump. That happens with new friends.', triggers: ['freund_met'] },

  // ── Identity ──
  { id: 'en_identity_01', text: 'I told the fireflies you always brush your teeth. They were really impressed.', triggers: ['quest_complete'], minQuestsToday: 1 },
  { id: 'en_identity_03', text: 'You know what? You’re someone who can be counted on. I’ve noticed that.', triggers: ['hub_open'] },

  // ── Trait-gated ──
  { id: 'en_trait_brave_01',  text: 'You’re someone who doesn’t give up. I know that now.', triggers: ['hub_open', 'quest_complete'], requiredTraits: ['brave'] },
  { id: 'en_trait_gentle_01', text: 'Your calm is good for everyone. Me too.', triggers: ['hub_open', 'sanctuary_open'], requiredTraits: ['gentle'] },

  // ── Arc context — paused (mirrors DE bank) ──
  { id: 'en_arc_cooldown_01', text: 'I’m still resting from the last adventure. But you keep going!', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'en_arc_cooldown_02', text: 'Phew, that was something. I need a little nap.', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'en_arc_active_01',   text: 'We’re in the middle of an adventure! Look up top.', triggers: ['hub_open'], arcPhase: 'active' },
  { id: 'en_arc_active_02',   text: 'Our adventure is waiting! I’m so excited.', triggers: ['hub_open'], arcPhase: 'active' },
];
