import React, { useState } from 'react';
import { setActiveToken } from '../lib/profileToken';

const base = import.meta.env.BASE_URL;
const TOKEN_REGEX = /^[a-f0-9]{32}$/;

/**
 * NoProfileLanding — first-screen for visitors with no profile token.
 *
 * Apr 27 2026 (QR auth Phase 2). When AuthGate determines there's no
 * active profile token, this screen renders BEFORE the onboarding
 * chain. Three paths from here:
 *
 *   1. "Neues Profil anlegen" — proceed to CombinedParentSetup. At
 *      parent-setup completion, a fresh token is generated and the
 *      onboarding chain runs as normal.
 *   2. "Code eingeben" — fallback for parents who got the printed
 *      QR card (or shared 8-char code) but couldn't scan. Form field
 *      accepts the full 32-hex token.
 *   3. (Future Phase 2.5) "QR scannen" — opens device camera + jsQR
 *      decoder. Skipped tonight; the share-link flow already handles
 *      the most common case (parent pastes URL on second device,
 *      ?p=<token> auto-resolves before this screen ever renders).
 *
 * On token-entered: validate shape, call setActiveToken, reload so
 * AuthGate picks up the new token via getActiveToken() and routes
 * to the cloud-load flow in TaskContext.
 */
export default function NoProfileLanding({ onProceedToSetup }) {
  const [mode, setMode] = useState('choice'); // 'choice' | 'code'
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleSubmitCode = (e) => {
    e.preventDefault();
    const normalized = codeInput.trim().toLowerCase().replace(/[\s-]/g, '');
    if (!TOKEN_REGEX.test(normalized)) {
      setCodeError('Code hat 32 Zeichen (a-f, 0-9). Bitte überprüfen.');
      return;
    }
    try {
      setActiveToken(normalized);
      // Hard reload so AuthGate re-resolves with the new token.
      window.location.reload();
    } catch (err) {
      setCodeError('Konnte den Code nicht speichern. Versuch noch einmal.');
    }
  };

  return (
    <div
      role="main"
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
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={base + 'art/ronki-egg-logo.svg'}
            alt="Ronki"
            className="w-20 h-auto"
            style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.10))' }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p
            className="font-bold text-xs font-label uppercase tracking-[0.18em] mb-2"
            style={{ color: '#A83E2C' }}
          >
            Willkommen
          </p>
          <h1
            className="font-headline font-bold text-3xl"
            style={{ fontFamily: 'Fredoka, sans-serif', color: '#124346' }}
          >
            Wer öffnet das hier?
          </h1>
          <p className="font-body text-base text-on-surface-variant mt-3 leading-relaxed">
            Ein neues Kind, oder kommt jemand zurück mit einem Code?
          </p>
        </div>

        {mode === 'choice' && (
          <>
            {/* New profile */}
            <button
              type="button"
              onClick={onProceedToSetup}
              className="w-full py-5 px-6 rounded-2xl font-headline font-bold text-lg flex items-center gap-4 active:scale-[0.99] transition-all mb-3 text-left"
              style={{
                background: 'linear-gradient(135deg, #124346, #2d5a5e)',
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(18,67,70,0.25)',
                minHeight: 88,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  child_care
                </span>
              </div>
              <div className="flex-1">
                <p className="text-lg leading-tight">Neues Profil anlegen</p>
                <p className="font-body font-normal text-xs text-white/75 mt-1">
                  Wir richten Ronki für euer Kind ein. Dauert kurz.
                </p>
              </div>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            {/* Existing code */}
            <button
              type="button"
              onClick={() => setMode('code')}
              className="w-full py-5 px-6 rounded-2xl font-headline font-bold text-lg flex items-center gap-4 active:scale-[0.99] transition-all text-left"
              style={{
                background: '#ffffff',
                color: '#124346',
                border: '2px solid rgba(18,67,70,0.18)',
                minHeight: 88,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(14,165,233,0.12)' }}
              >
                <span className="material-symbols-outlined text-2xl" style={{ color: '#0369a1', fontVariationSettings: "'FILL' 1" }}>
                  qr_code_2
                </span>
              </div>
              <div className="flex-1">
                <p className="text-lg leading-tight">Code eingeben</p>
                <p className="font-body font-normal text-xs text-on-surface-variant mt-1">
                  Ihr habt bereits ein Profil auf einem anderen Gerät? Code aus dem Eltern-Bereich eintippen.
                </p>
              </div>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <p className="font-body text-xs text-center text-on-surface-variant/70 mt-8 leading-relaxed">
              Beim Anlegen entsteht ein 32-Zeichen-Profil-Code, der euer Profil zwischen Geräten synchronisiert. Keine E-Mail, kein Passwort.
            </p>
          </>
        )}

        {mode === 'code' && (
          <form onSubmit={handleSubmitCode}>
            <label
              htmlFor="np-code-input"
              className="block font-label font-bold text-sm uppercase tracking-[0.10em] mb-2"
              style={{ color: '#124346' }}
            >
              Profil-Code (32 Zeichen)
            </label>
            <input
              id="np-code-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setCodeError(''); }}
              placeholder="a3f7c2e1b9d5408f2761c8e4ab90f3d6"
              className="w-full rounded-2xl px-5 py-4 font-mono text-base"
              style={{
                background: '#ffffff',
                border: '1.5px solid rgba(18,67,70,0.18)',
                color: '#1c1b1e',
                outline: 'none',
                letterSpacing: '0.04em',
              }}
              required
            />
            {codeError && (
              <p className="font-body text-sm mt-2" style={{ color: '#dc2626' }}>
                {codeError}
              </p>
            )}
            <p className="font-body text-xs text-on-surface-variant mt-3 leading-relaxed">
              Den Code findet ihr im Eltern-Bereich des anderen Geräts unter <strong>Profil &amp; Geräte</strong>.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setMode('choice'); setCodeInput(''); setCodeError(''); }}
                className="flex-1 py-4 rounded-full font-label font-bold text-sm active:scale-[0.97] transition-transform"
                style={{
                  background: 'rgba(18,67,70,0.08)',
                  color: '#124346',
                  border: '1.5px solid rgba(18,67,70,0.18)',
                  minHeight: 48,
                }}
              >
                Zurück
              </button>
              <button
                type="submit"
                disabled={!codeInput.trim()}
                className="flex-1 py-4 rounded-full font-label font-bold text-sm active:scale-[0.97] transition-transform"
                style={{
                  background: codeInput.trim() ? '#0ea5e9' : 'rgba(0,0,0,0.12)',
                  color: '#ffffff',
                  boxShadow: codeInput.trim() ? '0 6px 16px rgba(14,165,233,0.35)' : 'none',
                  opacity: codeInput.trim() ? 1 : 0.6,
                  minHeight: 48,
                }}
              >
                Weiter
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
