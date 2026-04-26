/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================ */
/*  Tokens — pulled from Ronki Laden Polish + voicelines doc    */
/* ============================================================ */
const T = {
  cream: '#fff8f2',
  cream2: '#fdf0d9',
  paper: '#f9eed8',
  ink: '#1e1b17',
  mute: '#6b655b',
  primary: '#124346',
  primary2: '#1f4d51',
  primary3: '#2d5a5e',
  gold: '#fcd34d',
  goldDeep: '#b45309',
  goldInk: '#725b00',
  ember: '#f59e0b',
  amber: '#d97706',
  night: '#0a0a2e',
  night2: '#1a0f3a',
  night3: '#2d1b4e',
  duskTop: '#1a1638',
  warm: '#3a2818',
  line: 'rgba(18,67,70,.12)',
  line2: 'rgba(18,67,70,.20)',
  fHead: '"Fredoka", system-ui, sans-serif',
  fBody: '"Nunito", system-ui, sans-serif',
  fLabel: '"Plus Jakarta Sans", system-ui, sans-serif',
};

/* ============================================================ */
/*  Reusable bits                                               */
/* ============================================================ */
const Phone = ({ children, bg = T.cream, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 280, height: 580, borderRadius: 38, background: bg,
      boxShadow: '0 24px 56px -20px rgba(0,0,0,.45), 0 0 0 8px #1c1814, 0 0 0 9px rgba(255,255,255,.04)',
      overflow: 'hidden', position: 'relative', isolation: 'isolate',
    }}>
      {/* notch */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: 88, height: 24, borderRadius: 14, background: '#0c0a08', zIndex: 50,
      }} />
      {children}
    </div>
    {label && <div style={{ font: `500 11px/1 ${T.fLabel}`, letterSpacing: '.22em', textTransform: 'uppercase', color: '#8b827a' }}>{label}</div>}
  </div>
);

const Note = ({ k, v }) => (
  <div style={{ display: 'flex', gap: 10, padding: '6px 0', borderTop: `1px dashed ${T.line2}`, fontFamily: T.fLabel, fontSize: 12, color: '#3a342d' }}>
    <strong style={{ minWidth: 76, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 10, color: T.primary, paddingTop: 2 }}>{k}</strong>
    <span style={{ flex: 1, lineHeight: 1.5 }}>{v}</span>
  </div>
);

const Voice = ({ who = 'Ronki', children, color = T.goldInk }) => (
  <div style={{
    background: 'rgba(252,211,77,.16)', border: `1px solid rgba(252,211,77,.4)`,
    borderRadius: 10, padding: '8px 10px', font: `500 12px/1.45 ${T.fBody}`, color,
    display: 'flex', gap: 8, alignItems: 'flex-start',
  }}>
    <span style={{ font: `700 9px/1.2 ${T.fLabel}`, letterSpacing: '.16em', textTransform: 'uppercase', color: T.goldDeep, paddingTop: 2, minWidth: 42 }}>{who}</span>
    <span style={{ flex: 1, fontStyle: 'italic' }}>"{children}"</span>
  </div>
);

const Frame = ({ n, t, children, w = 280 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: w }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ font: `700 11px/1 ${T.fLabel}`, letterSpacing: '.22em', color: T.primary }}>F{String(n).padStart(2, '0')}</span>
      <span style={{ font: `600 13px/1.2 ${T.fHead}`, color: T.ink }}>{t}</span>
    </div>
    {children}
  </div>
);

const Sequence = ({ children }) => (
  <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
    {children}
  </div>
);

const DirectionHeader = ({ letter, title, blurb }) => (
  <div style={{ borderLeft: `4px solid ${T.gold}`, paddingLeft: 16, marginBottom: 24, maxWidth: 680 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginBottom: 6 }}>
      <span style={{ font: `700 14px/1 ${T.fLabel}`, letterSpacing: '.3em', color: T.goldDeep }}>{letter}</span>
      <h3 style={{ margin: 0, font: `600 26px/1.1 ${T.fHead}`, color: T.ink, letterSpacing: '-0.01em' }}>{title}</h3>
    </div>
    <p style={{ margin: 0, font: `400 14px/1.55 ${T.fBody}`, color: T.mute }}>{blurb}</p>
  </div>
);

const NotesBlock = ({ items }) => (
  <div style={{
    marginTop: 18, padding: '14px 16px', background: '#fff8f2', borderRadius: 14,
    border: `1px solid ${T.line}`, maxWidth: 880,
  }}>
    {items.map(([k, v], i) => <Note key={i} k={k} v={v} />)}
  </div>
);

