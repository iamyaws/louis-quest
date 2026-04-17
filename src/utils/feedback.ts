import { supabase } from '../lib/supabase';

const QUEUE_KEY = 'ronki_feedback_queue';

export interface FeedbackPayload {
  message: string;
  screen?: string;
  ronki_stage?: number;
  cat_evo?: number;
  app_version?: string;
}

type QueuedItem = FeedbackPayload & { queued_at: string };

export async function submitFeedback(p: FeedbackPayload): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      queueFeedback(p);
      return { ok: false, error: 'not_authenticated' };
    }
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      message: p.message,
      screen: p.screen,
      ronki_stage: p.ronki_stage,
      cat_evo: p.cat_evo,
      app_version: p.app_version,
    });
    if (error) {
      queueFeedback(p);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e: any) {
    queueFeedback(p);
    return { ok: false, error: e?.message || 'network_error' };
  }
}

function queueFeedback(p: FeedbackPayload) {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const q: QueuedItem[] = raw ? JSON.parse(raw) : [];
    q.push({ ...p, queued_at: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch { /* ignore */ }
}

export async function flushFeedbackQueue(): Promise<number> {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return 0;
    const q: QueuedItem[] = JSON.parse(raw);
    if (q.length === 0) return 0;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const rows = q.map(item => ({
      user_id: user.id,
      message: item.message,
      screen: item.screen,
      ronki_stage: item.ronki_stage,
      cat_evo: item.cat_evo,
      app_version: item.app_version,
      created_at: item.queued_at,
    }));
    const { error } = await supabase.from('feedback').insert(rows);
    if (!error) {
      localStorage.removeItem(QUEUE_KEY);
      return rows.length;
    }
    return 0;
  } catch { return 0; }
}
