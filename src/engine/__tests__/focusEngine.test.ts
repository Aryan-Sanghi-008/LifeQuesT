import {
  FOCUS_POINTS_PER_YEAR,
  validateFocusAllocation,
  getAutoChildFocus,
  getFocusCategoryWeight,
  applyFocusEventWeights,
  applyFocusStatModifiers,
  isFocusConfirmedForAge,
} from '@engine/focusEngine';
import { createTestCharacter } from '../../test/fixtures/character';
import type { LifeEvent } from '../../types';

describe('focusEngine', () => {
  describe('validateFocusAllocation', () => {
    it('auto-validates children age 12 and under', () => {
      const result = validateFocusAllocation(10, {});
      expect(result.valid).toBe(true);
      expect(result.normalized).toEqual(getAutoChildFocus({ familyBackground: 'middle' }));
    });

    it('rejects allocations that do not sum to 3', () => {
      expect(validateFocusAllocation(20, { career: 2 }).valid).toBe(false);
      expect(validateFocusAllocation(20, { career: 1, health: 1, social: 1 }).valid).toBe(true);
    });

    it('rejects more than 2 points per domain', () => {
      expect(validateFocusAllocation(20, { career: 3 }).valid).toBe(false);
    });
  });

  describe('getAutoChildFocus', () => {
    it('maps family background to default allocation', () => {
      expect(getAutoChildFocus({ familyBackground: 'poor' })).toEqual({ education: 2, health: 1 });
      expect(sumPoints(getAutoChildFocus({ familyBackground: 'royalty' }))).toBe(FOCUS_POINTS_PER_YEAR);
    });
  });

  describe('getFocusCategoryWeight', () => {
    it('returns higher weight for 2 points than 1', () => {
      expect(getFocusCategoryWeight('career', 2)).toBeGreaterThan(getFocusCategoryWeight('career', 1));
      expect(getFocusCategoryWeight('career', 0)).toBe(1);
    });
  });

  describe('applyFocusEventWeights', () => {
    const careerEvent: LifeEvent = {
      id: 'job_offer',
      title: 'Job Offer',
      description: '',
      category: 'career',
      color: '#000',
      statEffect: {},
      weight: 1,
      minAge: 18,
      maxAge: 65,
    };

    it('boosts career event weight when career focus is allocated', () => {
      const weighted = applyFocusEventWeights([careerEvent], { career: 2, education: 1 });
      expect(weighted[0].weight).toBeGreaterThan(1);
    });

    it('applies aspiration boosts on matching categories', () => {
      const base = applyFocusEventWeights([careerEvent], { health: 1, social: 1, finance: 1 })[0].weight ?? 1;
      const withAspiration = applyFocusEventWeights(
        [careerEvent],
        { health: 1, social: 1, finance: 1 },
        { primary: 'career_peak', secondary: 'knowledge' },
      )[0].weight ?? 1;
      expect(withAspiration).toBeGreaterThan(base);
    });
  });

  describe('applyFocusStatModifiers', () => {
    it('bumps stats based on allocation', () => {
      const stats = createTestCharacter().stats;
      const next = applyFocusStatModifiers(stats, { health: 2, education: 1 });
      expect(next.fitness).toBeGreaterThan(stats.fitness);
      expect(next.intelligence).toBeGreaterThan(stats.intelligence);
    });
  });

  describe('isFocusConfirmedForAge', () => {
    it('auto-confirms for children', () => {
      expect(isFocusConfirmedForAge({ age: 10, focusConfirmedForAge: -1 })).toBe(true);
    });

    it('requires explicit confirmation for teens and adults', () => {
      expect(isFocusConfirmedForAge({ age: 16, focusConfirmedForAge: 15 })).toBe(false);
      expect(isFocusConfirmedForAge({ age: 16, focusConfirmedForAge: 16 })).toBe(true);
    });
  });
});

function sumPoints(allocation: Record<string, number | undefined>): number {
  return Object.values(allocation).reduce<number>((sum, n) => sum + (n ?? 0), 0);
}
