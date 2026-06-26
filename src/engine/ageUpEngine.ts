import {
  Character, LifeEvent, LifeEventRecord, StatEffect, EducationLevel, LifeStage,
} from '../types';
import { DEATH_CAUSES } from '../data/gameData';
import { getLifeStage } from '../utils/lifeStage';
import { generatePartner, generatePet } from '../utils/npcGenerator';
import { applyEffect, tickAnnualEconomy, computeNetWorth, clamp, AnnualEconomyResult } from './economyEngine';
import { getCountryEconomy } from '../data/countryEconomy';
import { getEligibleEvents, pickWeightedEvents, getGuaranteedMilestones } from './eventEngine';
import { jobToCareer, incrementCareerYear, syncJobLabel } from './careerEngine';
import { advanceEducationByAge } from './educationEngine';
import { EducationStage } from '../data/educationDegrees';
import { ensureClassmates, ensureCoworkers, agePeople } from './peopleEngine';
import { tickMentalHealth } from './mentalHealthEngine';
import { recordCrime, tickJail, isInJail } from './crimeEngine';
import { advanceRelationship, applyRelationshipDecay } from './relationshipEngine';
import { tickAllBusinesses } from './businessEngine';
import { runAnnualSimulation } from './simulationEngine';
import { computeDeathChance } from './mortalityEngine';
import { inferContextualCertification } from './certificationEngine';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function applyJobUpdate(
  jobTitle: string,
  currentCareer: Character['career'],
): { job: string; career: Character['career'] } {
  const career = jobToCareer(jobTitle) ?? currentCareer;
  return { job: jobTitle, career: career ?? currentCareer };
}

const VIRAL_EVENT_IDS = ['viral_moment', 'follower_1k', 'follower_10k'];
const FINANCIAL_EVENT_COLOR = '#10B981';

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
      id: 'annual_expenses',
      age: newAge,
      title: 'Living Expenses',
      description: `Annual cost of living: ${formatMoney(economy.livingExpenses, countryCode)} deducted from your account.`,
      statEffect: {},
      category: 'financial',
      color: FINANCIAL_EVENT_COLOR,
      timestamp: ts,
    });
  }

  if (economy.salaryNet > 0) {
    const taxNote = economy.taxPaid > 0
      ? ` (${formatMoney(economy.taxPaid, countryCode)} tax withheld)`
      : '';
    records.push({
      id: 'annual_salary',
      age: newAge,
      title: 'Salary Deposited',
      description: `Net salary: ${formatMoney(economy.salaryNet, countryCode)} deposited${taxNote}.`,
      statEffect: {},
      category: 'financial',
      color: FINANCIAL_EVENT_COLOR,
      timestamp: ts + 1,
    });
  }

  return records;
}

function buildStressRecords(
  newAge: number,
  narrativeEffects: ReturnType<typeof runAnnualSimulation>['narrativeEffects'],
): LifeEventRecord[] {
  return narrativeEffects
    .filter(e => e.type === 'financial_stress')
    .map((e, i) => ({
      id: `financial_stress_${e.severity}`,
      age: newAge,
      title: e.severity === 'major' ? 'Financial Crisis' : 'Money Trouble',
      description: e.description,
      statEffect: {},
      category: 'financial' as const,
      color: e.severity === 'major' ? '#EF4444' : '#F97316',
      timestamp: Date.now() + 2 + i,
    }));
}

// Event cooldowns: eventId → minimum years between occurrences
const EVENT_COOLDOWNS: Record<string, number> = {
  doctor_visit:       1,
  hospital_stay:      2,
  job_market_crash:   3,
  market_boom:        3,
  marriage_proposal:  3,
  divorce:            5,
  business_fail:      3,
  car_accident:       5,
  house_fire:         10,
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
  }
  | {
    type: 'complete';
    patch: Partial<Character>;
    newEventRecords: LifeEventRecord[];
    netWorthPeak: number;
    karma: number;
  };

