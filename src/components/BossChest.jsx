import React, { useState, useEffect, useMemo } from 'react';
import SFX from '../utils/sfx';

/**
 * BossChest — Full-screen overlay shown when a boss is defeated.
 *
 * Phases:
 *  1. (0-1s)   Boss defeated announcement
 *  2. (1-3s)   Chest drops in, glows, "Tippe um zu oeffnen!" pulses
 *  3. (on tap) Chest opens, rewards float up, continue button after 1.5s
 */
export default function BossChest({ bossName, bossIcon, hpReward, unlockedItem, onClose }) {
  const [phase, setPhase] = useState(1); // 1=announce, 2=chest, 3=opened
  const [showContinue, setShowContinue] = useState(false);

  // Phase transitions
  useEffect(() => {
    if (phase === 1) {
      SFX.play("bossDefeat");
      const t = setTimeout(() => setPhase(2), 1200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 3) {
      SFX.play("celeb");
      const t = setTimeout(() => setShowContinue(true), 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleChestTap = () => {
    if (phase === 2) {
      SFX.play("pop");
      setPhase(3);
    }
  };

  // Sparkle particles for phase 3 (memoized so random values stay stable)
  const sparkles = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const dist = 60 + Math.random() * 50;
    const dx = Math.cos((angle * Math.PI) / 180) * dist;
    const dy = Math.sin((angle * Math.PI) / 180) * dist;
    const size = 4 + Math.random() * 6;
    const delay = Math.random() * 0.3;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: "50%",
          background: i % 3 === 0 ? "#FCD34D" : i % 3 === 1 ? "#F59E0B" : "#FBBF24",
          left: "50%",
          top: "50%",
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
          animation: `bossChestSparkle 0.8s ${delay}s ease-out forwards`,
          opacity: 0,
        }}
      />
    );
  }), []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.4s ease",
      }}
      onClick={handleChestTap}
    >
      {/* Phase 1: Boss defeated announcement */}
      {phase === 1 && (
        <div style={{ textAlign: "center", animation: "bossChestAnnounce 0.6s ease-out" }}>
          <div style={{ fontSize: "4.5rem", marginBottom: 8, filter: "drop-shadow(0 0 20px rgba(255,0,0,0.4))" }}>
            {bossIcon}
          </div>
          <div
            style={{
              fontFamily: "'Fredoka', 'Nunito', sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 2px 8px rgba(245,158,11,0.5))",
              letterSpacing: 2,
            }}
          >
            BOSS BESIEGT!
          </div>
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.85)",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            {bossName}
          </div>
        </div>
      )}

      {/* Phase 2: Chest appears */}
      {phase === 2 && (
        <div style={{ textAlign: "center" }}>
          {/* Chest glow */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              animation: "bossChestDrop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            {/* Glow circle behind chest */}
            <div
              style={{
                position: "absolute",
                inset: -30,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(252,211,77,0.4) 0%, transparent 70%)",
                animation: "bossChestGlow 1.5s ease-in-out infinite",
              }}
            />
            {/* Chest SVG */}
            <svg width="120" height="110" viewBox="0 0 120 110" style={{ position: "relative", zIndex: 1 }}>
              {/* Chest body */}
              <rect x="10" y="45" width="100" height="55" rx="8" fill="#92400E" stroke="#78350F" strokeWidth="3"/>
              <rect x="10" y="45" width="100" height="55" rx="8" fill="url(#chestGrad)" />
              {/* Chest rim */}
              <rect x="10" y="45" width="100" height="14" rx="4" fill="#B45309"/>
              {/* Chest lock */}
              <circle cx="60" cy="72" r="10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
              <rect x="56" y="70" width="8" height="12" rx="2" fill="#F59E0B"/>
              {/* Chest lid */}
              <path d="M10 50 Q60 10 110 50" fill="#B45309" stroke="#92400E" strokeWidth="2"/>
              <path d="M15 50 Q60 18 105 50" fill="#D97706"/>
              {/* Shine */}
              <ellipse cx="40" cy="36" rx="12" ry="4" fill="rgba(255,255,255,0.3)" transform="rotate(-15 40 36)"/>
              <defs>
                <linearGradient id="chestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Tap instruction */}
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#FCD34D",
              marginTop: 24,
              animation: "bossChestPulse 1.2s ease-in-out infinite",
            }}
          >
            Tippe um zu oeffnen!
          </div>
        </div>
      )}

      {/* Phase 3: Chest opened, rewards */}
      {phase === 3 && (
        <div style={{ textAlign: "center", position: "relative" }} onClick={e => e.stopPropagation()}>
          {/* Open chest SVG */}
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* Sparkles */}
            {sparkles}
            {/* Light burst */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "40%",
                width: 200,
                height: 200,
                marginLeft: -100,
                marginTop: -100,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(252,211,77,0.5) 0%, rgba(252,211,77,0.1) 40%, transparent 70%)",
                animation: "bossChestBurst 0.6s ease-out",
              }}
            />
            <svg width="120" height="130" viewBox="0 0 120 130" style={{ position: "relative", zIndex: 1 }}>
              {/* Chest body (same) */}
              <rect x="10" y="65" width="100" height="55" rx="8" fill="#92400E" stroke="#78350F" strokeWidth="3"/>
              <rect x="10" y="65" width="100" height="55" rx="8" fill="url(#chestGradOpen)" />
              <rect x="10" y="65" width="100" height="14" rx="4" fill="#B45309"/>
              {/* Open interior glow */}
              <rect x="18" y="72" width="84" height="40" rx="4" fill="#FEF3C7"/>
              <rect x="18" y="72" width="84" height="40" rx="4" fill="url(#interiorGlow)"/>
              {/* Chest lid flipped open */}
              <g style={{ transformOrigin: "60px 65px", animation: "bossChestLidOpen 0.5s ease-out forwards" }}>
                <path d="M10 70 Q60 30 110 70" fill="#B45309" stroke="#92400E" strokeWidth="2"/>
                <path d="M15 70 Q60 38 105 70" fill="#D97706"/>
                <ellipse cx="40" cy="56" rx="12" ry="4" fill="rgba(255,255,255,0.3)" transform="rotate(-15 40 56)"/>
              </g>
              {/* Lock (broken/open) */}
              <circle cx="60" cy="92" r="8" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" opacity="0.5"/>
              <defs>
                <linearGradient id="chestGradOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <radialGradient id="interiorGlow" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#FEF3C7" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Rewards floating up */}
          <div style={{ marginTop: 16 }}>
            {/* HP reward */}
            <div
              style={{
                fontFamily: "'Fredoka', 'Nunito', sans-serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 8px rgba(245,158,11,0.5))",
                animation: "bossChestRewardFloat 0.7s 0.2s ease-out both",
                marginBottom: 8,
              }}
            >
              +{hpReward} Heldenpunkte!
            </div>

            {/* Unlocked item */}
            {unlockedItem && (
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#C084FC",
                  textShadow: "0 0 12px rgba(192,132,252,0.5)",
                  animation: "bossChestRewardFloat 0.7s 0.5s ease-out both",
                }}
              >
                {unlockedItem.icon} {unlockedItem.name} freigeschaltet!
              </div>
            )}
          </div>

          {/* Continue button */}
          {showContinue && (
            <button
              onClick={onClose}
              style={{
                marginTop: 28,
                background: "linear-gradient(135deg, #34D399, #059669)",
                border: "none",
                borderRadius: 50,
                padding: "16px 48px",
                color: "white",
                fontWeight: 800,
                fontSize: "1.1rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: "0 8px 24px rgba(5,150,105,0.4)",
                minHeight: 52,
                minWidth: 52,
                animation: "bossChestRewardFloat 0.5s ease-out both",
              }}
            >
              Weiter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
