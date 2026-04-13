import React from 'react';

const GAMES = [
  {
    id: 'memory',
    title: 'Magisches Gedächtnis',
    desc: 'Finde die Paare in Ronkis Wald.',
    icon: 'style',
    visualIcon: 'style',
    iconBg: 'rgba(234,195,62,0.15)',
    iconColor: '#735c00',
    visualBg: 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(115,92,0,0.05))',
    visualColor: '#fcd34d',
    ready: true,
  },
  {
    id: 'starfall',
    title: 'Sternenfänger',
    desc: 'Sammle die fallenden Lichter der Nacht.',
    icon: 'stars',
    visualIcon: 'auto_awesome',
    iconBg: 'rgba(83,0,183,0.08)',
    iconColor: '#5300b7',
    visualBg: 'linear-gradient(135deg, rgba(109,40,217,0.1), rgba(83,0,183,0.05))',
    visualColor: '#fcd34d',
    ready: true,
  },
  {
    id: 'potion',
    title: 'Kräutermischung',
    desc: 'Braue heilende Elixiere aus Waldkräutern.',
    icon: 'vital_signs',
    visualIcon: 'science',
    iconBg: 'rgba(107,48,0,0.08)',
    iconColor: '#6b3000',
    visualBg: 'linear-gradient(135deg, rgba(143,66,0,0.1), rgba(107,48,0,0.05))',
    visualColor: '#8f4200',
    ready: true,
  },
  {
    id: 'clouds',
    title: 'Wolkensprung',
    desc: 'Fliege mit deinem Drachen durch die Wolken!',
    icon: 'cloud',
    visualIcon: 'air',
    iconBg: 'rgba(135,206,235,0.2)',
    iconColor: '#0284c7',
    visualBg: 'linear-gradient(135deg, rgba(135,206,235,0.15), rgba(2,132,199,0.05))',
    visualColor: '#0284c7',
    ready: true,
  },
];

export default function MiniGames({ onPlay }) {
  return (
    <div className="px-6 pb-8">
      {/* Header */}
      <section className="mb-8">
        <h2 className="font-headline text-4xl font-bold text-primary tracking-tight">Mini-Spiele</h2>
        <p className="font-body text-on-surface-variant text-lg mt-1">Entspanne dich in der magischen Lichtung.</p>
      </section>

      {/* Game cards */}
      <div className="flex flex-col gap-6">
        {GAMES.map(game => (
          <div key={game.id}
            className="relative bg-white rounded-2xl p-6 overflow-hidden transition-all duration-300 active:scale-[0.98]"
            style={{ boxShadow: '0 8px 24px rgba(30,27,23,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
            {/* Lotus motif */}
            <div className="absolute bottom-2 right-2 w-24 h-24 opacity-5 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10C50 10 35 40 20 40C5 40 5 60 20 60C35 60 50 90 50 90C50 90 65 60 80 60C95 60 95 40 80 40C65 40 50 10 50 10Z" />
              </svg>
            </div>

            <div className="relative flex items-start justify-between">
              <div className="space-y-4 max-w-[65%]">
                {/* Icon */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                     style={{ background: game.iconBg }}>
                  <span className="material-symbols-outlined text-3xl" style={{ color: game.iconColor }}>{game.icon}</span>
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-headline text-2xl font-semibold text-on-surface">{game.title}</h3>
                  <p className="font-body text-sm text-on-surface-variant mt-1">{game.desc}</p>
                </div>

                {/* Button */}
                {game.ready ? (
                  <button onClick={() => onPlay(game.id)}
                    className="bg-secondary-container text-on-surface px-8 py-2.5 rounded-full font-label font-bold text-sm active:scale-95 transition-all flex items-center gap-2">
                    Spielen
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-label font-bold"
                       style={{ background: 'rgba(232,225,218,0.6)', color: '#7b7486' }}>
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Bald verfügbar
                  </div>
                )}
              </div>

              {/* Visual element */}
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0"
                   style={{ background: game.visualBg }}>
                <span className="material-symbols-outlined text-4xl"
                      style={{ color: game.visualColor, fontVariationSettings: game.ready ? "'FILL' 1" : "'FILL' 0" }}>
                  {game.visualIcon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative bodhi leaf */}
      <div className="flex justify-center pt-8 opacity-5">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0C50 0 90 40 90 65C90 85 72 100 50 100C28 100 10 85 10 65C10 40 50 0 50 0Z" />
        </svg>
      </div>
    </div>
  );
}
