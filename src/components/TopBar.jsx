import React from 'react';
import { useTask } from '../context/TaskContext';
import { Pearl } from './CurrencyIcons';
import { useTranslation } from '../i18n/LanguageContext';

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
  const showLock = view === 'journal' || view === 'shop';
  const showHp = view !== 'journal';

  return (
    <header className="relative w-full max-w-lg mx-auto px-6 pt-4 pb-3"
            style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
      <div className="flex justify-between items-center gap-3">
        {/* Left: back-pill to Lager (Hub). Inline, no fixed positioning. */}
        <button onClick={() => onNavigate?.('hub')}
                className="inline-flex items-center gap-1.5 active:scale-95 transition-all rounded-full shrink-0"
                style={{
                  background: 'rgba(255,248,242,0.85)',
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

        {/* Right: parental-lock button (outlined square style) + HP pill.
             Lock lives as its own button with a quieter outlined style so
             it reads as a utility, not a primary CTA. Mirrors the design's
             separate parent-btn.jsx treatment on Laden + Buch views. */}
        <div className="flex items-center gap-2.5 shrink-0">
          {showLock && (
            <button onClick={onOpenParental}
                    aria-label={lang === 'de' ? 'Eltern-Bereich' : 'Parent area'}
                    className="flex items-center justify-center rounded-xl active:scale-95 transition-all"
                    style={{
                      width: 36, height: 36,
                      background: 'rgba(255,248,242,0.7)',
                      border: '1px solid rgba(18,67,70,0.14)',
                      color: '#6b655b',
                    }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
            </button>
          )}
          {showHp && (
            <div className="flex items-center gap-2.5 rounded-full"
                 style={{
                   background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                   border: '1px solid rgba(180,83,9,0.25)',
                   padding: '6px 14px 6px 6px',
                   boxShadow: '0 4px 12px -4px rgba(180,83,9,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
                 }}>
              <Pearl size={28} />
              <div className="flex flex-col leading-none">
                <span className="font-headline font-extrabold"
                      style={{ color: '#3b2802', fontSize: 16 }}>
                  {hp}
                </span>
                <span className="font-label font-bold uppercase mt-0.5"
                      style={{ fontSize: 8, letterSpacing: '0.14em', color: '#7a4a05' }}>
                  {lang === 'de' ? 'Heldenpunkte' : 'Hero points'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
