/* global React, IOSDevice */
const { useState, useEffect, useRef } = React;

/* ============================================================ */
/*  Tokens                                                      */
/* ============================================================ */
const T = {
  cream: '#fff8f2',
  ink: '#1e1b17',
  mute: '#6b655b',
  primary: '#124346',
  gold: '#fcd34d',
  goldSoft: '#fde68a',
  goldDeep: '#b45309',
  goldInk: '#725b00',
  warm: '#3a2818',
  paper: '#f9eed8',
  paper2: '#efddb8',
  cave: '#0a0604',
  caveSoft: '#1a1208',
  inkScript: '#7a6a4a',
  inkSoft: '#5a3a20',
  line: 'rgba(18,67,70,.12)',
  line2: 'rgba(18,67,70,.20)',
  fHead: '"Fredoka", system-ui, sans-serif',
  fBody: '"Nunito", system-ui, sans-serif',
  fLabel: '"Plus Jakarta Sans", system-ui, sans-serif',
  fScript: '"Caveat", "Bradley Hand", cursive',
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

const Stage = ({ children, bg = T.cream }) => (
  <div style={{
    position: 'absolute', inset: 0, overflow: 'hidden',
    fontFamily: T.fHead, background: bg,
  }}>{children}</div>
);

/* ============================================================ */
/*  Ronki — small chibi                                          */
/* ============================================================ */
const Ronki = ({ size = 36, mood = 'neutral', breathe = 0, sleep = false, glow = false }) => (
  <div style={{
    width: size, height: size, position: 'relative',
    transform: `translateY(${breathe}px)`,
    transition: 'transform 0.6s ease-in-out',
    filter: glow ? `drop-shadow(0 0 ${size * 0.4}px rgba(252,211,77,.6))` : 'drop-shadow(0 2px 4px rgba(0,0,0,.2))',
  }}>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 45%, #7c2d12 100%)',
      boxShadow: 'inset -3px -4px 8px rgba(60,20,5,.4), inset 2px 2px 4px rgba(255,255,255,.3)',
    }} />
    {/* eyes */}
    {sleep ? (
      <>
        <div style={{
          position: 'absolute', top: '40%', left: '24%', width: size * 0.14, height: 1.5,
          background: '#1a0f08', borderRadius: 1,
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '24%', width: size * 0.14, height: 1.5,
          background: '#1a0f08', borderRadius: 1,
        }} />
      </>
    ) : (
      <>
        <div style={{
          position: 'absolute', top: '36%', left: '24%', width: size * 0.09, height: size * 0.11,
          background: '#1a0f08', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '36%', right: '24%', width: size * 0.09, height: size * 0.11,
          background: '#1a0f08', borderRadius: '50%',
        }} />
      </>
    )}
    {/* mouth */}
    <div style={{
      position: 'absolute', bottom: '24%', left: '50%',
      transform: 'translateX(-50%)',
      width: size * 0.16, height: size * 0.06,
      borderBottom: '1.5px solid #4a1f08',
      borderRadius: '0 0 50% 50%',
    }} />
  </div>
);

/* ============================================================ */
/*  Topbar — date label like the wireframe                      */
/* ============================================================ */
const TopBar = ({ moment = 'früh', date = 'Mittwoch' }) => (
  <div style={{
    position: 'absolute', top: 50, left: 0, right: 0, padding: '0 18px',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
  }}>
    <div>
      <div style={{
        font: `700 9px/1 ${T.fLabel}`, letterSpacing: '.32em',
        textTransform: 'uppercase', color: T.goldDeep, marginBottom: 3,
      }}>Heute mit Ronki</div>
      <div style={{
        font: `600 16px/1.05 ${T.fHead}`, color: T.ink, letterSpacing: '-0.01em',
      }}>{date}, {moment}</div>
    </div>
    {/* day phase indicator */}
    <div style={{
      display: 'flex', gap: 3, paddingBottom: 4,
    }}>
      {['früh', 'Mittag', 'Nachm.', 'Abend'].map((m, i) => {
        const active = m.toLowerCase().startsWith(moment.toLowerCase().slice(0, 3));
        return (
          <div key={i} style={{
            width: 4, height: active ? 14 : 8,
            background: active ? T.goldDeep : 'rgba(180,83,9,.25)',
            borderRadius: 1,
          }} />
        );
      })}
    </div>
  </div>
);

/* ============================================================ */
/*  StripScene — a comic panel                                  */
/*  art: function(t) → JSX so panel art can animate              */
/* ============================================================ */
const StripScene = ({
  bg, art, title, line, state = 'future',
  scale = 1, height = 86, t = 0,
}) => {
  const opacity = state === 'past' ? 0.55 : 1;
  const saturate = state === 'past' ? 0.6 : 1;
  return (
    <div style={{
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 8,
      boxShadow: state === 'now'
        ? '0 6px 14px -4px rgba(180,83,9,.4), inset 0 0 0 1.5px rgba(252,211,77,.5)'
        : '0 2px 6px rgba(0,0,0,.1)',
      opacity, filter: `saturate(${saturate})`,
      transform: `scale(${scale})`,
      transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)',
      transformOrigin: 'top',
    }}>
      <div style={{
        background: bg,
        height,
        display: 'grid', gridTemplateColumns: '64px 1fr',
        gap: 10, padding: '10px 12px',
        position: 'relative',
      }}>
        {/* art frame */}
        <div style={{
          width: 64, height: height - 20,
          borderRadius: 8,
          background: 'rgba(255,255,255,.35)',
          border: '1px solid rgba(0,0,0,.08)',
          position: 'relative', overflow: 'hidden',
          display: 'grid', placeItems: 'center',
        }}>
          {typeof art === 'function' ? art(t) : art}
        </div>
        {/* text */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minWidth: 0,
        }}>
          <div style={{
            font: `600 12.5px/1.2 ${T.fHead}`, color: T.warm,
            letterSpacing: '-0.005em', marginBottom: 3,
          }}>{title}</div>
          {line && (
            <div style={{
              font: `400 10.5px/1.3 ${T.fBody}`, color: T.inkSoft,
              fontStyle: 'italic',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>{line}</div>
          )}
        </div>
        {/* state mark */}
        {state === 'past' && (
          <div style={{
            position: 'absolute', top: 6, right: 8,
            width: 14, height: 14, borderRadius: '50%',
            background: '#86c084', display: 'grid', placeItems: 'center',
          }}>
            <div style={{
              width: 5, height: 7, marginTop: -1, marginLeft: -0.5,
              borderRight: '1.5px solid #fff', borderBottom: '1.5px solid #fff',
              transform: 'rotate(45deg)',
            }} />
          </div>
        )}
        {state === 'now' && (
          <div style={{
            position: 'absolute', top: 6, right: 8,
            font: `700 7px/1 ${T.fLabel}`, letterSpacing: '.18em',
            color: T.goldDeep, textTransform: 'uppercase',
            background: 'rgba(252,211,77,.3)', padding: '3px 5px',
            borderRadius: 3,
          }}>jetzt</div>
        )}
      </div>
    </div>
  );
};

