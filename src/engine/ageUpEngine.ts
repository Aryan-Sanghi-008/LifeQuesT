import {
  Character,
  LifeEvent,
  LifeEventRecord,
  StatEffect,
  EducationLevel,
  LifeStage,
  TraumaMemory,
} from "../types";
import { DEATH_CAUSES } from "../data/gameData";
import { getLifeStage } from "@utils/lifeStage";
import { generatePartner, generatePet } from "@utils/npcGenerator";
import {
  applyEffect,
  tickAnnualEconomy,
  computeNetWorth,
  clamp,
  checkDebtCrisis,
  AnnualEconomyResult,
} from "./economyEngine";
import { getCountryEconomy, getLifeExpectancy } from "../data/countryEconomy";
import { scaleEventBankEffect, scaleCountryAmount } from "./countryScaleEngine";
import {
  applyTrackedCashDelta,
  appendFinanceLedger,
  createLedgerEntry,
  type FinanceLedgerEntry,
  type FinanceLedgerCategory,
} from "./financeLedgerEngine";
import {
  pickWeightedEvents,
  getGuaranteedMilestones,
  getWeightedEligibleEvents,
  resolveEventRarity,
  applyEpicUnlockBoost,
} from "./eventEngine";
import {
  applyFocusStatModifiers,
  resolveFocusAllocationForAgeUp,
  trackFocusDomainsUsed,
  accumulateFocusPointsSpent,
} from "./focusEngine";
import { needsAspirationPick } from "./aspirationEngine";
import { addMemoryTags } from "./memoryEngine";
import {
  incrementCareerYear,
  syncJobLabel,
  applyJobTitleUpdate,
  getPromotionTarget,
} from "./careerEngine";
import {
  advanceEducationByAge,
  initGPA,
  tickGPA,
  tickDegreeEnrollment,
  shouldPromptCollegeMajor,
} from "./educationEngine";
import type { EducationStage } from "../data/educationDegrees";
import {
  ensureClassmates,
  ensureCoworkers,
  ensureTeachers,
  agePeople,
} from "./peopleEngine";
import { ensureScenarioAgeNPCs } from "./scenarioNpcEngine";
import { driftKarmaTowardNeutral } from "./economyCapEngine";
import { tickMentalHealth } from "./mentalHealthEngine";
import {
  hasStoicCrimeStressImmunity,
  getResilientHealthEventMultiplier,
} from "./traitEngine";
import {
  recordCrime,
  tickJail,
  isInJail,
  tickProbation,
  decayHeat,
} from "./crimeEngine";
import {
  advanceRelationship,
  applyRelationshipDecay,
} from "./relationshipEngine";
import { tickAllBusinesses } from "./businessEngine";
import {
  getAnnualMortgagePayments,
  getPropertyMaintenanceCost,
  getAnnualRentalIncome,
  tickPropertyYear,
  rollPropertyDisaster,
} from "./housingEngine";
import {
  tickVehicleYear,
  tickCatalogInvestment,
  tickCollectibleYear,
} from "./assetCatalogEngine";
import { resolveEquippedPerks, applyEquippedStatPerks } from "./equippedPerksEngine";
import { tickMarketHoldings, tickAngelStake, generateAngelOpportunities } from "./marketEngine";
import { tickCreditScore } from "./creditScoreEngine";
import {
  totalAnnualPremiums,
  applyInsuranceCoverage,
  lifeInsuranceEstatePayout,
} from "../data/insurancePolicies";
import { tickAllPets } from "./petEngine";
import { SOCIAL_PLATFORMS, tickSocialYear } from "./socialMediaEngine";
import { tickHobbyDecay, tickHobbyCompetitions, hobbyAnnualFinanceBonus } from "./hobbyEngine";
import { getPersonalityMods } from "./personalityModifiers";
import { advanceToTrial } from "./legalEngine";
import { runAnnualSimulation } from "./simulationEngine";
import { computeDeathChance } from "./mortalityEngine";
import { inferContextualCertification } from "./certificationEngine";
import {
  crossoverDNA,
  crossoverPersonality,
  generateRandomDNA,
  generateRandomPersonality,
} from "@utils/genetics";
import { tickWorldEvents, getWorldEventModifiers } from "./worldEngine";
import { tickNpcAutonomy } from "./npcAutonomyEngine";
import { PROPERTY_MAP } from "../data/properties";
import { getCurrentSeason } from "./liveOpsEngine";
import { triggerDlcAgeUpEvents } from "../data/dlcData";

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const VIRAL_EVENT_IDS = ["viral_moment", "follower_1k", "follower_10k"];
const FINANCIAL_EVENT_COLOR = "#10B981";

function formatMoney(amount: number, countryCode: string): string {
  const eco = getCountryEconomy(countryCode);
  return `${eco.currencySymbol}${Math.abs(amount).toLocaleString(eco.currencyLocale)}`;
}

function buildEconomyLedgerRecords(
  newAge: number,
  economy: AnnualEconomyResult,
  countryCode: string,
): LifeEventRecord[] {
  const records: LifeEventRecord[] = [];
  const ts = Date.now();

  if (economy.livingExpenses > 0) {
    records.push({
      id: "annual_expenses",
      age: newAge,
      title: "Living Expenses",
      description: `Annual cost of living: ${formatMoney(economy.livingExpenses, countryCode)} deducted from your account.`,
      statEffect: {},
      category: "financial",
      color: FINANCIAL_EVENT_COLOR,
      timestamp: ts,
    });
  }

  if (economy.salaryNet > 0) {
    const taxNote =
      economy.taxPaid > 0
        ? ` (${formatMoney(economy.taxPaid, countryCode)} tax withheld)`
        : "";
    records.push({
      id: "annual_salary",
      age: newAge,
      title: "Salary Deposited",
      description: `Net salary: ${formatMoney(economy.salaryNet, countryCode)} deposited${taxNote}.`,
      statEffect: {},
      category: "financial",
      color: FINANCIAL_EVENT_COLOR,
      timestamp: ts + 1,
    });
  }

  return records;
}

