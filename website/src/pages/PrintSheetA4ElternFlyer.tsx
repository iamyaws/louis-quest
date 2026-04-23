/**
 * Print-ready A4 sheet of 4 distinct A6 parent flyers, each a different
 * thematic entry-point to the Ronki pitch. For Elternabend handouts,
 * Grundschul-Eltern-Cafe tables, Kinderarzt-Wartezimmer, anywhere
 * parents might pick a flyer off a stack and read it in 20 seconds.
 *
 * The 4 fronts each hit a different emotional register — parent-reader
 * picks up one, it lands (or doesn't), they keep or pass. Variety of
 * entry-points means different parents see the flyer that speaks to them.
 *
 * Content drawn from voice work already shipped:
 *   1. 'Nur einmal' — the hero promise from HeroVariantF
 *   2. 'Pullover-Zahnpasta' — the opening vignette from the
 *      Unterföhringer Gemeindeblatt article, parents-morning-chaos
 *   3. 'Blöder Ronki' — Louis' unfiltered quote, authenticity angle
 *   4. 'Experiment' — the UeberMich origin frame, why-we-built-it
 *
 * Shared ParentBack on the reverse (3 differentiators + QR + signoff).
 *
 * Print output: 2-page A4 PDF
 *   Page 1: 4 distinct fronts tiled 2×2
 *   Page 2: 4× ParentBack tiled 2×2
 *
 * Workflow (same as Sammelkarten sheet):
 *   1. Print page 1 → 4 different fronts on one A4
 *   2. Flip paper, print page 2 → shared back on the other side
 *   3. Cut along center cross → 4 double-sided flyers
 *   Marc prints ~10 A4s, gets 40 flyers for Elternabend.
 */

import { useEffect } from 'react';
import { PhoneMockup } from '../components/PhoneMockup';

/* ── Shared app-mockup art block for every front ───────────── *
 * Repurposes the PhoneMockup component we built for the
 * Gemeindeblatt foto, scaled down for A6 (~42×75mm). Cream UI
 * background blends into cream-flyer variants; on the dark-teal
 * variant the cream phone reads as a brightly-lit screen in
 * a dim room — good contrast, intentional focus.
 *
 * Tilt is -4° by default (can be flipped per variant for the
 * flatlay-set rhythm across the 4 tiles). Drop-shadow is dual
 * for softness + definition; tighter on dark bg.
 * ─────────────────────────────────────────────────────────── */
type AppArtVariant = 'morgen-anchor' | 'clean-aufgaben' | 'zahne-quest' | 'mood-grid';
function AppArt({
  variant,
  tilt = -4,
  theme = 'light',
}: {
  variant: AppArtVariant;
  tilt?: number;
  theme?: 'light' | 'dark';
}) {
  return (
    <div className={`ef-stage ef-stage--${theme}`}>
      <div className="ef-mockup" style={{ transform: `rotate(${tilt}deg)` }}>
        <PhoneMockup variant={variant} scale={1.3} />
      </div>
    </div>
  );
}

const APP_QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

// QR for the dark-teal variant uses cream background so it scans cleanly
const APP_QR_URL_DARK =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

function CutMarks() {
  // Tick marks were 4mm long × 0.35mm thick — too faint, Marc nearly
  // missed them when cutting the first print. Bumped to 5mm × 0.7mm
  // with the center crosshair at 6mm × 0.5mm. Still subtle enough not
  // to dominate the design, but visible against a printed background.
  return (
    <svg
      className="cut-marks"
      viewBox="0 0 210 297"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="105" y1="0" x2="105" y2="5" />
      <line x1="105" y1="292" x2="105" y2="297" />
      <line x1="0" y1="148.5" x2="5" y2="148.5" />
      <line x1="205" y1="148.5" x2="210" y2="148.5" />
      <line x1="102" y1="148.5" x2="108" y2="148.5" className="ch" />
      <line x1="105" y1="145.5" x2="105" y2="151.5" className="ch" />
    </svg>
  );
}

/* ── Shared QR row (appears at bottom of every front) ─────── */

