import React, { useEffect, useState } from 'react';

// Ember particle positions / timing — spread across bottom third of screen
const EMBERS = [
  { left: '8%',  dur: '3.8s', delay: '0s',    drift: '14px'  },
  { left: '22%', dur: '4.5s', delay: '0.6s',  drift: '-8px'  },
  { left: '36%', dur: '3.2s', delay: '1.1s',  drift: '20px'  },
  { left: '50%', dur: '5.0s', delay: '0.2s',  drift: '-16px' },
  { left: '63%', dur: '3.6s', delay: '0.9s',  drift: '10px'  },
  { left: '75%', dur: '4.2s', delay: '0.4s',  drift: '-22px' },
  { left: '86%', dur: '3.9s', delay: '1.4s',  drift: '6px'   },
  { left: '42%', dur: '4.8s', delay: '1.8s',  drift: '18px'  },
];

/**
 * Full-screen parent-approval modal for HP reward redemption.
 *
 * Props:
 *  - reward: { id, emoji, cost, name }
 *  - onApprove: () => void — parent confirmed, HP gets deducted
 *  - onDismiss: () => void — cancelled, nothing changes
 */
export default function BelohnungRedeemModal({ reward, onApprove, onDismiss }) {
  const [visible, setVisible] = useState(false);

  // Fade-in after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleApprove = () => {
    setVisible(false);
    setTimeout(onApprove, 280);
  };
  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 280);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0c3236 0%, #124346 50%, #1a5e52 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}
    >
      {/* Ember particles rising from the bottom */}
      {EMBERS.map((e, i) => (
        <div
          key={i}
          className="ember"
          style={{
            left: e.left,
            '--dur': e.dur,
            '--delay': e.delay,
            '--drift': e.drift,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Soft radial glow behind the emoji */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 220, height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,211,77,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-8 text-center w-full max-w-sm">
        {/* Giant emoji */}
        <div className="text-8xl mb-4 select-none" aria-hidden="true">{reward.emoji}</div>

        {/* Reward name */}
        <h2 className="font-headline font-bold text-white leading-tight mb-3"
            style={{ fontSize: '2rem', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
          {reward.name}
        </h2>

        {/* HP cost pill */}
        <div className="mb-8">
          <span className="font-label font-bold text-sm px-4 py-1.5 rounded-full"
                style={{ background: 'rgba(252,211,77,0.18)', color: '#fcd34d', border: '1px solid rgba(252,211,77,0.3)' }}>
            {reward.cost} HP
          </span>
        </div>

        {/* Instruction for the kid */}
        <p className="font-body mb-10 leading-relaxed"
           style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem' }}>
          Zeig das deinen Eltern! 👋
        </p>

        {/* Parent approve button */}
        <button
          onClick={handleApprove}
          className="w-full font-headline font-bold text-xl rounded-full transition-all active:scale-95"
          style={{
            background: '#fcd34d',
            color: '#725b00',
            padding: '1.1rem 2rem',
            boxShadow: '0 8px 24px rgba(252,211,77,0.35), 0 4px 0 #d4a830',
          }}
        >
          Genehmigt! ✓
        </button>

        {/* Cancel */}
        <button
          onClick={handleDismiss}
          className="mt-5 font-label text-sm transition-all active:scale-95"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
