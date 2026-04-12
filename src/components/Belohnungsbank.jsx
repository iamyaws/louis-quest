import React from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';

const ICON_MAP = {
  '🃏': 'playing_cards',
  '🎧': 'headphones',
  '🎮': 'sports_esports',
  '📺': 'tv',
  '🎬': 'movie',
  '🍬': 'candy',
  '🍕': 'local_pizza',
  '🎢': 'attractions',
  '💪': 'fitness_center',
};

export default function Belohnungsbank() {
  const { state } = useTask();
  const hp = state?.hp || 0;
  const eggs = state?.drachenEier || 0;

  return (
    <div className="px-6 pb-32">

      {/* ── Header ── */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-2">Belohnungsbank</h1>
        <p className="text-on-surface-variant font-body text-lg">
          Wandle deine Heldenpunkte in tolle Belohnungen um!
        </p>
      </section>

      {/* ── Balance Card ── */}
      <div className="relative overflow-hidden p-8 rounded-2xl flex justify-between items-center mb-8"
           style={{ background: 'linear-gradient(135deg, #5300b7, #6d28d9)' }}>
        <div className="relative z-10">
          <p className="font-label font-bold uppercase tracking-widest text-xs text-white/60 mb-1">
            Dein Guthaben
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-headline font-bold text-white">{hp}</span>
            <span className="text-xl font-label font-bold text-white/80">HP</span>
          </div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
          <span className="material-symbols-outlined text-white text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
        </div>
        {/* Decorative */}
        <div className="absolute -bottom-8 -right-8 opacity-10">
          <span className="material-symbols-outlined text-white" style={{ fontSize: '9rem' }}>filter_vintage</span>
        </div>
      </div>

      {/* ── Rewards List ── */}
      <div className="mb-8">
        <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface/40 px-2 mb-4">
          Verfügbare Belohnungen
        </h3>
        <div className="flex flex-col gap-4">
          {DEFAULT_BELOHNUNGEN.filter(b => b.active).map(reward => {
            const currency = reward.currency || 'hp';
            const balance = currency === 'hp' ? hp : eggs;
            const canAfford = balance >= reward.cost;
            const matIcon = ICON_MAP[reward.emoji] || 'redeem';

            return (
              <div key={reward.id}
                className={`rounded-2xl p-6 flex items-center justify-between group transition-all ${
                  canAfford ? '' : 'opacity-70'
                }`}
                style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 bg-[#f4ede5]">
                    <span className="material-symbols-outlined text-3xl text-primary">{matIcon}</span>
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-lg text-on-surface">{reward.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-secondary text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}>
                        {currency === 'eggs' ? 'egg' : 'stars'}
                      </span>
                      <span className="text-secondary font-bold font-label text-sm">
                        {reward.cost} {currency === 'eggs' ? 'Eier' : 'HP'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className={`font-label font-bold py-3 px-6 rounded-full transition-all active:scale-95 text-sm ${
                    canAfford
                      ? 'bg-[#fcd34d] text-[#725b00] hover:bg-[#fcd34d]/80'
                      : 'bg-[#e8e1da] text-[#7b7486] cursor-not-allowed'
                  }`}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Einlösen' : 'Zu wenig'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Info Card ── */}
      <div className="rounded-r-lg p-6 border-l-4 border-[#fcd34d]"
           style={{ background: 'rgba(252,211,77,0.1)' }}>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-secondary shrink-0">lightbulb</span>
          <div>
            <h5 className="font-label font-bold text-secondary">So funktioniert's</h5>
            <p className="text-sm font-body text-on-surface-variant mt-1 leading-relaxed">
              Wenn du eine Belohnung einlöst, zeige den Bestätigungscode deinen Eltern.
              Sie helfen dir dann dabei, deine Belohnung zu erhalten!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
