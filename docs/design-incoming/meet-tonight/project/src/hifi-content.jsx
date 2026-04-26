/* global React, IOSDevice */
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================ */
/*  Tokens                                                      */
/* ============================================================ */
const T = {
  cream: '#fff8f2',
  ink: '#1e1b17',
  mute: '#6b655b',
  primary: '#124346',
  primary2: '#1f4d51',
  gold: '#fcd34d',
  goldDeep: '#b45309',
  goldInk: '#725b00',
  ember: '#f59e0b',
  warm: '#3a2818',
  line: 'rgba(18,67,70,.12)',
  line2: 'rgba(18,67,70,.20)',
  fHead: '"Fredoka", system-ui, sans-serif',
  fBody: '"Nunito", system-ui, sans-serif',
  fLabel: '"Plus Jakarta Sans", system-ui, sans-serif',
};

/* ============================================================ */
/*  Helpers                                                     */
/* ============================================================ */
const useTick = (running, dur) => {
  const [t, setT] = useState(0);
  const start = useRef(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!running) return;
    start.current = performance.now();
    const loop = (now) => {
      const elapsed = (now - start.current) / 1000;
      setT(elapsed % dur);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running, dur]);
  return t;
};

/* ============================================================ */
/*  Egg — painted illustration in CSS                           */
/* ============================================================ */
const Egg = ({ tint = '#fde68a', size = 56, wobble = 0, glow = false, crack = 0 }) => {
  // wobble: 0..1 strength
  const w = wobble;
  const ang = w ? Math.sin(performance.now() / 140) * 6 * w : 0;
  return (
    <div style={{
      width: size, height: size * 1.28, position: 'relative',
      transform: `rotate(${ang}deg)`,
      transformOrigin: '50% 90%',
      transition: 'transform .12s linear',
      filter: glow ? `drop-shadow(0 0 14px rgba(252,211,77,.7)) drop-shadow(0 6px 14px rgba(0,0,0,.35))` : 'drop-shadow(0 6px 14px rgba(0,0,0,.45))',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50% 50% 48% 48% / 56% 56% 44% 44%',
        background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${tint} 18%, ${tint} 50%, rgba(0,0,0,.32) 110%)`,
        boxShadow: 'inset -5px -8px 16px rgba(0,0,0,.22), inset 4px 4px 8px rgba(255,255,255,.45)',
      }} />
      {/* speckles */}
      {[...Array(8)].map((_, i) => {
        const x = (i * 137) % 80 + 10;
        const y = (i * 91) % 70 + 15;
        return <div key={i} style={{
          position: 'absolute', left: `${x}%`, top: `${y}%`,
          width: 3, height: 3, borderRadius: '50%',
          background: 'rgba(120,72,28,.4)', opacity: .7,
        }} />;
      })}
      {/* highlight */}
      <div style={{
        position: 'absolute', top: '14%', left: '22%', width: '18%', height: '24%',
        background: 'rgba(255,255,255,.7)', borderRadius: '50%', filter: 'blur(2px)',
      }} />
      {/* crack */}
      {crack > 0 && (
        <svg viewBox="0 0 100 128" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M30 50 L42 56 L36 66 L48 70 L42 80 L56 84"
            stroke="rgba(0,0,0,.55)" strokeWidth={1.2 + crack * 1.2} fill="none" strokeLinejoin="round"
            strokeDasharray="200" strokeDashoffset={200 - 200 * crack} />
        </svg>
      )}
    </div>
  );
};

/* ============================================================ */
/*  Ronki chibi — painted in SVG with believable motion         */
/* ============================================================ */
const Ronki = ({ size = 120, asleep = false, wakeT = 1, glowing = false, lookAt = 0 }) => {
  // lookAt: -1..1 (eye direction)
  const breathe = useTick(true, 4);
  const breath = Math.sin((breathe / 4) * Math.PI * 2);
  const scaleY = asleep ? 1 + breath * 0.025 : 1 + breath * 0.018;
  const eyeOpen = wakeT; // 0..1
  const px = lookAt * 1.6;

  return (
    <div style={{
      width: size, height: size, position: 'relative',
      filter: glowing
        ? `drop-shadow(0 0 24px rgba(252,211,77,.55)) drop-shadow(0 8px 18px rgba(0,0,0,.4))`
        : `drop-shadow(0 8px 18px rgba(0,0,0,.4))`,
      transform: `scaleY(${scaleY})`,
      transformOrigin: '50% 100%',
      transition: 'transform 80ms linear',
    }}>
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="bodyGrad" cx="35%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="80%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fbbf24" />
          </radialGradient>
          <radialGradient id="wingGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#9a3412" />
          </radialGradient>
        </defs>

        {/* tail */}
        <path d="M 60 165 Q 30 160 25 130 Q 30 120 38 122"
          stroke="#9a3412" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="25" cy="125" r="9" fill="#fde68a" stroke="#7c2d12" strokeWidth="1.5" />

        {/* back wing */}
        <path d="M 130 95 Q 175 70 165 110 Q 145 105 132 100 Z"
          fill="url(#wingGrad)" opacity=".85" />

        {/* body */}
        <ellipse cx="100" cy="130" rx="55" ry="50" fill="url(#bodyGrad)" />
        {/* belly */}
        <ellipse cx="100" cy="140" rx="32" ry="32" fill="url(#bellyGrad)" opacity=".95" />
        <path d="M 80 122 Q 100 110 120 122" stroke="rgba(146,64,14,.3)" strokeWidth="1" fill="none" />

        {/* legs hint */}
        <ellipse cx="78" cy="172" rx="11" ry="6" fill="#7c2d12" />
        <ellipse cx="122" cy="172" rx="11" ry="6" fill="#7c2d12" />

        {/* head */}
        <ellipse cx="100" cy="78" rx="42" ry="38" fill="url(#bodyGrad)" />

        {/* horns */}
        <path d="M 82 48 Q 78 32 86 30 Q 90 36 88 50 Z" fill="#fde68a" stroke="#7c2d12" strokeWidth="1" />
        <path d="M 118 48 Q 122 32 114 30 Q 110 36 112 50 Z" fill="#fde68a" stroke="#7c2d12" strokeWidth="1" />

        {/* ears */}
        <path d="M 60 60 Q 38 35 42 75 Q 52 72 64 70 Z" fill="url(#wingGrad)" />
        <path d="M 140 60 Q 162 35 158 75 Q 148 72 136 70 Z" fill="url(#wingGrad)" />
        <path d="M 60 60 Q 50 55 48 68 Q 56 66 62 65 Z" fill="#5eead4" opacity=".5" />
        <path d="M 140 60 Q 150 55 152 68 Q 144 66 138 65 Z" fill="#5eead4" opacity=".5" />

        {/* eyes — open/closed via opacity + a closed-line */}
        {/* eye whites */}
        <ellipse cx={84 + px} cy="78" rx="9" ry={9 * eyeOpen} fill="#0a0a14" opacity={eyeOpen} />
        <ellipse cx={116 + px} cy="78" rx="9" ry={9 * eyeOpen} fill="#0a0a14" opacity={eyeOpen} />
        {/* iris highlights */}
        <circle cx={86 + px} cy={75} r={2.5 * eyeOpen} fill="#fff" opacity={eyeOpen} />
        <circle cx={118 + px} cy={75} r={2.5 * eyeOpen} fill="#fff" opacity={eyeOpen} />
        {/* closed eye lines */}
        {eyeOpen < 1 && (
          <>
            <path d={`M 76 79 Q 84 ${79 + (1 - eyeOpen) * 2} 92 79`} stroke="#3a1a08" strokeWidth="2" fill="none" strokeLinecap="round" opacity={1 - eyeOpen} />
            <path d={`M 108 79 Q 116 ${79 + (1 - eyeOpen) * 2} 124 79`} stroke="#3a1a08" strokeWidth="2" fill="none" strokeLinecap="round" opacity={1 - eyeOpen} />
          </>
        )}

        {/* snout / mouth */}
        <ellipse cx="100" cy="92" rx="9" ry="4" fill="#fde68a" />
        <path d="M 95 95 Q 100 98 105 95" stroke="#3a1a08" strokeWidth="1.4" fill="none" strokeLinecap="round" />

        {/* nostrils */}
        <circle cx="97" cy="89" r=".9" fill="#3a1a08" />
        <circle cx="103" cy="89" r=".9" fill="#3a1a08" />

        {/* sleep z */}
        {asleep && (
          <g opacity={0.6 + 0.4 * Math.sin((breathe / 4) * Math.PI * 2)}>
            <text x="135" y="42" fontFamily="Fredoka" fontWeight="700" fontSize="14" fill="rgba(255,255,255,.65)">z</text>
            <text x="148" y="32" fontFamily="Fredoka" fontWeight="700" fontSize="11" fill="rgba(255,255,255,.5)">z</text>
          </g>
        )}
      </svg>
    </div>
  );
};

/* ============================================================ */
/*  Cave background — painterly                                 */
/* ============================================================ */
const CaveBG = ({ warmth = 0.5, lanternOn = true }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#0a0604', overflow: 'hidden' }}>
    {/* far rock */}
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(ellipse 80% 50% at 50% 65%, rgba(${110 + warmth * 80},${55 + warmth * 40},${20 + warmth * 10},.95) 0%, rgba(40,22,12,.6) 55%, rgba(10,6,4,1) 100%),
        radial-gradient(ellipse 30% 25% at 50% 50%, rgba(252,180,80,${.18 * warmth}) 0%, transparent 70%)`,
    }} />
    {/* texture noise via repeating gradients */}
    <div style={{
      position: 'absolute', inset: 0, opacity: .35, mixBlendMode: 'overlay',
      background: `
        repeating-radial-gradient(circle at 20% 30%, rgba(255,200,100,.06) 0px, transparent 4px),
        repeating-radial-gradient(circle at 80% 70%, rgba(60,30,10,.12) 0px, transparent 6px)`,
    }} />
    {/* cave silhouette frame top-left */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 70,
      background: '#080604',
      clipPath: 'polygon(0 0, 100% 0, 100% 60%, 88% 80%, 70% 95%, 50% 100%, 30% 95%, 12% 80%, 0 60%)',
    }} />
    {/* lantern light */}
    {lanternOn && (
      <>
        <div style={{
          position: 'absolute', top: 90, left: 30, width: 60, height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,211,77,.45) 0%, rgba(252,211,77,.15) 40%, transparent 70%)',
          filter: 'blur(2px)',
        }} />
        <div style={{
          position: 'absolute', top: 100, left: 50, width: 18, height: 26,
          background: 'radial-gradient(circle at 50% 35%, #fef3c7 0%, #fbbf24 50%, #b45309 100%)',
          borderRadius: '50% 50% 40% 40%',
          boxShadow: '0 0 18px 4px rgba(252,211,77,.4)',
        }} />
      </>
    )}
    {/* dust particles */}
    {[...Array(12)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: `${(i * 23) % 90}%`, left: `${(i * 41) % 95}%`,
        width: 2, height: 2, borderRadius: '50%',
        background: 'rgba(252,211,77,.3)',
        animation: `drift ${6 + (i % 4)}s ease-in-out ${i * 0.4}s infinite alternate`,
      }} />
    ))}
  </div>
);

