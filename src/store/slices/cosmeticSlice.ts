import { StateCreator } from 'zustand';
import { GameStore } from '@store/types';
import { GlobalPrestigeState } from '@/types';
import { saveGlobalPrestige } from '@services/persistence';
import { getMonthKey, getMonthlyCosmeticId } from '@/data/plusRotation';
import {
  getCosmeticById,
  isFreeBaselineCosmetic,
  migrateCosmeticId,
  migrateCosmeticIdList,
} from '@/data/cosmeticCatalog';
import { migrateEquippedSoundPackId } from '@/data/soundPacks';
import { useSettingsStore } from '@store/settingsStore';
import { themeSkinIdFromCosmetic } from '@theme/themeSkins';
import { reloadSoundPack } from '@services/audio';

export interface CosmeticSlice {
  purchaseCosmetic: (cosmeticId: string) => { ok: boolean; message: string };
  grantCosmeticUnlock: (cosmeticId: string) => void;
  applyCosmetic: (cosmeticId: string) => { ok: boolean; message: string };
  grantPlusMonthlyCosmetic: () => void;
}

export const createCosmeticSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  CosmeticSlice
> = (set, get) => ({
  purchaseCosmetic: (cosmeticId) => {
    const item = getCosmeticById(cosmeticId);
    const { character, globalPrestige } = get();
    if (!item) return { ok: false, message: 'Invalid cosmetic.' };
    if (isFreeBaselineCosmetic(item.id)) {
      return { ok: false, message: 'Already owned.' };
    }
    if (!character) return { ok: false, message: 'No active character.' };
    if ((globalPrestige.unlockedCosmeticIds ?? []).includes(cosmeticId)) {
      return { ok: false, message: 'Already owned.' };
    }
    if (item.gemCost && (character.gems ?? 0) < item.gemCost) {
      return { ok: false, message: `Need ${item.gemCost} gems.` };
    }

    set((s) => {
      if (!s.character) return;
      if (item.gemCost) s.character.gems = (s.character.gems ?? 0) - item.gemCost;
      const ids = s.globalPrestige.unlockedCosmeticIds ?? [];
      const resolved = migrateCosmeticId(cosmeticId);
      if (!ids.includes(resolved) && !ids.includes(cosmeticId)) {
        s.globalPrestige.unlockedCosmeticIds = [...ids, resolved];
      }
    });
    saveGlobalPrestige(get().globalPrestige);
    void get()._persist();
    const applyResult = get().applyCosmetic(cosmeticId);
    if (applyResult.ok) {
      return { ok: true, message: `${item.label} unlocked and equipped.` };
    }
    return { ok: true, message: `${item.label} unlocked!` };
  },

  grantCosmeticUnlock: (cosmeticId) => {
    const item = getCosmeticById(cosmeticId);
    if (!item) return;
    set((s) => {
      const ids = s.globalPrestige.unlockedCosmeticIds ?? [];
      if (!ids.includes(cosmeticId)) {
        s.globalPrestige.unlockedCosmeticIds = [...ids, cosmeticId];
      }
    });
    saveGlobalPrestige(get().globalPrestige);
  },

  applyCosmetic: (cosmeticId) => {
    const resolvedId = migrateCosmeticId(cosmeticId);
    const item = getCosmeticById(resolvedId);
    const { globalPrestige } = get();
    if (!item) return { ok: false, message: 'Invalid cosmetic.' };
    const unlocked = migrateCosmeticIdList(globalPrestige.unlockedCosmeticIds);
    if (!isFreeBaselineCosmetic(resolvedId) && !unlocked.includes(resolvedId)) {
      return { ok: false, message: 'Cosmetic not owned.' };
    }
    if (item.category === 'theme') {
      const themeId = themeSkinIdFromCosmetic(resolvedId);
      useSettingsStore.getState().setAppThemeId(themeId);
      return { ok: true, message: `${item.label} theme applied.` };
    }
    if (item.category === 'tombstone') {
      useSettingsStore.getState().setEquippedTombstoneId(resolvedId);
      set((s) => {
        if (s.character) {
          s.character.tombstoneStyleId = resolvedId.replace('tombstone_', '');
        }
      });
      void get()._persist();
      return { ok: true, message: `${item.label} tombstone equipped.` };
    }
    if (item.category === 'event_skin') {
      useSettingsStore.getState().setEquippedEventSkinId(resolvedId);
      return { ok: true, message: `${item.label} event cards equipped.` };
    }
    if (item.category === 'name_font') {
      const fontId = resolvedId === 'font_default' ? null : resolvedId;
      useSettingsStore.getState().setEquippedNameFontId(fontId);
      return { ok: true, message: `${item.label} font pack equipped.` };
    }
    if (item.category === 'sound_pack') {
      const packId = migrateEquippedSoundPackId(
        resolvedId === 'sound_pack_classic' ? null : resolvedId,
      );
      useSettingsStore.getState().setEquippedSoundPackId(packId);
      void reloadSoundPack();
      return { ok: true, message: `${item.label} sound pack equipped.` };
    }
    if (item.category === 'plus_frame') {
      useSettingsStore.getState().setEquippedProfileFrameId(resolvedId);
      return { ok: true, message: `${item.label} profile frame equipped.` };
    }
    return { ok: true, message: `${item.label} saved.` };
  },

  grantPlusMonthlyCosmetic: () => {
    const { character, globalPrestige } = get();
    if (!character?.isPremium) return;
    const month = getMonthKey();
    if (globalPrestige.plusCosmeticMonth === month) return;

    const cosmeticId = getMonthlyCosmeticId(month);
    const unlocked = globalPrestige.unlockedCosmeticIds ?? [];
    const nextIds = unlocked.includes(cosmeticId) ? unlocked : [...unlocked, cosmeticId];

    const nextPrestige: GlobalPrestigeState = {
      ...globalPrestige,
      plusCosmeticMonth: month,
      unlockedCosmeticIds: nextIds,
    };
    set((s) => {
      s.globalPrestige = nextPrestige;
    });
    saveGlobalPrestige(nextPrestige);
    get().applyCosmetic(cosmeticId);
  },
});
