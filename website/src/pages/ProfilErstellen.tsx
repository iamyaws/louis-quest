/**
 * Profil-Karte erstellen — website-side parent setup for a kid profile.
 *
 * Marc 3 May 2026: "the one-time setup could be handled via the
 * website for parents to generate a code for their kids and print it
 * out." This page replaces the in-app CombinedParentSetup for new
 * profiles. Parents land here from the home/installieren page,
 * fill a one-screen form, and get a printable A6 QR card. The card
 * lives on the fridge or the kid's room; the kid scans it on their
 * tablet and lands straight in MeetRonki.
 *
 * Why website not app:
 *   - parents prefer typing on a laptop, not the kid's tablet
 *   - QR card is a physical artifact — generating it on a device
 *     with a real printer attached is the natural workflow
 *   - the app stays a kid-only space (no parent forms), which the
 *     5-8yo audience deserves
 *
 * The seeded state (parentOnboardingDone, parentHandoffBackSeen,
 * familyConfig) lives in Supabase profiles keyed by the new token.
 * The kid's first scan pulls it via syncLoadByToken in TaskContext.
 *
 * Print: A6 portrait, dedicated stylesheet hides everything except
 * #ronki-card-print — same pattern as the in-app dashboard QR card.
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { trackEvent } from '../lib/analytics';
import {
  createProfileOnSite,
  buildShareUrl,
  tokenDisplayFragment,
} from '../lib/profileSetup';

type Phase =
  | { kind: 'form' }
  | { kind: 'submitting' }
  | { kind: 'success'; token: string }
  | { kind: 'error'; message: string };

export default function ProfilErstellen() {
  const [phase, setPhase] = useState<Phase>({ kind: 'form' });
  const [childName, setChildName] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrPrintRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (phase.kind !== 'success') return;
    const url = buildShareUrl(phase.token);
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 240,
        color: { dark: '#1a3c3f', light: '#ffffff' },
      }).catch(() => { /* canvas not ready — next render */ });
    }
    if (qrPrintRef.current) {
      QRCode.toCanvas(qrPrintRef.current, url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 480,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch(() => { /* same */ });
    }
  }, [phase]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPinError('');
    const trimmedName = childName.trim();
    if (!trimmedName) return;
    if (pin && !/^\d{4}$/.test(pin)) {
      setPinError('Vier Ziffern, oder leer lassen.');
      return;
    }
    setPhase({ kind: 'submitting' });
    trackEvent('ProfilErstellen Submit');
    const res = await createProfileOnSite({
      childName: trimmedName,
      pin: pin || null,
    });
    if (res.ok) {
      trackEvent('ProfilErstellen Success');
      setPhase({ kind: 'success', token: res.token });
    } else {
      setPhase({
        kind: 'error',
        message:
          res.reason === 'config'
            ? 'Verbindung zum Server fehlt. Bitte später nochmal probieren.'
            : res.reason === 'invalid'
              ? 'Bitte Name eingeben (PIN optional, vier Ziffern).'
              : 'Karte konnte nicht angelegt werden. Bitte später nochmal.',
      });
    }
  }

  async function handleShare() {
    if (phase.kind !== 'success') return;
    const url = buildShareUrl(phase.token);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Ronki — Profil-Karte', url });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2400);
      }
    } catch { /* user cancelled / clipboard blocked */ }
  }

  function handlePrint() {
    try { window.print(); } catch { /* unsupported */ }
  }

  function handleCreateAnother() {
    setPhase({ kind: 'form' });
    setChildName('');
    setPin('');
    setPinError('');
  }

  return (
    <PainterlyShell>
      <PageMeta
        title="Profil-Karte erstellen — Ronki"
        description="Erstellt eine QR-Karte für euer Kind. Druckt sie aus, klebt sie an den Kühlschrank oder ins Kinderzimmer — ein Scan und Ronki ist da."
        canonicalPath="/profil-erstellen"
        noindex
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark transition-colors mb-8"
            >
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-4">
              Einrichtung &middot; einmalig
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.06] tracking-tight text-teal-dark mb-6">
              {phase.kind === 'success' ? (
                <>Eure <em className="italic text-sage">Profil-Karte</em> ist bereit</>
              ) : (
                <>Eine <em className="italic text-sage">QR-Karte</em> für euer Kind</>
              )}
            </h1>
            {phase.kind !== 'success' && (
              <p className="text-lg text-teal-dark/70 leading-relaxed mb-10 max-w-prose">
                Ein kurzes Formular, dann generieren wir eine Karte mit
                QR-Code. Druckt sie aus, klebt sie an den Kühlschrank
                oder ins Kinderzimmer. Euer Kind scannt sie auf dem
                Tablet — und Ronki ist da.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {(phase.kind === 'form' || phase.kind === 'submitting' || phase.kind === 'error') && (
        <section className="px-6 pb-16">
          <div className="max-w-md mx-auto">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-cream/60 border border-teal-dark/10 p-6 sm:p-8 shadow-sm"
            >
              <label className="block mb-5">
                <span className="block text-sm font-display font-semibold text-teal-dark mb-2">
                  Name eures Kindes
                </span>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white border border-teal-dark/15 text-base text-teal-dark focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                  placeholder="z. B. Louis"
                  maxLength={40}
                />
              </label>

              <label className="block mb-2">
                <span className="block text-sm font-display font-semibold text-teal-dark mb-2">
                  Eltern-PIN <span className="font-normal text-teal-dark/50">(optional)</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(digits);
                    setPinError('');
                  }}
                  className="w-full rounded-xl px-4 py-3 bg-white border border-teal-dark/15 text-base text-teal-dark focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 font-mono tracking-[0.4em]"
                  placeholder="1234"
                />
              </label>
              <p className="text-xs text-teal-dark/60 mb-6 leading-relaxed">
                {pinError ? (
                  <span className="text-rose-700">{pinError}</span>
                ) : (
                  <>Schützt den Eltern-Bereich in der App. Lasst es leer und ihr könnt es später setzen.</>
                )}
              </p>

              {phase.kind === 'error' && (
                <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  {phase.message}
                </p>
              )}

              <button
                type="submit"
                disabled={phase.kind === 'submitting' || !childName.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-display font-semibold text-lg bg-teal text-cream shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
              >
                {phase.kind === 'submitting' ? 'Karte wird angelegt…' : 'Karte erstellen'}
                {phase.kind !== 'submitting' && <span aria-hidden>→</span>}
              </button>

              <p className="text-xs text-teal-dark/55 mt-5 leading-relaxed">
                Keine E-Mail nötig. Keine Werbung. Der QR-Code ist
                der einzige Weg in das Profil — bewahrt die Karte gut
                auf. Verloren? Auf dieser Seite eine neue erstellen.
              </p>
            </form>
          </div>
        </section>
      )}

      {phase.kind === 'success' && (
        <section className="px-6 pb-16">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl bg-cream/60 border border-teal-dark/10 p-6 sm:p-8 shadow-sm"
            >
              <div className="flex flex-col items-center mb-6">
                <canvas
                  ref={qrCanvasRef}
                  className="rounded-2xl border border-teal-dark/10 bg-white p-3"
                  style={{ width: 240, height: 240 }}
                  aria-label="QR-Code zum Verbinden"
                />
                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-teal font-medium">
                  Profil-Code
                </p>
                <p className="mt-1 font-display font-bold text-2xl tracking-[0.18em] text-teal-dark">
                  {tokenDisplayFragment(phase.token)}
                </p>
                <p className="mt-2 text-sm text-teal-dark/65">
                  für {childName.trim()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-display font-semibold text-sm bg-teal text-cream shadow-md hover:shadow-lg transition-shadow"
                >
                  <span aria-hidden>🖨</span> Drucken
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-display font-semibold text-sm bg-cream text-teal-dark border border-teal-dark/20 hover:bg-cream/80 transition-colors"
                >
                  {shareCopied ? '✓ Kopiert' : 'Link teilen'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCreateAnother}
                className="w-full text-sm text-teal-dark/60 hover:text-teal-dark py-3 transition-colors"
              >
                Weitere Karte für ein anderes Kind erstellen
              </button>
            </motion.div>

            <div className="mt-8 text-center">
              <h2 className="font-display font-semibold text-xl text-teal-dark mb-3">
                So geht's weiter
              </h2>
              <ol className="text-left text-base text-teal-dark/75 leading-relaxed space-y-2 max-w-sm mx-auto">
                <li><strong>1.</strong> Druckt die Karte aus oder lasst sie auf dem Bildschirm.</li>
                <li><strong>2.</strong> Öffnet <a href="https://app.ronki.de" className="text-teal hover:underline">app.ronki.de</a> auf dem Tablet eures Kindes.</li>
                <li><strong>3.</strong> Tippt auf „QR-Code scannen" und haltet die Kamera auf die Karte.</li>
                <li><strong>4.</strong> Ronki begrüßt euer Kind beim Namen — fertig.</li>
              </ol>
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* ── Print-only card. Hidden in normal viewport via the @media
            print rule below; printed alone when the parent taps Drucken
            (window.print()). A6 portrait. Card mirrors the dashboard
            print layout so a parent who prints from either surface
            ends up with the same artifact in hand. ── */}
      {phase.kind === 'success' && (
        <div id="ronki-card-print" aria-hidden="true">
          <div className="ronki-card-inner">
            <p className="ronki-card-eyebrow">Ronki</p>
            <h2 className="ronki-card-name">{childName.trim()}</h2>
            <canvas ref={qrPrintRef} className="ronki-card-canvas" />
            <p className="ronki-card-code">{tokenDisplayFragment(phase.token)}</p>
            <p className="ronki-card-hint">
              Scannt den Code in der Ronki-App, um Ronki zu öffnen.
            </p>
            <p className="ronki-card-url">app.ronki.de</p>
          </div>
        </div>
      )}

      <style>{`
        #ronki-card-print { display: none; }
        @media print {
          body > *:not(#ronki-card-print) { display: none !important; }
          #ronki-card-print {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 99999 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .ronki-card-inner {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12mm 10mm;
            text-align: center;
            font-family: 'Fredoka', system-ui, sans-serif;
          }
          .ronki-card-eyebrow {
            font-size: 10pt;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #6b7280;
            margin: 0 0 4mm 0;
          }
          .ronki-card-name {
            font-size: 28pt;
            font-weight: 700;
            margin: 0 0 8mm 0;
            color: #1a3c3f;
            line-height: 1.1;
          }
          .ronki-card-canvas {
            width: 70mm !important;
            height: 70mm !important;
            margin: 0 auto 8mm auto;
            border: 1px solid #e5e7eb;
            border-radius: 4mm;
            background: #ffffff;
          }
          .ronki-card-code {
            font-size: 22pt;
            font-weight: 700;
            letter-spacing: 0.20em;
            color: #1a3c3f;
            margin: 0 0 4mm 0;
          }
          .ronki-card-hint {
            font-size: 10pt;
            color: #4b5563;
            line-height: 1.4;
            margin: 0 0 8mm 0;
            max-width: 80mm;
          }
          .ronki-card-url {
            font-size: 9pt;
            color: #9ca3af;
            margin: 0;
            letter-spacing: 0.06em;
          }
          @page { size: A6 portrait; margin: 0; }
        }
      `}</style>
    </PainterlyShell>
  );
}
