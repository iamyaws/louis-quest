import React, { useState, useMemo } from 'react';
import TeachRitualModal, { RITUAL_COPY } from './TeachRitualModal';
import { TaskProvider } from '../context/TaskContext';
import { CelebrationQueueProvider } from '../context/CelebrationQueue';
import { QuestEaterProvider } from './QuestEater';

/**
 * TeachRitualPreview — standalone harness for iterating on the post-
 * onboarding teach rituals (Herzfeuer / Funkenstern / Glut / Regenbogen).
 *
 * Mounted via `?teachRitualPreview=1` (optionally `&flavor=heart` to
 * target a specific ritual; defaults to heart). Public route. Wraps
 * TeachRitualModal with:
 *   · Replay pill (top-right) re-mounts the modal via key bump.
 *   · Flavor swatches (bottom-right) switch between the four unlock
 *     rituals — useful for comparing copy + palettes side by side.
 *   · Variant swatches (bottom-left) change chibi colorway.
 *
 * Uses `previewMode={true}` on the modal so replay doesn't actually
 * persist `teachBreath()` calls — otherwise the first test run would
 * unlock the flavor and further runs would never re-trigger the
 * milestone gate downstream.
 *
 * Needs TaskProvider to be mounted because TeachRitualModal reads
 * companionVariant from state. Uses a minimal provider tree scoped to
 * this preview surface only.
 */

const FLAVOR_OPTIONS = [
  { id: 'heart',   label: 'Herzfeuer',       color: '#f472b6' },
  { id: 'sparkle', label: 'Funkenstern',     color: '#fcd34d' },
  { id: 'ember',   label: 'Glut',            color: '#f97316' },
  { id: 'rainbow', label: 'Regenbogenfeuer', color: 'linear-gradient(90deg, #f97316, #fde047, #4ade80, #22d3ee, #ec4899)' },
];

export default function TeachRitualPreview() {
  const initialFlavor = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get('flavor');
    return ['heart', 'sparkle', 'ember', 'rainbow'].includes(f) ? f : 'heart';
  }, []);

  return (
    <TaskProvider>
      <CelebrationQueueProvider>
        <QuestEaterProvider>
          <PreviewInner initialFlavor={initialFlavor} />
        </QuestEaterProvider>
      </CelebrationQueueProvider>
    </TaskProvider>
  );
}

function PreviewInner({ initialFlavor }) {
  const [runKey, setRunKey] = useState(0);
  const [flavor, setFlavor] = useState(initialFlavor);

  const handleReplay = () => setRunKey(k => k + 1);
  const handleFlavorChange = (f) => {
    setFlavor(f);
    setRunKey(k => k + 1);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <TeachRitualModal
        key={runKey}
        flavor={flavor}
        copyKeys={RITUAL_COPY[flavor]}
        onClose={handleReplay}
        previewMode={true}
      />

      {/* Replay pill — top-right */}
      <button
        type="button"
        onClick={handleReplay}
        className="fixed inline-flex items-center gap-1.5 active:scale-95 transition-transform"
        style={{
          top: 'calc(14px + env(safe-area-inset-top, 0px))',
          right: 14,
          padding: '10px 16px 10px 12px',
          minHeight: 44,
          borderRadius: 999,
          background: 'rgba(255,248,242,.94)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(18,67,70,.12)',
          boxShadow: '0 4px 14px -4px rgba(18,67,70,.22)',
          color: '#124346',
          font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          zIndex: 10001,
          cursor: 'pointer',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
          replay
        </span>
        Replay
      </button>

      {/* Flavor picker — bottom-right */}
      <div
        className="fixed flex items-center gap-2 flex-wrap justify-end"
        style={{
          bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          right: 14,
          maxWidth: 'calc(100vw - 28px)',
          padding: 8,
          borderRadius: 16,
          background: 'rgba(26,18,10,.72)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(254,243,199,.14)',
          boxShadow: '0 10px 24px -10px rgba(0,0,0,.5)',
          zIndex: 10001,
        }}
      >
        {FLAVOR_OPTIONS.map(f => {
          const isSel = f.id === flavor;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFlavorChange(f.id)}
              aria-pressed={isSel}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                background: isSel ? f.color : 'rgba(255,255,255,.08)',
                border: isSel ? '1.5px solid rgba(254,243,199,.7)' : '1.5px solid rgba(254,243,199,.15)',
                color: isSel ? '#1a0f06' : 'rgba(254,243,199,.85)',
                font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: isSel ? '0 4px 12px -4px rgba(0,0,0,.4)' : 'none',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
