import { AD_UNITS } from '../config/ads';
import { isAdsNativeAvailable } from '../utils/nativeAvailability';

type RewardedAd = import('react-native-google-mobile-ads').RewardedAd;
type InterstitialAd = import('react-native-google-mobile-ads').InterstitialAd;

let rewarded: RewardedAd | null = null;
let interstitial: InterstitialAd | null = null;
let initialized = false;

const useTestIds = __DEV__;

function getAdsModule() {
  if (!isAdsNativeAvailable()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-google-mobile-ads') as typeof import('react-native-google-mobile-ads');
}

function rewardedUnit(ads: NonNullable<ReturnType<typeof getAdsModule>>) {
  return useTestIds ? ads.TestIds.REWARDED : AD_UNITS.rewarded;
}

function interstitialUnit(ads: NonNullable<ReturnType<typeof getAdsModule>>) {
  return useTestIds ? ads.TestIds.INTERSTITIAL : AD_UNITS.interstitial;
}

export async function initAds(): Promise<void> {
  if (initialized) return;

  const ads = getAdsModule();
  if (!ads) {
    console.warn('[ads] AdMob unavailable in this build — ads disabled.');
    return;
  }

  try {
    await ads.default().initialize();
    preloadRewarded();
    preloadInterstitial();
    initialized = true;
  } catch (e) {
    console.warn('[ads] init failed', e);
  }
}

function preloadRewarded() {
  const ads = getAdsModule();
  if (!ads) return;
  rewarded = ads.RewardedAd.createForAdRequest(rewardedUnit(ads));
  rewarded.load();
}

function preloadInterstitial() {
  const ads = getAdsModule();
  if (!ads) return;
  interstitial = ads.InterstitialAd.createForAdRequest(interstitialUnit(ads));
  interstitial.load();
}

export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const ads = getAdsModule();
    if (!ads || !rewarded) { resolve(false); return; }

    const unsubLoaded = rewarded.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
      rewarded?.show();
    });

    const unsubEarned = rewarded.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
      cleanup();
      preloadRewarded();
      resolve(true);
    });

    const unsubClosed = rewarded.addAdEventListener(ads.AdEventType.CLOSED, () => {
      cleanup();
      preloadRewarded();
      resolve(false);
    });

    function cleanup() {
      unsubLoaded(); unsubEarned(); unsubClosed();
    }

    if (rewarded.loaded) rewarded.show();
    else rewarded.load();
  });
}

export function maybeShowInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    const ads = getAdsModule();
    if (!ads || !interstitial) { resolve(); return; }

    const unsub = interstitial.addAdEventListener(ads.AdEventType.CLOSED, () => {
      unsub();
      preloadInterstitial();
      resolve();
    });

    if (interstitial.loaded) interstitial.show();
    else { resolve(); preloadInterstitial(); }
  });
}
