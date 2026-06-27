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
  deleteCloudSave: jest.fn(),
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
import { createTestCharacter } from '../../test/fixtures/character';

describe('gameStore navigation hardening', () => {
  beforeEach(() => {
    useGameStore.setState({
      user: { uid: 'u1', displayName: 'Test', email: null, photoURL: null, isGuest: true },
      character: null,
      pendingReincarnation: false,
      pendingDecision: null,
      isHydrated: true,
      activeSlotId: 'slot_1',
      slotList: [],
    });
  });

  it('createCharacter clears pendingReincarnation', () => {
    useGameStore.setState({ pendingReincarnation: true });
    useGameStore.getState().createCharacter({
      name: 'Alex',
      gender: 'male',
      countryCode: 'IN',
      familyBackground: 'middle',
      zodiac: 'leo',
      traits: [],
      avatarSeed: 'alex-seed',
    });

    const state = useGameStore.getState();
    expect(state.pendingReincarnation).toBe(false);
    expect(state.character?.name).toBe('Alex');
    expect(state.character?.avatarSeed).toBe('alex-seed');
  });

  it('resetGame clears character and pendingReincarnation', async () => {
    useGameStore.setState({
      character: createTestCharacter(),
      pendingReincarnation: true,
    });

    await useGameStore.getState().resetGame();

    const state = useGameStore.getState();
    expect(state.character).toBeNull();
    expect(state.pendingReincarnation).toBe(false);
  });

  it('deleteSlot refreshes slotList', async () => {
    useGameStore.setState({
      slotList: [{ slotId: '0', name: 'Old', age: 20, isAlive: true, updatedAt: 1 }],
    });

    await useGameStore.getState().deleteSlot('0');

    const state = useGameStore.getState();
    expect(state.slotList.some(s => s.updatedAt > 0 && s.slotId === '0')).toBe(false);
  });
});
