export function initCrashReporting(): void {
  if (__DEV__) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crashlytics = require('@react-native-firebase/crashlytics').default as {
      setCrashlyticsCollectionEnabled: (enabled: boolean) => Promise<void>;
    };
    void crashlytics.setCrashlyticsCollectionEnabled(true);
  } catch {
    /* crashlytics unavailable in Expo Go */
  }
}

export function recordError(error: unknown): void {
  if (__DEV__) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crashlytics = require('@react-native-firebase/crashlytics').default as {
      recordError: (err: Error) => void;
    };
    const err = error instanceof Error ? error : new Error(String(error));
    crashlytics.recordError(err);
  } catch {
    /* noop */
  }
}
