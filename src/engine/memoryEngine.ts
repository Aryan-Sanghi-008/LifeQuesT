import type { Character, EventChoice, LifeEvent, MemoryTag } from '../types';
import { MEMORY_CHAINS, type MemoryChainDef } from '../data/memoryChains';

export function getActiveMemoryTags(
  tags: MemoryTag[] | undefined,
  age: number,
): MemoryTag[] {
  return (tags ?? []).filter(t => t.expiresAtAge === undefined || age <= t.expiresAtAge);
}

export function hasMemoryTag(
  character: Pick<Character, 'memoryTags' | 'age'>,
  tagId: string,
): boolean {
  return getActiveMemoryTags(character.memoryTags, character.age).some(t => t.id === tagId);
}

export function hasAllMemoryTags(
  character: Pick<Character, 'memoryTags' | 'age'>,
  required: string[],
): boolean {
  return required.every(tagId => hasMemoryTag(character, tagId));
}

export function addMemoryTag(
  tags: MemoryTag[] | undefined,
  tag: Omit<MemoryTag, 'age'> & { age?: number },
  age: number,
): MemoryTag[] {
  const next: MemoryTag = { ...tag, age: tag.age ?? age };
  const existing = tags ?? [];
  if (existing.some(t => t.id === next.id)) {
    return existing.map(t => (t.id === next.id ? next : t));
  }
  return [...existing, next];
}

export function addMemoryTags(
  tags: MemoryTag[] | undefined,
  tagIds: string[],
  age: number,
  category = 'event',
  intensity: MemoryTag['intensity'] = 2,
): MemoryTag[] {
  let next = tags ?? [];
  for (const id of tagIds) {
    next = addMemoryTag(next, { id, category, intensity }, age);
  }
  return next;
}

export function filterByMemoryEligibility(
  events: LifeEvent[],
  character: Character,
): LifeEvent[] {
  return events.filter(event => {
    if (event.requiredMemoryTags?.length) {
      if (!hasAllMemoryTags(character, event.requiredMemoryTags)) return false;
    }
    if (event.excludedMemoryTags?.length) {
      if (event.excludedMemoryTags.some(tagId => hasMemoryTag(character, tagId))) return false;
    }
    return true;
  });
}

export function resolveChoiceMemoryTags(
  choice: EventChoice,
  event: LifeEvent,
): string[] {
  const fromChoice = choice.grantsMemoryTags ?? [];
  const fromEvent = event.choiceMemoryTags?.[choice.id] ?? [];
  const defaults = event.grantsMemoryTags ?? [];
  return [...new Set([...fromChoice, ...fromEvent, ...defaults])];
}

export function getChainDef(chainId: string): MemoryChainDef | undefined {
  return MEMORY_CHAINS.find(c => c.id === chainId);
}

export function getChainProgress(
  character: Character,
  chainId: string,
): { completed: boolean; currentStep: number; totalSteps: number } {
  const chain = getChainDef(chainId);
  if (!chain) return { completed: false, currentStep: 0, totalSteps: 0 };

  const completedTags = chain.steps.map(s => s.grantsTag);
  const hasTags = completedTags.filter(tagId => hasMemoryTag(character, tagId));
  const completed = (character.completedMemoryChains ?? []).includes(chainId)
    || hasTags.length >= chain.steps.length;

  return {
    completed,
    currentStep: hasTags.length,
    totalSteps: chain.steps.length,
  };
}

export function markChainComplete(
  completed: string[] | undefined,
  _chainId: string,
  event: LifeEvent,
  character: Character,
): string[] {
  if (!event.chainId) return completed ?? [];
  const chain = getChainDef(event.chainId);
  if (!chain) return completed ?? [];
  const progress = getChainProgress(character, event.chainId);
  if (!progress.completed) return completed ?? [];
  const set = new Set(completed ?? []);
  set.add(event.chainId);
  return [...set];
}
