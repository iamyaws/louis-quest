import React, { useState, useRef, useEffect } from 'react';
import { setActiveToken } from '../lib/profileToken';

const base = import.meta.env.BASE_URL;
const TOKEN_REGEX = /^[a-f0-9]{32}$/;

/**
 * Extract a profile token from QR data. Two encodings supported:
 *   1. Raw 32-hex string  ('a3f7c2e1b9d5408f2761c8e4ab90f3d6')
 *   2. Share URL with ?p=<32hex>  ('https://app.ronki.de/?p=a3f7c2e1...')
 *
 * The dashboard QR canvas encodes the URL form (so a phone's default
 * camera can auto-launch the link). The in-app scanner accepts either.
 */
function tokenFromQRData(data) {
  if (!data || typeof data !== 'string') return null;
  const trimmed = data.trim();
  const lower = trimmed.toLowerCase();
  if (TOKEN_REGEX.test(lower)) return lower;
  try {
    const url = new URL(trimmed);
    const p = url.searchParams.get('p');
    if (p && TOKEN_REGEX.test(p.toLowerCase())) return p.toLowerCase();
  } catch { /* not a URL — fall through */ }
  return null;
}

/**
 * NoProfileLanding — first-screen for visitors with no profile token.
 *
 * BeyArena pattern (Marc 3 May 2026): the app stays a kid-only space.
 * Setup happens on the website at ronki.de/profil-erstellen — parent
 * fills a one-screen form on their laptop/phone, the site generates a
 * token + seeds the cloud row + renders a printable QR card. The kid
 * scans that card on their tablet here.
 *
 * One primary CTA ("QR-Code scannen") plus a smaller Eltern-callout
 * pointing to the website for new cards. No in-app form, no manual
 * code entry, no email, no password.
 *
 * Scan flow: opens device back-camera (facingMode environment), runs
 * jsQR per-frame on a hidden canvas, validates the decoded URL or
 * token, persists via setActiveToken, hard-reloads so AuthGate picks
 * up the token via getActiveToken() and routes to the cloud-load
 * flow in TaskContext.
 *
 * Fallback for "no camera on this device": the share URL the website
 * also produces (parent taps "Link teilen" on the success screen)
 * encodes ?p=<token> in app.ronki.de — opening that URL bypasses
 * NoProfileLanding entirely (AuthGate's getActiveToken consumes the
 * URL param on first mount).
 */
