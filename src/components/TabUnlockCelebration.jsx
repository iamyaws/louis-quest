import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { TAB_UNLOCKS } from '../data/tabUnlocks';
import SFX from '../utils/sfx';

/**
 * TabUnlockCelebration — lightweight onboarding scaffolding for the
 * grey-locked NavBar (see data/tabUnlocks.ts).
 *
 * Two one-shot surfaces per tab, both persisted so they never re-fire:
 *   1. Unlock toast — a small gold pill at the top of the viewport that
 *      says "🔓 Tagebuch freigeschaltet". Fires the first time a tab's
 *      unlock criterion flips true. 3s auto-dismiss. Plays a soft "ding"
 *      via existing SFX.
 *   2. First-tap coachmark — a one-sentence overlay that appears the
 *      first time Louis navigates INTO a newly-unlocked tab, explaining
 *      what the tab is FOR. Single tap dismisses.
 *
 * Both states live on state.tabUnlocksSeen / state.tabCoachmarksSeen so
 * they survive reloads + profile-switch.
 *
 * Mount once at the app level; pass the current `view` so the coachmark
 * knows which tab the user just opened.
 */
export default function TabUnlockCelebration({ view }) {
  const { state, actions } = useTask();
  const { t } = useTranslation();
  const [toastFor, setToastFor] = useState(null);    // tabId currently shown as toast
  const [coachFor, setCoachFor] = useState(null);    // tabId currently shown as coachmark
  const prevUnlockedRef = useRef(null);              // Set<string>
  const migratedRef = useRef(false);

  // ── One-time migration for existing users ──
  // The tabUnlocksSeen / tabCoachmarksSeen fields were added Apr 2026 after
  // Louis + Hector were already several sessions in. Without this, the
  // first render of this component would fire retroactive coachmarks for
  // tabs an experienced user has been using for weeks. Heuristic: if the
  // user has any task history AND none of the seen-flags are recorded yet,
  // mark all currently-unlocked tabs as "seen" so the UI stays quiet.
  useEffect(() => {
    if (!state || migratedRef.current) return;
    migratedRef.current = true;
    const hasHistory = (state.totalTasksDone || 0) > 0 || (state.streak || 0) > 0;
    const unlocksSeen = state.tabUnlocksSeen || {};
    const coachSeen = state.tabCoachmarksSeen || {};
    const anyFlagRecorded =
      Object.keys(unlocksSeen).length > 0 || Object.keys(coachSeen).length > 0;
    if (!hasHistory || anyFlagRecorded) return;
    for (const u of TAB_UNLOCKS) {
      if (u.isUnlocked(state)) {
        actions.markTabUnlockSeen?.(u.tabId);
        actions.markTabCoachmarkSeen?.(u.tabId);
      }
    }
  }, [state, actions]);

  // ── Effect 1: detect unlock transitions → fire toast ──
  useEffect(() => {
    if (!state) return;
    const nowUnlocked = new Set(
      TAB_UNLOCKS.filter(u => u.isUnlocked(state)).map(u => u.tabId)
    );
    const prev = prevUnlockedRef.current;
    prevUnlockedRef.current = nowUnlocked;
    if (!prev) return; // first render — don't retroactively toast

    const seen = state.tabUnlocksSeen || {};
    for (const tabId of nowUnlocked) {
      if (prev.has(tabId)) continue;           // already unlocked before
      if (seen[tabId]) continue;               // already toasted (belt + braces)
      setToastFor(tabId);
      SFX.play('pop');
      actions.markTabUnlockSeen?.(tabId);
      break; // only one toast at a time — others queue naturally on next flip
    }
  }, [state, actions]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastFor) return;
    const timer = setTimeout(() => setToastFor(null), 3200);
    return () => clearTimeout(timer);
  }, [toastFor]);

  // ── Effect 2: show coachmark on first visit to a newly-unlocked tab ──
  useEffect(() => {
    if (!state) return;
    const unlock = TAB_UNLOCKS.find(u => u.tabId === view);
    if (!unlock) return;                       // hub / quests have no coachmark
    if (!unlock.isUnlocked(state)) return;     // can only reach if unlocked or active
    if ((state.tabCoachmarksSeen || {})[view]) return;
    // Small delay so the coachmark lands after the view transition paint
    const timer = setTimeout(() => setCoachFor(view), 220);
    return () => clearTimeout(timer);
  }, [view, state]);

  const dismissCoach = () => {
    if (coachFor) actions.markTabCoachmarkSeen?.(coachFor);
    setCoachFor(null);
  };

  const toastUnlock = toastFor ? TAB_UNLOCKS.find(u => u.tabId === toastFor) : null;
  const coachUnlock = coachFor ? TAB_UNLOCKS.find(u => u.tabId === coachFor) : null;

  // Anchor the coachmark pointer at the target nav button. The card itself
  // stays visually centered (fine for readability), but the arrow moves to
  // point at whichever tab we're explaining. Without this, the pointer was
  // stuck at the card's horizontal center — which on a 5-tab navbar lands
  // roughly on the middle (Ronki) tab, so the Tagebuch unlock "Here's your
  // Tagebuch!" arrow was pointing at Ronki. Embarrassing, fixed.
  const [pointerLeftPx, setPointerLeftPx] = useState(null);
  useEffect(() => {
    if (!coachFor) { setPointerLeftPx(null); return; }
    let rafId;
    const measure = () => {
      const tabEl = document.querySelector(`[data-tab-id="${coachFor}"]`);
      if (!tabEl) return;
      const rect = tabEl.getBoundingClientRect();
      setPointerLeftPx(rect.left + rect.width / 2);
    };
    // Measure after the coach mount has painted. rAF is enough; NavBar
    // is always mounted by the time a coachmark can fire.
    rafId = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', measure);
    };
  }, [coachFor]);

  return (
    <>
      {/* Unlock toast — gold pill, top-center, floats over AlphaBanner so
           parents see it too. Non-blocking, no interaction required. */}
      {toastUnlock && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 z-[120]"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + var(--alpha-banner-h, 28px) + 12px)',
            transform: 'translateX(-50%)',
            animation: 'tabUnlockToastIn 0.3s ease-out, tabUnlockToastOut 0.4s ease-in 2.8s forwards',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <div
            className="rounded-full px-5 py-2.5 font-body font-semibold text-[14px] whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
              color: '#124346',
              boxShadow: '0 12px 28px -8px rgba(245,158,11,0.55), 0 4px 10px -2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
              border: '1px solid rgba(252,211,77,0.6)',
            }}
          >
            {t(toastUnlock.toastKey)}
          </div>
        </div>,
        document.body
      )}

      {/* First-tap coachmark — full-screen scrim + bottom card. Single tap
           anywhere dismisses. Localized. */}
      {coachUnlock && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t(coachUnlock.coachmarkKey)}
          className="fixed inset-0 z-[115]"
          onClick={dismissCoach}
          style={{
            background: 'rgba(18,67,70,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'tabCoachIn 0.25s ease-out',
          }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[min(420px,calc(100vw-32px))]"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 22px) + 112px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #fff8e1 100%)',
                boxShadow: '0 20px 50px -12px rgba(18,67,70,0.5), 0 8px 20px -4px rgba(0,0,0,0.18)',
                border: '1.5px solid rgba(252,211,77,0.5)',
              }}
            >
              <p className="font-body text-[15px] leading-snug text-on-surface">
                {t(coachUnlock.coachmarkKey)}
              </p>
              <button
                type="button"
                onClick={dismissCoach}
                className="mt-4 w-full py-3 rounded-full font-label font-bold uppercase text-[12px] tracking-[0.18em] active:scale-95 transition-transform"
                style={{
                  background: '#124346',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px -4px rgba(18,67,70,0.4)',
                  letterSpacing: '0.18em',
                }}
              >
                {t('nav.coach.close')}
              </button>
            </div>
          </div>
          {/* Pointer triangle anchored at the target nav button — fixed
               to the viewport so its left-coordinate is in the same
               coordinate system as the tab button we measured. Falls
               back to viewport-center if measurement hasn't resolved
               yet (first paint). */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: pointerLeftPx != null ? pointerLeftPx : '50%',
              // Sit just above the NavBar. NavBar bottom padding + height ≈
              // 80-90px on iOS; this lands the arrow over the active tab
              // icon zone. Using a fixed offset works across all kid-
              // plausible viewports (no magic numbers for tiny phones).
              bottom: 'calc(env(safe-area-inset-bottom, 22px) + 90px)',
              transform: pointerLeftPx != null
                ? 'translateX(-50%) rotate(45deg)'
                : 'translateX(-50%) rotate(45deg)',
              width: 14,
              height: 14,
              background: '#fff8e1',
              borderRight: '1.5px solid rgba(252,211,77,0.5)',
              borderBottom: '1.5px solid rgba(252,211,77,0.5)',
              pointerEvents: 'none',
            }}
          />
        </div>,
        document.body
      )}

      <style>{`
        @keyframes tabUnlockToastIn {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes tabUnlockToastOut {
          from { opacity: 1; transform: translate(-50%, 0); }
          to   { opacity: 0; transform: translate(-50%, -8px); }
        }
        @keyframes tabCoachIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
