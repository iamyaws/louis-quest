import React, { useState, useMemo } from 'react';
import TeachFireStep from './onboarding/TeachFireStep';
import { useTranslation } from '../i18n/LanguageContext';
import { COMPANION_VARIANTS, getVariant } from '../data/companionVariants';

/**
 * TeachFirePreview — standalone harness for iterating on TeachFireStep v2.
 *
 * Mounted via `?teachFirePreview=1` (optionally `&variant=forest`). Public
 * route like `?onboardingPreview=1` so Marc can smoke-test on the dev
 * deploy without auth. Differences from onboardingPreview+step=6:
 *   · Replay pill (top-right) re-mounts the step via key bump — no
 *     browser refresh needed between runs.
 *   · Variant swatches (bottom-left) to preview fire against all six
 *     chibi colorways in seconds.
 *   · Round counter readout so you can see which attempt just ran
 *     (round 1 = smoke, round 2 = fire) without reading the copy.
 *
 * The underlying TeachFireStep component is unmodified — this is a
 * dev-iteration harness, not a production surface. Safe to remove when
 * TeachFireStep v2 ships to main and we stop iterating on it.
 */
export default function TeachFirePreview() {
  const { t } = useTranslation();
  const [runKey, setRunKey] = useState(0);  // bump to re-mount TeachFireStep
  const [variantId, setVariantId] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('variant') || 'forest';
  });
  const variant = useMemo(() => getVariant(variantId), [variantId]);
  const [completedAt, setCompletedAt] = useState(null);

  // Tiny shim ProgressBar — the real onboarding ProgressBar wants state
  // from the outer flow (step N of M). In preview we don't care — show
  // a static "Preview" badge so the top of the frame looks intentional.
  const ProgressBar = () => (
    <div className="flex justify-center pt-2 pb-6">
      <div
        style={{
          padding: '6px 14px',
          borderRadius: 999,
          background: 'rgba(0,0,0,.35)',
          color: '#fef3c7',
          font: '700 9px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '.28em',
          textTransform: 'uppercase',
          border: '1px solid rgba(254,243,199,.2)',
        }}
      >
        TeachFireStep v2 · Preview
      </div>
    </div>
  );

  const handleReplay = () => {
    setCompletedAt(null);
    setRunKey(k => k + 1);
  };

  const handleComplete = () => {
    setCompletedAt(Date.now());
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <TeachFireStep
        key={runKey}
        variant={variant}
        t={t}
        ProgressBar={ProgressBar}
        onComplete={handleComplete}
      />

      {/* Replay pill — top-right, z above the teach step's content */}
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
          zIndex: 50,
          cursor: 'pointer',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
        >
          replay
        </span>
        Replay
      </button>

      {/* Variant picker — bottom-left, six circle swatches */}
      <div
        className="fixed flex items-center gap-2"
        style={{
          bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          left: 14,
          padding: 8,
          borderRadius: 999,
          background: 'rgba(26,18,10,.72)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(254,243,199,.14)',
          boxShadow: '0 10px 24px -10px rgba(0,0,0,.5)',
          zIndex: 50,
        }}
      >
        {COMPANION_VARIANTS.map(v => {
          const isSel = v.id === variantId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => { setVariantId(v.id); setRunKey(k => k + 1); }}
              aria-label={`Variant ${v.id}`}
              aria-pressed={isSel}
              style={{
                width: isSel ? 32 : 28,
                height: isSel ? 32 : 28,
                borderRadius: '50%',
                background: v.glowColor || v.chibi?.body?.replace?.('var', '') || '#888',
                border: isSel ? '2px solid #fef3c7' : '2px solid rgba(254,243,199,.3)',
                boxShadow: isSel ? '0 0 12px rgba(254,243,199,.6)' : 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.15s ease',
              }}
            />
          );
        })}
      </div>

      {/* Completion indicator — fades in after the sequence ends. Only
          informational; the Replay pill is always available. */}
      {completedAt && (
        <div
          className="fixed"
          style={{
            bottom: 'calc(66px + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(5,150,105,.92)',
            color: '#fef3c7',
            font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            boxShadow: '0 6px 14px -4px rgba(5,150,105,.4)',
            zIndex: 50,
            whiteSpace: 'nowrap',
          }}
        >
          ✓ Sequence complete · tap Replay
        </div>
      )}
    </div>
  );
}
