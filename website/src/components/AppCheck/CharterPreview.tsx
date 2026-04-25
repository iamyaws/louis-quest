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

  // Background
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

  // Eyebrow
  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('FAMILIEN-MEDIEN-CHARTER', 100, 100);

  // Family heading
  ctx.fillStyle = COLORS.tealDark;
  ctx.font = 'bold 64px "Plus Jakarta Sans", system-ui, sans-serif';
  const fh = familyHeading(answers);
  ctx.fillText(fh, 100, 140);

  // Date + child count
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = '500 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(
    `Stand: ${todayISODate()} · ${answers.childCount} ${answers.childCount === 1 ? 'Kind' : 'Kinder'}`,
    100,
    220,
  );

  // Hairline divider
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

  section('Wann ist Bildschirmzeit ok?', () => bulletList(bulletsFor(answers, 'wann')));
  section('Wo wird gespielt?', () => paragraph(WO_LABELS[answers.wo]));
  section('Welche Inhalte?', () => bulletList(bulletsFor(answers, 'inhalte')));
  section('Geld in Apps?', () => paragraph(GELD_LABELS[answers.geld]));
  section('Push-Benachrichtigungen?', () => paragraph(PUSH_LABELS[answers.push]));
  if (answers.pausen.length > 0) {
    section('Unsere Pausen', () => bulletList(bulletsFor(answers, 'pausen')));
  }
  if (answers.versprechen.trim()) {
    section('Unser Eltern-Versprechen', () => paragraph(answers.versprechen.trim()));
  }

  // Signature lines, lower portion
  const sigY = H - 240;
  ctx.fillStyle = COLORS.hairline;
  ctx.fillRect(100, sigY - 30, W - 200, 1);

  ctx.fillStyle = COLORS.teal;
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('UNTERSCHRIEBEN VON', 100, sigY);

  ctx.strokeStyle = COLORS.hairline;
  ctx.lineWidth = 1;
  const sigCols = 2;
  const sigRowY = sigY + 60;
  const sigW = (W - 240) / sigCols;
  for (let col = 0; col < sigCols; col++) {
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

  // Bottom strip
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

  return (
    <div className="space-y-6">
      {/* On-screen preview, also styled for window.print() */}
      <div className="charter-preview rounded-2xl bg-cream/90 border border-teal/15 px-7 py-8 sm:px-10 sm:py-10 space-y-7">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
            Familien-Medien-Charter
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-teal-dark">
            {familyHeading(answers)}
          </h2>
          <p className="text-sm text-ink/65">
            Stand: {todayISODate()} ·{' '}
            {answers.childCount === 1 ? '1 Kind' : `${answers.childCount} Kinder`}
          </p>
        </header>

        <hr className="border-teal/15" />

        <CharterSection title="Wann ist Bildschirmzeit ok?" items={wann} />
        <CharterSection title="Wo wird gespielt?" body={WO_LABELS[answers.wo]} />
        <CharterSection title="Welche Inhalte?" items={inhalte} />
        <CharterSection
          title="Geld in Apps?"
          body={GELD_LABELS[answers.geld]}
        />
        <CharterSection
          title="Push-Benachrichtigungen?"
          body={PUSH_LABELS[answers.push]}
        />
        {pausen.length > 0 && (
          <CharterSection title="Unsere Pausen" items={pausen} />
        )}
        {answers.versprechen.trim() && (
          <CharterSection
            title="Unser Eltern-Versprechen"
            body={answers.versprechen.trim()}
          />
        )}

        <hr className="border-teal/15" />

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold">
            Unterschrieben von
          </p>
          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            <div className="border-t border-teal/30 pt-2 text-xs text-ink/55">
              Erwachsene
            </div>
            <div className="border-t border-teal/30 pt-2 text-xs text-ink/55">
              Kinder
            </div>
          </div>
        </div>

        <p className="text-xs text-ink/45 text-right pt-4">
          ronki.de · Familien-Medien-Charter
        </p>
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

      {/* Print-only stylesheet: hide everything except .charter-preview. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .charter-preview, .charter-preview * { visibility: visible; }
          .charter-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #FDF8F0 !important;
            border: 0 !important;
            box-shadow: none !important;
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
