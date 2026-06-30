// ─── LifeQuest Unified Simulation Engine ─────────────────────────────────────
// Connects health, finance, career, education, and relationship systems.
// Called once per year (age-up) to propagate cascading stat effects.
// Bank balance is handled exclusively by economyEngine.tickAnnualEconomy.

import { Character, CharacterStats } from '../types';
import { getCountryEconomy, getAnnualCostOfLiving, applyTax } from '../data/countryEconomy';
import { clamp } from '../engine/economyEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimulationResult {
  statsPatches: Partial<CharacterStats>;
  narrativeEffects: SimNarrativeEffect[];
  warnings: string[];
}

export interface SimNarrativeEffect {
  type: 'health_cascade' | 'career_impact' | 'financial_stress' | 'social_isolation' | 'peak_performance';
  description: string;
  severity: 'minor' | 'moderate' | 'major';
}

// ─── Main Simulation Tick ─────────────────────────────────────────────────────

/**
 * Run the annual simulation tick. Applies interconnected stat effects only.
 * Bank changes are handled by tickAnnualEconomy before this runs.
 */
export function runAnnualSimulation(character: Character): SimulationResult {
  const patches: Partial<CharacterStats> = {};
  const effects: SimNarrativeEffect[] = [];
  const warnings: string[] = [];
  const stats = character.stats;
  const eco = getCountryEconomy(character.countryCode);

  const annualCoL = getAnnualCostOfLiving(character.countryCode);
  const adjustedCoL = Math.round(annualCoL * eco.costOfLivingIndex * (1 + eco.inflationRate * 0.5));

  // ── Financial stress (stat effects only — bank already updated) ─────────────
  if (character.bankBalance <= 0 && character.bankBalance > -500_000 && character.age >= 13) {
    effects.push({
      type: 'financial_stress',
      description: 'Your expenses are exceeding your income. Savings are depleting.',
      severity: 'moderate',
    });
    patches.mentalHealth = (patches.mentalHealth ?? 0) - 5;
    patches.happiness = (patches.happiness ?? 0) - 4;
  }

  if (character.bankBalance < -10_000) {
    effects.push({
      type: 'financial_stress',
      description: 'Debt is mounting. Financial stress is taking a serious toll.',
      severity: 'major',
    });
    patches.mentalHealth = (patches.mentalHealth ?? 0) - 8;
    patches.happiness = (patches.happiness ?? 0) - 7;
    patches.health = (patches.health ?? 0) - 3;
    warnings.push('Deep in debt — consider taking a job or selling assets.');
  }

  // ── Health → Career Performance ──────────────────────────────────────────
  if (character.career && stats.health < 30) {
    effects.push({
      type: 'health_cascade',
      description: 'Poor health is affecting your work performance.',
      severity: stats.health < 15 ? 'major' : 'moderate',
    });
    patches.ambition = (patches.ambition ?? 0) - 3;
  }

  // ── Fitness → Health Bonus ────────────────────────────────────────────────
  if (stats.fitness > 70 && character.age > 35) {
    patches.health = (patches.health ?? 0) + 1;
  }
  if (stats.fitness < 20 && character.age > 40) {
    patches.health = (patches.health ?? 0) - 2;
    effects.push({
      type: 'health_cascade',
      description: 'Low fitness is accelerating physical decline.',
      severity: 'moderate',
    });
  }

  // ── Social Isolation → Mental Health ─────────────────────────────────────
  if (stats.social < 20) {
    patches.mentalHealth = (patches.mentalHealth ?? 0) - 4;
    patches.happiness = (patches.happiness ?? 0) - 3;
    effects.push({
      type: 'social_isolation',
      description: 'Social isolation is weighing on your mental health.',
      severity: 'moderate',
    });
  }

  // ── Mental Health → Career & Social ──────────────────────────────────────
  if (stats.mentalHealth < 20) {
    patches.social = (patches.social ?? 0) - 2;
    patches.ambition = (patches.ambition ?? 0) - 3;
    effects.push({
      type: 'career_impact',
      description: 'Mental health struggles are affecting your productivity and relationships.',
      severity: 'major',
    });
  }

  // ── Career Success → Happiness ───────────────────────────────────────────
  if (character.career && character.career.performance > 80) {
    patches.happiness = (patches.happiness ?? 0) + 2;
    patches.ambition  = (patches.ambition  ?? 0) + 1;
    effects.push({
      type: 'peak_performance',
      description: 'Excellent career performance is boosting your overall wellbeing.',
      severity: 'minor',
    });
  }

  // ── Wealth → Happiness ───────────────────────────────────────────────────
  const netWorth = character.bankBalance + (character.assets ?? []).reduce((a, b) => a + b.value, 0);
  if (netWorth > 500_000 && netWorth < 2_000_000) {
    patches.happiness = (patches.happiness ?? 0) + 1;
  }
  if (netWorth < -50_000) {
    patches.happiness = (patches.happiness ?? 0) - 5;
  }

  // ── Salary vs cost of living (warnings only) ───────────────────────────────
  if (character.career) {
    const netSalary = applyTax(character.career.salary, character.countryCode);
    const colRatio = adjustedCoL > 0 ? netSalary / adjustedCoL : 0;
    if (colRatio < 0.8) {
      warnings.push('Your salary barely covers living costs. Consider upskilling or relocating.');
    } else if (colRatio > 3.0) {
      patches.happiness = (patches.happiness ?? 0) + 2;
    }
  }

  // ── Relationship maintenance load ────────────────────────────────────────
  const activePeople = (character.people ?? []).filter(p => p.isAlive);
  const neglectedRelationships = activePeople.filter(p =>
    p.relationshipScore > 20 &&
    p.relationType !== 'mother' &&
    p.relationType !== 'father' &&
    p.relationType !== 'child',
  );
  if (neglectedRelationships.length > 3 && character.age > 25) {
    patches.social = (patches.social ?? 0) - 1;
  }

  // ── Peak Performance Bonus (age 25–45, high stats) ───────────────────────
  if (character.age >= 25 && character.age <= 45) {
    const avgStat = (stats.intelligence + stats.ambition + stats.health) / 3;
    if (avgStat > 75) {
      effects.push({
        type: 'peak_performance',
        description: 'You are in your prime — physically, mentally, and professionally.',
        severity: 'minor',
      });
      patches.ambition = (patches.ambition ?? 0) + 1;
    }
  }

  // ── Clamp all patches to valid range ─────────────────────────────────────
  const clampedPatches: Partial<CharacterStats> = {};
  for (const [key, value] of Object.entries(patches)) {
    if (value !== undefined) {
      const k = key as keyof CharacterStats;
      const currentVal = stats[k] as number ?? 50;
      clampedPatches[k] = clamp(currentVal + value) as never;
    }
  }

  return {
    statsPatches: clampedPatches,
    narrativeEffects: effects,
    warnings,
  };
}

