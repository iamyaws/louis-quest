import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

const TAB_KEYS = [
  { id: 'hub',     key: 'nav.hub',     icon: 'local_fire_department' },
  { id: 'quests',  key: 'nav.quests',  icon: 'military_tech' },
  { id: 'care',    key: 'nav.care',    icon: 'favorite' },
  { id: 'shop',    key: 'nav.shop',    icon: 'shopping_bag' },
  { id: 'journal', key: 'nav.journal', icon: 'auto_stories' },
];

export default function NavBar({ active = 'quests', onNavigate }) {
  const { t } = useTranslation();
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_24px_rgba(30,27,23,0.06)]">
      <div className="flex justify-around items-center px-4 pt-4 max-w-lg mx-auto"
           style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
        {TAB_KEYS.map(tab => {
          const isActive = tab.id === active;
          const label = t(tab.key);
          return (
            <button
              key={tab.id}
              aria-label={label}
              onClick={() => onNavigate?.(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] min-h-[60px] px-4 py-2 transition-all duration-300 ${
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
              <span className="font-label text-sm font-semibold tracking-wide uppercase mt-1">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
