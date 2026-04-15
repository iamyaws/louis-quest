// src/components/DreamStrip.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

// ─── Scene art components ────────────────────────────────────────────────────
// All art is pure CSS — no images. Silhouettes, gradients, glows, keyframes.
// Every aria-hidden element is decorative; accessibility is on the outer button.

function BossScene() {
  const SPARKS = [
    { top: '33%', left: '40%' }, { top: '26%', left: '54%' },
    { top: '41%', left: '63%' }, { top: '21%', left: '47%' },
    { top: '30%', left: '34%' }, { top: '24%', left: '67%' },
  ];
  return (
    <div
      className="absolute inset-0 flex items-end justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 55%, #140808 0%, #060610 100%)' }}
    >
      <div style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translateX(-50%)' }}>
        <div
          aria-hidden="true"
          style={{
            width: 72, height: 90,
            borderRadius: '48% 52% 44% 56% / 60% 44% 56% 40%',
            background: 'rgba(6,2,4,0.96)',
            animation: 'dream-dissolve 4s ease-in-out infinite',
          }}
        />
      </div>
      {SPARKS.map((pos, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute', top: pos.top, left: pos.left,
            width: i % 3 === 0 ? 4 : 3, height: i % 3 === 0 ? 4 : 3,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#fcd34d' : '#f97316',
            boxShadow: `0 0 ${5 + i * 2}px ${2 + i}px ${i % 2 === 0 ? 'rgba(252,211,77,0.65)' : 'rgba(249,115,22,0.65)'}`,
            animation: `dream-spark ${0.9 + (i * 0.37) % 1.1}s ease-in-out infinite ${(i * 0.19).toFixed(2)}s`,
          }}
        />
      ))}
      <div
        aria-hidden="true"
        style={{
          marginBottom: '18%',
          width: 28, height: 36,
          borderRadius: '50% 50% 40% 40%',
          background: 'rgba(18,67,70,0.9)',
          boxShadow: '0 0 16px 6px rgba(94,234,212,0.14)',
        }}
      />
    </div>
  );
}

function ArcScene() {
  const STARS = [[18, 62], [44, 18], [72, 74], [82, 33], [14, 44]];
  return (
    <div
      className="absolute inset-0 flex items-end justify-center"
      style={{ background: 'linear-gradient(160deg, #0c1830 0%, #0e2234 55%, #112030 100%)' }}
    >
      <div style={{ position: 'absolute', top: '27%', left: '34%' }}>
        <div
          aria-hidden="true"
          style={{
            width: 0, height: 0,
            borderLeft: '19px solid transparent', borderRight: '19px solid transparent',
            borderBottom: '32px solid rgba(252,211,77,0.65)',
            animation: 'dream-float 3.8s ease-in-out infinite',
          }}
        />
      </div>
      <div style={{ position: 'absolute', top: '21%', right: '27%' }}>
        <div
          aria-hidden="true"
          style={{
            width: 26, height: 34,
            background: 'rgba(255,248,242,0.11)',
            border: '1px solid rgba(255,248,242,0.18)',
            borderRadius: 2,
            transform: 'rotate(15deg)',
            animation: 'dream-float 4.5s ease-in-out infinite 1.2s',
          }}
        />
      </div>
      {STARS.map(([t, l], i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute', top: `${t}%`, left: `${l}%`,
            width: 2, height: 2, borderRadius: '50%',
            background: 'rgba(255,255,255,0.38)',
            animation: `dream-spark ${1.6 + i * 0.28}s ease-in-out infinite ${(i * 0.42).toFixed(2)}s`,
          }}
        />
      ))}
      <div
        aria-hidden="true"
        style={{
          marginBottom: '20%',
          width: 24, height: 32,
          borderRadius: '50% 50% 42% 42%',
          background: 'rgba(18,67,70,0.88)',
          boxShadow: '0 0 12px 4px rgba(94,234,212,0.1)',
        }}
      />
    </div>
  );
}

function CareScene() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 56%, #0e1e14 0%, #060e0a 100%)' }}
    >
      {[144, 104, 72].map((size, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: size, height: size, borderRadius: '50%',
            border: `1px solid rgba(252,211,77,${0.07 - i * 0.015})`,
            animation: `dream-breathe ${3.2 + i * 0.55}s ease-in-out infinite ${(i * 0.75).toFixed(2)}s`,
          }}
        />
      ))}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 82, height: 82, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,211,77,0.22) 0%, transparent 70%)',
          animation: 'dream-breathe 3.2s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          width: 46, height: 32, borderRadius: '50%',
          background: 'rgba(18,67,70,0.88)',
          boxShadow: '0 0 28px 12px rgba(252,211,77,0.13), 0 0 8px 2px rgba(94,234,212,0.18)',
        }}
      />
    </div>
  );
}

