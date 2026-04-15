import { supabase } from './supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'duplicate' | 'error' };

export async function submitWaitlistEmail(
  rawEmail: string,
  locale: 'de' | 'en' = 'de',
): Promise<WaitlistResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, reason: 'invalid' };
  }

  const { error } = await supabase.from('waitlist').insert({ email, locale });

  if (!error) return { ok: true };
  if (error.code === '23505') return { ok: false, reason: 'duplicate' };
  return { ok: false, reason: 'error' };
}
