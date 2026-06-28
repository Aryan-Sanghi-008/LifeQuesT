import { Business, BusinessEmployee, Character } from '../types';
import { getCareerById } from '../data/careerPaths';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultFounder(): BusinessEmployee {
  return {
    id: generateId('emp'),
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
      id: generateId('emp'),
      name: i === 0 ? 'Founder' : `Employee ${i}`,
      role: i === 0 ? 'CEO' : 'Staff',
      salary: i === 0 ? 0 : 30000,
      performance: 50 + Math.floor(Math.random() * 30),
    }));
  }
  return [defaultFounder()];
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
  const employees = [defaultFounder()];
  return {
    id: generateId('biz'),
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

export function hireEmployee(business: Business, role: string): Business {
  const salary = 25000 + Math.floor(Math.random() * 20000);
  const employee: BusinessEmployee = {
    id: generateId('emp'),
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

  const revenueVariance = 0.8 + Math.random() * 0.4;
  const revenue = Math.round(business.revenue * revenueVariance * performanceMult);
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
