import {
  ensureCoworkers,
  ensureTeachers,
  agePeople,
} from '@engine/peopleEngine';
import { ensureScenarioAgeNPCs } from '@engine/scenarioNpcEngine';
import { tickAllPets } from '@engine/petEngine';
import { initGPA, tickGPA } from '@engine/educationEngine';
import { SOCIAL_PLATFORMS, tickSocialYear } from '@engine/socialMediaEngine';
import { tickHobbyDecay, tickHobbyCompetitions, hobbyAnnualFinanceBonus } from '@engine/hobbyEngine';
import { decayHeat } from '@engine/crimeEngine';
import { advanceToTrial } from '@engine/legalEngine';
import { applyRelationshipDecay } from '@engine/relationshipEngine';
import { syncJobLabel } from '@engine/careerEngine';
import { tickNpcAutonomy } from '@engine/npcAutonomyEngine';
import { makeId } from '@engine/ids';
import type { AgeUpContext } from './types';

export function runNpcStep(ctx: AgeUpContext): void {
  const { character, newAge } = ctx;

  const agedPeople = agePeople([...character.people]);
  const decayResult = applyRelationshipDecay(agedPeople, newAge);
  ctx.updatedPeople = decayResult.people;
  ctx.newRecords.push(...decayResult.records);

  const autonomyResult = tickNpcAutonomy(
    ctx.updatedPeople,
    newAge,
    ctx.stats.wealth,
    character.familyBackground,
    ctx.countryCode,
  );
  ctx.updatedPeople = autonomyResult.people;
  autonomyResult.logs.forEach((log) => {
    ctx.newRecords.push({
      id: makeId('npc_autonomy'),
      age: newAge,
      title: 'Family Update',
      description: log,
      statEffect: {},
      category: 'family',
      color: '#EC4899',
      timestamp: Date.now(),
    });
  });
  if (autonomyResult.bankDelta !== 0) {
    ctx.pushCash(
      autonomyResult.bankDelta,
      'other',
      autonomyResult.bankDelta > 0 ? 'Family/NPC income' : 'Family/NPC expense',
    );
  }

  if (newAge >= 5 && newAge <= 18) {
    ctx.updatedPeople = ensureTeachers(ctx.updatedPeople, character.name);
  }
  ctx.updatedPeople = ensureScenarioAgeNPCs(
    ctx.updatedPeople,
    { ...character, age: newAge },
    newAge,
  );
  ctx.updatedPeople = tickAllPets(ctx.updatedPeople);

  if (newAge >= 5 && newAge <= 25) {
    ctx.gpa = tickGPA({
      ...character,
      age: newAge,
      focusAllocation: ctx.focusAllocation,
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
  ctx.socialPosts = socialTick.posts;
  ctx.socialFollowers = socialTick.socialFollowers;
  ctx.socialMediaState = socialTick.socialMedia;
  if (ctx.equippedEffects.fameDelta > 0) {
    ctx.socialFollowers += Math.round(ctx.equippedEffects.fameDelta * 8);
  }
  if (socialTick.followerIncome > 0) {
    if (socialTick.followerIncomeByPlatform.length > 0) {
      for (const line of socialTick.followerIncomeByPlatform) {
        const label =
          SOCIAL_PLATFORMS.find((p) => p.id === line.platformId)?.label ??
          line.platformId;
        ctx.pushCash(line.amount, 'social', `${label} · Follower income`);
      }
    } else {
      ctx.pushCash(socialTick.followerIncome, 'social', 'Follower income');
    }
  }
  for (const line of socialTick.payrollLines) {
    ctx.pushCash(
      -line.amount,
      'social',
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
    ctx.pushCash(hobbyCash, 'other', 'Hobby side income');
  }
  const competitionResults = tickHobbyCompetitions({
    ...character,
    hobbyProgress,
  });
  ctx.mergedHobbyProgress = { ...hobbyProgress };
  for (const comp of competitionResults) {
    ctx.mergedHobbyProgress[comp.hobbyId] = comp.progress;
    if (comp.cashDelta !== 0) {
      ctx.pushCash(
        comp.cashDelta,
        'other',
        comp.won ? 'Competition prize' : 'Competition costs',
      );
    }
    ctx.stats = { ...ctx.stats, ...comp.statPatch } as typeof ctx.stats;
    ctx.newRecords.push({
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

  ctx.heatLevel = decayHeat({
    ...character,
    heatLevel: character.heatLevel ?? character.criminalRecord?.heatLevel,
  });

  ctx.legalCase = character.legalCase;
  if (
    ctx.legalCase?.stage === 'investigation' &&
    (ctx.heatLevel >= 70 || Math.random() < 0.3)
  ) {
    ctx.legalCase = advanceToTrial(ctx.legalCase);
  }

  ctx.updatedRelationships = character.relationships;
  ctx.updatedChildren = character.children;
}

export function runNpcFinalizeStep(ctx: AgeUpContext): void {
  const { character, newAge } = ctx;

  if (ctx.career && !ctx.updatedPeople.some((p) => p.relationType === 'coworker')) {
    ctx.updatedPeople = ensureCoworkers(
      ctx.updatedPeople,
      character.name,
      ctx.career.title,
    );
  }

  ctx.updatedJob = syncJobLabel(newAge, ctx.career, ctx.updatedJob);
}