/* ============================================================ */
/*  Stage — common viewport for screen contents                 */
/*  Phone inner content area: 402 wide, ~810 tall after status  */
/*  We'll use 390 × 800 inner stage                             */
/* ============================================================ */
const Stage = ({ children }) => (
  <div style={{
    position: 'absolute', inset: 0, overflow: 'hidden',
    fontFamily: T.fHead,
  }}>{children}</div>
);

/* ============================================================ */
/*  ITEM A — Frame screens                                      */
/* ============================================================ */

/* A1 — distant pinprick of light, narration */
const A1Screen = ({ playing = true }) => {
  const t = useTick(playing, 6);
  // 0..6s loop. Push in: pinprick grows from .3 to 1.0 over 4s, then holds.
  const k = Math.min(1, t / 4);
  const ease = k * k * (3 - 2 * k);
  const dotScale = 0.4 + 0.8 * ease;
  const textIn = Math.min(1, Math.max(0, (t - 1.2) / 1.2));

  return (
    <Stage>
      <CaveBG warmth={0.2} lanternOn={false} />
      {/* deep tunnel vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 30% 22% at 50% 55%, transparent 0%, rgba(0,0,0,.7) 80%)',
      }} />
      {/* pinprick of light */}
      <div style={{
        position: 'absolute', top: '52%', left: '50%',
        transform: `translate(-50%,-50%) scale(${dotScale})`,
        width: 22, height: 22, borderRadius: '50%',
        background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 40%, #b45309 90%, transparent 100%)',
        boxShadow: `0 0 ${30 + 40 * ease}px ${10 + 18 * ease}px rgba(252,211,77,${.25 + .35 * ease})`,
      }} />
      {/* narration */}
      <div style={{
        position: 'absolute', bottom: 70, left: 28, right: 28,
        opacity: textIn, transform: `translateY(${(1 - textIn) * 8}px)`,
        transition: 'all .3s',
      }}>
        <div style={{
          font: `400 9px/1 ${T.fLabel}`, letterSpacing: '.22em', textTransform: 'uppercase',
          color: 'rgba(252,211,77,.55)', textAlign: 'center', marginBottom: 8,
        }}>Drachenmutter</div>
        <div style={{
          font: `500 17px/1.45 ${T.fHead}`, color: 'rgba(255,242,217,.92)',
          textAlign: 'center', fontStyle: 'italic',
          textShadow: '0 1px 8px rgba(0,0,0,.6)',
        }}>"Schau. Da hinten. Komm näher."</div>
      </div>
    </Stage>
  );
};

