import React, { useEffect, useState } from 'react';

/**
 * Small speech bubble that appears over Ronki.
 * Slides + fades in; tap to dismiss.
 * Positioned absolute — parent should be position: relative.
 *
 * Variant:
 *   "float"  (default) — large bubble with tail
 *   "chip"           — compact pill
 *
 * Placement ("float" only):
 *   "above" (default) — bubble sits above parent, tail pointing down
 *   "below"           — bubble sits below parent, tail pointing up
 */
export default function VoiceBubble({ line, onDismiss, variant = 'float', placement = 'above' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!line) {
      setVisible(false);
      return;
    }
    // Next frame flip to trigger CSS transition.
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [line?.id]);

  if (!line) return null;

  const baseStyle = {
    transition: 'opacity 260ms ease, transform 260ms ease',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(6px)',
    cursor: 'pointer',
  };

  if (variant === 'chip') {
    return (
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Ronki sagt etwas — tippen zum Schließen"
        className="rounded-full px-4 py-2 shadow-md text-left inline-flex items-center gap-2"
        style={{
          ...baseStyle,
          background: '#fff8f2',
          border: '1.5px solid rgba(252,211,77,0.7)',
          maxWidth: '100%',
          color: '#124346',
        }}
      >
        <span aria-hidden className="text-base leading-none">💬</span>
        <span className="font-body text-sm leading-snug" style={{ fontWeight: 600 }}>
          {line.text}
        </span>
      </button>
    );
  }

  // float (default)
  const isBelow = placement === 'below';
  const posStyle = isBelow
    ? {
        bottom: -8,
        left: '50%',
        transform: `translate(-50%, ${visible ? '100%' : 'calc(100% - 6px)'})`,
      }
    : {
        top: -8,
        left: '50%',
        transform: `translate(-50%, ${visible ? '-100%' : 'calc(-100% + 6px)'})`,
      };
  const tailStyle = isBelow
    ? {
        position: 'absolute',
        top: -8,
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: 14,
        height: 14,
        background: '#fff8f2',
        borderLeft: '1.5px solid rgba(252,211,77,0.6)',
        borderTop: '1.5px solid rgba(252,211,77,0.6)',
      }
    : {
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: 14,
        height: 14,
        background: '#fff8f2',
        borderRight: '1.5px solid rgba(252,211,77,0.6)',
        borderBottom: '1.5px solid rgba(252,211,77,0.6)',
      };

  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Ronki sagt etwas — tippen zum Schließen"
      className="absolute z-30 rounded-2xl px-4 py-3 shadow-lg text-left"
      style={{
        ...baseStyle,
        ...posStyle,
        background: '#fff8f2',
        border: '1.5px solid rgba(252,211,77,0.6)',
        maxWidth: 280,
        color: '#124346',
      }}
    >
      <span className="font-body text-sm leading-snug" style={{ fontWeight: 500 }}>
        {line.text}
      </span>
      <span aria-hidden style={tailStyle} />
    </button>
  );
}