function QrRow({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const qrSrc = variant === 'dark' ? APP_QR_URL_DARK : APP_QR_URL;
  return (
    <div className={`ef-qr-row ef-qr-row--${variant}`}>
      <img src={qrSrc} alt="QR-Code zu ronki.de" className="ef-qr" />
      <div className="ef-qr-text">
        <p className="ef-qr-main">
          <strong>ronki.de</strong>
        </p>
        <p className="ef-qr-sub">Direkt im Browser, kostenlos.</p>
      </div>
    </div>
  );
}

/* ── Front 1: „Stell dir vor, du sagst es nur einmal" ──── *
 * Typography-heavy hero-echo. Most universal — the promise.
 * ─────────────────────────────────────────────────────────── */

function FrontNurEinmal() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--nur-einmal">
      <div className="ef-inner">
        <p className="ef-eyebrow">Für Eltern</p>

        <h2 className="ef-headline ef-headline--nur-einmal">
          Stell dir vor,
          <br />
          du sagst es
          <br />
          <span className="ef-mustard-underline">nur einmal</span>.
        </h2>

        <AppArt variant="morgen-anchor" tilt={-4} />

        <QrRow />
      </div>
    </section>
  );
}

/* ── Front 2: Pullover-Zahnpasta-Vignette ─────────────── *
 * The morning-chaos scene from the Gemeindeblatt article.
 * Highest resonance with real-parent-experience.
 * ─────────────────────────────────────────────────────────── */

function FrontPullover() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--pullover">
      <div className="ef-inner">
        <p className="ef-eyebrow">Viertel nach sieben</p>

        <p className="ef-vignette">
          Pulli an, Zähne nicht. Fleck. Umziehen. Ersatz-Pulli gefällt nicht.
          Seufzer, auf beiden Seiten.
        </p>

        <p className="ef-promise">
          Ronki macht den Morgen <em>ruhiger</em>.
        </p>

        <AppArt variant="clean-aufgaben" tilt={-4} />

        <QrRow />
      </div>
    </section>
  );
}

/* ── Front 3: „Blöder Ronki" (Louis-Zitat) ───────────── *
 * Dark-teal bg for contrast + visual variety on the sheet.
 * Authenticity angle — the kid roasts his own dad's app.
 * ─────────────────────────────────────────────────────────── */

function FrontBloederRonki() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--bloeder">
      <div className="ef-inner">
        <p className="ef-eyebrow ef-eyebrow--dark">Vater-Sohn-Projekt</p>

        <blockquote className="ef-quote">
          „Blöder Ronki, jetzt muss ich schon wieder meine Sachen machen."
        </blockquote>

        <p className="ef-attribution">&mdash; Louis, 7, Co-Designer</p>

        <AppArt variant="zahne-quest" tilt={-4} theme="dark" />

        <QrRow variant="dark" />
      </div>
    </section>
  );
}

/* ── Front 4: „Ronki ist ein Experiment" ─────────────── *
 * The why-we-built-it origin frame from UeberMich.
 * Builds trust for parents who want philosophy first.
 * ─────────────────────────────────────────────────────────── */

function FrontExperiment() {
  return (
    <section className="flyer-page ef-flyer ef-flyer--experiment">
      <div className="ef-inner">
        <p className="ef-eyebrow">Warum wir das machen</p>

        <h2 className="ef-headline ef-headline--experiment">
          Ronki ist kein Produkt. <em>Es ist ein Experiment.</em>
        </h2>

        <p className="ef-body">
          Ich arbeite als Gaming-Consultant. Ich weiß, wie Apps Kinder festhalten.
          Ich wollte das nie in der Hand meines Kindes sehen.
        </p>

        <AppArt variant="mood-grid" tilt={-4} />

        <QrRow />
      </div>
    </section>
  );
}

/* ── ParentBack: shared on all 4 cells, reverse side ──── *
 * Consistent pitch: 3 differentiators + QR + signoff.
 * ─────────────────────────────────────────────────────────── */

function ParentBack() {
  return (
    <section className="flyer-page parent-back">
      <div className="parent-back-inner">
        <p className="pb-eyebrow">Für Eltern</p>

        <h2 className="pb-headline">
          Ronki ist <em>anders gebaut</em>.
        </h2>

        <p className="pb-sub">
          Ein Drachen-Gefährte für Morgen- und Abendroutine. Ohne Streaks,
          ohne Werbung, ohne Dark Patterns.
        </p>

        <ul className="pb-points">
          <li>
            <span className="pb-check" aria-hidden>✓</span>
            <span>
              <strong>Keine App-Tricks.</strong> Keine Streaks, keine Push, keine In-App-Käufe.
            </span>
          </li>
          <li>
            <span className="pb-check" aria-hidden>✓</span>
            <span>
              <strong>Begleitet, kontrolliert nicht.</strong> Dein Kind entscheidet Tempo. Du siehst die Woche, ohne zu steuern.
            </span>
          </li>
          <li>
            <span className="pb-check" aria-hidden>✓</span>
            <span>
              <strong>Privacy-first.</strong> EU-Hosting, keine Cookies, keine personenbezogenen Profile.
            </span>
          </li>
        </ul>

        <div className="pb-qr-row">
          <img src={APP_QR_URL} alt="QR-Code zu ronki.de" className="pb-qr" />
          <div className="pb-qr-text">
            <p className="pb-qr-main">
              <strong>ronki.de</strong>
            </p>
            <p className="pb-qr-sub">Kostenlos, ohne Anmeldung.</p>
          </div>
        </div>

        <p className="pb-signoff">
          Marc &amp; Louis &middot; Unterföhring
          <br />
          <span className="pb-signoff-mail">hallo@ronki.de</span>
        </p>
      </div>
    </section>
  );
}

