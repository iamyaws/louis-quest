import React, { useState, useEffect } from 'react';
import { T, SHOP_ITEMS } from '../constants';
import HeroSprite from './HeroSprite';
import CatSidekick from './CatSidekick';
import SFX from '../utils/sfx';

const HERO_LINES = {
  sleepy: ["Guten Morgen! ☀️", "Was steht heute an?", "Bereit für den Tag! 💪"],
  neutral: ["Weiter geht's! 🎯", "Schritt für Schritt! 🚀", "Jede Quest zählt!"],
  happy: ["Läuft bei mir! 😊", "Ich werde jeden Tag besser! 📈", "Nicht aufgeben! 🔥"],
  excited: ["Heute alles geschafft! 💪", "Das war mein Einsatz! 🏆", "Ich hab durchgehalten! ⭐"],
};

const CAT_LINES = {
  sleepy: ["*gähnt* Morgen! 😴", "Miau... aufstehen? 🐾", "Schnurr... 5 Minuten noch..."],
  neutral: ["Miau! Wir schaffen das! 😺", "Noch eine Quest? 💪", "Los geht's! 🎯"],
  happy: ["Schnurr... läuft gut! 😸", "Zusammen sind wir stark! 🐾", "Ich glaub an dich! ⭐"],
  excited: ["MIAU! Wir haben's geschafft! 🎉", "*schnurrt mega laut* 😸", "Bestes Team ever! 🐾⭐"],
};

