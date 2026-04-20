/**
 * Shared print-ready A4 poster shell.
 *
 * Each concrete poster (Hort, Bäckerei, Kinderarzt, Zähne, Anti-Engagement,
 * etc.) is a thin component that instantiates this shell with its own data.
 * Keeps layout + print-CSS + theme variables in one place so new variants
 * can be added in a few lines.
 *
 * Optional `phoneScreenshot` prop swaps the hero for a phone-frame with a
 * real app screenshot inside. When omitted, only the painterly hero renders.
 */

import { ReactNode, useEffect } from 'react';

type PosterTheme = 'warm' | 'evening' | 'morning' | 'quiet' | 'cool' | 'bold';

export interface PosterStep {
  content: ReactNode;
}

export interface PosterConfig {
  /** Small uppercase caption above the wordmark */
  eyebrow: string;
  /** Massive top headline — ReactNode so variants can add <em> / <span> for emphasis */
  headline: ReactNode;
  /** One-line subline under the headline */
  subline: ReactNode;
  /** Multi-sentence body paragraph */
  body: ReactNode;
  /** Short intro above the numbered step list */
  ctaHeading: string;
  /** 3-4 numbered steps */
  steps: PosterStep[];
  /** Small grey footer line below the steps */
  footer: string;
  /** Painterly hero image path (e.g. /art/companion/dragon-baby.webp) */
  heroSrc: string;
  heroAlt?: string;
  /** Optional phone-frame inset with app screenshot — overlays bottom-right */
  phoneScreenshot?: {
    src: string;
    caption?: string;
  };
  /** QR code destination path on ronki.de (default: /installieren) */
  qrPath?: string;
  /** Color palette variant */
  theme: PosterTheme;
}

const QR_BASE =
  'https://api.qrserver.com/v1/create-qr-code/?size=800x800&format=png&margin=8';

