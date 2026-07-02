import { useMemo } from 'react';
import { useSettingsStore } from '@store/settingsStore';
import { resolveEventSkinId, EVENT_SKIN_STYLES } from '@data/eventSkinStyles';

export function useEquippedEventSkin() {
  const equippedEventSkinId = useSettingsStore((s) => s.equippedEventSkinId);
  return useMemo(() => {
    const skinId = resolveEventSkinId(equippedEventSkinId);
    return EVENT_SKIN_STYLES[skinId];
  }, [equippedEventSkinId]);
}
