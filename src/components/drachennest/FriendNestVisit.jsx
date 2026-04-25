import React, { useState } from 'react';
import MoodChibi from '../MoodChibi';
import { formatEmojiCode } from '../../data/emojiCodeVocabulary';

/**
 * FriendNestVisit — read-only visit to another kid's nest.
 *
 * Marc 25 Apr 2026 (friends + sign-up Q2 = C + house with decor):
 * the visit shows the friend's chibi Ronki + their cave with the
 * decor they've accumulated. NO vitals, NO mood, NO live state.
 * Snapshot only. The kid sees what their friend's home looks like
 * + can send a wave (Wink, Q3 = A: capped at 3/day per friend).
 *
 * Cap (Q3): the parent passes `remainingWinks` (today's remaining
 * sends to THIS friend) and `onWink` returns true when the wink was
 * accepted, false when the cap was already full. The success-state
 * flip is local UI; the actual cap lives in TaskContext.
 *
 * Layout mirrors RoomHub's painterly cave at 60% the size: warm
 * cave gradient, hanging string lights, back window, stone shelf
 * with decor pulled from the friend's snapshot, soft floor mat,
 * Ronki centred. Static — no animation on the chibi beyond the
 * variant's normal mood breathe.
 */

export default function FriendNestVisit({ friend, onClose, onWink, remainingWinks = 3 }) {
  const [winkSent, setWinkSent] = useState(false);

  if (!friend) return null;

  // capped: cap was already full when the modal opened (no wink possible
  // this session). justSent: kid tapped successfully in this session.
  const capped = !winkSent && remainingWinks <= 0;
  const justSent = winkSent;
  const available = !capped && !justSent;

  const handleWink = () => {
    if (!available) return;
    const ok = onWink?.(friend);
    // onWink may return true/false (real cap-aware action) or void
    // (legacy / stub). Treat undefined as accepted so the prototype
    // still feels responsive, but a hard `false` from the action
    // means we keep the disabled state visible.
    if (ok === false) return;
    setWinkSent(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Bei ${friend.firstName} zu Besuch`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'linear-gradient(180deg, #1e1b4b 0%, #2b3158 100%)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        animation: 'fnv-enter 0.4s ease-out',
        fontFamily: '"Nunito", sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px',
        background: 'linear-gradient(180deg, rgba(30,27,75,0.95), rgba(30,27,75,0.6) 70%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zurück zu deinem Nest"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,248,242,0.92)',
            border: 'none',
            color: '#124346',
            font: '700 12px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.06em',
            boxShadow: '0 4px 10px -4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Zurück
        </button>
        <div style={{
          font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#fde68a',
        }}>
          Zu Besuch
        </div>
        <div style={{ width: 76 }} aria-hidden="true" />
      </div>

      {/* Friend identity */}
      <div style={{
        textAlign: 'center',
        padding: '8px 24px 18px',
      }}>
        <div style={{
          font: '500 26px/1.1 "Fredoka", sans-serif',
          color: '#fef3c7',
          letterSpacing: '-0.01em',
        }}>
          {friend.firstName}
        </div>
        <div style={{
          marginTop: 4,
          fontSize: 22,
          letterSpacing: '0.08em',
        }}>
          {formatEmojiCode(friend.emojiCode)}
        </div>
      </div>

      {/* Cave scene — 60% scale of the home cave, painted from the
          friend's snapshot. The whole block is decoration; nothing
          inside is interactive. */}
      <section style={{ padding: '0 18px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 24,
            overflow: 'hidden',
            background:
              'radial-gradient(ellipse 110% 80% at 50% -10%, #fef3c7 0%, #fde68a 30%, #fbbf24 65%, #b45309 100%)',
            boxShadow:
              '0 18px 36px -14px rgba(0,0,0,0.50), inset 0 4px 0 rgba(255,255,255,0.30), inset 0 -10px 28px rgba(78,42,20,0.45)',
          }}
        >
          {/* Hanging lights */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '8%', left: '8%', right: '8%', height: 26,
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 22" preserveAspectRatio="none">
              <path d="M 0 4 Q 50 22 100 4" fill="none" stroke="rgba(78,42,20,0.45)" strokeWidth="0.6" />
            </svg>
            {[10, 30, 50, 70, 90].map((x, i) => {
              const y = 4 + Math.sin((x / 100) * Math.PI) * 18;
              return (
                <span key={i} style={{
                  position: 'absolute',
                  left: `calc(${x}% - 5px)`,
                  top: `calc(${(y / 22) * 100}% - 5px)`,
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #fef9d7, #fbbf24)',
                  boxShadow: '0 0 12px 2px rgba(252,211,77,0.55), 0 0 22px 6px rgba(252,165,73,0.25)',
                }} />
              );
            })}
          </div>

          {/* Hanging mobile (decor slot) */}
          {friend.decor?.hanging && (
            <div aria-hidden="true" style={{
              position: 'absolute', top: '14%', left: '24%',
              width: 28, height: 44,
              zIndex: 2,
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
                {friend.decor.hanging.emoji}
              </div>
            </div>
          )}

          {/* Back window — neutral state, no time-of-day variant */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            top: '17%',
            right: '8%',
            width: 100, height: 120,
            background: 'linear-gradient(180deg, #bae6fd, #a7f3d0)',
            border: '5px solid #5c2a08',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow:
              '0 6px 16px -4px rgba(40,20,5,0.50), inset 0 0 0 1px rgba(254,243,199,0.5), inset 0 0 22px rgba(252,211,77,0.30)',
            zIndex: 3,
          }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: '#5c2a08', transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: '#5c2a08', transform: 'translateY(-50%)' }} />
            </div>
            <div style={{
              position: 'absolute', top: 14, left: 14,
              width: 22, height: 22, borderRadius: '50%',
              background: '#fbbf24',
              boxShadow: '0 0 18px #fbbf24',
            }} />
          </div>

          {/* Wall art (decor slot) */}
          {friend.decor?.wallArt && (
            <div aria-hidden="true" style={{
              position: 'absolute', top: '24%', left: '12%',
              width: 36, height: 32,
              zIndex: 2,
              padding: 3,
              background: 'linear-gradient(180deg, #92400e 0%, #5c2a08 100%)',
              borderRadius: 4,
              boxShadow: '0 3px 6px rgba(40,20,5,0.40)',
            }}>
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #fff8f2, #fef3c7)',
                borderRadius: 2,
                display: 'grid', placeItems: 'center',
                fontSize: 16,
              }}>
                {friend.decor.wallArt.emoji}
              </div>
            </div>
          )}

          {/* Shelf — up to 3 items from snapshot */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '38%', left: '10%',
            width: 64, height: 8,
            background: 'linear-gradient(180deg, #92400e 0%, #5c2a08 100%)',
            borderRadius: '3px 3px 6px 6px',
            boxShadow: '0 3px 6px rgba(40,20,5,0.35)',
            zIndex: 2,
          }}>
            {(friend.decor?.shelf || []).slice(0, 3).map((item, i) => (
              <span key={i} style={{
                position: 'absolute',
                left: 4 + i * 18,
                top: -16 + i * 2,
                fontSize: 14 - i * 2,
              }}>
                {item.emoji}
              </span>
            ))}
          </div>

          {/* Floor mat */}
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
            boxShadow: 'inset 0 -4px 10px rgba(67,20,7,0.40)',
            zIndex: 5,
          }} />

          {/* Corner item */}
          {friend.decor?.cornerItem && (
            <span aria-hidden="true" style={{
              position: 'absolute',
              bottom: '4%',
              right: '3%',
              fontSize: 18,
              transform: 'rotate(12deg)',
              zIndex: 9,
              filter: 'drop-shadow(0 2px 3px rgba(40,20,5,0.30))',
            }}>
              {friend.decor.cornerItem.emoji}
            </span>
          )}

          {/* Friend's chibi Ronki */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '14%',
            transform: 'translateX(-50%)',
            width: 180, height: 180,
            zIndex: 7,
            display: 'grid',
            placeItems: 'center',
          }}>
            <MoodChibi
              size={170}
              variant={friend.variant || 'forest'}
              stage={friend.stage ?? 2}
              mood="normal"
              bare
            />
          </div>
        </div>
      </section>

      {/* Wink CTA */}
      <section style={{ padding: '20px 18px 32px' }}>
        <button
          type="button"
          onClick={handleWink}
          disabled={!available}
          className="active:scale-[0.98] transition-transform"
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 18,
            background: available
              ? 'linear-gradient(180deg, #fbbf24, #f97316)'
              : 'linear-gradient(180deg, rgba(252,211,77,0.30), rgba(180,83,9,0.30))',
            color: available ? '#3a1c05' : '#fef3c7',
            font: '800 12px/1 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: available ? 'pointer' : 'default',
            boxShadow: available ? '0 8px 22px -8px rgba(249, 115, 22, 0.55)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {justSent && (
            <>
              <span aria-hidden="true">✨</span>
              <span>{friend.firstName} bekommt einen Gruß</span>
            </>
          )}
          {capped && (
            <>
              <span aria-hidden="true">🌙</span>
              <span>Heute schon 3-mal gewunken</span>
            </>
          )}
          {available && (
            <>
              <span aria-hidden="true">👋</span>
              <span>{friend.firstName} winken</span>
            </>
          )}
        </button>
        {justSent && (
          <p style={{
            marginTop: 12,
            font: '500 12px/1.45 "Nunito", sans-serif',
            color: 'rgba(254,243,199,0.7)',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            Wenn {friend.firstName} die App das nächste Mal öffnet, sieht er deinen Gruß.
            {remainingWinks > 1 && (
              <>
                {' '}Du kannst {friend.firstName} heute noch {remainingWinks - 1}-mal winken.
              </>
            )}
          </p>
        )}
        {capped && (
          <p style={{
            marginTop: 12,
            font: '500 12px/1.45 "Nunito", sans-serif',
            color: 'rgba(254,243,199,0.7)',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            Morgen kannst du {friend.firstName} wieder winken.
          </p>
        )}
        {available && remainingWinks < 3 && (
          <p style={{
            marginTop: 12,
            font: '500 11px/1.4 "Nunito", sans-serif',
            color: 'rgba(254,243,199,0.55)',
            textAlign: 'center',
          }}>
            {remainingWinks === 1
              ? 'Noch 1× heute'
              : `Noch ${remainingWinks}× heute`}
          </p>
        )}
      </section>

      <style>{`
        @keyframes fnv-enter {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
