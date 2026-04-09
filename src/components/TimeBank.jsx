import React from 'react';
import { T } from '../constants';
import { ViewHeader } from './ui';

export default function TimeBank({ state, allDone, done, total, setView }) {
  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "env(safe-area-inset-top, 12px) 20px 100px" }}>
      <ViewHeader onBack={() => setView("hub")} title="Zeitbank" />
      <div style={{ background: `linear-gradient(135deg, ${T.primary}12, ${T.success}10)`, borderRadius: 24, padding: 28, textAlign: "center", marginBottom: 24, border: `2px solid ${T.primary}15` }}>
        <div style={{ fontSize: ".8rem", color: T.textSecondary, fontWeight: 600, marginBottom: 4 }}>Heute verdient</div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "3rem", fontWeight: 700, color: T.success }}>{state.dt} <span style={{ fontSize: "1rem", color: T.textSecondary }}>Min</span></div>
        <div style={{ fontSize: ".75rem", color: T.primaryLight, fontWeight: 700, marginTop: 4 }}>{allDone ? "\u{1F389} Alle Quests erledigt!" : `${total - done} Quests übrig`}</div>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".8rem", color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Belohnungen</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {state.rewards.map(r => {
          const can = state.dt >= r.minutes;
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "white", border: can ? `2px solid ${T.success}30` : "2px solid rgba(0,0,0,0.04)", borderRadius: 18, padding: "16px 18px", opacity: can ? 1 : .45, boxShadow: can ? `0 4px 16px ${T.success}15` : "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: can ? `${T.success}15` : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{r.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: ".95rem" }}>{r.name}</div><div style={{ fontSize: ".7rem", color: T.textSecondary, fontWeight: 600 }}>{r.minutes} Minuten</div></div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: can ? T.success : T.textLight }}>{can ? "\u2713 Frei" : "\u{1F512}"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
