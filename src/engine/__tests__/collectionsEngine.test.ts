import { evaluateUnlockedCollectionIds, getSetProgress } from '@engine/collectionsEngine';
import { createTestCharacter } from '../../test/fixtures/character';

describe('collectionsEngine', () => {
  it('unlocks wanderer moments based on countries lived', () => {
    const character = createTestCharacter({
      countriesLived: ['IN', 'US'],
    });
    const ids = evaluateUnlockedCollectionIds(character, 1);
    expect(ids).toContain('moment_wanderer_1');
    expect(ids).toContain('moment_wanderer_2');
    expect(ids).not.toContain('moment_wanderer_3');
  });

  it('tracks set progress for tycoon', () => {
    const character = createTestCharacter({
      businesses: [{
        id: 'b1', name: 'Shop', revenue: 1000, expenses: 200, valuation: 5000,
        employees: [], payrollMonthly: 500, foundedAge: 25,
      }],
    });
    const ids = evaluateUnlockedCollectionIds(character, 1);
    const progress = getSetProgress('tycoon', ids);
    expect(progress.unlocked).toBeGreaterThanOrEqual(1);
  });
});
