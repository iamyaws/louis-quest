import React from 'react';

const TABS = [
  { id: 'hub',     label: 'Hub',     icon: 'grid_view' },
  { id: 'quests',  label: 'Quests',  icon: 'task_alt' },
  { id: 'room',    label: 'Room',    icon: 'potted_plant' },
  { id: 'shop',    label: 'Shop',    icon: 'shopping_bag' },
  { id: 'journal', label: 'Journal', icon: 'menu_book' },
];

export default function NavBar({ active = 'quests' }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_24px_rgba(30,27,23,0.06)] border-t border-outline-variant/10">
      <div className="flex justify-around items-end px-4 pb-6 pt-3 max-w-lg mx-auto"
           style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}>
        {TABS.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-primary-container text-white rounded-full px-5 py-2.5 -translate-y-2 shadow-lg shadow-primary-container/20'
                  : 'text-on-surface/40 p-3 hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="font-label text-[11px] font-bold tracking-wide mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
