import {
  assertPurchaseState,
  assertSubscriptionPayment,
  getGooglePlayConfig,
  isAllowUnverifiedIap,
  isSubscriptionProduct,
} from '../verifyGooglePlay';
import { grantsForProduct } from '../entitlements';

describe('isSubscriptionProduct', () => {
  it('identifies subscription SKUs', () => {
    expect(isSubscriptionProduct('premium_monthly')).toBe(true);
    expect(isSubscriptionProduct('premium_yearly')).toBe(true);
    expect(isSubscriptionProduct('coins_small')).toBe(false);
  });
});

describe('getGooglePlayConfig', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  it('returns null when secrets are missing', () => {
    delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT;
    expect(getGooglePlayConfig()).toBeNull();
  });

  it('returns config when secrets are set', () => {
    process.env.GOOGLE_PLAY_PACKAGE_NAME = 'com.lifequest.app';
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT = '{"client_email":"x"}';
    expect(getGooglePlayConfig()).toEqual({
      packageName: 'com.lifequest.app',
      serviceAccountJson: '{"client_email":"x"}',
    });
  });
});

describe('isAllowUnverifiedIap', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  it('is false outside the emulator', () => {
    process.env.IAP_ALLOW_UNVERIFIED = 'true';
    delete process.env.FUNCTIONS_EMULATOR;
    expect(isAllowUnverifiedIap()).toBe(false);
  });

  it('is true only in the emulator with the flag', () => {
    process.env.IAP_ALLOW_UNVERIFIED = 'true';
    process.env.FUNCTIONS_EMULATOR = 'true';
    expect(isAllowUnverifiedIap()).toBe(true);
  });
});

describe('assertPurchaseState', () => {
  it('accepts purchased state', () => {
    expect(() => assertPurchaseState(0)).not.toThrow();
  });

  it('rejects non-purchased state', () => {
    expect(() => assertPurchaseState(1)).toThrow(/not completed/);
  });
});

describe('assertSubscriptionPayment', () => {
  it('accepts active payment states', () => {
    expect(() => assertSubscriptionPayment(1)).not.toThrow();
    expect(() => assertSubscriptionPayment(2)).not.toThrow();
  });

  it('rejects inactive subscriptions', () => {
    expect(() => assertSubscriptionPayment(0)).toThrow(/not active/);
  });
});

describe('grantsForProduct', () => {
  it('grants premium perks including luck boosts', () => {
    expect(grantsForProduct('premium_yearly')).toEqual({
      isPremium: true,
      hasNoAds: true,
      hasSeasonPass: true,
      luckBoostGrant: 5,
    });
  });

  it('grants consumables', () => {
    expect(grantsForProduct('gems_small')).toEqual({ gemsGrant: 25 });
    expect(grantsForProduct('reincarnation_scroll')).toEqual({ reincarnationScroll: true });
  });
});