/* A2 — six eggs on a shelf, choose */
const A2Screen = ({ playing = true, onPick }) => {
  const [picked, setPicked] = useState(null);
  const t = useTick(playing, 8);
  const eggs = [
    { tint: '#fde68a', name: 'gold' },
    { tint: '#a7f3d0', name: 'mint' },
    { tint: '#fbcfe8', name: 'rose' },
    { tint: '#c4b5fd', name: 'violet' },
    { tint: '#bbf7d0', name: 'sage' },
    { tint: '#fdba74', name: 'amber' },
  ];
  // gentle prompt pulse after 3s
  const promptPulse = Math.min(1, Math.max(0, (t - 2) / 1));

  return (
    <Stage>
      <CaveBG warmth={0.55} lanternOn={true} />
      {/* stone shelf */}
      <div style={{
        position: 'absolute', top: 290, left: 18, right: 18, height: 12,
        background: 'linear-gradient(180deg, #4a2f18 0%, #2a1810 100%)',
        borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.5), inset 0 -2px 0 rgba(0,0,0,.3)',
      }} />
      {/* eggs */}
      <div style={{
        position: 'absolute', top: 215, left: 0, right: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px 8px',
        padding: '0 28px',
      }}>
        {eggs.map((e, i) => {
          const isPicked = picked === i;
          return (
            <div key={i} onClick={() => { setPicked(i); onPick && onPick(i); }}
              style={{
                display: 'flex', justifyContent: 'center', cursor: 'pointer',
                transform: isPicked ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform .3s',
              }}>
              <Egg tint={e.tint} size={50} wobble={isPicked ? 1 : 0} glow={isPicked} />
            </div>
          );
        })}
      </div>
      {/* prompt */}
      <div style={{
        position: 'absolute', top: 64, left: 28, right: 28, textAlign: 'center',
        opacity: 0.4 + 0.6 * promptPulse,
      }}>
        <div style={{
          font: `400 9px/1 ${T.fLabel}`, letterSpacing: '.24em', textTransform: 'uppercase',
          color: 'rgba(252,211,77,.5)', marginBottom: 10,
        }}>Drachenmutter</div>
        <div style={{
          font: `500 22px/1.3 ${T.fHead}`, color: '#fef3c7',
          textShadow: '0 2px 12px rgba(0,0,0,.7)',
        }}>Welches fühlt sich richtig an?</div>
      </div>
      {/* tiny instruction */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
        font: `500 10px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.45)',
        letterSpacing: '.22em', textTransform: 'uppercase',
        opacity: picked ? 0 : 0.7 + 0.3 * Math.sin((t / 8) * Math.PI * 4),
        transition: 'opacity .4s',
      }}>tipp eins an</div>
    </Stage>
  );
};

/* A3 — wobble, crack */
const A3Screen = ({ playing = true }) => {
  const t = useTick(playing, 5);
  // wobble grows, crack appears at t=2, deeper crack at t=3.5
  const wobbleAmt = Math.min(1, t / 1.5);
  const crackAmt = Math.max(0, Math.min(1, (t - 2) / 2));
  // light bleeds out as crack grows
  const bleed = Math.max(0, Math.min(1, (t - 2.5) / 1.5));
  return (
    <Stage>
      <CaveBG warmth={0.55 + bleed * 0.4} lanternOn={true} />
      {/* light leaking from egg */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(252,211,77,${.5 * bleed}) 0%, rgba(245,158,11,${.25 * bleed}) 40%, transparent 70%)`,
        filter: 'blur(2px)',
      }} />
      {/* the egg */}
      <div style={{
        position: 'absolute', top: 250, left: '50%', transform: 'translateX(-50%)',
      }}>
        <Egg tint="#fde68a" size={104} wobble={wobbleAmt} glow={bleed > 0.2} crack={crackAmt} />
      </div>
      {/* finger ring */}
      <div style={{
        position: 'absolute', top: 360, left: '50%', transform: 'translateX(-50%)',
        width: 70, height: 70, borderRadius: '50%',
        border: `2px solid rgba(252,211,77,${.4 - .3 * Math.min(1, t)})`,
        animation: 'pulseRing 1.4s ease-out infinite',
      }} />
      {/* sound cue — soft caption */}
      <div style={{
        position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center',
        font: `400 13px/1 ${T.fBody}`, color: 'rgba(255,242,217,.55)', fontStyle: 'italic',
        opacity: crackAmt > 0 ? 1 : 0, transition: 'opacity .4s',
        textShadow: '0 1px 6px rgba(0,0,0,.7)',
      }}>… ein Knacken, leise.</div>
    </Stage>
  );
};

/* A4 — hatch, sparks, Ronki appears */
const A4Screen = ({ playing = true }) => {
  const t = useTick(playing, 6);
  // 0–1.2: shell breaks open (white flash)
  // 1.2–3: sparks fly
  // 1.5–6: Ronki appears, glowing
  const flash = t < 1.2 ? Math.max(0, 1 - t / 1.2) : 0;
  const ronkiIn = Math.max(0, Math.min(1, (t - 1.5) / 1.2));
  const sparks = Math.max(0, Math.min(1, (t - 1) / 1));

  return (
    <Stage>
      <CaveBG warmth={0.95} lanternOn={true} />
      {/* burst */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(254,243,199,${.9 * flash}) 0%, rgba(252,211,77,${.5 * flash}) 30%, transparent 70%)`,
      }} />
      {/* big warm glow that persists */}
      <div style={{
        position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,211,77,.35) 0%, rgba(245,158,11,.15) 40%, transparent 70%)',
        opacity: ronkiIn,
      }} />
      {/* sparks */}
      {[...Array(14)].map((_, i) => {
        const ang = (i / 14) * Math.PI * 2;
        const r = 30 + sparks * 90 + (i % 3) * 8;
        return (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(${Math.cos(ang) * r}px, ${Math.sin(ang) * r}px)`,
            width: 4, height: 4, borderRadius: '50%',
            background: '#fef3c7',
            boxShadow: '0 0 8px #fcd34d',
            opacity: sparks * (1 - sparks * 0.6),
          }} />
        );
      })}
      {/* Ronki */}
      <div style={{
        position: 'absolute', top: 230, left: '50%', transform: `translateX(-50%) scale(${ronkiIn})`,
        opacity: ronkiIn,
        transition: 'opacity .3s',
      }}>
        <Ronki size={150} wakeT={ronkiIn} glowing />
      </div>
      {/* shell pieces (small dark crescents at base) */}
      <div style={{
        position: 'absolute', top: 380, left: '50%', transform: 'translateX(-50%)',
        width: 100, height: 14, opacity: ronkiIn,
        background: 'radial-gradient(ellipse, rgba(252,211,77,.3) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center',
        font: `500 17px/1.3 ${T.fHead}`, color: '#fef3c7',
        opacity: ronkiIn,
        textShadow: '0 2px 10px rgba(0,0,0,.6)',
      }}>Er schaut dich an.</div>
    </Stage>
  );
};

