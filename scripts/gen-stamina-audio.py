import json, os, urllib.request, time

API_KEY = ''
with open(r'C:\Users\öööö\louis-quest\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('ELEVENLABS_API_KEY=') or line.startswith('VITE_ELEVENLABS_API_KEY='):
            API_KEY = line.strip().split('=', 1)[1].strip('"').strip("'")
            break

VOICE_ID = 'N2lVS1w4EtoT3dr4eOWO'  # Callum = Ronki
OUT_DIR = r'C:\Users\öööö\louis-quest\public\audio\ronki'
VS = {'stability': 0.50, 'similarity_boost': 0.75, 'style': 0.40}

LINES = {
  'de_stamina_low_01':       'Puh, ich werde langsam müde vom Fliegen. Aber einmal noch geht bestimmt.',
  'de_stamina_exhausted_01': 'Ich bin ganz platt. Kannst du ein bisschen ohne mich spielen?',
  'de_stamina_restored_01':  'Ausgeruht! Lass uns wieder losziehen.',
}

for lid, text in LINES.items():
    out = os.path.join(OUT_DIR, f'{lid}.mp3')
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        print(f'skip {lid}'); continue
    payload = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': VS}).encode('utf-8')
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}', data=payload,
        headers={'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        with open(out, 'wb') as f: f.write(resp.read())
    print(f'OK {lid} ({os.path.getsize(out)//1024}K)')
    time.sleep(0.6)
