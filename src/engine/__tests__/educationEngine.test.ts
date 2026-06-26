import {
  pickStudyQuestions, gradeStudySession, canStudy,
  advanceEducationByAge, getEducationLabel, resolveEducationLevelForDisplay,
} from '@engine/educationEngine';

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

  it('advanceEducationByAge promotes at age milestones', () => {
    const at5 = advanceEducationByAge(5, 'none', 'none');
    expect(at5?.educationStage).toBe('primary');
    expect(at5?.educationLevel).toBe('elementary');
    expect(at5?.milestone?.title).toContain('Primary');

    const at12 = advanceEducationByAge(12, 'primary', 'elementary');
    expect(at12?.educationStage).toBe('middle_school');

    const at18 = advanceEducationByAge(18, 'middle_school', 'secondary');
    expect(at18?.educationStage).toBe('high_school');
  });

  it('advanceEducationByAge does not downgrade', () => {
    expect(advanceEducationByAge(12, 'undergraduate', 'university')).toBeNull();
  });

  it('getEducationLabel prefers stage', () => {
    expect(getEducationLabel('high_school', 'none')).toBe('High School');
    expect(getEducationLabel('none', 'university')).toBe('University');
  });

  it('resolveEducationLevelForDisplay uses higher of stage vs level', () => {
    expect(resolveEducationLevelForDisplay('high_school', 'none')).toBe('secondary');
    expect(resolveEducationLevelForDisplay('none', 'university')).toBe('university');
  });
});
