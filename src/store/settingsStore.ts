// ─── LifeQuest Settings Store ─────────────────────────────────────────────────
// Persistent game settings: audio, haptics, notifications, etc.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { isMmkvAvailable } from '@utils/nativeAvailability';

type SettingsStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

let settingsStorage: SettingsStorage | null = null;
let asyncHydrated = false;
const asyncCache = new Map<string, string>();

function getSettingsStorage(): SettingsStorage {
  if (settingsStorage) return settingsStorage;

  if (isMmkvAvailable()) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
      const instance = new MMKV({ id: 'lq_settings' });
      settingsStorage = {
        getString: (key) => instance.getString(key),
        set: (key, value) => { instance.set(key, value); },
      };
      return settingsStorage;
    } catch (e) {
      console.warn('[settings] MMKV init failed — using AsyncStorage', e);
    }
  }

  settingsStorage = {
    getString: (key) => asyncCache.get(key),
    set: (key, value) => {
      asyncCache.set(key, value);
      void AsyncStorage.setItem(`lq_settings:${key}`, value);
    },
  };
  return settingsStorage;
}

async function hydrateAsyncSettings(): Promise<void> {
  if (asyncHydrated || isMmkvAvailable()) return;
  asyncHydrated = true;
  try {
    const keys = await AsyncStorage.getAllKeys();
    const settingKeys = keys.filter(k => k.startsWith('lq_settings:'));
    if (settingKeys.length === 0) return;
    const pairs = await AsyncStorage.multiGet(settingKeys);
    for (const [fullKey, value] of pairs) {
      if (value == null) continue;
      asyncCache.set(fullKey.replace('lq_settings:', ''), value);
    }
  } catch (e) {
    console.warn('[settings] AsyncStorage hydrate failed', e);
  }
}

export interface SettingsState {
  // Audio
  masterVolume: number; // 0.0 – 1.0
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;

  // Haptics
  hapticsEnabled: boolean;

  // Notifications
  notificationsEnabled: boolean;

  // Display
  reducedMotion: boolean;

  // Actions
  setMasterVolume: (v: number) => void;
  setSoundEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
  setHapticsEnabled: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULTS = {
  masterVolume: 0.8,
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.5,
  hapticsEnabled: true,
  notificationsEnabled: true,
  reducedMotion: false,
};

function load<T>(key: string, defaultVal: T): T {
  try {
    const raw = getSettingsStorage().getString(key);
    if (raw === undefined) return defaultVal;
    if (typeof defaultVal === 'boolean') return (raw === 'true') as unknown as T;
    if (typeof defaultVal === 'number') return parseFloat(raw) as unknown as T;
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function save(key: string, value: unknown) {
  getSettingsStorage().set(key, String(value));
}

function migrateLegacyPreferences(): Partial<SettingsState> {
  const MIGRATED_KEY = 'legacyPrefsMigrated';
  if (getSettingsStorage().getString(MIGRATED_KEY) === 'true') return {};

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const persistence = require('@services/persistence') as typeof import('@services/persistence');
    const patch: Partial<SettingsState> = {};
    if (persistence.hasExplicitSoundSetting()) {
      patch.soundEnabled = persistence.getSoundEnabled();
    }
    if (persistence.hasExplicitHapticsSetting()) {
      patch.hapticsEnabled = persistence.getHapticsEnabled();
    }
    save(MIGRATED_KEY, 'true');
    Object.entries(patch).forEach(([k, v]) => save(k, v));
    return patch;
  } catch {
    save(MIGRATED_KEY, 'true');
    return {};
  }
}

const legacyPatch = migrateLegacyPreferences();

void hydrateAsyncSettings();

export const useSettingsStore = create<SettingsState>()((set) => ({
  masterVolume: load('masterVolume', DEFAULTS.masterVolume),
  soundEnabled: legacyPatch.soundEnabled ?? load('soundEnabled', DEFAULTS.soundEnabled),
  musicEnabled: load('musicEnabled', DEFAULTS.musicEnabled),
  musicVolume: load('musicVolume', DEFAULTS.musicVolume),
  hapticsEnabled: legacyPatch.hapticsEnabled ?? load('hapticsEnabled', DEFAULTS.hapticsEnabled),
  notificationsEnabled: load('notificationsEnabled', DEFAULTS.notificationsEnabled),
  reducedMotion: load('reducedMotion', DEFAULTS.reducedMotion),

  setMasterVolume: (v) => {
    save('masterVolume', v);
    set({ masterVolume: v });
  },
  setSoundEnabled: (v) => {
    save('soundEnabled', v);
    set({ soundEnabled: v });
  },
  setMusicEnabled: (v) => {
    save('musicEnabled', v);
    set({ musicEnabled: v });
  },
  setMusicVolume: (v) => {
    save('musicVolume', v);
    set({ musicVolume: v });
  },
  setHapticsEnabled: (v) => {
    save('hapticsEnabled', v);
    set({ hapticsEnabled: v });
  },
  setNotificationsEnabled: (v) => {
    save('notificationsEnabled', v);
    set({ notificationsEnabled: v });
  },
  setReducedMotion: (v) => {
    save('reducedMotion', v);
    set({ reducedMotion: v });
  },
  resetToDefaults: () => {
    Object.entries(DEFAULTS).forEach(([k, v]) => save(k, v));
    set({ ...DEFAULTS });
  },
}));
