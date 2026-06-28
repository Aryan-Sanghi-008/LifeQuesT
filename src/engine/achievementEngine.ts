import type { Character } from '../types';
import { computeNetWorth } from './economyEngine';
import { FOCUS_DOMAINS } from '../data/focusDomains';

export function evaluateAchievements(character: Character): Set<string> {
  const earned = new Set(character.achievements);
  const { stats, karma, age, relationships, career, educationLevel } = character;
  const netWorth = computeNetWorth(character);

  if (stats.wealth >= 90) earned.add('millionaire');
  if (stats.intelligence >= 90) earned.add('genius');
  if (age >= 100) earned.add('centenarian');
  if (karma >= 200) earned.add('saint');
  if (relationships >= 5) earned.add('heartbreaker');
  if (stats.social >= 90) earned.add('social_king');
  if (netWorth >= 500000) earned.add('rich_kid');
  if (stats.fitness >= 90) earned.add('fitness_buff');
  if (career?.title?.toLowerCase().includes('entrepreneur')) earned.add('entrepreneur');
  if (educationLevel === 'graduate' && stats.intelligence >= 80) earned.add('top_grad');
  if (character.eventHistory.filter(e => e.category === 'travel').length >= 3) earned.add('globetrotter');
  const hasLowHealthRecord = character.eventHistory.some(e => (e.statEffect.health ?? 0) <= -20);
  if (hasLowHealthRecord && character.isAlive && stats.health > 10) earned.add('iron_will');

  const focusDomainsUsed = character.focusDomainsUsed ?? [];
  if (focusDomainsUsed.length >= FOCUS_DOMAINS.length) earned.add('focused_life');

  const focusPointsSpent = character.focusPointsSpent ?? {};
  if (focusPointsSpent.career && focusPointsSpent.career >= 10) earned.add('career_focus_master');
  if (focusPointsSpent.education && focusPointsSpent.education >= 10) earned.add('education_focus_master');
  if (focusPointsSpent.health && focusPointsSpent.health >= 10) earned.add('health_focus_master');
  if (focusPointsSpent.social && focusPointsSpent.social >= 10) earned.add('social_focus_master');
  if (focusPointsSpent.finance && focusPointsSpent.finance >= 10) earned.add('finance_focus_master');
  if (focusPointsSpent.hobby && focusPointsSpent.hobby >= 10) earned.add('hobby_focus_master');
  if (focusPointsSpent.family && focusPointsSpent.family >= 10) earned.add('family_focus_master');

  const chains = character.completedMemoryChains ?? [];
  if (chains.length >= 1) earned.add('chain_complete_1');
  if (chains.length >= 3) earned.add('chain_complete_3');
  if (chains.length >= 5) earned.add('chain_complete_5');
  if (chains.length >= 10) earned.add('chain_complete_10');
  if (chains.includes('betrayal_arc')) earned.add('chain_betrayal');
  if (chains.includes('redemption_path')) earned.add('chain_redemption');
  if (chains.includes('startup_dream')) earned.add('chain_startup');
  if (chains.includes('fame_and_fall')) earned.add('chain_fame');
  if (chains.includes('pandemic_survival')) earned.add('chain_pandemic');
  if (chains.includes('immigrant_story')) earned.add('chain_immigrant');

  if (character.aspirations) {
    earned.add('aspiration_set');
    if (character.aspirations.primary === 'career_peak') earned.add('aspiration_career');
    if (character.aspirations.primary === 'fortune') earned.add('aspiration_fortune');
    if (character.aspirations.primary === 'fame') earned.add('aspiration_fame');
    if (character.aspirations.primary === 'knowledge') earned.add('aspiration_knowledge');
    if (character.aspirations.primary === 'quiet_life') earned.add('aspiration_quiet');
  }

  const mentalEvents = character.eventHistory.filter(e =>
    e.category === 'health' && (e.statEffect.mentalHealth ?? 0) !== 0,
  );
  if (mentalEvents.some(e => (e.statEffect.mentalHealth ?? 0) >= 20)) earned.add('therapy_seeker');
  if (stats.mentalHealth >= 70 && age >= 10) earned.add('mental_steady');
  if (stats.mentalHealth >= 60 && character.memories.some(m => m.impactScore >= 50)) {
    earned.add('mental_recovery');
  }
  if (character.eventHistory.some(e => e.title.toLowerCase().includes('stress')) && stats.mentalHealth >= 40) {
    earned.add('burnout_survivor');
  }

  const friend = character.people.find(p => p.relationType === 'friend' && p.relationshipScore >= 95);
  if (friend) earned.add('best_friend');
  if (character.people.some(p => p.relationType === 'spouse' || p.relationshipStage === 'married')) {
    earned.add('married_life');
  }
  if (character.children >= 1) earned.add('parent_hood');
  if (character.people.some(p => (p.discoveredSecrets?.length ?? 0) > 0)) earned.add('npc_secret');
  const memoryNotes = character.people.reduce((sum, p) => sum + (p.memoriesOfPlayer?.length ?? 0), 0);
  if (memoryNotes >= 5) earned.add('npc_memories_5');
  if (character.people.length >= 10) earned.add('people_person');
  if (relationships === 0 && age >= 40) earned.add('loner');

  const tagCount = character.memoryTags?.length ?? 0;
  if (tagCount >= 10) earned.add('memory_collector');
  if (tagCount >= 25) earned.add('memory_hoarder');

  if (age >= 10) earned.add('decade_life');
  if (age >= 50) earned.add('half_century');

  // Phase C Achievements
  const gen = character.generation ?? 1;
  if (gen >= 3) earned.add('dynasty_3');
  if (gen >= 5) earned.add('dynasty_5');
  if (character.will?.type === 'charity') earned.add('will_charity');
  if (character.will?.type === 'heir') earned.add('will_heir');
  if (character.bankBalance >= 1000000 && gen > 1) earned.add('dynasty_millionaire');
  
  const hasRecession = character.eventHistory.some(e => e.description.toLowerCase().includes('recession'));
  const hasPandemic = character.eventHistory.some(e => e.description.toLowerCase().includes('pandemic'));
  if (hasRecession && hasPandemic) earned.add('world_crisis_survivor');

  return earned;
}

export function getNewAchievementIds(previous: string[], next: Set<string>): string[] {
  const prev = new Set(previous);
  return [...next].filter(id => !prev.has(id));
}
