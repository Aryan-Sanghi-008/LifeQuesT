import { Business, BusinessEmployee, Character } from '../types';
import { getCareerById } from '../data/careerPaths';
import { getFranchiseById, type FranchiseDef } from '../data/franchises';
import { getDegreeById } from '../data/educationDegrees';
import { scaleCountryAmount } from './countryScaleEngine';
import { getFinancedPurchaseTerms } from './financingEngine';
import { makeId } from './ids';

function defaultFounder(): BusinessEmployee {
  return {
    id: makeId('emp'),
    name: 'Founder',
    role: 'CEO',
    salary: 0,
    performance: 80,
  };
}

export function normalizeBusinessEmployees(
  employees: Business['employees'] | number | undefined,
): BusinessEmployee[] {
  if (Array.isArray(employees)) return employees;
  if (typeof employees === 'number') {
    const count = Math.max(1, employees);
    return Array.from({ length: count }, (_, i) => ({
      id: makeId('emp'),
      name: i === 0 ? 'Founder' : `Employee ${i}`,
      role: i === 0 ? 'CEO' : 'Staff',
      salary: i === 0 ? 0 : 30000,
      performance: 50 + Math.floor(Math.random() * 30),
    }));
  }
  return [defaultFounder()];
}

type FranchiseCharacter = Pick<
  Character,
  | 'job'
  | 'career'
  | 'eventHistory'
  | 'educationBranch'
  | 'degreeIds'
  | 'age'
  | 'creditScore'
  | 'countryCode'
  | 'bankBalance'
  | 'debt'
  | 'assets'
>;

function isEntrepreneurCareer(character: Pick<Character, 'job' | 'career'>): boolean {
  const entrepreneurPath = getCareerById('entrepreneur');
  if (!entrepreneurPath) return false;
  return character.job === entrepreneurPath.label
    || character.career?.title === entrepreneurPath.label;
}

function hasBusinessEducation(
  character: Pick<Character, 'educationBranch' | 'degreeIds'>,
): boolean {
  const branch = character.educationBranch;
  if (branch === 'business' || branch === 'commerce') return true;
  return (character.degreeIds ?? []).some((id) => {
    const d = getDegreeById(id);
    return d?.branch === 'business' || d?.branch === 'commerce';
  });
}

/** Soft boost: entrepreneur or business education — not a hard gate. */
export function hasFranchiseSoftBoost(character: FranchiseCharacter): boolean {
  return isEntrepreneurCareer(character)
    || character.eventHistory.some((e) => e.id === 'startup')
    || hasBusinessEducation(character);
}

/** Legacy gate kept for free-form foundBusiness(name). */
export function canFoundBusiness(character: Character): boolean {
  return isEntrepreneurCareer(character)
    || character.eventHistory.some(e => e.id === 'startup');
}

export function getFranchiseEntryCost(
  franchise: FranchiseDef,
  character: FranchiseCharacter,
): number {
  const cc = character.countryCode ?? 'US';
  let cost = scaleCountryAmount(franchise.entryCostUsd, cc, 'cost');
  if (hasFranchiseSoftBoost(character)) {
    cost = Math.round(cost * 0.9);
  }
  return cost;
}

export function canFoundFranchise(
  character: FranchiseCharacter,
  franchiseId: string,
): { ok: boolean; message: string; entryCost: number; terms?: ReturnType<typeof getFinancedPurchaseTerms> } {
  const franchise = getFranchiseById(franchiseId);
  if (!franchise) return { ok: false, message: 'Franchise not found.', entryCost: 0 };
  if (character.age < franchise.minAge) {
    return { ok: false, message: `Must be at least ${franchise.minAge}.`, entryCost: 0 };
  }
  if ((character.creditScore ?? 650) < franchise.minCredit) {
    return {
      ok: false,
      message: `Need credit score ${franchise.minCredit}+.`,
      entryCost: 0,
    };
  }
  const entryCost = getFranchiseEntryCost(franchise, character);
  const terms = getFinancedPurchaseTerms(entryCost, character);
  if (!terms.approved) {
    return { ok: false, message: terms.message, entryCost, terms };
  }
  return { ok: true, message: '', entryCost, terms };
}

