// ─── LifeQuest Settings Store ─────────────────────────────────────────────────
// Persistent game settings: audio, haptics, notifications, etc.

import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const settingsStorage = new MMKV({ id: "lq_settings" });

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
    const raw = settingsStorage.getString(key);
    if (raw === undefined) return defaultVal;
    if (typeof defaultVal === "boolean")
      return (raw === "true") as unknown as T;
    if (typeof defaultVal === "number") return parseFloat(raw) as unknown as T;
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal;
  }
}

function save(key: string, value: unknown) {
  settingsStorage.set(key, String(value));
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  masterVolume: load("masterVolume", DEFAULTS.masterVolume),
  soundEnabled: load("soundEnabled", DEFAULTS.soundEnabled),
  musicEnabled: load("musicEnabled", DEFAULTS.musicEnabled),
  musicVolume: load("musicVolume", DEFAULTS.musicVolume),
  hapticsEnabled: load("hapticsEnabled", DEFAULTS.hapticsEnabled),
  notificationsEnabled: load(
    "notificationsEnabled",
    DEFAULTS.notificationsEnabled,
  ),
  reducedMotion: load("reducedMotion", DEFAULTS.reducedMotion),

  setMasterVolume: (v) => {
    save("masterVolume", v);
    set({ masterVolume: v });
  },
  setSoundEnabled: (v) => {
    save("soundEnabled", v);
    set({ soundEnabled: v });
  },
  setMusicEnabled: (v) => {
    save("musicEnabled", v);
    set({ musicEnabled: v });
  },
  setMusicVolume: (v) => {
    save("musicVolume", v);
    set({ musicVolume: v });
  },
  setHapticsEnabled: (v) => {
    save("hapticsEnabled", v);
    set({ hapticsEnabled: v });
  },
  setNotificationsEnabled: (v) => {
    save("notificationsEnabled", v);
    set({ notificationsEnabled: v });
  },
  setReducedMotion: (v) => {
    save("reducedMotion", v);
    set({ reducedMotion: v });
  },
  resetToDefaults: () => {
    Object.entries(DEFAULTS).forEach(([k, v]) => save(k, v));
    set({ ...DEFAULTS });
  },
}));
