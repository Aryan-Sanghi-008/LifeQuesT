import { Person } from '../types';
import { generateClassmate, generateCoworker } from '../utils/npcGenerator';

export function spawnClassmates(characterName: string, count = 6): Person[] {
  return Array.from({ length: count }, (_, i) => {
    const c = generateClassmate(characterName, i);
    return { ...c, age: 5 };
  });
}

export function spawnCoworkers(characterName: string, occupation: string, count = 4): Person[] {
  return Array.from({ length: count }, (_, i) => generateCoworker(characterName, i, occupation));
}

export function ensureClassmates(people: Person[], characterName: string): Person[] {
  if (people.some(p => p.relationType === 'classmate')) return people;
  return [...people, ...spawnClassmates(characterName)];
}

export function ensureCoworkers(people: Person[], characterName: string, occupation: string): Person[] {
  if (people.some(p => p.relationType === 'coworker')) return people;
  return [...people, ...spawnCoworkers(characterName, occupation)];
}

export function agePeople(people: Person[]): Person[] {
  return people.map(p => {
    if (!p.isAlive || p.relationType === 'pet') return p;
    const newAge = p.age + 1;
    if ((p.relationType === 'mother' || p.relationType === 'father') && newAge > 75) {
      if (Math.random() < 0.08) return { ...p, age: newAge, isAlive: false };
    }
    return { ...p, age: newAge };
  });
}

export interface InteractionResult {
  delta: number;
  message: string;
  bankDelta: number;
  successChance: number;
  failDelta?: number;
  failMessage?: string;
}

export interface RolledInteraction {
  delta: number;
  message: string;
  bankDelta: number;
  success: boolean;
}

const INTERACTIONS: Record<string, InteractionResult> = {
  compliment:    { delta: 10,  message: 'They seemed genuinely touched.',              bankDelta: 0,    successChance: 0.88 },
  conversation:  { delta: 8,   message: 'You caught up over coffee.',                  bankDelta: -500, successChance: 0.82 },
  gift:          { delta: 15,  message: 'They loved your gift.',                       bankDelta: -2000, successChance: 0.75 },
  ask_money:     { delta: -8,  message: 'They lent you money reluctantly.',            bankDelta: 3000, successChance: 0.45, failDelta: -12, failMessage: 'They refused and things got awkward.' },
  insult:        { delta: -20, message: 'That hurt the relationship.',                 bankDelta: 0,    successChance: 0.55, failDelta: -30, failMessage: 'They lashed back — it backfired badly.' },
  cut_off:       { delta: -50, message: 'You decided to distance yourself.',           bankDelta: 0,    successChance: 1.0 },
  movie:         { delta: 6,   message: 'A fun evening out.',                          bankDelta: -1500, successChance: 0.80 },
  apologize:     { delta: 12,  message: 'They appreciated your honesty.',              bankDelta: 0,    successChance: 0.85, failDelta: -5, failMessage: 'They were not ready to forgive yet.' },
};

export function getInteraction(interactionId: string): InteractionResult | null {
  return INTERACTIONS[interactionId] ?? null;
}

export function rollInteraction(interaction: InteractionResult): RolledInteraction {
  const success = Math.random() < interaction.successChance;
  if (success) {
    return {
      delta: interaction.delta,
      message: interaction.message,
      bankDelta: interaction.bankDelta,
      success,
    };
  }
  return {
    delta: interaction.failDelta ?? Math.min(0, interaction.delta - 5),
    message: interaction.failMessage ?? 'It did not go as planned.',
    bankDelta: interaction.bankDelta < 0 ? interaction.bankDelta : 0,
    success,
  };
}

export function getClassmates(people: Person[]): Person[] {
  return people.filter(p => p.relationType === 'classmate' && p.isAlive);
}