/* Tiny illustrative chibi placeholder — flagged as such */
const ChibiBlob = ({ size = 70, sleep = false, glow = false, mood = 'normal' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #fde68a 0%, #f59e0b 55%, #b45309 100%)',
    boxShadow: glow ? `0 0 32px 8px rgba(252,211,77,.5), inset 0 -8px 16px rgba(146,64,14,.4)` : `inset 0 -8px 16px rgba(146,64,14,.4)`,
    position: 'relative', display: 'grid', placeItems: 'center',
    filter: mood === 'sad' ? 'saturate(.6)' : 'none',
  }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px dashed rgba(255,255,255,.4)' }} />
    <span style={{ font: `700 8px/1 ${T.fLabel}`, letterSpacing: '.18em', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.4)', textTransform: 'uppercase' }}>
      {sleep ? 'Ronki · zZz' : 'Ronki'}
    </span>
  </div>
);

const Egg = ({ tint = '#fde68a', size = 56, wobble = false, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
    <div style={{
      width: size, height: size * 1.25, borderRadius: '50% 50% 48% 48% / 56% 56% 44% 44%',
      background: `radial-gradient(circle at 35% 32%, ${tint} 0%, ${tint} 38%, rgba(0,0,0,.18) 110%)`,
      boxShadow: 'inset -4px -6px 14px rgba(0,0,0,.18), inset 3px 3px 6px rgba(255,255,255,.4), 0 6px 14px -4px rgba(0,0,0,.3)',
      position: 'relative',
      animation: wobble ? 'wobble 1.6s ease-in-out infinite' : 'none',
    }}>
      <div style={{ position: 'absolute', top: '20%', left: '24%', width: 6, height: 9, background: 'rgba(255,255,255,.55)', borderRadius: '50%', filter: 'blur(.5px)' }} />
    </div>
    {label && <span style={{ font: `500 9px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em' }}>{label}</span>}
  </div>
);

/* ============================================================ */
/*  ITEM 1 — MEET-RONKI ONBOARDING                              */
/* ============================================================ */

/* ── A · One continuous shot ─────────────────────────────── */
const A1 = () => (
  <Phone bg="#0d0a08" label="dark cave, lantern lit">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 60% 40% at 50% 65%, #4a2f18 0%, #1c1108 60%, #0a0604 100%)',
    }} />
    {/* pinprick of light, far away */}
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      width: 14, height: 14, borderRadius: '50%', background: '#fcd34d',
      boxShadow: '0 0 24px 8px rgba(252,211,77,.5)' }} />
    <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center',
      font: `400 13px/1.5 ${T.fBody}`, color: 'rgba(255,242,217,.6)', fontStyle: 'italic',
      padding: '0 24px' }}>
      Drachenmutter (voice, slow): "Schau. Da hinten. Komm näher."
    </div>
  </Phone>
);
const A2 = () => (
  <Phone bg="#0d0a08" label="six eggs on a shelf">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 80% 60% at 50% 55%, #5a3820 0%, #2a1810 70%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', maxWidth: 220, margin: '0 auto' }}>
      <Egg tint="#fde68a" />
      <Egg tint="#a7f3d0" />
      <Egg tint="#fbcfe8" />
      <Egg tint="#c4b5fd" />
      <Egg tint="#bbf7d0" />
      <Egg tint="#fdba74" />
    </div>
    <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
      font: `500 14px/1.4 ${T.fHead}`, color: '#fef3c7' }}>
      Welches fühlt sich richtig an?
    </div>
    <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.45)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
      Tipp eins an
    </div>
  </Phone>
);
const A3 = () => (
  <Phone bg="#0d0a08" label="kid taps · egg wobbles">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 60% 50% at 50% 50%, #6b4422 0%, #2a1810 70%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 200, left: '50%', transform: 'translateX(-50%)' }}>
      <Egg tint="#fde68a" size={92} wobble />
    </div>
    <div style={{ position: 'absolute', top: 320, left: '50%', transform: 'translateX(-50%)',
      width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(252,211,77,.35)',
      animation: 'pulse 1.4s ease-out infinite' }} />
    <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center',
      font: `400 12px/1.4 ${T.fBody}`, color: 'rgba(255,242,217,.5)', fontStyle: 'italic' }}>
      ein Knacken, leise
    </div>
  </Phone>
);
const A4 = () => (
  <Phone bg="#0d0a08" label="hatch — same shot">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 60% at 50% 55%, #b45309 0%, #4a2511 70%, #0a0604 100%)' }} />
    {/* sparks */}
    {[...Array(8)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute', top: `${30 + Math.random() * 30}%`, left: `${20 + Math.random() * 60}%`,
        width: 3, height: 3, borderRadius: '50%', background: '#fcd34d',
        boxShadow: '0 0 6px #fcd34d',
      }} />
    ))}
    <div style={{ position: 'absolute', top: 230, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={84} glow />
    </div>
    <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center',
      font: `500 14px/1.4 ${T.fHead}`, color: '#fef3c7', padding: '0 24px' }}>
      Er schaut dich an.
    </div>
  </Phone>
);
const A5 = () => (
  <Phone bg="#0d0a08" label="first voiced line · naming">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 55% at 50% 50%, #6b4422 0%, #2a1810 75%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 140, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={88} glow />
    </div>
    <div style={{ position: 'absolute', top: 254, left: 24, right: 24,
      background: 'rgba(254,243,199,.94)', borderRadius: 16, padding: '12px 14px',
      font: `500 13px/1.4 ${T.fBody}`, color: T.warm, fontStyle: 'italic',
      boxShadow: '0 8px 24px -8px rgba(0,0,0,.4)' }}>
      "Hallo. Ich hab auf dich gewartet, glaub ich."
    </div>
    <div style={{ position: 'absolute', bottom: 90, left: 24, right: 24,
      borderRadius: 14, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(252,211,77,.3)',
      padding: '10px 14px', font: `500 13px/1.2 ${T.fBody}`, color: '#fef3c7', textAlign: 'center' }}>
      sein Name ___
    </div>
    <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.4)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
      Tipp zum Tippen — Mama oder Papa hilft
    </div>
  </Phone>
);
const A6 = () => (
  <Phone bg="#0d0a08" label="close · cave wide shot">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 60% at 50% 60%, #4a2f18 0%, #1c1108 65%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 250, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={48} glow />
    </div>
    <div style={{ position: 'absolute', bottom: 90, left: 24, right: 24, textAlign: 'center',
      font: `500 16px/1.3 ${T.fHead}`, color: '#fef3c7' }}>
      Morgen wieder?
    </div>
    <div style={{ position: 'absolute', bottom: 50, left: 0, right: 0, textAlign: 'center',
      font: `400 12px/1.4 ${T.fBody}`, color: 'rgba(255,242,217,.5)', fontStyle: 'italic', padding: '0 32px' }}>
      Drachenmutter: "Er bleibt hier. Du findest ihn wieder."
    </div>
  </Phone>
);

const ItemA = () => (
  <div>
    <DirectionHeader letter="A" title="Eine durchgehende Kameraeinstellung"
      blurb="Die Kamera kriecht in die Höhle. Lampenlicht. Sechs Eier auf einem Steinregal. Kein Schnitt, keine Szene wechselt — alles passiert in der gleichen Aufnahme. Fühlt sich an wie ein Moment, nicht wie ein Tutorial." />
    <Sequence>
      <Frame n={1} t="Annäherung">{A1()}</Frame>
      <Frame n={2} t="Die sechs Eier">{A2()}</Frame>
      <Frame n={3} t="Auswahl · Wackeln">{A3()}</Frame>
      <Frame n={4} t="Schlüpfen">{A4()}</Frame>
      <Frame n={5} t="Erste Stimme · Name">{A5()}</Frame>
      <Frame n={6} t="Schluss">{A6()}</Frame>
    </Sequence>
    <NotesBlock items={[
      ['Pacing', 'F1: 4s slow push-in. F2: holds until kid taps (open-ended). F3: 1.2s wobble. F4: 3s hatch. F5: voice line ~3s, then name input holds. F6: 2.5s, then auto-fade.'],
      ['Delight', 'The egg you tap actually wobbles before it cracks. The choice was real — your finger started it.'],
      ['Voice', 'Drachenmutter (Bella) twice, in a near-whisper. Ronki speaks once at the end of the shot.'],
      ['Tactile', 'The tap-and-wobble. No "press and hold" instruction — taps just work, and the egg responds.'],
      ['Risk', 'Sustained dim shot demands good audio mix. If the kid taps two eggs early, the second tap has to feel like "yeah, this one" — soft re-pick allowed for ~3s.'],
    ]} />
  </div>
);

/* ── B · Sticker-book reveal ─────────────────────────────── */
const PageBook = ({ pageLabel, children, n }) => (
  <Phone bg="#241712" label={`page ${n} · ${pageLabel}`}>
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #3a2818 0%, #1a0e08 100%)' }} />
    {/* leather book frame */}
    <div style={{ position: 'absolute', top: 60, left: 18, right: 18, bottom: 80,
      borderRadius: 10, background: 'linear-gradient(180deg, #f9eed8 0%, #efddb8 100%)',
      boxShadow: 'inset 0 0 0 6px #5a3a20, inset 0 0 0 8px #f9eed8, 0 18px 30px -10px rgba(0,0,0,.6)',
      padding: 22, overflow: 'hidden',
    }}>
      <div style={{ font: `700 9px/1 ${T.fLabel}`, letterSpacing: '.32em', color: '#a07840', textTransform: 'uppercase', textAlign: 'center', marginBottom: 14 }}>
        {pageLabel}
      </div>
      {children}
    </div>
    {/* page indicator */}
    <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ width: i === n ? 18 : 6, height: 6, borderRadius: 3,
          background: i === n ? '#fcd34d' : 'rgba(252,211,77,.25)' }} />
      ))}
    </div>
  </Phone>
);

const B1 = () => (
  <PageBook n={1} pageLabel="die Eier">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 12 }}>
      <Egg tint="#fde68a" size={42} />
      <Egg tint="#a7f3d0" size={42} />
      <Egg tint="#fbcfe8" size={42} />
      <Egg tint="#c4b5fd" size={42} />
      <Egg tint="#bbf7d0" size={42} />
      <Egg tint="#fdba74" size={42} />
    </div>
    <div style={{ marginTop: 18, font: `500 11px/1.4 ${T.fBody}`, color: '#5a3a20', textAlign: 'center', fontStyle: 'italic' }}>
      Tipp eins an. Es darf wackeln.
    </div>
  </PageBook>
);
const B2 = () => (
  <PageBook n={2} pageLabel="der Funke">
    <div style={{ display: 'grid', placeItems: 'center', marginTop: 28 }}>
      <Egg tint="#fde68a" size={70} wobble />
    </div>
    <div style={{ marginTop: 22, font: `500 11px/1.4 ${T.fBody}`, color: '#5a3a20', textAlign: 'center', fontStyle: 'italic' }}>
      Halt deinen Finger drauf. Ganz leicht.
    </div>
    <div style={{ marginTop: 6, font: `400 10px/1 ${T.fLabel}`, color: '#a07840', letterSpacing: '.14em', textAlign: 'center', textTransform: 'uppercase' }}>
      die Schale schält sich</div>
  </PageBook>
);
const B3 = () => (
  <PageBook n={3} pageLabel="ein Name">
    <div style={{ display: 'grid', placeItems: 'center', marginTop: 18 }}>
      <ChibiBlob size={66} glow />
    </div>
    <div style={{ marginTop: 16, padding: '8px 12px', borderRadius: 10, background: 'rgba(252,211,77,.22)',
      border: '1px dashed #c08a3a', font: `600 14px/1 'Caveat', cursive`, color: '#5a3a20', textAlign: 'center', fontFamily: 'Fredoka, cursive' }}>
      ___________
    </div>
    <div style={{ marginTop: 10, font: `400 10px/1.3 ${T.fBody}`, color: '#a07840', textAlign: 'center', fontStyle: 'italic' }}>
      mit Tinte. Wie damals.
    </div>
  </PageBook>
);

const ItemB = () => (
  <div>
    <DirectionHeader letter="B" title="Sticker-Buch · drei Seiten"
      blurb="Ein altes Lederbuch auf dem Höhlenboden. Das Kind streicht zwischen drei Seiten — Eier, Funke, Name. Jede Seite hat ein einziges, sauberes Detail. Kein Tutorial, nur ein Buch, das man durchblättert." />
    <Sequence>
      <Frame n={1} t="Seite 1 · die Eier">{B1()}</Frame>
      <Frame n={2} t="Seite 2 · der Funke">{B2()}</Frame>
      <Frame n={3} t="Seite 3 · ein Name">{B3()}</Frame>
    </Sequence>
    <NotesBlock items={[
      ['Pacing', 'Each page holds until the kid swipes (or until 8s of stillness, then a hint glow on the corner). 25–40s end-to-end if the kid moves through.'],
      ['Delight', 'The peel: kid puts finger on egg, the shell separates around the finger like opening tape. Tactile and weirdly satisfying.'],
      ['Voice', 'Drachenmutter narrates each page header in two-word fragments. Ronki only speaks on page 3, after his name is written.'],
      ['Why a book', 'The book is a frame the kid recognises. It says "this is a thing to read together," which makes parents lean in. It also gives us 3 clean re-entry points if the kid backs out.'],
      ['Voiced line on page 3', 'Ronki: "Du hast meinen Namen geschrieben. Den behalte ich."'],
      ['Risk', 'Three pages can feel like three taps too many. If the swipe interaction is sluggish the whole moment dies. Must feel weightless.'],
    ]} />
  </div>
);

/* ── C · Tactile-teach-first ─────────────────────────────── */
const C1 = () => (
  <Phone bg="#0d0a08" label="Ronki already there · sleeping">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 55% at 50% 60%, #3a2818 0%, #14100c 75%, #0a0604 100%)' }} />
    {/* lantern glow */}
    <div style={{ position: 'absolute', top: 80, left: '15%', width: 40, height: 40, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(252,211,77,.35) 0%, transparent 70%)' }} />
    <div style={{ position: 'absolute', top: 280, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={86} sleep />
    </div>
    {/* breathing dot */}
    <div style={{ position: 'absolute', top: 360, left: '50%', transform: 'translateX(-50%)',
      width: 4, height: 4, borderRadius: '50%', background: 'rgba(252,211,77,.6)',
      boxShadow: '0 0 8px rgba(252,211,77,.6)', animation: 'breathe 4s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center',
      font: `400 13px/1.4 ${T.fBody}`, color: 'rgba(255,242,217,.55)', fontStyle: 'italic', padding: '0 28px' }}>
      Er schläft. Du kannst ihn anfassen, wenn du magst.
    </div>
  </Phone>
);
const C2 = () => (
  <Phone bg="#0d0a08" label="touch · he stirs">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 55% at 50% 55%, #5a3520 0%, #1a0f08 75%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 250, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={92} sleep glow />
    </div>
    {/* finger ring */}
    <div style={{ position: 'absolute', top: 290, left: '50%', transform: 'translateX(-50%)',
      width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(252,211,77,.5)',
      animation: 'pulse 2s ease-out infinite' }} />
    <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, textAlign: 'center',
      font: `400 12px/1.4 ${T.fBody}`, color: 'rgba(255,242,217,.55)', fontStyle: 'italic' }}>
      ein kleines Geräusch
    </div>
  </Phone>
);
const C3 = () => (
  <Phone bg="#0d0a08" label="hold · breathe with him">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 55% at 50% 55%, #6b4422 0%, #1a0f08 75%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 220, left: '50%', transform: 'translateX(-50%)',
      animation: 'breatheBig 4s ease-in-out infinite' }}>
      <ChibiBlob size={100} sleep glow />
    </div>
    {/* breath ring expanding */}
    <div style={{ position: 'absolute', top: 240, left: '50%', transform: 'translateX(-50%)',
      width: 110, height: 110, borderRadius: '50%', border: '1px solid rgba(252,211,77,.3)',
      animation: 'breathRing 4s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center',
      font: `500 13px/1.4 ${T.fHead}`, color: '#fef3c7' }}>
      ein. aus. ein. aus.
    </div>
    <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.4)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
      finger drauf lassen
    </div>
  </Phone>
);
const C4 = () => (
  <Phone bg="#0d0a08" label="eyes open">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 55% at 50% 55%, #7a5028 0%, #1a0f08 75%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 220, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={100} glow />
    </div>
    <div style={{ position: 'absolute', top: 348, left: 24, right: 24,
      background: 'rgba(254,243,199,.94)', borderRadius: 14, padding: '10px 14px',
      font: `500 12px/1.4 ${T.fBody}`, color: T.warm, fontStyle: 'italic',
      boxShadow: '0 8px 24px -8px rgba(0,0,0,.4)' }}>
      "Oh. Du bist da. Hab dich nicht gehört."
    </div>
  </Phone>
);
const C5 = () => (
  <Phone bg="#0d0a08" label="name · last">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 55% at 50% 55%, #6b4422 0%, #1a0f08 75%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 180, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={80} glow />
    </div>
    <div style={{ position: 'absolute', top: 290, left: 24, right: 24, textAlign: 'center',
      font: `500 13px/1.4 ${T.fHead}`, color: '#fef3c7' }}>
      Wie soll ich heißen?
    </div>
    <div style={{ position: 'absolute', bottom: 90, left: 24, right: 24,
      borderRadius: 14, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(252,211,77,.35)',
      padding: '10px 14px', font: `500 13px ${T.fBody}`, color: '#fef3c7', textAlign: 'center' }}>
      ___
    </div>
    <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.4)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
      Tipp zum Tippen
    </div>
  </Phone>
);

const ItemC = () => (
  <div>
    <DirectionHeader letter="C" title="Berühren zuerst · dann Name"
      blurb="Ronki ist schon da, schläft. Das Kind berührt ihn — er regt sich. Das Kind hält den Finger drauf — er atmet mit. Kind lässt los — Augen auf. Erst dann ein Name. Die Beziehung kommt vor dem Etikett. Inspired by BeiRonkiSein." />
    <Sequence>
      <Frame n={1} t="Er schläft schon">{C1()}</Frame>
      <Frame n={2} t="Berühren">{C2()}</Frame>
      <Frame n={3} t="Mitatmen">{C3()}</Frame>
      <Frame n={4} t="Augen auf">{C4()}</Frame>
      <Frame n={5} t="Name · zum Schluss">{C5()}</Frame>
    </Sequence>
    <NotesBlock items={[
      ['Pacing', 'F1 holds open — no time pressure, kid arrives when they arrive. F3 is the tactile centerpiece, ~10s of held breathing. Whole thing 50–60s.'],
      ['Delight', 'Hold-to-breathe. The chibi body actually scales with a 4s in/out curve while the finger is down. When the finger lifts, the eyes open. The kid makes him wake up.'],
      ['Voice', 'Drachenmutter is silent here. Ronki has the only voiced line, after he opens his eyes. Quieter, more intimate than A or B.'],
      ['Why this order', 'A and B do "meet → name → care." C does "care → meet → name." The kid has already done the most important thing (breathed with him) before they label him. That\'s the BeiRonkiSein bar.'],
      ['No egg picking', 'Trade-off: the kid doesn\'t pick a variant. Either parent picks during install (pre-app), or the variant is randomised, or we add a 4-second egg moment at the very start before C1. Open question for Marc.'],
      ['Voiced line', 'Ronki, post-wake: "Oh. Du bist da. Hab dich nicht gehört." (then, before name) "Du musst mir noch einen Namen geben. Sonst weiß ich nicht, ob du mich rufst."'],
    ]} />
  </div>
);

/* ============================================================ */
/*  ITEM 2 — TONIGHT (BEDTIME)                                  */
/* ============================================================ */

/* ── D · Stargazing ──────────────────────────────────────── */
const D1 = () => (
  <Phone bg={T.night} label="cave shifts to night">
    <div style={{ position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0f3a 60%, #2d1b1f 100%)' }} />
    <div style={{ position: 'absolute', top: 280, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={70} sleep />
    </div>
    <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
      font: `500 14px/1.4 ${T.fHead}`, color: 'rgba(255,255,255,.85)' }}>
      Heute Abend
    </div>
    <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
      einmal tippen
    </div>
  </Phone>
);
const D2 = () => (
  <Phone bg={T.night} label="POV · looking up with him">
    <div style={{ position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0f3a 100%)' }} />
    {/* stars */}
    {[...Array(40)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${Math.random() * 60}%`, left: `${Math.random() * 100}%`,
        width: 1 + Math.random() * 2, height: 1 + Math.random() * 2, borderRadius: '50%',
        background: 'white', opacity: 0.3 + Math.random() * 0.5,
        boxShadow: '0 0 3px white',
      }} />
    ))}
    {/* cave mouth silhouette */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
      background: '#1c1108',
      clipPath: 'polygon(0 100%, 0 60%, 12% 35%, 30% 22%, 50% 18%, 70% 24%, 88% 38%, 100% 62%, 100% 100%)',
    }} />
    <div style={{ position: 'absolute', bottom: 60, left: '40%' }}>
      <ChibiBlob size={36} sleep />
    </div>
    <div style={{ position: 'absolute', bottom: 60, left: '58%',
      width: 28, height: 28, borderRadius: '50%',
      background: 'radial-gradient(circle, #3b82f6 0%, #1e40af 100%)' }} />
    <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
      du · Ronki
    </div>
  </Phone>
);
const D3 = () => (
  <Phone bg={T.night} label="story plays · stars drift">
    <div style={{ position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0f3a 100%)' }} />
    {[...Array(40)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${Math.random() * 55}%`, left: `${Math.random() * 100}%`,
        width: 1 + Math.random() * 2, height: 1 + Math.random() * 2, borderRadius: '50%',
        background: 'white', opacity: 0.4 + Math.random() * 0.5,
        boxShadow: '0 0 3px white',
      }} />
    ))}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: '#1c1108',
      clipPath: 'polygon(0 100%, 0 60%, 12% 35%, 30% 22%, 50% 18%, 70% 24%, 88% 38%, 100% 62%, 100% 100%)',
    }} />
    {/* story text */}
    <div style={{ position: 'absolute', top: 90, left: 24, right: 24,
      font: `400 14px/1.55 ${T.fBody}`, color: 'rgba(255,255,255,.9)', fontStyle: 'italic', textAlign: 'center' }}>
      "Heute hat ein Glühwürmchen mich gefragt,<br/>
      ob ich auch leuchten kann.<br/>
      Ich hab gesagt: noch nicht. Aber bald."
    </div>
    {/* waveform tag */}
    <div style={{ position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 3, alignItems: 'center' }}>
      {[3,6,10,7,4,8,12,5,3].map((h, i) => (
        <div key={i} style={{ width: 2, height: h, borderRadius: 1, background: 'rgba(252,211,77,.5)' }} />
      ))}
      <span style={{ marginLeft: 8, font: `500 9px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.4)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Ronki</span>
    </div>
  </Phone>
);
const D4 = () => (
  <Phone bg={T.night} label="lullaby · curtain of stars">
    <div style={{ position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #050518 0%, #0a0a2e 100%)' }} />
    {[...Array(50)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
        width: 1 + Math.random() * 2, height: 1 + Math.random() * 2, borderRadius: '50%',
        background: 'white', opacity: 0.5 + Math.random() * 0.5,
      }} />
    ))}
    <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1.4 ${T.fLabel}`, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em' }}>
      ♪ ♪ ♪ ♪ <br/><span style={{fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase'}}>4 Takte · einmal</span>
    </div>
  </Phone>
);
const D5 = () => (
  <Phone bg="#000" label="blackout · phone down">
    <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)',
      textAlign: 'center', font: `400 11px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.15)',
      letterSpacing: '.22em', textTransform: 'uppercase' }}>
      gute nacht
    </div>
  </Phone>
);

