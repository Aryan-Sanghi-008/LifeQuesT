import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, MAX_SAVE_SLOTS } from '../types';
import { getLifeStage } from '../utils/lifeStage';
import { isMmkvAvailable } from '../utils/nativeAvailability';

const LEGACY_KEY = 'lifequest_v3_save';
const LEGACY_V2_KEY = 'lifequest_v2_save';

type MmkvStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

let mmkvStorage: MmkvStorage | null = null;
let mmkvDisabled = false;
const asyncCache = new Map<string, string>();
let asyncHydrated = false;

function getMmkvStorage(): MmkvStorage {
  if (mmkvStorage) return mmkvStorage;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const instance = new MMKV({ id: 'lifequest' });
  mmkvStorage = {
    getString: (key) => instance.getString(key),
    set: (key, value) => instance.set(key, value),
    delete: (key) => instance.delete(key),
  };
  return mmkvStorage;
}

function canUseMmkvStorage(): boolean {
  if (mmkvDisabled || !isMmkvAvailable()) return false;
  try {
    getMmkvStorage();
    return true;
  } catch (e) {
    mmkvDisabled = true;
    mmkvStorage = null;
    console.warn('[persistence] MMKV init failed — using AsyncStorage', e);
    return false;
  }
}

function getString(key: string): string | undefined {
  if (canUseMmkvStorage()) return getMmkvStorage().getString(key);
  return asyncCache.get(key);
}

function setString(key: string, value: string): void {
  if (canUseMmkvStorage()) {
    getMmkvStorage().set(key, value);
    return;
  }
  asyncCache.set(key, value);
  void AsyncStorage.setItem(key, value);
}

function deleteKey(key: string): void {
  if (canUseMmkvStorage()) {
    getMmkvStorage().delete(key);
    return;
  }
  asyncCache.delete(key);
  void AsyncStorage.removeItem(key);
}

async function hydrateAsyncCache(): Promise<void> {
  if (asyncHydrated || canUseMmkvStorage()) return;
  asyncHydrated = true;

  const keys = [
    activeSlotKey(),
    ...Array.from({ length: MAX_SAVE_SLOTS }, (_, i) => slotKey(String(i))),
  ];

  await Promise.all(
    keys.map(async (key) => {
      const value = await AsyncStorage.getItem(key);
      if (value != null) asyncCache.set(key, value);
    }),
  );
}

function slotKey(slotId: string) {
  return `save_slot_${slotId}`;
}

function activeSlotKey() {
  return 'active_slot_id';
}

export function getActiveSlotId(): string {
  return getString(activeSlotKey()) ?? '0';
}

export function setActiveSlotId(slotId: string) {
  setString(activeSlotKey(), slotId);
}

export function saveCharacterLocal(character: Character, slotId = getActiveSlotId()) {
  setString(slotKey(slotId), JSON.stringify(character));
}

