import { Character, SaveSlot, MAX_SAVE_SLOTS } from '@/types';
import { SAVE_SCHEMA_VERSION } from '@constants/saveSchema';
import { simpleHash } from '@utils/checksum';

/** Pure helper — pick newer save for conflict resolution. */
export function resolveSaveConflict(
  local: Character | null,
  cloud: Character | null,
  localUpdatedAt: number,
  cloudUpdatedAt: number,
  meta?: {
    localVersion?: number;
    cloudVersion?: number;
    localChecksum?: string;
    cloudChecksum?: string;
  },
): Character | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  if (
    meta?.localChecksum &&
    meta?.cloudChecksum &&
    meta.localChecksum !== meta.cloudChecksum
  ) {
    const localVersion = meta.localVersion ?? 0;
    const cloudVersion = meta.cloudVersion ?? 0;
    if (cloudVersion !== localVersion) {
      return cloudVersion > localVersion ? cloud : local;
    }
  }

  return cloudUpdatedAt > localUpdatedAt ? cloud : local;
}

export type SaveReconcileResult =
  | { action: 'use'; character: Character }
  | { action: 'conflict'; local: Character; cloud: Character };

/** Reconcile local vs cloud character; surfaces conflict when checksums differ within 60s. */
export function reconcileLocalAndCloudSave(
  local: Character,
  cloud: Character,
  cloudMeta: { version?: number; checksum?: string; updatedAt: number },
): SaveReconcileResult {
  const localUpdatedAt = local.updatedAt ?? 0;
  const cloudUpdatedAt = cloudMeta.updatedAt;
  const localChecksum = simpleHash(local);
  const cloudChecksum = cloudMeta.checksum ?? simpleHash(cloud);

  if (localChecksum === cloudChecksum) {
    return {
      action: 'use',
      character: localUpdatedAt >= cloudUpdatedAt ? local : cloud,
    };
  }

  const ambiguous = Math.abs(localUpdatedAt - cloudUpdatedAt) <= 60 * 1000;
  if (ambiguous) {
    return { action: 'conflict', local, cloud };
  }

  const winner = resolveSaveConflict(local, cloud, localUpdatedAt, cloudUpdatedAt, {
    localVersion: SAVE_SCHEMA_VERSION,
    cloudVersion: cloudMeta.version,
    localChecksum,
    cloudChecksum,
  });

  if (!winner) {
    return { action: 'conflict', local, cloud };
  }

  return { action: 'use', character: winner };
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
