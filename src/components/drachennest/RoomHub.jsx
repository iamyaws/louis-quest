import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { getCatStage } from '../../utils/helpers';
import MoodChibi from '../MoodChibi';
import RonkiVitalsRing from './RonkiVitalsRing';
import CareVerbs from './CareVerbs';
import RonkiSpeechBubble from './RonkiSpeechBubble';
import Expedition from './Expedition';

/**
 * RoomHub — the Drachennest reframe of the Hub. v2 polish 24 Apr 2026.
 *
 * Single primary surface. Ronki sits centered on a square painterly
 * stage with the 3-arc vitals ring around him (Hunger / Liebe / Energie).
 * A speech bubble cycles every ~4s; tapping him spawns a floating heart
 * at the click position. Care verbs (Füttern / Streicheln / Spielen)
 * sit below as standing actions. A wall-scroll preview shows "Ronki's
 * asks today" grouped by anchor and routes into TaskList. A 4-tile
 * object row (Truhe / Buch / Spielzeug / Karte) makes the rest of the
 * app reachable. The Karte tile lights gold once morning + bedtime
 * routines are done — Ronki's ready for an expedition.
 *
 * Design lineage:
 * - Drachennest direction (room as primary surface, no tab metaphor)
 * - Begleiter Polish (3-arc vitals ring, care verbs, speech bubble)
 * - Laden Polish (square painterly stage, Ronki-sit-bob animation,
 *   warm sand/wood backdrop with inset depth shadows)
 *
 * Drives state.ronkiVitals via actions.careForRonki + the complete()
 * reducer's anchor-routed vital top-up. Existing NavBar stays visible.
 */

// Anchor pill colors mirror the vitals palette so each routine block
// reads as "this fills X meter." Bedtime flipped from emerald to
// sky-blue (Marc 25 Apr 2026) so the Abends pill no longer clashes
// with a green Ronki variant. The success-fertig state keeps a
// separate success-green so finished anchors still read as
// completed without loss-aversion ambiguity.
const ANCHOR_TO_VITAL = {
  morning: { vital: 'hunger',  color: '#f59e0b', label: 'Morgens' },
  evening: { vital: 'liebe',   color: '#ec4899', label: 'Nachmittag' },
  hobby:   { vital: 'liebe',   color: '#ec4899', label: 'Hobby' },
  bedtime: { vital: 'energie', color: '#3b82f6', label: 'Abends' },
};

