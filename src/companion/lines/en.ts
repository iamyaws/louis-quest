import type { VoiceLine } from '../types';

// English voice bank — Harry voice, matches DE structure 1:1 (2026-04-25
// parity pass per Marc). Natural translation, not mechanical — keeps the
// curious-younger-friend feel intact. IDs mirror DE with en_ prefix so a
// bilingual family gets continuity when switching languages mid-session.

export const linesEn: VoiceLine[] = [
  // ── Greetings ──
  { id: 'en_greet_any_01', text: '{name}! I was waiting for you!', triggers: ['hub_open'] },
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
  { id: 'en_weather_rain_01', text: '{name}! Did you hear the rain?', triggers: ['hub_open', 'sanctuary_open'], weather: ['rain'] },
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

  // ── Idle wonder ──
  { id: 'en_idle_01', text: 'I dreamed I could fly. Can you too?', triggers: ['idle'] },
  { id: 'en_idle_02', text: 'What did you learn today? I want to know.', triggers: ['idle'] },
  { id: 'en_idle_03', text: 'When I\u2019m big I\u2019ll be\u2026 I don\u2019t know. You?', triggers: ['idle'] },
  { id: 'en_idle_04', text: 'Do clouds feel soft, you think?', triggers: ['idle'] },

  // ── Arc voice lines ──
  { id: 'en_arc_cooldown_01', text: 'I am still resting. But your routines keep me warm.', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'en_arc_cooldown_02', text: 'Phew, that was an adventure. I need a little sleep. See you soon!', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'en_arc_active_01', text: 'We are in the middle of an adventure. Check the banner up top!', triggers: ['hub_open'], arcPhase: 'active' },

  // ── Identity language — parallels de_identity_*. Ronki reports what
  //    fireflies / butterflies / the meadow say about the kid. Signature
  //    pattern of the app. ──
  { id: 'en_identity_01', text: 'I told the fireflies you always brush your teeth. They were so impressed!', triggers: ['quest_complete'], minQuestsToday: 1 },
  { id: 'en_identity_02', text: 'The butterflies say you\u2019re the bravest hero they know.', triggers: ['quest_complete'], minQuestsToday: 2 },
  { id: 'en_identity_03', text: 'You know what? You\u2019re someone who can be counted on. I\u2019ve noticed that.', triggers: ['hub_open'] },
  { id: 'en_identity_04', text: 'The meadow tells stories about you. All good ones!', triggers: ['sanctuary_open'] },

  // ── Mood-aware — 12 lines parallel to de_mood_*. Soft responses when
  //    the kid logs sad/worried/tired; upbeat when happy; neutral when okay. ──
  { id: 'en_mood_sad_01',     text: 'Hey... I\u2019m a bit quiet today too. Want to just sit together?', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'en_mood_sad_02',     text: 'Some days are just like this. I\u2019m here.', triggers: ['hub_open'], mood: ['traurig'] },
  { id: 'en_mood_sad_03',     text: 'I saw you. You\u2019re strong, even when it doesn\u2019t feel that way.', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'en_mood_sad_04',     text: 'Know what helps? A hug. I can\u2019t really give one \u2014 but imagine one, okay?', triggers: ['hub_open', 'sanctuary_open'], mood: ['traurig'] },
  { id: 'en_mood_tired_01',   text: 'I\u2019m yawning too. Let\u2019s take it slow today.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'en_mood_tired_02',   text: 'Being tired is okay. Then we rest.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'en_mood_happy_01',   text: 'Wow! You\u2019re glowing today! What happened?', triggers: ['hub_open'], mood: ['magisch', 'gut'] },
  { id: 'en_mood_happy_02',   text: 'I can feel your good mood. It\u2019s catching!', triggers: ['hub_open'], mood: ['magisch'] },
  { id: 'en_mood_happy_03',   text: 'Such a bright day inside you! Take me along?', triggers: ['hub_open', 'sanctuary_open'], mood: ['magisch', 'gut'] },
  { id: 'en_mood_okay_01',    text: 'Somewhere-in-between is good too. Not every day has to sparkle.', triggers: ['hub_open'], mood: ['okay'] },
  { id: 'en_mood_worried_01', text: 'Did something happen? You can tell me \u2014 or just be here.', triggers: ['hub_open'], mood: ['besorgt'] },
  { id: 'en_mood_worried_02', text: 'I\u2019ll be quiet. Makes the head clearer.', triggers: ['hub_open'], mood: ['besorgt'] },

  // ── Trait-gated — unlocks after the matching trait is earned (Atomic
  //    Habits identity language). 7 lines parallel to de_trait_*. ──
  { id: 'en_trait_brave_01',     text: 'You\u2019re someone who doesn\u2019t give up. I know that now.', triggers: ['hub_open', 'quest_complete'], requiredTraits: ['brave'] },
  { id: 'en_trait_brave_02',     text: 'Brave isn\u2019t being fearless. Brave is doing it anyway. That\u2019s you.', triggers: ['hub_open'], requiredTraits: ['brave'] },
  { id: 'en_trait_gentle_01',    text: 'Your calm is good for everyone. Me too.', triggers: ['hub_open', 'sanctuary_open'], requiredTraits: ['gentle'] },
  { id: 'en_trait_patient_01',   text: 'You wait patiently \u2014 not everyone can. I\u2019m learning from you.', triggers: ['hub_open'], requiredTraits: ['patient'] },
  { id: 'en_trait_mapmaker_01',  text: 'The Explorer\u2019s back! What will you find today?', triggers: ['hub_open'], requiredTraits: ['mapmaker'] },
  { id: 'en_trait_curious_01',   text: 'You always ask the best questions. What are you wondering today?', triggers: ['idle'], requiredTraits: ['curious'] },
  { id: 'en_trait_multi_01',     text: 'You have so many strengths already. You\u2019re going to be a great hero.', triggers: ['hub_open'], requireAllTraits: ['brave', 'gentle', 'patient', 'mapmaker'] },

  // ── All-done celebration — fires on the final-tap that flips today's
  //    quests to zero remaining. Parallel to de_alldone_*. Peak warmth. ──
  { id: 'en_alldone_01', text: 'Everything! You did EVERYTHING! I might actually burst with pride!', triggers: ['all_done'] },
  { id: 'en_alldone_02', text: 'Woohoo! Today was your day! Every single task \u2014 done!', triggers: ['all_done'] },
  { id: 'en_alldone_03', text: 'Look! My scales are glittering. That only happens when you finish it all.', triggers: ['all_done'] },
  { id: 'en_alldone_04', text: 'I\u2019m dancing! Look, I\u2019m dancing! We did it!', triggers: ['all_done'] },
  { id: 'en_alldone_05', text: 'Today was such a good day. I was with you for every bit of it.', triggers: ['all_done'] },
  { id: 'en_alldone_06', text: 'The fireflies are going to be so excited \u2014 I\u2019ve got to tell them everything!', triggers: ['all_done'] },
  { id: 'en_alldone_07', text: 'You\u2019re my favourite person today. Okay, always. But especially today.', triggers: ['all_done'] },
  { id: 'en_alldone_08', text: 'Done! Now we\u2019re both allowed to be tired. Tired together is the best kind.', triggers: ['all_done'] },

  // ── Freund-met — bank ready for drop-in when a fire site lands.
  //    Parallel to de_freund_met_*. ──
  { id: 'en_freund_met_01', text: 'A new friend! Look, look! They look so interesting!', triggers: ['freund_met'] },
  { id: 'en_freund_met_02', text: 'Oh! I\u2019ve met them before, I think. Or maybe not. Either way!', triggers: ['freund_met'] },
  { id: 'en_freund_met_03', text: 'Hi, new friend! We\u2019re glad to meet you.', triggers: ['freund_met'] },
  { id: 'en_freund_met_04', text: 'My heart is going thumpthumpthump. That happens with new friends.', triggers: ['freund_met'] },
  { id: 'en_freund_met_05', text: 'Come here. We have so much to tell.', triggers: ['freund_met'] },
  { id: 'en_freund_met_06', text: 'Phew! So many new names. Good thing you help me remember them.', triggers: ['freund_met'] },
];
