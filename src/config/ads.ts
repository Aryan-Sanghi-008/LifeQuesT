const TEST_ADMOB_MARKER = '3940256099942544';

const FALLBACK_ANDROID = `ca-app-pub-${TEST_ADMOB_MARKER}~3347511713`;
const FALLBACK_IOS = `ca-app-pub-${TEST_ADMOB_MARKER}~1458002511`;
const FALLBACK_REWARDED = `ca-app-pub-${TEST_ADMOB_MARKER}/5224354917`;
const FALLBACK_INTERSTITIAL = `ca-app-pub-${TEST_ADMOB_MARKER}/1033173712`;

function assertNotTestAdId(value: string, label: string): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) return;
  if (value.includes(TEST_ADMOB_MARKER)) {
    throw new Error(
      `[ads] Release build still using Google test AdMob ID for ${label}. Set EXPO_PUBLIC_ADMOB_* to production units.`,
    );
  }
}

const androidAppId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? FALLBACK_ANDROID;
const iosAppId = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? FALLBACK_IOS;
const rewarded = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? FALLBACK_REWARDED;
const interstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? FALLBACK_INTERSTITIAL;

assertNotTestAdId(androidAppId, 'EXPO_PUBLIC_ADMOB_ANDROID_APP_ID');
assertNotTestAdId(iosAppId, 'EXPO_PUBLIC_ADMOB_IOS_APP_ID');
assertNotTestAdId(rewarded, 'EXPO_PUBLIC_ADMOB_REWARDED_ID');
assertNotTestAdId(interstitial, 'EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID');

export const ADMOB_APP_IDS = {
  android: androidAppId,
  ios: iosAppId,
};

export const AD_UNITS = {
  rewarded,
  interstitial,
};

const INTERSTITIAL_EVERY_N_LIVES_DEFAULT = 3;

export function getInterstitialEveryNLives(): number {
  try {
    const { getInterstitialEveryNLives: fromRc } = require('@services/remoteConfig') as typeof import('@services/remoteConfig');
    return fromRc();
  } catch {
    return INTERSTITIAL_EVERY_N_LIVES_DEFAULT;
  }
}
