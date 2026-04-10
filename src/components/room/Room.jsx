import React, { useState, useEffect } from 'react';
import { T, SHOP_ITEMS, BADGES as BADGE_DEFS } from '../../constants';
import SFX from '../../utils/sfx';
import { useGame } from '../../context/GameContext';
import { getCatStage } from '../../utils/helpers';
import RoomSVG from './RoomSVG';
import RoomCustomizer from './RoomCustomizer';

const COMPANION_SPOTS = {
  floor: { x: 200, y: 370 },
  bed: { x: 310, y: 310 },
  desk: { x: 110, y: 330 },
  window: { x: 130, y: 270 },
  rug: { x: 200, y: 390 },
};
const SPOT_KEYS = Object.keys(COMPANION_SPOTS);

export default function Room() {
  const { state, computed, actions, ui } = useGame();
  const { level, mood } = computed;
  const { setView, setShopTab } = ui;

  const has = (id) => (state.purchased || []).includes(id);
  const roomItems = (state.purchased || []).filter(id => id.startsWith("rm_")).length;
  const badges = BADGE_DEFS.map((b, i) => ({ ...b, u: getBadgeUnlocks(state, level)[i] }));
  const badgeCount = badges.filter(b => b.u).length;
  const roomScore = roomItems + badgeCount;
  const roomLevel = roomScore >= 18 ? 5 : roomScore >= 13 ? 4 : roomScore >= 8 ? 3 : roomScore >= 4 ? 2 : roomScore >= 1 ? 1 : 0;

  // Customizer panel
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Companion walking
  const [companionSpot, setCompanionSpot] = useState('floor');

  useEffect(() => {
    const interval = setInterval(() => {
      setCompanionSpot(prev => {
        const others = SPOT_KEYS.filter(k => k !== prev);
        return others[Math.floor(Math.random() * others.length)];
      });
    }, 18000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, []);

  // Active item animation
  const [activeItem, setActiveItem] = useState(null);
  const [lampOn, setLampOn] = useState(false);

  const tapItem = (id) => {
    SFX.play("tap");
    if (id === "lamp") { setLampOn(prev => !prev); return; }
    if (id === "rug") { setCompanionSpot("rug"); return; }
    setActiveItem(id);
    setTimeout(() => setActiveItem(null), 1200);
  };

  // Time of day
  const hour = new Date().getHours();
  const timeOfDay = hour >= 6 && hour < 10 ? 'morning' : hour < 17 ? 'day' : hour < 20 ? 'evening' : 'night';

  // Room theme
  const theme = state.roomTheme || { wallColor: "#F5EDE3", floorType: "wood", windowStyle: "standard" };

  return (
    <div className="view-enter" style={{
      minHeight: "100vh",
      background: timeOfDay === 'night' ? "linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #334155 100%)"
        : timeOfDay === 'evening' ? "linear-gradient(180deg, #1E293B 0%, #44403C 40%, #78716C 100%)"
        : "linear-gradient(180deg, #1E293B 0%, #334155 40%, #475569 100%)",
      padding: "env(safe-area-inset-top, 12px) 0 80px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px" }}>
        <button className="btn-tap" onClick={() => setView("hub")} style={{
          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 50,
          padding: "10px 20px", cursor: "pointer", fontWeight: 800, fontSize: ".85rem",
          backdropFilter: "blur(8px)", minHeight: 48, color: "white",
        }}>{"\u2190"} Zur\u00FCck</button>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700,
          color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}>{state.catName || state.hero.name}'s Zimmer</div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 50, padding: "6px 12px", fontSize: ".85rem", fontWeight: 800, color: "#FCD34D" }}>Lvl {roomLevel}</div>
      </div>

      {/* Room SVG */}
      <RoomSVG
        has={has}
        badges={badges}
        state={state}
        level={level}
        mood={mood}
        theme={theme}
        timeOfDay={timeOfDay}
        lampOn={lampOn}
        activeItem={activeItem}
        companionSpot={companionSpot}
        companionSpots={COMPANION_SPOTS}
        onTapItem={tapItem}
        onTapCompanion={() => {
          setCompanionSpot(prev => {
            const idx = SPOT_KEYS.indexOf(prev);
            return SPOT_KEYS[(idx + 1) % SPOT_KEYS.length];
          });
        }}
      />

      {/* Room info footer */}
      <div style={{ padding: "12px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 6 }}>
          {[1,2,3,4,5].map(l => (
            <div key={l} style={{
              width: 32, height: 6, borderRadius: 3,
              background: l <= roomLevel ? "linear-gradient(90deg, #FCD34D, #F59E0B)" : "rgba(255,255,255,0.15)",
            }} />
          ))}
        </div>
        <div style={{ fontSize: ".85rem", fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
          Zimmer Level {roomLevel}
        </div>
        <div style={{ fontSize: ".85rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
          {roomItems} / {SHOP_ITEMS.room.length} Items {"\u00B7"} {badgeCount} / 9 Badges
        </div>
        <button className="btn-tap" onClick={() => setShowCustomizer(true)} style={{
          marginTop: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 50, padding: "12px 28px", fontWeight: 800, fontSize: ".85rem",
          cursor: "pointer", color: "white", backdropFilter: "blur(8px)", minHeight: 48,
        }}>{"\u{1F3A8}"} Zimmer gestalten</button>
      </div>

      <RoomCustomizer
        visible={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        roomTheme={theme}
        roomLevel={roomLevel}
        onSetTheme={(t) => actions.setRoomTheme(t)}
      />
    </div>
  );
}

function getBadgeUnlocks(state, level) {
  return [
    state.xp > 0, state.sd >= 3, state.sd >= 7, level >= 5,
    state.hist.length >= 50, level >= 10, state.sd >= 30,
    state.hist.length >= 100, (state.acc || []).length > 0,
  ];
}
