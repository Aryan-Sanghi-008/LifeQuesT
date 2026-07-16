import type { LifeEvent } from '../types';
import { TRAITS } from '../data/gameData';

export function hasTrait(traits: string[] | undefined, id: string): boolean {
  return (traits ?? []).includes(id);
}

export function hasLuckyTrait(traits: string[]): boolean {
  return hasTrait(traits, 'lucky') || hasTrait(traits, 'prestige_lucky_star');
}

/** Bonus percent added to success-chance rolls (0–100 scale). */
export function getLuckRollBonusPercent(traits: string[]): number {
  if (hasTrait(traits, 'prestige_lucky_star')) return 20;
  if (hasTrait(traits, 'lucky')) return 20;
  if (hasTrait(traits, 'witty')) return 6;
  return 0;
}

export function getCareerScoreTraitBonus(traits: string[]): number {
  let bonus = 0;
  if (hasLuckyTrait(traits)) bonus += 15;
  if (hasTrait(traits, 'brilliant')) bonus += 8;
  if (hasTrait(traits, 'ambitious')) bonus += 8;
  if (hasTrait(traits, 'studious')) bonus += 6;
  if (hasTrait(traits, 'disciplined')) bonus += 5;
  if (hasTrait(traits, 'reckless')) bonus += 6;
  return bonus;
}

export function getRelationshipTraitBonus(traits: string[]): number {
  let bonus = 0;
  if (hasTrait(traits, 'magnetic')) bonus += 0.15;
  if (hasTrait(traits, 'charming')) bonus += 0.08;
  if (hasTrait(traits, 'witty')) bonus += 0.06;
  if (hasTrait(traits, 'empathetic')) bonus += 0.05;
  if (hasTrait(traits, 'generous')) bonus += 0.04;
  return bonus;
}

export function getSocialIncomeTraitMultiplier(traits: string[]): number {
  if (hasTrait(traits, 'magnetic')) return 1.2;
  if (hasTrait(traits, 'charming')) return 1.08;
  return 1;
}

/** Multiplier on negative mental-health deltas (stoic = 0.5). */
export function getStoicMentalHealthDecayMultiplier(traits: string[]): number {
  return hasTrait(traits, 'stoic') ? 0.5 : 1;
}

export function hasStoicCrimeStressImmunity(traits: string[]): boolean {
  return hasTrait(traits, 'stoic');
}

export function getAthleticHealthBonus(traits: string[]): number {
  let bonus = 0;
  if (hasTrait(traits, 'athletic')) bonus += 5;
  if (hasTrait(traits, 'resilient')) bonus += 4;
  if (hasTrait(traits, 'reckless')) bonus -= 3;
  return bonus;
}

export function getResilientHealthEventMultiplier(traits: string[]): number {
  return hasTrait(traits, 'resilient') ? 0.85 : 1;
}

export function getCareerPerformanceTraitBonus(traits: string[]): number {
  let bonus = 0;
  if (hasTrait(traits, 'ambitious')) bonus += 3;
  if (hasTrait(traits, 'disciplined')) bonus += 2;
  return bonus;
}

export function getFocusStatTraitMultiplier(traits: string[]): number {
  return hasTrait(traits, 'disciplined') ? 1.05 : 1;
}

export function getKarmaTraitBonus(traits: string[]): number {
  if (hasTrait(traits, 'generous')) return 2;
  if (hasTrait(traits, 'empathetic')) return 1;
  return 0;
}

export function applyTraitEventWeights(events: LifeEvent[], traits: string[]): LifeEvent[] {
  if (!traits.length) return events;
  return events.map((e) => {
    let mult = 1;
    if (hasTrait(traits, 'creative') && (e.category === 'random' || e.category === 'travel')) mult *= 1.1;
    if (hasTrait(traits, 'witty') && e.category === 'relationship') mult *= 1.08;
    if (hasTrait(traits, 'ambitious') && e.category === 'career') mult *= 1.1;
    if (hasTrait(traits, 'reckless') && e.category === 'crime') mult *= 1.12;
    if (mult === 1) return e;
    return { ...e, weight: Math.max(0.1, (e.weight ?? 1) * mult) };
  });
}

export function isPremiumTrait(traitId: string): boolean {
  return TRAITS.find((t) => t.id === traitId)?.premiumOnly ?? false;
}

export function canSelectTrait(traitId: string, isPremium: boolean): boolean {
  if (!isPremiumTrait(traitId)) return true;
  return isPremium;
}

export function getTraitPassiveSummary(traitId: string): string | undefined {
  const summaries: Record<string, string> = {
    brilliant: '+8 career aptitude · stronger education outcomes',
    charming: '+8% relationship success',
    athletic: '+5 longevity · fitness-driven health',
    creative: '+10% unique random & travel events',
    lucky: '+20% success on rolls · +15 career aptitude',
    ambitious: '+10% career events · +3 annual performance',
    resilient: '−15% health event damage · +4 longevity',
    witty: '+6% roll success · +8% social events',
    disciplined: '+5% focus stat gains · +2 performance',
    empathetic: '+5% relationships · +1 karma on kind acts',
    reckless: '+12% crime events · +6 career risk bonus',
    stoic: '−50% mental health loss · immune to crime stress',
    magnetic: '+15% relationships · +20% social income',
    studious: '+6 career aptitude · education boost',
    generous: '+4% relationships · +2 karma from giving',
  };
  return summaries[traitId];
}
