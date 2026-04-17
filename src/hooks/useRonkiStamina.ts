import { useTask } from '../context/TaskContext';

const MAX_STAMINA = 5;
const RECHARGE_MINUTES = 40;

export interface StaminaInfo {
  current: number;
  max: number;
  recharging: boolean;
  nextRechargeMin: number;
  exhausted: boolean;
  low: boolean;
}

/** Computes effective stamina with lazy recharge based on elapsed time. */
export function useRonkiStamina(): StaminaInfo {
  const { state } = useTask();
  const base = state?.ronkiStamina ?? MAX_STAMINA;
  const updatedAt = state?.ronkiStaminaUpdatedAt;

  if (!updatedAt || base >= MAX_STAMINA) {
    return {
      current: Math.min(MAX_STAMINA, base),
      max: MAX_STAMINA,
      recharging: false,
      nextRechargeMin: 0,
      exhausted: base <= 0,
      low: base <= 2,
    };
  }
  const elapsedMs = Date.now() - new Date(updatedAt).getTime();
  const elapsedMin = elapsedMs / 60000;
  const gained = Math.floor(elapsedMin / RECHARGE_MINUTES);
  const current = Math.min(MAX_STAMINA, base + gained);
  const nextRechargeMin = current >= MAX_STAMINA ? 0 : Math.max(0, RECHARGE_MINUTES - (elapsedMin % RECHARGE_MINUTES));

  return {
    current,
    max: MAX_STAMINA,
    recharging: current < MAX_STAMINA,
    nextRechargeMin: Math.ceil(nextRechargeMin),
    exhausted: current <= 0,
    low: current <= 2,
  };
}