export function PosterShell({ config }: { config: PosterConfig }) {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const qrTarget = encodeURIComponent(
    `https://www.ronki.de${config.qrPath || '/installieren'}`,
  );
  const qrColor = config.theme === 'bold' ? 'fdf8f0' : '1a3c3f';
  const qrBg = config.theme === 'bold' ? '1a3c3f' : 'fdf8f0';
  const qrUrl = `${QR_BASE}&data=${qrTarget}&color=${qrColor}&bgcolor=${qrBg}`;

  return (
    <div className="print-root">
      {/* ── Instruction bar (hidden in print) ─────────────────────── */}
      <div className="no-print">
        <strong style={{ fontWeight: 700 }}>A4-Poster Druckvorschau</strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Cmd/Ctrl + P &middot; Papierformat: A4 &middot; Ränder: Keine &middot;
          Hintergrundgrafiken: Ein
        </span>
        <button onClick={() => window.print()} className="print-btn">
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Poster page ──────────────────────────────────────────── */}
      <section className={`poster-page poster-${config.theme}`}>
        <div className="poster-inner">
          <p className="eyebrow">{config.eyebrow}</p>
          <h1 className="headline">{config.headline}</h1>
          <p className="subline">{config.subline}</p>

          <div className="hero-wrap">
            <img
              src={config.heroSrc}
              alt={config.heroAlt || ''}
              className="hero"
              width={600}
              height={600}
            />
            {config.phoneScreenshot && (
              <figure className="phone-inset">
                <div className="phone-frame">
                  <div className="phone-notch" aria-hidden />
                  <img
                    src={config.phoneScreenshot.src}
                    alt=""
                    className="phone-screen"
                    onError={(e) => {
                      // Graceful fallback: if the screenshot file isn't in
                      // the repo yet, hide the whole phone inset so the
                      // poster still looks good with only the painterly hero.
                      const inset = (e.currentTarget as HTMLElement).closest('.phone-inset');
                      if (inset) (inset as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                {config.phoneScreenshot.caption && (
                  <figcaption className="phone-caption">
                    {config.phoneScreenshot.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>

          <p className="body-text">{config.body}</p>

          <div className="bottom-row">
            <div className="cta-text">
              <p className="cta-heading">{config.ctaHeading}</p>
              <ol className="cta-steps">
                {config.steps.map((step, i) => (
                  <li key={i}>{step.content}</li>
                ))}
              </ol>
              <p className="cta-footer">{config.footer}</p>
            </div>
            <div className="qr-wrap">
              <img
                src={qrUrl}
                alt={`QR-Code zu ronki.de${config.qrPath || '/installieren'}`}
                className="qr"
              />
              <p className="qr-label">Scannen &amp; starten</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Base ───────────────────────────────────────────────── */
        .print-root {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          color: #1A3C3F;
          min-height: 100vh;
          padding: 32px 16px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .print-root * { box-sizing: border-box; }

        .no-print {
          position: sticky;
          top: 16px;
          z-index: 20;
          background: #1A3C3F;
          color: #FDF8F0;
          padding: 10px 18px;
          border-radius: 999px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          max-width: 720px;
          width: 100%;
        }
        .print-btn {
          margin-left: auto;
          background: #FCD34D;
          color: #1A3C3F;
          border: 0;
          padding: 6px 14px;
          border-radius: 999px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── Poster Page ────────────────────────────────────────── */
        .poster-page {
          width: 210mm;
          height: 297mm;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          position: relative;
          --bg: #FDF8F0;
          --bg-accent-1: rgba(252,211,77,0.22);
          --bg-accent-2: rgba(80,160,130,0.14);
          --stripe: #FCD34D;
          --text-primary: #1A3C3F;
          --text-secondary: #2D5A5E;
          --text-muted: rgba(26,60,63,0.55);
          --highlight: #2D5A5E;
          --step-number: #50A082;
          --border: rgba(26,60,63,0.15);
        }
        .poster-warm {
          --bg: #FDF8F0;
          --bg-accent-1: rgba(252,211,77,0.22);
          --bg-accent-2: rgba(80,160,130,0.14);
          --stripe: #FCD34D;
          --highlight: #2D5A5E;
          --step-number: #50A082;
        }
        .poster-evening {
          --bg: #FDF8F0;
          --bg-accent-1: rgba(26,60,63,0.14);
          --bg-accent-2: rgba(252,211,77,0.20);
          --stripe: #1A3C3F;
          --highlight: #2D5A5E;
          --step-number: #2D5A5E;
        }
        .poster-morning {
          --bg: #FDF8F0;
          --bg-accent-1: rgba(252,211,77,0.32);
          --bg-accent-2: rgba(217,119,6,0.10);
          --stripe: #D97706;
          --highlight: #B45309;
          --step-number: #B45309;
        }
        .poster-quiet {
          --bg: #FDF8F0;
          --bg-accent-1: rgba(80,160,130,0.16);
          --bg-accent-2: rgba(45,90,94,0.08);
          --stripe: #50A082;
          --highlight: #2D5A5E;
          --step-number: #50A082;
        }
        .poster-cool {
          --bg: #F4FAF7;
          --bg-accent-1: rgba(80,160,130,0.22);
          --bg-accent-2: rgba(45,90,94,0.10);
          --stripe: #50A082;
          --highlight: #50A082;
          --step-number: #50A082;
        }
        .poster-bold {
          --bg: #1A3C3F;
          --bg-accent-1: rgba(252,211,77,0.22);
          --bg-accent-2: rgba(80,160,130,0.14);
          --stripe: #FCD34D;
          --text-primary: #FDF8F0;
          --text-secondary: #FCD34D;
          --text-muted: rgba(253,248,240,0.55);
          --highlight: #FCD34D;
          --step-number: #FCD34D;
          --border: rgba(253,248,240,0.15);
        }
        .poster-page {
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 70% 45% at 75% 18%, var(--bg-accent-1) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 15% 82%, var(--bg-accent-2) 0%, transparent 60%);
          color: var(--text-primary);
        }
        .poster-page::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4mm;
          background: var(--stripe);
        }
        .poster-inner {
          height: 100%;
          padding: 20mm 18mm 16mm;
          display: flex;
          flex-direction: column;
        }

        .eyebrow {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9pt;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin: 0 0 6mm;
          text-align: center;
        }
        .headline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 42pt;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 0;
          text-align: center;
          text-wrap: balance;
        }
        .headline em {
          font-style: italic;
          color: var(--highlight);
          font-weight: 700;
        }
        .subline {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 600;
          font-size: 15pt;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: var(--text-secondary);
          margin: 6mm 0 0;
          text-align: center;
          text-wrap: balance;
        }

        .hero-wrap {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
          margin: 6mm 0;
        }
        .hero {
          width: 92mm;
          height: 92mm;
          object-fit: cover;
          border-radius: 10mm;
          box-shadow: 0 10mm 20mm -5mm rgba(26,60,63,0.25);
        }

        /* Phone inset — bottom right of hero area */
        .phone-inset {
          position: absolute;
          right: 0;
          bottom: -4mm;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .phone-frame {
          width: 38mm;
          height: 68mm;
          background: #1A3C3F;
          border-radius: 5mm;
          padding: 1.5mm;
          box-shadow: 0 6mm 15mm -4mm rgba(26,60,63,0.4);
          position: relative;
        }
        .phone-notch {
          position: absolute;
          top: 2mm;
          left: 50%;
          transform: translateX(-50%);
          width: 10mm;
          height: 2mm;
          background: #1A3C3F;
          border-radius: 1mm;
          z-index: 2;
        }
        .phone-screen {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 3.5mm;
          display: block;
        }
        .phone-caption {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7pt;
          font-weight: 600;
          color: var(--text-muted);
          margin: 2mm 0 0;
          text-align: center;
          letter-spacing: 0.02em;
          max-width: 38mm;
        }

        .body-text {
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 10.5pt;
          line-height: 1.5;
          color: var(--text-primary);
          opacity: 0.85;
          margin: 0 0 6mm;
          text-align: center;
          text-wrap: pretty;
          max-width: 155mm;
          margin-left: auto;
          margin-right: auto;
        }
        .poster-bold .body-text { opacity: 0.9; }
        .body-text em {
          font-style: italic;
          color: var(--highlight);
          font-weight: 600;
          opacity: 1;
        }

        .bottom-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10mm;
          align-items: center;
          padding-top: 6mm;
          border-top: 0.5mm solid var(--border);
        }
        .cta-text { min-width: 0; }
        .cta-heading {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 11pt;
          color: var(--text-primary);
          margin: 0 0 2mm;
          letter-spacing: -0.005em;
        }
        .cta-steps {
          counter-reset: step;
          list-style: none;
          padding: 0;
          margin: 0 0 4mm;
          display: flex;
          flex-direction: column;
          gap: 1.8mm;
        }
        .cta-steps > li {
          counter-increment: step;
          position: relative;
          padding-left: 6.5mm;
          font-family: 'Be Vietnam Pro', system-ui, sans-serif;
          font-size: 9.5pt;
          line-height: 1.35;
          color: var(--text-primary);
        }
        .cta-steps > li::before {
          content: counter(step, decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 8pt;
          color: var(--step-number);
          letter-spacing: 0.03em;
        }
        .cta-steps strong {
          color: var(--text-primary);
          font-weight: 700;
        }
        .cta-footer {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 7pt;
          color: var(--text-muted);
          margin: 0;
          letter-spacing: 0.02em;
          line-height: 1.4;
        }

        .qr-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2mm;
        }
        .qr {
          width: 42mm;
          height: 42mm;
          border-radius: 3mm;
          background: var(--bg);
        }
        .qr-label {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 8pt;
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Print ──────────────────────────────────────────────── */
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .print-root {
            padding: 0 !important;
            gap: 0 !important;
            align-items: stretch !important;
            min-height: 0 !important;
          }
          .poster-page {
            box-shadow: none !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