const ItemD = () => (
  <div>
    <DirectionHeader letter="D" title="Sterne schauen"
      blurb="Ronki und du, von hinten gesehen, liegen am Höhleneingang. Sterne erscheinen mit Parallaxe. Eine Geschichte spielt. Tippen → ein Sternenvorhang fällt. Schlaflied. Schwarz." />
    <Sequence>
      <Frame n={1} t="Heute Abend">{D1()}</Frame>
      <Frame n={2} t="Hinausschauen">{D2()}</Frame>
      <Frame n={3} t="Geschichte spielt">{D3()}</Frame>
      <Frame n={4} t="Vorhang · Schlaflied">{D4()}</Frame>
      <Frame n={5} t="Schwarz">{D5()}</Frame>
    </Sequence>
    <NotesBlock items={[
      ['Pacing', 'F1: 2s. F2: 4s sky settles, parallax drifts. F3: 25–35s voiced story. F4: lullaby plays once (~12s) as curtain closes. F5: full blackout, holds.'],
      ['Lullaby entry', 'Lullaby starts the moment the kid taps to advance from F3 → F4. Music and visual close in sync; the last note lands as black takes over.'],
      ['Dim curve', 'Brightness 100 → 40 across F3 (over 30s). 40 → 0 across F4 (12s, ease-in-cubic). F5 is true black so OLED phones go dark.'],
      ['Story line', 'Ronki: "Heute hat ein Glühwürmchen mich gefragt, ob ich auch leuchten kann. Ich hab gesagt: noch nicht. Aber bald." (~22s, slow.)'],
      ['No metric', 'No streak, no "you completed bedtime" toast, no log. The kid never sees a number. Parents see the count in the parent surface; the kid never does.'],
      ['Re-entry', 'If the kid opens the app post-blackout, it stays black with a single faint "schon dunkel" tap-area to relaunch into the cave (or just exit).'],
    ]} />
  </div>
);

