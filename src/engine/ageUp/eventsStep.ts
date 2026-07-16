import type { Character } from '@/types';
import { DEATH_CAUSES } from '@/data/gameData';
import { triggerDlcAgeUpEvents } from '@/data/dlcData';
import {
  applyEffect,
  clamp,
  computeNetWorth,
} from '@engine/economyEngine';
import { scaleEventBankEffect } from '@engine/countryScaleEngine';
import {
  createLedgerEntry,
  appendFinanceLedger,
} from '@engine/financeLedgerEngine';
import {
  pickWeightedEvents,
  getGuaranteedMilestones,
  getWeightedEligibleEvents,
  resolveEventRarity,
  applyEpicUnlockBoost,
} from '@engine/eventEngine';
import { addMemoryTags } from '@engine/memoryEngine';
import { recordCrime } from '@engine/crimeEngine';
import { inferContextualCertification } from '@engine/certificationEngine';
import { applyJobTitleUpdate } from '@engine/careerEngine';
import { ensureClassmates } from '@engine/peopleEngine';
import { advanceRelationship } from '@engine/relationshipEngine';
import { generatePartner, generatePet } from '@utils/npcGenerator';
import {
  crossoverDNA,
  crossoverPersonality,
  generateRandomDNA,
  generateRandomPersonality,
} from '@utils/genetics';
import { makeId } from '@engine/ids';
import { lifeInsuranceEstatePayout } from '@/data/insurancePolicies';
import { needsAspirationPick } from '@engine/aspirationEngine';
import { driftKarmaTowardNeutral } from '@engine/economyCapEngine';
import { tickProbation } from '@engine/crimeEngine';
import {
  trackFocusDomainsUsed,
  accumulateFocusPointsSpent,
} from '@engine/focusEngine';
import { tickCreditScore } from '@engine/creditScoreEngine';
import { generateAngelOpportunities } from '@engine/marketEngine';
import { getResilientHealthEventMultiplier } from '@engine/traitEngine';
import {
  buildEconomyLedgerRecords,
  buildStressRecords,
  isOnCooldown,
  EVENT_COOLDOWNS,
  VIRAL_EVENT_IDS,
} from './helpers';
import type { AgeUpContext, AgeUpOutcome } from './types';

export function selectEvents(ctx: AgeUpContext): void {
  const { character, newAge } = ctx;

  const charForEvents = {
    ...character,
    age: newAge,
    stats: ctx.stats,
    bankBalance: ctx.bankBalance,
    career: ctx.career,
    educationLevel: ctx.updatedEducation,
    educationStage: ctx.updatedEducationStage,
  };

  const rawEligible = getWeightedEligibleEvents(newAge, charForEvents);
  const eligible = rawEligible.filter(
    (e) => !isOnCooldown(e.id, newAge, ctx.cooldowns),
  );
  const guaranteed = getGuaranteedMilestones(newAge, charForEvents);
  const guaranteedIds = new Set(guaranteed.map((e) => e.id));
  const pool = eligible.filter((e) => !guaranteedIds.has(e.id));
  const randomCount = Math.min(
    pool.length,
    Math.max(0, 1 + Math.floor(Math.random() * 2) - guaranteed.length),
  );
  ctx.epicBoostActive = character.epicEventsUnlocked === true;
  const poolForPick = ctx.epicBoostActive ? applyEpicUnlockBoost(pool) : pool;
  const randomPicks = pickWeightedEvents(poolForPick, randomCount);
  ctx.chosenEvents = [...guaranteed, ...randomPicks];
  ctx.decisionEvent = ctx.chosenEvents.find(
    (e) => e.choices && e.choices.length > 0,
  );
  ctx.autoEvents = ctx.chosenEvents.filter((e) => !e.choices?.length);
}

export function buildInitialRecords(ctx: AgeUpContext): void {
  const { newAge, countryCode } = ctx;
  const disasterEntries = [
    ...ctx.disasterLogs.map((desc) => ({
      id: makeId('property_disaster'),
      age: newAge,
      title: 'Property Damage',
      description: desc,
      statEffect: { happiness: -5 },
      category: 'financial' as const,
      color: '#F59E0B',
      timestamp: Date.now(),
    })),
    ...ctx.claimLogs.map((desc) => ({
      id: makeId('insurance_claim'),
      age: newAge,
      title: 'Insurance Claim',
      description: desc,
      statEffect: {},
      category: 'financial' as const,
      color: '#0EA5E9',
      timestamp: Date.now(),
    })),
  ];
  const economyRecords = buildEconomyLedgerRecords(newAge, ctx.economy, countryCode);
  const stressRecords = buildStressRecords(newAge, ctx.simResult.narrativeEffects);

  ctx.newRecords = [
    ...economyRecords,
    ...stressRecords,
    ...ctx.eduMilestoneRecords,
    ...disasterEntries,
  ];

  ctx.worldLogs.forEach((log) => {
    ctx.newRecords.push({
      id: makeId('world_event'),
      age: newAge,
      title: 'World Event',
      description: log,
      statEffect: {},
      category: 'random',
      color: '#3B82F6',
      timestamp: Date.now(),
    });
  });
}

