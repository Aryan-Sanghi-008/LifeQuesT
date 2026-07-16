jest.mock('@shared/components/Avatars', () => ({
  NpcAvatar: () => null,
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  };
});

jest.mock('@store/toastStore', () => ({
  useToastStore: (selector: (s: { showToast: jest.Mock }) => unknown) =>
    selector({ showToast: jest.fn() }),
}));

const mockPeople = [
  {
    id: 'p1',
    name: 'Jane Doe',
    age: 45,
    gender: 'female',
    relationType: 'mother',
    relationshipScore: 80,
    avatarSeed: 'seed1',
    isAlive: true,
  },
  {
    id: 'p2',
    name: 'Sam Friend',
    age: 22,
    gender: 'male',
    relationType: 'friend',
    relationshipScore: 55,
    avatarSeed: 'seed2',
    isAlive: true,
  },
];

jest.mock('@store/gameStore', () => ({
  useGameStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      character: {
        age: 22,
        countryCode: 'IN',
        bankBalance: 1000,
        people: mockPeople,
      },
      interactWithPerson: jest.fn(() => ({ message: 'Nice chat', delta: 5 })),
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

import { PeopleScreen } from '../PeopleScreen';
import { renderWithProviders } from '@test/renderWithProviders';

describe('PeopleScreen', () => {
  it('renders grouped people sections', async () => {
    const { getByText } = await renderWithProviders(<PeopleScreen />);
    expect(getByText('People')).toBeTruthy();
    expect(getByText('FAMILY')).toBeTruthy();
    expect(getByText('FRIENDS')).toBeTruthy();
    expect(getByText('Jane Doe')).toBeTruthy();
    expect(getByText('Sam Friend')).toBeTruthy();
  });
});
