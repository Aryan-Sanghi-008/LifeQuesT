import type { BigFivePersonality } from '../types';
import { getRelationshipTraitBonus } from './traitEngine';

export interface PersonalityGameplayMods {
  eventWeightDelta: Partial<Record<'social' | 'career' | 'health' | 'financial' | 'random', number>>;
  relationshipSuccessDelta: number;
  careerFitDelta: number;
  mentalHealthDecayMod: number;
}

export function getPersonalityMods(personality: BigFivePersonality): PersonalityGameplayMods {
  const extra = (personality.extraversion - 50) / 500;
  const agree = (personality.agreeableness - 50) / 500;
  const consc = (personality.conscientiousness - 50) / 500;
  const open = (personality.openness - 50) / 500;
  const neuro = (personality.neuroticism - 50) / 500;

  return {
    eventWeightDelta: {
      social: extra * 0.15 + agree * 0.08,
      career: consc * 0.12 + open * 0.05,
      health: neuro * -0.08,
      financial: consc * 0.06,
      random: open * 0.1,
    },
    relationshipSuccessDelta: agree * 0.12 + extra * 0.08,
    careerFitDelta: consc * 0.15 + open * 0.05,
    mentalHealthDecayMod: 1 - neuro * 0.1,
  };
}

export function applyRelationshipPersonalityBonus(
  baseChance: number,
  personality: BigFivePersonality | undefined,
  traitIds: string[] = [],
): number {
  let chance = baseChance;
  if (personality) {
    chance += getPersonalityMods(personality).relationshipSuccessDelta;
  }
  chance += getRelationshipTraitBonus(traitIds);
  return Math.max(0.05, Math.min(0.98, chance));
}

export function getPersonalityImpactSummary(personality: BigFivePersonality): string[] {
  const lines: string[] = [];
  if (personality.extraversion > 65) lines.push('High extraversion → more social events & easier friendships.');
  if (personality.conscientiousness > 65) lines.push('High conscientiousness → better promotions & career events.');
  if (personality.openness > 65) lines.push('High openness → more unique random opportunities.');
  if (personality.agreeableness > 65) lines.push('High agreeableness → smoother relationship interactions.');
  if (personality.neuroticism > 65) lines.push('High neuroticism → higher mental health stress over time.');
  if (!lines.length) lines.push('Balanced personality — steady outcomes across all life areas.');
  return lines;
}
