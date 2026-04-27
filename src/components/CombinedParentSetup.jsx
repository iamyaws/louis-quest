import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

const base = import.meta.env.BASE_URL;

/**
 * CombinedParentSetup — single-screen replacement for ParentOnboarding.
 *
 * Tier-2 onboarding trim (26 Apr 2026): the prior 5-step parent flow
 * (Welcome → PIN-twice → Child name + siblings → Analytics → Done)
 * collapsed to one form. Same data captured, no re-confirm on the PIN
 * (a typo lockout is recoverable; making the parent type the same
 * digits twice is friction theater).
 *
 * Sections, top to bottom:
 *   1. Wer setzt das ein?  — child name (required, single field)
 *   2. PIN für Eltern-Bereich  — optional, single 4-digit field, can
 *      skip with "später" → 1234 stays default with a banner-nag in
 *      the dashboard
 *   3. Hilfst du uns?  — analytics opt-in toggle, default off
 *
 * On submit, calls onComplete with the same payload shape as the old
 * ParentOnboarding so consumers downstream don't need to change:
 *   {
 *     parentOnboardingDone: true,
 *     parentPin,
 *     parentPinIsDefault,
 *     analyticsEnabled,
 *     familyConfig: { ...existing, childName, siblings: [] },
 *   }
 *
 * Siblings array intentionally always empty here — sibling data was
 * killed in the trim (1+ siblings is a v1.5 nice-to-have, not a
 * launch-blocker question for a single-kid product).
 */
