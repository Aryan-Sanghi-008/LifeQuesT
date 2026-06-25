import {
  applyEntitlementsToCharacter, hasPendingGrants,
} from '@utils/entitlementGrants';
import type { Character } from '../../types';

const baseCharacter: Character = {
  id: '1',
  name: 'Test',
  gender: 'male',
  avatarSeed: 'seed',
  avatarId: 'male_1',
  lifeStage: 'adult',
  country: 'India',
  countryFlag: '🇮🇳',
  countryCode: 'IN',
  zodiac: 'aries',
  familyBackground: 'middle',
  traits: [],
  job: 'Student',
  age: 20,
  birthYear: 2000,
  stats: {
    health: 50, happiness: 50, intelligence: 50, wealth: 50,
    fitness: 50, looks: 50, social: 50, ambition: 50,
  },
  karma: 50,
  bankBalance: 0,
  netWorthPeak: 0,
  relationships: 0,
  children: 0,
  educationLevel: 'none',
  people: [],
  career: null,
  assets: [],
  achievements: [],
  eventHistory: [],
  isAlive: true,
  coins: 100,
  gems: 0,
  isPremium: false,
  hasNoAds: false,
  luckBoostsRemaining: 0,
  hasReincarnationScroll: false,
  createdAt: 1,
  updatedAt: 1,
};

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
});

describe('hasPendingGrants', () => {
  it('detects pending consumable grants', () => {
    expect(hasPendingGrants({ coinsGrant: 10 })).toBe(true);
    expect(hasPendingGrants({ isPremium: true })).toBe(false);
  });
});
