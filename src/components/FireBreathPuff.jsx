import React from 'react';

/**
 * FireBreathPuff — renders one of five fire-breath variants keyed by the
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
 *
 * Each variant runs for the same ~1.1s window so the completion rhythm
 * feels consistent across flavors.
 *
 * `fireKey` is a monotonically-increasing integer — re-keying forces a
 * fresh mount so the animation replays from frame 0 on every event.
 */
export default function FireBreathPuff({ flavor = 'flame', fireKey }) {
  if (!fireKey) return null;

  const baseStyle = {
    position: 'absolute',
    pointerEvents: 'none',
  };

  if (flavor === 'ember') {
    // Eight small embers spray out in an arc. Each is a colored dot with
    // its own animation delay so they feel tossed, not choreographed.
    return (
      <span key={fireKey} aria-hidden="true" style={{ ...baseStyle, top: '38%', left: '56%', width: 60, height: 40, zIndex: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = -60 + (i * 16); // -60° to 52°
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i % 2 ? '#fcd34d' : '#f97316',
                boxShadow: '0 0 6px 2px rgba(252,211,77,0.6)',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(0px)`,
                animation: `fbpEmber${i} 1.1s ease-out forwards`,
                opacity: 0,
              }}
            />
          );
        })}
        <style>{Array.from({ length: 8 }).map((_, i) => `
          @keyframes fbpEmber${i} {
            0%   { opacity: 0; transform: translate(-50%,-50%) rotate(${-60 + i * 16}deg) translateX(0px); }
            25%  { opacity: 1; }
            100% { opacity: 0; transform: translate(-50%,-50%) rotate(${-60 + i * 16}deg) translateX(44px); }
          }
        `).join('\n')}</style>
      </span>
    );
  }

  if (flavor === 'sparkle') {
    // 4 stars drift upward in a gentle column, fading as they rise.
    return (
      <span key={fireKey} aria-hidden="true" style={{ ...baseStyle, top: '20%', left: '58%', width: 40, height: 60, zIndex: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${10 + i * 8}px`,
              fontSize: 14 + (i % 2) * 4,
              opacity: 0,
              animation: `fbpSparkle 1.1s ease-out ${i * 0.08}s forwards`,
              filter: 'drop-shadow(0 0 4px rgba(252,211,77,0.9))',
            }}
          >
            ✦
          </span>
        ))}
        <style>{`
          @keyframes fbpSparkle {
            0%   { opacity: 0; transform: translateY(0) scale(0.6); }
            35%  { opacity: 1; transform: translateY(-20px) scale(1); }
            100% { opacity: 0; transform: translateY(-44px) scale(1.2); }
          }
        `}</style>
      </span>
    );
  }

  if (flavor === 'heart') {
    // Pink heart shape using two circles + a rotated square, rising and
    // fading. Pulses briefly at full opacity before it floats up.
    return (
      <span
        key={fireKey}
        aria-hidden="true"
        style={{
          ...baseStyle,
          top: '30%',
          left: '58%',
          width: 36,
          height: 36,
          zIndex: 8,
          animation: 'fbpHeart 1.1s ease-out forwards',
          filter: 'drop-shadow(0 0 8px rgba(244,114,182,0.6))',
        }}
      >
        <span style={{
          position: 'absolute', top: 4, left: 4, width: 16, height: 16, borderRadius: '50%',
          background: '#ec4899',
        }} />
        <span style={{
          position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%',
          background: '#ec4899',
        }} />
        <span style={{
          position: 'absolute', top: 10, left: 8, width: 20, height: 20,
          background: '#ec4899', transform: 'rotate(45deg)',
        }} />
        <style>{`
          @keyframes fbpHeart {
            0%   { opacity: 0; transform: scale(0.4) translateY(0); }
            30%  { opacity: 1; transform: scale(1) translateY(-4px); }
            60%  { opacity: 1; transform: scale(1.05) translateY(-12px); }
            100% { opacity: 0; transform: scale(1) translateY(-28px); }
          }
        `}</style>
      </span>
    );
  }

  if (flavor === 'rainbow') {
    // Same cone shape as flame but the radial-gradient cycles through a
    // rainbow of hues instead of warm flame colors.
    return (
      <span
        key={fireKey}
        aria-hidden="true"
        style={{
          ...baseStyle,
          top: '42%',
          left: '58%',
          width: 60,
          height: 32,
          background: 'conic-gradient(from 0deg at 15% 50%, #f97316, #fde047, #4ade80, #22d3ee, #818cf8, #ec4899, #f97316)',
          borderRadius: '0 50% 50% 0 / 0 60% 60% 0',
          filter: 'drop-shadow(0 0 10px rgba(244,114,182,0.55))',
          transformOrigin: '0% 50%',
          animation: 'cfFireBreath 1.1s ease-out forwards',
          zIndex: 8,
        }}
      />
    );
  }

  // Default: flame — the original orange-red flame cone.
  return (
    <span
      key={fireKey}
      aria-hidden="true"
      style={{
        ...baseStyle,
        top: '42%',
        left: '58%',
        width: 54,
        height: 30,
        background: 'radial-gradient(ellipse at 15% 50%, #fef3c7 0%, #fcd34d 25%, #f97316 55%, #dc2626 100%)',
        borderRadius: '0 50% 50% 0 / 0 60% 60% 0',
        filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.7))',
        transformOrigin: '0% 50%',
        animation: 'cfFireBreath 1.1s ease-out forwards',
        zIndex: 8,
      }}
    />
  );
}

/**
 * Flavor mapper — given a Quest (or habit) object, pick the fire-breath
 * flavor. Falls back to 'flame' for anything unrecognized. Centralized
 * here so every call site stays consistent.
 */
export function flavorForQuest(q) {
  if (!q) return 'flame';
  if (q.sideQuest) return 'ember';
  if (q.kind === 'mint' || /^mint_/.test(q.id || '')) return 'sparkle';
  if (q.kind === 'habit' || /^habit_/.test(q.id || '')) return 'sparkle';
  if (q.kind === 'freund') return 'heart';
  if (q.kind === 'arc' || q.kind === 'streak') return 'rainbow';
  return 'flame';
}
