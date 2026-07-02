import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Character,
  MAX_SAVE_SLOTS,
  EducationLevel,
  BusinessEmployee,
  GlobalPrestigeState,
} from "../types";
import {
  generateRandomDNA,
  generateRandomPersonality,
} from "@utils/genetics";
import { getLifeStage } from "@utils/lifeStage";
import { isMmkvAvailable } from "@utils/nativeAvailability";
import { stageToLegacyEducationLevel } from "../data/educationDegrees";
import type { EducationStage } from "../data/educationDegrees";

const LEGACY_KEY = "lifequest_v3_save";
const LEGACY_V2_KEY = "lifequest_v2_save";

type MmkvStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

let mmkvStorage: MmkvStorage | null = null;
let mmkvDisabled = false;
/** In-memory mirror used only when MMKV is unavailable (web / Expo Go). */
const webFallbackStore = new Map<string, string>();
let webHydratePromise: Promise<void> | null = null;

function getMmkvStorage(): MmkvStorage {
  if (mmkvStorage) return mmkvStorage;
  const { MMKV } =
    require("react-native-mmkv") as typeof import("react-native-mmkv");
  const instance = new MMKV({ id: "lifequest" });
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
    console.warn("[persistence] MMKV init failed — using AsyncStorage", e);
    return false;
  }
}

function getString(key: string): string | undefined {
  if (canUseMmkvStorage()) return getMmkvStorage().getString(key);
  return webFallbackStore.get(key);
}

function setString(key: string, value: string): void {
  if (canUseMmkvStorage()) {
    getMmkvStorage().set(key, value);
    return;
  }
  webFallbackStore.set(key, value);
  void AsyncStorage.setItem(key, value);
}

function deleteKey(key: string): void {
  if (canUseMmkvStorage()) {
    getMmkvStorage().delete(key);
    return;
  }
  webFallbackStore.delete(key);
  void AsyncStorage.removeItem(key);
}

/** Load AsyncStorage keys into the web fallback store (web / Expo Go only). */
export async function hydratePersistence(): Promise<void> {
  if (canUseMmkvStorage()) return;
  if (webHydratePromise) {
    await webHydratePromise;
    return;
  }

  webHydratePromise = (async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter((key) => !key.startsWith('lq_settings:'));
      if (appKeys.length === 0) return;
      const pairs = await AsyncStorage.multiGet(appKeys);
      for (const [key, value] of pairs) {
        if (value != null) webFallbackStore.set(key, value);
      }
    } catch (e) {
      console.warn('[persistence] AsyncStorage hydrate failed', e);
    }
  })();

  await webHydratePromise;
}

function slotKey(slotId: string) {
  return `save_slot_${slotId}`;
}

function activeSlotKey() {
  return "active_slot_id";
}

export function getActiveSlotId(): string {
  return getString(activeSlotKey()) ?? "0";
}

export function setActiveSlotId(slotId: string) {
  setString(activeSlotKey(), slotId);
}

export function saveCharacterLocal(
  character: Character,
  slotId = getActiveSlotId(),
) {
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
  await hydratePersistence();

  if (loadCharacterLocal("0")) return null;

  let raw = await AsyncStorage.getItem(LEGACY_KEY);
  if (!raw) raw = await AsyncStorage.getItem(LEGACY_V2_KEY);
  if (!raw) return null;

  const char = JSON.parse(raw) as Character;
  saveCharacterLocal(char, "0");
  setActiveSlotId("0");
  await AsyncStorage.removeItem(LEGACY_KEY);
  await AsyncStorage.removeItem(LEGACY_V2_KEY);
  return char;
}

const DAILY_BONUS_KEY = "daily_bonus_last_claim";

export function getDailyBonusLastClaim(): string | null {
  return getString(DAILY_BONUS_KEY) ?? null;
}

export function setDailyBonusLastClaim(dateKey: string): void {
  setString(DAILY_BONUS_KEY, dateKey);
}

const LOGIN_REWARD_DAY_KEY = "login_reward_day";
const LOGIN_REWARD_LAST_CLAIM_KEY = "login_reward_last_claim";
const MYSTERY_BOX_LAST_SPIN_KEY = "mystery_box_last_spin";

export function getLoginRewardDay(): number {
  const raw = getString(LOGIN_REWARD_DAY_KEY);
  return raw ? parseInt(raw, 10) : 1;
}

export function setLoginRewardDay(day: number): void {
  setString(LOGIN_REWARD_DAY_KEY, String(day));
}