export function checkDeath(ctx: AgeUpContext): AgeUpOutcome | null {
  const { character, newAge } = ctx;
  const isDead =
    ctx.options?.forceDeath ||
    ctx.stats.health <= 0 ||
    ctx.debtCrisis.crisis ||
    Math.random() * 100 < ctx.deathChance;

  if (!isDead) return null;

  const cause = ctx.debtCrisis.crisis
    ? 'debt crisis'
    : (DEATH_CAUSES.find((d) => newAge >= d.minAge && newAge <= d.maxAge)
        ?.cause ?? 'natural causes');
  const lifePayout = lifeInsuranceEstatePayout(
    character.insurancePolicies,
    character.netWorthPeak ?? computeNetWorth({ bankBalance: ctx.bankBalance, assets: ctx.assets, debt: ctx.debt }),
  );
  if (lifePayout > 0) {
    ctx.bankBalance += lifePayout;
  }
  return {
    type: 'death',
    patch: {
      age: newAge,
      stats: ctx.stats,
      bankBalance: ctx.bankBalance,
      debt: ctx.debt,
      lifeStage: ctx.newLifeStage,
      career: ctx.career,
      isAlive: false,
      deathAge: newAge,
      deathCause: cause,
      memories: ctx.memories,
    },
  };
}

