import type { Person, PetStats } from '../types';
import { clamp } from './economyEngine';

export type PetCareAction = 'feed' | 'train' | 'vet' | 'play';

export function initPetStats(speciesId = 'dog'): PetStats {
  return { happiness: 70, health: 80, training: 30, speciesId };
}

export function tickPetYear(pet: Person): Person {
  if (pet.relationType !== 'pet' || !pet.petStats) return pet;

  const stats = pet.petStats;
  const next: PetStats = {
    ...stats,
    happiness: clamp(stats.happiness - 5),
    health: clamp(stats.health - 2),
    training: clamp(stats.training - 3),
  };

  if (Math.random() < 0.05 && next.health > 20) {
    next.health = clamp(next.health - 15);
  }

  return { ...pet, petStats: next, mood: next.health < 40 ? 'Unwell' : next.happiness < 30 ? 'Sad' : 'Content' };
}

export function careForPet(pet: Person, action: PetCareAction): Person {
  if (pet.relationType !== 'pet') return pet;
  const stats = pet.petStats ?? initPetStats();

  const deltas: Record<PetCareAction, Partial<PetStats>> = {
    feed: { happiness: 10, health: 5 },
    train: { training: 12, happiness: -2 },
    vet: { health: 25, happiness: -5 },
    play: { happiness: 15, health: 2 },
  };

  const delta = deltas[action];
  const next: PetStats = {
    ...stats,
    happiness: clamp(stats.happiness + (delta.happiness ?? 0)),
    health: clamp(stats.health + (delta.health ?? 0)),
    training: clamp(stats.training + (delta.training ?? 0)),
  };

  return {
    ...pet,
    petStats: next,
    relationshipScore: clamp(pet.relationshipScore + 3),
    mood: 'Happy',
  };
}

export function tickAllPets(people: Person[]): Person[] {
  return people.map(p => (p.relationType === 'pet' ? tickPetYear(p) : p));
}