/* ============================================================ */
/*  Section heading inside the strip                            */
/* ============================================================ */
const StripSection = ({ children, color, hint, mt = 14 }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', gap: 8,
    margin: `${mt}px 4px 7px`,
  }}>
    <div style={{
      font: `700 9px/1 ${T.fLabel}`, color, letterSpacing: '.22em',
      textTransform: 'uppercase',
    }}>{children}</div>
    {hint && (
      <div style={{
        font: `400 9px/1 ${T.fScript}`, color: T.inkScript,
      }}>{hint}</div>
    )}
    <div style={{
      flex: 1, height: 1,
      background: 'repeating-linear-gradient(90deg, rgba(184,140,80,.4) 0px, rgba(184,140,80,.4) 3px, transparent 3px, transparent 6px)',
    }} />
  </div>
);

/* ============================================================ */
/*  Painted scene primitives — for the larger A2 / A4 / A6      */
/* ============================================================ */

/* Window scene — A2 zoom */
const WindowScene = ({ t = 0 }) => {
  const sway = Math.sin(t * 0.8) * 1;
  return (
    <>
      {/* floor strip */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 18,
        background: 'repeating-linear-gradient(90deg, #5a3a20 0 6px, #432810 6px 14px)',
      }} />
      {/* sun glow behind window */}
      <div style={{
        position: 'absolute', top: 14, right: 18, width: 96, height: 110,
        borderRadius: '8px 8px 0 0',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(252,235,180,.95) 0%, rgba(252,200,100,.6) 50%, transparent 80%)',
        filter: 'blur(2px)',
      }} />
      {/* window frame */}
      <div style={{
        position: 'absolute', top: 22, right: 26, width: 78, height: 92,
        borderRadius: '6px 6px 0 0',
        background: 'radial-gradient(ellipse at 50% 100%, #ffe8a0 0%, #f5b840 60%, #d97706 100%)',
        border: '4px solid #5a3a20',
        boxShadow: '0 0 30px rgba(252,180,100,.5)',
      }}>
        {/* mullions */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2.5, background: '#5a3a20' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2.5, background: '#5a3a20' }} />
        {/* tiny landscape silhouette */}
        <div style={{
          position: 'absolute', bottom: 6, left: 6, right: 6, height: 8,
          background: 'linear-gradient(180deg, #6a8a5a 0%, #4a6a3a 100%)',
          borderRadius: '40% 60% 0 0 / 100% 100% 0 0',
        }} />
      </div>
      {/* dust motes in light */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${20 + i * 14}%`, right: `${30 + i * 6}%`,
          width: 2, height: 2, borderRadius: '50%',
          background: 'rgba(255,235,180,.7)',
          opacity: 0.4 + 0.5 * Math.sin(t * 2 + i),
          filter: 'blur(0.5px)',
        }} />
      ))}
      {/* Ronki sitting on floor */}
      <div style={{
        position: 'absolute', bottom: 22, left: 36,
        transform: `rotate(${sway}deg)`,
      }}>
        <Ronki size={50} breathe={Math.sin(t) * 1.5} />
      </div>
      {/* tiny shadow under Ronki */}
      <div style={{
        position: 'absolute', bottom: 18, left: 38, width: 46, height: 5,
        background: 'rgba(60,30,10,.35)', borderRadius: '50%', filter: 'blur(2px)',
      }} />
    </>
  );
};

/* Forest path scene — A4 */
const ForestPathScene = ({ t = 0 }) => {
  // Ronki walks deeper — z scales down
  const walk = Math.min(1, t / 4);
  const ronkiSize = 36 - walk * 18; // 36 → 18
  const ronkiBottom = 90 - walk * 30; // 90 → 60
  // step bobs
  const step = Math.sin(t * 4) * 0.8;

  return (
    <>
      {/* sky */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #b8d8c4 0%, #e8e0c4 40%, #fef3c7 80%)',
      }} />
      {/* distant hill */}
      <div style={{
        position: 'absolute', bottom: 110, left: 0, right: 0, height: 46,
        background: 'linear-gradient(180deg, #6a8a5a 0%, #4a6a3a 100%)',
        borderRadius: '50% 60% 0 0 / 100% 100% 0 0',
        opacity: 0.7,
      }} />
      {/* trees — back layer */}
      {[
        { l: 16, w: 22, h: 50, c: '#3a5a2a' },
        { r: 22, w: 26, h: 60, c: '#2a4a1a' },
        { l: 70, w: 18, h: 38, c: '#3a5a2a' },
        { r: 70, w: 22, h: 50, c: '#3a5a2a' },
        { l: 110, w: 14, h: 32, c: '#4a6a3a' },
        { r: 110, w: 16, h: 36, c: '#4a6a3a' },
      ].map((tr, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 100,
          ...(tr.l !== undefined ? { left: tr.l } : { right: tr.r }),
          width: tr.w, height: tr.h,
          background: `radial-gradient(ellipse at 50% 60%, ${tr.c} 0%, ${tr.c}99 80%)`,
          borderRadius: '50% 50% 20% 20%',
          boxShadow: '0 4px 8px rgba(0,0,0,.2)',
        }} />
      ))}
      {/* path */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '90px solid transparent', borderRight: '90px solid transparent',
        borderBottom: '130px solid #d8b878',
        filter: 'drop-shadow(0 -2px 4px rgba(140,90,40,.2))',
      }} />
      {/* path lines / grass tufts */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: 8 + i * 22,
          left: `${50 - (8 - i * 1.2)}%`,
          width: 4 + i * 1.5, height: 2,
          background: '#6a8a5a', borderRadius: 1,
          transform: 'rotate(-8deg)',
        }} />
      ))}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: 8 + i * 22,
          right: `${50 - (8 - i * 1.2)}%`,
          width: 4 + i * 1.5, height: 2,
          background: '#6a8a5a', borderRadius: 1,
          transform: 'rotate(8deg)',
        }} />
      ))}
      {/* Ronki walking away — small */}
      <div style={{
        position: 'absolute',
        bottom: ronkiBottom + step,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <Ronki size={ronkiSize} breathe={step} />
      </div>
      {/* footprints behind Ronki */}
      {[...Array(4)].map((_, i) => {
        const tDelay = walk * 4 - i * 0.5;
        const visible = tDelay > 0;
        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: 70 - i * 14, left: `${50 + (i % 2 === 0 ? -2.5 : 2.5)}%`,
            width: 3, height: 3, borderRadius: '50%',
            background: '#7a5a30', opacity: visible ? 0.5 - i * 0.1 : 0,
            transition: 'opacity 0.4s',
          }} />
        );
      })}
      {/* sun rays */}
      <div style={{
        position: 'absolute', top: 12, right: 24, width: 38, height: 38,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,235,180,.95) 0%, rgba(252,200,100,.4) 50%, transparent 80%)',
        filter: 'blur(1px)',
      }} />
    </>
  );
};

/* Night cave / camp scene — A6 */
const NightSkyScene = ({ t = 0 }) => {
  const stars = Array.from({ length: 24 }, (_, i) => ({
    top: 8 + (i * 13) % 38,
    left: (i * 37) % 100,
    size: 1 + (i % 3) * 0.6,
    twinkle: Math.sin(t * 1.5 + i * 0.8) * 0.4 + 0.5,
  }));
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 70% at 50% 65%, #2d1b4e 0%, #1a0f3a 50%, #0a0a2e 100%)',
      }} />
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'white',
          opacity: s.twinkle,
          boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,.6)`,
        }} />
      ))}
      {/* moon */}
      <div style={{
        position: 'absolute', top: 40, right: 38, width: 30, height: 30,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #fef3c7 0%, #fde68a 60%, #f5d28a 100%)',
        boxShadow: '0 0 20px rgba(254,243,199,.5)',
      }} />
      {/* hill silhouette */}
      <div style={{
        position: 'absolute', bottom: 100, left: 0, right: 0, height: 60,
        background: 'linear-gradient(180deg, #1a0f2e 0%, #0a0820 100%)',
        borderRadius: '60% 40% 0 0 / 100% 100% 0 0',
      }} />
      {/* cave opening glowing */}
      <div style={{
        position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
        width: 80, height: 60,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(252,150,40,.5) 0%, rgba(180,80,20,.3) 50%, transparent 80%)',
        borderRadius: '50% 50% 0 0',
        filter: 'blur(2px)',
      }} />
      {/* Ronki sleeping — glow */}
      <div style={{
        position: 'absolute', bottom: 86, left: '50%', transform: 'translateX(-50%)',
      }}>
        <Ronki size={48} sleep glow breathe={Math.sin(t * 0.8) * 1.2} />
      </div>
      {/* Z's */}
      {[0, 1].map(i => {
        const phase = (t * 0.5 + i * 0.5) % 2;
        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: 130 + phase * 16, left: `${56 + phase * 4}%`,
            font: `400 ${10 - i * 1.5}px/1 ${T.fHead}`, color: '#fef3c7',
            opacity: Math.max(0, 1 - phase * 0.6),
            fontStyle: 'italic',
          }}>z</div>
        );
      })}
    </>
  );
};

