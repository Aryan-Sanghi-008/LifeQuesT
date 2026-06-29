import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { SaveSlot, Character, SyncConflict } from "../../types";
import {
  migrateLegacySaves,
  getActiveSlotId,
  setActiveSlotId,
  loadCharacterLocal,
  normalizeCharacter,
  loadGlobalPrestige,
  saveCharacterLocal,
  deleteCharacterLocal,
} from "../../services/persistence";
import { writeWidgetSnapshot } from "../../services/widgetSnapshot";
import { loadSaveFromCloud, syncSaveToCloud, deleteCloudSave } from "../../services/cloudSave";
import { isCloudUser, buildLocalSlotList, getLoadGeneration, incrementLoadGeneration } from "../storeHelpers";

export interface SaveSlice {
  activeSlotId: string;
  slotList: SaveSlot[];
  slotsSynced: boolean;
  syncConflict: SyncConflict | null;

  saveGame: () => Promise<void>;
  loadGame: (slotId?: string) => Promise<void>;
  loadSlot: (slotId: string) => Promise<void>;
  listSlots: () => SaveSlot[];
  deleteSlot: (slotId: string) => Promise<void>;
  resetGame: () => Promise<void>;
  resolveConflictChoice: (choice: "local" | "cloud") => void;
  _persist: () => Promise<void>;
}

export const createSaveSlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  SaveSlice
> = (set, get) => ({
  activeSlotId: "0",
  slotList: buildLocalSlotList(),
  slotsSynced: false,
  syncConflict: null,

  saveGame: async () => {
    await get()._persist();
  },

  loadGame: async (slotId) => {
    const gen = incrementLoadGeneration();
    try {
      await migrateLegacySaves();
      const id = slotId ?? getActiveSlotId();
      setActiveSlotId(id);

      let char = loadCharacterLocal(id);
      if (char) char = normalizeCharacter(char);

      const { user } = get();
      let cloudChar: Character | null = null;
      if (isCloudUser(user?.uid)) {
        try {
          const payload = await loadSaveFromCloud(user!.uid, id);
          if (payload) {
            cloudChar = normalizeCharacter(payload.character);
          }
        } catch (e) {
          console.warn("[cloudSave] loadSaveFromCloud failed", e);
        }
      }

      if (gen !== getLoadGeneration()) return;

      if (char && cloudChar) {
        const localUpdatedAt = char.updatedAt ?? 0;
        const cloudUpdatedAt = cloudChar.updatedAt ?? 0;
        if (Math.abs(localUpdatedAt - cloudUpdatedAt) > 60 * 1000) {
          set((s) => {
            s.activeSlotId = id;
            s.syncConflict = {
              local: char!,
              cloud: cloudChar!,
              resolve: (choice) => get().resolveConflictChoice(choice),
            };
          });
          return;
        }
      }

      if (cloudChar) {
        const localUpdatedAt = char?.updatedAt ?? 0;
        if (cloudChar.updatedAt > localUpdatedAt) {
          char = cloudChar;
          saveCharacterLocal(char, id);
        }
      }

      const current = get().character;
      if (current) {
        if (!char || current.updatedAt > (char.updatedAt ?? 0)) {
          set((s) => {
            s.isHydrated = true;
          });
          return;
        }
      }

      const prestige = loadGlobalPrestige();
      set((s) => {
        s.character = char;
        s.activeSlotId = id;
        s.globalPrestige = prestige;
        s.syncConflict = null;
        s.isHydrated = true;
      });
    } catch {
      if (gen === getLoadGeneration()) {
        set((s) => {
          s.isHydrated = true;
        });
      }
    }
  },

  loadSlot: async (slotId) => {
    setActiveSlotId(slotId);
    await get().loadGame(slotId);
  },

  listSlots: () => {
    const cached = get().slotList;
    if (cached.length > 0) return cached;
    return buildLocalSlotList();
  },

  deleteSlot: async (slotId) => {
    incrementLoadGeneration();
    deleteCharacterLocal(slotId);
    const { user, activeSlotId } = get();
    if (user && !user.uid.startsWith("local_guest_")) {
      try {
        await deleteCloudSave(user.uid, slotId);
      } catch {
        /* cloud delete is best-effort */
      }
    }
    set((s) => {
      if (activeSlotId === slotId) {
        s.character = null;
        s.pendingDecision = null;
        s.pendingReincarnation = false;
      }
      s.slotList = buildLocalSlotList();
    });
    if (user && !user.uid.startsWith("local_guest_")) {
      await get().refreshSlotList();
    }
  },

  resetGame: async () => {
    incrementLoadGeneration();
    const slotId = get().activeSlotId;
    deleteCharacterLocal(slotId);
    set((s) => {
      s.character = null;
      s.pendingDecision = null;
      s.isProcessing = false;
      s.sessionAges = 0;
      s.carriedStatsForCreate = null;
      s.pendingReincarnation = false;
      s.slotList = buildLocalSlotList();
    });
  },

  resolveConflictChoice: (choice) => {
    const conflict = get().syncConflict;
    if (!conflict) return;

    const id = get().activeSlotId;
    const selected = choice === "local" ? conflict.local : conflict.cloud;
    saveCharacterLocal(selected, id);

    const prestige = loadGlobalPrestige();
    set((s) => {
      s.character = selected;
      s.globalPrestige = prestige;
      s.syncConflict = null;
      s.isHydrated = true;
    });
    void get()._persist();
  },

  _persist: async () => {
    const { character, user, activeSlotId } = get();
    if (!character) return;

    const stamped = { ...character, updatedAt: Date.now() };
    set((s) => {
      if (s.character) s.character.updatedAt = stamped.updatedAt;
    });

    saveCharacterLocal(stamped, activeSlotId);
    writeWidgetSnapshot(stamped);

    if (isCloudUser(user?.uid)) {
      try {
        await syncSaveToCloud(user!.uid, activeSlotId, stamped);
      } catch (e) {
        console.warn("[cloudSave] sync failed", e);
      }
    }
  },
});
