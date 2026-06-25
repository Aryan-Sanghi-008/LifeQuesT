import { pickStudyQuestions, gradeStudySession, canStudy } from '@engine/educationEngine';

describe('educationEngine', () => {
  it('picks study questions', () => {
    const qs = pickStudyQuestions(3);
    expect(qs).toHaveLength(3);
  });

  it('grades passing session', () => {
    const qs = pickStudyQuestions(3);
    const answers = qs.map(q => q.correctIndex);
    const result = gradeStudySession(answers, qs, 60, 'secondary');
    expect(result.passed).toBe(true);
    expect(result.intelligenceGain).toBeGreaterThan(0);
  });

  it('canStudy for teen', () => {
    expect(canStudy(16, 'secondary')).toBe(true);
    expect(canStudy(30, 'graduate')).toBe(false);
  });
});
