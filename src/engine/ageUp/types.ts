import type {
  Character,
  LifeEvent,
  LifeEventRecord,
  StatEffect,
  EducationLevel,
  LifeStage,
  TraumaMemory,
  MemoryTag,
} from '@/types';
import type { EducationStage } from '@/data/educationDegrees';
import type { AnnualEconomyResult } from '@engine/economyEngine';
import type {
  FinanceLedgerEntry,
  FinanceLedgerCategory,
} from '@engine/financeLedgerEngine';
import type { ResolvedPerkEffects } from '@engine/equippedPerksEngine';
import type { WorldModifiers } from '@engine/worldEngine';

export type AgeUpOutcome =
  | {
      type: 'jail_tick';
      criminalRecord: NonNullable<Character['criminalRecord']>;
      yearsRemaining: number;
      message: string;
    }
  | { type: 'death'; patch: Partial<Character> }
  | {
      type: 'pending_decision';
      patch: Partial<Character>;
      newEventRecords: LifeEventRecord[];
      decisionEvent: LifeEvent;
      netWorthPeak: number;
      needsAspirationPick?: boolean;
      needsCourt?: boolean;
      needsCollegeMajorPick?: boolean;
      needsPromotionOffer?: boolean;
      notices?: string[];
    }
  | {
      type: 'complete';
      patch: Partial<Character>;
      newEventRecords: LifeEventRecord[];
      netWorthPeak: number;
      karma: number;
      needsAspirationPick?: boolean;
      needsCourt?: boolean;
      needsCollegeMajorPick?: boolean;
      needsPromotionOffer?: boolean;
      notices?: string[];
    };

export interface AgeUpOptions {
  /** Override death roll for tests */
  forceDeath?: boolean;
}

export interface AgeUpContext {
  character: Character;
  options?: AgeUpOptions;
  newAge: number;
  countryCode: string;
  luckBoosts: number | undefined;
  memories: TraumaMemory[];
  memoryTags: MemoryTag[];
  memoryTagsBefore: Set<string>;
  addMemory: (id: string, title: string, description: string, impact: number) => void;
  stats: Character['stats'];
  statsBeforeFocus: Character['stats'];
  karma: number;
  bankBalance: number;
  debt: number;
  financeEntries: FinanceLedgerEntry[];
  pushCash: (
    delta: number,
    category: FinanceLedgerCategory,
    label: string,
  ) => void;
  agingEffect: StatEffect;
  businesses: NonNullable<Character['businesses']>;
  career: Character['career'];
  totalCareerYears: number;
  promotionOfferNeeded: boolean;
  salary: number;
  economy: AnnualEconomyResult;
  equippedEffects: ResolvedPerkEffects;
  assets: Character['assets'];
  activeWorldEvents: NonNullable<Character['activeWorldEvents']>;
  worldModifiers: WorldModifiers;
  worldLogs: string[];
  liveOps: ReturnType<typeof import('@engine/liveOpsEngine').getCurrentSeason>['activeModifiers'];
  disasterLogs: string[];
  claimLogs: string[];
  focusAllocation: import('@/types').FocusAllocation | undefined;
  newLifeStage: LifeStage;
  cooldowns: Record<string, number>;
  updatedEducation: EducationLevel;
  updatedEducationStage: EducationStage;
  eduMilestoneRecords: LifeEventRecord[];
  degreeIds: string[];
  enrolledDegreeId: string | undefined;
  enrolledDegreeYearsRemaining: number | undefined;
  educationBranch: Character['educationBranch'];
  scholarshipDiscount: number | undefined;
  educationMajorSkipped: boolean | undefined;
  ageUpNotices: string[];
  collegeMajorPickNeeded: boolean;
  newRecords: LifeEventRecord[];
  updatedJob: Character['job'];
  certificationIds: string[];
  updatedPeople: Character['people'];
  gpa: number | undefined;
  socialPosts: Character['socialPosts'];
  socialFollowers: number;
  socialMediaState: Character['socialMedia'];
  mergedHobbyProgress: Character['hobbyProgress'];
  heatLevel: number;
  legalCase: Character['legalCase'];
  updatedRelationships: number;
  updatedChildren: number;
  chosenEvents: LifeEvent[];
  decisionEvent: LifeEvent | undefined;
  autoEvents: LifeEvent[];
  epicBoostActive: boolean;
  simResult: ReturnType<typeof import('@engine/simulationEngine').runAnnualSimulation>;
  debtCrisis: ReturnType<typeof import('@engine/economyEngine').checkDebtCrisis>;
  deathChance: number;
  housingCosts: number;
  creditTick: ReturnType<typeof import('@engine/creditScoreEngine').tickCreditScore>;
  angelOpportunities: Character['angelOpportunities'];
}
