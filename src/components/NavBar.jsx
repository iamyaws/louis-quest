import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { isTabUnlocked, getTabUnlock } from '../data/tabUnlocks';
import SFX from '../utils/sfx';
import { triggerHaptic } from '../lib/haptics';

// Pflege merged into Ronki's page (April 2026) — care actions
// (Füttern/Streicheln/Spielen) now live at the top of RonkiProfile.
// The 'care' view route stays in App.jsx so eggTriggers + dreamHighlights
// + any in-app links that still point at 'care' keep working.
//
// Progressive disclosure (Apr 2026, see backlog_progressive_hub_disclosure.md):
// Tabs that aren't yet earned render DIMMED with a padlock overlay instead
// of being hidden. Tapping a locked tab doesn't navigate — it surfaces a
// one-line hint sheet with the exact unlock requirement + current progress.
// Hector feedback: "hidden tabs feel off, grey them out and tell me when
// they open." Unlock criteria live in data/tabUnlocks.ts.
//
// Dev override: ?reveal=all or ?reveal=N still forces unlock state so
// Marc can preview any stage without touching Louis's real save.
const TAB_KEYS = [
  // 'cottage' — small house-with-chimney glyph that reads as
  // "Ronki's cozy place" without committing to a single visual
  // metaphor (cave / nest / camp). Pairs with the 'Nest' label
  // Marc landed on (Lager → Nest, 25 Apr 2026).
  { id: 'hub',     key: 'nav.hub',     icon: 'cottage' },
  { id: 'quests',  key: 'nav.quests',  icon: 'sunny' },
  { id: 'ronki',   key: 'nav.ronki',   icon: 'pets' },
  { id: 'journal', key: 'nav.journal', icon: 'auto_stories' },
  { id: 'shop',    key: 'nav.shop',    icon: 'shopping_bag' },
];

function useRevealOverride() {
  // Dev preview: ?reveal=all → everything unlocked regardless of state.
  // Everything else falls through to real state, so natural unlocks (first
  // task → Ronki, first mood + 3 tasks → Tagebuch, 50 Sterne → Laden) still
  // fire as the kid plays — Marc's preview workflow needs that to verify
  // the unlock ceremony actually plays.
  //
  // Note: the old ?reveal=0 "force everything locked" mode was dropped
  // because it masked real state changes, making it impossible to preview
  // an unlock firing. To preview the locked look now, start a fresh
  // profile via onboarding (or clear IndexedDB).
  const [param] = useState(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('reveal');
  });
  if (param === 'all') return { forceUnlockAll: true };
  return { forceUnlockAll: false };
}

