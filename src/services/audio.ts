// ─── LifeQuest Audio Service ──────────────────────────────────────────────────
// Manages all game sounds using expo-audio (SDK 56+).
// Sounds are pre-loaded for instant playback.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSettingsStore } from '@store/settingsStore';

export type SoundEffect =
  | 'button_tap'
  | 'success'
  | 'error'
  | 'achievement_unlock'
  | 'life_milestone'
  | 'age_up'
  | 'level_up'
  | 'coins_earned'
  | 'negative_event'
  | 'positive_event'
  | 'decision_made'
  | 'page_turn'
  | 'notification'
  | 'death'
  | 'reincarnate';

const SOUND_FILES: Record<SoundEffect, number> = {
  button_tap: require('../../assets/sounds/button_tap.mp3'),
  success: require('../../assets/sounds/success.mp3'),
  error: require('../../assets/sounds/error.mp3'),
  achievement_unlock: require('../../assets/sounds/achievement.mp3'),
  life_milestone: require('../../assets/sounds/milestone.mp3'),
  age_up: require('../../assets/sounds/age_up.mp3'),
  level_up: require('../../assets/sounds/level_up.mp3'),
  coins_earned: require('../../assets/sounds/coins.mp3'),
  negative_event: require('../../assets/sounds/negative.mp3'),
  positive_event: require('../../assets/sounds/positive.mp3'),
  decision_made: require('../../assets/sounds/decision.mp3'),
  page_turn: require('../../assets/sounds/page_turn.mp3'),
  notification: require('../../assets/sounds/notification.mp3'),
  death: require('../../assets/sounds/death.mp3'),
  reincarnate: require('../../assets/sounds/reincarnate.mp3'),
};

const soundPool: Partial<Record<SoundEffect, AudioPlayer>> = {};
let isInitialized = false;

export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
    });

    const priority: SoundEffect[] = [
      'button_tap',
      'success',
      'error',
      'age_up',
      'achievement_unlock',
      'coins_earned',
    ];

    for (const key of priority) {
      try {
        soundPool[key] = createAudioPlayer(SOUND_FILES[key]);
      } catch {
        // Silently fail if a sound file is missing during development
      }
    }

    isInitialized = true;
  } catch (e) {
    console.warn('[Audio] init failed:', e);
  }
}

export async function playSound(effect: SoundEffect): Promise<void> {
  const { soundEnabled, masterVolume } = useSettingsStore.getState();
  if (!soundEnabled) return;

  try {
    const cached = soundPool[effect];
    if (cached) {
      cached.volume = masterVolume;
      cached.seekTo(0);
      cached.play();
      return;
    }

    const player = createAudioPlayer(SOUND_FILES[effect]);
    player.volume = masterVolume;
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        player.remove();
      }
    });
    player.play();
  } catch {
    // Sound errors are non-critical — never crash the game for audio
  }
}

export async function stopAllSounds(): Promise<void> {
  Object.values(soundPool).forEach((player) => {
    try {
      player?.pause();
    } catch {
      /* noop */
    }
  });
}

export async function unloadAllSounds(): Promise<void> {
  Object.values(soundPool).forEach((player) => {
    try {
      player?.remove();
    } catch {
      /* noop */
    }
  });
  (Object.keys(soundPool) as SoundEffect[]).forEach((k) => {
    delete soundPool[k];
  });
  isInitialized = false;
}
