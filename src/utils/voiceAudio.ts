/**
 * VoiceAudio — plays pre-generated Ronki voice lines.
 * Audio files live at /audio/ronki/{lineId}.mp3
 * Falls back silently if file doesn't exist or audio is muted.
 *
 * Narrator mute (Apr 2026): Marc's decision is that Ronki is the only voice
 * Louis hears until Drachenmutter + Freunde voice re-cast is done. Instead
 * of deleting narrator call sites across the codebase, `playNarrator` +
 * `playNarratorWithCallback` no-op when NARRATOR_MUTED is true. Flip back
 * by setting localStorage['ronki_narrator_mute'] = '0' (or via setNarratorMuted).
 * The callback variant still fires onEnded so UI flows that await it don't
 * stall — they just proceed immediately as if the audio had played.
 */

const MUTE_KEY = 'ronki_voice_mute';
const NARRATOR_MUTE_KEY = 'ronki_narrator_mute';
const BASE = import.meta.env.BASE_URL;

let currentAudio: HTMLAudioElement | null = null;
let delayTimer: ReturnType<typeof setTimeout> | null = null;

function readNarratorMuted(): boolean {
  if (typeof localStorage === 'undefined') return true;
  // Default is muted. Explicit '0' = unmuted. Keeps the rollout safe: any
  // device without the key gets the new quiet behaviour automatically.
  return localStorage.getItem(NARRATOR_MUTE_KEY) !== '0';
}

const VoiceAudio = {
  /** Play a Drachenmutter narrator line (from /audio/narrator/*.mp3) */
  playNarrator(lineId: string, delayMs = 600) {
    if (readNarratorMuted()) return;
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

  /**
   * Play a narrator line with a callback on playback end.
   *
   * `onEnded` fires in two situations:
   *   - audio finishes naturally (`ended` event)
   *   - audio failed to load / autoplay blocked / was interrupted (via `error`
   *     event). Callers treat this as "we tried, move on" — never leave UI
   *     gated forever because a file is missing.
   *   - narrator audio is globally muted (current Marc policy) — fires
   *     immediately so any UI sequencing dependent on the callback proceeds.
   *
   * Always fires onEnded at most once.
   */
  playNarratorWithCallback(lineId: string, delayMs = 600, onEnded?: () => void) {
    if (readNarratorMuted()) { onEnded?.(); return; }
    if (this.isMuted()) { onEnded?.(); return; }
    if (!lineId) { onEnded?.(); return; }
    if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }

    let fired = false;
    const fireOnce = () => {
      if (fired) return;
      fired = true;
      onEnded?.();
    };

    const doPlay = () => {
      this.stop();
      const src = `${BASE}audio/narrator/${lineId}.mp3`;
      const audio = new Audio(src);
      audio.volume = 0.9;
      audio.addEventListener('ended', fireOnce);
      audio.addEventListener('error', fireOnce);
      audio.play().catch(() => { fireOnce(); });
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

  isMuted(): boolean {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem(MUTE_KEY) !== '0';
  },

  setMuted(muted: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    if (muted) this.stop();
  },

  toggleMute(): boolean {
    const next = !this.isMuted();
    this.setMuted(next);
    return next;
  },

  /** Whether narrator (Drachenmutter + arc) audio is globally muted.
   *  Default true until Marc picks the new Drachenmutter voice and we
   *  re-record the narrator bank. */
  isNarratorMuted(): boolean {
    return readNarratorMuted();
  },

  setNarratorMuted(muted: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(NARRATOR_MUTE_KEY, muted ? '1' : '0');
    if (muted) this.stop();
  },
};

export default VoiceAudio;
