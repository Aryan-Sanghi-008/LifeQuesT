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
import { saveCharacterLocal } from '@services/persistence';
import type { Character } from '../../types';

const baseStats = {
  health: 50,
  happiness: 50,
  intelligence: 50,
  wealth: 50,
  fitness: 50,
  looks: 50,
  social: 50,
  ambition: 50,
  mentalHealth: 70,
};

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char',
    name: 'Test',
    gender: 'male',
    avatarSeed: 'seed',
    avatarId: 'male_1',
    lifeStage: 'adult',
    country: 'India',
    countryFlag: '🇮🇳',
    countryCode: 'IN',
    zodiac: 'Aries',
    familyBackground: 'middle',
    traits: [],
    job: 'Engineer',
    age: 25,
    birthYear: 2000,
    stats: baseStats,
    karma: 50,
    bankBalance: 1000,
    netWorthPeak: 1000,
    relationships: 0,
    children: 0,
    educationLevel: 'graduate',
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
    businesses: [],
    socialFollowers: 0,
    criminalRecord: { crimes: ['theft'], jailYearsRemaining: 2, onProbation: false },
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe('gameStore.ageUp', () => {
  beforeEach(() => {
    useGameStore.setState({
      character: makeCharacter(),
      pendingDecision: null,
      isProcessing: false,
      lastAgeUpNotice: null,
      sessionAges: 0,
      ageUpsSinceAd: 0,
    });
    jest.clearAllMocks();
  });

  it('sets jail notice and decrements jail years on jail tick', () => {
    useGameStore.getState().ageUp();
    const state = useGameStore.getState();
    expect(state.lastAgeUpNotice).toContain('Serving time');
    expect(state.character?.criminalRecord?.jailYearsRemaining).toBe(1);
    expect(saveCharacterLocal).toHaveBeenCalled();
  });

  it('advances age for free character', () => {
    useGameStore.setState({
      character: makeCharacter({
        criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
      }),
    });
    useGameStore.getState().ageUp();
    expect(useGameStore.getState().character?.age).toBe(26);
  });
});
