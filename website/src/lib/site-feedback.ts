import { supabase } from './supabase';

export interface SiteFeedbackSubmission {
  message: string;
  email: string | null;
  source: string;
  locale?: 'de' | 'en';
}

export type SiteFeedbackResult = { ok: true } | { ok: false; reason: 'invalid' | 'error' };

/**
 * Submits an anonymous feedback/topic-request to the public.site_feedback table.
 * Mirrors the RLS CHECK constraint: message length 4..4000, email must look valid.
 */
export async function submitSiteFeedback(
  data: SiteFeedbackSubmission,
): Promise<SiteFeedbackResult> {
  const message = data.message.trim();
  const email = (data.email || '').trim() || null;
  const source = data.source.trim() || 'unknown';
  const locale = data.locale || 'de';

  if (message.length < 4 || message.length > 4000) {
    return { ok: false, reason: 'invalid' };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, reason: 'invalid' };
  }

  if (!supabase) {
    console.warn('Supabase not configured, site_feedback submission skipped.');
    return { ok: false, reason: 'error' };
  }

  const { error } = await supabase.from('site_feedback').insert({
    message,
    email,
    source,
    locale,
  });

  if (error) {
    console.error('site_feedback insert failed', error);
    return { ok: false, reason: 'error' };
  }
  return { ok: true };
}
