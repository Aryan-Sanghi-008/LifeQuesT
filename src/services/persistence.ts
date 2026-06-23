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

function useMmkv(): boolean {
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
  if (useMmkv()) return getMmkvStorage().getString(key);
  return asyncCache.get(key);
}

function setString(key: string, value: string): void {
  if (useMmkv()) {
    getMmkvStorage().set(key, value);
    return;
  }
  asyncCache.set(key, value);
  void AsyncStorage.setItem(key, value);
}

function deleteKey(key: string): void {
  if (useMmkv()) {
    getMmkvStorage().delete(key);
    return;
  }
  asyncCache.delete(key);
  void AsyncStorage.removeItem(key);
}

async function hydrateAsyncCache(): Promise<void> {
  if (asyncHydrated || useMmkv()) return;
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

export function normalizeCharacter(char: Character): Character {
  if (!char.gender) char.gender = 'male';
  if (!char.avatarSeed) char.avatarSeed = char.name + char.id;
  if (!char.lifeStage) char.lifeStage = getLifeStage(char.age);
  if (!char.bankBalance) char.bankBalance = char.stats.wealth * 100;
  if (!char.educationLevel) char.educationLevel = 'none';
  if (!char.people) char.people = [];
  if (!char.career) char.career = null;
  if (!char.assets) char.assets = [];
  if (char.luckBoostsRemaining === undefined) char.luckBoostsRemaining = 0;
  if (char.hasReincarnationScroll === undefined) char.hasReincarnationScroll = false;
  return char;
}
