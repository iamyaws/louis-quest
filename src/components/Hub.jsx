import React from 'react';
import { T, CHEST_MILESTONES, MOOD_EMOJIS, WEEKLY_MISSIONS } from '../constants';
import { getTimeLabel } from '../utils/helpers';
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

export default function Hub() {
  const { state, computed, actions, ui } = useGame();
  const { level, xpP, done, total, allDone, pct, mood, dayN } = computed;
  const { setQuestOpen, setCeleb, pMode, setPMode, setPinShow } = ui;

  return (
    <div className="view-enter" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ═══ HERO STAGE — Brawl Stars inspired ═══ */}
      <div style={{
        background: "linear-gradient(180deg, #1a1145 0%, #2d1b69 40%, #3b2380 70%, #1a1145 100%)",
        position: "relative", overflow: "hidden",
        paddingBottom: 0,
      }}>
        {/* Subtle background pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Top bar: day + lock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px 0", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{dayN}{state.vacMode ? " \u{1F3D6}\uFE0F" : ""}</div>
          <button aria-label={pMode ? "Elternmodus deaktivieren" : "Elternmodus aktivieren"} onClick={() => pMode ? setPMode(false) : setPinShow(true)} style={{ background: pMode ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "6px 12px", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: ".75rem", fontWeight: 700, minHeight: 36, minWidth: 36 }}>{pMode ? "\u{1F513}" : "\u{1F512}"}</button>
        </div>

        {/* HERO CHARACTER — large and dominant */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", paddingTop: 8, paddingBottom: 0, position: "relative", zIndex: 2, minHeight: 220 }}>
          {/* Glow behind hero */}
          <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${state.hero.color}40 0%, transparent 70%)`, filter: "blur(20px)" }} />

          <div style={{ position: "relative" }}>
            {/* Hero — BIG */}
            <div style={{ animation: "heroFloat 3s ease-in-out infinite", cursor: "pointer" }} onClick={() => setQuestOpen(true)}>
              <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={170} level={level} />
            </div>
            {/* Ground shadow */}
            <div style={{ width: 140, height: 12, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)", margin: "-8px auto 0" }} />
            {/* Cat beside */}
            <div style={{ position: "absolute", bottom: 0, right: -44, animation: "catIdle 4s ease-in-out infinite" }}>
              <CatSidekick variant={state.catVariant} mood={mood} size={56} />
            </div>
          </div>
        </div>

        {/* NAME BANNER */}
        <div style={{ textAlign: "center", padding: "8px 20px 12px", position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: 14, padding: "8px 20px",
          }}>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "white", letterSpacing: ".02em" }}>{state.hero.name}</span>
            <div style={{ background: "linear-gradient(135deg, #A78BFA, #7C3AED)", borderRadius: 8, padding: "2px 10px", fontFamily: "'Fredoka',sans-serif", fontSize: ".7rem", fontWeight: 700, color: "white" }}>LVL {level}</div>
          </div>
        </div>

        {/* STATS GRID — Brawl Stars style */}
        <div style={{ padding: "0 16px 16px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {/* XP */}
            <div style={{
              background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: ".55rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>XP</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#A78BFA" }}>{xpP.cur}<span style={{ fontSize: ".7rem", color: "rgba(255,255,255,0.3)" }}>/{xpP.need}</span></div>
              {/* Mini progress bar */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 50, overflow: "hidden", marginTop: 6 }}>
                <div style={{ height: "100%", borderRadius: 50, width: `${Math.min(100, (xpP.cur / xpP.need) * 100)}%`, background: "linear-gradient(90deg, #7C3AED, #A78BFA)", transition: "width .8s ease" }} />
              </div>
            </div>
            {/* Streak */}
            <div style={{
              background: "rgba(255,255,255,0.07)", border: "2px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: ".55rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Streak</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#F59E0B" }}>{"\u{1F525}"} {state.sd}<span style={{ fontSize: ".65rem", color: "rgba(255,255,255,0.3)" }}>d</span></div>
            </div>
            {/* Quests */}
            <div style={{
              background: allDone ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.07)",
              border: `2px solid ${allDone ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: ".55rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Quests</div>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: allDone ? "#34D399" : "#60A5FA" }}>{done}<span style={{ fontSize: ".7rem", color: "rgba(255,255,255,0.3)" }}>/{total}</span></div>
              {/* Mini progress bar */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 50, overflow: "hidden", marginTop: 6 }}>
                <div style={{ height: "100%", borderRadius: 50, width: `${pct * 100}%`, background: allDone ? "linear-gradient(90deg, #34D399, #6EE7B7)" : "linear-gradient(90deg, #3B82F6, #60A5FA)", transition: "width .6s ease" }} />
              </div>
            </div>
          </div>
          {/* Second row: minutes + time of day */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
            <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{"\u23F0"} +{state.dt} Min verdient</div>
            <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{getTimeLabel(done, total)}</div>
            {state.xpBoost && <div style={{ fontSize: ".7rem", color: "#FCD34D", fontWeight: 800, animation: "pulse 1.5s infinite" }}>{"\u{1F525}"} 2x XP</div>}
          </div>
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

        {/* Hints */}
        {(() => { const next = CHEST_MILESTONES.find(m => m > state.sd); return next ? <div style={{ fontSize: ".7rem", color: "#94A3B8", textAlign: "center", marginBottom: 8 }}>{"\u{1F381}"} Nächste Truhe: {next}-Tage Streak ({state.sd}/{next})</div> : null; })()}
        {(state.streakFreezes || 0) > 0 && <div style={{ fontSize: ".7rem", color: "#94A3B8", textAlign: "center", marginBottom: 8 }}>{"\u2744\uFE0F"} {state.streakFreezes} Streak-Schutz übrig</div>}
      </div>
    </div>
  );
}
