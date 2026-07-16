import type {
  Character,
  CharacterStats,
  LifeEventRecord,
  Person,
  YearReviewSnapshot,
} from "@/types";
import type { GameStore } from "@store/types";
import { evaluateUnlockedCollectionIds } from "@engine/collectionsEngine";

export const selectCharacter = (s: GameStore) => s.character;

export const selectCharacterId = (s: GameStore) => s.character?.id;

export const selectCharacterAge = (s: GameStore) => s.character?.age ?? 0;

export const selectCharacterLifePhase = (s: GameStore) =>
  s.character?.lifePhase ?? "planning";

export const selectCharacterEventHistory = (s: GameStore): LifeEventRecord[] =>
  s.character?.eventHistory ?? [];

export const selectCharacterStats = (s: GameStore): CharacterStats | null =>
  s.character?.stats ?? null;

export const selectCharacterPeople = (s: GameStore): Person[] =>
  s.character?.people ?? [];

export type CharacterFinanceSlice = Pick<
  Character,
  | "bankBalance"
  | "debt"
  | "coins"
  | "gems"
  | "creditScore"
  | "creditFactors"
  | "countryCode"
>;

export const selectCharacterFinance = (s: GameStore): CharacterFinanceSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    bankBalance: c.bankBalance,
    debt: c.debt,
    coins: c.coins,
    gems: c.gems,
    creditScore: c.creditScore,
    creditFactors: c.creditFactors,
    countryCode: c.countryCode,
  };
};

export type CharacterLifeHeaderSlice = Pick<
  Character,
  | "name"
  | "gender"
  | "job"
  | "age"
  | "birthYear"
  | "countryCode"
  | "stats"
  | "educationStage"
  | "educationLevel"
  | "enrolledDegreeId"
  | "avatarStyle"
  | "avatarSeed"
  | "avatarId"
  | "lifeStage"
  | "bankBalance"
  | "debt"
>;

export const selectCharacterLifeHeader = (
  s: GameStore,
): CharacterLifeHeaderSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    name: c.name,
    gender: c.gender,
    job: c.job,
    age: c.age,
    birthYear: c.birthYear,
    countryCode: c.countryCode,
    stats: c.stats,
    educationStage: c.educationStage,
    educationLevel: c.educationLevel,
    enrolledDegreeId: c.enrolledDegreeId,
    avatarStyle: c.avatarStyle,
    avatarSeed: c.avatarSeed,
    avatarId: c.avatarId,
    lifeStage: c.lifeStage,
    bankBalance: c.bankBalance,
    debt: c.debt,
  };
};

export type CharacterLifeStatusSlice = Pick<
  Character,
  | "age"
  | "lifePhase"
  | "lastYearReview"
  | "criminalRecord"
  | "focusConfirmedForAge"
  | "familyBackground"
  | "achievements"
  | "isAlive"
  | "deathAge"
>;

export const selectCharacterLifeStatus = (
  s: GameStore,
): CharacterLifeStatusSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    age: c.age,
    lifePhase: c.lifePhase,
    lastYearReview: c.lastYearReview,
    criminalRecord: c.criminalRecord,
    focusConfirmedForAge: c.focusConfirmedForAge,
    familyBackground: c.familyBackground,
    achievements: c.achievements,
    isAlive: c.isAlive,
    deathAge: c.deathAge,
  };
};

export type CharacterDecisionSlice = Pick<
  Character,
  "countryCode" | "debt" | "people" | "bankBalance" | "age" | "assets"
>;

export const selectCharacterDecisionContext = (
  s: GameStore,
): CharacterDecisionSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    countryCode: c.countryCode,
    debt: c.debt,
    people: c.people,
    bankBalance: c.bankBalance,
    age: c.age,
    assets: c.assets,
  };
};

export type CharacterPeopleContextSlice = Pick<
  Character,
  "age" | "countryCode" | "bankBalance" | "people"
>;

export const selectCharacterPeopleContext = (
  s: GameStore,
): CharacterPeopleContextSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    age: c.age,
    countryCode: c.countryCode,
    bankBalance: c.bankBalance,
    people: c.people,
  };
};

export type CharacterAssetsSlice = Pick<
  Character,
  | "assets"
  | "bankBalance"
  | "debt"
  | "coins"
  | "gems"
  | "creditScore"
  | "creditFactors"
  | "countryCode"
  | "age"
  | "insurancePolicies"
  | "angelOpportunities"
  | "businesses"
  | "career"
  | "job"
  | "eventHistory"
  | "educationBranch"
  | "degreeIds"
>;

