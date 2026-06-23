import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'LifeQuest',
  slug: 'lifequest',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  scheme: 'lifequest',
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
      backgroundColor: '#080C14',
    },
  },
  plugins: [
    'expo-dev-client',
    'expo-font',
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: 'ca-app-pub-3940256099942544~3347511713',
        iosAppId: 'ca-app-pub-3940256099942544~1458002511',
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          'com.googleusercontent.apps.REPLACE_WITH_YOUR_IOS_CLIENT_ID',
      },
    ],
    'react-native-iap',
    'expo-splash-screen',
  ],
  extra: {
    eas: {
      projectId: '2e33db51-2a88-49b1-89d1-fb72f43ec8cd',
    },
  },
};

export default config;
