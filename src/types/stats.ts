// ─── Life Stage ───────────────────────────────────────────────────────────────

export type LifeStage =
  | 'infant'
  | 'toddler'
  | 'child'
  | 'teen'
  | 'young_adult'
  | 'adult'
  | 'middle_aged'
  | 'senior';

export type EducationLevel =
  | 'none'
  | 'elementary'
  | 'secondary'
  | 'university'
  | 'graduate';


// ─── Character & Stats ───────────────────────────────────────────────────────

export interface CharacterStats {
  health: number;       // 0-100
  happiness: number;    // 0-100
  intelligence: number; // 0-100
  wealth: number;       // 0-100
  fitness: number;      // 0-100
  looks: number;        // 0-100
  social: number;       // 0-100
  ambition: number;     // 0-100
  mentalHealth: number; // 0-100
}

export type StatKey = keyof CharacterStats;

export interface StatEffect extends Partial<CharacterStats> {
  karma?: number;
}

export type FamilyBackground = 'poor' | 'middle' | 'wealthy' | 'royalty';
export type AvatarId = 'male_1' | 'female_1' | 'male_2' | 'female_2';
// Modern avatar styles — no pixel art
export type AvatarStyleId =
  | 'adventurer'          // Male / Other default — illustration style
  | 'adventurer-neutral'  // Gender-neutral variant
  | 'lorelei'             // Female default — elegant illustration
  | 'lorelei-neutral'     // Gender-neutral lorelei
  | 'bottts'              // Robot/pet style for animals
  | 'notionists'          // Professional style for career-heavy characters
  | 'big-smile';          // Fun cheerful style
export type Gender = 'male' | 'female' | 'other' | 'animal'; // 'animal' for pets
