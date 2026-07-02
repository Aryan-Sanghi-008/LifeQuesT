import {
  Character,
  CharacterStats,
  PendingDecision,
  AppUser,
  AvatarId,
  Gender,
  Asset,
  SaveSlot,
  DailyQuest,
  Person,
  CharacterDNA,
  BigFivePersonality,
  FocusAllocation,
  AspirationId,
  WillDetails,
  GlobalPrestigeState,
  SyncConflict,
  ScenarioId,
} from "../types";
import { StudyQuestion, StudySessionResult } from "../engine/educationEngine";

export interface CreateCharacterPayload {
  name: string;
  gender: Gender;
  avatarId?: AvatarId;
  avatarSeed?: string;
  countryCode: string;
  zodiac: string;
  zodiacBonusStat?: string;
  familyBackground: FamilyBackground;
  traits: string[];
  carriedStats?: Partial<CharacterStats>;
  parentDNA?: CharacterDNA | null;
  partnerDNA?: CharacterDNA | null;
  parentPersonality?: BigFivePersonality;
  partnerPersonality?: BigFivePersonality;
  activeChallengeId?: string;
  scenarioId?: ScenarioId;
  personality?: BigFivePersonality;
}

type FamilyBackground = "poor" | "middle" | "wealthy" | "royalty";

export interface GameStore {
  character: Character | null;
  pendingDecision: PendingDecision | null;
  isProcessing: boolean;
  sessionAges: number;
  ageUpsSinceAd: number;
  livesEndedSinceAd: number;
  user: AppUser | null;
  isHydrated: boolean;
  activeSlotId: string;
  carriedStatsForCreate: Partial<CharacterStats> | null;
  carriedParentDNA: CharacterDNA | null;
  carriedPartnerDNA: CharacterDNA | null;
  carriedParentPersonality: BigFivePersonality | null;
  carriedPartnerPersonality: BigFivePersonality | null;
  slotList: SaveSlot[];
  slotsSynced: boolean;
  dailyQuests: DailyQuest[];
  studyQuestions: StudyQuestion[] | null;
  achievementUnlockQueue: string[];
  dynastyMilestoneQueue: import('../data/dynastyMilestones').DynastyMilestone[];
  collectionSetCompleteQueue: import('../types').CollectionSet[];
  pendingAbsenceBonus: { daysAway: number; coins: number; gems: number; projectedAge: number; yearsToAdvance: number; narrativeLines: string[] } | null;
  lastAgeUpNotice: string | null;
  showConfetti: boolean;
  pendingReincarnation: boolean;
  pendingAspirationPicker: boolean;
  pendingCourt: boolean;
  globalPrestige: GlobalPrestigeState;
  syncConflict: SyncConflict | null;
  resolveConflictChoice: (choice: "local" | "cloud") => void;
  unlockFantasyDlc: (method: "gems" | "coins" | "prestige") => {
    ok: boolean;
    message?: string;
  };

