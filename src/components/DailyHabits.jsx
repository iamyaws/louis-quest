import React from 'react';
import { T } from '../constants';
import { DEFAULT_FAMILY_CONFIG } from '../types/familyConfig';

export default function DailyHabits({ state, actions, onCatView }) {
  const catAllDone = state.catFed && state.catPetted && state.catPlayed;
  const config = state.familyConfig || DEFAULT_FAMILY_CONFIG;
  const habits = config.dailyHabits || [];
  const doneMap = state.dailyHabits || {};

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {habits.map(habit => {
        const isDone = !!doneMap[habit.id];
        return (
          <button
            key={habit.id}
            className="btn-tap"
            onClick={() => { if (!isDone) { actions.completeHabit(habit.id); if (navigator.vibrate) navigator.vibrate(50); } }}
            style={{
              flex: 1,
              background: isDone ? "rgba(52,211,153,0.1)" : "white",
              border: `2.5px solid ${isDone ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`,
              borderRadius: 18,
              padding: "12px 6px",
              cursor: isDone ? "default" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              minHeight: 48,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{isDone ? habit.iconDone : habit.icon}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: isDone ? "#059669" : T.textPrimary }}>
              {habit.name}
            </span>
            {!isDone && <span style={{ fontSize: "1rem", fontWeight: 700, color: "#D97706" }}>+{habit.xp} ⭐</span>}
          </button>
        );
      })}
      <button className="btn-tap" onClick={onCatView} style={{ flex: 1, background: catAllDone ? "rgba(52,211,153,0.1)" : "white", border: `2.5px solid ${catAllDone ? "rgba(52,211,153,0.3)" : "rgba(180,120,40,0.10)"}`, borderRadius: 18, padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative" }}>
        <span style={{ fontSize: "1.6rem" }}>🐱</span>
        {catAllDone && <span style={{ position: "absolute", top: 4, right: 4, fontSize: ".9rem" }}>✅</span>}
        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: T.textPrimary }}>{state.catName || "Katze"}</span>
        {!catAllDone && <span style={{ fontSize: "1rem", fontWeight: 700, color: T.textLight }}>{[!state.catFed && "🍣", !state.catPetted && "🤍", !state.catPlayed && "🧶"].filter(Boolean).join(" ")}</span>}
      </button>
    </div>
  );
}
