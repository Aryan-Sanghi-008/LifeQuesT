import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Character, CharacterStats,
  PendingDecision, AppUser, AvatarId, FamilyBackground,
  Gender, Asset, SaveSlot,
  DailyQuest, Person,
} from '../types';
import {
  TRAITS, COUNTRIES, ACTIVITIES, ACHIEVEMENT_COIN_REWARDS,
} from '../data/gameData';
import { getStartingBalance, getCountryEconomy } from '../data/countryEconomy';
import { generateParents, generatePet } from '../utils/npcGenerator';
import { applyEffect, computeNetWorth, clamp, investInMarket } from '../engine/economyEngine';
import {
  applySuccessChance, consumeLuckBoost,
} from '../engine/eventEngine';
import {
  workHarder, askForRaise,
  checkCareerEligibility, rollForHire, getCountrySalary,
  applyForPromotion,
} from '../engine/careerEngine';
import {
  checkCertificationEligibility, rollCertificationExam,
} from '../engine/certificationEngine';
import { getCareerById, careerPathToLegacy } from '../data/careerPaths';
import {
  ensureCoworkers, getInteraction, getClassmates,
} from '../engine/peopleEngine';
import {
  getActiveSlotId, setActiveSlotId, saveCharacterLocal,
  loadCharacterLocal, deleteCharacterLocal, listLocalSlots,
  migrateLegacySaves, normalizeCharacter,
  getDailyBonusLastClaim, setDailyBonusLastClaim,
  getDailyQuestsProgress, setDailyQuestsProgress,
} from '../services/persistence';
import {
  syncSaveToCloud, pullCloudSaveIfNewer, listCloudSlots,
} from '../services/cloudSave';
import { mergeSlotLists } from '../utils/saveSync';
import {
  fetchUserEntitlements, applyEntitlementsToCharacter, hasPendingGrants, clearConsumedGrants,
} from '../services/entitlements';
import { logEvent } from '../services/analytics';
import { writeWidgetSnapshot } from '../services/widgetSnapshot';
import { recordCrime, isInJail } from '../engine/crimeEngine';
import {
  foundBusiness as createBusiness,
  sellBusiness as liquidateBusiness,
  canFoundBusiness,
} from '../engine/businessEngine';
import {
  pickStudyQuestions, gradeStudySession, canStudy, StudyQuestion, StudySessionResult,
  advanceEducation, enrollInProgram,
} from '../engine/educationEngine';
import {
  pickDailyQuests, updateQuestProgress, isQuestComplete, claimQuest, stampKarmaBaseline,
} from '../engine/questEngine';
import { runAgeUp } from '../engine/ageUpEngine';
import { runResolveDecision } from '../engine/resolveDecisionEngine';
import { SEASON_PASS_TIERS } from '../data/gameData';
import { hapticAgeUp, hapticAchievement, hapticDeath } from '../services/haptics';
import { playSound } from '../services/audio';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Bumps on createCharacter to invalidate in-flight loadGame calls. */
let loadGeneration = 0;

function defaultUnlockedStyles(gender: Gender): NonNullable<Character['unlockedAvatarStyles']> {
  if (gender === 'female') return ['lorelei'];
  if (gender === 'other') return ['notionists'];
  return ['adventurer'];
}

export interface CreateCharacterPayload {
  name: string;
  gender: Gender;
  avatarId?: AvatarId;
  countryCode: string;
  zodiac: string;
  zodiacBonusStat?: string;
  familyBackground: FamilyBackground;
  traits: string[];
  carriedStats?: Partial<CharacterStats>;
}

