import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';

const base = import.meta.env.BASE_URL;

// ══════════════════════════════════════════
// ParentOnboarding — Track A (parent-first setup)
//
// Runs when state.parentOnboardingDone !== true, BEFORE the kid's 7-step
// Onboarding.jsx. Gives the parent 5 screens to orient, set a PIN, and
// learn where the lock icons live — all before handing the phone over.
//
// On completion, patches state with:
//   { parentOnboardingDone: true, parentPin, parentPinIsDefault }
// where parentPin is either the chosen 4-digit string (and
// parentPinIsDefault = false) or null (and parentPinIsDefault = true if
// the parent chose "Später — 1234 bleibt aktiv").
//
// The 3 lock icons in Aufgaben/Laden/Buch stay — no universal gear icon.
// Screen 4 (Dashboard-Preview) teaches parents where to find them with a
// simple annotated phone-schematic (pure SVG, no screenshots).
//
// Visual language matches Onboarding.jsx:
//   · Fredoka display font
//   · Teal gradient bg (bg-teal-soft.webp)
//   · Warm cream cards + yellow CTA
//   · Same scroll-safe pattern (overflow-y-auto + min-h-full + my-auto)
// ══════════════════════════════════════════

const TOTAL_STEPS = 5;

export default function ParentOnboarding({ onComplete }) {
  const { t, lang, setLang } = useTranslation();
  const [step, setStep] = useState(0);
  // PIN state — 'idle' (at PIN screen, no input yet), 'entering'
  // (typing first PIN), 'confirming' (typing second PIN to verify),
  // 'done' (both match, stored in chosenPin).
  const [pinPhase, setPinPhase] = useState('idle'); // 'idle' | 'entering' | 'confirming'
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  // Final values passed to patchState on completion. null PIN means the
  // parent chose "Später" and 1234 stays active (parentPinIsDefault: true).
  const [chosenPin, setChosenPin] = useState(null);

  const ProgressBar = () => (
    <div className="w-full flex justify-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} className="h-2 rounded-full transition-all duration-500"
          style={{
            width: i === step ? 48 : 32,
            background: i === step ? '#fcd34d' : i < step ? '#124346' : 'rgba(18,67,70,0.15)',
          }} />
      ))}
    </div>
  );

  const LangPicker = () => (
    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full p-1.5"
         style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
      <button
        onClick={() => setLang('de')}
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all active:scale-90"
        style={{
          background: lang === 'de' ? 'rgba(255,255,255,0.9)' : 'transparent',
          boxShadow: lang === 'de' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
        aria-label="Deutsch"
      >
        🇩🇪
      </button>
      <button
        onClick={() => setLang('en')}
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all active:scale-90"
        style={{
          background: lang === 'en' ? 'rgba(255,255,255,0.9)' : 'transparent',
          boxShadow: lang === 'en' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
        aria-label="English"
      >
        🇬🇧
      </button>
    </div>
  );

  const PrimaryButton = ({ children, onClick, disabled }) => (
    <button onClick={onClick}
      disabled={disabled}
      className={`w-full py-5 px-8 rounded-full font-headline text-xl font-bold text-white flex items-center justify-center gap-3 active:scale-95 transition-all ${disabled ? 'opacity-50' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #124346, #2d5a5e)',
        boxShadow: disabled ? 'none' : '0 12px 30px rgba(18,67,70,0.25)',
      }}>
      {children}
    </button>
  );

  // Finalize — patch state + unmount. Used by the Fertig screen.
  const finish = () => {
    onComplete({
      parentOnboardingDone: true,
      parentPin: chosenPin,
      // If the parent chose "Später", PIN stays null and the default
      // 1234 remains active. If they set a custom PIN, flip the default
      // flag to false so the PinModal stops accepting 1234.
      parentPinIsDefault: chosenPin === null,
    });
  };

  // ══════════════════════════════════════════
  // Step 0: Willkommen
  // ══════════════════════════════════════════
  if (step === 0) {
    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="fixed top-5 right-5 z-20"
             style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <LangPicker />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-8 text-center py-8"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          <div className="my-auto flex flex-col items-center">
            {/* Ronki-Ei logo — same asset as the load screen */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 blur-3xl rounded-full scale-150" style={{ background: 'rgba(252,211,77,0.25)' }} />
              <img src={base + 'art/ronki-egg-logo.svg'} alt="Ronki"
                   className="relative z-10 w-32 h-auto mx-auto"
                   style={{ filter: 'drop-shadow(0 18px 32px rgba(0,0,0,0.18))' }} />
            </div>

            <div className="max-w-md space-y-4">
              <h1 className="font-display text-4xl font-bold text-white tracking-tight leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('parentOnboarding.welcome.title')}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed px-4">
                {t('parentOnboarding.welcome.body')}
              </p>
            </div>

            <div className="mt-10 w-full max-w-xs">
              <PrimaryButton onClick={() => setStep(1)}>
                {t('parentOnboarding.welcome.cta')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 1: Was ist Ronki — 3 cards
  // ══════════════════════════════════════════
  if (step === 1) {
    const cards = [
      { icon: 'wb_sunny', key: 'card1', color: '#f59e0b' },
      { icon: 'favorite', key: 'card2', color: '#ec4899' },
      { icon: 'shield_lock', key: 'card3', color: '#124346' },
    ];

    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-6 py-8"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          <div className="my-auto flex flex-col items-center gap-6">
            <header className="text-center max-w-md px-2">
              <h2 className="text-3xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('parentOnboarding.what.title')}
              </h2>
            </header>

            <div className="flex flex-col gap-3 w-full max-w-md">
              {cards.map((c, i) => (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white"
                  style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: `${c.color}15` }}>
                    <span className="material-symbols-outlined text-2xl"
                          style={{ color: c.color, fontVariationSettings: "'FILL' 1" }}>
                      {c.icon}
                    </span>
                  </div>
                  <p className="font-body text-sm text-on-surface leading-relaxed">
                    {t(`parentOnboarding.what.${c.key}`)}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 w-full max-w-xs">
              <PrimaryButton onClick={() => setStep(2)}>
                {t('parentOnboarding.what.cta')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 2: PIN setzen
  // PIN is entered twice (enter → confirm) so the parent can't lock
  // themselves out with a typo. "Später" skips and keeps 1234 active.
  // ══════════════════════════════════════════
  if (step === 2) {
    const activePin = pinPhase === 'confirming' ? confirmPin : firstPin;
    const currentLabel = pinPhase === 'confirming'
      ? t('parentOnboarding.pin.confirm')
      : t('parentOnboarding.pin.body');

    const handleKey = (n) => {
      if (n === null) return;
      setPinError('');
      if (n === '\u232B') {
        if (pinPhase === 'confirming') setConfirmPin(p => p.slice(0, -1));
        else setFirstPin(p => p.slice(0, -1));
        return;
      }
      if (pinPhase === 'idle') setPinPhase('entering');
      if (pinPhase === 'confirming') {
        const next = confirmPin + n;
        if (next.length > 4) return;
        setConfirmPin(next);
        if (next.length === 4) {
          if (next === firstPin) {
            // Both PINs match — store and advance to preview step.
            setChosenPin(firstPin);
            setStep(3);
          } else {
            // Mismatch — reset both, show error, start over.
            setPinError(t('parentOnboarding.pin.mismatch'));
            setConfirmPin('');
            setFirstPin('');
            setPinPhase('idle');
          }
        }
      } else {
        const next = firstPin + n;
        if (next.length > 4) return;
        setFirstPin(next);
        if (next.length === 4) {
          setPinPhase('confirming');
        }
      }
    };

    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-6 py-8"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          <div className="my-auto flex flex-col items-center gap-5 w-full">
            <header className="text-center max-w-md px-2 space-y-3">
              <h2 className="text-3xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('parentOnboarding.pin.title')}
              </h2>
              <p className="text-white/80 text-base leading-relaxed">
                {currentLabel}
              </p>
            </header>

            {/* PIN dots */}
            <div className="flex gap-3 justify-center">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold"
                     style={{
                       background: 'rgba(255,255,255,0.95)',
                       border: activePin.length === i
                         ? '2.5px solid #fcd34d'
                         : '2px solid rgba(255,255,255,0.4)',
                       color: '#124346',
                     }}>
                  {activePin[i] ? '\u25CF' : ''}
                </div>
              ))}
            </div>

            {pinError && (
              <p className="text-sm font-body text-white px-4 py-2 rounded-full"
                 style={{ background: 'rgba(186,26,26,0.85)' }}>
                {pinError}
              </p>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, '\u232B'].map((n, i) => (
                <button
                  key={i}
                  onClick={() => handleKey(n)}
                  disabled={n === null}
                  className="rounded-2xl font-headline text-2xl font-bold active:scale-95 transition-all"
                  style={{
                    background: n === null ? 'transparent' : 'rgba(255,255,255,0.95)',
                    color: '#124346',
                    padding: '14px 0',
                    visibility: n === null ? 'hidden' : 'visible',
                    minHeight: 56,
                    boxShadow: n === null ? 'none' : '0 4px 12px rgba(0,0,0,0.12)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Primary + Secondary CTAs. If the parent has already typed
                a full 4-digit PIN + confirmed, we auto-advance (above); the
                Primary button here is mostly informational — it nudges
                them to start typing. Disabled until first PIN typed. */}
            <div className="w-full max-w-xs mt-4 space-y-3">
              {pinPhase === 'idle' && (
                <p className="text-white/70 text-xs text-center font-label">
                  {t('parentOnboarding.pin.primary')}
                </p>
              )}
              <button
                onClick={() => {
                  // Skip — keep default 1234 active. No state patch here;
                  // we only patch on the final Fertig screen so all 5
                  // steps commit together.
                  setChosenPin(null);
                  setFirstPin('');
                  setConfirmPin('');
                  setPinPhase('idle');
                  setStep(3);
                }}
                className="w-full py-3 text-white/70 font-label text-sm underline-offset-4 hover:underline active:scale-95 transition-all"
              >
                {t('parentOnboarding.pin.secondary')}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 3: Dashboard-Preview
  // Annotated phone-schematic showing where the lock icons live.
  // Pure SVG — no screenshots needed. The 3 dots mark the lock positions
  // on the Aufgaben, Laden, and Buch tabs (top-right on each).
  // ══════════════════════════════════════════
  if (step === 3) {
    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-6 py-8"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          <div className="my-auto flex flex-col items-center gap-6">
            <header className="text-center max-w-md px-2 space-y-3">
              <h2 className="text-3xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('parentOnboarding.preview.title')}
              </h2>
              <p className="text-white/80 text-base leading-relaxed">
                {t('parentOnboarding.preview.body')}
              </p>
            </header>

            {/* Phone schematic — pure SVG, kid-safe demo of the 3 lock
                positions. Three abstract "screens" stacked in a phone
                frame with a yellow pulse around each lock icon to catch
                the eye. */}
            <div className="relative w-full max-w-[240px]">
              <svg viewBox="0 0 240 360" className="w-full h-auto"
                   style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.2))' }}>
                {/* Phone frame */}
                <rect x="10" y="10" width="220" height="340" rx="28" fill="#fff8f2" stroke="#124346" strokeWidth="3" />
                {/* Notch */}
                <rect x="90" y="10" width="60" height="14" rx="7" fill="#124346" />

                {/* Three stacked content rows representing the tabs that
                    have locks (Aufgaben / Laden / Buch). Each row has a
                    lock dot in the top-right corner. */}
                {[
                  { y: 40, label: 'Aufgaben', bg: '#dbeafe' },
                  { y: 140, label: 'Laden', bg: '#fef3c7' },
                  { y: 240, label: 'Buch', bg: '#e0e7ff' },
                ].map((row, i) => (
                  <g key={row.label}>
                    <rect x="22" y={row.y} width="196" height="88" rx="14" fill={row.bg} />
                    <text x="34" y={row.y + 24} fontSize="13" fontWeight="700"
                          fontFamily="Fredoka, sans-serif" fill="#124346">
                      {row.label}
                    </text>
                    {/* Placeholder content lines */}
                    <rect x="34" y={row.y + 40} width="100" height="6" rx="3" fill="#124346" opacity="0.2" />
                    <rect x="34" y={row.y + 54} width="140" height="6" rx="3" fill="#124346" opacity="0.15" />
                    <rect x="34" y={row.y + 68} width="80" height="6" rx="3" fill="#124346" opacity="0.15" />

                    {/* Lock dot with pulse ring */}
                    <motion.circle
                      cx="200"
                      cy={row.y + 18}
                      r="14"
                      fill="#fcd34d"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                      style={{ transformOrigin: `200px ${row.y + 18}px` }}
                    />
                    {/* Material lock glyph — inside the dot */}
                    <text x="200" y={row.y + 23}
                          fontFamily="Material Symbols Outlined"
                          fontSize="16"
                          fill="#725b00"
                          textAnchor="middle">
                      {'\uE897'}
                    </text>
                  </g>
                ))}

                {/* Home indicator */}
                <rect x="100" y="335" width="40" height="4" rx="2" fill="#124346" opacity="0.3" />
              </svg>
            </div>

            <div className="w-full max-w-xs mt-2">
              <PrimaryButton onClick={() => setStep(4)}>
                {t('parentOnboarding.preview.cta')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 4: Fertig — "Handy an mein Kind"
  // This is the hand-off moment. Tapping the CTA patches state and
  // unmounts, which drops the user into the kid's Onboarding.jsx flow.
  // ══════════════════════════════════════════
  return (
    <div className="fixed inset-0 overflow-y-auto font-body">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
      </div>

      <main className="relative z-10 min-h-full flex flex-col px-8 text-center py-8"
            style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
        <ProgressBar />

        <div className="my-auto flex flex-col items-center">
          <div className="mb-8 relative">
            <div className="absolute inset-0 blur-3xl rounded-full scale-150" style={{ background: 'rgba(252,211,77,0.3)' }} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <img src={base + 'art/ronki-egg-logo.svg'} alt="Ronki"
                   className="w-36 h-auto mx-auto"
                   style={{ filter: 'drop-shadow(0 18px 32px rgba(0,0,0,0.2))' }} />
            </motion.div>
          </div>

          <div className="max-w-md space-y-4">
            <h1 className="font-display text-4xl font-bold text-white tracking-tight leading-tight"
                style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
              {t('parentOnboarding.done.title')}
            </h1>
            <p className="text-white/80 text-base leading-relaxed px-4">
              {t('parentOnboarding.done.body')}
            </p>
          </div>

          <div className="mt-10 w-full max-w-xs">
            <button onClick={finish}
              className="w-full py-5 rounded-full font-headline text-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
              style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
              {t('parentOnboarding.done.cta')}
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
