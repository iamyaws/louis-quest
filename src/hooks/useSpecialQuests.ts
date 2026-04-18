import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { SPECIAL_QUESTS } from '../data/specialQuests';
import { FREUNDE, FREUND_BY_ID } from '../data/freunde';
import { findArc } from '../arcs/arcs';
import { offerArcById, completeArc, initialArcState } from '../arcs/ArcEngine';
import type { TaskState } from '../context/TaskContext';
import type { ArcEngineState } from '../arcs/types';

function checkTrigger(trigger: string, state: TaskState): boolean {
  switch (trigger) {
    case 'totalTasks_1':  return (state.totalTasksDone || 0) >= 1;
    case 'totalTasks_10': return (state.totalTasksDone || 0) >= 10;
    case 'firstBoss':     return (state.bossTrophies || []).length >= 1;
    case 'firstJournal':  return (state.journalHistory || []).length >= 1;
    case 'screenMin':     return (state.drachenEier || 0) >= 1;
    case 'careVisit':     return (state.viewsVisited || []).includes('care');
    case 'gamesVisit':    return (state.viewsVisited || []).includes('games');
    case 'memoriesVisit': return (state.viewsVisited || []).includes('memories');
    case 'moodSet':       return state.moodAM !== null;
    case 'waterFull':     return (state.dailyWaterCount || 0) >= 6;
    default: return false;
  }
}

/** Days between two ISO date strings (YYYY-MM-DD). */
function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (24 * 3600 * 1000));
}

export function useSpecialQuests() {
  const { state, actions } = useTask();

  useEffect(() => {
    if (!state) return;
    const completed = state.completedSpecialQuests || {};
    SPECIAL_QUESTS.forEach(quest => {
      if (completed[quest.id]) return;
      if (checkTrigger(quest.trigger, state)) {
        actions.completeSpecialQuest(quest.id);
      }
    });
  }, [state]);

  // ── Freund reunion arcs: unlock triggers + callback scheduling ──
  //
  // Integration notes:
  // - Offering an arc: we mutate state.arcEngine directly via patchState(),
  //   applying the pure offerArcById() transition. useArc's own hook hydrates
  //   from state.arcEngine whenever state changes, so this propagates cleanly.
  // - Callback pattern: STANDALONE STATE. The arc engine only runs beats 1-3.
  //   When beat 3 (pil-b3-realife) advances the engine to beat 4, we detect
  //   the beatIndex=3 state and force-complete the arc here, then schedule
  //   the callback in freundCallbacksPending. Beat 4 is rendered later by a
  //   Phase B component reading freundCallbacksPending + beat 4's i18n keys —
  //   no mid-arc engine restart needed. When Phase B dismisses the callback,
  //   it patches freundArcsCompleted + freundCallbacksPending directly.
  //   Tradeoff: engine's completedArcIds contains the arc before the visual
  //   callback fires. Acceptable because the user-facing "done" state is
  //   freundArcsCompleted, not completedArcIds.
  useEffect(() => {
    if (!state) return;

    const arcEngine: ArcEngineState = state.arcEngine || initialArcState();
    const freundArcsCompleted = state.freundArcsCompleted || [];
    const callbacksPending = state.freundCallbacksPending || [];

    // 1. Unlock trigger: offer the arc if chapter threshold met
    for (const freund of FREUNDE) {
      if (!freund.implemented) continue;
      const arcId = `freund-${freund.id}`;
      if (freundArcsCompleted.includes(arcId)) continue;
      if (arcEngine.completedArcIds.includes(arcId)) continue;
      if (arcEngine.activeArcId === arcId) continue;
      if (arcEngine.offeredArcId === arcId) continue;
      if (arcEngine.phase !== 'idle') continue;

      // Gate: onboarding at least 1 day ago
      if (!state.onboardingDate) continue;
      if (daysSince(state.onboardingDate) < 1) continue;

      // Gate: enough creatures in this chapter discovered
      const discovered = state.micropediaDiscovered || [];
      const chapterCount = discovered.filter(d => d.chapter === freund.chapter).length;
      if (chapterCount < freund.unlockThreshold) continue;

      // All gates passed — offer the arc
      const nextEngine = offerArcById(arcEngine, arcId);
      if (nextEngine !== arcEngine) {
        actions.patchState({ arcEngine: nextEngine });
        return; // one offer per effect pass
      }
    }

    // 2. Callback scheduling: when the FINAL beat just advanced (engine past
    //    the last routine beat), force-complete the arc and schedule the
    //    callback for 5-7 days later. Works for Freund arcs of any beat count.
    if (arcEngine.phase === 'active' && arcEngine.activeArcId) {
      const arc = findArc(arcEngine.activeArcId);
      const freundId = arc?.freundId;
      // For Freund arcs the "active-beat past the penultimate" point triggers
      // the pre-callback completion. Current pilot: 4 beats, trigger at idx 3.
      const isFreundArc = !!(arc && freundId && FREUND_BY_ID.has(freundId));
      const atCallbackBoundary = arc && arcEngine.activeBeatIndex === arc.beats.length - 1;
      if (isFreundArc && atCallbackBoundary) {
        const alreadyPending = callbacksPending.some(cb => cb.freundId === freundId);
        if (!alreadyPending) {
          const scheduleAt = new Date(
            Date.now() + (5 + Math.random() * 2) * 24 * 3600 * 1000
          ).toISOString();
          const completedEngine = completeArc(arcEngine, arc);
          // Grant traits now (we bypass useArc.advance(), which normally does it)
          const traitIds = arc?.rewardOnComplete?.traitIds || [];
          const mergedTraits = traitIds.length > 0
            ? Array.from(new Set([...(state.earnedTraits || []), ...traitIds]))
            : undefined;
          actions.patchState({
            arcEngine: completedEngine,
            freundCallbacksPending: [
              ...callbacksPending,
              { freundId, triggerAt: scheduleAt },
            ],
            ...(mergedTraits ? { earnedTraits: mergedTraits } : {}),
          });
          return;
        }
      }
    }

    // 3. Callback firing: entries whose triggerAt has passed are picked up
    //    by the Phase B UI component (which reads freundCallbacksPending and
    //    filters by triggerAt <= now). No engine transition here — the UI
    //    dismissal action will move the arc into freundArcsCompleted and
    //    drop the pending entry.
  }, [state, actions]);

  const completed = state?.completedSpecialQuests || {};
  const totalDone = Object.values(completed).filter(Boolean).length;

  return {
    quests: SPECIAL_QUESTS,
    completed,
    totalDone,
    total: SPECIAL_QUESTS.length,
  };
}
