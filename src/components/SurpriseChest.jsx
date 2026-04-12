import React from 'react';
import { T, MILESTONE_REWARDS } from '../constants';
import SFX from '../utils/sfx';

export default function SurpriseChest({ onOpen, streakDays }) {
  const milestone = MILESTONE_REWARDS[streakDays];

  const collect = () => {
    SFX.play("celeb");
    onOpen();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9990, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .3s ease" }}>
      <div style={{ background: "white", borderRadius: 28, padding: 28, textAlign: "center", maxWidth: 320, width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", fontStyle: "italic", marginBottom: 4 }}>{"\u{1F389}"} Meilenstein!</div>
        <div style={{ fontSize: ".8rem", color: T.textSecondary, marginBottom: 16 }}>{streakDays} Tage drangeblieben!</div>
        <div style={{ fontSize: "4rem", marginBottom: 8 }}>{milestone ? milestone.icon : "\u{1F3C6}"}</div>
        <div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: T.primary, marginBottom: 4 }}>
          {milestone ? `Du hast freigeschaltet: ${milestone.icon} ${milestone.label}!` : `${streakDays}-Tage Meilenstein!`}
        </div>
        <button onClick={collect} style={{
          background: `linear-gradient(135deg,${T.success},${T.successDark})`,
          border: "none", borderRadius: 50, padding: "14px 36px",
          color: "white", fontWeight: 800, cursor: "pointer",
          fontFamily: "'Fredoka',sans-serif", marginTop: 12, minHeight: 48,
        }}>
          Weiter so! {"\u{1F4AA}"}
        </button>
      </div>
    </div>
  );
}
