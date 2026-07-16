import {
  pickStudyQuestions, gradeStudySession, canStudy,
  advanceEducationByAge, getEducationLabel, resolveEducationLevelForDisplay,
  resolveEducationTrackForDisplay, advanceEducation,
  shouldPromptCollegeMajor, getEnrollableDegrees, findNextGraduateProgram,
  studyQuizRewards, enrollInProgram, tickDegreeEnrollment,
} from '@engine/educationEngine';
import { getDegreesForCountry } from '@data/educationDegrees';

describe('educationEngine', () => {
  it('picks study questions', () => {
    const qs = pickStudyQuestions(3);
    expect(qs).toHaveLength(3);
  });

  it('grades passing session', () => {
    const qs = pickStudyQuestions(3);
    const answers = qs.map(q => q.correctIndex);
    const result = gradeStudySession(answers, qs, 60);
    expect(result.passed).toBe(true);
    expect(result.intelligenceGain).toBeGreaterThan(0);
    expect('educationUnlock' in result).toBe(false);
  });

  it('canStudy for teen through bachelor/masters; blocks phd and age out', () => {
    expect(canStudy(16, 'secondary')).toBe(true);
    expect(canStudy(26, 'graduate', 'undergraduate')).toBe(true);
    expect(canStudy(28, 'graduate', 'masters')).toBe(true);
    expect(canStudy(28, 'graduate', 'phd')).toBe(false);
    expect(canStudy(31, 'graduate', 'undergraduate')).toBe(false);
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

  it('advanceEducationByAge freezes at high_school after 18 (no auto university)', () => {
    expect(advanceEducationByAge(18, 'high_school', 'secondary')).toBeNull();
    expect(advanceEducationByAge(25, 'high_school', 'secondary')).toBeNull();
  });

  it('advanceEducationByAge does not downgrade', () => {
    expect(advanceEducationByAge(12, 'undergraduate', 'university')).toBeNull();
  });

  it('getEducationLabel prefers enrolled program then graduate after bachelor', () => {
    expect(getEducationLabel('high_school', 'none')).toBe('High School');
    expect(getEducationLabel('none', 'university')).toBe('University');
    expect(getEducationLabel('high_school', 'secondary', 'bsc_cs')).toBe('University');
    expect(getEducationLabel('undergraduate', 'graduate')).toBe('Graduate');
    expect(getEducationLabel('undergraduate', 'graduate', 'msc_cs')).toBe('Masters');
  });

  it('resolveEducationLevelForDisplay uses higher of stage vs level', () => {
    expect(resolveEducationLevelForDisplay('high_school', 'none')).toBe('secondary');
    expect(resolveEducationLevelForDisplay('none', 'university')).toBe('university');
  });

  it('resolveEducationTrackForDisplay: enroll university → graduate idle → postgrad → graduate', () => {
    expect(
      resolveEducationTrackForDisplay('high_school', 'secondary', 'bsc_cs'),
    ).toBe('university');
    expect(
      resolveEducationTrackForDisplay('undergraduate', 'graduate'),
    ).toBe('graduate');
    expect(
      resolveEducationTrackForDisplay('undergraduate', 'graduate', 'msc_cs'),
    ).toBe('postgrad');
    expect(
      resolveEducationTrackForDisplay('masters', 'graduate'),
    ).toBe('graduate');
  });

  it('advanceEducation sets graduate level after bachelor', () => {
    const result = advanceEducation(
      {
        age: 22,
        educationLevel: 'university',
        educationStage: 'undergraduate',
        degreeIds: [],
        stats: {
          health: 70, happiness: 70, intelligence: 80, wealth: 50,
          fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
        },
      },
      'bsc_cs',
    );
    expect(result.ok).toBe(true);
    expect(result.newStage).toBe('undergraduate');
    expect(result.newEducationLevel).toBe('graduate');
  });

  it('shouldPromptCollegeMajor at 18 high school without enrollment', () => {
    expect(shouldPromptCollegeMajor({
      age: 18,
      educationStage: 'high_school',
      enrolledDegreeId: undefined,
      degreeIds: [],
    })).toBe(true);
  });

  it('shouldPromptCollegeMajor false after skip or enroll', () => {
    expect(shouldPromptCollegeMajor({
      age: 25,
      educationStage: 'high_school',
      degreeIds: [],
      educationMajorSkipped: true,
    })).toBe(false);
    expect(shouldPromptCollegeMajor({
      age: 19,
      educationStage: 'high_school',
      enrolledDegreeId: 'bsc_cs',
      degreeIds: [],
    })).toBe(false);
  });

  it('getEnrollableDegrees prefers country-priority programs first', () => {
    const inDegrees = getEnrollableDegrees({
      age: 18,
      educationLevel: 'secondary',
      educationStage: 'high_school',
      degreeIds: [],
      gpa: 3.5,
      countryCode: 'IN',
    });
    const usSorted = getDegreesForCountry('US');
    const inSorted = getDegreesForCountry('IN');
    expect(inSorted[0]?.id).toBe('be_civil');
    expect(usSorted[0]?.id).toBe('bsc_cs');
    expect(inDegrees.some((d) => d.id === 'bsc_cs' || d.id === 'be_civil')).toBe(true);
  });

  it('studyQuizRewards never imply a degree grant', () => {
    const pass = studyQuizRewards(true);
    expect(pass.gpaBump).toBeGreaterThan(0);
    expect(pass.scholarshipDiscount).toBeGreaterThan(0);
    expect(Object.keys(pass)).toEqual(['gpaBump', 'scholarshipDiscount']);
  });

  it('enroll raises stage/level immediately; ticks graduate to graduate level; findNextGraduateProgram is manual only', () => {
    const stats = {
      health: 70, happiness: 70, intelligence: 80, wealth: 50,
      fitness: 60, looks: 60, social: 50, ambition: 50, mentalHealth: 70,
    };
    const base = {
      age: 22,
      educationLevel: 'secondary' as const,
      educationStage: 'high_school' as const,
      degreeIds: [] as string[],
      gpa: 3.5,
      countryCode: 'US',
      stats,
      bankBalance: 200000,
      debt: 0,
    };
    const enroll = enrollInProgram(base, 'bsc_cs');
    expect(enroll.ok).toBe(true);
    expect(enroll.newStage).toBe('undergraduate');
    expect(enroll.newEducationLevel).toBe('university');
    expect(
      resolveEducationTrackForDisplay(
        enroll.newStage,
        enroll.newEducationLevel,
        'bsc_cs',
      ),
    ).toBe('university');

    let years = enroll.durationYears ?? 4;
    let stage: string = enroll.newStage ?? base.educationStage;
    let level: string = enroll.newEducationLevel ?? base.educationLevel;
    let degrees = [...base.degreeIds];
    let branch: string | undefined;
    for (let i = 0; i < 6 && years > 0; i++) {
      const tick = tickDegreeEnrollment({
        ...base,
        age: 22 + i,
        educationStage: stage as typeof base.educationStage,
        educationLevel: level as typeof base.educationLevel,
        degreeIds: degrees,
        enrolledDegreeId: 'bsc_cs',
        enrolledDegreeYearsRemaining: years,
        bankBalance: 200000,
      });
      years = tick.yearsRemaining ?? 0;
      if (tick.newStage) stage = tick.newStage;
      if (tick.newEducationLevel) level = tick.newEducationLevel;
      if (tick.graduated && tick.degreeId) {
        degrees = [...degrees, tick.degreeId];
        branch = tick.educationBranch;
      }
    }
    expect(stage).toBe('undergraduate');
    expect(level).toBe('graduate');
    expect(degrees).toContain('bsc_cs');
    expect(resolveEducationTrackForDisplay(stage, level as 'graduate')).toBe('graduate');

    const next = findNextGraduateProgram(
      {
        ...base,
        age: 26,
        educationStage: 'undergraduate',
        educationLevel: 'graduate',
        degreeIds: degrees,
        educationBranch: branch ?? 'engineering',
      },
      'undergraduate',
      branch ?? 'engineering',
    );
    expect(next?.id).toBe('msc_cs');

    const mastersEnroll = enrollInProgram(
      {
        ...base,
        age: 26,
        educationStage: 'undergraduate',
        educationLevel: 'graduate',
        degreeIds: degrees,
      },
      'msc_cs',
    );
    expect(mastersEnroll.ok).toBe(true);
    expect(mastersEnroll.newStage).toBe('masters');
    expect(mastersEnroll.newEducationLevel).toBe('graduate');
    expect(
      resolveEducationTrackForDisplay(
        mastersEnroll.newStage,
        mastersEnroll.newEducationLevel,
        'msc_cs',
      ),
    ).toBe('postgrad');
  });
});
