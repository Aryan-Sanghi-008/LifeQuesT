import { LifeStage } from '../types';

export function getLifeStage(age: number): LifeStage {
  if (age <= 1)  return 'infant';
  if (age <= 4)  return 'toddler';
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 35) return 'young_adult';
  if (age <= 59) return 'adult';
  return 'senior';
}

export function getLifeStageLabel(stage: LifeStage): string {
  switch (stage) {
    case 'infant':      return 'Infant';
    case 'toddler':     return 'Toddler';
    case 'child':       return 'Child';
    case 'teen':        return 'Teenager';
    case 'young_adult': return 'Young Adult';
    case 'adult':       return 'Adult';
    case 'senior':      return 'Senior';
  }
}

export function getAgePhaseLabel(age: number): string {
  if (age < 5)  return 'Early Childhood';
  if (age < 13) return 'Childhood';
  if (age < 18) return 'Teenage Years';
  if (age < 30) return 'Young Adult';
  if (age < 60) return 'Adult Life';
  return 'Golden Years';
}

// DiceBear pixel-art option overrides per life stage
export function getAvatarOptionsForStage(stage: LifeStage, gender: string): Record<string, unknown> {
  const base: Record<string, unknown> = {};

  switch (stage) {
    case 'infant':
    case 'toddler':
      return {
        ...base,
        accessories: [],
        accessoriesColor: [],
        clothingColor: ['b6e3f4', 'ffd5dc', 'c0aede'],
        clothing: ['hoodie'],
        beard: [],
        beardProbability: 0,
        glassesProbability: 0,
        hairColor: ['2c1b18', 'b58143', 'e8e1ef', 'cabfad'],
        hair: ['short01', 'short02', 'short03'],
      };

    case 'child':
      return {
        ...base,
        beard: [],
        beardProbability: 0,
        glassesProbability: 5,
        accessories: ['variant01'],
        accessoriesProbability: 10,
      };

    case 'teen':
      return {
        ...base,
        beardProbability: gender === 'male' ? 5 : 0,
        glassesProbability: 15,
        accessoriesProbability: 20,
      };

    case 'young_adult':
      return {
        ...base,
        beardProbability: gender === 'male' ? 30 : 0,
        glassesProbability: 20,
        accessoriesProbability: 30,
      };

    case 'adult':
      return {
        ...base,
        beardProbability: gender === 'male' ? 50 : 0,
        glassesProbability: 35,
        accessoriesProbability: 40,
        hairColor: ['b7b7b7', '2c1b18', 'b58143', '4a312c'],
      };

    case 'senior':
      return {
        ...base,
        beardProbability: gender === 'male' ? 40 : 0,
        glassesProbability: 60,
        accessoriesProbability: 50,
        hairColor: ['d4d4d4', 'e8e1ef', 'afafaf', 'ffffff'],
      };

    default:
      return base;
  }
}
