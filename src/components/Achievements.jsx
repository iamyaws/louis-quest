import React from 'react';
import { T, BADGES as BADGE_DEFS } from '../constants';
import { ViewHeader } from './ui';
import HeroSprite from './HeroSprite';

export default function Achievements({ state, level, setView }) {
  const badges = BADGE_DEFS.map((b, i) => ({
    ...b,
    u: [state.xp > 0, state.sd >= 3, state.sd >= 7, level >= 5, state.hist.length >= 50, level >= 10, state.sd >= 30, state.hist.length >= 100, state.acc.length > 0][i],
  }));

  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "env(safe-area-inset-top, 12px) 20px 100px" }}>
      <ViewHeader onBack={() => setView("hub")} title="Erfolge" />
      <div style={{ background: "white", borderRadius: 20, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "2px solid rgba(0,0,0,0.04)" }}>
        <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={80} level={level} />
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "1.05rem" }}>{state.hero.name}</div>
          <div style={{ fontSize: ".75rem", color: T.textSecondary, fontWeight: 600 }}>Level {level} Held</div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: T.primary }}>{"\u26A1"}{state.xp}</span>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: T.accentDark }}>{"\u{1FA99}"}{state.coins}</span>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#F97316" }}>{"\u{1F525}"}{state.sd}d</span>
          </div>
        </div>
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".8rem", color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Badges</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
        {badges.map((b, i) => (
          <div key={i} style={{ background: b.u ? "white" : T.bg, border: b.u ? `2px solid ${T.primary}30` : "2px solid rgba(0,0,0,0.04)", borderRadius: 16, padding: "16px 8px", textAlign: "center", opacity: b.u ? 1 : .35, boxShadow: b.u ? `0 4px 12px ${T.primary}10` : "none" }}>
            <div style={{ fontSize: "2rem", marginBottom: 4 }}>{b.i}</div>
            <div style={{ fontSize: ".7rem", fontWeight: 800, color: b.u ? T.primary : T.textLight }}>{b.n}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".8rem", color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Stats</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[{ l: "Gesamt XP", v: state.xp, i: "\u26A1" }, { l: "M\u00FCnzen", v: state.coins, i: "\u{1FA99}" }, { l: "Quests", v: state.hist.length, i: "\u2694\uFE0F" }, { l: "Streak", v: state.sd + "d", i: "\u{1F525}" }, { l: "Level", v: level, i: "\u{1F4C8}" }].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: 14, padding: "14px 18px", border: "2px solid rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: "1.2rem" }}>{s.i}</span><span style={{ fontSize: ".85rem", fontWeight: 700 }}>{s.l}</span></div>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: T.primary }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
