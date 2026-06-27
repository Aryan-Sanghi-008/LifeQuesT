import { useGameNavigationSync } from '@hooks/useGameNavigationSync';

/** Invisible child of NavigationContainer — runs route sync hook. */
export function NavigationSync() {
  useGameNavigationSync();
  return null;
}
