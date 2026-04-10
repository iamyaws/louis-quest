import React from 'react';
import { T } from '../constants';

export default function QuickLinks({ setView }) {
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn-tap" onClick={() => setView("journal")} style={{ flex: 1, background: "white", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 18, padding: "14px 12px", cursor: "pointer", fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: "1.05rem", color: T.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>{"\uD83D\uDCD3"} Tagebuch</button>
        <button className="btn-tap" onClick={() => setView("time")} style={{ flex: 1, background: "white", border: "2.5px solid rgba(180,120,40,0.08)", borderRadius: 18, padding: "14px 12px", cursor: "pointer", fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: "1.05rem", color: T.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>{"\u2B50"} Belohnungen</button>
      </div>
      <button className="btn-tap" onClick={() => setView("regeln")} style={{ width: "100%", background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))", border: "2.5px solid rgba(245,158,11,0.15)", borderRadius: 18, padding: "14px 12px", cursor: "pointer", fontFamily: "'Fredoka',sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#B45309", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 12 }}>{"\uD83D\uDEE1\uFE0F"} Helden-Kodex</button>
    </>
  );
}
