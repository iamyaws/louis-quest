import type { VoiceLine } from '../types';

/**
 * Ronki's voice — Baby-Drache, frisch geschlüpft.
 *
 * Character: Ronki is Louis's age in dragon years. Curious, easily amazed,
 * a little clumsy, full of wonder. Speaks in short sentences. Has strong
 * opinions about small things (puddles are great, socks are confusing).
 * Never lectures. Celebrates alongside Louis, never above him.
 *
 * From day 14+, identity-language lines unlock:
 * "Ronki hat den Glühwürmchen erzählt, dass du immer deine Zähne putzt!"
 * These shift motivation from external reward to self-concept (Atomic Habits).
 *
 * TODO — audio to generate (ElevenLabs; quota-gated). Lines intentionally NOT
 * registered in the bank because they're played directly by useQuietAttention
 * (not trigger-matched). Once MP3s land in /public/audio/ronki/, they play
 * automatically — no code change needed here.
 *   - de_slowdown_01: "Wow, du bist aber schnell! Schau nochmal."
 *   - de_slowdown_02: "Langsam, kleiner Flitzer. Es gibt viel zu entdecken."
 *   - de_slowdown_03: "Pssst. Nicht alles rennt davon."
 * MVP wires only de_slowdown_01. Rotation added later when audio exists.
 */

