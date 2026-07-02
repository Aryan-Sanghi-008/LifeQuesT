export type AchievementIconCategory =
  | 'wealth'
  | 'mind'
  | 'health'
  | 'social'
  | 'career'
  | 'family'
  | 'adventure'
  | 'legacy';

const ACHIEVEMENT_CATEGORY_BY_ID: Record<string, AchievementIconCategory> = {
  millionaire: 'wealth',
  rich_kid: 'wealth',
  finance_focus_master: 'wealth',
  aspiration_fortune: 'wealth',
  dynasty_millionaire: 'wealth',
  will_heir: 'wealth',

  genius: 'mind',
  top_grad: 'mind',
  education_focus_master: 'mind',
  aspiration_knowledge: 'mind',
  therapy_seeker: 'mind',
  memory_collector: 'mind',
  memory_hoarder: 'mind',
  focused_life: 'mind',
  hobby_focus_master: 'mind',

  fitness_buff: 'health',
  iron_will: 'health',
  health_focus_master: 'health',
  mental_steady: 'health',
  mental_recovery: 'health',
  burnout_survivor: 'health',

  social_king: 'social',
  heartbreaker: 'social',
  social_focus_master: 'social',
  best_friend: 'social',
  married_life: 'social',
  reconciled: 'social',
  people_person: 'social',
  loner: 'social',
  npc_secret: 'social',
  npc_memories_5: 'social',

  entrepreneur: 'career',
  career_focus_master: 'career',
  aspiration_career: 'career',
  chain_startup: 'career',
  aspiration_fame: 'career',

  family_focus_master: 'family',
  parent_hood: 'family',
  aspiration_quiet: 'family',
  dynasty_3: 'family',
  dynasty_5: 'family',
  will_charity: 'family',

  globetrotter: 'adventure',
  chain_immigrant: 'adventure',
  chain_pandemic: 'adventure',
  world_crisis_survivor: 'adventure',
  centenarian: 'adventure',
  decade_life: 'adventure',
  half_century: 'adventure',

  saint: 'legacy',
  chain_complete_1: 'legacy',
  chain_complete_3: 'legacy',
  chain_complete_5: 'legacy',
  chain_complete_10: 'legacy',
  chain_betrayal: 'legacy',
  chain_redemption: 'legacy',
  chain_fame: 'legacy',
  aspiration_set: 'legacy',
};

export function getAchievementIconCategory(achievementId: string): AchievementIconCategory {
  return ACHIEVEMENT_CATEGORY_BY_ID[achievementId] ?? 'legacy';
}