function buildCharacter(data: CreateCharacterPayload): Character {
  const bgData: Record<FamilyBackground, number> = { poor: 5, middle: 30, wealthy: 65, royalty: 90 };
  const wealthStart = bgData[data.familyBackground] ?? 30;
  const countryData = COUNTRIES.find(c => c.code === data.countryCode);
  const wealthMod = countryData?.wealthMod ?? 0;

  const traitEffect: Partial<CharacterStats> = {};
  data.traits.forEach(traitId => {
    const trait = TRAITS.find(t => t.id === traitId);
    if (!trait) return;
    const te = traitEffect as unknown as Record<string, number>;
    const se = trait.statEffect as unknown as Record<string, number>;
    Object.keys(se).forEach(k => { te[k] = (te[k] ?? 0) + se[k]; });
  });

  const zodiacBonus: Partial<CharacterStats> = {};
  if (data.zodiacBonusStat) {
    (zodiacBonus as unknown as Record<string, number>)[data.zodiacBonusStat] = 5;
  }

  const applyCarry = (base: number, key: keyof CharacterStats) => {
    const carried = data.carriedStats?.[key];
    if (carried !== undefined) return clamp(Math.round(base * 0.5 + carried * 0.5));
    return base;
  };

  const stats: CharacterStats = {
    health:       applyCarry(clamp(80 + (traitEffect.health ?? 0)), 'health'),
    happiness:    applyCarry(clamp(70 + (traitEffect.happiness ?? 0)), 'happiness'),
    intelligence: applyCarry(clamp(50 + (traitEffect.intelligence ?? 0) + (zodiacBonus.intelligence ?? 0)), 'intelligence'),
    wealth:       clamp(wealthStart + wealthMod + (traitEffect.wealth ?? 0)),
    fitness:      applyCarry(clamp(60 + (traitEffect.fitness ?? 0)), 'fitness'),
    looks:        applyCarry(clamp(60 + (traitEffect.looks ?? 0)), 'looks'),
    social:       applyCarry(clamp(50 + (traitEffect.social ?? 0) + (zodiacBonus.social ?? 0)), 'social'),
    ambition:     applyCarry(clamp(50 + (traitEffect.ambition ?? 0) + (zodiacBonus.ambition ?? 0)), 'ambition'),
    mentalHealth: applyCarry(clamp(70 + (traitEffect.mentalHealth ?? 0)), 'mentalHealth'),
  };

  // Use centralized country economy for starting balance (TASK 3 fix)
  const bankBalance = getStartingBalance(data.familyBackground, data.countryCode);
  const id = generateId();
  const parents = generateParents(data.name, data.countryCode, data.familyBackground);

  return normalizeCharacter({
    id,
    name: data.name,
    gender: data.gender,
    avatarSeed: data.name + id,
    avatarId: (data.gender === 'female' ? 'female_1' : 'male_1') as AvatarId,
    lifeStage: 'infant',
    country: countryData?.name ?? 'India',
    countryFlag: countryData?.flag ?? '🇮🇳',
    countryCode: data.countryCode ?? 'IN',
    zodiac: data.zodiac,
    familyBackground: data.familyBackground,
    traits: data.traits,
    job: 'Student',
    age: 0,
    birthYear: new Date().getFullYear(),
    stats,
    karma: 50,
    bankBalance,
    netWorthPeak: bankBalance,
    relationships: 0,
    children: 0,
    educationLevel: 'none',
    people: parents,
    career: null,
    assets: [],
    achievements: [],
    eventHistory: [{
      id: 'birth', age: 0,
      title: 'Welcome to the World',
      description: 'You took your first breath. The room was loud, then warm.',
      statEffect: { happiness: 10, health: 5 },
      category: 'milestone', color: '#2DD4BF', timestamp: Date.now(),
    }],
    isAlive: true,
    coins: 500,
    gems: 0,
    isPremium: false,
    hasNoAds: false,
    luckBoostsRemaining: 0,
    hasReincarnationScroll: false,
    businesses: [],
    socialFollowers: 0,
    avatarStyle: data.gender === 'female' ? 'lorelei' : data.gender === 'other' ? 'notionists' : 'adventurer',
    unlockedAvatarStyles: [data.gender === 'female' ? 'lorelei' : data.gender === 'other' ? 'notionists' : 'adventurer'],
    degreeIds: [],
    certificationIds: [],
    totalCareerYears: 0,
    educationStage: 'none',
    educationBranch: 'none',
    seasonXp: 0,
    hasSeasonPass: false,
    claimedSeasonTiers: [],
    criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

function buildLocalSlotList(): SaveSlot[] {
  return listLocalSlots().map(slotId => {
    const char = loadCharacterLocal(slotId);
    if (!char) {
      return { slotId, name: 'Empty Slot', age: 0, isAlive: false, updatedAt: 0 };
    }
    const normalized = normalizeCharacter(char);
    return {
      slotId,
      name: normalized.name,
      age: normalized.age,
      isAlive: normalized.isAlive,
      updatedAt: normalized.updatedAt,
    };
  });
}

function isCloudUser(uid: string | undefined): boolean {
  return Boolean(uid && !uid.startsWith('local_guest_'));
}

interface GameStore {
  character: Character | null;
  pendingDecision: PendingDecision | null;
  isProcessing: boolean;
  sessionAges: number;
  ageUpsSinceAd: number;
  user: AppUser | null;
  isHydrated: boolean;
  activeSlotId: string;
  carriedStatsForCreate: Partial<CharacterStats> | null;
  slotList: SaveSlot[];
  slotsSynced: boolean;
  dailyQuests: DailyQuest[];
  studyQuestions: StudyQuestion[] | null;
  lastAgeUpNotice: string | null;
  pendingReincarnation: boolean;

  setUser: (user: AppUser | null) => void;
  onUserChanged: (user: AppUser | null) => Promise<void>;
  refreshSlotList: () => Promise<SaveSlot[]>;
  claimDailyBonus: () => { ok: boolean; message: string };
  loadDailyQuests: () => void;
  claimQuestReward: (questId: string) => { ok: boolean; message: string };
  addSeasonXp: (amount: number) => void;
  claimSeasonTier: (tier: number) => { ok: boolean; message: string };
  startStudySession: () => StudyQuestion[];
  completeStudySession: (answers: number[]) => StudySessionResult;
  grantDegree: (degreeId: string) => { ok: boolean; message: string };
  enrollInDegree: (degreeId: string) => { ok: boolean; message: string };
  takeCertificationExam: (certId: string) => { ok: boolean; message: string };
  foundBusiness: (name: string) => { ok: boolean; message: string };
  sellBusiness: (businessId: string) => { ok: boolean; message: string };
  getClassmates: () => Person[];
  investInStocks: (amount: number) => { ok: boolean; message: string };
    setAvatarStyle: (style: Character['avatarStyle']) => void;
    unlockAvatarStyle: (style: NonNullable<Character['avatarStyle']>) => void;
    setSeasonPass: (v: boolean) => void;
  createCharacter: (payload: CreateCharacterPayload) => void;
  ageUp: () => void;
  clearAgeUpNotice: () => void;
  clearPendingReincarnation: () => void;
  resolveDecision: (choiceId: string) => void;
  dismissDecision: () => void;
  performActivity: (activityId: string) => { success: boolean; message: string };
  interactWithPerson: (personId: string, interactionId: string) => { delta: number; message: string };
  purchaseAsset: (asset: Omit<Asset, 'id' | 'purchasedAge'>) => boolean;
  sellAsset: (assetId: string) => boolean;
  applyForJob: (jobId: string) => { success: boolean; message: string };
  workHarder: () => void;
  askForRaise: () => { success: boolean; message: string };
  quitJob: () => void;
  applyForPromotion: () => { success: boolean; message: string };
  reincarnate: () => Partial<CharacterStats> | null;
  addLuckBoost: (n: number) => void;
  useReincarnationScroll: () => void;
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  addGems: (n: number) => void;
  spendGems: (n: number) => boolean;
  setPremium: (v: boolean) => void;
  setNoAds: (v: boolean) => void;
  saveGame: () => Promise<void>;
  loadGame: (slotId?: string) => Promise<void>;
  loadSlot: (slotId: string) => Promise<void>;
  listSlots: () => SaveSlot[];
  deleteSlot: (slotId: string) => Promise<void>;
  resetGame: () => Promise<void>;
  _checkAchievements: () => void;
  _persist: () => Promise<void>;
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    character: null,
    pendingDecision: null,
    isProcessing: false,
    sessionAges: 0,
    ageUpsSinceAd: 0,
    user: null,
    isHydrated: false,
    activeSlotId: '0',
    carriedStatsForCreate: null,
    slotList: buildLocalSlotList(),
    slotsSynced: false,
    dailyQuests: [],
    studyQuestions: null,
    lastAgeUpNotice: null,
    pendingReincarnation: false,

    setUser: (user) => set(s => { s.user = user; }),

    onUserChanged: async (user) => {
      set(s => { s.user = user; });
      if (!isCloudUser(user?.uid)) {
        set(s => {
          s.slotList = buildLocalSlotList();
          s.slotsSynced = false;
        });
        return;
      }

      try {
        const entitlements = await fetchUserEntitlements(user!.uid);
        if (entitlements) {
          const { character } = get();
          if (character) {
            const updated = applyEntitlementsToCharacter(character, entitlements);
            set(s => { if (s.character) s.character = updated; });
            if (hasPendingGrants(entitlements)) {
              await clearConsumedGrants(user!.uid);
              void get()._persist();
            }
          }
        }
      } catch (e) {
        console.warn('[entitlements] hydrate failed', e);
      }

      await get().refreshSlotList();
    },

    refreshSlotList: async () => {
      const { user } = get();
      const localSlots = buildLocalSlotList();

      if (!isCloudUser(user?.uid)) {
        set(s => {
          s.slotList = localSlots;
          s.slotsSynced = false;
        });
        return localSlots;
      }

      try {
        const cloudSlots = await listCloudSlots(user!.uid);
        const merged = mergeSlotLists(localSlots, cloudSlots);
        set(s => {
          s.slotList = merged;
          s.slotsSynced = cloudSlots.some(slot => slot.updatedAt > 0);
        });
        return merged;
      } catch (e) {
        console.warn('[cloudSave] refreshSlotList failed', e);
        set(s => {
          s.slotList = localSlots;
          s.slotsSynced = false;
        });
        return localSlots;
      }
    },

    claimDailyBonus: () => {
      const { character } = get();
      if (!character) return { ok: false, message: 'No active character.' };

      const today = new Date().toISOString().slice(0, 10);
      const lastClaim = getDailyBonusLastClaim();
      if (lastClaim === today) {
        return { ok: false, message: 'Daily bonus already claimed today.' };
      }

      setDailyBonusLastClaim(today);
      set(s => {
        if (s.character) s.character.coins += 25;
      });
      void get()._persist();
      return { ok: true, message: 'You received 25 coins!' };
    },

    loadDailyQuests: () => {
      const today = new Date().toISOString().slice(0, 10);
      const karma = get().character?.karma ?? 50;
      const raw = getDailyQuestsProgress(today);
      if (raw) {
        try {
          const quests = stampKarmaBaseline(JSON.parse(raw) as DailyQuest[], karma);
          set(s => { s.dailyQuests = quests; });
          return;
        } catch { /* fall through */ }
      }
      const quests = pickDailyQuests(today, 3, karma);
      setDailyQuestsProgress(today, JSON.stringify(quests));
      set(s => { s.dailyQuests = quests; });
    },

    claimQuestReward: (questId) => {
      const { dailyQuests, character } = get();
      if (!character) return { ok: false, message: 'No active character.' };
      const quest = dailyQuests.find(q => q.id === questId);
      if (!quest) return { ok: false, message: 'Quest not found.' };
      if (quest.claimed) return { ok: false, message: 'Already claimed.' };
      if (!isQuestComplete(quest)) return { ok: false, message: 'Quest not complete.' };

      const updated = dailyQuests.map(q => q.id === questId ? claimQuest(q) : q);
      const today = new Date().toISOString().slice(0, 10);
      setDailyQuestsProgress(today, JSON.stringify(updated));
      set(s => {
        s.dailyQuests = updated;
        if (s.character) s.character.coins += quest.rewardCoins;
      });
      get().addSeasonXp(25);
      void get()._persist();
      return { ok: true, message: `Claimed ${quest.rewardCoins} coins!` };
    },

    addSeasonXp: (amount) => {
      set(s => {
        if (!s.character) return;
        s.character.seasonXp = (s.character.seasonXp ?? 0) + amount;
      });
    },

    claimSeasonTier: (tier) => {
      const { character } = get();
      if (!character?.hasSeasonPass) return { ok: false, message: 'Season pass required.' };
      const tierDef = SEASON_PASS_TIERS.find(t => t.tier === tier);
      if (!tierDef) return { ok: false, message: 'Invalid tier.' };
      if ((character.claimedSeasonTiers ?? []).includes(tier)) {
        return { ok: false, message: 'Tier already claimed.' };
      }
      if ((character.seasonXp ?? 0) < tierDef.xpRequired) {
        return { ok: false, message: 'Not enough season XP.' };
      }
      set(s => {
        if (!s.character) return;
        if (!s.character.claimedSeasonTiers) s.character.claimedSeasonTiers = [];
        s.character.claimedSeasonTiers.push(tier);
        s.character.coins += tierDef.rewardCoins;
        if (tierDef.rewardGems) s.character.gems += tierDef.rewardGems;
        if (tierDef.rewardLuckBoosts) s.character.luckBoostsRemaining += tierDef.rewardLuckBoosts;
      });
      void get()._persist();
      return { ok: true, message: `Claimed tier ${tier} rewards!` };
    },

    startStudySession: () => {
      const { character } = get();
      if (!character || !canStudy(character.age, character.educationLevel)) return [];
      const questions = pickStudyQuestions(3);
      set(s => { s.studyQuestions = questions; });
      return questions;
    },

    completeStudySession: (answers) => {
      const { character, studyQuestions } = get();
      const empty: StudySessionResult = {
        score: 0, totalQuestions: 0, passed: false, intelligenceGain: 0, mentalHealthGain: 0,
      };
      if (!character || !studyQuestions?.length) return empty;

      const result = gradeStudySession(
        answers, studyQuestions, character.stats.intelligence,
        character.educationLevel,
      );

      set(s => {
        if (!s.character) return;
        s.character.stats.intelligence = clamp(s.character.stats.intelligence + result.intelligenceGain);
        s.character.stats.mentalHealth = clamp(s.character.stats.mentalHealth + result.mentalHealthGain);
        if (result.educationUnlock) s.character.educationLevel = result.educationUnlock;
        s.studyQuestions = null;
      });

      const today = new Date().toISOString().slice(0, 10);
      const quests = get().dailyQuests.length ? get().dailyQuests : pickDailyQuests(today);
      const updated = updateQuestProgress(quests, 'study_session', 1);
      setDailyQuestsProgress(today, JSON.stringify(updated));
      set(s => { s.dailyQuests = updated; });
      get().addSeasonXp(result.passed ? 25 : 5);
      get()._checkAchievements();
      void get()._persist();
      return result;
    },

    grantDegree: (degreeId) => {
      const { character } = get();
      if (!character) return { ok: false, message: 'No character.' };
      if ((character.degreeIds ?? []).includes(degreeId)) {
        return { ok: false, message: 'You already have this degree.' };
      }
      if (character.enrolledDegreeId && character.enrolledDegreeId !== degreeId) {
        return { ok: false, message: 'You are enrolled in a different program. Finish or re-enroll.' };
      }

      const advResult = advanceEducation(character, degreeId);
      if (!advResult.ok || !advResult.degreeEarned) {
        return { ok: false, message: advResult.message };
      }

      const degree = advResult.degreeEarned;
      const alreadyEnrolled = character.enrolledDegreeId === degreeId;

      set(s => {
        if (!s.character) return;
        if (!s.character.degreeIds) s.character.degreeIds = [];
        if (!s.character.degreeIds.includes(degreeId)) {
          s.character.degreeIds.push(degreeId);
        }
        if (advResult.newStage) s.character.educationStage = advResult.newStage;
        s.character.educationBranch = degree.branch;
        if (advResult.newEducationLevel) {
          s.character.educationLevel = advResult.newEducationLevel;
        }
        if (advResult.intelligenceGain) {
          s.character.stats.intelligence = clamp(
            s.character.stats.intelligence + advResult.intelligenceGain,
          );
        }
        // Tuition already paid at enrollment
        if (!alreadyEnrolled) {
          const eco = getCountryEconomy(s.character.countryCode);
          const tuition = Math.round(degree.baseAnnualCost * eco.salaryMultiplier);
          s.character.bankBalance = Math.max(0, s.character.bankBalance - tuition);
        }
        s.character.enrolledDegreeId = undefined;
      });

      void get()._persist();
      return {
        ok: true,
        message: advResult.message,
      };
    },

    enrollInDegree: (degreeId) => {
      const { character } = get();
      if (!character) return { ok: false, message: 'No character.' };

      if (character.enrolledDegreeId === degreeId) {
        return { ok: true, message: 'Already enrolled in this program.' };
      }

      const enrollResult = enrollInProgram(character, degreeId);
      if (!enrollResult.ok) {
        return { ok: false, message: enrollResult.message };
      }

      const eco = getCountryEconomy(character.countryCode);
      const tuition = Math.round((enrollResult.annualCost ?? 0) * eco.salaryMultiplier);
      if (character.bankBalance < tuition) {
        return { ok: false, message: `Insufficient funds. Tuition is ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.` };
      }

      set(s => {
        if (!s.character) return;
        s.character.bankBalance = Math.max(0, s.character.bankBalance - tuition);
        s.character.enrolledDegreeId = degreeId;
      });

      void get()._persist();
      return {
        ok: true,
        message: `${enrollResult.message} Tuition paid: ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.`,
      };
    },

    takeCertificationExam: (certId) => {
      const { character } = get();
      if (!character) return { ok: false, message: 'No character.' };

      const eligibility = checkCertificationEligibility(character, certId);
      if (!eligibility.eligible) {
        return { ok: false, message: eligibility.reason ?? 'Not eligible for this exam.' };
      }

      if (character.bankBalance < eligibility.cost) {
        const eco = getCountryEconomy(character.countryCode);
        return {
          ok: false,
          message: `Insufficient funds. Exam fee is ${eco.currencySymbol}${eligibility.cost.toLocaleString(eco.currencyLocale)}.`,
        };
      }

      const exam = rollCertificationExam(character, certId);
      set(s => {
        if (!s.character) return;
        s.character.bankBalance = Math.max(0, s.character.bankBalance - eligibility.cost);
        if (exam.passed) {
          if (!s.character.certificationIds) s.character.certificationIds = [];
          if (!s.character.certificationIds.includes(certId)) {
            s.character.certificationIds.push(certId);
          }
          s.character.stats.intelligence = clamp(s.character.stats.intelligence + 2);
        }
      });

      void get()._persist();
      return { ok: exam.passed, message: exam.message };
    },

    foundBusiness: (name) => {
      const { character } = get();
      if (!character) return { ok: false, message: 'No character.' };
      if (!canFoundBusiness(character)) return { ok: false, message: 'You need to be an entrepreneur first.' };
      const biz = createBusiness(character, name);
      if (!biz) return { ok: false, message: 'Could not found business.' };
      set(s => { if (s.character) s.character.businesses.push(biz); });
      void get()._persist();
      return { ok: true, message: `Founded ${name}!` };
    },

    sellBusiness: (businessId) => {
      const { character } = get();
      if (!character) return { ok: false, message: 'No character.' };
      const biz = character.businesses.find(b => b.id === businessId);
      if (!biz) return { ok: false, message: 'Business not found.' };
      const payout = liquidateBusiness(biz);
      set(s => {
        if (!s.character) return;
        s.character.businesses = s.character.businesses.filter(b => b.id !== businessId);
        s.character.bankBalance += payout;
      });
      void get()._persist();
      return { ok: true, message: `Sold for ${payout}.` };
    },

    getClassmates: () => {
      const { character } = get();
      if (!character) return [];
      return getClassmates(character.people);
    },

    investInStocks: (amount) => {
      const { character } = get();
      if (!character) return { ok: false, message: 'No character.' };
      const result = investInMarket(character, amount);
      if (!result.ok || !result.asset) return { ok: false, message: result.message };
      set(s => {
        if (!s.character) return;
        s.character.bankBalance = result.bankBalance;
        s.character.assets.push(result.asset!);
        const netWorth = computeNetWorth(s.character);
        s.character.stats.wealth = clamp(netWorth / 10000);
      });
      void get()._persist();
      return { ok: true, message: result.message };
    },

    setAvatarStyle: (style) => {
      if (!style) return;
      set(s => {
        if (!s.character) return;
        const unlocked = s.character.unlockedAvatarStyles ?? defaultUnlockedStyles(s.character.gender);
        if (!unlocked.includes(style)) return;
        s.character.avatarStyle = style;
      });
      void get()._persist();
    },

    unlockAvatarStyle: (style) => {
      set(s => {
        if (!s.character) return;
        const unlocked = s.character.unlockedAvatarStyles ?? defaultUnlockedStyles(s.character.gender);
        if (!unlocked.includes(style)) unlocked.push(style);
        s.character.unlockedAvatarStyles = unlocked;
        s.character.avatarStyle = style;
      });
      void get()._persist();
    },

    setSeasonPass: (v) => {
      set(s => { if (s.character) s.character.hasSeasonPass = v; });
      void get()._persist();
    },

    _persist: async () => {
      const { character, user, activeSlotId } = get();
      if (!character) return;

      const stamped = { ...character, updatedAt: Date.now() };
      set(s => {
        if (s.character) s.character.updatedAt = stamped.updatedAt;
      });

      saveCharacterLocal(stamped, activeSlotId);
      writeWidgetSnapshot(stamped);

      if (isCloudUser(user?.uid)) {
        try {
          await syncSaveToCloud(user!.uid, activeSlotId, stamped);
        } catch (e) {
          console.warn('[cloudSave] sync failed', e);
        }
      }
    },

    createCharacter: (payload) => {
      loadGeneration += 1;
      const carried = get().carriedStatsForCreate;
      const char = buildCharacter({ ...payload, carriedStats: carried ?? payload.carriedStats });
      const slotId = get().activeSlotId;
      saveCharacterLocal(char, slotId);
      set(s => {
        s.character = char;
        s.pendingDecision = null;
        s.sessionAges = 0;
        s.isProcessing = false;
        s.carriedStatsForCreate = null;
      });
      void get()._persist();
      void logEvent('create_character', { name: char.name });
    },

    ageUp: () => {
      const { character, pendingDecision, isProcessing } = get();
      if (!character || pendingDecision || isProcessing || !character.isAlive) return;

      const outcome = runAgeUp(character);

      if (outcome.type === 'jail_tick') {
        set(s => {
          if (s.character) s.character.criminalRecord = outcome.criminalRecord;
          s.lastAgeUpNotice = outcome.message;
        });
        void get()._persist();
        return;
      }

      set(s => { s.isProcessing = true; });

      if (outcome.type === 'death') {
        set(s => {
          if (!s.character) return;
          Object.assign(s.character, outcome.patch);
          s.isProcessing = false;
        });
        hapticDeath();
        void playSound('death');
        void get()._persist();
        return;
      }

      const applyPatch = (withDecision: boolean) => {
        set(s => {
          if (!s.character) return;
          Object.assign(s.character, outcome.patch);
          outcome.newEventRecords.forEach(r => s.character!.eventHistory.push(r));
          s.isProcessing = false;
          s.sessionAges += 1;
          s.ageUpsSinceAd += 1;
          if (withDecision && outcome.type === 'pending_decision') {
            s.pendingDecision = { event: outcome.decisionEvent };
          }
        });
      };

      hapticAgeUp();
      void playSound('age_up');

      if (outcome.type === 'pending_decision') {
        applyPatch(true);
      } else {
        applyPatch(false);
        get()._checkAchievements();
        get().addSeasonXp(10);
        const today = new Date().toISOString().slice(0, 10);
        const quests = get().dailyQuests.length
          ? get().dailyQuests
          : pickDailyQuests(today, 3, outcome.karma);
        let updated = updateQuestProgress(quests, 'age_up', 1);
        updated = updateQuestProgress(updated, 'reach_karma', 0, outcome.karma);
        updated = updateQuestProgress(updated, 'gain_karma', 0, outcome.karma);
        setDailyQuestsProgress(today, JSON.stringify(updated));
        set(s => { s.dailyQuests = updated; });
      }
      void get()._persist();
    },

    clearAgeUpNotice: () => set(s => { s.lastAgeUpNotice = null; }),
    clearPendingReincarnation: () => set(s => { s.pendingReincarnation = false; }),

    resolveDecision: (choiceId) => {
      const { character, pendingDecision } = get();
      if (!character || !pendingDecision) return;

      const result = runResolveDecision(character, pendingDecision.event, choiceId);
      if (!result) return;

      set(s => {
        if (!s.character) return;
        Object.assign(s.character, result.patch);
        s.character.eventHistory.push(result.eventRecord);
        s.pendingDecision = null;
      });

      get()._checkAchievements();
      void get()._persist();
    },

    dismissDecision: () => set(s => { s.pendingDecision = null; }),

    performActivity: (activityId) => {
      const { character } = get();
      if (!character) return { success: false, message: 'No character.' };

      const activity = ACTIVITIES.find(a => a.id === activityId);
      if (!activity) return { success: false, message: 'Unknown activity.' };
      if (character.age < activity.minAge || character.age > activity.maxAge) {
        return { success: false, message: 'Too young or too old for this activity.' };
      }
      if (activity.cost && character.coins < activity.cost) {
        return { success: false, message: 'Not enough coins.' };
      }
      if (activity.bankEffect && activity.bankEffect < 0 && character.bankBalance < Math.abs(activity.bankEffect)) {
        return { success: false, message: 'Not enough money.' };
      }

      const isLucky = character.traits.includes('lucky');
      const hadChance = activity.successChance !== undefined;
      let luckBoosts = character.luckBoostsRemaining;
      const success = applySuccessChance(activity.successChance, isLucky, luckBoosts);
      if (hadChance && luckBoosts > 0) luckBoosts = consumeLuckBoost(isLucky, luckBoosts, hadChance);

      const effect = success ? activity.statEffect : (activity.failStatEffect ?? activity.statEffect);
      const bankDelta = success ? (activity.bankEffect ?? 0) : 0;
      const { stats, karma, bankBalance } = applyEffect(
        character.stats, character.karma, character.bankBalance, effect, bankDelta, character.assets,
      );

      set(s => {
        if (!s.character) return;
        s.character.stats = stats;
        s.character.karma = karma;
        s.character.bankBalance = bankBalance;
        s.character.luckBoostsRemaining = luckBoosts;
        if (activity.cost) s.character.coins -= activity.cost;
        if (activity.addsPerson === 'pet') s.character.people.push(generatePet('dog'));
        s.character.eventHistory.push({
          id: `activity_${activityId}_${Date.now()}`, age: character.age,
          title: activity.label,
          description: success ? activity.description : `${activity.description} It didn't go as planned.`,
          statEffect: effect, category: 'activity', color: '#2DD4BF', timestamp: Date.now(),
        });
        s.character.netWorthPeak = Math.max(s.character.netWorthPeak, computeNetWorth(s.character));
      });

      if (activityId === 'crime_petty' && success) {
        const updated = recordCrime(get().character!, 'shoplifting');
        set(s => { if (s.character) s.character.criminalRecord = updated.criminalRecord; });
      }

      const today = new Date().toISOString().slice(0, 10);
      const quests = get().dailyQuests.length ? get().dailyQuests : pickDailyQuests(today);
      const updatedQuests = updateQuestProgress(quests, 'complete_activity', 1);
      setDailyQuestsProgress(today, JSON.stringify(updatedQuests));
      set(s => { s.dailyQuests = updatedQuests; });

      get()._checkAchievements();
      void get()._persist();
      return { success, message: success ? 'Success!' : 'Didn\'t go as planned.' };
    },

    interactWithPerson: (personId, interactionId) => {
      const { character } = get();
      if (!character) return { delta: 0, message: 'No character.' };

      const interaction = getInteraction(interactionId);
      if (!interaction) return { delta: 0, message: 'Unknown interaction.' };

      const person = character.people.find(p => p.id === personId);
      if (!person) return { delta: 0, message: 'Person not found.' };

      if (interaction.bankDelta < 0 && character.bankBalance < Math.abs(interaction.bankDelta)) {
        return { delta: 0, message: 'Not enough money for that.' };
      }

      const { stats, karma, bankBalance } = applyEffect(
        character.stats, character.karma, character.bankBalance,
        {}, interaction.bankDelta, character.assets,
      );

      set(s => {
        if (!s.character) return;
        const p = s.character.people.find(x => x.id === personId);
        if (p) {
          const engagementBonus = 5;
          p.relationshipScore = Math.max(0, Math.min(100, p.relationshipScore + interaction.delta + engagementBonus));
        }
        s.character.stats = stats;
        s.character.karma = karma;
        s.character.bankBalance = bankBalance;
      });

      void get()._persist();
      return { delta: interaction.delta, message: interaction.message };
    },

    applyForJob: (jobId) => {
      const { character } = get();
      if (!character) return { success: false, message: 'No character.' };
      if (isInJail(character)) return { success: false, message: 'You cannot work while serving time.' };
      if (character.age < 16) return { success: false, message: 'Too young to work.' };

      // Try new career engine first
      const careerPath = getCareerById(jobId);
      if (careerPath) {
        const eligibility = checkCareerEligibility(character, jobId);
        if (!eligibility.eligible) {
          return { success: false, message: eligibility.reason ?? 'You are not eligible for this career.' };
        }
        if (!rollForHire(eligibility.hireProbability)) {
          return {
            success: false,
            message: `You applied for ${careerPath.label} (${eligibility.hireProbability}% chance) but didn't get it. Try again.`,
          };
        }
        const localSalary = getCountrySalary(careerPath.baseSalary, character.countryCode);
        const career = careerPathToLegacy(careerPath);
        career.salary = localSalary;
        set(s => {
          if (!s.character) return;
          s.character.career = career;
          s.character.job = careerPath.label;
          s.character.people = ensureCoworkers(s.character.people, s.character.name, careerPath.label);
        });
        void get()._persist();
        return { success: true, message: `You're now a ${careerPath.label} at ${careerPath.company}!` };
      }

      return { success: false, message: 'Career not found.' };
    },

    workHarder: () => {
      const { character } = get();
      if (!character?.career) return;
      if (isInJail(character)) return;
      set(s => {
        if (!s.character?.career) return;
        s.character.career = workHarder(s.character.career);
        s.character.stats.health = clamp(s.character.stats.health - 3);
      });
      void get()._persist();
    },

    askForRaise: () => {
      const { character } = get();
      if (!character?.career) return { success: false, message: 'You need a job first.' };
      if (isInJail(character)) return { success: false, message: 'You cannot work while serving time.' };
      const success = Math.random() < 0.65;
      set(s => {
        if (!s.character?.career) return;
        s.character.career = askForRaise(s.character.career, success);
      });
      void get()._persist();
      return success
        ? { success: true, message: 'Your boss agreed to a raise!' }
        : { success: false, message: 'Not this year — keep performing.' };
    },

    quitJob: () => {
      set(s => {
        if (!s.character) return;
        s.character.career = null;
        s.character.job = 'Unemployed';
        s.character.people = s.character.people.filter(p => p.relationType !== 'coworker');
      });
      void get()._persist();
    },

    applyForPromotion: () => {
      const { character } = get();
      if (!character?.career) return { success: false, message: 'You need a job first.' };
      if (isInJail(character)) return { success: false, message: 'You cannot work while serving time.' };
      const perfOk = character.career.performance >= 55;
      const success = perfOk && Math.random() < 0.6;
      let message = 'Promotion denied — improve your performance.';
      set(s => {
        if (!s.character?.career) return;
        const result = applyForPromotion(s.character.career, success, s.character);
        s.character.career = result.career;
        if (result.newTitle) {
          s.character.job = result.newTitle;
          message = `Promoted to ${result.newTitle}!`;
        }
      });
      void get()._persist();
      return { success, message: success ? message : 'Promotion denied — improve your performance.' };
    },

    reincarnate: () => {
      const { character } = get();
      if (!character) return null;

      const canCarry = character.hasReincarnationScroll || character.luckBoostsRemaining > 0;
      let carried: Partial<CharacterStats> | null = null;

      if (canCarry) {
        const entries = Object.entries(character.stats) as [keyof CharacterStats, number][];
        const top3 = entries.sort((a, b) => b[1] - a[1]).slice(0, 3);
        carried = Object.fromEntries(top3.map(([k, v]) => [k, Math.round(v * 0.5)])) as Partial<CharacterStats>;
      }

      set(s => {
        s.carriedStatsForCreate = carried;
        s.character = null;
        s.pendingDecision = null;
        s.sessionAges = 0;
        s.pendingReincarnation = true;
      });

      const slotId = get().activeSlotId;
      deleteCharacterLocal(slotId);
      return carried;
    },

    addLuckBoost: (n) => set(s => {
      if (s.character) s.character.luckBoostsRemaining += n;
    }),

    useReincarnationScroll: () => set(s => {
      if (s.character) s.character.hasReincarnationScroll = true;
    }),

    purchaseAsset: (assetData) => {
      const { character } = get();
      if (!character) return false;
      const downPayment = assetData.debt !== undefined ? assetData.value - assetData.debt : assetData.value;
      if (character.bankBalance < downPayment) return false;

      set(s => {
        if (!s.character) return;
        s.character.assets.push({ ...assetData, id: generateId(), purchasedAge: s.character.age });
        s.character.bankBalance = Math.max(0, s.character.bankBalance - downPayment);
        s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
      });
      void get()._persist();
      return true;
    },

    sellAsset: (assetId) => {
      const { character } = get();
      if (!character) return false;
      const asset = character.assets.find(a => a.id === assetId);
      if (!asset) return false;
      const proceeds = Math.max(0, asset.value - (asset.debt ?? 0));

      set(s => {
        if (!s.character) return;
        s.character.assets = s.character.assets.filter(a => a.id !== assetId);
        s.character.bankBalance += proceeds;
        s.character.stats.wealth = clamp(computeNetWorth(s.character) / 10000);
      });
      void get()._persist();
      return true;
    },

    addCoins: (n) => { set(s => { if (s.character) s.character.coins += n; }); void get()._persist(); },
    spendCoins: (n) => {
      const { character } = get();
      if (!character || character.coins < n) return false;
      set(s => { if (s.character) s.character.coins -= n; });
      void get()._persist();
      return true;
    },
    addGems: (n) => { set(s => { if (s.character) s.character.gems += n; }); void get()._persist(); },
    spendGems: (n) => {
      const { character } = get();
      if (!character || character.gems < n) return false;
      set(s => { if (s.character) s.character.gems -= n; });
      void get()._persist();
      return true;
    },

    setPremium: (v) => {
      set(s => {
        if (!s.character) return;
        s.character.isPremium = v;
        if (v) {
          s.character.hasNoAds = true;
          s.character.luckBoostsRemaining += 5;
        }
      });
      void get()._persist();
    },
    setNoAds: (v) => {
      set(s => { if (s.character) s.character.hasNoAds = v; });
      void get()._persist();
    },

    saveGame: async () => { await get()._persist(); },

    loadGame: async (slotId?: string) => {
      const gen = ++loadGeneration;
      try {
        await migrateLegacySaves();
        const id = slotId ?? getActiveSlotId();
        setActiveSlotId(id);

        let char = loadCharacterLocal(id);
        if (char) char = normalizeCharacter(char);

        const { user } = get();
        if (isCloudUser(user?.uid)) {
          try {
            const localUpdatedAt = char?.updatedAt ?? 0;
            const cloudChar = await pullCloudSaveIfNewer(user!.uid, id, localUpdatedAt);
            if (cloudChar) {
              char = normalizeCharacter(cloudChar);
              saveCharacterLocal(char, id);
            }
          } catch (e) {
            console.warn('[cloudSave] pull failed', e);
          }
        }

        if (gen !== loadGeneration) return;

        const current = get().character;
        if (current) {
          if (!char || current.updatedAt > (char.updatedAt ?? 0)) {
            set(s => { s.isHydrated = true; });
            return;
          }
        }

        set(s => {
          s.character = char;
          s.activeSlotId = id;
          s.isHydrated = true;
        });
      } catch {
        if (gen === loadGeneration) {
          set(s => { s.isHydrated = true; });
        }
      }
    },

    loadSlot: async (slotId: string) => {
      setActiveSlotId(slotId);
      await get().loadGame(slotId);
    },

    listSlots: (): SaveSlot[] => {
      const cached = get().slotList;
      if (cached.length > 0) return cached;
      return buildLocalSlotList();
    },

    deleteSlot: async (slotId: string) => {
      deleteCharacterLocal(slotId);
      if (get().activeSlotId === slotId) {
        set(s => { s.character = null; });
      }
    },

    resetGame: async () => {
      const slotId = get().activeSlotId;
      deleteCharacterLocal(slotId);
      set(s => {
        s.character = null;
        s.pendingDecision = null;
        s.isProcessing = false;
        s.sessionAges = 0;
        s.carriedStatsForCreate = null;
      });
    },

    _checkAchievements: () => {
      const { character } = get();
      if (!character) return;
      const previous = new Set(character.achievements);
      const earned = new Set(character.achievements);
      const { stats, karma, age, relationships, career, educationLevel } = character;
      const netWorth = computeNetWorth(character);

      if (stats.wealth >= 90) earned.add('millionaire');
      if (stats.intelligence >= 90) earned.add('genius');
      if (age >= 100) earned.add('centenarian');
      if (karma >= 200) earned.add('saint');
      if (relationships >= 5) earned.add('heartbreaker');
      if (stats.social >= 90) earned.add('social_king');
      if (netWorth >= 500000) earned.add('rich_kid');
      if (stats.fitness >= 90) earned.add('fitness_buff');
      if (career?.title?.toLowerCase().includes('entrepreneur')) earned.add('entrepreneur');
      if (educationLevel === 'graduate' && stats.intelligence >= 80) earned.add('top_grad');
      if (character.eventHistory.filter(e => e.category === 'travel').length >= 3) earned.add('globetrotter');
      const hasLowHealthRecord = character.eventHistory.some(e =>
        (e.statEffect.health ?? 0) <= -20,
      );
      if (hasLowHealthRecord && character.isAlive && stats.health > 10) earned.add('iron_will');

      let coinReward = 0;
      earned.forEach(id => {
        if (!previous.has(id)) coinReward += ACHIEVEMENT_COIN_REWARDS[id] ?? 50;
      });

      const newCount = earned.size - previous.size;
      if (earned.size !== character.achievements.length || coinReward > 0) {
        set(s => {
          if (!s.character) return;
          s.character.achievements = Array.from(earned);
          if (coinReward > 0) s.character.coins += coinReward;
        });
        if (coinReward > 0) void get()._persist();
        if (newCount > 0) {
          hapticAchievement();
          void playSound('achievement_unlock');
        }
      }
    },
  })),
);
