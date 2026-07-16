import type { EducationLevel } from '@/types';
import type { EducationStage } from '@/data/educationDegrees';
import {
  advanceEducationByAge,
  tickDegreeEnrollment,
  shouldPromptCollegeMajor,
} from '@engine/educationEngine';
import { clamp } from '@engine/economyEngine';
import type { AgeUpContext } from './types';

export function runEducationStep(ctx: AgeUpContext): void {
  const { character, newAge } = ctx;

  let updatedEducation: EducationLevel = character.educationLevel;
  let updatedEducationStage =
    (character.educationStage as EducationStage | undefined) ?? 'none';

  const eduAdvance = advanceEducationByAge(
    newAge,
    updatedEducationStage,
    updatedEducation,
  );
  if (eduAdvance) {
    updatedEducationStage = eduAdvance.educationStage;
    updatedEducation = eduAdvance.educationLevel;
    if (eduAdvance.milestone) {
      ctx.eduMilestoneRecords.push({
        id: `edu_milestone_${updatedEducationStage}`,
        age: newAge,
        title: eduAdvance.milestone.title,
        description: eduAdvance.milestone.description,
        statEffect: { intelligence: 2 },
        category: 'education',
        color: '#14B8A6',
        timestamp: Date.now(),
      });
    }
  }

  ctx.updatedEducation = updatedEducation;
  ctx.updatedEducationStage = updatedEducationStage;
  ctx.degreeIds = [...(character.degreeIds ?? [])];
  ctx.enrolledDegreeId = character.enrolledDegreeId;
  ctx.enrolledDegreeYearsRemaining = character.enrolledDegreeYearsRemaining;
  ctx.educationBranch = character.educationBranch;
  ctx.scholarshipDiscount = character.scholarshipDiscount;
  ctx.educationMajorSkipped = character.educationMajorSkipped;

  if (character.enrolledDegreeId) {
    const degreeTick = tickDegreeEnrollment({
      ...character,
      bankBalance: ctx.bankBalance,
      debt: ctx.debt,
      enrolledDegreeYearsRemaining: ctx.enrolledDegreeYearsRemaining,
      degreeIds: ctx.degreeIds,
      educationStage: updatedEducationStage,
      educationLevel: updatedEducation,
      age: newAge,
      scholarshipDiscount: ctx.scholarshipDiscount,
    });
    if (degreeTick.tuitionPaid > 0) {
      ctx.pushCash(-degreeTick.tuitionPaid, 'tuition', 'Degree tuition');
      if ((ctx.scholarshipDiscount ?? 0) > 0) {
        ctx.scholarshipDiscount = undefined;
      }
    }
    if (degreeTick.graduated && degreeTick.graduation?.ok) {
      if (degreeTick.degreeId && !ctx.degreeIds.includes(degreeTick.degreeId)) {
        ctx.degreeIds.push(degreeTick.degreeId);
      }
      if (degreeTick.newEducationLevel) ctx.updatedEducation = degreeTick.newEducationLevel;
      if (degreeTick.newStage) ctx.updatedEducationStage = degreeTick.newStage;
      if (degreeTick.educationBranch) ctx.educationBranch = degreeTick.educationBranch;
      if (degreeTick.intelligenceGain) {
        ctx.stats.intelligence = clamp(ctx.stats.intelligence + degreeTick.intelligenceGain);
      }
      ctx.enrolledDegreeId = undefined;
      ctx.enrolledDegreeYearsRemaining = undefined;
      ctx.eduMilestoneRecords.push({
        id: `degree_grad_${degreeTick.degreeId}_${newAge}`,
        age: newAge,
        title: 'Graduation',
        description: degreeTick.graduation.message,
        statEffect: { intelligence: degreeTick.intelligenceGain ?? 2 },
        category: 'education',
        color: '#14B8A6',
        timestamp: Date.now(),
      });
    } else if (degreeTick.yearsRemaining !== undefined) {
      ctx.enrolledDegreeYearsRemaining = degreeTick.yearsRemaining;
    }
  }

  ctx.collegeMajorPickNeeded = shouldPromptCollegeMajor({
    age: newAge,
    educationStage: ctx.updatedEducationStage,
    enrolledDegreeId: ctx.enrolledDegreeId,
    degreeIds: ctx.degreeIds,
    educationMajorSkipped: ctx.educationMajorSkipped,
  });
}
