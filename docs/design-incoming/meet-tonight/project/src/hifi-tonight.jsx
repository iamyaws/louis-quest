/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================ */
/*  Item D · Tonight — Stargazing                               */
/*  POV: looking up with Ronki from the cave mouth              */
/* ============================================================ */

/* ── Layered starfield with parallax ─────────────── */
function StarField({ phase }) {
  // 3 layers — far/mid/near, each drifts at different speed
  const layers = [
    { count: 60, sizeMin: 0.6, sizeMax: 1.6, opacityBase: 0.4, drift: 80, speed: '120s' }, // far
    { count: 30, sizeMin: 1.2, sizeMax: 2.4, opacityBase: 0.7, drift: 100, speed: '90s' },  // mid
    { count: 12, sizeMin: 2.2, sizeMax: 3.6, opacityBase: 0.95, drift: 130, speed: '60s' }, // near
  ];

  // Star count fades in across phases
  const visible =
    phase === 'enter'   ? 0.2 :
    phase === 'lookup'  ? 1   :
    phase === 'story'   ? 1   :
    phase === 'curtain' ? 1.6 :
    phase === 'black'   ? 0.4 : 0;

  return (
    <>
      {layers.map((L, li) => (
        <div key={li} style={{
          position: 'absolute', inset: 0,
          animation: `starDrift-${li} ${L.speed} linear infinite`,
          opacity: visible,
          transition: 'opacity 1800ms ease',
        }}>
          {[...Array(Math.round(L.count * (phase === 'curtain' ? 1.5 : 1)))].map((_, i) => {
            const seed = (li * 100 + i * 13) % 1000;
            const size = L.sizeMin + (seed % 100) / 100 * (L.sizeMax - L.sizeMin);
            const top = ((seed * 7) % 100);
            const left = ((seed * 11) % 100);
            const op = L.opacityBase * (0.5 + ((seed * 3) % 50) / 100);
            return (
              <div key={i} style={{
                position: 'absolute',
                top: `${top}%`, left: `${left}%`,
                width: size, height: size,
                borderRadius: '50%',
                background: '#fef9e7',
                boxShadow: `0 0 ${size * 3}px rgba(252,211,77,${op * 0.6})`,
                opacity: op,
                animation: `twinkle ${3 + (seed % 4)}s ease-in-out infinite ${(seed % 30) / 10}s`,
              }} />
            );
          })}
        </div>
      ))}
      <style>{`
        @keyframes starDrift-0 { from { transform: translateX(0); } to { transform: translateX(-60px); } }
        @keyframes starDrift-1 { from { transform: translateX(0); } to { transform: translateX(-90px); } }
        @keyframes starDrift-2 { from { transform: translateX(0); } to { transform: translateX(-130px); } }
        @keyframes twinkle {
          0%, 100% { opacity: var(--o, 0.4); transform: scale(1); }
          50% { opacity: var(--o2, 0.95); transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}

/* ── Cave-mouth silhouette (foreground) ──────────── */
function CaveMouth({ phase }) {
  const dim =
    phase === 'enter'   ? 0.85 :
    phase === 'lookup'  ? 1 :
    phase === 'story'   ? 1 :
    phase === 'curtain' ? 1 :
    phase === 'black'   ? 0 : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: dim, transition: 'opacity 2400ms ease' }}>
      <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="caveDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0604"/>
            <stop offset="100%" stopColor="#020202"/>
          </linearGradient>
          <radialGradient id="lantTiny" cx="22%" cy="78%" r="20%">
            <stop offset="0%" stopColor="rgba(252,211,77,.4)"/>
            <stop offset="100%" stopColor="rgba(252,211,77,0)"/>
          </radialGradient>
        </defs>

        {/* faint warm light from inside the cave */}
        <rect width="400" height="700" fill="url(#lantTiny)"/>

        {/* cave-mouth opening — irregular, painterly */}
        <path d="M0 700 L0 480 Q 30 380, 65 320 Q 110 260, 165 235 Q 200 225, 240 232 Q 295 252, 335 305 Q 372 365, 400 460 L400 700 Z"
              fill="url(#caveDark)"/>
        {/* edge highlight, warm */}
        <path d="M0 480 Q 30 380, 65 320 Q 110 260, 165 235 Q 200 225, 240 232 Q 295 252, 335 305 Q 372 365, 400 460"
              fill="none" stroke="rgba(252,211,77,0.15)" strokeWidth="1.5"/>
        {/* texture */}
        <path d="M85 320 Q 90 380, 75 440" stroke="rgba(252,211,77,0.07)" strokeWidth="1" fill="none"/>
        <path d="M310 320 Q 315 380, 325 440" stroke="rgba(252,211,77,0.07)" strokeWidth="1" fill="none"/>

        {/* tiny ember inside (lantern) */}
        <circle cx="88" cy="558" r="2" fill="#fcd34d"/>
        <circle cx="88" cy="558" r="6" fill="#fcd34d" opacity="0.3"/>
      </svg>
    </div>
  );
}

/* ── Two heads from behind, looking up ───────────── */
function HeadsFromBehind({ phase, variant = 'amber' }) {
  const v = (window.EGG_VARIANTS || []).find(e => e.id === variant) || { tint: '#fde68a', deep: '#b45309' };
  const visible = phase !== 'enter' && phase !== 'black';

  return (
    <div style={{
      position: 'absolute', bottom: 110, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', gap: 40,
      opacity: visible ? 1 : 0, transition: 'opacity 1600ms ease',
    }}>
      {/* Kid silhouette */}
      <svg viewBox="0 0 60 64" width="44" height="48" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="kid" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#3a2818"/>
            <stop offset="100%" stopColor="#0a0604"/>
          </radialGradient>
        </defs>
        {/* head */}
        <ellipse cx="30" cy="22" rx="18" ry="20" fill="url(#kid)"/>
        {/* hair tuft */}
        <path d="M14 14 Q 30 6, 46 14 Q 38 18, 30 16 Q 22 18, 14 14 Z" fill="#0a0604"/>
        {/* shoulders */}
        <path d="M5 60 Q 30 38, 55 60 L 55 64 L 5 64 Z" fill="url(#kid)"/>
      </svg>

      {/* Ronki silhouette — tiny, sat next to kid */}
      <svg viewBox="0 0 60 64" width="40" height="48" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="rk" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor={v.tint} stopOpacity="0.7"/>
            <stop offset="60%" stopColor={v.deep} stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#0a0604"/>
          </radialGradient>
        </defs>
        {/* horns */}
        <path d="M16 18 Q 12 8, 18 4" stroke="#0a0604" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M44 18 Q 48 8, 42 4" stroke="#0a0604" strokeWidth="3" strokeLinecap="round" fill="none"/>
        {/* head */}
        <ellipse cx="30" cy="24" rx="16" ry="16" fill="url(#rk)"/>
        {/* body shoulder */}
        <path d="M8 60 Q 30 38, 52 60 L 52 64 L 8 64 Z" fill="url(#rk)"/>
      </svg>
    </div>
  );
}

/* ── Story line (cinematic, big, slow) ───────────── */
function StoryLine({ text, fadeOut }) {
  return (
    <div style={{
      position: 'absolute', top: '12%', left: 28, right: 28,
      animation: fadeOut
        ? 'storyOut 2400ms ease forwards'
        : 'storyIn 2200ms ease forwards',
      pointerEvents: 'none',
      textAlign: 'center',
    }}>
      <div style={{
        font: '700 9px/1 "Plus Jakarta Sans"',
        letterSpacing: '.32em', textTransform: 'uppercase',
        color: 'rgba(252,211,77,.55)',
        marginBottom: 14,
      }}>
        Ronki erzählt
      </div>
      <p style={{
        margin: 0,
        font: '400 18px/1.5 "Nunito"',
        fontStyle: 'italic',
        color: 'rgba(255,242,217,.92)',
        textWrap: 'pretty',
        textShadow: '0 2px 12px rgba(0,0,0,.6)',
      }}>
        {text}
      </p>
      <style>{`
        @keyframes storyIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes storyOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ── Curtain of stars closing ─────────────────── */
function StarCurtain({ active }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      opacity: active ? 1 : 0,
      transition: 'opacity 600ms ease',
    }}>
      {[...Array(120)].map((_, i) => {
        const top = (i * 17) % 100;
        const left = (i * 23) % 100;
        const delay = (i * 60) % 12000; // staggered over 12s
        const size = 1.2 + (i % 4) * 0.6;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: `${top}%`, left: `${left}%`,
            width: size, height: size,
            borderRadius: '50%',
            background: '#fef9e7',
            boxShadow: `0 0 ${size * 4}px rgba(252,211,77,.7)`,
            opacity: 0,
            animation: active ? `curtainStar 12000ms ease-out ${delay}ms forwards` : 'none',
          }} />
        );
      })}
      <style>{`
        @keyframes curtainStar {
          0% { opacity: 0; transform: scale(0); }
          15% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(8); background: #1a0f3a; box-shadow: 0 0 60px #1a0f3a; }
        }
      `}</style>
    </div>
  );
}

