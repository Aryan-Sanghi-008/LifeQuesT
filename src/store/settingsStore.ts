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
let webFallbackStore = new Map<string, string>();
let webHydratePromise: Promise<void> | null = null;

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
    getString: (key) => webFallbackStore.get(key),
    set: (key, value) => {
      webFallbackStore.set(key, value);
      void AsyncStorage.setItem(`lq_settings:${key}`, value);
    },
  };
  return settingsStorage;
}

async function hydrateWebSettings(): Promise<void> {
  if (isMmkvAvailable()) return;
  if (webHydratePromise) {
    await webHydratePromise;
    return;
  }

  webHydratePromise = (async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const settingKeys = keys.filter((k) => k.startsWith('lq_settings:'));
      if (settingKeys.length === 0) return;
      const pairs = await AsyncStorage.multiGet(settingKeys);
      for (const [fullKey, value] of pairs) {
        if (value == null) continue;
        webFallbackStore.set(fullKey.replace('lq_settings:', ''), value);
      }
    } catch (e) {
      console.warn('[settings] AsyncStorage hydrate failed', e);
    }
  })();

  await webHydratePromise;
}

/** Ensures persisted settings are loaded before reading sound/haptics flags. */
export async function hydrateSettingsStore(): Promise<void> {
  await hydrateWebSettings();
  const patch: Partial<SettingsState> = {
    masterVolume: load('masterVolume', DEFAULTS.masterVolume),
    soundEnabled: load('soundEnabled', DEFAULTS.soundEnabled),
    musicEnabled: load('musicEnabled', DEFAULTS.musicEnabled),
    musicVolume: load('musicVolume', DEFAULTS.musicVolume),
    hapticsEnabled: load('hapticsEnabled', DEFAULTS.hapticsEnabled),
    notificationsEnabled: load('notificationsEnabled', DEFAULTS.notificationsEnabled),
    reducedMotion: load('reducedMotion', DEFAULTS.reducedMotion),
    colorScheme: load<'light' | 'dark' | 'system'>('colorScheme', DEFAULTS.colorScheme),
    appThemeId: load('appThemeId', DEFAULTS.appThemeId),
    equippedEventSkinId: load<string | null>('equippedEventSkinId', DEFAULTS.equippedEventSkinId),
    equippedNameFontId: load<string | null>('equippedNameFontId', DEFAULTS.equippedNameFontId),
    equippedSoundPackId: load<string | null>('equippedSoundPackId', DEFAULTS.equippedSoundPackId),
    equippedProfileFrameId: load<string | null>('equippedProfileFrameId', DEFAULTS.equippedProfileFrameId),
    onboardingComplete: load('onboardingComplete', DEFAULTS.onboardingComplete),
    ageGateVerified: load('ageGateVerified', DEFAULTS.ageGateVerified),
    verifiedAge: load<number | null>('verifiedAge', DEFAULTS.verifiedAge),
  };
  useSettingsStore.setState(patch);
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
  colorScheme: 'light' | 'dark' | 'system';
  appThemeId: 'default' | 'dark_slate' | 'midnight' | 'sunrise';
  equippedEventSkinId: string | null;
  equippedNameFontId: string | null;
  equippedSoundPackId: string | null;
  equippedProfileFrameId: string | null;

  // Onboarding / legal
  onboardingComplete: boolean;
  ageGateVerified: boolean;
  verifiedAge: number | null;

  // Actions
  setMasterVolume: (v: number) => void;
  setSoundEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
  setHapticsEnabled: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setColorScheme: (v: 'light' | 'dark' | 'system') => void;
  setAppThemeId: (v: 'default' | 'dark_slate' | 'midnight' | 'sunrise') => void;
  setEquippedEventSkinId: (v: string | null) => void;
  setEquippedNameFontId: (v: string | null) => void;
  setEquippedSoundPackId: (v: string | null) => void;
  setEquippedProfileFrameId: (v: string | null) => void;
  setOnboardingComplete: (v: boolean) => void;
  setAgeGateVerified: (age: number) => void;
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
  colorScheme: 'system' as 'light' | 'dark' | 'system',
  appThemeId: 'default' as 'default' | 'dark_slate' | 'midnight' | 'sunrise',
  equippedEventSkinId: null as string | null,
  equippedNameFontId: null as string | null,
  equippedSoundPackId: null as string | null,
  equippedProfileFrameId: null as string | null,
  onboardingComplete: false,
  ageGateVerified: false,
  verifiedAge: null as number | null,
};

