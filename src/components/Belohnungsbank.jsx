import React, { useState } from 'react';
import { DEFAULT_BELOHNUNGEN } from '../constants';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { Pearl, Hourglass } from './CurrencyIcons';
import BelohnungRedeemModal from './BelohnungRedeemModal';
import FunkelzeitParentConfirm from './FunkelzeitParentConfirm';
import TopBar from './TopBar';
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
    <div className="pb-32" style={{ backgroundColor: '#fff8f2', minHeight: '100dvh' }}>

      {/* TopBar sits ABOVE the hero card on the cream page background
           (Polish .bb-hero spec: hero is a floating 26px-rounded gold
           card inside outer margin, TopBar is *not* inside it). Audit
           call-out fixed the old dark-teal bleed. */}
      <TopBar onNavigate={onNavigate} view="shop" onOpenParental={onOpenParental} />

      {/* ── Gilded hero card — cream→amber→gold radial gradient matching
             Polish .bb-hero. Floats in outer 20px margin with 26px rounded
             corners and a warm gold border. Replaces the prior dark-teal
             bleed. ── */}
      <section style={{ padding: '6px 20px 0' }}>
        <div className="relative overflow-hidden"
             style={{
               background: `radial-gradient(circle at 15% 15%, rgba(252,211,77,0.35), transparent 55%), linear-gradient(135deg, #fef3c7 0%, #fde68a 55%, #fcd34d 100%)`,
               border: '1px solid rgba(180,83,9,0.25)',
               borderRadius: 26,
               boxShadow: '0 16px 36px -14px rgba(180,83,9,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
             }}>
          <div className="flex items-end" style={{ padding: '20px 22px' }}>
            <div className="flex-1 z-10 pb-1">
              <p className="font-label font-extrabold uppercase"
                 style={{ fontSize: 10, letterSpacing: '0.28em', color: '#b45309', marginBottom: 6 }}>
                {t('shop.header.title') /* eyebrow doubles as section tag */}
              </p>
              <h1 className="font-headline"
                  style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 500, fontSize: 26, letterSpacing: '-0.015em', color: '#124346', lineHeight: 1.1 }}>
                {t('shop.header.title')}
              </h1>
              <p className="font-body" style={{ fontSize: 13, color: 'rgba(18,67,70,0.65)', marginTop: 4, lineHeight: 1.35 }}>
                {t('shop.header.subtitle')}
              </p>
            </div>
            <img src={import.meta.env.BASE_URL + 'art/hero-shop.webp'}
                 alt=""
                 className="w-24 h-auto -mb-3 -mr-1"
                 style={{ filter: 'drop-shadow(0 6px 10px rgba(180,83,9,0.35))' }} />
          </div>
        </div>
      </section>
      <div style={{ paddingLeft: 24, paddingRight: 24, marginTop: 20 }}>

      {/* ── Dual Balance Cards — quiet cream + mint per Polish .hp-card /
             .sp-card spec. Old gilded gold + painted sage were too loud
             (audit call-out) and fought with the hero card for attention.
             No texture overlays, no giant decorative watermarks, value
             weight 500 (not bold). ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* HP Balance — quiet cream */}
        <div className="p-5 rounded-2xl relative overflow-hidden"
             style={{
               background: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
               border: '1px solid rgba(180,83,9,0.2)',
               boxShadow: '0 6px 18px -10px rgba(180,83,9,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
             }}>
          <div className="flex items-center gap-2 mb-2">
            <Pearl size={22} />
            <p className="font-label font-extrabold uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#b45309' }}>{t('hub.boss.detail.heroPoints')}</p>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline" style={{ fontWeight: 500, fontSize: 28, color: '#124346', letterSpacing: '-0.015em' }}>{hp}</span>
            <span className="font-label font-bold" style={{ fontSize: 12, color: '#b45309' }}>HP</span>
          </div>
          <p className="font-body mt-2 leading-snug" style={{ fontSize: 11, color: 'rgba(180,83,9,0.8)' }}>
            Für Belohnungen aus dem Leben
          </p>
        </div>

        {/* Screen Minutes Balance — quiet mint */}
        <div className="p-5 rounded-2xl relative overflow-hidden"
             style={{
               background: 'linear-gradient(160deg, #f0fdfa 0%, #ccfbf1 100%)',
               border: '1px solid rgba(13,148,136,0.22)',
               boxShadow: '0 6px 18px -10px rgba(13,148,136,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
             }}>
          <div className="flex items-center gap-2 mb-2">
            <Hourglass size={22} dark />
            <p className="font-label font-extrabold uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#0d9488' }}>{t('shop.screenMinutes')}</p>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline" style={{ fontWeight: 500, fontSize: 28, color: '#124346', letterSpacing: '-0.015em' }}>{screenMin}</span>
            <span className="font-label font-bold" style={{ fontSize: 12, color: '#0d9488' }}>MIN</span>
          </div>
          <p className="font-body mt-2 leading-snug" style={{ fontSize: 11, color: 'rgba(13,148,136,0.85)' }}>
            Für Bildschirm-Zeit
          </p>
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
                          className="font-label font-extrabold uppercase rounded-full transition-all active:scale-95"
                          style={{
                            background: '#124346',
                            color: '#fef3c7',
                            padding: '9px 14px',
                            fontSize: 11,
                            letterSpacing: '0.12em',
                            boxShadow: '0 4px 10px -3px rgba(18,67,70,0.35)',
                          }}
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

          {/* Mini-Spiele gate — Polish .mini-gate spec: teal family, not
               violet. Dashed border when locked, solid teal when unlocked.
               Icon tile 48px gradient teal. */}
          <button onClick={() => gamesUnlocked ? onNavigate?.('games') : null}
            className={`w-full rounded-2xl p-4 mb-4 flex items-center gap-4 transition-all text-left ${gamesUnlocked ? 'active:scale-[0.98]' : ''}`}
            style={{
              background: gamesUnlocked
                ? 'linear-gradient(160deg, #f0fdfa 0%, rgba(94,234,212,0.35) 100%)'
                : 'linear-gradient(160deg, #f0fdfa 0%, rgba(94,234,212,0.15) 100%)',
              border: gamesUnlocked
                ? '1px solid rgba(13,148,136,0.35)'
                : '1.5px dashed rgba(13,148,136,0.35)',
              opacity: gamesUnlocked ? 1 : 0.85,
            }}>
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                 style={{
                   background: 'linear-gradient(160deg, #5eead4, #0d9488)',
                   boxShadow: '0 4px 10px -3px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.5)',
                 }}>
              <span className="material-symbols-outlined text-xl text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                {gamesUnlocked ? 'sports_esports' : 'lock'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-headline font-bold text-base leading-tight" style={{ color: '#124346' }}>
                {t('shop.miniGames')}
              </h4>
              <p className="font-body mt-0.5" style={{ fontSize: 12, color: 'rgba(13,148,136,0.85)' }}>
                {gamesUnlocked ? t('shop.miniGames.subtitle') : 'Erst deine Aufgaben! 💪'}
              </p>
            </div>
            <span className="material-symbols-outlined shrink-0" style={{ color: '#0d9488', fontSize: 18 }}>chevron_right</span>
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
                          className="font-label font-extrabold uppercase rounded-full transition-all active:scale-95"
                          style={{
                            background: '#0f766e',
                            color: '#ccfbf1',
                            padding: '9px 14px',
                            fontSize: 11,
                            letterSpacing: '0.12em',
                            boxShadow: '0 4px 10px -3px rgba(13,148,136,0.35)',
                          }}
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

      {/* Bottom parent-lock removed — the TopBar (top-right .parent-btn)
           is the single entry point per Polish spec. Audit call-out #12:
           duplicate bottom button was redundant. */}

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
    </div>
  );
}
