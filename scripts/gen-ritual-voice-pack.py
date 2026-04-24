"""Generate the ritual voice pack — Drachenmutter + Ronki dual-voice.

Five fire-breath teach flows (onboarding.teach + 4 ritual.*) each carry
seven voice-worthy copy keys. Drachenmutter narrates all of them except
`celebrate`, which is Ronki's own reaction line. 35 MP3s total.

Layout matches `public/audio/voice/ritual/<flavor>/<key>.mp3` per Marc's
spec — new convention established here, no prior files on disk.

Voice IDs (mirror `reference_voice_casting.md` in basic-memory):
  · Drachenmutter → placeholder Bella until Marc picks from the 4-candidate
    shortlist (Alice / Charlotte / Lily / Grace). When he does, change
    NARRATOR_VOICE_ID below and re-run with --skip-existing off (or delete
    the 30 narrator files first) to regenerate.
  · Ronki → Harry (locked 2026-04-22, matches the Ronki line bank)

Target narrator settings per the reference doc: stability 0.70, similarity
0.72, style 0.30 — slower, grounded, low-style for calm instruction.

Umlaut safety: ensure_ascii=False on the JSON body so ä/ö/ü hit ElevenLabs
as real UTF-8 bytes, not \\uXXXX escapes. language_code='de' hint with
auto-fallback if the tier rejects the param.

Usage:
  python scripts/gen-ritual-voice-pack.py --smoke    # 2-file umlaut check
  python scripts/gen-ritual-voice-pack.py --full     # all 35
  python scripts/gen-ritual-voice-pack.py --full --skip-existing
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

# ─── Voices ──────────────────────────────────────────────────────────────────

NARRATOR_VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us'  # Bella — Drachenmutter placeholder
NARRATOR_VOICE_NAME = 'Bella (placeholder)'
NARRATOR_VOICE_SETTINGS = {
    # Reference-doc target for Drachenmutter: slower, grounded, low-style
    # so she reads as calm authority telling a bedtime-story-ish ritual.
    'stability': 0.70,
    'similarity_boost': 0.72,
    'style': 0.30,
    'use_speaker_boost': True,
}

RONKI_VOICE_ID = 'SOYHLrjzK2X1ezoPC6cr'  # Harry — locked Ronki voice
RONKI_VOICE_NAME = 'Harry'
RONKI_VOICE_SETTINGS = {
    # Production Ronki settings — match the existing Harry line bank so the
    # celebrate lines sit in the same sonic space as hub/sanctuary/care lines.
    'stability': 0.40,
    'similarity_boost': 0.80,
    'style': 0.55,
    'use_speaker_boost': True,
}

MODEL_ID = 'eleven_multilingual_v2'

# Hardcoded paths using \u00f6 escapes so the source stays ASCII-clean
# (avoids tooling mangling the ö bytes on save). Windows Unicode
# filesystem APIs pass these through fine even when os.getcwd() or
# __file__ report mangled replacements — Python's CreateFileW call uses
# the in-memory string, not the OS-reported cwd string.
_REPO = 'C:\\Users\\\u00f6\u00f6\u00f6\u00f6\\louis-quest'
OUTPUT_ROOT = _REPO + '\\public\\audio\\voice\\ritual'
# The repo uses .env.local (Vite convention, loaded by dev server).
# Old scripts still reference .env — add a fallback so both paths work.
ENV_CANDIDATES = [_REPO + '\\.env.local', _REPO + '\\.env']


# ─── Content ─────────────────────────────────────────────────────────────────
#
# Five flavors × seven voice-worthy keys = 35 lines. Per-key voice routing:
# the `celebrate` line is Ronki's reaction ("Jaaa! So geht's!"), the other
# six are Drachenmutter narrating and instructing.
#
# Skipped intentionally (per Marc's spec): title, holdLabel, next.
# Also skipped: onboarding.teach.tooEarly — not on Marc's voice-worthy list.

FLAVORS = {
    # onboarding.teach.* → flame/ folder (onboarding teaches the first fire)
    'flame': {
        'intro':     'Ronki ist gerade geschlüpft. Er weiß noch nichts. Zeig ihm, wie man tief Luft holt.',
        'tryFail':   'Er will Feuer machen … schafft\u2019s aber nicht.',
        'tryAgain':  'Probier nochmal und diesmal die Luft ganz lange anhalten bevor du loslässt.',
        'holdHint':  'Tief einatmen. Lass los, wenn der Bauch ganz voll ist.',
        'smokeFail': 'Hmm das war glaub ich noch zu kurz, da kam nur bisschen Rauch raus statt Feuer.',
        'celebrate': 'Jaaa! So geht\u2019s!',
        'soloLine':  'Er hat\u2019s gelernt. Er vergisst das nie.',
    },
    # ritual.herzfeuer.*
    'herzfeuer': {
        'intro':     'Du hast in letzter Zeit so viel mit deinen Freunden geteilt dass Ronki was Neues gelernt hat, und jetzt will er dir zeigen wie sich ein warmes Herz anfühlt wenn man\u2019s rauslässt.',
        'tryFail':   'Er will\u2019s versuchen weiß aber noch nicht so richtig wie.',
        'tryAgain':  'Probier nochmal und denk dabei an deinen liebsten Freund.',
        'holdHint':  'Ruhig atmen und das Gefühl im Bauch festhalten bis es rauswill.',
        'smokeFail': 'Ach schade, das Herzfeuer ist ein bisschen tricky und braucht beim ersten Mal meistens mehr Zeit.',
        'celebrate': 'Oh! Ein Herzfeuer!',
        'soloLine':  'Jetzt kann er\u2019s von selbst und wird es für alle seine Freunde machen können.',
    },
    # ritual.funkenstern.*
    'funkenstern': {
        'intro':     'Du hast in letzter Zeit so viel entdeckt dass in Ronki was Neues gewachsen ist und er will dir das jetzt zeigen.',
        'tryFail':   'Er spürt die Sterne irgendwo in sich drin aber kriegt sie noch nicht nach draußen.',
        'tryAgain':  'Probier nochmal und denk dabei an was das du kürzlich herausgefunden hast.',
        'holdHint':  'Langsam einatmen und die Neugier im Bauch festhalten bis sie rauswill.',
        'smokeFail': 'Ach der Funkenstern kommt beim ersten Mal irgendwie immer zu schnell wieder raus, probier nochmal.',
        'celebrate': 'Ah! Funkensterne!',
        'soloLine':  'Jetzt kann er\u2019s alleine und macht das immer wenn du wieder was Neues herausfindest.',
    },
    # ritual.glut.*
    'glut': {
        'intro':     'Du hast in letzter Zeit so viele kleine Abenteuer gemacht dass Ronki sich dafür eine eigene Flamme gemerkt hat.',
        'tryFail':   'Er versucht\u2019s gerade, die Glut will raus aber er hält sie irgendwie noch fest.',
        'tryAgain':  'Probier nochmal und denk dabei an dein wildestes Abenteuer.',
        'holdHint':  'Tief einatmen und die Glut im Bauch festhalten so lange du kannst.',
        'smokeFail': 'Hmm die Glut braucht beim ersten Mal irgendwie immer einen Moment länger, probier nochmal.',
        'celebrate': 'Ja! Glut!',
        'soloLine':  'Jetzt kann er\u2019s alleine, immer wenn du wieder ein kleines Abenteuer machst.',
    },
    # ritual.regenbogen.*
    'regenbogen': {
        'intro':     'Du hast echt einen weiten Weg hinter dir inzwischen und Ronki will dir jetzt was ganz Besonderes zeigen.',
        'tryFail':   'Er fühlt alle Farben in sich drin aber sie wollen irgendwie noch nicht raus.',
        'tryAgain':  'Probier nochmal und denk dabei an alles was du bisher geschafft hast.',
        'holdHint':  'Ruhig atmen und die Farben alle gleichzeitig festhalten so gut es geht.',
        'smokeFail': 'Ach das Regenbogenfeuer ist das allergrößte und braucht echt viel Luft, probier nochmal.',
        'celebrate': 'WOW! Ein Regenbogen!',
        'soloLine':  'Jetzt kann er\u2019s alleine und macht das immer für die ganz großen Momente.',
    },
}

# Keys that speak in Ronki's voice (all others → Drachenmutter).
RONKI_KEYS = {'celebrate'}

# Smoke-test subset — umlaut-heavy lines across both voices to catch any
# pronunciation regressions before committing the full 35.
SMOKE = [
    ('flame',     'intro'),       # Drachenmutter, umlauts: "gerade geschlüpft"
    ('herzfeuer', 'holdHint'),    # Drachenmutter, "festhalten bis es rauswill"
    ('regenbogen','celebrate'),   # Ronki, short exclamation
    ('flame',     'celebrate'),   # Ronki, apostrophe inside exclamation
]


# ─── Plumbing ────────────────────────────────────────────────────────────────

def load_api_key():
    for path in ENV_CANDIDATES:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for raw in f:
                    line = raw.strip()
                    if line.startswith('ELEVENLABS_API_KEY='):
                        return line.split('=', 1)[1].strip('"').strip("'")
                    if line.startswith('VITE_ELEVENLABS_API_KEY='):
                        return line.split('=', 1)[1].strip('"').strip("'")
        except FileNotFoundError:
            continue
    raise RuntimeError(
        'ELEVENLABS_API_KEY not found in .env.local or .env '
        '(tried: ' + ', '.join(ENV_CANDIDATES) + ')'
    )


def generate(api_key, voice_id, voice_settings, text, out_path):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    body = json.dumps({
        'text': text,
        'model_id': MODEL_ID,
        'language_code': 'de',
        'voice_settings': voice_settings,
    }, ensure_ascii=False).encode('utf-8')

    req = urllib.request.Request(
        url, data=body, method='POST',
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
        err_body = e.read().decode('utf-8', errors='replace')
        # Some tiers reject language_code — retry without it, model auto-detects.
        if 'language_code' in err_body.lower():
            body2 = json.dumps({
                'text': text,
                'model_id': MODEL_ID,
                'voice_settings': voice_settings,
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

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(audio)
    return len(audio)


def resolve(voice_label, key):
    """Return (voice_id, settings, voice_name) for a given key."""
    if key in RONKI_KEYS:
        return RONKI_VOICE_ID, RONKI_VOICE_SETTINGS, RONKI_VOICE_NAME
    return NARRATOR_VOICE_ID, NARRATOR_VOICE_SETTINGS, NARRATOR_VOICE_NAME


def run(api_key, targets, skip_existing=False):
    """`targets` = list of (flavor, key) tuples. Returns (ok, fail, skipped)."""
    print(f'\n▶ {len(targets)} files')
    print(f'  Narrator: {NARRATOR_VOICE_NAME} ({NARRATOR_VOICE_ID})')
    print(f'  Ronki:    {RONKI_VOICE_NAME} ({RONKI_VOICE_ID})')
    print(f'  Output:   {OUTPUT_ROOT}')
    if skip_existing:
        print(f'  Mode:     skip-existing')
    print('')

    ok = fail = skipped = 0
    for i, (flavor, key) in enumerate(targets, 1):
        text = FLAVORS[flavor][key]
        out_path = os.path.join(OUTPUT_ROOT, flavor, f'{key}.mp3')
        voice_id, settings, voice_name = resolve(flavor, key)
        rel = f'{flavor}/{key}.mp3'
        label = 'Ronki' if key in RONKI_KEYS else 'Narrator'

        if skip_existing and os.path.exists(out_path) and os.path.getsize(out_path) > 1024:
            print(f'[{i:02d}/{len(targets)}] {rel:<30} skip (exists)')
            skipped += 1
            continue

        preview = text if len(text) < 60 else text[:57] + '…'
        print(f'[{i:02d}/{len(targets)}] {rel:<30} [{label}] {preview}')
        try:
            size = generate(api_key, voice_id, settings, text, out_path)
            print(f'   \u2713 {size // 1024} KB')
            ok += 1
        except Exception as e:
            print(f'   \u2717 {e}')
            fail += 1
        if i < len(targets):
            time.sleep(0.7)

    tail = f', {skipped} skipped' if skip_existing else ''
    print(f'\nDone: {ok} ok, {fail} failed{tail}')
    return ok, fail, skipped


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--smoke', action='store_true', help='4-line umlaut + dual-voice check')
    ap.add_argument('--full', action='store_true', help='Full 35-line batch')
    ap.add_argument('--skip-existing', action='store_true', help='Only generate missing files')
    args = ap.parse_args()

    if not args.smoke and not args.full:
        all_targets = [(f, k) for f, d in FLAVORS.items() for k in d]
        narrator_count = sum(1 for f, k in all_targets if k not in RONKI_KEYS)
        ronki_count = sum(1 for f, k in all_targets if k in RONKI_KEYS)
        print('Ritual voice pack — Drachenmutter + Ronki')
        print(f'  Flavors:       {len(FLAVORS)} ({", ".join(FLAVORS.keys())})')
        print(f'  Keys/flavor:   7 (intro, tryFail, tryAgain, holdHint, smokeFail, celebrate, soloLine)')
        print(f'  Total:         {len(all_targets)}')
        print(f'    Drachenmutter: {narrator_count}')
        print(f'    Ronki:         {ronki_count}')
        print(f'  Smoke subset:  {len(SMOKE)}')
        print('\nRun with --smoke first, then --full.')
        return

    api_key = load_api_key()

    if args.smoke:
        run(api_key, SMOKE)
        return

    if args.full:
        all_targets = [(f, k) for f in FLAVORS for k in FLAVORS[f]]
        run(api_key, all_targets, skip_existing=args.skip_existing)


if __name__ == '__main__':
    main()
