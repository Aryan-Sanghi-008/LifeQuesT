import { applyScenarioAtCreation, isScenarioUnlocked, isFeatureEnabled, initScenarioData } from '../scenarioEngine';
import { createTestCharacter } from '../../test/fixtures/character';
import type { ScenarioId } from '../../types';

const baseChar = createTestCharacter({});

describe('isScenarioUnlocked', () => {
  it('returns true for all three free scenarios regardless of unlocked list', () => {
    expect(isScenarioUnlocked('classic', [])).toBe(true);
    expect(isScenarioUnlocked('rags_to_riches', [])).toBe(true);
    expect(isScenarioUnlocked('silver_spoon', [])).toBe(true);
  });

  it('returns false for premium scenario when not in unlocked list', () => {
    expect(isScenarioUnlocked('royal', [])).toBe(false);
    expect(isScenarioUnlocked('cyber', [])).toBe(false);
  });

  it('returns true for premium scenario when present in unlocked list', () => {
    expect(isScenarioUnlocked('royal', ['royal'])).toBe(true);
    expect(isScenarioUnlocked('mars', ['royal', 'mars'])).toBe(true);
  });
});

describe('applyScenarioAtCreation', () => {
  it('classic scenario: preserves bank balance unchanged', () => {
    const original = { ...baseChar, bankBalance: 5000 };
    const result = applyScenarioAtCreation(original, 'classic');
    expect(result.bankBalance).toBe(5000);
    expect(result.scenarioId).toBe('classic');
  });

  it('rags_to_riches: reduces bank balance to 1% of original', () => {
    const original = { ...baseChar, bankBalance: 10000 };
    const result = applyScenarioAtCreation(original, 'rags_to_riches');
    expect(result.bankBalance).toBe(100);
    expect(result.scenarioId).toBe('rags_to_riches');
  });

  it('silver_spoon: multiplies bank balance by 10', () => {
    const original = { ...baseChar, bankBalance: 5000 };
    const result = applyScenarioAtCreation(original, 'silver_spoon');
    expect(result.bankBalance).toBe(50000);
    expect(result.scenarioId).toBe('silver_spoon');
  });

  it('royal: multiplies bank balance by 10 and boosts social/ambition', () => {
    const original = { ...baseChar, bankBalance: 5000, stats: { ...baseChar.stats, social: 50, ambition: 50 } };
    const result = applyScenarioAtCreation(original, 'royal');
    expect(result.bankBalance).toBe(50000);
    expect(result.stats.social).toBeGreaterThan(50);
    expect(result.stats.ambition).toBeGreaterThan(50);
    expect(result.scenarioId).toBe('royal');
  });

  it('cyber: boosts intelligence and reduces fitness', () => {
    const original = { ...baseChar, bankBalance: 5000, stats: { ...baseChar.stats, intelligence: 50, fitness: 50 } };
    const result = applyScenarioAtCreation(original, 'cyber');
    expect(result.stats.intelligence).toBeGreaterThan(50);
    expect(result.stats.fitness).toBeLessThan(50);
  });

  it('stat bonuses are clamped to 0-100', () => {
    const extremeChar = { ...baseChar, stats: { ...baseChar.stats, fitness: 95 } };
    const result = applyScenarioAtCreation(extremeChar, 'rags_to_riches');
    // rags_to_riches gives +5 fitness → 95+5 = 100, should clamp at 100
    expect(result.stats.fitness).toBeLessThanOrEqual(100);
  });

  it('negative stat bonuses are clamped to min 0', () => {
    const lowChar = { ...baseChar, stats: { ...baseChar.stats, fitness: 3 } };
    const result = applyScenarioAtCreation(lowChar, 'cyber');
    // cyber gives -5 fitness → 3-5 = -2 → clamp to 0
    expect(result.stats.fitness).toBeGreaterThanOrEqual(0);
  });

  it('zombie: reduces starting bank balance by 70%', () => {
    const original = { ...baseChar, bankBalance: 10000 };
    const result = applyScenarioAtCreation(original, 'zombie');
    expect(result.bankBalance).toBe(3000);
  });

  it('overrides startingCountry when scenario specifies one', () => {
    const original = { ...baseChar, countryCode: 'IN' };
    const result = applyScenarioAtCreation(original, 'rags_to_riches');
    expect(result.countryCode).toBe('NG');
  });

  it('keeps original countryCode for scenarios without startingCountry', () => {
    const original = { ...baseChar, countryCode: 'IN' };
    const result = applyScenarioAtCreation(original, 'fantasy');
    expect(result.countryCode).toBe('IN');
  });

  it('sets scenarioId on returned character for all scenarios', () => {
    const ids: ScenarioId[] = ['classic', 'rags_to_riches', 'silver_spoon', 'royal', 'crime', 'cyber'];
    for (const id of ids) {
      const result = applyScenarioAtCreation(baseChar, id);
      expect(result.scenarioId).toBe(id);
    }
  });

  it('initializes scenarioData from catalog', () => {
    const result = applyScenarioAtCreation(baseChar, 'royal');
    expect(result.scenarioData).toEqual({ courtStanding: 50 });
  });

  it('spawns scenario NPCs at creation for royal', () => {
    const result = applyScenarioAtCreation(baseChar, 'royal');
    expect(result.people?.some((p) => p.archetypeId === 'royal_courtier')).toBe(true);
  });
});

describe('initScenarioData', () => {
  it('returns medieval rank seed data', () => {
    expect(initScenarioData('medieval')).toEqual({ rank: 'peasant' });
  });

  it('returns empty object for classic', () => {
    expect(initScenarioData('classic')).toEqual({});
  });
});

describe('isFeatureEnabled', () => {
  it('disables stocks for medieval scenario', () => {
    expect(isFeatureEnabled({ scenarioId: 'medieval' }, 'stocks')).toBe(false);
  });

  it('enables stocks for classic scenario', () => {
    expect(isFeatureEnabled({ scenarioId: 'classic' }, 'stocks')).toBe(true);
  });

  it('disables crime_activities for royal scenario', () => {
    expect(isFeatureEnabled({ scenarioId: 'royal' }, 'crime_activities')).toBe(false);
  });
});
