// ─── Save Slots ──────────────────────────────────────────────────────────────

export interface SaveSlot {
  slotId: string;
  name: string;
  age: number;
  isAlive: boolean;
  updatedAt: number;
  generation?: number;
  heirTransitionsCount?: number;
}

export const MAX_SAVE_SLOTS = 3;
