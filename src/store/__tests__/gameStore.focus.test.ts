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
import { runAgeUp } from '@engine/ageUpEngine';
import { createTestCharacter } from '../../test/fixtures/character';

function readyToAgeUp(overrides: Parameters<typeof createTestCharacter>[0] = {}) {
  const age = overrides.age ?? 25;
  return createTestCharacter({
    age,
    lifePhase: 'acting',
    focusConfirmedForAge: age,
    focusAllocation: { career: 1, education: 1, health: 1 },
    criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
    job: 'Engineer',
    educationLevel: 'graduate',
    ...overrides,
  });
}

function teenCharacter() {
  return readyToAgeUp({ age: 16, lifePhase: 'planning', focusConfirmedForAge: -1, focusAllocation: undefined });
}

describe('gameStore focus flow', () => {
  beforeEach(() => {
    useGameStore.setState({
      character: teenCharacter(),
      pendingDecision: null,
      isProcessing: false,
      pendingAspirationPicker: false,
    });
    jest.clearAllMocks();
  });

  it('blocks ageUp without confirmed focus for teens', () => {
    useGameStore.getState().ageUp();
    expect(useGameStore.getState().character?.age).toBe(16);
  });

  it('setFocusAllocation validates total points', () => {
    const bad = useGameStore.getState().setFocusAllocation({ career: 2 });
    expect(bad.ok).toBe(false);

    const good = useGameStore.getState().setFocusAllocation({ career: 1, education: 1, health: 1 });
    expect(good.ok).toBe(true);
    expect(useGameStore.getState().character?.focusAllocation).toEqual({
      career: 1,
      education: 1,
      health: 1,
    });
  });

  it('confirmFocusAndAct moves to acting phase', () => {
    useGameStore.getState().setFocusAllocation({ career: 1, education: 1, health: 1 });
    const result = useGameStore.getState().confirmFocusAndAct();
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().character?.lifePhase).toBe('acting');
    expect(useGameStore.getState().character?.focusConfirmedForAge).toBe(16);
  });

  it('allows ageUp after focus is confirmed', () => {
    const character = readyToAgeUp({ age: 24 });
    expect(runAgeUp(character).type).not.toBe('jail_tick');

    useGameStore.setState({ character });
    useGameStore.getState().ageUp();
    expect(useGameStore.getState().character?.age).toBe(25);
    expect(useGameStore.getState().character?.lifePhase).toBe('review');
  });

  it('dismissYearReview returns to planning', () => {
    useGameStore.setState({
      character: readyToAgeUp({ lifePhase: 'review', age: 17, focusConfirmedForAge: -1 }),
    });
    useGameStore.getState().dismissYearReview();
    expect(useGameStore.getState().character?.lifePhase).toBe('planning');
    expect(useGameStore.getState().character?.focusAllocation).toBeUndefined();
  });

  it('setAspirations clears pending picker flag', () => {
    useGameStore.setState({ pendingAspirationPicker: true });
    const result = useGameStore.getState().setAspirations('fortune', 'knowledge');
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().pendingAspirationPicker).toBe(false);
    expect(useGameStore.getState().character?.aspirations).toEqual({
      primary: 'fortune',
      secondary: 'knowledge',
    });
  });
});
