// ─────────────────────────────────────────────────────────────────────────────
// Setup note for Marc:
//   Google Sign In and Magic Link are wired up here, but they BOTH require
//   provider configuration in the Supabase dashboard before they will work in
//   production. See the TODO comments near the Google button below, and the
//   quick steps below for reference:
//
//   1. Supabase → Authentication → Providers → Google → toggle Enable
//   2. In Google Cloud Console create an OAuth 2.0 Client ID (Web app) and add
//      the Supabase callback URL shown in the provider panel as an authorized
//      redirect URI (looks like  https://<project-ref>.supabase.co/auth/v1/callback )
//   3. Paste the Google Client ID + Client Secret back into Supabase → Save
//   4. In Supabase → Authentication → URL Configuration add the Ronki site
//      URL(s) (localhost + production) to "Redirect URLs"
//   5. Magic Link: Supabase → Authentication → Email → ensure the email
//      provider + "Email OTP" are enabled; customize the magic-link template
//      if desired. No extra secrets needed — it piggybacks on Supabase SMTP.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../i18n/LanguageContext';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signInWithMagicLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Official Google "G" logo (multi-color). Inlined so we have no extra asset.
const GoogleGIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    aria-hidden="true"
    className={className}
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

// [DRACHENNEST EXPERIMENT BRANCH] When Supabase is not configured (no
// VITE_SUPABASE_URL env var), provide a stub user so downstream code
// that reads user.id keeps working without a real login. This lets the
// prototype boot straight to RoomHub without hitting LoginScreen.
// Detect via the supabase client's stub flag the lib already exposes
// (or fall back to checking import.meta.env directly).
const STUB_USER: User = {
  id: 'drachennest-local',
  app_metadata: { provider: 'stub' },
  user_metadata: { name: 'Louis' },
  aud: 'stub',
  created_at: new Date().toISOString(),
  email: 'louis@drachennest.local',
} as unknown as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // [DRACHENNEST] Detect stub Supabase (missing env vars) and skip
    // the network round-trip entirely. Without this we wait the 5s
    // fallback timer before showing anything.
    const isStubSupabase = !import.meta.env.VITE_SUPABASE_URL;
    if (isStubSupabase) {
      setUser(STUB_USER);
      setLoading(false);
      return;  // skip the network getSession dance + listener
    }
    // Safety net: if the Supabase call hangs (cold start, flaky
    // network, bad token), don't leave the kid on a "Loading" screen
    // forever. After 5s, assume no session and let the app boot.
    // Marc flag 24 Apr 2026: phone stuck on Loading — one silent
    // getSession() hang was all it took to brick the experience.
    let settled = false;
    const fallbackTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (settled) return;  // timer already fired — let storage layer
                              // try to recover state anonymously
        settled = true;
        clearTimeout(fallbackTimer);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[auth] getSession failed, booting anonymously:', err);
        if (settled) return;
        settled = true;
        clearTimeout(fallbackTimer);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    });
    return error?.message ?? null;
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/' },
    });
    return error?.message ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

type ViewMode = 'options' | 'magic';

