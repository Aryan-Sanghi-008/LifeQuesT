import { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { useSettingsStore } from '@store/settingsStore';
import {
  resolveRootRoute,
  needsAspirationRoute,
  needsCollegeMajorRoute,
  needsCourtRoute,
} from '@navigation/gamePhase';
import { getCurrentRouteName, resetToRoute } from '@navigation/navigationRef';
import { hasSelectedSlotThisSession } from '@navigation/sessionState';

/**
 * Screens that belong to the pre-game / auth phase.
 * resetToRoute('MainTabs') is only called when coming FROM one of these screens.
 * If the player is already on any in-game screen (Assets, Activities, etc.),
 * we skip the reset so gameplay is never interrupted by a state mutation.
 */
const PRE_GAME_ROUTES = new Set<string>([
  'Onboarding', 'AgeGate', 'Auth', 'SaveSlots', 'CharacterCreate',
]);

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
  const pendingCollegeMajorPicker = useGameStore(s => s.pendingCollegeMajorPicker);
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

    if (needsCollegeMajorRoute({ user, character, pendingReincarnation, pendingCollegeMajorPicker })) {
      if (getCurrentRouteName() !== 'CollegeMajorPicker') {
        resetToRoute('CollegeMajorPicker');
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

    const currentRoute = getCurrentRouteName();

    // Never eject the user from the Shop while they are making a purchase.
    // A purchase mutates character state which re-triggers this effect, but
    // the user must remain on the Shop screen to see the confirmation.
    if (currentRoute === 'Shop' && character?.isAlive) return;

    // If the target is MainTabs but we are already on any in-game screen
    // (anything other than a pre-game route), do NOT reset — this prevents
    // state mutations (age up, purchases, etc.) from bouncing back to the Home tab.
    if (target === 'MainTabs' && currentRoute && !PRE_GAME_ROUTES.has(currentRoute)) return;

    // Never pull an alive character back into creation mid-game.
    if (character?.isAlive && target === 'CharacterCreate') return;

    // Once the player has picked a slot this session, don't bounce back to SaveSlots
    // on state mutations — the session flag was set in SaveSlotScreen.handleSelect.
    if (target === 'SaveSlots' && hasSelectedSlotThisSession()) return;

    if (currentRoute === target) return;

    resetToRoute(target);
  }, [
    user,
    character,
    characterId,
    isAlive,
    pendingReincarnation,
    pendingAspirationPicker,
    pendingCollegeMajorPicker,
    pendingCourt,
    isHydrated,
    onboardingComplete,
    ageGateVerified,
  ]);
}