/* ============================================================ */
/*  Tiny strip-art primitives                                   */
/* ============================================================ */
const ToothbrushArt = () => (
  <div style={{
    width: 18, height: 36, borderRadius: '4px 4px 2px 2px',
    background: 'linear-gradient(180deg, #7ec0d4 0%, #5a8aa0 100%)',
    position: 'relative',
    boxShadow: 'inset -2px -2px 4px rgba(0,0,0,.15), inset 1px 1px 2px rgba(255,255,255,.3)',
  }}>
    <div style={{
      position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
      width: 12, height: 6, borderRadius: 2,
      background: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 2px)',
    }} />
  </div>
);

const TShirtArt = () => (
  <div style={{
    width: 40, height: 32, position: 'relative',
    background: 'linear-gradient(180deg, #6aa0c0 0%, #4a7a98 100%)',
    borderRadius: '6px 6px 0 0',
    boxShadow: 'inset -2px -3px 6px rgba(0,0,0,.15), inset 1px 1px 2px rgba(255,255,255,.3)',
  }}>
    {/* sleeves */}
    <div style={{
      position: 'absolute', top: 0, left: -6, width: 10, height: 12,
      background: 'linear-gradient(180deg, #6aa0c0 0%, #4a7a98 100%)',
      borderRadius: '4px 0 0 4px',
    }} />
    <div style={{
      position: 'absolute', top: 0, right: -6, width: 10, height: 12,
      background: 'linear-gradient(180deg, #6aa0c0 0%, #4a7a98 100%)',
      borderRadius: '0 4px 4px 0',
    }} />
    {/* collar */}
    <div style={{
      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 14, height: 5, background: '#3a6080', borderRadius: '0 0 7px 7px',
    }} />
  </div>
);

const HomeworkArt = () => (
  <div style={{
    width: 40, height: 28, position: 'relative',
    background: 'linear-gradient(180deg, #f9eed8 0%, #e8d4a8 100%)',
    borderRadius: 2,
    boxShadow: '0 2px 4px rgba(60,40,20,.3), inset -1px -2px 3px rgba(0,0,0,.1)',
    transform: 'rotate(-3deg)',
  }}>
    {/* lines */}
    {[0,1,2,3].map(i => (
      <div key={i} style={{
        position: 'absolute', top: 5 + i * 5, left: 5, right: 5,
        height: 1, background: 'rgba(140,100,40,.3)',
      }} />
    ))}
    {/* pencil */}
    <div style={{
      position: 'absolute', top: -4, right: -8,
      width: 22, height: 4,
      background: 'linear-gradient(90deg, #d97706 0%, #f5a830 80%, #5a3a20 100%)',
      borderRadius: 1,
      transform: 'rotate(-25deg)',
    }} />
  </div>
);

const BookArt = () => (
  <div style={{
    width: 30, height: 36, position: 'relative',
    background: 'linear-gradient(90deg, #a06840 0%, #7a4818 100%)',
    borderRadius: '2px 4px 4px 2px',
    boxShadow: 'inset -2px -2px 5px rgba(0,0,0,.3)',
  }}>
    <div style={{
      position: 'absolute', top: 3, left: 3, right: 3, bottom: 3,
      background: '#f9eed8', borderRadius: 1,
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          position: 'absolute', top: 6 + i * 6, left: 4, right: 4,
          height: 1, background: 'rgba(140,100,40,.5)',
        }} />
      ))}
    </div>
  </div>
);

