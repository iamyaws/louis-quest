"""Regenerate the entire Ronki voice bank in Harry's voice.

Marc picked Harry (creaky young male) after the Apr 2026 casting round.
This script re-records every line Louis can actually hear, in one pass,
with careful umlaut handling so 'ä/ö/ü' pronounce cleanly.

Scope:
  - 55 engine-routed lines from src/companion/lines/de.ts (after the
    9 cuts + 1 rewrite in the 2026-04-19 audit)
  - Direct-play lines (stamina, screen, teeth, journal, discovery, egg)
    that are called from feature code, not the engine

NOT in scope (different voices / muted today):
  - Narrator lines (Drachenmutter, arc intros/outros, parent_zone_intro,
    onboarding_welcome, ritual_*) — muted app-wide until Drachenmutter
    is re-cast.
  - Freund voices (Pilzhüter already Bill, others pending)

Umlaut safeguards (Marc flagged pronunciation issues in earlier rounds):
  1. File saved as UTF-8 (Python 3 default, verified via 'encoding' on open).
  2. Source strings use real 'ä/ö/ü' characters, never 'ae/oe/ue'
     substitutes (ElevenLabs reads 'ae' as English letters).
  3. Request body is json.dumps(..., ensure_ascii=False).encode('utf-8')
     so umlauts travel as proper UTF-8 bytes, not \\uXXXX escapes.
  4. Language hint passed via language_code='de' where supported by the
     model (multilingual_v2 usually auto-detects, but being explicit
     doesn't hurt).
  5. --smoke flag generates a 5-line umlaut-heavy subset for listening
     BEFORE committing to the full ~80-line batch. Prevents wasting
     quota on a bad voice + umlaut combo.

Usage:
  python scripts/gen-ronki-voice-bank.py --smoke   # 5 lines, quick check
  python scripts/gen-ronki-voice-bank.py --full    # full ~80 line batch
  python scripts/gen-ronki-voice-bank.py           # prints plan, no action
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

# Windows console UTF-8 so umlauts don't mojibake in progress output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ─── Config ──────────────────────────────────────────────────────────────────

VOICE_ID = 'SOYHLrjzK2X1ezoPC6cr'  # Harry — creaky young male, Marc's pick 2026-04-19
VOICE_NAME = 'Harry'
MODEL_ID = 'eleven_multilingual_v2'

# Tuned for Ronki: baby dragon, excitable, emotional variation. Slightly
# higher similarity_boost than casting settings (0.80 vs 0.75) to lock
# Harry's texture; style bumped to 0.55 for character.
VOICE_SETTINGS = {
    'stability': 0.40,
    'similarity_boost': 0.80,
    'style': 0.55,
    'use_speaker_boost': True,
}

OUTPUT_DIR = r'C:\Users\öööö\louis-quest\public\audio\ronki'
ENV_PATH = r'C:\Users\öööö\louis-quest\.env'


# ─── Lines to generate ──────────────────────────────────────────────────────
#
# IDs match src/companion/lines/de.ts and direct-play references in the code.
# Text is the canonical source — update here, not in .ts — when rewriting.
#
# Grouped by the category headers in de.ts for easier review.

ENGINE_LINES = {
    # ── Greetings (hub_open) — 10 after 2 cuts ──
    'de_greet_01':        'Hey! Du bist da! Endlich!',
    'de_greet_02':        'Hey! Ich hab gerade an dich gedacht!',
    'de_greet_03':        'Oh! Da bist du ja! Ich hab was entdeckt…',
    'de_greet_m01':       'Guten Morgen! Ich hab schon gegähnt.',
    'de_greet_m02':       'Morgens bin ich immer ein bisschen verschlafen. Du auch?',
    'de_greet_a01':       'Wie war die Schule? Erzähl mir alles!',
    'de_greet_e01':       'Abend! Bald wird es gemütlich.',
    'de_greet_e02':       'Hast du heute was Cooles erlebt? Ich will alles wissen.',
    'de_greet_n01':       'Gute Nacht bald! Noch ein bisschen zusammen?',
    'de_greet_n02':       'Draußen ist es dunkel. Hier drin ist es warm.',

    # ── Sanctuary — 6 after 1 cut ──
    'de_sanct_01':        'Du bist da! Ich bin im Kreis gelaufen vor Freude!',
    'de_sanct_02':        'Riechst du das? Die Wiese riecht nach Abenteuer!',
    'de_sanct_03':        'Psst — hör mal! Da raschelt was im Gras!',
    'de_sanct_04':        'Schau mal! Eine Libelle! Die ist schneller als ich!',
    'de_sanct_06':        'Weißt du was? Ich hab heute versucht, einen Schmetterling zu fangen. Hat nicht geklappt.',
    'de_sanct_07':        'Mein Lieblingsplatz ist genau hier. Wo ist deiner?',

    # ── Weather — 5 after 2 cuts ──
    'de_w_rain_01':       'Es regnet! Ich mag Regen. Pfützen sind das Beste.',
    'de_w_rain_02':       'Tropf tropf tropf! Hörst du das auch?',
    'de_w_cold_01':       'Brrr! Zieh dich warm an heute! Ich hab ja Schuppen.',
    'de_w_hot_01':        'So warm! Ich könnte den ganzen Tag in der Sonne liegen.',
    'de_w_snow_01':       'SCHNEE! Ich — ich hab noch nie Schnee gesehen! Naja, letztes Mal schon.',

    # ── Quest complete — 3 after 4 cuts (trigger still dormant; wire separately) ──
    'de_quest_01':        'Hast du das gerade geschafft? Wow!',
    'de_quest_03':        'Ich hab zugeguckt. Das war richtig gut.',
    'de_quest_streak_01': 'Drei schon? Du bist heute nicht zu stoppen!',

    # ── Care actions — 6, all kept ──
    'de_care_fed_01':     'Mmmmm! Das war lecker! Hast du auch was gegessen?',
    'de_care_fed_02':     'Danke! Mein Bauch ist jetzt warm und voll.',
    'de_care_pet_01':     'Hihihi! Das kitzelt! Nochmal, nochmal!',
    'de_care_pet_02':     'Ahhh… das ist schön. Du hast warme Hände.',
    'de_care_play_01':    'Spielen! Ja! Ich bin bereit! Fang mich!',
    'de_care_play_02':    'Haha! Ich bin schneller als du! …oder?',

    # ── Idle wonder — 6, all kept (trigger dormant; wire separately) ──
    'de_idle_01':         'Ob Wolken wirklich so weich sind, wie sie aussehen?',
    'de_idle_02':         'Ich hab geträumt, ich kann fliegen. Bald kann ich das wirklich!',
    'de_idle_03':         'Was wärst du, wenn du kein Mensch wärst? Ich wäre ein… Drache. Ach, stimmt ja.',
    'de_idle_04':         'Weißt du, was ich heute gelernt habe? Dass Ameisen richtig stark sind!',
    'de_idle_05':         'Ich hab versucht, meinen eigenen Schwanz zu fangen. Hat nicht geklappt.',
    'de_idle_06':         'Meinst du, Fische können träumen?',

    # ── Arc context — 4, all kept ──
    'de_arc_cool_01':     'Ich ruh mich noch aus vom letzten Abenteuer. Aber mach ruhig weiter!',
    'de_arc_cool_02':     'Puh! Das war aufregend. Ich brauch ein Schläfchen.',
    'de_arc_active_01':   'Wir haben ein Abenteuer! Schau mal oben!',
    'de_arc_active_02':   'Unser Abenteuer wartet! Ich bin so gespannt!',

    # ── Identity language — 4, all kept ──
    'de_identity_01':     'Ich hab den Glühwürmchen erzählt, dass du immer deine Zähne putzt. Die waren beeindruckt!',
    'de_identity_02':     'Die Schmetterlinge sagen, du bist der mutigste Held, den sie kennen.',
    'de_identity_03':     'Weißt du was? Du bist jemand, auf den man sich verlassen kann. Das hab ich gemerkt.',
    'de_identity_04':     'Die Wiese erzählt Geschichten über dich. Lauter gute!',

    # ── Mood-aware — 12, all kept ──
    'de_mood_sad_01':     'Hey... ich bin heute auch ein bisschen leise. Sollen wir zusammen sein?',
    'de_mood_sad_02':     'Manchmal sind Tage einfach so. Ich bin da.',
    'de_mood_sad_03':     'Ich hab dich gesehen. Du bist stark, auch wenn es sich nicht so anfühlt.',
    'de_mood_sad_04':     'Weißt du was hilft? Eine Umarmung. Ich kann leider keine geben — aber stell dir eine vor.',
    'de_mood_tired_01':   'Ich gähne auch. Lass uns heute langsam machen.',
    'de_mood_tired_02':   'Müde sein ist okay. Dann ruhen wir uns aus.',
    'de_mood_happy_01':   'Wow! Du strahlst heute! Was ist passiert?',
    'de_mood_happy_02':   'Ich spüre deine gute Laune. Bin mit angesteckt!',
    'de_mood_happy_03':   'So ein schöner Tag in dir! Nimmst du mich mit?',
    'de_mood_okay_01':    'Mittendrin ist auch gut. Nicht jeder Tag muss funkeln.',
    'de_mood_worried_01': 'Ist was passiert? Du kannst mir erzählen — oder einfach da sein.',
    'de_mood_worried_02': 'Ich bin leise. Dann ist der Kopf freier.',

    # ── Trait-gated — 7, 1 rewritten ──
    'de_trait_brave_01':    'Du bist jemand, der nicht aufgibt. Das weiß ich jetzt.',
    'de_trait_brave_02':    'Mutig ist nicht, keine Angst zu haben. Mutig ist trotzdem machen. Das bist du.',
    'de_trait_gentle_01':   'Deine Ruhe tut allen gut. Auch mir.',
    'de_trait_patient_01':  'Du wartest geduldig — das können nicht alle. Ich lerne von dir.',
    'de_trait_mapmaker_01': 'Der Entdecker ist zurück! Was findest du heute?',
    'de_trait_curious_01':  'Du stellst immer die besten Fragen. Was fragst du dich heute?',
    'de_trait_multi_01':    'Du hast schon so viele Stärken. Du wirst ein großer Held.',

    # ── All-routines-done celebration (new Apr 2026) — fires once when
    # the final tap flips allDone=true. Peak-warmth lines, dragon flourishes. ──
    'de_alldone_01': 'Alles! Du hast ALLES geschafft! Ich glaub, ich könnte platzen vor Stolz!',
    'de_alldone_02': 'Wuuuhuu! Heute war dein Tag! Jede einzelne Aufgabe — fertig!',
    'de_alldone_03': 'Schau mal! Meine Schuppen glitzern. Das passiert nur, wenn du alles schaffst.',
    'de_alldone_04': 'Ich tanze! Guck, ich tanze! Wir haben\'s geschafft!',
    'de_alldone_05': 'Heute war so ein guter Tag. Ich hab jeden Moment mit dir erlebt.',
    'de_alldone_06': 'Die Glühwürmchen werden ganz aufgeregt — ich muss denen alles erzählen!',
    'de_alldone_07': 'Du bist heute mein Lieblingsmensch. Okay, immer. Aber heute besonders.',
    'de_alldone_08': 'Fertig! Jetzt dürfen wir beide müde sein. Gemeinsam müde ist am schönsten.',

    # ── Freund-met variations (new Apr 2026) — Ronki reacting to a new
    # Freund unlocking / appearing. Wire voice.say('freund_met') at the
    # fire site when one lands (Pilzhüter reunion, Micropedia first-discovery). ──
    'de_freund_met_01': 'Ein neuer Freund! Schau mal, schau mal! Der sieht so interessant aus!',
    'de_freund_met_02': 'Oh! Den hab ich schon mal gesehen, glaub ich. Oder vielleicht auch nicht. Trotzdem!',
    'de_freund_met_03': 'Hallo, neuer Freund! Wir freuen uns, dich zu treffen.',
    'de_freund_met_04': 'Mein Herz macht pongpongpong. Das passiert bei neuen Freunden.',
    'de_freund_met_05': 'Komm her. Wir haben viel zu erzählen.',
    'de_freund_met_06': 'Uff! So viele neue Namen. Gut, dass du mir hilfst, die zu merken.',
}

DIRECT_PLAY_LINES = {
    # ── Stamina (MiniGames) — text preserved from earlier gen-stamina-audio.py ──
    'de_stamina_low_01':       'Puh, ich werde langsam müde vom Fliegen. Aber einmal noch geht bestimmt.',
    'de_stamina_exhausted_01': 'Ich bin ganz platt. Kannst du ein bisschen ohne mich spielen?',
    'de_stamina_restored_01':  'Ausgeruht! Lass uns wieder losziehen.',

    # ── Screen timer countdown ──
    'de_screen_start':    'Deine Funkelzeit läuft. Viel Spaß!',
    'de_screen_half':     'Die Hälfte deiner Zeit ist rum. Alles gut bei dir?',
    'de_screen_5min':     'Noch fünf Minuten. Lass es schön ausklingen.',
    'de_screen_2min':     'Nur noch zwei Minuten. Gleich legen wir weg.',
    'de_screen_1min':     'Eine Minute. Letzter Moment!',
    'de_screen_done':     'Zeit ist rum. Gut gemacht — bis nachher!',
    'de_screen_eyes':     'Kurz weggucken. Augen wollen auch Pause.',
    'de_screen_eyes2':    'Blinzel mal. Fenster, Wand, weit weg schauen.',
    'de_screen_eyes3':    'Augen zwinkern nicht vergessen.',

    # ── Screentime tier milestones (from earlier gen-screentime-audio.py) ──
    'de_screentime_50_01':   'Wir haben noch ein bisschen Zeit zusammen. Worauf hast du Lust?',
    'de_screentime_20_01':   'Gleich ist unsere Zeit um. Willst du noch etwas Besonderes machen?',
    'de_screentime_10_01':   'Noch eine Minute, dann ist Pause. Du machst das super.',
    'de_screentime_done_01': 'Gut gemacht! Bis später.',

    # ── Tooth brushing timeline (2 min quadrant model) ──
    'de_teeth_start':       'Zähne putzen! Oben links fangen wir an.',
    'de_teeth_topright':    'Oben rechts. Kleine Kreise.',
    'de_teeth_bottomleft':  'Jetzt unten links.',
    'de_teeth_bottomright': 'Letzte Ecke. Unten rechts.',
    'de_teeth_halfway':     'Die Hälfte ist geschafft. Du machst das super.',
    'de_teeth_done':        'Fertig! Super sauber.',

    # ── Brushing — mid-session encouragement variations (Apr 2026).
    # Played randomly between quadrant transitions so brushing doesn't feel
    # scripted. ToothbrushTimer picks one from the pool at ~45s and ~105s. ──
    'de_teeth_mid_01':      'Nicht aufhören! Die Ecken hinten sind knifflig.',
    'de_teeth_mid_02':      'Kreise machen! So klein wie Erbsen.',
    'de_teeth_mid_03':      'Hmm. Meine Zähne jucken auch. Vielleicht sollten wir beide putzen.',
    'de_teeth_mid_04':      'Denk an die Rückseite! Die Zahnbürste freut sich über jede Ecke.',

    # ── Brushing — Ronki brushing his own teeth alongside (Marc's pitch).
    # Same random pool as mid_* — makes the session feel like a duet. ──
    'de_teeth_ronki_01':    'Ich putz auch mit! Drachen-Zahnbürsten gibt\'s extra.',
    'de_teeth_ronki_02':    'Meine Zähne sind klein und spitz. Aber putzen muss ich trotzdem.',
    'de_teeth_ronki_03':    'Moment — wo ist meine Zahnbürste? Ah, unter dem Stein.',

    # ── Brushing — warmer done variations (pick one of three randomly). ──
    'de_teeth_done_02':     'Fertig! Ich kann deine Zähne von hier glitzern sehen.',
    'de_teeth_done_03':     'Zwei Minuten geschafft! Das ist länger als mein Atem anhält.',

    # ── Journal done (random of 3 on save) ──
    'de_journal_done_01': 'Das hast du schön aufgeschrieben.',
    'de_journal_done_02': 'Dein Tag klingt nach was Gutem.',
    'de_journal_done_03': 'Danke fürs Teilen. Ich merk mir das.',

    # ── Discovery toast ──
    'de_discover_creature': 'Schau mal! Ein neuer Freund! Lass uns ihn kennenlernen.',

    # ── Egg system (feature paused, audio may still be used) ──
    'de_egg_found':  'Oh! Ein Ei! Wo kommt das denn her?',
    'de_egg_hatch':  'Es bewegt sich! Gleich passiert was!',
}

# Smoke-test subset: 5 umlaut-heavy lines. If these pronounce cleanly,
# the full batch is safe to run. Covers ä/ö/ü + ß + common problem words.
SMOKE_IDS = [
    'de_greet_m01',        # "Ich hab schon gegähnt"
    'de_sanct_06',         # "Weißt du was? … Schmetterling … Hat nicht geklappt"
    'de_w_cold_01',        # "Zieh dich warm an … Ich hab ja Schuppen"
    'de_identity_01',      # "Glühwürmchen … Zähne putzt … beeindruckt"
    'de_trait_brave_02',   # "Mutig ist trotzdem machen"
]


# ─── Plumbing ────────────────────────────────────────────────────────────────

def load_api_key():
    with open(ENV_PATH, 'r', encoding='utf-8') as f:
        for raw in f:
            line = raw.strip()
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
            if line.startswith('VITE_ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
    raise RuntimeError('ELEVENLABS_API_KEY not found in .env')


def generate(api_key, line_id, text):
    """Generate one MP3. Returns (path, bytes) on success, raises on error."""
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}'
    # ensure_ascii=False keeps umlauts as real UTF-8 bytes in the payload,
    # not \uXXXX escape sequences — important for pronunciation.
    body = json.dumps({
        'text': text,
        'model_id': MODEL_ID,
        'language_code': 'de',
        'voice_settings': VOICE_SETTINGS,
    }, ensure_ascii=False).encode('utf-8')

    req = urllib.request.Request(
        url,
        data=body,
        method='POST',
        headers={
            'xi-api-key': api_key,
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'audio/mpeg',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            audio = resp.read()
    except urllib.error.HTTPError as e:
        # If language_code isn't accepted by the model, retry without it
        err_body = e.read().decode('utf-8', errors='replace')
        if 'language_code' in err_body.lower():
            body2 = json.dumps({
                'text': text,
                'model_id': MODEL_ID,
                'voice_settings': VOICE_SETTINGS,
            }, ensure_ascii=False).encode('utf-8')
            req2 = urllib.request.Request(
                url, data=body2, method='POST',
                headers={
                    'xi-api-key': api_key,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'audio/mpeg',
                },
            )
            with urllib.request.urlopen(req2, timeout=90) as resp:
                audio = resp.read()
        else:
            raise RuntimeError(f'HTTP {e.code}: {err_body}') from e

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f'{line_id}.mp3')
    with open(out_path, 'wb') as f:
        f.write(audio)
    return out_path, len(audio)


def run_batch(api_key, lines_dict, label, skip_existing=False):
    print(f'\n▶ {label}: {len(lines_dict)} lines')
    print(f'  Voice: {VOICE_NAME} ({VOICE_ID})')
    print(f'  Model: {MODEL_ID}')
    print(f'  Output: {OUTPUT_DIR}')
    if skip_existing:
        print(f'  Mode:   skip-existing (only regenerates missing files)')
    print('')

    ok = 0
    fail = 0
    skipped = 0
    for i, (line_id, text) in enumerate(lines_dict.items(), 1):
        preview = text if len(text) < 55 else text[:52] + '…'
        target = os.path.join(OUTPUT_DIR, f'{line_id}.mp3')
        # Skip any file that already exists and is non-trivial size — lets us
        # add new lines to the dict without re-burning quota on the ~90 that
        # already have Harry audio.
        if skip_existing and os.path.exists(target) and os.path.getsize(target) > 1024:
            print(f'[{i:02d}/{len(lines_dict)}] {line_id:<28} skip (exists)')
            skipped += 1
            continue
        print(f'[{i:02d}/{len(lines_dict)}] {line_id:<28} {preview}')
        try:
            path, size = generate(api_key, line_id, text)
            print(f'   ✓ {size // 1024} KB')
            ok += 1
        except Exception as e:
            print(f'   ✗ {e}')
            fail += 1
        # ElevenLabs soft cap ~2 req/s on lower tiers; be polite
        if i < len(lines_dict):
            time.sleep(0.7)

    tail = f', {skipped} skipped' if skip_existing else ''
    print(f'\n{label} done: {ok} ok, {fail} failed{tail}')
    return ok, fail


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--smoke', action='store_true',
                    help='Generate 5 umlaut-heavy lines only (quick listen-test)')
    ap.add_argument('--full', action='store_true',
                    help='Generate the full bank (~110 lines)')
    ap.add_argument('--skip-existing', action='store_true',
                    help='Only regenerate lines whose MP3 is missing. Pair with '
                         '--full to add new lines without re-burning quota on '
                         'already-rendered ones.')
    args = ap.parse_args()

    if not args.smoke and not args.full:
        # Print plan only — no API calls
        total = len(ENGINE_LINES) + len(DIRECT_PLAY_LINES)
        print(f'Ronki voice bank regen — {VOICE_NAME}')
        print(f'  Engine lines:  {len(ENGINE_LINES)}')
        print(f'  Direct-play:   {len(DIRECT_PLAY_LINES)}')
        print(f'  Total:         {total}')
        print(f'  Smoke subset:  {len(SMOKE_IDS)}')
        print('\nRun with --smoke first to verify umlauts.')
        print('Then --full to commit the full batch.')
        return

    api_key = load_api_key()

    if args.smoke:
        smoke = {k: ENGINE_LINES[k] for k in SMOKE_IDS if k in ENGINE_LINES}
        run_batch(api_key, smoke, 'SMOKE TEST')
        print('\nListen to the 5 files. If umlauts pronounce cleanly, run --full.')
        return

    if args.full:
        skip = args.skip_existing
        ok1, fail1 = run_batch(api_key, ENGINE_LINES, 'ENGINE-ROUTED LINES', skip_existing=skip)
        ok2, fail2 = run_batch(api_key, DIRECT_PLAY_LINES, 'DIRECT-PLAY LINES', skip_existing=skip)
        total_ok = ok1 + ok2
        total_fail = fail1 + fail2
        print(f'\n━━━ Full batch: {total_ok} ok, {total_fail} failed ━━━')
        if total_fail:
            print('Failed lines shown above. Re-run to retry failures.')


if __name__ == '__main__':
    main()
