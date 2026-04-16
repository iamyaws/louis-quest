/**
 * VoiceAudio — plays pre-generated Ronki voice lines.
 * Audio files live at /audio/ronki/{lineId}.mp3
 * Falls back silently if file doesn't exist or audio is muted.
 */

const MUTE_KEY = 'ronki_voice_mute';
const BASE = import.meta.env.BASE_URL;

let currentAudio: HTMLAudioElement | null = null;

const VoiceAudio = {
  /** Play a voice line by its ID (e.g., 'de_greet_01') */
  play(lineId: string) {
    if (this.isMuted()) return;
    if (!lineId) return;

    // Stop any currently playing line (don't overlap)
    this.stop();

    const src = `${BASE}audio/ronki/${lineId}.mp3`;
    const audio = new Audio(src);
    audio.volume = 0.8;
    audio.play().catch(() => {
      // File doesn't exist or autoplay blocked — fail silently
    });
    currentAudio = audio;
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
