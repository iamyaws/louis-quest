import React from 'react';
import { T } from '../constants';

export default function LoginBonus({ onCollect, claimed }) {
  if (claimed) return null;

  return (
    <button
      className="btn-tap game-card"
      onClick={onCollect}
      style={{
        padding: "16px 18px", marginBottom: 12, width: "100%",
        background: "linear-gradient(135deg, rgba(252,211,77,0.12), rgba(245,158,11,0.06))",
        borderColor: "rgba(245,158,11,0.25)",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", textAlign: "left",
        animation: "loginPulse 2s ease-in-out infinite",
      }}
    >
      <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{"\uD83D\uDC4B"}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700,
          color: "#B45309",
        }}>
          Willkommen zur\u00FCck, Held!
        </div>
        <div style={{ fontSize: ".9rem", fontWeight: 700, color: T.textSecondary, marginTop: 2 }}>
          Tippe f\u00FCr deinen t\u00E4glichen Heldenpunkt {"\u2B50"}
        </div>
      </div>
      <div style={{
        background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
        borderRadius: 50, padding: "6px 14px",
        fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700,
        color: "white", whiteSpace: "nowrap",
      }}>
        +5 {"\u2B50"}
      </div>
    </button>
  );
}
