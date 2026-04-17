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

// Map arc IDs to their Drachenmutter narrator audio files
const ARC_NARRATOR: Record<string, { intro: string; outro: string }> = {
  'first-adventure': { intro: 'arc_first_intro', outro: 'arc_first_outro' },
  'listening-game':  { intro: 'arc_listen_intro', outro: 'arc_listen_outro' },
  'ronkis-garden':   { intro: 'arc_garden_intro', outro: 'arc_garden_outro' },
  'weather-walker':  { intro: 'arc_weather_intro', outro: 'arc_weather_outro' },
};

export function useArc() {
  const { state, actions } = useTask();
  const [arcState, setArcState] = useState<ArcEngineState>(() =>
    state ? expireCooldownIfReady(loadArcEngineState(state)) : initialArcState()
  );

  // Persist whenever arcState changes
  useEffect(() => {
    actions.patchState({ arcEngine: arcState });
  }, [arcState, actions.patchState]);

  // Hydrate once when state transitions from null (async load completes)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (state && !initializedRef.current) {
      initializedRef.current = true;
      setArcState(expireCooldownIfReady(loadArcEngineState(state)));
    }
  }, [state]);

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
    // Play Drachenmutter outro when arc just completed
    const justCompleted = next.completedArcIds.length > prev.completedArcIds.length;
    if (justCompleted) {
      const lastId = next.completedArcIds[next.completedArcIds.length - 1];
      const narr = ARC_NARRATOR[lastId];
      if (narr) VoiceAudio.playNarrator(narr.outro, 1200);
      // Grant traits from arc reward
      const arc = findArc(lastId);
      const traitIds = arc?.rewardOnComplete?.traitIds || [];
      if (traitIds.length > 0) {
        const currentTraits = (state as any)?.earnedTraits || [];
        const merged = Array.from(new Set([...currentTraits, ...traitIds]));
        actions.patchState({ earnedTraits: merged } as any);
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
