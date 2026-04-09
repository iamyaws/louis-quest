import React from 'react';
import { T, SHOP_ITEMS } from '../constants';
import { ViewHeader } from './ui';
import SFX from '../utils/sfx';

export default function Shop({ state, shopTab, setShopTab, buyItem, setView }) {
  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "env(safe-area-inset-top, 12px) 20px 100px" }}>
      <ViewHeader onBack={() => setView("hub")} title="Shop" right={
        <div style={{ background: `${T.accent}30`, borderRadius: 50, padding: "6px 14px", fontSize: ".85rem", fontWeight: 800, color: T.accentDark }}>{"\u{1FA99}"} {state.coins}</div>
      } />
      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[{ id: "hero", l: "Held", i: "\u{1F9B8}" }, { id: "cat", l: "Katze", i: "\u{1F431}" }, { id: "room", l: "Zimmer", i: "\u{1F3E0}" }].map(t => (
          <button key={t.id} onClick={() => setShopTab(t.id)} style={{
            flex: 1, background: shopTab === t.id ? `${T.primary}12` : "white",
            border: shopTab === t.id ? `2px solid ${T.primary}30` : "2px solid rgba(0,0,0,0.06)",
            borderRadius: 14, padding: "12px 8px", cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800,
            fontSize: ".76rem", color: shopTab === t.id ? T.primary : T.textSecondary,
            textTransform: "uppercase", textAlign: "center", minHeight: 48,
          }}>{t.i}<br />{t.l}</button>
        ))}
      </div>
      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(SHOP_ITEMS[shopTab] || []).map(item => {
          const owned = (state.purchased || []).includes(item.id);
          const canBuy = state.coins >= item.cost && !owned;
          return (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "white", border: owned ? `2px solid ${T.success}30` : "2px solid rgba(0,0,0,0.04)", borderRadius: 18, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: owned ? `${T.success}15` : `${T.primary}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{item.name}</div>
                <div style={{ fontSize: ".7rem", color: T.accentDark, fontWeight: 700 }}>{"\u{1FA99}"} {item.cost}</div>
              </div>
              <button onClick={() => canBuy && buyItem(item.id, item.cost)} disabled={!canBuy && !owned} style={{
                background: owned ? `${T.success}15` : canBuy ? `linear-gradient(135deg,${T.primary},${T.primaryLight})` : "rgba(0,0,0,0.04)",
                border: "none", borderRadius: 50, padding: "10px 20px",
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
      {(SHOP_ITEMS[shopTab] || []).length > 0 && <div style={{ fontSize: ".7rem", color: T.textLight, textAlign: "center", marginTop: 16 }}>
        {shopTab === "room" ? "Zimmer-Items werden sichtbar in deinem Raum! \u{1F3E0}" : shopTab === "hero" ? "Held-Items erscheinen auf deinem Charakter! \u{1F9B8}" : "Katzen-Items erscheinen auf deinem Sidekick! \u{1F431}"}
      </div>}
    </div>
  );
}