/* A5 — first voiced line, name input */
const A5Screen = ({ playing = true }) => {
  const t = useTick(playing, 7);
  // 0–1: speech bubble in
  // 2.5: bubble fades
  // 3.5: name field in
  const bubble = t < 2.8 ? Math.min(1, t / 0.6) : Math.max(0, 1 - (t - 2.8) / 0.6);
  const nameIn = Math.max(0, Math.min(1, (t - 3.2) / 0.6));
  const showCursor = nameIn > 0.5 && (Math.floor(t * 2) % 2 === 0);

  return (
    <Stage>
      <CaveBG warmth={0.7} lanternOn={true} />
      {/* big warm glow */}
      <div style={{
        position: 'absolute', top: 200, left: '50%', transform: 'translate(-50%,-50%)',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,211,77,.4) 0%, rgba(245,158,11,.15) 40%, transparent 70%)',
      }} />
      {/* Ronki */}
      <div style={{
        position: 'absolute', top: 130, left: '50%', transform: 'translateX(-50%)',
      }}>
        <Ronki size={150} wakeT={1} glowing lookAt={0.3} />
      </div>
      {/* speech bubble */}
      <div style={{
        position: 'absolute', top: 320, left: 24, right: 24,
        opacity: bubble, transform: `translateY(${(1 - bubble) * 8}px)`,
        transition: 'all .25s',
      }}>
        <div style={{
          background: 'rgba(254,243,199,.96)', borderRadius: 18,
          padding: '14px 16px',
          boxShadow: '0 8px 24px -8px rgba(0,0,0,.5)',
          position: 'relative',
        }}>
          {/* tail */}
          <div style={{
            position: 'absolute', top: -7, left: '46%',
            width: 14, height: 14, background: 'rgba(254,243,199,.96)',
            transform: 'rotate(45deg)', borderRadius: 2,
          }} />
          <div style={{ font: `400 8px/1 ${T.fLabel}`, letterSpacing: '.22em', textTransform: 'uppercase', color: T.goldDeep, marginBottom: 6 }}>Ronki</div>
          <div style={{ font: `500 15px/1.4 ${T.fBody}`, color: T.warm, fontStyle: 'italic' }}>
            "Hallo. Ich hab auf dich gewartet, glaub ich."
          </div>
        </div>
      </div>
      {/* name prompt + field */}
      <div style={{
        position: 'absolute', top: 320, left: 24, right: 24,
        opacity: nameIn, transform: `translateY(${(1 - nameIn) * 12}px)`,
        transition: 'all .3s',
      }}>
        <div style={{
          font: `500 16px/1.3 ${T.fHead}`, color: '#fef3c7',
          textAlign: 'center', marginBottom: 14,
          textShadow: '0 2px 10px rgba(0,0,0,.6)',
        }}>Wie soll er heißen?</div>
        <div style={{
          background: 'rgba(255,255,255,.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(252,211,77,.35)',
          borderRadius: 16, padding: '14px 18px',
          font: `600 22px/1 ${T.fHead}`, color: '#fef3c7',
          textAlign: 'center', letterSpacing: '.02em',
          minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ opacity: .9 }}>Funki</span>
          <span style={{ opacity: showCursor ? 1 : 0, marginLeft: 2, color: T.gold }}>|</span>
        </div>
        <div style={{
          marginTop: 10, font: `500 9px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.45)',
          letterSpacing: '.22em', textTransform: 'uppercase', textAlign: 'center',
        }}>Mama oder Papa hilft</div>
      </div>
    </Stage>
  );
};

/* A6 — wide cave, "morgen wieder?" */
const A6Screen = ({ playing = true }) => {
  const t = useTick(playing, 6);
  const fadeIn = Math.min(1, t / 1);
  const textIn = Math.min(1, Math.max(0, (t - 1.5) / 1));
  return (
    <Stage>
      <CaveBG warmth={0.4} lanternOn={true} />
      {/* pull-back vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 45% at 50% 60%, transparent 0%, rgba(0,0,0,.6) 100%)',
      }} />
      {/* small Ronki, settled */}
      <div style={{
        position: 'absolute', top: 280, left: '50%', transform: 'translateX(-50%)',
        opacity: fadeIn,
      }}>
        <Ronki size={80} wakeT={1} glowing />
      </div>
      {/* nest hint */}
      <div style={{
        position: 'absolute', top: 365, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 18, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(146,64,14,.6) 0%, transparent 70%)',
      }} />
      {/* texts */}
      <div style={{
        position: 'absolute', bottom: 110, left: 24, right: 24, textAlign: 'center',
        opacity: textIn, transform: `translateY(${(1 - textIn) * 6}px)`, transition: 'all .3s',
      }}>
        <div style={{ font: `500 22px/1.3 ${T.fHead}`, color: '#fef3c7', marginBottom: 18, textShadow: '0 2px 10px rgba(0,0,0,.6)' }}>
          Morgen wieder?
        </div>
        <div style={{ font: `400 13px/1.5 ${T.fBody}`, color: 'rgba(254,243,199,.6)', fontStyle: 'italic', padding: '0 12px' }}>
          Drachenmutter: "Er bleibt hier. Du findest ihn wieder."
        </div>
      </div>
      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 50, left: 60, right: 60,
        opacity: textIn,
      }}>
        <div style={{
          background: 'rgba(252,211,77,.92)',
          borderRadius: 999, padding: '14px 20px',
          font: `600 14px/1 ${T.fHead}`, color: T.warm,
          textAlign: 'center', letterSpacing: '.02em',
          boxShadow: '0 8px 24px -8px rgba(252,211,77,.5)',
        }}>Schlaf gut, Funki</div>
      </div>
    </Stage>
  );
};

/* ============================================================ */
/*  ITEM D — Stargazing                                         */
/* ============================================================ */

const StarField = ({ count = 60, speed = 0, opacity = 1 }) => {
  const stars = useMemo(() => {
    return [...Array(count)].map((_, i) => ({
      x: ((i * 137.5) % 100),
      y: ((i * 89.3) % 60),
      size: 1 + ((i * 7) % 3),
      tw: ((i * 13) % 30) / 10 + 1.5,
      delay: (i * 0.17) % 3,
    }));
  }, [count]);
  return (
    <>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${s.y}%`, left: `${s.x}%`,
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'white',
          opacity: 0.4 * opacity,
          boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,.6)`,
          animation: `tw ${s.tw}s ease-in-out ${s.delay}s infinite alternate`,
        }} />
      ))}
    </>
  );
};

const NightSky = ({ deeper = 0 }) => (
  <div style={{ position: 'absolute', inset: 0,
    background: deeper > 0.5
      ? 'linear-gradient(180deg, #050514 0%, #0a0a2e 100%)'
      : 'linear-gradient(180deg, #0a0a2e 0%, #1a0f3a 60%, #2d1b1f 100%)',
  }} />
);

const CaveSilhouette = ({ height = 220 }) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, height,
    background: '#080604',
    clipPath: 'polygon(0 100%, 0 55%, 8% 30%, 22% 18%, 38% 12%, 50% 10%, 62% 12%, 78% 18%, 92% 30%, 100% 55%, 100% 100%)',
    boxShadow: 'inset 0 8px 30px rgba(252,211,77,.06)',
  }} />
);

/* D1 — cave shifts to night, "Heute Abend" tap */
const D1Screen = ({ playing = true }) => {
  const t = useTick(playing, 5);
  const dimk = Math.min(1, t / 2.5);
  const dotPulse = 0.6 + 0.4 * Math.sin((t / 5) * Math.PI * 4);
  return (
    <Stage>
      <CaveBG warmth={0.6 - dimk * 0.5} lanternOn={true} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(10,10,46,${dimk * .55}) 0%, rgba(26,15,58,${dimk * .35}) 100%)`,
      }} />
      {/* Ronki sleeping in cave */}
      <div style={{
        position: 'absolute', top: 280, left: '50%', transform: 'translateX(-50%)',
      }}>
        <Ronki size={130} asleep wakeT={0} glowing />
      </div>
      {/* moon/lantern hint above */}
      <div style={{
        position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)',
        font: `500 11px/1 ${T.fLabel}`, letterSpacing: '.22em', textTransform: 'uppercase',
        color: 'rgba(252,211,77,.6)',
      }}>Funki schläft fast</div>
      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 90, left: 36, right: 36,
        background: 'rgba(252,211,77,.92)',
        borderRadius: 999, padding: '16px 20px',
        font: `600 16px/1 ${T.fHead}`, color: T.warm,
        textAlign: 'center', letterSpacing: '.01em',
        boxShadow: '0 8px 24px -8px rgba(252,211,77,.5)',
        transform: `scale(${1 - .02 * Math.sin((t / 5) * Math.PI * 4)})`,
      }}>Heute Abend lesen</div>
      <div style={{
        position: 'absolute', bottom: 50, left: 0, right: 0, textAlign: 'center',
        font: `500 10px/1 ${T.fLabel}`, color: 'rgba(254,243,199,.45)',
        letterSpacing: '.22em', textTransform: 'uppercase',
        opacity: dotPulse,
      }}>einmal tippen</div>
    </Stage>
  );
};