  setUser: (user: AppUser | null) => void;
  onUserChanged: (user: AppUser | null) => Promise<void>;
  refreshSlotList: () => Promise<SaveSlot[]>;
  claimDailyBonus: () => { ok: boolean; message: string };
  claimLoginReward: () => { ok: boolean; message: string; day: number; reward: import('./slices/progressionSlice').LoginReward };
  canClaimLoginReward: () => boolean;
  getLoginRewardState: () => { day: number; claimed: boolean };
  canSpinMysteryBox: () => boolean;
  canSpinMysteryBoxWithTicket: () => boolean;
  spinMysteryBox: (options?: { useTicket?: boolean; segmentIndex?: number }) => {
    ok: boolean;
    reward?: import('./slices/progressionSlice').MysteryReward;
    segmentIndex?: number;
    message: string;
  };
  dismissAchievementUnlock: () => void;
  dismissDynastyMilestone: () => void;
  dismissCollectionSetComplete: () => void;
  checkDynastyMilestones: () => import('../data/dynastyMilestones').DynastyMilestone[];
  unlockScenario: (scenarioId: import('../types').ScenarioId) => void;
  unlockAllPremiumScenarios: () => void;
  isScenarioOwned: (scenarioId: import('../types').ScenarioId) => boolean;
  ensurePlusMonthlyState: () => void;
  redeemPlusScenarioPick: (scenarioId: import('../types').ScenarioId) => { ok: boolean; message: string };
  grantPlusMonthlyCosmetic: () => void;
  purchaseCosmetic: (cosmeticId: string) => { ok: boolean; message: string };
  grantCosmeticUnlock: (cosmeticId: string) => void;
  applyCosmetic: (cosmeticId: string) => { ok: boolean; message: string };
  getPlusScenarioPool: () => import('../types').ScenarioId[];
  checkAbsenceBonus: () => void;
  claimAbsenceBonus: () => void;
  loadDailyQuests: () => void;
  claimQuestReward: (questId: string) => { ok: boolean; message: string };
  addSeasonXp: (amount: number) => void;
  purchasePrestigeUnlock: (traitId: string) => {
    ok: boolean;
    message?: string;
  };
  purchaseDynastyPerk: (perkId: string) => {
    ok: boolean;
    message?: string;
  };
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
  setAvatarStyle: (style: Character["avatarStyle"]) => void;
  unlockAvatarStyle: (style: NonNullable<Character["avatarStyle"]>) => void;
  unlockAvatarStyles: (styles: NonNullable<Character["avatarStyle"]>[]) => void;
  unlockAllAvatarStyles: () => void;
  setSeasonPass: (v: boolean) => void;
  createCharacter: (payload: CreateCharacterPayload) => void;
  setFocusAllocation: (allocation: FocusAllocation) => {
    ok: boolean;
    message?: string;
  };
  confirmFocusAndAct: () => { ok: boolean; message?: string };
  dismissYearReview: () => void;
  setAspirations: (
    primary: AspirationId,
    secondary: AspirationId,
  ) => { ok: boolean; message?: string };
  clearPendingAspirationPicker: () => void;
  purchaseProperty: (propertyDefId: string) => { ok: boolean; message: string };
  resolveCourt: (
    lawyerQuality: number,
    lawyerCost?: number,
  ) => { ok: boolean; message: string };
  clearPendingCourt: () => void;
  setWill: (will: WillDetails) => { ok: boolean; message?: string };
  playAsHeir: (heirId: string) => { ok: boolean; message?: string };
  createSocialPost: (content: string) => { ok: boolean; message: string };
  practiceHobby: (hobbyId: string) => { ok: boolean; message: string };
  careForPet: (
    personId: string,
    action: "feed" | "train" | "vet" | "play",
  ) => { ok: boolean; message: string };
  hireEmployee: (
    businessId: string,
    role: string,
  ) => { ok: boolean; message: string };
  fireEmployee: (
    businessId: string,
    employeeId: string,
  ) => { ok: boolean; message: string };
  ageUp: () => void;
  clearAgeUpNotice: () => void;
  setShowConfetti: (val: boolean) => void;
  clearPendingReincarnation: () => void;
  resolveDecision: (choiceId: string) => void;
  dismissDecision: () => void;
  performActivity: (activityId: string) => {
    success: boolean;
    message: string;
  };
  interactWithPerson: (
    personId: string,
    interactionId: string,
  ) => { delta: number; message: string };
  purchaseAsset: (asset: Omit<Asset, "id" | "purchasedAge">) => boolean;
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
  checkStreakMilestones: () => import('./slices/progressionSlice').StreakMilestone | null;
  purchaseStreakShield: () => { ok: boolean; message: string };
  consumeStreakShieldIfAvailable: () => boolean;
  checkCollectionSetRewards: () => import('@/types').CollectionSet[];
  addMysterySpins: (n: number) => void;
  grantAdRewardCoins: (amount: number) => number;
  grantAdMysteryTicket: () => number;
  purchaseMysterySpinWithGems: () => { ok: boolean; message: string };
}
