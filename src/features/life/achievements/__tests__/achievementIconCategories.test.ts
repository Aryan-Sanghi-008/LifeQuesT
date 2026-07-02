import { ACHIEVEMENTS } from '@data/achievements';
import {
  getAchievementIconCategory,
  AchievementIconCategory,
} from '../achievementIconCategories';

describe('achievementIconCategories', () => {
  it('maps known achievements to expected categories', () => {
    expect(getAchievementIconCategory('millionaire')).toBe('wealth');
    expect(getAchievementIconCategory('genius')).toBe('mind');
    expect(getAchievementIconCategory('fitness_buff')).toBe('health');
    expect(getAchievementIconCategory('married_life')).toBe('social');
    expect(getAchievementIconCategory('entrepreneur')).toBe('career');
    expect(getAchievementIconCategory('parent_hood')).toBe('family');
    expect(getAchievementIconCategory('globetrotter')).toBe('adventure');
    expect(getAchievementIconCategory('saint')).toBe('legacy');
  });

  it('covers every achievement id with a valid category', () => {
    const categories = new Set<AchievementIconCategory>();
    for (const ach of ACHIEVEMENTS) {
      const cat = getAchievementIconCategory(ach.id);
      categories.add(cat);
      expect(['wealth', 'mind', 'health', 'social', 'career', 'family', 'adventure', 'legacy']).toContain(cat);
    }
    expect(categories.size).toBeGreaterThanOrEqual(8);
  });
});
