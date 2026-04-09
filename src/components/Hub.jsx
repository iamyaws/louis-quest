import React from 'react';
import { T, HERO_TIPS, MOOD_EMOJIS } from '../constants';
import { useGame } from '../context/GameContext';
import useWeather, { getWeatherInfo } from '../hooks/useWeather';
import ProfileCard from './ProfileCard';
import LoginBonus from './LoginBonus';
import DailyHabits from './DailyHabits';
import BossCard from './BossCard';
import WeeklyMissionCard from './WeeklyMissionCard';
import QuickLinks from './QuickLinks';

export default function Hub() {
  const { state, computed, actions, ui } = useGame();
  const { level, mood } = computed;
  const { setCeleb, pMode, setPMode, setPinShow } = ui;
  const { weather } = useWeather();
  const wInfo = weather?.current ? getWeatherInfo(weather.current.weatherCode) : null;
  const todayDaily = weather?.daily?.[0];

  const tip = HERO_TIPS[Math.floor(Date.now() / 86400000) % HERO_TIPS.length];
  const lunch = state.weeklyLunch?.[["So","Mo","Di","Mi","Do","Fr","Sa"][new Date().getDay()]];

  return (
    <div className="view-enter" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FFF8F0" }}>

      {/* Top bar */}
      <div style={{ padding: "env(safe-area-inset-top, 12px) 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <img src={import.meta.env.BASE_URL + "ronki-egg.png"} alt="Ronki" style={{ height: 36, width: "auto" }} />
        <button aria-label={pMode ? "Elternmodus deaktivieren" : "Elternmodus aktivieren"} onClick={() => pMode ? setPMode(false) : setPinShow(true)} style={{ background: "rgba(180,120,40,0.08)", border: "2px solid rgba(180,120,40,0.10)", borderRadius: 50, padding: "6px 12px", cursor: "pointer", color: T.textSecondary, fontSize: ".85rem", fontWeight: 700, minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{pMode ? "\uD83D\uDD13" : "\uD83D\uDD12"}</button>
      </div>

      <div style={{ flex: 1, padding: "0 16px 100px" }}>
        <ProfileCard state={state} level={level} mood={mood} weather={weather} wInfo={wInfo} todayDaily={todayDaily} />
        <LoginBonus day={state.loginBonusDay || 0} streak={state.loginBonusStreak || 0} claimed={state.loginBonusClaimed} onCollect={() => actions.collectLoginBonus()} />

        {tip && (
          <div className="game-card" style={{ padding: 14, marginBottom: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))", borderColor: "rgba(245,158,11,0.2)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>{tip.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1rem", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: 4 }}>Helden-Tipp von {tip.char}</div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 600, color: T.textPrimary, lineHeight: 1.4 }}>{tip.tip}</div>
              </div>
            </div>
          </div>
        )}

        <DailyHabits state={state} actions={actions} onCatView={() => ui.setView("cat")} />

        {lunch && (
          <div className="game-card" style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.3rem" }}>{"\uD83C\uDF7D\uFE0F"}</span>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".9rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase" }}>Heute</div>
                <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: T.textPrimary }}>{lunch}</div>
              </div>
            </div>
          </div>
        )}

        {state.moodAM === null && (
          <div className="game-card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 10 }}>Wie startest du in den Tag? {"\uD83C\uDF05"}</div>
            <div role="group" aria-label="Morgenstimmung w\u00E4hlen" style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
              {MOOD_EMOJIS.map((e, i) => (
                <button key={i} aria-label={`Stimmung ${i + 1} von ${MOOD_EMOJIS.length}`} onClick={() => { actions.setMood("moodAM", i); setCeleb(true); }} style={{ fontSize: "2rem", background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: 12, transition: "all .15s", minHeight: 52, minWidth: 52 }}>{e}</button>
              ))}
            </div>
          </div>
        )}

        {state.specialMissions?.filter(m => !m.done).map(mission => (
          <button key={mission.id} className="btn-tap game-card" onClick={() => actions.completeSpecialMission(mission.id)} style={{ width: "100%", padding: 14, marginBottom: 12, cursor: "pointer", background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))", borderColor: "rgba(245,158,11,0.25)", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
            <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{mission.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".9rem", fontWeight: 800, color: "#B45309", textTransform: "uppercase" }}>Spezial-Mission</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.05rem", fontWeight: 700, color: T.textPrimary }}>{mission.name}</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #FCD34D, #F59E0B)", borderRadius: 50, padding: "4px 12px", fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: "white" }}>+{mission.hp} {"\u2B50"}</div>
          </button>
        ))}

        <BossCard boss={state.boss} />
        <WeeklyMissionCard weeklyMission={state.weeklyMission} weeklyProgress={state.weeklyProgress} />
        <QuickLinks setView={ui.setView} />
      </div>
    </div>
  );
}
