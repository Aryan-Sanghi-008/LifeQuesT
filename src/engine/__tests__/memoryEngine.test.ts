import {
  addMemoryTag,
  hasMemoryTag,
  filterByMemoryEligibility,
  getChainProgress,
  resolveChoiceMemoryTags,
} from '@engine/memoryEngine';
import { MEMORY_CHAINS } from '@data/memoryChains';
import { createTestCharacter } from '../../test/fixtures/character';
import type { LifeEvent } from '../../types';

describe('memoryEngine', () => {
  describe('addMemoryTag', () => {
    it('deduplicates tags by id', () => {
      const tags = addMemoryTag([], { id: 'test_tag', category: 'event', intensity: 2 }, 20);
      const updated = addMemoryTag(tags, { id: 'test_tag', category: 'event', intensity: 3 }, 21);
      expect(updated).toHaveLength(1);
      expect(updated[0].intensity).toBe(3);
    });
  });

  describe('hasMemoryTag', () => {
    it('respects expiresAtAge', () => {
      const character = createTestCharacter({
        age: 25,
        memoryTags: [{ id: 'old_tag', category: 'event', intensity: 1, age: 20, expiresAtAge: 24 }],
      });
      expect(hasMemoryTag(character, 'old_tag')).toBe(false);
    });
  });

  describe('filterByMemoryEligibility', () => {
    const gatedEvent: LifeEvent = {
      id: 'sequel',
      title: 'Sequel',
      description: '',
      category: 'random',
      color: '#000',
      statEffect: {},
      requiredMemoryTags: ['seed_tag'],
      minAge: 0,
      maxAge: 99,
    };

    it('filters events missing required tags', () => {
      const character = createTestCharacter({ memoryTags: [] });
      expect(filterByMemoryEligibility([gatedEvent], character)).toHaveLength(0);

      const withTag = createTestCharacter({
        memoryTags: [{ id: 'seed_tag', category: 'event', intensity: 2, age: 18 }],
      });
      expect(filterByMemoryEligibility([gatedEvent], withTag)).toHaveLength(1);
    });
  });

  describe('resolveChoiceMemoryTags', () => {
    it('merges choice, event default, and per-choice tags', () => {
      const event: LifeEvent = {
        id: 'e1',
        title: '',
        description: '',
        category: 'random',
        color: '#000',
        statEffect: {},
        grantsMemoryTags: ['default_tag'],
        choiceMemoryTags: { yes: ['choice_tag'] },
        minAge: 0,
        maxAge: 99,
      };
      const tags = resolveChoiceMemoryTags(
        { id: 'yes', text: 'Yes', subtext: '', statEffect: {}, grantsMemoryTags: ['explicit_tag'] },
        event,
      );
      expect(tags).toEqual(expect.arrayContaining(['default_tag', 'choice_tag', 'explicit_tag']));
    });
  });

  describe('memory chains registry', () => {
    it('defines 50 chains with step tags', () => {
      expect(MEMORY_CHAINS).toHaveLength(50);
      for (const chain of MEMORY_CHAINS) {
        expect(chain.steps.length).toBeGreaterThanOrEqual(2);
        expect(chain.steps[0].grantsTag).toBeTruthy();
      }
    });

    it('tracks chain progress from granted tags', () => {
      const chain = MEMORY_CHAINS[0];
      const character = createTestCharacter({
        memoryTags: [{ id: chain.steps[0].grantsTag, category: chain.category, intensity: 2, age: 20 }],
      });
      const progress = getChainProgress(character, chain.id);
      expect(progress.currentStep).toBe(1);
      expect(progress.totalSteps).toBe(chain.steps.length);
    });
  });
});
