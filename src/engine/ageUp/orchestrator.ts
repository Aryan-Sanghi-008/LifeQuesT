import type { Character } from '@/types';
import type { AnnualEconomyResult } from '@engine/economyEngine';
import { getCurrentSeason } from '@engine/liveOpsEngine';
import {
  applyTrackedCashDelta,
  type FinanceLedgerCategory,
} from '@engine/financeLedgerEngine';
import { runJailStep } from './jailStep';
import { initAgingContext, runAgingDecayStep, runAgingFocusStep } from './agingStep';
import { runIncomeStep } from './incomeStep';
import { runFinanceStep } from './financeStep';
import { runEducationStep } from './educationStep';
import { runNpcStep, runNpcFinalizeStep } from './npcStep';
import {
  selectEvents,
  buildInitialRecords,
  checkDeath,
  applyAutoEvents,
  finalizeAgeUp,
} from './eventsStep';
import type { AgeUpContext, AgeUpOptions, AgeUpOutcome } from './types';

function createContext(character: Character, options?: AgeUpOptions): AgeUpContext {
  const agingInit = initAgingContext(character);
  const ctx: AgeUpContext = {
    character,
    options,
    newAge: agingInit.newAge,
    countryCode: character.countryCode ?? 'US',
    luckBoosts: agingInit.luckBoosts,
    memories: agingInit.memories,
    memoryTags: agingInit.memoryTags,
    memoryTagsBefore: agingInit.memoryTagsBefore,
    addMemory: () => {},
    stats: character.stats,
    statsBeforeFocus: character.stats,
    karma: character.karma,
    bankBalance: character.bankBalance,
    debt: character.debt ?? 0,
    financeEntries: [],
    pushCash: () => {},
    agingEffect: agingInit.agingEffect,
    businesses: character.businesses ?? [],
    career: character.career,
    totalCareerYears: character.totalCareerYears ?? 0,
    promotionOfferNeeded: false,
    salary: 0,
    economy: {
      bankBalance: character.bankBalance,
      debt: character.debt ?? 0,
      salaryNet: 0,
      livingExpenses: 0,
      taxPaid: 0,
      netWorth: 0,
      salaryGross: 0,
    } satisfies AnnualEconomyResult,
    equippedEffects: {
      statPatch: {},
      incomeBonusPct: 0,
      expenseReducePct: 0,
      careerPerfBonus: 0,
      fameDelta: 0,
      unlockTags: [],
      slots: [],
    },
    assets: character.assets,
    activeWorldEvents: agingInit.activeWorldEvents,
    worldModifiers: agingInit.worldModifiers,
    worldLogs: agingInit.worldLogs,
    liveOps: getCurrentSeason().activeModifiers,
    disasterLogs: [],
    claimLogs: [],
    focusAllocation: undefined,
    newLifeStage: agingInit.newLifeStage,
    cooldowns: character.eventCooldowns ?? {},
    updatedEducation: character.educationLevel,
    updatedEducationStage: (character.educationStage as AgeUpContext['updatedEducationStage']) ?? 'none',
    eduMilestoneRecords: [],
    degreeIds: [],
    enrolledDegreeId: undefined,
    enrolledDegreeYearsRemaining: undefined,
    educationBranch: character.educationBranch,
    scholarshipDiscount: character.scholarshipDiscount,
    educationMajorSkipped: character.educationMajorSkipped,
    ageUpNotices: [],
    collegeMajorPickNeeded: false,
    newRecords: [],
    updatedJob: character.job,
    certificationIds: [...(character.certificationIds ?? [])],
    updatedPeople: character.people,
    gpa: character.gpa,
    socialPosts: character.socialPosts,
    socialFollowers: character.socialFollowers,
    socialMediaState: character.socialMedia,
    mergedHobbyProgress: character.hobbyProgress ?? {},
    heatLevel: character.heatLevel ?? 0,
    legalCase: character.legalCase,
    updatedRelationships: character.relationships,
    updatedChildren: character.children,
    chosenEvents: [],
    decisionEvent: undefined,
    autoEvents: [],
    epicBoostActive: false,
    simResult: { statsPatches: {}, narrativeEffects: [], warnings: [] },
    debtCrisis: { crisis: false, limit: 0, totalDebt: 0 },
    deathChance: 0,
    housingCosts: 0,
    creditTick: {
      creditScore: character.creditScore ?? 650,
      creditFactors: character.creditFactors ?? {
        paymentHistory: 0,
        utilization: 0,
        historyLength: 0,
        creditMix: 0,
        recentInquiries: 0,
      },
      creditInquiries: character.creditInquiries ?? 0,
    },
    angelOpportunities: character.angelOpportunities,
  };

  ctx.addMemory = (id, title, description, impact) => {
    ctx.memories = [
      {
        id: `${id}_${Date.now()}`,
        age: ctx.newAge,
        title,
        description,
        impactScore: impact,
      },
      ...ctx.memories,
    ].slice(0, 20);
  };

  ctx.pushCash = (delta, category, label) => {
    const tracked = applyTrackedCashDelta(ctx.bankBalance, ctx.debt, delta, {
      age: ctx.newAge,
      category: category as FinanceLedgerCategory,
      label,
    });
    ctx.bankBalance = tracked.bankBalance;
    ctx.debt = tracked.debt;
    if (tracked.entry) ctx.financeEntries.push(tracked.entry);
  };

  return ctx;
}

export function runAgeUp(
  character: Character,
  options?: AgeUpOptions,
): AgeUpOutcome {
  const jailOutcome = runJailStep(character);
  if (jailOutcome) return jailOutcome;

  const ctx = createContext(character, options);

  runAgingDecayStep(ctx);
  runIncomeStep(ctx);
  runFinanceStep(ctx);
  runAgingFocusStep(ctx);

  runEducationStep(ctx);
  selectEvents(ctx);
  buildInitialRecords(ctx);

  const deathOutcome = checkDeath(ctx);
  if (deathOutcome) return deathOutcome;

  runNpcStep(ctx);
  applyAutoEvents(ctx);
  runNpcFinalizeStep(ctx);

  return finalizeAgeUp(ctx);
}
