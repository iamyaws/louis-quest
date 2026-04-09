import React, { useState } from 'react';
import { T } from '../constants';

const REWARDS = [
  { day: 1, amount: 10, icon: "\u2B50" },
  { day: 2, amount: 15, icon: "\u2B50" },
  { day: 3, amount: 20, icon: "\u2B50" },
  { day: 4, amount: 25, icon: "\u2B50" },
  { day: 5, amount: 30, icon: "\u2B50" },
  { day: 6, amount: 40, icon: "\u2B50" },
  { day: 7, amount: 75, icon: "\uD83C\uDF1F" },
];

export default function LoginBonus({ day, streak, onCollect, claimed }) {
  const [expanded, setExpanded] = useState(false);
  const todayReward = REWARDS[day] || REWARDS[0];

  // Collapsed: compact single-line bar
  if (!expanded) {
    return (
      <button
        className="btn-tap game-card"
        onClick={() => setExpanded(true)}
        style={{
          padding: "12px 16px", marginBottom: 12, width: "100%",
          background: claimed
            ? "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.03))"
            : "linear-gradient(135deg, rgba(252,211,77,0.12), rgba(245,158,11,0.06))",
          borderColor: claimed ? "rgba(52,211,153,0.25)" : "rgba(245,158,11,0.25)",
          display: "flex", alignItems: "center", gap: 12,
          cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>{claimed ? "\u2705" : "\uD83C\uDF81"}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".82rem", fontWeight: 800,
            color: claimed ? "#059669" : "#B45309",
          }}>
            {claimed ? "Bonus abgeholt!" : `Tag ${day + 1} \u2014 +${todayReward.amount} \u2B50`}
          </div>
          <div style={{ fontSize: ".7rem", fontWeight: 600, color: T.textLight }}>
            {streak > 0 ? `\uD83D\uDD25 ${streak} Tage Streak` : "Tippe f\u00FCr Details"}
          </div>
        </div>
        <div style={{
          fontSize: ".75rem", fontWeight: 800, color: T.textLight,
          transition: "transform .2s",
        }}>{"\u25BC"}</div>
      </button>
    );
  }

  // Expanded: full calendar grid
  return (
    <div className="game-card" style={{
      padding: 16, marginBottom: 12,
      background: "linear-gradient(135deg, rgba(252,211,77,0.12), rgba(245,158,11,0.06))",
      borderColor: "rgba(245,158,11,0.25)",
      overflow: "hidden", position: "relative",
    }}>
      {/* Header with collapse toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
          color: "#B45309", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {"\uD83C\uDF81"} T&auml;glicher Bonus &mdash; Tag {day + 1}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {streak > 0 && (
            <div style={{
              background: "rgba(245,158,11,0.15)", borderRadius: 50,
              padding: "2px 10px", fontFamily: "'Fredoka',sans-serif",
              fontSize: ".8rem", fontWeight: 700, color: "#D97706",
            }}>
              {"\uD83D\uDD25"} {streak} Tage
            </div>
          )}
          <button onClick={() => setExpanded(false)} style={{
            background: "rgba(180,120,40,0.08)", border: "none", borderRadius: 50,
            width: 32, height: 32, cursor: "pointer", fontSize: ".8rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.textSecondary, fontWeight: 800,
          }}>{"\u25B2"}</button>
        </div>
      </div>

      {/* 7-day grid: 4 + 3 layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {REWARDS.slice(0, 4).map((r, i) => (
            <RewardSlot key={i} reward={r} index={i} currentDay={day} onCollect={onCollect} claimed={claimed} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {REWARDS.slice(4).map((r, i) => (
            <RewardSlot key={i + 4} reward={r} index={i + 4} currentDay={day} onCollect={onCollect} claimed={claimed} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RewardSlot({ reward, index, currentDay, onCollect, claimed }) {
  const isClaimed = index < currentDay || (index === currentDay && claimed);
  const isCurrent = index === currentDay && !claimed;
  const isFuture = index > currentDay;
  const isJackpot = index === 6;

  const baseStyle = {
    flex: 1, maxWidth: 78, minWidth: 60, minHeight: 80,
    borderRadius: 16, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 2,
    padding: "8px 4px", border: "2.5px solid", position: "relative",
    transition: "all .2s ease", cursor: isCurrent ? "pointer" : "default",
  };

  let style;
  if (isClaimed) {
    style = { ...baseStyle, background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", borderColor: "#F59E0B", opacity: 0.85 };
  } else if (isCurrent) {
    style = {
      ...baseStyle,
      background: isJackpot ? "linear-gradient(135deg, #FCD34D, #F59E0B, #D97706)" : "linear-gradient(135deg, #FFFFFF, #FEF3C7)",
      borderColor: "#F59E0B",
      boxShadow: "0 0 12px rgba(245,158,11,0.4), 0 0 24px rgba(245,158,11,0.15)",
      animation: "loginPulse 2s ease-in-out infinite",
    };
  } else {
    style = { ...baseStyle, background: "rgba(148,163,184,0.08)", borderColor: "rgba(148,163,184,0.2)", opacity: 0.55 };
  }

  return (
    <div style={style} onClick={isCurrent ? onCollect : undefined}
      role={isCurrent ? "button" : undefined}
      aria-label={isCurrent ? `Tag ${reward.day} Bonus abholen: ${reward.amount} HP` : undefined}>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".7rem", fontWeight: 700, color: isClaimed ? "#92400E" : isCurrent ? "#92400E" : T.textLight, textTransform: "uppercase" }}>Tag {reward.day}</div>
      <div style={{ fontSize: isJackpot ? "1.5rem" : "1.2rem", lineHeight: 1, filter: isFuture ? "grayscale(0.8)" : "none" }}>{isClaimed ? "\u2705" : isFuture ? "\uD83D\uDD12" : reward.icon}</div>
      <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: isJackpot && isCurrent ? "1rem" : ".85rem", fontWeight: 700, color: isClaimed ? "#059669" : isCurrent ? "#D97706" : T.textLight }}>+{reward.amount}</div>
      {isCurrent && <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".7rem", fontWeight: 700, color: "white", background: isJackpot ? "linear-gradient(135deg, #D97706, #B45309)" : "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: 50, padding: "2px 10px", marginTop: 2, whiteSpace: "nowrap" }}>Abholen!</div>}
      {isJackpot && !isClaimed && <div style={{ position: "absolute", top: -6, right: -6, background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: 50, padding: "1px 6px", fontFamily: "'Fredoka',sans-serif", fontSize: ".55rem", fontWeight: 700, color: "white", boxShadow: "0 2px 4px rgba(217,119,6,0.3)" }}>Jackpot!</div>}
    </div>
  );
}
