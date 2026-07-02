import { applyLiveOpsWorldEventBoost, hydrateLiveOpsFromConfig } from '@engine/liveOpsEngine';
import { pickWeightedEvents } from '@engine/eventEngine';
import type { LifeEvent } from '@/types';

const sampleEvents: LifeEvent[] = [
  { id: 'world_event_a', title: 'A', description: 'A', category: 'milestone', minAge: 0, maxAge: 99, weight: 10, color: '#F59E0B', statEffect: {}, choices: [] },
  { id: 'other_event', title: 'B', description: 'B', category: 'health', minAge: 0, maxAge: 99, weight: 10, color: '#EF4444', statEffect: {}, choices: [] },
];

describe('applyLiveOpsWorldEventBoost', () => {
  beforeEach(() => {
    hydrateLiveOpsFromConfig({
      season: {
        id: 'test_season',
        title: 'Test',
        description: 'Test',
        activeModifiers: {
          expenseMultiplier: 1,
          maintenanceMultiplier: 1,
          stockReturnBonus: 0,
          healthDrain: 0,
        },
        challenge: {
          id: 'golden_age_challenge',
          title: 'T',
          description: 'D',
          rewardXp: 1,
        },
      },
      worldEvents: ['world_event_a'],
    });
  });

  it('increases pick rate for configured world event IDs', () => {
    const boosted = applyLiveOpsWorldEventBoost(sampleEvents, ['world_event_a']);
    let worldPicks = 0;
    const runs = 500;
    for (let i = 0; i < runs; i += 1) {
      const picked = pickWeightedEvents(boosted, 1)[0];
      if (picked?.id === 'world_event_a') worldPicks += 1;
    }
    expect(worldPicks).toBeGreaterThan(runs * 0.55);
  });

  it('ignores unknown world event IDs safely', () => {
    const boosted = applyLiveOpsWorldEventBoost(sampleEvents, ['missing_event']);
    expect(boosted[0].weight).toBe(10);
    expect(boosted[1].weight).toBe(10);
  });
});
