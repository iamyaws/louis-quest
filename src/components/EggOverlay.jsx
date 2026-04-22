import React, { useState } from 'react';
import SFX from '../utils/sfx';
import { useTranslation } from '../i18n/LanguageContext';
import { useHaptic } from '../hooks/useHaptic';

export default function EggOverlay({ egg, onCollect }) {
  const { lang } = useTranslation();
  const haptic = useHaptic();
  const [collected, setCollected] = useState(false);

  const handleCollect = () => {
    if (collected) return;
    setCollected(true);
    SFX.play('pop');
    haptic('celebration');
    setTimeout(onCollect, 380);
  };

  const label = lang === 'de' ? egg.labelDe : egg.labelEn;

  return (
    <button
      type="button"
      aria-label={lang === 'de' ? `${label} einsammeln` : `Collect ${label}`}
      onClick={handleCollect}
      style={{
        position: 'fixed',
        bottom: 'calc(108px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: collected
          ? 'translateX(-50%) scale(0)'
          : 'translateX(-50%) scale(1)',
        transition: collected
          ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      {/* Hint pill */}
      <span
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontWeight: 700,
          fontSize: 12,
          color: 'rgba(255,255,255,0.9)',
          background: 'rgba(0,0,0,0.5)',
          padding: '3px 12px',
          borderRadius: 99,
          backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
        }}
      >
        {lang === 'de' ? 'Tippe!' : 'Tap!'}
      </span>

      {/* Egg shape */}
      <div
        style={{
          width: 52,
          height: 64,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          background: `radial-gradient(ellipse at 38% 35%, #fff 0%, ${egg.accentColor} 100%)`,
          boxShadow: `0 0 28px 10px ${egg.accentColor}55, 0 4px 16px rgba(0,0,0,0.25)`,
          animation: 'companion-float 3s ease-in-out infinite',
        }}
      />

      {/* Label */}
      <span
        style={{
          fontFamily: '"Fredoka", sans-serif',
          fontWeight: 700,
          fontSize: 13,
          color: '#fff',
          textShadow: `0 0 10px ${egg.accentColor}`,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  );
}
