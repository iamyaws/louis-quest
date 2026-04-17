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

  if (!supabase) {
    console.warn('Supabase not configured — waitlist submission skipped.');
    return { ok: false, reason: 'error' };
  }

  const { error } = await supabase.from('waitlist').insert({ email, locale });

  if (!error) return { ok: true };
  if (error.code === '23505') return { ok: false, reason: 'duplicate' };
  return { ok: false, reason: 'error' };
}

/* ------------------------------------------------------------------ */
/* Screener                                                            */
/* ------------------------------------------------------------------ */

export type ChildAge = '5-6' | '7-8' | '9-10' | 'älter';
export type Challenge = 'morgen' | 'abend' | 'hausaufgaben' | 'bildschirmzeit' | 'anderes';
export type WillingToTest = 'ja' | 'vielleicht' | 'später';

export interface ScreenerData {
  email: string;
  childAge: ChildAge;
  challenge: Challenge;
  willingToTest: WillingToTest;
}

export async function submitScreener(
  data: ScreenerData,
): Promise<{ ok: boolean }> {
  if (!supabase) return { ok: false };

  const { data: result, error } = await supabase.rpc('update_waitlist_screener', {
    p_email: data.email.trim().toLowerCase(),
    p_child_age: data.childAge,
    p_challenge: data.challenge,
    p_willing_to_test: data.willingToTest,
  });

  if (error) return { ok: false };
  return { ok: !!result };
}
