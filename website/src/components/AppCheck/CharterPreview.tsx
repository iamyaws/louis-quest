/**
 * Renders the finished Familien-Charter as both an on-screen preview
 * (printable via window.print()) and as a downloadable PNG via Canvas
 * API. Layout is A4-ish portrait (1240x1754 at print scale) so it
 * looks right hanging on the fridge.
 */

import { useState } from 'react';
import {
  GELD_LABELS,
  INHALT_LABELS,
  PAUSE_LABELS,
  PUSH_LABELS,
  WANN_LABELS,
  WO_LABELS,
  parseSignatures,
  type CharterAnswers,
} from '../../lib/familien-charter/charter';
import { ArrowRight } from './Icons';
import { CharterShareCard } from './CharterShareCard';

interface Props {
  answers: CharterAnswers;
}

const W = 1240;
const H = 1754;

const COLORS = {
  cream: '#FDF8F0',
  teal: '#1A3C3F',
  tealDark: '#0E2A2C',
  sage: '#50A082',
  mustard: '#FCD34D',
  ink: '#1A2022',
  inkSoft: 'rgba(26, 32, 34, 0.65)',
  hairline: 'rgba(26, 60, 63, 0.20)',
};

function todayISODate(): string {
  return new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function familyHeading(answers: CharterAnswers): string {
  const name = answers.familyName.trim();
  if (name) return `Familie ${name}`;
  return 'Unsere Familie';
}

function bulletsFor(answers: CharterAnswers, kind: 'wann' | 'inhalte' | 'pausen'): string[] {
  if (kind === 'wann') return answers.wann.map((c) => WANN_LABELS[c]);
  if (kind === 'inhalte') return answers.inhalte.map((c) => INHALT_LABELS[c]);
  return answers.pausen.map((c) => PAUSE_LABELS[c]);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function ensureFontsReady(): Promise<void> {
  if (typeof document === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fonts = (document as any).fonts;
  if (!fonts || typeof fonts.ready?.then !== 'function') return;
  try {
    await fonts.ready;
  } catch {
    /* ignore */
  }
}

async function buildCharterPng(answers: CharterAnswers): Promise<Blob> {
  await ensureFontsReady();
  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctxRaw = canvas.getContext('2d');
  if (!ctxRaw) throw new Error('canvas-2d-unavailable');
  // Capture into a non-nullable local so TypeScript keeps the narrowing
  // through the inner-function closures below.
  const ctx: CanvasRenderingContext2D = ctxRaw;
  ctx.scale(dpr, dpr);

  // ────────────── Background layer ──────────────
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, W, H);

  // Soft mustard glow top-left
  const tlGlow = ctx.createRadialGradient(120, 120, 30, 120, 120, 480);
  tlGlow.addColorStop(0, 'rgba(252, 211, 77, 0.30)');
  tlGlow.addColorStop(1, 'rgba(252, 211, 77, 0)');
  ctx.fillStyle = tlGlow;
  ctx.fillRect(0, 0, W, H);

  // Sage glow bottom-right
  const brGlow = ctx.createRadialGradient(W - 120, H - 200, 30, W - 120, H - 200, 520);
  brGlow.addColorStop(0, 'rgba(80, 160, 130, 0.25)');
  brGlow.addColorStop(1, 'rgba(80, 160, 130, 0)');
  ctx.fillStyle = brGlow;
  ctx.fillRect(0, 0, W, H);

  // ────────────── Top gradient stripe (4px) ──────────────
  // House ribbon: mustard → sage → teal across the full width, mirrors the
  // tool-card stripe so the page reads as part of the same family.
  const stripeH = 6;
  const stripe = ctx.createLinearGradient(0, 0, W, 0);
  stripe.addColorStop(0, COLORS.mustard);
  stripe.addColorStop(0.5, COLORS.sage);
  stripe.addColorStop(1, COLORS.teal);
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, W, stripeH);

  // ────────────── Inner double-frame ──────────────
  // 1px hairline rectangle inset 60px from each edge — gives the page
  // the "printed certificate" feel.
  const frameInset = 60;
  ctx.strokeStyle = COLORS.hairline;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    frameInset,
    frameInset,
    W - frameInset * 2,
    H - frameInset * 2 - 70, // leave room for the bottom strip
  );

  // ────────────── Header ──────────────
  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('FAMILIEN-MEDIEN-CHARTER', 100, 100);

  ctx.fillStyle = COLORS.tealDark;
  ctx.font = 'bold 64px "Plus Jakarta Sans", system-ui, sans-serif';
  const fh = familyHeading(answers);
  ctx.fillText(fh, 100, 140);

  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `${answers.childCount} ${answers.childCount === 1 ? 'Kind' : 'Kinder'} · auf eine Seite gebracht`,
    100,
    220,
  );

  // ────────────── Tilted mustard date sticker, top-right ──────────────
  // Drawn in its own save/restore block so the rotation doesn't bleed
  // into the rest of the page.
  ctx.save();
  const stickerCX = W - 180;
  const stickerCY = 150;
  const stickerW = 200;
  const stickerH = 84;
  ctx.translate(stickerCX, stickerCY);
  ctx.rotate(-3 * (Math.PI / 180));
  // Subtle drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = 'rgba(252, 211, 77, 0.92)';
  roundRect(ctx, -stickerW / 2, -stickerH / 2, stickerW, stickerH, 8);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  // Hairline stroke
  ctx.strokeStyle = 'rgba(176, 138, 0, 0.4)';
  ctx.lineWidth = 1;
  roundRect(ctx, -stickerW / 2, -stickerH / 2, stickerW, stickerH, 8);
  ctx.stroke();
  // "STAND" eyebrow
  ctx.fillStyle = COLORS.tealDark;
  ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('STAND', 0, -stickerH / 2 + 14);
  // Date
  ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(todayISODate(), 0, -stickerH / 2 + 36);
  ctx.restore();
  ctx.textAlign = 'start';
  ctx.textBaseline = 'top';

  // Hairline divider below header
  ctx.fillStyle = COLORS.hairline;
  ctx.fillRect(100, 270, W - 200, 1);

  let y = 310;

  function section(title: string, render: () => void) {
    ctx.fillStyle = COLORS.teal;
    ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(title.toUpperCase(), 100, y);
    y += 36;
    render();
    y += 28;
  }

  function bulletList(items: string[]) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = '500 22px "Be Vietnam Pro", system-ui, sans-serif';
    for (const item of items) {
      const lines = wrapText(ctx, item, W - 260);
      // Bullet dot
      ctx.fillStyle = COLORS.sage;
      ctx.beginPath();
      ctx.arc(110, y + 12, 5, 0, Math.PI * 2);
      ctx.fill();
      // Text
      ctx.fillStyle = COLORS.ink;
      let lineY = y;
      for (const line of lines) {
        ctx.fillText(line, 134, lineY);
        lineY += 32;
      }
      y = lineY + 6;
    }
  }

  function paragraph(text: string) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = '500 22px "Be Vietnam Pro", system-ui, sans-serif';
    const lines = wrapText(ctx, text, W - 200);
    for (const line of lines) {
      ctx.fillText(line, 100, y);
      y += 32;
    }
  }

  section('Wann ist Bildschirm-Zeit ok?', () => bulletList(bulletsFor(answers, 'wann')));
  section('Wo wird gespielt oder geschaut?', () => paragraph(WO_LABELS[answers.wo]));
  section('Welche Inhalte sind ok?', () => bulletList(bulletsFor(answers, 'inhalte')));
  section('Echtgeld in Apps?', () => paragraph(GELD_LABELS[answers.geld]));
  section('Push-Benachrichtigungen?', () => paragraph(PUSH_LABELS[answers.push]));
  if (answers.pausen.length > 0) {
    section('Unsere Pausen', () => bulletList(bulletsFor(answers, 'pausen')));
  }
  if (answers.versprechen.trim()) {
    section('Unser Eltern-Versprechen', () => paragraph(answers.versprechen.trim()));
  }

  // ────────────── Dedication + signature block ──────────────
  // Anchored to the bottom of the page so it always reads as the closing
  // gesture, regardless of how much content sat above it.
  const namesParsed = parseSignatures(answers.signatures);
  const sigBlockTop = H - 280;

  // Dedication line, italic
  ctx.fillStyle = 'rgba(14, 42, 44, 0.78)';
  ctx.font = 'italic 600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  const ded = `Geschrieben für ${familyHeading(answers).toLowerCase()}, am ${todayISODate()}.`;
  ctx.fillText(ded, 100, sigBlockTop);

  // Eyebrow + signature lines
  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('UNTERSCHRIEBEN VON', 100, sigBlockTop + 50);

  ctx.strokeStyle = COLORS.hairline;
  ctx.lineWidth = 1;
  const sigRowY = sigBlockTop + 110;
  if (namesParsed.length > 0) {
    // Lay out 2-per-row, max 6 names total (parseSignatures cap).
    const cols = Math.min(2, namesParsed.length);
    const rows = Math.ceil(namesParsed.length / cols);
    const sigW = (W - 200 - 40 * (cols - 1)) / cols;
    const rowGap = 60;
    for (let i = 0; i < namesParsed.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 100 + col * (sigW + 40);
      const yLine = sigRowY + row * rowGap;
      ctx.beginPath();
      ctx.moveTo(x, yLine);
      ctx.lineTo(x + sigW, yLine);
      ctx.stroke();
      ctx.fillStyle = COLORS.tealDark;
      ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(namesParsed[i], x, yLine + 12);
    }
    // Re-anchor bottom strip below the longest column if many names
    // (no-op visually because bottom strip is always drawn at H-70).
    void rows;
  } else {
    // Fallback: generic two-column lines
    const cols = 2;
    const sigW = (W - 240) / cols;
    for (let col = 0; col < cols; col++) {
      ctx.beginPath();
      ctx.moveTo(100 + col * (sigW + 40), sigRowY);
      ctx.lineTo(100 + col * (sigW + 40) + sigW, sigRowY);
      ctx.stroke();
      ctx.fillStyle = COLORS.inkSoft;
      ctx.font = '400 16px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(
        col === 0 ? 'Erwachsene' : 'Kinder',
        100 + col * (sigW + 40),
        sigRowY + 12,
      );
    }
  }

  // ────────────── Bottom strip ──────────────
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, H - 70, W, 70);
  ctx.fillStyle = COLORS.cream;
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('ronki.de · Familien-Medien-Charter', 100, H - 35);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob-empty'))),
      'image/png',
      0.95,
    );
  });
}

