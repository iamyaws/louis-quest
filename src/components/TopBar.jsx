import React from 'react';
import { useTask } from '../context/TaskContext';
import { Pearl } from './CurrencyIcons';
import { useTranslation } from '../i18n/LanguageContext';
import { isDevMode } from '../utils/mode';

// Global top bar — shown on all non-Hub/Care views. Styled to match the
// Hub's hero pill so the app reads as one design system across tabs.
export default function TopBar({ onNavigate }) {
  const { state, computed } = useTask();
  const { t } = useTranslation();
  const hp = state?.hp || 0;
  const { level, xpProgress } = computed;
  const xpPct = xpProgress.need > 0 ? Math.min(1, xpProgress.cur / xpProgress.need) : 0;
  const heroName = state?.familyConfig?.childName || t('topbar.heroFallback');
  const heroAvatar = state?.heroGender === 'girl' ? 'art/hero-default-girl.webp' : 'art/hero-default.webp';
  const dev = isDevMode();

  return (
    <header className="fixed w-full z-50 bg-surface/80 backdrop-blur-xl"
            style={{ top: 'var(--alpha-banner-h, 0px)' }}>
      <div className="flex justify-between items-center px-6 py-3 w-full max-w-lg mx-auto">
        {/* Left: Hero pill — mirrors Hub.jsx styling for design continuity.
             Avatar + Louis + "Tag N" streak, wrapped in a white rounded
             pill with the same shadow so the top-bar feels consistent
             across tabs. */}
        <button onClick={() => onNavigate?.('ronki')}
                className="flex items-center gap-3 active:scale-95 transition-all rounded-full"
                style={{ background: 'rgba(255,255,255,0.92)', padding: '6px 20px 6px 6px', boxShadow: '0 4px 14px rgba(0,0,0,0.16)' }}>
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(18,67,70,0.1)', border: '1px solid rgba(18,67,70,0.18)' }}>
              <img src={import.meta.env.BASE_URL + heroAvatar} alt={heroName} className="w-full h-full object-cover" />
            </div>
            {/* Dev-only level badge */}
            {dev && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow"
                   style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', border: '2px solid white', color: '#1a1a1a', lineHeight: 1 }}>
                {level}
              </div>
            )}
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-headline font-bold text-primary whitespace-nowrap">{heroName}</span>
            <span className="text-[10px] font-label font-semibold uppercase tracking-[0.16em] text-on-surface-variant mt-0.5 whitespace-nowrap">
              {t('hub.streakDay', { n: state?.streak || 1 })}
            </span>
          </div>
        </button>

        {/* Right: HP pill — kept on non-Hub views (Hub hides HP by design). */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
             style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)' }}>
          <Pearl size={20} />
          <span className="text-primary font-bold text-sm font-label">{hp}</span>
        </div>
      </div>
    </header>
  );
}
