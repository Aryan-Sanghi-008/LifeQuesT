import type { AssetPerk } from './assetPerks';
import type { AssetRoleTag } from '../types';

export interface FranchiseDef {
  id: string;
  name: string;
  industry: string;
  /** USD entry cost (scaled by country) */
  entryCostUsd: number;
  baseRevenueUsd: number;
  expenseRatio: number;
  risk: number;
  minCredit: number;
  minAge: number;
  description: string;
  roleTag: AssetRoleTag;
  /** Perks while this business is featured (equipped). */
  industryPerks: AssetPerk[];
}

function p(
  id: string,
  label: string,
  description: string,
  extras: Partial<AssetPerk> = {},
): AssetPerk {
  return { id, label, description, ...extras };
}

export const FRANCHISES: FranchiseDef[] = [
  {
    id: 'fran_cafe',
    name: 'Neighborhood Cafe',
    industry: 'Food',
    entryCostUsd: 45000,
    baseRevenueUsd: 80000,
    expenseRatio: 0.72,
    risk: 0.25,
    minCredit: 620,
    minAge: 21,
    description: 'Espresso, pastries, locals — social hub.',
    roleTag: 'lifestyle',
    industryPerks: [
      p('fran_cafe_social', 'Community Hub', 'Social and happiness from cafe life', {
        annualStatEffect: { social: 3, happiness: 3 },
        fameBonus: 2,
      }),
    ],
  },
  {
    id: 'fran_gym',
    name: 'FitZone Gym',
    industry: 'Fitness',
    entryCostUsd: 120000,
    baseRevenueUsd: 160000,
    expenseRatio: 0.68,
    risk: 0.3,
    minCredit: 650,
    minAge: 22,
    description: 'Memberships and classes — fitness identity.',
    roleTag: 'lifestyle',
    industryPerks: [
      p('fran_gym_fit', 'Always Training', 'Fitness and looks from gym ownership', {
        annualStatEffect: { fitness: 5, looks: 2, health: 2 },
      }),
    ],
  },
  {
    id: 'fran_laundry',
    name: 'Suds Laundry',
    industry: 'Services',
    entryCostUsd: 35000,
    baseRevenueUsd: 55000,
    expenseRatio: 0.65,
    risk: 0.15,
    minCredit: 600,
    minAge: 18,
    description: 'Steady cash — low risk income play.',
    roleTag: 'income',
    industryPerks: [
      p('fran_laundry_cash', 'Steady Suds', 'Income and wealth focus', {
        incomeBonusPct: 0.03,
        annualStatEffect: { wealth: 2, ambition: 1 },
      }),
    ],
  },
  {
    id: 'fran_salon',
    name: 'Glow Salon',
    industry: 'Beauty',
    entryCostUsd: 55000,
    baseRevenueUsd: 90000,
    expenseRatio: 0.7,
    risk: 0.28,
    minCredit: 630,
    minAge: 20,
    description: 'Cuts and color — looks and social.',
    roleTag: 'status',
    industryPerks: [
      p('fran_salon_looks', 'Glow Brand', 'Looks and social', {
        annualStatEffect: { looks: 4, social: 3, happiness: 2 },
        fameBonus: 3,
      }),
    ],
  },
  {
    id: 'fran_clinic',
    name: 'QuickCare Clinic',
    industry: 'Health',
    entryCostUsd: 220000,
    baseRevenueUsd: 280000,
    expenseRatio: 0.75,
    risk: 0.22,
    minCredit: 700,
    minAge: 28,
    description: 'Walk-in medical — health and prestige.',
    roleTag: 'business',
    industryPerks: [
      p('fran_clinic_health', 'Care Reputation', 'Health and career', {
        annualStatEffect: { health: 3, intelligence: 2, ambition: 3 },
        careerPerformanceBonus: 0.03,
        fameBonus: 4,
      }),
    ],
  },
  {
    id: 'fran_tutoring',
    name: 'Bright Tutors',
    industry: 'Education',
    entryCostUsd: 40000,
    baseRevenueUsd: 70000,
    expenseRatio: 0.6,
    risk: 0.2,
    minCredit: 640,
    minAge: 22,
    description: 'Learning center — intelligence boost.',
    roleTag: 'lifestyle',
    industryPerks: [
      p('fran_tutor_int', 'Always Learning', 'Intelligence and ambition', {
        annualStatEffect: { intelligence: 4, ambition: 2 },
      }),
    ],
  },
  {
    id: 'fran_auto',
    name: 'Torque Garage',
    industry: 'Auto',
    entryCostUsd: 90000,
    baseRevenueUsd: 140000,
    expenseRatio: 0.7,
    risk: 0.27,
    minCredit: 650,
    minAge: 23,
    description: 'Repairs — utility and expense savings.',
    roleTag: 'utility',
    industryPerks: [
      p('fran_auto_util', 'In-House Mechanic', 'Expense reduction and ambition', {
        expenseReducePct: 0.03,
        annualStatEffect: { ambition: 2, fitness: 1 },
      }),
    ],
  },
  {
    id: 'fran_pharmacy',
    name: 'MediMart Pharmacy',
    industry: 'Health',
    entryCostUsd: 180000,
    baseRevenueUsd: 240000,
    expenseRatio: 0.78,
    risk: 0.18,
    minCredit: 700,
    minAge: 26,
    description: 'Scripts and OTC — stable health business.',
    roleTag: 'income',
    industryPerks: [
      p('fran_pharm_income', 'Script Cashflow', 'Income and health', {
        incomeBonusPct: 0.035,
        annualStatEffect: { health: 2, wealth: 2 },
      }),
    ],
  },
  {
    id: 'fran_arcade',
    name: 'Neon Arcade',
    industry: 'Entertainment',
    entryCostUsd: 100000,
    baseRevenueUsd: 150000,
    expenseRatio: 0.69,
    risk: 0.35,
    minCredit: 650,
    minAge: 21,
    description: 'Games and snacks — happiness and social.',
    roleTag: 'lifestyle',
    industryPerks: [
      p('fran_arcade_fun', 'Neon Nights', 'Happiness, social, fame', {
        annualStatEffect: { happiness: 5, social: 4 },
        fameBonus: 5,
      }),
    ],
  },
  {
    id: 'fran_cowork',
    name: 'DeskHive Cowork',
    industry: 'Office',
    entryCostUsd: 150000,
    baseRevenueUsd: 200000,
    expenseRatio: 0.66,
    risk: 0.32,
    minCredit: 680,
    minAge: 25,
    description: 'Hot desks — career networking.',
    roleTag: 'business',
    industryPerks: [
      p('fran_cowork_net', 'Founder Nest', 'Ambition, career, social', {
        annualStatEffect: { ambition: 4, social: 3 },
        careerPerformanceBonus: 0.04,
        unlockTag: 'cowork_network',
      }),
    ],
  },
  {
    id: 'fran_solar',
    name: 'SunInstall Solar',
    industry: 'Energy',
    entryCostUsd: 200000,
    baseRevenueUsd: 260000,
    expenseRatio: 0.72,
    risk: 0.28,
    minCredit: 700,
    minAge: 27,
    description: 'Home solar — income and green ambition.',
    roleTag: 'income',
    industryPerks: [
      p('fran_solar_income', 'Panel Profits', 'Income and ambition', {
        incomeBonusPct: 0.04,
        annualStatEffect: { ambition: 3, wealth: 2 },
      }),
    ],
  },
  {
    id: 'fran_hotel',
    name: 'RestInn Boutique',
    industry: 'Hospitality',
    entryCostUsd: 400000,
    baseRevenueUsd: 520000,
    expenseRatio: 0.76,
    risk: 0.33,
    minCredit: 740,
    minAge: 30,
    description: 'Boutique hotel — fame and income.',
    roleTag: 'status',
    industryPerks: [
      p('fran_hotel_fame', 'Host Prestige', 'Fame, social, income', {
        fameBonus: 10,
        incomeBonusPct: 0.04,
        annualStatEffect: { social: 5, happiness: 4, ambition: 3 },
        unlockTag: 'hospitality_network',
      }),
    ],
  },
  {
    id: 'fran_tech',
    name: 'ByteFix Repair',
    industry: 'Tech',
    entryCostUsd: 45000,
    baseRevenueUsd: 88000,
    expenseRatio: 0.65,
    risk: 0.25,
    minCredit: 640,
    minAge: 20,
    description: 'Phone and PC repair — intelligence play.',
    roleTag: 'utility',
    industryPerks: [
      p('fran_tech_int', 'Fixer Mindset', 'Intelligence and income', {
        annualStatEffect: { intelligence: 3, ambition: 2 },
        incomeBonusPct: 0.02,
      }),
    ],
  },
];

export const FRANCHISE_MAP = Object.fromEntries(FRANCHISES.map((f) => [f.id, f]));

export function getFranchiseById(id: string): FranchiseDef | undefined {
  return FRANCHISE_MAP[id];
}
