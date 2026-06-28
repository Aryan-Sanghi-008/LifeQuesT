import type {
  Character,
  CharacterAspirations,
  CharacterStats,
  FocusAllocation,
  FocusDomain,
  LifeEvent,
} from '../types';
import { clamp } from './economyEngine';
import { FOCUS_DOMAIN_MAP } from '../data/focusDomains';
import { ASPIRATION_MAP } from '../data/aspirations';

export const FOCUS_POINTS_PER_YEAR = 3;
export const MAX_FOCUS_PER_DOMAIN = 2;
export const CHILD_AUTO_FOCUS_MAX_AGE = 12;

const CATEGORY_WEIGHT_1: Record<FocusDomain, number> = {
  career: 1.25,
  education: 1.2,
  health: 1.15,
  social: 1.2,
  finance: 1.15,
  hobby: 1.25,
  crime: 1.2,
  family: 1.25,
};

const CATEGORY_WEIGHT_2: Record<FocusDomain, number> = {
  career: 1.5,
  education: 1.4,
  health: 1.3,
  social: 1.4,
  finance: 1.3,
  hobby: 1.55,
  crime: 1.45,
  family: 1.5,
};

const BACKGROUND_FOCUS: Record<Character['familyBackground'], FocusAllocation> = {
  poor: { education: 2, health: 1 },
  middle: { education: 1, career: 1, family: 1 },
  wealthy: { finance: 1, education: 1, social: 1 },
  royalty: { family: 2, social: 1 },
};

export function getAutoChildFocus(character: Pick<Character, 'familyBackground'>): FocusAllocation {
  return { ...BACKGROUND_FOCUS[character.familyBackground] };
}

export function sumFocusPoints(allocation: FocusAllocation): number {
  return Object.values(allocation).reduce((sum, n) => sum + (n ?? 0), 0);
}

export function validateFocusAllocation(
  age: number,
  allocation: FocusAllocation,
): { valid: boolean; message?: string; normalized?: FocusAllocation } {
  if (age <= CHILD_AUTO_FOCUS_MAX_AGE) {
    return { valid: true, normalized: getAutoChildFocus({ familyBackground: 'middle' }) };
  }

  const total = sumFocusPoints(allocation);
  if (total !== FOCUS_POINTS_PER_YEAR) {
    return { valid: false, message: `Allocate exactly ${FOCUS_POINTS_PER_YEAR} focus points.` };
  }

  for (const [, points] of Object.entries(allocation)) {
    if ((points ?? 0) > MAX_FOCUS_PER_DOMAIN) {
      return { valid: false, message: `Max ${MAX_FOCUS_PER_DOMAIN} points per domain.` };
    }
    if ((points ?? 0) < 0) {
      return { valid: false, message: 'Focus points cannot be negative.' };
    }
  }

  return { valid: true, normalized: allocation };
}

export function getFocusCategoryWeight(domain: FocusDomain, points: number): number {
  if (points <= 0) return 1;
  if (points === 1) return CATEGORY_WEIGHT_1[domain];
  return CATEGORY_WEIGHT_2[domain];
}

function eventMatchesDomain(event: LifeEvent, domain: FocusDomain): boolean {
  const def = FOCUS_DOMAIN_MAP[domain];
  if (event.focusDomain === domain) return true;
  return def.categories.includes(event.category);
}

export function getEventFocusWeight(
  event: LifeEvent,
  allocation: FocusAllocation,
  aspirations?: CharacterAspirations,
): number {
  let weight = event.weight ?? 1;

  for (const domain of Object.keys(allocation) as FocusDomain[]) {
    const points = allocation[domain] ?? 0;
    if (points > 0 && eventMatchesDomain(event, domain)) {
      weight *= getFocusCategoryWeight(domain, points);
    }
  }

  if (aspirations) {
    const primary = ASPIRATION_MAP[aspirations.primary];
    const secondary = ASPIRATION_MAP[aspirations.secondary];
    if (primary.categories.includes(event.category)) weight *= 1.3;
    if (secondary.categories.includes(event.category)) weight *= 1.15;
  }

  return weight;
}

export function applyFocusEventWeights(
  events: LifeEvent[],
  allocation: FocusAllocation,
  aspirations?: CharacterAspirations,
): LifeEvent[] {
  return events.map(event => ({
    ...event,
    weight: getEventFocusWeight(event, allocation, aspirations),
  }));
}

export function applyFocusStatModifiers(
  stats: CharacterStats,
  allocation: FocusAllocation,
): CharacterStats {
  const next = { ...stats };

  const careerPts = allocation.career ?? 0;
  const eduPts = allocation.education ?? 0;
  const healthPts = allocation.health ?? 0;
  const socialPts = allocation.social ?? 0;
  const financePts = allocation.finance ?? 0;
  const hobbyPts = allocation.hobby ?? 0;
  const familyPts = allocation.family ?? 0;

  if (careerPts >= 1) next.ambition = clamp(next.ambition + (careerPts === 2 ? 5 : 2));
  if (eduPts >= 1) next.intelligence = clamp(next.intelligence + (eduPts === 2 ? 4 : 2));
  if (healthPts >= 1) {
    next.fitness = clamp(next.fitness + (healthPts === 2 ? 6 : 3));
    next.health = clamp(next.health + (healthPts === 2 ? 4 : 2));
  }
  if (socialPts >= 1) next.social = clamp(next.social + (socialPts === 2 ? 8 : 4));
  if (financePts >= 1) next.wealth = clamp(next.wealth + (financePts === 2 ? 4 : 2));
  if (hobbyPts >= 1) next.happiness = clamp(next.happiness + (hobbyPts === 2 ? 6 : 3));
  if (familyPts >= 1) next.happiness = clamp(next.happiness + (familyPts === 2 ? 5 : 2));

  return next;
}

export function trackFocusDomainsUsed(
  existing: FocusDomain[] | undefined,
  allocation: FocusAllocation,
): FocusDomain[] {
  const set = new Set(existing ?? []);
  for (const [domain, points] of Object.entries(allocation) as [FocusDomain, number][]) {
    if ((points ?? 0) > 0) set.add(domain);
  }
  return [...set];
}

export function accumulateFocusPointsSpent(
  existing: FocusAllocation | undefined,
  allocation: FocusAllocation,
): FocusAllocation {
  const next: FocusAllocation = { ...existing };
  for (const [domain, points] of Object.entries(allocation) as [FocusDomain, number][]) {
    if ((points ?? 0) > 0) {
      const key = domain as FocusDomain;
      next[key] = (next[key] ?? 0) + points;
    }
  }
  return next;
}

export function isFocusConfirmedForAge(
  character: Pick<Character, 'age' | 'focusConfirmedForAge'>,
): boolean {
  if (character.age <= CHILD_AUTO_FOCUS_MAX_AGE) return true;
  return character.focusConfirmedForAge === character.age;
}

export function resolveFocusAllocationForAgeUp(
  character: Pick<Character, 'age' | 'familyBackground' | 'focusAllocation'>,
): FocusAllocation {
  if (character.age <= CHILD_AUTO_FOCUS_MAX_AGE) {
    return getAutoChildFocus(character);
  }
  return character.focusAllocation ?? {};
}
