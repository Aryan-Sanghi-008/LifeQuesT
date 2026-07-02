import { Character } from '../types';
import { calculateDynastyScore } from './legacyEngine';
import { DYNASTY_MILESTONES, DynastyMilestone } from '../data/dynastyMilestones';

/** Returns milestones the character has now earned but hasn't claimed yet. */
export function getEligibleDynastyMilestones(character: Character): DynastyMilestone[] {
  const claimed = new Set(character.claimedDynastyMilestoneIds ?? []);
  const generation = character.generation ?? 1;
  const dynastyScore = (character.dynastyScore ?? 0) + calculateDynastyScore(character);

  return DYNASTY_MILESTONES.filter((m) => {
    if (claimed.has(m.id)) return false;
    if (m.type === 'generation') return generation >= m.threshold;
    if (m.type === 'score') return dynastyScore >= m.threshold;
    return false;
  });
}
