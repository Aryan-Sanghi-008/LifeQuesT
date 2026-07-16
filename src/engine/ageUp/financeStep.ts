import { getLifeExpectancy } from '@/data/countryEconomy';
import { PROPERTY_MAP } from '@/data/properties';
import { totalAnnualPremiums, applyInsuranceCoverage } from '@/data/insurancePolicies';
import { clamp, checkDebtCrisis } from '@engine/economyEngine';
import { scaleCountryAmount } from '@engine/countryScaleEngine';
import {
  getAnnualMortgagePayments,
  getPropertyMaintenanceCost,
  getAnnualRentalIncome,
  tickPropertyYear,
  rollPropertyDisaster,
} from '@engine/housingEngine';
import {
  tickVehicleYear,
  tickCatalogInvestment,
  tickCollectibleYear,
} from '@engine/assetCatalogEngine';
import { tickMarketHoldings, tickAngelStake } from '@engine/marketEngine';
import { runAnnualSimulation } from '@engine/simulationEngine';
import { computeDeathChance } from '@engine/mortalityEngine';
import type { AgeUpContext } from './types';

export function runFinanceStep(ctx: AgeUpContext): void {
  const { character, newAge, countryCode } = ctx;

  const insurancePremiums = totalAnnualPremiums(character.insurancePolicies);
  if (insurancePremiums > 0) {
    ctx.pushCash(-insurancePremiums, 'other', 'Insurance premiums');
  }

  if (Math.random() < 0.08 + Math.max(0, (50 - ctx.stats.health) / 400)) {
    const medicalBill = scaleCountryAmount(8_000 + Math.random() * 22_000, countryCode, 'cost');
    const { coveredLoss, payout } = applyInsuranceCoverage(
      character.insurancePolicies,
      'health',
      medicalBill,
    );
    ctx.pushCash(-coveredLoss, 'other', 'Medical expenses');
    if (payout > 0) ctx.pushCash(payout, 'other', 'Health insurance payout');
    ctx.claimLogs.push(
      payout > 0
        ? `Hospital stay — insurance covered ${Math.round((payout / medicalBill) * 100)}% of the bill.`
        : 'Hospital stay — paid medical expenses out of pocket.',
    );
    ctx.stats = { ...ctx.stats, health: clamp(ctx.stats.health - 4), happiness: clamp(ctx.stats.happiness - 2) };
  }
  if (character.assets.some((a) => a.type === 'vehicle') && Math.random() < 0.06) {
    const crashLoss = scaleCountryAmount(5_000 + Math.random() * 25_000, countryCode, 'cost');
    const { coveredLoss, payout } = applyInsuranceCoverage(
      character.insurancePolicies,
      'auto',
      crashLoss,
    );
    ctx.pushCash(-coveredLoss, 'other', 'Vehicle accident costs');
    if (payout > 0) ctx.pushCash(payout, 'other', 'Auto insurance payout');
    ctx.claimLogs.push(
      payout > 0
        ? `Car accident — auto insurance paid out on repairs.`
        : 'Car accident — repair costs hit your wallet.',
    );
    ctx.stats = { ...ctx.stats, health: clamp(ctx.stats.health - 3), happiness: clamp(ctx.stats.happiness - 3) };
  }

  ctx.assets = character.assets.map((a) => {
    if (a.type === 'property') {
      const nextAsset = tickPropertyYear(a);
      if (ctx.worldModifiers.propertyAppreciationMultiplier !== 1.0) {
        const def = a.propertyDefId ? PROPERTY_MAP[a.propertyDefId] : undefined;
        const baseAppreciation = def?.appreciationPct ?? 0.02;
        const extraAppreciation =
          baseAppreciation *
          (ctx.worldModifiers.propertyAppreciationMultiplier - 1.0);
        nextAsset.value = Math.max(
          0,
          Math.round(nextAsset.value * (1 + extraAppreciation)),
        );
      }
      const disaster = rollPropertyDisaster(nextAsset);
      if (disaster) {
        const rawLoss = nextAsset.value - disaster.value;
        const { coveredLoss, payout } = applyInsuranceCoverage(
          character.insurancePolicies,
          'home',
          rawLoss,
        );
        const finalValue = nextAsset.value - coveredLoss;
        if (payout > 0) {
          ctx.pushCash(payout, 'other', 'Home insurance payout');
        }
        ctx.disasterLogs.push(
          `${nextAsset.name} suffered damage — value reduced to ${finalValue.toLocaleString()}.`,
        );
        return { ...disaster, value: finalValue };
      }
      return nextAsset;
    }
    if (a.type === 'vehicle') {
      return tickVehicleYear(a);
    }
    if (a.type === 'collectible') {
      return tickCollectibleYear(a, newAge);
    }
    if (a.type === 'angel_stake') {
      return tickAngelStake(a, newAge);
    }
    if (a.type === 'investment') {
      const bonus =
        ctx.worldModifiers.investmentReturnDelta + ctx.liveOps.stockReturnBonus;
      if (a.catalogId) {
        const ticked = tickCatalogInvestment(a, bonus);
        return {
          ...ticked,
          priceHistory: [
            ...(a.priceHistory ?? []),
            { age: newAge, value: ticked.value },
          ].slice(-20),
        };
      }
      const baseReturn = 0.07;
      const volatility = 0.12;
      const marketReturn =
        baseReturn + bonus + (Math.random() - 0.5) * volatility;
      const nextAsset = { ...a };
      nextAsset.value = Math.max(
        0,
        Math.round(nextAsset.value * (1 + marketReturn)),
      );
      nextAsset.priceHistory = [
        ...(a.priceHistory ?? []),
        { age: newAge, value: nextAsset.value },
      ].slice(-20);
      return nextAsset;
    }
    return a;
  });

  if (ctx.worldModifiers.investmentReturnDelta !== 0) {
    const equityMult = 1 + ctx.worldModifiers.investmentReturnDelta;
    void tickMarketHoldings(ctx.assets, newAge, {
      equityMult,
      cryptoMult: equityMult * 1.2,
      bondMult: 1 + ctx.worldModifiers.investmentReturnDelta * 0.3,
    });
  }

  const mortgagePayments = getAnnualMortgagePayments(ctx.assets);
  const baseMaintenance = getPropertyMaintenanceCost(ctx.assets);
  const adjustedMaintenance = Math.round(
    baseMaintenance * ctx.liveOps.maintenanceMultiplier,
  );
  ctx.housingCosts = mortgagePayments + adjustedMaintenance;
  if (ctx.housingCosts > 0) {
    let housing = ctx.housingCosts;
    if (ctx.equippedEffects.expenseReducePct > 0) {
      housing = Math.round(housing * (1 - ctx.equippedEffects.expenseReducePct * 0.5));
    }
    ctx.pushCash(-housing, 'housing', 'Housing (mortgage + maintenance)');
  }

  let rentalIncome = getAnnualRentalIncome(ctx.assets);
  if (rentalIncome > 0 && ctx.equippedEffects.incomeBonusPct > 0) {
    rentalIncome = Math.round(rentalIncome * (1 + ctx.equippedEffects.incomeBonusPct));
  }
  if (rentalIncome > 0) {
    ctx.pushCash(rentalIncome, 'other', 'Rental income');
  }

  ctx.simResult = runAnnualSimulation({
    ...character,
    age: newAge,
    stats: ctx.stats,
    bankBalance: ctx.bankBalance,
    career: ctx.career,
    assets: ctx.assets,
  });
  ctx.stats = { ...ctx.stats, ...ctx.simResult.statsPatches } as typeof ctx.stats;

  ctx.simResult.narrativeEffects.forEach((effect) => {
    if (effect.severity === 'major') {
      ctx.addMemory(effect.type, 'Severe Stress', effect.description, 60);
    }
  });

  ctx.debtCrisis = checkDebtCrisis({
    bankBalance: ctx.bankBalance,
    assets: ctx.assets,
    debt: ctx.debt,
    countryCode,
    familyBackground: character.familyBackground,
  });

  if (ctx.debtCrisis.crisis) {
    ctx.addMemory(
      'debt_crisis',
      'Debt Crisis',
      'Faced an overwhelming debt crisis that threatened financial stability.',
      80,
    );
  }

  ctx.deathChance = computeDeathChance(newAge, ctx.stats, getLifeExpectancy(countryCode));
}
