import type { StatKey } from './stats';
// ─── Genetics & Psychology ───────────────────────────────────────────────────

export interface BigFivePersonality {
  openness: number;          // 0-100
  conscientiousness: number;  // 0-100
  extraversion: number;       // 0-100
  agreeableness: number;      // 0-100
  neuroticism: number;        // 0-100
}

export interface CharacterDNA {
  markers: Record<string, string>; // A through L -> string representation (e.g. 'A1A2')
  statPotentials: Partial<Record<StatKey, number>>; // Max limit of stats e.g. health cap
  predispositions: string[]; // List of predispositions, e.g., 'depression'
}

export interface TraumaMemory {
  id: string;
  age: number;
  title: string;
  description: string;
  impactScore: number; // 0-100
}