function QuestsScene() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(to top, #050c12 0%, #0c1e30 30%, #1a465a 60%, #3a7070 78%, rgba(253,230,138,0.55) 100%)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 110, borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(253,230,138,0.82) 0%, rgba(252,211,77,0.28) 48%, transparent 70%)',
          filter: 'blur(14px)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '30%', left: 0, right: 0, height: 1,
          background: 'rgba(255,255,255,0.05)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '29%', left: '50%', transform: 'translateX(-50%)',
          width: 13, height: 20,
          borderRadius: '50% 50% 42% 42%',
          background: 'rgba(4,8,12,0.95)',
        }}
      />
    </div>
  );
}

function AmbientScene() {
  return (
    <div
      className="absolute inset-0 flex items-end justify-center"
      style={{ background: '#04090c' }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translateX(-50%)',
          width: 6, height: 6, borderRadius: '50%',
          background: 'radial-gradient(circle, #fde68a 0%, #fcd34d 60%, transparent 100%)',
          boxShadow: '0 0 14px 6px rgba(252,211,77,0.42)',
          animation: 'ember-rise 5.5s ease-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          marginBottom: '30%',
          width: 44, height: 28, borderRadius: '50%',
          background: 'rgba(18,67,70,0.52)',
        }}
      />
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

function DreamPanel({ kind, index, total, visible }) {
  const delay = 180 + index * 220;
  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(18px)',
        transition: `opacity 520ms ease ${delay}ms, transform 520ms ease ${delay}ms`,
        borderBottom: index < total - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        minHeight: 0,
      }}
    >
      {kind === 'boss'    && <BossScene />}
      {kind === 'arc'     && <ArcScene />}
      {kind === 'care'    && <CareScene />}
      {kind === 'quests'  && <QuestsScene />}
      {kind === 'ambient' && <AmbientScene />}
    </div>
  );
}

// ─── DreamStrip overlay ───────────────────────────────────────────────────────
// Two-phase entrance:
//   Phase 1 (0–700ms): overlay dark, Ronki silhouette glows center-screen.
//   Phase 2 (700ms+):  panels stagger in, silhouette fades behind them.

export default function DreamStrip({ highlights, onDismiss }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [panelsReady, setPanelsReady] = useState(false);
  const dismissTimerRef = useRef(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setVisible(true));
    const timerId = setTimeout(() => setPanelsReady(true), 700);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setVisible(false);
    setPanelsReady(false);
    dismissTimerRef.current = setTimeout(onDismiss, 360);
  };

  return (
    <button
      type="button"
      onClick={handleDismiss}
      aria-label={t('dream.dismiss')}
      className="fixed inset-0 z-[600] flex flex-col w-full"
      style={{
        background: 'rgba(4,9,12,0.97)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 360ms ease',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
      }}
    >
      {/* ── Phase 1: Ronki silhouette — "entering the dream" ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: panelsReady ? 0 : (visible ? 1 : 0),
          transition: panelsReady
            ? 'opacity 400ms ease'
            : 'opacity 500ms ease 200ms',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <div style={{
          position: 'absolute',
          width: 110, height: 110, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,234,212,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          width: 52, height: 66,
          borderRadius: '50% 50% 40% 40%',
          background: 'rgba(18,67,70,0.88)',
          boxShadow:
            '0 0 32px 14px rgba(94,234,212,0.1), 0 0 60px 24px rgba(252,211,77,0.06)',
          animation: 'dream-breathe 3s ease-in-out infinite',
        }} />
      </div>

      {/* ── Phase 2: Panels ── */}
      {highlights.map((h, i) => (
        <DreamPanel
          key={h.kind + i}
          kind={h.kind}
          index={i}
          total={highlights.length}
          visible={panelsReady}
        />
      ))}

      {/* Wordless tap hint */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          width: 32, height: 2, borderRadius: 1,
          background: 'rgba(255,255,255,0.18)',
          opacity: panelsReady ? 1 : 0,
          transition: 'opacity 600ms ease 700ms',
        }}
      />
    </button>
  );
}
