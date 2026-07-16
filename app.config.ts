import type { ExpoConfig } from 'expo/config';

const TEST_ADMOB_MARKER = '3940256099942544';
const TEST_ADMOB_ANDROID = `ca-app-pub-${TEST_ADMOB_MARKER}~3347511713`;
const TEST_ADMOB_IOS = `ca-app-pub-${TEST_ADMOB_MARKER}~1458002511`;

function isProductionBuild(): boolean {
  return process.env.EAS_BUILD_PROFILE === 'production';
}

function assertProductionEnv(): void {
  if (!isProductionBuild()) return;

  const required = [
    'EXPO_PUBLIC_ADMOB_ANDROID_APP_ID',
    'EXPO_PUBLIC_ADMOB_IOS_APP_ID',
    'EXPO_PUBLIC_ADMOB_REWARDED_ID',
    'EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID',
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  ] as const;

  for (const key of required) {
    const value = process.env[key]?.trim();
    if (!value) {
      throw new Error(`[app.config] Production build missing ${key}.`);
    }
    if (value.includes(TEST_ADMOB_MARKER) || value.includes('REPLACE_WITH')) {
      throw new Error(`[app.config] Production build has placeholder value for ${key}.`);
    }
  }
}

function iosUrlSchemeFromClientId(clientId: string | undefined): string {
  if (!clientId?.includes('.apps.googleusercontent.com')) {
    if (isProductionBuild()) {
      throw new Error(
        '[app.config] Production build requires a real EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.',
      );
    }
    return 'com.googleusercontent.apps.REPLACE_WITH_YOUR_IOS_CLIENT_ID';
  }
  const prefix = clientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${prefix}`;
}

assertProductionEnv();

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const config: ExpoConfig = {
  name: 'LifeQuest',
  slug: 'lifequest',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  scheme: 'lifequest',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#080C14',
  },
  ios: {
    bundleIdentifier: 'com.lifequest.app',
    supportsTablet: true,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
  },
  android: {
    package: 'com.lifequest.app',
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#080C14',
    },
  },
  plugins: [
    'expo-dev-client',
    'expo-font',
    '@react-native-firebase/app',
    '@react-native-firebase/crashlytics',
    [
      'react-native-google-mobile-ads',
      {
        androidAppId:
          process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? TEST_ADMOB_ANDROID,
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? TEST_ADMOB_IOS,
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: iosUrlSchemeFromClientId(googleIosClientId),
      },
    ],
    '@iaptic/react-native-iap',
    'expo-splash-screen',
    [
      'expo-notifications',
      {
        color: '#080C14',
      },
    ],
    'expo-audio',
  ],
  extra: {
    eas: {
      projectId: '2e33db51-2a88-49b1-89d1-fb72f43ec8cd',
    },
  },
};

export default config;
