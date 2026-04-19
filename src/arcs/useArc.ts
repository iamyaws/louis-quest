import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import VoiceAudio from '../utils/voiceAudio';
import { ARC_NARRATOR } from './narratorMap';

export function useArc() {
  const { state, actions } = useTask();
  const [arcState, setArcState] = useState<ArcEngineState>(() =>
    state ? expireCooldownIfReady(loadArcEngineState(state)) : initialArcState()
  );

  // Track the last value we persisted so we can detect EXTERNAL writes to
  // state.arcEngine (e.g. useSpecialQuests offering a Freund reunion arc).
  const lastPersistedRef = useRef<ArcEngineState | null>(null);

  // Persist whenever arcState changes
  useEffect(() => {
    lastPersistedRef.current = arcState;
    actions.patchState({ arcEngine: arcState });
  }, [arcState, actions.patchState]);

  // Hydrate once when state transitions from null (async load completes)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (state && !initializedRef.current) {
      initializedRef.current = true;
      const hydrated = expireCooldownIfReady(loadArcEngineState(state));
      lastPersistedRef.current = hydrated;
      setArcState(hydrated);
    }
  }, [state]);

  // Re-hydrate when state.arcEngine is mutated externally (e.g. by
  // useSpecialQuests offering a Freund arc). We compare against the last
  // value we ourselves persisted — if they differ, an external writer
  // has changed state.arcEngine and we adopt that as our new local state.
  useEffect(() => {
    if (!state || !initializedRef.current) return;
    const external = state.arcEngine;
    if (!external) return;
    const last = lastPersistedRef.current;
    if (last && last.lastUpdatedAt === external.lastUpdatedAt) return;
    // External write detected — adopt and mark as our current persisted state
    // so the persist effect does not write it back and loop.
    lastPersistedRef.current = external;
    setArcState(external);
  }, [state?.arcEngine]);

  const offer = useCallback(() => setArcState(s => offerNextArc(s)), []);
  const accept = useCallback(() => setArcState(s => {
    const next = acceptOffer(s);
    // Play Drachenmutter intro when arc begins
    const narr = next.activeArcId ? ARC_NARRATOR[next.activeArcId] : null;
    if (narr) VoiceAudio.playNarrator(narr.intro, 800);
    return next;
  }), []);
  const decline = useCallback(() => setArcState(s => declineOffer(s)), []);
  const advance = useCallback((beatId: string) => setArcState(s => {
    const prev = s;
    const next = advanceBeat(s, beatId);
    const justCompleted = next.completedArcIds.length > prev.completedArcIds.length;
    if (justCompleted) {
      const lastId = next.completedArcIds[next.completedArcIds.length - 1];
      const narr = ARC_NARRATOR[lastId];
      if (narr?.outro) VoiceAudio.playNarrator(narr.outro, 1200);
      // Grant traits from arc reward
      const arc = findArc(lastId);
      const traitIds = arc?.rewardOnComplete?.traitIds || [];
      if (traitIds.length > 0) {
        const currentTraits = state?.earnedTraits || [];
        const merged = Array.from(new Set([...currentTraits, ...traitIds]));
        actions.patchState({ earnedTraits: merged });
      }
    } else if (next.activeArcId) {
      // Not yet complete — play per-beat narration for the NEW active beat (if any)
      const arc = findArc(next.activeArcId);
      const activeBeat = arc?.beats[next.activeBeatIndex];
      const narr = ARC_NARRATOR[next.activeArcId];
      if (activeBeat && narr?.beats?.[activeBeat.id]) {
        VoiceAudio.playNarrator(narr.beats[activeBeat.id], 800);
      }
    }
    return next;
  }), [state, actions]);

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