/* ── E · Lagerfeuer-down ─────────────────────────────────── */
const Embers = ({ density = 1, opacity = 1 }) => (
  <>
    {[...Array(Math.round(20 * density))].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${50 + Math.random() * 35}%`, left: `${30 + Math.random() * 40}%`,
        width: 2, height: 2, borderRadius: '50%', background: '#fcd34d',
        boxShadow: '0 0 4px #f59e0b', opacity: 0.4 * opacity + Math.random() * 0.4 * opacity,
      }} />
    ))}
  </>
);

const E1 = () => (
  <Phone bg={T.night} label="bright fire">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 60% 50% at 50% 75%, #f59e0b 0%, #b45309 30%, #2a1810 75%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 220, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={68} glow />
    </div>
    {/* fire shape */}
    <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
      width: 80, height: 90, borderRadius: '50% 50% 30% 30%',
      background: 'radial-gradient(ellipse at center, #fef3c7 0%, #fcd34d 30%, #f59e0b 60%, #b45309 100%)',
      filter: 'blur(2px)' }} />
    <Embers density={1.5} opacity={1} />
    <div style={{ position: 'absolute', top: 36, left: 0, right: 0, textAlign: 'center',
      font: `500 14px/1.3 ${T.fHead}`, color: 'rgba(254,243,199,.85)' }}>
      noch eins, noch eins
    </div>
  </Phone>
);
const E2 = () => (
  <Phone bg={T.night} label="story · fire quiets">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 50% 40% at 50% 78%, #d97706 0%, #7c2d12 40%, #1a0f08 80%, #0a0604 100%)' }} />
    <div style={{ position: 'absolute', top: 220, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={64} sleep />
    </div>
    <div style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)',
      width: 60, height: 60, borderRadius: '50% 50% 30% 30%',
      background: 'radial-gradient(ellipse at center, #fcd34d 0%, #b45309 60%, #7c2d12 100%)',
      filter: 'blur(1px)' }} />
    <div style={{ position: 'absolute', top: 90, left: 24, right: 24, textAlign: 'center',
      font: `400 13px/1.55 ${T.fBody}`, color: 'rgba(254,243,199,.8)', fontStyle: 'italic' }}>
      "Wenn das Feuer leiser wird,<br/>kann man besser hören, was die Nacht erzählt."
    </div>
    <Embers density={1} opacity={0.8} />
  </Phone>
);
const E3 = () => (
  <Phone bg={T.night} label="embers · last hum">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 35% 25% at 50% 80%, #b45309 0%, #4a1f08 50%, #0a0604 90%)' }} />
    <div style={{ position: 'absolute', top: 230, left: '50%', transform: 'translateX(-50%)' }}>
      <ChibiBlob size={56} sleep />
    </div>
    <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
      width: 32, height: 16, borderRadius: '50%',
      background: 'radial-gradient(ellipse, #f59e0b 0%, #7c2d12 100%)' }} />
    <Embers density={0.5} opacity={0.6} />
    <div style={{ position: 'absolute', top: 36, left: 0, right: 0, textAlign: 'center',
      font: `400 11px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.4)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
      ♪ vier Takte
    </div>
  </Phone>
);
const E4 = () => (
  <Phone bg="#000" label="embers fade · one by one">
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 20% 12% at 50% 82%, rgba(180,83,9,.4) 0%, transparent 70%)' }} />
    {[...Array(3)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute', bottom: 60 + i * 4, left: `${46 + i * 4}%`,
        width: 2, height: 2, borderRadius: '50%', background: '#f59e0b',
        boxShadow: '0 0 4px #b45309', opacity: 0.4,
      }} />
    ))}
    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)',
      textAlign: 'center', font: `400 11px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.18)',
      letterSpacing: '.22em', textTransform: 'uppercase' }}>
      schlaf gut
    </div>
  </Phone>
);

const ItemE = () => (
  <div>
    <DirectionHeader letter="E" title="Lagerfeuer · runter"
      blurb="Reuse der BeiRonkiSein-Lagerszene, aber rückwärts: hell → leiser → Glut → schwarz. Sound: das Knistern wird weicher. Das Schlaflied ist das letzte Summen der Glut. Tippen → die Glutpunkte verschwinden einer nach dem anderen." />
    <Sequence>
      <Frame n={1} t="Helles Feuer">{E1()}</Frame>
      <Frame n={2} t="Geschichte · leiser">{E2()}</Frame>
      <Frame n={3} t="Glut · Summen">{E3()}</Frame>
      <Frame n={4} t="Glut verlöscht">{E4()}</Frame>
    </Sequence>
    <NotesBlock items={[
      ['Pacing', 'F1: 3s settle. F2: 25s voice + dim. F3: lullaby 12s, embers steady. F4: 6s, embers fade individually with little crackle taps in audio.'],
      ['Lullaby entry', 'Lullaby is diegetic — it sounds like the embers humming. Same notes as D, but different framing: here it\'s in the world, not over it.'],
      ['Dim curve', 'Fire glow shrinks proportionally, not just brightness. F1 ellipse 60% → F4 22%. Background hue stays warm to the very end (we don\'t go cold blue).'],
      ['Story line', 'Ronki: "Wenn das Feuer leiser wird, kann man besser hören, was die Nacht erzählt." (~25s, holds the rhythm.)'],
      ['Why this works', 'Continuity with BeiRonkiSein. The campfire is already the warmest moment in the product — letting it end the day gives the whole product one emotional through-line.'],
      ['Sound design', 'Crackle volume linear-down across F1→F3. F4 has 3 separate ember-pops as embers vanish, last one hits silence.'],
    ]} />
  </div>
);

/* ── F · Story-page ─────────────────────────────────────── */
const StoryPage = ({ n, total = 3, art, line, tone = 'cave' }) => (
  <Phone bg="#1a1108" label={`page ${n} · auto-advance`}>
    <div style={{ position: 'absolute', inset: 0,
      background: tone === 'cave'
        ? 'radial-gradient(ellipse at center, #2a1810 0%, #0d0806 100%)'
        : tone === 'fire'
        ? 'radial-gradient(ellipse 50% 40% at 50% 78%, #b45309 0%, #2a1810 60%, #0a0604 100%)'
        : 'radial-gradient(ellipse at center, #1a0f3a 0%, #0a0a2e 100%)',
    }} />
    {/* paper page inset */}
    <div style={{ position: 'absolute', top: 56, left: 22, right: 22, bottom: 88,
      borderRadius: 6, background: 'linear-gradient(180deg, #f9eed8 0%, #efddb8 100%)',
      boxShadow: '0 12px 24px -8px rgba(0,0,0,.5), inset 0 0 0 1px #c8a672',
      padding: '22px 18px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 0 }}>
        {art}
      </div>
      <div style={{ marginTop: 10, font: `500 12px/1.5 ${T.fBody}`, color: '#3a2818', fontStyle: 'italic', textAlign: 'center' }}>
        "{line}"
      </div>
    </div>
    {/* page dots */}
    <div style={{ position: 'absolute', bottom: 38, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
      {[...Array(total)].map((_, i) => (
        <div key={i} style={{ width: i + 1 === n ? 16 : 5, height: 5, borderRadius: 3,
          background: i + 1 === n ? '#fcd34d' : 'rgba(252,211,77,.25)' }} />
      ))}
    </div>
    <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center',
      font: `400 9px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.3)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
      blättert von selbst
    </div>
  </Phone>
);