export default function Room({ state, level, mood, setView, setShopTab }) {
  const has = (id) => (state.purchased || []).includes(id);
  const roomItems = (state.purchased || []).filter(id => id.startsWith("rm_")).length;
  const [heroBubble, setHeroBubble] = useState(null);
  const [catBubble, setCatBubble] = useState(null);

  const heroLines = HERO_LINES[mood] || HERO_LINES.neutral;
  const catLines = CAT_LINES[mood] || CAT_LINES.neutral;

  // Show a random speech bubble on mount and periodically
  useEffect(() => {
    const showHero = () => {
      const lines = HERO_LINES[mood] || HERO_LINES.neutral;
      setHeroBubble(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setHeroBubble(null), 3000);
    };
    const showCat = () => {
      const lines = CAT_LINES[mood] || CAT_LINES.neutral;
      setCatBubble(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setCatBubble(null), 2500);
    };
    // Initial bubbles
    setTimeout(showHero, 600);
    setTimeout(showCat, 2000);
    // Periodic bubbles
    const heroTimer = setInterval(showHero, 8000);
    const catTimer = setInterval(showCat, 10000);
    return () => { clearInterval(heroTimer); clearInterval(catTimer); };
  }, [mood]);

  const wallL = "#F5EDE3";
  const wallR = "#E8DDD0";
  const floorLine = "#C49060";
  const trim = "#B8956A";

  return (
    <div className="view-enter" style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #1E293B 0%, #334155 40%, #475569 100%)",
      padding: "env(safe-area-inset-top, 12px) 0 80px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 8px" }}>
        <button className="btn-tap" onClick={() => { SFX.play("tap"); setView("hub"); }} style={{
          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 50,
          padding: "10px 20px", cursor: "pointer", fontWeight: 800, fontSize: ".85rem",
          backdropFilter: "blur(8px)", minHeight: 48, color: "white",
        }}>← Zurück</button>
        <div style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.1rem", fontWeight: 800,
          color: "white", textTransform: "uppercase", fontStyle: "italic",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}>{state.hero.name}'s Zimmer</div>
        <div style={{ width: 80 }} />
      </div>

      {/* Isometric Room — scaled up */}
      <div style={{ position: "relative", margin: "0 auto", maxWidth: 460, width: "100%", padding: "0 4px" }}>
        <svg viewBox="0 0 400 330" style={{ width: "100%", display: "block" }}>
          <defs>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4A06A" />
              <stop offset="100%" stopColor="#C49060" />
            </linearGradient>
            <linearGradient id="windowLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,200,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,200,0)" />
            </linearGradient>
            <linearGradient id="posterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="windowSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>

          {/* Left wall */}
          <polygon points="50,95 200,20 200,150 50,225" fill={wallL} />

          {/* Right wall */}
          <polygon points="200,20 350,95 350,225 200,150" fill={wallR} />

          {/* Floor */}
          <polygon points="50,225 200,150 350,225 200,300" fill="url(#floorGrad)" />

          {/* Floor plank lines */}
          {[1,2,3,4,5,6,7].map(i => {
            const t = i / 8;
            return <line key={i}
              x1={50 + t * 150} y1={225 - t * 75}
              x2={200 + t * 150} y2={300 - t * 75}
              stroke={floorLine} strokeWidth="1" opacity="0.25"
            />;
          })}

          {/* Corner edge */}
          <line x1="200" y1="20" x2="200" y2="150" stroke="#D4C4B0" strokeWidth="1.5" />

          {/* Baseboard */}
          <line x1="50" y1="225" x2="200" y2="150" stroke={trim} strokeWidth="4" />
          <line x1="200" y1="150" x2="350" y2="225" stroke={trim} strokeWidth="4" />

          {/* Ceiling edge */}
          <line x1="50" y1="95" x2="200" y2="20" stroke="#D4C4B0" strokeWidth="1" opacity="0.5" />
          <line x1="200" y1="20" x2="350" y2="95" stroke="#D4C4B0" strokeWidth="1" opacity="0.5" />

          {/* ── Window on left wall ── */}
          <polygon points="100,160 150,135 150,88 100,113" fill="url(#windowSky)" stroke={trim} strokeWidth="3" />
          <line x1="125" y1="147" x2="125" y2="100" stroke={trim} strokeWidth="1.5" />
          <line x1="100" y1="136" x2="150" y2="111" stroke={trim} strokeWidth="1.5" />
          {/* Light beam on floor */}
          <polygon points="100,225 155,198 210,225 155,252" fill="url(#windowLight)" />

          {/* ── Bookshelf on right wall ── */}
          <line x1="255" y1="130" x2="315" y2="150" stroke="#A0845C" strokeWidth="3" strokeLinecap="round" />
          <line x1="255" y1="105" x2="315" y2="125" stroke="#A0845C" strokeWidth="3" strokeLinecap="round" />

          {/* ── Bed (always present) ── */}
          <polygon points="260,210 300,190 350,210 310,230" fill="#E0E7FF" />
          <polygon points="260,210 260,222 310,242 310,230" fill="#C7D2FE" />
          <polygon points="310,230 310,242 350,222 350,210" fill="#A5B4FC" />
          <polygon points="300,190 300,178 350,198 350,210" fill="#7C3AED" opacity="0.3" />
          <ellipse cx="320" cy="198" rx="12" ry="5" fill="white" opacity="0.9" transform="rotate(26, 320, 198)" />

          {/* ── Desk (always present) ── */}
          <polygon points="65,218 105,200 145,218 105,236" fill="#92400E" />
          <polygon points="65,218 65,232 105,250 105,236" fill="#78350F" />
          <polygon points="105,236 105,250 145,232 145,218" fill="#6B3410" />

          {/* ── Purchased Items ── */}
          {has("rm_trophy") && <text x="285" y="124" fontSize="16" textAnchor="middle">{"\u{1F3C6}"}</text>}

          {has("rm_poster") && <g>
            <polygon points="270,108 300,120 300,148 270,136" fill="url(#posterGrad)" />
            <polygon points="270,108 300,120 300,148 270,136" fill="none" stroke="#A0845C" strokeWidth="2" />
            <text x="285" y="132" fontSize="12" textAnchor="middle" fill="white">{"\u2B50"}</text>
          </g>}

          {has("rm_rug") && <ellipse cx="195" cy="258" rx="42" ry="18" fill="#8B5CF6" opacity="0.35" />}

          {has("rm_plant") && <text x="328" y="230" fontSize="22">{"\u{1FAB4}"}</text>}

          {has("rm_lamp") && <text x="72" y="210" fontSize="18">{"\u{1FA94}"}</text>}
        </svg>

        {/* Hero + Cat overlay with speech bubbles */}
        <div style={{
          position: "absolute", bottom: "16%", left: "44%",
          transform: "translateX(-50%)",
          display: "flex", alignItems: "flex-end", gap: 8, zIndex: 2,
        }}>
          {/* Hero with bubble */}
          <div style={{ position: "relative" }}>
            {heroBubble && (
              <div style={{
                position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                background: "white", borderRadius: 14, padding: "6px 12px", marginBottom: 8,
                fontSize: ".7rem", fontWeight: 700, color: T.textPrimary, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease",
                fontFamily: "'Nunito',sans-serif",
              }}>
                {heroBubble}
                <div style={{
                  position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                  borderTop: "6px solid white",
                }} />
              </div>
            )}
            <div style={{ animation: "heroFloat 3s ease-in-out infinite", cursor: "pointer" }}
              onClick={() => {
                setHeroBubble(heroLines[Math.floor(Math.random() * heroLines.length)]);
                setTimeout(() => setHeroBubble(null), 3000);
              }}>
              <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={90} level={level} />
            </div>
          </div>

          {/* Cat with bubble */}
          <div style={{ position: "relative" }}>
            {catBubble && (
              <div style={{
                position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                background: "white", borderRadius: 14, padding: "5px 10px", marginBottom: 6,
                fontSize: ".65rem", fontWeight: 700, color: T.textPrimary, whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease",
                fontFamily: "'Nunito',sans-serif",
              }}>
                {catBubble}
                <div style={{
                  position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
                  borderTop: "5px solid white",
                }} />
              </div>
            )}
            <div style={{ animation: "catIdle 4s ease-in-out infinite", cursor: "pointer" }}
              onClick={() => {
                setCatBubble(catLines[Math.floor(Math.random() * catLines.length)]);
                setTimeout(() => setCatBubble(null), 2500);
              }}>
              <CatSidekick variant={state.catVariant} mood={mood} size={48} />
            </div>
          </div>
        </div>
      </div>

      {/* Room info */}
      <div style={{ padding: "12px 20px", textAlign: "center" }}>
        <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
          {roomItems} / {SHOP_ITEMS.room.length} Zimmer-Items
        </div>
        <button className="btn-tap" onClick={() => { SFX.play("tap"); setView("shop"); setShopTab("room"); }} style={{
          marginTop: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 50, padding: "12px 28px", fontWeight: 800, fontSize: ".85rem",
          cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
          color: "white", backdropFilter: "blur(8px)", minHeight: 48,
        }}>{"\u{1F6CD}\uFE0F"} Zimmer dekorieren</button>
      </div>
    </div>
  );
}
