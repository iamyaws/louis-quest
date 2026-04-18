import React, { useState, useEffect, useRef } from 'react';
import { submitFeedback } from '../utils/feedback';

const base = typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/';
// Real app version when VITE_APP_VERSION is injected at build time, else build mode.
const APP_VERSION =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.MODE) ||
  'dev';

/**
 * FeedbackModal — Feedback an Marc schicken (parents/testers only).
 *
 * Props:
 *   - onClose: () => void
 *   - currentView: string (current app view, auto-captured)
 *   - ronkiStage: number (cat evolution stage)
 *   - catEvo: number (raw evolution points)
 */
export default function FeedbackModal({ onClose, currentView, ronkiStage, catEvo }) {
  const [message, setMessage] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { ok: bool, text: string }
  const textareaRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Escape key closes the modal
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !sending) onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sending, onClose]);

  // Autofocus on mount, clear any pending close timer on unmount
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => {
      clearTimeout(t);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const canSend = message.trim().length >= 3 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setStatusMsg(null);
    const result = await submitFeedback({
      message: message.trim(),
      screen: currentView,
      ronki_stage: ronkiStage,
      cat_evo: catEvo,
      app_version: APP_VERSION,
    });
    if (result.ok) {
      setStatusMsg({ ok: true, text: 'Danke! ✓' });
      closeTimerRef.current = setTimeout(() => onClose?.(), 2000);
    } else {
      setStatusMsg({ ok: false, text: 'Ging nicht. Zwischengespeichert für später.' });
      closeTimerRef.current = setTimeout(() => onClose?.(), 3000);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !sending) onClose?.();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[500] flex items-center justify-center px-5"
      style={{ background: 'rgba(10, 20, 22, 0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden relative"
        style={{
          background: '#fff8f1',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.14)',
          border: '1.5px solid rgba(255,255,255,0.6)',
          maxHeight: '90vh',
        }}
      >
        {/* Warm background texture */}
        <img
          src={base + 'art/bg-warm-cream.png'}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />

        <div className="relative z-10 p-6 overflow-y-auto" style={{ maxHeight: '90vh', scrollbarWidth: 'none' }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="font-headline font-bold text-2xl text-primary">Feedback senden</h2>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                Nur für Eltern und Tester. Wird an Marc geschickt.
              </p>
            </div>
            <button
              onClick={() => !sending && onClose?.()}
              disabled={sending}
              aria-label="Schließen"
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0 ml-3"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,0,0,0.08)',
                opacity: sending ? 0.4 : 1,
              }}
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={5}
            disabled={sending}
            placeholder="Was ist dir aufgefallen? Bug, Idee, Beobachtung..."
            className="w-full px-4 py-3 rounded-2xl font-body text-base text-on-surface outline-none transition-all resize-none focus:ring-2 focus:ring-primary/20"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1.5px solid rgba(0,0,0,0.12)',
            }}
          />
          <div className="flex justify-between items-center mt-1 mb-4 px-1">
            <span className="font-label text-xs text-on-surface-variant/60">
              {message.trim().length < 3 ? 'Mind. 3 Zeichen' : ' '}
            </span>
            <span className="font-label text-xs text-on-surface-variant/60">
              {message.length}/1000
            </span>
          </div>

          {/* Collapsible context */}
          <button
            onClick={() => setShowContext((v) => !v)}
            disabled={sending}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-label font-bold text-sm transition-all active:scale-[0.99]"
            style={{
              background: 'rgba(18,67,70,0.04)',
              border: '1px solid rgba(18,67,70,0.08)',
              color: '#124346',
            }}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">info</span>
              Kontext zeigen
            </span>
            <span
              className="material-symbols-outlined text-base transition-transform duration-300"
              style={{ transform: showContext ? 'rotate(180deg)' : 'none' }}
            >
              expand_more
            </span>
          </button>

          {showContext && (
            <div
              className="mt-2 p-4 rounded-xl space-y-2 font-body text-sm"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <ContextRow label="Screen" value={currentView ?? '—'} />
              <ContextRow label="Ronki-Stufe" value={ronkiStage ?? '—'} />
              <ContextRow label="Cat-Evo" value={catEvo ?? '—'} />
              <ContextRow label="App-Version" value={APP_VERSION} />
            </div>
          )}

          {/* Status message */}
          {statusMsg && (
            <div
              className="mt-4 p-3 rounded-xl flex items-center gap-2 font-label font-bold text-sm"
              style={{
                background: statusMsg.ok ? 'rgba(52,211,153,0.12)' : 'rgba(252,211,77,0.18)',
                color: statusMsg.ok ? '#047857' : '#78350f',
                border: statusMsg.ok ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(252,211,77,0.4)',
              }}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                {statusMsg.ok ? 'check_circle' : 'schedule'}
              </span>
              {statusMsg.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => !sending && onClose?.()}
              disabled={sending}
              className="flex-1 py-3.5 rounded-full font-label font-bold text-sm transition-all active:scale-[0.98]"
              style={{
                background: 'rgba(18,67,70,0.05)',
                color: '#124346',
                border: '1.5px solid rgba(18,67,70,0.12)',
                opacity: sending ? 0.5 : 1,
              }}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex-1 py-3.5 rounded-full font-headline font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: canSend ? '#fcd34d' : 'rgba(252,211,77,0.35)',
                color: canSend ? '#725b00' : 'rgba(114,91,0,0.5)',
                boxShadow: canSend ? '0 6px 18px rgba(252,211,77,0.4)' : 'none',
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
            >
              {sending ? (
                <>
                  <span
                    className="inline-block w-4 h-4 rounded-full border-2"
                    style={{
                      borderColor: '#725b00',
                      borderRightColor: 'transparent',
                      animation: 'fb-spin 0.8s linear infinite',
                    }}
                  />
                  Senden...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    send
                  </span>
                  Senden
                </>
              )}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fb-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

function ContextRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <span className="font-body text-sm text-on-surface">{String(value)}</span>
    </div>
  );
}
