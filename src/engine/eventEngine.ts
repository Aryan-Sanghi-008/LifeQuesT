import { Character, LifeEvent } from '../types';
import { LIFE_EVENTS } from '../data/gameData';

export function hasJob(character: Character): boolean {
  return character.career !== null || (
    character.job !== 'Student' &&
    character.job !== 'Unemployed' &&
    character.job !== 'Retired'
  );
}

export function isEligible(
  event: LifeEvent,
  age: number,
  usedIds: string[],
  character: Character,
): boolean {
  if (age < event.minAge || age > event.maxAge) return false;
  if (event.oneTime && usedIds.includes(event.id)) return false;
  if (event.requiresTrait && !character.traits.includes(event.requiresTrait)) return false;
  if (event.requiresJob && !hasJob(character)) return false;
  if (event.requiresEducation) {
    const levels = ['none', 'elementary', 'secondary', 'university', 'graduate'];
    if (levels.indexOf(character.educationLevel) < levels.indexOf(event.requiresEducation)) return false;
  }
  if (event.requiresStat) {
    for (const [k, min] of Object.entries(event.requiresStat)) {
      const statVal = (character.stats as unknown as Record<string, number>)[k] ?? 0;
      if (statVal < (min as number)) return false;
    }
  }
  return true;
}

export function getEligibleEvents(age: number, character: Character): LifeEvent[] {
  const usedIds = character.eventHistory.map(e => e.id);
  return LIFE_EVENTS.filter(e => isEligible(e, age, usedIds, character));
}

export function pickEvents(eligible: LifeEvent[], count: number): LifeEvent[] {
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function applySuccessChance(
  chance: number | undefined,
  isLucky: boolean,
  luckBoostsRemaining = 0,
): boolean {
  if (chance === undefined) return true;
  let adjusted = isLucky ? Math.min(100, chance + 10) : chance;
  if (luckBoostsRemaining > 0) adjusted = Math.min(100, adjusted + 15);
  return Math.random() * 100 < adjusted;
}

export function consumeLuckBoost(isLucky: boolean, luckBoostsRemaining: number, hadChance: boolean): number {
  if (!hadChance || luckBoostsRemaining <= 0) return luckBoostsRemaining;
  if (!isLucky) return luckBoostsRemaining - 1;
  return luckBoostsRemaining;
}
