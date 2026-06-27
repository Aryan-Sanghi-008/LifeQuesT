import { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { resolveRootRoute } from '@navigation/gamePhase';
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
  const isHydrated = useGameStore(s => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    const target = resolveRootRoute({ user, character, pendingReincarnation });

    // Never pull an alive character back into creation.
    if (target === 'CharacterCreate' && character?.isAlive) return;

    if (getCurrentRouteName() === target) return;

    resetToRoute(target);
  }, [user, character, characterId, isAlive, pendingReincarnation, isHydrated]);
}
