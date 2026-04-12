import React from 'react';
import { useTask } from '../context/TaskContext';
import { Pearl } from './CurrencyIcons';

export default function TopBar() {
  const { state } = useTask();
  const hp = state?.hp || 0;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-lg mx-auto">
        {/* Left: Avatar + Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img src={import.meta.env.BASE_URL + 'art/dragon-baby.webp'} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <span className="font-headline text-2xl font-bold text-primary">Ronki</span>
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
