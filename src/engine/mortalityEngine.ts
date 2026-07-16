import type { CharacterStats } from '../types';

const BASE_YOUNG_CHANCE = 0.1;
const GOMPERTZ_DOUBLING_RATE = 1.06;
const MAX_DEATH_CHANCE = 40;
const ELDERLY_FLOOR_CHANCE = 8;

type MortalityStats = Pick<CharacterStats, 'health' | 'fitness' | 'mentalHealth'>;

/**
 * Gompertz-inspired annual death probability (0–100), modulated by country life expectancy.
 */
export function computeDeathChance(
  age: number,
  stats: MortalityStats,
  lifeExpectancy = 77,
): number {
  const gompertzOnsetAge = Math.max(35, lifeExpectancy - 42);
  const elderlyFloorAge = Math.max(88, lifeExpectancy + 8);

  const baseChance = age < gompertzOnsetAge
    ? BASE_YOUNG_CHANCE
    : BASE_YOUNG_CHANCE * Math.pow(GOMPERTZ_DOUBLING_RATE, age - gompertzOnsetAge);

  const healthMod = stats.health < 20
    ? 3.5
    : stats.health < 40
      ? 1.8
      : stats.health > 80
        ? 0.7
        : 1.0;

  const fitnessMod = stats.fitness > 70 ? 0.8 : stats.fitness < 30 ? 1.3 : 1.0;
  const mentalMod = stats.mentalHealth < 20 ? 1.5 : 1.0;

  const leMod = lifeExpectancy >= 82 ? 0.85 : lifeExpectancy <= 65 ? 1.15 : 1.0;

  let chance = baseChance * healthMod * fitnessMod * mentalMod * leMod;

  if (age >= elderlyFloorAge) {
    chance = Math.max(chance, ELDERLY_FLOOR_CHANCE);
  }

  return Math.min(MAX_DEATH_CHANCE, chance);
}
