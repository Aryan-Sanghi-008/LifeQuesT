import { StateCreator } from 'zustand';
import { GameStore } from '@store/types';
import {
  canStudy,
  pickStudyQuestions,
  gradeStudySession,
  advanceEducation,
  enrollInProgram,
  StudyQuestion,
  StudySessionResult,
  studyQuizRewards,
} from '@engine/educationEngine';
import { scaleEducationCost } from '@engine/countryScaleEngine';
import { applyCashDelta, clamp } from '@engine/economyEngine';
import { appendFinanceLedger, createLedgerEntry } from '@engine/financeLedgerEngine';
import { getDegreeById } from '@/data/educationDegrees';
import { getCountryEconomy, getMaxPersonalDebtForCharacter } from '@/data/countryEconomy';
import {
  checkCertificationEligibility,
  rollCertificationExam,
} from '@engine/certificationEngine';
import { pickDailyQuests, updateQuestProgress } from '@engine/questEngine';
import { setDailyQuestsProgress } from '@services/persistence';

export interface EducationProgressSlice {
  studyQuestions: StudyQuestion[] | null;
  startStudySession: () => StudyQuestion[];
  completeStudySession: (answers: number[]) => StudySessionResult;
  grantDegree: (degreeId: string) => { ok: boolean; message: string };
  enrollInDegree: (degreeId: string) => { ok: boolean; message: string };
  chooseCollegeMajor: (degreeIdOrSkip: string | 'skip') => { ok: boolean; message: string };
  applyStudyQuizRewards: (passed: boolean) => { ok: boolean; message: string };
  takeCertificationExam: (certId: string) => { ok: boolean; message: string };
}