export default function NavBar({ active = 'quests', onNavigate }) {
  const { t } = useTranslation();
  const { state } = useTask();
  const { forceUnlockAll } = useRevealOverride();
  // Locked hint state: null OR { tabId, anchorX } so the hint bubble can
  // anchor its pointer at the tapped tab instead of dead-centering.
  const [lockedHintFor, setLockedHintFor] = useState(null);
  const btnRefsRef = useRef({}); // tabId → button element

  // Auto-dismiss the hint after 3.5s so a kid who taps something locked
  // doesn't need to know they have to close the sheet manually. Also
  // dismiss on any outside pointerdown WITHOUT intercepting the click —
  // the previous full-viewport backdrop was eating the next tap, so the
  // kid had to tap twice to switch tabs. Using `capture: false` means the
  // tapped element still receives its own event.
  useEffect(() => {
    if (!lockedHintFor) return;
    const timer = setTimeout(() => setLockedHintFor(null), 3500);
    const handleOutside = (e) => {
      const sheet = document.getElementById('nav-lock-hint-sheet');
      if (sheet && !sheet.contains(e.target)) setLockedHintFor(null);
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleOutside);
    };
  }, [lockedHintFor]);

  const handleTap = (tab, locked) => {
    if (locked) {
      // Locked tab: gentle bump (warning haptic + soft pop) so the kid
      // FEELS the tap was registered, even though navigation didn't fire.
      // Without this the locked-tab tap felt dead — kid would think the
      // app froze.
      try { triggerHaptic('warning'); } catch {}
      SFX.play('pop');
      const el = btnRefsRef.current[tab.id];
      const rect = el?.getBoundingClientRect();
      const anchorX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      setLockedHintFor({ tabId: tab.id, anchorX });
      return;
    }
    // Unlocked tap: light haptic + soft pop SFX. Marc 27 Apr 2026:
    // "there should also either be sounds and/or haptics when i click
    // buttons like nav" — both, light. Phones without a haptic engine
    // ignore the call silently; muted devices skip the SFX. Either way,
    // the device-capable kid gets a confirming tactile beat.
    try { triggerHaptic('light'); } catch {}
    SFX.play('tap');
    setLockedHintFor(null);
    onNavigate?.(tab.id);
  };

  const hintUnlock = lockedHintFor ? getTabUnlock(lockedHintFor.tabId) : null;
  const hintVars = hintUnlock?.hintVars ? hintUnlock.hintVars(state) : undefined;

  // Anchor math: sheet is up to 360px wide, clamped 16px from each viewport
  // edge, ideally centered on the tapped tab. Triangle points at the exact
  // tab center (anchorX) — even if the sheet has to shift to stay onscreen,
  // the triangle stays at the anchor.
  let sheetLeft = 0;
  let sheetWidth = 0;
  let triangleLeft = 0;
  if (lockedHintFor && typeof window !== 'undefined') {
    const vw = window.innerWidth;
    sheetWidth = Math.min(360, vw - 32);
    const idealLeft = lockedHintFor.anchorX - sheetWidth / 2;
    sheetLeft = Math.max(16, Math.min(idealLeft, vw - sheetWidth - 16));
    triangleLeft = lockedHintFor.anchorX - sheetLeft;
  }

  return (
    <>
      {/* Locked-tab hint sheet — floats just above the nav, points at the
           tapped tab with a gentle bounce. Auto-dismisses after 3.5s or
           on any outside pointerdown. No backdrop — the previous version
           intercepted the next tap which broke tab switching. */}
      {lockedHintFor && hintUnlock && (
          <div
            id="nav-lock-hint-sheet"
            className="fixed z-[56]"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 22px) + 96px)',
              left: sheetLeft,
              width: sheetWidth,
              animation: 'navLockHintIn 0.22s ease-out',
            }}
          >
            <div
              role="dialog"
              aria-modal="false"
              aria-label={t('nav.locked.sheetTitle')}
              className="rounded-2xl p-4"
              style={{
                background: 'rgba(18,67,70,0.94)',
                color: '#fff',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                boxShadow: '0 16px 40px -12px rgba(18,67,70,0.5), 0 4px 12px -4px rgba(0,0,0,0.25)',
                border: '1px solid rgba(252,211,77,0.22)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="material-symbols-outlined shrink-0 mt-0.5"
                  style={{ fontSize: 22, color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  lock
                </span>
                <p className="font-body text-[14px] leading-snug flex-1">
                  {t(hintUnlock.hintKey, hintVars)}
                </p>
              </div>
            </div>
            {/* Triangle points at the tapped tab (anchorX), clamped so it
                stays within the sheet's rounded corners. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -6,
                left: Math.max(16, Math.min(triangleLeft, sheetWidth - 16)),
                transform: 'translateX(-50%) rotate(45deg)',
                width: 12,
                height: 12,
                background: 'rgba(18,67,70,0.94)',
                borderRight: '1px solid rgba(252,211,77,0.22)',
                borderBottom: '1px solid rgba(252,211,77,0.22)',
              }}
            />
          </div>
      )}

      <nav
        className="fixed bottom-0 left-0 w-full z-50"
        style={{
          // Design-adapted nav (Ronki *.Polish.html). Cream glass with heavy
          // blur+saturate, rounded-top, softer downward shadow so the bar
          // feels like a floating shelf instead of a hard footer.
          background: 'rgba(255,248,242,0.92)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          boxShadow: '0 -12px 28px -12px rgba(18,67,70,0.18)',
        }}
      >
        <div
          className="flex justify-around items-center max-w-lg mx-auto"
          style={{
            padding: '14px 18px',
            paddingBottom: 'max(22px, env(safe-area-inset-bottom, 22px))',
          }}
        >
          {TAB_KEYS.map(tab => {
            const isActive = tab.id === active;
            const unlocked = forceUnlockAll || isTabUnlocked(tab.id, state);
            // Never lock the currently-active tab — it would strand the
            // user inside a tab they can't reopen by tapping it.
            const locked = !unlocked && !isActive;
            const label = t(tab.key);
            // Sparkle pulse on tabs that have unlocked but whose coachmark
            // hasn't been dismissed yet — draws the eye to the new surface
            // until the kid actually opens it. Hub + Quests are never
            // "new" so skip them. Dropped once coachmark is marked seen.
            const hasCoachmark = tab.id === 'ronki' || tab.id === 'journal' || tab.id === 'shop';
            const isFreshUnlock = hasCoachmark
              && unlocked
              && !isActive
              && !(state?.tabCoachmarksSeen || {})[tab.id];
            return (
              <button
                key={tab.id}
                ref={(el) => { btnRefsRef.current[tab.id] = el; }}
                data-tab-id={tab.id}
                aria-label={locked ? `${label} — ${t('nav.locked.aria')}` : label}
                aria-disabled={locked ? 'true' : 'false'}
                onClick={() => handleTap(tab, locked)}
                className="relative flex flex-col items-center transition-all duration-300 active:scale-95"
                style={
                  isActive
                    ? {
                        // Horizontal pill with teal gradient + warm shadow.
                        // Wider, flatter than our old circular pill — reads as
                        // "you are here" without shouting.
                        gap: 4,
                        padding: '10px 16px',
                        minWidth: 52,
                        borderRadius: 22,
                        background: 'linear-gradient(180deg, #2d5a5e 0%, #124346 100%)',
                        color: '#ffffff',
                        boxShadow: '0 8px 18px -6px rgba(18,67,70,0.4)',
                      }
                    : {
                        gap: 4,
                        padding: '8px 6px',
                        minWidth: 52,
                        color: locked ? 'rgba(107,101,91,0.38)' : '#6b655b',
                        opacity: locked ? 0.55 : 1,
                        borderRadius: isFreshUnlock ? 14 : undefined,
                        animation: isFreshUnlock
                          ? 'navTabUnlockPulse 1.8s ease-in-out infinite'
                          : undefined,
                      }
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  className="font-label font-bold uppercase"
                  style={{ fontSize: 9, letterSpacing: '0.14em', lineHeight: 1 }}
                >
                  {label}
                </span>
                {/* Sparkle accents on freshly-unlocked tabs — three tiny
                     stars in gold that fade in/out on the unlock pulse.
                     Hidden once the coachmark is dismissed. */}
                {isFreshUnlock && (
                  <>
                    <span aria-hidden="true" style={{
                      position: 'absolute', top: 2, right: 8, width: 4, height: 4,
                      borderRadius: '50%', background: '#fcd34d',
                      boxShadow: '0 0 6px 2px rgba(252,211,77,0.8)',
                      animation: 'navTabUnlockSparkle 1.6s ease-in-out 0.2s infinite',
                    }} />
                    <span aria-hidden="true" style={{
                      position: 'absolute', top: 18, left: 6, width: 3, height: 3,
                      borderRadius: '50%', background: '#fde68a',
                      boxShadow: '0 0 5px 1.5px rgba(253,230,138,0.7)',
                      animation: 'navTabUnlockSparkle 1.8s ease-in-out 0.8s infinite',
                    }} />
                    <span aria-hidden="true" style={{
                      position: 'absolute', bottom: 10, right: 4, width: 3, height: 3,
                      borderRadius: '50%', background: '#f59e0b',
                      boxShadow: '0 0 5px 1.5px rgba(245,158,11,0.7)',
                      animation: 'navTabUnlockSparkle 2.1s ease-in-out 1.1s infinite',
                    }} />
                  </>
                )}
                {/* Padlock badge on locked tabs — tiny, bottom-right of the icon */}
                {locked && (
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined absolute"
                    style={{
                      top: 2,
                      right: 6,
                      fontSize: 12,
                      color: 'rgba(18,67,70,0.55)',
                      background: 'rgba(255,248,242,0.92)',
                      borderRadius: '50%',
                      padding: 1,
                      fontVariationSettings: "'FILL' 1",
                      lineHeight: 1,
                    }}
                  >
                    lock
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes navLockHintIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes navTabUnlockPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(252,211,77,0); }
          50%      { box-shadow: 0 0 0 4px rgba(252,211,77,0.35), 0 0 16px 4px rgba(252,211,77,0.45); }
        }
        @keyframes navTabUnlockSparkle {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          50%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.4); }
        }
      `}</style>
    </>
  );
}