/* D2 — POV looking up from cave mouth */
const D2Screen = ({ playing = true }) => {
  const t = useTick(playing, 6);
  const fadeIn = Math.min(1, t / 1.2);
  const camPan = Math.min(1, t / 2);
  return (
    <Stage>
      <NightSky deeper={0} />
      <StarField count={50} opacity={fadeIn} />
      {/* warm horizon glow at the bottom of sky meeting cave */}
      <div style={{
        position: 'absolute', top: '45%', left: 0, right: 0, height: 80,
        background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(252,180,80,.18) 0%, transparent 70%)',
        opacity: fadeIn,
      }} />
      {/* moon */}
      <div style={{
        position: 'absolute', top: 80, left: '60%',
        width: 36, height: 36, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #fff8e1 0%, #fcd34d 60%, #b45309 100%)',
        boxShadow: '0 0 30px rgba(252,211,77,.4)',
        opacity: fadeIn,
        transform: `translateY(${(1 - camPan) * 20}px)`,
      }} />
      <CaveSilhouette height={220} />
      {/* tiny silhouettes — Ronki + child shoulder */}
      <div style={{
        position: 'absolute', bottom: 70, left: '38%',
        opacity: fadeIn, transform: 'scale(.6)',
        transformOrigin: 'bottom',
      }}>
        <Ronki size={70} asleep wakeT={0.15} glowing />
      </div>
      {/* child silhouette as a soft warm hump */}
      <div style={{
        position: 'absolute', bottom: 60, left: '54%',
        width: 64, height: 70, opacity: fadeIn,
        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(120,52,28,.95) 0%, rgba(40,16,8,1) 80%)',
        borderRadius: '50% 50% 30% 30%',
      }} />
      {/* labels */}
      <div style={{
        position: 'absolute', bottom: 38, left: 0, right: 0, textAlign: 'center',
        font: `500 9px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.42)',
        letterSpacing: '.28em', textTransform: 'uppercase',
        opacity: fadeIn,
      }}>du · funki</div>
      {/* hint top */}
      <div style={{
        position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center',
        font: `400 9px/1 ${T.fLabel}`, letterSpacing: '.24em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,.35)',
      }}>er erzählt heute</div>
    </Stage>
  );
};

/* D3 — story plays */
const D3Screen = ({ playing = true }) => {
  const t = useTick(playing, 10);
  // text fades in, waveform animates, stars drift slowly
  const lineIdx = Math.min(2, Math.floor(t / 3));
  const lines = [
    'Heute hat ein Glühwürmchen mich gefragt,',
    'ob ich auch leuchten kann.',
    'Ich hab gesagt: noch nicht. Aber bald.',
  ];
  return (
    <Stage>
      <NightSky deeper={0} />
      <StarField count={60} />
      <CaveSilhouette height={180} />
      {/* small silhouettes */}
      <div style={{
        position: 'absolute', bottom: 30, left: '40%', transform: 'scale(.45)',
      }}>
        <Ronki size={60} wakeT={0.4} glowing />
      </div>
      <div style={{
        position: 'absolute', bottom: 28, left: '54%',
        width: 50, height: 56,
        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(120,52,28,.95) 0%, rgba(40,16,8,1) 80%)',
        borderRadius: '50% 50% 30% 30%',
      }} />
      {/* waveform tag — Ronki speaking */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 3, alignItems: 'flex-end', height: 18,
      }}>
        {[3,7,11,8,4,9,13,6,4].map((h, i) => {
          const phase = Math.sin((t * 5) + i) * 0.5 + 0.5;
          const hh = h * (0.6 + 0.4 * phase);
          return (
            <div key={i} style={{
              width: 2.5, height: hh, borderRadius: 1,
              background: 'rgba(252,211,77,.7)',
            }} />
          );
        })}
        <span style={{
          marginLeft: 10, font: `500 9px/1 ${T.fLabel}`,
          color: 'rgba(255,255,255,.45)', letterSpacing: '.22em', textTransform: 'uppercase',
        }}>Funki erzählt</span>
      </div>
      {/* lines, type-on */}
      <div style={{
        position: 'absolute', top: 130, left: 28, right: 28,
        font: `500 18px/1.5 ${T.fHead}`, color: 'rgba(255,255,255,.92)',
        fontStyle: 'italic', textAlign: 'center',
        textShadow: '0 2px 10px rgba(0,0,0,.6)',
      }}>
        {lines.slice(0, lineIdx + 1).map((l, i) => (
          <div key={i} style={{
            opacity: i === lineIdx ? Math.min(1, (t - i * 3) / 0.5) : 1,
            transform: i === lineIdx ? `translateY(${(1 - Math.min(1, (t - i * 3) / 0.5)) * 4}px)` : 'translateY(0)',
            transition: 'all .3s',
            marginBottom: 6,
          }}>{l}</div>
        ))}
      </div>
      {/* tiny dim button */}
      <div style={{
        position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)',
        padding: '10px 18px', borderRadius: 999,
        background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
        font: `500 11px/1 ${T.fLabel}`, color: 'rgba(255,255,255,.55)',
        letterSpacing: '.18em', textTransform: 'uppercase',
        backdropFilter: 'blur(12px)',
      }}>dunkler · pause</div>
    </Stage>
  );
};

/* D4 — lullaby curtain */
const D4Screen = ({ playing = true }) => {
  const t = useTick(playing, 8);
  const k = Math.min(1, t / 6);
  return (
    <Stage>
      <NightSky deeper={k} />
      <StarField count={70 + Math.floor(k * 50)} opacity={1} />
      {/* cave fades */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
        background: '#080604',
        clipPath: 'polygon(0 100%, 0 55%, 8% 30%, 22% 18%, 38% 12%, 50% 10%, 62% 12%, 78% 18%, 92% 30%, 100% 55%, 100% 100%)',
        opacity: 1 - k * 0.6,
      }} />
      {/* dark veil */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 110% 80% at 50% 50%, transparent 0%, rgba(0,0,0,${k * .85}) 100%)`,
      }} />
      {/* notes */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
        font: `400 18px/1.4 ${T.fHead}`, color: `rgba(255,255,255,${.4 - k * .25})`,
        letterSpacing: '.18em',
      }}>♪ &nbsp; ♪ &nbsp; ♪ &nbsp; ♪</div>
      <div style={{
        position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center',
        font: `400 9px/1 ${T.fLabel}`, color: `rgba(255,255,255,${.3 - k * .25})`,
        letterSpacing: '.28em', textTransform: 'uppercase',
      }}>4 takte · einmal</div>
    </Stage>
  );
};

