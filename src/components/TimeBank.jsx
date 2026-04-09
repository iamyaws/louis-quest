import React from 'react';
import { T } from '../constants';
import { ViewHeader } from './ui';
import { useGame } from '../context/GameContext';

export default function TimeBank() {
  const { state, computed, ui } = useGame();
  const { allDone, done, total } = computed;

  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px" }}>
      <ViewHeader onBack={() => ui.setView("hub")} title="Zeitbank" light />
      <div className="game-card" style={{ padding: 28, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: ".8rem", color: T.textSecondary, fontWeight: 600, marginBottom: 4 }}>Heute verdient</div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "3rem", fontWeight: 700, color: T.success }}>{state.dt} <span style={{ fontSize: "1rem", color: T.textSecondary }}>Min</span></div>
        <div style={{ fontSize: ".75rem", color: T.primaryLight, fontWeight: 700, marginTop: 4 }}>{allDone ? "\u{1F389} Alle Quests erledigt!" : `${total - done} Quests übrig`}</div>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".8rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Belohnungen</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {state.rewards.map(r => {
          const can = state.dt >= r.minutes;
          return (
            <div key={r.id} className="game-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", opacity: can ? 1 : .45, borderColor: can ? `${T.success}40` : undefined, boxShadow: can ? `0 4px 16px ${T.success}15` : undefined }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: can ? `${T.success}15` : "rgba(0,50,150,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{r.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: ".95rem" }}>{r.name}</div><div style={{ fontSize: ".7rem", color: T.textSecondary, fontWeight: 600 }}>{r.minutes} Minuten</div></div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: can ? T.success : T.textLight }}>{can ? "\u2713 Frei" : "\u{1F512}"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
