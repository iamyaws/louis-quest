# Ronki Voicelines — Generation Database

Single source of truth for every Ronki spoken line in the prototype.
Feeds into the ElevenLabs generation pipeline (see
`reference_voice_casting.md` in basic-memory for voice IDs and
settings) so each batch of takes maps cleanly back to where the
line surfaces in-app.

**Voice character.** Ronki is the kid-companion dragon. Rule: longer
slightly-stumbly sentences with soft hedges, no em-dashes, no tidy
three-beat fragments. Drachenmutter (the older guide) speaks
narration in the expedition flow — kept separate here so a different
voice / setting can be applied.

**Status legend.**
- `tbd` — line written, not yet recorded.
- `draft` — first take recorded, awaiting review.
- `final` — approved take, in app under `/audio/ronki/<id>.mp3`.

**ID convention.** `ronki_<category>_<scope>_<index>`. Categories:
`speech` (room speech bubbles), `ask` (quest asks), `story` (Bei
Ronki sein presence beats), `system` (UI prompts), `memento` (Reise
return quotes), `react` (tap-Ronki body reactions), `state` (Reise
status strip).

---

## 1. Speech-bubble rotation (Drachennest, RoomHub)

Source: `src/components/drachennest/RonkiSpeechBubble.jsx`. Cycles
in the upper bubble while the kid is on the room surface.

| ID | DE | EN | Status |
|---|---|---|---|
| ronki_speech_room_01 | Ich mag es wenn du bei mir bist. | I like it when you're with me. | tbd |
| ronki_speech_room_02 | Spielst du heute mit mir? | Will you play with me today? | tbd |
| ronki_speech_room_03 | Mein Bauch grummelt so ein bisschen… | My tummy's grumbling a little bit… | tbd |
| ronki_speech_room_04 | Erzähl mir was du heute erlebt hast. | Tell me what you did today. | tbd |
| ronki_speech_room_05 | Kannst du mich mal streicheln? | Can you give me a little pet? | tbd |
| ronki_speech_room_06 | Ich hab heut Nacht von fliegenden Keksen geträumt. | Last night I dreamt about flying cookies. | tbd |

## 2. Quest-ask voicelines (TaskList)

Source: `src/constants.ts` SCHOOL_QUESTS — each quest has a
`ronkiAsk` field surfaced beneath the quest tile. The line is
Ronki framing the chore as something he wants from the kid, not
the system asking.

| ID | DE | EN (todo) | Status |
|---|---|---|---|
| ronki_ask_breakfast | Mein Bauch grummelt schon. Frühstückst du was Leckeres? | – | tbd |
| ronki_ask_brushteeth | Magst du mir zeigen wie lang du Zähne putzt? Ich glaub ich kann das auch. | – | tbd |
| ronki_ask_dress | Welches T-Shirt magst du heute? Ich find die mit Drachen drauf am schönsten. | – | tbd |
| ronki_ask_water_morning | Hast du was zu trinken? Ich krieg sonst Halskratzen vom Funken-Pusten. | – | tbd |
| ronki_ask_pack_school | Was packst du heute alles ein? Ich würd am liebsten mitkommen. | – | tbd |
| ronki_ask_shoes | Ziehst du dir gleich Schuhe an? Vielleicht hilft mir das auch wieder warm zu werden. | – | tbd |
| ronki_ask_homework | Was hast du heute auf? Ich kann zugucken wenn du magst. | – | tbd |
| ronki_ask_water_afternoon | Trinkst du nochmal? Mein Schwanz wird sonst trocken-knisterig. | – | tbd |
| ronki_ask_freetime | Was machst du jetzt? Ich freu mich was du dir aussuchst. | – | tbd |
| ronki_ask_dinner | Kommt jetzt Abendessen? Ich rieche schon was Leckeres. | – | tbd |
| ronki_ask_pyjama | Holst du dir den Schlafanzug? Ich mag wenn der weich ist. | – | tbd |
| ronki_ask_bedstory | Liest du noch eine Geschichte? Ich hör auch zu, ganz leise. | – | tbd |
| ronki_ask_lights_off | Knipsen wir das Licht aus? Dann seh ich die Sterne durch's Fenster besser. | – | tbd |

## 3. "Bei Ronki sein" presence stories

