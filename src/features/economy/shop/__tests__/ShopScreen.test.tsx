jest.mock('@components/index', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    FadeInView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    CurrencyChip: () => null,
    ScreenHeader: ({ title }: { title: string }) =>
      React.createElement(Text, null, title),
  };
});

jest.mock('@shared/components/SupportLifeQuestButton', () => ({
  SupportLifeQuestButton: () => null,
}));

jest.mock('../ShopTabBar', () => ({
  ShopTabBar: () => null,
}));

jest.mock('../FeaturedDealHero', () => ({
  FeaturedDealHero: () => null,
}));

jest.mock('../GemValueCalculator', () => ({
  GemValueCalculator: () => null,
}));

jest.mock('../PremiumBanner', () => ({
  PremiumBanner: () => null,
}));

jest.mock('react-native-safe-area-context', () =>
  require('@test/safeAreaMock').createSafeAreaContextMock(),
);

jest.mock('@hooks/useScreenA11yFocus', () => ({
  useScreenA11yFocus: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: undefined }),
  };
});

jest.mock('@services/ads', () => ({
  showRewardedAd: jest.fn(() => Promise.resolve({ rewarded: true })),
}));

jest.mock('@services/liveOpsConfig', () => ({
  getActiveLimitedTimeOffers: jest.fn(() => []),
}));

jest.mock('@engine/liveOpsEngine', () => ({
  getHydratedLiveOpsConfig: jest.fn(() => ({
    season: null,
    worldEvents: [],
    featuredScenario: 'classic',
    limitedTimeOffers: [],
  })),
}));

jest.mock('@services/persistence', () => ({
  shouldShowStarterOffer: jest.fn(() => false),
}));

const mockPurchaseProduct = jest.fn((_productId: string) => Promise.resolve());

jest.mock('@services/iap', () => ({
  purchaseProduct: (productId: string) => mockPurchaseProduct(productId),
  restorePurchases: jest.fn(() => Promise.resolve([])),
  getIAPProducts: jest.fn(() => [{ productId: 'remove_ads', price: '$2.99' }]),
  processVerifiedPurchase: jest.fn(),
  applyPurchaseToStore: jest.fn(),
}));

jest.mock('../hooks/useShopActions', () => ({
  useShopActions: () => ({
    character: {
      id: '1',
      name: 'Alex',
      coins: 500,
      gems: 10,
      isPremium: false,
      hasSeasonPass: false,
      unlockedAvatarStyles: [],
      unlockedCosmeticIds: [],
    },
    accountIsPremium: false,
    globalPrestige: {
      unlockedCosmeticIds: [],
      unlockedScenarioIds: ['classic'],
    },
    unlockFantasyDlc: jest.fn(() => ({ ok: true })),
    purchaseStreakShield: jest.fn(() => ({ ok: true, message: 'ok' })),
    purchaseMysterySpinWithGems: jest.fn(() => ({ ok: true, message: 'ok' })),
    purchaseCosmetic: jest.fn(() => ({ ok: true, message: 'ok' })),
    applyCosmetic: jest.fn(),
  }),
  getShopStoreState: jest.fn(() => ({ _persist: jest.fn() })),
}));

jest.mock('@store/toastStore', () => ({
  useToastStore: (selector: (s: { showToast: jest.Mock }) => unknown) =>
    selector({ showToast: jest.fn() }),
}));

import { fireEvent } from '@testing-library/react-native';
import { ShopScreen } from '../ShopScreen';
import { renderWithProviders } from '@test/renderWithProviders';

describe('ShopScreen', () => {
  beforeEach(() => {
    mockPurchaseProduct.mockClear();
  });

  it('calls purchaseProduct when a bundle product is tapped', async () => {
    const { getByLabelText } = await renderWithProviders(<ShopScreen />);
    await fireEvent.press(getByLabelText(/Buy Remove Ads for/i));
    expect(mockPurchaseProduct).toHaveBeenCalledWith('remove_ads');
  });
});
