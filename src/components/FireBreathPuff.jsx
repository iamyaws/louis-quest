import React from 'react';

/**
 * FireBreathPuff — renders one of six fire-breath variants keyed by the
 * `flavor` prop. Used by both the Lager CampfireScene SideRonki and the
 * TopBar PinnedRonki so the same completion event draws the same shape
 * in both surfaces. See backlog_ronki_fire_breath_variations.md.
 *
 * Flavor mapping (owned by QuestEater call sites):
 *   - 'flame'   → default horizontal flame cone (routine quests)
 *   - 'ember'   → ember spray (side quests, bonus, arc beats)
 *   - 'sparkle' → shining star column (MINT games, discovery, habits)
 *   - 'heart'   → pink heart puff (emotional beats — Freund arcs)
 *   - 'rainbow' → rainbow gradient puff (magisch mood, Funkelzeit redeem)
 *   - 'smoke'   → grey drifting puff (onboarding teach — attempt 1 cough)
 *
 * Each variant runs for the same ~1.1s window so the completion rhythm
 * feels consistent across flavors.
 *
 * `fireKey` is a monotonically-increasing integer — re-keying forces a
 * fresh mount so the animation replays from frame 0 on every event.
 *
 * Position overrides (flame + smoke only):
 *   - `top`, `left` — override default absolute position (CSS strings)
 *   - `scale` — multiplies width/height (default 1)
 *
 * Added so the onboarding TeachFireStep can anchor the flame at the
 * front-facing chibi's mouth (~73% top / 52% left) instead of
 * SideRonki's side-profile default (42% / 58%). See
 * backlog_teach_fire_step_v2.md "Problem 1 — fire-mouth alignment".
 */
