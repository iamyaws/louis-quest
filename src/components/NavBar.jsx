import React from 'react';

const TABS = [
  { id: 'hub',     label: 'Hub',     icon: 'grid_view' },
  { id: 'quests',  label: 'Quests',  icon: 'map' },
  { id: 'room',    label: 'Room',    icon: 'bedroom_child' },
  { id: 'shop',    label: 'Shop',    icon: 'shopping_bag' },
  { id: 'journal', label: 'Journal', icon: 'menu_book' },
];

export default function NavBar({ active = 'quests', onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_24px_rgba(30,27,23,0.06)]">
      <div className="flex justify-around items-center px-4 pb-8 pt-4 max-w-lg mx-auto">
        {TABS.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              aria-label={tab.label}
              onClick={() => onNavigate?.(tab.id)}
              className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container rounded-full scale-90'
                  : 'text-on-surface/50 hover:scale-110'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="font-label text-[11px] font-semibold tracking-wide uppercase mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
