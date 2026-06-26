import { Business, Character } from '../types';
import { getCareerById } from '../data/careerPaths';

function generateId(): string {
  return `biz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function isEntrepreneurCareer(character: Character): boolean {
  const entrepreneurPath = getCareerById('entrepreneur');
  if (!entrepreneurPath) return false;
  return character.job === entrepreneurPath.label
    || character.career?.title === entrepreneurPath.label;
}

export function canFoundBusiness(character: Character): boolean {
  return isEntrepreneurCareer(character)
    || character.eventHistory.some(e => e.id === 'startup');
}

export function foundBusiness(character: Character, name: string): Business | null {
  if (!canFoundBusiness(character)) return null;

  const baseRevenue = 20000 + character.stats.ambition * 500;
  return {
    id: generateId(),
    name,
    revenue: baseRevenue,
    expenses: Math.round(baseRevenue * 0.6),
    valuation: baseRevenue * 3,
    employees: 1,
    foundedAge: character.age,
  };
}

export interface BusinessTickResult {
  business: Business;
  profit: number;
}

export function tickBusinessYear(business: Business): BusinessTickResult {
  const revenueVariance = 0.8 + Math.random() * 0.4;
  const revenue = Math.round(business.revenue * revenueVariance);
  const expenses = Math.round(business.expenses * (0.9 + Math.random() * 0.2));
  const profit = revenue - expenses;
  const growth = profit > 0 ? 1.05 : 0.95;

  return {
    profit,
    business: {
      ...business,
      revenue: Math.round(revenue * growth),
      expenses: Math.round(expenses),
      valuation: Math.max(0, Math.round(business.valuation + profit)),
      employees: Math.max(1, business.employees + (profit > 5000 ? 1 : 0)),
    },
  };
}

export function sellBusiness(business: Business): number {
  return Math.round(business.valuation * 0.85);
}

export function tickAllBusinesses(
  businesses: Business[],
): { businesses: Business[]; totalProfit: number } {
  let totalProfit = 0;
  const updated = businesses.map(b => {
    const { business, profit } = tickBusinessYear(b);
    totalProfit += profit;
    return business;
  });
  return { businesses: updated, totalProfit };
}
