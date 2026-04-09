import React from 'react';
import { T, SHOP_ITEMS } from '../constants';
import HeroSprite from './HeroSprite';
import CatSidekick from './CatSidekick';
import SFX from '../utils/sfx';

export default function Room({ state, level, mood, setView, setShopTab }) {
  return (
    <div className="view-enter" style={{ minHeight: "100vh", padding: "env(safe-area-inset-top, 12px) 0 100px", background: "linear-gradient(180deg, #DBEAFE 0%, #BFDBFE 40%, #93C5FD 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 12px" }}>
        <button onClick={() => { SFX.play("tap"); setView("hub"); }} style={{ background: "rgba(255,255,255,0.8)", border: "none", borderRadius: 50, padding: "10px 20px", cursor: "pointer", fontWeight: 800, fontSize: ".85rem", backdropFilter: "blur(8px)", minHeight: 48 }}>{"\u2190"} Zur\u00FCck</button>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "white", textTransform: "uppercase", fontStyle: "italic", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{state.hero.name}'s Zimmer</div>
        <div style={{ width: 80 }} />
      </div>
      {/* Room Scene */}
      <div style={{ position: "relative", margin: "0 12px", height: 380, borderRadius: 24, overflow: "hidden", background: "linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)", border: "3px solid rgba(255,255,255,0.4)", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #FFF8F0 0%, #FEF3C7 60%, #D4A574 60%, #C9956A 100%)" }} />
        <div style={{ position: "absolute", top: 30, right: 30, width: 80, height: 80, borderRadius: 16, background: "linear-gradient(180deg, #7DD3FC, #38BDF8)", border: "6px solid #D4A574", boxShadow: "inset 0 0 20px rgba(255,255,255,0.3)" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, background: "#D4A574" }} /><div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 3, background: "#D4A574" }} />
        </div>
        <div style={{ position: "absolute", top: 40, left: 20, width: 100, height: 8, borderRadius: 4, background: "#92400E", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
          {(state.purchased || []).includes("rm_trophy") && <div style={{ position: "absolute", bottom: 8, left: 35, fontSize: "1.5rem" }}>{"\u{1F3C6}"}</div>}
        </div>
        {(state.purchased || []).includes("rm_poster") && <div style={{ position: "absolute", top: 25, left: 140, width: 50, height: 60, borderRadius: 8, background: "linear-gradient(135deg, #EC4899, #8B5CF6)", border: "3px solid #92400E", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{"\u2B50"}</div>}
        {(state.purchased || []).includes("rm_plant") && <div style={{ position: "absolute", bottom: "42%", right: 20, fontSize: "2rem" }}>{"\u{1FAB4}"}</div>}
        {(state.purchased || []).includes("rm_lamp") && <div style={{ position: "absolute", bottom: "42%", left: 20, fontSize: "2rem" }}>{"\u{1FA94}"}</div>}
        {(state.purchased || []).includes("rm_rug") && <div style={{ position: "absolute", bottom: "6%", left: "25%", width: "50%", height: 24, borderRadius: 12, background: "linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6)", opacity: 0.6 }} />}
        <div style={{ position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "flex-end", gap: 6 }}>
          <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}><HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={100} level={level} /></div>
          <div style={{ animation: "catIdle 4s ease-in-out infinite" }}><CatSidekick variant={state.catVariant} mood={mood} size={48} /></div>
        </div>
      </div>
      <div style={{ padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontSize: ".8rem", color: "white", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
          {(state.purchased || []).filter(id => id.startsWith("rm_")).length} / {SHOP_ITEMS.room.length} Zimmer-Items
        </div>
        <button onClick={() => { SFX.play("tap"); setView("shop"); setShopTab("room"); }} style={{ marginTop: 8, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 50, padding: "12px 28px", fontWeight: 800, fontSize: ".85rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", color: T.primary, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", minHeight: 48 }}>{"\u{1F6CD}\uFE0F"} Zimmer dekorieren</button>
      </div>
    </div>
  );
}
