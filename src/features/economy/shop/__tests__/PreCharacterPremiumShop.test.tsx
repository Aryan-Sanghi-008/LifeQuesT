import { renderWithProviders } from '@test/renderWithProviders';
import { PreCharacterPremiumShop } from '../PreCharacterPremiumShop';

jest.mock('@components/index', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    FadeInView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    ScreenHeader: ({ title }: { title: string }) =>
      React.createElement(Text, null, title),
  };
});

jest.mock('../PremiumBanner', () => ({
  PremiumBanner: () => null,
}));

jest.mock('react-native-safe-area-context', () =>
  require('@test/safeAreaMock').createSafeAreaContextMock(),
);

describe('PreCharacterPremiumShop', () => {
  it('renders trait upsell content when no active character', async () => {
    const onBuyMonthly = jest.fn();
    const { getByText } = await renderWithProviders(
      <PreCharacterPremiumShop
        isPremium={false}
        traitUpsell
        purchasing={null}
        storeProducts={[]}
        onBuyMonthly={onBuyMonthly}
        onBuyYearly={jest.fn()}
        onRestore={jest.fn()}
        onPrivacy={jest.fn()}
      />,
    );

    expect(getByText('Unlock Plus Traits')).toBeTruthy();
    expect(getByText('Lucky')).toBeTruthy();
    expect(getByText('Stoic')).toBeTruthy();
    expect(getByText('Magnetic')).toBeTruthy();
  });

  it('shows active message when account is premium', async () => {
    const { getByText } = await renderWithProviders(
      <PreCharacterPremiumShop
        isPremium
        traitUpsell
        purchasing={null}
        storeProducts={[]}
        onBuyMonthly={jest.fn()}
        onBuyYearly={jest.fn()}
        onRestore={jest.fn()}
        onPrivacy={jest.fn()}
      />,
    );

    expect(getByText('LifeQuest Plus is active')).toBeTruthy();
  });
});