export const linesDe: VoiceLine[] = [
  // ═══════════════════════════════════════
  // GREETINGS — Hub open
  // ═══════════════════════════════════════
  { id: 'de_greet_01', text: 'Hey! Du bist da! Endlich!', triggers: ['hub_open'] },
  { id: 'de_greet_02', text: 'Hey! Ich hab gerade an dich gedacht!', triggers: ['hub_open'] },
  { id: 'de_greet_03', text: 'Oh! Da bist du ja! Ich hab was entdeckt…', triggers: ['hub_open'] },
  { id: 'de_greet_m01', text: 'Guten Morgen! Ich hab schon gegähnt.', triggers: ['hub_open'], timeOfDay: ['morning'] },
  { id: 'de_greet_m02', text: 'Morgens bin ich immer ein bisschen verschlafen. Du auch?', triggers: ['hub_open'], timeOfDay: ['morning'] },
  { id: 'de_greet_m03', text: 'Die Sonne ist aufgegangen! Lass uns loslegen!', triggers: ['hub_open'], timeOfDay: ['morning'] },
  { id: 'de_greet_a01', text: 'Wie war die Schule? Erzähl mir alles!', triggers: ['hub_open'], timeOfDay: ['afternoon'] },
  { id: 'de_greet_a02', text: 'Nachmittag! Ich hab den ganzen Tag auf dich gewartet.', triggers: ['hub_open'], timeOfDay: ['afternoon'] },
  { id: 'de_greet_e01', text: 'Abend! Bald wird es gemütlich.', triggers: ['hub_open'], timeOfDay: ['evening'] },
  { id: 'de_greet_e02', text: 'Hast du heute was Cooles erlebt? Ich will alles wissen.', triggers: ['hub_open'], timeOfDay: ['evening'] },
  { id: 'de_greet_n01', text: 'Gute Nacht bald! Noch ein bisschen zusammen?', triggers: ['hub_open'], timeOfDay: ['night'] },
  { id: 'de_greet_n02', text: 'Draußen ist es dunkel. Hier drin ist es warm.', triggers: ['hub_open'], timeOfDay: ['night'] },

  // ═══════════════════════════════════════
  // SANCTUARY — Ronki's home
  // ═══════════════════════════════════════
  { id: 'de_sanct_01', text: 'Du bist da! Ich bin im Kreis gelaufen vor Freude!', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_02', text: 'Riechst du das? Die Wiese riecht nach Abenteuer!', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_03', text: 'Psst — hör mal! Da raschelt was im Gras!', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_04', text: 'Schau mal! Eine Libelle! Die ist schneller als ich!', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_05', text: 'Ich hab dich vermisst. War es lang? Für mich schon.', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_06', text: 'Weißt du was? Ich hab heute versucht, einen Schmetterling zu fangen. Hat nicht geklappt.', triggers: ['sanctuary_open'] },
  { id: 'de_sanct_07', text: 'Mein Lieblingsplatz ist genau hier. Wo ist deiner?', triggers: ['sanctuary_open'] },

  // ═══════════════════════════════════════
  // WEATHER — context-aware observations
  // ═══════════════════════════════════════
  { id: 'de_w_rain_01', text: 'Es regnet! Ich mag Regen. Pfützen sind das Beste.', triggers: ['hub_open', 'sanctuary_open'], weather: ['rain'] },
  { id: 'de_w_rain_02', text: 'Tropf tropf tropf! Hörst du das auch?', triggers: ['hub_open', 'sanctuary_open'], weather: ['rain'] },
  { id: 'de_w_cold_01', text: 'Brrr! Zieh dich warm an heute! Ich hab ja Schuppen.', triggers: ['hub_open', 'sanctuary_open'], weather: ['cold'] },
  { id: 'de_w_hot_01', text: 'So warm! Ich könnte den ganzen Tag in der Sonne liegen.', triggers: ['hub_open', 'sanctuary_open'], weather: ['hot', 'clear'] },
  { id: 'de_w_hot_02', text: 'Sonnenschein! Vergiss die Sonnencreme nicht!', triggers: ['hub_open', 'sanctuary_open'], weather: ['hot'] },
  { id: 'de_w_snow_01', text: 'SCHNEE! Ich — ich hab noch nie Schnee gesehen! Naja, letztes Mal schon.', triggers: ['hub_open', 'sanctuary_open'], weather: ['snow'] },
  { id: 'de_w_clear_01', text: 'Blauer Himmel! Der perfekte Tag für ein Abenteuer!', triggers: ['hub_open', 'sanctuary_open'], weather: ['clear'] },

  // ═══════════════════════════════════════
  // QUEST COMPLETE — celebrating together
  // ═══════════════════════════════════════
  { id: 'de_quest_01', text: 'Hast du das gerade geschafft? Wow!', triggers: ['quest_complete'] },
  { id: 'de_quest_02', text: 'Ja! So macht man das! 💪', triggers: ['quest_complete'] },
  { id: 'de_quest_03', text: 'Ich hab zugeguckt. Das war richtig gut.', triggers: ['quest_complete'] },
  { id: 'de_quest_04', text: 'Weiter so! Ronki glaubt an dich!', triggers: ['quest_complete'] },
  { id: 'de_quest_05', text: 'Eins weniger! Du rockst das!', triggers: ['quest_complete'] },
  { id: 'de_quest_streak_01', text: 'Drei schon? Du bist heute nicht zu stoppen!', triggers: ['quest_complete'], minQuestsToday: 3 },
  { id: 'de_quest_streak_02', text: 'Nochmal? Du machst gar keine Pause!', triggers: ['quest_complete'], minQuestsToday: 4 },

  // ═══════════════════════════════════════
  // CARE ACTIONS — companion interactions
  // ═══════════════════════════════════════
  { id: 'de_care_fed_01', text: 'Mmmmm! Das war lecker! Hast du auch was gegessen?', triggers: ['care_action'], careAction: ['fed'] },
  { id: 'de_care_fed_02', text: 'Danke! Mein Bauch ist jetzt warm und voll.', triggers: ['care_action'], careAction: ['fed'] },
  { id: 'de_care_pet_01', text: 'Hihihi! Das kitzelt! Nochmal, nochmal!', triggers: ['care_action'], careAction: ['petted'] },
  { id: 'de_care_pet_02', text: 'Ahhh… das ist schön. Du hast warme Hände.', triggers: ['care_action'], careAction: ['petted'] },
  { id: 'de_care_play_01', text: 'Spielen! Ja! Ich bin bereit! Fang mich!', triggers: ['care_action'], careAction: ['played'] },
  { id: 'de_care_play_02', text: 'Haha! Ich bin schneller als du! …oder?', triggers: ['care_action'], careAction: ['played'] },

  // ═══════════════════════════════════════
  // IDLE — wondering and wondering
  // ═══════════════════════════════════════
  { id: 'de_idle_01', text: 'Ob Wolken wirklich so weich sind, wie sie aussehen?', triggers: ['idle'] },
  { id: 'de_idle_02', text: 'Ich hab geträumt, ich kann fliegen. Bald kann ich das wirklich!', triggers: ['idle'] },
  { id: 'de_idle_03', text: 'Was wärst du, wenn du kein Mensch wärst? Ich wäre ein… Drache. Ach, stimmt ja.', triggers: ['idle'] },
  { id: 'de_idle_04', text: 'Weißt du, was ich heute gelernt habe? Dass Ameisen richtig stark sind!', triggers: ['idle'] },
  { id: 'de_idle_05', text: 'Ich hab versucht, meinen eigenen Schwanz zu fangen. Hat nicht geklappt.', triggers: ['idle'] },
  { id: 'de_idle_06', text: 'Meinst du, Fische können träumen?', triggers: ['idle'] },

  // ═══════════════════════════════════════
  // ARCS — adventure context
  // ═══════════════════════════════════════
  { id: 'de_arc_cool_01', text: 'Ich ruh mich noch aus vom letzten Abenteuer. Aber mach ruhig weiter!', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'de_arc_cool_02', text: 'Puh! Das war aufregend. Ich brauch ein Schläfchen.', triggers: ['hub_open'], arcPhase: 'cooldown' },
  { id: 'de_arc_active_01', text: 'Wir haben ein Abenteuer! Schau mal oben!', triggers: ['hub_open'], arcPhase: 'active' },
  { id: 'de_arc_active_02', text: 'Unser Abenteuer wartet! Ich bin so gespannt!', triggers: ['hub_open'], arcPhase: 'active' },

  // ═══════════════════════════════════════
  // IDENTITY LANGUAGE — unlocks after day 14
  // (From habit research: shift from "I did X" to "I am someone who does X")
  // ═══════════════════════════════════════
  { id: 'de_identity_01', text: 'Ich hab den Glühwürmchen erzählt, dass du immer deine Zähne putzt. Die waren beeindruckt!', triggers: ['quest_complete'], minQuestsToday: 1 },
  { id: 'de_identity_02', text: 'Die Schmetterlinge sagen, du bist der mutigste Held, den sie kennen.', triggers: ['quest_complete'], minQuestsToday: 2 },
  { id: 'de_identity_03', text: 'Weißt du was? Du bist jemand, auf den man sich verlassen kann. Das hab ich gemerkt.', triggers: ['hub_open'] },
  { id: 'de_identity_04', text: 'Die Wiese erzählt Geschichten über dich. Lauter gute!', triggers: ['sanctuary_open'] },

  // ═══════════════════════════════════════
  // MOOD-AWARE — soft responses when Louis is down, upbeat when happy
  // ═══════════════════════════════════════
  { id: 'de_mood_sad_01',   text: 'Hey... ich bin heute auch ein bisschen leise. Sollen wir zusammen sein?', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'de_mood_sad_02',   text: 'Manchmal sind Tage einfach so. Ich bin da.', triggers: ['hub_open'], mood: ['traurig'] },
  { id: 'de_mood_sad_03',   text: 'Ich hab dich gesehen. Du bist stark, auch wenn es sich nicht so anfühlt.', triggers: ['hub_open'], mood: ['traurig', 'besorgt'] },
  { id: 'de_mood_sad_04',   text: 'Weißt du was hilft? Eine Umarmung. Ich kann leider keine geben — aber stell dir eine vor.', triggers: ['hub_open', 'sanctuary_open'], mood: ['traurig'] },
  { id: 'de_mood_tired_01', text: 'Ich gähne auch. Lass uns heute langsam machen.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'de_mood_tired_02', text: 'Müde sein ist okay. Dann ruhen wir uns aus.', triggers: ['hub_open'], mood: ['müde'] },
  { id: 'de_mood_happy_01', text: 'Wow! Du strahlst heute! Was ist passiert?', triggers: ['hub_open'], mood: ['magisch', 'gut'] },
  { id: 'de_mood_happy_02', text: 'Ich spüre deine gute Laune. Bin mit angesteckt!', triggers: ['hub_open'], mood: ['magisch'] },
  { id: 'de_mood_happy_03', text: 'So ein schöner Tag in dir! Nimmst du mich mit?', triggers: ['hub_open', 'sanctuary_open'], mood: ['magisch', 'gut'] },
  { id: 'de_mood_okay_01',  text: 'Mittendrin ist auch gut. Nicht jeder Tag muss funkeln.', triggers: ['hub_open'], mood: ['okay'] },
  { id: 'de_mood_worried_01', text: 'Ist was passiert? Du kannst mir erzählen — oder einfach da sein.', triggers: ['hub_open'], mood: ['besorgt'] },
  { id: 'de_mood_worried_02', text: 'Ich bin leise. Dann ist der Kopf freier.', triggers: ['hub_open'], mood: ['besorgt'] },

  // ═══════════════════════════════════════
  // TRAIT-GATED — identity language (Atomic Habits)
  // Unlock after earning the named trait from an arc completion
  // ═══════════════════════════════════════
  { id: 'de_trait_brave_01',     text: 'Du bist jemand, der nicht aufgibt. Das weiß ich jetzt.', triggers: ['hub_open', 'quest_complete'], requiredTraits: ['brave'] },
  { id: 'de_trait_brave_02',     text: 'Mutig sein heißt nicht, keine Angst zu haben. Du weißt das.', triggers: ['hub_open'], requiredTraits: ['brave'] },
  { id: 'de_trait_gentle_01',    text: 'Deine Ruhe tut allen gut. Auch mir.', triggers: ['hub_open', 'sanctuary_open'], requiredTraits: ['gentle'] },
  { id: 'de_trait_patient_01',   text: 'Du wartest geduldig — das können nicht alle. Ich lerne von dir.', triggers: ['hub_open'], requiredTraits: ['patient'] },
  { id: 'de_trait_mapmaker_01',  text: 'Der Kartenmacher ist zurück! Was entdeckst du heute?', triggers: ['hub_open'], requiredTraits: ['mapmaker'] },
  { id: 'de_trait_curious_01',   text: 'Du stellst immer die besten Fragen. Was fragst du dich heute?', triggers: ['idle'], requiredTraits: ['curious'] },
  { id: 'de_trait_multi_01',     text: 'Du hast schon so viele Wesenszüge. Du wirst ein großer Held.', triggers: ['hub_open'], requireAllTraits: ['brave', 'gentle', 'patient', 'mapmaker'] },

  // NOTE: de_stamina_* and de_screentime_* audio files exist in public/audio/ronki/
  // and are played directly via VoiceAudio.play(id) from MiniGames.jsx and ScreenTimer.jsx.
  // They are NOT registered here because that would make the VoiceEngine pick them
  // randomly on hub_open/idle triggers — Ronki would say "Ich bin ganz platt" even
  // when fully rested. Direct play bypasses the line bank by design.
];
