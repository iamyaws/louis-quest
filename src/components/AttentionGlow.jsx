import React, { useEffect, useRef, useMemo } from 'react';
import VoiceAudio from '../utils/voiceAudio';
import { useAttentionFlag } from '../hooks/useAttentionFlag';

/**
 * AttentionGlow — decorates a child element with attention-grabbing visual layers.
 *
 * Three stacked layers (all decorative, pointer-events-none):
 *   1. Soft breathing aura behind the child (radial gradient in accent color)
 *   2. Floating sparkle particles around the child
 *   3. Pulsing "NEU" badge in top-right corner
 *
 * Auto-fades once seenKey is marked (tap a child CTA, etc).
 *
 * Props:
 *   - children: ReactNode — the element to decorate (required)
 *   - active: boolean — whether attention mode is on (default: true)
 *   - seenKey?: string — localStorage key; when set, component watches seen-flag.
 *                        Parent calls the returned `markSeen()` when interaction happens.
 *   - accent?: string — hex color for aura/particles/badge (default: amber #fcd34d)
 *   - intensity?: 'soft' | 'medium' | 'strong' (default: 'medium')
 *   - badgeLabel?: string — NEU text (default: 'NEU'); pass '' to hide badge
 *   - voiceLineId?: string — optional one-time voice announcement when active+unseen
 *   - voiceDelayMs?: number — default 600
 *   - particleCount?: number — override default (soft:3, medium:5, strong:7)
 *
 * Returns: wrapped children + decorative overlays.
 *
 * Pattern: lift `seenKey` to the parent so the parent can both observe the seen state
 * AND call markSeen on the right user gesture. Example:
 *
 *   const [seen, markSeen] = useAttentionFlag('forscher-first-unlock');
 *   return (
 *     <AttentionGlow active={!seen} seenKey="forscher-first-unlock" ...>
 *       <ForscherEcke onPlayGame={(id) => { markSeen(); actualPlayGame(id); }} />
 *     </AttentionGlow>
 *   );
 */
export default function AttentionGlow({
  children,
  active = true,
  seenKey,
  accent = '#fcd34d',
  intensity = 'medium',
  badgeLabel = 'NEU',
  voiceLineId,
  voiceDelayMs = 600,
  particleCount,
}) {
  // Always call the hook; use sentinel when no seenKey so conditional logic doesn't
  // violate the rules of hooks.
  const [seen] = useAttentionFlag(seenKey || '__attention_glow_unused__');
  const firedRef = useRef(false);

  const isActive = active && !(seenKey && seen);

  // Config per intensity
  const cfg = useMemo(() => {
    const map = {
      soft:   { auraOpacity: 0.18, auraScale: 1.06, particles: 3, badgeScale: 1.0 },
      medium: { auraOpacity: 0.28, auraScale: 1.10, particles: 5, badgeScale: 1.1 },
      strong: { auraOpacity: 0.42, auraScale: 1.14, particles: 7, badgeScale: 1.2 },
    };
    return map[intensity] || map.medium;
  }, [intensity]);

  const count = particleCount ?? cfg.particles;

  // Deterministic pseudo-random particle positions — stable across re-renders
  // so the sparkles don't jitter to new spots on every update.
  const particles = useMemo(() => (
    Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 2 * Math.PI + (i * 0.7);
      const radius = 40 + (i % 3) * 14;
      return {
        top: 50 + Math.sin(angle) * radius * 0.5,
        left: 50 + Math.cos(angle) * radius,
        delay: (i * 0.37) % 2.5,
        duration: 3.2 + (i * 0.29) % 1.4,
        size: 3 + (i % 3),
      };
    })
  ), [count]);

  // Play voice once per mount, respecting seen + active state
  useEffect(() => {
    if (!isActive || !voiceLineId || firedRef.current) return;
    firedRef.current = true;
    VoiceAudio.play(voiceLineId, voiceDelayMs);
  }, [isActive, voiceLineId, voiceDelayMs]);

  // Null children → render nothing. Guards against wrapping components that
  // early-return null (e.g. ForscherEcke before any games unlock) so we don't
  // leave empty aura + badge floating on the Hub.
  if (!children) return null;

  // Inactive → return children unchanged (no wrapper div, no overlays)
  if (!isActive) return children;

  return (
    <div className="relative">
      {/* Layer 1: breathing aura (behind child) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          background: `radial-gradient(ellipse at center, ${accent}55 0%, transparent 70%)`,
          filter: 'blur(20px)',
          transform: 'scale(1.05)',
          animation: `attention-aura-breathe 3.2s ease-in-out infinite`,
          opacity: cfg.auraOpacity,
          zIndex: 0,
        }}
      />

      {/* Layer 2: child content */}
      <div className="relative z-10">{children}</div>

      {/* Layer 3: sparkle particles (in front of child, subtle) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-visible z-20">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: accent,
              boxShadow: `0 0 ${p.size * 3}px ${accent}`,
              opacity: 0.7,
              animation: `attention-sparkle ${p.duration}s ease-in-out infinite ${p.delay}s`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Layer 4: NEU badge (top-right corner) */}
      {badgeLabel && (
        <div
          aria-hidden="true"
          className="absolute -top-2 -right-2 z-30 px-2 py-0.5 rounded-full font-label font-bold text-[10px] uppercase tracking-widest text-white pointer-events-none"
          style={{
            background: accent,
            boxShadow: `0 2px 8px ${accent}88`,
            animation: `attention-badge-pulse 1.8s ease-in-out infinite`,
            transform: `scale(${cfg.badgeScale})`,
          }}
        >
          {badgeLabel}
        </div>
      )}

      <style>{`
        @keyframes attention-aura-breathe {
          0%, 100% { opacity: ${cfg.auraOpacity}; transform: scale(1.05); }
          50%      { opacity: ${cfg.auraOpacity * 1.5}; transform: scale(${cfg.auraScale}); }
        }
        @keyframes attention-sparkle {
          0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.7); }
          50%      { opacity: 0.9;  transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes attention-badge-pulse {
          0%, 100% { transform: scale(${cfg.badgeScale}); box-shadow: 0 2px 8px ${accent}88; }
          50%      { transform: scale(${cfg.badgeScale * 1.08}); box-shadow: 0 2px 14px ${accent}cc; }
        }
      `}</style>
    </div>
  );
}
