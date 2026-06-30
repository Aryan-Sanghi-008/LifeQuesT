import {
  applyEntitlementsToCharacter, hasPendingGrants,
} from '@utils/entitlementGrants';
import { createTestCharacter } from '../../test/fixtures/character';

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