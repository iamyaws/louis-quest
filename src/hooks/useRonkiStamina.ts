import { useTask } from '../context/TaskContext';

// Recharge rate halved from 40 to 20 min (22 Apr 2026) so that an empty
// stamina bar refills in ~3h30m at max 10 (instead of 3h20m at max 5 before
// the rework, which felt punishingly slow to Louis).
const RECHARGE_MINUTES = 20;
const DEFAULT_MAX = 10;

export interface StaminaInfo {
  /** Current effective stamina (after lazy recharge). Capped at max. */
  current: number;
  /** Max stamina cap (parent-configurable via minigameStaminaMax). */
  max: number;
  recharging: boolean;
  nextRechargeMin: number;
  /** True when the kid cannot play another game. Always false in 'frei' mode. */
  exhausted: boolean;
  /** True when stamina is low (≤ 20% of max). Always false in 'frei' mode. */
  low: boolean;
  /** True when stamina is disabled entirely (access mode = 'frei'). */
  unlimited: boolean;
}

/**
 * Computes effective stamina with lazy recharge based on elapsed time.
 *
 * Changes Apr 2026:
 *  - Max is now parent-configurable (state.minigameStaminaMax). Default 10.
 *    Old default was 5; existing saves still read 5 via the `?? MAX_STAMINA`
 *    fallback in TaskContext hydration — but fresh installs get 10.
 *  - Recharge halved from 40min to 20min so the kid doesn't spend half the
 *    day waiting for the bar to fill.
 *  - 'frei' mode: stamina is reported as unlimited. current == max, never
 *    exhausted, never low. Consumers still render the bar if they want, but
 *    `unlimited: true` is the signal to hide it.
 */
export function useRonkiStamina(): StaminaInfo {
  const { state } = useTask();
  const max = state?.minigameStaminaMax ?? DEFAULT_MAX;
  const mode = state?.minigameAccessMode ?? 'frei';

  // 'frei' mode = no stamina cost, no bar pressure. Report full + unlimited
  // so components can (a) skip rendering the stamina chip and (b) never hit
  // the exhausted voiceline.
  if (mode === 'frei') {
    return {
      current: max,
      max,
      recharging: false,
      nextRechargeMin: 0,
      exhausted: false,
      low: false,
      unlimited: true,
    };
  }

  const base = state?.ronkiStamina ?? max;
  const updatedAt = state?.ronkiStaminaUpdatedAt;
  const lowThreshold = Math.max(1, Math.round(max * 0.2));

  if (!updatedAt || base >= max) {
    return {
      current: Math.min(max, base),
      max,
      recharging: false,
      nextRechargeMin: 0,
      exhausted: base <= 0,
      low: base <= lowThreshold,
      unlimited: false,
    };
  }
  const elapsedMs = Date.now() - new Date(updatedAt).getTime();
  const elapsedMin = elapsedMs / 60000;
  const gained = Math.floor(elapsedMin / RECHARGE_MINUTES);
  const current = Math.min(max, base + gained);
  const nextRechargeMin = current >= max ? 0 : Math.max(0, RECHARGE_MINUTES - (elapsedMin % RECHARGE_MINUTES));

  return {
    current,
    max,
    recharging: current < max,
    nextRechargeMin: Math.ceil(nextRechargeMin),
    exhausted: current <= 0,
    low: current <= lowThreshold,
    unlimited: false,
  };
}
