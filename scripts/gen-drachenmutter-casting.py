"""Generate Drachenmutter casting samples — 4 candidates for Marc to pick.

Voices from the shortlist in reference_voice_casting.md:
  · Alice     — British warm middle-aged, calm authority
  · Charlotte — mature gentle narrator, natural storytelling cadence
  · Lily      — soft motherly, gentler than Bella
  · Grace     — warm maternal, tender

All 4 sampled with the same script + same settings so Marc is comparing
the voice itself, not inputs. Target settings are the production ones
we'll use for the narrator bank once a voice is locked.

Output: %USERPROFILE%\\Ronki Voice Samples\\drachenmutter\\{voice}.mp3
(local, outside the repo — same pattern as ronki/freunde casting folders)
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

MODEL_ID = 'eleven_multilingual_v2'

# Production target for Drachenmutter — slower, grounded, low-style so she
# reads as calm-authority-telling-a-bedtime-story. When a voice is picked,
# the narrator bank regen uses these exact settings.
VOICE_SETTINGS = {
    'stability': 0.70,
    'similarity_boost': 0.72,
    'style': 0.30,
    'use_speaker_boost': True,
}

CANDIDATES = [
    {'name': 'alice-british-warm',     'voice_id': 'Xb7hH8MSUJpSbSDYk0k2'},
    {'name': 'charlotte-gentle',       'voice_id': 'XB0fDUnXU5powFXDhCwa'},
    {'name': 'lily-motherly',          'voice_id': 'pFZP5JQG7iQjIQuC4Bku'},
    {'name': 'grace-warm-maternal',    'voice_id': 'oWAxZDx7w5VEj9dCyTzz'},
]

# Casting script — three beats: warm greeting, acknowledgment of the kid's
# heart, reassurance of presence. Covers umlauts (weißt, mütiges/Herz) +
# the intimate register Drachenmutter needs. If a voice can't do these
# three beats well, it can't do the narrator bank.
SCRIPT = (
    'Hey, kleiner Drache. Ich bin deine Drachenmutter.\n\n'
    'Weißt du, warum du hier bist? Weil du ein mutiges Herz hast.\n\n'
    'Und weil ich immer bei dir bin, auch wenn du mich nicht siehst.'
)

# Resolve paths from a hardcoded base — Python on Windows mangles __file__
# when the repo path contains umlauts. See gen-ritual-voice-pack.py note.
_REPO = 'C:\\Users\\\u00f6\u00f6\u00f6\u00f6\\louis-quest'
_HOME = 'C:\\Users\\\u00f6\u00f6\u00f6\u00f6'
OUTPUT_DIR = _HOME + '\\Ronki Voice Samples\\drachenmutter'
ENV_CANDIDATES = [_REPO + '\\.env.local', _REPO + '\\.env']


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
        'ELEVENLABS_API_KEY not found (tried: ' + ', '.join(ENV_CANDIDATES) + ')'
    )


def generate(api_key, voice_id, text, filename):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    body = json.dumps({
        'text': text,
        'model_id': MODEL_ID,
        'language_code': 'de',
        'voice_settings': VOICE_SETTINGS,
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
    out_path = os.path.join(OUTPUT_DIR, filename)
    with open(out_path, 'wb') as f:
        f.write(audio)
    return out_path, len(audio)


def main():
    api_key = load_api_key()
    print(f'Generating {len(CANDIDATES)} Drachenmutter casting samples\u2026')
    print(f'Output: {OUTPUT_DIR}\n')

    for i, c in enumerate(CANDIDATES, 1):
        filename = f'{c["name"]}.mp3'
        print(f'[{i}/{len(CANDIDATES)}] {c["name"]} ({c["voice_id"]})\u2026 ', end='', flush=True)
        try:
            path, size = generate(api_key, c['voice_id'], SCRIPT, filename)
            print(f'\u2713 ({size / 1024:.0f} KB)')
        except Exception as e:
            print(f'\u2717 {e}')
            continue
        if i < len(CANDIDATES):
            time.sleep(0.7)

    print('\nDone. Listen to the files and tell me which voice fits Drachenmutter.')


if __name__ == '__main__':
    main()