/* ── Sheet page ─────────────────────────────────────────── */

export default function PrintSheetA4ElternFlyer() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>
          A4-Bogen Eltern-Flyer &middot; 4 Themen + gemeinsame Rückseite
        </strong>
        <span style={{ opacity: 0.75, marginLeft: 10, fontSize: 11.5 }}>
          Seite 1 = 4 Front-Varianten (Nur einmal &middot; Pullover &middot;
          Blöder Ronki &middot; Experiment) &middot; Seite 2 = Rückseite 4&times;
        </span>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Bogen 1: 4 Front-Varianten ───────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 1 · Vorderseiten (4 Themen)</div>
        <CutMarks />
        <div className="sheet-cell">
          <FrontNurEinmal />
        </div>
        <div className="sheet-cell">
          <FrontPullover />
        </div>
        <div className="sheet-cell">
          <FrontBloederRonki />
        </div>
        <div className="sheet-cell">
          <FrontExperiment />
        </div>
      </section>

      {/* ── Bogen 2: Rückseiten ──────────────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 2 · Rückseiten (4× gleich)</div>
        <CutMarks />
        {[0, 1, 2, 3].map((i) => (
          <div className="sheet-cell" key={`back-${i}`}>
            <ParentBack />
          </div>
        ))}
      </section>

      <style>{sheetCss + flyerFrontsCss + parentBackCss}</style>
    </div>
  );
}

/* ── Sheet + print-page CSS ──────────────────────────────── */

const sheetCss = `
  .print-root {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    min-height: 100vh;
    padding: 32px 16px 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
  }
  .print-root * { box-sizing: border-box; }

  .a4-sheet {
    width: 210mm;
    height: 297mm;
    background: white;
    display: grid;
    grid-template-columns: repeat(2, 105mm);
    grid-template-rows: repeat(2, 148mm);
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 24px rgba(0,0,0,0.15);
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .sheet-cell {
    position: relative;
    width: 105mm;
    height: 148mm;
    overflow: hidden;
  }

  .cut-marks {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 20;
  }
  .cut-marks line {
    stroke: #1A3C3F;
    stroke-width: 0.7;
    vector-effect: non-scaling-stroke;
    stroke-linecap: round;
  }
  .cut-marks line.ch {
    stroke-width: 0.5;
    opacity: 0.45;
  }

  .sheet-label {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1A3C3F;
    color: #FDF8F0;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 5px 12px;
    border-radius: 999px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  @media print {
    @page { size: A4; margin: 0; }
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
    .a4-sheet {
      box-shadow: none !important;
      margin: 0 !important;
      page-break-after: always;
      break-after: page;
    }
    .a4-sheet:last-of-type {
      page-break-after: auto;
      break-after: auto;
    }
    .no-print { display: none !important; }
    * {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }
  }
`;

/* ── Front-variants CSS ─────────────────────────────────── */

const flyerFrontsCss = `
  /* Base flyer container. Each variant adds its own bg + accent. */
  .ef-flyer {
    width: 105mm;
    height: 148mm;
    overflow: hidden;
    position: relative;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .ef-flyer::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4mm;
    background: linear-gradient(90deg, #FCD34D, #50A082);
  }
  .ef-inner {
    height: 100%;
    padding: 8mm 7mm 6mm;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
    gap: 2mm;
  }
  .ef-spacer { flex: 1; min-height: 2mm; }

  /* ── App-art stage ─────────────────────────────────────── *
   * Flex-grow area between text + QR. Mockup is absolutely
   * positioned so it can overflow the stage visually (tilt
   * gives it slight corner bleed) without breaking layout. */
  .ef-stage {
    flex: 1;
    min-height: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1mm 0 2mm;
  }
  .ef-mockup {
    width: 44mm;
    height: 79mm;
    border-radius: 3mm;
    overflow: hidden;
    box-shadow:
      0 3mm 6mm rgba(26,60,63,0.22),
      0 1mm 2mm rgba(26,60,63,0.12);
    transform-origin: center center;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .ef-stage--dark .ef-mockup {
    /* Cream UI on dark teal bg — add warm rim + deeper shadow
       so the phone reads as a lit screen in a dim room, not
       a pasted rectangle. */
    box-shadow:
      0 0 0 0.3mm rgba(253,248,240,0.08),
      0 4mm 8mm rgba(0,0,0,0.45),
      0 1mm 2mm rgba(0,0,0,0.3);
  }

  .ef-eyebrow {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #50A082;
    margin: 0;
  }
  .ef-eyebrow--dark {
    color: #FCD34D;
  }

  .ef-body {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8pt;
    line-height: 1.4;
    color: rgba(26,60,63,0.82);
    margin: 0;
  }
  .ef-body--dark {
    color: rgba(253,248,240,0.85);
  }

  /* ── Variant 1: Nur Einmal (cream + big type) ── */
  .ef-flyer--nur-einmal {
    background: #FDF8F0;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 0%, rgba(80,160,130,0.15) 0%, transparent 60%);
  }
  .ef-headline--nur-einmal {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 18pt;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: #1A3C3F;
    margin: 0;
  }
  .ef-mustard-underline {
    position: relative;
    display: inline-block;
    white-space: nowrap;
  }
  .ef-mustard-underline::after {
    content: "";
    position: absolute;
    bottom: 0.2mm;
    left: 0;
    right: 0;
    height: 3.5mm;
    background: rgba(252,211,77,0.55);
    z-index: -1;
    border-radius: 1mm;
  }

  /* ── Variant 2: Pullover (cream + mustard glow + vignette style) ── */
  .ef-flyer--pullover {
    background: #FDF8F0;
    background-image:
      radial-gradient(ellipse 120% 70% at 50% 0%, rgba(252,211,77,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 90% 50% at 100% 100%, rgba(80,160,130,0.12) 0%, transparent 55%);
  }
  .ef-vignette {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8.5pt;
    line-height: 1.4;
    color: rgba(26,60,63,0.88);
    margin: 0;
  }
  .ef-reveal {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 10pt;
    font-style: italic;
    color: #50A082;
    line-height: 1.25;
    margin: 0;
  }
  .ef-promise {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 11pt;
    color: #1A3C3F;
    line-height: 1.2;
    margin: 0;
    letter-spacing: -0.01em;
  }
  .ef-promise em {
    font-style: italic;
    color: #50A082;
  }

  /* ── Variant 3: Blöder Ronki (dark teal + quote dominant) ── */
  .ef-flyer--bloeder {
    background: #1A3C3F;
    background-image:
      radial-gradient(ellipse 100% 70% at 0% 0%, rgba(45,90,94,0.5) 0%, transparent 60%),
      radial-gradient(ellipse 90% 60% at 100% 100%, rgba(80,160,130,0.2) 0%, transparent 55%);
  }
  .ef-flyer--bloeder::before {
    background: linear-gradient(90deg, #50A082, #FCD34D);
    opacity: 0.8;
  }
  .ef-quote {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 13pt;
    font-style: italic;
    line-height: 1.22;
    color: #FDF8F0;
    margin: 0;
    letter-spacing: -0.01em;
  }
  .ef-attribution {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 700;
    color: #FCD34D;
    letter-spacing: 0.04em;
    margin: 0;
  }

  /* ── Variant 4: Experiment (cream + sage accent, philosophy) ── */
  .ef-flyer--experiment {
    background: #FDF8F0;
    background-image:
      radial-gradient(ellipse 100% 70% at 0% 100%, rgba(80,160,130,0.15) 0%, transparent 60%);
  }
  .ef-headline--experiment {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 13pt;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: #1A3C3F;
    margin: 0;
  }
  .ef-headline--experiment em {
    font-style: italic;
    color: #50A082;
    font-weight: 700;
  }
  .ef-signature {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: 7.5pt;
    color: rgba(26,60,63,0.65);
    margin: 0;
    letter-spacing: 0.04em;
  }

  /* ── Shared QR row ── */
  .ef-qr-row {
    display: flex;
    align-items: center;
    gap: 2.5mm;
    padding-top: 3mm;
    border-top: 0.3mm dashed rgba(26,60,63,0.25);
  }
  .ef-qr-row--dark {
    border-top-color: rgba(253,248,240,0.25);
  }
  .ef-qr {
    width: 15mm;
    height: 15mm;
    border-radius: 1mm;
    border: 0.3mm solid rgba(26,60,63,0.12);
    flex-shrink: 0;
  }
  .ef-qr-text { flex: 1; }
  .ef-qr-main {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 9pt;
    color: #1A3C3F;
    margin: 0;
    line-height: 1.1;
  }
  .ef-qr-row--dark .ef-qr-main {
    color: #FDF8F0;
  }
  .ef-qr-main strong {
    color: #B45309;
    font-weight: 800;
  }
  .ef-qr-row--dark .ef-qr-main strong {
    color: #FCD34D;
  }
  .ef-qr-sub {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 7pt;
    color: rgba(26,60,63,0.6);
    margin: 0.5mm 0 0;
    line-height: 1.3;
  }
  .ef-qr-row--dark .ef-qr-sub {
    color: rgba(253,248,240,0.7);
  }
`;

/* ── Parent-back CSS ─────────────────────────────────────── */

const parentBackCss = `
  .parent-back {
    background: #FDF8F0;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 0%, rgba(80,160,130,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 90% 50% at 0% 100%, rgba(252,211,77,0.22) 0%, transparent 55%);
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    width: 105mm;
    height: 148mm;
    position: relative;
    overflow: hidden;
  }
  .parent-back::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4mm;
    background: linear-gradient(90deg, #50A082, #FCD34D);
  }
  .parent-back-inner {
    height: 100%;
    padding: 9mm 8mm 7mm;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
  }

  .pb-eyebrow {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 800;
    color: #50A082;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0 0 2.5mm;
  }

  .pb-headline {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 800;
    font-size: 17pt;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #1A3C3F;
    margin: 0 0 2mm;
  }
  .pb-headline em {
    font-style: italic;
    color: #50A082;
  }

  .pb-sub {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 9pt;
    line-height: 1.4;
    color: rgba(26,60,63,0.78);
    margin: 0 0 5mm;
  }

  .pb-points {
    list-style: none;
    padding: 0;
    margin: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2.5mm;
  }
  .pb-points > li {
    display: grid;
    grid-template-columns: 5mm 1fr;
    gap: 2.5mm;
    align-items: start;
    padding: 2.5mm 3mm;
    background: rgba(255,255,255,0.7);
    border-radius: 2mm;
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 8.5pt;
    line-height: 1.4;
    color: rgba(26,60,63,0.85);
  }
  .pb-points strong {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 700;
    color: #1A3C3F;
  }
  .pb-check {
    color: #50A082;
    font-weight: 800;
    font-size: 11pt;
    line-height: 1;
    padding-top: 0.2mm;
  }

  .pb-qr-row {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin: 4mm 0 3mm;
    padding: 3mm 0;
    border-top: 0.3mm dashed rgba(26,60,63,0.2);
  }
  .pb-qr {
    width: 20mm;
    height: 20mm;
    border-radius: 1.5mm;
    border: 0.3mm solid rgba(26,60,63,0.15);
    flex-shrink: 0;
  }
  .pb-qr-text { flex: 1; }
  .pb-qr-main {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 11pt;
    color: #1A3C3F;
    margin: 0 0 1mm;
    letter-spacing: -0.01em;
  }
  .pb-qr-main strong {
    color: #B45309;
    font-weight: 800;
  }
  .pb-qr-sub {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
    font-size: 7.5pt;
    color: rgba(26,60,63,0.65);
    margin: 0;
    line-height: 1.3;
  }

  .pb-signoff {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 7.5pt;
    font-weight: 700;
    color: rgba(26,60,63,0.65);
    margin: 0;
    text-align: center;
    letter-spacing: 0.04em;
    line-height: 1.4;
  }
  .pb-signoff-mail {
    font-weight: 500;
    color: rgba(26,60,63,0.5);
    letter-spacing: 0.02em;
  }
`;

const instructionBarStyle: React.CSSProperties = {
  position: 'sticky',
  top: 16,
  zIndex: 30,
  background: '#1A3C3F',
  color: '#FDF8F0',
  padding: '10px 18px',
  borderRadius: 999,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  maxWidth: 960,
  width: '100%',
};

const printBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  background: '#FCD34D',
  color: '#1A3C3F',
  border: 0,
  padding: '6px 14px',
  borderRadius: 999,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 12,
  cursor: 'pointer',
  flexShrink: 0,
};