export function getLoginRewardLastClaim(): string | null {
  return getString(LOGIN_REWARD_LAST_CLAIM_KEY) ?? null;
}

export function setLoginRewardLastClaim(dateKey: string): void {
  setString(LOGIN_REWARD_LAST_CLAIM_KEY, dateKey);
}

export function getMysteryBoxLastSpin(): string | null {
  return getString(MYSTERY_BOX_LAST_SPIN_KEY) ?? null;
}

export function setMysteryBoxLastSpin(isoWeekKey: string): void {
  setString(MYSTERY_BOX_LAST_SPIN_KEY, isoWeekKey);
}

function migrateBusinessEmployees(
  employees: BusinessEmployee[] | number | undefined,
): BusinessEmployee[] {
  if (Array.isArray(employees)) return employees;
  if (typeof employees === "number" && employees > 0) {
    return Array.from({ length: employees }, (_, i) => ({
      id: `emp_migrated_${i}`,
      name: i === 0 ? "Founder" : `Employee ${i}`,
      role: i === 0 ? "CEO" : "Staff",
      salary: i === 0 ? 0 : 30000,
      performance: 60,
    }));
  }
  return [
    {
      id: "emp_founder",
      name: "Founder",
      role: "CEO",
      salary: 0,
      performance: 80,
    },
  ];
}

export function normalizeCharacter(char: Character): Character {
  if (!char.gender) char.gender = "male";
  if (!char.avatarSeed) char.avatarSeed = char.name + char.id;
  if (!char.lifeStage) char.lifeStage = getLifeStage(char.age);
  if (!char.bankBalance) char.bankBalance = char.stats.wealth * 100;
  if (char.debt === undefined) char.debt = 0;
  if (!char.educationLevel) char.educationLevel = "none";
  if (!char.people) char.people = [];
  if (!char.countriesLived?.length && char.countryCode) {
    char.countriesLived = [char.countryCode];
  }
  if (!char.career) char.career = null;
  if (!char.assets) char.assets = [];
  if (!char.businesses) char.businesses = [];
  if (char.socialFollowers === undefined) char.socialFollowers = 0;
  if (!char.avatarStyle || char.avatarStyle === ("pixel_art" as string)) {
    char.avatarStyle =
      char.gender === "female"
        ? "lorelei"
        : char.gender === "other"
          ? "notionists"
          : "adventurer";
  }
  if (
    !char.unlockedAvatarStyles ||
    (char.unlockedAvatarStyles as string[]).includes("pixel_art")
  ) {
    char.unlockedAvatarStyles = [char.avatarStyle];
  }
  if (char.seasonXp === undefined) char.seasonXp = 0;
  if (char.hasSeasonPass === undefined) char.hasSeasonPass = false;
  if (!char.claimedSeasonTiers) char.claimedSeasonTiers = [];
  if (!char.degreeIds) char.degreeIds = [];
  if (!char.certificationIds) char.certificationIds = [];
  if (char.totalCareerYears === undefined) char.totalCareerYears = 0;
  if (!char.eventCooldowns) char.eventCooldowns = {};
  if (!char.educationStage) char.educationStage = "none";
  if (!char.educationBranch) char.educationBranch = "none";
  if (char.educationStage && char.educationStage !== "none") {
    const fromStage = stageToLegacyEducationLevel(
      char.educationStage as EducationStage,
    );
    const levels: EducationLevel[] = [
      "none",
      "elementary",
      "secondary",
      "university",
      "graduate",
    ];
    const stageIdx = levels.indexOf(fromStage);
    const levelIdx = levels.indexOf(char.educationLevel ?? "none");
    if (stageIdx > levelIdx) {
      char.educationLevel = fromStage;
    }
  }
  if (!char.stats.mentalHealth)
    char.stats.mentalHealth = char.stats.happiness ?? 70;
  if (!char.criminalRecord) {
    char.criminalRecord = {
      crimes: [],
      jailYearsRemaining: 0,
      onProbation: false,
    };
  }
  if (char.luckBoostsRemaining === undefined) char.luckBoostsRemaining = 0;
  if (char.hasReincarnationScroll === undefined)
    char.hasReincarnationScroll = false;
  if (!char.updatedAt) char.updatedAt = char.createdAt ?? Date.now();
  if (!char.dna) char.dna = generateRandomDNA();
  if (!char.personality) char.personality = generateRandomPersonality();
  if (!char.memories) char.memories = [];
  if (char.familyReputation === undefined) char.familyReputation = 50;
  if (!char.latentTalents) char.latentTalents = [];
  if (!char.memoryTags) char.memoryTags = [];
  if (!char.completedMemoryChains) char.completedMemoryChains = [];
  if (!char.focusDomainsUsed) char.focusDomainsUsed = [];
  if (!char.focusPointsSpent) char.focusPointsSpent = {};
  if (char.focusConfirmedForAge === undefined) char.focusConfirmedForAge = -1;
  if (!char.lifePhase) char.lifePhase = "planning";
  if (char.creditScore === undefined) char.creditScore = 650;
  if (char.heatLevel === undefined)
    char.heatLevel = char.criminalRecord?.heatLevel ?? 0;
  if (!char.hobbyProgress) char.hobbyProgress = {};
  if (!char.socialPosts) char.socialPosts = [];
  char.businesses = (char.businesses ?? []).map((b) => ({
    ...b,
    employees: migrateBusinessEmployees(b.employees),
    payrollMonthly: b.payrollMonthly ?? 0,
  }));

  // Ensure all people have the interactionCooldowns record (added in v4+ fix)
  char.people = char.people.map((p) => ({
    ...p,
    interactionCooldowns: p.interactionCooldowns ?? {},
    dna: p.dna ?? generateRandomDNA(),
    personality: p.personality ?? generateRandomPersonality(),
    goals: p.goals ?? ["Career success"],
    mood: p.mood ?? "Neutral",
    memoriesOfPlayer: p.memoriesOfPlayer ?? [],
    secrets: p.secrets ?? ["Unspoken dream"],
    discoveredSecrets: p.discoveredSecrets ?? [],
  }));
  return char;
}

