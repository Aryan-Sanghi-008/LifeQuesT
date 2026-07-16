jest.mock('@shared/components/Avatars', () => ({
  AvatarByCharacter: () => null,
}));

jest.mock('@components/StreakDetailModal', () => ({
  StreakDetailModal: () => null,
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  };
});

jest.mock('@hooks/useBreakpoints', () => ({
  useBreakpoints: () => ({
    isTablet: false,
    isLargeTablet: false,
    contentMaxWidth: undefined,
    width: 390,
  }),
}));

jest.mock('@hooks/useScreenA11yFocus', () => ({
  useScreenA11yFocus: jest.fn(),
}));

const mockClaimLoginReward = jest.fn(() => ({ ok: true, message: 'Claimed!', day: 1, reward: { coins: 50 } }));
const mockGetLoginRewardState = jest.fn(() => ({ day: 1, claimed: false }));

jest.mock('@features/life/hooks/useHomeHub', () => ({
  useHomeHub: () => ({
    character: {
      id: '1',
      name: 'Alex',
      age: 22,
      country: 'India',
      countryFlag: '🇮🇳',
      coins: 100,
      gems: 5,
      dailyStreak: 3,
      streakShieldCount: 0,
      seasonXp: 0,
      hasSeasonPass: false,
      scenarioId: 'classic',
      activeWorldEvents: [],
      activeChallengeId: undefined,
      mysteryTickets: 0,
    },
    dailyQuests: [],
    loadDailyQuests: jest.fn(),
    claimQuestReward: jest.fn(),
    getLoginRewardState: mockGetLoginRewardState,
    claimLoginReward: mockClaimLoginReward,
    canSpinMysteryBox: () => false,
    canSpinMysteryBoxWithTicket: () => false,
    purchaseStreakShield: jest.fn(),
  }),
}));

jest.mock('@store/toastStore', () => ({
  useToastStore: (selector: (s: { showToast: jest.Mock }) => unknown) =>
    selector({ showToast: jest.fn() }),
}));

import { fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { renderWithProviders } from '@test/renderWithProviders';

describe('HomeScreen', () => {
  beforeEach(() => {
    mockClaimLoginReward.mockClear();
    mockGetLoginRewardState.mockReturnValue({ day: 1, claimed: false });
  });

  it('shows claim daily reward control when reward is unclaimed', async () => {
    const { getByLabelText } = await renderWithProviders(<HomeScreen />);
    expect(getByLabelText(/Claim day 1 daily login reward/i)).toBeTruthy();
  });

  it('calls claimLoginReward when daily reward is tapped', async () => {
    const { getByLabelText } = await renderWithProviders(<HomeScreen />);
    await fireEvent.press(getByLabelText(/Claim day 1 daily login reward/i));
    expect(mockClaimLoginReward).toHaveBeenCalledTimes(1);
    expect(mockClaimLoginReward).toHaveReturnedWith(
      expect.objectContaining({ ok: true, message: 'Claimed!' }),
    );
  });
});
