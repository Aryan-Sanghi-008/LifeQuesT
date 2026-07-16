jest.mock('@services/ads', () => ({
  maybeShowDeathInterstitial: jest.fn(() => Promise.resolve()),
}));

jest.mock('@services/leaderboard', () => ({
  computeLeaderboardScore: jest.fn(() => 1000),
  submitLeaderboardScore: jest.fn(() => Promise.resolve()),
}));

jest.mock('@navigation/sessionState', () => ({
  resetSessionState: jest.fn(),
}));

jest.mock('@shared/components/Avatars', () => ({
  AvatarByCharacter: () => null,
}));

jest.mock('@hooks/useScreenA11yFocus', () => ({
  useScreenA11yFocus: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () =>
  require('@test/safeAreaMock').createSafeAreaContextMock(),
);

import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { useGameStore } from '@store/gameStore';
import { createTestCharacter } from '@test/fixtures/character';
import { seedGameStore } from '@test/seedGameStore';
import { DeathScreen } from '../DeathScreen';
import { renderWithProviders } from '@test/renderWithProviders';

describe('DeathScreen', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    seedGameStore({
      character: createTestCharacter({
        isAlive: false,
        deathAge: 72,
        age: 72,
        people: [
          {
            id: 'heir-1',
            name: 'Jamie',
            relationType: 'child',
            isAlive: true,
            age: 30,
            gender: 'female',
            relationshipScore: 80,
            avatarSeed: 'heir-1',
            mood: 'happy',
            goals: [],
          },
        ],
      }),
      globalPrestige: {
        prestigePoints: 0,
        prestigeLevel: 1,
        totalLivesLived: 0,
        completedChallengeIds: [],
        unlockedTraitIds: [],
        unlockedScenarioIds: ['classic'],
        unlockedDynastyPerkIds: [],
        dynastyStatBonusTier: 0,
        familyCrestId: undefined,
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders heir selection for living children', async () => {
    const { getByLabelText } = await renderWithProviders(<DeathScreen />);
    expect(getByLabelText('Select heir Jamie')).toBeTruthy();
  });

  it('calls playAsHeir when continuing as selected heir', async () => {
    const playAsHeirSpy = jest.spyOn(useGameStore.getState(), 'playAsHeir');
    const { getByLabelText } = await renderWithProviders(<DeathScreen />);
    await fireEvent.press(getByLabelText('Select heir Jamie'));
    await fireEvent.press(getByLabelText('Continue as Heir'));
    expect(playAsHeirSpy).toHaveBeenCalledWith('heir-1');
    playAsHeirSpy.mockRestore();
  });
});