export interface AgeUpOptions {
  /** Override death roll for tests */
  forceDeath?: boolean;
}

export function runAgeUp(character: Character, options?: AgeUpOptions): AgeUpOutcome {
  if (isInJail(character)) {
    const jailed = tickJail(character);
    const yearsRemaining = jailed.criminalRecord?.jailYearsRemaining ?? 0;
    const message = yearsRemaining > 0
      ? `Serving time — ${yearsRemaining} year${yearsRemaining === 1 ? '' : 's'} left`
      : 'Your sentence is complete. You are free.';
    return {
      type: 'jail_tick',
      criminalRecord: jailed.criminalRecord!,
      yearsRemaining,
      message,
    };
  }

  const newAge = character.age + 1;
  const luckBoosts = character.luckBoostsRemaining;

  const agingEffect: StatEffect = {
    health: newAge > 40 ? -1 : 0,
    happiness: -1,
    fitness: newAge > 30 ? -1 : 0,
    looks: newAge > 35 ? -1 : 0,
  };

  let { stats, karma, bankBalance } = applyEffect(
    character.stats, character.karma, character.bankBalance,
    agingEffect, 0, character.assets,
  );

  stats = tickMentalHealth(stats, { lowHappiness: stats.happiness < 30 });

  let businesses = character.businesses ?? [];
  if (businesses.length > 0) {
    const bizTick = tickAllBusinesses(businesses);
    businesses = bizTick.businesses;
    bankBalance = Math.max(0, bankBalance + bizTick.totalProfit);
  }

  let career = character.career ? incrementCareerYear(character.career) : null;
  const salary = career?.salary ?? 0;
  const countryCode = character.countryCode ?? 'US';
  const economy = tickAnnualEconomy(newAge, bankBalance, salary, character.assets, countryCode);
  bankBalance = economy.bankBalance;

  const simResult = runAnnualSimulation({ ...character, age: newAge, stats, bankBalance, career });
  stats = { ...stats, ...simResult.statsPatches } as typeof stats;
  stats = { ...stats, wealth: clamp(computeNetWorth({ bankBalance, assets: character.assets }) / 10000) };

  const economyRecords = buildEconomyLedgerRecords(newAge, economy, countryCode);
  const stressRecords = buildStressRecords(newAge, simResult.narrativeEffects);

  const newLifeStage: LifeStage = getLifeStage(newAge);

  const deathChance = computeDeathChance(newAge, stats);
  const isDead = options?.forceDeath
    || stats.health <= 0
    || Math.random() * 100 < deathChance;

  if (isDead) {
    const cause = DEATH_CAUSES.find(d => newAge >= d.minAge && newAge <= d.maxAge)?.cause ?? 'natural causes';
    return {
      type: 'death',
      patch: {
        age: newAge,
        stats,
        bankBalance,
        lifeStage: newLifeStage,
        career,
        isAlive: false,
        deathAge: newAge,
        deathCause: cause,
      },
    };
  }

  const cooldowns = character.eventCooldowns ?? {};

  let updatedEducation: EducationLevel = character.educationLevel;
  let updatedEducationStage = (character.educationStage as EducationStage | undefined) ?? 'none';

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
        category: 'education',
        color: '#14B8A6',
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

  const rawEligible = getEligibleEvents(newAge, charForEvents);
  const eligible = rawEligible.filter(e => !isOnCooldown(e.id, newAge, cooldowns));
  const guaranteed = getGuaranteedMilestones(newAge, charForEvents);
  const guaranteedIds = new Set(guaranteed.map(e => e.id));
  const pool = eligible.filter(e => !guaranteedIds.has(e.id));
  const randomCount = Math.min(pool.length, Math.max(0, 1 + Math.floor(Math.random() * 2) - guaranteed.length));
  const randomPicks = pickWeightedEvents(pool, randomCount);
  const chosenEvents = [...guaranteed, ...randomPicks];
  const decisionEvent = chosenEvents.find(e => e.choices && e.choices.length > 0);
  const autoEvents = chosenEvents.filter(e => !e.choices?.length);

  const newRecords: LifeEventRecord[] = [...economyRecords, ...stressRecords, ...eduMilestoneRecords];
  let updatedJob = character.job;
  let certificationIds = [...(character.certificationIds ?? [])];

  const agedPeople = agePeople([...character.people]);
  const decayResult = applyRelationshipDecay(agedPeople, newAge);
  let updatedPeople = decayResult.people;
  newRecords.push(...decayResult.records);

  let updatedRelationships = character.relationships;
  let updatedChildren = character.children;
  let socialFollowers = character.socialFollowers;

  for (const event of autoEvents) {
    const res = applyEffect(stats, karma, bankBalance, event.statEffect, event.bankEffect ?? 0, character.assets);
    stats = res.stats;
    karma = res.karma;
    bankBalance = res.bankBalance;

    if (event.category === 'crime') {
      const updated = recordCrime({ ...character, stats, karma, bankBalance }, event.id);
      karma = updated.karma;
    }

    if (event.id === 'ce_certification_achieved') {
      const contextual = inferContextualCertification(character.degreeIds ?? [], certificationIds);
      if (contextual && !certificationIds.includes(contextual)) {
        certificationIds.push(contextual);
      }
    }

    if (event.updatesJob) {
      const u = applyJobUpdate(event.updatesJob, career);
      updatedJob = u.job;
      if (u.career) career = u.career;
    }
    if (event.updatesEducation) updatedEducation = event.updatesEducation;
    if (event.id === 'school_start' || (newAge === 5 && updatedEducation === 'elementary')) {
      updatedPeople = ensureClassmates(updatedPeople, character.name);
    }
    if (event.incrementsRelationships) updatedRelationships += 1;
    if (event.incrementsChildren) {
      updatedChildren += 1;
      const childName = `${character.name.split(' ')[0]} Jr.`;
      updatedPeople.push({
        id: generateId(),
        name: childName,
        age: 0,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        relationType: 'child',
        relationshipScore: 80,
        avatarSeed: childName,
        isAlive: true,
      });
    }
    if (event.addsPerson?.relationType === 'pet') updatedPeople.push(generatePet('dog'));
    if (event.addsPerson?.relationType === 'spouse') {
      const partner = { ...generatePartner(character.name, newAge), relationType: 'spouse' as const };
      updatedPeople.push(advanceRelationship(partner, 'marry'));
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
      timestamp: Date.now(),
    });
  }

  if (career && !updatedPeople.some(p => p.relationType === 'coworker')) {
    updatedPeople = ensureCoworkers(updatedPeople, character.name, career.title);
  }

  updatedJob = syncJobLabel(newAge, career, updatedJob);

  // Update cooldowns for events that fired this tick
  const updatedCooldowns: Record<string, number> = { ...cooldowns };
  for (const record of newRecords) {
    if (record.id in EVENT_COOLDOWNS) {
      updatedCooldowns[record.id] = newAge;
    }
  }

  const netWorth = computeNetWorth({ bankBalance, assets: character.assets });
  const netWorthPeak = Math.max(character.netWorthPeak, netWorth);

  const patch: Partial<Character> = {
    age: newAge,
    stats,
    karma,
    bankBalance,
    lifeStage: newLifeStage,
    job: updatedJob,
    career,
    educationLevel: updatedEducation,
    educationStage: updatedEducationStage,
    certificationIds,
    people: updatedPeople,
    relationships: updatedRelationships,
    children: updatedChildren,
    businesses,
    luckBoostsRemaining: luckBoosts,
    socialFollowers,
    netWorthPeak,
    eventCooldowns: updatedCooldowns,
  };

  if (decisionEvent) {
    return {
      type: 'pending_decision',
      patch,
      newEventRecords: newRecords,
      decisionEvent,
      netWorthPeak,
    };
  }

  return {
    type: 'complete',
    patch,
    newEventRecords: newRecords,
    netWorthPeak,
    karma,
  };
}