export default function CombinedParentSetup({ existingFamilyConfig, onComplete }) {
  const { t } = useTranslation();
  const [childName, setChildName] = useState((existingFamilyConfig?.childName || '').trim());
  const [pinDigits, setPinDigits] = useState('');
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const handlePinInput = (raw) => {
    // Accept digits only, max 4
    const digits = (raw || '').replace(/\D/g, '').slice(0, 4);
    setPinDigits(digits);
    setPinError('');
  };

  const submit = () => {
    if (!childName.trim()) return;
    if (pinDigits && pinDigits.length !== 4) {
      setPinError('Vier Ziffern, oder leer lassen.');
      return;
    }
    const usedDefault = !pinDigits;
    onComplete({
      parentOnboardingDone: true,
      parentPin: usedDefault ? null : pinDigits,
      parentPinIsDefault: usedDefault,
      analyticsEnabled: analyticsOptIn,
      familyConfig: {
        ...(existingFamilyConfig || {}),
        childName: childName.trim(),
        siblings: [],
      },
    });
  };

  const canSubmit = childName.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Eltern-Einstellungen"
      className="fixed inset-0 overflow-y-auto font-body"
      style={{
        background: 'linear-gradient(180deg, #fff8f1 0%, #fef3c7 100%)',
        color: '#1c1b1e',
      }}
    >
      <main
        className="relative z-10 min-h-full flex flex-col px-6 max-w-md mx-auto"
        style={{
          paddingTop: 'calc(2.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Logo (small, single beat — parent stays blind to Ronki) */}
        <div className="flex justify-center mb-6">
          <img
            src={base + 'art/ronki-egg-logo.svg'}
            alt="Ronki"
            className="w-16 h-auto"
            style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.10))' }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p
            className="font-bold text-xs font-label uppercase tracking-[0.18em] mb-2"
            style={{ color: '#A83E2C' }}
          >
            Kurz einrichten
          </p>
          <h1
            className="font-headline font-bold text-3xl"
            style={{ fontFamily: 'Fredoka, sans-serif', color: '#124346' }}
          >
            Drei kleine Sachen.
          </h1>
          <p className="font-body text-base text-on-surface-variant mt-3 leading-relaxed">
            Dann übergibt ihr Ronki an euer Kind.
          </p>
        </div>

        {/* Section 1: Child name */}
        <section className="mb-7">
          <label
            htmlFor="cps-childName"
            className="block font-label font-bold text-sm uppercase tracking-[0.10em] mb-2"
            style={{ color: '#124346' }}
          >
            Wie heißt euer Kind?
          </label>
          <input
            id="cps-childName"
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Vorname"
            autoComplete="off"
            className="w-full rounded-2xl px-5 py-4 font-body text-lg"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(18,67,70,0.18)',
              color: '#1c1b1e',
              outline: 'none',
            }}
            required
          />
        </section>

        {/* Section 2: PIN */}
        <section className="mb-7">
          <label
            htmlFor="cps-pin"
            className="block font-label font-bold text-sm uppercase tracking-[0.10em] mb-2"
            style={{ color: '#124346' }}
          >
            PIN für den Eltern-Bereich (optional)
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="cps-pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pinDigits}
              onChange={(e) => handlePinInput(e.target.value)}
              placeholder="••••"
              autoComplete="new-password"
              className="flex-1 rounded-2xl px-5 py-4 font-body text-lg tracking-widest"
              style={{
                background: '#ffffff',
                border: '1.5px solid rgba(18,67,70,0.18)',
                color: '#1c1b1e',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPin(s => !s)}
              aria-label={showPin ? 'PIN verbergen' : 'PIN zeigen'}
              className="rounded-full px-4 py-3 font-label font-bold text-sm active:scale-95 transition-transform"
              style={{
                background: 'rgba(18,67,70,0.08)',
                border: '1.5px solid rgba(18,67,70,0.18)',
                color: '#124346',
                minHeight: 44,
              }}
            >
              {showPin ? 'Aus' : 'An'}
            </button>
          </div>
          {pinError && (
            <p className="font-body text-sm text-error mt-2" style={{ color: '#dc2626' }}>
              {pinError}
            </p>
          )}
          <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
            Leer lassen heißt: Standard-PIN <strong>1234</strong>. Im Eltern-Bereich
            jederzeit änderbar.
          </p>
        </section>

        {/* Section 3: Analytics */}
        <section className="mb-9">
          <button
            type="button"
            onClick={() => setAnalyticsOptIn(v => !v)}
            className="w-full flex items-start gap-4 rounded-2xl p-4 active:scale-[0.99] transition-transform text-left"
            style={{
              background: analyticsOptIn ? 'rgba(52,211,153,0.10)' : 'rgba(18,67,70,0.04)',
              border: analyticsOptIn ? '1.5px solid rgba(52,211,153,0.45)' : '1.5px solid rgba(18,67,70,0.12)',
            }}
            aria-pressed={analyticsOptIn}
          >
            <div
              className="rounded-md flex-shrink-0 mt-0.5"
              style={{
                width: 22,
                height: 22,
                background: analyticsOptIn ? '#34d399' : 'transparent',
                border: analyticsOptIn ? 'none' : '1.5px solid rgba(18,67,70,0.32)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {analyticsOptIn && (
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-white"
                  style={{ fontSize: 16, fontVariationSettings: "'wght' 700" }}
                >
                  check
                </span>
              )}
            </div>
            <div className="flex-1">
              <p
                className="font-label font-bold text-sm uppercase tracking-[0.08em] mb-1"
                style={{ color: '#124346' }}
              >
                Anonyme Nutzungsdaten teilen?
              </p>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Hilft uns Ronki zu verbessern. Keine Werbung, kein Tracking,
                nichts Drittes. Frankfurter Server. Jederzeit aus.
              </p>
            </div>
          </button>
        </section>

        {/* CTA */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="w-full py-5 px-8 rounded-full font-headline text-xl font-bold text-white flex items-center justify-center gap-3 active:scale-95 transition-all"
          style={{
            background: canSubmit
              ? 'linear-gradient(135deg, #124346, #2d5a5e)'
              : 'rgba(18,67,70,0.32)',
            boxShadow: canSubmit ? '0 12px 30px rgba(18,67,70,0.25)' : 'none',
            opacity: canSubmit ? 1 : 0.6,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          Weiter zum Kind
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <p className="font-body text-xs text-center text-on-surface-variant/70 mt-6 leading-relaxed">
          Keine Daten verlassen Deutschland. Mehr im Eltern-Bereich.
        </p>
      </main>
    </div>
  );
}
