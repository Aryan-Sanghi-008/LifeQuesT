import type { LifeStage, EducationLevel, CharacterStats, FamilyBackground, AvatarId, AvatarStyleId, Gender } from './stats';
import type { CharacterDNA, BigFivePersonality, TraumaMemory } from './genetics';
import type { FocusAllocation, CharacterAspirations, LifePhase, MemoryTag, YearReviewSnapshot, FocusDomain } from './focus';
import type { Person } from './people';
import type { CriminalRecord, LegalCase } from './legal';
import type { Business } from './business';
import type { Asset, InsurancePolicy, CreditFactors, AngelOpportunity, FinanceLedgerEntry } from './economy';
import type { Career } from './career';
import type { HobbyProgress } from './hobbies';
import type { SocialMediaState, SocialPost } from './social';
import type { LifeEventRecord } from './events';
import type { ScenarioId } from './scenario';
export interface FamilyLineageEntry {
  generation: number;
  name: string;
  lifespan: number;
  netWorth: number;
  deathCause: string;
  birthYear: number;
}

export interface WillDetails {
  type: 'equal' | 'spouse' | 'charity' | 'heir';
  targetHeirId?: string;
}

export interface Character {
  id: string;
  name: string;
  activeChallengeId?: string;
  gender: Gender;
  avatarSeed: string;
  avatarId: AvatarId; // kept for backward compat
  lifeStage: LifeStage;
  country: string;
  countryFlag: string;
  countryCode: string;
  zodiac: string;
  familyBackground: FamilyBackground;
  traits: string[];
  job: string;
  age: number;
  birthYear: number;
  stats: CharacterStats;
  karma: number;
  bankBalance: number;
  /** Unsecured cash debt when expenses exceed bank balance */
  debt: number;
  /** Append-only cashflow log (trimmed); powers Finances year summary + lines. */
  financeLedger?: FinanceLedgerEntry[];
  netWorthPeak: number;
  relationships: number;
  children: number;
  educationLevel: EducationLevel;
  educationStage?: string;   // EducationStage from educationDegrees.ts (new system)
  educationBranch?: string;  // EducationBranch from educationDegrees.ts (new system)
  people: Person[];
  career: Career | null;
  assets: Asset[];
  achievements: string[];
  eventHistory: LifeEventRecord[];
  isAlive: boolean;
  deathAge?: number;
  deathCause?: string;
  coins: number;
  gems: number;
  isPremium: boolean;
  hasNoAds: boolean;
  luckBoostsRemaining: number;
  hasReincarnationScroll: boolean;
  criminalRecord?: CriminalRecord;
  businesses: Business[];
  /** Soft unlock tags from equipped asset perks (e.g. luxury_vehicle_network). */
  unlockTags?: string[];
  socialFollowers: number;
  /** Multi-platform social media state (preferred). Legacy socialPosts still migrated. */
  socialMedia?: SocialMediaState;
  avatarStyle?: AvatarStyleId;
  seasonXp?: number;
  unlockedAvatarStyles?: AvatarStyleId[];
  hasSeasonPass?: boolean;
  claimedSeasonTiers?: number[];
  degreeIds: string[];
  certificationIds: string[];
  totalCareerYears: number;
  enrolledDegreeId?: string;
  enrolledDegreeYearsRemaining?: number;
  enrolledSinceAge?: number;
  /** Fraction 0–1 discount applied to next tuition tick from study scholarships */
  scholarshipDiscount?: number;
  /** Player skipped college at 18; may still enroll later from Study */
  educationMajorSkipped?: boolean;
  tutorialScreensSeen?: string[];
  eventCooldowns?: Record<string, number>; // eventId → last triggered age
  dna: CharacterDNA;
  personality: BigFivePersonality;
  latentTalents: string[];
  memories: TraumaMemory[];
  familyReputation: number; // 0-100
  focusAllocation?: FocusAllocation;
  focusConfirmedForAge?: number;
  aspirations?: CharacterAspirations;
  memoryTags?: MemoryTag[];
  lifePhase?: LifePhase;
  lastYearReview?: YearReviewSnapshot;
  focusDomainsUsed?: FocusDomain[];
  focusPointsSpent?: FocusAllocation;
  completedMemoryChains?: string[];
  gpa?: number;
  creditScore?: number;
  /** Last computed FICO-lite factor breakdown */
  creditFactors?: CreditFactors;
  /** Ages since first loan / mortgage for history length */
  creditHistoryStartAge?: number;
  /** Short-term inquiry penalty counter (decays on age-up) */
  creditInquiries?: number;
  insurancePolicies?: InsurancePolicy[];
  /** Cached angel deal sheet for Market tab */
  angelOpportunities?: AngelOpportunity[];
  heatLevel?: number;
  hobbyProgress?: Record<string, HobbyProgress>;
  socialPosts?: SocialPost[];
  legalCase?: LegalCase;
  createdAt: number;
  updatedAt: number;
  generation?: number;
  dynastyScore?: number;
  familyLineage?: FamilyLineageEntry[];
  activeWorldEvents?: string[];
  will?: WillDetails;
  unlockedDlcIds?: string[];
  dailyStreak?: number;
  lastActiveDate?: string;
  scenarioId?: ScenarioId;
  scenarioData?: Record<string, unknown>;
  claimedStreakMilestones?: number[];
  streakShieldCount?: number;
  mysteryTickets?: number;
  epicEventsUnlocked?: boolean;
  legendaryCosmeticUnlocked?: boolean;
  /** ISO countries the character has lived in (birth + relocations). */
  countriesLived?: string[];
  /** Last calendar day an absence welcome-back bonus was granted. */
  lastAbsenceBonusDate?: string;
  completedCollectionSetIds?: string[];
  unlockedTitles?: string[];
  activeTitle?: string;
  claimedDynastyMilestoneIds?: string[];
  /** Gameplay coin earn tracking (daily cap). */
  coinsEarnedToday?: number;
  coinsEarnDate?: string;
  /** Gameplay ticket earn tracking (weekly cap). */
  ticketsEarnedThisWeek?: number;
  ticketsEarnWeek?: string;
  familyCrestId?: string;
  tombstoneStyleId?: string;
}
