import React from 'react';
import { useTask } from '../context/TaskContext';
import { Pearl } from './CurrencyIcons';

export default function TopBar() {
  const { state, computed } = useTask();
  const hp = state?.hp || 0;
  const { level, xpProgress } = computed;
  const xpPct = xpProgress.need > 0 ? Math.min(1, xpProgress.cur / xpProgress.need) : 0;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
      <div className="flex justify-between items-center px-6 py-3 w-full max-w-lg mx-auto">
        {/* Left: Avatar + Level badge + Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <img src={import.meta.env.BASE_URL + 'art/dragon-baby.webp'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                 style={{ background: '#0f766e', border: '2px solid #fff8f1', lineHeight: 1 }}>
              {level}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-xl font-bold text-primary leading-tight">Ronki</span>
            {/* XP progress bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,118,110,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${xpPct * 100}%`, background: 'linear-gradient(90deg, #0f766e, #5eead4)' }} />
              </div>
              <span className="font-label text-[9px] text-outline">{xpProgress.cur}/{xpProgress.need}</span>
            </div>
          </div>
        </div>

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
