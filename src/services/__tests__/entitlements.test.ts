import {
  applyEntitlementsToCharacter,
  applyEntitlementsToGlobalPrestige,
  hasPendingGrants,
} from '@utils/entitlementGrants';
import { createTestCharacter } from '../../test/fixtures/character';
import type { GlobalPrestigeState } from '../../types';

const baseCharacter = createTestCharacter({
  age: 20,
  birthYear: 2000,
  educationLevel: 'none',
  bankBalance: 0,
  netWorthPeak: 0,
  coins: 100,
});

describe('applyEntitlementsToCharacter', () => {
  it('applies premium and consumable grants', () => {
    const updated = applyEntitlementsToCharacter(baseCharacter, {
      isPremium: true,
      coinsGrant: 50,
      luckBoostGrant: 3,
    });
    expect(updated.isPremium).toBe(true);
    expect(updated.hasNoAds).toBe(true);
    expect(updated.coins).toBe(150);
    expect(updated.luckBoostsRemaining).toBe(3);
  });

  it('applies season pass', () => {
    const updated = applyEntitlementsToCharacter(baseCharacter, {
      hasSeasonPass: true,
    });
    expect(updated.hasSeasonPass).toBe(true);
    expect(updated.isPremium).toBe(false);
  });

  it('merges unlocked avatar styles with character default', () => {
    const updated = applyEntitlementsToCharacter(baseCharacter, {
      unlockedAvatarStyles: ['adventurer', 'lorelei'],
    });
    expect(updated.unlockedAvatarStyles).toEqual(
      expect.arrayContaining(['adventurer', 'lorelei']),
    );
  });
});

describe('hasPendingGrants', () => {
  it('detects pending consumable grants', () => {
    expect(hasPendingGrants({ coinsGrant: 10 })).toBe(true);
    expect(hasPendingGrants({ isPremium: true })).toBe(false);
  });
});

describe('applyEntitlementsToGlobalPrestige', () => {
  const basePrestige: GlobalPrestigeState = {
    prestigePoints: 0,
    prestigeLevel: 1,
    totalLivesLived: 0,
    completedChallengeIds: [],
    unlockedTraitIds: [],
    unlockedScenarioIds: ['classic', 'rags_to_riches', 'silver_spoon'],
    unlockedDynastyPerkIds: [],
    dynastyStatBonusTier: 0,
  };

  it('merges unlockedScenarioIds with free scenarios', () => {
    const next = applyEntitlementsToGlobalPrestige(basePrestige, {
      unlockedScenarioIds: ['royal', 'mars'],
    });
    expect(next.unlockedScenarioIds).toEqual(
      expect.arrayContaining(['classic', 'rags_to_riches', 'silver_spoon', 'royal', 'mars']),
    );
  });

  it('is idempotent when merging the same scenario ids twice', () => {
    const once = applyEntitlementsToGlobalPrestige(basePrestige, {
      unlockedScenarioIds: ['royal'],
    });
    const twice = applyEntitlementsToGlobalPrestige(once, {
      unlockedScenarioIds: ['royal'],
    });
    expect(twice.unlockedScenarioIds?.filter((id) => id === 'royal')).toHaveLength(1);
  });
});