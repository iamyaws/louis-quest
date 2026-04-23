import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useTask } from './TaskContext';
import SFX from '../utils/sfx';

/**
 * CelebrationQueue — single orchestrator for celebration surfaces so the
 * kid never sees two celebratory things pop at once ("fireworks in the
 * brain", Marc 25 Apr 2026).
 *
 * Rules (decided with Marc, don't re-debate in this file):
 *  - `flash`  : inline side-effect only (SFX + haptic + optional quick
 *               render). Never enters the queue, fires immediately.
 *               Throttled via the shared 400ms SFX gate.
 *  - `toast`  : queued. Default ttl 4000ms. Min 1500ms gap between one
 *               dismissing and the next showing.
 *  - `modal`  : queued at HIGH priority. Jumps to head of queue.
 *               Doesn't interrupt a currently-visible toast — it waits
 *               for the current surface to dismiss (+ min-gap) before
 *               showing. In v1 this is cheap-to-implement and still
 *               keeps the "no stacking" promise.
 *
 * De-dupe: events with the same `id` seen within `dedupeWindowMs` are
 * dropped. Protects against double-fires from re-renders / race loops.
 *
 * Cap: queue length hard-capped at CAP_SIZE; when the cap is hit the
 * oldest LOWER-priority item is dropped so high-signal events survive.
 *
 * Quiet hours: for the first two days after onboarding (daysSince < 2)
 * only `modal`-priority items fire. Toasts silently drop. Individual
 * events can opt out with `bypassQuietHours: true` (QA / dev shortcuts).
 *
 * SFX throttling: any `sfx` key routed through the queue goes through
 * a 400ms gate so a burst of enqueues can't stack identical coin sounds.
 */

export type CelebrationKind = 'flash' | 'toast' | 'modal';

export interface CelebrationEvent {
  /** Stable key. Identical ids within dedupeWindowMs collapse to one shown. */
  id: string;
  kind: CelebrationKind;
  /** Tiebreaker for queue ordering within the same kind. Higher wins. */
  priority?: number;
  /** Auto-dismiss after N ms. Toasts default to 4000; modals never auto-dismiss. */
  ttl?: number;
  /** Render function for `toast` / `modal` — receives a dismiss callback. */
  render?: (ctx: { dismiss: () => void }) => ReactNode;
  /** SFX key routed via the throttled channel. */
  sfx?: string;
  /** Optional haptic cue (left as a free-form tag — consumers read it). */
  haptic?: 'light' | 'success' | 'warning';
  /** Bypass the day-1/2 quiet guard (QA/dev affordance). */
  bypassQuietHours?: boolean;
}

interface CelebrationQueueContextValue {
  enqueue: (event: CelebrationEvent) => void;
  current: CelebrationEvent | null;
  dismissCurrent: () => void;
}

const CelebrationQueueContext = createContext<CelebrationQueueContextValue | null>(null);

const MIN_GAP_MS = 1500;
const DEFAULT_TOAST_TTL = 4000;
const DEDUPE_WINDOW_MS = 5000;
const CAP_SIZE = 3;
const SFX_THROTTLE_MS = 400;
const QUIET_DAYS = 2;

const priorityOf = (e: CelebrationEvent) => e.priority ?? (e.kind === 'modal' ? 100 : 10);