export function foundFranchise(
  character: Character,
  franchiseId: string,
): { business: Business; terms: ReturnType<typeof getFinancedPurchaseTerms> } | null {
  const check = canFoundFranchise(character, franchiseId);
  if (!check.ok || !check.terms) return null;
  const franchise = getFranchiseById(franchiseId)!;
  const cc = character.countryCode ?? 'US';
  const soft = hasFranchiseSoftBoost(character);
  let baseRevenue = scaleCountryAmount(franchise.baseRevenueUsd, cc, 'salary');
  if (soft) baseRevenue = Math.round(baseRevenue * 1.1);
  const expenses = Math.round(baseRevenue * franchise.expenseRatio);
  return {
    terms: check.terms,
    business: {
      id: makeId('biz'),
      name: franchise.name,
      revenue: baseRevenue,
      expenses,
      valuation: baseRevenue * 3,
      employees: [defaultFounder()],
      payrollMonthly: 0,
      foundedAge: character.age,
      franchiseId,
      industry: franchise.industry,
      risk: franchise.risk,
    },
  };
}

export function foundBusiness(character: Character, name: string): Business | null {
  if (!canFoundBusiness(character)) return null;

  const cc = character.countryCode ?? 'US';
  const baseRevenueUsd = 20000 + character.stats.ambition * 500;
  const baseRevenue = scaleCountryAmount(baseRevenueUsd, cc, 'salary');
  const employees = [defaultFounder()];
  return {
    id: makeId('biz'),
    name,
    revenue: baseRevenue,
    expenses: Math.round(baseRevenue * 0.6),
    valuation: baseRevenue * 3,
    employees,
    payrollMonthly: 0,
    foundedAge: character.age,
  };
}

export const EMPLOYEE_ROLES = ['Sales', 'Engineer', 'Manager', 'Support', 'Marketing'] as const;

export function hireEmployee(business: Business, role: string, countryCode = 'US'): Business {
  const salaryUsd = 25000 + Math.floor(Math.random() * 20000);
  const salary = scaleCountryAmount(salaryUsd, countryCode, 'salary');
  const employee: BusinessEmployee = {
    id: makeId('emp'),
    name: `New ${role}`,
    role,
    salary,
    performance: 45 + Math.floor(Math.random() * 40),
  };
  const employees = [...business.employees, employee];
  return {
    ...business,
    employees,
    payrollMonthly: employees.reduce((s, e) => s + e.salary / 12, 0),
  };
}

export function fireEmployee(business: Business, employeeId: string): Business {
  const employees = business.employees.filter(e => e.id !== employeeId && e.role !== 'CEO');
  if (employees.length === 0) employees.push(defaultFounder());
  return {
    ...business,
    employees,
    payrollMonthly: employees.reduce((s, e) => s + e.salary / 12, 0),
  };
}

export interface BusinessTickResult {
  business: Business;
  profit: number;
}

export function tickBusinessYear(business: Business): BusinessTickResult {
  const employees = normalizeBusinessEmployees(business.employees);
  const payroll = employees.reduce((s, e) => s + e.salary, 0);
  const avgPerformance = employees.reduce((s, e) => s + e.performance, 0) / employees.length;
  const performanceMult = 0.8 + (avgPerformance / 100) * 0.4;
  const risk = business.risk ?? 0.2;
  const riskShock = 1 + (Math.random() - 0.5) * risk;

  const revenueVariance = 0.8 + Math.random() * 0.4;
  const revenue = Math.round(business.revenue * revenueVariance * performanceMult * riskShock);
  const expenses = Math.round(business.expenses * (0.9 + Math.random() * 0.2) + payroll);
  const profit = revenue - expenses;
  const growth = profit > 0 ? 1.05 : 0.95;

  return {
    profit,
    business: {
      ...business,
      employees,
      revenue: Math.round(revenue * growth),
      expenses: Math.round(expenses),
      valuation: Math.max(0, Math.round(business.valuation + profit)),
      payrollMonthly: Math.round(payroll / 12),
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
    const normalized = { ...b, employees: normalizeBusinessEmployees(b.employees) };
    const { business, profit } = tickBusinessYear(normalized);
    totalProfit += profit;
    return business;
  });
  return { businesses: updated, totalProfit };
}
