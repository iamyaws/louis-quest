import type { VoiceContext, VoiceLine, VoiceHistory } from './types';

const DEFAULT_COOLDOWN_HOURS = 24;

// Filter lines down to candidates that match this context.
// Same-kind tags are OR; different-kind tags are AND.
export function matchesContext(line: VoiceLine, ctx: VoiceContext): boolean {
  if (!line.triggers.includes(ctx.trigger)) return false;
  if (line.timeOfDay && !line.timeOfDay.includes(ctx.timeOfDay)) return false;
  if (line.weather) {
    if (!ctx.weather) return false;
    if (!line.weather.includes(ctx.weather)) return false;
  }
  if (line.mood) {
    if (!ctx.mood) return false;
    if (!line.mood.includes(ctx.mood)) return false;
  }
  if (line.stage && !line.stage.includes(ctx.stage)) return false;
  if (line.careAction) {
    if (!ctx.careAction) return false;
    if (!line.careAction.includes(ctx.careAction)) return false;
  }
  if (line.arcPhase && line.arcPhase !== ctx.arcPhase) return false;
  if (line.minQuestsToday != null && ctx.questsCompletedToday < line.minQuestsToday) return false;
  // Trait gate — if line requires traits, at least one must be earned
  if (line.requiredTraits && line.requiredTraits.length > 0) {
    const earned = ctx.earnedTraits || [];
    const hasAny = line.requiredTraits.some(t => earned.includes(t));
    if (!hasAny) return false;
  }
  // requireAllTraits — every listed trait must be earned (for "many traits" lines)
  if (line.requireAllTraits && line.requireAllTraits.length > 0) {
    const earned = ctx.earnedTraits || [];
    const hasAll = line.requireAllTraits.every(t => earned.includes(t));
    if (!hasAll) return false;
  }
  return true;
}

function isOnCooldown(line: VoiceLine, history: VoiceHistory, now: number): boolean {
  const last = history[line.id];
  if (!last) return false;
  const cooldownMs = (line.cooldownHours ?? DEFAULT_COOLDOWN_HOURS) * 60 * 60 * 1000;
  return now - last < cooldownMs;
}

function weightedPick<T extends { weight?: number }>(
  items: T[],
  rand: () => number = Math.random,
): T | null {
  if (items.length === 0) return null;
  const weights = items.map(i => i.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[0];
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export interface PickLineOptions {
  now?: number; // unix ms, injected for tests
  rand?: () => number; // for tests
}

/**
 * Pick one line for this context, honoring cooldowns.
 * Returns null if nothing matches — caller decides whether to stay silent.
 * If all matching lines are on cooldown, ignores cooldown and picks one anyway
 * so Ronki still speaks (a repeat is better than silence).
 */
export function pickLine(
  ctx: VoiceContext,
  lines: VoiceLine[],
  history: VoiceHistory,
  opts: PickLineOptions = {},
): VoiceLine | null {
  const now = opts.now ?? Date.now();
  const rand = opts.rand ?? Math.random;

  const matching = lines.filter(line => matchesContext(line, ctx));
  if (matching.length === 0) return null;

  const fresh = matching.filter(line => !isOnCooldown(line, history, now));
  const pool = fresh.length > 0 ? fresh : matching;
  return weightedPick(pool, rand);
}

/** Return a new history with this line's timestamp updated. Pure. */
export function recordUse(
  lineId: string,
  history: VoiceHistory,
  now: number = Date.now(),
): VoiceHistory {
  return { ...history, [lineId]: now };
}

/** Drop history entries older than 48h to keep localStorage bounded. */
export function pruneHistory(history: VoiceHistory, now: number = Date.now()): VoiceHistory {
  const cutoff = now - 48 * 60 * 60 * 1000;
  const out: VoiceHistory = {};
  for (const [id, ts] of Object.entries(history)) {
    if (ts >= cutoff) out[id] = ts;
  }
  return out;
}
