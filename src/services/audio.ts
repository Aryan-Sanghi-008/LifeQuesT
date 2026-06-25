// ─── LifeQuest Audio Service ──────────────────────────────────────────────────
// Manages all game sounds using expo-av.
// Sounds are pre-loaded for instant playback.

import { Audio } from "expo-av";
import { useSettingsStore } from "../store/settingsStore";

export type SoundEffect =
  | "button_tap"
  | "success"
  | "error"
  | "achievement_unlock"
  | "life_milestone"
  | "age_up"
  | "level_up"
  | "coins_earned"
  | "negative_event"
  | "positive_event"
  | "decision_made"
  | "page_turn"
  | "notification"
  | "death"
  | "reincarnate";

// Sound file paths (relative to assets/sounds/)
// We use royalty-free sounds embedded in the app bundle.
const SOUND_FILES: Record<SoundEffect, string> = {
  button_tap: require("../../assets/sounds/button_tap.mp3"),
  success: require("../../assets/sounds/success.mp3"),
  error: require("../../assets/sounds/error.mp3"),
  achievement_unlock: require("../../assets/sounds/achievement.mp3"),
  life_milestone: require("../../assets/sounds/milestone.mp3"),
  age_up: require("../../assets/sounds/age_up.mp3"),
  level_up: require("../../assets/sounds/level_up.mp3"),
  coins_earned: require("../../assets/sounds/coins.mp3"),
  negative_event: require("../../assets/sounds/negative.mp3"),
  positive_event: require("../../assets/sounds/positive.mp3"),
  decision_made: require("../../assets/sounds/decision.mp3"),
  page_turn: require("../../assets/sounds/page_turn.mp3"),
  notification: require("../../assets/sounds/notification.mp3"),
  death: require("../../assets/sounds/death.mp3"),
  reincarnate: require("../../assets/sounds/reincarnate.mp3"),
};

// Sound pool — pre-loaded Audio.Sound objects
const soundPool: Partial<Record<SoundEffect, Audio.Sound>> = {};
let isInitialized = false;

/**
 * Initialize the audio system. Call once on app startup.
 */
export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false, // Respect silent mode
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Pre-load high-priority sounds
    const priority: SoundEffect[] = [
      "button_tap",
      "success",
      "error",
      "age_up",
      "achievement_unlock",
      "coins_earned",
    ];
    await Promise.all(
      priority.map(async (key) => {
        try {
          const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key], {
            shouldPlay: false,
          });
          soundPool[key] = sound;
        } catch {
          // Silently fail if a sound file is missing (during development)
        }
      }),
    );

    isInitialized = true;
  } catch (e) {
    console.warn("[Audio] init failed:", e);
  }
}

/**
 * Play a sound effect.
 * Respects user's audio settings (soundEnabled, masterVolume).
 */
export async function playSound(effect: SoundEffect): Promise<void> {
  const { soundEnabled, masterVolume } = useSettingsStore.getState();
  if (!soundEnabled) return;

  try {
    // Use pool if available
    const cached = soundPool[effect];
    if (cached) {
      await cached.setVolumeAsync(masterVolume);
      await cached.replayAsync();
      return;
    }

    // Load on-demand for non-priority sounds
    const { sound } = await Audio.Sound.createAsync(SOUND_FILES[effect], {
      shouldPlay: true,
      volume: masterVolume,
    });
    // Auto-unload after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        void sound.unloadAsync();
      }
    });
  } catch {
    // Sound errors are non-critical — never crash the game for audio
  }
}

/**
 * Stop all sounds (e.g. when navigating away)
 */
export async function stopAllSounds(): Promise<void> {
  await Promise.all(
    Object.values(soundPool).map((sound) => sound?.stopAsync().catch(() => {})),
  );
}

/**
 * Unload all cached sounds (call on app background/unmount)
 */
export async function unloadAllSounds(): Promise<void> {
  await Promise.all(
    Object.values(soundPool).map((sound) =>
      sound?.unloadAsync().catch(() => {}),
    ),
  );
  (Object.keys(soundPool) as SoundEffect[]).forEach((k) => {
    delete soundPool[k];
  });
  isInitialized = false;
}
