import { SaveSlot } from "../types";
import {
  listLocalSlots,
  loadCharacterLocal,
  normalizeCharacter,
} from "../services/persistence";

export function isCloudUser(uid: string | undefined): boolean {
  return Boolean(uid && !uid.startsWith("local_guest_"));
}

let loadGeneration = 0;

export function getLoadGeneration(): number {
  return loadGeneration;
}

export function incrementLoadGeneration(): number {
  loadGeneration += 1;
  return loadGeneration;
}

export function buildLocalSlotList(): SaveSlot[] {
  return listLocalSlots().map((slotId) => {
    const char = loadCharacterLocal(slotId);
    if (!char) {
      return {
        slotId,
        name: "Empty Slot",
        age: 0,
        isAlive: false,
        updatedAt: 0,
      };
    }
    const normalized = normalizeCharacter(char);
    const gen = normalized.generation ?? 1;
    return {
      slotId,
      name: normalized.name,
      age: normalized.age,
      isAlive: normalized.isAlive,
      updatedAt: normalized.updatedAt,
      generation: gen,
      heirTransitionsCount: gen > 1 ? gen - 1 : 0,
    };
  });
}
