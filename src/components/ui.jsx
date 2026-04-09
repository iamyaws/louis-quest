import React from 'react';
import { T } from '../constants';

// ── Onboarding shared wrappers ──
export const OBWrap = ({ children }) => (
  <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Nunito',sans-serif", color: T.textPrimary, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, paddingTop: "env(safe-area-inset-top, 24px)" }}>
    {children}
  </div>
);

export const OBTitle = ({ children }) => (
  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.5rem", fontWeight: 800, color: T.primary, textAlign: "center", marginBottom: 8, textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.02em" }}>
    {children}
  </div>
);

export const OBSub = ({ children }) => (
  <div style={{ fontSize: ".9rem", color: T.textSecondary, textAlign: "center", marginBottom: 24 }}>
    {children}
  </div>
);

export const OBBtn = ({ children, onClick, disabled, big }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? "rgba(0,0,0,0.06)" : `linear-gradient(135deg,${T.primary},${T.primaryLight})`,
    border: "none", borderRadius: 50,
    padding: big ? "18px 52px" : "14px 36px",
    color: disabled ? T.textLight : "white",
    fontWeight: 800, fontSize: big ? "1.15rem" : "1rem",
    cursor: disabled ? "default" : "pointer",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    textTransform: "uppercase", letterSpacing: ".05em",
    boxShadow: disabled ? "none" : `0 8px 24px ${T.primary}40`,
    opacity: disabled ? .5 : 1, transition: "all .2s",
    minHeight: 48,
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
  <button onClick={onClick} style={{
    background: selected ? "rgba(109,40,217,0.1)" : "white",
    border: selected ? `2.5px solid ${T.primary}` : "2px solid rgba(0,0,0,0.08)",
    borderRadius: 16, padding: "14px", cursor: "pointer", transition: "all .15s",
    fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: ".9rem",
    color: T.textPrimary, textAlign: "center",
    boxShadow: selected ? `0 4px 16px ${T.primary}20` : "0 2px 8px rgba(0,0,0,0.04)",
    minHeight: 48,
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
    <button onClick={onClick} style={{
      background: light ? "rgba(255,255,255,0.8)" : "white",
      border: light ? "none" : "2px solid rgba(0,0,0,0.06)",
      borderRadius: 50, padding: "10px 20px", cursor: "pointer",
      fontWeight: 800, fontSize: ".85rem", minHeight: 48, minWidth: 48,
      backdropFilter: light ? "blur(8px)" : "none",
    }}>
      ← Zurück
    </button>
  );
}

// ── View header ──
export function ViewHeader({ onBack, title, right, light }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 8 }}>
      <BackButton onClick={onBack} light={light} />
      <div style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.1rem", fontWeight: 800,
        color: light ? "white" : T.primary, textTransform: "uppercase", fontStyle: "italic",
        textShadow: light ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
      }}>
        {title}
      </div>
      {right || <div style={{ width: 80 }} />}
    </div>
  );
}
