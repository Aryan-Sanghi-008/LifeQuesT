import type { CharacterStats } from '../types';

/** Base annual death chance (%) before stat modifiers. */
const BASE_YOUNG_CHANCE = 0.1;
const GOMPERTZ_ONSET_AGE = 40;
const GOMPERTZ_DOUBLING_RATE = 1.06;
const MAX_DEATH_CHANCE = 40;
const ELDERLY_FLOOR_AGE = 95;
const ELDERLY_FLOOR_CHANCE = 8;

type MortalityStats = Pick<CharacterStats, 'health' | 'fitness' | 'mentalHealth'>;

/**
 * Gompertz-inspired annual death probability (0–100).
 * Negligible under 40; softer ramp than v1; floor pressure at 95+.
 */
export function computeDeathChance(age: number, stats: MortalityStats): number {
  const baseChance = age < GOMPERTZ_ONSET_AGE
    ? BASE_YOUNG_CHANCE
    : BASE_YOUNG_CHANCE * Math.pow(GOMPERTZ_DOUBLING_RATE, age - GOMPERTZ_ONSET_AGE);

  const healthMod = stats.health < 20
    ? 3.5
    : stats.health < 40
      ? 1.8
      : stats.health > 80
        ? 0.7
        : 1.0;

  const fitnessMod = stats.fitness > 70 ? 0.8 : stats.fitness < 30 ? 1.3 : 1.0;
  const mentalMod = stats.mentalHealth < 20 ? 1.5 : 1.0;

  let chance = baseChance * healthMod * fitnessMod * mentalMod;

  if (age >= ELDERLY_FLOOR_AGE) {
    chance = Math.max(chance, ELDERLY_FLOOR_CHANCE);
  }

  return Math.min(MAX_DEATH_CHANCE, chance);
}
