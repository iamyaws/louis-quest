import React from 'react';
import { WALL_COLORS, FLOOR_TYPES } from '../../constants';

export default function RoomCustomizer({ visible, onClose, roomTheme, roomLevel, onSetTheme }) {
  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 50,
          transition: "opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 51,
        background: "white",
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
        padding: "0 0 env(safe-area-inset-bottom, 24px)",
        maxHeight: "70vh",
        overflowY: "auto",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{
            width: 40, height: 5, borderRadius: 3,
            background: "#D1D5DB",
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "4px 20px 12px",
        }}>
          <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "1.2rem", fontWeight: 700,
            color: "#1E293B",
          }}>
            {"\u{1F3A8}"} Zimmer gestalten
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9", border: "none", borderRadius: 50,
              width: 36, height: 36, fontSize: "1.1rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748B", fontWeight: 700,
            }}
          >
            {"\u2715"}
          </button>
        </div>

        {/* Wall Color Section */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "0.95rem", fontWeight: 600,
            color: "#475569", marginBottom: 10,
          }}>
            Wandfarbe
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {WALL_COLORS.map((c) => {
              const unlocked = roomLevel >= c.unlock;
              const selected = roomTheme.wallColor === c.color;
              return (
                <button
                  key={c.id}
                  onClick={() => unlocked && onSetTheme({ wallColor: c.color })}
                  aria-label={`${c.name}${unlocked ? "" : ` - ab Level ${c.unlock}`}`}
                  style={{
                    position: "relative",
                    width: 44, height: 44,
                    borderRadius: "50%",
                    border: selected ? "3px solid #F59E0B" : "2px solid #E2E8F0",
                    boxShadow: selected ? "0 0 0 2px #FCD34D" : "none",
                    background: c.color,
                    cursor: unlocked ? "pointer" : "default",
                    opacity: unlocked ? 1 : 0.5,
                    padding: 0,
                    flexShrink: 0,
                    transition: "box-shadow 0.2s ease, border 0.2s ease",
                  }}
                >
                  {!unlocked && (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.25)",
                    }}>
                      <span style={{ fontSize: "12px", lineHeight: 1 }}>{"\u{1F512}"}</span>
                      <span style={{
                        fontSize: "12px", fontWeight: 800,
                        color: "white", lineHeight: 1, marginTop: 1,
                      }}>
                        Lvl {c.unlock}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Floor Type Section */}
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "0.95rem", fontWeight: 600,
            color: "#475569", marginBottom: 10,
          }}>
            Boden
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {FLOOR_TYPES.map((f) => {
              const unlocked = roomLevel >= f.unlock;
              const selected = roomTheme.floorType === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => unlocked && onSetTheme({ floorType: f.id })}
                  aria-label={`${f.name}${unlocked ? "" : ` - ab Level ${f.unlock}`}`}
                  style={{
                    position: "relative",
                    width: 44, height: 44,
                    borderRadius: "50%",
                    border: selected ? "3px solid #F59E0B" : "2px solid #E2E8F0",
                    boxShadow: selected ? "0 0 0 2px #FCD34D" : "none",
                    background: `linear-gradient(135deg, ${f.color1} 0%, ${f.color2} 100%)`,
                    cursor: unlocked ? "pointer" : "default",
                    opacity: unlocked ? 1 : 0.5,
                    padding: 0,
                    flexShrink: 0,
                    transition: "box-shadow 0.2s ease, border 0.2s ease",
                  }}
                >
                  {!unlocked && (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.25)",
                    }}>
                      <span style={{ fontSize: "12px", lineHeight: 1 }}>{"\u{1F512}"}</span>
                      <span style={{
                        fontSize: "12px", fontWeight: 800,
                        color: "white", lineHeight: 1, marginTop: 1,
                      }}>
                        Lvl {f.unlock}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
