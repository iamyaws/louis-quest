import React, { useState } from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { Pearl, Hourglass } from './CurrencyIcons';
import BelohnungRedeemModal from './BelohnungRedeemModal';
import FunkelzeitParentConfirm from './FunkelzeitParentConfirm';
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
  // Funkelzeit parent-confirm state — the chosen reward waiting for parent approval
  const [funkelzeitConfirm, setFunkelzeitConfirm] = useState(null);
  // Cap-reached banner (with override link) — only in 'strikt' mode
  const [capReached, setCapReached] = useState(null);

  // ── Funkelzeit mode (parental) ──
  const funkelzeitMode = state?.familyConfig?.funkelzeitMode || 'entspannt';
  const dailyCapMin = state?.familyConfig?.funkelzeitDailyCapMin ?? 30;
  const usedToday = state?.funkelzeitMinutesToday || 0;

  const familyRewards = DEFAULT_BELOHNUNGEN.filter(b => b.active && (b.currency || 'hp') === 'hp');
  // Screen-time rewards are hidden entirely when mode === 'none'
  const screenRewards = funkelzeitMode === 'none'
    ? []
    : DEFAULT_BELOHNUNGEN.filter(b => b.active && b.currency === 'eggs');

  /**
   * Central Funkelzeit-redeem entry: runs the mode-specific gate before
   * committing currency + starting the timer.
   *
   * - entspannt: start immediately (current behavior)
   * - normal: open parent-confirm overlay, no cap
   * - strikt: check cap; if over, show cap-reached with override; else parent-confirm
   * - none: screen rewards are hidden, so this path never fires
   */
  const handleScreenRewardTap = (reward) => {
    if (!reward || timerActive) return;
    if (screenMin < reward.cost) return;

    if (funkelzeitMode === 'entspannt') {
      commitFunkelzeitStart(reward);
      return;
    }

    if (funkelzeitMode === 'strikt') {
      if (usedToday + reward.minutes > dailyCapMin) {
        setCapReached(reward);
        return;
      }
    }
    // normal + strikt (under cap) share the parent-confirm flow
    setFunkelzeitConfirm(reward);
  };

  const commitFunkelzeitStart = (reward) => {
    actions.redeemReward('eggs', reward.cost);
    actions.addFunkelzeitUsage(reward.minutes);
    onStartTimer?.(reward);
    setFunkelzeitConfirm(null);
    setCapReached(null);
  };

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

      {/* ── Dual Balance Cards — painterly parchment + sage palette.
             Design refinement (Ronki Laden Polish.html): job-labels under
             each currency so the two economies read clearly without a
             separate legend. "HP für Dinge, Funkelzeit für Bildschirm." ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* HP Balance — gilded parchment */}
        <div className="p-5 rounded-2xl relative overflow-hidden"
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
          <div className="relative flex items-center gap-2 mb-1">
            <Pearl size={24} />
            <p className="font-label font-bold uppercase tracking-widest text-[11px]" style={{ color: '#7a4a05' }}>{t('hub.boss.detail.heroPoints')}</p>
          </div>
          <div className="relative flex items-baseline gap-1">
            <span className="text-3xl font-headline font-bold" style={{ color: '#3b2802' }}>{hp}</span>
            <span className="text-sm font-label font-bold" style={{ color: '#7a4a05' }}>HP</span>
          </div>
          <p className="relative font-body mt-2 leading-snug" style={{ fontSize: 11, color: '#7a4a05', opacity: 0.85 }}>
            Für Belohnungen aus dem Leben
          </p>
          <div className="absolute -bottom-4 -right-4 opacity-15">
            <Pearl size={64} />
          </div>
        </div>

        {/* Screen Minutes Balance — painted sage/teal */}
        <div className="p-5 rounded-2xl relative overflow-hidden"
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
          <div className="relative flex items-center gap-2 mb-1">
            <Hourglass size={24} dark />
            <p className="font-label font-bold uppercase tracking-widest text-[11px]" style={{ color: '#00513b' }}>{t('shop.screenMinutes')}</p>
          </div>
          <div className="relative flex items-baseline gap-1">
            <span className="text-3xl font-headline font-bold" style={{ color: '#00291d' }}>{screenMin}</span>
            <span className="text-sm font-label font-bold" style={{ color: '#00513b' }}>MIN</span>
          </div>
          <p className="relative font-body mt-2 leading-snug" style={{ fontSize: 11, color: '#00513b', opacity: 0.85 }}>
            Für Bildschirm-Zeit
          </p>
          <div className="absolute -bottom-4 -right-4 opacity-15">
            <Hourglass size={64} dark />
          </div>
        </div>
      </div>

      {/* Mini-Spiele moved into the Digitale Zeit section below — see
           design note: it's screen content, not a third economy. */}

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
                  <div className="pt-3" style={{ borderTop: '1px solid rgba(161,98,7,0.12)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Pearl size={16} />
                        <span className="text-on-surface font-bold font-label">{reward.cost} HP</span>
                      </div>
                      {canAfford ? (
                        <button
                          className="font-label font-bold py-2 px-6 rounded-full text-sm transition-all active:scale-95"
                          style={{ background: '#fcd34d', color: '#725b00' }}
                          onClick={() => setRedeemTarget({ ...reward, name: t('bel.' + reward.id) })}
                        >
                          {t('shop.redeem')}
                        </button>
                      ) : (
                        <span className="font-label font-bold text-xs whitespace-nowrap" style={{ color: '#b45309' }}>
                          Noch <b style={{ color: '#92400e' }}>{reward.cost - hp}</b> HP
                        </span>
                      )}
                    </div>
                    {/* Positive-framed progress toward unlocking — "fast geschafft"
                         beats "zu wenig" for a 7-year-old. Design-ref .reward-bar. */}
                    {!canAfford && (
                      <div className="mt-2.5 h-1.5 rounded-full overflow-hidden"
                           style={{ background: 'rgba(161,98,7,0.12)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{
                               width: `${Math.min(100, (hp / reward.cost) * 100)}%`,
                               background: 'linear-gradient(90deg, #fcd34d, #f59e0b)',
                               boxShadow: '0 0 6px rgba(252,211,77,0.5)',
                             }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mode 'none' notice — screen-time rewards disabled ── */}
      {funkelzeitMode === 'none' && (
        <div className="mb-8 rounded-2xl p-5"
             style={{
               background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
               border: '1.5px solid rgba(124,58,237,0.2)',
             }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(124,58,237,0.12)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#7c3aed', fontVariationSettings: "'FILL' 1" }}>nature</span>
            </div>
            <div className="flex-1">
              <h4 className="font-label font-bold text-base text-on-surface">Keine Bildschirmzeit als Belohnung.</h4>
              <p className="font-body text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Heute zählen andere Dinge mehr.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Digital Time (Screen minutes currency) ──
             Mini-Spiele now sits at the top of this section (design refactor:
             it's screen-content, belongs with "Digitale Zeit" not between
             currencies and rewards). ── */}
      {screenRewards.length > 0 && (
        <div className="mb-8">
          <h3 className="font-label font-bold text-sm uppercase tracking-widest text-on-surface px-2 mb-4">
            {t('shop.digitalTime')}
          </h3>

          {/* Mini-Spiele gate — gated by routine completion (useGameAccess).
               Sits above the screen-reward list as the first piece of
               screen-content Louis can reach. */}
          <button onClick={() => gamesUnlocked ? onNavigate?.('games') : null}
            className={`w-full rounded-2xl p-5 mb-4 flex items-center gap-4 transition-all text-left ${gamesUnlocked ? 'active:scale-[0.98]' : ''}`}
            style={{
              background: gamesUnlocked
                ? 'linear-gradient(160deg, #ede9fe 0%, #c4b5fd 50%, #7c3aed 100%)'
                : 'rgba(0,0,0,0.04)',
              filter: gamesUnlocked ? 'none' : 'grayscale(0.5) brightness(0.85)',
              opacity: gamesUnlocked ? 1 : 0.55,
            }}>
            <span className="text-4xl select-none shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>🎮</span>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-lg" style={{ color: gamesUnlocked ? '#2e1065' : '#6b7280' }}>{t('shop.miniGames')}</h4>
              <p className="text-sm font-body mt-0.5" style={{ color: gamesUnlocked ? '#2e106599' : '#9ca3af' }}>
                {gamesUnlocked ? t('shop.miniGames.subtitle') : 'Erst deine Aufgaben! 💪'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                 style={{ background: '#ffffff', border: '2.5px solid rgba(46,16,101,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <span className="material-symbols-outlined text-xl" style={{ color: '#2e1065', fontVariationSettings: "'FILL' 1" }}>
                {gamesUnlocked ? 'play_arrow' : 'lock'}
              </span>
            </div>
          </button>

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
                  <div className="pt-3" style={{ borderTop: '1px solid rgba(0,150,150,0.12)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Hourglass size={16} />
                        <span className="font-bold font-label" style={{ color: '#00827e' }}>{reward.cost} Min.</span>
                      </div>
                      {canAfford && !blocked ? (
                        <button
                          className="font-label font-bold py-2 px-6 rounded-full text-sm transition-all active:scale-95"
                          style={{ background: '#00CEC9', color: 'white' }}
                          onClick={() => handleScreenRewardTap(reward)}
                        >
                          {t('shop.redeem')}
                        </button>
                      ) : blocked ? (
                        <span className="font-label font-bold text-xs whitespace-nowrap" style={{ color: '#0e7490' }}>
                          {t('shop.timerRunning')}
                        </span>
                      ) : (
                        <span className="font-label font-bold text-xs whitespace-nowrap" style={{ color: '#0e7490' }}>
                          Noch <b style={{ color: '#155e75' }}>{reward.cost - screenMin}</b> Min
                        </span>
                      )}
                    </div>
                    {/* Positive-framed progress toward the next screen reward */}
                    {!canAfford && !blocked && (
                      <div className="mt-2.5 h-1.5 rounded-full overflow-hidden"
                           style={{ background: 'rgba(0,150,150,0.12)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{
                               width: `${Math.min(100, (screenMin / reward.cost) * 100)}%`,
                               background: 'linear-gradient(90deg, #5eead4, #0d9488)',
                               boxShadow: '0 0 6px rgba(14,165,152,0.45)',
                             }} />
                      </div>
                    )}
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

      {/* ── Funkelzeit parent-confirm overlay (modes: normal + strikt under cap) ── */}
      {funkelzeitConfirm && (
        <FunkelzeitParentConfirm
          reward={{ ...funkelzeitConfirm, name: t('bel.' + funkelzeitConfirm.id) }}
          onApprove={() => commitFunkelzeitStart(funkelzeitConfirm)}
          onDismiss={() => setFunkelzeitConfirm(null)}
        />
      )}

      {/* ── Funkelzeit daily-cap reached (strikt mode) with parent override ── */}
      {capReached && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setCapReached(null); }}
          className="fixed inset-0 z-[650] flex items-center justify-center px-5 overflow-y-auto py-8"
          style={{ background: 'rgba(10,20,22,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden relative"
            style={{
              background: '#fff8f1',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            <div className="px-6 pt-10 pb-8 flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full mb-5 flex items-center justify-center"
                style={{ background: 'rgba(186,26,26,0.08)', border: '1px solid rgba(186,26,26,0.15)' }}
              >
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ color: '#b45309', fontVariationSettings: "'FILL' 1" }}
                >
                  bedtime
                </span>
              </div>
              <h2
                className="font-headline font-bold text-on-surface leading-tight"
                style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1.5rem' }}
              >
                Heute ist Schluss mit Funkelzeit.
              </h2>
              <p
                className="font-body text-on-surface-variant mt-3 leading-relaxed"
                style={{ fontSize: '1rem' }}
              >
                Morgen wieder!
              </p>
              <p
                className="font-label text-xs text-on-surface-variant mt-4 uppercase tracking-widest"
              >
                Heute genutzt: {usedToday} / {dailyCapMin} Min.
              </p>

              <button
                onClick={() => setCapReached(null)}
                className="mt-8 w-full py-4 rounded-full font-label font-bold text-base min-h-[48px] active:scale-95 transition-transform"
                style={{ background: '#124346', color: 'white' }}
              >
                Okay
              </button>

              {/* Parent override link — small, ghost-style, trust-based */}
              <button
                onClick={() => {
                  const reward = capReached;
                  setCapReached(null);
                  setFunkelzeitConfirm(reward);
                }}
                className="mt-3 font-label text-xs underline active:opacity-70"
                style={{ color: '#9ca3af' }}
              >
                Eltern-Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
