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
  getLoginRewardDay: jest.fn(() => 1),
  setLoginRewardDay: jest.fn(),
  getLoginRewardLastClaim: jest.fn(() => null),
  setLoginRewardLastClaim: jest.fn(),
  getMysteryBoxLastSpin: jest.fn(() => null),
  setMysteryBoxLastSpin: jest.fn(),
  saveGlobalPrestige: jest.fn(),
}));

jest.mock('@services/widgetSnapshot', () => ({
  writeWidgetSnapshot: jest.fn(),
}));

jest.mock('@store/toastStore', () => ({
  useToastStore: {
    getState: () => ({ showToast: jest.fn() }),
  },
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

jest.mock('@services/audio', () => ({
  playSound: jest.fn(),
  reloadSoundPack: jest.fn(() => Promise.resolve()),
  initAudio: jest.fn(),
}));

import { createTestCharacter } from '../../../test/fixtures/character';

let useGameStore: typeof import('@store/gameStore').useGameStore;
let useSettingsStore: typeof import('@store/settingsStore').useSettingsStore;

beforeAll(() => {
  jest.resetModules();
  ({ useGameStore } = require('@store/gameStore'));
  ({ useSettingsStore } = require('@store/settingsStore'));
});

describe('progressionSlice cosmetics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({
      equippedSoundPackId: null,
      equippedNameFontId: null,
    });
    const character = createTestCharacter({ gems: 100, age: 25 });
    useGameStore.setState({
      character,
      globalPrestige: {
        totalPrestigePoints: 0,
        unlockedCosmeticIds: [],
        unlockedScenarioIds: [],
        plusCosmeticMonth: null,
      },
      isHydrated: true,
    });
  });

  it('purchaseCosmetic auto-equips sound pack', () => {
    const result = useGameStore.getState().purchaseCosmetic('sound_pack_jazz');
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/unlocked and equipped/i);
    expect(useSettingsStore.getState().equippedSoundPackId).toBe('sound_pack_jazz');
    expect(useGameStore.getState().globalPrestige.unlockedCosmeticIds).toContain('sound_pack_jazz');
  });

  it('purchaseCosmetic auto-equips font pack', () => {
    const result = useGameStore.getState().purchaseCosmetic('font_script');
    expect(result.ok).toBe(true);
    expect(useSettingsStore.getState().equippedNameFontId).toBe('font_script');
  });

  it('applyCosmetic clears sound pack to classic baseline', () => {
    useSettingsStore.getState().setEquippedSoundPackId('sound_pack_jazz');
    useGameStore.setState((s) => {
      s.globalPrestige.unlockedCosmeticIds = ['sound_pack_jazz'];
    });
    const result = useGameStore.getState().applyCosmetic('sound_pack_classic');
    expect(result.ok).toBe(true);
    expect(useSettingsStore.getState().equippedSoundPackId).toBeNull();
  });

  it('applyCosmetic clears font pack to default baseline', () => {
    useSettingsStore.getState().setEquippedNameFontId('font_mono');
    const result = useGameStore.getState().applyCosmetic('font_default');
    expect(result.ok).toBe(true);
    expect(useSettingsStore.getState().equippedNameFontId).toBeNull();
  });
});
