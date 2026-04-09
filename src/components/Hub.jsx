import React from 'react';
import { T, CHEST_MILESTONES, MOOD_EMOJIS, WEEKLY_MISSIONS } from '../constants';
import { getSky, getSkyStars, getTimeLabel } from '../utils/helpers';
import HeroSprite from './HeroSprite';
import CatSidekick from './CatSidekick';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';

const CAT_MOOD_TEXT = {
  sleepy: "Deine Katze gähnt... Zeit für die erste Quest!",
  neutral: "Deine Katze schaut neugierig — weiter so!",
  happy: "Deine Katze schnurrt zufrieden!",
  excited: "Deine Katze feiert mit dir! Miau!",
};

function HeroPortrait({ shape, color, eyes, hair, level, size }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 50% 60%, ${color}30 0%, transparent 70%)`,
    }}>
      <div style={{ transform: "scale(1.6) translateY(18%)" }}>
        <HeroSprite shape={shape} color={color} eyes={eyes} hair={hair} size={size * 0.7} level={level} />
      </div>
    </div>
  );
}

export default function Hub() {
  const { state, computed, actions, ui } = useGame();
  const { level, xpP, done, total, allDone, pct, mood, dayN } = computed;
  const { setQuestOpen, setCeleb, pMode, setPMode, setPinShow } = ui;
  const sky = getSky(done, total);
  const stars = getSkyStars(done, total);

  return (
    <div className="view-enter" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ═══ HERO STAGE — Dynamic Sky ═══ */}
      <div style={{
        background: sky,
        position: "relative", overflow: "hidden",
        padding: "env(safe-area-inset-top, 12px) 16px 0",
      }}>
        {/* Stars when all done */}
        {stars && <>{Array.from({ length: 20 }, (_, i) => <div key={i} style={{ position: "absolute", width: 2 + Math.random() * 2, height: 2 + Math.random() * 2, borderRadius: "50%", background: "white", top: `${5 + Math.random() * 50}%`, left: `${5 + Math.random() * 90}%`, animation: `starTwinkle ${1 + Math.random() * 2}s ease-in-out infinite`, animationDelay: `${Math.random() * 2}s` }} />)}</>}

        {/* Top bar: day + lock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{dayN}{state.vacMode ? " \u{1F3D6}\uFE0F" : ""}</div>
          <button aria-label={pMode ? "Elternmodus deaktivieren" : "Elternmodus aktivieren"} onClick={() => pMode ? setPMode(false) : setPinShow(true)} style={{ background: pMode ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 50, padding: "6px 12px", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: ".75rem", fontWeight: 700, minHeight: 36, minWidth: 36 }}>{pMode ? "\u{1F513}" : "\u{1F512}"}</button>
        </div>

        {/* HERO PORTRAIT — circular headshot + cat */}
        <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 2, marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            {/* Portrait ring */}
            <div style={{
              width: 156, height: 156, borderRadius: "50%",
              padding: 4,
              background: `linear-gradient(135deg, ${state.hero.color}, ${state.hero.color}88, rgba(255,255,255,0.3))`,
              boxShadow: `0 8px 32px ${state.hero.color}40, 0 0 60px ${state.hero.color}20`,
            }}>
              <HeroPortrait shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} level={level} size={148} />
            </div>
            {/* Cat peeking from side */}
            <div style={{ position: "absolute", bottom: -4, right: -32, animation: "catIdle 4s ease-in-out infinite" }}>
              <CatSidekick variant={state.catVariant} mood={mood} size={48} />
            </div>
          </div>
        </div>

        {/* NAME BANNER */}
        <div style={{ textAlign: "center", marginBottom: 12, position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)",
            border: "2px solid rgba(255,255,255,0.12)",
            borderRadius: 50, padding: "6px 8px 6px 18px",
          }}>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "white" }}>{state.hero.name}</span>
            <div style={{ background: "linear-gradient(135deg, #A78BFA, #7C3AED)", borderRadius: 50, padding: "3px 12px", fontFamily: "'Fredoka',sans-serif", fontSize: ".7rem", fontWeight: 700, color: "white" }}>LVL {level}</div>
          </div>
        </div>

        {/* STATS GRID — 4 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, position: "relative", zIndex: 2, marginBottom: 8 }}>
          {[
            { label: "XP", value: xpP.cur, sub: `/${xpP.need}`, color: "#A78BFA", progress: xpP.cur / xpP.need, barColor: "linear-gradient(90deg, #7C3AED, #A78BFA)" },
            { label: "Streak", value: `\u{1F525}${state.sd}`, sub: "d", color: "#FCD34D", progress: null, barColor: null },
            { label: "Quests", value: done, sub: `/${total}`, color: allDone ? "#34D399" : "#60A5FA", progress: pct, barColor: allDone ? "linear-gradient(90deg, #34D399, #6EE7B7)" : "linear-gradient(90deg, #3B82F6, #60A5FA)" },
            { label: "Münzen", value: state.coins.toLocaleString("de-DE"), sub: "", color: "#FCD34D", progress: null, barColor: null },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(0,0,0,0.2)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "8px 6px", textAlign: "center",
            }}>
              <div style={{ fontSize: ".5rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: s.color }}>{s.value}<span style={{ fontSize: ".6rem", color: "rgba(255,255,255,0.3)" }}>{s.sub}</span></div>
              {s.progress !== null && <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 50, overflow: "hidden", marginTop: 4 }}><div style={{ height: "100%", borderRadius: 50, width: `${Math.min(100, s.progress * 100)}%`, background: s.barColor, transition: "width .6s ease" }} /></div>}
            </div>
          ))}
        </div>

        {/* Time of day + minutes */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, paddingBottom: 20, position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{"\u23F0"} +{state.dt} Min</div>
          <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{getTimeLabel(done, total)}</div>
          {state.xpBoost && <div style={{ fontSize: ".68rem", color: "#FCD34D", fontWeight: 800, animation: "pulse 1.5s infinite" }}>{"\u{1F525}"} 2x XP</div>}
        </div>
      </div>

      {/* ═══ Content shelf ═══ */}
      <div style={{
        flex: 1,
        background: "#EFF3FB",
        borderRadius: "28px 28px 0 0",
        padding: "20px 16px 20px",
        marginTop: -14,
        position: "relative", zIndex: 3,
        boxShadow: "0 -4px 20px rgba(0,30,100,0.06)",
      }}>
        {/* Cat mood */}
        <div style={{ fontSize: ".75rem", color: "#64748B", textAlign: "center", marginBottom: 14, fontStyle: "italic" }}>{"\u{1F431}"} {CAT_MOOD_TEXT[mood]}</div>

        {/* Streak freeze notification */}
        {state.freezeUsedToday && <div className="game-card" style={{ padding: 14, marginBottom: 12, background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(14,165,233,0.03))", borderColor: `${T.teal}40` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.3rem" }}>{"\u2744\uFE0F"}</span>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".78rem", color: T.tealDark }}>Streak-Schutz eingesetzt!</div>
              <div style={{ fontSize: ".68rem", color: T.textSecondary }}>Dein {state.sd}-Tage Streak ist sicher. Weiter so!</div>
            </div>
          </div>
        </div>}

        {/* Comeback welcome */}
        {state.comebackActive && <div className="game-card" style={{ padding: 14, marginBottom: 12, background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,191,36,0.06))", borderColor: "#F9731630" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.3rem" }}>{"\u{1F431}"}</span>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".78rem", color: "#EA580C" }}>Willkommen zurück!</div>
              <div style={{ fontSize: ".68rem", color: T.textSecondary }}>Deine Katze hat auf dich gewartet. Öffne die Quests!</div>
            </div>
          </div>
        </div>}

        {/* Mood Check */}
        {state.moodAM === null && <div className="game-card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 10 }}>Wie startest du in den Tag? {"\u{1F305}"}</div>
          <div role="group" aria-label="Morgenstimmung wählen" style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>{MOOD_EMOJIS.map((e, i) => <button key={i} aria-label={`Stimmung ${i + 1} von 6`} onClick={() => { actions.setMood("moodAM", i); setCeleb(true); }} style={{ fontSize: "2rem", background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: 12, transition: "all .15s", minHeight: 48, minWidth: 48 }}>{e}</button>)}</div>
        </div>}

        {/* Weekly Mission Card */}
        {(() => {
          const wm = WEEKLY_MISSIONS.find(m => m.id === state.weeklyMission);
          if (!wm) return null;
          const wp = state.weeklyProgress || 0;
          const wmDone = wp >= wm.target;
          return (
            <div className="game-card" style={{ padding: 16, marginBottom: 12, background: wmDone ? "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))" : undefined, borderColor: wmDone ? `${T.success}40` : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: "1.4rem" }}>{wm.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".72rem", fontWeight: 800, color: wmDone ? T.successDark : T.primary, textTransform: "uppercase" }}>{wmDone ? "\u{1F4AA} Geschafft!" : "Wochen-Mission"}</div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: T.textPrimary }}>{wm.title}</div>
                </div>
                <div className="mission-reward">
                  <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 700, color: wmDone ? T.success : T.primary }}>{Math.min(wp, wm.target)}/{wm.target}</span>
                </div>
              </div>
              <div style={{ fontSize: ".73rem", color: T.textSecondary, marginBottom: 8 }}>{wm.story}</div>
              <div className="mission-progress-track"><div className="mission-progress-fill" style={{ width: `${Math.min(100, (wp / wm.target) * 100)}%`, background: wmDone ? `linear-gradient(90deg,${T.success},#6EE7B7)` : `linear-gradient(90deg,${T.primary},${T.primaryLight})` }} /></div>
              {wmDone && <div style={{ fontSize: ".7rem", color: T.success, fontWeight: 700, marginTop: 6, textAlign: "center" }}>{"\u{1F389}"} +{wm.reward.amount} {wm.reward.type === "coins" ? "Münzen" : "XP"} erhalten!</div>}
            </div>
          );
        })()}

        {/* Quick links */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn-tap" onClick={() => ui.setView("journal")} style={{ flex: 1, background: "white", border: "2.5px solid rgba(0,50,150,0.06)", borderRadius: 16, padding: "12px", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: ".8rem", color: T.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>{"\u{1F4D3}"} Tagebuch</button>
          <button className="btn-tap" onClick={() => ui.setView("time")} style={{ flex: 1, background: "white", border: "2.5px solid rgba(0,50,150,0.06)", borderRadius: 16, padding: "12px", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: ".8rem", color: T.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 48, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>{"\u23F0"} Zeitbank</button>
        </div>

        {/* Hints */}
        {(() => { const next = CHEST_MILESTONES.find(m => m > state.sd); return next ? <div style={{ fontSize: ".7rem", color: "#94A3B8", textAlign: "center", marginBottom: 8 }}>{"\u{1F381}"} Nächste Truhe: {next}-Tage Streak ({state.sd}/{next})</div> : null; })()}
        {(state.streakFreezes || 0) > 0 && <div style={{ fontSize: ".7rem", color: "#94A3B8", textAlign: "center", marginBottom: 8 }}>{"\u2744\uFE0F"} {state.streakFreezes} Streak-Schutz übrig</div>}
      </div>
    </div>
  );
}
