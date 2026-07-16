import { Character, LifeEvent, LifeEventRecord, StatEffect } from '../types';
import { applyEffect, computeNetWorth } from './economyEngine';
import { scaleEventBankEffect } from './countryScaleEngine';
import { appendFinanceLedger, createLedgerEntry } from './financeLedgerEngine';
import { applySuccessChance, consumeLuckBoost, resolveEventRarity } from './eventEngine';
import { jobToCareer } from './careerEngine';
import { advanceRelationship, processDivorce } from './relationshipEngine';
import { generatePartner } from '@utils/npcGenerator';
import {
  addMemoryTags,
  markChainComplete,
  resolveChoiceMemoryTags,
} from './memoryEngine';
import { getKarmaTraitBonus, getLuckRollBonusPercent, getResilientHealthEventMultiplier } from './traitEngine';

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

export interface ResolveDecisionOutcome {
  patch: Partial<Character>;
  eventRecord: LifeEventRecord;
}

export function runResolveDecision(
  character: Character,
  event: LifeEvent,
  choiceId: string,
): ResolveDecisionOutcome | null {
  const choice = event.choices?.find(c => c.id === choiceId);
  if (!choice) return null;

  const luckBonus = getLuckRollBonusPercent(character.traits ?? []);
  const hadChance = choice.successChance !== undefined;
  let luckBoosts = character.luckBoostsRemaining;
  const success = applySuccessChance(choice.successChance, luckBonus, luckBoosts);
  if (hadChance && luckBoosts > 0) {
    luckBoosts = consumeLuckBoost(luckBonus, luckBoosts, hadChance);
  }

  const effectToApply: StatEffect = success
    ? { ...event.statEffect, ...choice.statEffect }
    : event.statEffect;

  if (event.category === 'health') {
    const resilientMult = getResilientHealthEventMultiplier(character.traits ?? []);
    if (resilientMult !== 1) {
      if (effectToApply.health != null && effectToApply.health < 0) {
        effectToApply.health = Math.round(effectToApply.health * resilientMult);
      }
      if (effectToApply.mentalHealth != null && effectToApply.mentalHealth < 0) {
        effectToApply.mentalHealth = Math.round(effectToApply.mentalHealth * resilientMult);
      }
    }
  }
  const rawBankDelta = success ? (choice.bankEffect ?? event.bankEffect ?? 0) : (event.bankEffect ?? 0);
  const bankDelta = scaleEventBankEffect(
    rawBankDelta,
    character.countryCode ?? 'US',
    event.category === 'crime' ? 'fine' : 'cost',
    event.category,
    character.age,
  );

  const debtBefore = character.debt ?? 0;
  let { stats, karma, bankBalance, debt } = applyEffect(
    character.stats, character.karma, character.bankBalance,
    effectToApply, bankDelta, character.assets, character.debt ?? 0,
  );
  const karmaTraitBonus = getKarmaTraitBonus(character.traits ?? []);
  if (karmaTraitBonus > 0 && (bankDelta > 0 || event.category === 'relationship')) {
    karma = Math.min(100, karma + karmaTraitBonus);
  }

  let updatedJob = character.job;
  let career = character.career;
  let updatedEducation = character.educationLevel;
  let updatedPeople = [...character.people];
  let updatedRelationships = character.relationships;
  let updatedChildren = character.children;

  if (success) {
    const jobTitle = choice.updatesJob ?? event.updatesJob;
    if (jobTitle) {
      const u = applyJobUpdate(jobTitle, career);
      updatedJob = u.job;
      if (u.career) career = u.career;
    }
    if (choice.updatesEducation ?? event.updatesEducation) {
      updatedEducation = (choice.updatesEducation ?? event.updatesEducation)!;
    }
    if (choice.incrementsRelationships) updatedRelationships += 1;
    if (choice.incrementsChildren) {
      updatedChildren += 1;
      const childName = character.name.split(' ')[0] + ' Jr.';
      updatedPeople.push({
        id: generateId(), name: childName, age: 0,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        relationType: 'child', relationshipScore: 80,
        avatarSeed: childName, isAlive: true,
      });
    }
    if (choice.addsPerson?.relationType === 'spouse') {
      const partner = { ...generatePartner(character.name, character.age), relationType: 'spouse' as const };
      updatedPeople.push(advanceRelationship(partner, 'marry'));
    }
    if (event.id === 'divorce') {
      const spouse = updatedPeople.find(p => p.relationType === 'spouse');
      if (spouse) {
        const divorced = processDivorce({ ...character, people: updatedPeople }, spouse.id);
        updatedPeople = divorced.people;
        stats = divorced.stats;
      }
    }
  }

  const eventRecord: LifeEventRecord = {
    id: event.id,
    age: character.age,
    title: event.title,
    description: success
      ? (choice.successText ?? choice.text)
      : (choice.failText ?? `${choice.text} — but it didn't work out.`),
    statEffect: effectToApply,
    choiceMade: choice.text,
    category: event.category,
    color: event.color,
    rarity: resolveEventRarity(event),
    timestamp: Date.now(),
  };

  const patched: Partial<Character> = {
    stats,
    karma,
    bankBalance,
    debt,
    job: updatedJob,
    career,
    educationLevel: updatedEducation,
    people: updatedPeople,
    relationships: updatedRelationships,
    children: updatedChildren,
    luckBoostsRemaining: luckBoosts,
    netWorthPeak: Math.max(
      character.netWorthPeak,
      computeNetWorth({ bankBalance, assets: character.assets, debt }),
    ),
    financeLedger:
      bankDelta !== 0
        ? appendFinanceLedger(
            character.financeLedger,
            createLedgerEntry({
              age: character.age,
              category: 'event',
              label: event.title,
              amount: bankDelta,
              bankAfter: bankBalance,
              debtAfter: debt,
              debtBefore,
            }),
          )
        : character.financeLedger,
  };

  if (success) {
    const tagIds = resolveChoiceMemoryTags(choice, event);
    if (tagIds.length > 0) {
      patched.memoryTags = addMemoryTags(
        character.memoryTags,
        tagIds,
        character.age,
        event.category,
      );
      const withTags = { ...character, ...patched } as Character;
      if (event.chainId) {
        patched.completedMemoryChains = markChainComplete(
          character.completedMemoryChains,
          event.chainId,
          event,
          withTags,
        );
      }
    }
  }

  return { patch: patched, eventRecord };
}