/**
 * Tiny rounded-rect helper used by the date sticker. Same shape as the
 * one in CharterShareCard, kept local so the file has no cross-file
 * dependency for canvas geometry.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function CharterPreview({ answers }: Props) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'error'>('idle');

  async function handleDownload() {
    try {
      setStatus('rendering');
      const blob = await buildCharterPng(answers);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = (answers.familyName || 'familie')
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '');
      a.download = `familien-medien-charter-${slug || 'familie'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      setStatus('idle');
    } catch (err) {
      console.error('charter render failed', err);
      setStatus('error');
    }
  }

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  const wann = bulletsFor(answers, 'wann');
  const inhalte = bulletsFor(answers, 'inhalte');
  const pausen = bulletsFor(answers, 'pausen');
  const signatureNames = parseSignatures(answers.signatures);

  /**
   * Sections rendered into the two-column grid. We keep the order
   * stable so reading flow on the printed sheet stays predictable.
   */
  const sections: Array<{
    title: string;
    body?: string;
    items?: string[];
  }> = [
    { title: 'Wann ist Bildschirm-Zeit ok?', items: wann },
    { title: 'Wo wird gespielt oder geschaut?', body: WO_LABELS[answers.wo] },
    { title: 'Welche Inhalte sind ok?', items: inhalte },
    { title: 'Echtgeld in Apps?', body: GELD_LABELS[answers.geld] },
    { title: 'Push-Benachrichtigungen?', body: PUSH_LABELS[answers.push] },
  ];
  if (pausen.length > 0) {
    sections.push({ title: 'Unsere Pausen', items: pausen });
  }
  if (answers.versprechen.trim()) {
    sections.push({
      title: 'Unser Eltern-Versprechen',
      body: answers.versprechen.trim(),
    });
  }

  return (
    <div className="space-y-6">
      {/*
        On-screen preview. Also drives window.print(): the @media print
        block at the bottom hides everything outside .charter-preview.

        Composition (from outside in):
          1. Outer relative wrapper with painterly accent stripe at top.
          2. Inner double-frame: outer card + nested inner border, so the
             page reads as a printed certificate, not a UI card.
          3. Tilted mustard date sticker, top-right of the header — the
             single piece of paper-like decoration that makes the result
             feel hand-pinned to the fridge instead of generated.
      */}
      <div className="charter-preview relative rounded-2xl bg-cream/95 border border-teal/15 shadow-sm overflow-hidden">
        {/* Top accent ribbon — house gradient stripe */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mustard via-sage to-teal"
        />

        {/* Inner double-frame */}
        <div className="m-2.5 sm:m-3 rounded-xl border border-teal/20 px-6 py-7 sm:px-9 sm:py-9 space-y-7">
          {/* Header with tilted date sticker */}
          <header className="relative pr-28 sm:pr-32 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
              Familien-Medien-Charter
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-teal-dark leading-tight">
              {familyHeading(answers)}
            </h2>
            <p className="text-sm text-ink/65">
              {answers.childCount === 1 ? '1 Kind' : `${answers.childCount} Kinder`}{' '}
              · auf eine Seite gebracht
            </p>
            {/* Mustard date sticker */}
            <div
              aria-hidden
              className="charter-date-sticker absolute right-0 top-0 -rotate-3 rounded-md bg-mustard/90 ring-1 ring-mustard/60 shadow-sm px-3 py-1.5 text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-teal-dark font-semibold leading-tight">
                Stand
              </p>
              <p className="text-sm font-display font-bold text-teal-dark tabular-nums leading-tight">
                {todayISODate()}
              </p>
            </div>
          </header>

          <hr className="border-teal/15" />

          {/* Two-column section grid — reads like a poster, not an
              accordion. On mobile collapses cleanly to single column. */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
            {sections.map((s) => (
              <CharterSection
                key={s.title}
                title={s.title}
                body={s.body}
                items={s.items}
              />
            ))}
          </div>

          <hr className="border-teal/15" />

          {/* Dedication line + signature block */}
          <div className="space-y-5">
            <p className="font-display italic text-base text-teal-dark/80 leading-snug max-w-prose">
              Geschrieben für {familyHeading(answers).toLowerCase()}, am{' '}
              {todayISODate()}.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
              Unterschrieben von
            </p>
            {signatureNames.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 pt-2">
                {signatureNames.map((name) => (
                  <div
                    key={name}
                    className="border-t border-teal/30 pt-2 text-xs text-ink/65 font-medium"
                  >
                    {name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 pt-2">
                <div className="border-t border-teal/30 pt-2 text-xs text-ink/55">
                  Erwachsene
                </div>
                <div className="border-t border-teal/30 pt-2 text-xs text-ink/55">
                  Kinder
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-ink/45 text-right pt-3">
            ronki.de · Familien-Medien-Charter
          </p>
        </div>
      </div>

      {/* Action buttons (hidden in print) */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          type="button"
          onClick={handleDownload}
          disabled={status === 'rendering'}
          className="group inline-flex items-center gap-2 rounded-full bg-teal-dark px-6 py-3 text-cream font-display font-semibold text-sm shadow-sm hover:bg-teal hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === 'rendering' ? (
            <>
              <span
                aria-hidden
                className="inline-block w-3.5 h-3.5 rounded-full border-2 border-cream/30 border-t-cream animate-spin"
              />
              Baue Bild…
            </>
          ) : (
            <>
              Als Bild herunterladen
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-full border border-teal/30 px-6 py-3 text-sm text-teal-dark font-display font-semibold hover:bg-teal-dark hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
        >
          Als PDF drucken
        </button>
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-teal-dark">
          Bild-Erzeugung hat nicht geklappt. Versuch es bitte gleich noch
          mal.
        </p>
      )}

      {/* Second download path: 1200x675 LinkedIn social card. The full
          A4 charter goes on the fridge; the social card goes in feeds. */}
      <div className="pt-2 border-t border-teal/10">
        <CharterShareCard answers={answers} />
      </div>

      {/* Print-only stylesheet: hide everything except .charter-preview.
          Force color rendering so the mustard date sticker, gradient
          ribbon, and signature lines actually print instead of getting
          flattened to white by browser default print modes. */}
      <style>{`
        .charter-date-sticker {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          html, body {
            background: #FDF8F0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body * { visibility: hidden; }
          .charter-preview, .charter-preview * { visibility: visible; }
          .charter-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #FDF8F0 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}

function CharterSection({
  title,
  body,
  items,
}: {
  title: string;
  body?: string;
  items?: string[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-[0.18em] text-teal font-semibold">
        {title}
      </h3>
      {body && (
        <p className="text-base text-ink/85 leading-relaxed max-w-prose">
          {body}
        </p>
      )}
      {items && items.length > 0 && (
        <ul className="list-none pl-0 space-y-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-base text-ink/85 leading-relaxed max-w-prose"
            >
              <span
                aria-hidden
                className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
