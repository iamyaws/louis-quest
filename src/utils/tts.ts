/**
 * TTS — Text-to-Speech for Ronki's voice.
 * Uses browser speechSynthesis API with a warm German voice.
 * Falls back silently if TTS is unavailable.
 *
 * Usage: TTS.speak('Guten Morgen, Louis!')
 *
 * Design constraints (from habit research):
 * - Short utterances only (max ~15 words)
 * - Warm, encouraging tone (pitch 1.1, rate 0.9)
 * - Never interrupts itself (queue, don't overlap)
 * - Can be muted globally via localStorage
 */

const MUTE_KEY = 'ronki_tts_mute';

/** Preferred German voices, ranked by warmth/quality */
const PREFERRED_VOICES = [
  'Google Deutsch',        // Chrome
  'Anna',                  // macOS/iOS German
  'Petra',                 // macOS German
  'Microsoft Katja',       // Windows
  'Microsoft Hedda',       // Windows
  'Marlene',               // Safari
];

let cachedVoice: SpeechSynthesisVoice | null = null;

function findVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof speechSynthesis === 'undefined') return null;

  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Try preferred voices first
  for (const name of PREFERRED_VOICES) {
    const match = voices.find(v => v.name.includes(name));
    if (match) { cachedVoice = match; return match; }
  }

  // Fallback: any German voice
  const german = voices.find(v => v.lang.startsWith('de'));
  if (german) { cachedVoice = german; return german; }

  return null;
}

// Voices load async in some browsers
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => { cachedVoice = null; };
}

const TTS = {
  /** Speak a short text as Ronki */
  speak(text: string) {
    if (typeof speechSynthesis === 'undefined') return;
    if (localStorage.getItem(MUTE_KEY) === '1') return;
    if (!text || text.length > 120) return;

    // Don't interrupt current speech — queue it
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = findVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;   // slightly slower = warmer
    utterance.pitch = 1.15; // slightly higher = younger/friendlier
    utterance.volume = 0.85;

    speechSynthesis.speak(utterance);
  },

  /** Cancel any in-progress speech */
  stop() {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  },

  /** Check if TTS is muted */
  isMuted(): boolean {
    return localStorage.getItem(MUTE_KEY) === '1';
  },

  /** Toggle mute */
  toggleMute(): boolean {
    const muted = !this.isMuted();
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    if (muted) this.stop();
    return muted;
  },
};

export default TTS;
