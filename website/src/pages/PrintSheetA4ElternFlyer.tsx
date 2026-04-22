/**
 * Print-ready A4 sheet for parent-facing flyers (Elternabend, Schulhof-
 * Parent-Hand-Off, Ratgeber-Kanzleien, ...).
 *
 * Reuses the Sammelkarten card-front (kids love it, it's what they see
 * in school) but flips the back to a parent-targeted pitch: what Ronki
 * is, why it's different, how to try. Same 4-up A6 tiling so Marc can
 * print one A4, flip, print the back, cut into 4 flyers per sheet.
 *
 * Produces a 3-page A4 PDF on print:
 *   Page 1 (Cover A): 4 different dragons, card-front visual
 *   Page 2 (Cover B): 4 different dragons (same pool, different rotation)
 *   Page 3 (Rückseite): same parent-pitch × 4, tiled
 *
 * Workflow (identical to Sammelkarten sheet — parents who've seen the
 * Kids cards at school will recognize the aesthetic, which is the point):
 *   1. Print page 1 → 4 fronts on sheet A
 *   2. Flip, print page 3 → 4 parent-backs on sheet A
 *   3. Repeat for sheet B using page 2 + page 3
 *   4. Cut both sheets along center cross → 8 double-sided flyers
 */

import { useEffect, useState } from 'react';
import {
  CardFront,
  CardBack,
  DRAGONS,
  cardCss,
  type Dragon,
} from './PrintA6FlyerKidsCard';

const APP_QR_URL =
  'https://api.qrserver.com/v1/create-qr-code/?' +
  'data=https%3A%2F%2Fwww.ronki.de%2Finstallieren' +
  '&size=500x500&format=png&margin=8&color=1a3c3f&bgcolor=fdf8f0';

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function CutMarks() {
  return (
    <svg
      className="cut-marks"
      viewBox="0 0 210 297"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="105" y1="0" x2="105" y2="4" />
      <line x1="105" y1="293" x2="105" y2="297" />
      <line x1="0" y1="148.5" x2="4" y2="148.5" />
      <line x1="206" y1="148.5" x2="210" y2="148.5" />
      <line x1="102" y1="148.5" x2="108" y2="148.5" opacity="0.35" />
      <line x1="105" y1="145.5" x2="105" y2="151.5" opacity="0.35" />
    </svg>
  );
}

/* ── ParentBack component ────────────────────────────────── *
 * Parent-facing version of the CardBack. Same visual grammar
 * as Kids-back (cream bg, sage/mustard gradient stripe, teal
 * accents, QR row at bottom, footer signature) so the flyer
 * recognizably belongs to the same Ronki-print-set the Kids
 * cards are part of. Copy is grown-up: pitch + differentiators
 * + trust signals.
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
          Ein Drachen-Gefährte für Morgen- und Abendroutine. Ohne Streaks, ohne
          Werbung, ohne Dark Patterns.
        </p>

        <ul className="pb-points">
          <li>
            <span className="pb-check" aria-hidden>✓</span>
            <span>
              <strong>Keine App-Tricks.</strong> Keine Streaks, keine Push-Benachrichtigungen, keine In-App-Käufe.
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
            <p className="pb-qr-sub">
              Direkt im Browser. Kostenlos, ohne Anmeldung.
            </p>
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

/* ── Print page ─────────────────────────────────────────── */

export default function PrintSheetA4ElternFlyer() {
  useEffect(() => {
    document.body.style.background = '#e4dfd6';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const [shuffled, setShuffled] = useState<Dragon[]>(() => shuffle(DRAGONS));
  const coverA = shuffled.slice(0, 4);
  const coverB = shuffled.slice(4, 8);

  const reshuffle = () => setShuffled(shuffle(DRAGONS));

  return (
    <div className="print-root">
      <div className="no-print" style={instructionBarStyle}>
        <strong style={{ fontWeight: 700 }}>
          A4-Bogen Eltern-Flyer &middot; 2 × 4 Flyer + gemeinsame Rückseite
        </strong>
        <span style={{ opacity: 0.75, marginLeft: 10, fontSize: 11.5 }}>
          Seite 1 + 2 = Vorderseiten (Dragon-Karten) &middot; Seite 3 =
          parent-facing Rückseite (zweimal auf die geflippten Papiere drucken)
        </span>
        <button onClick={reshuffle} style={rollBtnStyle}>
          Neu mischen 🎲
        </button>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      {/* ── Bogen 1: Cover A ─────────────────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 1 · Cover A</div>
        <CutMarks />
        {coverA.map((d, i) => (
          <div className="sheet-cell" key={`a-${d.slug}-${i}`}>
            <CardFront dragon={d} />
          </div>
        ))}
      </section>

      {/* ── Bogen 2: Cover B ─────────────────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">Bogen 2 · Cover B</div>
        <CutMarks />
        {coverB.map((d, i) => (
          <div className="sheet-cell" key={`b-${d.slug}-${i}`}>
            <CardFront dragon={d} />
          </div>
        ))}
      </section>

      {/* ── Rückseiten: 4× parent-back ───────────────────── */}
      <section className="a4-sheet">
        <div className="sheet-label no-print">
          Rückseiten · 4× Parent-Pitch (für beide Bögen)
        </div>
        <CutMarks />
        {[0, 1, 2, 3].map((i) => (
          <div className="sheet-cell" key={`back-${i}`}>
            <ParentBack />
          </div>
        ))}
      </section>

      <style>{sheetCss + cardCss + parentBackCss}</style>
    </div>
  );
}

/* ── Sheet + print-page CSS (reused pattern from Kids sheet) ─ */

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
  .sheet-cell .flyer-page {
    box-shadow: none !important;
    margin: 0 !important;
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
    stroke-width: 0.35;
    vector-effect: non-scaling-stroke;
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

/* ── Parent-back-specific CSS ────────────────────────────── */

const parentBackCss = `
  .parent-back {
    background: #FDF8F0;
    background-image:
      radial-gradient(ellipse 90% 60% at 100% 0%, rgba(80,160,130,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 90% 50% at 0% 100%, rgba(252,211,77,0.22) 0%, transparent 55%);
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
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
  .pb-qr-text {
    flex: 1;
  }
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
  maxWidth: 920,
  width: '100%',
};

const printBtnStyle: React.CSSProperties = {
  marginLeft: 8,
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

const rollBtnStyle: React.CSSProperties = {
  ...printBtnStyle,
  marginLeft: 'auto',
  background: '#50A082',
  color: '#FDF8F0',
};

// Unused import safety-net: CardBack is imported in case a future
// variant of this sheet wants to reuse the Kids back for a hybrid
// layout. Keep the import alive to avoid tree-shaking complaints.
void CardBack;