function buildStressRecords(
  newAge: number,
  narrativeEffects: ReturnType<typeof runAnnualSimulation>["narrativeEffects"],
): LifeEventRecord[] {
  return narrativeEffects
    .filter((e) => e.type === "financial_stress")
    .map((e, i) => ({
      id: `financial_stress_${e.severity}`,
      age: newAge,
      title: e.severity === "major" ? "Financial Crisis" : "Money Trouble",
      description: e.description,
      statEffect: {},
      category: "financial" as const,
      color: e.severity === "major" ? "#EF4444" : "#F97316",
      timestamp: Date.now() + 2 + i,
    }));
}

// Event cooldowns: eventId → minimum years between occurrences
const EVENT_COOLDOWNS: Record<string, number> = {
  doctor_visit: 1,
  hospital_stay: 2,
  job_market_crash: 3,
  market_boom: 3,
  marriage_proposal: 3,
  divorce: 5,
  business_fail: 3,
  car_accident: 5,
  house_fire: 10,
};

function isOnCooldown(
  eventId: string,
  currentAge: number,
  cooldowns: Record<string, number>,
): boolean {
  const lastAge = cooldowns[eventId];
  if (lastAge === undefined) return false;
  const minGap = EVENT_COOLDOWNS[eventId] ?? 0;
  return currentAge - lastAge < minGap;
}

