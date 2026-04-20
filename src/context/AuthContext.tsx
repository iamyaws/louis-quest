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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
  return (
    <div className="flex items-center justify-center min-h-dvh bg-background px-6 relative overflow-hidden">
      {/* Cream brush texture */}
      <img src={`${import.meta.env.BASE_URL}art/bg-cream-brush.png`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
      {/* Subtle gradient overlays */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Ronki logo — word mark with boy + dragon egg */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full opacity-25" style={{ background: '#fcd34d', filter: 'blur(48px)' }} />
            <img
              src={`${import.meta.env.BASE_URL}art/logo/ronki-logo-hero.webp`}
              alt="Ronki"
              className="relative z-10 w-64 sm:w-72 h-auto drop-shadow-xl rounded-2xl"
            />
          </div>
          <p className="font-body text-on-surface-variant mt-2 text-base opacity-80 text-center">
            {mode === 'login' ? t('auth.heroJourney') : t('auth.createAccount')}
          </p>
        </div>

        {view === 'magic' ? (
          // ── Magic-link simplified form ──
          <div className="bg-white rounded-xl p-8 mb-4" style={{ boxShadow: '0 8px 32px rgba(18,67,70,0.04)' }}>
            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-xs font-semibold text-primary/70 px-1 block">
                  {t('auth.parentEmail')}
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full h-14 px-5 rounded-full bg-surface-container-low border border-outline-variant/30 font-body text-on-surface placeholder:text-outline-variant/60 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    placeholder={t('auth.emailPlaceholder')}
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant/60 group-focus-within:text-primary/60 text-xl transition-colors">mail</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-error-container flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-lg">error</span>
                  <p className="font-body text-sm text-on-error-container">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={magicBusy}
                className="w-full py-5 bg-primary text-on-primary font-headline font-bold text-base rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <span>{magicBusy ? t('auth.loading') : t('auth.sendMagicLink')}</span>
                {!magicBusy && <span className="material-symbols-outlined text-secondary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>}
              </button>

              <button
                type="button"
                onClick={() => { setView('options'); setError(null); }}
                className="w-full py-3 text-primary font-label font-semibold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                {t('auth.backToOptions')}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* ── Primary: Google ── */}
            {/* TODO(Marc): Enable Google provider in Supabase dashboard before this button does anything.
                Auth → Providers → Google → enable + paste Client ID/Secret from Google Cloud Console. */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleBusy}
              className="w-full py-4 mb-3 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
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

            {/* ── Secondary: Magic Link ── */}
            <button
              type="button"
              onClick={() => { setView('magic'); setError(null); }}
              className="w-full py-4 mb-5 rounded-2xl font-headline font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-all"
              style={{
                background: '#fef3c7',
                color: '#124346',
                border: '1.5px solid rgba(180,83,9,0.3)',
              }}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              <span>{t('auth.signInWithEmailLink')}</span>
            </button>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5" aria-hidden="true">
              <div className="flex-1 h-px" style={{ background: 'rgba(18,67,70,0.12)' }} />
              <span
                className="font-label text-xs uppercase tracking-wider px-2 rounded-full"
                style={{ color: 'rgba(18,67,70,0.6)', background: '#fff8f2' }}
              >
                {t('auth.or')}
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(18,67,70,0.12)' }} />
            </div>

            {/* ── Fallback: email + password ── */}
            <div className="bg-white rounded-xl p-8 mb-4" style={{ boxShadow: '0 8px 32px rgba(18,67,70,0.04)' }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label text-xs font-semibold text-primary/70 px-1 block">
                    {t('auth.parentEmail')}
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full h-14 px-5 rounded-full bg-surface-container-low border border-outline-variant/30 font-body text-on-surface placeholder:text-outline-variant/60 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder={t('auth.emailPlaceholder')}
                    />
                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant/60 group-focus-within:text-primary/60 text-xl transition-colors">mail</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-xs font-semibold text-primary/70 px-1 block">
                    {t('auth.password')}
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full h-14 px-5 rounded-full bg-surface-container-low border border-outline-variant/30 font-body text-on-surface placeholder:text-outline-variant/60 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      placeholder={t('auth.passwordPlaceholder')}
                    />
                    <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant/60 group-focus-within:text-primary/60 text-xl transition-colors">lock</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-error-container flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-lg">error</span>
                    <p className="font-body text-sm text-on-error-container">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-5 bg-primary text-on-primary font-headline font-bold text-base rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <span>{busy ? t('auth.loading') : mode === 'login' ? t('auth.login') : t('auth.startFree')}</span>
                  {!busy && <span className="material-symbols-outlined text-secondary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {mode === 'login' ? 'login' : 'bolt'}
                  </span>}
                </button>
              </form>
            </div>

            {/* Toggle as secondary button */}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="w-full py-4 text-primary font-headline font-semibold rounded-2xl hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
            >
              <span>{mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}</span>
              <span className="material-symbols-outlined text-primary/40 text-lg">{mode === 'login' ? 'person_add' : 'login'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