export function loadCharacterLocal(slotId: string): Character | null {
  const raw = getString(slotKey(slotId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Character;
  } catch {
    return null;
  }
}

export function deleteCharacterLocal(slotId: string) {
  deleteKey(slotKey(slotId));
}

export function listLocalSlots(): string[] {
  return Array.from({ length: MAX_SAVE_SLOTS }, (_, i) => String(i));
}

/** Migrate legacy AsyncStorage single-save to slot 0 */
export async function migrateLegacySaves(): Promise<Character | null> {
  await hydrateAsyncCache();

  if (loadCharacterLocal('0')) return null;

  let raw = await AsyncStorage.getItem(LEGACY_KEY);
  if (!raw) raw = await AsyncStorage.getItem(LEGACY_V2_KEY);
  if (!raw) return null;

  const char = JSON.parse(raw) as Character;
  saveCharacterLocal(char, '0');
  setActiveSlotId('0');
  await AsyncStorage.removeItem(LEGACY_KEY);
  await AsyncStorage.removeItem(LEGACY_V2_KEY);
  return char;
}

const DAILY_BONUS_KEY = 'daily_bonus_last_claim';

export function getDailyBonusLastClaim(): string | null {
  return getString(DAILY_BONUS_KEY) ?? null;
}

export function setDailyBonusLastClaim(dateKey: string): void {
  setString(DAILY_BONUS_KEY, dateKey);
}

export function normalizeCharacter(char: Character): Character {
  if (!char.gender) char.gender = 'male';
  if (!char.avatarSeed) char.avatarSeed = char.name + char.id;
  if (!char.lifeStage) char.lifeStage = getLifeStage(char.age);
  if (!char.bankBalance) char.bankBalance = char.stats.wealth * 100;
  if (!char.educationLevel) char.educationLevel = 'none';
  if (!char.people) char.people = [];
  if (!char.career) char.career = null;
  if (!char.assets) char.assets = [];
  if (!char.businesses) char.businesses = [];
  if (char.socialFollowers === undefined) char.socialFollowers = 0;
  if (!char.avatarStyle || char.avatarStyle === ('pixel_art' as string)) {
    char.avatarStyle = char.gender === 'female' ? 'lorelei' : char.gender === 'other' ? 'notionists' : 'adventurer';
  }
  if (!char.unlockedAvatarStyles || (char.unlockedAvatarStyles as string[]).includes('pixel_art')) {
    char.unlockedAvatarStyles = [char.avatarStyle];
  }
  if (char.seasonXp === undefined) char.seasonXp = 0;
  if (char.hasSeasonPass === undefined) char.hasSeasonPass = false;
  if (!char.claimedSeasonTiers) char.claimedSeasonTiers = [];
  if (!char.degreeIds) char.degreeIds = [];
  if (!char.eventCooldowns) char.eventCooldowns = {};
  if (!char.educationStage) char.educationStage = 'none';
  if (!char.educationBranch) char.educationBranch = 'none';
  if (!char.stats.mentalHealth) char.stats.mentalHealth = char.stats.happiness ?? 70;
  if (!char.criminalRecord) {
    char.criminalRecord = { crimes: [], jailYearsRemaining: 0, onProbation: false };
  }
  if (char.luckBoostsRemaining === undefined) char.luckBoostsRemaining = 0;
  if (char.hasReincarnationScroll === undefined) char.hasReincarnationScroll = false;
  if (!char.updatedAt) char.updatedAt = char.createdAt ?? Date.now();
  return char;
}

const NOTIFICATIONS_KEY = 'notifications_enabled';
const DAILY_QUESTS_PREFIX = 'daily_quests_';

export function getNotificationsEnabled(): boolean {
  return getString(NOTIFICATIONS_KEY) === 'true';
}

export function setNotificationsEnabled(enabled: boolean): void {
  setString(NOTIFICATIONS_KEY, enabled ? 'true' : 'false');
}

export function getDailyQuestsProgress(dateKey: string): string | null {
  return getString(`${DAILY_QUESTS_PREFIX}${dateKey}`) ?? null;
}

export function setDailyQuestsProgress(dateKey: string, json: string): void {
  setString(`${DAILY_QUESTS_PREFIX}${dateKey}`, json);
}

const WIDGET_SNAPSHOT_KEY = 'widget_character_snapshot';

export function saveWidgetSnapshot(snapshot: string): void {
  setString(WIDGET_SNAPSHOT_KEY, snapshot);
}

export function getWidgetSnapshot(): string | null {
  return getString(WIDGET_SNAPSHOT_KEY) ?? null;
}

const HAPTICS_KEY = 'haptics_enabled';
const SOUND_KEY = 'sound_enabled';
const LEADERBOARD_CACHE_KEY = 'leaderboard_cache';

export function getHapticsEnabled(): boolean {
  const v = getString(HAPTICS_KEY);
  return v === null || v === 'true';
}

export function setHapticsEnabled(enabled: boolean): void {
  setString(HAPTICS_KEY, enabled ? 'true' : 'false');
}

export function getSoundEnabled(): boolean {
  const v = getString(SOUND_KEY);
  return v === null || v === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  setString(SOUND_KEY, enabled ? 'true' : 'false');
}

export function getLeaderboardCache(): string | null {
  return getString(LEADERBOARD_CACHE_KEY) ?? null;
}

export function setLeaderboardCache(json: string): void {
  setString(LEADERBOARD_CACHE_KEY, json);
}