export default function FireBreathPuff({ flavor = 'flame', fireKey, top, left, scale = 1, duration = 1.1 }) {
  if (!fireKey) return null;

  const baseStyle = {
    position: 'absolute',
    pointerEvents: 'none',
  };

  if (flavor === 'ember') {
    // Eight embers spray out in an arc. Each is a colored dot with
    // its own animation delay so they feel tossed, not choreographed.
    // Base dot 6→10 + reach 44→58 per Marc 24 Apr 2026 ("Glut could
    // also be bigger") — dots now carry weight at ritual scale.
    // Top/left/scale/duration overridable so TeachBreathBeat can anchor
    // at the chibi mouth + grow per ritual progression.
    const reach = 58 * scale;
    const dotSize = 10 * scale;
    return (
      <span key={fireKey} aria-hidden="true" style={{ ...baseStyle, top: top ?? '38%', left: left ?? '56%', width: 60 * scale, height: 40 * scale, zIndex: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = -60 + (i * 16); // -60° to 52°
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                background: i % 2 ? '#fcd34d' : '#f97316',
                boxShadow: `0 0 ${8 * scale}px ${3 * scale}px rgba(252,211,77,0.7)`,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(0px)`,
                animation: `fbpEmber${i} ${duration}s ease-out forwards`,
                opacity: 0,
              }}
            />
          );
        })}
        <style>{Array.from({ length: 8 }).map((_, i) => `
          @keyframes fbpEmber${i} {
            0%   { opacity: 0; transform: translate(-50%,-50%) rotate(${-60 + i * 16}deg) translateX(0px); }
            25%  { opacity: 1; }
            100% { opacity: 0; transform: translate(-50%,-50%) rotate(${-60 + i * 16}deg) translateX(${reach}px); }
          }
        `).join('\n')}</style>
      </span>
    );
  }

  if (flavor === 'sparkle') {
    // 4 stars drift upward in a gentle column, fading as they rise.
    // Base font bumped 14/18 → 18/24 per Marc 24 Apr 2026 ("Funkensterne
    // could also be bigger") — at ritual scale the individual stars
    // now have real presence instead of reading as specks.
    // Top/left/scale/duration overridable (see ember comment).
    return (
      <span key={fireKey} aria-hidden="true" style={{ ...baseStyle, top: top ?? '20%', left: left ?? '58%', width: 40 * scale, height: 60 * scale, zIndex: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${(10 + i * 8) * scale}px`,
              fontSize: (18 + (i % 2) * 6) * scale,
              // Alternating bright gold / cream for a subtle twinkle.
              // Explicit color — the ✦ glyph otherwise inherits the
              // parent text color (black in most ritual contexts).
              // Marc flag 24 Apr 2026.
              color: i % 2 ? '#fef3c7' : '#fde047',
              opacity: 0,
              animation: `fbpSparkle ${duration}s ease-out ${i * 0.08 * duration / 1.1}s forwards`,
              filter: `drop-shadow(0 0 ${6 * scale}px rgba(252,211,77,0.95))`,
            }}
          >
            ✦
          </span>
        ))}
        <style>{`
          @keyframes fbpSparkle {
            0%   { opacity: 0; transform: translateY(0) scale(0.6); }
            35%  { opacity: 1; transform: translateY(-${28 * scale}px) scale(1); }
            100% { opacity: 0; transform: translateY(-${56 * scale}px) scale(1.2); }
          }
        `}</style>
      </span>
    );
  }

  if (flavor === 'heart') {
    // Pink heart shape using two circles + a rotated square, rising and
    // fading. Pulses briefly at full opacity before it floats up.
    // Scale + position overridable for the ritual.
    const sz = 36 * scale;
    return (
      <span
        key={fireKey}
        aria-hidden="true"
        style={{
          ...baseStyle,
          top: top ?? '30%',
          left: left ?? '58%',
          width: sz,
          height: sz,
          zIndex: 8,
          animation: `fbpHeart ${duration}s ease-out forwards`,
          filter: `drop-shadow(0 0 ${8 * scale}px rgba(244,114,182,0.6))`,
        }}
      >
        <span style={{
          position: 'absolute', top: 4 * scale, left: 4 * scale, width: 16 * scale, height: 16 * scale, borderRadius: '50%',
          background: '#ec4899',
        }} />
        <span style={{
          position: 'absolute', top: 4 * scale, right: 4 * scale, width: 16 * scale, height: 16 * scale, borderRadius: '50%',
          background: '#ec4899',
        }} />
        <span style={{
          position: 'absolute', top: 10 * scale, left: 8 * scale, width: 20 * scale, height: 20 * scale,
          background: '#ec4899', transform: 'rotate(45deg)',
        }} />
        <style>{`
          @keyframes fbpHeart {
            0%   { opacity: 0; transform: scale(0.4) translateY(0); }
            30%  { opacity: 1; transform: scale(1) translateY(-${4 * scale}px); }
            60%  { opacity: 1; transform: scale(1.05) translateY(-${12 * scale}px); }
            100% { opacity: 0; transform: scale(1) translateY(-${28 * scale}px); }
          }
        `}</style>
      </span>
    );
  }

  if (flavor === 'rainbow') {
    // Same cone shape as flame but the radial-gradient cycles through a
    // rainbow of hues instead of warm flame colors. Scale + position
    // overridable for the ritual (pairs with the rainbow-style modal bg).
    return (
      <span
        key={fireKey}
        aria-hidden="true"
        style={{
          ...baseStyle,
          top: top ?? '42%',
          left: left ?? '58%',
          width: 60 * scale,
          height: 32 * scale,
          background: 'conic-gradient(from 0deg at 15% 50%, #f97316, #fde047, #4ade80, #22d3ee, #818cf8, #ec4899, #f97316)',
          borderRadius: '0 50% 50% 0 / 0 60% 60% 0',
          filter: `drop-shadow(0 0 ${10 * scale}px rgba(244,114,182,0.55))`,
          transformOrigin: '0% 50%',
          animation: `cfFireBreath ${duration}s ease-out forwards`,
          zIndex: 8,
        }}
      />
    );
  }

  if (flavor === 'smoke') {
    // Grey drifting puff — three soft oval clouds staggered outward from
    // the mouth. Used for onboarding's first-attempt "cough" beat so the
    // kid reads "Ronki tried but didn't quite make it". See
    // backlog_teach_fire_step_v2.md (Problem 2 — failure-first learning).
    const puffs = [0, 1, 2];
    const fx = scale;
    // Stagger each puff's entry by ~13% of the total duration so the
    // dissipation still reads as three beats regardless of how long the
    // animation runs. Teach step passes 1.5s; QuestEater would pass 1.1s.
    const staggerPerPuff = duration * 0.13;
    return (
      <span
        key={fireKey}
        aria-hidden="true"
        style={{
          ...baseStyle,
          top: top ?? '42%',
          left: left ?? '56%',
          width: 64 * fx,
          height: 40 * fx,
          zIndex: 8,
        }}
      >
        {puffs.map((i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: `${10 - i * 3}px`,
              left: 0,
              width: (22 + i * 6) * fx,
              height: (14 + i * 3) * fx,
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse at 35% 40%, rgba(249,250,251,0.92) 0%, rgba(203,213,225,0.72) 55%, rgba(107,114,128,0.18) 100%)',
              filter: 'blur(0.6px)',
              opacity: 0,
              animation: `fbpSmoke${i} ${duration}s ease-out ${i * staggerPerPuff}s forwards`,
            }}
          />
        ))}
        <style>{puffs
          .map(
            (i) => `
          @keyframes fbpSmoke${i} {
            0%   { opacity: 0; transform: translate(0, 0) scale(0.55); }
            30%  { opacity: 0.9; transform: translate(${(10 + i * 6) * fx}px, ${(-2 - i * 2) * fx}px) scale(1); }
            100% { opacity: 0; transform: translate(${(30 + i * 10) * fx}px, ${(-12 - i * 5) * fx}px) scale(1.35); }
          }
        `,
          )
          .join('\n')}</style>
      </span>
    );
  }

  // Default: flame — the original orange-red flame cone.
  return (
    <span
      key={fireKey}
      aria-hidden="true"
      style={{
        ...baseStyle,
        top: top ?? '42%',
        left: left ?? '58%',
        width: 54 * scale,
        height: 30 * scale,
        background: 'radial-gradient(ellipse at 15% 50%, #fef3c7 0%, #fcd34d 25%, #f97316 55%, #dc2626 100%)',
        borderRadius: '0 50% 50% 0 / 0 60% 60% 0',
        filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.7))',
        transformOrigin: '0% 50%',
        animation: `cfFireBreath ${duration}s ease-out forwards`,
        zIndex: 8,
      }}
    />
  );
}

