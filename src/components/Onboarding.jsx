import React, { useState, useEffect, useRef } from 'react';
import { T, HERO_SHAPES, HERO_COLORS, HERO_EYES, HERO_HAIRS, CAT_VARIANTS, OB_REWARDS } from '../constants';
import { getLevel } from '../utils/helpers';
import { OBWrap, OBTitle, OBSub, OBBtn, OBGrid, OBChip } from './ui';
import HeroSprite from './HeroSprite';
import CatSidekick from './CatSidekick';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [hero, setHero] = useState({ shape: "cube", color: HERO_COLORS[0], eyes: "round", hair: "short", name: "" });
  const [catAnswers, setCatAnswers] = useState({});
  const [selCat, setSelCat] = useState(null);
  const [catName, setCatName] = useState("");
  const [obHP, setObHP] = useState(0);
  const [reward, setReward] = useState(null);
  const nameRef = useRef(null);
  const catNameRef = useRef(null);

  const getSugg = () => {
    const c = catAnswers.color, p = catAnswers.power;
    if (c === "orange" || p === "fire") return "tiger";
    if (c === "grey" || p === "invisible") return "shadow";
    if (c === "white" || p === "ice") return "snow";
    if (c === "purple" || p === "speed") return "galaxy";
    return "golden";
  };

  const advanceStep = (nextStep) => {
    const r = OB_REWARDS[step];
    if (r && r.hp > 0) {
      setObHP(h => h + r.hp);
      setReward(r);
      setTimeout(() => setReward(null), 3000);
    }
    setStep(nextStep);
  };

  useEffect(() => { if (step === 5) setTimeout(() => nameRef.current?.focus(), 100); }, [step]);
  useEffect(() => { if (step === 9) setTimeout(() => catNameRef.current?.focus(), 100); }, [step]);

  const totalSteps = 10;
  const obLevel = getLevel(obHP);

  const Dots = () => (
    <div style={{ display: "flex", gap: 5, marginBottom: 16, justifyContent: "center" }}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, background: i < step ? T.success : i === step ? T.primary : "rgba(0,0,0,0.08)", transition: "all .3s" }} />
      ))}
    </div>
  );

  const OBStats = () => (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
      {obHP > 0 && <div style={{ background: `${T.accent}30`, borderRadius: 50, padding: "6px 14px", fontSize: ".8rem", fontWeight: 800, color: T.accentDark }}>{"\u2B50"} {obHP} HP</div>}
    </div>
  );

  const inputStyle = {
    width: "100%", maxWidth: 320, background: "white", borderRadius: 16,
    padding: "16px 20px", color: T.textPrimary, fontSize: "1.15rem",
    fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: "center",
    outline: "none", fontWeight: 700, boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    minHeight: 48,
  };

  // Step 0: Welcome
  if (step === 0) return <OBWrap><div style={{ fontSize: "4rem", marginBottom: 16, animation: "heroFloat 3s ease-in-out infinite" }}>{"\u{1F9B8}"}</div><OBTitle>Willkommen bei HeroDex!</OBTitle><OBSub>Erstelle deinen Helden und verdiene dabei Belohnungen!</OBSub><OBBtn onClick={() => setStep(1)} big>Los geht's! {"\u{1F680}"}</OBBtn></OBWrap>;

  // Step 1: Shape
  if (step === 1) return <OBWrap><Dots /><OBStats /><OBTitle>Deine Form</OBTitle><div style={{ marginBottom: 20 }}><HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair} size={120} level={1} /></div><OBGrid cols={4}>{HERO_SHAPES.map(s => <OBChip key={s} selected={hero.shape === s} onClick={() => setHero(h => ({ ...h, shape: s }))}>{s === "cube" ? "\u{1F7E7}" : s === "circle" ? "\u{1F535}" : s === "hex" ? "\u2B21" : "\u{1F48A}"}<div style={{ fontSize: ".6rem", marginTop: 3 }}>{s === "cube" ? "W\u00FCrfel" : s === "circle" ? "Kreis" : s === "hex" ? "Hexagon" : "Pille"}</div></OBChip>)}</OBGrid><div style={{ marginTop: 16 }}><OBBtn onClick={() => advanceStep(2)}>Weiter →</OBBtn></div></OBWrap>;

  // Step 2: Color
  if (step === 2) return <OBWrap><Dots /><OBStats /><OBTitle>Deine Farbe</OBTitle><div style={{ marginBottom: 20 }}><HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair} size={120} level={1} /></div><OBGrid cols={4}>{HERO_COLORS.map(c => <button key={c} onClick={() => setHero(h => ({ ...h, color: c }))} style={{ width: 52, height: 52, borderRadius: 14, background: c, border: hero.color === c ? `3px solid ${T.textPrimary}` : "3px solid transparent", cursor: "pointer", boxShadow: hero.color === c ? `0 4px 16px ${c}60` : "0 2px 6px rgba(0,0,0,0.08)", margin: "0 auto" }} />)}</OBGrid><div style={{ marginTop: 16 }}><OBBtn onClick={() => advanceStep(3)}>Weiter →</OBBtn></div></OBWrap>;

  // Step 3: Eyes
  if (step === 3) return <OBWrap><Dots /><OBStats /><OBTitle>Deine Augen</OBTitle><div style={{ marginBottom: 20 }}><HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair} size={120} level={1} /></div><OBGrid cols={4}>{HERO_EYES.map(e => <OBChip key={e} selected={hero.eyes === e} onClick={() => setHero(h => ({ ...h, eyes: e }))}>{e === "round" ? "\u{1F440}" : e === "happy" ? "\u{1F60A}" : e === "cool" ? "\u{1F60E}" : "\u{1F97A}"}<div style={{ fontSize: ".6rem", marginTop: 3 }}>{e === "round" ? "Rund" : e === "happy" ? "Fr\u00F6hlich" : e === "cool" ? "Cool" : "Gro\u00DF"}</div></OBChip>)}</OBGrid><div style={{ marginTop: 16 }}><OBBtn onClick={() => advanceStep(4)}>Weiter →</OBBtn></div></OBWrap>;

  // Step 4: Hair
  if (step === 4) return <OBWrap><Dots /><OBStats /><OBTitle>Deine Frisur</OBTitle><div style={{ marginBottom: 20 }}><HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair} size={120} level={1} /></div><OBGrid cols={3}>{HERO_HAIRS.map(h2 => <OBChip key={h2} selected={hero.hair === h2} onClick={() => setHero(h => ({ ...h, hair: h2 }))}>{h2 === "short" ? "\u2702\uFE0F" : h2 === "spiky" ? "\u26A1" : h2 === "curly" ? "\u{1F300}" : h2 === "long" ? "\u{1F487}" : h2 === "cap" ? "\u{1F9E2}" : "\u{1F6AB}"}<div style={{ fontSize: ".6rem", marginTop: 3 }}>{h2 === "short" ? "Kurz" : h2 === "spiky" ? "Stachelig" : h2 === "curly" ? "Lockig" : h2 === "long" ? "Lang" : h2 === "cap" ? "Kappe" : "Keine"}</div></OBChip>)}</OBGrid><div style={{ marginTop: 16 }}><OBBtn onClick={() => advanceStep(5)}>Weiter →</OBBtn></div></OBWrap>;

  // Step 5: Hero Name
  if (step === 5) return <OBWrap><Dots /><OBStats /><OBTitle>Dein Heldenname</OBTitle><div style={{ marginBottom: 16 }}><HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair} size={130} level={obLevel} /></div><input ref={nameRef} value={hero.name} onChange={e => setHero(h => ({ ...h, name: e.target.value }))} placeholder="Name eingeben..." style={{ ...inputStyle, border: `2px solid ${hero.name.trim() ? T.primary : "rgba(0,0,0,0.1)"}` }} /><div style={{ marginTop: 16 }}><OBBtn onClick={() => advanceStep(6)} disabled={!hero.name.trim()}>Weiter →</OBBtn></div></OBWrap>;

  // Step 6: Cat quiz - color
  if (step === 6) return <OBWrap><Dots /><OBStats /><OBTitle>Jetzt dein Sidekick! {"\u{1F431}"}</OBTitle><OBSub>Welche Farbe magst du?</OBSub><OBGrid cols={3}>{[{ l: "\u{1F9E1} Orange", v: "orange" }, { l: "\u{1FA76} Silber", v: "grey" }, { l: "\u{1F90D} Wei\u00DF", v: "white" }, { l: "\u{1F49C} Lila", v: "purple" }, { l: "\u{1F49B} Gold", v: "gold" }].map(o => <OBChip key={o.v} selected={catAnswers.color === o.v} onClick={() => { setCatAnswers(a => ({ ...a, color: o.v })); setTimeout(() => advanceStep(7), 250); }}>{o.l}</OBChip>)}</OBGrid></OBWrap>;

  // Step 7: Cat quiz - power
  if (step === 7) return <OBWrap><Dots /><OBStats /><OBTitle>Welche Superkraft?</OBTitle><OBGrid cols={2}>{[{ l: "\u26A1 Superschnell", v: "speed" }, { l: "\u{1F31F} Unsichtbar", v: "invisible" }, { l: "\u{1F525} Feuer", v: "fire" }, { l: "\u2744\uFE0F Eis & Schnee", v: "ice" }].map(o => <OBChip key={o.v} selected={catAnswers.power === o.v} onClick={() => { setCatAnswers(a => ({ ...a, power: o.v })); setTimeout(() => advanceStep(8), 250); }}>{o.l}</OBChip>)}</OBGrid></OBWrap>;

  // Step 8: Cat pick
  const sugg = getSugg();
  if (step === 8) return <OBWrap><Dots /><OBStats /><OBTitle>Wähle deine Katze!</OBTitle><OBSub>Empfehlung: <span style={{ color: T.accent, fontWeight: 800 }}>{CAT_VARIANTS[sugg]?.name}</span> {"\u2728"}</OBSub><OBGrid cols={3}>{Object.entries(CAT_VARIANTS).map(([k, cv]) => <OBChip key={k} selected={selCat === k} onClick={() => setSelCat(k)}><div style={{ display: "flex", justifyContent: "center" }}><CatSidekick variant={k} mood="happy" size={48} /></div><div style={{ fontSize: ".6rem", fontWeight: 800, marginTop: 3 }}>{cv.name}</div></OBChip>)}</OBGrid>{selCat && <><div style={{ fontSize: ".82rem", color: T.primaryLight, marginTop: 10, textAlign: "center" }}>{CAT_VARIANTS[selCat].desc}</div><div style={{ marginTop: 12 }}><OBBtn onClick={() => advanceStep(9)}>Weiter →</OBBtn></div></>}</OBWrap>;

  // Step 9: Cat name
  if (step === 9) return <OBWrap><Dots /><OBStats /><OBTitle>Name deiner Katze?</OBTitle><div style={{ marginBottom: 12 }}><CatSidekick variant={selCat || sugg} mood="excited" size={80} /></div><input ref={catNameRef} value={catName} onChange={e => setCatName(e.target.value)} placeholder="Katzenname..." style={{ ...inputStyle, border: `2px solid ${catName.trim() ? T.primary : "rgba(0,0,0,0.1)"}` }} /><div style={{ marginTop: 16 }}><OBBtn onClick={() => { const r = OB_REWARDS[9]; if (r && r.hp > 0) setObHP(h => h + r.hp); setStep(10); }} disabled={!catName.trim()}>Weiter →</OBBtn></div></OBWrap>;

  // Step 10: Activation
  if (step === 10) return (
    <OBWrap>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "flex-end", gap: 8, justifyContent: "center" }}>
        <div style={{ animation: "heroFloat 3s ease-in-out infinite" }}><HeroSprite shape={hero.shape} color={hero.color} eyes={hero.eyes} hair={hero.hair} size={130} level={getLevel(obHP)} /></div>
        <div style={{ animation: "heroFloat 2.5s ease-in-out infinite", animationDelay: ".5s" }}><CatSidekick variant={selCat || sugg} mood="excited" size={56} /></div>
      </div>
      <OBTitle>HeroDex aktiviert!</OBTitle>
      <OBSub>{hero.name} & {catName} sind bereit!</OBSub>
      <OBStats />
      <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 20, width: "100%", maxWidth: 320, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: ".75rem", fontWeight: 800, color: T.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Dein Startpaket</div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem" }}>{"\u2B50"}</div><div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, color: T.accentDark }}>{obHP} HP</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.5rem" }}>{"\u{1F4C8}"}</div><div style={{ fontFamily: "'Fredoka',sans-serif", fontWeight: 700, color: T.success }}>Lvl {getLevel(obHP)}</div></div>
        </div>
      </div>
      <OBBtn onClick={() => onComplete({ hero: { ...hero }, catVariant: selCat || sugg, catName, startXP: obHP, startCoins: obHP })} big>Abenteuer starten! {"\u{1F9B8}\u{1F431}"}</OBBtn>
    </OBWrap>
  );

  return null;
}
