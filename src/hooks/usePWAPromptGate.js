import { useEffect, useMemo, useState } from 'react';
import { useTask } from '../context/TaskContext';

// ──────────────────────────────────────────────────────────────────────
// usePWAPromptGate
//
// Decides when to surface the post-engagement PWA install prompt at the
// app-shell level. Previously the prompt fired at step 7 of the kid's
// Onboarding.jsx — a bad moment, because the kid had zero relationship
// with the app yet. Parents felt ambushed.
//
// New timing: after the kid has completed onboarding AND the first
// habit (totalTasksDone >= 1). That's the earliest point where the
// parent has actual engagement to reference — the prompt now reads
// "Toll gemacht! Ronki ist jetzt dein Begleiter" instead of asking
// for commitment on blind trust.
//
// Returns { shouldPrompt, markShown }:
//   · shouldPrompt — true when every condition below holds:
//       - state.onboardingDone === true (kid Track B done)
//       - state.totalTasksDone >= 1 (first habit done)
//       - state.pwaPromptShown === false
//       - display-mode is NOT standalone (not already installed)
//   · markShown() — call on install/skip. Flips pwaPromptShown to true.
//
// Day-2 retry: if the parent dismissed the prompt on day 1, we give them
// one more chance on day 2 (recognized by lastLoginDate !== today when
// pwaPromptShown is true). The hook resets pwaPromptShown to false once,
// so the sheet re-opens next time the gate evaluates. Only one retry —
// after that, the shown flag sticks.
// ──────────────────────────────────────────────────────────────────────

const DAY2_RETRY_STORAGE_KEY = 'ronki-pwa-day2-retry-used';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator?.standalone === true
    );
  } catch {
    return false;
  }
}

export function usePWAPromptGate() {
  const { state, actions } = useTask() || {};
  const [standalone, setStandalone] = useState(() => isStandalone());

  // Re-check standalone on mount — matchMedia queries run once but the
  // cheap double-read catches iOS Safari where navigator.standalone
  // lands slightly after first paint.
  useEffect(() => {
    setStandalone(isStandalone());
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setStandalone(isStandalone());
    // Modern + legacy listener wiring — Safari <14 only exposes
    // addListener, modern browsers expose addEventListener.
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    if (mq.addListener) {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
    return undefined;
  }, []);

  // Day-2 retry logic — runs once per state transition. If the prompt
  // was already shown AND it's a different day than lastLoginDate AND
  // we haven't used the retry yet, flip pwaPromptShown back to false so
  // the gate re-opens. Keyed off localStorage so a reset on state reload
  // doesn't grant infinite retries.
  useEffect(() => {
    if (!state || !actions?.patchState) return;
    if (!state.pwaPromptShown) return;
    if (standalone) return;
    let retryUsed = false;
    try {
      retryUsed = localStorage.getItem(DAY2_RETRY_STORAGE_KEY) === '1';
    } catch {}
    if (retryUsed) return;
    const today = todayIso();
    const last = state.lastLoginDate;
    if (last && last !== today) {
      try { localStorage.setItem(DAY2_RETRY_STORAGE_KEY, '1'); } catch {}
      actions.patchState({ pwaPromptShown: false });
    }
    // We do NOT auto-update lastLoginDate here — that lives in a
    // session-init layer (planned). For now, the day-2 retry fires the
    // first time the user opens the app on a new date as long as
    // lastLoginDate is stamped elsewhere. If it's not stamped, the
    // retry simply never fires (safe fallback — the original prompt
    // still ran once on day 1).
  }, [state, actions, standalone]);

  const shouldPrompt = useMemo(() => {
    if (!state) return false;
    if (standalone) return false;
    if (!state.onboardingDone) return false;
    if (state.pwaPromptShown) return false;
    if ((state.totalTasksDone || 0) < 1) return false;
    return true;
  }, [state, standalone]);

  const markShown = () => {
    if (!actions?.patchState) return;
    actions.patchState({ pwaPromptShown: true });
  };

  return { shouldPrompt, markShown };
}

export default usePWAPromptGate;
