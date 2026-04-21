import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';
import { isTabUnlocked, getTabUnlock } from '../data/tabUnlocks';

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
  { id: 'hub',     key: 'nav.hub',     icon: 'local_fire_department' },
  { id: 'quests',  key: 'nav.quests',  icon: 'sunny' },
  { id: 'ronki',   key: 'nav.ronki',   icon: 'pets' },
  { id: 'journal', key: 'nav.journal', icon: 'auto_stories' },
  { id: 'shop',    key: 'nav.shop',    icon: 'shopping_bag' },
];

function useRevealOverride() {
  // Dev preview: ?reveal=all → everything unlocked;
  //              ?reveal=0   → everything locked (simulate fresh user);
  //              otherwise   → use real state to evaluate unlock criteria.
  const [param] = useState(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('reveal');
  });
  if (param === 'all') return { forceUnlockAll: true, forceLockAll: false };
  if (param === '0')   return { forceUnlockAll: false, forceLockAll: true };
  return { forceUnlockAll: false, forceLockAll: false };
}

export default function NavBar({ active = 'quests', onNavigate }) {
  const { t } = useTranslation();
  const { state } = useTask();
  const { forceUnlockAll, forceLockAll } = useRevealOverride();
  const [lockedHintFor, setLockedHintFor] = useState(null); // tab.id or null

  // Auto-dismiss the hint after 3.5s so a kid who taps something locked
  // doesn't need to know they have to close the sheet manually.
  useEffect(() => {
    if (!lockedHintFor) return;
    const timer = setTimeout(() => setLockedHintFor(null), 3500);
    return () => clearTimeout(timer);
  }, [lockedHintFor]);

  const handleTap = (tab, locked) => {
    if (locked) {
      setLockedHintFor(tab.id);
      return;
    }
    setLockedHintFor(null);
    onNavigate?.(tab.id);
  };

  const hintUnlock = lockedHintFor ? getTabUnlock(lockedHintFor) : null;
  const hintVars = hintUnlock?.hintVars ? hintUnlock.hintVars(state) : undefined;

  return (
    <>
      {/* Locked-tab hint sheet — floats just above the nav, points at the
           tapped tab with a gentle bounce. Auto-dismisses after 3.5s or
           on any outside tap via the backdrop. */}
      {lockedHintFor && hintUnlock && (
        <div
          className="fixed inset-0 z-[55]"
          onClick={() => setLockedHintFor(null)}
          style={{ background: 'transparent' }}
          aria-hidden="true"
        >
          <div
            className="fixed left-1/2 z-[56]"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 22px) + 96px)',
              transform: 'translateX(-50%)',
              maxWidth: 'calc(100vw - 32px)',
              width: 'min(360px, calc(100vw - 32px))',
              animation: 'navLockHintIn 0.22s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
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
            {/* Tiny pointer triangle toward the nav */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 12,
                height: 12,
                background: 'rgba(18,67,70,0.94)',
                borderRight: '1px solid rgba(252,211,77,0.22)',
                borderBottom: '1px solid rgba(252,211,77,0.22)',
              }}
            />
          </div>
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
            const unlocked = forceUnlockAll
              ? true
              : forceLockAll
                ? (tab.id === 'hub' || tab.id === 'quests')
                : isTabUnlocked(tab.id, state);
            // Never lock the currently-active tab — it would strand the
            // user inside a tab they can't reopen by tapping it.
            const locked = !unlocked && !isActive;
            const label = t(tab.key);
            return (
              <button
                key={tab.id}
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
          from { opacity: 0; transform: translate(-50%, 6px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  );
}
