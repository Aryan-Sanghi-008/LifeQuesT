import type { ExpoConfig } from 'expo/config';

const TEST_ADMOB_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_ADMOB_IOS = 'ca-app-pub-3940256099942544~1458002511';

function iosUrlSchemeFromClientId(clientId: string | undefined): string {
  if (!clientId?.includes('.apps.googleusercontent.com')) {
    return 'com.googleusercontent.apps.REPLACE_WITH_YOUR_IOS_CLIENT_ID';
  }
  const prefix = clientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${prefix}`;
}

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const config: ExpoConfig = {
  name: 'LifeQuest',
  slug: 'lifequest',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
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
    'expo-notifications',
  ],
  extra: {
    eas: {
      projectId: '2e33db51-2a88-49b1-89d1-fb72f43ec8cd',
    },
  },
};

export default config;
