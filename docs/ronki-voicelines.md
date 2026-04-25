# Ronki Voicelines — Refined Database

Single source of truth for the 50 voice lines covering all surfaces in the app. Kept Dikka-energy where it serves the moment (peak-celebration, quest-complete, freund-met, weather-wow) and quiet warmth where the kid needs that (mood-sad, evening, narrator).

**Two characters:**
- `ronki` — Harry voice (creaky young male). Curious, easily amazed, slightly clumsy, never lectures. Outputs to `public/audio/ronki/<id>.mp3`.
- `drachenmutter` — Bella placeholder until Marc picks from the casting shortlist. Calm authority, intimate register, slow grounded. Outputs to `public/audio/narrator/<id>.mp3`.

**Voice rules:**
- Real UTF-8 umlauts (ä/ö/ü/ß), never `ae`/`oe`/`ue` substitutes — ElevenLabs reads those as English.
- No emojis in audio text — bubble can render emojis but TTS speaks them literally.
- Dikka touches that fit a baby dragon: punchy openers (`Boah!`, `Hammer!`, `Krass!`), repetition for bounce (`schau, schau!`), invitation energy (`Komm!`, `Lass uns!`), body-physicality (`Ich tanze!`, `Mein Herz macht pongpongpong`). Pulled back on adult-rapper slang (`Bratan`, `Dikka`, `Yo!` standalone) — too cool for a 6yo dragon.
- Full Dikka energy reserved for big moments (all_done, freund_met, weather wow). Quiet moments stay quiet — sad/tired/night/narrator are deliberately gentler.

**TS sync:** `src/companion/lines/de.ts` is the React engine's source. After Marc reviews this doc, sync de.ts (and en.ts translations) to match. Until then this doc is the staging area.

---

## Voice profiles

```json
{
  "ronki": {
    "voice_id": "SOYHLrjzK2X1ezoPC6cr",
    "voice_name": "Harry",
    "output_dir": "public/audio/ronki",
    "settings": {
      "stability": 0.40,
      "similarity_boost": 0.80,
      "style": 0.55,
      "use_speaker_boost": true
    }
  },
  "drachenmutter": {
    "voice_id": "hpp4J3VqNfWAUOO0d1Us",
    "voice_name": "Bella (placeholder — pick from voice-samples/drachenmutter/ casting)",
    "output_dir": "public/audio/narrator",
    "settings": {
      "stability": 0.70,
      "similarity_boost": 0.72,
      "style": 0.30,
      "use_speaker_boost": true
    }
  }
}
```

---

## Lines (50)

