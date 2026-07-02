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

jest.mock('@services/userBootstrap', () => ({
  bootstrapCloudUser: jest.fn(() => Promise.resolve({
    entitlements: null,
    settings: null,
    profileCreated: false,
  })),
}));

jest.mock('@services/settingsSync', () => ({
  applyCloudSettings: jest.fn(),
  bindSettingsCloudSync: jest.fn(() => null),
}));

jest.mock('@services/cloudSave', () => ({
  syncSaveToCloud: jest.fn(),
  pullCloudSaveIfNewer: jest.fn(),
  listCloudSlots: jest.fn(() => []),
}));

jest.mock('@services/entitlements', () => ({
  fetchUserEntitlements: jest.fn(),
  applyEntitlementsToCharacter: jest.fn((c: unknown) => c),
  hasPendingGrants: jest.fn(() => false),
  clearConsumedGrants: jest.fn(),
}));

import { useGameStore } from '@store/gameStore';

describe('authSlice', () => {
  beforeEach(() => {
    useGameStore.setState({
      user: null,
      isHydrated: false,
      slotList: [],
      slotsSynced: false,
    });
  });

  it('setUser updates user', () => {
    const user = { uid: 'u1', displayName: 'A', email: null, photoURL: null, isGuest: true };
    useGameStore.getState().setUser(user);
    expect(useGameStore.getState().user).toEqual(user);
  });

  it('onUserChanged clears cloud sync for guest', async () => {
    await useGameStore.getState().onUserChanged({
      uid: 'guest-1',
      displayName: 'Guest',
      email: null,
      photoURL: null,
      isGuest: true,
    });
    const state = useGameStore.getState();
    expect(state.user?.uid).toBe('guest-1');
    expect(state.slotsSynced).toBe(false);
    expect(state.slotList.length).toBeGreaterThan(0);
  });
});