Source: `src/components/drachennest/BeiRonkiSein.jsx`. Free-tap
moment, Ronki tells one of these short cozy lines while the kid
sits with him at the campfire. Rotation avoids repeating the last
3 per session.

| ID | DE | Status |
|---|---|---|
| ronki_story_clouds | Heute hab ich an die Wolken gedacht. Manche davon sahen aus wie kleine Drachen die Verstecken spielen. | tbd |
| ronki_story_leaves | Im Morgenwald rascheln die Blätter ganz leise wenn niemand hinsieht. Ich glaub die erzählen sich kleine Witze. | tbd |
| ronki_story_fire | Ich mag wie's hier riecht wenn das Feuer knistert. Irgendwie nach Marshmallows und nach Holz und nach gemütlich. | tbd |
| ronki_story_stars | Manchmal frag ich mich was die Sterne eigentlich machen wenn keiner sie anschaut. Vielleicht tanzen sie ein bisschen. | tbd |
| ronki_story_tail | Weißt du was lustig ist, mein Schwanz schläft manchmal vor mir ein. Dann muss ich ihn ganz vorsichtig wecken. | tbd |
| ronki_story_blanket | Wenn ich so mit dir am Feuer sitze, fühlt sich der ganze Tag an wie in eine warme Decke eingewickelt. | tbd |
| ronki_story_beetle | Heute morgen hat ein kleiner Käfer mein Frühstück angeguckt. Ich hab ihn gefragt ob er was abhaben will, er war aber viel zu schüchtern. | tbd |
| ronki_story_forgot | Ich hab vergessen was ich eigentlich erzählen wollte. Aber das ist okay, ich bin einfach gern mit dir hier. | tbd |
| ronki_story_birch | Manchmal lieg ich abends da und mag das Geräusch wenn der Wind in den Birken oben umherwandert. Klingt fast wie wer leise summt. | tbd |
| ronki_story_mama | Mama-Drache hat mir mal gezeigt wie man Funken pustet ohne dass was kaputtgeht. Sie sagt das geht nur wenn man ruhig atmet. | tbd |

## 4. System / UI lines

Surfaces where Ronki frames a UI moment — mood prompt, adventure
CTA, tap-card hints. Voice should feel like Ronki asking, not the
app announcing.

| ID | Surface | DE | Status |
|---|---|---|---|
| ronki_system_mood_ask | RonkiMoodPrompt header | Wie geht's dir heute, {name}? | tbd |
| ronki_system_adventure_cta | RoomHub adventure CTA | Lass uns auf Abenteuer gehen, ich bringe dir was Schönes mit. | tbd |
| ronki_system_speech_dismiss | RonkiSpeechBubble aria | (no spoken line — visual interaction only) | n/a |

## 4b. Stamina-out full-screen takeover

Surface: TBD `RonkiTooTired.jsx` — when the kid runs out of stamina
playing minigames, Ronki appears full-screen and asks for a break.
Three lines so the kid doesn't hear the same thing every time. Marc
25 Apr 2026 — "stating that he has played enough games for now and
wants to do something else plus we will be back again and having
some fun playing again."

| ID | DE | Status |
|---|---|---|
| ronki_stamina_out_01 | Puh, jetzt brauch ich mal eine kleine Pause vom Spielen. Magst du was anderes mit mir machen? Wir spielen später wieder, versprochen. | tbd |
| ronki_stamina_out_02 | Mein Kopf ist ein bisschen müde von den ganzen Spielen. Wir kommen gleich wieder, und dann hab ich wieder mehr Lust. | tbd |
| ronki_stamina_out_03 | Komm wir machen jetzt was anderes zusammen. Spielen ist toll, aber zu viel auf einmal macht mich ganz wuselig im Bauch. | tbd |

## 5. Memento return quotes (Reise diary modal)

Source: `src/context/TaskContext.tsx` MORGENWALD_MEMENTOS. Ronki
narrates what he found on the trip when the kid opens the diary.
One quote per memento type, rotates through the eight Morgenwald
finds.

