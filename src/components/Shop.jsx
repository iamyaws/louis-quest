import React from 'react';
import { T, SHOP_ITEMS } from '../constants';
import { ViewHeader } from './ui';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';

export default function Shop() {
  const { state, actions, ui } = useGame();
  const { shopTab, setShopTab, setView } = ui;

  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "12px 16px 100px" }}>
      <ViewHeader onBack={() => setView("hub")} title="Shop" light right={
        <div style={{ background: "rgba(0,20,80,0.55)", backdropFilter: "blur(12px)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 50, padding: "6px 14px", fontSize: ".85rem", fontWeight: 800, color: "white" }}>{"\u{1FA99}"} {state.coins}</div>
      } />
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[{ id: "hero", l: "Held", i: "\u{1F9B8}", col: "#6D28D9" }, { id: "cat", l: "Katze", i: "\u{1F431}", col: "#BE185D" }, { id: "room", l: "Zimmer", i: "\u{1F3E0}", col: "#B45309" }].map(t => (
          <button key={t.id} className="btn-tap" onClick={() => setShopTab(t.id)} style={{
            flex: 1, background: shopTab === t.id ? "white" : "rgba(255,255,255,0.12)",
            border: shopTab === t.id ? `3px solid ${t.col}30` : "3px solid transparent",
            borderRadius: 18, padding: "12px 8px", cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800,
            fontSize: ".76rem", color: shopTab === t.id ? t.col : "rgba(255,255,255,0.7)",
            textTransform: "uppercase", textAlign: "center", minHeight: 48,
            boxShadow: shopTab === t.id ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
            transition: "all .2s ease",
          }}>{t.i}<br />{t.l}</button>
        ))}
      </div>
      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(SHOP_ITEMS[shopTab] || []).map(item => {
          const owned = (state.purchased || []).includes(item.id);
          const canBuy = state.coins >= item.cost && !owned;
          return (
            <div key={item.id} className="game-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderColor: owned ? `${T.success}40` : undefined }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: owned ? `${T.success}12` : "rgba(0,50,150,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{item.name}</div>
                <div style={{ fontSize: ".7rem", color: T.accentDark, fontWeight: 700 }}>{"\u{1FA99}"} {item.cost}</div>
              </div>
              <button className="btn-tap" onClick={() => canBuy && actions.buyItem(item.id, item.cost)} disabled={!canBuy && !owned} style={{
                background: owned ? `${T.success}12` : canBuy ? `linear-gradient(135deg,${T.primary},${T.primaryLight})` : "rgba(0,0,0,0.04)",
                border: owned ? `2px solid ${T.success}40` : "none", borderRadius: 50, padding: "10px 20px",
                color: owned ? T.successDark : canBuy ? "white" : T.textLight,
                fontWeight: 800, fontSize: ".8rem", cursor: canBuy ? "pointer" : "default",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                opacity: !owned && !canBuy ? .4 : 1,
                boxShadow: canBuy ? `0 4px 12px ${T.primary}30` : "none",
                minHeight: 44,
              }}>{owned ? "Gekauft \u2713" : "Kaufen"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