const NOTIFICATIONS_KEY = "notifications_enabled";
const DAILY_QUESTS_PREFIX = "daily_quests_";

export function getNotificationsEnabled(): boolean {
  const v = getString(NOTIFICATIONS_KEY);
  // Default to true on first install so users get daily reminders.
  // Only returns false when explicitly set to 'false'.
  return v !== "false";
}

export function setNotificationsEnabled(enabled: boolean): void {
  setString(NOTIFICATIONS_KEY, enabled ? "true" : "false");
}

export function getDailyQuestsProgress(dateKey: string): string | null {
  return getString(`${DAILY_QUESTS_PREFIX}${dateKey}`) ?? null;
}

export function setDailyQuestsProgress(dateKey: string, json: string): void {
  setString(`${DAILY_QUESTS_PREFIX}${dateKey}`, json);
}

const WIDGET_SNAPSHOT_KEY = "widget_character_snapshot";

export function saveWidgetSnapshot(snapshot: string): void {
  setString(WIDGET_SNAPSHOT_KEY, snapshot);
}

export function getWidgetSnapshot(): string | null {
  return getString(WIDGET_SNAPSHOT_KEY) ?? null;
}

const HAPTICS_KEY = "haptics_enabled";
const SOUND_KEY = "sound_enabled";
const LEADERBOARD_CACHE_KEY = "leaderboard_cache";

export function getHapticsEnabled(): boolean {
  const v = getString(HAPTICS_KEY);
  return v === null || v === "true";
}

export function hasExplicitHapticsSetting(): boolean {
  return getString(HAPTICS_KEY) !== undefined;
}

export function setHapticsEnabled(enabled: boolean): void {
  setString(HAPTICS_KEY, enabled ? "true" : "false");
}

export function getSoundEnabled(): boolean {
  const v = getString(SOUND_KEY);
  return v === null || v === "true";
}

export function hasExplicitSoundSetting(): boolean {
  return getString(SOUND_KEY) !== undefined;
}

export function setSoundEnabled(enabled: boolean): void {
  setString(SOUND_KEY, enabled ? "true" : "false");
}

export function getLeaderboardCache(): string | null {
  return getString(LEADERBOARD_CACHE_KEY) ?? null;
}

export function setLeaderboardCache(json: string): void {
  setString(LEADERBOARD_CACHE_KEY, json);
}

const PRESTIGE_KEY = "global_prestige_state";

const DEFAULT_PRESTIGE: GlobalPrestigeState = {
  prestigePoints: 0,
  prestigeLevel: 1,
  totalLivesLived: 0,
  completedChallengeIds: [],
  unlockedTraitIds: [],
  unlockedScenarioIds: ['classic', 'rags_to_riches', 'silver_spoon'],
  unlockedDynastyPerkIds: [],
  dynastyStatBonusTier: 0,
  unlockedCosmeticIds: [],
};

