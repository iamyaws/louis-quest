import React from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';
import { Pearl, Hourglass } from './CurrencyIcons';

const ICON_MAP = {
  '🃏': 'playing_cards', '🎧': 'headphones', '🎮': 'sports_esports',
  '📺': 'tv', '🎬': 'movie', '🍬': 'icecream', '🍕': 'local_pizza',
  '🎢': 'attractions', '💪': 'fitness_center',
};

export default function Belohnungsbank() {
  const { state } = useTask();
  const hp = state?.hp || 0;
  const screenMin = state?.drachenEier || 0; // Screen minutes (repurposed from eggs)

  const familyRewards = DEFAULT_BELOHNUNGEN.filter(b => b.active && (b.currency || 'hp') === 'hp');
  const screenRewards = DEFAULT_BELOHNUNGEN.filter(b => b.active && b.currency === 'eggs');

  return (
    <div className="px-6 pb-32">

      {/* ── Header ── */}
      <section className="mb-6">
        <h1 className="text-3xl font-bold font-headline text-on-surface mb-2">Belohnungsbank</h1>
        <p className="text-on-surface-variant font-body text-lg">Wandle deine Punkte in tolle Erlebnisse um!</p>
      </section>

      {/* ── Dual Balance Cards ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* HP Balance */}
        <div className="p-6 rounded-2xl relative overflow-hidden shadow-lg"
             style={{ background: 'linear-gradient(135deg, #5300b7, #6d28d9)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Pearl size={20} dark />
            <p className="font-label font-bold uppercase tracking-widest text-[10px] text-white/60">Heldenpunkte</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-headline font-bold text-white">{hp}</span>
            <span className="text-sm font-label font-bold text-white/80">HP</span>
          </div>
          <div className="absolute -bottom-3 -right-3 opacity-10">
            <Pearl size={64} dark />
          </div>
        </div>

        {/* Screen Minutes Balance */}
        <div className="p-6 rounded-2xl relative overflow-hidden shadow-lg"
             style={{ background: 'linear-gradient(135deg, #00b4d8, #00CEC9)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Hourglass size={20} dark />
            <p className="font-label font-bold uppercase tracking-widest text-[10px] text-white/70">Screen-Minuten</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-headline font-bold text-white">{screenMin}</span>
            <span className="text-sm font-label font-bold text-white/80">MIN</span>
          </div>
          <div className="absolute -bottom-3 -right-3 opacity-10">
            <Hourglass size={64} dark />
          </div>
        </div>
      </div>

      {/* ── Family Adventures (HP currency) ── */}
      {familyRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface px-2 mb-4">
            Familien-Abenteuer
          </h3>
          <div className="flex flex-col gap-4">
            {familyRewards.map(reward => {
              const canAfford = hp >= reward.cost;
              const matIcon = ICON_MAP[reward.emoji] || 'redeem';
              return (
                <div key={reward.id}
                  className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
                  style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(252,211,77,0.1)' }}>
                      <span className="material-symbols-outlined text-2xl" style={{ color: '#fcd34d', fontVariationSettings: "'FILL' 1" }}>{matIcon}</span>
                    </div>
                    <div>
                      <h4 className="font-label font-bold text-lg text-on-surface leading-tight">{reward.name}</h4>
                      <p className="text-sm text-on-surface-variant font-body mt-1">{reward.emoji} Belohnung für deine Heldentaten!</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f4ede5' }}>
                    <div className="flex items-center gap-1.5">
                      <Pearl size={16} />
                      <span className="text-on-surface font-bold font-label">{reward.cost} HP</span>
                    </div>
                    <button
                      className={`font-label font-bold py-2 px-6 rounded-full text-sm transition-all active:scale-95 ${
                        canAfford ? '' : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{ background: canAfford ? '#fcd34d' : '#e8e1da', color: canAfford ? '#725b00' : '#7b7486' }}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Einlösen' : 'Zu wenig'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Digital Time (Screen minutes currency) ── */}
      {screenRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface px-2 mb-4">
            Digitale Zeit
          </h3>
          <div className="flex flex-col gap-4">
            {screenRewards.map(reward => {
              const canAfford = screenMin >= reward.cost;
              const matIcon = ICON_MAP[reward.emoji] || 'devices';
              return (
                <div key={reward.id}
                  className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
                  style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(0,206,201,0.1)' }}>
                      <span className="material-symbols-outlined text-2xl" style={{ color: '#00CEC9', fontVariationSettings: "'FILL' 1" }}>{matIcon}</span>
                    </div>
                    <div>
                      <h4 className="font-label font-bold text-lg text-on-surface leading-tight">{reward.name}</h4>
                      <p className="text-sm text-on-surface-variant font-body mt-1">{reward.emoji} Screen-Zeit als Belohnung</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f4ede5' }}>
                    <div className="flex items-center gap-1.5">
                      <Hourglass size={16} />
                      <span className="text-on-surface font-bold font-label">{reward.cost} Min.</span>
                    </div>
                    <button
                      className={`font-label font-bold py-2 px-6 rounded-full text-sm text-white transition-all active:scale-95 ${
                        canAfford ? '' : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{ background: canAfford ? '#00CEC9' : '#e8e1da', color: canAfford ? 'white' : '#7b7486' }}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Einlösen' : 'Zu wenig'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Guide ── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'rgba(83,0,183,0.05)', border: '1px solid rgba(83,0,183,0.1)' }}>
        <div className="absolute -right-4 -bottom-4 opacity-5">
          <span className="material-symbols-outlined text-8xl text-primary">help</span>
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
               style={{ background: 'rgba(83,0,183,0.1)' }}>
            <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
          </div>
          <div>
            <h5 className="font-label font-bold text-primary text-lg">So funktioniert's</h5>
            <p className="text-sm font-body text-on-surface-variant mt-1 leading-relaxed">
              Wähle eine Belohnung und klicke auf <span className="font-bold text-primary">Einlösen</span>.
              Heldenpunkte bekommst du für erledigte Quests, Screen-Minuten werden automatisch gutgeschrieben!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
