import { isFirebaseConfigured } from '@config/firebase';

type AnalyticsEvent =
  | 'age_up'
  | 'death'
  | 'purchase'
  | 'reincarnate'
  | 'sign_in'
  | 'create_character';

function getNativeAnalytics():
  | { logEvent: (name: string, params?: Record<string, string | number>) => Promise<void> }
  | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const analytics = require('@react-native-firebase/analytics').default as {
      logEvent: (name: string, params?: Record<string, string | number>) => Promise<void>;
    };
    return analytics;
  } catch {
    return null;
  }
}

export async function logEvent(
  event: AnalyticsEvent,
  params?: Record<string, string | number>,
): Promise<void> {
  if (__DEV__) {
    console.log(`[analytics] ${event}`, params ?? {});
    return;
  }
  if (!isFirebaseConfigured()) return;

  const native = getNativeAnalytics();
  if (!native) return;

  try {
    await native.logEvent(event, params);
  } catch {
    /* analytics must never break gameplay */
  }
}
