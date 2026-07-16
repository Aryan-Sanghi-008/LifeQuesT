import type { Character } from '@/types';
import {
  loadCharacterLocal,
  saveCharacterLocal,
  listLocalSlots,
} from '@services/persistence';
import type { UserEntitlements } from '@utils/entitlementGrants';
import { applyEntitlementsToCharacter } from '@utils/entitlementGrants';

/**
 * Propagate account-level flags (Plus / ads / season) onto every local save slot.
 * Consumable grants (coins/gems) are NOT fan-out — only permanent entitlements.
 */
export function fanOutAccountEntitlementsToAllSlots(
  entitlements: Pick<UserEntitlements, 'isPremium' | 'hasNoAds' | 'hasSeasonPass' | 'unlockedAvatarStyles'>,
  activeSlotId?: string,
  activeCharacter?: Character | null,
): Character | null {
  const permanent: UserEntitlements = {
    isPremium: entitlements.isPremium,
    hasNoAds: entitlements.hasNoAds,
    hasSeasonPass: entitlements.hasSeasonPass,
    unlockedAvatarStyles: entitlements.unlockedAvatarStyles,
  };

  let updatedActive: Character | null = activeCharacter ?? null;
  const slotIds = listLocalSlots();

  for (const slotId of slotIds) {
    if (activeSlotId && slotId === activeSlotId && activeCharacter) {
      updatedActive = applyEntitlementsToCharacter(activeCharacter, permanent);
      saveCharacterLocal(updatedActive, slotId);
      continue;
    }
    const char = loadCharacterLocal(slotId);
    if (!char) continue;
    const next = applyEntitlementsToCharacter(char, permanent);
    saveCharacterLocal(next, slotId);
  }

  return updatedActive;
}
