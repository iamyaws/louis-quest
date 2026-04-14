import React from 'react';
import { T } from '../constants';
import { ViewHeader } from './ui';
import { useGame } from '../context/GameContext';

export default function Familienregeln() {
  const { ui } = useGame();

  return (
    <div className="view-enter" style={{ minHeight: "100dvh", background: T.bg }}>
      <ViewHeader title="Helden-Kodex" icon={"\uD83D\uDEE1\uFE0F"} onBack={() => ui.setView("hub")} />

      <div style={{ padding: "0 16px 100px" }}>

        {/* Card 1: The big rule */}
        <div className="game-card" style={{
          padding: 24, marginBottom: 16, textAlign: "center",
          background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))",
          borderColor: "rgba(245,158,11,0.2)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>{"\uD83D\uDC9B"}</div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#B45309", marginBottom: 12 }}>
            {"Lieb sein. Sich M\u00FChe geben. Zusammen sein."}
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700,
            color: T.primary, background: "rgba(252,211,77,0.15)",
            borderRadius: 14, padding: "10px 16px", display: "inline-block",
          }}>
            {"\u2728"} Ich bin geliebt, so wie ich bin.
          </div>
        </div>

        {/* Card 2: Hero rules — big icons, minimal text */}
        <div className="game-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: T.primary, marginBottom: 16, textAlign: "center" }}>
            {"\uD83D\uDEE1\uFE0F"} Ein wahrer Held...
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { emoji: "\uD83D\uDCAA", text: "Gibt sein Bestes" },
              { emoji: "\uD83E\uDD1D", text: "Hilft anderen" },
              { emoji: "\uD83D\uDDE3\uFE0F", text: "Ist ehrlich" },
              { emoji: "\uD83C\uDF1F", text: "Probiert Neues" },
              { emoji: "\uD83E\uDDD8", text: "Bleibt ruhig" },
              { emoji: "\uD83D\uDE4F", text: "Sagt Danke" },
            ].map((r, i) => (
              <div key={i} style={{
                background: "rgba(109,40,217,0.04)", borderRadius: 14,
                padding: "12px 10px", textAlign: "center",
              }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{r.emoji}</div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: T.textPrimary }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Promise */}
        <div className="game-card" style={{
          padding: 24, textAlign: "center",
          background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))",
          borderColor: "rgba(245,158,11,0.2)",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{"\uD83E\uDD17"}</div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: T.textPrimary, lineHeight: 1.5, marginBottom: 12 }}>
            {"Fehler sind okay. Mama & Papa sind immer f\u00FCr dich da."}
          </div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700,
            color: "#B45309", background: "rgba(252,211,77,0.15)",
            borderRadius: 14, padding: "10px 16px",
          }}>
            {"\uD83D\uDC9B"} Liam, Papa und Mama lieben dich.
          </div>
        </div>

      </div>
    </div>
  );
}