/* D5 — blackout */
const D5Screen = ({ playing = true }) => {
  const t = useTick(playing, 6);
  const fade = Math.max(0, 1 - t / 2);
  return (
    <Stage>
      <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        transform: 'translateY(-50%)', textAlign: 'center',
        font: `400 10px/1 ${T.fLabel}`, color: `rgba(255,255,255,${.18 * (1 - Math.min(1, t / 4))})`,
        letterSpacing: '.32em', textTransform: 'uppercase',
      }}>gute nacht</div>
      {/* one tiny lingering ember */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 3, height: 3, borderRadius: '50%',
        background: '#fcd34d',
        boxShadow: '0 0 8px rgba(252,211,77,.7)',
        opacity: fade * 0.5,
      }} />
    </Stage>
  );
};

/* ============================================================ */
/*  Frame card — wraps a screen in iPhone + caption             */
/* ============================================================ */
const FrameCard = ({ n, title, screen: Screen, dur, sound, narration, beat }) => {
  const [playing, setPlaying] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 322 }}>
      {/* header strip */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          font: `700 11px/1 ${T.fLabel}`, letterSpacing: '.28em',
          color: T.goldDeep, padding: '4px 8px', background: 'rgba(252,211,77,.18)',
          borderRadius: 4,
        }}>F{String(n).padStart(2, '0')}</span>
        <span style={{ font: `600 16px/1.2 ${T.fHead}`, color: T.ink, letterSpacing: '-0.01em' }}>{title}</span>
      </div>
      {/* device */}
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setPlaying(p => !p)}>
        <IOSDevice width={322} height={700} dark>
          <Screen playing={playing} />
        </IOSDevice>
        {!playing && (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,.3)',
              display: 'grid', placeItems: 'center',
            }}>
              <div style={{
                width: 0, height: 0, marginLeft: 4,
                borderLeft: '14px solid white', borderTop: '10px solid transparent', borderBottom: '10px solid transparent',
              }} />
            </div>
          </div>
        )}
      </div>
      {/* meta */}
      <div style={{
        background: '#fff8f2', borderRadius: 12, padding: '12px 14px',
        border: `1px solid ${T.line}`,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '50px 1fr', rowGap: 6,
          font: `500 11px/1.4 ${T.fLabel}`, color: T.mute,
        }}>
          <div style={{ font: `700 9px/1.4 ${T.fLabel}`, letterSpacing: '.18em', color: T.primary, textTransform: 'uppercase' }}>Beat</div>
          <div>{beat}</div>
          <div style={{ font: `700 9px/1.4 ${T.fLabel}`, letterSpacing: '.18em', color: T.primary, textTransform: 'uppercase' }}>Dauer</div>
          <div>{dur}</div>
          <div style={{ font: `700 9px/1.4 ${T.fLabel}`, letterSpacing: '.18em', color: T.primary, textTransform: 'uppercase' }}>Audio</div>
          <div>{sound}</div>
        </div>
        {narration && (
          <div style={{
            marginTop: 10, padding: '8px 10px',
            background: 'rgba(252,211,77,.14)', border: `1px solid rgba(252,211,77,.4)`,
            borderRadius: 8,
            font: `500 12px/1.4 ${T.fBody}`, color: T.goldInk,
            fontStyle: 'italic',
          }}>
            <span style={{ font: `700 8px/1.4 ${T.fLabel}`, letterSpacing: '.2em', color: T.goldDeep, textTransform: 'uppercase', marginRight: 6, fontStyle: 'normal' }}>{narration.who}</span>
            "{narration.text}"
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================ */
/*  Direction header                                            */
/* ============================================================ */
const Header = ({ letter, code, title, subtitle, blurb, palette }) => (
  <div style={{ marginBottom: 36, maxWidth: 880 }}>
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 18,
      borderBottom: `1px solid ${T.line2}`, paddingBottom: 18, marginBottom: 18,
    }}>
      <div style={{
        font: `700 12px/1 ${T.fLabel}`, letterSpacing: '.32em', color: T.goldDeep,
        background: 'rgba(252,211,77,.18)', padding: '6px 12px', borderRadius: 4,
      }}>{letter} · {code}</div>
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, font: `600 32px/1.1 ${T.fHead}`, color: T.ink, letterSpacing: '-0.02em' }}>{title}</h2>
        <div style={{ marginTop: 6, font: `500 14px/1.3 ${T.fLabel}`, color: T.mute, letterSpacing: '.04em' }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {palette.map((c, i) => (
          <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
        ))}
      </div>
    </div>
    <p style={{ margin: 0, font: `400 16px/1.6 ${T.fBody}`, color: '#3a342d', maxWidth: 720 }}>{blurb}</p>
  </div>
);

