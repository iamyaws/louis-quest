import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

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

  // ── Signup confirmation ──
  if (signupDone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #fcd34d 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="w-full max-w-sm text-center relative z-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-container-highest flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(252,211,77,0.2)' }}>
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
          </div>
          <h2 className="font-headline text-3xl font-bold text-primary mb-3">Post ist da!</h2>

          <p className="font-body text-on-surface-variant mb-6 leading-relaxed">
            Wir haben einen magischen Link an <span className="font-bold text-primary">{email}</span> gesendet. Klicke darauf, um dein Konto zu aktivieren.
          </p>
          <div className="p-4 rounded-xl mb-6 flex items-start gap-3 text-left" style={{ background: 'rgba(232,225,219,0.5)' }}>
            <span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-body text-sm text-on-surface-variant">Der Link ist nur für kurze Zeit gültig.</span>
          </div>
          <button
            onClick={() => { setSignupDone(false); setMode('login'); }}
            className="font-label font-bold text-primary flex items-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  // ── Login / Signup form ──
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-6 relative overflow-hidden">
      {/* Cream brush texture */}
      <img src={`${import.meta.env.BASE_URL}art/bg-cream-brush.png`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
      {/* Subtle gradient overlays */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Ronki hero + egg */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full opacity-20" style={{ background: '#fcd34d', filter: 'blur(32px)' }} />
            <img
              src={`${import.meta.env.BASE_URL}art/hero-character.svg`}
              alt="Ronki"
              className="relative z-10 w-48 h-auto drop-shadow-xl rounded-2xl"
            />
          </div>
          <h2 className="font-headline font-extrabold text-2xl text-on-surface text-center">
            {mode === 'login' ? 'Willkommen zurück!' : 'Werde ein Held!'}
          </h2>
          <p className="font-body text-on-surface-variant mt-1 text-base opacity-80">
            {mode === 'login' ? 'Begib dich auf deine Heldenreise' : 'Erstelle dein Helden-Konto'}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl p-8 mb-4" style={{ boxShadow: '0 8px 32px rgba(18,67,70,0.04)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label text-xs font-semibold text-primary/70 px-1 block">
                E-Mail der Eltern
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-14 px-5 rounded-full bg-surface-container-low border border-outline-variant/30 font-body text-on-surface placeholder:text-outline-variant/60 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  placeholder="name@beispiel.de"
                />
                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant/60 group-focus-within:text-primary/60 text-xl transition-colors">mail</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-xs font-semibold text-primary/70 px-1 block">
                Passwort
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-14 px-5 rounded-full bg-surface-container-low border border-outline-variant/30 font-body text-on-surface placeholder:text-outline-variant/60 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                  placeholder="Mindestens 6 Zeichen"
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
              <span>{busy ? 'Laden...' : mode === 'login' ? 'Anmelden' : 'Kostenlos starten'}</span>
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
          <span>{mode === 'login' ? 'Ich habe noch kein Konto' : 'Ich habe bereits ein Konto'}</span>
          <span className="material-symbols-outlined text-primary/40 text-lg">{mode === 'login' ? 'person_add' : 'login'}</span>
        </button>
      </div>
    </div>
  );
}
