import React from 'react';
import { T, ANCHORS, RAINBOW, RAINBOW_LABELS, MOOD_EMOJIS } from '../constants';
import SFX from '../utils/sfx';
import { useGame } from '../context/GameContext';
import ParentPanel from './ParentPanel';

export default function QuestBoard() {
  const { state, computed, actions, ui } = useGame();
  const { allDone, done, total, pct, byA, level } = computed;
  const { pMode, setQuestOpen } = ui;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 50px", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", cursor: "pointer" }} onClick={() => setQuestOpen(false)} />
      <div style={{ flex: "1 1 auto", background: "linear-gradient(180deg, #F7F3E3 0%, #FFFFFF 100%)", borderRadius: "32px 32px 0 0", padding: "0 16px 100px", overflow: "auto", animation: "slideUp .3s ease", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, background: "linear-gradient(180deg, #F7F3E3, rgba(247,243,227,0.95))", paddingTop: 12, paddingBottom: 8, zIndex: 10, borderRadius: "32px 32px 0 0", backdropFilter: "blur(8px)" }}>
          <div style={{ width: 44, height: 5, borderRadius: 3, background: "rgba(180,120,40,0.14)", margin: "0 auto 8px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
            <button aria-label="Aufgaben schlie\u00DFen" onClick={() => setQuestOpen(false)} className="btn-tap" style={{ background: "white", border: "2.5px solid rgba(180,120,40,0.10)", borderRadius: 14, padding: "8px 14px", cursor: "pointer", fontSize: ".9rem", fontWeight: 800, color: T.textSecondary, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 4, minHeight: 44 }}>{"\u2190"} Zur\u00FCck</button>
            <div style={{ flex: 1, fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1rem", fontWeight: 800, color: T.primary, textTransform: "uppercase" }}>{"\u2B50"} Helden-Aufgaben</div>
          </div>
        </div>

        {state.comebackActive && <div className="mission-card" style={{ marginBottom: 14, background: "linear-gradient(135deg, #FFF7ED, #FFFBF5)", borderColor: "#F9731630" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FED7AA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{"\uD83D\uDC31"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", fontWeight: 800, color: "#EA580C", textTransform: "uppercase" }}>Willkommen zur\u00FCck!</div>
            <div style={{ fontSize: ".73rem", color: T.textSecondary, fontWeight: 600 }}>Deine Katze hat auf dich gewartet!</div>
            <button className="btn-tap" onClick={actions.completeComeback} style={{ width: "100%", marginTop: 8, background: "linear-gradient(135deg, #F97316, #FCD34D)", border: "none", borderRadius: 14, padding: "10px", color: "white", fontWeight: 800, fontSize: ".8rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: 44 }}>{"\uD83D\uDC3E"} Ich bin wieder da! (+15 {"\u2B50"})</button>
          </div>
        </div>}

        <div className="game-card" style={{ padding: 16, marginBottom: 14, background: allDone ? "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))" : "white", borderColor: allDone ? `${T.success}40` : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: allDone ? T.successDark : T.textPrimary, textTransform: "uppercase" }}>{allDone ? "\uD83D\uDCAA Durchgehalten!" : `${done}/${total} Aufgaben`}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: T.primary }}>+{state.dt} Min</span>
          </div>
          <div className="mission-progress-track"><div className="mission-progress-fill" style={{ width: `${pct * 100}%`, background: allDone ? `linear-gradient(90deg,${T.success},#6EE7B7)` : `linear-gradient(90deg,${T.primary},${T.primaryLight})` }} /></div>
        </div>

        <div className="game-card" style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".76rem", fontWeight: 800, color: T.textPrimary, textTransform: "uppercase" }}>{"\uD83C\uDF08"} Iss den Regenbogen</span>
            {(state.rainbow || []).every(Boolean) && <span style={{ fontSize: ".7rem", fontWeight: 800, color: T.success }}>+25 {"\u2B50"}! {"\uD83C\uDF89"}</span>}
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>{RAINBOW.map((emoji, i) => {
            const d = (state.rainbow || [])[i];
            return <button key={i} aria-label={`${RAINBOW_LABELS[i]} ${d ? "gegessen" : "nicht gegessen"}`} aria-pressed={d} onClick={() => actions.toggleRainbow(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", borderRadius: 14, background: d ? `${T.success}12` : "rgba(180,120,40,0.05)", border: d ? `2.5px solid ${T.success}40` : "2.5px solid rgba(180,120,40,0.08)", cursor: "pointer", transition: "all .15s", opacity: d ? 1 : 0.5, minHeight: 48 }}>
              <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
              <span style={{ fontSize: ".55rem", fontWeight: 700, color: d ? T.successDark : T.textLight }}>{RAINBOW_LABELS[i]}</span>
            </button>;
          })}</div>
        </div>

        {allDone && state.moodPM === null && <div className="game-card" style={{ padding: 16, marginBottom: 14, background: "linear-gradient(135deg, rgba(109,40,217,0.04), rgba(252,211,77,0.04))" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 10 }}>{"\uD83C\uDF19"} Worauf bist du heute stolz?</div>
          <div role="group" aria-label="Abendstimmung w\u00E4hlen" style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 12 }}>{MOOD_EMOJIS.map((e, i) => <button key={i} aria-label={`Stimmung ${i + 1} von 6`} onClick={() => actions.setMood("moodPM", i)} style={{ fontSize: "1.8rem", background: state.moodPM === i ? `${T.primary}15` : "none", border: state.moodPM === i ? `2px solid ${T.primary}` : "none", cursor: "pointer", padding: "6px", borderRadius: 10, minHeight: 48, minWidth: 44 }}>{e}</button>)}</div>
        </div>}

        {Object.entries(ANCHORS).map(([a, m]) => {
          const qs = byA[a] || [];
          if (!qs.length) return null;
          const secDone = qs.every(q => q.done);
          return (
            <div key={a} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: `${m.col}15`, borderRadius: 50, padding: "5px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "1rem" }}>{m.icon}</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".72rem", fontWeight: 800, color: m.col, textTransform: "uppercase", letterSpacing: ".06em" }}>{m.label}</span>
                </div>
                {secDone && <span style={{ fontSize: ".7rem", color: T.success, fontWeight: 800 }}>{"\u2713"} Geschafft!</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {qs.map(q => {
                  const grad = (state.graduated || []).includes(q.id);
                  return (
                    <button key={q.id} className={q.done ? "" : "btn-tap"} onClick={() => !q.done && !pMode && actions.complete(q.id)} disabled={q.done} style={{ display: "flex", alignItems: "center", gap: 12, background: grad ? "linear-gradient(135deg, #FFFBEB, #FEF3C7)" : q.done ? "linear-gradient(135deg, #F0FDF4, #DCFCE7)" : "white", border: `2.5px solid ${grad ? T.accentDark + "30" : q.done ? T.success + "30" : "rgba(180,120,40,0.08)"}`, borderRadius: 18, padding: "12px 14px", cursor: q.done ? "default" : "pointer", width: "100%", textAlign: "left", transition: "all .15s", opacity: q.done ? .7 : 1, fontFamily: "'Nunito',sans-serif", minHeight: 56, boxShadow: q.done ? "none" : "0 3px 12px rgba(120,80,20,0.06)" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 14, background: grad ? `${T.accent}20` : q.done ? `${T.success}15` : `${m.col}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{grad ? "\uD83C\uDF93" : q.done ? "\u2705" : q.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: ".88rem", textDecoration: q.done ? "line-through" : "none", color: T.textPrimary }}>{q.name}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                          <span style={{ fontSize: ".65rem", fontWeight: 700, color: T.primary }}>+{q.xp} {"\u2B50"}</span>
                          <span style={{ fontSize: ".65rem", fontWeight: 700, color: T.accentDark }}>+{q.minutes} Min</span>
                          {q.streak > 0 && <span style={{ fontSize: ".65rem", fontWeight: 700, color: "#F97316" }}>{"\uD83D\uDD25"}{q.streak}</span>}
                        </div>
                      </div>
                      {!q.done && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, background: "rgba(252,211,77,0.1)", border: "2px solid rgba(252,211,77,0.25)", borderRadius: 12, padding: "6px 8px", minWidth: 44 }}>
                        <span style={{ fontSize: ".9rem" }}>{"\u2B50"}</span>
                        <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".65rem", fontWeight: 700, color: T.accentDark }}>+{Math.floor(q.xp / 3)}</span>
                      </div>}
                      {pMode && <button aria-label={`${q.name} entfernen`} onClick={e => { e.stopPropagation(); actions.rmQuest(q.id); }} style={{ background: `${T.danger}12`, border: `2px solid ${T.danger}30`, borderRadius: 10, padding: "4px 10px", color: T.danger, cursor: "pointer", fontSize: ".65rem", fontWeight: 800, minHeight: 36 }}>{"\u2715"}</button>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {pMode && <ParentPanel />}
      </div>
    </div>
  );
}
