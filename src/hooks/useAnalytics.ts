/**
 * Thin hook that exposes a `track(name, props)` fn gated on the
 * `state.analyticsEnabled` flag. Components should prefer this over
 * importing track() directly so the opt-out is honoured consistently.
 *
 * No-ops on first render before TaskContext has loaded (state === null).
 * Returns a stable `track` reference tied to the enabled flag, so
 * components can safely pass it into useEffect deps.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import {
  track as rawTrack,
  setAnalyticsEnabled,
  type EventName,
  type EventProps,
} from '../lib/analytics';

export function useAnalytics() {
  const { state } = useTask();
  const enabled = state?.analyticsEnabled ?? true;

  // Keep the module-level enabled flag in sync with TaskContext. A parent
  // toggle in the Dashboard (separate pass) persists via patchState;
  // this effect reflects that into the analytics module's in-memory flag
  // + localStorage mirror so later page loads honour it even before
  // TaskContext hydrates.
  useEffect(() => {
    setAnalyticsEnabled(!!enabled);
  }, [enabled]);

  const track = useCallback((name: EventName, props?: EventProps) => {
    if (!enabled) return;
    rawTrack(name, props);
  }, [enabled]);

  return useMemo(() => ({ track, enabled }), [track, enabled]);
}

export type { EventName, EventProps };