const PajamaArt = () => (
  <div style={{
    width: 40, height: 32, position: 'relative',
    background: 'linear-gradient(180deg, #b89ac8 0%, #8a6aa0 100%)',
    borderRadius: '6px 6px 0 0',
    boxShadow: 'inset -2px -3px 6px rgba(0,0,0,.2), inset 1px 1px 2px rgba(255,255,255,.3)',
  }}>
    {/* stripes */}
    {[0,1,2].map(i => (
      <div key={i} style={{
        position: 'absolute', top: 6 + i * 7, left: 0, right: 0,
        height: 2, background: 'rgba(254,243,199,.4)',
      }} />
    ))}
    {/* sleeves */}
    <div style={{
      position: 'absolute', top: 0, left: -6, width: 10, height: 14,
      background: '#9a7ab8', borderRadius: '4px 0 0 4px',
    }} />
    <div style={{
      position: 'absolute', top: 0, right: -6, width: 10, height: 14,
      background: '#9a7ab8', borderRadius: '0 4px 4px 0',
    }} />
  </div>
);

const NightlightArt = () => (
  <div style={{
    width: 26, height: 30, position: 'relative',
  }}>
    {/* base */}
    <div style={{
      position: 'absolute', bottom: 0, left: 4, right: 4, height: 8,
      background: 'linear-gradient(180deg, #5a4030 0%, #3a2818 100%)',
      borderRadius: '2px 2px 4px 4px',
    }} />
    {/* shade */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 22,
      background: 'radial-gradient(ellipse at 50% 50%, #fde68a 0%, #f5b840 60%, #d97706 100%)',
      borderRadius: '50% 50% 30% 30%',
      boxShadow: '0 0 20px rgba(252,211,77,.7)',
    }} />
  </div>
);

const SunArt = () => (
  <div style={{ position: 'relative', width: 32, height: 30 }}>
    {/* hill */}
    <div style={{
      position: 'absolute', bottom: 0, left: -4, right: -4, height: 12,
      background: '#3a5a3a', borderRadius: '50% 50% 0 0',
    }} />
    {/* sun */}
    <div style={{
      position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
      width: 16, height: 16, borderRadius: '50%',
      background: 'radial-gradient(circle, #fde68a 0%, #f59e0b 100%)',
      boxShadow: '0 0 10px rgba(252,211,77,.6)',
    }} />
  </div>
);

const PlateArt = () => (
  <div style={{
    width: 36, height: 36, position: 'relative',
    background: 'radial-gradient(circle at 30% 30%, #fff 0%, #f4e8d4 30%, #d4b890 100%)',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(60,40,20,.25), inset -2px -3px 6px rgba(0,0,0,.15)',
  }}>
    {/* food blob */}
    <div style={{
      position: 'absolute', top: 8, left: 8, right: 8, bottom: 10,
      background: 'radial-gradient(circle at 40% 40%, #d97706 0%, #92400e 80%)',
      borderRadius: '50%',
    }} />
  </div>
);

/* ============================================================ */
/*  F1 — Mittwoch früh · alles offen                            */
/*  the strip is full of future scenes                          */
/* ============================================================ */
const A1Screen = ({ playing }) => {
  const t = useTick(playing, 8);
  // gentle scroll cue — strip drifts down 8px and back
  const drift = Math.sin((t / 8) * Math.PI * 2) * 6;

  return (
    <Stage bg={T.cream}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #fef3c7 0%, #fbe9b6 30%, #f9eed8 100%)',
      }} />
      <TopBar moment="früh" date="Mittwoch" />

      <div style={{
        position: 'absolute', top: 100, left: 14, right: 14, bottom: 16,
        overflow: 'hidden',
        transform: `translateY(${-drift * 0.3}px)`,
      }}>
        {/* MORGEN */}
        <StripSection color={T.goldDeep} hint="3 Sachen" mt={0}>Morgen</StripSection>

        <StripScene
          bg="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          art={(tt) => (
            <div style={{ position: 'relative', width: 56, height: 60, display: 'grid', placeItems: 'center' }}>
              <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, height: 5, borderRadius: 2, background: '#3a5a3a' }} />
              <Ronki size={36} breathe={Math.sin(tt) * 1.5} />
              {/* sun ray */}
              <div style={{
                position: 'absolute', top: 4, right: 4, width: 12, height: 12, borderRadius: '50%',
                background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)',
              }} />
            </div>
          )}
          title="Aufstehen mit Ronki"
          line="Er sitzt schon am Fenster und schaut raus."
          state="now"
          t={t}
        />

        <StripScene
          bg="linear-gradient(135deg, #fef3c7 0%, #fbe9b6 100%)"
          art={<ToothbrushArt />}
          title="Zähne putzen"
          line="Ronki schaut zu, ein bisschen neidisch."
          state="future"
        />

        <StripScene
          bg="linear-gradient(135deg, #fef3c7 0%, #fbe9b6 100%)"
          art={<TShirtArt />}
          title="Anziehen"
          line=""
          state="future"
        />

        {/* NACHMITTAG */}
        <StripSection color="#a07840" hint="kommt noch">Nachmittag</StripSection>

        <StripScene
          bg="linear-gradient(135deg, #f4e2c8 0%, #ead09a 100%)"
          art={<HomeworkArt />}
          title="Hausaufgaben"
          line=""
          state="future"
        />

        <StripScene
          bg="linear-gradient(135deg, #f4e2c8 0%, #ead09a 100%)"
          art={<BookArt />}
          title="5 Minuten lesen"
          line=""
          state="future"
        />
      </div>

      {/* scroll hint */}
      <div style={{
        position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center',
        font: `500 8px/1 ${T.fLabel}`, letterSpacing: '.28em', textTransform: 'uppercase',
        color: T.inkScript, opacity: 0.6,
      }}>↓ Abend</div>
    </Stage>
  );
};

