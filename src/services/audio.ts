// ─── LifeQuest Audio Service ──────────────────────────────────────────────────
// Manages game SFX using expo-audio (SDK 56+).

import { Asset } from 'expo-asset';
import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from 'expo-audio';
import { useSettingsStore } from '@store/settingsStore';
import { resolveSoundPackId, SOUND_PACK_PROFILES, SoundPackId } from '@data/soundPacks';

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
  button_tap:         require('../../assets/sounds/button_tap.mp3'),
  success:            require('../../assets/sounds/success.mp3'),
  error:              require('../../assets/sounds/error.mp3'),
  achievement_unlock: require('../../assets/sounds/achievement.mp3'),
  life_milestone:     require('../../assets/sounds/milestone.mp3'),
  age_up:             require('../../assets/sounds/age_up.mp3'),
  level_up:           require('../../assets/sounds/level_up.mp3'),
  coins_earned:       require('../../assets/sounds/coins.mp3'),
  negative_event:     require('../../assets/sounds/negative.mp3'),
  positive_event:     require('../../assets/sounds/positive.mp3'),
  decision_made:      require('../../assets/sounds/decision.mp3'),
  page_turn:          require('../../assets/sounds/page_turn.mp3'),
  notification:       require('../../assets/sounds/notification.mp3'),
  death:              require('../../assets/sounds/death.mp3'),
  reincarnate:        require('../../assets/sounds/reincarnate.mp3'),
};

function minimalPack(): Partial<Record<SoundEffect, number>> {
  return {
    button_tap: require('../../assets/sounds/packs/minimal/button_tap.mp3'),
    success: require('../../assets/sounds/packs/minimal/success.mp3'),
    error: require('../../assets/sounds/packs/minimal/error.mp3'),
    notification: require('../../assets/sounds/packs/minimal/notification.mp3'),
    page_turn: require('../../assets/sounds/packs/minimal/page_turn.mp3'),
    positive_event: require('../../assets/sounds/packs/minimal/positive.mp3'),
    negative_event: require('../../assets/sounds/packs/minimal/negative.mp3'),
    decision_made: require('../../assets/sounds/packs/minimal/decision.mp3'),
    age_up: require('../../assets/sounds/packs/minimal/age_up.mp3'),
    death: require('../../assets/sounds/packs/minimal/death.mp3'),
    coins_earned: require('../../assets/sounds/packs/minimal/coins_earned.mp3'),
    achievement_unlock: require('../../assets/sounds/packs/minimal/achievement_unlock.mp3'),
    life_milestone: require('../../assets/sounds/packs/minimal/life_milestone.mp3'),
    level_up: require('../../assets/sounds/packs/minimal/level_up.mp3'),
    reincarnate: require('../../assets/sounds/packs/minimal/reincarnate.mp3'),
  };
}

function jazzPack(): Partial<Record<SoundEffect, number>> {
  return {
    button_tap: require('../../assets/sounds/packs/jazz/button_tap.mp3'),
    success: require('../../assets/sounds/packs/jazz/success.mp3'),
    error: require('../../assets/sounds/packs/jazz/error.mp3'),
    notification: require('../../assets/sounds/packs/jazz/notification.mp3'),
    page_turn: require('../../assets/sounds/packs/jazz/page_turn.mp3'),
    positive_event: require('../../assets/sounds/packs/jazz/positive.mp3'),
    negative_event: require('../../assets/sounds/packs/jazz/negative.mp3'),
    decision_made: require('../../assets/sounds/packs/jazz/decision.mp3'),
    age_up: require('../../assets/sounds/packs/jazz/age_up.mp3'),
    death: require('../../assets/sounds/packs/jazz/death.mp3'),
    coins_earned: require('../../assets/sounds/packs/jazz/coins_earned.mp3'),
    achievement_unlock: require('../../assets/sounds/packs/jazz/achievement_unlock.mp3'),
    life_milestone: require('../../assets/sounds/packs/jazz/life_milestone.mp3'),
    level_up: require('../../assets/sounds/packs/jazz/level_up.mp3'),
    reincarnate: require('../../assets/sounds/packs/jazz/reincarnate.mp3'),
  };
}

