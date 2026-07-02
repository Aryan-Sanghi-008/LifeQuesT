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

jest.mock('@services/analytics', () => ({ logEvent: jest.fn() }));
jest.mock('@services/haptics', () => ({
  hapticAgeUp: jest.fn(),
  hapticDeath: jest.fn(),
  hapticAchievement: jest.fn(),
  hapticMilestone: jest.fn(),
  hapticNegativeEvent: jest.fn(),
  hapticButtonPress: jest.fn(),
}));
jest.mock('@services/audio', () => ({ playSound: jest.fn() }));

import { useGameStore } from '@store/gameStore';
import { createTestCharacter } from '../../../test/fixtures/character';

describe('characterSlice', () => {
  beforeEach(() => {
    useGameStore.setState({
      character: null,
      pendingReincarnation: false,
      pendingDecision: null,
    });
  });

  it('createCharacter sets character and clears pendingReincarnation', () => {
    useGameStore.setState({ pendingReincarnation: true });
    useGameStore.getState().createCharacter({
      name: 'River',
      gender: 'female',
      countryCode: 'US',
      familyBackground: 'middle',
      zodiac: 'leo',
      traits: [],
      avatarSeed: 'river-seed',
    });
    const state = useGameStore.getState();
    expect(state.character?.name).toBe('River');
    expect(state.pendingReincarnation).toBe(false);
  });

  it('ageUp advances age for acting character', async () => {
    useGameStore.setState({
      character: createTestCharacter({
        age: 20,
        lifePhase: 'acting',
        focusConfirmedForAge: 20,
        criminalRecord: undefined,
      }),
    });
    await useGameStore.getState().ageUp();
    expect(useGameStore.getState().character?.age).toBe(21);
  });
});