export function CelebrationQueueProvider({ children }: { children: ReactNode }) {
  const { state } = useTask();
  const [current, setCurrent] = useState<CelebrationEvent | null>(null);
  const queueRef = useRef<CelebrationEvent[]>([]);
  const dedupeRef = useRef<Map<string, number>>(new Map());
  const lastSfxRef = useRef<number>(0);
  const lastDismissAtRef = useRef<number>(0);
  const drainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Force a render-bump when the queue changes so the drain useEffect re-runs.
  const [tick, setTick] = useState(0);

  const daysSince = useMemo(() => {
    if (!state?.onboardingDate) return state?.totalTaskDays || 0;
    return Math.floor((Date.now() - new Date(state.onboardingDate).getTime()) / 86_400_000);
  }, [state?.onboardingDate, state?.totalTaskDays]);

  const inQuietHours = daysSince < QUIET_DAYS;

  const playSfxThrottled = useCallback((key?: string) => {
    if (!key) return;
    const now = Date.now();
    if (now - lastSfxRef.current < SFX_THROTTLE_MS) return;
    lastSfxRef.current = now;
    try {
      SFX.play(key);
    } catch {
      /* SFX engine may not be initialized yet; swallow */
    }
  }, []);

  const dismissCurrent = useCallback(() => {
    setCurrent(null);
    lastDismissAtRef.current = Date.now();
    if (ttlTimerRef.current) {
      clearTimeout(ttlTimerRef.current);
      ttlTimerRef.current = null;
    }
    setTick(t => t + 1);
  }, []);

  const enqueue = useCallback((event: CelebrationEvent) => {
    // Quiet-hours guard: toasts suppressed during first 2 days unless opted out.
    if (inQuietHours && event.kind === 'toast' && !event.bypassQuietHours) {
      return;
    }

    // Flash: fire side-effects and return. Never queued.
    if (event.kind === 'flash') {
      playSfxThrottled(event.sfx);
      return;
    }

    // De-dupe within the rolling window.
    const now = Date.now();
    const lastSeen = dedupeRef.current.get(event.id);
    if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) return;
    dedupeRef.current.set(event.id, now);

    // Insert sorted by priority (modal ahead of toast).
    const q = queueRef.current;
    const p = priorityOf(event);
    let i = 0;
    while (i < q.length && priorityOf(q[i]) >= p) i++;
    q.splice(i, 0, event);

    // Cap: drop the oldest LOWEST-priority item if over.
    if (q.length > CAP_SIZE) {
      let worstIdx = 0;
      for (let j = 1; j < q.length; j++) {
        if (priorityOf(q[j]) < priorityOf(q[worstIdx])) worstIdx = j;
      }
      q.splice(worstIdx, 1);
    }

    setTick(t => t + 1);
  }, [inQuietHours, playSfxThrottled]);

  // Drain loop. Runs whenever `current`, `tick`, or inQuietHours change.
  useEffect(() => {
    if (current) return; // wait for dismiss
    if (queueRef.current.length === 0) return;

    const gap = Date.now() - lastDismissAtRef.current;
    if (gap < MIN_GAP_MS) {
      if (drainTimerRef.current) clearTimeout(drainTimerRef.current);
      drainTimerRef.current = setTimeout(() => setTick(t => t + 1), MIN_GAP_MS - gap);
      return;
    }

    const next = queueRef.current.shift()!;
    playSfxThrottled(next.sfx);
    setCurrent(next);

    // Auto-dismiss for toasts.
    const ttl = next.ttl ?? (next.kind === 'toast' ? DEFAULT_TOAST_TTL : undefined);
    if (ttl && Number.isFinite(ttl)) {
      ttlTimerRef.current = setTimeout(() => dismissCurrent(), ttl);
    }
  }, [current, tick, playSfxThrottled, dismissCurrent]);

  // Clear timers on unmount.
  useEffect(() => {
    return () => {
      if (drainTimerRef.current) clearTimeout(drainTimerRef.current);
      if (ttlTimerRef.current) clearTimeout(ttlTimerRef.current);
    };
  }, []);

  const value = useMemo<CelebrationQueueContextValue>(
    () => ({ enqueue, current, dismissCurrent }),
    [enqueue, current, dismissCurrent],
  );

  return (
    <CelebrationQueueContext.Provider value={value}>
      {children}
      {current?.render && (
        <CelebrationQueuePresenter
          key={current.id}
          event={current}
          dismiss={dismissCurrent}
        />
      )}
    </CelebrationQueueContext.Provider>
  );
}

function CelebrationQueuePresenter({
  event,
  dismiss,
}: {
  event: CelebrationEvent;
  dismiss: () => void;
}) {
  return <>{event.render?.({ dismiss })}</>;
}

export function useCelebrationQueue(): CelebrationQueueContextValue {
  const ctx = useContext(CelebrationQueueContext);
  if (!ctx) {
    throw new Error(
      'useCelebrationQueue must be called inside a <CelebrationQueueProvider>',
    );
  }
  return ctx;
}
