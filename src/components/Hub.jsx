import React from 'react';
import { T, CHEST_MILESTONES, MOOD_EMOJIS, WEEKLY_MISSIONS } from '../constants';
import { getTimeLabel } from '../utils/helpers';
import { ProgressRing } from './ui';
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
  const { setQuestOpen, setView, setCeleb, pMode, setPMode, setPinShow } = ui;

  return (
    <div className="view-enter" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ═══ Hero Stage ═══ */}
      <div style={{ position: "relative", paddingBottom: 24 }}>
        {/* Day + Lock row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px 0", position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{dayN}{state.vacMode ? " \u{1F3D6}\uFE0F" : ""}</div>
          <button aria-label={pMode ? "Elternmodus deaktivieren" : "Elternmodus aktivieren"} onClick={() => pMode ? setPMode(false) : setPinShow(true)} style={{ background: pMode ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "6px 12px", cursor: "pointer", color: "white", fontSize: ".75rem", fontWeight: 700, minHeight: 36, minWidth: 36, backdropFilter: "blur(8px)" }}>{pMode ? "\u{1F513}" : "\u{1F512}"}</button>
        </div>

        {/* Hero platform */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, position: "relative", zIndex: 2 }}>

          {/* Hero + Cat on white island */}
          <div style={{ position: "relative", marginBottom: 6 }}>
            {/* Progress ring */}
            <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: 0 }}><ProgressRing progress={pct} size={180} stroke={7} color={allDone ? "#34D399" : "rgba(255,255,255,0.3)"} /></div>
              <div style={{ animation: "heroFloat 3s ease-in-out infinite", cursor: "pointer" }} onClick={() => setQuestOpen(true)}>
                <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={115} level={level} />
              </div>
            </div>
            {/* Cat */}
            <div style={{ position: "absolute", bottom: 6, right: -16, animation: "catIdle 4s ease-in-out infinite", zIndex: 3 }}>
              <CatSidekick variant={state.catVariant} mood={mood} size={50} />
            </div>
          </div>

          {/* White island platform */}
          <div style={{
            background: "white",
            borderRadius: 24,
            padding: "14px 28px 16px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,60,180,0.12)",
            width: "85%", maxWidth: 340,
            marginTop: -10,
            position: "relative",
          }}>
            {/* Name + level badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "#1E1B4B" }}>{state.hero.name}</div>
              <div style={{ background: "linear-gradient(135deg, #6D28D9, #A78BFA)", borderRadius: 50, padding: "3px 12px", fontFamily: "'Fredoka',sans-serif", fontSize: ".7rem", fontWeight: 700, color: "white" }}>Lvl {level}</div>
            </div>

            {/* XP progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, height: 10, background: "rgba(109,40,217,0.1)", borderRadius: 50, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 50, width: `${Math.min(100, (xpP.cur / xpP.need) * 100)}%`, background: "linear-gradient(90deg, #6D28D9, #A78BFA)", transition: "width .8s ease" }} />
              </div>
              <span style={{ fontSize: ".7rem", fontWeight: 800, color: "#475569", whiteSpace: "nowrap" }}>{xpP.cur}/{xpP.need}</span>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <div style={{ background: "#FEF3C7", borderRadius: 50, padding: "4px 12px", fontSize: ".7rem", fontWeight: 800, color: "#92400E" }}>{"\u{1F525}"} {state.sd}d Streak</div>
              <div style={{ background: "#EDE9FE", borderRadius: 50, padding: "4px 12px", fontSize: ".7rem", fontWeight: 800, color: "#6D28D9" }}>{done}/{total} Quests</div>
              {state.xpBoost && <div style={{ background: "#FEF3C7", borderRadius: 50, padding: "4px 12px", fontSize: ".7rem", fontWeight: 800, color: "#92400E", animation: "pulse 1.5s infinite" }}>2x XP</div>}
            </div>

            {/* Minutes earned */}
            <div style={{ fontSize: ".7rem", color: "#94A3B8", fontWeight: 600, marginTop: 6 }}>+{state.dt} Min verdient {"\u2022"} {getTimeLabel(done, total)}</div>
          </div>
        </div>
      </div>

      {/* ═══ Content shelf ═══ */}
      <div style={{
        flex: 1,
        background: "#EFF3FB",
        borderRadius: "28px 28px 0 0",
        padding: "20px 16px 20px",
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
