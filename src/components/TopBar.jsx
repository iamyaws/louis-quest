import React from 'react';
import { useTask } from '../context/TaskContext';

export default function TopBar() {
  const { state, computed } = useTask();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-lg mx-auto">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              egg
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">Ronki</h1>
        </div>

        {/* Right: Progress pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
          <span className="font-label font-bold text-sm text-primary">
            {computed.done}/{computed.total} erledigt
          </span>
        </div>
      </div>
    </header>
  );
}