export type AgeUpOutcome =
  | {
      type: "jail_tick";
      criminalRecord: NonNullable<Character["criminalRecord"]>;
      yearsRemaining: number;
      message: string;
    }
  | { type: "death"; patch: Partial<Character> }
  | {
      type: "pending_decision";
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
      type: "complete";
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

export function runAgeUp(
  character: Character,
  options?: AgeUpOptions,
): AgeUpOutcome {
  if (isInJail(character)) {
    const jailed = tickJail(character);
    const yearsRemaining = jailed.criminalRecord?.jailYearsRemaining ?? 0;
    const message =
      yearsRemaining > 0
        ? `Serving time — ${yearsRemaining} year${yearsRemaining === 1 ? "" : "s"} left`
        : "Your sentence is complete. You are free.";
    return {
      type: "jail_tick",
      criminalRecord: jailed.criminalRecord!,
      yearsRemaining,
      message,
    };
  }

  const newAge = character.age + 1;

  // Phase C: Tick world events
  const worldResult = tickWorldEvents(character.activeWorldEvents ?? []);
  const activeWorldEvents = worldResult.nextEvents;
  const worldModifiers = getWorldEventModifiers(activeWorldEvents);

  const luckBoosts = character.luckBoostsRemaining;
  let memories = [...(character.memories ?? [])];
  let memoryTags = [...(character.memoryTags ?? [])];
  const memoryTagsBefore = new Set(memoryTags.map((t) => t.id));
  const addMemory = (
    id: string,
    title: string,
    description: string,
    impact: number,
  ) => {
    const newMemory: TraumaMemory = {
      id: `${id}_${Date.now()}`,
      age: newAge,
      title,
      description,
      impactScore: impact,
    };
    memories = [newMemory, ...memories].slice(0, 20);
  };

  const getDecline = (
    key: "health" | "fitness" | "looks",
    startAge: number,
    baseRate: number,
  ) => {
    if (newAge <= startAge) return 0;
    const potential = character.dna?.statPotentials?.[key] ?? 100;
    const factor = Math.max(0.2, 2 - potential / 100);
    return -Math.round(baseRate * factor);
  };

  const agingEffect: StatEffect = {
    health: getDecline("health", 40, 1) + worldModifiers.healthDelta,
    happiness: -1 + worldModifiers.happinessDelta,
    fitness: getDecline("fitness", 30, 1),
    looks: getDecline("looks", 35, 1),
  };

  let debt = character.debt ?? 0;
  let bankBalance = character.bankBalance;
  let gpa = character.gpa;
  const financeEntries: FinanceLedgerEntry[] = [];
  const pushCash = (
    delta: number,
    category: FinanceLedgerCategory,
    label: string,
  ) => {
    const tracked = applyTrackedCashDelta(bankBalance, debt, delta, {
      age: newAge,
      category,
      label,
    });
    bankBalance = tracked.bankBalance;
    debt = tracked.debt;
    if (tracked.entry) financeEntries.push(tracked.entry);
  };

  let {
    stats,
    karma,
    bankBalance: agedBank,
    debt: nextDebt,
  } = applyEffect(
    character.stats,
    character.karma,
    bankBalance,
    agingEffect,
    0,
    character.assets,
    debt,
  );
  bankBalance = agedBank;
  debt = nextDebt;

  const neuroticism = character.personality?.neuroticism ?? 50;
  const conscientiousness = character.personality?.conscientiousness ?? 50;
  stats = tickMentalHealth(stats, {
    lowHappiness: stats.happiness < 30,
    neuroticism,
    conscientiousness,
    mentalHealthDecayMod: character.personality
      ? getPersonalityMods(character.personality).mentalHealthDecayMod
      : 1,
    stoicTrait: character.traits.includes('stoic'),
    stoicCrimeImmunity: hasStoicCrimeStressImmunity(character.traits ?? []),
  });

  let businesses = character.businesses ?? [];
  const equippedEffects = resolveEquippedPerks(character);

  if (businesses.length > 0) {
    const bizTick = tickAllBusinesses(businesses);
    businesses = bizTick.businesses;
    let totalProfit = bizTick.totalProfit;
    if (equippedEffects.incomeBonusPct > 0 && totalProfit > 0) {
      totalProfit = Math.round(totalProfit * (1 + equippedEffects.incomeBonusPct));
    }
    if (totalProfit !== 0) {
      pushCash(
        totalProfit,
        "business",
        totalProfit >= 0 ? "Business profit" : "Business loss",
      );
    }
  }

  let career = character.career ? incrementCareerYear(character.career) : null;
  if (career && equippedEffects.careerPerfBonus > 0) {
    career = {
      ...career,
      performance: Math.min(
        100,
        career.performance + Math.round(equippedEffects.careerPerfBonus * 100),
      ),
    };
  }
  let totalCareerYears = character.totalCareerYears ?? 0;
  if (character.career) totalCareerYears += 1;

  const promotionOfferNeeded = Boolean(career && getPromotionTarget(career));
  const salary = career?.salary ?? 0;
  const countryCode = character.countryCode ?? "US";
  const economy = tickAnnualEconomy(
    newAge,
    bankBalance,
    debt,
    salary,
    character.assets,
    countryCode,
  );

  // Re-apply annual economy via tracked cash so the ledger shows salary vs living separately.
  if (economy.salaryNet > 0) {
    pushCash(economy.salaryNet, "salary", "Net salary");
  }
  if (economy.livingExpenses > 0) {
    let living = economy.livingExpenses;
    if (equippedEffects.expenseReducePct > 0) {
      living = Math.round(living * (1 - equippedEffects.expenseReducePct));
    }
    pushCash(-living, "living", "Living expenses");
    economy.livingExpenses = living;
  }
  // Sync result object for downstream records / live ops adjustment base
  economy.bankBalance = bankBalance;
  economy.debt = debt;

  // Apply Live Ops season modifiers to living expenses
  const liveOps = getCurrentSeason().activeModifiers;
  if (liveOps.expenseMultiplier !== 1.0 && economy.livingExpenses > 0) {
    const originalLivingExpenses = economy.livingExpenses;
    const adjustedExpenses = Math.round(
      originalLivingExpenses * liveOps.expenseMultiplier,
    );
    const extraExpense = adjustedExpenses - originalLivingExpenses;
    if (extraExpense > 0) {
      pushCash(-extraExpense, "living", "Season living-cost surge");
    }
    economy.livingExpenses = adjustedExpenses;
  }

  // Apply world event tax modifiers
  if (worldModifiers.taxRateDelta !== 0 && salary > 0) {
    const extraTax = Math.round(salary * worldModifiers.taxRateDelta);
    economy.taxPaid += extraTax;
    economy.salaryNet = Math.max(0, economy.salaryNet - extraTax);
    if (extraTax > 0) {
      pushCash(-extraTax, "other", "Extra world-event tax");
    }
  }

  // Insurance premiums (cash) — equipped policies only
  const insurancePremiums = totalAnnualPremiums(character.insurancePolicies);
  if (insurancePremiums > 0) {
    pushCash(-insurancePremiums, "other", "Insurance premiums");
  }

  // Health / auto insurance claim events (equipped policies pay out)
  const claimLogs: string[] = [];
  if (Math.random() < 0.08 + Math.max(0, (50 - stats.health) / 400)) {
    const medicalBill = scaleCountryAmount(8_000 + Math.random() * 22_000, countryCode, 'cost');
    const { coveredLoss, payout } = applyInsuranceCoverage(
      character.insurancePolicies,
      'health',
      medicalBill,
    );
    pushCash(-coveredLoss, 'other', 'Medical expenses');
    if (payout > 0) pushCash(payout, 'other', 'Health insurance payout');
    claimLogs.push(
      payout > 0
        ? `Hospital stay — insurance covered ${Math.round((payout / medicalBill) * 100)}% of the bill.`
        : 'Hospital stay — paid medical expenses out of pocket.',
    );
    stats = { ...stats, health: clamp(stats.health - 4), happiness: clamp(stats.happiness - 2) };
  }
  if (character.assets.some((a) => a.type === 'vehicle') && Math.random() < 0.06) {
    const crashLoss = scaleCountryAmount(5_000 + Math.random() * 25_000, countryCode, 'cost');
    const { coveredLoss, payout } = applyInsuranceCoverage(
      character.insurancePolicies,
      'auto',
      crashLoss,
    );
    pushCash(-coveredLoss, 'other', 'Vehicle accident costs');
    if (payout > 0) pushCash(payout, 'other', 'Auto insurance payout');
    claimLogs.push(
      payout > 0
        ? `Car accident — auto insurance paid out on repairs.`
        : 'Car accident — repair costs hit your wallet.',
    );
    stats = { ...stats, health: clamp(stats.health - 3), happiness: clamp(stats.happiness - 3) };
  }

  // Tick properties with world appreciation multiplier and investments
  const disasterLogs: string[] = [];
  let assets = character.assets.map((a) => {
    if (a.type === "property") {
      const nextAsset = tickPropertyYear(a);
      if (worldModifiers.propertyAppreciationMultiplier !== 1.0) {
        const def = a.propertyDefId ? PROPERTY_MAP[a.propertyDefId] : undefined;
        const baseAppreciation = def?.appreciationPct ?? 0.02;
        const extraAppreciation =
          baseAppreciation *
          (worldModifiers.propertyAppreciationMultiplier - 1.0);
        nextAsset.value = Math.max(
          0,
          Math.round(nextAsset.value * (1 + extraAppreciation)),
        );
      }
      const disaster = rollPropertyDisaster(nextAsset);
      if (disaster) {
        const rawLoss = nextAsset.value - disaster.value;
        const { coveredLoss, payout } = applyInsuranceCoverage(
          character.insurancePolicies,
          "home",
          rawLoss,
        );
        const finalValue = nextAsset.value - coveredLoss;
        if (payout > 0) {
          pushCash(payout, "other", "Home insurance payout");
        }
        disasterLogs.push(
          `${nextAsset.name} suffered damage — value reduced to ${finalValue.toLocaleString()}.`,
        );
        return { ...disaster, value: finalValue };
      }
      return nextAsset;
    }
    if (a.type === "vehicle") {
      return tickVehicleYear(a);
    }
    if (a.type === "collectible") {
      return tickCollectibleYear(a, newAge);
    }
    if (a.type === "angel_stake") {
      return tickAngelStake(a, newAge);
    }
    if (a.type === "investment") {
      const bonus =
        worldModifiers.investmentReturnDelta + liveOps.stockReturnBonus;
      if (a.catalogId) {
        const ticked = tickCatalogInvestment(a, bonus);
        return {
          ...ticked,
          priceHistory: [
            ...(a.priceHistory ?? []),
            { age: newAge, value: ticked.value },
          ].slice(-20),
        };
      }
      const baseReturn = 0.07;
      const volatility = 0.12;
      const marketReturn =
        baseReturn + bonus + (Math.random() - 0.5) * volatility;
      const nextAsset = { ...a };
      nextAsset.value = Math.max(
        0,
        Math.round(nextAsset.value * (1 + marketReturn)),
      );
      nextAsset.priceHistory = [
        ...(a.priceHistory ?? []),
        { age: newAge, value: nextAsset.value },
      ].slice(-20);
      return nextAsset;
    }
    return a;
  });

  // Extra market event pass for equity/crypto mult when world crashes/booms
  if (worldModifiers.investmentReturnDelta !== 0) {
    const equityMult = 1 + worldModifiers.investmentReturnDelta;
    const marketTick = tickMarketHoldings(assets, newAge, {
      equityMult,
      cryptoMult: equityMult * 1.2,
      bondMult: 1 + worldModifiers.investmentReturnDelta * 0.3,
    });
    // Prefer priceHistory from marketTick for investment assets already updated;
    // only apply if we want double-tick — skip to avoid double applying.
    void marketTick;
  }

  const mortgagePayments = getAnnualMortgagePayments(assets);
  const baseMaintenance = getPropertyMaintenanceCost(assets);
  const adjustedMaintenance = Math.round(
    baseMaintenance * liveOps.maintenanceMultiplier,
  );
  const housingCosts = mortgagePayments + adjustedMaintenance;
  if (housingCosts > 0) {
    let housing = housingCosts;
    if (equippedEffects.expenseReducePct > 0) {
      housing = Math.round(housing * (1 - equippedEffects.expenseReducePct * 0.5));
    }
    pushCash(-housing, "housing", "Housing (mortgage + maintenance)");
  }

  let rentalIncome = getAnnualRentalIncome(assets);
  if (rentalIncome > 0 && equippedEffects.incomeBonusPct > 0) {
    rentalIncome = Math.round(rentalIncome * (1 + equippedEffects.incomeBonusPct));
  }
  if (rentalIncome > 0) {
    pushCash(rentalIncome, "other", "Rental income");
  }

  const simResult = runAnnualSimulation({
    ...character,
    age: newAge,
    stats,
    bankBalance,
    career,
    assets,
  });
  stats = { ...stats, ...simResult.statsPatches } as typeof stats;

  const focusAllocation = resolveFocusAllocationForAgeUp({
    ...character,
    age: character.age,
  });
  const statsBeforeFocus = { ...stats };
  stats = applyFocusStatModifiers(stats, focusAllocation, character.traits ?? []);
  // Equipped asset perks (stats) — replaces happiness-only catalog bonuses
  stats = applyEquippedStatPerks(
    stats,
    { ...character, assets, businesses },
    clamp,
  );
  stats = {
    ...stats,
    wealth: clamp(computeNetWorth({ bankBalance, assets, debt }) / 10000),
  };

  // Disaster entries are deferred until newRecords is declared below
  const disasterEntries: LifeEventRecord[] = [
    ...disasterLogs.map((desc) => ({
      id: `property_disaster_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      age: newAge,
      title: "Property Damage",
      description: desc,
      statEffect: { happiness: -5 },
      category: "financial" as const,
      color: "#F59E0B",
      timestamp: Date.now(),
    })),
    ...claimLogs.map((desc) => ({
      id: `insurance_claim_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      age: newAge,
      title: "Insurance Claim",
      description: desc,
      statEffect: {},
      category: "financial" as const,
      color: "#0EA5E9",
      timestamp: Date.now(),
    })),
  ];

  const economyRecords = buildEconomyLedgerRecords(
    newAge,
    economy,
    countryCode,
  );
  const stressRecords = buildStressRecords(newAge, simResult.narrativeEffects);

  simResult.narrativeEffects.forEach((effect) => {
    if (effect.severity === "major") {
      addMemory(effect.type, "Severe Stress", effect.description, 60);
    }
  });

  const debtCrisis = checkDebtCrisis({
    bankBalance,
    assets,
    debt,
    countryCode,
    familyBackground: character.familyBackground,
  });

  if (debtCrisis.crisis) {
    addMemory(
      "debt_crisis",
      "Debt Crisis",
      "Faced an overwhelming debt crisis that threatened financial stability.",
      80,
    );
  }

  const newLifeStage: LifeStage = getLifeStage(newAge);

  const deathChance = computeDeathChance(newAge, stats, getLifeExpectancy(countryCode));
  const isDead =
    options?.forceDeath ||
    stats.health <= 0 ||
    debtCrisis.crisis ||
    Math.random() * 100 < deathChance;

  if (isDead) {
    const cause = debtCrisis.crisis
      ? "debt crisis"
      : (DEATH_CAUSES.find((d) => newAge >= d.minAge && newAge <= d.maxAge)
          ?.cause ?? "natural causes");
    const lifePayout = lifeInsuranceEstatePayout(
      character.insurancePolicies,
      character.netWorthPeak ?? computeNetWorth({ bankBalance, assets, debt }),
    );
    if (lifePayout > 0) {
      bankBalance += lifePayout;
    }
    return {
      type: "death",
      patch: {
        age: newAge,
        stats,
        bankBalance,
        debt,
        lifeStage: newLifeStage,
        career,
        isAlive: false,
        deathAge: newAge,
        deathCause: cause,
        memories,
      },
    };
  }

  const cooldowns = character.eventCooldowns ?? {};

  let updatedEducation: EducationLevel = character.educationLevel;
  let updatedEducationStage =
    (character.educationStage as EducationStage | undefined) ?? "none";

  const eduAdvance = advanceEducationByAge(
    newAge,
    updatedEducationStage,
    updatedEducation,
  );
  const eduMilestoneRecords: LifeEventRecord[] = [];
  if (eduAdvance) {
    updatedEducationStage = eduAdvance.educationStage;
    updatedEducation = eduAdvance.educationLevel;
    if (eduAdvance.milestone) {
      eduMilestoneRecords.push({
        id: `edu_milestone_${updatedEducationStage}`,
        age: newAge,
        title: eduAdvance.milestone.title,
        description: eduAdvance.milestone.description,
        statEffect: { intelligence: 2 },
        category: "education",
        color: "#14B8A6",
        timestamp: Date.now(),
      });
    }
  }

  let degreeIds = [...(character.degreeIds ?? [])];
  let enrolledDegreeId = character.enrolledDegreeId;
  let enrolledDegreeYearsRemaining = character.enrolledDegreeYearsRemaining;
  let educationBranch = character.educationBranch;
  let scholarshipDiscount = character.scholarshipDiscount;
  let educationMajorSkipped = character.educationMajorSkipped;
  const ageUpNotices: string[] = [];

  if (character.enrolledDegreeId) {
    const degreeTick = tickDegreeEnrollment({
      ...character,
      bankBalance,
      debt,
      enrolledDegreeYearsRemaining,
      degreeIds,
      educationStage: updatedEducationStage,
      educationLevel: updatedEducation,
      age: newAge,
      scholarshipDiscount,
    });
    if (degreeTick.tuitionPaid > 0) {
      pushCash(-degreeTick.tuitionPaid, "tuition", "Degree tuition");
      if ((scholarshipDiscount ?? 0) > 0) {
        scholarshipDiscount = undefined;
      }
    }
    if (degreeTick.graduated && degreeTick.graduation?.ok) {
      if (degreeTick.degreeId && !degreeIds.includes(degreeTick.degreeId)) {
        degreeIds.push(degreeTick.degreeId);
      }
      if (degreeTick.newEducationLevel) updatedEducation = degreeTick.newEducationLevel;
      if (degreeTick.newStage) updatedEducationStage = degreeTick.newStage;
      if (degreeTick.educationBranch) educationBranch = degreeTick.educationBranch;
      if (degreeTick.intelligenceGain) {
        stats.intelligence = clamp(stats.intelligence + degreeTick.intelligenceGain);
      }
      enrolledDegreeId = undefined;
      enrolledDegreeYearsRemaining = undefined;
      eduMilestoneRecords.push({
        id: `degree_grad_${degreeTick.degreeId}_${newAge}`,
        age: newAge,
        title: "Graduation",
        description: degreeTick.graduation.message,
        statEffect: { intelligence: degreeTick.intelligenceGain ?? 2 },
        category: "education",
        color: "#14B8A6",
        timestamp: Date.now(),
      });
      // Masters/PhD are manual via Study — no auto-enroll after undergrad/masters.
    } else if (degreeTick.yearsRemaining !== undefined) {
      enrolledDegreeYearsRemaining = degreeTick.yearsRemaining;
    }
  }

  const collegeMajorPickNeeded = shouldPromptCollegeMajor({
    age: newAge,
    educationStage: updatedEducationStage,
    enrolledDegreeId,
    degreeIds,
    educationMajorSkipped,
  });

  const charForEvents = {
    ...character,
    age: newAge,
    stats,
    bankBalance,
    career,
    educationLevel: updatedEducation,
    educationStage: updatedEducationStage,
  };

  const rawEligible = getWeightedEligibleEvents(newAge, charForEvents);
  const eligible = rawEligible.filter(
    (e) => !isOnCooldown(e.id, newAge, cooldowns),
  );
  const guaranteed = getGuaranteedMilestones(newAge, charForEvents);
  const guaranteedIds = new Set(guaranteed.map((e) => e.id));
  const pool = eligible.filter((e) => !guaranteedIds.has(e.id));
  const randomCount = Math.min(
    pool.length,
    Math.max(0, 1 + Math.floor(Math.random() * 2) - guaranteed.length),
  );
  const epicBoostActive = character.epicEventsUnlocked === true;
  const poolForPick = epicBoostActive ? applyEpicUnlockBoost(pool) : pool;
  const randomPicks = pickWeightedEvents(poolForPick, randomCount);
  const chosenEvents = [...guaranteed, ...randomPicks];
  const decisionEvent = chosenEvents.find(
    (e) => e.choices && e.choices.length > 0,
  );
  const autoEvents = chosenEvents.filter((e) => !e.choices?.length);

  const newRecords: LifeEventRecord[] = [
    ...economyRecords,
    ...stressRecords,
    ...eduMilestoneRecords,
    ...disasterEntries,
  ];

  // Push world event logs into newRecords
  worldResult.logs.forEach((log) => {
    newRecords.push({
      id: `world_event_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      age: newAge,
      title: "World Event",
      description: log,
      statEffect: {},
      category: "random",
      color: "#3B82F6",
      timestamp: Date.now(),
    });
  });

  let updatedJob = character.job;
  let certificationIds = [...(character.certificationIds ?? [])];

  const agedPeople = agePeople([...character.people]);
  const decayResult = applyRelationshipDecay(agedPeople, newAge);
  let updatedPeople = decayResult.people;
  newRecords.push(...decayResult.records);

  // Phase C: tick NPC autonomy and background inheritance
  const autonomyResult = tickNpcAutonomy(
    updatedPeople,
    newAge,
    stats.wealth,
    character.familyBackground,
    countryCode,
  );
  updatedPeople = autonomyResult.people;
  autonomyResult.logs.forEach((log) => {
    newRecords.push({
      id: `npc_autonomy_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      age: newAge,
      title: "Family Update",
      description: log,
      statEffect: {},
      category: "family",
      color: "#EC4899",
      timestamp: Date.now(),
    });
  });
  if (autonomyResult.bankDelta !== 0) {
    pushCash(
      autonomyResult.bankDelta,
      "other",
      autonomyResult.bankDelta > 0 ? "Family/NPC income" : "Family/NPC expense",
    );
  }

  if (newAge >= 5 && newAge <= 18) {
    updatedPeople = ensureTeachers(updatedPeople, character.name);
  }
  updatedPeople = ensureScenarioAgeNPCs(
    updatedPeople,
    { ...character, age: newAge },
    newAge,
  );
  updatedPeople = tickAllPets(updatedPeople);

  if (newAge >= 5 && newAge <= 25) {
    gpa = tickGPA({
      ...character,
      age: newAge,
      focusAllocation,
      gpa: character.gpa ?? initGPA(newAge),
    });
  }

  const socialTick = tickSocialYear({
    ...character,
    age: newAge,
    socialFollowers: character.socialFollowers,
    socialMedia: character.socialMedia,
    socialPosts: character.socialPosts,
  });
  let socialPosts = socialTick.posts;
  let socialFollowers = socialTick.socialFollowers;
  const socialMediaState = socialTick.socialMedia;
  if (equippedEffects.fameDelta > 0) {
    socialFollowers += Math.round(equippedEffects.fameDelta * 8);
  }
  if (socialTick.followerIncome > 0) {
    if (socialTick.followerIncomeByPlatform.length > 0) {
      for (const line of socialTick.followerIncomeByPlatform) {
        const label =
          SOCIAL_PLATFORMS.find((p) => p.id === line.platformId)?.label ??
          line.platformId;
        pushCash(line.amount, "social", `${label} · Follower income`);
      }
    } else {
      pushCash(socialTick.followerIncome, "social", "Follower income");
    }
  }
  for (const line of socialTick.payrollLines) {
    pushCash(
      -line.amount,
      "social",
      `${line.platformLabel} · Staff payroll (${line.staffLabel})`,
    );
  }

  const hobbyProgress = tickHobbyDecay({
    ...character,
    hobbyProgress: character.hobbyProgress,
  });
  const hobbyCash = hobbyAnnualFinanceBonus({
    ...character,
    hobbyProgress,
  });
  if (hobbyCash > 0) {
    pushCash(hobbyCash, "other", "Hobby side income");
  }
  const competitionResults = tickHobbyCompetitions({
    ...character,
    hobbyProgress,
  });
  let mergedHobbyProgress = { ...hobbyProgress };
  for (const comp of competitionResults) {
    mergedHobbyProgress[comp.hobbyId] = comp.progress;
    if (comp.cashDelta !== 0) {
      pushCash(
        comp.cashDelta,
        "other",
        comp.won ? "Competition prize" : "Competition costs",
      );
    }
    stats = { ...stats, ...comp.statPatch } as typeof stats;
    newRecords.push({
      id: `hobby_comp_${comp.competition.id}_${Date.now()}`,
      age: newAge,
      title: comp.won ? 'Competition Won!' : 'Competition Entry',
      description: comp.message,
      statEffect: comp.statPatch,
      category: 'random',
      color: comp.won ? '#10B981' : '#6366F1',
      timestamp: Date.now(),
    });
  }
  const heatLevel = decayHeat({
    ...character,
    heatLevel: character.heatLevel ?? character.criminalRecord?.heatLevel,
  });

  let legalCase = character.legalCase;
  if (
    legalCase?.stage === "investigation" &&
    (heatLevel >= 70 || Math.random() < 0.3)
  ) {
    legalCase = advanceToTrial(legalCase);
  }

  let updatedRelationships = character.relationships;
  let updatedChildren = character.children;

  for (const event of autoEvents) {
    const scaledBankEffect = scaleEventBankEffect(
      event.bankEffect ?? 0,
      countryCode,
      event.category === 'crime' ? 'fine' : 'cost',
      event.category,
      newAge,
    );
    let statEffect = event.statEffect;
    if (event.category === 'health') {
      const resilientMult = getResilientHealthEventMultiplier(character.traits ?? []);
      if (resilientMult !== 1) {
        statEffect = { ...statEffect };
        if (statEffect.health != null && statEffect.health < 0) {
          statEffect.health = Math.round(statEffect.health * resilientMult);
        }
        if (statEffect.mentalHealth != null && statEffect.mentalHealth < 0) {
          statEffect.mentalHealth = Math.round(statEffect.mentalHealth * resilientMult);
        }
      }
    }
    const debtBeforeEvent = debt;
    const res = applyEffect(
      stats,
      karma,
      bankBalance,
      statEffect,
      scaledBankEffect,
      character.assets,
      debt,
    );
    stats = res.stats;
    karma = res.karma;
    bankBalance = res.bankBalance;
    debt = res.debt;
    if (scaledBankEffect !== 0) {
      financeEntries.push(
        createLedgerEntry({
          age: newAge,
          category: "event",
          label: event.title,
          amount: scaledBankEffect,
          bankAfter: bankBalance,
          debtAfter: debt,
          debtBefore: debtBeforeEvent,
        }),
      );
    }

    const hapEffect = event.statEffect?.happiness ?? 0;
    if (hapEffect <= -15) {
      addMemory(
        event.id,
        event.title,
        event.description,
        Math.abs(hapEffect) * 3,
      );
    }

    if (event.grantsMemoryTags?.length) {
      memoryTags = addMemoryTags(
        memoryTags,
        event.grantsMemoryTags,
        newAge,
        event.category,
      );
    }

    if (event.category === "crime") {
      const updated = recordCrime(
        { ...character, stats, karma, bankBalance },
        event.id,
      );
      karma = updated.karma;
    }

    if (event.id === "ce_certification_achieved") {
      const contextual = inferContextualCertification(
        character.degreeIds ?? [],
        certificationIds,
      );
      if (contextual && !certificationIds.includes(contextual)) {
        certificationIds.push(contextual);
      }
    }

    if (event.updatesJob) {
      const u = applyJobTitleUpdate(event.updatesJob, countryCode, career);
      updatedJob = u.job;
      if (u.career) career = u.career;
    }
    if (event.updatesEducation) updatedEducation = event.updatesEducation;
    if (
      event.id === "school_start" ||
      (newAge === 5 && updatedEducation === "elementary")
    ) {
      updatedPeople = ensureClassmates(updatedPeople, character.name);
    }
    if (event.incrementsRelationships) updatedRelationships += 1;
    if (event.incrementsChildren) {
      updatedChildren += 1;
      const childName = `${character.name.split(" ")[0]} Jr.`;
      const partner = updatedPeople.find(
        (p) => p.relationType === "partner" || p.relationType === "spouse",
      );
      const partnerDNA = partner?.dna || generateRandomDNA();
      const partnerPers = partner?.personality || generateRandomPersonality();
      const childDNA = crossoverDNA(character.dna, partnerDNA);
      const childPers = crossoverPersonality(
        character.personality,
        partnerPers,
      );
      updatedPeople.push({
        id: generateId(),
        name: childName,
        age: 0,
        gender: Math.random() > 0.5 ? "male" : "female",
        relationType: "child",
        relationshipScore: 80,
        avatarSeed: childName,
        isAlive: true,
        dna: childDNA,
        personality: childPers,
      });
    }
    if (event.addsPerson?.relationType === "pet")
      updatedPeople.push(generatePet("dog"));
    if (event.addsPerson?.relationType === "spouse") {
      const partner = {
        ...generatePartner(character.name, newAge),
        relationType: "spouse" as const,
      };
      updatedPeople.push(advanceRelationship(partner, "marry"));
    }

    if (VIRAL_EVENT_IDS.includes(event.id)) {
      socialFollowers += Math.floor(Math.random() * 500) + 100;
    }

    newRecords.push({
      id: event.id,
      age: newAge,
      title: event.title,
      description: event.description,
      statEffect: event.statEffect,
      category: event.category,
      color: event.color,
      rarity: resolveEventRarity(event),
      timestamp: Date.now(),
    });
  }

  if (career && !updatedPeople.some((p) => p.relationType === "coworker")) {
    updatedPeople = ensureCoworkers(
      updatedPeople,
      character.name,
      career.title,
    );
  }

  updatedJob = syncJobLabel(newAge, career, updatedJob);

  const creditTick = tickCreditScore(
    {
      ...character,
      age: newAge,
      assets,
      debt,
      bankBalance,
      businesses,
    },
    {
      onTimePayment: housingCosts > 0,
      missedPayment: (debt ?? 0) > (character.debt ?? 0) + 1 && housingCosts > 0,
    },
  );

  // Trigger Fantasy DLC age-up events
  const dlcRecords = triggerDlcAgeUpEvents({
    ...character,
    age: newAge,
    stats,
    bankBalance,
    debt,
    career,
    assets,
  });
  if (dlcRecords.length > 0) {
    newRecords.push(...dlcRecords);
    dlcRecords.forEach((rec) => {
      if (rec.statEffect) {
        if (rec.statEffect.health)
          stats.health = clamp(stats.health + rec.statEffect.health);
        if (rec.statEffect.intelligence)
          stats.intelligence = clamp(
            stats.intelligence + rec.statEffect.intelligence,
          );
        if (rec.statEffect.social)
          stats.social = clamp(stats.social + rec.statEffect.social);
        if (rec.statEffect.happiness)
          stats.happiness = clamp(stats.happiness + rec.statEffect.happiness);
      }
    });
  }

  const updatedCooldowns: Record<string, number> = { ...cooldowns };
  for (const record of newRecords) {
    if (record.id in EVENT_COOLDOWNS) {
      updatedCooldowns[record.id] = newAge;
    }
  }

  const netWorth = computeNetWorth({ bankBalance, assets, debt });
  const netWorthPeak = Math.max(character.netWorthPeak, netWorth);

  const probationPatch = tickProbation({
    ...character,
    age: newAge,
    career,
    criminalRecord: character.criminalRecord,
  });

  const statDeltas: Partial<Character["stats"]> = {};
  (Object.keys(statsBeforeFocus) as (keyof Character["stats"])[]).forEach(
    (key) => {
      const delta = stats[key] - statsBeforeFocus[key];
      if (delta !== 0) statDeltas[key] = delta;
    },
  );

  const newMemoryTagIds = memoryTags
    .filter((t) => !memoryTagsBefore.has(t.id))
    .map((t) => t.id);

  karma = driftKarmaTowardNeutral(karma);

  const patch: Partial<Character> = {
    age: newAge,
    stats,
    karma,
    bankBalance,
    debt,
    financeLedger: appendFinanceLedger(character.financeLedger, financeEntries),
    assets,
    lifeStage: newLifeStage,
    job: updatedJob,
    career,
    totalCareerYears,
    educationLevel: updatedEducation,
    educationStage: updatedEducationStage,
    educationBranch,
    degreeIds,
    enrolledDegreeId,
    enrolledDegreeYearsRemaining,
    scholarshipDiscount,
    educationMajorSkipped,
    certificationIds,
    people: updatedPeople,
    relationships: updatedRelationships,
    children: updatedChildren,
    businesses,
    luckBoostsRemaining: luckBoosts,
    socialFollowers,
    socialPosts,
    socialMedia: socialMediaState,
    unlockTags: [
      ...new Set([
        ...(character.unlockTags ?? []),
        ...equippedEffects.unlockTags,
      ]),
    ],
    gpa,
    heatLevel,
    hobbyProgress: mergedHobbyProgress,
    legalCase,
    creditScore: creditTick.creditScore,
    creditFactors: creditTick.creditFactors,
    creditInquiries: creditTick.creditInquiries,
    insurancePolicies: character.insurancePolicies,
    angelOpportunities:
      character.angelOpportunities && character.angelOpportunities.length > 0
        ? character.angelOpportunities
        : generateAngelOpportunities({ ...character, age: newAge, bankBalance }),
    creditHistoryStartAge: character.creditHistoryStartAge,
    netWorthPeak,
    eventCooldowns: updatedCooldowns,
    memories,
    memoryTags,
    focusConfirmedForAge: -1,
    focusAllocation: undefined,
    lifePhase: [10, 18, 25, 40, 65, 80].includes(newAge)
      ? "review"
      : newAge < 13
      ? "acting"
      : "planning",
    focusDomainsUsed: trackFocusDomainsUsed(
      character.focusDomainsUsed,
      focusAllocation,
    ),
    focusPointsSpent: accumulateFocusPointsSpent(
      character.focusPointsSpent,
      focusAllocation,
    ),
    lastYearReview: {
      age: newAge,
      newMemoryTagIds,
      focusAllocation,
      statDeltas,
    },
    activeWorldEvents,
    generation: character.generation ?? 1,
    dynastyScore: character.dynastyScore ?? 0,
    familyLineage: character.familyLineage ?? [],
    will: character.will,
    ...(epicBoostActive ? { epicEventsUnlocked: false } : {}),
    ...probationPatch,
  };

  const aspirationPickNeeded = needsAspirationPick({
    age: newAge,
    aspirations: character.aspirations,
  });
  const courtNeeded = legalCase?.stage === "trial";

  if (decisionEvent) {
    return {
      type: "pending_decision",
      patch,
      newEventRecords: newRecords,
      decisionEvent,
      netWorthPeak,
      needsAspirationPick: aspirationPickNeeded,
      needsCourt: courtNeeded,
      needsCollegeMajorPick: collegeMajorPickNeeded,
      needsPromotionOffer: promotionOfferNeeded,
      notices: ageUpNotices.length ? ageUpNotices : undefined,
    };
  }

  return {
    type: "complete",
    patch,
    newEventRecords: newRecords,
    netWorthPeak,
    karma,
    needsAspirationPick: aspirationPickNeeded,
    needsCourt: courtNeeded,
    needsCollegeMajorPick: collegeMajorPickNeeded,
    needsPromotionOffer: promotionOfferNeeded,
    notices: ageUpNotices.length ? ageUpNotices : undefined,
  };
}