export function applyAutoEvents(ctx: AgeUpContext): void {
  const { character, newAge, countryCode } = ctx;

  for (const event of ctx.autoEvents) {
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
    const debtBeforeEvent = ctx.debt;
    const res = applyEffect(
      ctx.stats,
      ctx.karma,
      ctx.bankBalance,
      statEffect,
      scaledBankEffect,
      character.assets,
      ctx.debt,
    );
    ctx.stats = res.stats;
    ctx.karma = res.karma;
    ctx.bankBalance = res.bankBalance;
    ctx.debt = res.debt;
    if (scaledBankEffect !== 0) {
      ctx.financeEntries.push(
        createLedgerEntry({
          age: newAge,
          category: 'event',
          label: event.title,
          amount: scaledBankEffect,
          bankAfter: ctx.bankBalance,
          debtAfter: ctx.debt,
          debtBefore: debtBeforeEvent,
        }),
      );
    }

    const hapEffect = event.statEffect?.happiness ?? 0;
    if (hapEffect <= -15) {
      ctx.addMemory(
        event.id,
        event.title,
        event.description,
        Math.abs(hapEffect) * 3,
      );
    }

    if (event.grantsMemoryTags?.length) {
      ctx.memoryTags = addMemoryTags(
        ctx.memoryTags,
        event.grantsMemoryTags,
        newAge,
        event.category,
      );
    }

    if (event.category === 'crime') {
      const updated = recordCrime(
        { ...character, stats: ctx.stats, karma: ctx.karma, bankBalance: ctx.bankBalance },
        event.id,
      );
      ctx.karma = updated.karma;
    }

    if (event.id === 'ce_certification_achieved') {
      const contextual = inferContextualCertification(
        character.degreeIds ?? [],
        ctx.certificationIds,
      );
      if (contextual && !ctx.certificationIds.includes(contextual)) {
        ctx.certificationIds.push(contextual);
      }
    }

    if (event.updatesJob) {
      const u = applyJobTitleUpdate(event.updatesJob, countryCode, ctx.career);
      ctx.updatedJob = u.job;
      if (u.career) ctx.career = u.career;
    }
    if (event.updatesEducation) ctx.updatedEducation = event.updatesEducation;
    if (
      event.id === 'school_start' ||
      (newAge === 5 && ctx.updatedEducation === 'elementary')
    ) {
      ctx.updatedPeople = ensureClassmates(ctx.updatedPeople, character.name);
    }
    if (event.incrementsRelationships) ctx.updatedRelationships += 1;
    if (event.incrementsChildren) {
      ctx.updatedChildren += 1;
      const childName = `${character.name.split(' ')[0]} Jr.`;
      const partner = ctx.updatedPeople.find(
        (p) => p.relationType === 'partner' || p.relationType === 'spouse',
      );
      const partnerDNA = partner?.dna || generateRandomDNA();
      const partnerPers = partner?.personality || generateRandomPersonality();
      const childDNA = crossoverDNA(character.dna, partnerDNA);
      const childPers = crossoverPersonality(
        character.personality,
        partnerPers,
      );
      ctx.updatedPeople.push({
        id: makeId(),
        name: childName,
        age: 0,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        relationType: 'child',
        relationshipScore: 80,
        avatarSeed: childName,
        isAlive: true,
        dna: childDNA,
        personality: childPers,
      });
    }
    if (event.addsPerson?.relationType === 'pet') {
      ctx.updatedPeople.push(generatePet('dog'));
    }
    if (event.addsPerson?.relationType === 'spouse') {
      const spouse = {
        ...generatePartner(character.name, newAge),
        relationType: 'spouse' as const,
      };
      ctx.updatedPeople.push(advanceRelationship(spouse, 'marry'));
    }

    if (VIRAL_EVENT_IDS.includes(event.id)) {
      ctx.socialFollowers += Math.floor(Math.random() * 500) + 100;
    }

    ctx.newRecords.push({
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
}

export function finalizeAgeUp(ctx: AgeUpContext): AgeUpOutcome {
  const { character, newAge } = ctx;

  const dlcRecords = triggerDlcAgeUpEvents({
    ...character,
    age: newAge,
    stats: ctx.stats,
    bankBalance: ctx.bankBalance,
    debt: ctx.debt,
    career: ctx.career,
    assets: ctx.assets,
  });
  if (dlcRecords.length > 0) {
    ctx.newRecords.push(...dlcRecords);
    dlcRecords.forEach((rec) => {
      if (rec.statEffect) {
        if (rec.statEffect.health) {
          ctx.stats.health = clamp(ctx.stats.health + rec.statEffect.health);
        }
        if (rec.statEffect.intelligence) {
          ctx.stats.intelligence = clamp(
            ctx.stats.intelligence + rec.statEffect.intelligence,
          );
        }
        if (rec.statEffect.social) {
          ctx.stats.social = clamp(ctx.stats.social + rec.statEffect.social);
        }
        if (rec.statEffect.happiness) {
          ctx.stats.happiness = clamp(ctx.stats.happiness + rec.statEffect.happiness);
        }
      }
    });
  }

  const updatedCooldowns: Record<string, number> = { ...ctx.cooldowns };
  for (const record of ctx.newRecords) {
    if (record.id in EVENT_COOLDOWNS) {
      updatedCooldowns[record.id] = newAge;
    }
  }

  const netWorth = computeNetWorth({ bankBalance: ctx.bankBalance, assets: ctx.assets, debt: ctx.debt });
  const netWorthPeak = Math.max(character.netWorthPeak, netWorth);

  const probationPatch = tickProbation({
    ...character,
    age: newAge,
    career: ctx.career,
    criminalRecord: character.criminalRecord,
  });

  const statDeltas: Partial<Character['stats']> = {};
  (Object.keys(ctx.statsBeforeFocus) as (keyof Character['stats'])[]).forEach(
    (key) => {
      const delta = ctx.stats[key] - ctx.statsBeforeFocus[key];
      if (delta !== 0) statDeltas[key] = delta;
    },
  );

  const newMemoryTagIds = ctx.memoryTags
    .filter((t) => !ctx.memoryTagsBefore.has(t.id))
    .map((t) => t.id);

  ctx.karma = driftKarmaTowardNeutral(ctx.karma);

  ctx.creditTick = tickCreditScore(
    {
      ...character,
      age: newAge,
      assets: ctx.assets,
      debt: ctx.debt,
      bankBalance: ctx.bankBalance,
      businesses: ctx.businesses,
    },
    {
      onTimePayment: ctx.housingCosts > 0,
      missedPayment: (ctx.debt ?? 0) > (character.debt ?? 0) + 1 && ctx.housingCosts > 0,
    },
  );

  ctx.angelOpportunities =
    character.angelOpportunities && character.angelOpportunities.length > 0
      ? character.angelOpportunities
      : generateAngelOpportunities({ ...character, age: newAge, bankBalance: ctx.bankBalance });

  const patch: Partial<Character> = {
    age: newAge,
    stats: ctx.stats,
    karma: ctx.karma,
    bankBalance: ctx.bankBalance,
    debt: ctx.debt,
    financeLedger: appendFinanceLedger(character.financeLedger, ctx.financeEntries),
    assets: ctx.assets,
    lifeStage: ctx.newLifeStage,
    job: ctx.updatedJob,
    career: ctx.career,
    totalCareerYears: ctx.totalCareerYears,
    educationLevel: ctx.updatedEducation,
    educationStage: ctx.updatedEducationStage,
    educationBranch: ctx.educationBranch,
    degreeIds: ctx.degreeIds,
    enrolledDegreeId: ctx.enrolledDegreeId,
    enrolledDegreeYearsRemaining: ctx.enrolledDegreeYearsRemaining,
    scholarshipDiscount: ctx.scholarshipDiscount,
    educationMajorSkipped: ctx.educationMajorSkipped,
    certificationIds: ctx.certificationIds,
    people: ctx.updatedPeople,
    relationships: ctx.updatedRelationships,
    children: ctx.updatedChildren,
    businesses: ctx.businesses,
    luckBoostsRemaining: ctx.luckBoosts,
    socialFollowers: ctx.socialFollowers,
    socialPosts: ctx.socialPosts,
    socialMedia: ctx.socialMediaState,
    unlockTags: [
      ...new Set([
        ...(character.unlockTags ?? []),
        ...ctx.equippedEffects.unlockTags,
      ]),
    ],
    gpa: ctx.gpa,
    heatLevel: ctx.heatLevel,
    hobbyProgress: ctx.mergedHobbyProgress,
    legalCase: ctx.legalCase,
    creditScore: ctx.creditTick.creditScore,
    creditFactors: ctx.creditTick.creditFactors,
    creditInquiries: ctx.creditTick.creditInquiries,
    insurancePolicies: character.insurancePolicies,
    angelOpportunities: ctx.angelOpportunities,
    creditHistoryStartAge: character.creditHistoryStartAge,
    netWorthPeak,
    eventCooldowns: updatedCooldowns,
    memories: ctx.memories,
    memoryTags: ctx.memoryTags,
    focusConfirmedForAge: -1,
    focusAllocation: undefined,
    lifePhase: [10, 18, 25, 40, 65, 80].includes(newAge)
      ? 'review'
      : newAge < 13
        ? 'acting'
        : 'planning',
    focusDomainsUsed: trackFocusDomainsUsed(
      character.focusDomainsUsed,
      ctx.focusAllocation ?? {},
    ),
    focusPointsSpent: accumulateFocusPointsSpent(
      character.focusPointsSpent,
      ctx.focusAllocation ?? {},
    ),
    lastYearReview: {
      age: newAge,
      newMemoryTagIds,
      focusAllocation: ctx.focusAllocation,
      statDeltas,
    },
    activeWorldEvents: ctx.activeWorldEvents,
    generation: character.generation ?? 1,
    dynastyScore: character.dynastyScore ?? 0,
    familyLineage: character.familyLineage ?? [],
    will: character.will,
    ...(ctx.epicBoostActive ? { epicEventsUnlocked: false } : {}),
    ...probationPatch,
  };

  const aspirationPickNeeded = needsAspirationPick({
    age: newAge,
    aspirations: character.aspirations,
  });
  const courtNeeded = ctx.legalCase?.stage === 'trial';

  if (ctx.decisionEvent) {
    return {
      type: 'pending_decision',
      patch,
      newEventRecords: ctx.newRecords,
      decisionEvent: ctx.decisionEvent,
      netWorthPeak,
      needsAspirationPick: aspirationPickNeeded,
      needsCourt: courtNeeded,
      needsCollegeMajorPick: ctx.collegeMajorPickNeeded,
      needsPromotionOffer: ctx.promotionOfferNeeded,
      notices: ctx.ageUpNotices.length ? ctx.ageUpNotices : undefined,
    };
  }

  return {
    type: 'complete',
    patch,
    newEventRecords: ctx.newRecords,
    netWorthPeak,
    karma: ctx.karma,
    needsAspirationPick: aspirationPickNeeded,
    needsCourt: courtNeeded,
    needsCollegeMajorPick: ctx.collegeMajorPickNeeded,
    needsPromotionOffer: ctx.promotionOfferNeeded,
    notices: ctx.ageUpNotices.length ? ctx.ageUpNotices : undefined,
  };
}
