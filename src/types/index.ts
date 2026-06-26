// ─── Life Stage ───────────────────────────────────────────────────────────────

export type LifeStage =
  | 'infant'
  | 'toddler'
  | 'child'
  | 'teen'
  | 'young_adult'
  | 'adult'
  | 'middle_aged'
  | 'senior';

export type EducationLevel =
  | 'none'
  | 'elementary'
  | 'secondary'
  | 'university'
  | 'graduate';

// ─── NPC / People ─────────────────────────────────────────────────────────────

export type RelationType =
  | 'mother'
  | 'father'
  | 'sibling'
  | 'friend'
  | 'partner'
  | 'spouse'
  | 'child'
  | 'classmate'
  | 'teacher'
  | 'coworker'
  | 'pet';

export interface Person {
  id: string;
  name: string;
  age: number;
  gender: string;
  relationType: RelationType;
  relationshipScore: number; // 0-100
  relationshipStage?: RelationshipStage;
  avatarSeed: string;
  isAlive: boolean;
  occupation?: string;
}

export type RelationshipStage =
  | 'single'
  | 'dating'
  | 'engaged'
  | 'married'
  | 'separated'
  | 'divorced';

export interface CriminalRecord {
  crimes: string[];
  jailYearsRemaining: number;
  onProbation: boolean;
}

export interface Business {
  id: string;
  name: string;
  revenue: number;
  expenses: number;
  valuation: number;
  employees: number;
  foundedAge: number;
}

// ─── Career ───────────────────────────────────────────────────────────────────

export interface Career {
  title: string;
  company: string;
  salary: number; // annual
  yearsEmployed: number;
  performance: number; // 0-100
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  type: 'property' | 'vehicle' | 'investment';
  name: string;
  value: number;
  debt?: number;
  purchasedAge: number;
}

// ─── Activities ───────────────────────────────────────────────────────────────

export type ActivityCategory =
  | 'mind'
  | 'body'
  | 'social'
  | 'financial'
  | 'illegal'
  | 'health'
  | 'misc';

export interface Activity {
  id: string;
  label: string;
  description: string;
  category: ActivityCategory;
  minAge: number;
  maxAge: number;
  cost?: number; // bankBalance cost
  coinCost?: number;
  statEffect: StatEffect;
  bankEffect?: number; // direct bank balance change
  successChance?: number;
  failStatEffect?: StatEffect;
  addsPerson?: RelationType; // e.g. 'pet'
}

// ─── Character & Stats ───────────────────────────────────────────────────────

export interface CharacterStats {
  health: number;       // 0-100
  happiness: number;    // 0-100
  intelligence: number; // 0-100
  wealth: number;       // 0-100
  fitness: number;      // 0-100
  looks: number;        // 0-100
  social: number;       // 0-100
  ambition: number;     // 0-100
  mentalHealth: number; // 0-100
}

export type StatKey = keyof CharacterStats;

export interface StatEffect extends Partial<CharacterStats> {
  karma?: number;
}

export type FamilyBackground = 'poor' | 'middle' | 'wealthy' | 'royalty';
export type AvatarId = 'male_1' | 'female_1' | 'male_2' | 'female_2';
// Modern avatar styles — no pixel art
export type AvatarStyleId =
  | 'adventurer'          // Male / Other default — illustration style
  | 'adventurer-neutral'  // Gender-neutral variant
  | 'lorelei'             // Female default — elegant illustration
  | 'lorelei-neutral'     // Gender-neutral lorelei
  | 'bottts'              // Robot/pet style for animals
  | 'notionists'          // Professional style for career-heavy characters
  | 'big-smile';          // Fun cheerful style
export type Gender = 'male' | 'female' | 'other' | 'animal'; // 'animal' for pets

export interface Character {
  id: string;
  name: string;
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
  socialFollowers: number;
  avatarStyle?: AvatarStyleId;
  seasonXp?: number;
  unlockedAvatarStyles?: AvatarStyleId[];
  hasSeasonPass?: boolean;
  claimedSeasonTiers?: number[];
  degreeIds: string[];
  certificationIds: string[];
  enrolledDegreeId?: string;
  eventCooldowns?: Record<string, number>; // eventId → last triggered age
  createdAt: number;
  updatedAt: number;
}

