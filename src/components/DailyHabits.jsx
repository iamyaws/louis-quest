import React from 'react';
import { T } from '../constants';

export default function DailyHabits({ state, actions, onCatView }) {
  const catAllDone = state.catFed && state.catPetted && state.catPlayed;

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button className="btn-tap" onClick={() => { if (!state.dailyVitaminD) { actions.completeHabit("vitaminD"); if (navigator.vibrate) navigator.vibrate(50); } }} style={{ flex: 1, background: state.dailyVitaminD ? "rgba(52,211,153,0.1)" : "white", border: `2.5px solid ${state.dailyVitaminD ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`, borderRadius: 18, padding: "12px 6px", cursor: state.dailyVitaminD ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <span style={{ fontSize: "1.4rem" }}>{state.dailyVitaminD ? "\u2705" : "\uD83D\uDC8A"}</span>
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: state.dailyVitaminD ? "#059669" : T.textPrimary }}>Vitamin D</span>
        {!state.dailyVitaminD && <span style={{ fontSize: "1rem", fontWeight: 700, color: "#D97706" }}>+5 {"\u2B50"}</span>}
      </button>
      <button className="btn-tap" onClick={() => { if (!state.dailyBrother) { actions.completeHabit("brother"); if (navigator.vibrate) navigator.vibrate(50); } }} style={{ flex: 1, background: state.dailyBrother ? "rgba(52,211,153,0.1)" : "white", border: `2.5px solid ${state.dailyBrother ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`, borderRadius: 18, padding: "12px 6px", cursor: state.dailyBrother ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <span style={{ fontSize: "1.4rem" }}>{state.dailyBrother ? "\u2705" : "\uD83D\uDC76"}</span>
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: state.dailyBrother ? "#059669" : T.textPrimary }}>Liam</span>
        {!state.dailyBrother && <span style={{ fontSize: "1rem", fontWeight: 700, color: "#D97706" }}>+10 {"\u2B50"}</span>}
      </button>
      <button className="btn-tap" onClick={onCatView} style={{ flex: 1, background: catAllDone ? "rgba(52,211,153,0.1)" : "white", border: `2.5px solid ${catAllDone ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`, borderRadius: 18, padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative" }}>
        <span style={{ fontSize: "1.6rem" }}>{"\uD83D\uDC31"}</span>
        {catAllDone && <span style={{ position: "absolute", top: 4, right: 4, fontSize: ".9rem" }}>{"\u2705"}</span>}
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: T.textPrimary }}>{state.catName || "Katze"}</span>
        {!catAllDone && <span style={{ fontSize: "1rem", fontWeight: 700, color: T.textLight }}>{[!state.catFed && "\uD83C\uDF63", !state.catPetted && "\uD83E\uDD0D", !state.catPlayed && "\uD83E\uDDF6"].filter(Boolean).join(" ")}</span>}
      </button>
    </div>
  );
}