// ─── Life Expectancy Calculator ─────────────────────────────────────────────

export function estimateLifeExpectancy(character: Pick<Character, 'stats' | 'countryCode' | 'traits'>): number {
  const countryBaseline: Record<string, number> = {
    JP: 84, SG: 83, AU: 83, DE: 81, GB: 81, US: 78, BR: 75, IN: 69, NG: 55,
  };
  const baseline = countryBaseline[character.countryCode] ?? 72;

  const { health, fitness, mentalHealth, happiness } = character.stats;

  const healthMod    = (health    - 50) * 0.15;
  const fitnessMod   = (fitness   - 50) * 0.10;
  const mentalMod    = (mentalHealth - 50) * 0.08;
  const happinessMod = (happiness - 50) * 0.05;

  const traitMod = character.traits.includes('athletic') ? 3 :
                   character.traits.includes('healthy')  ? 2 : 0;

  return Math.round(baseline + healthMod + fitnessMod + mentalMod + happinessMod + traitMod);
}

// ─── Investment Simulation ────────────────────────────────────────────────────

export function simulateInvestmentYear(
  investedAmount: number,
  countryCode: string,
  characterIntelligence: number,
): number {
  const eco = getCountryEconomy(countryCode);

  const baseReturn = 0.07;
  const volatility = eco.stockMarketVolatility * 0.12;
  const intelligenceFactor = 0.5 + (characterIntelligence / 200);

  const marketReturn = baseReturn + (Math.random() - 0.5) * volatility * intelligenceFactor;
  return Math.round(investedAmount * marketReturn);
}