/* ============================================================ */
/*  ITEM A · The full assembly                                  */
/* ============================================================ */
const ItemA = () => (
  <div>
    <Header
      letter="A"
      code="MEET"
      title="Eine durchgehende Kameraeinstellung"
      subtitle="Onboarding · ~45 Sekunden · keine Schnitte"
      palette={['#0a0604', '#3a2818', '#b45309', '#fcd34d', '#fef3c7']}
      blurb="Die Kamera kriecht in die Höhle. Lampenlicht. Sechs Eier auf einem Steinregal. Kein Schnitt, keine Szene wechselt — alles passiert in der gleichen Aufnahme. Fühlt sich an wie ein Moment, nicht wie ein Tutorial. Tippe ein Frame an, um Pause zu machen."
    />
    <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <FrameCard n={1} title="Annäherung" screen={A1Screen}
        beat="Slow push toward a pinprick of light. Breath of cave air."
        dur="0:00 → 0:04"
        sound="Drone (sub-50Hz). Distant water drip every 3s."
        narration={{ who: 'Drachenmutter', text: 'Schau. Da hinten. Komm näher.' }}
      />
      <FrameCard n={2} title="Die sechs Eier" screen={A2Screen}
        beat="Stein­regal kommt in Sicht. Sechs Eier, alle anders. Hält offen, bis das Kind tippt."
        dur="0:04 → tap (open)"
        sound="Lantern hum. A faint shimmer when finger hovers over each egg."
        narration={{ who: 'Drachenmutter', text: 'Welches fühlt sich richtig an?' }}
      />
      <FrameCard n={3} title="Auswahl · Wackeln" screen={A3Screen}
        beat="Tap → das gewählte Ei wackelt; ein hauchdünner Riss öffnet sich; warmes Licht beginnt zu pulsen."
        dur="tap → tap+3s"
        sound="Soft tactile click. Tiny shell-crack at +1.5s. Distant heartbeat begins."
        narration={null}
      />
      <FrameCard n={4} title="Schlüpfen" screen={A4Screen}
        beat="Schale platzt auf. Funkenflug. Ronki erscheint, leuchtet, schaut direkt zur Kamera."
        dur="tap+3s → tap+6s"
        sound="Whoosh + pop + held warm chord. Heartbeat lands, then steadies."
        narration={null}
      />
      <FrameCard n={5} title="Erste Stimme · Name" screen={A5Screen}
        beat="Ronki spricht zum ersten Mal. Sprechblase fadet, Namensfeld erscheint im selben Frame."
        dur="tap+6s → tap+15s"
        sound="Ronki voiceline. Gentle string pad underneath."
        narration={{ who: 'Ronki', text: 'Hallo. Ich hab auf dich gewartet, glaub ich.' }}
      />
      <FrameCard n={6} title="Schluss" screen={A6Screen}
        beat={'Kamera zieht leicht zurück. Ronki sitzt im Nest. CTA „Schlaf gut, [Name]".'}
        dur="tap+15s → tap+20s"
        sound="Music drops to single sustained note. Lantern hum returns."
        narration={{ who: 'Drachenmutter', text: 'Er bleibt hier. Du findest ihn wieder.' }}
      />
    </div>
    {/* footer notes */}
    <div style={{
      marginTop: 28, padding: '18px 22px',
      background: '#1c1108', borderRadius: 14, color: '#fef3c7',
      maxWidth: 920,
    }}>
      <div style={{ font: `700 10px/1 ${T.fLabel}`, letterSpacing: '.28em', textTransform: 'uppercase', color: T.gold, marginBottom: 12 }}>
        Director's notes
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 36px', font: `400 13px/1.55 ${T.fBody}`, color: 'rgba(254,243,199,.85)' }}>
        <div><strong style={{ color: '#fef3c7' }}>The promise of "no cuts"</strong> — the camera never jump-cuts to a new place. Push-in is one move, hatch happens in the same shot, name input lives in the same lantern light.</div>
        <div><strong style={{ color: '#fef3c7' }}>The tactile centerpiece</strong> — the egg you tap actually wobbles before it cracks. The choice was real. The kid's finger started this.</div>
        <div><strong style={{ color: '#fef3c7' }}>Voice rationing</strong> — Drachenmutter speaks twice (F1, F6). Ronki speaks exactly once (F5). Anything more weakens his first line.</div>
        <div><strong style={{ color: '#fef3c7' }}>The risk</strong> — sustained dim shot demands a perfect audio mix. If a kid taps two eggs early, the second tap must feel like "yeah, this one." Soft re-pick allowed for ~3s, then committed.</div>
      </div>
    </div>
  </div>
);

