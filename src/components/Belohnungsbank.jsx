import React, { useState } from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { Pearl } from './CurrencyIcons';
import BelohnungRedeemModal from './BelohnungRedeemModal';
import TopBar from './TopBar';
import { biomeBackground } from '../utils/biomeBackgrounds';

/**
 * Belohnungsbank — kid's reward shop, HP-only.
 *
 * Cut #6 (25 Apr 2026 northstar): Funkelzeit + screen-time currency
 * deleted entirely. The shop now has exactly one currency (Sterne /
 * HP) backing real-life rewards the parent pre-loaded — no
 * screen-time bargaining, no parent-confirm overlay for screen
 * minutes, no daily cap modal.
 *
 * The component dropped from 574 → ~150 lines and lost three modals,
 * the Hourglass icon, the digital-time section, the mode-'none'
 * notice, the cap-reached overlay, and the Funkelzeit-confirm flow.
 */

const ICON_MAP = {
  '🃏': 'playing_cards', '🎧': 'headphones', '🎮': 'sports_esports',
  '📺': 'tv', '🎬': 'movie', '🍬': 'icecream', '🍕': 'local_pizza',
  '🎢': 'attractions', '💪': 'fitness_center',
};

export default function Belohnungsbank({ onNavigate, onOpenParental }) {
  const { t } = useTranslation();
  const { state, actions } = useTask();
  const hp = state?.hp || 0;
  const [redeemTarget, setRedeemTarget] = useState(null);

  const familyRewards = DEFAULT_BELOHNUNGEN.filter(
    b => b.active && (b.currency || 'hp') === 'hp',
  );

  const RewardRow = ({ reward, canAfford, balance, ctaLabel }) => {
    const matIcon = ICON_MAP[reward.emoji] || 'redeem';
    const remaining = Math.max(0, reward.cost - balance);
    const pct = Math.min(100, (balance / reward.cost) * 100);
    return (
      <div
        className="grid items-center transition-all"
        style={{
          gridTemplateColumns: '52px 1fr auto',
          gap: 12,
          padding: '12px 14px 12px 12px',
          borderRadius: 18,
          background: '#fff',
          border: `1px solid ${canAfford ? 'rgba(180,83,9,0.18)' : 'rgba(18,67,70,0.10)'}`,
          boxShadow: canAfford
            ? '0 4px 12px -6px rgba(180,83,9,0.2)'
            : '0 4px 12px -8px rgba(18,67,70,0.12)',
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(160deg, #fef9e7, #fde68a)',
            border: '1px solid rgba(180,83,9,0.3)',
          }}
        >
          <span className="material-symbols-outlined" style={{
            fontSize: 26, color: '#A83E2C',
            fontVariationSettings: "'FILL' 1, 'wght' 500",
          }}>
            {matIcon}
          </span>
        </div>

        <div className="min-w-0">
          <h4 className="font-body" style={{
            margin: 0, fontWeight: 600, fontSize: 14, lineHeight: 1.2, color: '#124346',
          }}>
            {t('bel.' + reward.id)}
          </h4>
          <div className="flex items-center gap-2.5 flex-wrap" style={{ marginTop: 4 }}>
            <span className="inline-flex items-center" style={{
              gap: 5, fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 800, fontSize: 12, letterSpacing: '0.02em', color: '#A83E2C',
            }}>
              <Pearl size={13} />
              {reward.cost}
            </span>
            {!canAfford && (
              <span style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 700, fontSize: 10, letterSpacing: '0.06em', color: '#6b655b',
              }}>
                Noch <b style={{ color: '#124346', fontWeight: 800 }}>{remaining}</b> Sterne
              </span>
            )}
          </div>
          <div className="overflow-hidden" style={{
            marginTop: 6, height: 3, borderRadius: 999, background: 'rgba(180,83,9,0.12)',
          }}>
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #fcd34d, #f59e0b)',
            }} />
          </div>
        </div>

        {canAfford ? (
          <button
            onClick={() => setRedeemTarget({ ...reward, name: t('bel.' + reward.id) })}
            className="font-label font-extrabold uppercase rounded-full transition-all active:scale-95 whitespace-nowrap"
            style={{
              background: '#124346', color: '#fef3c7',
              padding: '9px 14px', fontSize: 11, letterSpacing: '0.12em',
              boxShadow: '0 4px 10px -3px rgba(18,67,70,0.35)',
            }}
          >
            {ctaLabel}
          </button>
        ) : (
          <span className="font-label font-bold whitespace-nowrap" style={{
            fontSize: 11, letterSpacing: '0.08em',
            color: 'rgba(18,67,70,0.4)', padding: '9px 14px',
          }}>
            {''}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative pb-32" style={{ minHeight: '100dvh' }}>
      <div className="fixed inset-0 pointer-events-none"
           style={{
             zIndex: 0,
             background: biomeBackground('shop'),
             backgroundColor: '#fff8f2',
           }}
           aria-hidden="true" />
      <div className="relative" style={{ zIndex: 1 }}>
        <TopBar onNavigate={onNavigate} view="shop" onOpenParental={onOpenParental} />

        {/* Hero */}
        <section style={{ padding: '6px 20px 0' }}>
          <div className="relative overflow-hidden"
               style={{
                 background: `radial-gradient(circle at 15% 15%, rgba(94,234,212,0.28), transparent 55%), linear-gradient(135deg, #0f3236 0%, #164a48 50%, #0a2a2c 100%)`,
                 border: '1px solid rgba(94,234,212,0.2)',
                 borderRadius: 26,
                 boxShadow: '0 16px 36px -14px rgba(12,50,54,0.55), inset 0 1px 0 rgba(94,234,212,0.12)',
               }}>
            <div className="flex items-end" style={{ padding: '20px 22px' }}>
              <div className="flex-1 z-10 pb-1">
                <p className="font-label font-extrabold uppercase"
                   style={{ fontSize: 10, letterSpacing: '0.28em', color: '#fcd34d', marginBottom: 6 }}>
                  {t('shop.header.eyebrow')}
                </p>
                <h1 className="font-headline"
                    style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 26, letterSpacing: '-0.015em', color: '#fff', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                  {t('shop.header.title')}
                </h1>
                <p className="font-body" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 1.35 }}>
                  {t('shop.header.subtitle')}
                </p>
              </div>
              <div className="relative" style={{ width: 110, height: 110 }}>
                <img src={import.meta.env.BASE_URL + 'art/hero-shop.webp'}
                     alt=""
                     className="w-full h-auto -mb-3 -mr-1"
                     style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.45))' }} />
                <span aria-hidden="true" style={{ position: 'absolute', top: 6, right: 8, fontSize: 14, color: '#fcd34d', textShadow: '0 0 6px rgba(252,211,77,0.8)', animation: 'bbTwinkle 2.4s ease-in-out infinite' }}>✦</span>
                <span aria-hidden="true" style={{ position: 'absolute', top: 22, left: 4, fontSize: 10, color: '#fcd34d', textShadow: '0 0 6px rgba(252,211,77,0.8)', animation: 'bbTwinkle 2.4s ease-in-out infinite', animationDelay: '0.7s' }}>✦</span>
                <span aria-hidden="true" style={{ position: 'absolute', bottom: 16, right: 2, fontSize: 12, color: '#fcd34d', textShadow: '0 0 6px rgba(252,211,77,0.8)', animation: 'bbTwinkle 2.4s ease-in-out infinite', animationDelay: '1.3s' }}>✦</span>
              </div>
            </div>
          </div>
        </section>

        <style>{`
          @keyframes bbTwinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50%      { opacity: 1;   transform: scale(1.1); }
          }
        `}</style>

        <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* HP balance — single currency now */}
          <div
            className="relative overflow-hidden text-left"
            style={{
              padding: '14px 14px 12px',
              borderRadius: 18,
              background: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
              border: '1px solid rgba(180,83,9,0.2)',
              boxShadow: '0 6px 14px -8px rgba(180,83,9,0.2), inset 0 1px 0 rgba(255,255,255,0.7)',
            }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Pearl size={22} />
              <p className="font-label font-extrabold uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#A83E2C' }}>{t('hub.boss.detail.heroPoints')}</p>
            </div>
            <div className="flex items-baseline" style={{ gap: 4, marginTop: 2 }}>
              <span className="font-headline" style={{ fontWeight: 500, fontSize: 28, color: '#124346', letterSpacing: '-0.02em', lineHeight: 1 }}>{hp}</span>
              <span className="font-label font-bold" style={{ fontSize: 11, color: '#6b655b', letterSpacing: '0.1em' }}>STERNE</span>
            </div>
            <p className="font-body" style={{ fontSize: 10, lineHeight: 1.3, color: '#6b655b', opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
              Für Belohnungen aus dem Leben
            </p>
          </div>

          {/* Family adventures (HP only) */}
          {familyRewards.length > 0 && (
            <div className="flex flex-col" style={{ gap: 10 }}>
              <div className="flex items-center" style={{ gap: 10, padding: '0 2px' }}>
                <span style={{ width: 4, height: 18, borderRadius: 2, background: '#A83E2C' }} />
                <h3 className="font-headline" style={{ margin: 0, fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em', color: '#124346', flex: 1 }}>
                  {t('shop.familyAdventures')}
                </h3>
              </div>
              <div className="flex flex-col" style={{ gap: 8 }}>
                {familyRewards.map(reward => (
                  <RewardRow
                    key={reward.id}
                    reward={reward}
                    canAfford={hp >= reward.cost}
                    balance={hp}
                    ctaLabel={t('shop.redeem')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* How-it-works guide */}
          <div className="grid items-start"
               style={{
                 gridTemplateColumns: '32px 1fr',
                 gap: 12,
                 padding: '14px 16px',
                 borderRadius: 18,
                 background: 'linear-gradient(160deg, rgba(252,211,77,0.12) 0%, rgba(245,158,11,0.06) 100%)',
                 border: '1px solid rgba(180,83,9,0.14)',
               }}>
            <span className="material-symbols-outlined" style={{ color: '#A83E2C', fontSize: 24, fontVariationSettings: "'FILL' 1, 'wght' 500", marginTop: 2 }}>lightbulb</span>
            <div>
              <b className="font-label" style={{ display: 'block', fontWeight: 700, fontSize: 13, lineHeight: 1.2, letterSpacing: '0.04em', color: '#124346', marginBottom: 4 }}>
                {t('shop.howItWorks')}
              </b>
              <p className="font-body" style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: '#6b655b', fontWeight: 500 }}>
                {t('shop.howItWorksBody')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HP Reward approval modal */}
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
