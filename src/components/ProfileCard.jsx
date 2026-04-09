import React from 'react';
import { T } from '../constants';
import { getCatStage, getCatMood } from '../utils/helpers';
import HeroSprite from './HeroSprite';
import Companion from './Companion';
import Egg from './Egg';

function HeroPortrait({ shape, color, eyes, hair, level, size, skinTone, hairColor }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 50% 60%, ${color}30 0%, transparent 70%)`,
    }}>
      <div style={{ transform: "scale(1.6) translateY(18%)" }}>
        <HeroSprite shape={shape} color={color} eyes={eyes} hair={hair} size={size * 0.7} level={level} skinTone={skinTone} hairColor={hairColor} />
      </div>
    </div>
  );
}

const GERMAN_DAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const GERMAN_MONTHS = ["Januar", "Februar", "M\u00E4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export default function ProfileCard({ state, level, mood, weather, wInfo, todayDaily }) {
  const today = new Date();
  const dayKey = GERMAN_DAYS_SHORT[today.getDay()];
  return (
    <div className="game-card" style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 4 }}>
          <div style={{ position: "relative", marginBottom: 4 }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", padding: 3, background: `linear-gradient(135deg, ${state.hero.color}, ${state.hero.color}88, rgba(255,255,255,0.3))`, boxShadow: `0 4px 16px ${state.hero.color}30` }}>
              <HeroPortrait shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} level={level} size={90} skinTone={state.hero.skinTone} hairColor={state.hero.hairColor} />
            </div>
            <div style={{ position: "absolute", bottom: -6, right: -18, animation: "catIdle 4s ease-in-out infinite" }}>
              {state.eggHatched ? (
                <Companion type={state.companionType} variant={state.catVariant} mood={(() => { const cm = getCatMood(state.catHunger, state.catHappy, state.catEnergy); return cm === "sleepy" ? "sleepy" : mood; })()} size={36} stage={getCatStage(state.catEvo || 0)} />
              ) : (
                <Egg type={state.eggType || "dragon"} progress={state.eggProgress || 0} size={36} />
              )}
            </div>
          </div>
          <div style={{ textAlign: "center", maxWidth: 100 }}>
            <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.hero.name}</div>
            <div style={{ background: "linear-gradient(135deg, #A78BFA, #7C3AED)", borderRadius: 50, padding: "2px 10px", fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: "white", display: "inline-block", marginTop: 2 }}>LVL {level}</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "#FEF3C720", borderRadius: 14, padding: "10px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.4rem" }}>{"\u2B50"}</span>
            <div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#D97706" }}>{(state.coins || 0).toLocaleString("de-DE")}</div>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textLight }}>HP</div>
            </div>
          </div>
          <div style={{ background: "#FEF3C720", borderRadius: 14, padding: "10px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.4rem" }}>{"\uD83D\uDD25"}</span>
            <div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#EA580C" }}>{state.sd || 0}</div>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: T.textLight }}>Tage</div>
            </div>
          </div>
          <div style={{ background: "#E0F2FE40", borderRadius: 14, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.3rem" }}>{wInfo?.emoji || "\u2601\uFE0F"}</span>
            <div><div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "#0284C7" }}>{todayDaily ? `${todayDaily.tempMin}\u00B0/${todayDaily.tempMax}\u00B0` : weather?.current ? `${weather.current.temp}\u00B0` : "\u2022\u2022\u2022"}</div></div>
          </div>
          <div style={{ background: "#EDE9FE40", borderRadius: 14, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "1.2rem" }}>{"\uD83D\uDCC5"}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#6366F1" }}>{dayKey}. {today.getDate()}. {GERMAN_MONTHS[today.getMonth()]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
