import { useCallback, useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { ZONES, zoneById, isZoneUnlocked, type Zone, type ZoneId } from './zones';

const ACTIVE_ZONE_KEY = 'ronki_active_zone_v1';

function loadActiveZone(): ZoneId {
  if (typeof localStorage === 'undefined') return 'sanctuary';
  try {
    const raw = localStorage.getItem(ACTIVE_ZONE_KEY);
    if (raw && ZONES.some(z => z.id === raw)) return raw as ZoneId;
  } catch {
    // ignore
  }
  return 'sanctuary';
}

function saveActiveZone(id: ZoneId): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_ZONE_KEY, id);
  } catch {
    // ignore
  }
}

export interface UseZonesResult {
  zones: Zone[];
  activeZone: Zone;
  setActiveZone: (id: ZoneId) => void;
  isUnlocked: (zone: Zone) => boolean;
  /** Zone id briefly flagged when user taps a locked zone — UI shows hint. */
  lockedAttemptZoneId: ZoneId | null;
  clearLockedAttempt: () => void;
  flagLockedAttempt: (id: ZoneId) => void;
}

export function useZones(): UseZonesResult {
  const { state } = useTask();
  const [activeZoneId, setActiveZoneId] = useState<ZoneId>(loadActiveZone);
  const [lockedAttemptZoneId, setLockedAttemptZoneId] = useState<ZoneId | null>(null);

  // If active zone becomes locked (shouldn't happen, but defensive), snap back.
  useEffect(() => {
    const zone = zoneById(activeZoneId);
    if (!zone) return;
    if (!isZoneUnlocked(zone, state || {})) {
      setActiveZoneId('sanctuary');
      saveActiveZone('sanctuary');
    }
  }, [state, activeZoneId]);

  const setActiveZone = useCallback(
    (id: ZoneId) => {
      const zone = zoneById(id);
      if (!zone) return;
      if (!isZoneUnlocked(zone, state || {})) {
        setLockedAttemptZoneId(id);
        window.setTimeout(() => {
          setLockedAttemptZoneId(prev => (prev === id ? null : prev));
        }, 3000);
        return;
      }
      setActiveZoneId(id);
      saveActiveZone(id);
    },
    [state],
  );

  const isUnlocked = useCallback(
    (zone: Zone) => isZoneUnlocked(zone, state || {}),
    [state],
  );

  const clearLockedAttempt = useCallback(() => setLockedAttemptZoneId(null), []);
  const flagLockedAttempt = useCallback((id: ZoneId) => {
    setLockedAttemptZoneId(id);
    window.setTimeout(() => {
      setLockedAttemptZoneId(prev => (prev === id ? null : prev));
    }, 3000);
  }, []);

  const activeZone = zoneById(activeZoneId) || ZONES[0];

  return {
    zones: ZONES,
    activeZone,
    setActiveZone,
    isUnlocked,
    lockedAttemptZoneId,
    clearLockedAttempt,
    flagLockedAttempt,
  };
}
