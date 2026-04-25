import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { getCatStage } from '../../utils/helpers';
import MoodChibi from '../MoodChibi';
import RonkiVitalsRing from './RonkiVitalsRing';
import CareVerbs from './CareVerbs';
import RonkiSpeechBubble from './RonkiSpeechBubble';
import Expedition from './Expedition';
import BeiRonkiSein from './BeiRonkiSein';

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
  const [showPresence, setShowPresence] = useState(false);
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

  // Tap-Ronki reaction rotation (Marc 25 Apr 2026 second pass — "i
  // like the looping animation. do we have others? like burping a
  // flame or winking, etc. to have a few in rotation"). Reaction
  // pool grew from 2 → 6: bounce, spin, wink, flameBurp, shake,
  // wiggle. Every third tap escalates into a body reaction; non-
  // escalating taps still spawn a glyph (heart / sparkle / giggle).
  // Voiceline stubs are commented out per-reaction so the audio
  // wiring lands cleanly when samples are recorded.
  const reactionTimerRef = useRef(null);
  const [reaction, setReaction] = useState(null);
  const tapCountRef = useRef(0);
  const reactionIdxRef = useRef(0);

  const tapRonki = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    tapCountRef.current += 1;

    // Glyph burst on every tap.
    const variants = ['heart', 'sparkle', 'giggle'];
    const glyph = variants[Math.floor(Math.random() * variants.length)];
    setFloatingHearts(prev => [...prev, { id, x, y, kind: glyph }]);
    setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 950);

    // Body-reaction escalation every 3rd tap. Cycle through the pool
    // round-robin (with a small randomization shuffle) so the kid
    // sees variety rather than the same trick twice in a row.
    if (tapCountRef.current % 3 === 0) {
      const moves = ['bounce', 'spin', 'wink', 'flameBurp', 'shake', 'wiggle'];
      // Round-robin + small jitter so the same move doesn't repeat back-to-back.
      reactionIdxRef.current = (reactionIdxRef.current + 1 + Math.floor(Math.random() * 2)) % moves.length;
      const move = moves[reactionIdxRef.current];
      setReaction(move);
      // TODO(voiceline): per-reaction Ronki samples. Mapping:
      //   bounce    → ronki_giggle_*
      //   spin      → ronki_dizzy_*
      //   wink      → ronki_coo_*
      //   flameBurp → ronki_burp_* (existing flame-puff SFX)
      //   shake     → ronki_huff_*
      //   wiggle    → ronki_wiggle_*
      // Sample sets get recorded as part of the voice-redesign
      // backlog — see reference_voice_casting.md.
      const dur = move === 'flameBurp' ? 1100 : move === 'spin' ? 950 : 900;
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = setTimeout(() => setReaction(null), dur);
    }
  };

  useEffect(() => () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
  }, []);

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
              // Window z bumped above the stage (z:6) so the click
              // target is reachable. Marc 25 Apr 2026 — "the
              // clickzone of the window is gone." The stage's
              // raised z to overlap the cushion was eating taps on
              // the window because the stage extends across most of
              // the scene. z:8 keeps the window in front of stage +
              // chibi without pulling it visually awkward.
              zIndex: 8,
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

          {/* Stone shelf — the Laden-into-Drachennest merge v1.
              Marc 25 Apr 2026: chosen path is "mementos auto-place"
              (option 3.B of the planning questions). The three shelf
              spots now read from state.expeditionLog so each return
              from the Reise drops a memento onto the back wall —
              Naturtagebuch and the cave are the same surface from the
              kid's POV. When the log is empty we still show the
              starter trio (🍂🪶🪨, dimmed) so the shelf doesn't read
              as broken on day one. As new mementos roll in, the most
              recent three rotate to the front; older entries stay in
              the Naturtagebuch list inside the Reise surface. */}
          <ShelfDecor expeditionLog={state?.expeditionLog || []} />

          {/* v1.5 cave decor (Marc 25 Apr 2026 — three more slot
              positions in the cave that auto-fill from the
              expeditionLog). Hanging slot dangles from the string
              lights overhead, wall-art slot hangs above the shelf,
              floor-corner slot tucks a memento beside the cushion.
              Each one fills only when the kid earns enough mementos
              so the room reads as growing over time. */}
          <CaveDecorSlots expeditionLog={state?.expeditionLog || []} />

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
              // ring's lower curve crosses over the cushion mat.
              // Marc 25 Apr 2026 (second pass): "cushion still
              // overlaps make it a background item." So the stage
              // itself now lifts to z:6 above the cushion (z:5),
              // pushing the cushion fully into the background. Inside
              // the stage's stacking context (created by the transform),
              // the chibi sits at z:7 in front of the ring wrapper at
              // z:6. The cushion ends up acting as a painted floor
              // behind the whole stage instead of competing with it.
              // Lifted from -9% → -4% (Marc 25 Apr — "ring and ronki
              // a tiny tiny bit higher so that the blue metric bar
              // doesn't collapse with the end of the box"). The
              // bottom energie arc now reads cleanly inside the
              // scene rather than clipping against the rounded
              // corner.
              bottom: '-4%',
              transform: 'translateX(-50%)',
              zIndex: 6,
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
              <div
                style={{
                  position: 'relative',
                  width: ronkiPx,
                  height: ronkiPx,
                  transform: 'translateY(-9%)',
                  // Reaction class drives a one-shot animation on tap.
                  // The class clears after a per-move duration in
                  // tapRonki's setTimeout so a subsequent tap can
                  // re-trigger. Six moves in rotation:
                  //   bounce    — vertical squash
                  //   spin      — full 360° turn
                  //   wink      — quick subtle scale on the body
                  //   flameBurp — small forward lean (sample for
                  //                 the future flame-puff overlay)
                  //   shake     — fast side-to-side wiggle
                  //   wiggle    — slow squash + stretch + tilt
                  animation: reaction === 'bounce'    ? 'rh-rk-bounce 0.85s ease-out'
                           : reaction === 'spin'      ? 'rh-rk-spin 0.95s ease-in-out'
                           : reaction === 'wink'      ? 'rh-rk-wink 0.8s ease-out'
                           : reaction === 'flameBurp' ? 'rh-rk-burp 1.05s ease-out'
                           : reaction === 'shake'     ? 'rh-rk-shake 0.85s ease-in-out'
                           : reaction === 'wiggle'    ? 'rh-rk-wiggle 0.85s ease-in-out'
                           : undefined,
                }}
              >
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
                      font: h.kind === 'giggle'
                        ? '700 18px/1 "Fredoka", sans-serif'
                        : '600 32px/1 sans-serif',
                      color: h.kind === 'giggle' ? '#b45309' : undefined,
                      animation: 'rh-heart 0.95s ease-out forwards',
                      zIndex: 12,
                    }}
                  >
                    {h.kind === 'sparkle' ? '✦'
                      : h.kind === 'giggle' ? 'hihi'
                      : '💚'}
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

      {/* Care verbs row + Sterne counter.
          Marc 25 Apr 2026 — currency consolidation: dropped Funken
          as a separate currency, care now spends Sterne (state.hp)
          directly. Funkelzeit (drachenEier) stays separate so a
          kid can't pull all their Sterne into screentime at the
          cost of caring for Ronki. The kicker shows their Sterne
          balance with copy that flips to "voll" / "Erst eine
          Aufgabe" depending on state. */}
      <section style={{ padding: '20px 18px 0' }}>
        <FunkenChip
          tokens={state?.hp || 0}
          allFull={
            (state?.ronkiVitals?.hunger || 0) >= 100 &&
            (state?.ronkiVitals?.liebe || 0) >= 100 &&
            (state?.ronkiVitals?.energie || 0) >= 100
          }
        />
        <CareVerbs />
        {/* "Bei Ronki sein" — fourth interaction, deliberately set
            apart from the three care verbs. No Funken cost, no vital
            change. Tapping opens a full-screen presence moment at
            the campfire where Ronki tells the kid one short line
            and they sit together (Marc 25 Apr 2026 — "could be a
            chance for ronki to tell the kid a story or just sit
            with each other to be present, a cutscene of sorts
            sitting at the fire and having a friendship/bonding
            moment"). Always available; the rotation avoids
            repeating recent lines so it stays a small fresh
            beat. */}
        <button
          type="button"
          onClick={() => setShowPresence(true)}
          aria-label="Bei Ronki sein"
          className="active:scale-[0.98] transition-transform"
          style={{
            marginTop: 12,
            width: '100%',
            padding: '14px 16px',
            borderRadius: 16,
            background: 'linear-gradient(180deg, #fff8f2 0%, #fef3c7 100%)',
            border: '1.5px solid rgba(180,83,9,0.30)',
            color: '#5c2a08',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            font: '700 14px/1 "Nunito", sans-serif',
            cursor: 'pointer',
            boxShadow: '0 6px 16px -8px rgba(180,83,9,0.30), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 18 }}>🔥</span>
          <span>Bei Ronki sitzen</span>
          <span
            aria-hidden="true"
            style={{
              font: '700 9px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(120,53,15,0.55)',
              marginLeft: 4,
            }}
          >
            ohne Sterne
          </span>
        </button>
      </section>

      {/* Adventure-ready CTA — shows only when all three vitals are
          capped at 100. Marc 25 Apr 2026 spec: the kid says the
          line as if to Ronki, no auto-screen-switch. Tapping fires
          startExpedition() and opens the Reise surface so the
          walk-out animation plays + ranger departs flow. */}
      {state?.ronkiVitals &&
       (state.ronkiVitals.hunger >= 100) &&
       (state.ronkiVitals.liebe >= 100) &&
       (state.ronkiVitals.energie >= 100) &&
       (state?.expedition?.state === 'home') && (
        <section style={{ padding: '14px 18px 0' }}>
          <button
            type="button"
            onClick={() => {
              actions?.startExpedition?.();
              setShowExpedition(true);
            }}
            className="active:scale-[0.99] transition-transform"
            style={{
              width: '100%',
              padding: '16px 18px',
              borderRadius: 18,
              background: 'linear-gradient(180deg, #fbbf24 0%, #f97316 100%)',
              border: '1.5px solid rgba(146, 64, 14, 0.4)',
              color: '#3a1c05',
              textAlign: 'left',
              boxShadow: '0 8px 22px -8px rgba(249, 115, 22, 0.55), inset 0 1px 0 rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#5c2a08', marginBottom: 5,
            }}>
              Ronki ist bereit
            </div>
            <div style={{
              font: '500 16px/1.25 "Fredoka", sans-serif',
              color: '#3a1c05',
            }}>
              "Lass uns auf Abenteuer gehen, ich bringe dir was Schönes mit."
            </div>
          </button>
        </section>
      )}

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

      {/* Object row — deduped against the bottom nav (Marc 25 Apr
          2026: 'we have a dual nav at the moment, I tend to keep the
          bottom nav, what do you think about it?'). Removed Truhe
          (= Laden in bottom nav) and Buch (= Tagebuch in bottom nav)
          to avoid offering the same destinations twice. Kept
          Spielzeug (Spiele isn't a top-level nav target) and Karte
          (Reise/Expedition is the Drachennest's unique portal —
          also reachable via the painted window in the back of the
          cave). Two tiles instead of four also frees vertical space
          on the room surface. */}
      <section style={{
        padding: '18px 18px 0',
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
      }}>
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
        @keyframes rh-rk-bounce {
          0%   { transform: translateY(-9%) scale(1); }
          25%  { transform: translateY(-15%) scale(1.04); }
          55%  { transform: translateY(-5%) scale(0.98); }
          80%  { transform: translateY(-12%) scale(1.02); }
          100% { transform: translateY(-9%) scale(1); }
        }
        @keyframes rh-rk-spin {
          0%   { transform: translateY(-9%) rotate(0deg); }
          100% { transform: translateY(-9%) rotate(360deg); }
        }
        @keyframes rh-rk-wink {
          /* Subtle scale-down + back, with a tiny tilt — reads as a
             playful blink/wink on the body level. */
          0%   { transform: translateY(-9%) scale(1) rotate(0deg); }
          25%  { transform: translateY(-9%) scale(0.96, 1.02) rotate(-1deg); }
          55%  { transform: translateY(-9%) scale(1.02, 0.98) rotate(1deg); }
          100% { transform: translateY(-9%) scale(1) rotate(0deg); }
        }
        @keyframes rh-rk-burp {
          /* Quick forward lean + bounce-back — the body cue that
             pairs with the future flame-puff overlay. */
          0%   { transform: translateY(-9%) scale(1) rotate(0deg); }
          15%  { transform: translateY(-7%) scale(0.94, 1.06) rotate(0deg); }
          35%  { transform: translateY(-12%) scale(1.08, 0.94) rotate(0deg); }
          60%  { transform: translateY(-9%) scale(1) rotate(0deg); }
          100% { transform: translateY(-9%) scale(1) rotate(0deg); }
        }
        @keyframes rh-rk-shake {
          /* Fast side-to-side wiggle — Ronki shaking himself off,
             excited or refusing nicely. */
          0%, 100% { transform: translateY(-9%) translateX(0); }
          15%      { transform: translateY(-9%) translateX(-3%); }
          30%      { transform: translateY(-9%) translateX(3%); }
          45%      { transform: translateY(-9%) translateX(-3%); }
          60%      { transform: translateY(-9%) translateX(3%); }
          75%      { transform: translateY(-9%) translateX(-2%); }
        }
        @keyframes rh-rk-wiggle {
          /* Slower squash-and-stretch with a gentle tilt — giggle
             wiggle. */
          0%   { transform: translateY(-9%) scale(1) rotate(0deg); }
          25%  { transform: translateY(-7%) scale(1.05, 0.95) rotate(-3deg); }
          50%  { transform: translateY(-11%) scale(0.95, 1.05) rotate(0deg); }
          75%  { transform: translateY(-7%) scale(1.05, 0.95) rotate(3deg); }
          100% { transform: translateY(-9%) scale(1) rotate(0deg); }
        }
      `}</style>

      {/* Karte + window → Expedition (Reise / Naturtagebuch surface).
          The state machine (home / leaving / away / waiting) lives in
          TaskContext; this surface mostly observes + transitions. */}
      {showExpedition && <Expedition onClose={() => setShowExpedition(false)} />}

      {/* Presence moment — full-screen campfire scene with a Ronki
          story line. Free interaction, no Funken, no vital change.
          ESC + tap-anywhere both dismiss. */}
      {showPresence && <BeiRonkiSein onClose={() => setShowPresence(false)} />}
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
          {/* Tap-to-expand chevron — the voice-line stub used to
              live here but the audit flagged it as dead-tap-look
              for kids (looks tappable, isn't, sits at 32×32 below
              the 44dp guideline). Replaced with a clear chevron
              hint that mirrors the open/closed state. When the
              voiceline is actually recorded + wired, it'll fire
              from the parent button's click handler, no separate
              icon needed. */}
          <span
            aria-hidden="true"
            className="material-symbols-outlined"
            style={{
              fontSize: 22,
              color: 'rgba(120,53,15,0.55)',
              flexShrink: 0,
            }}
          >
            {open ? 'expand_less' : 'expand_more'}
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

// Cave back-wall shelf decor — three slots reading from
// state.expeditionLog. New mementos rotate to the front (most-recent
// = leftmost on the shelf). Empty log falls back to the muted starter
// trio so the shelf never looks broken on day one. The slot pixel
// positions match the painted shelf board's geometry (left:10%,
// width:64px, top:38%) — touching the visual frame from the room.
// v1.5 cave decor — three additional auto-fill slots that reveal
// as the kid accumulates mementos. Each slot only renders if the
// expeditionLog has at least N entries. Kid sees the cave fill in
// over time without any drag-and-drop UI.
//
//   slot 1 (hanging) — dangles from the string lights, fills at 4 mementos
//   slot 2 (wall art) — frames a memento above the shelf, fills at 7
//   slot 3 (corner)  — tucks a memento beside the cushion, fills at 10
function CaveDecorSlots({ expeditionLog }) {
  const log = expeditionLog || [];
  // Pick deterministic slot fillers from the log so the same
  // memento doesn't bounce slots on every render. Index by
  // log-position so the slot keeps its memento.
  const hangingItem  = log.length >= 4  ? log[3]  : null;
  const wallItem     = log.length >= 7  ? log[6]  : null;
  const cornerItem   = log.length >= 10 ? log[9]  : null;

  return (
    <>
      {/* Hanging mobile — dangles from the string-light cord on the
          left side, away from the speech bubble + window. */}
      {hangingItem && (
        <div aria-hidden="true" style={{
          position: 'absolute', top: '14%', left: '24%',
          width: 28, height: 44,
          zIndex: 2,
          animation: 'rh-hang 4s ease-in-out infinite',
          transformOrigin: 'top center',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            width: 1, height: 18,
            background: 'rgba(78,42,20,0.55)',
            transform: 'translateX(-50%)',
          }} />
          <div style={{
            position: 'absolute', top: 16, left: '50%',
            width: 26, height: 26, borderRadius: '50%',
            background: 'radial-gradient(ellipse at 40% 30%, rgba(252,211,77,0.3), transparent 60%), linear-gradient(135deg, #fff8f2, #fef3c7)',
            border: '1px solid rgba(180,120,40,0.30)',
            display: 'grid', placeItems: 'center',
            transform: 'translateX(-50%)',
            fontSize: 14,
            boxShadow: '0 2px 4px rgba(40,20,5,0.30)',
          }}>
            {hangingItem.emoji}
          </div>
        </div>
      )}

      {/* Wall art frame — sits above the stone shelf, on the back
          wall. Wooden frame around a single memento. */}
      {wallItem && (
        <div aria-hidden="true" style={{
          position: 'absolute', top: '24%', left: '12%',
          width: 36, height: 32,
          zIndex: 2,
          padding: 3,
          background: 'linear-gradient(180deg, #92400e 0%, #5c2a08 100%)',
          borderRadius: 4,
          boxShadow: '0 3px 6px rgba(40,20,5,0.40), inset 0 1px 0 rgba(254,243,199,0.25)',
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #fff8f2, #fef3c7)',
            borderRadius: 2,
            display: 'grid', placeItems: 'center',
            fontSize: 16,
          }}>
            {wallItem.emoji}
          </div>
        </div>
      )}

      {/* Floor-corner memento — pushed to z:9 above the stage
          (audit fix 25 Apr 2026 — at z:6 the chibi at right
          edge of stage was painting over it). Tucked at right:3%
          so it doesn't compete with the chibi's silhouette. */}
      {cornerItem && (
        <span aria-hidden="true" style={{
          position: 'absolute',
          bottom: '4%',
          right: '3%',
          fontSize: 18,
          transform: 'rotate(12deg)',
          zIndex: 9,
          filter: 'drop-shadow(0 2px 3px rgba(40,20,5,0.30))',
        }}>
          {cornerItem.emoji}
        </span>
      )}

      <style>{`
        @keyframes rh-hang {
          0%, 100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }
      `}</style>
    </>
  );
}

function ShelfDecor({ expeditionLog }) {
  const recent = (expeditionLog || []).slice(-3).reverse();
  const STARTER = [
    { emoji: '🍂', size: 14, top: -16 },
    { emoji: '🪶', size: 12, top: -14 },
    { emoji: '🪨', size: 10, top: -12 },
  ];
  // Slot positions on the shelf — left edge of each slot, in px from
  // the shelf's left.
  const SLOT_LEFTS = [4, 22, 40];

  return (
    <div aria-hidden="true" style={{
      position: 'absolute', top: '38%', left: '10%',
      width: 64, height: 8,
      background: 'linear-gradient(180deg, #92400e 0%, #5c2a08 100%)',
      borderRadius: '3px 3px 6px 6px',
      boxShadow: '0 3px 6px rgba(40,20,5,0.35), inset 0 1px 0 rgba(254,243,199,0.25)',
      zIndex: 2,
    }}>
      {SLOT_LEFTS.map((slotLeft, i) => {
        const real = recent[i];
        const fallback = STARTER[i];
        const item = real ? { emoji: real.emoji, size: 14, top: -16 } : fallback;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: slotLeft,
              top: item.top,
              fontSize: item.size,
              opacity: real ? 1 : 0.55,
              filter: real ? 'none' : 'saturate(0.6)',
              transition: 'opacity 0.6s ease, filter 0.6s ease',
            }}
          >
            {item.emoji}
          </span>
        );
      })}
    </div>
  );
}

// Sterne counter — sits above the care verbs row. Three states:
//   "all full"   → "Ronki geht's gut" (Marc 25 Apr 2026 — 'satt'
//                  read too literally about food when the state
//                  is all-three-vitals-full; flipped to the
//                  more general 'feeling good')
//   "tokens > 0" → "X Sterne zum Verteilen"
//   "tokens===0" → "Erst eine Aufgabe machen, dann Sterne sammeln"
//
// Visual: small kicker line + a star ★ icon row (6 pips reflecting
// available Sterne, capped at 6 visible). Kid-readable count
// without a numeric badge. Renamed from FunkenChip when we
// consolidated to Sterne-as-care-currency 25 Apr 2026.
function FunkenChip({ tokens, allFull }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      padding: '0 4px 8px',
    }}>
      <div style={{
        font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: allFull ? '#92400e' : tokens > 0 ? '#b45309' : 'rgba(18,67,70,0.55)',
      }}>
        {allFull ? "Ronki geht's gut" :
         tokens > 0 ? `${tokens} Sterne` :
         'Erst eine Aufgabe'}
      </div>
      {!allFull && (
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                fontSize: 13,
                color: i < tokens ? '#f59e0b' : 'rgba(180,83,9,0.18)',
                lineHeight: 1,
                textShadow: i < tokens ? '0 0 6px rgba(245,158,11,0.5)' : 'none',
              }}
            >
              ✦
            </span>
          ))}
        </div>
      )}
    </div>
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
