jest.mock('react-native-safe-area-context', () =>
  require('@test/safeAreaMock').createSafeAreaContextMock(),
);

jest.mock('../CharacterPreview', () => ({
  CharacterPreview: () => null,
}));

jest.mock('@shared/components/Avatars', () => ({
  AvatarByCharacter: () => null,
  DiceBearAvatar: () => null,
}));

jest.mock('@hooks/useScreenA11yFocus', () => ({
  useScreenA11yFocus: jest.fn(),
}));

const mockCreateCharacter = jest.fn(() => Promise.resolve({ ok: true }));

jest.mock('../../hooks/useCharacter', () => ({
  useCharacter: () => ({
    createCharacter: mockCreateCharacter,
    character: null,
    carriedStatsForCreate: null,
  }),
}));

import { fireEvent } from '@testing-library/react-native';
import { seedGameStore } from '@test/seedGameStore';
import { CharacterCreateScreen } from '../CharacterCreateScreen';
import { renderWithProviders } from '@test/renderWithProviders';

const navigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => false),
  replace: jest.fn(),
};

const route = {
  key: 'CharacterCreate',
  name: 'CharacterCreate' as const,
  params: {},
};

function renderCreateScreen() {
  return renderWithProviders(
    <CharacterCreateScreen navigation={navigation as never} route={route as never} />,
  );
}

describe('CharacterCreateScreen', () => {
  beforeEach(() => {
    mockCreateCharacter.mockClear();
    seedGameStore();
  });

  it('shows step 1 identity on first wizard step', async () => {
    const { getByText } = await renderCreateScreen();
    expect(getByText('Identity')).toBeTruthy();
    expect(getByText('Step 1 of 5')).toBeTruthy();
  });

  it('does not advance when name is empty', async () => {
    const { getByLabelText, getByText } = await renderCreateScreen();
    await fireEvent.press(getByLabelText(/Continue to step 2/i));
    expect(getByText('Identity')).toBeTruthy();
  });

  it('advances to origins after entering a name', async () => {
    const { getByPlaceholderText, getByLabelText, getByText } = await renderCreateScreen();
    await fireEvent.changeText(getByPlaceholderText('Enter your name...'), 'Alex');
    await fireEvent.press(getByLabelText(/Continue to step 2/i));
    expect(getByText('Origins')).toBeTruthy();
    expect(getByText('Step 2 of 5')).toBeTruthy();
  });

  it('shows country snapshot and economy details link on origins step', async () => {
    const { getByPlaceholderText, getByLabelText, getByText } = await renderCreateScreen();
    await fireEvent.changeText(getByPlaceholderText('Enter your name...'), 'Alex');
    await fireEvent.press(getByLabelText(/Continue to step 2/i));
    expect(getByText('Life expectancy')).toBeTruthy();
    expect(getByText('Starting balance')).toBeTruthy();
    expect(getByText('View economy details →')).toBeTruthy();
  });
});
