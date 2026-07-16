import { incrementCareerYear, getPromotionTarget } from '@engine/careerEngine';
import { tickAllBusinesses } from '@engine/businessEngine';
import { tickAnnualEconomy } from '@engine/economyEngine';
import { resolveEquippedPerks } from '@engine/equippedPerksEngine';
import { getCurrentSeason } from '@engine/liveOpsEngine';
import type { AgeUpContext } from './types';

export function runIncomeStep(ctx: AgeUpContext): void {
  const { character, newAge } = ctx;
  ctx.equippedEffects = resolveEquippedPerks(character);

  let businesses = character.businesses ?? [];
  if (businesses.length > 0) {
    const bizTick = tickAllBusinesses(businesses);
    businesses = bizTick.businesses;
    let totalProfit = bizTick.totalProfit;
    if (ctx.equippedEffects.incomeBonusPct > 0 && totalProfit > 0) {
      totalProfit = Math.round(totalProfit * (1 + ctx.equippedEffects.incomeBonusPct));
    }
    if (totalProfit !== 0) {
      ctx.pushCash(
        totalProfit,
        'business',
        totalProfit >= 0 ? 'Business profit' : 'Business loss',
      );
    }
  }
  ctx.businesses = businesses;

  let career = character.career ? incrementCareerYear(character.career) : null;
  if (career && ctx.equippedEffects.careerPerfBonus > 0) {
    career = {
      ...career,
      performance: Math.min(
        100,
        career.performance + Math.round(ctx.equippedEffects.careerPerfBonus * 100),
      ),
    };
  }
  ctx.career = career;
  ctx.totalCareerYears = character.totalCareerYears ?? 0;
  if (character.career) ctx.totalCareerYears += 1;

  ctx.promotionOfferNeeded = Boolean(career && getPromotionTarget(career));
  ctx.salary = career?.salary ?? 0;
  ctx.liveOps = getCurrentSeason().activeModifiers;

  ctx.economy = tickAnnualEconomy(
    newAge,
    ctx.bankBalance,
    ctx.debt,
    ctx.salary,
    character.assets,
    ctx.countryCode,
  );

  if (ctx.economy.salaryNet > 0) {
    ctx.pushCash(ctx.economy.salaryNet, 'salary', 'Net salary');
  }
  if (ctx.economy.livingExpenses > 0) {
    let living = ctx.economy.livingExpenses;
    if (ctx.equippedEffects.expenseReducePct > 0) {
      living = Math.round(living * (1 - ctx.equippedEffects.expenseReducePct));
    }
    ctx.pushCash(-living, 'living', 'Living expenses');
    ctx.economy.livingExpenses = living;
  }
  ctx.economy.bankBalance = ctx.bankBalance;
  ctx.economy.debt = ctx.debt;

  if (ctx.liveOps.expenseMultiplier !== 1.0 && ctx.economy.livingExpenses > 0) {
    const originalLivingExpenses = ctx.economy.livingExpenses;
    const adjustedExpenses = Math.round(
      originalLivingExpenses * ctx.liveOps.expenseMultiplier,
    );
    const extraExpense = adjustedExpenses - originalLivingExpenses;
    if (extraExpense > 0) {
      ctx.pushCash(-extraExpense, 'living', 'Season living-cost surge');
    }
    ctx.economy.livingExpenses = adjustedExpenses;
  }

  if (ctx.worldModifiers.taxRateDelta !== 0 && ctx.salary > 0) {
    const extraTax = Math.round(ctx.salary * ctx.worldModifiers.taxRateDelta);
    ctx.economy.taxPaid += extraTax;
    ctx.economy.salaryNet = Math.max(0, ctx.economy.salaryNet - extraTax);
    if (extraTax > 0) {
      ctx.pushCash(-extraTax, 'other', 'Extra world-event tax');
    }
  }
}
