import { isFirebaseConfigured } from '../config/firebase';

type AnalyticsEvent =
  | 'age_up'
  | 'death'
  | 'purchase'
  | 'reincarnate'
  | 'sign_in'
  | 'create_character';

export async function logEvent(event: AnalyticsEvent, params?: Record<string, string | number>): Promise<void> {
  if (__DEV__) {
    console.log(`[analytics] ${event}`, params ?? {});
    return;
  }
  if (!isFirebaseConfigured()) return;
  try {
    const { getAnalytics, logEvent: fbLog } = await import('firebase/analytics');
    const { initializeApp, getApps } = await import('firebase/app');
    const { firebaseConfig } = await import('../config/firebase');
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    fbLog(analytics, event as string, params);
  } catch {
    // analytics unavailable on native without web — use Firebase Analytics RN in production build
  }
}
