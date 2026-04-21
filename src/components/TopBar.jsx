import React from 'react';
import { useTask } from '../context/TaskContext';
import { Pearl } from './CurrencyIcons';
import AnimatedCount from './AnimatedCount';
import { useTranslation } from '../i18n/LanguageContext';
import PinnedRonki from './PinnedRonki';

// Global top bar — inline (not fixed) so it scrolls away with the content
// as Louis reads the page. Design reference (Ronki Aufgaben/Laden/Buch
// Polish v2): back-pill to Lager on the left, view-specific right slots.
//   · Journal: parental-lock only (kids-eyes-only, no HP)
//   · Shop:    parental-lock + HP pill (Belohnungsbank needs parent access)
//   · Others:  HP pill only (Aufgaben, Ronki)
// The HP pill is the tall "128 / HELDENPUNKTE" shape from the mockup, not
// a compact chip — it reads as a proud score, not a balance line.
// Hub renders its own hero pill; this component serves every other view.
export default function TopBar({ onNavigate, view, onOpenParental }) {
  const { state } = useTask();
  const { lang } = useTranslation();
  const hp = state?.hp || 0;
  // Parental lock lives on Laden (shop) only — it reads as "this is
  // our shared planning space" there (Funkelzeit approvals + reward
  // coordination) without breaking the trust contract elsewhere. The
  // Tagebuch is Louis's kids-eyes-only journal; a parent-gate pill on
  // that view actively undermines the privacy promise (Marc: "it feels
  // fishy"). Hub stays parent-free so Louis's home doesn't read as
  // watched. If parents ever need faster access we can add a hidden
  // gesture on the avatar pill later.
  const showLock = view === 'shop';
  const showHp = view !== 'journal';

  return (
    <header className="relative w-full max-w-lg mx-auto"
            style={{
              // Tighter than the design default — Marc flagged that the
              // previous 10/20/14 padding was eating too deep into the
              // fold. Transparent (no bg on the header itself); the pills
              // already have backdrop-blur cream bodies, so the bar reads
              // as "floating elements over the sky" rather than a band.
              // Restored to Polish .topbar spec: 10/20/14 padding. The
              // earlier 6/16/8 tightening looked cramped (audit call-out).
              // Safe-area-top still added to paddingTop for PWA edge-to-edge.
              padding: '10px 20px 14px',
              paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
            }}>
      <div className="flex justify-between items-center gap-3">
        {/* Left: back-pill to Lager. Design .back-pill spec exactly. */}
        <button onClick={() => onNavigate?.('hub')}
                className="inline-flex items-center gap-1.5 active:scale-95 transition-all rounded-full shrink-0"
                style={{
                  background: 'rgba(255,248,242,0.82)',
                  backdropFilter: 'blur(14px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                  padding: '8px 14px 8px 10px',
                  border: '1px solid rgba(18,67,70,0.12)',
                  boxShadow: '0 4px 14px -4px rgba(18,67,70,0.22)',
                  color: '#124346',
                }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back_ios_new</span>
          <b className="font-label font-bold uppercase"
             style={{ fontSize: 12, letterSpacing: '0.14em' }}>
            {lang === 'de' ? 'Lager' : 'Camp'}
          </b>
        </button>

        {/* Pinned Ronki — the companion follows Louis across tabs.
             Registers with QuestEaterContext on mount so that ticking a
             quest anywhere in the app makes THIS instance burp + show a
             mood bubble. Tap routes to the Ronki tab for the full
             Living Scene. Sized to match the Feature Previews spec
             (46px). Hidden on Ronki tab itself (redundant). */}
        {view !== 'care' && view !== 'ronki' && (
          <PinnedRonki
            size={46}
            onTap={() => onNavigate?.('ronki')}
            ariaLabel={lang === 'de' ? 'Zu Ronki' : 'Go to Ronki'}
          />
        )}

        {/* Right: view-specific slots (parent lock + HP).
             HP pill matches design .hp spec: 7/14/7/9 padding, 22px pearl,
             subtle cream→amber vertical gradient, primary-teal number with
             gold-ink label below. Not the gold-heavy trophy pill I had. */}
        <div className="flex items-center gap-2.5 shrink-0">
          {showLock && (
            <button onClick={onOpenParental}
                    aria-label={lang === 'de' ? 'Eltern-Bereich' : 'Parent area'}
                    className="flex items-center justify-center active:scale-95 transition-all"
                    style={{
                      // Matches design .parent-btn spec exactly (from uploaded
                      // Ronki Laden Polish.html). Quieter utility button:
                      // muted teal icon, cream pill, subtle shadow.
                      width: 32, height: 32, borderRadius: 10,
                      background: 'rgba(255,248,242,0.82)',
                      backdropFilter: 'blur(14px) saturate(160%)',
                      WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                      border: '1px solid rgba(18,67,70,0.12)',
                      color: 'rgba(18,67,70,0.42)',
                      boxShadow: '0 2px 8px -3px rgba(18,67,70,0.15)',
                    }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
            </button>
          )}
          {showHp && (
            <div data-sterne-pill className="flex items-center rounded-full"
                 style={{
                   background: 'linear-gradient(180deg, #fff8e1 0%, #fde68a 100%)',
                   border: '1px solid rgba(180,83,9,0.25)',
                   padding: '7px 14px 7px 9px',
                   gap: 8,
                   boxShadow: '0 4px 12px -4px rgba(252,211,77,0.6), inset 0 1px 0 rgba(255,255,255,0.7)',
                 }}>
              <Pearl size={22} />
              <div className="flex flex-col leading-none">
                <AnimatedCount
                  value={hp}
                  className="font-label font-extrabold"
                  style={{ color: '#124346', fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1 }}
                />
                <span className="font-label font-semibold uppercase"
                      style={{ fontSize: 10, letterSpacing: '0.16em', color: '#725b00', marginTop: 3, lineHeight: 1 }}>
                  {lang === 'de' ? 'Sterne' : 'Stars'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
