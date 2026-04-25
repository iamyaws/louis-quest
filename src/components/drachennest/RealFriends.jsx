import React, { useMemo, useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { formatEmojiCode } from '../../data/emojiCodeVocabulary';
import EmojiCodePicker from './EmojiCodePicker';
import FriendNestVisit from './FriendNestVisit';
import MoodChibi from '../MoodChibi';

/**
 * RealFriends — section in the Ronki profile (segment B per Marc's
 * Q4 = B) that shows the kid's own emoji code, an "add friend"
 * button that opens EmojiCodePicker in 'friend' mode, and the
 * cached friend grid. Tapping a friend opens FriendNestVisit.
 *
 * Marc 25 Apr 2026 (friends + sign-up Q5 = build now, after Q1+Q2
 * resolved): the prototype seeds 2-3 demo friends locally so the
 * kid can experience the visit + wink UX without a real backend.
 * Real Supabase wiring is the follow-up.
 *
 * Wink-inbox indicator: if state.winksReceived has unseen entries,
 * a small chip surfaces here so the kid sees "Lina hat dir
 * gewunken" the next time they open the profile.
 */

const DEMO_FRIENDS = [
  {
    emojiCode: ['🌙', '🦊', '⭐'],
    firstName: 'Lina',
    variant: 'rose',
    stage: 3,
    hatchTraits: ['heart-pair', 'blush'],
    decor: {
      shelf: [
        { emoji: '🍂', name: 'Ahornblatt' },
        { emoji: '🪶', name: 'Feder' },
        { emoji: '🌰', name: 'Eichel' },
      ],
      hanging: { emoji: '🍄', name: 'Pilz' },
      wallArt: { emoji: '🌷', name: 'Tulpe' },
      cornerItem: { emoji: '🪨', name: 'Bachstein' },
    },
    addedAt: '2026-04-23T09:00:00.000Z',
  },
  {
    emojiCode: ['🐰', '🌈', '🪶'],
    firstName: 'Jonas',
    variant: 'teal',
    stage: 2,
    hatchTraits: ['wave-curve'],
    decor: {
      shelf: [
        { emoji: '🪨', name: 'Bachstein' },
        { emoji: '🌿', name: 'Moosbüschel' },
      ],
      cornerItem: { emoji: '🍄', name: 'Roter Pilz' },
    },
    addedAt: '2026-04-24T14:00:00.000Z',
  },
  {
    emojiCode: ['🐢', '☀️', '🌳'],
    firstName: 'Mira',
    variant: 'forest',
    stage: 4,
    hatchTraits: ['leaf-tip', 'moss-mark', 'fern-tuft'],
    decor: {
      shelf: [
        { emoji: '🪶', name: 'Feder' },
        { emoji: '🌰', name: 'Eichel' },
        { emoji: '🐌', name: 'Schneckenhaus' },
      ],
      hanging: { emoji: '🍂', name: 'Ahornblatt' },
      wallArt: { emoji: '🍃', name: 'Blattwerk' },
    },
    addedAt: '2026-04-25T08:00:00.000Z',
  },
];

export default function RealFriends({ lang = 'de' }) {
  const { state, actions } = useTask();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState('self');
  const [visiting, setVisiting] = useState(null);
  const [seedNotice, setSeedNotice] = useState(false);

  const myCode = state?.emojiCode;
  const friends = state?.friends || [];
  const winks = state?.winksReceived || [];
  const unseenWinks = winks.filter(w => !w.seen);
  const winksSent = state?.winksSent || [];

  // Compute the visiting friend's remaining wink count for today
  // (Q3 cap = 3/day per friend). Recomputes on every state change so
  // FriendNestVisit gets a fresh value after a successful wink.
  const remainingWinksForVisitor = useMemo(() => {
    if (!visiting?.emojiCode) return 3;
    const today = new Date().toISOString().slice(0, 10);
    const used = winksSent.filter(w =>
      typeof w.sentAt === 'string' &&
      w.sentAt.slice(0, 10) === today &&
      w.toCode?.[0] === visiting.emojiCode[0] &&
      w.toCode?.[1] === visiting.emojiCode[1] &&
      w.toCode?.[2] === visiting.emojiCode[2]
    ).length;
    return Math.max(0, 3 - used);
  }, [visiting, winksSent]);

  // Sort friends by addedAt desc — most recent first.
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const ta = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const tb = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return tb - ta;
    });
  }, [friends]);

  const handleSelfPick = (code) => {
    actions?.setEmojiCode?.(code);
    setPickerOpen(false);
  };

  const handleFriendAdd = (code) => {
    // Prototype: match against demo friends. Real backend lookup is
    // a follow-up. If no match, add a generic placeholder friend so
    // the kid sees something rather than silent rejection.
    const match = DEMO_FRIENDS.find(d =>
      d.emojiCode[0] === code[0] && d.emojiCode[1] === code[1] && d.emojiCode[2] === code[2]
    );
    actions?.addFriend?.(
      match || {
        emojiCode: code,
        firstName: 'Neuer Freund',
        variant: 'amber',
        stage: 2,
        hatchTraits: [],
        decor: { shelf: [] },
        addedAt: new Date().toISOString(),
      }
    );
    setPickerOpen(false);
  };

  const seedAllDemo = () => {
    DEMO_FRIENDS.forEach(d => actions?.addFriend?.(d));
    setSeedNotice(true);
    setTimeout(() => setSeedNotice(false), 2200);
  };

  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{
        font: '800 10px/1 "Plus Jakarta Sans", sans-serif',
        letterSpacing: '0.20em', textTransform: 'uppercase',
        color: 'rgba(120,53,15,0.6)', marginBottom: 6, paddingLeft: 4,
      }}>
        {lang === 'de' ? 'Echte Freunde' : 'Real Friends'}
      </div>

      {/* Self-card — kid's own code + share affordance */}
      <div style={{
        borderRadius: 18,
        background: 'linear-gradient(160deg, #fff8f2 0%, #fef3c7 100%)',
        border: '1.5px solid rgba(180,83,9,0.20)',
        boxShadow: '0 6px 16px -8px rgba(180,83,9,0.20), inset 0 1px 0 rgba(255,255,255,0.6)',
        padding: '14px 16px',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              font: '800 9px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#A83E2C', marginBottom: 4,
            }}>
              {lang === 'de' ? 'Dein Zeichen' : 'Your code'}
            </div>
            {myCode ? (
              <div style={{
                font: '500 26px/1.1 "Fredoka", sans-serif',
                color: '#124346',
                letterSpacing: '0.06em',
              }}>
                {formatEmojiCode(myCode)}
              </div>
            ) : (
              <div style={{
                font: '500 14px/1.3 "Nunito", sans-serif',
                color: 'rgba(18,67,70,0.7)',
              }}>
                {lang === 'de'
                  ? 'Wähle drei Emojis, dann können dich Freunde finden.'
                  : 'Pick three emojis so friends can find you.'}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setPickerMode('self'); setPickerOpen(true); }}
            className="active:scale-[0.96] transition-transform"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: '#124346',
              color: '#fef3c7',
              font: '700 11px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {myCode ? 'Ändern' : 'Wählen'}
          </button>
        </div>
      </div>

      {/* Wink inbox */}
      {unseenWinks.length > 0 && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 14,
          background: 'linear-gradient(180deg, #fef3c7, #fde68a)',
          border: '1.5px solid #fbbf24',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#3a1c05',
        }}>
          <span style={{ fontSize: 22 }}>👋</span>
          <div style={{ flex: 1 }}>
            <b style={{ font: '700 13px/1.2 "Nunito", sans-serif', color: '#3a1c05' }}>
              {unseenWinks.length === 1
                ? `${unseenWinks[0].fromName} hat dir gewunken`
                : `${unseenWinks.length} Freunde haben dir gewunken`}
            </b>
          </div>
          <button
            type="button"
            onClick={() => unseenWinks.forEach(w => actions?.markWinkSeen?.(w.receivedAt))}
            className="active:scale-95 transition-transform"
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.8)',
              border: '1.5px solid rgba(146,64,14,0.30)',
              font: '700 10px/1 "Plus Jakarta Sans", sans-serif',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: '#5c2a08',
              cursor: 'pointer',
            }}
          >
            OK
          </button>
        </div>
      )}

      {/* Friends grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
      }}>
        {sortedFriends.map(f => (
          <button
            key={f.emojiCode.join('')}
            type="button"
            onClick={() => setVisiting(f)}
            className="active:scale-[0.96] transition-transform"
            style={{
              padding: '12px 8px 10px',
              borderRadius: 16,
              background: '#ffffff',
              border: '1.5px solid rgba(18,67,70,0.10)',
              boxShadow: '0 4px 10px -6px rgba(18,67,70,0.18)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ width: 56, height: 56, margin: '0 auto', display: 'grid', placeItems: 'center' }}>
              <MoodChibi size={50} variant={f.variant} stage={f.stage ?? 2} mood="normal" bare />
            </div>
            <div style={{
              marginTop: 8,
              font: '700 12px/1 "Fredoka", sans-serif',
              color: '#124346',
            }}>
              {f.firstName}
            </div>
            <div style={{
              marginTop: 3,
              fontSize: 12,
              letterSpacing: '0.06em',
            }}>
              {formatEmojiCode(f.emojiCode)}
            </div>
          </button>
        ))}
        {/* Add friend tile */}
        <button
          type="button"
          onClick={() => { setPickerMode('friend'); setPickerOpen(true); }}
          className="active:scale-[0.96] transition-transform"
          style={{
            padding: '12px 8px 10px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.5)',
            border: '1.5px dashed rgba(18,67,70,0.30)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minHeight: 116,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{
            fontSize: 28,
            color: 'rgba(120,53,15,0.5)',
            fontVariationSettings: "'FILL' 1",
          }}>
            person_add
          </span>
          <span style={{
            font: '700 11px/1.2 "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.06em',
            color: 'rgba(120,53,15,0.7)',
            textAlign: 'center',
          }}>
            {lang === 'de' ? 'Freund hinzufügen' : 'Add friend'}
          </span>
        </button>
      </div>

      {/* Demo seed link — small + dev-only-ish footer for prototype testing */}
      {sortedFriends.length === 0 && (
        <button
          type="button"
          onClick={seedAllDemo}
          style={{
            marginTop: 12,
            background: 'transparent',
            border: 'none',
            font: '500 11px/1.4 "Nunito", sans-serif',
            color: 'rgba(120,53,15,0.55)',
            cursor: 'pointer',
            fontStyle: 'italic',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {seedNotice ? '✨ Drei Demo-Freunde dabei' : '(Drei Demo-Freunde laden, um auszuprobieren)'}
        </button>
      )}

      {/* Picker modal */}
      {pickerOpen && (
        <EmojiCodePicker
          mode={pickerMode}
          initial={pickerMode === 'self' ? myCode : []}
          onConfirm={pickerMode === 'self' ? handleSelfPick : handleFriendAdd}
          onCancel={() => setPickerOpen(false)}
        />
      )}

      {/* Friend visit modal */}
      {visiting && (
        <FriendNestVisit
          friend={visiting}
          remainingWinks={remainingWinksForVisitor}
          onClose={() => setVisiting(null)}
          onWink={(f) => actions?.recordWinkSent?.(f) ?? false}
        />
      )}
    </section>
  );
}
