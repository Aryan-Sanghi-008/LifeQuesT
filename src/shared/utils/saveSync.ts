import { Character, SaveSlot, MAX_SAVE_SLOTS } from '@/types';

/** Pure helper — pick newer save for conflict resolution. */
export function resolveSaveConflict(
  local: Character | null,
  cloud: Character | null,
  localUpdatedAt: number,
  cloudUpdatedAt: number,
): Character | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;
  return cloudUpdatedAt > localUpdatedAt ? cloud : local;
}

export function mergeSlotLists(localSlots: SaveSlot[], cloudSlots: SaveSlot[]): SaveSlot[] {
  const merged = new Map<string, SaveSlot>();

  for (const slotId of Array.from({ length: MAX_SAVE_SLOTS }, (_, i) => String(i))) {
    const local = localSlots.find(s => s.slotId === slotId)
      ?? { slotId, name: 'Empty Slot', age: 0, isAlive: false, updatedAt: 0 };
    const cloud = cloudSlots.find(s => s.slotId === slotId);

    if (!cloud || cloud.updatedAt === 0) {
      merged.set(slotId, local);
      continue;
    }
    if (local.updatedAt === 0) {
      merged.set(slotId, cloud);
      continue;
    }
    merged.set(slotId, cloud.updatedAt >= local.updatedAt ? cloud : local);
  }

  return Array.from(merged.values()).sort((a, b) => Number(a.slotId) - Number(b.slotId));
}
