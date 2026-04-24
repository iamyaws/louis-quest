"""Generate 6 Ronki voice casting samples via ElevenLabs.

Ronki's character:
  Baby dragon, Louis's age in dragon years. Curious, easily amazed, a little
  clumsy, full of wonder. Short sentences. Strong opinions about small things.
  Never lectures. Celebrates alongside Louis, never above him.

We need something quirky — not generic kid voice, not too polished. Testing
across six very different textures so Marc can hear the range before picking.
Output: voice-samples/ronki/{voice-name}-{quality}.mp3
"""
import os
import sys
import time
import urllib.request
import urllib.error
import json

# Force UTF-8 stdout for Windows consoles (umlauts in progress output)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

MODEL_ID = 'eleven_multilingual_v2'
# Casting samples live OUTSIDE the repo (~/Ronki Voice Samples/) — Marc browses
# + listens directly, they're never committed. Only production audio (under
# voice IDs Marc has locked in) lands in public/audio/ronki/ via a different
# generation script.
OUTPUT_DIR = r'C:\Users\öööö\Ronki Voice Samples\ronki'
ENV_PATH = r'C:\Users\öööö\louis-quest\.env.local'

# Moderate settings — let each voice's natural character come through without
# over-smoothing (stability) or over-dramatising (style). similarity_boost
# kept high so the voice stays recognisably itself.
VOICE_SETTINGS = {
    'stability': 0.40,
    'similarity_boost': 0.75,
    'style': 0.50,
    'use_speaker_boost': True,
}

# Six lines stitched into one sample. Covers the full Ronki emotional range:
# excited greeting → playful confession → curious observation → wondering →
# giggly care moment → warm identity affirmation. If a voice only sounds
# right in one mode but collapses in another, we'll catch it here.
SCRIPT = (
    "Hey! Du bist da! Endlich!\n\n"
    "Weißt du was? Ich hab heute versucht, einen Schmetterling zu fangen. Hat nicht geklappt.\n\n"
    "Tropf tropf tropf! Hörst du das auch?\n\n"
    "Ob Wolken wirklich so weich sind, wie sie aussehen?\n\n"
    "Hihihi! Das kitzelt! Nochmal, nochmal!\n\n"
    "Du bist jemand, auf den man sich verlassen kann. Das hab ich gemerkt."
)

# Casting candidates — picked for texture variety, not gender. Ronki is a
# little dragon; "male" and "female" human defaults both can fit if the
# texture is right.
CANDIDATES = [
    # Childlike/squeaky female — most obvious fit for "small creature". Risk:
    # too cute, could feel babyish (Louis already said the art was babyish).
    {'name': 'gigi-childlike',    'voice_id': 'jBpfuIE2acCO8z3wKNLl'},
    # Squirrely cartoon witch-y female — classic storybook-creature texture.
    # If Ronki's quirkiness lands anywhere, it's in this voice.
    {'name': 'glinda-squirrely',  'voice_id': 'z9fAnlkpzviPz146aGWa'},
    # Expressive young female — broader emotional range, less cartoon-y.
    # Good middle ground if Gigi is too squeaky and Glinda is too weird.
    {'name': 'freya-expressive',  'voice_id': 'jsCqWAovK2LkecY7zXl4'},
    # Hoarse young male — creaky texture adds "dragon" feel without being
    # monstrous. Feels like a young creature still finding its voice.
    {'name': 'callum-hoarse',     'voice_id': 'N2lVS1w4EtoT3dr4eOWO'},
    # Creaky young male — similar to Callum but younger/higher. Good if
    # Louis needs a voice clearly "a kid dragon".
    {'name': 'harry-creaky',      'voice_id': 'SOYHLrjzK2X1ezoPC6cr'},
    # Playful Australian young male — unusual accent adds character without
    # being gimmicky. Charming + warm.
    {'name': 'charlie-playful',   'voice_id': 'IKne3meq5aSn9XLyUdCD'},
]


def load_api_key():
    with open(ENV_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
            if line.startswith('VITE_ELEVENLABS_API_KEY='):
                return line.split('=', 1)[1].strip('"').strip("'")
    raise RuntimeError('ELEVENLABS_API_KEY not found in .env')


def generate_audio(api_key, voice_id, text, filename):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    body = json.dumps({
        'text': text,
        'model_id': MODEL_ID,
        'voice_settings': VOICE_SETTINGS,
    }).encode('utf-8')

    req = urllib.request.Request(
        url,
        data=body,
        method='POST',
        headers={
            'xi-api-key': api_key,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            audio = resp.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'HTTP {e.code}: {body}') from e

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, filename)
    with open(out_path, 'wb') as f:
        f.write(audio)
    return out_path, len(audio)


def main():
    api_key = load_api_key()
    print(f'Generating {len(CANDIDATES)} Ronki voice samples…')
    print(f'Output: {OUTPUT_DIR}\n')

    for i, c in enumerate(CANDIDATES, 1):
        filename = f'{c["name"]}.mp3'
        print(f'[{i}/{len(CANDIDATES)}] {c["name"]} ({c["voice_id"]})… ', end='', flush=True)
        try:
            path, size = generate_audio(api_key, c['voice_id'], SCRIPT, filename)
            print(f'OK ({size / 1024:.0f} KB)')
        except Exception as e:
            print(f'FAIL: {e}')
            continue
        # Respect ElevenLabs rate limits (soft cap, 2 req/s on most tiers)
        if i < len(CANDIDATES):
            time.sleep(0.7)

    print('\nDone. Review the files and tell me which voice fits Ronki best.')


if __name__ == '__main__':
    main()
