import { doc, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@services/firebaseClient';
import { useSettingsStore, type SettingsState } from '@store/settingsStore';
import { migrateEquippedSoundPackId } from '@data/soundPacks';

export type CloudSettings = Pick<
  SettingsState,
  | 'colorScheme'
  | 'appThemeId'
  | 'notificationsEnabled'
  | 'soundEnabled'
  | 'musicEnabled'
  | 'hapticsEnabled'
  | 'masterVolume'
  | 'musicVolume'
  | 'equippedEventSkinId'
  | 'equippedNameFontId'
  | 'equippedSoundPackId'
  | 'equippedProfileFrameId'
  | 'equippedTombstoneId'
>;

const SYNC_KEYS: (keyof CloudSettings)[] = [
  'colorScheme',
  'appThemeId',
  'notificationsEnabled',
  'soundEnabled',
  'musicEnabled',
  'hapticsEnabled',
  'masterVolume',
  'musicVolume',
  'equippedEventSkinId',
  'equippedNameFontId',
  'equippedSoundPackId',
  'equippedProfileFrameId',
  'equippedTombstoneId',
];

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUid: string | null = null;
let pendingPatch: Partial<CloudSettings> = {};

export function cloudSettingsFromStore(): CloudSettings {
  const s = useSettingsStore.getState();
  return {
    colorScheme: s.colorScheme,
    appThemeId: s.appThemeId,
    notificationsEnabled: s.notificationsEnabled,
    soundEnabled: s.soundEnabled,
    musicEnabled: s.musicEnabled,
    hapticsEnabled: s.hapticsEnabled,
    masterVolume: s.masterVolume,
    musicVolume: s.musicVolume,
    equippedEventSkinId: s.equippedEventSkinId,
    equippedNameFontId: s.equippedNameFontId,
    equippedSoundPackId: s.equippedSoundPackId,
    equippedProfileFrameId: s.equippedProfileFrameId,
    equippedTombstoneId: s.equippedTombstoneId,
  };
}

export function applyCloudSettings(settings: Partial<CloudSettings>): void {
  const patch: Partial<SettingsState> = {};
  for (const key of SYNC_KEYS) {
    if (settings[key] !== undefined) {
      (patch as Record<string, unknown>)[key] = settings[key];
    }
  }
  if (patch.equippedSoundPackId !== undefined) {
    patch.equippedSoundPackId = migrateEquippedSoundPackId(patch.equippedSoundPackId);
  }
  if (patch.equippedNameFontId === 'font_default') {
    patch.equippedNameFontId = null;
  }
  if (Object.keys(patch).length > 0) {
    useSettingsStore.setState(patch);
    if (patch.equippedSoundPackId !== undefined) {
      void import('@services/audio').then((m) => m.reloadSoundPack());
    }
  }
}

export async function pushSettingsToCloud(uid: string, patch: Partial<CloudSettings>): Promise<void> {
  const db = getFirestoreDb();
  if (!db || uid.startsWith('local_guest_')) return;

  await setDoc(doc(db, 'users', uid), { settings: patch }, { merge: true });
}

export function scheduleSettingsPush(uid: string, patch: Partial<CloudSettings>): void {
  if (uid.startsWith('local_guest_')) return;
  pendingUid = uid;
  pendingPatch = { ...pendingPatch, ...patch };
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    const targetUid = pendingUid;
    const payload = { ...pendingPatch };
    pendingPatch = {};
    pushTimer = null;
    if (targetUid) {
      void pushSettingsToCloud(targetUid, payload);
    }
  }, 300);
}

export function bindSettingsCloudSync(uid: string | null): (() => void) | null {
  if (!uid || uid.startsWith('local_guest_')) return null;

  const store = useSettingsStore;
  let prev = cloudSettingsFromStore();

  return store.subscribe((state) => {
    const next: CloudSettings = {
      colorScheme: state.colorScheme,
      appThemeId: state.appThemeId,
      notificationsEnabled: state.notificationsEnabled,
      soundEnabled: state.soundEnabled,
      musicEnabled: state.musicEnabled,
      hapticsEnabled: state.hapticsEnabled,
      masterVolume: state.masterVolume,
      musicVolume: state.musicVolume,
      equippedEventSkinId: state.equippedEventSkinId,
      equippedNameFontId: state.equippedNameFontId,
      equippedSoundPackId: state.equippedSoundPackId,
      equippedProfileFrameId: state.equippedProfileFrameId,
      equippedTombstoneId: state.equippedTombstoneId,
    };

    const changedKeys = SYNC_KEYS.filter((key) => next[key] !== prev[key]);
    prev = next;
    if (changedKeys.length > 0) {
      const patch = Object.fromEntries(
        changedKeys.map((key) => [key, next[key]]),
      ) as Partial<CloudSettings>;
      scheduleSettingsPush(uid, patch);
    }
  });
}

/** @internal test helper */
export function __resetSettingsSyncForTests(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  pendingUid = null;
  pendingPatch = {};
}
