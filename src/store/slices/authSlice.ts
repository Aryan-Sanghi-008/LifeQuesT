import { StateCreator } from "zustand";
import { GameStore } from "../types";
import { AppUser } from "../../types";
import { isCloudUser, buildLocalSlotList } from "../storeHelpers";
import {
  applyEntitlementsToCharacter,
  applyEntitlementsToGlobalPrestige,
  hasPendingGrants,
  clearConsumedGrants,
} from "../../services/entitlements";
import { saveGlobalPrestige } from "../../services/persistence";
import { listCloudSlots } from "../../services/cloudSave";
import { mergeSlotLists } from "@utils/saveSync";
import { bootstrapCloudUser } from "@services/userBootstrap";
import { applyCloudSettings, bindSettingsCloudSync } from "@services/settingsSync";

let settingsSyncUnsub: (() => void) | null = null;

export interface AuthSlice {
  user: AppUser | null;
  isHydrated: boolean;
  setUser: (user: AppUser | null) => void;
  onUserChanged: (user: AppUser | null) => Promise<void>;
  refreshSlotList: () => Promise<any[]>;
}

export const createAuthSlice: StateCreator<
  GameStore,
  [["zustand/immer", never]],
  [],
  AuthSlice
> = (set, get) => ({
  user: null,
  isHydrated: false,

  setUser: (user) =>
    set((s) => {
      s.user = user;
    }),

  onUserChanged: async (user) => {
    if (settingsSyncUnsub) {
      settingsSyncUnsub();
      settingsSyncUnsub = null;
    }

    set((s) => {
      s.user = user;
    });
    if (!isCloudUser(user?.uid)) {
      set((s) => {
        s.slotList = buildLocalSlotList();
        s.slotsSynced = false;
      });
      return;
    }

    try {
      const bootstrap = await bootstrapCloudUser(
        user!.uid,
        user!.displayName ?? 'Player',
        user!.photoURL,
      );

      if (bootstrap.settings) {
        applyCloudSettings(bootstrap.settings);
      }

      settingsSyncUnsub = bindSettingsCloudSync(user!.uid);

      const entitlements = bootstrap.entitlements;
      if (entitlements) {
        const { character, globalPrestige } = get();
        if (entitlements.unlockedScenarioIds?.length) {
          const updatedPrestige = applyEntitlementsToGlobalPrestige(
            globalPrestige,
            entitlements,
          );
          set((s) => {
            s.globalPrestige = updatedPrestige;
          });
          saveGlobalPrestige(updatedPrestige);
        }
        if (character) {
          const updated = applyEntitlementsToCharacter(
            character,
            entitlements,
          );
          set((s) => {
            if (s.character) s.character = updated;
          });
          if (hasPendingGrants(entitlements)) {
            await clearConsumedGrants(user!.uid);
            void get()._persist();
          }
        }
      }
    } catch (e) {
      console.warn("[auth] bootstrap failed", e);
    }

    await get().refreshSlotList();
  },

  refreshSlotList: async () => {
    const { user } = get();
    const localSlots = buildLocalSlotList();

    if (!isCloudUser(user?.uid)) {
      set((s) => {
        s.slotList = localSlots;
        s.slotsSynced = false;
      });
      return localSlots;
    }

    try {
      const cloudSlots = await listCloudSlots(user!.uid);
      const merged = mergeSlotLists(localSlots, cloudSlots);
      set((s) => {
        s.slotList = merged;
        s.slotsSynced = cloudSlots.some((slot) => slot.updatedAt > 0);
      });
      return merged;
    } catch (e) {
      console.warn("[cloudSave] refreshSlotList failed", e);
      set((s) => {
        s.slotList = localSlots;
        s.slotsSynced = false;
      });
      return localSlots;
    }
  },
});
