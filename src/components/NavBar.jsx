import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTask } from '../context/TaskContext';

// Pflege merged into Ronki's page (April 2026) — care actions
// (Füttern/Streicheln/Spielen) now live at the top of RonkiProfile.
// The 'care' view route stays in App.jsx so eggTriggers + dreamHighlights
// + any in-app links that still point at 'care' keep working.
//
// Progressive disclosure (Apr 2026, see backlog_progressive_hub_disclosure.md):
// Tabs stage in by totalTasksDone so fresh kids only see Lager + Heute on
// session 1. Ronki/Tagebuch/Laden appear as the core loop gets internalized.
// Always-visible tab (the one the kid is currently ON) is never hidden
// even if its threshold hasn't been met yet — avoids nav vanishing under
// an active view.
const TAB_KEYS = [
  { id: 'hub',     key: 'nav.hub',     icon: 'local_fire_department', revealAt: 0 },
  { id: 'quests',  key: 'nav.quests',  icon: 'sunny',                 revealAt: 0 },
  { id: 'ronki',   key: 'nav.ronki',   icon: 'pets',                  revealAt: 1 },
  { id: 'journal', key: 'nav.journal', icon: 'auto_stories',          revealAt: 3 },
  { id: 'shop',    key: 'nav.shop',    icon: 'shopping_bag',          revealAt: 5 },
];

export default function NavBar({ active = 'quests', onNavigate }) {
  const { t } = useTranslation();
  const { state } = useTask();
  const tasksReal = state?.totalTasksDone || 0;
  const revealParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('reveal')
    : null;
  const tasksEffective = revealParam === 'all'
    ? Infinity
    : (revealParam != null && !Number.isNaN(Number(revealParam)))
      ? Number(revealParam)
      : tasksReal;
  const visibleTabs = TAB_KEYS.filter(
    tab => tasksEffective >= (tab.revealAt ?? 0) || tab.id === active
  );
  return (
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
        {visibleTabs.map(tab => {
          const isActive = tab.id === active;
          const label = t(tab.key);
          return (
            <button
              key={tab.id}
              aria-label={label}
              onClick={() => onNavigate?.(tab.id)}
              className="flex flex-col items-center transition-all duration-300 active:scale-95"
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
                      color: '#6b655b',
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
