import React, { useState } from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { Pearl, Hourglass } from './CurrencyIcons';
import BelohnungRedeemModal from './BelohnungRedeemModal';
import { useGameAccess } from '../hooks/useGameAccess';

const ICON_MAP = {
  '🃏': 'playing_cards', '🎧': 'headphones', '🎮': 'sports_esports',
  '📺': 'tv', '🎬': 'movie', '🍬': 'icecream', '🍕': 'local_pizza',
  '🎢': 'attractions', '💪': 'fitness_center',
};

export default function Belohnungsbank({ onNavigate, onStartTimer, timerActive, onOpenParental }) {
  const { t } = useTranslation();
  const { state, actions } = useTask();
  const { unlocked: gamesUnlocked, reason: gateReason } = useGameAccess();
  const hp = state?.hp || 0;
  const screenMin = state?.drachenEier || 0; // Screen minutes (repurposed from eggs)

  const [redeemTarget, setRedeemTarget] = useState(null);

  const familyRewards = DEFAULT_BELOHNUNGEN.filter(b => b.active && (b.currency || 'hp') === 'hp');
  const screenRewards = DEFAULT_BELOHNUNGEN.filter(b => b.active && b.currency === 'eggs');

  return (
    <div className="px-6 pb-32">

      {/* ── Header with hero illustration ── */}
      <section className="mb-6 -mx-6 -mt-6">
        <div className="relative rounded-b-3xl overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #0c3236, #124346)' }}>
          <div className="flex items-end px-6 pt-4 pb-5">
            {/* Text */}
            <div className="flex-1 z-10 pb-2">
              <h1 className="text-3xl font-bold font-headline text-white mb-1"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {t('shop.header.title')}
              </h1>
              <p className="text-white/60 font-body text-sm leading-relaxed">
                {t('shop.header.subtitle')}
              </p>
            </div>
            {/* Hero with coins illustration */}
            <img src={import.meta.env.BASE_URL + 'art/hero-shop.webp'}
                 alt=""
                 className="w-32 h-auto -mb-5 -mr-2 drop-shadow-2xl"
                 style={{ filter: 'brightness(1.1)' }} />
          </div>
          {/* Coin glow */}
          <div className="absolute bottom-0 right-12 w-24 h-16 rounded-full blur-2xl opacity-35 pointer-events-none"
               style={{ background: '#fcd34d' }} />
        </div>
      </section>

      {/* ── Dual Balance Cards — painterly parchment + sage palette ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* HP Balance — gilded parchment */}
        <div className="p-6 rounded-2xl relative overflow-hidden"
             style={{
               background: 'linear-gradient(140deg, #fef3c7 0%, #fcd34d 55%, #eab308 100%)',
               border: '1.5px solid rgba(161, 98, 7, 0.25)',
               boxShadow: '0 10px 24px -10px rgba(161,98,7,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
             }}>
          {/* Painted gold-dust texture overlay for depth */}
          <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
               style={{
                 backgroundImage: `url(${import.meta.env.BASE_URL}art/bg-gold-dust.webp)`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
               }} />
          <div className="relative flex items-center gap-2 mb-2">
            <Pearl size={20} />
            <p className="font-label font-bold uppercase tracking-widest text-xs" style={{ color: '#7a4a05' }}>{t('hub.boss.detail.heroPoints')}</p>
          </div>
          <div className="relative flex items-baseline gap-1">
            <span className="text-4xl font-headline font-bold" style={{ color: '#3b2802' }}>{hp}</span>
            <span className="text-sm font-label font-bold" style={{ color: '#7a4a05' }}>HP</span>
          </div>
          <div className="absolute -bottom-3 -right-3 opacity-20">
            <Pearl size={64} />
          </div>
        </div>

        {/* Screen Minutes Balance — painted sage/teal */}
        <div className="p-6 rounded-2xl relative overflow-hidden"
             style={{
               background: 'linear-gradient(140deg, #d1eae2 0%, #86d7b6 55%, #4ca88c 100%)',
               border: '1.5px solid rgba(0, 81, 59, 0.25)',
               boxShadow: '0 10px 24px -10px rgba(0,81,59,0.35), inset 0 1px 0 rgba(255,255,255,0.5)',
             }}>
          {/* Painted teal-brush texture overlay */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
               style={{
                 backgroundImage: `url(${import.meta.env.BASE_URL}art/bg-teal-soft.webp)`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
               }} />
          <div className="relative flex items-center gap-2 mb-2">
            <Hourglass size={20} dark />
            <p className="font-label font-bold uppercase tracking-widest text-xs" style={{ color: '#00513b' }}>{t('shop.screenMinutes')}</p>
          </div>
          <div className="relative flex items-baseline gap-1">
            <span className="text-4xl font-headline font-bold" style={{ color: '#00291d' }}>{screenMin}</span>
            <span className="text-sm font-label font-bold" style={{ color: '#00513b' }}>MIN</span>
          </div>
          <div className="absolute -bottom-3 -right-3 opacity-20">
            <Hourglass size={64} dark />
          </div>
        </div>
      </div>

      {/* ── Mini-Spiele Entry — game card style, gated by routine completion ── */}
      <button onClick={() => gamesUnlocked ? onNavigate?.('games') : null}
        className={`w-full rounded-2xl p-5 mb-8 flex items-center gap-4 transition-all text-left ${gamesUnlocked ? 'active:scale-[0.98]' : ''}`}
        style={{
          background: gamesUnlocked
            ? 'linear-gradient(160deg, #ecfdf5 0%, #6ee7b7 50%, #059669 100%)'
            : 'rgba(0,0,0,0.04)',
          filter: gamesUnlocked ? 'none' : 'grayscale(0.5) brightness(0.85)',
          opacity: gamesUnlocked ? 1 : 0.55,
        }}>
        <span className="text-4xl select-none shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>🎮</span>
        <div className="flex-1">
          <h4 className="font-headline font-bold text-lg" style={{ color: gamesUnlocked ? '#064e3b' : '#6b7280' }}>{t('shop.miniGames')}</h4>
          <p className="text-sm font-body mt-0.5" style={{ color: gamesUnlocked ? '#06553699' : '#9ca3af' }}>
            {gamesUnlocked ? t('shop.miniGames.subtitle') : 'Erst deine Aufgaben! 💪'}
          </p>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
             style={{ background: '#ffffff', border: '2.5px solid rgba(6,78,59,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <span className="material-symbols-outlined text-xl" style={{ color: '#064e3b', fontVariationSettings: "'FILL' 1" }}>
            {gamesUnlocked ? 'play_arrow' : 'lock'}
          </span>
        </div>
      </button>

      {/* ── Family Adventures (HP currency) ── */}
      {familyRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface px-2 mb-4">
            {t('shop.familyAdventures')}
          </h3>
          <div className="flex flex-col gap-4">
            {familyRewards.map(reward => {
              const canAfford = hp >= reward.cost;
              const matIcon = ICON_MAP[reward.emoji] || 'redeem';
              return (
                <div key={reward.id}
                  className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1.5px solid rgba(161,98,7,0.2)',
                    boxShadow: '0 4px 16px rgba(161,98,7,0.1)',
                  }}>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(252,211,77,0.2)' }}>
                      <span className="material-symbols-outlined text-2xl" style={{ color: '#b45309', fontVariationSettings: "'FILL' 1" }}>{matIcon}</span>
                    </div>
                    <div className="flex-1 flex items-center">
                      <h4 className="font-label font-bold text-lg text-on-surface leading-tight">{t('bel.' + reward.id)}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(161,98,7,0.12)' }}>
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
                      onClick={() => { if (canAfford) setRedeemTarget({ ...reward, name: t('bel.' + reward.id) }); }}
                    >
                      {canAfford ? t('shop.redeem') : t('shop.tooFew')}
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
            {t('shop.digitalTime')}
          </h3>
          <div className="flex flex-col gap-4">
            {screenRewards.map(reward => {
              const canAfford = screenMin >= reward.cost;
              const matIcon = ICON_MAP[reward.emoji] || 'devices';
              const blocked = timerActive; // can't start a second timer
              return (
                <div key={reward.id}
                  className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #ecfeff 0%, #ccfbf1 100%)',
                    border: '1.5px solid rgba(0,150,150,0.2)',
                    boxShadow: '0 4px 16px rgba(0,150,150,0.1)',
                  }}>
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(0,206,201,0.15)' }}>
                      <span className="material-symbols-outlined text-2xl" style={{ color: '#00827e', fontVariationSettings: "'FILL' 1" }}>{matIcon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-label font-bold text-lg text-on-surface leading-tight">{t('bel.' + reward.id)}</h4>
                      {/* Prominent digital time display */}
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-headline font-bold" style={{ fontSize: '1.75rem', color: '#00827e', lineHeight: 1 }}>{reward.cost}</span>
                        <span className="font-headline font-bold" style={{ fontSize: '1rem', color: '#00827e' }}>Min.</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(0,150,150,0.12)' }}>
                    <div className="flex items-center gap-1.5">
                      <Hourglass size={16} />
                      <span className="font-bold font-label" style={{ color: '#00827e' }}>{reward.cost} Min.</span>
                    </div>
                    <button
                      className={`font-label font-bold py-2 px-6 rounded-full text-sm transition-all active:scale-95 ${
                        canAfford && !blocked ? '' : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{ background: canAfford && !blocked ? '#00CEC9' : '#e8e1da', color: canAfford && !blocked ? 'white' : '#7b7486' }}
                      disabled={!canAfford || blocked}
                      onClick={() => {
                        if (canAfford && !blocked) {
                          actions.redeemReward('eggs', reward.cost);
                          onStartTimer?.(reward);
                        }
                      }}
                    >
                      {blocked ? t('shop.timerRunning') : canAfford ? t('shop.redeem') : t('shop.tooFew')}
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
            <h5 className="font-label font-bold text-primary text-lg">{t('shop.howItWorks')}</h5>
            <p className="text-sm font-body text-on-surface-variant mt-1 leading-relaxed">
              {t('shop.howItWorksBody')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Parental access (boring on purpose) ── */}
      <div className="flex flex-col items-center mt-10 mb-2 gap-1">
        <button
          onClick={onOpenParental}
          className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-all"
          style={{ background: 'rgba(156,163,175,0.1)', border: '1.5px solid rgba(156,163,175,0.2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#9ca3af' }}>lock</span>
        </button>
        <span className="font-label text-xs text-[#9ca3af] tracking-wide" style={{ opacity: 0.5 }}>{t('shop.admin')}</span>
      </div>

      {/* ── HP Reward approval modal ── */}
      {redeemTarget && (
        <BelohnungRedeemModal
          reward={redeemTarget}
          onApprove={() => {
            actions.redeemReward('hp', redeemTarget.cost);
            setRedeemTarget(null);
          }}
          onDismiss={() => setRedeemTarget(null)}
        />
      )}
    </div>
  );
}
