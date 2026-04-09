import React from 'react';
import { T, CHEST_MILESTONES, MOOD_EMOJIS, WEEKLY_MISSIONS } from '../constants';
import { getSky, getSkyStars, getTimeLabel } from '../utils/helpers';
import { ProgressRing } from './ui';
import HeroSprite from './HeroSprite';
import CatSidekick from './CatSidekick';
import SFX from '../utils/sfx';

export default function Hub({ state, level, xpP, done, total, allDone, pct, mood, dayN, setQuestOpen, setView, setMood, setCeleb, pMode, setPMode, setPinShow }) {
  return (
    <div className="view-enter" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ background: getSky(done, total), borderRadius: "0 0 32px 32px", padding: "env(safe-area-inset-top, 12px) 20px 32px", position: "relative", overflow: "hidden", minHeight: 380, display: "flex", flexDirection: "column" }}>
        {getSkyStars(done, total) && <>{Array.from({ length: 12 }, (_, i) => <div key={i} style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "white", top: `${10 + Math.random() * 40}%`, left: `${5 + Math.random() * 90}%`, animation: `starTwinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`, animationDelay: `${Math.random() * 2}s` }} />)}</>}
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "white", textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>HeroDex</div>
            <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{dayN}{state.vacMode ? " \u{1F3D6}\uFE0F" : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: 50, padding: "6px 14px", fontSize: ".8rem", fontWeight: 800, color: "white" }}>{"\u{1FA99}"} {state.coins}</div>
            <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: 50, padding: "6px 14px", fontSize: ".8rem", fontWeight: 800, color: "white" }}>Lvl {level}</div>
            <button onClick={() => pMode ? setPMode(false) : setPinShow(true)} style={{ background: pMode ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)", border: "none", borderRadius: 50, padding: "6px 12px", cursor: "pointer", color: "white", fontSize: ".75rem", fontWeight: 700, minHeight: 36, minWidth: 36 }}>{pMode ? "\u{1F513}" : "\u{1F512}"}</button>
          </div>
        </div>
        {/* XP */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".65rem", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}><span>Level {level}</span><span>{xpP.cur}/{xpP.need} XP</span></div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 50, height: 8, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 50, width: `${Math.min(100, (xpP.cur / xpP.need) * 100)}%`, background: "linear-gradient(90deg, #FCD34D, #F59E0B)", transition: "width .8s ease" }} /></div>
        </div>
        {/* Hero + Cat + Ring */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}><ProgressRing progress={pct} size={200} stroke={6} color={allDone ? "#34D399" : "rgba(255,255,255,0.4)"} /></div>
            <div style={{ animation: "heroFloat 3s ease-in-out infinite", cursor: "pointer", position: "relative", zIndex: 2 }} onClick={() => setQuestOpen(true)}>
              <HeroSprite shape={state.hero.shape} color={state.hero.color} eyes={state.hero.eyes} hair={state.hero.hair} size={140} level={level} />
            </div>
            <div style={{ position: "absolute", bottom: -10, right: -40, animation: "catIdle 4s ease-in-out infinite", zIndex: 3 }}>
              <CatSidekick variant={state.catVariant} mood={mood} size={60} />
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{getTimeLabel(done, total)}</div>
          <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "white" }}>{done}/{total} Quests {allDone ? "\u{1F389}" : ""}</div>
          <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>+{state.dt} Min verdient</div>
          {state.xpBoost && <div style={{ fontSize: ".7rem", color: "#FCD34D", fontWeight: 800, marginTop: 4, animation: "pulse 1.5s infinite" }}>{"\u{1F525}"} DOPPEL-XP AKTIV!</div>}
          {(() => { const next = CHEST_MILESTONES.find(m => m > state.sd); return next ? <div style={{ fontSize: ".65rem", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{"\u{1F381}"} Nächste Truhe: {next}-Tage Streak ({state.sd}/{next})</div> : null; })()}
        </div>
      </div>

      {/* Mood Check */}
      {state.moodAM === null && <div style={{ padding: "12px 20px 0" }}>
        <div style={{ background: "white", borderRadius: 20, padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.05)", border: "2px solid rgba(0,0,0,0.04)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 10 }}>Wie fühlst du dich heute? {"\u{1F305}"}</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>{MOOD_EMOJIS.map((e, i) => <button key={i} onClick={() => { setMood("moodAM", i); setCeleb(true); }} style={{ fontSize: "2rem", background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: 12, transition: "all .15s", minHeight: 48, minWidth: 48 }}>{e}</button>)}</div>
        </div>
      </div>}

      {/* Weekly Mission Card */}
      {(() => {
        const wm = WEEKLY_MISSIONS.find(m => m.id === state.weeklyMission);
        if (!wm) return null;
        const wp = state.weeklyProgress || 0;
        const wmDone = wp >= wm.target;
        return (
          <div style={{ padding: "8px 20px 0" }}>
            <div style={{ background: wmDone ? "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(52,211,153,0.05))" : "white", borderRadius: 20, padding: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.05)", border: wmDone ? `2px solid ${T.success}30` : "2px solid rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: "1.5rem" }}>{wm.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".76rem", fontWeight: 800, color: wmDone ? T.successDark : T.primary, textTransform: "uppercase" }}>{wmDone ? "\u2705 Mission geschafft!" : "Wochen-Mission"}</div>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".95rem", fontWeight: 700, color: T.textPrimary }}>{wm.title}</div>
                </div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: wmDone ? T.success : T.primary }}>{Math.min(wp, wm.target)}/{wm.target}</div></div>
              </div>
              <div style={{ fontSize: ".75rem", color: T.textSecondary, marginBottom: 8 }}>{wm.story}</div>
              <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 50, height: 8, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 50, width: `${Math.min(100, (wp / wm.target) * 100)}%`, background: wmDone ? `linear-gradient(90deg,${T.success},#6EE7B7)` : `linear-gradient(90deg,${T.primary},${T.primaryLight})`, transition: "width .6s ease" }} /></div>
              {wmDone && <div style={{ fontSize: ".7rem", color: T.success, fontWeight: 700, marginTop: 6, textAlign: "center" }}>{"\u{1F389}"} +{wm.reward.amount} {wm.reward.type === "coins" ? "M\u00FCnzen" : "XP"} erhalten!</div>}
            </div>
          </div>
        );
      })()}

      {/* Quest button */}
      <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
        <button onClick={() => { SFX.play("tap"); setQuestOpen(true); }} style={{
          background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`,
          border: "none", borderRadius: 50, padding: "16px 40px",
          color: "white", fontWeight: 800, fontSize: "1rem", cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans',sans-serif", textTransform: "uppercase",
          letterSpacing: ".05em", boxShadow: `0 8px 24px ${T.primary}40`, minHeight: 52,
        }}>{"\u2694\uFE0F"} Quests öffnen</button>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 8, padding: "8px 20px 20px", justifyContent: "center", flexWrap: "wrap" }}>
        {[{ id: "room", l: "Zimmer", i: "\u{1F3E0}" }, { id: "time", l: "Zeit", i: "\u23F0" }, { id: "shop", l: "Shop", i: "\u{1F6CD}\uFE0F" }, { id: "journal", l: "Buch", i: "\u{1F4D3}" }, { id: "stats", l: "Erfolge", i: "\u{1F3C6}" }].map(t => (
          <button key={t.id} onClick={() => { SFX.play("tap"); setView(t.id); }} style={{
            background: "white", border: "2px solid rgba(0,0,0,0.06)", borderRadius: 50,
            padding: "9px 16px", fontWeight: 800, fontSize: ".72rem", cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans',sans-serif", color: T.textSecondary,
            textTransform: "uppercase", letterSpacing: ".03em", minHeight: 44,
          }}>{t.i} {t.l}</button>
        ))}
      </div>
    </div>
  );
}
