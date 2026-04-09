import React from 'react';
import { T } from '../constants';
import { ViewHeader } from './ui';
import { useGame } from '../context/GameContext';

const SECTIONS = [
  {
    emoji: "💛",
    title: "Die wichtigste Regel",
    highlight: true,
    content: "Geld und Technik machen dich nicht glücklich.\nLieb sein, sich Mühe geben und Zeit miteinander verbringen macht glücklich.",
  },
  {
    emoji: "1️⃣",
    title: "Wichtige Dinge kommen zuerst",
    items: [
      { icon: "😴", text: "Gut schlafen" },
      { icon: "🥦", text: "Gesund essen" },
      { icon: "🏃", text: "Mit deinem Körper spielen" },
      { icon: "📚", text: "Hausaufgaben" },
      { icon: "🧹", text: "Im Haushalt helfen" },
    ],
    footer: "Diese Sachen kommen immer zuerst.",
  },
  {
    emoji: "2️⃣",
    title: "Gute Gewohnheiten = mehr Technik & Geld",
    good: [
      "Deine Aufgaben machst",
      "Aufhörst, wenn die Bildschirmzeit vorbei ist",
      "Gute Entscheidungen triffst",
      "Kreativ bist und gut zusammenarbeitest",
      "Ehrlich sagst, was du benutzt",
    ],
    bad: [
      "Sachen heimlich machst",
      "Wutausbrüche bekommst",
      "Nur noch an Technik denkst",
      "Wichtige Dinge vergisst",
    ],
  },
  {
    emoji: "3️⃣",
    title: "Fehler sind okay — verstecken nicht",
    items: [
      { icon: "✅", text: "Sag es uns" },
      { icon: "✅", text: "Red mit uns darüber" },
      { icon: "✅", text: "Versuch es nochmal" },
      { icon: "❌", text: "Versteck es nicht und lüg nicht" },
    ],
    footer: "Alle machen Fehler. Ehrlichkeit bringt Vertrauen.",
  },
  {
    emoji: "4️⃣",
    title: "Deine Aufgabe",
    good: [
      "Kind sein",
      "Lernen",
      "Üben",
      "Kleine Entscheidungen treffen und daraus lernen",
    ],
    bad: [
      "Dich um Erwachsenenprobleme kümmern",
      "Dir Sorgen über Geld machen",
      "Hausentscheidungen treffen",
    ],
    footer: "Du darfst immer deine Ideen sagen, aber Mama & Papa kümmern sich um die großen Sachen.",
  },
  {
    emoji: "💛",
    title: "Und denk dran",
    highlight: true,
    content: "Mama & Papa lieben dich und helfen dir beim Lernen und Wachsen.\nWenn du unsicher bist, frag und wir helfen dir immer weiter.",
  },
];

export default function Familienregeln() {
  const { ui } = useGame();

  return (
    <div className="view-enter" style={{ minHeight: "100vh" }}>
      <ViewHeader title="Familienregeln" icon="📜" onBack={() => ui.setView("hub")} />

      <div style={{ padding: "0 16px 100px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20, padding: "0 8px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>👨‍👩‍👦‍👦</div>
          <div style={{
            fontFamily: "'Fredoka',sans-serif", fontSize: "1.3rem", fontWeight: 700,
            color: T.textPrimary, lineHeight: 1.3,
          }}>
            Unsere Familienregeln
          </div>
          <div style={{
            fontSize: "1rem", color: T.textSecondary, fontWeight: 600, marginTop: 4,
          }}>
            Darauf haben wir uns alle geeinigt
          </div>
        </div>

        {SECTIONS.map((section, i) => (
          <div key={i} className="game-card" style={{
            padding: 18, marginBottom: 14,
            background: section.highlight
              ? "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(245,158,11,0.05))"
              : "white",
            borderColor: section.highlight ? "rgba(245,158,11,0.20)" : undefined,
          }}>
            {/* Section title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "1.6rem" }}>{section.emoji}</span>
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: "1.15rem", fontWeight: 700,
                color: section.highlight ? "#B45309" : T.primary,
              }}>
                {section.title}
              </div>
            </div>

            {/* Highlighted content (intro + outro sections) */}
            {section.content && (
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: "1.1rem", fontWeight: 600,
                color: T.textPrimary, lineHeight: 1.5,
                padding: "0 4px",
              }}>
                {section.content.split("\n").map((line, j) => (
                  <div key={j} style={{ marginBottom: j === 0 ? 8 : 0 }}>{line}</div>
                ))}
              </div>
            )}

            {/* Item list (checkmarks) */}
            {section.items && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {section.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{item.icon}</span>
                    <span style={{
                      fontFamily: "'Nunito',sans-serif", fontSize: "1.05rem", fontWeight: 700,
                      color: T.textPrimary,
                    }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Good/bad lists */}
            {section.good && (
              <div style={{ marginBottom: section.bad ? 12 : 0 }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
                  color: "#059669", textTransform: "uppercase", marginBottom: 8,
                }}>
                  ✅ Du bekommst mehr, wenn du:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.good.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingLeft: 4 }}>
                      <span style={{ color: "#059669", fontWeight: 800, fontSize: "1rem", lineHeight: 1.4 }}>•</span>
                      <span style={{
                        fontFamily: "'Nunito',sans-serif", fontSize: "1.05rem", fontWeight: 700,
                        color: T.textPrimary, lineHeight: 1.4,
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {section.bad && (
              <div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 800,
                  color: "#DC2626", textTransform: "uppercase", marginBottom: 8,
                }}>
                  ❌ Du bekommst weniger, wenn du:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.bad.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingLeft: 4 }}>
                      <span style={{ color: "#DC2626", fontWeight: 800, fontSize: "1rem", lineHeight: 1.4 }}>•</span>
                      <span style={{
                        fontFamily: "'Nunito',sans-serif", fontSize: "1.05rem", fontWeight: 700,
                        color: T.textPrimary, lineHeight: 1.4,
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            {section.footer && (
              <div style={{
                fontFamily: "'Fredoka',sans-serif", fontSize: "1rem", fontWeight: 600,
                color: section.highlight ? "#B45309" : T.primary,
                marginTop: 12, paddingTop: 10,
                borderTop: "2px solid rgba(0,50,150,0.06)",
              }}>
                {section.footer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