export function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, signUp, signInWithGoogle, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<ViewMode>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [magicBusy, setMagicBusy] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const err = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    setBusy(false);
    if (err) {
      setError(err);
    } else if (mode === 'signup') {
      setSignupDone(true);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleBusy(true);
    const err = await signInWithGoogle();
    setGoogleBusy(false);
    if (err) setError(`${t('auth.errors.google')}: ${err}`);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMagicBusy(true);
    const err = await signInWithMagicLink(email);
    setMagicBusy(false);
    if (err) {
      setError(`${t('auth.errors.magicLink')}: ${err}`);
    } else {
      setMagicLinkSent(true);
    }
  };

  // ── Signup confirmation ──
  if (signupDone) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-surface px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #fcd34d 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="w-full max-w-sm text-center relative z-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-container-highest flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(252,211,77,0.2)' }}>
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
          </div>
          <h2 className="font-headline text-3xl font-bold text-primary mb-3">{t('auth.mailSent')}</h2>

          <p className="font-body text-on-surface-variant mb-6 leading-relaxed">
            {t('auth.mailBody', { email })}
          </p>
          <div className="p-4 rounded-xl mb-6 flex items-start gap-3 text-left" style={{ background: 'rgba(232,225,219,0.5)' }}>
            <span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-body text-sm text-on-surface-variant">{t('auth.linkExpiry')}</span>
          </div>
          <button
            onClick={() => { setSignupDone(false); setMode('login'); }}
            className="font-label font-bold text-primary flex items-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  // ── Magic link sent confirmation ──
  if (magicLinkSent) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-surface px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #fcd34d 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="w-full max-w-sm text-center relative z-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-container-highest flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(252,211,77,0.2)' }}>
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
          </div>
          <h2 className="font-headline text-3xl font-bold text-primary mb-3">{t('auth.magicLinkSent.title')}</h2>
          <p className="font-body text-on-surface-variant mb-6 leading-relaxed">
            {t('auth.magicLinkSent.body')}
          </p>
          <button
            onClick={() => { setMagicLinkSent(false); setView('options'); }}
            className="font-label font-bold text-primary flex items-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t('auth.backToOptions')}
          </button>
        </div>
      </div>
    );
  }

  // ── Login / Signup form ──
  // Design pass (Apr 2026): reworked to match the Polish v2 vocabulary
  // used across the app — warm campfire-biome backdrop, Fredoka headline
  // + Plus Jakarta kicker, cream-gradient card chrome with gold border,
  // rounded-14 inputs (not pill), teal primary CTAs matching Laden /
  // Heute. Ronki egg stays prominent as brand hero.
  return (
    <div
      className="flex items-start justify-center min-h-dvh px-5 relative overflow-hidden"
      style={{
        paddingTop: 'calc(32px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))',
        // Warm campfire-biome base: amber ember at the top fading to cream
        // at the fold where the card sits. Matches the hero amber mood
        // used on Lager + Laden but softer so form text stays readable.
        background: `
          radial-gradient(ellipse 600px 400px at 50% 0%, rgba(252,211,77,0.35) 0%, transparent 55%),
          radial-gradient(ellipse 500px 600px at 90% 100%, rgba(180,83,9,0.12) 0%, transparent 60%),
          linear-gradient(180deg, #fff3de 0%, #fff8f2 45%, #fff8f2 100%)
        `,
      }}
    >
      <div className="w-full max-w-md relative z-10">
        {/* ── Hero: Ronki egg logo + kicker + tagline ── */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            {/* Soft gold halo behind the egg — matches the Pearl / Star
                currency icon glow used throughout the app */}
            <div
              className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
              style={{ background: '#fcd34d', filter: 'blur(56px)', transform: 'scale(1.15)' }}
              aria-hidden="true"
            />
            <img
              src={`${import.meta.env.BASE_URL}art/logo/ronki-logo-hero.webp`}
              alt="Ronki"
              className="relative z-10 w-56 sm:w-64 h-auto drop-shadow-xl rounded-2xl"
            />
          </div>
          <p
            className="font-label font-extrabold uppercase mb-2"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 10,
              letterSpacing: '0.28em',
              color: '#A83E2C',
            }}
          >
            Deine Reise beginnt
          </p>
          <p
            className="font-body text-center"
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 14,
              lineHeight: 1.4,
              color: 'rgba(18,67,70,0.75)',
            }}
          >
            {mode === 'login' ? t('auth.heroJourney') : t('auth.createAccount')}
          </p>
        </div>

        {view === 'magic' ? (
          // ── Magic-link simplified form ──
          <div
            className="rounded-3xl p-6 mb-4"
            style={{
              background: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
              border: '1px solid rgba(180,83,9,0.2)',
              boxShadow: '0 8px 32px rgba(180,83,9,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
            }}
          >
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div className="space-y-2">
                <label
                  className="font-label font-extrabold uppercase block"
                  style={{ fontSize: 10, letterSpacing: '0.22em', color: '#A83E2C' }}
                >
                  {t('auth.parentEmail')}
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 font-body outline-none transition-all"
                    style={{
                      height: 52,
                      borderRadius: 14,
                      background: '#ffffff',
                      border: '1.5px solid rgba(180,83,9,0.2)',
                      color: '#124346',
                      fontSize: 15,
                      paddingRight: 44,
                    }}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-xl transition-colors pointer-events-none"
                    style={{ color: 'rgba(180,83,9,0.55)' }}
                  >mail</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                  <span className="material-symbols-outlined text-lg" style={{ color: '#b91c1c' }}>error</span>
                  <p className="font-body text-sm" style={{ color: '#7f1d1d' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={magicBusy}
                className="w-full font-headline font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5"
                style={{
                  padding: '16px 20px',
                  borderRadius: 14,
                  background: '#124346',
                  color: '#fef3c7',
                  fontSize: 16,
                  boxShadow: '0 6px 18px -6px rgba(18,67,70,0.4)',
                }}
              >
                <span>{magicBusy ? t('auth.loading') : t('auth.sendMagicLink')}</span>
                {!magicBusy && <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>}
              </button>

              <button
                type="button"
                onClick={() => { setView('options'); setError(null); }}
                className="w-full py-2 font-label font-semibold flex items-center justify-center gap-1"
                style={{ color: 'rgba(18,67,70,0.7)' }}
              >
                <span className="material-symbols-outlined text-base">arrow_back_ios_new</span>
                {t('auth.backToOptions')}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* ── Primary: Magic Link ──
                 Reordered to primary (above Google) because Google's OAuth
                 consent screen currently shows the raw Supabase subdomain
                 `jdpxfvqaoxmnyvlxikce.supabase.co` — reads as phishing to a
                 cautious parent. Magic Link skips the OAuth dance entirely
                 (just an email with a tap-link), so it's the most trust-safe
                 option until we set up a Supabase custom domain
                 (`auth.ronki.de`, Supabase Pro $25/mo). See
                 backlog_supabase_custom_domain.md. */}
            <button
              type="button"
              onClick={() => { setView('magic'); setError(null); }}
              className="w-full py-5 mb-3 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/10"
              style={{
                background: '#124346',
                color: '#fef3c7',
              }}
            >
              <span className="material-symbols-outlined text-xl text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              <span>{t('auth.signInWithEmailLink')}</span>
            </button>

            {/* ── Secondary: Google ── */}
            {/* TODO(Marc): Enable Google provider in Supabase dashboard before this button does anything.
                Auth → Providers → Google → enable + paste Client ID/Secret from Google Cloud Console.
                Then upgrade to Supabase Pro + set auth.ronki.de custom domain so the OAuth consent
                screen stops showing the raw supabase.co subdomain to parents. */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleBusy}
              className="w-full py-4 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
              style={{
                background: '#ffffff',
                color: '#1f2937',
                border: '1.5px solid rgba(0,0,0,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {googleBusy
                ? <span>{t('auth.loading')}</span>
                : <><GoogleGIcon className="w-5 h-5" /><span>{t('auth.signInWithGoogle')}</span></>}
            </button>
            {/* Trust microcopy — tells parents the supabase.co redirect is
                expected BEFORE they see it. Reduces "this feels fishy" bounce
                until the custom-domain migration lands. */}
            <p
              className="text-center mt-2 mb-2 font-body"
              style={{ fontSize: 11, color: 'rgba(18,67,70,0.55)', lineHeight: 1.4 }}
            >
              {t('auth.googleHint')}
            </p>
            {/* Multi-identity prevention — if parents log in with Google
                account A on phone and Google account B on laptop, each
                sees an empty state row in Supabase (one user_id per
                Google email). Inline warning pre-empts the confusion.
                See issue_multi_identity_sync.md in basic-memory. */}
            <p
              className="text-center mb-5 font-body"
              style={{ fontSize: 10, color: 'rgba(180,83,9,0.72)', lineHeight: 1.35, padding: '0 12px' }}
            >
              {t('auth.sameAccountHint')}
            </p>

            {/* ── Divider ── Polish-v2 pill divider: thin hairlines with
                cream pill label centered. Matches the "oder" breaks used
                elsewhere in the app (Laden CTA area). */}
            <div className="flex items-center gap-3 mb-5" aria-hidden="true">
              <div className="flex-1 h-px" style={{ background: 'rgba(180,83,9,0.18)' }} />
              <span
                className="font-label font-extrabold uppercase px-2.5 py-0.5 rounded-full"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  color: '#A83E2C',
                  background: 'rgba(254,243,199,0.7)',
                  border: '1px solid rgba(180,83,9,0.15)',
                }}
              >
                {t('auth.or')}
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(180,83,9,0.18)' }} />
            </div>

            {/* ── Fallback: email + password ── cream-gradient card with
                gold hairline border, matching DailyHabits / Pflege cards */}
            <div
              className="rounded-3xl p-6 mb-4"
              style={{
                background: 'linear-gradient(160deg, #fffdf5 0%, #fef3c7 100%)',
                border: '1px solid rgba(180,83,9,0.2)',
                boxShadow: '0 8px 32px rgba(180,83,9,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="font-label font-extrabold uppercase block"
                    style={{ fontSize: 10, letterSpacing: '0.22em', color: '#A83E2C' }}
                  >
                    {t('auth.parentEmail')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-4 font-body outline-none transition-all"
                      style={{
                        height: 52,
                        borderRadius: 14,
                        background: '#ffffff',
                        border: '1.5px solid rgba(180,83,9,0.2)',
                        color: '#124346',
                        fontSize: 15,
                        paddingRight: 44,
                      }}
                      placeholder={t('auth.emailPlaceholder')}
                    />
                    <span
                      className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none"
                      style={{ color: 'rgba(180,83,9,0.55)' }}
                    >mail</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className="font-label font-extrabold uppercase block"
                    style={{ fontSize: 10, letterSpacing: '0.22em', color: '#A83E2C' }}
                  >
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 font-body outline-none transition-all"
                      style={{
                        height: 52,
                        borderRadius: 14,
                        background: '#ffffff',
                        border: '1.5px solid rgba(180,83,9,0.2)',
                        color: '#124346',
                        fontSize: 15,
                        paddingRight: 44,
                      }}
                      placeholder={t('auth.passwordPlaceholder')}
                    />
                    <span
                      className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none"
                      style={{ color: 'rgba(180,83,9,0.55)' }}
                    >lock</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                    <span className="material-symbols-outlined text-lg" style={{ color: '#b91c1c' }}>error</span>
                    <p className="font-body text-sm" style={{ color: '#7f1d1d' }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full font-headline font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: '#124346',
                    color: '#fef3c7',
                    fontSize: 16,
                    boxShadow: '0 6px 18px -6px rgba(18,67,70,0.4)',
                    marginTop: 8,
                  }}
                >
                  <span>{busy ? t('auth.loading') : mode === 'login' ? t('auth.login') : t('auth.startFree')}</span>
                  {!busy && <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {mode === 'login' ? 'login' : 'bolt'}
                  </span>}
                </button>
              </form>
            </div>

            {/* Toggle login / signup — underline link, quiet */}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="w-full py-3 font-label font-bold transition-all flex items-center justify-center gap-1.5"
              style={{ color: '#124346' }}
            >
              <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationColor: 'rgba(18,67,70,0.3)' }}>
                {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
              </span>
              <span className="material-symbols-outlined text-base" style={{ color: 'rgba(18,67,70,0.5)' }}>{mode === 'login' ? 'person_add' : 'login'}</span>
            </button>
          </>
        )}

        {/* Legal footer — visible pre-auth so parents can read
            Datenschutz/Nutzungsbedingungen BEFORE creating an account */}
        <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-on-surface-variant/70">
          <a href="/impressum" className="hover:text-primary underline-offset-4 hover:underline font-label">
            Impressum
          </a>
          <span aria-hidden className="opacity-40">·</span>
          <a href="/datenschutz" className="hover:text-primary underline-offset-4 hover:underline font-label">
            Datenschutz
          </a>
          <span aria-hidden className="opacity-40">·</span>
          <a href="/nutzungsbedingungen" className="hover:text-primary underline-offset-4 hover:underline font-label">
            Nutzungsbedingungen
          </a>
        </footer>
      </div>
    </div>
  );
}