function cinematicPack(): Partial<Record<SoundEffect, number>> {
  return {
    button_tap: require('../../assets/sounds/packs/cinematic/button_tap.mp3'),
    success: require('../../assets/sounds/packs/cinematic/success.mp3'),
    error: require('../../assets/sounds/packs/cinematic/error.mp3'),
    notification: require('../../assets/sounds/packs/cinematic/notification.mp3'),
    page_turn: require('../../assets/sounds/packs/cinematic/page_turn.mp3'),
    positive_event: require('../../assets/sounds/packs/cinematic/positive.mp3'),
    negative_event: require('../../assets/sounds/packs/cinematic/negative.mp3'),
    decision_made: require('../../assets/sounds/packs/cinematic/decision.mp3'),
    age_up: require('../../assets/sounds/packs/cinematic/age_up.mp3'),
    death: require('../../assets/sounds/packs/cinematic/death.mp3'),
    coins_earned: require('../../assets/sounds/packs/cinematic/coins_earned.mp3'),
    achievement_unlock: require('../../assets/sounds/packs/cinematic/achievement_unlock.mp3'),
    life_milestone: require('../../assets/sounds/packs/cinematic/life_milestone.mp3'),
    level_up: require('../../assets/sounds/packs/cinematic/level_up.mp3'),
    reincarnate: require('../../assets/sounds/packs/cinematic/reincarnate.mp3'),
  };
}

function lofiPack(): Partial<Record<SoundEffect, number>> {
  return {
    button_tap: require('../../assets/sounds/packs/lofi/button_tap.mp3'),
    success: require('../../assets/sounds/packs/lofi/success.mp3'),
    error: require('../../assets/sounds/packs/lofi/error.mp3'),
    notification: require('../../assets/sounds/packs/lofi/notification.mp3'),
    page_turn: require('../../assets/sounds/packs/lofi/page_turn.mp3'),
    positive_event: require('../../assets/sounds/packs/lofi/positive.mp3'),
    negative_event: require('../../assets/sounds/packs/lofi/negative.mp3'),
    decision_made: require('../../assets/sounds/packs/lofi/decision.mp3'),
    age_up: require('../../assets/sounds/packs/lofi/age_up.mp3'),
    death: require('../../assets/sounds/packs/lofi/death.mp3'),
    coins_earned: require('../../assets/sounds/packs/lofi/coins_earned.mp3'),
    achievement_unlock: require('../../assets/sounds/packs/lofi/achievement_unlock.mp3'),
    life_milestone: require('../../assets/sounds/packs/lofi/life_milestone.mp3'),
    level_up: require('../../assets/sounds/packs/lofi/level_up.mp3'),
    reincarnate: require('../../assets/sounds/packs/lofi/reincarnate.mp3'),
  };
}

const PACK_SOUND_FILES: Record<Exclude<SoundPackId, 'default'>, Partial<Record<SoundEffect, number>>> = {
  minimal: minimalPack(),
  jazz: jazzPack(),
  cinematic: cinematicPack(),
  lofi: lofiPack(),
};

const soundPool: Partial<Record<string, AudioPlayer>> = {};
let sessionReady = false;
let activePackId: SoundPackId = 'default';
let loggedFirstPlay = false;

function poolKey(effect: SoundEffect, packId: SoundPackId): string {
  return `${packId}:${effect}`;
}

function getActiveSoundPackId(): SoundPackId {
  const equipped = useSettingsStore.getState().equippedSoundPackId;
  return resolveSoundPackId(equipped);
}

function resolveModuleId(effect: SoundEffect, packId: SoundPackId): number {
  if (packId !== 'default') {
    const packFiles = PACK_SOUND_FILES[packId];
    const packFile = packFiles?.[effect];
    if (packFile) return packFile;
    if (__DEV__) {
      console.warn(`[Audio] pack "${packId}" missing "${effect}" — falling back to classic`);
    }
  }
  return SOUND_FILES[effect];
}

