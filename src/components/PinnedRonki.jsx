import React, { useEffect, useRef, useState } from 'react';
import MiniRonki from './MiniRonki';
import { useQuestEater } from './QuestEater';

/**
 * PinnedRonki — circular gold-haloed pill housing a <MiniRonki>.
 *
 * The companion that follows Louis across tabs (core-loop audit's #1
 * recommendation + Claude Design's "pinned Ronki" pattern Louis liked).
 * Sits in the TopBar so Louis sees Ronki everywhere he goes, not just on
 * the Ronki tab.
 *
 * Interactions:
 *   - Tap  → `onTap` (typically navigates to the Ronki tab)
 *   - Long-press or external trigger → shows a speech bubble below
 *   - Burp overlay plays when the `burpTrigger` prop increments (useful
 *     for quest-completion celebrations — "Ronki eats the quest icon")
 *
 * Props:
 *   - size         (number)   — outer pill diameter, default 46
 *   - mood         ('happy' | 'sad' | 'sleepy' | 'proud') — MiniRonki mood
 *   - bubble       (string)   — optional speech bubble text, auto-fades
 *   - burpTrigger  (number)   — bump to fire a flame-puff overlay
 *   - onTap        (fn)       — tap handler
 *   - ariaLabel    (string)   — a11y label, default 'Ronki'
 */

export default function PinnedRonki({
  size = 46,
  mood = 'happy',
  bubble: bubbleOverride,
  burpTrigger = 0,
  onTap,
  ariaLabel = 'Ronki',
}) {
  // Register with the QuestEater context so the "flying quest icon"
  // animation knows where to aim. Also subscribe to its burp + bubble
  // triggers so ticking a quest anywhere in the app makes Ronki react
  // HERE without prop-drilling.
  const eater = useQuestEater();
  const pillRef = useRef(null);
  useEffect(() => {
    if (!eater || !pillRef.current) return;
    // Fallback slot — the CampfireScene's SideRonki takes priority
    // when mounted (on Lager). Everywhere else, this TopBar Ronki is
    // the target for the flying quest icon.
    eater.registerRonkiEl(pillRef.current, 'fallback');
    return () => eater.registerRonkiEl(null, 'fallback');
  }, [eater]);

  // Burp flame overlay — mounts briefly when burpTrigger (prop) OR
  // eater.burpKey (context) changes. Either source can trigger Ronki.
  const [burpKey, setBurpKey] = useState(0);
  const lastPropTrigger = useRef(burpTrigger);
  const lastCtxTrigger = useRef(eater?.burpKey ?? 0);
  useEffect(() => {
    if (burpTrigger !== lastPropTrigger.current) {
      lastPropTrigger.current = burpTrigger;
      setBurpKey(k => k + 1);
    }
  }, [burpTrigger]);
  useEffect(() => {
    const ctxKey = eater?.burpKey ?? 0;
    if (ctxKey !== lastCtxTrigger.current) {
      lastCtxTrigger.current = ctxKey;
      setBurpKey(k => k + 1);
    }
  }, [eater?.burpKey]);

  // Prefer explicit bubble prop; fall back to context bubble.
  const bubble = bubbleOverride ?? eater?.bubble;

  // Ronki's inner chibi is ~65% of the outer pill diameter (30/46 in the
  // Claude Design spec). Scale together so every size of the pill keeps
  // the same visual proportions.
  const innerSize = Math.round(size * 0.65);

  const Tag = onTap ? 'button' : 'div';

  return (
    <Tag
      ref={pillRef}
      onClick={onTap}
      aria-label={onTap ? ariaLabel : undefined}
      className="pr-pin"
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 40%, #fef3c7, #fcd34d 50%, #f59e0b 100%)',
        border: '2px solid #fff',
        boxShadow: '0 4px 10px -3px rgba(245,158,11,0.5)',
        display: 'grid',
        placeItems: 'center',
        cursor: onTap ? 'pointer' : 'default',
        transition: 'transform 0.15s',
        flexShrink: 0,
        padding: 0,
      }}
      onMouseDown={onTap ? (e) => e.currentTarget.style.transform = 'scale(0.95)' : undefined}
      onMouseUp={onTap ? (e) => e.currentTarget.style.transform = '' : undefined}
      onMouseLeave={onTap ? (e) => e.currentTarget.style.transform = '' : undefined}
    >
      <MiniRonki size={innerSize} mood={mood} />

      {/* Flame burp — radial gold→red ellipse that rises and fades. Keyed
          on burpKey so each trigger remounts a fresh animation run. */}
      {burpKey > 0 && (
        <span
          key={burpKey}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: '30%',
            transform: 'translateX(-50%)',
            width: size * 0.4,
            height: size * 0.48,
            background: 'radial-gradient(ellipse at 50% 70%, #fef3c7 0%, #f59e0b 45%, #dc2626 100%)',
            borderRadius: '50% 50% 30% 30% / 65% 65% 35% 35%',
            pointerEvents: 'none',
            zIndex: 40,
            filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.7))',
            animation: 'prBurp 0.9s ease-out forwards',
          }}
        />
      )}

      {/* Speech bubble — positioned below the pin, small tail pointing up.
          Kept inside the pin so it follows the component; consumers don't
          need to worry about layout. Limits width to prevent wrap on long
          strings; truncate if you want ultra-compact. */}
      {bubble && (
        <div
          role="status"
          style={{
            position: 'absolute',
            zIndex: 30,
            top: 'calc(100% + 8px)',
            right: 0,
            maxWidth: 240,
            padding: '8px 12px',
            borderRadius: 14,
            background: '#fff',
            border: '1px solid rgba(18,67,70,0.1)',
            boxShadow: '0 8px 20px -6px rgba(18,67,70,0.2)',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.3,
            color: '#124346',
            whiteSpace: 'nowrap',
            animation: 'prBubIn 0.25s cubic-bezier(.34,1.56,.64,1)',
          }}
        >
          {bubble}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -5,
              right: 18,
              width: 10,
              height: 10,
              background: '#fff',
              borderLeft: '1px solid rgba(18,67,70,0.1)',
              borderTop: '1px solid rgba(18,67,70,0.1)',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes prBurp {
          0%   { opacity: 0; transform: translate(-50%, 0) scale(0.3); }
          20%  { opacity: 1; transform: translate(-50%, -4px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -22px) scale(0.4); }
        }
        @keyframes prBubIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </Tag>
  );
}