export const selectCharacterAssetsContext = (
  s: GameStore,
): CharacterAssetsSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    assets: c.assets,
    bankBalance: c.bankBalance,
    debt: c.debt,
    coins: c.coins,
    gems: c.gems,
    creditScore: c.creditScore,
    creditFactors: c.creditFactors,
    countryCode: c.countryCode,
    age: c.age,
    insurancePolicies: c.insurancePolicies,
    angelOpportunities: c.angelOpportunities,
    businesses: c.businesses,
    career: c.career,
    job: c.job,
    eventHistory: c.eventHistory,
    educationBranch: c.educationBranch,
    degreeIds: c.degreeIds,
  };
};

export type CharacterHomeHubSlice = Pick<
  Character,
  | "id"
  | "name"
  | "age"
  | "country"
  | "countryFlag"
  | "countryCode"
  | "coins"
  | "gems"
  | "dailyStreak"
  | "streakShieldCount"
  | "seasonXp"
  | "hasSeasonPass"
  | "scenarioId"
  | "activeWorldEvents"
  | "activeChallengeId"
  | "mysteryTickets"
  | "claimedStreakMilestones"
  | "avatarStyle"
  | "avatarSeed"
  | "avatarId"
  | "gender"
  | "lifeStage"
>;

export const selectCharacterHomeHub = (s: GameStore): CharacterHomeHubSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    age: c.age,
    country: c.country,
    countryFlag: c.countryFlag,
    countryCode: c.countryCode,
    coins: c.coins,
    gems: c.gems,
    dailyStreak: c.dailyStreak,
    streakShieldCount: c.streakShieldCount,
    seasonXp: c.seasonXp,
    hasSeasonPass: c.hasSeasonPass,
    scenarioId: c.scenarioId,
    activeWorldEvents: c.activeWorldEvents,
    activeChallengeId: c.activeChallengeId,
    mysteryTickets: c.mysteryTickets,
    claimedStreakMilestones: c.claimedStreakMilestones,
    avatarStyle: c.avatarStyle,
    avatarSeed: c.avatarSeed,
    avatarId: c.avatarId,
    gender: c.gender,
    lifeStage: c.lifeStage,
  };
};

export type CharacterShopSlice = Pick<
  Character,
  | "coins"
  | "gems"
  | "gender"
  | "avatarStyle"
  | "unlockedAvatarStyles"
  | "hasSeasonPass"
  | "seasonXp"
  | "claimedSeasonTiers"
  | "hasNoAds"
  | "isPremium"
  | "streakShieldCount"
  | "countryCode"
  | "name"
  | "id"
  | "unlockedDlcIds"
>;

export type CharacterChallengeSlice = Pick<
  Character,
  | "activeChallengeId"
  | "countryCode"
  | "bankBalance"
  | "assets"
  | "debt"
  | "deathAge"
  | "age"
  | "karma"
  | "familyBackground"
  | "criminalRecord"
  | "people"
>;

export const selectCharacterShop = (s: GameStore): CharacterShopSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    coins: c.coins,
    gems: c.gems,
    gender: c.gender,
    avatarStyle: c.avatarStyle,
    unlockedAvatarStyles: c.unlockedAvatarStyles,
    hasSeasonPass: c.hasSeasonPass,
    seasonXp: c.seasonXp,
    claimedSeasonTiers: c.claimedSeasonTiers,
    hasNoAds: c.hasNoAds,
    isPremium: c.isPremium,
    streakShieldCount: c.streakShieldCount,
    countryCode: c.countryCode,
    name: c.name,
    id: c.id,
    unlockedDlcIds: c.unlockedDlcIds,
  };
};

export const selectCharacterChallengeContext = (
  s: GameStore,
): CharacterChallengeSlice | null => {
  const c = s.character;
  if (!c) return null;
  return {
    activeChallengeId: c.activeChallengeId,
    countryCode: c.countryCode,
    bankBalance: c.bankBalance,
    assets: c.assets,
    debt: c.debt,
    deathAge: c.deathAge,
    age: c.age,
    karma: c.karma,
    familyBackground: c.familyBackground,
    criminalRecord: c.criminalRecord,
    people: c.people,
  };
};

export const selectUnlockedCollectionIds = (s: GameStore): string[] => {
  const c = s.character;
  if (!c) return [];
  return evaluateUnlockedCollectionIds(c, s.globalPrestige?.prestigeLevel);
};

export const selectCompletedCollectionSetIds = (s: GameStore): string[] =>
  s.character?.completedCollectionSetIds ?? [];

export const selectCharacterFinanceSummaryInput = (
  s: GameStore,
): Pick<Character, "bankBalance" | "assets" | "career"> & { debt?: number } | null => {
  const c = s.character;
  if (!c) return null;
  return {
    bankBalance: c.bankBalance,
    debt: c.debt,
    assets: c.assets,
    career: c.career,
  };
};

export const selectCharacterLastYearReview = (
  s: GameStore,
): YearReviewSnapshot | undefined => s.character?.lastYearReview;
