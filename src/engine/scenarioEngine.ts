import { Character, ScenarioId, ScenarioFeature } from '../types';
import { SCENARIO_CATALOG, ScenarioDef, FREE_SCENARIO_IDS, getScenarioDef } from '../data/scenarioCatalog';
import { spawnScenarioNPCsForCreation } from './scenarioNpcEngine';

export { getScenarioDef } from '../data/scenarioCatalog';
export type { ScenarioDef };

export function isScenarioUnlocked(id: ScenarioId, unlockedIds: ScenarioId[]): boolean {
  if (FREE_SCENARIO_IDS.includes(id)) return true;
  return unlockedIds.includes(id);
}

export function initScenarioData(scenarioId: ScenarioId): Record<string, unknown> {
  const def = getScenarioDef(scenarioId);
  return { ...(def.initialScenarioData ?? {}) };
}

export function isFeatureEnabled(
  character: Pick<Character, 'scenarioId'>,
  feature: ScenarioFeature,
): boolean {
  const scenarioId = character.scenarioId ?? 'classic';
  const def = getScenarioDef(scenarioId);
  if (def.allowedFeatures?.length) {
    return def.allowedFeatures.includes(feature);
  }
  if (def.disabledFeatures?.includes(feature)) {
    return false;
  }
  return true;
}

/** Map activity id/category to scenario feature gates. */
export function getActivityFeatureGate(
  activityId: string,
  category?: string,
): ScenarioFeature | null {
  if (activityId === 'invest_stocks') return 'stocks';
  if (category === 'illegal') return 'crime_activities';
  return null;
}

/**
 * Apply scenario modifiers to a freshly built character.
 * Called from buildCharacter after base stats are computed.
 */
export function applyScenarioAtCreation(character: Character, scenarioId: ScenarioId): Character {
  const def: ScenarioDef = SCENARIO_CATALOG.find((s) => s.id === scenarioId) ?? SCENARIO_CATALOG[0];

  let c = { ...character, scenarioId, scenarioData: initScenarioData(scenarioId) };

  if (def.wealthMultiplier !== 1.0) {
    c = { ...c, bankBalance: Math.round((c.bankBalance ?? 0) * def.wealthMultiplier) };
  }

  const bonuses = def.statBonuses;
  if (Object.keys(bonuses).length > 0) {
    const stats = { ...(c.stats ?? {}) };
    (Object.keys(bonuses) as (keyof typeof bonuses)[]).forEach((key) => {
      const bonus = bonuses[key] ?? 0;
      const current = stats[key] ?? 50;
      stats[key] = Math.max(0, Math.min(100, current + bonus));
    });
    c = { ...c, stats };
  }

  if (def.startingCountry) {
    c = { ...c, countryCode: def.startingCountry };
  }

  if (def.startingAge !== undefined) {
    c = { ...c, age: def.startingAge };
  }

  const scenarioNpcs = spawnScenarioNPCsForCreation(c);
  if (scenarioNpcs.length) {
    c = { ...c, people: [...(c.people ?? []), ...scenarioNpcs] };
  }

  return c;
}