export function loadGlobalPrestige(): GlobalPrestigeState {
  const raw = getString(PRESTIGE_KEY);
  if (!raw) return { ...DEFAULT_PRESTIGE };
  try {
    const parsed = JSON.parse(raw);
    const unlockedScenarios = (parsed.unlockedScenarioIds ?? []) as string[];
    // Ensure free scenarios are always present
    const withFree = Array.from(new Set([...unlockedScenarios, 'classic', 'rags_to_riches', 'silver_spoon']));
    return {
      prestigePoints: parsed.prestigePoints ?? 0,
      prestigeLevel: parsed.prestigeLevel ?? 1,
      totalLivesLived: parsed.totalLivesLived ?? 0,
      completedChallengeIds: parsed.completedChallengeIds ?? [],
      unlockedTraitIds: parsed.unlockedTraitIds ?? [],
      unlockedScenarioIds: withFree as GlobalPrestigeState['unlockedScenarioIds'],
      unlockedDynastyPerkIds: parsed.unlockedDynastyPerkIds ?? [],
      familyCrestId: parsed.familyCrestId,
      dynastyStatBonusTier: parsed.dynastyStatBonusTier ?? 0,
      plusScenarioCredits: parsed.plusScenarioCredits,
      plusScenarioCreditsMonth: parsed.plusScenarioCreditsMonth,
      plusMonthScenarioIds: parsed.plusMonthScenarioIds,
      plusCosmeticMonth: parsed.plusCosmeticMonth,
      unlockedCosmeticIds: parsed.unlockedCosmeticIds ?? [],
    };
  } catch {
    return { ...DEFAULT_PRESTIGE };
  }
}

export function saveGlobalPrestige(state: GlobalPrestigeState): void {
  setString(PRESTIGE_KEY, JSON.stringify(state));
}

const APP_SESSION_COUNT_KEY = "app_session_count";
const STARTER_OFFER_ELIGIBLE_KEY = "starterOfferEligible";
const STARTER_OFFER_SHOWN_AT_KEY = "starterOfferShownAt";
const STARTER_OFFER_PURCHASED_KEY = "starterOfferPurchased";

export const STARTER_OFFER_WINDOW_MS = 24 * 60 * 60 * 1000;

export function getAppSessionCount(): number {
  const raw = getString(APP_SESSION_COUNT_KEY);
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function incrementAppSessionCount(): number {
  const next = getAppSessionCount() + 1;
  setString(APP_SESSION_COUNT_KEY, String(next));
  return next;
}

export function setStarterOfferEligible(eligible: boolean): void {
  setString(STARTER_OFFER_ELIGIBLE_KEY, eligible ? "true" : "false");
}

export function isStarterOfferEligible(): boolean {
  return getString(STARTER_OFFER_ELIGIBLE_KEY) === "true";
}

export function setStarterOfferShownAt(timestamp: number): void {
  setString(STARTER_OFFER_SHOWN_AT_KEY, String(timestamp));
}

export function getStarterOfferShownAt(): number | null {
  const raw = getString(STARTER_OFFER_SHOWN_AT_KEY);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}

export function setStarterOfferPurchased(purchased: boolean): void {
  setString(STARTER_OFFER_PURCHASED_KEY, purchased ? "true" : "false");
}

export function isStarterOfferPurchased(): boolean {
  return getString(STARTER_OFFER_PURCHASED_KEY) === "true";
}

export function isStarterOfferWindowActive(): boolean {
  const shownAt = getStarterOfferShownAt();
  if (!shownAt) return true;
  return Date.now() - shownAt < STARTER_OFFER_WINDOW_MS;
}

export function shouldShowStarterOffer(): boolean {
  try {
    const { isStarterPackEnabled } = require('@services/remoteConfig') as typeof import('@services/remoteConfig');
    if (!isStarterPackEnabled()) return false;
  } catch {
    // remote config unavailable — keep local gates
  }
  if (isStarterOfferPurchased()) return false;
  if (!isStarterOfferEligible()) return false;
  if (getAppSessionCount() < 2) return false;
  return isStarterOfferWindowActive();
}

export function markStarterOfferShown(): void {
  if (!getStarterOfferShownAt()) {
    setStarterOfferShownAt(Date.now());
  }
}
