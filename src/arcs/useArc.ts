import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTask } from '../context/TaskContext';
import {
  initialArcState,
  offerNextArc,
  acceptOffer,
  declineOffer,
  advanceBeat,
  expireCooldownIfReady,
  getActiveBeat,
  isInCooldown,
} from './ArcEngine';
import { findArc } from './arcs';
import { loadArcEngineState } from './persistence';
import type { ArcEngineState } from './types';

export function useArc() {
  const { state, actions } = useTask();
  const [arcState, setArcState] = useState<ArcEngineState>(() =>
    state ? expireCooldownIfReady(loadArcEngineState(state as any)) : initialArcState()
  );

  // Persist whenever arcState changes
  useEffect(() => {
    if (actions.patchState) {
      actions.patchState({ arcEngine: arcState });
    }
  }, [arcState]);

  // Hydrate once on mount from server/localStorage state
  useEffect(() => {
    if (state) {
      setArcState(expireCooldownIfReady(loadArcEngineState(state as any)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const offer = useCallback(() => setArcState(s => offerNextArc(s)), []);
  const accept = useCallback(() => setArcState(s => acceptOffer(s)), []);
  const decline = useCallback(() => setArcState(s => declineOffer(s)), []);
  const advance = useCallback((beatId: string) => setArcState(s => advanceBeat(s, beatId)), []);

  const activeArc = useMemo(
    () => (arcState.activeArcId ? findArc(arcState.activeArcId) : null),
    [arcState.activeArcId]
  );
  const offeredArc = useMemo(
    () => (arcState.offeredArcId ? findArc(arcState.offeredArcId) : null),
    [arcState.offeredArcId]
  );
  const activeBeat = useMemo(() => getActiveBeat(arcState), [arcState]);

  return {
    phase: arcState.phase,
    activeArc,
    activeBeat,
    offeredArc,
    inCooldown: isInCooldown(arcState),
    completedArcIds: arcState.completedArcIds,
    offer,
    accept,
    decline,
    advance,
  };
}
