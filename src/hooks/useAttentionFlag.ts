import { useState, useCallback } from 'react';

/**
 * useAttentionFlag — persistent seen-tracker for UX attention treatments.
 *
 * These flags are UX-only (should this feature still glow?), not game data.
 * Stored in a flat localStorage blob keyed by opaque strings like
 * 'forscher-ecke-first-seen', 'new-creature-unlocked-xyz', etc.
 *
 * Not in TaskState on purpose — no reducer churn, no migration cost, and
 * clearing localStorage for test purposes doesn't reset real progress.
 */

const STORAGE_KEY = 'ronki_attention_seen';

function readSeen(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSeen(seen: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    /* quota exceeded or private mode — silent */
  }
}

/**
 * Returns [isSeen, markSeen] for a given attention key.
 * isSeen stays in component state so re-renders reflect changes immediately
 * without having to re-read localStorage.
 */
export function useAttentionFlag(key: string): [boolean, () => void] {
  const [seen, setSeen] = useState(() => !!readSeen()[key]);

  const mark = useCallback(() => {
    const current = readSeen();
    if (current[key]) return;
    writeSeen({ ...current, [key]: true });
    setSeen(true);
  }, [key]);

  return [seen, mark];
}

/** Dev utility — clears a flag so you can re-test the "new" state. */
export function clearAttentionFlag(key: string) {
  const current = readSeen();
  delete current[key];
  writeSeen(current);
}