/* ── Lullaby waveform indicator ─────────────────── */
function Lullaby({ active }) {
  return (
    <div style={{
      position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4, alignItems: 'center', padding: '8px 16px',
      borderRadius: 999, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(12px)',
      opacity: active ? 1 : 0, transition: 'opacity 800ms ease',
      border: '1px solid rgba(252,211,77,.18)',
    }}>
      <span style={{ font: '700 9px/1 "Plus Jakarta Sans"', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(252,211,77,.7)' }}>
        ♪ Schlaflied
      </span>
      <div style={{ display: 'flex', gap: 2, alignItems: 'center', marginLeft: 6 }}>
        {[5,9,7,11,6].map((h, i) => (
          <div key={i} style={{
            width: 2, height: h, borderRadius: 1,
            background: 'rgba(252,211,77,.6)',
            animation: active ? `lullawave 1.4s ease-in-out ${i * 0.12}s infinite` : 'none',
          }} />
        ))}
      </div>
      <style>{`
        @keyframes lullawave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}

/* ── ITEM D — Tonight ────────────────────────── */
function Tonight({ variant = 'amber', onDone, onReplay }) {
  const [phase, setPhase] = useState('enter'); // enter → lookup → story → curtain → black
  const [tapped, setTapped] = useState(false);

  // Auto-advance
  useEffect(() => {
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('lookup'), 2400);
      return () => clearTimeout(t);
    }
    if (phase === 'lookup') {
      const t = setTimeout(() => setPhase('story'), 4400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const onTap = () => {
    if (phase === 'story' && !tapped) {
      setTapped(true);
      setPhase('curtain');
      setTimeout(() => setPhase('black'), 12000);
    } else if (phase === 'curtain') {
      setPhase('black');
    }
  };

  // Background dimmer — matches the dim curve from the wireframe spec
  const bgDim =
    phase === 'enter'   ? 'linear-gradient(180deg, #1a0f3a 0%, #2a1a3e 60%, #2a1810 100%)' :
    phase === 'lookup'  ? 'linear-gradient(180deg, #0e0a2a 0%, #1a1238 60%, #20140e 100%)' :
    phase === 'story'   ? 'linear-gradient(180deg, #08051f 0%, #0e0a2a 60%, #160d08 100%)' :
    phase === 'curtain' ? 'linear-gradient(180deg, #050316 0%, #08051f 60%, #0a0604 100%)' :
    '#000000';

  return (
    <div onClick={onTap} style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: bgDim, transition: 'background 3400ms ease',
      cursor: phase === 'story' ? 'pointer' : 'default',
    }}>
      <StarField phase={phase} />
      <CaveMouth phase={phase} />
      <HeadsFromBehind phase={phase} variant={variant} />

      {/* Title — 'Heute Abend' */}
      {phase === 'enter' && (
        <div style={{
          position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center',
          animation: 'lineIn 1400ms ease',
        }}>
          <div style={{
            font: '600 32px/1 "Fredoka"',
            color: 'rgba(255,242,217,.95)',
            letterSpacing: '-0.01em',
            textShadow: '0 2px 16px rgba(0,0,0,.6)',
          }}>
            Heute Abend
          </div>
          <div style={{
            marginTop: 14,
            font: '400 13px/1.4 "Nunito"',
            color: 'rgba(255,242,217,.55)',
            fontStyle: 'italic',
          }}>
            wir schauen kurz raus, du und ich
          </div>
        </div>
      )}

      {/* Story line */}
      {phase === 'story' && (
        <StoryLine
          text={'Heute hat ein Glühwürmchen mich gefragt, ob ich auch leuchten kann. Ich hab gesagt: noch nicht. Aber bald.'}
        />
      )}

      {/* Lullaby indicator — under during curtain */}
      <Lullaby active={phase === 'curtain'} />

      {/* Star curtain */}
      <StarCurtain active={phase === 'curtain'} />

      {/* Tap hint during story */}
      {phase === 'story' && !tapped && (
        <div style={{
          position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center',
          font: '600 10px/1 "Plus Jakarta Sans"',
          letterSpacing: '.22em', textTransform: 'uppercase',
          color: 'rgba(255,242,217,.3)',
          animation: 'fadeBlink 3000ms ease-in-out infinite 4000ms backwards',
          pointerEvents: 'none',
        }}>
          tippen wenn du müde bist
        </div>
      )}

      {/* Black screen — minimal, OLED-friendly */}
      {phase === 'black' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 32,
          animation: 'lineIn 2400ms ease 800ms backwards',
        }}>
          <div style={{
            font: '500 12px/1 "Plus Jakarta Sans"',
            letterSpacing: '.32em', textTransform: 'uppercase',
            color: 'rgba(255,242,217,.16)',
          }}>
            schlaf gut
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onReplay?.(); }}
            style={{
              background: 'transparent', border: '1px solid rgba(255,242,217,.1)',
              color: 'rgba(255,242,217,.25)',
              padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
              font: '600 9px/1 "Plus Jakarta Sans"',
              letterSpacing: '.22em', textTransform: 'uppercase',
            }}>
            nochmal ansehen
          </button>
        </div>
      )}

      <style>{`
        @keyframes lineIn { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fadeBlink { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

window.Tonight = Tonight;
