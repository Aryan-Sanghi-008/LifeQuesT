import { Character, LifeEvent, EventRarity } from '../types';
import { getAllLoadedEvents } from '../data/events/eventLoader';
import { isEventBlockedByCrime, isInJail } from './crimeEngine';
import { filterByMemoryEligibility } from './memoryEngine';
import {
  applyFocusEventWeights,
  resolveFocusAllocationForAgeUp,
} from './focusEngine';
import { applyLiveOpsWorldEventBoost, getHydratedLiveOpsConfig } from './liveOpsEngine';
import { scaleEventBankEffect } from './countryScaleEngine';
import { getPersonalityMods } from './personalityModifiers';
import { applyTraitEventWeights } from './traitEngine';
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
  if (event.requiresFollowers !== undefined
    && (character.socialFollowers ?? 0) < event.requiresFollowers) {
    return false;
  }
  return true;
}

export function applyPersonalityEventWeights(
  events: LifeEvent[],
  personality?: Character['personality'],
): LifeEvent[] {
  if (!personality) return events;
  const mods = getPersonalityMods(personality).eventWeightDelta;
  const categoryKey: Record<string, keyof typeof mods> = {
    relationship: 'social',
    social: 'social',
    career: 'career',
    health: 'health',
    financial: 'financial',
    random: 'random',
    milestone: 'career',
    travel: 'random',
    family: 'social',
    crime: 'random',
    education: 'career',
  };
  return events.map((e) => {
    const key = categoryKey[e.category] ?? 'random';
    const delta = mods[key] ?? 0;
    if (!delta) return e;
    return { ...e, weight: Math.max(0.1, (e.weight ?? 1) * (1 + delta)) };
  });
}

export { ensureEventsLoadedForAge, preloadAllEventPacks, preloadAdjacentEventPacks } from '../data/events/eventLoader';

export function getEligibleEvents(age: number, character: Character): LifeEvent[] {
  const usedIds = character.eventHistory.map(e => e.id);
  return getAllLoadedEvents().filter(e => isEligible(e, age, usedIds, character));
}

export function getWeightedEligibleEvents(age: number, character: Character): LifeEvent[] {
  const eligible = getEligibleEvents(age, character);
  const memoryFiltered = filterByMemoryEligibility(eligible, character);
  const allocation = resolveFocusAllocationForAgeUp(character);
  const focused = applyFocusEventWeights(memoryFiltered, allocation, character.aspirations);
  const personalityWeighted = applyPersonalityEventWeights(focused, character.personality);
  const traitWeighted = applyTraitEventWeights(personalityWeighted, character.traits ?? []);
  const worldEventIds = getHydratedLiveOpsConfig()?.worldEvents ?? [];
  return applyLiveOpsWorldEventBoost(traitWeighted, worldEventIds);
}

/** Boost epic/legendary event weights when mystery-box rare_event unlock is active. */
export function applyEpicUnlockBoost(events: LifeEvent[]): LifeEvent[] {
  return events.map((e) => {
    const rarity = resolveEventRarity(e);
    if (rarity === 'epic' || rarity === 'legendary') {
      return { ...e, weight: (e.weight ?? 1) * 5 };
    }
    return e;
  });
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
    const schoolStart = getAllLoadedEvents().find(e => e.id === 'school_start');
    if (schoolStart && isEligible(schoolStart, age, [...usedIds], character)) {
      guaranteed.push(schoolStart);
    }
  }

  return guaranteed;
}

export function applySuccessChance(
  chance: number | undefined,
  luckBonusPercent: number,
  luckBoostsRemaining = 0,
): boolean {
  if (chance === undefined) return true;
  let adjusted = luckBonusPercent > 0
    ? Math.min(100, chance + luckBonusPercent)
    : chance;
  if (luckBoostsRemaining > 0) adjusted = Math.min(100, adjusted + 15);
  return Math.random() * 100 < adjusted;
}

export function consumeLuckBoost(luckBonusPercent: number, luckBoostsRemaining: number, hadChance: boolean): number {
  if (!hadChance || luckBoostsRemaining <= 0) return luckBoostsRemaining;
  if (luckBonusPercent < 20) return luckBoostsRemaining - 1;
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
export function resolveEventRarity(event: LifeEvent, countryCode?: string): EventRarity {
  if (event.rarity) return event.rarity;

  const weight = event.weight ?? 10;
  const rawBank = Math.abs(event.bankEffect ?? 0);
  const bankMagnitude = countryCode && rawBank > 0
    ? Math.abs(scaleEventBankEffect(
      event.bankEffect ?? 0,
      countryCode,
      event.category === 'crime' ? 'fine' : 'cost',
      event.category,
    ))
    : rawBank;

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
