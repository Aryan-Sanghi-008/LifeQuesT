import {
  Character, LifeEvent, LifeEventRecord, StatEffect, EducationLevel, LifeStage,
} from '../types';
import { DEATH_CAUSES } from '../data/gameData';
import { getLifeStage } from '../utils/lifeStage';
import { generatePartner, generatePet } from '../utils/npcGenerator';
import { applyEffect, tickAnnualEconomy, computeNetWorth, clamp } from './economyEngine';
import { getEligibleEvents, pickEvents } from './eventEngine';
import { jobToCareer, incrementCareerYear } from './careerEngine';
import { ensureClassmates, ensureCoworkers, agePeople } from './peopleEngine';
import { tickMentalHealth } from './mentalHealthEngine';
import { recordCrime, tickJail, isInJail } from './crimeEngine';
import { advanceRelationship } from './relationshipEngine';
import { tickAllBusinesses } from './businessEngine';

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

export type AgeUpOutcome =
  | { type: 'jail_tick'; criminalRecord: NonNullable<Character['criminalRecord']> }
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
    return {
      type: 'jail_tick',
      criminalRecord: jailed.criminalRecord!,
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
  const ticked = tickAnnualEconomy(newAge, bankBalance, salary, character.assets);
  bankBalance = ticked.bankBalance;
  stats = { ...stats, wealth: clamp(ticked.netWorth / 10000) };

  const newLifeStage: LifeStage = getLifeStage(newAge);
  const deathChance = Math.max(0, (newAge - 55) * 2);
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

  const eligible = getEligibleEvents(newAge, { ...character, age: newAge, stats, bankBalance, career });
  const chosenEvents = pickEvents(eligible, Math.min(eligible.length, 1 + Math.floor(Math.random() * 2)));
  const decisionEvent = chosenEvents.find(e => e.choices && e.choices.length > 0);
  const autoEvents = chosenEvents.filter(e => !e.choices?.length);

  const newRecords: LifeEventRecord[] = [];
  let updatedJob = character.job;
  let updatedEducation: EducationLevel = character.educationLevel;
  let updatedPeople = agePeople([...character.people]);
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
    people: updatedPeople,
    relationships: updatedRelationships,
    children: updatedChildren,
    businesses,
    luckBoostsRemaining: luckBoosts,
    socialFollowers,
    netWorthPeak,
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
