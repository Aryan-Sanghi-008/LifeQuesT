export const ADMOB_APP_IDS = {
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? 'ca-app-pub-3940256099942544~3347511713',
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? 'ca-app-pub-3940256099942544~1458002511',
};

// Google test ad units — swap for production in .env
export const AD_UNITS = {
  rewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? 'ca-app-pub-3940256099942544/5224354917',
  interstitial: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? 'ca-app-pub-3940256099942544/1033173712',
};

export const INTERSTITIAL_EVERY_N_AGEUPS = 3;
