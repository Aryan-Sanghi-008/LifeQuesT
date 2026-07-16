jest.mock('react-native-safe-area-context', () =>
  require('@test/safeAreaMock').createSafeAreaContextMock(),
);

jest.mock('@hooks/useScreenA11yFocus', () => ({
  useScreenA11yFocus: jest.fn(),
}));

jest.mock('@shared/components/Avatars', () => ({
  AvatarByCharacter: () => null,
}));

jest.mock('@components/DecisionSheet', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@components/FocusPhaseSheet', () => ({
  FocusPhaseSheet: () => null,
}));

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');

  const renderSlot = (slot: React.ReactNode | React.ComponentType | undefined) => {
    if (!slot) return null;
    if (typeof slot === 'function') return React.createElement(slot);
    return slot;
  };

  return {
    FlashList: ({
      ListHeaderComponent,
      ListEmptyComponent,
    }: {
      ListHeaderComponent?: React.ReactNode | React.ComponentType;
      ListEmptyComponent?: React.ReactNode | React.ComponentType;
    }) =>
      React.createElement(
        View,
        null,
        renderSlot(ListHeaderComponent),
        renderSlot(ListEmptyComponent),
      ),
  };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  };
});

jest.mock('@services/analytics', () => ({
  logEvent: jest.fn(),
}));

jest.mock('@services/haptics', () => ({
  hapticAgeUp: jest.fn(),
}));

jest.mock('@services/audio', () => ({
  playSound: jest.fn(),
}));

const mockAgeUp = jest.fn();

jest.mock('@features/character/hooks/useCharacter', () => ({
  useCharacter: () => ({
    character: require('@test/fixtures/character').createTestCharacter({
      age: 25,
      lifePhase: 'acting',
      focusConfirmedForAge: 25,
      eventHistory: [],
      isAlive: true,
    }),
    pendingDecision: null,
    isProcessing: false,
    lastAgeUpNotice: null,
    clearAgeUpNotice: jest.fn(),
    ageUp: mockAgeUp,
    resolveDecision: jest.fn(),
    dismissDecision: jest.fn(),
    showConfetti: false,
    setShowConfetti: jest.fn(),
    pendingAspirationPicker: false,
  }),
}));

import { fireEvent, waitFor } from '@testing-library/react-native';
import { LifeScreen } from '../LifeScreen';
import { renderWithProviders } from '@test/renderWithProviders';

describe('LifeScreen', () => {
  beforeEach(() => {
    mockAgeUp.mockClear();
  });

  it('calls ageUp when Age Up button is pressed', async () => {
    const { getByLabelText } = await renderWithProviders(<LifeScreen />);
    await fireEvent.press(getByLabelText('Age up one year'));
    await waitFor(() => {
      expect(mockAgeUp).toHaveBeenCalledTimes(1);
    });
  });
});
