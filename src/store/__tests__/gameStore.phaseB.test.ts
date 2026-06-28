jest.mock('@services/persistence', () => ({
  saveCharacterLocal: jest.fn(),
  loadCharacterLocal: jest.fn(),
  getActiveSlotId: jest.fn(() => '0'),
  setActiveSlotId: jest.fn(),
  deleteCharacterLocal: jest.fn(),
  listLocalSlots: jest.fn(() => ['0', '1', '2']),
  migrateLegacySaves: jest.fn(),
  normalizeCharacter: jest.fn((c: unknown) => c),
  getDailyBonusLastClaim: jest.fn(() => null),
  setDailyBonusLastClaim: jest.fn(),
  getDailyQuestsProgress: jest.fn(() => null),
  setDailyQuestsProgress: jest.fn(),
}));

jest.mock('@services/cloudSave', () => ({
  syncSaveToCloud: jest.fn(),
  pullCloudSaveIfNewer: jest.fn(),
  listCloudSlots: jest.fn(),
}));

jest.mock('@services/entitlements', () => ({
  fetchUserEntitlements: jest.fn(),
  applyEntitlementsToCharacter: jest.fn((c: unknown) => c),
  hasPendingGrants: jest.fn(() => false),
  clearConsumedGrants: jest.fn(),
}));

jest.mock('@services/analytics', () => ({
  logEvent: jest.fn(),
}));

jest.mock('@services/widgetSnapshot', () => ({
  writeWidgetSnapshot: jest.fn(),
}));

import { useGameStore } from '@store/gameStore';
import { PROPERTY_CATALOG } from '@data/properties';
import { createTestCharacter } from '../../test/fixtures/character';

describe('gameStore Phase B actions', () => {
  beforeEach(() => {
    useGameStore.setState({
      character: createTestCharacter({
        age: 30,
        bankBalance: 10_000_000,
        creditScore: 700,
        hobbyProgress: {},
        socialPosts: [],
        socialFollowers: 50,
        people: [],
        assets: [],
        businesses: [],
      }),
      pendingCourt: false,
    });
  });

  it('purchaseProperty deducts down payment', () => {
    const def = PROPERTY_CATALOG.find(p => p.tier === 'basic')!;
    const before = useGameStore.getState().character!.bankBalance;
    const result = useGameStore.getState().purchaseProperty(def.id);
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character!.assets.length).toBe(1);
    expect(useGameStore.getState().character!.bankBalance).toBeLessThan(before);
  });

  it('createSocialPost adds post', () => {
    const result = useGameStore.getState().createSocialPost('Test post');
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character!.socialPosts!.length).toBe(1);
  });

  it('practiceHobby updates progress', () => {
    const result = useGameStore.getState().practiceHobby('music_guitar');
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character!.hobbyProgress!.music_guitar).toBeDefined();
  });

  it('resolveCourt clears pendingCourt', () => {
    useGameStore.setState(s => {
      if (s.character) {
        s.character.legalCase = { crimeId: 'shoplifting', stage: 'trial', evidence: 30, startedAtAge: 29 };
      }
      s.pendingCourt = true;
    });
    const result = useGameStore.getState().resolveCourt(1, 0);
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().pendingCourt).toBe(false);
    expect(useGameStore.getState().character!.legalCase).toBeUndefined();
  });
});
