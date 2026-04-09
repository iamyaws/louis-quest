import React from 'react';
import { T } from '../constants';

// ── Onboarding shared wrappers ──
export const OBWrap = ({ children }) => (
  <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", color: T.textPrimary, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: "env(safe-area-inset-top, 24px)" }}>
    {children}
  </div>
);

export const OBTitle = ({ children }) => (
  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: T.primary, textAlign: "center", marginBottom: 8, letterSpacing: "-0.01em" }}>
    {children}
  </div>
);

export const OBSub = ({ children }) => (
  <div style={{ fontSize: "1rem", color: T.textSecondary, textAlign: "center", marginBottom: 24, fontWeight: 600 }}>
    {children}
  </div>
);

export const OBBtn = ({ children, onClick, disabled, big }) => (
  <button className="btn-tap" onClick={onClick} disabled={disabled} style={{
    background: disabled ? "rgba(0,0,0,0.06)" : `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
    border: "none", borderRadius: 50,
    padding: big ? "18px 52px" : "14px 36px",
    color: disabled ? T.textLight : T.textPrimary,
    fontWeight: 800, fontSize: big ? "1.15rem" : "1rem",
    cursor: disabled ? "default" : "pointer",
    fontFamily: "'Fredoka',sans-serif",
    boxShadow: disabled ? "none" : `0 8px 24px ${T.accent}40`,
    opacity: disabled ? .5 : 1, transition: "all .2s",
    minHeight: 52,
  }}>
    {children}
  </button>
);

export const OBGrid = ({ children, cols }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12, width: "100%", maxWidth: 360 }}>
    {children}
  </div>
);

export const OBChip = ({ selected, onClick, children }) => (
  <button className="btn-tap" onClick={onClick} style={{
    background: selected ? `${T.accent}20` : T.card,
    border: selected ? `3px solid ${T.accent}` : `3px solid rgba(0,0,0,0.05)`,
    borderRadius: 18, padding: "14px", cursor: "pointer", transition: "all .15s",
    fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: "1rem",
    color: T.textPrimary, textAlign: "center",
    boxShadow: selected ? `0 4px 16px ${T.accent}30` : "0 2px 12px rgba(0,0,0,0.04)",
    minHeight: 52,
  }}>
    {children}
  </button>
);

// ── Progress Ring ──
export function ProgressRing({ progress, size, stroke, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (progress * circ);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

// ── Back button (consistent, larger touch target) ──
export function BackButton({ onClick, light }) {
  return (
    <button className="btn-tap" onClick={onClick} style={{
      background: light ? "rgba(255,255,255,0.8)" : T.card,
      border: light ? "none" : `3px solid rgba(0,0,0,0.05)`,
      borderRadius: 50, padding: "10px 20px", cursor: "pointer",
      fontWeight: 800, fontSize: ".9rem", minHeight: 48, minWidth: 48,
      backdropFilter: light ? "blur(8px)" : "none",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      color: T.textPrimary,
    }}>
      {"\u2190"} Zurück
    </button>
  );
}

// ── View header ──
export function ViewHeader({ onBack, title, icon, right, light }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 8 }}>
      <BackButton onClick={onBack} light={light} />
      <div style={{
        fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700,
        color: light ? "white" : T.primary,
        textShadow: light ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
      }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{title}
      </div>
      {right || <div style={{ width: 80 }} />}
    </div>
  );
}
