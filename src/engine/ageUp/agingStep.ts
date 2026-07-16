import type { StatEffect, TraumaMemory } from '@/types';
import { getLifeStage } from '@utils/lifeStage';
import { applyEffect, clamp } from '@engine/economyEngine';
import { tickMentalHealth } from '@engine/mentalHealthEngine';
import { getPersonalityMods } from '@engine/personalityModifiers';
import {
  hasStoicCrimeStressImmunity,
} from '@engine/traitEngine';
import { tickWorldEvents, getWorldEventModifiers } from '@engine/worldEngine';
import {
  applyFocusStatModifiers,
  resolveFocusAllocationForAgeUp,
} from '@engine/focusEngine';
import { applyEquippedStatPerks } from '@engine/equippedPerksEngine';
import { computeNetWorth } from '@engine/economyEngine';
import type { AgeUpContext } from './types';

export function initAgingContext(
  character: import('@/types').Character,
): Pick<
  AgeUpContext,
  | 'newAge'
  | 'memories'
  | 'memoryTags'
  | 'memoryTagsBefore'
  | 'addMemory'
  | 'agingEffect'
  | 'activeWorldEvents'
  | 'worldModifiers'
  | 'worldLogs'
  | 'newLifeStage'
  | 'luckBoosts'
> {
  const newAge = character.age + 1;
  const worldResult = tickWorldEvents(character.activeWorldEvents ?? []);
  const activeWorldEvents = worldResult.nextEvents;
  const worldModifiers = getWorldEventModifiers(activeWorldEvents);

  let memories = [...(character.memories ?? [])];
  const memoryTags = [...(character.memoryTags ?? [])];
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
    key: 'health' | 'fitness' | 'looks',
    startAge: number,
    baseRate: number,
  ) => {
    if (newAge <= startAge) return 0;
    const potential = character.dna?.statPotentials?.[key] ?? 100;
    const factor = Math.max(0.2, 2 - potential / 100);
    return -Math.round(baseRate * factor);
  };

  const agingEffect: StatEffect = {
    health: getDecline('health', 40, 1) + worldModifiers.healthDelta,
    happiness: -1 + worldModifiers.happinessDelta,
    fitness: getDecline('fitness', 30, 1),
    looks: getDecline('looks', 35, 1),
  };

  return {
    newAge,
    memories,
    memoryTags,
    memoryTagsBefore,
    addMemory,
    agingEffect,
    activeWorldEvents,
    worldModifiers,
    worldLogs: worldResult.logs,
    newLifeStage: getLifeStage(newAge),
    luckBoosts: character.luckBoostsRemaining,
  };
}

export function runAgingDecayStep(ctx: AgeUpContext): void {
  const { character, agingEffect } = ctx;
  let debt = character.debt ?? 0;
  let bankBalance = character.bankBalance;

  const {
    stats: agedStats,
    karma: agedKarma,
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

  ctx.stats = agedStats;
  ctx.karma = agedKarma;
  ctx.bankBalance = agedBank;
  ctx.debt = nextDebt;

  const neuroticism = character.personality?.neuroticism ?? 50;
  const conscientiousness = character.personality?.conscientiousness ?? 50;
  ctx.stats = tickMentalHealth(ctx.stats, {
    lowHappiness: ctx.stats.happiness < 30,
    neuroticism,
    conscientiousness,
    mentalHealthDecayMod: character.personality
      ? getPersonalityMods(character.personality).mentalHealthDecayMod
      : 1,
    stoicTrait: character.traits.includes('stoic'),
    stoicCrimeImmunity: hasStoicCrimeStressImmunity(character.traits ?? []),
  });
}

export function runAgingFocusStep(ctx: AgeUpContext): void {
  const { character } = ctx;
  const focusAllocation = resolveFocusAllocationForAgeUp({
    ...character,
    age: character.age,
  });
  ctx.focusAllocation = focusAllocation;
  ctx.statsBeforeFocus = { ...ctx.stats };
  ctx.stats = applyFocusStatModifiers(ctx.stats, focusAllocation, character.traits ?? []);
  ctx.stats = applyEquippedStatPerks(
    ctx.stats,
    { ...character, assets: ctx.assets, businesses: ctx.businesses },
    clamp,
  );
  ctx.stats = {
    ...ctx.stats,
    wealth: clamp(computeNetWorth({ bankBalance: ctx.bankBalance, assets: ctx.assets, debt: ctx.debt }) / 10000),
  };
}
