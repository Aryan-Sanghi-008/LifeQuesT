import {
  getLuckRollBonusPercent,
  getCareerScoreTraitBonus,
  getRelationshipTraitBonus,
  getSocialIncomeTraitMultiplier,
  getStoicMentalHealthDecayMultiplier,
  hasStoicCrimeStressImmunity,
  canSelectTrait,
  isPremiumTrait,
} from '../traitEngine';

describe('traitEngine', () => {
  it('lucky grants +20% roll bonus', () => {
    expect(getLuckRollBonusPercent(['lucky'])).toBe(20);
    expect(getLuckRollBonusPercent(['brilliant'])).toBe(0);
  });

  it('premium lucky career bonus stacks higher than free traits', () => {
    const luckyCareer = getCareerScoreTraitBonus(['lucky']);
    const brilliantCareer = getCareerScoreTraitBonus(['brilliant']);
    expect(luckyCareer).toBeGreaterThan(brilliantCareer);
  });

  it('magnetic grants +15% relationship bonus', () => {
    expect(getRelationshipTraitBonus(['magnetic'])).toBeCloseTo(0.15);
  });

  it('magnetic boosts social income by 20%', () => {
    expect(getSocialIncomeTraitMultiplier(['magnetic'])).toBe(1.2);
  });

  it('stoic reduces mental health decay and grants crime immunity', () => {
    expect(getStoicMentalHealthDecayMultiplier(['stoic'])).toBe(0.5);
    expect(hasStoicCrimeStressImmunity(['stoic'])).toBe(true);
  });

  it('blocks premium traits for non-premium users', () => {
    expect(isPremiumTrait('lucky')).toBe(true);
    expect(canSelectTrait('lucky', false)).toBe(false);
    expect(canSelectTrait('lucky', true)).toBe(true);
    expect(canSelectTrait('brilliant', false)).toBe(true);
  });
});
