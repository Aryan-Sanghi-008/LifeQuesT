import {
  needsAspirationPick,
  validateAspirations,
  getAspirationWeightBoost,
} from '@engine/aspirationEngine';
import type { LifeEvent } from '../../types';

describe('aspirationEngine', () => {
  describe('needsAspirationPick', () => {
    it('requires pick at 16 without aspirations', () => {
      expect(needsAspirationPick({ age: 16, aspirations: undefined })).toBe(true);
      expect(needsAspirationPick({ age: 15, aspirations: undefined })).toBe(false);
      expect(needsAspirationPick({
        age: 16,
        aspirations: { primary: 'fortune', secondary: 'knowledge' },
      })).toBe(false);
    });
  });

  describe('validateAspirations', () => {
    it('rejects identical primary and secondary', () => {
      expect(validateAspirations('fortune', 'fortune').valid).toBe(false);
    });

    it('accepts distinct valid aspirations', () => {
      expect(validateAspirations('career_peak', 'quiet_life').valid).toBe(true);
    });
  });

  describe('getAspirationWeightBoost', () => {
    const careerEvent: LifeEvent = {
      id: 'promotion',
      title: '',
      description: '',
      category: 'career',
      color: '#000',
      statEffect: {},
      minAge: 18,
      maxAge: 65,
    };

    it('returns 1 without aspirations', () => {
      expect(getAspirationWeightBoost(careerEvent, undefined)).toBe(1);
    });

    it('boosts matching primary and secondary categories', () => {
      const boost = getAspirationWeightBoost(careerEvent, {
        primary: 'career_peak',
        secondary: 'knowledge',
      });
      expect(boost).toBeCloseTo(1.3 * 1, 5);
    });
  });
});
