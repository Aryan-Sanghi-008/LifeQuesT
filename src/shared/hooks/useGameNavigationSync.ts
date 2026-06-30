import { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { useSettingsStore } from '@store/settingsStore';
import { resolveRootRoute, needsAspirationRoute, needsCourtRoute } from '@navigation/gamePhase';
import { getCurrentRouteName, resetToRoute } from '@navigation/navigationRef';

/**
 * Imperatively syncs the root stack when game phase changes.
 * RootNavigator keeps a stable key so CharacterCreate wizard state is not wiped.
 */
export function useGameNavigationSync(): void {
  const user = useGameStore(s => s.user);
  const character = useGameStore(s => s.character);
  const characterId = useGameStore(s => s.character?.id);
  const isAlive = useGameStore(s => s.character?.isAlive);
  const pendingReincarnation = useGameStore(s => s.pendingReincarnation);
  const pendingAspirationPicker = useGameStore(s => s.pendingAspirationPicker);
  const pendingCourt = useGameStore(s => s.pendingCourt);
  const isHydrated = useGameStore(s => s.isHydrated);
  const onboardingComplete = useSettingsStore(s => s.onboardingComplete);
  const ageGateVerified = useSettingsStore(s => s.ageGateVerified);

  useEffect(() => {
    if (!isHydrated) return;

    if (needsCourtRoute({ user, character, pendingReincarnation, pendingCourt })) {
      if (getCurrentRouteName() !== 'Court') {
        resetToRoute('Court');
      }
      return;
    }

    if (needsAspirationRoute({ user, character, pendingReincarnation, pendingAspirationPicker })) {
      if (getCurrentRouteName() !== 'AspirationPicker') {
        resetToRoute('AspirationPicker');
      }
      return;
    }

    const target = resolveRootRoute({
      user,
      character,
      pendingReincarnation,
      onboardingComplete,
      ageGateVerified,
    });

    // Never pull an alive character back into creation.
    if (target === 'CharacterCreate' && character?.isAlive) return;

    if (getCurrentRouteName() === target) return;

    resetToRoute(target);
  }, [user, character, characterId, isAlive, pendingReincarnation, pendingAspirationPicker, pendingCourt, isHydrated, onboardingComplete, ageGateVerified]);
}
