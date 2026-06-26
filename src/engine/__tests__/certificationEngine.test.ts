import {
  checkCertificationEligibility,
  rollCertificationExam,
  inferContextualCertification,
} from '@engine/certificationEngine';
import { createTestCharacter } from '../../test/fixtures/character';

describe('certificationEngine', () => {
  it('rejects exam when intelligence too low', () => {
    const char = createTestCharacter({ age: 25, stats: { ...createTestCharacter().stats, intelligence: 50 } });
    const result = checkCertificationEligibility(char, 'bar_exam');
    expect(result.eligible).toBe(false);
  });

  it('allows eligible character to see exam cost', () => {
    const char = createTestCharacter({ age: 25, stats: { ...createTestCharacter().stats, intelligence: 80 } });
    const result = checkCertificationEligibility(char, 'bar_exam');
    expect(result.eligible).toBe(true);
    expect(result.cost).toBeGreaterThan(0);
  });

  it('rollCertificationExam always passes with rng=0', () => {
    const char = createTestCharacter({ stats: { ...createTestCharacter().stats, intelligence: 90 } });
    const result = rollCertificationExam(char, 'bar_exam', () => 0);
    expect(result.passed).toBe(true);
  });

  it('infers bar exam from law degree', () => {
    expect(inferContextualCertification(['llb'], [])).toBe('bar_exam');
    expect(inferContextualCertification(['bsc_cs'], [])).toBeNull();
  });
});
