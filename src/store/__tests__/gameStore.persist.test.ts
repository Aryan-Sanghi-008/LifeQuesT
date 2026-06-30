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
import { saveCharacterLocal } from '@services/persistence';
import { syncSaveToCloud } from '@services/cloudSave';
import type { AppUser } from '../../types';
import { createTestCharacter } from '../../test/fixtures/character';

function makeCharacter(overrides: Parameters<typeof createTestCharacter>[0] = {}) {
  return createTestCharacter({
    id: 'test-char',
    job: 'Engineer',
    age: 25,
    birthYear: 2000,
    educationLevel: 'graduate',
    coins: 100,
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    ...overrides,
  });
}

function makeUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    uid: 'firebase-uid',
    email: 'p@test.com',
    displayName: 'Player',
    photoURL: null,
    isGuest: false,
    ...overrides,
  };
}

describe('gameStore._persist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGameStore.setState({
      character: null,
      user: null,
      activeSlotId: '0',
    });
  });

  it('saves locally and skips cloud sync for guest users', async () => {
    const character = makeCharacter();
    useGameStore.setState({
      character,
      user: makeUser({ uid: 'local_guest_abc', email: null, displayName: 'Guest', isGuest: true }),
      activeSlotId: '0',
    });

    await useGameStore.getState()._persist();

    expect(saveCharacterLocal).toHaveBeenCalledTimes(1);
    expect(saveCharacterLocal).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-char', updatedAt: expect.any(Number) }),
      '0',
    );
    expect(syncSaveToCloud).not.toHaveBeenCalled();
  });

  it('syncs to cloud for signed-in users', async () => {
    const character = makeCharacter();
    (syncSaveToCloud as jest.Mock).mockResolvedValue(undefined);

    useGameStore.setState({
      character,
      user: makeUser({ uid: 'firebase-uid' }),
      activeSlotId: '1',
    });

    await useGameStore.getState()._persist();

    expect(saveCharacterLocal).toHaveBeenCalledTimes(1);
    expect(syncSaveToCloud).toHaveBeenCalledWith(
      'firebase-uid',
      '1',
      expect.objectContaining({ id: 'test-char', updatedAt: expect.any(Number) }),
    );
  });

  it('does not throw when cloud sync fails', async () => {
    const character = makeCharacter();
    (syncSaveToCloud as jest.Mock).mockRejectedValue(new Error('network offline'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    useGameStore.setState({
      character,
      user: makeUser({ uid: 'firebase-uid' }),
      activeSlotId: '0',
    });

    await expect(useGameStore.getState()._persist()).resolves.toBeUndefined();

    expect(saveCharacterLocal).toHaveBeenCalledTimes(1);
    expect(syncSaveToCloud).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('[cloudSave] sync failed', expect.any(Error));

    warnSpy.mockRestore();
  });
});