| ID | DE | Status |
|---|---|---|
| ronki_memento_ahornblatt | Im Morgenwald hat es nach nassem Moos gerochen, und ich habe ein rotes Blatt mitgebracht weil es leuchtet wenn die Sonne drauf scheint. | tbd |
| ronki_memento_feder | Auf der Lichtung ist eine Feder runtergesegelt während ich gewartet habe, ich glaube ein Vogel hat sie nicht mehr gebraucht. | tbd |
| ronki_memento_bachstein | Der Stein war ganz glatt vom Wasser und kühl in der Hand, ein bisschen wie ein kleines Geheimnis vom Bach. | tbd |
| ronki_memento_eichenblatt | Es hat geknistert als ich draufgetreten bin, und das Goldene drin sieht aus als hätte jemand mit Sonne gemalt. | tbd |
| ronki_memento_eichel | Die hatte sogar noch ihr kleines Hütchen drauf, ich finde das sieht aus wie eine winzige Mütze für einen Wichtel. | tbd |
| ronki_memento_pilz | Den durfte ich nur anschauen, nicht mitnehmen, aber er war wirklich hübsch mit den weißen Punkten oben drauf. | tbd |
| ronki_memento_schneckenhaus | Es war ganz leer und sauber drin und gespiralt, fast als ob jemand ganz vorsichtig damit gespielt hätte. | tbd |
| ronki_memento_moos | Das Moos ist so weich und feucht, riecht nach Erde nach Regen, und du musst es vorsichtig anfassen damit es nicht plattgedrückt wird. | tbd |

## 6. Tap-Ronki reactions (body sounds)

Source: `src/components/drachennest/RoomHub.jsx`. Six body-reaction
moves get a matched sample played when triggered. These are
non-language (giggle, dizzy, coo, burp, huff, wiggle) — short
expressive vocalisations, not full sentences.

| ID | Trigger | Cue | Status |
|---|---|---|---|
| ronki_react_bounce | Bounce reaction | small giggle, ascending | tbd |
| ronki_react_spin | Spin reaction | dizzy "wheee" | tbd |
| ronki_react_wink | Wink reaction | small "tee-hee" coo | tbd |
| ronki_react_burp | Flame-burp reaction | small dragon burp | tbd |
| ronki_react_shake | Shake reaction | quick "huff" | tbd |
| ronki_react_wiggle | Wiggle reaction | wiggle giggle (longer) | tbd |

## 7. Reise status strip (Expedition surface)

Source: `src/components/drachennest/Expedition.jsx`. Drachenmutter
narrates these (NOT Ronki) since they're the framing voice for
the trip flow. Listed here so the voice team has the full set
in one place.

| ID | Voice | DE | Status |
|---|---|---|---|
| narrator_reise_leaving | Drachenmutter | Ronki packt den Rucksack. Bis zum Nachmittag. | tbd |
| narrator_reise_away | Drachenmutter | Ronki ist im Morgenwald. Zurück gegen 14:00 (Uhrzeit dynamisch). | tbd |
| narrator_reise_waiting | Drachenmutter | Ronki ist zurück. Er hat etwas mitgebracht. | tbd |
| ronki_reise_home | Ronki | Ich bin heute voller Vorfreude. | tbd |
| ronki_reise_bye | Ronki | Ich schnapp mir meinen Rucksack. Bis zum Nachmittag. | tbd |
| ronki_reise_returning | Ronki | Ich hab dir was mitgebracht. Willst du es sehen? | tbd |

---

## Generation pipeline notes

- **Output dir.** `public/audio/ronki/<id>.mp3` for Ronki, `public/audio/narrator/<id>.mp3` for Drachenmutter.
- **Format.** ElevenLabs MP3, 22kHz, mono. SFX-style room reverb only on Drachenmutter takes; Ronki dry.
- **Batching.** Categories 1-3 (speech / ask / story) are the kid's daily-loop beats — record those first. Categories 4-7 are the moment-of-payoff lines, second batch.
- **Voice settings.** See `reference_voice_casting.md` in basic-memory for stability + similarity_boost + style values per character.
- **English line backfill.** EN strings should be backfilled in the same file format before the next round of recording — left as `–` for now.

---

## Adding a new line

1. Author the line in the source file (component / data file).
2. Add a row here with a fresh ID, the surface, and DE/EN text.
3. Mark `tbd` until the take ships.
4. When the take is recorded, drop the MP3 into the right `public/audio/...` folder and flip status → `final` here.
