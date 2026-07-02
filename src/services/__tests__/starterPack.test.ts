import {
  incrementAppSessionCount,
  getAppSessionCount,
  setStarterOfferEligible,
  setStarterOfferShownAt,
  setStarterOfferPurchased,
  shouldShowStarterOffer,
  STARTER_OFFER_WINDOW_MS,
} from '../persistence';

describe('starter pack offer persistence', () => {
  it('hides when not eligible', () => {
    setStarterOfferEligible(false);
    setStarterOfferPurchased(false);
    expect(shouldShowStarterOffer()).toBe(false);
  });

  it('hides after purchase even when eligible', () => {
    setStarterOfferEligible(true);
    setStarterOfferPurchased(true);
    expect(shouldShowStarterOffer()).toBe(false);
  });

  it('shows when eligible, unpurchased, session >= 2, and window active', () => {
    setStarterOfferEligible(true);
    setStarterOfferPurchased(false);
    while (getAppSessionCount() < 2) incrementAppSessionCount();
    setStarterOfferShownAt(Date.now());
    expect(shouldShowStarterOffer()).toBe(true);
  });

  it('expires after 24h window from first shown', () => {
    setStarterOfferEligible(true);
    setStarterOfferPurchased(false);
    while (getAppSessionCount() < 2) incrementAppSessionCount();
    setStarterOfferShownAt(Date.now() - STARTER_OFFER_WINDOW_MS - 1);
    expect(shouldShowStarterOffer()).toBe(false);
  });
});
