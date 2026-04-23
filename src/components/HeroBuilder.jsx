import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import HeroChibi, { SKIN_TONES, HAIR_STYLES, EXPRESSIONS, DEFAULT_FACE } from './HeroChibi';
import SFX from '../utils/sfx';
import { useHaptic } from '../hooks/useHaptic';

// Kid-readable labels for the skin swatches (aria only; the swatch itself
// is visual). Keeping this map out of the main SKIN_TONES export so HeroChibi
// stays a pure-presentation module.
const SKIN_TONE_LABELS_DE = {
  pale:  'Helle Haut',
  light: 'Beige Haut',
  warm:  'Warme Haut',
  tan:   'Karamell Haut',
  deep:  'Dunkle Haut',
};
const SKIN_TONE_LABELS_EN = {
  pale:  'Pale skin',
  light: 'Beige skin',
  warm:  'Warm skin',
  tan:   'Tan skin',
  deep:  'Deep skin',
};

/**
 * HeroBuilder — character builder modal for the kid's avatar.
 *
 * Discovery pattern: opens ONLY when the kid taps the hero pill in the
 * top bar. Deliberately not part of onboarding (Marc: "we don't have to
 * line up in the onboarding sequence but if a kid tries to click up top
 * on the boy that may open and he explores something by himself").
 *
 * Three orthogonal pickers (skin / hair / expression), each edit-and-see
 * live in a preview above. No save button in the header; the save CTA
 * is a single big "Fertig" at the bottom. Close-without-save dismisses
 * via scrim tap.
 *
 * Props
 *  - open    : boolean — modal visibility
 *  - onClose : () => void — scrim-tap handler
 */