/**
 * Quest-type → flavor mapping. Stateless, deterministic. This is the
 * "ideal" flavor for the quest type — whether the kid actually sees it
 * depends on whether that flavor has been taught yet (see flavorForQuest).
 */
function idealFlavorForQuest(q) {
  if (!q) return 'flame';
  if (q.sideQuest) return 'ember';
  if (q.kind === 'mint' || /^mint_/.test(q.id || '')) return 'sparkle';
  if (q.kind === 'habit' || /^habit_/.test(q.id || '')) return 'sparkle';
  if (q.kind === 'freund') return 'heart';
  if (q.kind === 'arc' || q.kind === 'streak') return 'rainbow';
  return 'flame';
}

/**
 * Flavor mapper — given a Quest (or habit) object, pick the fire-breath
 * flavor to actually play. Gates the ideal flavor on `taughtBreaths` so
 * non-flame animations only fire after their teach ritual has been
 * completed.
 *
 * - `flame` is always available (seeded at onboarding completion).
 * - Any other ideal flavor falls back to `flame` until taught.
 *
 * Call sites that don't have access to state (legacy code paths) can
 * omit the second arg — the gate defaults to "only flame taught" which
 * matches the pre-progression behavior before onboarding.
 *
 * See backlog_fire_breath_progression.md for the unlock schedule.
 */
export function flavorForQuest(q, taughtBreaths) {
  const ideal = idealFlavorForQuest(q);
  if (ideal === 'flame') return 'flame';
  if (taughtBreaths && taughtBreaths[ideal]) return ideal;
  return 'flame';
}