/* ============================================================ */
/*  ITEM D · Stargazing assembly                                */
/* ============================================================ */
const ItemD = () => (
  <div>
    <Header
      letter="D"
      code="TONIGHT"
      title="Sterne gucken · Lagerfeuer-Höhle"
      subtitle="Bedtime · ~3 Minuten · curtain-of-stars"
      palette={['#050514', '#0a0a2e', '#1a0f3a', '#2d1b1f', '#fcd34d']}
      blurb="POV vom Höhlenboden nach oben. Das Kind und Ronki schauen zusammen ins Sternenfirmament. Eine kurze, gesprochene Geschichte unter einem langsam treibenden Sternenhimmel — dann ein Lullaby, ein Vorhang aus Sternen, blackout. Die Telefon-Bildschirm-Helligkeit dimmt mit. Tippe ein Frame an für Pause."
    />
    <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <FrameCard n={1} title="Heute Abend" screen={D1Screen}
        beat="Höhle dämmt von warm zu kühl. Funki schläft fast. Einmal tippen."
        dur="0:00 → tap"
        sound="Lantern fades. Cricket layer rises slightly. No music yet."
        narration={null}
      />
      <FrameCard n={2} title="POV · Hochschauen" screen={D2Screen}
        beat="Kamera kippt nach oben. Wir sind plötzlich am Höhleneingang, schauen mit Ronki in den Himmel."
        dur="tap → tap+5s"
        sound="Wind. Soft cello note holds. Cricket layer drops away."
        narration={null}
      />
      <FrameCard n={3} title="Geschichte" screen={D3Screen}
        beat="Ronki erzählt drei kurze Zeilen. Untertitel kommen synchron. Stars driften langsam."
        dur="tap+5s → tap+50s"
        sound="Ronki voiceline (warm, low). String pad continues. Subtle reverb."
        narration={{ who: 'Ronki', text: 'Heute hat ein Glühwürmchen mich gefragt, ob ich auch leuchten kann. Ich hab gesagt: noch nicht. Aber bald.' }}
      />
      <FrameCard n={4} title="Schlaflied" screen={D4Screen}
        beat="Lullaby spielt — vier Takte, einmal. Sternenvorhang schließt, Höhle wird unsichtbar."
        dur="tap+50s → tap+1:35"
        sound="4-bar lullaby (instrumental). Single low drone underneath."
        narration={null}
      />
      <FrameCard n={5} title="Blackout" screen={D5Screen}
        beat={'Letzte Glut verlischt. „Gute Nacht" auf 20% Opacity, dann nichts.'}
        dur="tap+1:35 → tap+2:00"
        sound="Drone fades over 8s. Then silence."
        narration={null}
      />
    </div>
    <div style={{
      marginTop: 28, padding: '18px 22px',
      background: '#0a0a2e', borderRadius: 14, color: '#fef3c7',
      maxWidth: 920,
    }}>
      <div style={{ font: `700 10px/1 ${T.fLabel}`, letterSpacing: '.28em', textTransform: 'uppercase', color: T.gold, marginBottom: 12 }}>
        Director's notes
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 36px', font: `400 13px/1.55 ${T.fBody}`, color: 'rgba(254,243,199,.85)' }}>
        <div><strong style={{ color: '#fef3c7' }}>The screen brightness ramp</strong> — over the full 2 minutes, the screen actually dims (we request iOS brightness lower if user opts in once). Frame brightness drops in lockstep with the room.</div>
        <div><strong style={{ color: '#fef3c7' }}>The POV shift</strong> — F1 → F2 is the only "cut," and it's a tilt, not a jump. The kid recognises the cave from F1, then realises they're inside it now, looking up.</div>
        <div><strong style={{ color: '#fef3c7' }}>Story not lesson</strong> — three lines of Ronki telling about his day. No moral, no nudge. The bedtime ritual is the point; the content is unimportant on purpose.</div>
        <div><strong style={{ color: '#fef3c7' }}>The lullaby contract</strong> — 4 bars, one pass. Never loops. If the parent wants more, they have to choose to. We refuse to autoplay sleep.</div>
      </div>
    </div>
  </div>
);

/* ============================================================ */
/*  Top — page intro                                            */
/* ============================================================ */
const Intro = () => (
  <div style={{ marginBottom: 60, maxWidth: 920 }}>
    <div style={{ font: `700 11px/1 ${T.fLabel}`, letterSpacing: '.32em', textTransform: 'uppercase', color: T.goldDeep, marginBottom: 16 }}>
      Ronki · High-Fidelity · A & D
    </div>
    <h1 style={{ margin: 0, font: `600 56px/1 ${T.fHead}`, color: T.ink, letterSpacing: '-0.03em', marginBottom: 18 }}>
      Ein Schlüpf­moment.<br/>
      Eine gute Nacht.
    </h1>
    <p style={{ margin: 0, font: `400 18px/1.55 ${T.fBody}`, color: '#3a342d', maxWidth: 720 }}>
      Frame-für-Frame in echten iPhone-Mockups, mit Bewegung, Audio-Cues und gesprochenen Zeilen.
      Tippe einen Frame an, um Pause zu machen — oder lass alles laufen, dann liest sich die Seite wie ein Storyboard, das atmet.
    </p>
    <div style={{
      marginTop: 26, padding: '14px 18px',
      background: '#fff8f2', borderRadius: 10, border: `1px solid ${T.line}`,
      font: `500 13px/1.5 ${T.fLabel}`, color: T.mute,
      display: 'flex', gap: 24, flexWrap: 'wrap',
    }}>
      <div><strong style={{ color: T.ink }}>Frames</strong> sind Loops, kein finales Timing.</div>
      <div><strong style={{ color: T.ink }}>Ronki</strong> ist hier als CSS-Chibi gezeichnet — die finale Illustration kommt von Marc.</div>
      <div><strong style={{ color: T.ink }}>Audio</strong> als Note unter jedem Frame, nicht hörbar.</div>
    </div>
  </div>
);

/* ============================================================ */
/*  Page                                                        */
/* ============================================================ */
const Page = () => (
  <div style={{
    minHeight: '100vh', padding: '60px 60px 100px',
    background: 'linear-gradient(180deg, #fdf6e9 0%, #f6e9cf 100%)',
    fontFamily: T.fBody,
  }}>
    <Intro />
    <ItemA />
    <div style={{ height: 80 }} />
    <ItemD />
    {/* keyframes */}
    <style>{`
      @keyframes pulseRing {
        0% { transform: translateX(-50%) scale(.7); opacity: .8; }
        100% { transform: translateX(-50%) scale(1.5); opacity: 0; }
      }
      @keyframes tw {
        0% { opacity: .25; transform: scale(.9); }
        100% { opacity: 1; transform: scale(1.1); }
      }
      @keyframes drift {
        0% { transform: translate(0, 0); opacity: .2; }
        100% { transform: translate(20px, -30px); opacity: .6; }
      }
    `}</style>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<Page />);
