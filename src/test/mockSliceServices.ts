import { jest } from '@jest/globals';

/** Shared service mocks for store slice unit tests (use inside jest.mock factories). */

export const persistenceMock = {
  saveCharacterLocal: jest.fn(),
  loadCharacterLocal: jest.fn(() => null),
  getActiveSlotId: jest.fn(() => '0'),
  setActiveSlotId: jest.fn(),
  deleteCharacterLocal: jest.fn(),
  listLocalSlots: jest.fn(() => ['0', '1', '2']),
  migrateLegacySaves: jest.fn(),
  normalizeCharacter: jest.fn((c: unknown) => c),
  loadGlobalPrestige: jest.fn(() => ({
    prestigePoints: 0,
    prestigeLevel: 0,
    totalLivesLived: 0,
    completedChallengeIds: [],
    unlockedTraitIds: [],
    unlockedScenarioIds: ['classic'],
    unlockedDynastyPerkIds: [],
    dynastyStatBonusTier: 0,
  })),
  getDailyBonusLastClaim: jest.fn(() => null),
  setDailyBonusLastClaim: jest.fn(),
  setDailyQuestsProgress: jest.fn(),
};

export const cloudSaveMock = {
  syncSaveToCloud: jest.fn(),
  loadSaveFromCloud: jest.fn(() => null),
  deleteCloudSave: jest.fn(),
  listCloudSlots: jest.fn(() => []),
  pullCloudSaveIfNewer: jest.fn(),
};

export const entitlementsMock = {
  fetchUserEntitlements: jest.fn(),
  applyEntitlementsToCharacter: jest.fn((c: unknown) => c),
  hasPendingGrants: jest.fn(() => false),
  clearConsumedGrants: jest.fn(),
};

export const notificationSyncMock = {
  syncGameRetentionNotifications: jest.fn(() => Promise.resolve()),
};