async function ensureSession(): Promise<void> {
  if (sessionReady) return;
  try {
    await setIsAudioActiveAsync(true);
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
    sessionReady = true;
  } catch (e) {
    if (__DEV__) console.warn('[Audio] session setup failed', e);
  }
}

async function getOrCreateAsync(effect: SoundEffect, packId: SoundPackId): Promise<AudioPlayer> {
  const key = poolKey(effect, packId);
  const existing = soundPool[key];
  if (existing) return existing;

  const moduleId = resolveModuleId(effect, packId);
  const asset = Asset.fromModule(moduleId);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  const uri = asset.localUri ?? asset.uri;
  const player = createAudioPlayer(uri, { updateInterval: 500 });
  soundPool[key] = player;
  return player;
}

export async function initAudio(): Promise<void> {
  activePackId = getActiveSoundPackId();
  await ensureSession();
  const priority: SoundEffect[] = ['button_tap', 'success', 'age_up', 'coins_earned'];
  for (const key of priority) {
    try {
      await getOrCreateAsync(key, activePackId);
    } catch (e) {
      if (__DEV__) console.warn(`[Audio] pre-warm "${key}" failed`, e);
    }
  }
}

export async function reloadSoundPack(): Promise<void> {
  activePackId = getActiveSoundPackId();
  await unloadAllSounds();
  await initAudio();
}

async function ensureActivePackLoaded(): Promise<SoundPackId> {
  const packId = getActiveSoundPackId();
  if (packId !== activePackId) {
    await reloadSoundPack();
    return getActiveSoundPackId();
  }
  return packId;
}

export async function playSound(effect: SoundEffect): Promise<void> {
  const { soundEnabled, masterVolume } = useSettingsStore.getState();
  if (!soundEnabled) return;

  const packId = await ensureActivePackLoaded();
  const profile = SOUND_PACK_PROFILES[packId] ?? SOUND_PACK_PROFILES.default;
  await ensureSession();

  try {
    if (__DEV__ && !loggedFirstPlay) {
      loggedFirstPlay = true;
      console.log(`[Audio] first play effect=${effect} pack=${packId}`);
    }
    const player = await getOrCreateAsync(effect, packId);
    player.volume = Math.max(0, Math.min(1, masterVolume * profile.volumeScale));
    player.muted = false;
    if (player.playing) {
      player.pause();
    }
    await player.seekTo(0);
    player.play();
  } catch (e) {
    if (__DEV__) console.warn(`[Audio] play "${effect}" failed`, e);
  }
}

export async function playSoundPackPreview(cosmeticId: string): Promise<{
  ok: boolean;
  reason?: 'muted' | 'error';
}> {
  const { soundEnabled, masterVolume } = useSettingsStore.getState();
  if (!soundEnabled) return { ok: false, reason: 'muted' };
  const packId = resolveSoundPackId(cosmeticId);
  const profile = SOUND_PACK_PROFILES[packId] ?? SOUND_PACK_PROFILES.default;
  await ensureSession();
  try {
    const player = await getOrCreateAsync('button_tap', packId);
    player.volume = Math.max(0, Math.min(1, masterVolume * profile.volumeScale));
    player.muted = false;
    if (player.playing) player.pause();
    await player.seekTo(0);
    player.play();
    if (__DEV__) {
      console.log(`[Audio] preview pack=${packId} cosmetic=${cosmeticId}`);
    }
    return { ok: true };
  } catch (e) {
    if (__DEV__) console.warn('[Audio] pack preview failed', e);
    return { ok: false, reason: 'error' };
  }
}

async function unloadAllSounds(): Promise<void> {
  for (const key of Object.keys(soundPool)) {
    try {
      soundPool[key]?.remove();
    } catch {
      // ignore
    }
    delete soundPool[key];
  }
}

export async function disposeAudio(): Promise<void> {
  await unloadAllSounds();
  sessionReady = false;
}
