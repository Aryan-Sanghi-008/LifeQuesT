jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const AnimatedView = React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
    React.createElement(View, { ...props, ref }),
  );
  const noop = () => undefined;
  const shared = (init: number) => ({ value: init });
  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      createAnimatedComponent: (C: unknown) => C,
      call: noop,
    },
    View: AnimatedView,
    createAnimatedComponent: (C: unknown) => C,
    useSharedValue: shared,
    useAnimatedStyle: () => ({}),
    withTiming: (v: number) => v,
    withSpring: (v: number) => v,
    withSequence: (...vals: number[]) => vals[vals.length - 1],
    Easing: { out: () => noop, inOut: () => noop, cubic: noop, quad: noop },
    FadeInDown: {
      delay: () => ({
        duration: () => ({
          springify: () => ({ damping: () => undefined }),
        }),
      }),
    },
  };
});

jest.mock('@d11/react-native-fast-image', () => ({
  __esModule: true,
  default: 'FastImage',
  priority: { normal: 'normal' },
  cacheControl: { immutable: 'immutable' },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloaded: true,
      downloadAsync: jest.fn(() => Promise.resolve()),
      localUri: 'file:///test/sound.mp3',
      uri: 'file:///test/sound.mp3',
    })),
  },
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    isLoaded: true,
    currentTime: 0,
    volume: 1,
    muted: false,
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
  setIsAudioActiveAsync: jest.fn(() => Promise.resolve()),
  preload: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  performAndroidHapticsAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy', Soft: 'soft', Rigid: 'rigid' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  AndroidHaptics: {
    Confirm: 'confirm',
    Reject: 'reject',
    Keyboard_Tap: 'keyboard-tap',
    Context_Click: 'context-click',
    Long_Press: 'long-press',
    Virtual_Key: 'virtual-key',
    Segment_Tick: 'segment-tick',
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('id')),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: { DEFAULT: 3, HIGH: 4 },
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
  },
}));

jest.mock('@services/notificationSync', () => ({
  syncGameRetentionNotifications: jest.fn(() => Promise.resolve()),
  handlePostAgeUpNotifications: jest.fn(() => Promise.resolve()),
}));

jest.mock('@services/userBootstrap', () => ({
  bootstrapCloudUser: jest.fn(() => Promise.resolve({
    entitlements: null,
    settings: null,
    profileCreated: false,
  })),
}));

jest.mock('@services/entitlements', () => ({
  fetchUserEntitlements: jest.fn(),
  applyEntitlementsToCharacter: jest.fn((c: unknown) => c),
  hasPendingGrants: jest.fn(() => false),
  clearConsumedGrants: jest.fn(),
}));

jest.mock('@services/cloudSave', () => ({
  syncSaveToCloud: jest.fn(),
  loadSaveFromCloud: jest.fn(),
  deleteCloudSave: jest.fn(),
  listCloudSlots: jest.fn(() => []),
  pullCloudSaveIfNewer: jest.fn(),
}));

jest.mock('@services/settingsSync', () => ({
  applyCloudSettings: jest.fn(),
  bindSettingsCloudSync: jest.fn(() => null),
  scheduleSettingsPush: jest.fn(),
  pushSettingsToCloud: jest.fn(() => Promise.resolve()),
  cloudSettingsFromStore: jest.fn(() => ({})),
  __resetSettingsSyncForTests: jest.fn(),
}));

jest.mock('@services/widgetSnapshot', () => ({
  writeWidgetSnapshot: jest.fn(),
  buildWidgetSnapshot: jest.fn(() => ({
    name: 'Test',
    age: 22,
    job: 'Unemployed',
    health: 70,
    coins: 0,
    mentalHealth: 70,
    updatedAt: Date.now(),
  })),
}));

jest.mock('@hooks/useAccessibilityPreferences', () => ({
  useAccessibilityPreferences: () => ({
    systemReduceMotion: false,
    highTextContrast: false,
  }),
}));