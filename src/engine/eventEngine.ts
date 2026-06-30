import { Character, LifeEvent, EventRarity } from '../types';
import { LIFE_EVENTS } from '../data/gameData';
import { isEventBlockedByCrime, isInJail } from './crimeEngine';
import { filterByMemoryEligibility } from './memoryEngine';
import {
  applyFocusEventWeights,
  resolveFocusAllocationForAgeUp,
} from './focusEngine';
import type { EducationStage } from '../data/educationDegrees';

export function hasJob(character: Character): boolean {
  if (isInJail(character)) return false;
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
  if (event.requiresCountry && !event.requiresCountry.includes(character.countryCode)) return false;
  if (event.requiresKarmaMin !== undefined && character.karma < event.requiresKarmaMin) return false;
  if (event.requiresMentalHealthBelow !== undefined
    && character.stats.mentalHealth >= event.requiresMentalHealthBelow) return false;
  if (isEventBlockedByCrime(character, event)) return false;
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
  if (event.requiresScenario) {
    const charScenario = character.scenarioId ?? 'classic';
    if (!event.requiresScenario.includes(charScenario)) return false;
  }
  return true;
}

export function getEligibleEvents(age: number, character: Character): LifeEvent[] {
  const usedIds = character.eventHistory.map(e => e.id);
  return LIFE_EVENTS.filter(e => isEligible(e, age, usedIds, character));
}

export function getWeightedEligibleEvents(age: number, character: Character): LifeEvent[] {
  const eligible = getEligibleEvents(age, character);
  const memoryFiltered = filterByMemoryEligibility(eligible, character);
  const allocation = resolveFocusAllocationForAgeUp(character);
  return applyFocusEventWeights(memoryFiltered, allocation, character.aspirations);
}

/**
 * Weighted random selection without replacement.
 */
export function pickWeightedEvents(eligible: LifeEvent[], count: number): LifeEvent[] {
  if (count <= 0 || eligible.length === 0) return [];

  const pool = [...eligible];
  const picked: LifeEvent[] = [];
  const pickCount = Math.min(count, pool.length);

  for (let i = 0; i < pickCount; i++) {
    const totalWeight = pool.reduce((sum, e) => sum + (e.weight ?? 1), 0);
    let roll = Math.random() * totalWeight;
    let idx = 0;
    for (let j = 0; j < pool.length; j++) {
      roll -= pool[j].weight ?? 1;
      if (roll <= 0) {
        idx = j;
        break;
      }
    }
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return picked;
}

/** @deprecated Use pickWeightedEvents */
export function pickEvents(eligible: LifeEvent[], count: number): LifeEvent[] {
  return pickWeightedEvents(eligible, count);
}

/**
 * Milestone events that must fire when age/education conditions are met.
 * Skips school_start if age-based education already progressed past none.
 */
export function getGuaranteedMilestones(age: number, character: Character): LifeEvent[] {
  const usedIds = new Set(character.eventHistory.map(e => e.id));
  const guaranteed: LifeEvent[] = [];

  const stage = (character.educationStage as EducationStage | undefined) ?? 'none';
  const eduStillNone = stage === 'none' && character.educationLevel === 'none';

  if (age === 5 && eduStillNone && !usedIds.has('school_start')) {
    const schoolStart = LIFE_EVENTS.find(e => e.id === 'school_start');
    if (schoolStart && isEligible(schoolStart, age, [...usedIds], character)) {
      guaranteed.push(schoolStart);
    }
  }

  return guaranteed;
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

const LEGENDARY_EVENT_IDS = new Set([
  'ipo_windfall',
  'bankruptcy',
  'school_start',
  'first_job',
  'marriage',
  'first_child',
  'death_of_parent',
]);

/**
 * Assigns a display rarity tier when event data omits `rarity`.
 * Explicit `event.rarity` always wins.
 */
export function resolveEventRarity(event: LifeEvent): EventRarity {
  if (event.rarity) return event.rarity;

  const weight = event.weight ?? 10;
  const bankMagnitude = Math.abs(event.bankEffect ?? 0);

  if (LEGENDARY_EVENT_IDS.has(event.id)) return 'legendary';
  if (event.oneTime && weight <= 2) return 'legendary';
  if (event.chainId && (event.chainStep ?? 0) >= 3) return 'legendary';

  if (event.oneTime) return 'epic';
  if (event.chainId) return 'epic';
  if (event.category === 'milestone') return 'epic';

  if (weight <= 3 || bankMagnitude >= 75000) return 'rare';
  if (event.category === 'crime') return 'rare';

  if ((event.choices?.length ?? 0) > 0) return 'uncommon';
  if (weight <= 6) return 'uncommon';
  if (event.category === 'financial' && bankMagnitude >= 20000) return 'uncommon';

  return 'common';
}