export default function RoomHub({ onNavigate }) {
  const { state, actions } = useTask();
  const { t, lang } = useTranslation();
  // Drachennest reframe: the "Karte" tile + window in the back of the
  // room both open the Expedition surface (Reise / Naturtagebuch).
  // Earlier prototypes routed to GardenMode as a placeholder; that's
  // gone now that the real expedition state machine is wired up.
  const [showExpedition, setShowExpedition] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const variant = state?.companionVariant || 'forest';
  const stageIdx = getCatStage(state?.catEvo ?? 0);
  const mood = state?.ronkiMood || 'normal';
  const vitals = state?.ronkiVitals || { hunger: 70, liebe: 70, energie: 70 };
  const wellbeing = Math.round((vitals.hunger + vitals.liebe + vitals.energie) / 3);
  // Kid-readable status (Marc 25 Apr — "kids don't get percentage").
  // Three filled hearts visible at a glance, plus a single short
  // word so the kid who can already read gets the same signal in
  // language. Bands stay generous so a little dip doesn't drop
  // Ronki into "needs you" territory.
  const heartsFilled = wellbeing >= 80 ? 3 : wellbeing >= 50 ? 2 : 1;
  const wellLabel = wellbeing >= 80 ? 'Glücklich'
                  : wellbeing >= 50 ? 'Okay'
                  : 'Braucht dich';
  const heroName = state?.familyConfig?.childName || state?.heroName || 'du';

  // Ronki is sized off the stage's measured width so the chibi + vitals
  // ring scale together as the viewport changes. useLayoutEffect keeps
  // the size in sync with mount/resize before paint to avoid the "Ronki
  // pops in" flicker the earlier inset-based layout had.
  const stageRef = useRef(null);
  const [stagePx, setStagePx] = useState(240);
  useLayoutEffect(() => {
    if (!stageRef.current) return;
    const measure = () => {
      if (stageRef.current) setStagePx(stageRef.current.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);
  // 68% of the stage leaves a generous gap between Ronki and the arcs
  // (Marc 25 Apr 2026 — "more room to breathe"). Earlier 82% had the
  // arcs hugging the chibi too tight, especially with mood particles
  // or the speech bubble's tail running near them. Pulling the chibi
  // inward + growing the stage container gives the ring room to
  // visibly *frame* Ronki rather than crowding him.
  const ronkiPx = Math.floor(stagePx * 0.68);

  const quests = state?.quests || [];
  const undoneByAnchor = ['morning', 'evening', 'bedtime'].map(anchor => {
    const items = quests.filter(q => q.anchor === anchor && !q.done);
    return { anchor, label: ANCHOR_TO_VITAL[anchor].label, color: ANCHOR_TO_VITAL[anchor].color, count: items.length };
  });
  const morningDone = quests.filter(q => q.anchor === 'morning').every(q => q.done) && quests.some(q => q.anchor === 'morning');
  const bedtimeDone = quests.filter(q => q.anchor === 'bedtime').every(q => q.done) && quests.some(q => q.anchor === 'bedtime');
  const expeditionUnlocked = morningDone && bedtimeDone;

  const tapRonki = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFloatingHearts(prev => [...prev, { id, x, y }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 950);
  };

  // ?time=dawn|day|dusk|night forces the scene tone for QA preview; otherwise
  // the clock decides. DEV-gated so prod builds ignore the override.
  const urlTime = (() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search).get('time');
    return ['dawn', 'day', 'dusk', 'night'].includes(p) ? p : null;
  })();
  const time = urlTime || pickTimeOfDay();
  const sceneTone = SCENE_TONES[time];

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #f9eed8 0%, #f5e3c1 60%, #e9d4a8 100%)',
        paddingBottom: 110,
        overflow: 'hidden',
        fontFamily: '"Nunito", sans-serif',
      }}
    >
      {/* Soft warm wash — earlier passes used a 135° hatching pattern
          that read as harsh diagonal lines on every card behind. Marc
          flagged it 25 Apr 2026 ("the vertical small lines as a
          pattern across all cards etc. needs fixing"). Replaced with
          two big radial sun-spills only — keeps the warmth without
          the line texture. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(900px 500px at 30% -10%, rgba(252,211,77,0.22) 0%, transparent 60%), ' +
            'radial-gradient(700px 600px at 100% 110%, rgba(180,83,9,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top status strip */}
      <header
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 8px',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#b45309', marginBottom: 5,
          }}>
            Ronkis Zimmer
          </div>
          <div style={{
            font: '500 22px/1.05 "Fredoka", sans-serif', color: '#124346',
            letterSpacing: '-0.01em',
          }}>
            Hallo {heroName}!
          </div>
        </div>
        {/* Kid-readable wellbeing chip (Marc 25 Apr — "kids don't get
            percentage"). Three hearts you can count at a glance, plus
            a single word for kids who can already read. */}
        <div
          aria-label={`Ronki ist ${wellLabel.toLowerCase()}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 12px 7px 10px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(180,83,9,0.18)',
            color: '#124346',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          <span style={{ display: 'flex', gap: 2, fontSize: 14, lineHeight: 1 }}>
            {[0, 1, 2].map(i => (
              <span key={i} aria-hidden="true" style={{
                color: i < heartsFilled ? '#ec4899' : 'rgba(18,67,70,0.20)',
                textShadow: i < heartsFilled ? '0 1px 2px rgba(236,72,153,0.30)' : 'none',
              }}>♥</span>
            ))}
          </span>
          <span style={{
            font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.04em',
          }}>
            {wellLabel}
          </span>
        </div>
      </header>

      {/* The cozy Drachennest interior (25 Apr 2026 redesign).
          Earlier passes treated this as an outdoor meadow — green hills,
          green Ronki, green energie meter, the whole frame collapsed
          into one biome of green. Marc flagged it: "it's supposed to
          be a Drachennest." So the scene is now a warm cave hollow
          with a pebble-and-moss nest where Ronki sits, a small back
          window (the *only* element that still shows the time of day),
          and a string of warm lights overhead. The cave itself stays
          a constant amber/sandstone regardless of the clock — the
          interior is the home, not the weather. */}
      <section style={{ padding: '14px 18px 0', position: 'relative', zIndex: 3 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 26,
            overflow: 'hidden',
            // Warm sandstone interior — radial gradient so the top
            // catches the most light (lantern + window) and the
            // edges deepen into rock.
            background:
              'radial-gradient(ellipse 110% 80% at 50% -10%, #fef3c7 0%, #fde68a 30%, #fbbf24 65%, #b45309 100%)',
            boxShadow:
              '0 18px 36px -14px rgba(40, 20, 8, 0.40), ' +
              'inset 0 4px 0 rgba(255,255,255,0.35), ' +
              'inset 0 -10px 28px rgba(78, 42, 20, 0.45), ' +
              'inset 0 0 0 4px rgba(180,83,9,0.18)',
          }}
        >
          {/* Cave-mouth shadow at the top — pulls the eye toward the
              centre and gives the impression we're peering INTO a
              hollow rather than at a flat wall. */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '24%',
            background: 'radial-gradient(ellipse at 50% 0%, transparent 0%, transparent 38%, rgba(78,42,20,0.30) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* Hanging string lights — five warm cream beads on a thin
              cord, gently sagging. Reads as "kid put fairy lights up
              in the nest." */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '8%', left: '8%', right: '8%', height: 26,
            pointerEvents: 'none',
            zIndex: 2,
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 22" preserveAspectRatio="none">
              <path d="M 0 4 Q 50 22 100 4" fill="none" stroke="rgba(78,42,20,0.45)" strokeWidth="0.6" />
            </svg>
            {[10, 30, 50, 70, 90].map((x, i) => {
              // Beads sag along the cord roughly with sin curvature.
              const y = 4 + Math.sin((x / 100) * Math.PI) * 18;
              return (
                <span key={i} style={{
                  position: 'absolute',
                  left: `calc(${x}% - 5px)`,
                  top: `calc(${(y / 22) * 100}% - 5px)`,
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #fef9d7, #fbbf24)',
                  boxShadow: '0 0 12px 2px rgba(252,211,77,0.55), 0 0 22px 6px rgba(252,165,73,0.25)',
                  animation: `rh-bead ${3 + i * 0.4}s ease-in-out infinite ${i * 0.2}s`,
                }} />
              );
            })}
          </div>

          {/* Back window — the cave's view to the outside world. Small,
              centred behind Ronki on the back wall. The sky behind the
              glass is the *only* element that still tracks time of
              day; the cave itself stays warm. Doubles as the second
              portal to the Reise surface (Marc 25 Apr — "by clicking
              on the window in the back you get to the garden"). */}
          <button
            type="button"
            onClick={() => setShowExpedition(true)}
            aria-label="Aus dem Fenster schauen"
            className="active:scale-[0.96] transition-transform"
            style={{
              position: 'absolute',
              top: '17%',
              right: '8%',
              // Window grew from 64×76 → 100×120 (Marc 25 Apr — felt
              // too small to read as "look out at the world"). At this
              // size the sash cross + celestial body have room to
              // breathe and the kid registers it as a real frame on
              // the back wall, not a porthole.
              width: 100, height: 120,
              background: sceneTone.sky,
              // Wood-look frame to match the nest interior — deep brown
              // with a soft inner highlight.
              border: '5px solid #5c2a08',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow:
                '0 6px 16px -4px rgba(40,20,5,0.50), ' +
                'inset 0 0 0 1px rgba(254,243,199,0.5), ' +
                'inset 0 0 22px rgba(252,211,77,0.30)',
              padding: 0,
              cursor: 'pointer',
              zIndex: 3,
            }}
          >
            {/* Sash cross */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: '#5c2a08', transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: '#5c2a08', transform: 'translateY(-50%)' }} />
            </div>
            {/* Sun or moon — sized up + nudged to the upper-left
                quadrant so it reads as "the sun's still up out there"
                instead of "small dot in the corner." */}
            <div style={{
              position: 'absolute', top: 14, left: 14,
              width: 22, height: 22, borderRadius: '50%',
              background: sceneTone.celestial,
              boxShadow: `0 0 18px ${sceneTone.celestial}`,
              pointerEvents: 'none',
            }} />
            {time === 'night' && (
              <>
                <div style={{ position: 'absolute', top: 36, right: 18, width: 2, height: 2, borderRadius: '50%', background: '#fef3c7', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 60, right: 30, width: 2, height: 2, borderRadius: '50%', background: '#fef3c7', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 86, right: 14, width: 2, height: 2, borderRadius: '50%', background: '#fef3c7', pointerEvents: 'none' }} />
              </>
            )}
          </button>

          {/* Stone shelf with a few collected curiosities — tiny
              callout to the Naturtagebuch. Hand-placed left of the
              window, on the back wall. */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '38%', left: '10%',
            width: 64, height: 8,
            background: 'linear-gradient(180deg, #92400e 0%, #5c2a08 100%)',
            borderRadius: '3px 3px 6px 6px',
            boxShadow: '0 3px 6px rgba(40,20,5,0.35), inset 0 1px 0 rgba(254,243,199,0.25)',
            zIndex: 2,
          }}>
            <span style={{ position: 'absolute', left: 4, top: -16, fontSize: 14 }}>🍂</span>
            <span style={{ position: 'absolute', left: 22, top: -14, fontSize: 12 }}>🪶</span>
            <span style={{ position: 'absolute', left: 40, top: -12, fontSize: 10 }}>🪨</span>
          </div>

          {/* Floor mat / nest bedding — Marc 25 Apr flagged the previous
              "puffy cushion" version was too tall and ate into Ronki +
              the bottom energie arc. Pulled to a thin cream rim along
              the floor with a slim terracotta runner on top, so the
              kid reads it as "Ronki sits on a soft mat" rather than
              "Ronki sits on a giant pillow." Leaves are tucked along
              the very bottom edge.

              The mat sits at z-index 5 — between the stage (z:3) and
              the chibi button (which gets bumped to z:7 below). That
              ordering hides the ring's bottom curve behind the mat
              while keeping Ronki himself fully visible (Marc's "let
              the vital-ring overlap the cushion on the floor"). */}
          <div aria-hidden="true" style={{
            position: 'absolute', left: '-4%', right: '-4%', bottom: '-2%', height: '14%',
            background: 'radial-gradient(ellipse at 50% 0%, #fef3c7 0%, #fde68a 50%, #d97706 100%)',
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            boxShadow: 'inset 0 -6px 14px rgba(120,53,15,0.35), inset 0 3px 0 rgba(255,255,255,0.40)',
            zIndex: 5,
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', left: '14%', right: '14%', bottom: '0%', height: '7%',
            background: 'radial-gradient(ellipse at 50% 0%, #fdba74 0%, #c2410c 100%)',
            borderRadius: '50% 50% 0 0 / 90% 90% 0 0',
            boxShadow: 'inset 0 -4px 10px rgba(67,20,7,0.40), inset 0 2px 0 rgba(255,255,255,0.25)',
            zIndex: 5,
          }} />
          {/* Scattered leaves on the floor mat */}
          <span aria-hidden="true" style={{ position: 'absolute', bottom: '2%', left: '12%', fontSize: 14, transform: 'rotate(-18deg)', zIndex: 6 }}>🍂</span>
          <span aria-hidden="true" style={{ position: 'absolute', bottom: '1.5%', right: '14%', fontSize: 13, transform: 'rotate(24deg)', zIndex: 6 }}>🍁</span>

          {/* Ronki + vitals stage — ring wraps chibi at matched size so
              the arcs clearly belong to him (v2 had them floating too far).
              The stage sits a little below center, anchored on the ground. */}
          <div
            ref={stageRef}
            className="rh-ronki-stage"
            style={{
              position: 'absolute',
              left: '50%',
              // Stage drops well below the scene's floor edge so the
              // bottom of the vitals ring tucks behind the cushion
              // mat (Marc 25 Apr — "let ronki and the ring fly a
              // little lower and let the vital-ring overlap the
              // cushion on the floor"). The stage has NO z-index here
              // on purpose: that lets the chibi button's z (bumped to
              // 7 below) lift to scene level so Ronki paints above the
              // cushion (z:5), while the ring wrapper (default z)
              // stays behind the cushion. Without that flat-context
              // trick, the cushion would either cover the whole stage
              // (Ronki and all) or miss the ring entirely.
              bottom: '-9%',
              transform: 'translateX(-50%)',
              // Stage grew from 72% / 280px → 84% / 340px (25 Apr 2026)
              // so the vitals arcs read as a generous halo around
              // Ronki rather than a tight collar. Combined with the
              // chibi pulling in to 68% (was 82%) below, this gives a
              // visible ~16% breathing band between body and arc.
              width: '84%',
              maxWidth: 340,
              aspectRatio: '1 / 1',
              animation: 'rh-sit 5s ease-in-out infinite',
            }}
          >
            {/* Vitals ring sits in its own slightly-shrunk + lowered
                wrapper (Marc 25 Apr — "metrics circle just a tiny bit
                smaller and lower, ronki stays in position"). Wrapper
                is 92% of stage width and centred ~6% below the
                stage's geometric centre so the ring frames Ronki's
                lower body / nest area instead of his head halo. */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '56%',
              transform: 'translate(-50%, -50%)',
              width: Math.floor(stagePx * 0.92),
              height: Math.floor(stagePx * 0.92),
              pointerEvents: 'none',
              // Ring sits ABOVE the cushion (z:5) so the lower arc
              // visibly overlaps the mat instead of disappearing
              // behind it (Marc 25 Apr 2026: "vital-metric ring needs
              // to overlap cushion on the floor to be seen clearly").
              // Ronki himself stays at z:7 above the ring so the
              // chibi paints in front of all of it.
              zIndex: 6,
            }}>
              <RonkiVitalsRing needs={vitals} size={Math.floor(stagePx * 0.92)} />
            </div>
            {/* Ronki centered inside the ring — sized to ~82% of stage so
                the arcs form a visible halo around him rather than a
                distant frame. */}
            <button
              type="button"
              onClick={tapRonki}
              aria-label="Ronki streicheln"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                // Lifted from 3 → 7 so the chibi paints above the
                // cushion mat (z:5) even when the stage drops low
                // enough that Ronki's feet enter the mat's bounds.
                // The ring wrapper next door keeps its default z so
                // the lower arc disappears behind the cushion edge.
                zIndex: 7,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {/* The chibi is bottom-anchored inside MoodChibi (bottom: 5%
                  in bare mode), so a 1:1 wrapper centred in the stage puts
                  Ronki at the lower half of the ring. Translating the
                  whole wrapper up by ~12% pulls his vertical center toward
                  the stage centroid, where the three vital meters average
                  out — closer to the ring's middle so all three badges
                  read as orbiting him rather than floating above. */}
              <div style={{
                position: 'relative',
                width: ronkiPx,
                height: ronkiPx,
                transform: 'translateY(-9%)',
              }}>
                <MoodChibi
                  size={ronkiPx}
                  variant={variant}
                  stage={stageIdx}
                  mood={mood}
                  bare
                />
                {floatingHearts.map(h => (
                  <span
                    key={h.id}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: h.x,
                      top: h.y,
                      pointerEvents: 'none',
                      font: '600 32px/1 sans-serif',
                      animation: 'rh-heart 0.95s ease-out forwards',
                      zIndex: 12,
                    }}
                  >
                    💚
                  </span>
                ))}
              </div>
            </button>
            {/* Soft ground shadow */}
            <div aria-hidden="true" style={{
              position: 'absolute',
              left: '50%',
              bottom: '2%',
              transform: 'translateX(-50%)',
              width: '50%',
              height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(40,20,5,0.30), transparent 70%)',
              filter: 'blur(3px)',
              zIndex: 1,
            }} />
          </div>

          {/* Speech bubble lives as a sibling of rh-ronki-stage so it
              sits in the empty band above the ring rather than
              overlapping the top arc icon (Marc 25 Apr 2026). It also
              stays still while the stage's sit-bob animation plays.
              Tap to dismiss is wired inside the component itself. */}
          <RonkiSpeechBubble />

          {/* Floating sparkles for atmosphere */}
          <span aria-hidden="true" style={{ position: 'absolute', top: '18%', left: '14%', fontSize: 14, color: 'rgba(254,243,199,0.7)', animation: 'rh-spark1 6s ease-in-out infinite' }}>✦</span>
          <span aria-hidden="true" style={{ position: 'absolute', top: '32%', left: '24%', fontSize: 10, color: 'rgba(254,243,199,0.5)', animation: 'rh-spark2 7s ease-in-out infinite' }}>✦</span>
          <span aria-hidden="true" style={{ position: 'absolute', top: '22%', right: '24%', fontSize: 12, color: 'rgba(254,243,199,0.6)', animation: 'rh-spark3 8s ease-in-out infinite' }}>✧</span>
        </div>
      </section>

      {/* Stimmungs-Check — Ronki-driven prompt (Marc 25 Apr 2026:
          "could also be a tapable question from ronki to louis with a
          voiceline later — wie geht's dir heute? ronki möchte wissen
          wie es dir heute geht"). The card always reads as Ronki
          asking, not a system form: a chibi avatar on the left, a
          warm question to the right. Tap the card once and the
          emoji picker slides in from below; pick a mood and the
          whole section disappears for the day. The voice play button
          is a stub for now — we'll wire it to a Ronki voiceline
          ("Sag mir doch wie's dir heute geht") in a follow-up. */}
      {state?.moodAM === null && (
        <RonkiMoodPrompt
          heroName={heroName}
          variant={variant}
          stageIdx={stageIdx}
          onPick={(idx) => actions?.setMood?.('moodAM', idx)}
        />
      )}

      {/* Care verbs row */}
      <section style={{ padding: '20px 18px 0' }}>
        <CareVerbs />
      </section>

      {/* Wall scroll: Ronki's asks today.
          Each anchor pill is its own button (Marc 25 Apr 2026 spotted
          they were dead taps before), and the card title tap-target sits
          at the top so the parent surface stays openable as a whole. The
          pills route to TaskList with a hash so future TaskList work can
          scroll to that anchor section. */}
      <section style={{ padding: '22px 18px 0' }}>
        <div style={{
          font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#b45309', marginBottom: 8, paddingLeft: 4,
        }}>
          Ronki bittet dich heute um Hilfe
        </div>
        <div
          style={{
            width: '100%',
            background: 'linear-gradient(180deg, #fffdf5 0%, #fef3c7 100%)',
            border: '1.5px solid rgba(180,83,9,0.25)',
            borderRadius: 18,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 8px 18px -8px rgba(180,83,9,0.30), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate?.('aufgaben')}
            className="active:scale-[0.99] transition-transform"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
            aria-label="Alle Aufgaben anzeigen"
          >
            <b style={{ font: '500 18px/1.15 "Fredoka", sans-serif', color: '#124346' }}>
              Heute auf der Schriftrolle
            </b>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#b45309' }}>chevron_right</span>
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {undoneByAnchor.map(a => (
              <button
                key={a.anchor}
                type="button"
                onClick={() => onNavigate?.('aufgaben', { anchor: a.anchor })}
                className="active:scale-[0.96] transition-transform"
                aria-label={`${a.label}: ${a.count > 0 ? `${a.count} offen` : 'fertig'}`}
                style={{
                  borderRadius: 14,
                  background: a.count > 0 ? `${a.color}1a` : 'rgba(34,197,94,0.16)',
                  border: `1.5px solid ${a.count > 0 ? a.color + '55' : '#22c55e55'}`,
                  padding: '10px 8px 8px',
                  display: 'flex', flexDirection: 'column', gap: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: a.count > 0 ? a.color : '#059669',
                }}>
                  {a.label}
                </span>
                <span style={{
                  font: '700 18px/1 "Fredoka", sans-serif',
                  color: a.count > 0 ? '#124346' : '#059669',
                }}>
                  {a.count > 0 ? a.count : '✓'}
                </span>
                <span style={{
                  font: '500 9px/1 "Plus Jakarta Sans", sans-serif',
                  color: a.count > 0 ? '#6b655b' : '#059669',
                  letterSpacing: '0.06em',
                }}>
                  {a.count > 0 ? 'offen' : 'fertig'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Object row: Truhe / Buch / Spielzeug / Karte */}
      <section style={{
        padding: '18px 18px 0',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      }}>
        <ObjectTile icon="redeem"         label="Truhe"     onClick={() => onNavigate?.('belohnungen')} />
        <ObjectTile icon="menu_book"      label="Buch"      onClick={() => onNavigate?.('buch')} />
        <ObjectTile icon="sports_esports" label="Spielzeug" onClick={() => onNavigate?.('spiele')} />
        <ObjectTile icon="explore"        label={expeditionUnlocked ? 'Karte ✦' : 'Karte'} highlight={expeditionUnlocked} onClick={() => setShowExpedition(true)} />
      </section>

      {/* Expedition hint when unlocked */}
      {expeditionUnlocked && (
        <div style={{
          margin: '14px 18px 0',
          padding: '12px 14px',
          borderRadius: 16,
          background: 'linear-gradient(180deg, #fce7f3, #fef3c7)',
          border: '1.5px solid #fb7185',
          font: '600 13px/1.35 "Nunito", sans-serif',
          color: '#124346',
          textAlign: 'center',
          boxShadow: '0 8px 18px -8px rgba(251,113,133,0.40)',
        }}>
          Ronki ist startklar für ein Abenteuer. Tipp auf <b>Karte</b>.
        </div>
      )}

      <style>{`
        @keyframes rh-sit {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-5px); }
        }
        @keyframes rh-heart {
          0%   { opacity: 0; transform: translate(-50%, 0) scale(0.6); }
          18%  { opacity: 1; transform: translate(-50%, -10px) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -70px) scale(0.85); }
        }
        @keyframes rh-spark1 { 0%,100% { opacity: 0.4; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-6px); } }
        @keyframes rh-spark2 { 0%,100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 0.9; transform: translateY(-4px); } }
        @keyframes rh-spark3 { 0%,100% { opacity: 0.5; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-8px); } }
        @keyframes rh-bead {
          0%, 100% { filter: brightness(1); box-shadow: 0 0 12px 2px rgba(252,211,77,0.55), 0 0 22px 6px rgba(252,165,73,0.25); }
          50%      { filter: brightness(1.15); box-shadow: 0 0 16px 3px rgba(252,211,77,0.75), 0 0 30px 8px rgba(252,165,73,0.40); }
        }
      `}</style>

      {/* Karte + window → Expedition (Reise / Naturtagebuch surface).
          The state machine (home / leaving / away / waiting) lives in
          TaskContext; this surface mostly observes + transitions. */}
      {showExpedition && <Expedition onClose={() => setShowExpedition(false)} />}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

// Ronki-driven mood prompt — a tappable question card that opens a
// 6-emoji picker once Louis acknowledges Ronki's ask. Reframes the
// "Stimmungs-Check" beat as roleplay (Ronki asks, kid responds)
// instead of a system form. Voice playback is stubbed for now;
// wiring will read a Ronki voiceline like "Sag mir doch wie's dir
// heute geht."
function RonkiMoodPrompt({ heroName, variant, stageIdx, onPick }) {
  const [open, setOpen] = React.useState(false);
  const moods = [
    { idx: 3, emoji: '😊', label: 'Gut' },
    { idx: 4, emoji: '🤩', label: 'Magisch' },
    { idx: 2, emoji: '😐', label: 'Okay' },
    { idx: 0, emoji: '😢', label: 'Traurig' },
    { idx: 1, emoji: '😨', label: 'Besorgt' },
    { idx: 5, emoji: '😴', label: 'Müde' },
  ];

  return (
    <section style={{ padding: '20px 18px 0' }}>
      <div style={{
        borderRadius: 18,
        background: 'linear-gradient(180deg, #fffdf5 0%, #fef3c7 100%)',
        border: '1.5px solid rgba(180,83,9,0.22)',
        boxShadow: '0 6px 16px -8px rgba(180,83,9,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
        overflow: 'hidden',
      }}>
        {/* Tappable header — the "Ronki asks" row. */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label="Ronkis Frage beantworten"
          aria-expanded={open}
          className="active:scale-[0.99] transition-transform"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {/* Mini Ronki avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(252,211,77,0.18)',
            border: '1.5px solid rgba(180,83,9,0.20)',
            overflow: 'hidden',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}>
            <MoodChibi size={48} variant={variant} stage={stageIdx || 1} mood="normal" bare />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#b45309', marginBottom: 4,
            }}>
              Ronki fragt
            </div>
            <div style={{
              font: '500 15px/1.2 "Fredoka", sans-serif',
              color: '#124346',
            }}>
              Wie geht's dir heute, {heroName}?
            </div>
          </div>
          {/* Voice-line stub — visual only for now (Marc 25 Apr —
              "with a voiceline later"). Tap is captured by the parent
              button so this icon doesn't re-fire; that's intentional
              because the same tap should both open the picker AND
              trigger the voiceline once it's wired. */}
          <span
            aria-hidden="true"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              background: 'rgba(252,211,77,0.20)',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: 18,
              color: '#b45309',
              fontVariationSettings: "'FILL' 1",
            }}>
              {open ? 'expand_less' : 'volume_up'}
            </span>
          </span>
        </button>
        {open && (
          <div style={{
            padding: '4px 14px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 6,
            animation: 'rmp-pickin 0.32s cubic-bezier(0.34, 1.2, 0.64, 1)',
          }}>
            {moods.map(m => (
              <button
                key={m.idx}
                type="button"
                onClick={() => onPick(m.idx)}
                aria-label={m.label}
                className="active:scale-90 transition-transform"
                style={{
                  aspectRatio: '1',
                  borderRadius: 14,
                  background: 'rgba(252,211,77,0.12)',
                  border: '1.5px solid rgba(180,83,9,0.18)',
                  fontSize: 24,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes rmp-pickin {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function ObjectTile({ icon, label, highlight, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="active:scale-[0.96] transition-transform"
      style={{
        padding: '14px 6px 10px',
        borderRadius: 18,
        background: highlight
          ? 'linear-gradient(180deg, #fbbf24, #f97316)'
          : 'linear-gradient(180deg, #ffffff, #fff8f2)',
        border: highlight ? '1.5px solid #f59e0b' : '1.5px solid rgba(18,67,70,0.10)',
        boxShadow: highlight
          ? '0 8px 18px -6px rgba(249,115,22,0.50), inset 0 1px 0 rgba(255,255,255,0.5)'
          : '0 4px 10px -4px rgba(18,67,70,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        minHeight: 86,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 28,
          color: highlight ? '#5c2a08' : '#124346',
          fontVariationSettings: "'FILL' 1, 'wght' 600",
        }}
      >
        {icon}
      </span>
      <span style={{
        font: '700 11px/1.1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '0.04em',
        color: highlight ? '#3a1c05' : '#124346',
      }}>
        {label}
      </span>
    </button>
  );
}

function pickTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'dawn';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

// Drachennest reframe (25 Apr 2026): time-of-day now only affects the
// view *through* the back window. The cave itself stays warm
// sandstone all day. The window-sky palette here is what the kid
// peeks at when they tap the window to open the Reise / Naturtagebuch
// surface, and what shifts the celestial body from sun → orange disc
// → moon as the day rolls on.
const SCENE_TONES = {
  dawn: {
    sky: 'linear-gradient(180deg, #fecaca 0%, #fde68a 100%)',
    celestial: '#fbbf24',
  },
  day: {
    sky: 'linear-gradient(180deg, #bae6fd 0%, #a7f3d0 100%)',
    celestial: '#fbbf24',
  },
  dusk: {
    sky: 'linear-gradient(180deg, #c4b5fd 0%, #fdba74 100%)',
    celestial: '#f97316',
  },
  night: {
    sky: 'linear-gradient(180deg, #1e1b4b 0%, #3730a3 100%)',
    celestial: '#fef3c7',
  },
};