function load<T>(key: string, defaultVal: T): T {
  try {
    const raw = getSettingsStorage().getString(key);
    if (raw === undefined) return defaultVal;
    if (typeof defaultVal === 'boolean') return (raw === 'true') as unknown as T;
    if (typeof defaultVal === 'number') return parseFloat(raw) as unknown as T;
    if (defaultVal === null) {
      if (raw === 'null' || raw === '') return null as T;
      if (/^-?\d+(\.\d+)?$/.test(raw)) {
        const n = Number(raw);
        return (Number.isNaN(n) ? null : n) as T;
      }
      return raw as T;
    }
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

void hydrateWebSettings();

export const useSettingsStore = create<SettingsState>()((set) => ({
  masterVolume: load('masterVolume', DEFAULTS.masterVolume),
  soundEnabled: legacyPatch.soundEnabled ?? load('soundEnabled', DEFAULTS.soundEnabled),
  musicEnabled: load('musicEnabled', DEFAULTS.musicEnabled),
  musicVolume: load('musicVolume', DEFAULTS.musicVolume),
  hapticsEnabled: legacyPatch.hapticsEnabled ?? load('hapticsEnabled', DEFAULTS.hapticsEnabled),
  notificationsEnabled: load('notificationsEnabled', DEFAULTS.notificationsEnabled),
  reducedMotion: load('reducedMotion', DEFAULTS.reducedMotion),
  colorScheme: load<'light' | 'dark' | 'system'>('colorScheme', DEFAULTS.colorScheme),
  appThemeId: load<'default' | 'dark_slate' | 'midnight' | 'sunrise'>('appThemeId', DEFAULTS.appThemeId),
  equippedEventSkinId: load<string | null>('equippedEventSkinId', DEFAULTS.equippedEventSkinId),
  equippedNameFontId: load<string | null>('equippedNameFontId', DEFAULTS.equippedNameFontId),
  equippedSoundPackId: load<string | null>('equippedSoundPackId', DEFAULTS.equippedSoundPackId),
  equippedProfileFrameId: load<string | null>('equippedProfileFrameId', DEFAULTS.equippedProfileFrameId),
  onboardingComplete: load('onboardingComplete', DEFAULTS.onboardingComplete),
  ageGateVerified: load('ageGateVerified', DEFAULTS.ageGateVerified),
  verifiedAge: load<number | null>('verifiedAge', DEFAULTS.verifiedAge),

  setMasterVolume: (v) => {
    save('masterVolume', v);
    set({ masterVolume: v });
  },
  setSoundEnabled: (v) => {
    save('soundEnabled', v);
    try {
      const persistence = require('@services/persistence') as typeof import('@services/persistence');
      persistence.setSoundEnabled(v);
    } catch {
      /* persistence optional in tests */
    }
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
    try {
      const persistence = require('@services/persistence') as typeof import('@services/persistence');
      persistence.setHapticsEnabled(v);
    } catch {
      /* persistence optional in tests */
    }
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
  setColorScheme: (v) => {
    save('colorScheme', v);
    set({ colorScheme: v });
  },
  setAppThemeId: (v) => {
    save('appThemeId', v);
    set({ appThemeId: v });
  },
  setEquippedEventSkinId: (v) => {
    save('equippedEventSkinId', v ?? '');
    set({ equippedEventSkinId: v });
  },
  setEquippedNameFontId: (v) => {
    save('equippedNameFontId', v ?? '');
    set({ equippedNameFontId: v });
  },
  setEquippedSoundPackId: (v) => {
    save('equippedSoundPackId', v ?? '');
    set({ equippedSoundPackId: v });
  },
  setEquippedProfileFrameId: (v) => {
    save('equippedProfileFrameId', v ?? '');
    set({ equippedProfileFrameId: v });
  },
  setOnboardingComplete: (v) => {
    save('onboardingComplete', v);
    set({ onboardingComplete: v });
  },
  setAgeGateVerified: (age) => {
    save('ageGateVerified', true);
    save('verifiedAge', age);
    set({ ageGateVerified: true, verifiedAge: age });
  },
  resetToDefaults: () => {
    Object.entries(DEFAULTS).forEach(([k, v]) => save(k, v));
    set({ ...DEFAULTS });
  },
}));
