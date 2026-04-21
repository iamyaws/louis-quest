import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

/**
 * QuestEater — the "Ronki eats completed quests" animation pipeline.
 *
 * Claude Design's Feature Previews file showed a pattern Louis loved:
 * when a quest is ticked, its icon *flies* across the screen into a
 * pinned Ronki in the TopBar, who burps a tiny flame and briefly says
 * "+N Sterne!" Reversal of the "complete → silent checkmark" loop.
 *
 * Core-loop audit #1 flagged exactly this: the loop was silent.
 *
 * Architecture:
 *   · A Provider wraps the app and owns:
 *       - a ref to the target <PinnedRonki> element (registered on mount)
 *       - the current flyer's { id, emoji, fromRect, phase } state
 *       - burp + bubble triggers that PinnedRonki subscribes to
 *   · Consumers:
 *       - <PinnedRonki> registers its DOM node + reads burp/bubble
 *       - <TaskList>'s handleComplete calls eatQuest() with the tapped
 *         button's rect + the quest emoji + HP reward
 *
 * The Flyer is a position:fixed div that spawns at `fromRect` and
 * transitions its top/left/transform to Ronki's rect over ~700ms. On
 * arrival we bump burpKey (Ronki's flame puff) and set bubble ("+5 ⭐").
 *
 * Cheap to run: one transient DOM node at a time, CSS transitions only
 * on transform/opacity/top/left (GPU-accelerated per the perf audit).
 */

const QuestEaterContext = createContext(null);

export function useQuestEater() {
  return useContext(QuestEaterContext);
}

export function QuestEaterProvider({ children }) {
  // Two registration slots — 'preferred' wins when set. Lets the Hub
  // CampfireScene register its side-view Ronki as the target whenever
  // it's mounted (Louis is on Lager), falling back to the TopBar's
  // PinnedRonki on every other tab. No props drilling needed.
  const preferredRef = useRef(null);
  const fallbackRef = useRef(null);
  const [flyer, setFlyer] = useState(null);
  const [burpKey, setBurpKey] = useState(0);
  const [bubble, setBubble] = useState(null);
  // Separate trigger for the SideRonki fire-breath animation on Lager.
  // Increments each time CampfireScene's Ronki is the one eating.
  const [fireBreath, setFireBreath] = useState(0);

  const registerRonkiEl = useCallback((el, slot = 'fallback') => {
    if (slot === 'preferred') preferredRef.current = el;
    else fallbackRef.current = el;
  }, []);

  const getActiveRonki = () => preferredRef.current || fallbackRef.current;
  const getActiveSlot = () => (preferredRef.current ? 'preferred' : 'fallback');

  const eatQuest = useCallback(({ fromRect, emoji, hp = 0 }) => {
    const target = getActiveRonki();
    if (!fromRect || !target) {
      // No Ronki mounted or no source rect — skip silently. The normal
      // completion feedback (voice + SFX + haptic) still fires.
      return;
    }

    // If Ronki is off-screen (Marc's scroll issue — quest was below the
    // fold, Ronki was above), smooth-scroll to bring him into view
    // first, THEN fire the flyer. Gives the "dragon ate my quest"
    // moment a chance to actually be seen.
    const ronkiRect = target.getBoundingClientRect();
    const vh = window.innerHeight;
    const isOffScreen = ronkiRect.bottom < 0 || ronkiRect.top > vh;

    const start = () => {
      // Re-measure after any scroll settles.
      const toRect = target.getBoundingClientRect();
      const id = Date.now() + Math.random();
      setFlyer({ id, emoji, fromRect, toRect, phase: 'start' });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlyer(prev => (prev && prev.id === id ? { ...prev, phase: 'flying' } : prev));
        });
      });

      setTimeout(() => {
        setFlyer(prev => (prev && prev.id === id ? null : prev));
        setBurpKey(k => k + 1);
        // On Lager (preferred slot = CampfireScene SideRonki), trigger
        // the fire-breath animation in addition to the burp bubble —
        // Marc: "the dragon at the campfire needs to eat it and breath
        // fire".
        if (getActiveSlot() === 'preferred') {
          setFireBreath(f => f + 1);
        }
        const label = hp > 0 ? `+${hp} ⭐` : '👍';
        setBubble(label);
        setTimeout(() => setBubble(prev => (prev === label ? null : prev)), 2200);
      }, 720);
    };

    if (isOffScreen) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(start, 420);
    } else {
      start();
    }
  }, []);

  return (
    <QuestEaterContext.Provider value={{ registerRonkiEl, eatQuest, burpKey, bubble, fireBreath }}>
      {children}
      {flyer && <Flyer {...flyer} />}
    </QuestEaterContext.Provider>
  );
}

// ── Flyer ─────────────────────────────────────────────────────────────
// Position:fixed icon that transitions from the tapped quest card's
// rect to Ronki's rect. Uses top/left (not transform translate) so the
// transition end position is absolute and predictable even if the
// flyer's container reflows.

function Flyer({ emoji, fromRect, toRect, phase }) {
  const size = 44;
  const start = {
    top: fromRect.top + fromRect.height / 2 - size / 2,
    left: fromRect.left + fromRect.width / 2 - size / 2,
    transform: 'scale(1)',
    opacity: 1,
  };
  const end = {
    top: toRect.top + toRect.height / 2 - size / 2,
    left: toRect.left + toRect.width / 2 - size / 2,
    transform: 'scale(0.3)',
    opacity: 0,
  };
  const style = phase === 'flying' ? end : start;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        width: size,
        height: size,
        borderRadius: 14,
        background: '#fef3c7',
        border: '2px solid #fcd34d',
        display: 'grid',
        placeItems: 'center',
        fontSize: 22,
        boxShadow: '0 8px 16px -4px rgba(245,158,11,0.5)',
        pointerEvents: 'none',
        zIndex: 1000,
        transition:
          'top 0.7s cubic-bezier(0.65,0,0.35,1), ' +
          'left 0.7s cubic-bezier(0.65,0,0.35,1), ' +
          'transform 0.7s cubic-bezier(0.65,0,0.35,1), ' +
          'opacity 0.3s ease-out 0.4s',
        ...style,
      }}
    >
      {emoji}
    </div>
  );
}