export const createEducationProgressSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  EducationProgressSlice
> = (set, get) => ({
  studyQuestions: null,

  startStudySession: () => {
    const { character } = get();
    if (
      !character ||
      !canStudy(character.age, character.educationLevel, character.educationStage)
    ) {
      return [];
    }
    const questions = pickStudyQuestions(3);
    set((s) => {
      s.studyQuestions = questions;
    });
    return questions;
  },

  completeStudySession: (answers) => {
    const { character, studyQuestions } = get();
    const empty: StudySessionResult = {
      score: 0,
      totalQuestions: 0,
      passed: false,
      intelligenceGain: 0,
      mentalHealthGain: 0,
    };
    if (!character || !studyQuestions?.length) return empty;

    const result = gradeStudySession(
      answers,
      studyQuestions,
      character.stats.intelligence,
    );

    set((s) => {
      if (!s.character) return;
      s.character.stats.intelligence = clamp(
        s.character.stats.intelligence + result.intelligenceGain,
      );
      s.character.stats.mentalHealth = clamp(
        s.character.stats.mentalHealth + result.mentalHealthGain,
      );
      s.studyQuestions = null;
    });

    const today = new Date().toISOString().slice(0, 10);
    const quests = get().dailyQuests.length
      ? get().dailyQuests
      : pickDailyQuests(today);
    const updated = updateQuestProgress(quests, 'study_session', 1);
    setDailyQuestsProgress(today, JSON.stringify(updated));
    set((s) => {
      s.dailyQuests = updated;
    });
    get().addSeasonXp(result.passed ? 25 : 5);
    get()._checkAchievements();
    void get()._persist();
    return result;
  },

  grantDegree: (degreeId) => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No character.' };
    if ((character.degreeIds ?? []).includes(degreeId)) {
      return { ok: false, message: 'You already have this degree.' };
    }
    if (character.enrolledDegreeId && character.enrolledDegreeId !== degreeId) {
      return {
        ok: false,
        message: 'You are enrolled in a different program. Finish or re-enroll.',
      };
    }

    const advResult = advanceEducation(character, degreeId);
    if (!advResult.ok || !advResult.degreeEarned) {
      return { ok: false, message: advResult.message };
    }

    const degree = advResult.degreeEarned;
    const alreadyEnrolled = character.enrolledDegreeId === degreeId;

    set((s) => {
      if (!s.character) return;
      if (!s.character.degreeIds) s.character.degreeIds = [];
      if (!s.character.degreeIds.includes(degreeId)) {
        s.character.degreeIds.push(degreeId);
      }
      if (advResult.newStage) s.character.educationStage = advResult.newStage;
      s.character.educationBranch = degree.branch;
      if (advResult.newEducationLevel) {
        s.character.educationLevel = advResult.newEducationLevel;
      }
      if (advResult.intelligenceGain) {
        s.character.stats.intelligence = clamp(
          s.character.stats.intelligence + advResult.intelligenceGain,
        );
      }
      if (!alreadyEnrolled) {
        const tuition = scaleEducationCost(degree.baseAnnualCost, s.character.countryCode);
        const cash = applyCashDelta(
          s.character.bankBalance,
          s.character.debt ?? 0,
          -tuition,
        );
        s.character.bankBalance = cash.bankBalance;
        s.character.debt = cash.debt;
      }
      s.character.enrolledDegreeId = undefined;
    });

    void get()._persist();
    return { ok: true, message: advResult.message };
  },

  enrollInDegree: (degreeId) => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No character.' };

    if (character.enrolledDegreeId === degreeId) {
      return { ok: true, message: 'Already enrolled in this program.' };
    }

    const enrollResult = enrollInProgram(character, degreeId);
    if (!enrollResult.ok) {
      return { ok: false, message: enrollResult.message };
    }

    const eco = getCountryEconomy(character.countryCode);
    const tuition = scaleEducationCost(enrollResult.annualCost ?? 0, character.countryCode);
    const maxDebt = getMaxPersonalDebtForCharacter(character);
    const totalDebt = (character.debt ?? 0) + Math.max(0, tuition - character.bankBalance);
    if (tuition > 0 && totalDebt > maxDebt) {
      return {
        ok: false,
        message: `Insufficient funds. Tuition is ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.`,
      };
    }

    set((s) => {
      if (!s.character) return;
      const debtBefore = s.character.debt ?? 0;
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -tuition,
      );
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      if (tuition > 0) {
        s.character.financeLedger = appendFinanceLedger(
          s.character.financeLedger,
          createLedgerEntry({
            age: s.character.age,
            category: 'tuition',
            label: 'Degree enrollment tuition',
            amount: -tuition,
            bankAfter: cash.bankBalance,
            debtAfter: cash.debt,
            debtBefore,
          }),
        );
      }
      s.character.enrolledDegreeId = degreeId;
      s.character.enrolledDegreeYearsRemaining = enrollResult.durationYears;
      s.character.enrolledSinceAge = s.character.age;
      const degree = getDegreeById(degreeId);
      if (degree) {
        s.character.educationBranch = degree.branch;
      }
      if (enrollResult.newStage) {
        s.character.educationStage = enrollResult.newStage;
      }
      if (enrollResult.newEducationLevel) {
        s.character.educationLevel = enrollResult.newEducationLevel;
      }
      s.character.educationMajorSkipped = false;
      s.pendingCollegeMajorPicker = false;
    });

    void get()._persist();
    return {
      ok: true,
      message: `${enrollResult.message} Tuition paid: ${eco.currencySymbol}${tuition.toLocaleString(eco.currencyLocale)}.`,
    };
  },

  chooseCollegeMajor: (degreeIdOrSkip) => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No character.' };

    if (degreeIdOrSkip === 'skip') {
      set((s) => {
        if (!s.character) return;
        s.character.educationMajorSkipped = true;
        s.pendingCollegeMajorPicker = false;
      });
      void get()._persist();
      return {
        ok: true,
        message: 'You skipped college for now. You can enroll later from Study.',
      };
    }

    const result = get().enrollInDegree(degreeIdOrSkip);
    if (result.ok) {
      set((s) => {
        s.pendingCollegeMajorPicker = false;
        if (s.character) s.character.educationMajorSkipped = false;
      });
    }
    return result;
  },

  applyStudyQuizRewards: (passed) => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No character.' };
    const rewards = studyQuizRewards(passed);
    set((s) => {
      if (!s.character) return;
      const gpa = s.character.gpa ?? 2.5;
      s.character.gpa = Math.min(4, Math.round((gpa + rewards.gpaBump) * 100) / 100);
      if (rewards.scholarshipDiscount > 0) {
        s.character.scholarshipDiscount = Math.max(
          s.character.scholarshipDiscount ?? 0,
          rewards.scholarshipDiscount,
        );
      }
    });
    void get()._persist();
    return {
      ok: true,
      message: passed
        ? `GPA +${rewards.gpaBump.toFixed(2)}. ${Math.round(rewards.scholarshipDiscount * 100)}% scholarship on next tuition.`
        : `Small GPA bump (+${rewards.gpaBump.toFixed(2)}). Keep studying!`,
    };
  },

  takeCertificationExam: (certId) => {
    const { character } = get();
    if (!character) return { ok: false, message: 'No character.' };

    const eligibility = checkCertificationEligibility(character, certId);
    if (!eligibility.eligible) {
      return {
        ok: false,
        message: eligibility.reason ?? 'Not eligible for this exam.',
      };
    }

    const certProjectedDebt = (character.debt ?? 0) + Math.max(0, eligibility.cost - character.bankBalance);
    if (certProjectedDebt > getMaxPersonalDebtForCharacter(character)) {
      const eco = getCountryEconomy(character.countryCode);
      return {
        ok: false,
        message: `Insufficient funds. Exam fee is ${eco.currencySymbol}${eligibility.cost.toLocaleString(eco.currencyLocale)}.`,
      };
    }

    const exam = rollCertificationExam(character, certId);
    set((s) => {
      if (!s.character) return;
      const cash = applyCashDelta(
        s.character.bankBalance,
        s.character.debt ?? 0,
        -eligibility.cost,
      );
      s.character.bankBalance = cash.bankBalance;
      s.character.debt = cash.debt;
      if (exam.passed) {
        if (!s.character.certificationIds) s.character.certificationIds = [];
        if (!s.character.certificationIds.includes(certId)) {
          s.character.certificationIds.push(certId);
        }
        s.character.stats.intelligence = clamp(
          s.character.stats.intelligence + 2,
        );
      }
    });

    void get()._persist();
    return { ok: exam.passed, message: exam.message };
  },
});
