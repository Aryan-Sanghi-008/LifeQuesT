import { LifeStage, Gender } from '@/types';

export function getLifeStage(age: number): LifeStage {
  if (age <= 1)  return 'infant';
  if (age <= 4)  return 'toddler';
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 35) return 'young_adult';
  if (age <= 50) return 'adult';
  if (age <= 65) return 'middle_aged';
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
    case 'middle_aged': return 'Middle Aged';
    case 'senior':      return 'Senior';
  }
}

export function getAgePhaseLabel(age: number): string {
  if (age < 2)  return 'Infancy';
  if (age < 5)  return 'Toddler Years';
  if (age < 13) return 'Childhood';
  if (age < 18) return 'Teenage Years';
  if (age < 30) return 'Young Adult';
  if (age < 51) return 'Adult Life';
  if (age < 66) return 'Middle Age';
  return 'Golden Years';
}

// ─── Modern Avatar Options (DiceBear adventurer / lorelei) ────────────────────
// These options tune the illustration-style avatars by life stage & gender.
// NO pixel art — only modern human/animal illustration styles.

export function getAvatarOptionsForStage(stage: LifeStage, gender: Gender): Record<string, unknown> {

  // Common options shared across stages
  const femaleHairColors = ['dba3a3', 'b17a4a', '3d2605', '010101', 'efcfab', '92594b', 'eecc9e'];
  const maleHairColors   = ['3d2605', '010101', 'b17a4a', 'dba3a3', 'a55728', '92594b'];
  const grayHairColors   = ['b0b0b0', 'cbcbcb', 'e8e8e8', 'ffffff', '9e9e9e'];

  switch (stage) {

    case 'infant':
    case 'toddler':
      return {
        // Babies: round faces, minimal features, bright colors
        backgroundColor: ['b6e3f4', 'ffd5dc', 'c0aede', 'd1f7d6'],
        clothingColor: ['b6e3f4', 'ffd5dc', 'c0aede'],
        hairColor: gender === 'female' ? ['dba3a3', 'efcfab', 'b17a4a'] : maleHairColors.slice(0, 3),
      };

    case 'child':
      return {
        // Children: slightly varied hair, playful
        hairColor: gender === 'female' ? femaleHairColors : maleHairColors,
        glassesProbability: 0,
      };

    case 'teen':
      return {
        hairColor: gender === 'female' ? femaleHairColors : maleHairColors,
        glassesProbability: 10,
      };

    case 'young_adult':
      return {
        hairColor: gender === 'female' ? femaleHairColors : maleHairColors,
        glassesProbability: 15,
      };

    case 'adult':
      return {
        hairColor: gender === 'female'
          ? [...femaleHairColors, 'a0a0a0']
          : [...maleHairColors, 'a0a0a0'],
        glassesProbability: 25,
      };

    case 'middle_aged':
      return {
        // Salt-and-pepper to gray hair
        hairColor: gender === 'female'
          ? [...grayHairColors, 'b17a4a', '92594b']
          : [...grayHairColors, '3d2605'],
        glassesProbability: 45,
      };

    case 'senior':
      return {
        // Fully gray/white hair
        hairColor: grayHairColors,
        glassesProbability: 70,
      };

    default:
      return {};
  }
}

/**
 * Returns the universal default avatar pack.
 * All genders use adventurer as the baseline — gender variation is expressed
 * through seed-based options (hair colours, etc.) within the same pack,
 * not by switching to an entirely different art style.
 */
export function getDefaultAvatarStyle(gender: Gender): string {
  if (gender === 'animal') return 'bottts';
  return 'adventurer';
}

/** Map our AvatarStyleId to the DiceBear JSON filename */
export function getStyleFileName(styleId: string): string {
  const MAP: Record<string, string> = {
    'adventurer':         'adventurer',
    'adventurer-neutral': 'adventurer-neutral',
    'lorelei':            'lorelei',
    'lorelei-neutral':    'lorelei-neutral',
    'bottts':             'bottts',
    'notionists':         'notionists',
    'big-smile':          'big-smile',
  };
  return MAP[styleId] ?? 'adventurer';
}

/**
 * Resolves the exact DiceBear style file for a given player-selected pack and
 * the target character's gender.
 *
 * All characters in the game use the same pack family so the visual style is
 * cohesive, but within a gendered pack (adventurer / lorelei) we pick the
 * appropriate variant so male characters look male-presenting and female
 * characters look female-presenting.
 *
 * Pack → gender → DiceBear style mapping:
 *   adventurer : male → adventurer, female/other → adventurer-neutral
 *   lorelei    : female → lorelei,  male/other  → lorelei-neutral
 *   notionists / big-smile / bottts : same for all genders
 */
export function resolveAvatarStyleForGender(packChoice: string, gender: Gender): string {
  if (gender === 'animal') return 'bottts';
  switch (packChoice) {
    case 'adventurer':
      return gender === 'male' ? 'adventurer' : 'adventurer-neutral';
    case 'lorelei':
      return gender === 'female' ? 'lorelei' : 'lorelei-neutral';
    // Symmetric / gender-neutral packs — same style for everyone
    case 'adventurer-neutral':
    case 'lorelei-neutral':
    case 'notionists':
    case 'big-smile':
    case 'bottts':
      return packChoice;
    default:
      return 'adventurer';
  }
}
