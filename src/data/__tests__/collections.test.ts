import { LIFE_MOMENT_COUNT, ALL_COLLECTION_ITEMS } from '../collections';
import { COLLECTION_SETS } from '../collections/sets';
import { hydrateUnlockedCollectionIds } from '../collections';

describe('collections catalog', () => {
  it('has 150 life moment items', () => {
    expect(LIFE_MOMENT_COUNT).toBe(150);
    const moments = ALL_COLLECTION_ITEMS.filter((i) => i.category === 'life_moment');
    expect(moments.length).toBe(150);
  });

  it('has 15 collection sets', () => {
    expect(COLLECTION_SETS.length).toBe(15);
  });

  it('each set has 10 life moments', () => {
    for (const set of COLLECTION_SETS) {
      const count = ALL_COLLECTION_ITEMS.filter((i) => i.setId === set.id).length;
      expect(count).toBe(10);
    }
  });
});

describe('hydrateUnlockedCollectionIds', () => {
  it('maps achievements to achievement_* ids', () => {
    const ids = hydrateUnlockedCollectionIds({
      achievements: ['first_job', 'millionaire'],
      unlockedAvatarStyles: [],
    });
    expect(ids).toContain('achievement_first_job');
    expect(ids).toContain('achievement_millionaire');
  });

  it('maps unlockedAvatarStyles to cosmetic_* ids (replacing hyphens)', () => {
    const ids = hydrateUnlockedCollectionIds({
      achievements: [],
      unlockedAvatarStyles: ['adventurer', 'big-smile', 'lorelei-neutral'],
    });
    expect(ids).toContain('cosmetic_adventurer');
    expect(ids).toContain('cosmetic_big_smile');
    expect(ids).toContain('cosmetic_lorelei_neutral');
  });

  it('always unlocks scenario_classic', () => {
    const ids = hydrateUnlockedCollectionIds({ achievements: [] });
    expect(ids).toContain('scenario_classic');
  });

  it('unlocks badge_streak_7 at 7 days', () => {
    const ids = hydrateUnlockedCollectionIds({ achievements: [], dailyStreak: 7 });
    expect(ids).toContain('badge_streak_7');
  });
});