export default function NoProfileLanding() {
  const [mode, setMode] = useState('choice'); // 'choice' | 'scan'
  const [scanError, setScanError] = useState('');
  const [scanStatus, setScanStatus] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const detectedRef = useRef(false); // prevent double-trigger after success

  const stopScan = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch { /* track already stopped */ }
      });
      streamRef.current = null;
    }
  };

  // Cleanup on unmount — releases the camera if the user navigates
  // away mid-scan (e.g., back-button to OS).
  useEffect(() => stopScan, []);

  useEffect(() => {
    if (mode !== 'scan') return undefined;
    let cancelled = false;

    (async () => {
      setScanError('');
      setScanStatus('Kamera wird gestartet…');
      detectedRef.current = false;

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw Object.assign(new Error('NoMediaDevices'), { name: 'NotSupportedError' });
        }
        // Prefer the back camera (environment) so the kid can hold the
        // tablet flat and point it at the parent's QR card without
        // seeing themselves in the way. Falls back to whatever the
        // browser hands back if 'environment' isn't available.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // iOS Safari needs both attributes + a play() call before
          // the stream renders. playsInline keeps it from going
          // fullscreen on tap.
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          try { await videoRef.current.play(); } catch { /* autoplay blocked — surfaces below */ }
          setScanStatus('Halte den QR-Code in den Rahmen.');
        }

        // Lazy-import jsQR (~30KB) — only loads when the user actually
        // taps "QR scannen", keeping the initial bundle slim.
        const jsQRMod = await import('jsqr');
        if (cancelled) return;
        const jsQR = jsQRMod.default;

        const tick = () => {
          if (cancelled || detectedRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (video.readyState < 2) {
            // HAVE_CURRENT_DATA — wait for the first frame
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (!w || !h) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, w, h);
          let imageData;
          try {
            imageData = ctx.getImageData(0, 0, w, h);
          } catch {
            // Cross-origin canvas tainting shouldn't happen for camera
            // streams, but guard anyway — fall through to next frame.
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            const token = tokenFromQRData(code.data);
            if (token) {
              detectedRef.current = true;
              setScanStatus('Code erkannt — du wirst weitergeleitet…');
              try {
                setActiveToken(token);
                stopScan();
                // Hard reload so AuthGate re-resolves with the new
                // token + syncLoadByToken pulls cloud state.
                window.location.reload();
                return;
              } catch {
                setScanError('Konnte den Code nicht speichern. Versuch noch einmal.');
                detectedRef.current = false;
              }
            }
            // Found a QR but it wasn't a Ronki token — keep scanning
            // silently rather than spamming an error.
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (cancelled) return;
        const name = err?.name || '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setScanError('Kamera-Zugriff fehlt. Bitte in den Browser-Einstellungen erlauben.');
        } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          setScanError('Keine Kamera gefunden.');
        } else if (name === 'NotSupportedError') {
          setScanError('Dein Browser unterstützt keinen Kamera-Zugriff.');
        } else {
          setScanError('Kamera konnte nicht gestartet werden.');
        }
        setScanStatus('');
      }
    })();

    return () => {
      cancelled = true;
      stopScan();
    };
  }, [mode]);

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
            {mode === 'choice' ? 'Hast du eine Karte?' : 'QR-Code scannen'}
          </h1>
          {mode === 'choice' && (
            <p className="font-body text-base text-on-surface-variant mt-3 leading-relaxed">
              Mama oder Papa haben dir eine Karte gezeigt oder gegeben? Halte sie gleich vor die Kamera.
            </p>
          )}
          {mode === 'scan' && (
            <p className="font-body text-base text-on-surface-variant mt-3 leading-relaxed">
              Halte die Kamera auf den ausgedruckten oder gezeigten QR-Code.
            </p>
          )}
        </div>

        {mode === 'choice' && (
          <>
            {/* QR scan — primary CTA */}
            <button
              type="button"
              onClick={() => setMode('scan')}
              className="w-full py-5 px-6 rounded-2xl font-headline font-bold text-lg flex items-center gap-4 active:scale-[0.99] transition-all text-left"
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
                  qr_code_scanner
                </span>
              </div>
              <div className="flex-1">
                <p className="text-lg leading-tight">QR-Code scannen</p>
                <p className="font-body font-normal text-xs text-white/75 mt-1">
                  Halte die Kamera auf die Karte — und los geht's.
                </p>
              </div>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            {/* Parent path: send them to the website to create a card.
                Marc 3 May 2026 northstar: setup happens on the website,
                not in the app. The app stays a kid-only space. */}
            <div className="mt-8 rounded-2xl px-5 py-4 text-center"
                 style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(18,67,70,0.10)' }}>
              <p className="font-label font-bold text-xs uppercase tracking-[0.10em] mb-1.5" style={{ color: '#A83E2C' }}>
                Für Eltern
              </p>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
                Noch keine Karte? Erstellt sie in einer Minute auf der Webseite — kein Konto, keine Mail, kein Passwort.
              </p>
              <a
                href="https://www.ronki.de/profil-erstellen"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-label font-bold text-sm"
                style={{ color: '#124346' }}
              >
                ronki.de/profil-erstellen
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>
            </div>
          </>
        )}

        {mode === 'scan' && (
          <div className="flex flex-col">
            {/* Camera preview frame */}
            <div
              className="relative w-full rounded-3xl overflow-hidden mx-auto"
              style={{
                aspectRatio: '1 / 1',
                maxWidth: 360,
                background: '#0c4a6e',
                boxShadow: '0 18px 40px rgba(12,74,110,0.35)',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                aria-label="Kamera-Vorschau"
              />
              {/* Hidden canvas — used for jsQR sampling, not visible. */}
              <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

              {/* Scan-zone overlay — decorative corner brackets so the
                  kid knows where to point. jsQR scans the full frame; the
                  brackets just guide aiming. */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="relative"
                  style={{ width: '70%', height: '70%' }}
                >
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
                    const map = {
                      'top-left': { top: 0, left: 0, borderTop: '4px solid #fff', borderLeft: '4px solid #fff', borderTopLeftRadius: 16 },
                      'top-right': { top: 0, right: 0, borderTop: '4px solid #fff', borderRight: '4px solid #fff', borderTopRightRadius: 16 },
                      'bottom-left': { bottom: 0, left: 0, borderBottom: '4px solid #fff', borderLeft: '4px solid #fff', borderBottomLeftRadius: 16 },
                      'bottom-right': { bottom: 0, right: 0, borderBottom: '4px solid #fff', borderRight: '4px solid #fff', borderBottomRightRadius: 16 },
                    };
                    return (
                      <div
                        key={pos}
                        className="absolute"
                        style={{ width: 36, height: 36, ...map[pos] }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status / error */}
            <div className="mt-6 min-h-[48px] text-center">
              {scanError ? (
                <p className="font-body text-sm leading-relaxed" style={{ color: '#dc2626' }}>
                  {scanError}
                </p>
              ) : (
                <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                  {scanStatus || 'Halte den QR-Code in den Rahmen.'}
                </p>
              )}
            </div>

            {/* Cancel back to choice */}
            <button
              type="button"
              onClick={() => setMode('choice')}
              className="mt-6 w-full py-4 rounded-full font-label font-bold text-sm active:scale-[0.97] transition-transform"
              style={{
                background: 'rgba(18,67,70,0.08)',
                color: '#124346',
                border: '1.5px solid rgba(18,67,70,0.18)',
                minHeight: 48,
              }}
            >
              Abbrechen
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
