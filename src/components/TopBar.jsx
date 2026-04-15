import React from 'react';
import { useTask } from '../context/TaskContext';
import { Pearl } from './CurrencyIcons';
import { useTranslation } from '../i18n/LanguageContext';

export default function TopBar({ onNavigate }) {
  const { state, computed } = useTask();
  const { t } = useTranslation();
  const hp = state?.hp || 0;
  const { level, xpProgress } = computed;
  const xpPct = xpProgress.need > 0 ? Math.min(1, xpProgress.cur / xpProgress.need) : 0;
  const heroName = state?.familyConfig?.childName || t('topbar.heroFallback');
  const heroAvatar = state?.heroGender === 'girl' ? 'art/hero-default-girl.webp' : 'art/hero-default.webp';

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex justify-between items-center px-6 py-3 w-full max-w-lg mx-auto">
        {/* Left: Hero Avatar + Level badge + Name */}
        <button onClick={() => onNavigate?.('ronki')}
                className="flex items-center gap-1 active:scale-95 transition-all">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shadow-sm"
                 style={{ border: '2px solid rgba(18,67,70,0.15)' }}>
              <img src={import.meta.env.BASE_URL + heroAvatar} alt={heroName} className="w-full h-full object-cover" />
            </div>
            {/* Level badge — golden circle */}
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md"
                 style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', border: '2px solid white', color: '#1a1a1a', lineHeight: 1 }}>
              {level}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-primary leading-tight">{heroName}</span>
            {/* XP progress bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(18,67,70,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${xpPct * 100}%`, background: 'linear-gradient(90deg, #124346, #5eead4)' }} />
              </div>
              <span className="font-label text-xs text-outline">{xpProgress.cur}/{xpProgress.need}</span>
            </div>
          </div>
        </button>

        {/* Right: HP pill with Pearl icon */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
             style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)' }}>
          <Pearl size={20} />
          <span className="text-primary font-bold text-sm font-label">{hp}</span>
        </div>
      </div>
    </header>
  );
}
