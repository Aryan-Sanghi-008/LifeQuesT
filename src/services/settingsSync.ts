import { doc, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from '@services/firebaseClient';
import { useSettingsStore, type SettingsState } from '@store/settingsStore';

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
  };
}

export function applyCloudSettings(settings: Partial<CloudSettings>): void {
  const patch: Partial<SettingsState> = {};
  for (const key of SYNC_KEYS) {
    if (settings[key] !== undefined) {
      (patch as Record<string, unknown>)[key] = settings[key];
    }
  }
  if (Object.keys(patch).length > 0) {
    useSettingsStore.setState(patch);
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
