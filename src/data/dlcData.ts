import { Character, LifeEventRecord } from '../types';
import { CareerPath } from './careerPaths';

export interface DlcTrait {
  id: string;
  label: string;
  description: string;
  statEffect: Record<string, number>;
}

export const FANTASY_TRAITS: DlcTrait[] = [
  {
    id: 'prestige_elf_grace',
    label: 'Elf Grace',
    description: 'Unlocks +10 Looks potential, permanent looks boost, and radiant lifespan.',
    statEffect: { looks: 15 },
  },
  {
    id: 'prestige_orc_might',
    label: 'Orc Might',
    description: 'Unlocks +15 Fitness potential and makes you resilient against health drains.',
    statEffect: { fitness: 15 },
  },
  {
    id: 'prestige_dragon_blood',
    label: 'Dragon Blood',
    description: 'Unlocks +15 Ambition potential and boosts success in high-risk careers.',
    statEffect: { ambition: 15 },
  },
];

export const FANTASY_CAREERS: CareerPath[] = [
  {
    id: 'career_alchemist',
    label: 'Alchemist',
    category: 'science',
    description: 'Formulate compounds and potions in private laboratories.',
    company: 'Guild of Transmutation',
    baseSalary: 55000,
    maxSalary: 180000,
    seniorityLevel: 1,
    requirements: {
      minAge: 22,
      minIntelligence: 65,
      minEducationStage: 'university',
    },
    progressionPaths: [],
    isEntryLevel: true,
    stressLevel: 5,
    workLifeBalance: 7,
  },
  {
    id: 'career_wizard_apprentice',
    label: 'Wizard Apprentice',
    category: 'education',
    description: 'Study ancient spellbooks and run errands for senior archmages.',
    company: 'Sanctum of Archmages',
    baseSalary: 50000,
    maxSalary: 195000,
    seniorityLevel: 1,
    requirements: {
      minAge: 22,
      minIntelligence: 75,
      minEducationStage: 'university',
    },
    progressionPaths: [],
    isEntryLevel: true,
    stressLevel: 6,
    workLifeBalance: 6,
  },
];

export function isDlcUnlocked(character: Character, dlcId: string): boolean {
  if (character.isPremium) return true;
  return (character.unlockedDlcIds ?? []).includes(dlcId);
}

export function triggerDlcAgeUpEvents(character: Character): LifeEventRecord[] {
  const records: LifeEventRecord[] = [];
  const ts = Date.now();

  if (!isDlcUnlocked(character, 'dlc_fantasy')) return records;

  const job = character.job;

  if (job === 'Alchemist' && Math.random() < 0.15) {
    records.push({
      id: `dlc_alchemy_spill_${ts}`,
      age: character.age,
      title: 'Potion Spill Accident',
      description: 'A transmutation potion exploded in your lab. You lost some health, but your intelligence grew from analyzing the failure!',
      statEffect: { health: -8, intelligence: 4 },
      category: 'career',
      color: '#A855F7',
      timestamp: ts,
    });
  } else if (job === 'Wizard Apprentice' && Math.random() < 0.15) {
    records.push({
      id: `dlc_spell_mishap_${ts}`,
      age: character.age,
      title: 'Transmutation Mishap',
      description: 'You accidentally turned your supervisor\'s coffee mug into a squeaking frog. They found it amusing, boosting your workplace relationships!',
      statEffect: { social: 6, happiness: 5 },
      category: 'career',
      color: '#A855F7',
      timestamp: ts,
    });
  }

  return records;
}