```json
[
  {
    "id": "de_greet_01",
    "character": "ronki",
    "text": "Du bist da! Endlich!",
    "triggers": ["hub_open"],
    "notes": "Generic greeting, any time of day"
  },
  {
    "id": "de_greet_02",
    "character": "ronki",
    "text": "Hey! Ich hab grad an dich gedacht!",
    "triggers": ["hub_open"],
    "notes": "Generic greeting, any time of day"
  },
  {
    "id": "de_greet_morning_01",
    "character": "ronki",
    "text": "Morgen! Ich hab schon gegähnt.",
    "triggers": ["hub_open"],
    "timeOfDay": ["morning"],
    "notes": "Sleepy morning energy — Ronki yawns too"
  },
  {
    "id": "de_greet_afternoon_01",
    "character": "ronki",
    "text": "Wie war Schule? Komm, erzähl!",
    "triggers": ["hub_open"],
    "timeOfDay": ["afternoon"],
    "notes": "Engaged listener, invites story"
  },
  {
    "id": "de_greet_evening_01",
    "character": "ronki",
    "text": "Abend. Bald wird's gemütlich.",
    "triggers": ["hub_open"],
    "timeOfDay": ["evening"],
    "notes": "Soft transition to evening — quiet, not Dikka-energy"
  },
  {
    "id": "de_greet_night_01",
    "character": "ronki",
    "text": "Draußen dunkel. Hier ist's warm. Pass auf, ich pass auf.",
    "triggers": ["hub_open"],
    "timeOfDay": ["night"],
    "notes": "Cozy night reassurance"
  },
  {
    "id": "de_sanct_01",
    "character": "ronki",
    "text": "Boah, du bist da! Ich bin im Kreis gelaufen vor Freude!",
    "triggers": ["sanctuary_open"],
    "notes": "Dikka opener — peak entry-energy"
  },
  {
    "id": "de_sanct_02",
    "character": "ronki",
    "text": "Riech mal! Die Wiese riecht nach Abenteuer!",
    "triggers": ["sanctuary_open"],
    "notes": "Sensory invitation"
  },
  {
    "id": "de_sanct_03",
    "character": "ronki",
    "text": "Weißt du was? Ich hab heut versucht, einen Schmetterling zu fangen. Hat nicht geklappt.",
    "triggers": ["sanctuary_open"],
    "notes": "Signature Ronki clumsiness — keep verbatim"
  },
  {
    "id": "de_w_rain_01",
    "character": "ronki",
    "text": "Es regnet! Pfützen sind das BESTE!",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["rain"],
    "notes": "Caps for emphasis on BESTE — voice should land it"
  },
  {
    "id": "de_w_cold_01",
    "character": "ronki",
    "text": "Brrr! Zieh dich warm an. Ich hab ja Schuppen, ich pack das.",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["cold"],
    "notes": "Dragon detail — gentle ribbing, not lecture"
  },
  {
    "id": "de_w_hot_01",
    "character": "ronki",
    "text": "Voll warm! Ich liege heut den ganzen Tag in der Sonne.",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["hot", "clear"],
    "notes": "Dragon basking — replaces 'könnte den ganzen Tag' with bolder 'liege'"
  },
  {
    "id": "de_w_snow_01",
    "character": "ronki",
    "text": "SCHNEE! Ich hab noch nie— okay, doch, letztes Mal schon. Trotzdem KRASS!",
    "triggers": ["hub_open", "sanctuary_open"],
    "weather": ["snow"],
    "notes": "Self-correcting wonder — Dikka punctuation"
  },
  {
    "id": "de_quest_01",
    "character": "ronki",
    "text": "Wow! Hast du das echt grad geschafft? Krass!",
    "triggers": ["quest_complete"],
    "notes": "Surprise + direct praise"
  },
  {
    "id": "de_quest_02",
    "character": "ronki",
    "text": "Ich hab zugeguckt. Das war richtig richtig gut.",
    "triggers": ["quest_complete"],
    "notes": "Quiet intimate praise — repeated 'richtig' for emphasis"
  },
  {
    "id": "de_quest_streak_01",
    "character": "ronki",
    "text": "Drei schon? Boah, du bist heut nicht zu stoppen!",
    "triggers": ["quest_complete"],
    "minQuestsToday": 3,
    "notes": "Streak — Dikka 'Boah'"
  },
  {
    "id": "de_alldone_01",
    "character": "ronki",
    "text": "ALLES! Du hast ALLES gerockt! Ich platze gleich vor Stolz!",
    "triggers": ["all_done"],
    "notes": "Peak celebration — caps + 'gerockt' lean Dikka"
  },
  {
    "id": "de_alldone_02",
    "character": "ronki",
    "text": "Wuuuhuu! Heute war DEIN Tag! Jede Aufgabe — fertig!",
    "triggers": ["all_done"],
    "notes": "Onomatopoeia opener"
  },
  {
    "id": "de_alldone_03",
    "character": "ronki",
    "text": "Schau! Meine Schuppen glitzern! Das passiert nur, wenn du's komplett rockst.",
    "triggers": ["all_done"],
    "notes": "Body reaction — keeps Ronki's POV"
  },
  {
    "id": "de_alldone_04",
    "character": "ronki",
    "text": "Wir haben's geschafft! Ich tanze, schau, ich tanze!",
    "triggers": ["all_done"],
    "notes": "Physical celebration — 'wir' inclusive"
  },
  {
    "id": "de_care_fed_01",
    "character": "ronki",
    "text": "Mmmmmm! Lecker! Hast du auch was gegessen?",
    "triggers": ["care_action"],
    "careAction": ["fed"],
    "notes": "Bounces back to kid"
  },
  {
    "id": "de_care_pet_01",
    "character": "ronki",
    "text": "Hihihi! Das kitzelt! Nochmal, nochmal!",
    "triggers": ["care_action"],
    "careAction": ["petted"],
    "notes": "Repetition for giggle-rhythm"
  },
  {
    "id": "de_care_play_01",
    "character": "ronki",
    "text": "Spielen! Ja! Komm, fang mich!",
    "triggers": ["care_action"],
    "careAction": ["played"],
    "notes": "Play invitation"
  },
  {
    "id": "de_idle_01",
    "character": "ronki",
    "text": "Glaubst du, Wolken sind so weich, wie sie aussehen?",
    "triggers": ["idle"],
    "notes": "Wonder — kept quiet on purpose"
  },
  {
    "id": "de_idle_02",
    "character": "ronki",
    "text": "Ich hab versucht, meinen eigenen Schwanz zu fangen. Hat nicht geklappt.",
    "triggers": ["idle"],
    "notes": "Slapstick — signature Ronki"
  },
  {
    "id": "de_idle_03",
    "character": "ronki",
    "text": "Was wärst du, wenn du kein Mensch wärst? Ich wär ein... Drache. Ach, stimmt ja.",
    "triggers": ["idle"],
    "notes": "Self-aware joke"
  },
  {
    "id": "de_mood_sad_01",
    "character": "ronki",
    "text": "Hey... ich bin heut auch leise. Sollen wir einfach zusammen sein?",
    "triggers": ["hub_open"],
    "mood": ["traurig", "besorgt"],
    "notes": "Soft presence — DELIBERATELY non-Dikka"
  },
  {
    "id": "de_mood_tired_01",
    "character": "ronki",
    "text": "Ich gähne auch. Lass uns heut langsam machen.",
    "triggers": ["hub_open"],
    "mood": ["müde"],
    "notes": "Slow energy"
  },
  {
    "id": "de_mood_happy_01",
    "character": "ronki",
    "text": "Wow! Du strahlst heut! Was ist passiert?",
    "triggers": ["hub_open"],
    "mood": ["magisch", "gut"],
    "notes": "Catches the kid's energy"
  },
  {
    "id": "de_mood_okay_01",
    "character": "ronki",
    "text": "Mittendrin ist auch gut. Nicht jeder Tag muss funkeln.",
    "triggers": ["hub_open"],
    "mood": ["okay"],
    "notes": "Validation — keep verbatim"
  },
  {
    "id": "de_mood_worried_01",
    "character": "ronki",
    "text": "Ist was passiert? Du kannst's mir erzählen — oder einfach da sein.",
    "triggers": ["hub_open"],
    "mood": ["besorgt"],
    "notes": "Permission-giving"
  },
  {
    "id": "de_trait_brave_01",
    "character": "ronki",
    "text": "Du bist jemand, der nicht aufgibt. Das weiß ich jetzt.",
    "triggers": ["hub_open", "quest_complete"],
    "requiredTraits": ["brave"],
    "notes": "Identity language — kept verbatim"
  },
  {
    "id": "de_trait_gentle_01",
    "character": "ronki",
    "text": "Deine Ruhe tut allen gut. Auch mir.",
    "triggers": ["hub_open", "sanctuary_open"],
    "requiredTraits": ["gentle"],
    "notes": "Body-sense"
  },
  {
    "id": "de_trait_multi_01",
    "character": "ronki",
    "text": "Boah! Du hast schon SO VIELE Stärken. Du wirst ein großer Held.",
    "triggers": ["hub_open"],
    "requireAllTraits": ["brave", "gentle", "patient", "mapmaker"],
    "notes": "Achievement gate — Dikka 'Boah'"
  },
  {
    "id": "de_identity_01",
    "character": "ronki",
    "text": "Ich hab den Glühwürmchen erzählt, dass du immer deine Zähne putzt. Die waren BEEINDRUCKT!",
    "triggers": ["quest_complete"],
    "minQuestsToday": 1,
    "notes": "Magical-witness pattern — caps for landing"
  },
  {
    "id": "de_identity_03",
    "character": "ronki",
    "text": "Weißt du was? Du bist jemand, auf den man sich verlassen kann. Hab ich gemerkt.",
    "triggers": ["hub_open"],
    "notes": "Atomic-Habits identity"
  },
  {
    "id": "de_freund_met_01",
    "character": "ronki",
    "text": "EIN NEUER FREUND! Schau, schau! Krass, oder?",
    "triggers": ["freund_met"],
    "notes": "Peak Dikka — repetition + caps"
  },
  {
    "id": "de_freund_met_02",
    "character": "ronki",
    "text": "Komm her, neuer Freund! Wir freuen uns!",
    "triggers": ["freund_met"],
    "notes": "Inclusive 'wir' invitation"
  },
  {
    "id": "de_freund_met_03",
    "character": "ronki",
    "text": "Mein Herz macht pongpongpong. Das passiert bei neuen Freunden.",
    "triggers": ["freund_met"],
    "notes": "Body onomatopoeia"
  },
  {
    "id": "de_stamina_low_01",
    "character": "ronki",
    "direct_play": true,
    "text": "Puh, ich werd langsam müde vom Fliegen. Aber einmal noch geht.",
    "notes": "Direct-play — fired by MiniGames when stamina low"
  },
  {
    "id": "de_stamina_exhausted_01",
    "character": "ronki",
    "direct_play": true,
    "text": "Ich bin platt. Spielst du kurz ohne mich?",
    "notes": "Direct-play — fired by MiniGames when stamina 0"
  },
  {
    "id": "de_teeth_start",
    "character": "ronki",
    "direct_play": true,
    "text": "Zähne putzen! Wir starten oben links!",
    "notes": "Direct-play — ToothbrushTimer mount"
  },
  {
    "id": "de_teeth_done",
    "character": "ronki",
    "direct_play": true,
    "text": "Fertig! Voll sauber! Ich seh deine Zähne von hier glitzern.",
    "notes": "Direct-play — timer complete (one of three randomized variants)"
  },
  {
    "id": "de_screen_done",
    "character": "ronki",
    "direct_play": true,
    "text": "Zeit ist um. Hammer gemacht — bis nachher!",
    "notes": "Direct-play — ScreenTimer end. Dikka 'Hammer gemacht'"
  },
  {
    "id": "de_journal_done_01",
    "character": "ronki",
    "direct_play": true,
    "text": "Das hast du schön aufgeschrieben.",
    "notes": "Direct-play — Journal save"
  },
  {
    "id": "de_discover_creature",
    "character": "ronki",
    "direct_play": true,
    "text": "Schau mal! Ein neuer Freund! Lass uns ihn kennenlernen.",
    "notes": "Direct-play — Micropedia first-discovery toast"
  },
  {
    "id": "parent_zone_intro",
    "character": "drachenmutter",
    "direct_play": true,
    "text": "Ah, hier gibt's was für Mama und Papa. Für euch Kinder leider total langweilig — aber wichtig.",
    "notes": "Direct-play — ParentalDashboard open. Drachenmutter narrator."
  },
  {
    "id": "ritual_start",
    "character": "drachenmutter",
    "direct_play": true,
    "text": "Komm, kleiner Drache. Setz dich. Wir machen das gleich gemeinsam.",
    "notes": "Direct-play — emotional-tool opener (Box-Atmung etc.)"
  },
  {
    "id": "ritual_ask",
    "character": "drachenmutter",
    "direct_play": true,
    "text": "Wie geht's dir heute? Hör in dich rein.",
    "notes": "Direct-play — mood check-in question"
  },
  {
    "id": "ritual_goodnight",
    "character": "drachenmutter",
    "direct_play": true,
    "text": "Schlaf gut, kleiner Drache. Ich pass auf dich auf.",
    "notes": "Direct-play — bedtime ritual closer"
  },
  {
    "id": "onboarding_welcome",
    "character": "drachenmutter",
    "direct_play": true,
    "text": "Willkommen, kleiner Held. Dein Drache wartet auf dich.",
    "notes": "Direct-play — onboarding step 1"
  }
]
```

---

## Smoke-test subset (3 lines)

Used by `--smoke` to verify Harry pronounces umlauts cleanly + check that narrator routing to `public/audio/narrator/` works:

```json
["de_w_snow_01", "de_alldone_03", "ritual_goodnight"]
```

`de_w_snow_01` covers ä in `Trotzdem`/`KRASS!` and emphasis caps. `de_alldone_03` covers ü in `Glühwürmchen`-adjacent words (`schön`, `glitzern`, `rockst`). `ritual_goodnight` switches characters and exercises the narrator output dir.

---

## Notes for the gen script

- Reads this file. Extracts the two JSON code blocks (profiles + lines) via fenced-code-block parser.
- Routes each line to `profiles[character].output_dir` so Ronki lands in `public/audio/ronki/`, Drachenmutter in `public/audio/narrator/`.
- Per-character `voice_id` + `voice_settings` come from the profiles block — when Marc picks a Drachenmutter casting winner, swap one field in this doc and re-run.
- `--smoke` regenerates only the smoke subset.
- `--full` regenerates everything missing (skip-existing).
- `--full --regen` overwrites everything regardless.
- Loads the API key from `.env.local` first, falls back to `.env`.
