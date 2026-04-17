/**
 * VoiceAudio — plays pre-generated Ronki voice lines.
 * Audio files live at /audio/ronki/{lineId}.mp3
 * Falls back silently if file doesn't exist or audio is muted.
 */

const MUTE_KEY = 'ronki_voice_mute';
const BASE = import.meta.env.BASE_URL;

let currentAudio: HTMLAudioElement | null = null;
let delayTimer: ReturnType<typeof setTimeout> | null = null;

const VoiceAudio = {
  /** Play a Drachenmutter narrator line (from /audio/narrator/*.mp3) */
  playNarrator(lineId: string, delayMs = 600) {
    if (this.isMuted()) return;
    if (!lineId) return;
    if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }
    const doPlay = () => {
      this.stop();
      const src = `${BASE}audio/narrator/${lineId}.mp3`;
      const audio = new Audio(src);
      audio.volume = 0.9;
      audio.play().catch(() => {});
      currentAudio = audio;
    };
    delayTimer = setTimeout(doPlay, delayMs);
  },

  /** Play a voice line by its ID (e.g., 'de_greet_01') */
  play(lineId: string, delayMs = 0) {
    if (this.isMuted()) return;
    if (!lineId) return;

    // Clear any pending delayed play
    if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }

    const doPlay = () => {
      // Stop any currently playing line (don't overlap)
      this.stop();
      const src = `${BASE}audio/ronki/${lineId}.mp3`;
      const audio = new Audio(src);
      audio.volume = 0.85;
      audio.play().catch(() => {
        // File doesn't exist or autoplay blocked — fail silently
      });
      currentAudio = audio;
    };

    if (delayMs > 0) {
      delayTimer = setTimeout(doPlay, delayMs);
    } else {
      doPlay();
    }
  },

  /** Stop current playback */
  stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  },

  /** Check mute state */
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

export default VoiceAudio;
