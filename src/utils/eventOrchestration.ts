/**
 * Event orchestration — post-onboarding "quiet window" for surfaces that
 * pop up on their own and demand the kid's attention.
 *
 * Problem: a fresh kid (or a returning kid logging back in after a
 * long break) lands in the Hub and gets ambushed by event-style cards —
 * "Besuch am Lagerfeuer", a Freund callback, an expedition return. The
 * brand spine ("companion that fades by design — not retention-
 * optimized") wants the opposite: the first session should feel like
 * the kid woke up next to Ronki, not like a Slack inbox.
 *
 * Before this module existed, three surfaces enforced their own
 * day-since-onboarding gate inline:
 *   · Hub.jsx voice greeting        (`daysSince >= 2`)
 *   · FreundCallbackCard            (`daysSince < 2 → return null`)
 *   · CampfireVisitor card          — MISSING, hence Marc's flag 24 Apr 2026
 *
 * Each surface duplicated the math + magic number, and it was easy for a
 * new event surface to forget the gate entirely (which is exactly what
 * happened with the visitor card).
 *
 * This module:
 *   · Centralises `daysSinceOnboarding(state)` so every gate measures
 *     the same way.
 *   · Lets each event surface declare its own quiet-window threshold
 *     in one config table (`QUIET_DAYS`) so future surfaces (expedition
 *     returns, weekly recaps, Wave-3 callbacks) just add a key and the
 *     orchestration picks them up automatically.
 *
 * NOT for kid-initiated UI (the quest list, mood card, Hub navigation).
 * Those are core utility — the kid asked for them. This is only for
 * "things that pop up on their own and demand attention."
 */

/** Surfaces that participate in the post-onboarding quiet window. */
export type EventSurface =
  /** Hub greeting voiceline played by Drachenmutter on Hub mount. */
  | 'voiceGreeting'
  /** "Besuch am Lagerfeuer" card in Hub feed (CampfireVisitorsGame). */
  | 'visitor'
  /** Freund-arc beat-4 callback ("Der ... war hier"). */
  | 'friendCallback';

/**
 * How many days post-onboarding each surface should stay quiet.
 *
 * Day 0 = onboarding day. Day 1 = day after. Setting `2` means the
 * surface is suppressed on day 0 and day 1, allowed from day 2.
 *
 * Add new event surfaces here. Lower numbers = louder; higher = quieter.
 */
const QUIET_DAYS: Record<EventSurface, number> = {
  voiceGreeting:  2,
  visitor:        2,
  friendCallback: 2,
};

/** Compute calendar days between an ISO date string and now. */
export function daysSinceOnboarding(onboardingDate: string | null | undefined): number {
  if (!onboardingDate) return 0;
  const start = new Date(onboardingDate).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if this event surface should be suppressed because the
 * user is still inside its post-onboarding quiet window. Use to gate
 * "event"-style cards so a fresh kid isn't ambushed in their first
 * sessions.
 *
 * Legacy accounts without an `onboardingDate` (pre-anchor users) are
 * treated as "we don't know when they started — don't gate based on
 * onboarding age". They've been around long enough that the quiet
 * window doesn't apply; they fall through to whatever other gates the
 * surface uses (task counts, frequency, etc.).
 *
 * Example:
 *   if (isEventSuppressed(state.onboardingDate, 'visitor')) return null;
 */
export function isEventSuppressed(
  onboardingDate: string | null | undefined,
  surface: EventSurface,
): boolean {
  if (!onboardingDate) return false;
  return daysSinceOnboarding(onboardingDate) < QUIET_DAYS[surface];
}
