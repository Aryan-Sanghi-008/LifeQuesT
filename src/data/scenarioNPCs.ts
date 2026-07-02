import type { RelationType, ScenarioId } from '../types';

export interface NPCArchetype {
  id: string;
  scenarioIds: ScenarioId[];
  relationType: RelationType;
  occupation: string;
  goals?: string[];
  spawn: 'creation' | 'age';
  spawnAge?: number;
  count?: number;
}

export const SCENARIO_NPC_ARCHETYPES: NPCArchetype[] = [
  // Royal
  { id: 'royal_courtier', scenarioIds: ['royal'], relationType: 'friend', occupation: 'Courtier',
    goals: ['Gain favor at court', 'Secure patronage'], spawn: 'creation', count: 1 },
  { id: 'royal_guard', scenarioIds: ['royal'], relationType: 'coworker', occupation: 'Royal Guard',
    goals: ['Protect the crown'], spawn: 'age', spawnAge: 12, count: 1 },

  // Zombie
  { id: 'zombie_survivor', scenarioIds: ['zombie'], relationType: 'friend', occupation: 'Survivor',
    goals: ['Find supplies', 'Stay alive'], spawn: 'creation', count: 2 },
  { id: 'zombie_medic', scenarioIds: ['zombie'], relationType: 'friend', occupation: 'Camp Medic',
    goals: ['Treat the wounded'], spawn: 'age', spawnAge: 10, count: 1 },

  // Mars
  { id: 'mars_colonist', scenarioIds: ['mars'], relationType: 'coworker', occupation: 'Colony Technician',
    goals: ['Keep habitats online'], spawn: 'creation', count: 1 },
  { id: 'mars_commander', scenarioIds: ['mars'], relationType: 'coworker', occupation: 'Colony Commander',
    goals: ['Expand the settlement'], spawn: 'age', spawnAge: 18, count: 1 },

  // Medieval
  { id: 'medieval_squire', scenarioIds: ['medieval'], relationType: 'friend', occupation: 'Squire',
    goals: ['Earn knighthood'], spawn: 'creation', count: 1 },
  { id: 'medieval_guildmaster', scenarioIds: ['medieval'], relationType: 'coworker', occupation: 'Guild Master',
    goals: ['Grow the guild'], spawn: 'age', spawnAge: 14, count: 1 },

  // Cyber
  { id: 'cyber_fixer', scenarioIds: ['cyber'], relationType: 'friend', occupation: 'Street Fixer',
    goals: ['Broker deals', 'Stay off-grid'], spawn: 'creation', count: 1 },
  { id: 'cyber_corp_agent', scenarioIds: ['cyber'], relationType: 'coworker', occupation: 'Corp Security Agent',
    goals: ['Protect corporate assets'], spawn: 'age', spawnAge: 16, count: 1 },

  // Fantasy
  { id: 'fantasy_mage', scenarioIds: ['fantasy'], relationType: 'teacher', occupation: 'Arcane Tutor',
    goals: ['Train apprentices'], spawn: 'creation', count: 1 },
  { id: 'fantasy_guild_recruiter', scenarioIds: ['fantasy'], relationType: 'friend', occupation: 'Guild Recruiter',
    goals: ['Fill quest boards'], spawn: 'age', spawnAge: 12, count: 1 },

  // Crime
  { id: 'crime_lieutenant', scenarioIds: ['crime'], relationType: 'coworker', occupation: 'Lieutenant',
    goals: ['Expand territory'], spawn: 'creation', count: 1 },
  { id: 'crime_informant', scenarioIds: ['crime'], relationType: 'friend', occupation: 'Informant',
    goals: ['Sell information'], spawn: 'age', spawnAge: 15, count: 1 },

  // Political
  { id: 'political_lobbyist', scenarioIds: ['political'], relationType: 'coworker', occupation: 'Lobbyist',
    goals: ['Influence legislation'], spawn: 'creation', count: 1 },
  { id: 'political_rival', scenarioIds: ['political'], relationType: 'coworker', occupation: 'Rival Candidate',
    goals: ['Win the election'], spawn: 'age', spawnAge: 21, count: 1 },

  // Celebrity
  { id: 'celebrity_agent', scenarioIds: ['celebrity'], relationType: 'coworker', occupation: 'Talent Agent',
    goals: ['Land big roles'], spawn: 'creation', count: 1 },
  { id: 'celebrity_paparazzi', scenarioIds: ['celebrity'], relationType: 'coworker', occupation: 'Paparazzo',
    goals: ['Get the scoop'], spawn: 'age', spawnAge: 10, count: 1 },
];

export const SCENARIO_PARENT_OCCUPATIONS: Partial<Record<ScenarioId, string[]>> = {
  royal: ['Courtier', 'Lady-in-Waiting', 'Chamberlain', 'Royal Steward'],
  zombie: ['Survivor', 'Camp Medic', 'Scavenger', 'Lookout'],
  medieval: ['Serf', 'Yeoman', 'Miller', 'Stable Hand'],
  mars: ['Colony Engineer', 'Habitat Tech', 'Terraforming Specialist'],
  cyber: ['Net Technician', 'Street Hacker', 'Corp Clerk'],
  fantasy: ['Innkeeper', 'Herbalist', 'Town Guard'],
  crime: ['Enforcer', 'Bookkeeper', 'Fence'],
  political: ['Campaign Staffer', 'Policy Advisor', 'Pollster'],
  celebrity: ['Stage Parent', 'Publicist', 'Studio Coach'],
};