// ─── Life Events ─────────────────────────────────────────────────────────────

export type EventCategory =
  | 'education'
  | 'career'
  | 'relationship'
  | 'health'
  | 'financial'
  | 'family'
  | 'random'
  | 'milestone'
  | 'crime'
  | 'travel'
  | 'activity';

export interface EventChoice {
  id: string;
  text: string;
  subtext: string;
  statEffect: StatEffect;
  bankEffect?: number;
  successChance?: number; // 0-100; undefined = guaranteed
  successText?: string;
  failText?: string;
  updatesJob?: string;
  updatesEducation?: EducationLevel;
  addsPerson?: Partial<Person>;
  incrementsRelationships?: boolean;
  incrementsChildren?: boolean;
}

export interface LifeEvent {
  id: string;
  minAge: number;
  maxAge: number;
  title: string;
  description: string;
  statEffect: StatEffect;
  bankEffect?: number;
  category: EventCategory;
  color: string;
  choices?: EventChoice[];
  requiresTrait?: string;
  requiresStat?: Partial<Record<StatKey, number>>;
  requiresEducation?: EducationLevel;
  requiresJob?: boolean; // true = must have a job
  requiresCountry?: string[];
  requiresKarmaMin?: number;
  requiresMentalHealthBelow?: number;
  oneTime?: boolean;
  weight?: number;
  updatesJob?: string;
  updatesEducation?: EducationLevel;
  addsPerson?: Partial<Person>;
  incrementsRelationships?: boolean;
  incrementsChildren?: boolean;
}

export interface LifeEventRecord {
  id: string;
  age: number;
  title: string;
  description: string;
  statEffect: StatEffect;
  choiceMade?: string;
  category: EventCategory;
  color: string;
  timestamp: number;
}

// ─── IAP & Ads ───────────────────────────────────────────────────────────────

export type IAPProductId =
  | 'premium_monthly'
  | 'premium_yearly'
  | 'remove_ads'
  | 'coins_small'
  | 'coins_medium'
  | 'coins_large'
  | 'gems_small'
  | 'luck_boost'
  | 'reincarnation_scroll'
  | 'season_pass'
  | 'avatar_pack_adventurer'
  | 'avatar_pack_lorelei'
  | 'avatar_pack_bottts';

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  SaveSlots: undefined;
  CharacterCreate: { carriedStats?: Partial<CharacterStats> } | undefined;
  MainTabs: undefined;
  Death: undefined;
  Shop: undefined;
  Stats: undefined;
  Activities: undefined;
  Study: undefined;
  Leaderboard: undefined;
};

export type MainTabParamList = {
  Life: undefined;
  People: undefined;
  Career: undefined;
  Assets: undefined;
  Profile: undefined;
};

// ─── Store Slices ────────────────────────────────────────────────────────────

export interface PendingDecision {
  event: LifeEvent;
}

export interface GameState {
  character: Character | null;
  pendingDecision: PendingDecision | null;
  isProcessing: boolean;
  sessionAges: number;
  user: AppUser | null;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatarSeed: string;
  score: number;
  lifeAge: number;
  country: string;
}

// ─── Save Slots ──────────────────────────────────────────────────────────────

export interface SaveSlot {
  slotId: string;
  name: string;
  age: number;
  isAlive: boolean;
  updatedAt: number;
}

export const MAX_SAVE_SLOTS = 3;

// ─── Quests ──────────────────────────────────────────────────────────────────

export type QuestObjectiveType =
  | 'age_up'
  | 'reach_karma'
  | 'gain_karma'
  | 'complete_activity'
  | 'study_session';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  objectiveType: QuestObjectiveType;
  target: number;
  progress: number;
  rewardCoins: number;
  claimed: boolean;
  karmaBaseline?: number;
}

// ─── Season Pass ─────────────────────────────────────────────────────────────

export interface SeasonPassTier {
  tier: number;
  xpRequired: number;
  rewardCoins: number;
  rewardGems?: number;
  rewardLuckBoosts?: number;
}

export interface SeasonProgress {
  seasonId: string;
  xp: number;
  claimedTiers: number[];
}
