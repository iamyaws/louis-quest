/**
 * Print-ready photo composition for the Gemeindeblatt article attachment.
 *
 * Level: "Medium flatlay" per the chat agreement — PhoneMockup showing the
 * morning-routine screen (matches article theme), floating Heroic-Ronki
 * companion icon, scattered hand-drawn routine-circle sketches, and ambient
 * mustard + sage glows. Cream paper background with subtle fractal-noise
 * grain, matching the website's UeberMich aesthetic so the photo reads as
 * part of the same world Marc is building, not stock art.
 *
 * Canvas target: 1440×960 (3:2 landscape). At 300 dpi that's roughly
 * 122×81 mm, at 240 dpi roughly 152×101 mm — both fine for Gemeindeblatt
 * column placements. Marc exports by screenshotting the canvas element at
 * 100% browser zoom, or using Cmd/Ctrl+P + Save as PDF then extracting
 * the page as a high-res image.
 */

import { useEffect } from 'react';
import { PhoneMockup } from '../components/PhoneMockup';

export default function PrintGemeindeblattFoto() {
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
          Gemeindeblatt-Foto &middot; 1440×960 (3:2)
        </strong>
        <span style={{ opacity: 0.7, marginLeft: 12 }}>
          Screenshot bei 100% Browser-Zoom &middot; oder Cmd/Ctrl + P
        </span>
        <button onClick={() => window.print()} style={printBtnStyle}>
          Drucken / Als PDF
        </button>
      </div>

      <div className="photo-canvas">
        {/* Ambient glows — cream base reads warmer and more hand-made */}
        <div className="glow glow-tl" aria-hidden />
        <div className="glow glow-br" aria-hidden />

        {/* Paper-grain overlay — barely there, just lifts the digital flatness */}
        <div className="grain" aria-hidden />

        {/* Phone + floating Ronki companion, composed together so the
            companion reads as "sitting next to the phone like a sticker". */}
        <div className="stage">
          <div className="phone-wrapper">
            <PhoneMockup variant="morgen-anchor" scale={3} />
          </div>
          <img
            src="/art/branding/ronki-icon-heroic-256.webp"
            alt=""
            className="ronki-float"
            aria-hidden
            width={256}
            height={256}
          />
        </div>

        {/* Hand-drawn routine-circle sketch — implies the morning rhythm
            without needing a literal schedule. Check-marks on the first
            three, dashed on the fourth = "still open". */}
        <svg
          className="sketch"
          viewBox="0 0 800 140"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <filter id="pencil">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
            </filter>
          </defs>
          <g
            fill="none"
            stroke="#1A3C3F"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pencil)"
          >
            {/* Done: Zähne */}
            <circle cx="80" cy="70" r="42" />
            <path d="M 60 70 L 74 86 L 104 54" strokeWidth="4" />
            {/* Done: Anziehen */}
            <circle cx="260" cy="70" r="42" />
            <path d="M 240 70 L 254 86 L 284 54" strokeWidth="4" />
            {/* Done: Frühstück */}
            <circle cx="440" cy="70" r="42" />
            <path d="M 420 70 L 434 86 L 464 54" strokeWidth="4" />
            {/* Open: Tasche */}
            <circle
              cx="620"
              cy="70"
              r="42"
              strokeDasharray="4 6"
              opacity="0.55"
            />
            {/* Subtle thread connecting the circles, like a timeline */}
            <path
              d="M 122 70 L 218 70 M 302 70 L 398 70 M 482 70 L 578 70"
              strokeWidth="1.6"
              opacity="0.3"
              strokeDasharray="2 4"
            />
          </g>
        </svg>

        {/* Tiny attribution */}
        <p className="watermark">ronki.de</p>
      </div>

      <style>{`
        .print-root {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          min-height: 100vh;
          padding: 32px 16px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .print-root * { box-sizing: border-box; }

        .photo-canvas {
          position: relative;
          width: 1440px;
          height: 960px;
          background: #FDF8F0;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.18);
          border-radius: 4px;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }

        /* Ambient radial glows — warm TL (mustard), cool BR (sage) */
        .glow {
          position: absolute;
          width: 900px;
          height: 900px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }
        .glow-tl {
          top: -280px;
          left: -240px;
          background: radial-gradient(circle, rgba(252,211,77,0.42) 0%, transparent 60%);
          filter: blur(10px);
        }
        .glow-br {
          bottom: -320px;
          right: -260px;
          background: radial-gradient(circle, rgba(80,160,130,0.38) 0%, transparent 60%);
          filter: blur(10px);
        }

        /* Paper-grain — SVG fractal noise, barely there */
        .grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          mix-blend-mode: soft-light;
          opacity: 0.55;
          z-index: 2;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.24  0 0 0 0 0.25  0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          background-size: 260px 260px;
        }

        /* Phone + Ronki stage */
        .stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }
        .phone-wrapper {
          position: relative;
          transform: rotate(-4deg);
          filter:
            drop-shadow(0 40px 60px rgba(45,90,94,0.35))
            drop-shadow(0 12px 24px rgba(26,60,63,0.18));
        }
        .ronki-float {
          position: absolute;
          width: 240px;
          height: 240px;
          top: 6%;
          right: 18%;
          transform: rotate(8deg);
          filter:
            drop-shadow(0 20px 30px rgba(181,83,9,0.25))
            drop-shadow(0 8px 16px rgba(26,60,63,0.18));
          z-index: 2;
        }

        /* Hand-drawn routine-circles sketch, bottom-centered */
        .sketch {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%) rotate(-1.5deg);
          width: 700px;
          height: auto;
          z-index: 4;
          opacity: 0.85;
        }

        .watermark {
          position: absolute;
          bottom: 28px;
          right: 36px;
          margin: 0;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.18em;
          color: rgba(26,60,63,0.45);
          z-index: 5;
          text-transform: lowercase;
        }

        @media print {
          @page { size: landscape; margin: 0; }
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
          .photo-canvas {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const instructionBarStyle: React.CSSProperties = {
  position: 'sticky',
  top: 16,
  zIndex: 20,
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
  maxWidth: 760,
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
