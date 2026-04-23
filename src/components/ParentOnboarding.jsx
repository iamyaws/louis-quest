import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';

const base = import.meta.env.BASE_URL;

// ══════════════════════════════════════════
// ParentOnboarding — Phase 3 of the parent-first onboarding flow
// (docs/discovery/2026-04-23-onboarding-parent-first/transcript.md)
//
// Lean 5-screen parent setup, runs AFTER the kid intro + handoff card,
// BEFORE the kid's Onboarding.jsx. The parent stays blind to Ronki
// during setup — no forest, no egg, no campfire, just neutral app chrome.
//
//   Step 0 — Welcome
//   Step 1 — PIN (two-prompt confirm)
//   Step 2 — Child name + siblings (replaces the killed "Was ist Ronki")
//   Step 3 — Analytics opt-in (split out of the old Done screen)
//   Step 4 — Done / handoff cue
//
// Killed vs. the previous flow:
//   · "Was ist Ronki" explainer — parents learn by watching the kid
//   · Dashboard-Preview SVG schematic — it lied about viewports, and
//     parents discover the lock icon organically after handover
//
// On completion, patches state with:
//   { parentOnboardingDone: true, parentPin, parentPinIsDefault,
//     analyticsEnabled, familyConfig: { ...existing, childName, siblings } }
//
// Visual language (unchanged):
//   · Fredoka display font
//   · Teal gradient bg (bg-teal-soft.webp)
//   · Warm cream cards + yellow CTA
// ══════════════════════════════════════════

const TOTAL_STEPS = 5;

