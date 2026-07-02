import { SCENARIO_CATALOG, FREE_SCENARIO_IDS, PREMIUM_SCENARIO_IDS, getScenarioDef } from '../scenarioCatalog';

describe('SCENARIO_CATALOG', () => {
  it('contains exactly 12 scenarios', () => {
    expect(SCENARIO_CATALOG).toHaveLength(12);
  });

  it('contains exactly 3 free scenarios', () => {
    expect(FREE_SCENARIO_IDS).toHaveLength(3);
    expect(FREE_SCENARIO_IDS).toContain('classic');
    expect(FREE_SCENARIO_IDS).toContain('rags_to_riches');
    expect(FREE_SCENARIO_IDS).toContain('silver_spoon');
  });

  it('contains exactly 9 premium scenarios', () => {
    expect(PREMIUM_SCENARIO_IDS).toHaveLength(9);
    const expectedPremium = ['royal', 'crime', 'cyber', 'medieval', 'zombie', 'mars', 'celebrity', 'fantasy', 'political'];
    for (const id of expectedPremium) {
      expect(PREMIUM_SCENARIO_IDS).toContain(id);
    }
  });

  it('free scenarios have isPremium === false', () => {
    const freeEntries = SCENARIO_CATALOG.filter((s) => FREE_SCENARIO_IDS.includes(s.id));
    freeEntries.forEach((s) => {
      expect(s.isPremium).toBe(false);
    });
  });

  it('premium scenarios have isPremium === true', () => {
    const premiumEntries = SCENARIO_CATALOG.filter((s) => PREMIUM_SCENARIO_IDS.includes(s.id));
    premiumEntries.forEach((s) => {
      expect(s.isPremium).toBe(true);
    });
  });

  it('premium scenarios each have a unique iapProductId', () => {
    const premiumEntries = SCENARIO_CATALOG.filter((s) => s.isPremium);
    const ids = premiumEntries.map((s) => s.iapProductId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('classic scenario has wealthMultiplier of 1.0', () => {
    const classic = SCENARIO_CATALOG.find((s) => s.id === 'classic')!;
    expect(classic.wealthMultiplier).toBe(1.0);
  });

  it('rags_to_riches has very low wealthMultiplier', () => {
    const s = SCENARIO_CATALOG.find((s) => s.id === 'rags_to_riches')!;
    expect(s.wealthMultiplier).toBeLessThan(0.1);
  });

  it('silver_spoon has high wealthMultiplier', () => {
    const s = SCENARIO_CATALOG.find((s) => s.id === 'silver_spoon')!;
    expect(s.wealthMultiplier).toBeGreaterThanOrEqual(5);
  });

  it('all scenarios have required fields', () => {
    SCENARIO_CATALOG.forEach((s) => {
      expect(s.id).toBeDefined();
      expect(s.name).toBeDefined();
      expect(s.tagline).toBeDefined();
      expect(s.description).toBeDefined();
      expect(s.iconEmoji).toBeDefined();
      expect(s.accentColor).toBeDefined();
      expect(s.wealthMultiplier).toBeGreaterThan(0);
      expect(s.currencyName).toBeDefined();
    });
  });
});

describe('getScenarioDef', () => {
  it('returns correct scenario by id', () => {
    const royal = getScenarioDef('royal');
    expect(royal.id).toBe('royal');
    expect(royal.isPremium).toBe(true);
  });

  it('returns classic as fallback for unknown id', () => {
    const fallback = getScenarioDef('unknown_scenario' as never);
    expect(fallback.id).toBe('classic');
  });
});