export default function HeroBuilder({ open, onClose }) {
  const { state, actions } = useTask();
  const { t, lang } = useTranslation();
  const haptic = useHaptic();

  // Local draft so the preview updates immediately without thrashing
  // state on every picker tap. Only commit on "Fertig".
  const [draft, setDraft] = useState(() => state?.heroFace || DEFAULT_FACE);

  // Focus management — capture what was focused when the sheet opened so
  // we can restore it on close. Otherwise the tab key leaks into the hub
  // below and (critically) screen-reader users lose their place.
  const previouslyFocused = useRef(null);
  const sheetRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Reset draft when the modal opens (so closing without saving doesn't
  // leak partial selections into the next open).
  useEffect(() => {
    if (open) {
      setDraft(state?.heroFace || DEFAULT_FACE);
    }
  }, [open, state?.heroFace]);

  // Escape-to-close + focus-capture/restore. Both behaviours are standard
  // dialog expectations (WAI-ARIA APG), and without them the HeroBuilder
  // is the first modal in the app that leaks keyboard focus into the
  // background — an accessibility regression flagged in the launch-prep
  // code review (Apr 2026).
  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = (typeof document !== 'undefined'
      ? (document.activeElement)
      : null);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    // Move focus into the sheet so screen readers announce the dialog.
    // A short timeout lets the portal mount first.
    const fid = window.setTimeout(() => {
      firstFocusableRef.current?.focus?.();
    }, 60);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(fid);
      // Return focus to the element that opened the sheet. If it's gone
      // (unmounted) we silently skip — better than blowing up.
      const target = previouslyFocused.current;
      if (target && typeof target.focus === 'function' && document.contains(target)) {
        try { target.focus(); } catch { /* ignore */ }
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = (key, value) => {
    haptic('select');
    setDraft(prev => ({ ...prev, [key]: value }));
    SFX.play('tap');
  };

  const handleSave = () => {
    haptic('success');
    SFX.play('coin');
    actions?.patchState?.({ heroFace: draft });
    onClose?.();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'de' ? 'Held anpassen' : 'Customize hero'}
      className="fixed inset-0 z-[130] flex items-end justify-center"
      onClick={onClose}
      style={{
        background: 'rgba(18,67,70,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'heroBuilderBgIn 0.25s ease-out',
      }}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl overflow-hidden flex flex-col"
        // tabIndex=-1 lets us programmatically focus the sheet without
        // landing in the middle of the picker row; kid-focus feels right
        // on the drag-handle area.
        tabIndex={-1}
        style={{
          background: 'linear-gradient(180deg, #fff8f2 0%, #fef3c7 100%)',
          boxShadow: '0 -20px 50px -12px rgba(18,67,70,0.5)',
          animation: 'heroBuilderSheetIn 0.32s cubic-bezier(.34,1.56,.64,1)',
          maxHeight: '94dvh',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag-handle bar — cosmetic, tells the kid this panel is a sheet */}
        <div className="flex justify-center pt-2.5 pb-1.5">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(18,67,70,0.18)' }} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col items-center">
          <h2 className="font-headline font-bold text-xl text-primary mt-1 mb-1"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {lang === 'de' ? 'Wer bist du?' : 'Who are you?'}
          </h2>
          <p className="font-body text-sm text-on-surface-variant text-center mb-4 max-w-xs">
            {lang === 'de'
              ? 'Bau deinen Helden zusammen. Tippe auf die Farben und Frisuren, die dir gefallen.'
              : 'Build your hero. Tap the colors and styles you like.'}
          </p>

          {/* Live preview */}
          <div
            className="mb-5"
            style={{
              padding: 10,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(252,211,77,0.25) 0%, transparent 70%)',
            }}
          >
            <HeroChibi face={draft} size={140} />
          </div>

          {/* Skin picker */}
          <Picker
            label={lang === 'de' ? 'Hautfarbe' : 'Skin tone'}
            options={SKIN_TONES}
            activeId={draft.skin}
            onPick={(id) => update('skin', id)}
            renderSwatch={(opt) => (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: opt.color,
                boxShadow: 'inset -2px -3px 4px rgba(0,0,0,0.12)',
              }} />
            )}
            labelFor={(opt) => (
              (lang === 'de' ? SKIN_TONE_LABELS_DE : SKIN_TONE_LABELS_EN)[opt.id] || opt.id
            )}
          />

          {/* Hair picker */}
          <Picker
            label={lang === 'de' ? 'Frisur' : 'Hair'}
            options={HAIR_STYLES}
            activeId={draft.hair}
            onPick={(id) => update('hair', id)}
            renderSwatch={(opt) => (
              <HeroChibi
                face={{ ...draft, hair: opt.id }}
                size={44}
              />
            )}
            labelFor={(opt) => opt.label[lang] || opt.label.de}
          />

          {/* Expression picker */}
          <Picker
            label={lang === 'de' ? 'Gesicht' : 'Expression'}
            options={EXPRESSIONS}
            activeId={draft.expression}
            onPick={(id) => update('expression', id)}
            renderSwatch={(opt) => (
              <HeroChibi
                face={{ ...draft, expression: opt.id }}
                size={44}
              />
            )}
            labelFor={(opt) => opt.label[lang] || opt.label.de}
          />
        </div>

        {/* Sticky save button */}
        <div className="px-5 pt-3 pb-4" style={{ background: 'rgba(255,248,242,0.9)', borderTop: '1px solid rgba(18,67,70,0.08)' }}>
          <button
            ref={firstFocusableRef}
            onClick={handleSave}
            className="w-full py-4 rounded-full font-headline font-bold text-lg active:scale-[0.97] transition-all"
            style={{
              background: 'linear-gradient(135deg, #124346, #2d5a5e)',
              color: 'white',
              boxShadow: '0 10px 24px -6px rgba(18,67,70,0.35)',
            }}
          >
            {lang === 'de' ? 'Fertig' : 'Done'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes heroBuilderBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroBuilderSheetIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ── Picker sub-component ───────────────────────────────────────────

function Picker({ label, options, activeId, onPick, renderSwatch, labelFor }) {
  return (
    <div className="w-full mb-5">
      <p className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2.5 px-1">
        {label}
      </p>
      <div className="flex flex-wrap gap-2.5">
        {options.map(opt => {
          const active = opt.id === activeId;
          return (
            <button
              key={opt.id}
              onClick={() => onPick(opt.id)}
              className="relative rounded-2xl transition-all active:scale-95"
              style={{
                padding: 6,
                background: active ? 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)' : 'rgba(255,255,255,0.6)',
                border: active ? '2px solid #f59e0b' : '2px solid rgba(18,67,70,0.1)',
                boxShadow: active ? '0 4px 12px -4px rgba(245,158,11,0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
              aria-pressed={active}
              aria-label={labelFor ? labelFor(opt) : opt.id}
            >
              {renderSwatch(opt)}
              {active && (
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined absolute -top-1 -right-1"
                  style={{
                    fontSize: 18,
                    color: '#fff',
                    background: '#f59e0b',
                    borderRadius: '50%',
                    padding: 2,
                    fontVariationSettings: "'FILL' 1",
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  check
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
