/**
 * Supabase + nanoid wrapper for the Dark Pattern Scanner.
 *
 * Single insert per parent submission. Reads by id only (no enumeration).
 * Counter view exposes only counts per app_name, never individual evals.
 */

import { supabase } from '../supabase';
import type { AnswersMap } from './questions';

/**
 * 8-char nanoid using a parent-friendly alphabet (no ambiguous chars).
 * Collision probability at 1k inserts is ~ 1 in 100 million.
 */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export function newEvalId(): string {
  let id = '';
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 8; i++) {
    id += ALPHABET[arr[i] % ALPHABET.length];
  }
  return id;
}

export interface SaveEvalInput {
  appName: string;
  appIdCurated: string | null;
  answers: AnswersMap;
  score: number;
  locale?: 'de' | 'en';
}

export type SaveEvalResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'no-supabase' | 'duplicate' | 'error' };

export async function saveEval(input: SaveEvalInput): Promise<SaveEvalResult> {
  if (!supabase) {
    return { ok: false, reason: 'no-supabase' };
  }

  // Try up to 3 times in case of id collision (vanishingly rare)
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = newEvalId();
    const { error } = await supabase.from('app_evals').insert({
      id,
      app_name: input.appName.trim().slice(0, 100),
      app_id_curated: input.appIdCurated,
      answers: input.answers,
      score: input.score,
      client_locale: input.locale ?? 'de',
    });

    if (!error) {
      return { ok: true, id };
    }

    // 23505 = unique_violation, retry with new id
    if (error.code === '23505' && attempt < 2) continue;

    console.error('app_evals insert failed', error);
    return { ok: false, reason: 'error' };
  }

  return { ok: false, reason: 'duplicate' };
}

export interface FetchedEval {
  id: string;
  appName: string;
  appIdCurated: string | null;
  answers: AnswersMap;
  score: number;
  createdAt: string;
}

export async function fetchEval(id: string): Promise<FetchedEval | null> {
  if (!supabase) return null;
  if (!/^[a-z0-9]{8}$/i.test(id)) return null;

  const { data, error } = await supabase
    .from('app_evals')
    .select('id, app_name, app_id_curated, answers, score, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    appName: data.app_name,
    appIdCurated: data.app_id_curated,
    answers: data.answers as AnswersMap,
    score: data.score,
    createdAt: data.created_at,
  };
}

/**
 * Fetches the count of evaluations for a given app_name. Used as soft
 * social proof in the app-entry screen ("X parents have evaluated this").
 * Never exposes scores or individual eval contents.
 */
export async function fetchEvalCount(appName: string): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from('app_eval_counts')
    .select('n')
    .eq('app_name', appName.trim().slice(0, 100))
    .maybeSingle();

  if (error || !data) return 0;
  return Number(data.n) || 0;
}
