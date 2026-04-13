import React from 'react';

const TABS = [
  { id: 'hub',     label: 'Start',     icon: 'home' },
  { id: 'quests',  label: 'Aufgaben',  icon: 'military_tech' },
  { id: 'care',    label: 'Pflege',    icon: 'favorite' },
  { id: 'shop',    label: 'Laden',     icon: 'shopping_bag' },
  { id: 'journal', label: 'Buch',      icon: 'auto_stories' },
];

export default function NavBar({ active = 'quests', onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_24px_rgba(30,27,23,0.06)]">
      <div className="flex justify-around items-center px-4 pt-4 max-w-lg mx-auto"
           style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
        {TABS.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              aria-label={tab.label}
              onClick={() => onNavigate?.(tab.id)}
              className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 ${
                isActive
                  ? 'bg-primary text-white rounded-full shadow-lg'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="font-label text-xs font-semibold tracking-wide uppercase mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
