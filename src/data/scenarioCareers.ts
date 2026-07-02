import type { CareerPath } from './careerPaths';
import type { ScenarioId } from '../types';
import { FANTASY_CAREERS } from './dlcData';

const baseReq = { minAge: 18, minEducationStage: 'high_school', minIntelligence: 30 };

export const SCENARIO_CAREER_PATHS: CareerPath[] = [
  // Royal
  { id: 'royal_heir', label: 'Royal Heir', category: 'government', isEntryLevel: true, seniorityLevel: 1,
    description: 'Heir apparent to the throne. Court etiquette and succession politics await.',
    company: 'Royal Court', baseSalary: 120000, maxSalary: 500000, stressLevel: 7, workLifeBalance: 4,
    requirements: { ...baseReq, minSocial: 40, minAmbition: 35 },
    progressionPaths: [{ id: 'monarch', minYearsInRole: 5, minPerformance: 70, requiresPromotion: true }],
    requiresScenario: ['royal'] },
  { id: 'court_advisor', label: 'Court Advisor', category: 'government', isEntryLevel: true, seniorityLevel: 2,
    description: 'Counsel nobles on diplomacy, trade, and palace intrigue.',
    company: 'Royal Court', baseSalary: 85000, maxSalary: 220000, stressLevel: 6, workLifeBalance: 5,
    requirements: { ...baseReq, minIntelligence: 55, minSocial: 45 },
    progressionPaths: [], requiresScenario: ['royal'] },
  { id: 'monarch', label: 'Monarch', category: 'government', isEntryLevel: false, seniorityLevel: 5,
    description: 'Rule the realm. Every decree shapes history.',
    company: 'Royal Court', baseSalary: 400000, maxSalary: 900000, stressLevel: 9, workLifeBalance: 3,
    requirements: { minAge: 25, minEducationStage: 'high_school', minIntelligence: 45, minSocial: 60, minAmbition: 50 },
    progressionPaths: [], requiresScenario: ['royal'] },

  // Crime
  { id: 'mob_enforcer', label: 'Mob Enforcer', category: 'service', isEntryLevel: true, seniorityLevel: 1,
    description: 'Collect debts and enforce territory for the family.',
    company: 'The Family', baseSalary: 45000, maxSalary: 120000, stressLevel: 8, workLifeBalance: 3,
    requirements: { ...baseReq, minFitness: 45 },
    progressionPaths: [{ id: 'crime_boss', minYearsInRole: 4, minPerformance: 60, requiresPromotion: true }],
    requiresScenario: ['crime'] },
  { id: 'crime_boss', label: 'Crime Boss', category: 'business', isEntryLevel: false, seniorityLevel: 4,
    description: 'Run operations across the city. Loyalty and fear keep the empire intact.',
    company: 'The Family', baseSalary: 200000, maxSalary: 600000, stressLevel: 9, workLifeBalance: 2,
    requirements: { minAge: 28, minEducationStage: 'high_school', minIntelligence: 40, minAmbition: 55 },
    progressionPaths: [], requiresScenario: ['crime'] },

  // Cyber
  { id: 'netrunner', label: 'Netrunner', category: 'technology', isEntryLevel: true, seniorityLevel: 1,
    description: 'Breach corporate firewalls and trade data on the darknet.',
    company: 'Shadow Collective', baseSalary: 70000, maxSalary: 250000, stressLevel: 7, workLifeBalance: 5,
    requirements: { ...baseReq, minIntelligence: 60 },
    progressionPaths: [], requiresScenario: ['cyber'] },

  // Medieval
  { id: 'knight', label: 'Knight', category: 'military', isEntryLevel: true, seniorityLevel: 2,
    description: 'Serve your liege with sword and shield.',
    company: 'Feudal Lord', baseSalary: 25000, maxSalary: 80000, stressLevel: 7, workLifeBalance: 4,
    requirements: { minAge: 16, minEducationStage: 'none', minIntelligence: 25, minFitness: 55, minAmbition: 30 },
    progressionPaths: [], requiresScenario: ['medieval'] },
  { id: 'blacksmith', label: 'Blacksmith', category: 'trades', isEntryLevel: true, seniorityLevel: 1,
    description: 'Forge weapons, tools, and horseshoes for the village.',
    company: 'Village Forge', baseSalary: 18000, maxSalary: 55000, stressLevel: 5, workLifeBalance: 6,
    requirements: { minAge: 16, minEducationStage: 'none', minIntelligence: 25, minFitness: 40 },
    progressionPaths: [], requiresScenario: ['medieval'] },

  // Zombie
  { id: 'scavenger_leader', label: 'Scavenger Leader', category: 'service', isEntryLevel: true, seniorityLevel: 2,
    description: 'Lead supply runs into infected zones.',
    company: 'Survivor Camp', baseSalary: 0, maxSalary: 0, stressLevel: 9, workLifeBalance: 2,
    requirements: { minAge: 18, minEducationStage: 'none', minIntelligence: 20, minFitness: 50 },
    progressionPaths: [], requiresScenario: ['zombie'] },

  // Mars
  { id: 'colony_engineer', label: 'Colony Engineer', category: 'science', isEntryLevel: true, seniorityLevel: 2,
    description: 'Maintain life support, habitats, and terraforming equipment.',
    company: 'Mars Colonial Authority', baseSalary: 95000, maxSalary: 280000, stressLevel: 6, workLifeBalance: 5,
    requirements: { ...baseReq, minIntelligence: 65 },
    progressionPaths: [], requiresScenario: ['mars'] },

  // Celebrity
  { id: 'child_star', label: 'Child Star', category: 'arts', isEntryLevel: true, seniorityLevel: 1,
    description: 'Act, sing, and pose under studio contracts from a young age.',
    company: 'Starlight Studios', baseSalary: 150000, maxSalary: 800000, stressLevel: 8, workLifeBalance: 3,
    requirements: { minAge: 8, minEducationStage: 'none', minIntelligence: 25, minSocial: 40, minAmbition: 35 },
    progressionPaths: [], requiresScenario: ['celebrity'] },

  // Political
  { id: 'campaign_manager', label: 'Campaign Manager', category: 'government', isEntryLevel: true, seniorityLevel: 2,
    description: 'Run political campaigns, polls, and coalition strategy.',
    company: 'Dynasty PAC', baseSalary: 90000, maxSalary: 300000, stressLevel: 8, workLifeBalance: 4,
    requirements: { ...baseReq, minSocial: 55, minAmbition: 45 },
    progressionPaths: [], requiresScenario: ['political'] },

  // Fantasy — merge DLC careers with scenario gate
  ...FANTASY_CAREERS.map((c) => ({ ...c, requiresScenario: ['fantasy'] as ScenarioId[] })),
  { id: 'guild_adventurer', label: 'Guild Adventurer', category: 'service', isEntryLevel: true, seniorityLevel: 1,
    description: 'Take contracts from the adventurers guild — dungeons, escorts, and bounties.',
    company: 'Adventurers Guild', baseSalary: 35000, maxSalary: 120000, stressLevel: 7, workLifeBalance: 5,
    requirements: { minAge: 16, minEducationStage: 'none', minIntelligence: 20, minFitness: 45 },
    progressionPaths: [], requiresScenario: ['fantasy'] },
];
