// Mock persistence before importing the store
const mockGetDailyBonusLastClaim = jest.fn(() => null as string | null);
const mockSetDailyBonusLastClaim = jest.fn();
const mockGetLoginRewardDay = jest.fn(() => 1);
const mockSetLoginRewardDay = jest.fn();
const mockGetLoginRewardLastClaim = jest.fn(() => null as string | null);
const mockSetLoginRewardLastClaim = jest.fn();
const mockGetMysteryBoxLastSpin = jest.fn(() => null as string | null);
const mockSetMysteryBoxLastSpin = jest.fn();

jest.mock('@services/persistence', () => ({
  saveCharacterLocal: jest.fn(),
  loadCharacterLocal: jest.fn(),
  getActiveSlotId: jest.fn(() => '0'),
  setActiveSlotId: jest.fn(),
  deleteCharacterLocal: jest.fn(),
  listLocalSlots: jest.fn(() => ['0', '1', '2']),
  migrateLegacySaves: jest.fn(),
  normalizeCharacter: jest.fn((c: unknown) => c),
  getDailyBonusLastClaim: mockGetDailyBonusLastClaim,
  setDailyBonusLastClaim: mockSetDailyBonusLastClaim,
  getDailyQuestsProgress: jest.fn(() => null),
  setDailyQuestsProgress: jest.fn(),
  getLoginRewardDay: mockGetLoginRewardDay,
  setLoginRewardDay: mockSetLoginRewardDay,
  getLoginRewardLastClaim: mockGetLoginRewardLastClaim,
  setLoginRewardLastClaim: mockSetLoginRewardLastClaim,
  getMysteryBoxLastSpin: mockGetMysteryBoxLastSpin,
  setMysteryBoxLastSpin: mockSetMysteryBoxLastSpin,
  saveGlobalPrestige: jest.fn(),
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

import { createTestCharacter } from '../../../test/fixtures/character';

let useGameStore: typeof import('@store/gameStore').useGameStore;

beforeAll(() => {
  jest.resetModules();
  ({ useGameStore } = require('@store/gameStore'));
});

const TODAY = new Date().toISOString().slice(0, 10);

function isoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

describe('progressionSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDailyBonusLastClaim.mockReturnValue(null);
    mockGetLoginRewardDay.mockReturnValue(1);
    mockGetLoginRewardLastClaim.mockReturnValue(null);
    mockGetMysteryBoxLastSpin.mockReturnValue(null);

    useGameStore.setState({
      character: createTestCharacter(),
      dailyQuests: [],
    });
  });

  // ── loadDailyQuests ──────────────────────────────────────────────────────────

  it('loadDailyQuests populates quests', () => {
    useGameStore.getState().loadDailyQuests();
    const quests = useGameStore.getState().dailyQuests;
    expect(quests.length).toBe(3);
    expect(quests.every((q) => typeof q.id === 'string')).toBe(true);
  });

  // ── claimLoginReward ─────────────────────────────────────────────────────────

  it('claimLoginReward grants a day-1 reward on first claim', () => {
    const result = useGameStore.getState().claimLoginReward();
    expect(result.ok).toBe(true);
    expect(result.day).toBe(1);
    expect(result.reward).toBeDefined();
    expect(mockSetLoginRewardLastClaim).toHaveBeenCalledWith(TODAY);
    expect(mockSetLoginRewardDay).toHaveBeenCalledWith(2);
  });

  it('claimLoginReward returns ok:false when already claimed today', () => {
    mockGetLoginRewardLastClaim.mockReturnValue(TODAY);
    mockGetLoginRewardDay.mockReturnValue(2);
    const result = useGameStore.getState().claimLoginReward();
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/already claimed/i);
  });

  it('claimLoginReward resets to day 1 when a day was missed', () => {
    // Last claim was 3 days ago — missed streak
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    mockGetLoginRewardLastClaim.mockReturnValue(threeDaysAgo.toISOString().slice(0, 10));
    mockGetLoginRewardDay.mockReturnValue(5); // was on day 5 before missing

    const result = useGameStore.getState().claimLoginReward();
    expect(result.ok).toBe(true);
    expect(result.day).toBe(1); // reset to day 1
    expect(mockSetLoginRewardDay).toHaveBeenCalledWith(2); // advance past day 1
  });

  it('getLoginRewardState reflects missed-day reset without claiming', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    mockGetLoginRewardLastClaim.mockReturnValue(threeDaysAgo.toISOString().slice(0, 10));
    mockGetLoginRewardDay.mockReturnValue(6);

    const state = useGameStore.getState().getLoginRewardState();
    expect(state.day).toBe(1);
    expect(state.claimed).toBe(false);
  });

  // ── claimDailyBonus delegates to claimLoginReward ────────────────────────────

  it('claimDailyBonus delegates to claimLoginReward and produces same outcome', () => {
    const bonusResult = useGameStore.getState().claimDailyBonus();
    // Should succeed on first call just like claimLoginReward would
    expect(bonusResult.ok).toBe(true);
    // Legacy key should also be synced
    expect(mockSetDailyBonusLastClaim).toHaveBeenCalledWith(TODAY);
  });

  it('claimDailyBonus returns ok:false when already claimed (same gate as claimLoginReward)', () => {
    mockGetLoginRewardLastClaim.mockReturnValue(TODAY);
    const result = useGameStore.getState().claimDailyBonus();
    expect(result.ok).toBe(false);
  });

  // ── canSpinMysteryBox / spinMysteryBox ───────────────────────────────────────

  it('canSpinMysteryBox returns true when no spin this week', () => {
    mockGetMysteryBoxLastSpin.mockReturnValue(null);
    expect(useGameStore.getState().canSpinMysteryBox()).toBe(true);
  });

  it('canSpinMysteryBox returns false when already spun this week', () => {
    mockGetMysteryBoxLastSpin.mockReturnValue(isoWeekKey());
    expect(useGameStore.getState().canSpinMysteryBox()).toBe(false);
  });

  it('spinMysteryBox grants a reward and marks the week', () => {
    const result = useGameStore.getState().spinMysteryBox();
    expect(result.ok).toBe(true);
    expect(result.reward).toBeDefined();
    expect(mockSetMysteryBoxLastSpin).toHaveBeenCalledWith(isoWeekKey());
  });

  it('spinMysteryBox blocks a second spin in the same week', () => {
    mockGetMysteryBoxLastSpin.mockReturnValue(isoWeekKey());
    const result = useGameStore.getState().spinMysteryBox();
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/already spun/i);
  });

  // ── Streak Milestones ────────────────────────────────────────────────────────

  it('checkStreakMilestones returns null when no character', () => {
    useGameStore.setState({ character: null });
    const result = useGameStore.getState().checkStreakMilestones();
    expect(result).toBeNull();
  });

  it('checkStreakMilestones returns null when streak < 7', () => {
    useGameStore.setState((s) => {
      if (s.character) { s.character.dailyStreak = 3; s.character.claimedStreakMilestones = []; }
      return s;
    });
    const result = useGameStore.getState().checkStreakMilestones();
    expect(result).toBeNull();
  });

  it('checkStreakMilestones grants 7-day gem milestone and records claim', () => {
    useGameStore.setState((s) => {
      if (s.character) {
        s.character.dailyStreak = 7;
        s.character.gems = 0;
        s.character.claimedStreakMilestones = [];
      }
      return s;
    });
    const milestone = useGameStore.getState().checkStreakMilestones();
    expect(milestone).not.toBeNull();
    expect(milestone?.days).toBe(7);
    expect(milestone?.rewardType).toBe('gems');
    const char = useGameStore.getState().character;
    expect(char?.gems).toBe(10);
    expect(char?.claimedStreakMilestones).toContain(7);
  });

  it('checkStreakMilestones does not re-grant already-claimed milestone', () => {
    useGameStore.setState((s) => {
      if (s.character) {
        s.character.dailyStreak = 7;
        s.character.gems = 100;
        s.character.claimedStreakMilestones = [7];
      }
      return s;
    });
    const milestone = useGameStore.getState().checkStreakMilestones();
    expect(milestone).toBeNull();
    expect(useGameStore.getState().character?.gems).toBe(100);
  });

  // ── Streak Shield ────────────────────────────────────────────────────────────

  it('purchaseStreakShield fails when not enough gems', () => {
    useGameStore.setState((s) => {
      if (s.character) { s.character.gems = 10; s.character.streakShieldCount = 0; }
      return s;
    });
    const result = useGameStore.getState().purchaseStreakShield();
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/50 gems/i);
  });

  it('purchaseStreakShield deducts 50 gems and grants 1 shield', () => {
    useGameStore.setState((s) => {
      if (s.character) { s.character.gems = 100; s.character.streakShieldCount = 0; }
      return s;
    });
    const result = useGameStore.getState().purchaseStreakShield();
    expect(result.ok).toBe(true);
    const char = useGameStore.getState().character;
    expect(char?.gems).toBe(50);
    expect(char?.streakShieldCount).toBe(1);
  });

  it('consumeStreakShieldIfAvailable returns false when no shields', () => {
    useGameStore.setState((s) => {
      if (s.character) s.character.streakShieldCount = 0;
      return s;
    });
    const consumed = useGameStore.getState().consumeStreakShieldIfAvailable();
    expect(consumed).toBe(false);
  });

  it('consumeStreakShieldIfAvailable consumes one shield and returns true', () => {
    useGameStore.setState((s) => {
      if (s.character) s.character.streakShieldCount = 2;
      return s;
    });
    const consumed = useGameStore.getState().consumeStreakShieldIfAvailable();
    expect(consumed).toBe(true);
    expect(useGameStore.getState().character?.streakShieldCount).toBe(1);
  });
});
