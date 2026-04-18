import React from 'react';

/**
 * GefuehlsecheHeart — small heart button that opens Gefühlsecke.
 *
 * Placement: Hub's top-right corner, next to Pearl currency badge.
 * Always visible, subtle so it doesn't compete with the campfire scene.
 *
 * Props:
 *   - onOpen: () => void
 */
export default function GefuehlsecheHeart({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Gefühlsecke öffnen"
      className="relative w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      style={{
        background: 'rgba(248,113,113,0.14)',
        border: '1.5px solid rgba(248,113,113,0.3)',
        boxShadow: '0 2px 8px rgba(248,113,113,0.16)',
      }}
    >
      <span
        className="material-symbols-outlined text-xl"
        style={{ color: '#e11d48', fontVariationSettings: "'FILL' 1" }}
      >
        favorite
      </span>
    </button>
  );
}