export default function ParentOnboarding({ onComplete, existingFamilyConfig }) {
  const { t, lang, setLang } = useTranslation();
  const [step, setStep] = useState(0);
  // PIN state — 'idle' (at PIN screen, no input yet), 'entering'
  // (typing first PIN), 'confirming' (typing second PIN to verify),
  // 'done' (both match, stored in chosenPin).
  const [pinPhase, setPinPhase] = useState('idle');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [chosenPin, setChosenPin] = useState(null);
  // Family state — childName + up to 4 siblings. Seeded from the current
  // familyConfig so that if the parent re-enters onboarding somehow (e.g.
  // storage reset), we don't wipe existing values.
  const [childName, setChildName] = useState(existingFamilyConfig?.childName || '');
  const [siblings, setSiblings] = useState(existingFamilyConfig?.siblings?.length
    ? existingFamilyConfig.siblings
    : []);
  // Analytics consent — default OFF (opt-in per Art. 8 DSGVO).
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

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

  // Finalize — patch state + unmount. Used by the Done screen.
  const finish = () => {
    // Merge family config rather than replace — DEFAULT_FAMILY_CONFIG has
    // several other fields (affirmation, motto, parentMessage, etc.) we
    // don't want to wipe.
    const cleanSiblings = siblings
      .filter(s => s.name && s.name.trim())
      .map(s => ({
        name: s.name.trim(),
        relationship: s.relationship || 'Geschwister',
        pronouns: s.pronouns || 'they',
      }));

    onComplete({
      parentOnboardingDone: true,
      parentPin: chosenPin,
      parentPinIsDefault: chosenPin === null,
      analyticsEnabled: analyticsOptIn,
      familyConfig: {
        ...(existingFamilyConfig || {}),
        childName: childName.trim(),
        siblings: cleanSiblings,
      },
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
            {/* Ronki-Ei logo — same asset as the load screen. Kept abstract
                on purpose; parent stays blind to Ronki until handover. */}
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
  // Step 1: PIN setzen
  // PIN is entered twice (enter → confirm) so the parent can't lock
  // themselves out with a typo. "Später" skips and keeps 1234 active.
  // ══════════════════════════════════════════
  if (step === 1) {
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
            setChosenPin(firstPin);
            setStep(2);
          } else {
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

            <div className="w-full max-w-xs mt-4 space-y-3">
              {pinPhase === 'idle' && (
                <p className="text-white/70 text-xs text-center font-label">
                  {t('parentOnboarding.pin.primary')}
                </p>
              )}
              <button
                onClick={() => {
                  setChosenPin(null);
                  setFirstPin('');
                  setConfirmPin('');
                  setPinPhase('idle');
                  setStep(2);
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
  // Step 2: Family — child name + siblings
  // NEW (23 Apr 2026). Ronki greets by name + knows siblings for
  // Familienregeln, BirthdayEpic, etc. Parent can skip siblings entirely.
  // Child-name is required (can't advance without at least 1 char).
  // Up to 4 siblings; "Bruder / Schwester / Geschwister" relationship picker.
  // ══════════════════════════════════════════
  if (step === 2) {
    const canContinue = childName.trim().length > 0;

    const updateSibling = (idx, patch) => {
      setSiblings(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
    };
    const addSibling = () => {
      if (siblings.length >= 4) return;
      setSiblings(prev => [...prev, { name: '', relationship: 'Geschwister', pronouns: 'they' }]);
    };
    const removeSibling = (idx) => {
      setSiblings(prev => prev.filter((_, i) => i !== idx));
    };

    // Map relationship → pronouns so Ronki can refer to siblings correctly.
    const relationshipOptions = [
      { value: 'Bruder', label: t('parentOnboarding.family.relationshipBruder'), pronouns: 'er' },
      { value: 'Schwester', label: t('parentOnboarding.family.relationshipSchwester'), pronouns: 'sie' },
      { value: 'Geschwister', label: t('parentOnboarding.family.relationshipGeschwister'), pronouns: 'they' },
    ];

    return (
      <div className="fixed inset-0 overflow-y-auto font-body">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img src={base + 'art/bg-teal-soft.webp'} alt="" className="w-full h-full object-cover" />
        </div>

        <main className="relative z-10 min-h-full flex flex-col px-6 py-8"
              style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
          <ProgressBar />

          <div className="my-auto flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <header className="text-center space-y-3 px-2">
              <h2 className="text-3xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('parentOnboarding.family.title')}
              </h2>
              <p className="text-white/80 text-base leading-relaxed">
                {t('parentOnboarding.family.body')}
              </p>
            </header>

            {/* Child name card */}
            <div className="w-full rounded-2xl bg-white p-5 space-y-3"
                 style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
              <label className="block">
                <span className="text-sm font-label font-bold text-on-surface uppercase tracking-wide">
                  {t('parentOnboarding.family.childName')}
                </span>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder={t('parentOnboarding.family.childNamePlaceholder')}
                  maxLength={24}
                  autoFocus
                  className="mt-2 w-full px-4 py-3 rounded-xl font-body text-lg text-on-surface"
                  style={{
                    background: '#fff8f2',
                    border: '1.5px solid rgba(18,67,70,0.15)',
                    outline: 'none',
                  }}
                />
              </label>
            </div>

            {/* Siblings block */}
            <div className="w-full rounded-2xl bg-white p-5 space-y-3"
                 style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
              <p className="text-sm font-label font-bold text-on-surface uppercase tracking-wide">
                {t('parentOnboarding.family.siblingsHeader')}
              </p>

              {siblings.length === 0 ? (
                <p className="text-sm text-on-surface/60 italic">
                  {t('parentOnboarding.family.skip')}
                </p>
              ) : (
                <div className="space-y-3">
                  {siblings.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateSibling(idx, { name: e.target.value })}
                        placeholder={t('parentOnboarding.family.siblingNamePlaceholder')}
                        maxLength={24}
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg font-body text-base text-on-surface"
                        style={{
                          background: '#fff8f2',
                          border: '1.5px solid rgba(18,67,70,0.15)',
                          outline: 'none',
                        }}
                      />
                      <select
                        value={s.relationship}
                        onChange={(e) => {
                          const opt = relationshipOptions.find(o => o.value === e.target.value);
                          updateSibling(idx, {
                            relationship: e.target.value,
                            pronouns: opt?.pronouns || 'they',
                          });
                        }}
                        className="px-2 py-2 rounded-lg font-body text-sm text-on-surface"
                        style={{
                          background: '#fff8f2',
                          border: '1.5px solid rgba(18,67,70,0.15)',
                          outline: 'none',
                        }}
                      >
                        {relationshipOptions.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeSibling(idx)}
                        aria-label={t('parentOnboarding.family.siblingRemove')}
                        className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all"
                        style={{ background: 'rgba(186,26,26,0.1)', color: '#ba1a1a', flexShrink: 0 }}
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {siblings.length < 4 && (
                <button
                  onClick={addSibling}
                  className="w-full py-2.5 rounded-xl font-label text-sm font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(18,67,70,0.08)',
                    color: '#124346',
                    border: '1.5px dashed rgba(18,67,70,0.25)',
                  }}
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  {t('parentOnboarding.family.siblingAdd')}
                </button>
              )}
            </div>

            <div className="w-full max-w-xs">
              <PrimaryButton onClick={() => canContinue && setStep(3)} disabled={!canContinue}>
                {t('parentOnboarding.family.cta')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 3: Analytics opt-in
  // Split out of the old Done screen so it's explicit and visible, not
  // buried under a handoff CTA. Default OFF — we don't send telemetry
  // unless the parent actively flips this ON.
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

          <div className="my-auto flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            <header className="text-center space-y-3 px-2">
              <h2 className="text-3xl font-bold text-white leading-tight"
                  style={{ fontFamily: 'Fredoka, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
                {t('parentOnboarding.analytics.title')}
              </h2>
              <p className="text-white/80 text-base leading-relaxed">
                {t('parentOnboarding.analytics.body')}
              </p>
            </header>

            <div className="w-full rounded-2xl p-5 space-y-3"
                 style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-white/80 mt-0.5"
                      style={{ fontSize: 22, fontVariationSettings: "'FILL' 0" }}>
                  analytics
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-label text-white font-bold text-sm uppercase tracking-wide">
                    {t('analytics.disclosure.title')}
                  </p>
                  <p className="text-white/75 text-xs leading-relaxed mt-1">
                    {t('analytics.disclosure.body')}
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-3 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={analyticsOptIn}
                  onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: '#fcd34d' }}
                  aria-label={t('analytics.disclosure.accept')}
                />
                <span className="text-white/90 text-sm font-body">
                  {analyticsOptIn
                    ? t('analytics.disclosure.accept')
                    : t('analytics.disclosure.decline')}
                </span>
              </label>
            </div>

            <div className="w-full max-w-xs">
              <PrimaryButton onClick={() => setStep(4)}>
                {t('parentOnboarding.analytics.cta')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // Step 4: Done / handoff CTA
  // Tapping the CTA patches state and unmounts — App.jsx then renders
  // the HandoffBackCard (Phase 4) which flips the kid back into the
  // Ronki-world forest scene before the kid Onboarding.jsx starts.
  // ══════════════════════════════════════════
  const childNameForCopy = childName.trim();
  const doneBody = childNameForCopy
    ? t('parentOnboarding.done.body', { childName: childNameForCopy })
    : t('parentOnboarding.done.bodyNoName');

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
              {doneBody}
            </p>
          </div>

          <div className="mt-10 w-full max-w-xs">
            <button onClick={finish}
              className="w-full py-5 rounded-full font-headline text-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
              style={{ background: '#fcd34d', color: '#725b00', boxShadow: '0 12px 24px rgba(252,211,77,0.4), 0 4px 0 #d4a830' }}>
              {t('parentOnboarding.done.cta')}
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
