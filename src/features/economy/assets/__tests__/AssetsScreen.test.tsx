jest.mock('@shared/components/Avatars', () => ({
  NpcAvatar: () => null,
}));

jest.mock('@components/index', () => {
  const React = require('react');
  const { View, Text, Pressable } = require('react-native');
  return {
    Card: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    SectionLabel: ({ children, label }: { children?: React.ReactNode; label?: string }) =>
      React.createElement(Text, null, label ? String(label).toUpperCase() : children),
    ScreenShell: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    TabScreenHeader: ({ title }: { title: string }) => React.createElement(Text, null, title),
    CurrencyChip: () => null,
    HorizontalChipTabBar: ({
      tabs,
      onSelect,
    }: {
      tabs: Array<{ id: string; label: string }>;
      onSelect: (id: string) => void;
    }) =>
      React.createElement(
        View,
        null,
        tabs.map((tab) =>
          React.createElement(
            Pressable,
            { key: tab.id, onPress: () => onSelect(tab.id) },
            React.createElement(Text, null, tab.label),
          ),
        ),
      ),
  };
});

jest.mock('@shared/components/ContextualTutorial', () => ({
  ContextualTutorial: () => null,
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  };
});

jest.mock('react-native-gifted-charts', () => ({
  PieChart: () => null,
  LineChart: () => null,
}));

const mockCharacter = require('@test/fixtures/character').createTestCharacter({
  age: 30,
  bankBalance: 50000,
  assets: [],
  businesses: [],
});

jest.mock('@store/gameStore', () => ({
  useGameStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      character: mockCharacter,
      sellAsset: jest.fn(),
      purchaseAsset: jest.fn(),
      purchaseProperty: jest.fn(),
      purchaseCollectible: jest.fn(),
      purchaseInsurance: jest.fn(),
      sellInsurance: jest.fn(),
      setInsuranceEquipped: jest.fn(),
      setAssetEquipped: jest.fn(),
      setBusinessEquipped: jest.fn(),
      investInStocks: jest.fn(() => ({ ok: true, message: 'ok' })),
      investAngel: jest.fn(() => ({ ok: true, message: 'ok' })),
      refreshAngelDeals: jest.fn(),
      foundFranchise: jest.fn(),
      sellBusiness: jest.fn(),
      hireEmployee: jest.fn(),
      fireEmployee: jest.fn(),
      renovateProperty: jest.fn(() => ({ ok: true, message: 'ok' })),
      setPropertyMode: jest.fn(() => ({ ok: true, message: 'ok' })),
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

import { fireEvent } from '@testing-library/react-native';
import { AssetsScreen } from '../../AssetsScreen';
import { renderWithProviders } from '@test/renderWithProviders';

describe('AssetsScreen', () => {
  it('renders assets header and overview tab content', async () => {
    const { getByText } = await renderWithProviders(<AssetsScreen />);
    expect(getByText('Assets & Finance')).toBeTruthy();
    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Bank Balance')).toBeTruthy();
  });

  it('shows market tab when selected', async () => {
    const { getByText, findByText } = await renderWithProviders(<AssetsScreen />);
    fireEvent.press(getByText('Market'));
    expect(await findByText('Stocks')).toBeTruthy();
  });
});
