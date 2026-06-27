import { CharacterStats } from '../types';
import { clamp } from './economyEngine';

export interface MentalHealthContext {
  hadCrimeEvent?: boolean;
  hadDivorce?: boolean;
  lowHappiness?: boolean;
  neuroticism?: number;
  conscientiousness?: number;
}

export function tickMentalHealth(
  stats: CharacterStats,
  context: MentalHealthContext = {},
): CharacterStats {
  let delta = 0;
  if (stats.happiness < 30) delta -= 2;
  if (context.hadCrimeEvent) delta -= 5;
  if (context.hadDivorce) delta -= 8;
  if (stats.fitness > 60) delta += 1;
  
  if (context.neuroticism && context.neuroticism > 70) delta -= 2;
  if (context.conscientiousness && context.conscientiousness > 70) delta += 1;

  return { ...stats, mentalHealth: clamp(stats.mentalHealth + delta) };
}

export function applyMentalHealthRecovery(
  stats: CharacterStats,
  amount: number,
): CharacterStats {
  return { ...stats, mentalHealth: clamp(stats.mentalHealth + amount) };
}
