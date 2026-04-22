/**
 * Haptic feedback — pure trigger module.
 *
 * Scope: browser haptics for a PWA used by a 6-year-old. Haptic is a
 * confirmer layer on top of visual + audio, never a carrier.
 *
 * Research-backed decisions (see memory/haptic_research_2026_04.md):
 *   - Pulses are short (10-40ms) so a 6yo reads them as confirmation, not
 *     startle. Source: startle-reflex maturation 3-7yo, adult-tuned haptics
 *     can over-activate at age 6.
 *   - No "error" pattern. Research flags error haptics on kids' apps as
 *     reading like punishment. Visual-only for errors.
 *   - No AudioContext "fake" haptic fallback. Ethics are bad — sudden bass
 *     through a kid's headphones is a startle, not a replacement for a buzz.
 *   - iOS switch-hack fallback is included but gated: tries once, if the
 *     environment doesn't support it the call silently no-ops. Per Marc's
 *     "try it and report back" call.
 *
 * Platform reality (April 2026):
 *   - Android Chrome, Firefox, Samsung Internet: navigator.vibrate works,
 *     must be called synchronously from a user-gesture handler.
 *   - iOS Safari + iOS PWA: navigator.vibrate returns false / no-ops.
 *     Only path is <input type="checkbox" switch> + label.click() hack
 *     since iOS 17.4. Single weak tick, no patterns, no intensity.
 *   - Desktop: no haptics hardware on most laptops. Silent no-op.
 *
 * Public API:
 *   - triggerHaptic(name, opts) — fires the named pattern
 *   - setHapticsEnabled(bool) / isHapticsEnabled() — runtime toggle
 *   - setHapticsMode('gentle'|'normal') / getHapticsMode()
 *
 * Named patterns (the vocabulary — only add new entries after discussion):
 *   - tap         — button taps, tab switches, nav clicks. ~10ms.
 *   - select      — mood pick, emoji pick, variant pick. ~20ms.
 *   - confirm     — primary CTA confirm (journal save, form submit). ~30ms.
 *   - success     — quest complete, milestone. Rising 3-pulse ~180ms.
 *   - celebration — tab unlock, Ronki hatches, evolution. Sparkle ~180ms.
 *
 * Gentle-mode transforms (default for age 6):
 *   - Single pulses: halve duration, floor at 5ms so Android's 40ms-cap
 *     devices still feel something.
 *   - Sequences: halve the active pulses, widen pauses by 1.3× so the
 *     cadence stays legible but the perceived intensity drops.
 */

export type HapticName = 'tap' | 'select' | 'confirm' | 'success' | 'celebration';
export type HapticMode = 'gentle' | 'normal';

type Pattern = number | number[];

// Normal-mode pattern table. Gentle mode derives from these at call time.
const PATTERNS_NORMAL: Record<HapticName, Pattern> = {
  tap: 10,
  select: 20,
  confirm: 30,
  success: [30, 40, 80],
  celebration: [40, 60, 40],
};

// Gentle-mode scaling. Halves active durations (floor 5ms), widens pauses.
function toGentle(pattern: Pattern): Pattern {
  if (typeof pattern === 'number') {
    return Math.max(5, Math.round(pattern / 2));
  }
  // Array: positions 0, 2, 4… are active pulses; 1, 3, 5… are pauses
  return pattern.map((ms, i) => {
    if (i % 2 === 0) return Math.max(5, Math.round(ms / 2));
    return Math.round(ms * 1.3);
  });
}

// ── Runtime state (mirrored from TaskState via the useHaptic hook) ──────
let enabled = true;
let mode: HapticMode = 'gentle';

export function setHapticsEnabled(next: boolean): void {
  enabled = next;
}
export function isHapticsEnabled(): boolean {
  return enabled;
}
export function setHapticsMode(next: HapticMode): void {
  mode = next;
}
export function getHapticsMode(): HapticMode {
  return mode;
}

// ── iOS switch-hack ─────────────────────────────────────────────────────
// Since iOS 17.4, WebKit attaches a native haptic tick when the user
// toggles <input type="checkbox" switch>. We simulate a click on a hidden
// switch to get the tick. Gated by CSS.supports to avoid spam on older iOS.
// Fires exactly one weak tick — no patterns, no intensity. One-shot for any
// triggerHaptic call on iOS if navigator.vibrate is unavailable.

let iosSwitchSupported: boolean | null = null;

function detectIosSwitchSupport(): boolean {
  if (iosSwitchSupported !== null) return iosSwitchSupported;
  if (typeof window === 'undefined' || typeof CSS === 'undefined' || !CSS.supports) {
    iosSwitchSupported = false;
    return false;
  }
  try {
    iosSwitchSupported = CSS.supports('selector(input[switch])');
  } catch {
    iosSwitchSupported = false;
  }
  return iosSwitchSupported;
}

function fireIosSwitchHaptic(): void {
  if (!detectIosSwitchSupport()) return;
  if (typeof document === 'undefined') return;
  try {
    const input = document.createElement('input');
    input.type = 'checkbox';
    // The 'switch' attribute is what triggers WebKit's native haptic.
    // It's not in the TS DOM lib yet, so we set via setAttribute.
    input.setAttribute('switch', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    input.style.top = '-9999px';

    const label = document.createElement('label');
    label.appendChild(input);
    label.style.position = 'fixed';
    label.style.opacity = '0';
    label.style.pointerEvents = 'none';
    label.style.top = '-9999px';

    document.body.appendChild(label);
    // Clicking the label toggles the switch, which fires the haptic tick.
    label.click();
    // Remove next tick so rapid consecutive calls don't leak nodes.
    setTimeout(() => {
      try { document.body.removeChild(label); } catch { /* already removed */ }
    }, 0);
  } catch {
    // If the hack throws for any reason, fail silently — it's a bonus tick.
  }
}

// ── Dev logging ─────────────────────────────────────────────────────────
// When running in dev mode, emit a lightweight log so desktop QA can see
// that a haptic fired even though the vibration hardware isn't there.
function logDev(name: HapticName, pattern: Pattern, path: 'vibrate' | 'ios-switch' | 'no-op'): void {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[haptic] ${name} via ${path}`, pattern);
  }
}

// ── Public trigger ──────────────────────────────────────────────────────

interface TriggerOptions {
  /** Bypass the enabled flag (rare — e.g. the parental-dashboard preview button). */
  force?: boolean;
}

export function triggerHaptic(name: HapticName, opts: TriggerOptions = {}): void {
  if (!opts.force && !enabled) return;
  const base = PATTERNS_NORMAL[name];
  if (base === undefined) return; // unknown name, silently ignore
  const pattern = mode === 'gentle' ? toGentle(base) : base;

  // Path 1 — Android Chrome / Firefox / Samsung Internet / Edge-Android.
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const ok = navigator.vibrate(pattern);
      if (ok) {
        logDev(name, pattern, 'vibrate');
        return;
      }
    } catch {
      // fall through to iOS path
    }
  }

  // Path 2 — iOS 17.4+ switch-hack. One weak tick, no pattern.
  if (detectIosSwitchSupport()) {
    fireIosSwitchHaptic();
    logDev(name, pattern, 'ios-switch');
    return;
  }

  // Path 3 — silent no-op.
  logDev(name, pattern, 'no-op');
}

// ── Utility: reset for tests ────────────────────────────────────────────
export function __resetHapticsForTests(): void {
  enabled = true;
  mode = 'gentle';
  iosSwitchSupported = null;
}
