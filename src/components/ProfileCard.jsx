import React from 'react';
import Companion from './Companion';
import Egg from './Egg';
import HeroSprite from './HeroSprite';
import GearSlots from './GearSlots';
import { T, CAT_STAGES, COMPANION_TYPES } from '../constants';
import { getCatStage, getCatMood } from '../utils/helpers';

const GERMAN_DAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const GERMAN_MONTHS = ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export default function ProfileCard({ state, level, mood, weather, wInfo, todayDaily, actions }) {
  const today = new Date();
  const dayKey = GERMAN_DAYS_SHORT[today.getDay()];
  const stage = getCatStage(state.catEvo || 0);
  const stageInfo = CAT_STAGES[stage];
  const companionMood = (() => {
    const cm = getCatMood(state.catHunger, state.catHappy, state.catEnergy);
    return cm === "sleepy" ? "sleepy" : mood;
  })();

  return (
    <div className="game-card" style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>

        {/* LEFT: Companion-centered */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 6, minWidth: 130 }}>
          {/* Companion as main visual with hero badge */}
          <div style={{ position: "relative", display: "inline-block" }}>
            {state.eggHatched ? (
              <Companion
                type={state.companionType || "cat"}
                variant={state.catVariant}
                mood={companionMood}
                size={120}
                stage={stage}
                gear={state.equippedGear}
              />
            ) : (
              <Egg type={state.eggType || "dragon"} size={100} progress={state.eggProgress || 0} />
            )}
            {/* Hero as small badge */}
            <div style={{
              position: "absolute", bottom: -4, right: -16,
              width: 40, height: 40, borderRadius: "50%", overflow: "hidden",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              background: `radial-gradient(circle at 50% 60%, ${state.hero.color}30 0%, transparent 70%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ transform: "scale(1.6) translateY(18%)" }}>
                <HeroSprite
                  shape={state.hero.shape} color={state.hero.color}
                  eyes={state.hero.eyes} hair={state.hero.hair}
                  size={26} level={level}
                  skinTone={state.hero.skinTone} hairColor={state.hero.hairColor}
                />
              </div>
            </div>
          </div>

          {/* Companion name */}
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700,
            color: T.textPrimary, textAlign: "center",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: 130,
          }}>
            {state.catName || "Begleiter"}
          </div>

          {/* Stage badge */}
          <div style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))",
            border: "1.5px solid rgba(245,158,11,0.15)",
            borderRadius: 50, padding: "2px 10px",
            fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700,
            color: "#B45309", display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            {stageInfo?.emoji} {stageInfo?.name}
          </div>

          {/* Gear slots */}
          <GearSlots
            equippedGear={state.equippedGear || {}}
            purchased={state.purchased || []}
            onEquip={(slot, id) => actions.equipGear(slot, id)}
            onUnequip={(slot) => actions.unequipGear(slot)}
          />
        </div>

        {/* RIGHT: Stats */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {/* HP -- full width */}
          <div style={{
            gridColumn: "1 / -1",
            background: "#FEF3C720", borderRadius: 14, padding: "10px 10px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: "1.4rem" }}>{"\u2B50"}</span>
            <div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#D97706" }}>
                {(state.coins || 0).toLocaleString("de-DE")}
              </div>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textLight }}>HP</div>
            </div>
          </div>
          {/* Weather */}
          <div style={{
            background: "#E0F2FE40", borderRadius: 14, padding: "8px 10px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: "1.3rem" }}>{wInfo?.emoji || "\u2601\uFE0F"}</span>
            <div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0284C7" }}>
                {todayDaily ? `${todayDaily.tempMin}\u00B0 / ${todayDaily.tempMax}\u00B0` : weather?.current ? `${weather.current.temp}\u00B0` : "\u2022\u2022\u2022"}
              </div>
            </div>
          </div>
          {/* Date */}
          <div style={{
            background: "#EDE9FE40", borderRadius: 14, padding: "8px 10px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: "1.2rem" }}>{"\uD83D\uDCC5"}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: "#6366F1" }}>
              {dayKey}. {today.getDate()}. {GERMAN_MONTHS[today.getMonth()]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