/* ============================================================ */
/*  F2 — kid taps · scene zoom-in                               */
/*  full-bleed Aufstehen scene                                  */
/* ============================================================ */
const A2Screen = ({ playing }) => {
  const t = useTick(playing, 8);
  const settle = Math.min(1, t / 0.6);
  // line types in
  const lineLen = Math.min(1, Math.max(0, (t - 1.0) / 1.5));
  const fullLine = '"Schau, das Licht ist heute ein bisschen rosa. Komm, ich bleib hier sitzen."';

  return (
    <Stage bg="#fff8f2">
      {/* faded strip behind, suggesting we just zoomed out of it */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, #fef3c7 0%, rgba(255,248,242,.6) 80%)',
      }} />

      {/* scene */}
      <div style={{
        position: 'absolute',
        top: 60 + (1 - settle) * 30, left: 14 + (1 - settle) * 20, right: 14 + (1 - settle) * 20,
        height: 240 - (1 - settle) * 60,
        borderRadius: 18,
        background: 'linear-gradient(180deg, #fde68a 0%, #fcd34d 60%, #f59e0b 100%)',
        overflow: 'hidden',
        boxShadow: '0 14px 28px -8px rgba(180,83,9,.4)',
        opacity: 0.7 + 0.3 * settle,
        transform: `scale(${0.9 + 0.1 * settle})`,
        transformOrigin: 'top center',
        transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
      }}>
        <WindowScene t={t} />
      </div>

      {/* title */}
      <div style={{
        position: 'absolute', top: 314, left: 22, right: 22,
        opacity: settle,
      }}>
        <div style={{
          font: `700 9px/1 ${T.fLabel}`, letterSpacing: '.22em',
          textTransform: 'uppercase', color: T.goldDeep, marginBottom: 5,
        }}>jetzt · Morgen</div>
        <div style={{
          font: `600 17px/1.1 ${T.fHead}`, color: T.ink, letterSpacing: '-0.01em',
        }}>Aufstehen mit Ronki</div>
      </div>

      {/* voiced line — types in */}
      <div style={{
        position: 'absolute', top: 366, left: 22, right: 22,
        font: `400 12px/1.5 ${T.fBody}`, color: T.inkSoft, fontStyle: 'italic',
      }}>
        <span>
          {fullLine.slice(0, Math.floor(fullLine.length * lineLen))}
          {lineLen < 1 && <span style={{ opacity: 0.5 + 0.5 * Math.sin(t * 6) }}>|</span>}
        </span>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 28, left: 22, right: 22,
        borderRadius: 999,
        background: 'rgba(252,211,77,.22)',
        border: '1.5px solid rgba(252,211,77,.55)',
        padding: '13px 18px', textAlign: 'center',
        font: `600 13px/1 ${T.fHead}`, color: T.warm,
        letterSpacing: '.04em',
        opacity: Math.min(1, Math.max(0, (t - 2.5) / 0.8)),
        transform: `translateY(${(1 - Math.min(1, Math.max(0, (t - 2.5) / 0.8))) * 8}px)`,
      }}>
        gleich gemacht
      </div>
    </Stage>
  );
};

/* ============================================================ */
/*  F3 — Mittag · einiges geteilt                               */
/*  past tasks desaturated, current is now, future is open      */
/* ============================================================ */
const A3Screen = ({ playing }) => {
  const t = useTick(playing, 10);
  // gentle slow scroll up the strip — to show that "Hausaufgaben jetzt" is in view
  const scrollT = (t / 10) * 18;

  return (
    <Stage bg={T.cream}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #faecc8 0%, #f5e0b8 30%, #f4d8a8 100%)',
      }} />
      <TopBar moment="Mittag" date="Mittwoch" />

      <div style={{
        position: 'absolute', top: 100, left: 14, right: 14, bottom: 16,
        overflow: 'hidden',
        transform: `translateY(${-scrollT}px)`,
        transition: 'transform 80ms linear',
      }}>
        <StripSection color="#a07840" hint="vorbei" mt={0}>Morgen</StripSection>

        <StripScene
          bg="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          art={(tt) => (
            <div style={{ position: 'relative', width: 50, height: 50, display: 'grid', placeItems: 'center' }}>
              <Ronki size={32} />
            </div>
          )}
          title="Aufstehen mit Ronki"
          line="Sonne war rosa."
          state="past"
        />

        <StripScene
          bg="linear-gradient(135deg, #fef3c7 0%, #fbe9b6 100%)"
          art={<ToothbrushArt />}
          title="Zähne putzen"
          line=""
          state="past"
        />

        <StripScene
          bg="linear-gradient(135deg, #fef3c7 0%, #fbe9b6 100%)"
          art={<TShirtArt />}
          title="Anziehen"
          line=""
          state="past"
        />

        <StripSection color={T.goldDeep} hint="jetzt">Nachmittag</StripSection>

        <StripScene
          bg="linear-gradient(135deg, #f4e2c8 0%, #ead09a 100%)"
          art={(tt) => (
            <div style={{ position: 'relative', width: 56, height: 56, display: 'grid', placeItems: 'center' }}>
              <HomeworkArt />
              {/* Ronki lying next to it */}
              <div style={{ position: 'absolute', bottom: 0, right: 2 }}>
                <Ronki size={20} sleep breathe={Math.sin(tt * 0.8) * 0.8} />
              </div>
            </div>
          )}
          title="Hausaufgaben"
          line="Er hat sich neben den Tisch gelegt."
          state="now"
          t={t}
        />

        <StripScene
          bg="linear-gradient(135deg, #f4e2c8 0%, #ead09a 100%)"
          art={<BookArt />}
          title="5 Minuten lesen"
          line=""
          state="future"
        />
      </div>
    </Stage>
  );
};

