import React, { useRef } from 'react';
import { T, ANCHORS, RAINBOW, RAINBOW_LABELS, MOOD_EMOJIS, SCHOOL_QUESTS, VACATION_QUESTS } from '../constants';
import SFX from '../utils/sfx';

export default function QuestBoard({ state, allDone, done, total, pct, byA, pMode, complete, rmQuest, toggleRainbow, setMood, setQuestOpen, togVac, resetDay, resetAll, addQuest, nq, setNq, level }) {
  const nqRef = useRef(null);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "0 0 60px", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", cursor: "pointer" }} onClick={() => setQuestOpen(false)} />
      <div style={{ flex: "1 1 auto", background: T.card, borderRadius: "28px 28px 0 0", padding: "0 20px 100px", overflow: "auto", animation: "slideUp .3s ease", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)", position: "relative" }}>
        <div style={{ position: "sticky", top: 0, background: T.card, paddingTop: 12, paddingBottom: 8, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "28px 28px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.1)", margin: "0 auto" }} />
          <button onClick={() => setQuestOpen(false)} style={{ position: "absolute", right: 0, top: 8, background: T.bg, border: "2px solid rgba(0,0,0,0.06)", borderRadius: 50, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.1rem", fontWeight: 800, color: T.textSecondary }}>{"\u2715"}</button>
        </div>

        {/* Progress */}
        <div className="game-card" style={{ padding: 14, marginBottom: 16, background: allDone ? `${T.success}15` : undefined, borderColor: allDone ? `${T.success}40` : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800, color: allDone ? T.successDark : T.textPrimary, textTransform: "uppercase" }}>{allDone ? "\u{1F4AA} Durchgehalten!" : `${done}/${total} Quests`}</span>
            <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: ".85rem", fontWeight: 700, color: T.primary }}>+{state.dt} Min</span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 50, height: 8, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 50, width: `${pct * 100}%`, background: allDone ? `linear-gradient(90deg,${T.success},#6EE7B7)` : `linear-gradient(90deg,${T.primary},${T.primaryLight})`, transition: "width .6s ease" }} /></div>
        </div>

        {/* Rainbow */}
        <div className="game-card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".76rem", fontWeight: 800, color: T.textPrimary, textTransform: "uppercase" }}>{"\u{1F308}"} Eat the Rainbow</span>
            {(state.rainbow || []).every(Boolean) && <span style={{ fontSize: ".7rem", fontWeight: 800, color: T.success }}>+25 XP! {"\u{1F389}"}</span>}
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>{RAINBOW.map((emoji, i) => {
            const d = (state.rainbow || [])[i];
            return <button key={i} onClick={() => toggleRainbow(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px", borderRadius: 12, background: d ? `${T.success}15` : "rgba(0,0,0,0.02)", border: d ? `2px solid ${T.success}30` : "2px solid rgba(0,0,0,0.04)", cursor: "pointer", transition: "all .15s", opacity: d ? 1 : 0.5, minHeight: 48 }}>
              <span style={{ fontSize: "1.4rem" }}>{emoji}</span>
              <span style={{ fontSize: ".55rem", fontWeight: 700, color: d ? T.successDark : T.textLight }}>{RAINBOW_LABELS[i]}</span>
            </button>;
          })}</div>
          <div style={{ fontSize: ".6rem", color: T.textLight, marginTop: 6, textAlign: "center" }}>Tippe auf jede Farbe die du heute gegessen hast!</div>
        </div>

        {/* Evening mood */}
        {allDone && state.moodPM === null && <div style={{ background: `linear-gradient(135deg,${T.primary}08,${T.accent}10)`, borderRadius: 16, padding: 16, marginBottom: 16, border: `2px solid ${T.primary}15` }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 10 }}>{"\u{1F319}"} Worauf bist du heute stolz?</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginBottom: 12 }}>{MOOD_EMOJIS.map((e, i) => <button key={i} onClick={() => setMood("moodPM", i)} style={{ fontSize: "1.8rem", background: state.moodPM === i ? `${T.primary}15` : "none", border: state.moodPM === i ? `2px solid ${T.primary}` : "none", cursor: "pointer", padding: "6px", borderRadius: 10, minHeight: 48, minWidth: 44 }}>{e}</button>)}</div>
        </div>}

        {/* Quest groups */}
        {Object.entries(ANCHORS).map(([a, m]) => {
          const qs = byA[a] || [];
          if (!qs.length) return null;
          const secDone = qs.every(q => q.done);
          return (
            <div key={a} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="section-label" style={{ background: `${m.col}12`, color: m.col }}>
                  <span style={{ fontSize: "1rem" }}>{m.icon}</span> {m.label}
                </span>
                {secDone && <span style={{ fontSize: ".7rem", color: T.success, fontWeight: 800 }}>{"\u2713"} Geschafft!</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {qs.map(q => {
                  const grad = (state.graduated || []).includes(q.id);
                  return (
                    <button key={q.id} className={q.done ? "" : "btn-tap"} onClick={() => !q.done && !pMode && complete(q.id)} disabled={q.done} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: grad ? `${T.accent}08` : q.done ? `${T.success}08` : T.card,
                      border: "none",
                      borderRadius: 16, padding: "14px 16px", cursor: q.done ? "default" : "pointer",
                      width: "100%", textAlign: "left", transition: "all .15s",
                      opacity: q.done ? .55 : 1, fontFamily: "'Nunito',sans-serif", minHeight: 56,
                      boxShadow: q.done ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                      borderLeft: `4px solid ${grad ? T.accentDark : q.done ? T.success : m.col}`,
                    }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: grad ? `${T.accent}20` : q.done ? `${T.success}20` : `${m.col}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{grad ? "\u{1F393}" : q.done ? "\u2705" : q.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: ".9rem", textDecoration: q.done ? "line-through" : "none" }}>{q.name}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: ".65rem", fontWeight: 700, color: T.primary }}>+{q.xp} XP</span>
                          <span style={{ fontSize: ".65rem", fontWeight: 700, color: T.accentDark }}>+{q.minutes} Min</span>
                          {q.streak > 0 && <span style={{ fontSize: ".65rem", fontWeight: 700, color: "#F97316" }}>{"\u{1F525}"}{q.streak}</span>}
                        </div>
                      </div>
                      {pMode && <button onClick={e => { e.stopPropagation(); rmQuest(q.id); }} style={{ background: `${T.danger}15`, border: `1.5px solid ${T.danger}40`, borderRadius: 8, padding: "4px 10px", color: T.danger, cursor: "pointer", fontSize: ".65rem", fontWeight: 800, minHeight: 36 }}>{"\u2715"}</button>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Parent panel */}
        {pMode && <div style={{ background: T.bg, borderRadius: 20, padding: 16, border: `2px solid ${T.primary}15`, marginTop: 8 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: ".85rem", color: T.primary, marginBottom: 10, textTransform: "uppercase" }}>{"\u2699\uFE0F"} Eltern</div>
          <button onClick={togVac} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", border: `2px solid ${state.vacMode ? T.success : "rgba(0,0,0,0.06)"}`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", marginBottom: 12, fontFamily: "'Nunito',sans-serif", minHeight: 48 }}>
            <span style={{ fontWeight: 700, fontSize: ".85rem", color: state.vacMode ? T.successDark : T.textPrimary }}>{state.vacMode ? "\u{1F3D6}\uFE0F Ferienmodus" : "\u{1F4DA} Schulmodus"}</span>
            <div style={{ width: 40, height: 22, borderRadius: 11, background: state.vacMode ? T.success : "rgba(0,0,0,0.12)", position: "relative", transition: "all .3s" }}><div style={{ width: 16, height: 16, borderRadius: 8, background: "white", position: "absolute", top: 3, left: state.vacMode ? 21 : 3, transition: "all .3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} /></div>
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input ref={nqRef} value={nq.name} onChange={e => setNq(n => ({ ...n, name: e.target.value }))} placeholder="Neue Quest..." style={{ background: "white", border: "2px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "10px 14px", fontSize: ".85rem", fontFamily: "'Nunito',sans-serif", outline: "none", fontWeight: 600, minHeight: 44 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <select value={nq.anchor} onChange={e => setNq(n => ({ ...n, anchor: e.target.value }))} style={{ flex: 1, background: "white", border: "2px solid rgba(0,0,0,0.06)", borderRadius: 10, padding: "8px", fontSize: ".8rem", minHeight: 40 }}><option value="morning">{"\u{1F305}"} Morgens</option><option value="afternoon">{"\u2600\uFE0F"} Nachmittags</option><option value="evening">{"\u{1F319}"} Abends</option></select>
              <input type="number" value={nq.xp} onChange={e => setNq(n => ({ ...n, xp: +e.target.value }))} style={{ width: 55, background: "white", border: "2px solid rgba(0,0,0,0.06)", borderRadius: 10, padding: "8px", fontSize: ".8rem", textAlign: "center", minHeight: 40 }} placeholder="XP" />
              <input type="number" value={nq.minutes} onChange={e => setNq(n => ({ ...n, minutes: +e.target.value }))} style={{ width: 55, background: "white", border: "2px solid rgba(0,0,0,0.06)", borderRadius: 10, padding: "8px", fontSize: ".8rem", textAlign: "center", minHeight: 40 }} placeholder="Min" />
            </div>
            <button onClick={addQuest} style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryLight})`, border: "none", borderRadius: 12, padding: "12px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: ".85rem", fontFamily: "'Plus Jakarta Sans',sans-serif", minHeight: 44 }}>Erstellen</button>
          </div>
          {/* Summary */}
          <div style={{ background: "white", borderRadius: 14, padding: 12, marginTop: 10, border: `2px solid ${T.primary}10` }}>
            <div style={{ fontSize: ".75rem", fontWeight: 800, color: T.primary, textTransform: "uppercase", marginBottom: 8 }}>{"\u{1F4CA}"} Übersicht</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[{ v: state.sd, l: "Tage-Streak", c: T.primary }, { v: state.hist.length, l: "Quests gesamt", c: T.success }, { v: (state.graduated || []).length, l: "Graduiert \u{1F393}", c: T.accentDark }, { v: `Lvl ${level}`, l: `${state.xp} XP`, c: "#EC4899" }].map((s, i) => (
                <div key={i} style={{ background: T.bg, borderRadius: 10, padding: "10px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: ".6rem", color: T.textSecondary, fontWeight: 600 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {(state.graduated || []).length > 0 && <div style={{ marginTop: 8, fontSize: ".65rem", color: T.textSecondary }}>
              <span style={{ fontWeight: 700 }}>Graduierte Quests:</span> {(state.graduated || []).map(gid => { const q = [...SCHOOL_QUESTS, ...VACATION_QUESTS].find(x => x.id === gid); return q ? q.name : gid; }).join(", ")}
            </div>}
            {state.moodAM !== null && <div style={{ marginTop: 6, fontSize: ".65rem", color: T.textSecondary }}>Stimmung heute: {MOOD_EMOJIS[state.moodAM]} morgens{state.moodPM !== null ? `, ${MOOD_EMOJIS[state.moodPM]} abends` : ""}</div>}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button onClick={resetDay} style={{ flex: 1, background: `${T.accent}20`, border: `1.5px solid ${T.accent}`, borderRadius: 10, padding: "10px", color: T.accentDark, cursor: "pointer", fontSize: ".75rem", fontWeight: 800, minHeight: 44 }}>{"\u{1F504}"} Tag</button>
            <button onClick={resetAll} style={{ flex: 1, background: `${T.danger}15`, border: `1.5px solid ${T.danger}`, borderRadius: 10, padding: "10px", color: T.danger, cursor: "pointer", fontSize: ".75rem", fontWeight: 800, minHeight: 44 }}>{"\u{1F5D1}\uFE0F"} Alles</button>
          </div>
        </div>}
      </div>
    </div>
  );
}
