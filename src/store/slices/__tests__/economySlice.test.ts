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

jest.mock('@services/widgetSnapshot', () => ({
  writeWidgetSnapshot: jest.fn(),
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
import { createTestCharacter } from '../../../test/fixtures/character';

describe('economySlice', () => {
  beforeEach(() => {
    useGameStore.setState({
      character: createTestCharacter({ coins: 500, gems: 10 }),
    });
  });

  it('addCoins increases balance', () => {
    useGameStore.getState().addCoins(100);
    expect(useGameStore.getState().character?.coins).toBe(600);
  });

  it('spendCoins deducts when sufficient', () => {
    const ok = useGameStore.getState().spendCoins(200);
    expect(ok).toBe(true);
    expect(useGameStore.getState().character?.coins).toBe(300);
  });

  it('spendCoins fails when insufficient', () => {
    const ok = useGameStore.getState().spendCoins(9999);
    expect(ok).toBe(false);
    expect(useGameStore.getState().character?.coins).toBe(500);
  });

  it('addGems and spendGems', () => {
    useGameStore.getState().addGems(5);
    expect(useGameStore.getState().character?.gems).toBe(15);
    expect(useGameStore.getState().spendGems(3)).toBe(true);
    expect(useGameStore.getState().character?.gems).toBe(12);
  });
});
