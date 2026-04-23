import React from 'react';

/**
 * UnlockStamps — kid-friendly progress row that replaces the plain
 * em-dash-style unlock hint pills. Five rounded stamp slots; each
 * filled slot is a small amber disc with a checkmark, empty slots
 * are dashed outlines. A short caption sits above the row.
 *
 * Marc 25 Apr 2026: "this could rather be a progress bar that's on
 * brand and on product design for kids to understand. Like collecting
 * stamps or something vs plain text."
 *
 * Props:
 *   - label   : short caption above the row ("Tagebuch wartet" / "Laden wartet")
 *   - filled  : number of stamps collected so far (0..total)
 *   - total   : total stamps in the row (default 5)
 *   - detail  : optional small subline below the stamps for context
 *               (e.g. "Noch 2 Aufgaben und eine Stimmung")
 */
export default function UnlockStamps({ label, filled, total = 5, detail }) {
  const safeFilled = Math.max(0, Math.min(total, filled));
  return (
    <div
      className="self-center flex flex-col items-center"
      style={{
        gap: 6,
        padding: '10px 14px',
        borderRadius: 18,
        background: 'rgba(252,211,77,0.16)',
        border: '1px solid rgba(180,83,9,0.22)',
        maxWidth: '92%',
      }}
    >
      {label && (
        <span
          className="font-label font-bold uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            color: '#A83E2C',
          }}
        >
          {label}
        </span>
      )}
      <div className="flex items-center" style={{ gap: 6 }}>
        {Array.from({ length: total }, (_, i) => {
          const isFilled = i < safeFilled;
          return (
            <span
              key={i}
              aria-hidden="true"
              className="flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: isFilled
                  ? 'linear-gradient(160deg, #fcd34d, #f59e0b)'
                  : 'transparent',
                border: isFilled
                  ? '1px solid rgba(161,98,7,0.45)'
                  : '1.5px dashed rgba(168,62,44,0.35)',
                boxShadow: isFilled
                  ? '0 2px 4px -1px rgba(161,98,7,0.35), inset 0 1px 0 rgba(255,255,255,0.5)'
                  : 'none',
                transition: 'background 0.3s ease, border 0.3s ease',
              }}
            >
              {isFilled && (
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 14,
                    color: '#A83E2C',
                    fontVariationSettings: "'FILL' 1, 'wght' 700",
                  }}
                >
                  check
                </span>
              )}
            </span>
          );
        })}
      </div>
      {detail && (
        <span
          className="font-body text-center"
          style={{
            fontSize: 11,
            lineHeight: 1.3,
            color: 'rgba(18,67,70,0.7)',
            fontWeight: 500,
          }}
          role="status"
          aria-live="polite"
        >
          {detail}
        </span>
      )}
    </div>
  );
}
