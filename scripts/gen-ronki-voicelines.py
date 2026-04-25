"""Generate Ronki + Drachenmutter voicelines from the Drachennest line bank.

Single source of truth for each line lives in `docs/ronki-voicelines.md`.
This script keeps a Python copy of the same lines (kept in sync by hand
when the markdown changes — voice agent doesn't read markdown). Each
line has an id, a speaker (ronki / drachenmutter), and the German copy.

Voice IDs mirror `reference_voice_casting.md` in basic-memory and the
existing gen-ritual-voice-pack.py script:
  · Ronki         → Harry (SOYHLrjzK2X1ezoPC6cr) — locked
  · Drachenmutter → Bella (hpp4J3VqNfWAUOO0d1Us) — placeholder, swap when shortlist picks land

Output layout:
  · Ronki lines        → public/audio/ronki/<id>.mp3
  · Drachenmutter      → public/audio/narrator/<id>.mp3

Usage:
  python scripts/gen-ronki-voicelines.py --smoke           # 3-line umlaut + voice check
  python scripts/gen-ronki-voicelines.py --full            # all lines, skip existing
  python scripts/gen-ronki-voicelines.py --full --regen    # all lines, overwrite

Requires:
  · ELEVENLABS_API_KEY env var (or in .env.local, picked up via dotenv)
  · model_id 'eleven_multilingual_v2' (default — supports German + English)

Notes:
  · UTF-8 safe — ensure_ascii=False on the JSON body so umlauts hit
    ElevenLabs as real bytes, not \\uXXXX escapes.
  · Polite throttling — 0.5s between requests so we don't trip the
    rate limit on a 50-line batch.
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ─── .env.local pickup ──────────────────────────────────────────────
try:
    here = os.path.dirname(os.path.abspath(__file__))
    repo = os.path.dirname(here)
    for envfile in ('.env.local', '.env'):
        path = os.path.join(repo, envfile)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as fp:
                for line in fp:
                    if '=' in line and not line.strip().startswith('#'):
                        k, _, v = line.strip().partition('=')
                        os.environ.setdefault(k, v.strip().strip('"').strip("'"))
            break
except Exception:
    pass

API_KEY = os.environ.get('ELEVENLABS_API_KEY')
if not API_KEY:
    print('error: ELEVENLABS_API_KEY not set (check .env.local)', file=sys.stderr)
    sys.exit(2)

# ─── Voice config ──────────────────────────────────────────────────

RONKI_VOICE_ID = 'SOYHLrjzK2X1ezoPC6cr'   # Harry — locked Ronki voice
RONKI_SETTINGS = {
    'stability': 0.40,
    'similarity_boost': 0.80,
    'style': 0.55,
    'use_speaker_boost': True,
}

NARRATOR_VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us'  # Bella — Drachenmutter placeholder
NARRATOR_SETTINGS = {
    'stability': 0.70,
    'similarity_boost': 0.72,
    'style': 0.30,
    'use_speaker_boost': True,
}

MODEL_ID = 'eleven_multilingual_v2'

# ─── Line bank ─────────────────────────────────────────────────────
# Mirror docs/ronki-voicelines.md by hand. Each entry:
#   { id, speaker: 'ronki'|'narrator', text, status (informational) }

LINES = [
    # ── 1. Speech-bubble rotation (Drachennest, RoomHub) ──
    {'id': 'ronki_speech_room_01', 'speaker': 'ronki', 'text': 'Ich mag es wenn du bei mir bist.'},
    {'id': 'ronki_speech_room_02', 'speaker': 'ronki', 'text': 'Spielst du heute mit mir?'},
    {'id': 'ronki_speech_room_03', 'speaker': 'ronki', 'text': 'Mein Bauch grummelt so ein bisschen…'},
    {'id': 'ronki_speech_room_04', 'speaker': 'ronki', 'text': 'Erzähl mir was du heute erlebt hast.'},
    {'id': 'ronki_speech_room_05', 'speaker': 'ronki', 'text': 'Kannst du mich mal streicheln?'},
    {'id': 'ronki_speech_room_06', 'speaker': 'ronki', 'text': 'Ich hab heut Nacht von fliegenden Keksen geträumt.'},

    # ── 2. Quest-ask voicelines (TaskList) ──
    {'id': 'ronki_ask_breakfast',        'speaker': 'ronki', 'text': 'Mein Bauch grummelt schon. Frühstückst du was Leckeres?'},
    {'id': 'ronki_ask_brushteeth',       'speaker': 'ronki', 'text': 'Magst du mir zeigen wie lang du Zähne putzt? Ich glaub ich kann das auch.'},
    {'id': 'ronki_ask_dress',            'speaker': 'ronki', 'text': 'Welches T-Shirt magst du heute? Ich find die mit Drachen drauf am schönsten.'},
    {'id': 'ronki_ask_water_morning',    'speaker': 'ronki', 'text': 'Hast du was zu trinken? Ich krieg sonst Halskratzen vom Funken-Pusten.'},
    {'id': 'ronki_ask_pack_school',      'speaker': 'ronki', 'text': 'Was packst du heute alles ein? Ich würd am liebsten mitkommen.'},
    {'id': 'ronki_ask_shoes',            'speaker': 'ronki', 'text': 'Ziehst du dir gleich Schuhe an? Vielleicht hilft mir das auch wieder warm zu werden.'},
    {'id': 'ronki_ask_homework',         'speaker': 'ronki', 'text': 'Was hast du heute auf? Ich kann zugucken wenn du magst.'},
    {'id': 'ronki_ask_water_afternoon',  'speaker': 'ronki', 'text': 'Trinkst du nochmal? Mein Schwanz wird sonst trocken-knisterig.'},
    {'id': 'ronki_ask_freetime',         'speaker': 'ronki', 'text': 'Was machst du jetzt? Ich freu mich was du dir aussuchst.'},
    {'id': 'ronki_ask_dinner',           'speaker': 'ronki', 'text': 'Kommt jetzt Abendessen? Ich rieche schon was Leckeres.'},
    {'id': 'ronki_ask_pyjama',           'speaker': 'ronki', 'text': 'Holst du dir den Schlafanzug? Ich mag wenn der weich ist.'},
    {'id': 'ronki_ask_bedstory',         'speaker': 'ronki', 'text': 'Liest du noch eine Geschichte? Ich hör auch zu, ganz leise.'},
    {'id': 'ronki_ask_lights_off',       'speaker': 'ronki', 'text': 'Knipsen wir das Licht aus? Dann seh ich die Sterne durchs Fenster besser.'},

    # ── 3. Bei Ronki sein presence stories ──
    {'id': 'ronki_story_clouds',     'speaker': 'ronki', 'text': 'Heute hab ich an die Wolken gedacht. Manche davon sahen aus wie kleine Drachen die Verstecken spielen.'},
    {'id': 'ronki_story_leaves',     'speaker': 'ronki', 'text': 'Im Morgenwald rascheln die Blätter ganz leise wenn niemand hinsieht. Ich glaub die erzählen sich kleine Witze.'},
    {'id': 'ronki_story_fire',       'speaker': 'ronki', 'text': "Ich mag wie's hier riecht wenn das Feuer knistert. Irgendwie nach Marshmallows und nach Holz und nach gemütlich."},
    {'id': 'ronki_story_stars',      'speaker': 'ronki', 'text': 'Manchmal frag ich mich was die Sterne eigentlich machen wenn keiner sie anschaut. Vielleicht tanzen sie ein bisschen.'},
    {'id': 'ronki_story_tail',       'speaker': 'ronki', 'text': "Weißt du was lustig ist, mein Schwanz schläft manchmal vor mir ein. Dann muss ich ihn ganz vorsichtig wecken."},
    {'id': 'ronki_story_blanket',    'speaker': 'ronki', 'text': "Wenn ich so mit dir am Feuer sitze, fühlt sich der ganze Tag an wie in eine warme Decke eingewickelt."},
    {'id': 'ronki_story_beetle',     'speaker': 'ronki', 'text': 'Heute morgen hat ein kleiner Käfer mein Frühstück angeguckt. Ich hab ihn gefragt ob er was abhaben will, er war aber viel zu schüchtern.'},
    {'id': 'ronki_story_forgot',     'speaker': 'ronki', 'text': 'Ich hab vergessen was ich eigentlich erzählen wollte. Aber das ist okay, ich bin einfach gern mit dir hier.'},
    {'id': 'ronki_story_birch',      'speaker': 'ronki', 'text': 'Manchmal lieg ich abends da und mag das Geräusch wenn der Wind in den Birken oben umherwandert. Klingt fast wie wer leise summt.'},
    {'id': 'ronki_story_mama',       'speaker': 'ronki', 'text': 'Mama-Drache hat mir mal gezeigt wie man Funken pustet ohne dass was kaputtgeht. Sie sagt das geht nur wenn man ruhig atmet.'},

    # ── 4. System / UI lines ──
    {'id': 'ronki_system_mood_ask',       'speaker': 'ronki', 'text': "Wie geht's dir heute?"},
    {'id': 'ronki_system_adventure_cta',  'speaker': 'ronki', 'text': "Lass uns auf Abenteuer gehen, ich bringe dir was Schönes mit."},

    # ── 4b. Stamina-out full-screen takeover ──
    {'id': 'ronki_stamina_out_01', 'speaker': 'ronki', 'text': 'Puh, jetzt brauch ich mal eine kleine Pause vom Spielen. Magst du was anderes mit mir machen? Wir spielen später wieder, versprochen.'},
    {'id': 'ronki_stamina_out_02', 'speaker': 'ronki', 'text': 'Mein Kopf ist ein bisschen müde von den ganzen Spielen. Wir kommen gleich wieder, und dann hab ich wieder mehr Lust.'},
    {'id': 'ronki_stamina_out_03', 'speaker': 'ronki', 'text': 'Komm wir machen jetzt was anderes zusammen. Spielen ist toll, aber zu viel auf einmal macht mich ganz wuselig im Bauch.'},

    # ── 5. Memento return quotes (Reise diary modal) ──
    {'id': 'ronki_memento_ahornblatt',   'speaker': 'ronki', 'text': 'Im Morgenwald hat es nach nassem Moos gerochen, und ich habe ein rotes Blatt mitgebracht weil es leuchtet wenn die Sonne drauf scheint.'},
    {'id': 'ronki_memento_feder',        'speaker': 'ronki', 'text': 'Auf der Lichtung ist eine Feder runtergesegelt während ich gewartet habe, ich glaube ein Vogel hat sie nicht mehr gebraucht.'},
    {'id': 'ronki_memento_bachstein',    'speaker': 'ronki', 'text': 'Der Stein war ganz glatt vom Wasser und kühl in der Hand, ein bisschen wie ein kleines Geheimnis vom Bach.'},
    {'id': 'ronki_memento_eichenblatt',  'speaker': 'ronki', 'text': 'Es hat geknistert als ich draufgetreten bin, und das Goldene drin sieht aus als hätte jemand mit Sonne gemalt.'},
    {'id': 'ronki_memento_eichel',       'speaker': 'ronki', 'text': 'Die hatte sogar noch ihr kleines Hütchen drauf, ich finde das sieht aus wie eine winzige Mütze für einen Wichtel.'},
    {'id': 'ronki_memento_pilz',         'speaker': 'ronki', 'text': 'Den durfte ich nur anschauen, nicht mitnehmen, aber er war wirklich hübsch mit den weißen Punkten oben drauf.'},
    {'id': 'ronki_memento_schneckenhaus','speaker': 'ronki', 'text': 'Es war ganz leer und sauber drin und gespiralt, fast als ob jemand ganz vorsichtig damit gespielt hätte.'},
    {'id': 'ronki_memento_moos',         'speaker': 'ronki', 'text': 'Das Moos ist so weich und feucht, riecht nach Erde nach Regen, und du musst es vorsichtig anfassen damit es nicht plattgedrückt wird.'},

    # ── 6. Reise status strip / Drachenmutter narration ──
    {'id': 'narrator_reise_leaving',  'speaker': 'narrator', 'text': 'Ronki packt den Rucksack. Bis zum Nachmittag.'},
    {'id': 'narrator_reise_away',     'speaker': 'narrator', 'text': 'Ronki ist im Morgenwald.'},
    {'id': 'narrator_reise_waiting',  'speaker': 'narrator', 'text': 'Ronki ist zurück. Er hat etwas mitgebracht.'},
    {'id': 'ronki_reise_home',        'speaker': 'ronki',    'text': 'Ich bin heute voller Vorfreude.'},
    {'id': 'ronki_reise_bye',         'speaker': 'ronki',    'text': 'Ich schnapp mir meinen Rucksack. Bis zum Nachmittag.'},
    {'id': 'ronki_reise_returning',   'speaker': 'ronki',    'text': 'Ich hab dir was mitgebracht. Willst du es sehen?'},
]


def out_dir(speaker):
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sub = 'narrator' if speaker == 'narrator' else 'ronki'
    d = os.path.join(repo, 'public', 'audio', sub)
    os.makedirs(d, exist_ok=True)
    return d


def gen_one(line, regen=False):
    voice_id = NARRATOR_VOICE_ID if line['speaker'] == 'narrator' else RONKI_VOICE_ID
    settings = NARRATOR_SETTINGS if line['speaker'] == 'narrator' else RONKI_SETTINGS

    target = os.path.join(out_dir(line['speaker']), f'{line["id"]}.mp3')
    if os.path.exists(target) and not regen:
        return ('skip', target)

    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    body = {
        'text': line['text'],
        'model_id': MODEL_ID,
        'voice_settings': settings,
    }
    payload = json.dumps(body, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            'xi-api-key': API_KEY,
            'accept': 'audio/mpeg',
            'content-type': 'application/json',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            mp3 = r.read()
    except urllib.error.HTTPError as e:
        return ('fail', f'{e.code} {e.reason}: {e.read().decode("utf-8", "ignore")[:200]}')
    except Exception as e:
        return ('fail', str(e))

    with open(target, 'wb') as fp:
        fp.write(mp3)
    return ('ok', target)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--smoke', action='store_true', help='Generate first 3 lines only')
    ap.add_argument('--full', action='store_true', help='Generate all lines')
    ap.add_argument('--regen', action='store_true', help='Overwrite existing files')
    args = ap.parse_args()

    if not (args.smoke or args.full):
        ap.error('pick --smoke or --full')

    batch = LINES[:3] if args.smoke else LINES
    print(f'Generating {len(batch)} lines (regen={args.regen})')
    ok = skip = fail = 0
    for i, line in enumerate(batch, 1):
        status, info = gen_one(line, regen=args.regen)
        if status == 'ok':
            ok += 1
            print(f'  [{i:>2}/{len(batch)}] ok    {line["id"]}')
        elif status == 'skip':
            skip += 1
            print(f'  [{i:>2}/{len(batch)}] skip  {line["id"]} (exists)')
        else:
            fail += 1
            print(f'  [{i:>2}/{len(batch)}] FAIL  {line["id"]}: {info}', file=sys.stderr)
        time.sleep(0.5)
    print(f'\nDone — {ok} generated, {skip} skipped, {fail} failed')
    sys.exit(0 if fail == 0 else 1)


if __name__ == '__main__':
    main()
