"""Generate Drachenmutter narration for parent-zone intro overlay.

Voice: Bella (hpp4J3VqNfWAUOO0d1Us), model eleven_multilingual_v2.
Uses real UTF-8 umlauts for proper German pronunciation.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = ''
with open(r'C:\Users\öööö\louis-quest\.env', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('ELEVENLABS_API_KEY=') or line.startswith('VITE_ELEVENLABS_API_KEY='):
            API_KEY = line.strip().split('=', 1)[1].strip('"').strip("'")
            break

VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us'  # Bella — Drachenmutter
OUT_DIR = r'C:\Users\öööö\louis-quest\public\audio\narrator'
VS = {'stability': 0.75, 'similarity_boost': 0.65, 'style': 0.30}

LINES = {
    'parent_zone_intro': 'Ah, hier gibts noch was für Mama und Papa. Leider komplett langweilig für euch Kinder. Aber dennoch wichtig!',
}

for lid, text in LINES.items():
    out = os.path.join(OUT_DIR, f'{lid}.mp3')
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        print(f'skip {lid}')
        continue
    payload = json.dumps({
        'text': text,
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': VS,
    }).encode('utf-8')
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}',
        data=payload,
        headers={
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        with open(out, 'wb') as f:
            f.write(resp.read())
    print(f'OK {lid} ({os.path.getsize(out)//1024}K)')
    time.sleep(0.6)