const F1 = () => (
  <StoryPage n={1} art={<ChibiBlob size={64} glow />} tone="cave"
    line="Heute hat der Wind unter meinem Bauch geschlafen. Hat sich angefühlt wie ein Kitzeln." />
);
const F2 = () => (
  <StoryPage n={2} art={
    <div style={{ position: 'relative', width: 100, height: 80 }}>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 50, height: 56, borderRadius: '50% 50% 30% 30%',
        background: 'radial-gradient(ellipse, #f59e0b 0%, #b45309 70%)' }} />
      <ChibiBlob size={48} />
    </div>
  } tone="fire"
    line="Ich hab dem Feuer gesagt, dass du heut müde bist. Es hat genickt." />
);
const F3 = () => (
  <StoryPage n={3} art={<ChibiBlob size={70} sleep />} tone="cave"
    line="Jetzt mach ich die Augen zu. Du auch?" />
);
const F4 = () => (
  <Phone bg="#000" label="book closes · blackout">
    <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)',
      textAlign: 'center', font: `400 11px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.16)',
      letterSpacing: '.22em', textTransform: 'uppercase' }}>
      schlaf gut
    </div>
  </Phone>
);

const ItemF = () => (
  <div>
    <DirectionHeader letter="F" title="Geschichten-Seite"
      blurb="Der Bildschirm wird zu einem Buch. Drei illustrierte Seiten im Höhlen-Stil. Jede Seite eine Zeile. Blättert von selbst (~10s pro Seite). Letzte Seite: Ronki schläft. Tippen → Buch zu → Schwarz. Fühlt sich an wie Lesen mit Ronki." />
    <Sequence>
      <Frame n={1} t="Seite 1 · Wind">{F1()}</Frame>
      <Frame n={2} t="Seite 2 · Feuer">{F2()}</Frame>
      <Frame n={3} t="Seite 3 · Augen zu">{F3()}</Frame>
      <Frame n={4} t="Buch zu">{F4()}</Frame>
    </Sequence>
    <NotesBlock items={[
      ['Pacing', 'Each page auto-advances after the voiced line ends + 2s silence (~10–12s per page). Kid does not need to tap to advance. ~35s total before lullaby.'],
      ['Lullaby entry', 'Lullaby plays under page 3 only — quiet bed, page 3 voice rides on top. As page closes (book-close transition, 2s), lullaby is alone for the last 2 bars.'],
      ['Dim curve', 'Each page slightly darker than the last. Pages 1→2→3 brightness 100 → 80 → 55. Book close goes 55 → 0 across 3s.'],
      ['Voiced lines', 'Three 6–9s lines at the BeiRonkiSein bar. Soft, observational, not "today you did X." Pulled from a pool of ~15 page-trios so it rotates.'],
      ['Why a book', 'Reading-with is the bedtime ritual most parents already do. The format borrows that emotional position without making the kid actually read. The illustrations are the story.'],
      ['Risk', 'Auto-advance can feel paternalistic. Mitigation: the dot indicator fills smoothly (you can see it coming), and tap-to-advance also works. The kid can\'t miss anything.'],
    ]} />
  </div>
);

/* ============================================================ */
/*  Section header                                              */
/* ============================================================ */
const SectionTitle = ({ kicker, title, subtitle, children }) => (
  <div style={{ maxWidth: 980, paddingBottom: 8, marginBottom: 24, borderBottom: `1px solid ${T.line2}` }}>
    <div style={{ font: `700 11px/1 ${T.fLabel}`, letterSpacing: '.32em', color: T.goldDeep, textTransform: 'uppercase', marginBottom: 10 }}>
      {kicker}
    </div>
    <h2 style={{ margin: 0, font: `600 38px/1.05 ${T.fHead}`, color: T.ink, letterSpacing: '-0.015em' }}>{title}</h2>
    {subtitle && <p style={{ margin: '10px 0 0', font: `400 15px/1.55 ${T.fBody}`, color: T.mute, maxWidth: 720 }}>{subtitle}</p>}
    {children && <div style={{ marginTop: 16 }}>{children}</div>}
  </div>
);

const Brief = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, maxWidth: 880, marginTop: 8 }}>
    {[
      ['Voice bar', 'Soft, hedge-y, slightly stumbly. No em-dashes, no exclamation points unless it\'s peak Dikka. No "du hast\'s geschafft" praise. Kid-readable, but read aloud first.'],
      ['Visual reuse', 'MoodChibi as the asset (variant + stage + mood). I\'m drawing it as a placeholder blob. Painterly cave from RoomHub. Campfire from BeiRonkiSein.'],
      ['No', 'Streaks, badges, +1 toasts, "great job!", screen-time framing, multi-step tutorial overlays, emoji in copy.'],
      ['The bar', 'Würde ein Kind, das das mit 6 benutzt, mit 26 noch über Ronki reden? Wenn ja → ship. Wenn nein → von vorn.'],
    ].map(([k, v]) => (
      <div key={k} style={{ background: '#fff8f2', border: `1px solid ${T.line}`, borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ font: `700 9px/1 ${T.fLabel}`, letterSpacing: '.22em', color: T.primary, textTransform: 'uppercase', marginBottom: 6 }}>{k}</div>
        <div style={{ font: `400 12px/1.5 ${T.fBody}`, color: T.ink }}>{v}</div>
      </div>
    ))}
  </div>
);

/* ============================================================ */
/*  App                                                         */
/* ============================================================ */
const App = () => (
  <div data-screen-label="Wireframes">
    <DCSection id="brief" title="Wireframes · Meet-Ronki + Tonight" subtitle="Two highest-leverage moments. First impression and last impression of every Ronki day. 3 directions per item. Sequence wireframes, not single screens.">
      <DCArtboard id="brief-card" label="The bar we hold ourselves to" width={1000} height={520}>
        <div style={{ padding: 36, background: T.cream, height: '100%', boxSizing: 'border-box' }}>
          <SectionTitle
            kicker="The bar"
            title="Würde ein Kind, das das mit 6 benutzt, mit 26 noch über Ronki reden?"
            subtitle="Wenn ja, ship. Wenn nein, von vorn. Beides Items sind Momente, keine Seiten — also wireframes als Sequenzen, nicht als Screens. Stimme bei BeiRonkiSein-Niveau, kein UI das sich selbst ankündigt."
          />
          <Brief />
        </div>
      </DCArtboard>
    </DCSection>

    <DCSection id="item1" title="Item 1 · Meet-Ronki Onboarding" subtitle="Erste 60 Sekunden. Eltern installiert wegen Wissenschaft-Artikel — Kind öffnet zum ersten Mal. Ende: Kind soll fühlen 'dieser Drache gehört mir', nicht 'ich hab eine App kennengelernt'.">
      <DCArtboard id="item1-A" label="A · One continuous shot" width={1880} height={920}>
        <div style={{ padding: 32, background: T.cream2, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <ItemA />
        </div>
      </DCArtboard>
      <DCArtboard id="item1-B" label="B · Sticker-book reveal" width={1100} height={900}>
        <div style={{ padding: 32, background: T.cream2, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <ItemB />
        </div>
      </DCArtboard>
      <DCArtboard id="item1-C" label="C · Tactile-teach-first" width={1620} height={920}>
        <div style={{ padding: 32, background: T.cream2, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <ItemC />
        </div>
      </DCArtboard>
    </DCSection>

    <DCSection id="item2" title="Item 2 · Tonight (Bedtime)" subtitle="Es gibt heute keine Abendoberfläche. Bedtime ist wo Kindheits-Erinnerungs-Produkte gewinnen oder verlieren. Hier wird Ronki zur Stimme die das Kind beim Einschlafen hört. 60–90 Sekunden, voiced, dimmt sich selbst.">
      <DCArtboard id="item2-D" label="D · Stargazing" width={1620} height={920}>
        <div style={{ padding: 32, background: '#1a1428', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ filter: 'invert(0)' }}>
            <DirectionHeader letter="D" title="Sterne schauen"
              blurb="Ronki und du, von hinten gesehen, liegen am Höhleneingang. Sterne erscheinen mit Parallaxe. Eine Geschichte spielt. Tippen → ein Sternenvorhang fällt. Schlaflied. Schwarz." />
          </div>
          <Sequence>
            <Frame n={1} t="Heute Abend">{D1()}</Frame>
            <Frame n={2} t="Hinausschauen">{D2()}</Frame>
            <Frame n={3} t="Geschichte spielt">{D3()}</Frame>
            <Frame n={4} t="Vorhang · Schlaflied">{D4()}</Frame>
            <Frame n={5} t="Schwarz">{D5()}</Frame>
          </Sequence>
          <NotesBlock items={[
            ['Pacing', 'F1: 2s. F2: 4s sky settles, parallax drifts. F3: 25–35s voiced story. F4: lullaby plays once (~12s) as curtain closes. F5: full blackout, holds.'],
            ['Lullaby entry', 'Lullaby starts the moment the kid taps to advance from F3 → F4. Music and visual close in sync; the last note lands as black takes over.'],
            ['Dim curve', 'Brightness 100 → 40 across F3 (over 30s). 40 → 0 across F4 (12s, ease-in-cubic). F5 is true black so OLED phones go dark.'],
            ['Story line', 'Ronki: "Heute hat ein Glühwürmchen mich gefragt, ob ich auch leuchten kann. Ich hab gesagt: noch nicht. Aber bald." (~22s, slow.)'],
            ['No metric', 'No streak, no "you completed bedtime" toast, no log. The kid never sees a number. Parents see the count in the parent surface; the kid never does.'],
          ]} />
        </div>
      </DCArtboard>
      <DCArtboard id="item2-E" label="E · Lagerfeuer-down" width={1320} height={900}>
        <div style={{ padding: 32, background: '#1a1428', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <ItemE />
        </div>
      </DCArtboard>
      <DCArtboard id="item2-F" label="F · Story-page" width={1320} height={900}>
        <div style={{ padding: 32, background: '#1a1428', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <ItemF />
        </div>
      </DCArtboard>
    </DCSection>

    <style>{`
      @keyframes wobble { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
      @keyframes pulse { 0%{transform:translateX(-50%) scale(.7); opacity:.8} 100%{transform:translateX(-50%) scale(1.4); opacity:0} }
      @keyframes breathe { 0%,100%{transform:translateX(-50%) scale(.6); opacity:.4} 50%{transform:translateX(-50%) scale(1); opacity:.9} }
      @keyframes breatheBig { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.06)} }
      @keyframes breathRing { 0%,100%{transform:translateX(-50%) scale(.85); opacity:.4} 50%{transform:translateX(-50%) scale(1.05); opacity:.1} }
    `}</style>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
