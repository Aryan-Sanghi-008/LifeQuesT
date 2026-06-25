// ─── LifeQuest Unified Simulation Engine ─────────────────────────────────────
// Connects health, finance, career, education, and relationship systems.
// Called once per year (age-up) to propagate cascading effects.

import { Character, CharacterStats } from '../types';
import { getCountryEconomy, applyTax, getAnnualCostOfLiving } from '../data/countryEconomy';
import { clamp } from '../engine/economyEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimulationResult {
  statsPatches: Partial<CharacterStats>;
  bankBalanceDelta: number;
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
 * Run the annual simulation tick. This is called by ageUpEngine after base stats
 * are updated, to apply interconnected system effects.
 *
 * Key interconnections:
 * - Low health → career performance drops → income drops
 * - Financial stress → mental health drops → social isolation
 * - High fitness → health bonus → longevity
 * - Career success → wealth → happiness
 * - Social isolation → mental health drops
 */
export function runAnnualSimulation(character: Character): SimulationResult {
  const patches: Partial<CharacterStats> = {};
  let bankDelta = 0;
  const effects: SimNarrativeEffect[] = [];
  const warnings: string[] = [];
  const stats = character.stats;
  const eco = getCountryEconomy(character.countryCode);

  // ── 1. Cost of Living Deduction ─────────────────────────────────────────────
  // Annual living costs are automatically deducted from bank balance.
  const annualCoL = getAnnualCostOfLiving(character.countryCode);
  const adjustedCoL = Math.round(annualCoL * (1 + (eco.inflationRate * 0.5))); // Partial inflation
  bankDelta -= adjustedCoL;

  if (character.bankBalance + bankDelta < 0 && character.bankBalance > 0) {
    // Running out of money
    effects.push({
      type: 'financial_stress',
      description: 'Your expenses are exceeding your income. Savings are depleting.',
      severity: 'moderate',
    });
    patches.mentalHealth = (patches.mentalHealth ?? 0) - 5;
    patches.happiness = (patches.happiness ?? 0) - 4;
  }

  if (character.bankBalance < -10000) {
    // Deep in debt
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

  // ── 2. Health → Career Performance ──────────────────────────────────────────
  // Poor health reduces career performance
  if (character.career && stats.health < 30) {
    effects.push({
      type: 'health_cascade',
      description: 'Poor health is affecting your work performance.',
      severity: stats.health < 15 ? 'major' : 'moderate',
    });
    patches.ambition = (patches.ambition ?? 0) - 3;
  }

  // ── 3. Fitness → Health Bonus ────────────────────────────────────────────────
  // High fitness slows health decay in older ages
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

  // ── 4. Social Isolation → Mental Health ─────────────────────────────────────
  if (stats.social < 20) {
    patches.mentalHealth = (patches.mentalHealth ?? 0) - 4;
    patches.happiness = (patches.happiness ?? 0) - 3;
    effects.push({
      type: 'social_isolation',
      description: 'Social isolation is weighing on your mental health.',
      severity: 'moderate',
    });
  }

  // ── 5. Mental Health → Career & Social ──────────────────────────────────────
  if (stats.mentalHealth < 20) {
    patches.social = (patches.social ?? 0) - 2;
    patches.ambition = (patches.ambition ?? 0) - 3;
    effects.push({
      type: 'career_impact',
      description: 'Mental health struggles are affecting your productivity and relationships.',
      severity: 'major',
    });
  }

  // ── 6. Career Success → Happiness ────────────────────────────────────────────
  if (character.career && character.career.performance > 80) {
    patches.happiness = (patches.happiness ?? 0) + 2;
    patches.ambition  = (patches.ambition  ?? 0) + 1;
    effects.push({
      type: 'peak_performance',
      description: 'Excellent career performance is boosting your overall wellbeing.',
      severity: 'minor',
    });
  }

  // ── 7. Wealth → Happiness (but with diminishing returns) ────────────────────
  const netWorth = character.bankBalance + (character.assets ?? []).reduce((a, b) => a + (b.currentValue ?? 0), 0);
  if (netWorth > 500000 && netWorth < 2000000) {
    patches.happiness = (patches.happiness ?? 0) + 1;
  }
  if (netWorth < -50000) {
    patches.happiness = (patches.happiness ?? 0) - 5;
  }

  // ── 8. Salary Income (after tax) ────────────────────────────────────────────
  if (character.career) {
    const grossSalary = character.career.salary;
    const netSalary   = applyTax(grossSalary, character.countryCode);
    bankDelta += netSalary;

    // Salary vs cost of living ratio
    const colRatio = netSalary / adjustedCoL;
    if (colRatio < 0.8) {
      warnings.push('Your salary barely covers living costs. Consider upskilling or relocating.');
    } else if (colRatio > 3.0) {
      patches.happiness = (patches.happiness ?? 0) + 2;
    }
  }

  // ── 8b. Relationship Decay ────────────────────────────────────────────────────
  // Untended relationships slowly lose closeness over time
  // We only emit a warning; the actual people update happens in ageUpEngine
  const activePeople = (character.people ?? []).filter(p => p.isAlive);
  const neglectedRelationships = activePeople.filter(p =>
    p.relationshipScore > 20 &&
    p.relationType !== 'mother' &&
    p.relationType !== 'father' &&
    p.relationType !== 'child',
  );
  if (neglectedRelationships.length > 3 && character.age > 25) {
    // Many relationships — hard to maintain all
    patches.social = (patches.social ?? 0) - 1;
  }

  // ── 9. Peak Performance Bonus (age 25–45, high stats) ───────────────────────
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

  // ── 10. Clamp all patches to valid range ────────────────────────────────────
  const clampedPatches: Partial<CharacterStats> = {};
  for (const [key, value] of Object.entries(patches)) {
    if (value !== undefined) {
      const k = key as keyof CharacterStats;
      const currentVal = stats[k] as number ?? 50;
      clampedPatches[k] = clamp(currentVal + value) as never;
    }
  }

  return {
    statsPatches:    clampedPatches,
    bankBalanceDelta: bankDelta,
    narrativeEffects: effects,
    warnings,
  };
}

// ─── Life Expectancy Calculator ───────────────────────────────────────────────

/**
 * Estimate life expectancy based on character stats and country.
 * Used for UI hints and the death calculation system.
 */
export function estimateLifeExpectancy(character: Pick<Character, 'stats' | 'countryCode' | 'traits'>): number {
  // Country-based baseline (derived from real WHO data approximation)
  const countryBaseline: Record<string, number> = {
    JP: 84, SG: 83, AU: 83, DE: 81, GB: 81, US: 78, BR: 75, IN: 69, NG: 55,
  };
  const eco = getCountryEconomy(character.countryCode);
  const baseline = countryBaseline[character.countryCode] ?? 72;

  const { health, fitness, mentalHealth, happiness } = character.stats;

  // Stat modifiers
  const healthMod    = (health    - 50) * 0.15;
  const fitnessMod   = (fitness   - 50) * 0.10;
  const mentalMod    = (mentalHealth - 50) * 0.08;
  const happinessMod = (happiness - 50) * 0.05;

  // Trait modifiers
  const traitMod = character.traits.includes('athletic') ? 3 :
                   character.traits.includes('healthy')  ? 2 : 0;

  return Math.round(baseline + healthMod + fitnessMod + mentalMod + happinessMod + traitMod);
}

// ─── Investment Simulation ────────────────────────────────────────────────────

/**
 * Simulate investment returns for the year based on market conditions.
 * Returns the profit/loss from investments.
 */
export function simulateInvestmentYear(
  investedAmount: number,
  countryCode: string,
  characterIntelligence: number,
): number {
  const eco = getCountryEconomy(countryCode);

  // Base market return (random around country's expected return)
  const baseReturn = 0.07; // 7% average
  const volatility = eco.stockMarketVolatility * 0.12;

  // Intelligence reduces variance (smarter investors make better choices)
  const intelligenceFactor = 0.5 + (characterIntelligence / 200); // 0.5–1.0

  const marketReturn = baseReturn + (Math.random() - 0.5) * volatility * intelligenceFactor;
  return Math.round(investedAmount * marketReturn);
}
