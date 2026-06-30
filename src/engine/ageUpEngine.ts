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
  applyCashDelta,
  tickAnnualEconomy,
  computeNetWorth,
  clamp,
  checkDebtCrisis,
  AnnualEconomyResult,
} from "./economyEngine";
import { getCountryEconomy } from "../data/countryEconomy";
import {
  pickWeightedEvents,
  getGuaranteedMilestones,
  getWeightedEligibleEvents,
  resolveEventRarity,
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
} from "./careerEngine";
import { advanceEducationByAge, initGPA, tickGPA } from "./educationEngine";
import { EducationStage } from "../data/educationDegrees";
import {
  ensureClassmates,
  ensureCoworkers,
  ensureTeachers,
  agePeople,
} from "./peopleEngine";
import { tickMentalHealth } from "./mentalHealthEngine";
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
  tickPropertyYear,
} from "./housingEngine";
import { tickAllPets } from "./petEngine";
import { tickSocialYear } from "./socialMediaEngine";
import { tickHobbyDecay } from "./hobbyEngine";
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
    }
  | {
      type: "complete";
      patch: Partial<Character>;
      newEventRecords: LifeEventRecord[];
      netWorthPeak: number;
      karma: number;
      needsAspirationPick?: boolean;
      needsCourt?: boolean;
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
  let gpa = character.gpa;

  let {
    stats,
    karma,
    bankBalance,
    debt: nextDebt,
  } = applyEffect(
    character.stats,
    character.karma,
    character.bankBalance,
    agingEffect,
    0,
    character.assets,
    debt,
  );
  debt = nextDebt;

  const neuroticism = character.personality?.neuroticism ?? 50;
  const conscientiousness = character.personality?.conscientiousness ?? 50;
  stats = tickMentalHealth(stats, {
    lowHappiness: stats.happiness < 30,
    neuroticism,
    conscientiousness,
  });

  let businesses = character.businesses ?? [];
  if (businesses.length > 0) {
    const bizTick = tickAllBusinesses(businesses);
    businesses = bizTick.businesses;
    const bizCash = applyCashDelta(bankBalance, debt, bizTick.totalProfit);
    bankBalance = bizCash.bankBalance;
    debt = bizCash.debt;
  }

  let career = character.career ? incrementCareerYear(character.career) : null;
  let totalCareerYears = character.totalCareerYears ?? 0;
  if (character.career) totalCareerYears += 1;
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

  // Apply Live Ops season modifiers to living expenses
  const liveOps = getCurrentSeason().activeModifiers;
  if (liveOps.expenseMultiplier !== 1.0 && economy.livingExpenses > 0) {
    const originalLivingExpenses = economy.livingExpenses;
    const adjustedExpenses = Math.round(
      originalLivingExpenses * liveOps.expenseMultiplier,
    );
    const extraExpense = adjustedExpenses - originalLivingExpenses;
    const cashRes = applyCashDelta(
      economy.bankBalance,
      economy.debt,
      -extraExpense,
    );
    bankBalance = cashRes.bankBalance;
    debt = cashRes.debt;
    economy.bankBalance = bankBalance;
    economy.debt = debt;
    economy.livingExpenses = adjustedExpenses;
  } else {
    bankBalance = economy.bankBalance;
    debt = economy.debt;
  }

  // Apply world event tax modifiers
  if (worldModifiers.taxRateDelta !== 0 && salary > 0) {
    const extraTax = Math.round(salary * worldModifiers.taxRateDelta);
    economy.taxPaid += extraTax;
    economy.salaryNet = Math.max(0, economy.salaryNet - extraTax);
    const cashRes = applyCashDelta(bankBalance, debt, -extraTax);
    bankBalance = cashRes.bankBalance;
    debt = cashRes.debt;
    economy.bankBalance = bankBalance;
    economy.debt = debt;
  }

  // Tick properties with world appreciation multiplier and investments
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
      return nextAsset;
    }
    if (a.type === "investment") {
      const baseReturn = 0.07;
      const bonus =
        worldModifiers.investmentReturnDelta + liveOps.stockReturnBonus;
      const volatility = 0.12;
      const marketReturn =
        baseReturn + bonus + (Math.random() - 0.5) * volatility;
      const nextAsset = { ...a };
      nextAsset.value = Math.max(
        0,
        Math.round(nextAsset.value * (1 + marketReturn)),
      );
      return nextAsset;
    }
    return a;
  });

  const mortgagePayments = getAnnualMortgagePayments(assets);
  const baseMaintenance = getPropertyMaintenanceCost(assets);
  const adjustedMaintenance = Math.round(
    baseMaintenance * liveOps.maintenanceMultiplier,
  );
  const housingCosts = mortgagePayments + adjustedMaintenance;
  if (housingCosts > 0) {
    const housingCash = applyCashDelta(bankBalance, debt, -housingCosts);
    bankBalance = housingCash.bankBalance;
    debt = housingCash.debt;
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
  stats = applyFocusStatModifiers(stats, focusAllocation);
  stats = {
    ...stats,
    wealth: clamp(computeNetWorth({ bankBalance, assets, debt }) / 10000),
  };

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

  const deathChance = computeDeathChance(newAge, stats);
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
  const randomPicks = pickWeightedEvents(pool, randomCount);
  const chosenEvents = [...guaranteed, ...randomPicks];
  const decisionEvent = chosenEvents.find(
    (e) => e.choices && e.choices.length > 0,
  );
  const autoEvents = chosenEvents.filter((e) => !e.choices?.length);

  const newRecords: LifeEventRecord[] = [
    ...economyRecords,
    ...stressRecords,
    ...eduMilestoneRecords,
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
    const cashRes = applyCashDelta(bankBalance, debt, autonomyResult.bankDelta);
    bankBalance = cashRes.bankBalance;
    debt = cashRes.debt;
  }

  if (newAge >= 5 && newAge <= 18) {
    updatedPeople = ensureTeachers(updatedPeople, character.name);
  }
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
    socialFollowers: character.socialFollowers,
  });
  let socialPosts = socialTick.posts;
  let socialFollowers = socialTick.socialFollowers;

  const hobbyProgress = tickHobbyDecay({
    ...character,
    hobbyProgress: character.hobbyProgress,
  });
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
    const res = applyEffect(
      stats,
      karma,
      bankBalance,
      event.statEffect,
      event.bankEffect ?? 0,
      character.assets,
      debt,
    );
    stats = res.stats;
    karma = res.karma;
    bankBalance = res.bankBalance;
    debt = res.debt;

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

  const patch: Partial<Character> = {
    age: newAge,
    stats,
    karma,
    bankBalance,
    debt,
    assets,
    lifeStage: newLifeStage,
    job: updatedJob,
    career,
    totalCareerYears,
    educationLevel: updatedEducation,
    educationStage: updatedEducationStage,
    certificationIds,
    people: updatedPeople,
    relationships: updatedRelationships,
    children: updatedChildren,
    businesses,
    luckBoostsRemaining: luckBoosts,
    socialFollowers,
    socialPosts,
    gpa,
    heatLevel,
    hobbyProgress,
    legalCase,
    creditScore: character.creditScore ?? 650,
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
  };
}