/* ============================================================ */
/*  F4 — Morgen 100% · Ronki bricht auf                         */
/*  full-bleed forest path · he walks deeper                    */
/* ============================================================ */
const A4Screen = ({ playing }) => {
  const t = useTick(playing, 9);

  return (
    <Stage bg="#fef3c7">
      {/* full-bleed scene */}
      <div style={{
        position: 'absolute', top: 50, left: 0, right: 0, height: 380,
        overflow: 'hidden',
      }}>
        <ForestPathScene t={t} />
      </div>

      {/* announcement banner */}
      <div style={{
        position: 'absolute', top: 16, left: 60, right: 60, textAlign: 'center', zIndex: 5,
      }}>
        <div style={{
          background: 'rgba(58,40,24,.85)', backdropFilter: 'blur(8px)',
          borderRadius: 999, padding: '5px 12px',
          font: `700 8px/1 ${T.fLabel}`, letterSpacing: '.32em',
          textTransform: 'uppercase', color: '#fef3c7',
          display: 'inline-block',
        }}>Morgen ist gemacht</div>
      </div>

      {/* speech bubble — appears after a delay */}
      <div style={{
        position: 'absolute', bottom: 130, left: 24, right: 24, textAlign: 'center',
        opacity: Math.min(1, Math.max(0, (t - 2) / 1)),
        transform: `translateY(${(1 - Math.min(1, Math.max(0, (t - 2) / 1))) * 8}px)`,
      }}>
        <div style={{
          font: `500 14px/1.4 ${T.fHead}`, color: T.warm, fontStyle: 'italic',
          background: 'rgba(254,243,199,.85)', backdropFilter: 'blur(6px)',
          borderRadius: 14, padding: '10px 14px',
          boxShadow: '0 6px 14px -4px rgba(140,90,40,.3)',
          border: '1px solid rgba(180,140,80,.3)',
          display: 'inline-block', maxWidth: 260,
        }}>
          "Ich geh mal kurz raus. Bin zum Mittag wieder da."
        </div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 32, left: 22, right: 22,
        borderRadius: 14,
        background: 'linear-gradient(180deg, #5a3a20 0%, #3a2818 100%)',
        padding: '13px 18px', textAlign: 'center',
        font: `600 11px/1 ${T.fLabel}`, letterSpacing: '.22em',
        textTransform: 'uppercase', color: '#fef3c7',
        boxShadow: '0 8px 20px -6px rgba(58,40,24,.4)',
        opacity: Math.min(1, Math.max(0, (t - 3) / 0.8)),
      }}>Reise verfolgen →</div>
    </Stage>
  );
};

