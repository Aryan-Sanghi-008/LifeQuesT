import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingRoute: keyof RootStackParamList | null = null;
let readyListenerAttached = false;

export function getCurrentRouteName(): keyof RootStackParamList | undefined {
  if (!navigationRef.isReady()) return undefined;
  return navigationRef.getCurrentRoute()?.name as keyof RootStackParamList | undefined;
}

function dispatchReset(name: keyof RootStackParamList): boolean {
  if (!navigationRef.isReady()) return false;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name }],
    }),
  );
  return true;
}

function flushPendingRoute(): void {
  if (!pendingRoute || !navigationRef.isReady()) return;
  const route = pendingRoute;
  pendingRoute = null;
  if (getCurrentRouteName() === route) return;
  dispatchReset(route);
}

function ensureReadyListener(): void {
  if (readyListenerAttached) return;
  readyListenerAttached = true;
  navigationRef.addListener('state', () => {
    if (navigationRef.isReady()) flushPendingRoute();
  });
}

/**
 * Resets the root stack to a single route.
 * Returns true when dispatch succeeded; queues retry when ref is not ready.
 */
export function resetToRoute(name: keyof RootStackParamList): boolean {
  ensureReadyListener();

  if (getCurrentRouteName() === name) {
    pendingRoute = null;
    return true;
  }

  if (!navigationRef.isReady()) {
    pendingRoute = name;
    return false;
  }

  pendingRoute = null;
  return dispatchReset(name);
}