/* ============================================================ */
/*  F5 — Abend · alles oberhalb leise                           */
/*  morning grid is small, evening is full strip                */
/* ============================================================ */
const A5Screen = ({ playing }) => {
  const t = useTick(playing, 10);
  const breathe = Math.sin((t / 10) * Math.PI * 2) * 1;

  return (
    <Stage bg="#3a3050">
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #6a5a8a 0%, #4a3a5a 35%, #2a1f3a 100%)',
      }} />
      <TopBar moment="Abend" date="Mittwoch" />

      <div style={{
        position: 'absolute', top: 100, left: 14, right: 14, bottom: 16,
        overflow: 'hidden',
      }}>
        {/* MORGEN — collapsed grid */}
        <StripSection color="#a07840" hint="vorbei" mt={0}>Morgen</StripSection>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
          {[
            { t: 'Aufstehen', art: <Ronki size={20} /> },
            { t: 'Zähne', art: <ToothbrushArt /> },
            { t: 'Anziehen', art: <TShirtArt /> },
          ].map((c, i) => (
            <div key={i} style={{
              borderRadius: 7, padding: '6px 6px 5px',
              background: 'rgba(254,243,199,.85)',
              border: '1px solid rgba(0,0,0,.06)',
              opacity: 0.7, filter: 'saturate(0.7)',
              position: 'relative',
            }}>
              <div style={{
                width: '100%', height: 28, borderRadius: 4,
                background: 'rgba(245,158,11,.18)',
                marginBottom: 4, display: 'grid', placeItems: 'center',
                overflow: 'hidden',
              }}>
                <div style={{ transform: 'scale(0.65)' }}>{c.art}</div>
              </div>
              <div style={{
                font: `600 8px/1 ${T.fLabel}`, color: '#7a6a4a', letterSpacing: '.04em',
              }}>{c.t}</div>
              {/* tiny check */}
              <div style={{
                position: 'absolute', top: 4, right: 4,
                width: 10, height: 10, borderRadius: '50%',
                background: '#86c084', display: 'grid', placeItems: 'center',
              }}>
                <div style={{
                  width: 3, height: 5, marginTop: -1,
                  borderRight: '1.2px solid #fff', borderBottom: '1.2px solid #fff',
                  transform: 'rotate(45deg)',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* NACHMITTAG — collapsed grid */}
        <StripSection color="#a07840" hint="vorbei">Nachmittag</StripSection>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {[
            { t: 'Hausaufgaben', art: <HomeworkArt /> },
            { t: 'Lesen', art: <BookArt /> },
          ].map((c, i) => (
            <div key={i} style={{
              borderRadius: 7, padding: '6px 6px 5px',
              background: 'rgba(244,226,200,.85)',
              border: '1px solid rgba(0,0,0,.06)',
              opacity: 0.7, filter: 'saturate(0.7)',
              position: 'relative',
            }}>
              <div style={{
                width: '100%', height: 28, borderRadius: 4,
                background: 'rgba(245,158,11,.18)',
                marginBottom: 4, display: 'grid', placeItems: 'center',
                overflow: 'hidden',
              }}>
                <div style={{ transform: 'scale(0.65)' }}>{c.art}</div>
              </div>
              <div style={{
                font: `600 8px/1 ${T.fLabel}`, color: '#7a6a4a',
              }}>{c.t}</div>
              <div style={{
                position: 'absolute', top: 4, right: 4,
                width: 10, height: 10, borderRadius: '50%',
                background: '#86c084', display: 'grid', placeItems: 'center',
              }}>
                <div style={{
                  width: 3, height: 5, marginTop: -1,
                  borderRight: '1.2px solid #fff', borderBottom: '1.2px solid #fff',
                  transform: 'rotate(45deg)',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ABEND — full strips, dark */}
        <StripSection color={T.gold} hint="jetzt">Abend</StripSection>

        <div style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 8,
          boxShadow: '0 6px 14px -4px rgba(0,0,0,.4), inset 0 0 0 1.5px rgba(252,211,77,.4)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4a3a6a 0%, #2a1f3a 100%)',
            height: 86, display: 'grid', gridTemplateColumns: '64px 1fr',
            gap: 10, padding: '10px 12px',
            position: 'relative',
          }}>
            <div style={{
              width: 64, height: 66, borderRadius: 8,
              background: 'rgba(50,40,80,.6)', border: '1px solid rgba(252,211,77,.2)',
              display: 'grid', placeItems: 'center',
            }}>
              <div style={{ transform: `translateY(${breathe}px)` }}>
                <Ronki size={36} sleep />
              </div>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{
                font: `600 12.5px/1.2 ${T.fHead}`, color: '#fef3c7',
                marginBottom: 3,
              }}>Pyjama anziehen</div>
              <div style={{
                font: `400 10.5px/1.3 ${T.fBody}`, color: 'rgba(254,243,199,.7)',
                fontStyle: 'italic',
              }}>Er gähnt einmal.</div>
            </div>
            <div style={{
              position: 'absolute', top: 6, right: 8,
              font: `700 7px/1 ${T.fLabel}`, letterSpacing: '.18em',
              color: '#5a3a18', textTransform: 'uppercase',
              background: T.gold, padding: '3px 5px', borderRadius: 3,
            }}>jetzt</div>
          </div>
        </div>

        <div style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 10px rgba(0,0,0,.3)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4a3a6a 0%, #2a1f3a 100%)',
            height: 70, display: 'grid', gridTemplateColumns: '64px 1fr',
            gap: 10, padding: '10px 12px',
          }}>
            <div style={{
              width: 64, height: 50, borderRadius: 8,
              background: 'rgba(50,40,80,.6)',
              display: 'grid', placeItems: 'center',
            }}>
              <NightlightArt />
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{
                font: `600 12.5px/1.2 ${T.fHead}`, color: 'rgba(254,243,199,.85)',
              }}>Zur Ruhe</div>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ============================================================ */
/*  F6 — Schluss · zur Höhle                                    */
/* ============================================================ */
const A6Screen = ({ playing }) => {
  const t = useTick(playing, 10);
  const inA = Math.min(1, t / 0.8);
  const inB = Math.min(1, Math.max(0, (t - 1.0) / 1));
  const inC = Math.min(1, Math.max(0, (t - 2.5) / 1));

  return (
    <Stage bg="#0a0a2e">
      <NightSkyScene t={t} />

      {/* "Ein guter Tag." */}
      <div style={{
        position: 'absolute', top: 110, left: 24, right: 24, textAlign: 'center',
        opacity: inA,
        transform: `translateY(${(1 - inA) * 8}px)`,
      }}>
        <div style={{
          font: `400 9px/1 ${T.fLabel}`, letterSpacing: '.32em',
          textTransform: 'uppercase', color: 'rgba(252,211,77,.65)',
          marginBottom: 8,
        }}>Mittwoch · zu Ende</div>
        <div style={{
          font: `500 18px/1.2 ${T.fHead}`, color: '#fef3c7', letterSpacing: '-0.01em',
        }}>Ein guter Tag.</div>
      </div>

      {/* Ronki line */}
      <div style={{
        position: 'absolute', top: 168, left: 24, right: 24, textAlign: 'center',
        opacity: inB,
        transform: `translateY(${(1 - inB) * 8}px)`,
      }}>
        <div style={{
          font: `400 12.5px/1.5 ${T.fBody}`, color: 'rgba(254,243,199,.75)',
          fontStyle: 'italic',
        }}>"Wir haben heute alles geteilt. Sogar das Brot mit den Krümeln."</div>
      </div>

      {/* CTA */}
      <div style={{
        position: 'absolute', bottom: 32, left: 22, right: 22,
        borderRadius: 999,
        background: 'rgba(252,211,77,.18)',
        border: '1px solid rgba(252,211,77,.42)',
        padding: '12px 18px', textAlign: 'center',
        font: `600 11px/1 ${T.fLabel}`, letterSpacing: '.22em',
        textTransform: 'uppercase', color: '#fde68a',
        opacity: inC,
        transform: `translateY(${(1 - inC) * 8}px)`,
      }}>ins Lager →</div>
    </Stage>
  );
};

/* ============================================================ */
/*  Frame card                                                  */
/* ============================================================ */
const FrameCard = ({ n, title, screen: Screen, dur, sound, narration, beat }) => {
  const [playing, setPlaying] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 322 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          font: `700 11px/1 ${T.fLabel}`, letterSpacing: '.28em',
          color: T.goldDeep, padding: '4px 8px', background: 'rgba(252,211,77,.18)',
          borderRadius: 4,
        }}>A{String(n).padStart(2, '0')}</span>
        <span style={{ font: `600 16px/1.2 ${T.fHead}`, color: T.ink, letterSpacing: '-0.01em' }}>{title}</span>
      </div>
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
          <div style={{ font: `700 9px/1.4 ${T.fLabel}`, letterSpacing: '.18em', color: T.primary, textTransform: 'uppercase' }}>State</div>
          <div>{dur}</div>
          <div style={{ font: `700 9px/1.4 ${T.fLabel}`, letterSpacing: '.18em', color: T.primary, textTransform: 'uppercase' }}>Audio</div>
          <div>{sound}</div>
        </div>
        {narration && (
          <div style={{
            marginTop: 10, padding: '8px 10px',
            background: 'rgba(252,211,77,.14)', border: `1px solid rgba(252,211,77,.4)`,
            borderRadius: 8,
            font: `500 12px/1.4 ${T.fBody}`, color: T.goldInk, fontStyle: 'italic',
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
/*  Header                                                      */
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
/*  Section                                                     */
/* ============================================================ */
const ItemTagA = () => (
  <div>
    <Header
      letter="A"
      code="TAG · GESCHICHTEN-STREIFEN"
      title="Der Tag liest sich wie ein Buch"
      subtitle="Item 1 · Routinen · Aufgabenliste, neu erfunden"
      palette={['#fef3c7', '#fcd34d', '#a07840', '#3a2818', '#2a1f3a']}
      blurb={'Vertikales Scroll durch Ronkis Tag als Comic. Jede Aufgabe ist eine illustrierte Szene mit ihm — kein Häkchen, keine Karte, kein Tile. Antippen öffnet die Szene; Tun = Zusammen-Erleben. Vergangene Szenen werden zart entsättigt, kommende sind weicher. Der Tag liest sich wie ein Buch, das das Kind gerade schreibt.'}
    />
    <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <FrameCard n={1} title="Frühmorgens · alles offen" screen={A1Screen}
        beat="Mittwoch früh. Die Strip ist voll von kommenden Szenen mit Ronki. Aufstehen ist 'jetzt' (warm umrandet). Drei Morgen-Sachen, dann Nachmittag scrollt drunter. Kein Häkchen-Vibe."
        dur="Morgen · 5 Szenen · 0 gemacht"
        sound="Bird outside the window. Soft paper rustle on scroll."
        narration={{ who: 'Bei Aufstehen', text: 'Er sitzt schon am Fenster und schaut raus.' }}
      />
      <FrameCard n={2} title="Szene öffnet · zoom in" screen={A2Screen}
        beat="Kind tippt auf 'Aufstehen'. Die kleine Vorschau wird zum Vollbild — es war ein Ausschnitt der großen Szene. Ronki sitzt im Lichtkegel. Eine voiced Zeile tippt rein. CTA: 'gleich gemacht'."
        dur="Volle Szene · ~600ms zoom"
        sound="Soft 'whoosh' on zoom. Birds louder, then Ronki's voice."
        narration={{ who: 'Ronki · gehört', text: 'Schau, das Licht ist heute ein bisschen rosa. Komm, ich bleib hier sitzen.' }}
      />
      <FrameCard n={3} title="Mittag · einiges geteilt" screen={A3Screen}
        beat="Drei Morgen-Szenen sind 'past' — entsättigt, kleines Häkchen oben rechts, immer noch illustriert (nicht zur Liste kollabiert). Hausaufgaben ist 'jetzt'. Ronki hat sich neben den Tisch gelegt."
        dur="Mittag · 3 von 5 gemacht"
        sound="Quiet midday hum. Pencil scratch under Hausaufgaben."
        narration={{ who: 'Bei Hausaufgaben', text: 'Er hat sich neben den Tisch gelegt.' }}
      />
      <FrameCard n={4} title="Morgen 100% · Ronki bricht auf" screen={A4Screen}
        beat="Wenn ein ganzer Anker (Morgen / Nachmittag / Abend) fertig ist, hijackt die Strip kurz: Vollbild-Pfad in den Wald. Ronki klein, geht weg, hinterlässt Fußspuren. 'Reise verfolgen' linkt zur Expedition. Keine Konfetti."
        dur="Morgen 3/3 · Übergang ~3s"
        sound="Wind picks up. Tiny footsteps. No fanfare."
        narration={{ who: 'Ronki · winkt', text: 'Ich geh mal kurz raus. Bin zum Mittag wieder da.' }}
      />
      <FrameCard n={5} title="Abend · oberhalb leise" screen={A5Screen}
        beat="Spät am Tag. Morgen + Nachmittag sind kollabiert — kleine Tile-Reihe, klein, gehäkelt, entsättigt. Abend ist die einzige offene Strip — dunkel violett. Pyjama ist 'jetzt'. Ronki gähnt schon."
        dur="Abend · 5 von 7 gemacht"
        sound="Cricket bed under. Lamp click."
        narration={{ who: 'Bei Pyjama', text: 'Er gähnt einmal.' }}
      />
      <FrameCard n={6} title="Schluss · zur Höhle" screen={A6Screen}
        beat="Alles geteilt. Nachthimmel mit Sternen, Mond, glühender Höhleneingang. Ronki schläft mit Glow. 'Ein guter Tag.' Ronki-Schlusssatz. CTA 'ins Lager →' (= Begleiter-Tab, Bett-View)."
        dur="alles fertig · Schluss"
        sound="Crickets, distant. Long, quiet."
        narration={{ who: 'Ronki · zum Schluss', text: 'Wir haben heute alles geteilt. Sogar das Brot mit den Krümeln.' }}
      />
    </div>
    {/* Director's notes */}
    <div style={{
      marginTop: 36, padding: '20px 26px',
      background: T.caveSoft, borderRadius: 14, color: '#fef3c7',
      maxWidth: 1100,
    }}>
      <div style={{ font: `700 10px/1 ${T.fLabel}`, letterSpacing: '.28em', textTransform: 'uppercase', color: T.gold, marginBottom: 14 }}>
        Director's notes
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 36px', font: `400 13px/1.55 ${T.fBody}`, color: 'rgba(254,243,199,.85)' }}>
        <div><strong style={{ color: '#fef3c7' }}>The thumbnail IS the scene.</strong> A1's small Aufstehen panel and A2's full-bleed Aufstehen are the same artwork, different crops. Tapping zooms; ~600ms ease-out. The kid sees the small picture was a window into a bigger one — not a navigate-to-detail-page.</div>
        <div><strong style={{ color: '#fef3c7' }}>Past tasks stay illustrated.</strong> They desaturate to ~60% and gain a tiny check in the corner — they don't collapse to a checkmark list. Kid can scroll back and re-read what they did with him today. The scroll is the day.</div>
        <div><strong style={{ color: '#fef3c7' }}>Voiced lines on landing.</strong> Each task has a pool of 3 short observations Ronki makes when the scene opens. They reference the moment, not the action: "Sonne war rosa", "Er gähnt einmal." Never instructional. Pool rotates so it doesn't repeat.</div>
        <div><strong style={{ color: '#fef3c7' }}>The cave-bg matches the day.</strong> Morning strip is gold-cream. Midday is umber. Evening goes deep violet (A5) — the time of day is in the canvas color, not in a clock widget. Same grading as Meet+Tonight.</div>
        <div><strong style={{ color: '#fef3c7' }}>Anchor-complete = soft ritual.</strong> A4 hijacks the strip when an anchor (Morgen/Nachmittag/Abend) finishes — full-bleed forest path, Ronki walks off. Not a confetti burst, not a level-up. A transition. The link to Expedition is gentle.</div>
        <div><strong style={{ color: '#fef3c7' }}>The risk.</strong> A comic strip can feel slow on busy mornings. Mitigation: tap-to-open is optional — the kid can long-press a panel to mark it done without zooming in. Voiced line still plays under the next-action thumbnail. The illustrated experience is the gift, not the toll.</div>
      </div>
    </div>
  </div>
);

/* ============================================================ */
/*  App                                                         */
/* ============================================================ */
const App = () => (
  <div style={{ padding: '40px 36px 80px', maxWidth: 1400, margin: '0 auto', fontFamily: T.fHead, background: T.cream, minHeight: '100vh' }}>
    <div style={{ marginBottom: 32 }}>
      <div style={{
        font: `700 11px/1 ${T.fLabel}`, letterSpacing: '.32em',
        color: T.goldDeep, textTransform: 'uppercase',
      }}>Ronki · Hi-fi · Item 1</div>
      <h1 style={{
        margin: '8px 0 6px', font: `600 44px/1.05 ${T.fHead}`,
        color: T.ink, letterSpacing: '-0.02em',
      }}>Geschichten-Streifen</h1>
      <p style={{
        margin: 0, font: `400 16px/1.5 ${T.fBody}`,
        color: T.mute, maxWidth: 720,
      }}>Vertikales Comic-Scroll durch Ronkis Tag. Antippen öffnet die Szene. Tun = Zusammen-Erleben.</p>
    </div>
    <ItemTagA />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
