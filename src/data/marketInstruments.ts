/**
 * Diversified market instruments — trimmed to ~6–8 distinct per kind (~60 total).
 */
import type { AssetPerk } from './assetPerks';
import type { AssetRoleTag } from '../types';

export type InstrumentKind =
  | 'stock'
  | 'crypto'
  | 'mutual_fund'
  | 'bond'
  | 'commodity'
  | 'reit'
  | 'venture';

export interface MarketInstrument {
  id: string;
  name: string;
  kind: InstrumentKind;
  suggestedBuyUsd: number;
  annualReturnBase: number;
  volatility: number;
  dividendYield: number;
  minCredit?: number;
  description: string;
  roleTag?: AssetRoleTag;
  /** Passive investor lifestyle perks while holding this instrument. */
  holdingPerks?: AssetPerk[];
}

function p(
  id: string,
  label: string,
  description: string,
  extras: Partial<AssetPerk> = {},
): AssetPerk {
  return { id, label, description, ...extras };
}

function mk(
  id: string,
  name: string,
  kind: InstrumentKind,
  suggestedBuyUsd: number,
  annualReturnBase: number,
  volatility: number,
  dividendYield: number,
  description: string,
  roleTag: AssetRoleTag,
  holdingPerks: AssetPerk[],
  minCredit?: number,
): MarketInstrument {
  return {
    id,
    name,
    kind,
    suggestedBuyUsd,
    annualReturnBase,
    volatility,
    dividendYield,
    description,
    roleTag,
    holdingPerks,
    minCredit,
  };
}

export const MARKET_INSTRUMENTS: MarketInstrument[] = [
  // Stocks (~8)
  mk('eq_tech_core', 'NovaTech Inc', 'stock', 12000, 0.11, 0.22, 0.008, 'Growth tech equity', 'business', [
    p('inv_nova_amb', 'Tech Bull', 'Ambition from growth equity', { annualStatEffect: { ambition: 2 } }),
  ]),
  mk('eq_health', 'Vitalis Health', 'stock', 9000, 0.09, 0.15, 0.015, 'Healthcare defensive', 'lifestyle', [
    p('inv_vital_health', 'Health Stake', 'Mild health mindset', { annualStatEffect: { health: 1, ambition: 1 } }),
  ]),
  mk('eq_bank', 'Summit Bank', 'stock', 8000, 0.07, 0.14, 0.025, 'Dividend bank stock', 'income', [
    p('inv_bank_div', 'Dividend Calm', 'Wealth focus', { annualStatEffect: { wealth: 1 }, incomeBonusPct: 0.01 }),
  ]),
  mk('eq_chip', 'Silica Logic', 'stock', 14000, 0.12, 0.28, 0.005, 'Semiconductor cycle play', 'business', [
    p('inv_chip_int', 'Chip Cycle', 'Intelligence and ambition', { annualStatEffect: { intelligence: 2, ambition: 2 } }),
  ]),
  mk('eq_energy', 'Helio Energy', 'stock', 10000, 0.08, 0.2, 0.02, 'Energy sector', 'utility', [
    p('inv_helio', 'Energy Stake', 'Ambition', { annualStatEffect: { ambition: 1 } }),
  ]),
  mk('eq_luxury', 'Maison Luxe', 'stock', 11000, 0.08, 0.15, 0.012, 'Luxury goods equity', 'status', [
    p('inv_luxe', 'Luxury Taste', 'Looks and social', { annualStatEffect: { looks: 1, social: 1 } }),
  ]),
  mk('etf_world', 'World Equity ETF', 'stock', 7000, 0.08, 0.12, 0.018, 'Broad global equity', 'utility', [
    p('inv_world', 'Diversified Calm', 'Mental health from diversification', { annualStatEffect: { mentalHealth: 1, ambition: 1 } }),
  ]),
  mk('eq_ai', 'Synapse AI', 'stock', 15000, 0.13, 0.3, 0, 'High-octane AI equity', 'business', [
    p('inv_ai', 'AI Thesis', 'Ambition and mental strain', {
      annualStatEffect: { ambition: 3, mentalHealth: -1 },
    }),
  ]),

  // Crypto (~6)
  mk('btc_sim', 'BitCoin Sim', 'crypto', 3000, 0.15, 0.55, 0, 'Flagship crypto', 'status', [
    p('inv_btc', 'Crypto Whale Vibes', 'Fame and ambition', { fameBonus: 2, annualStatEffect: { ambition: 2 } }),
  ]),
  mk('eth_sim', 'EtherSim', 'crypto', 2500, 0.14, 0.5, 0, 'Smart-contract chain', 'business', [
    p('inv_eth', 'Builder Bag', 'Intelligence', { annualStatEffect: { intelligence: 2, ambition: 1 } }),
  ]),
  mk('sol_sim', 'SolanaSim', 'crypto', 2000, 0.18, 0.6, 0, 'High-beta L1', 'business', [
    p('inv_sol', 'Speed Run', 'Ambition and stress', {
      annualStatEffect: { ambition: 2, mentalHealth: -1 },
    }),
  ]),
  mk('link_sim', 'OracleLink', 'crypto', 2000, 0.13, 0.47, 0, 'Oracle network', 'utility', [
    p('inv_link', 'Oracle Edge', 'Intelligence', { annualStatEffect: { intelligence: 1 } }),
  ]),
  mk('ada_sim', 'AdaChain', 'crypto', 1800, 0.12, 0.48, 0, 'Academic chain', 'collector', [
    p('inv_ada', 'Patient Holder', 'Mental calm', { annualStatEffect: { mentalHealth: 1, ambition: 1 } }),
  ]),
  mk('matic_sim', 'PolygonSim', 'crypto', 1500, 0.14, 0.5, 0, 'L2 scaling', 'utility', [
    p('inv_matic', 'Scale Thesis', 'Ambition', { annualStatEffect: { ambition: 1 } }),
  ]),

  // Funds (~7)
  mk('fund_balanced', 'Balanced Growth Fund', 'mutual_fund', 5000, 0.07, 0.09, 0.02, '60/40 style fund', 'utility', [
    p('inv_bal', 'Steady Compound', 'Wealth and calm', { annualStatEffect: { wealth: 1, mentalHealth: 1 } }),
  ]),
  mk('fund_growth', 'Aggressive Growth Fund', 'mutual_fund', 8000, 0.1, 0.16, 0.008, 'Equity-heavy growth', 'business', [
    p('inv_grow', 'Growth Mandate', 'Ambition', { annualStatEffect: { ambition: 2 } }),
  ]),
  mk('fund_income', 'Income Dividend Fund', 'mutual_fund', 6000, 0.05, 0.07, 0.035, 'High dividend fund', 'income', [
    p('inv_inc_f', 'Coupon Lifestyle', 'Income bonus', { incomeBonusPct: 0.015, annualStatEffect: { wealth: 1 } }),
  ]),
  mk('fund_esg', 'ESG Leaders Fund', 'mutual_fund', 5500, 0.07, 0.1, 0.015, 'ESG tilt', 'lifestyle', [
    p('inv_esg', 'Impact Investor', 'Happiness and social', { annualStatEffect: { happiness: 1, social: 1 } }),
  ]),
  mk('fund_em', 'Emerging Markets Fund', 'mutual_fund', 7000, 0.09, 0.18, 0.01, 'EM exposure', 'business', [
    p('inv_em', 'Frontier Appetite', 'Ambition', { annualStatEffect: { ambition: 2 } }),
  ]),
  mk('fund_tech', 'Global Tech Fund', 'mutual_fund', 9000, 0.1, 0.2, 0.005, 'Tech basket', 'business', [
    p('inv_tech_f', 'Tech Basket', 'Intelligence', { annualStatEffect: { intelligence: 1, ambition: 2 } }),
  ]),
  mk('mutual_balanced', 'Balanced Mutual Fund', 'mutual_fund', 5000, 0.06, 0.08, 0.02, 'Legacy balanced fund', 'utility', [
    p('inv_legacy_bal', 'Legacy Balance', 'Calm compounding', { annualStatEffect: { mentalHealth: 1 } }),
  ]),

  // Bonds (~6)
  mk('bond_gov', 'Sovereign Bond Ladder', 'bond', 4000, 0.035, 0.04, 0.035, 'Gov bonds', 'utility', [
    p('inv_gov', 'Safe Harbor', 'Mental calm', { annualStatEffect: { mentalHealth: 2 } }),
  ]),
  mk('bond_corp', 'Investment Grade Corps', 'bond', 5000, 0.045, 0.06, 0.04, 'IG corporate', 'income', [
    p('inv_corp', 'Coupon Stream', 'Income', { incomeBonusPct: 0.01 }),
  ]),
  mk('bond_muni', 'Municipal Bond Bundle', 'bond', 4500, 0.04, 0.05, 0.038, 'Muni tax-aware', 'income', [
    p('inv_muni', 'Tax-Aware Yield', 'Expense relief', { expenseReducePct: 0.01 }),
  ]),
  mk('bond_hy', 'High Yield Credit', 'bond', 6000, 0.07, 0.12, 0.06, 'Junk yield', 'business', [
    p('inv_hy', 'Credit Risk', 'Ambition and stress', {
      annualStatEffect: { ambition: 1, mentalHealth: -1 },
      incomeBonusPct: 0.015,
    }),
  ]),
  mk('bond_tips', 'Inflation Shield Bonds', 'bond', 4500, 0.03, 0.05, 0.03, 'Inflation-linked', 'utility', [
    p('inv_tips', 'Inflation Guard', 'Expense reduction', { expenseReducePct: 0.015 }),
  ]),
  mk('bond_short', 'Short Duration Treasuries', 'bond', 3000, 0.025, 0.02, 0.025, 'Cash-like bonds', 'utility', [
    p('inv_short', 'Dry Powder', 'Mental calm', { annualStatEffect: { mentalHealth: 1 } }),
  ]),

  // Commodities (~6)
  mk('cmd_gold', 'Gold Bullion Trust', 'commodity', 5000, 0.04, 0.15, 0, 'Gold hedge', 'collector', [
    p('inv_gold', 'Hard Asset Calm', 'Mental health', { annualStatEffect: { mentalHealth: 2 } }),
  ]),
  mk('cmd_oil', 'Crude Energy Basket', 'commodity', 6000, 0.06, 0.25, 0, 'Oil exposure', 'business', [
    p('inv_oil', 'Energy Cycle', 'Ambition', { annualStatEffect: { ambition: 2 } }),
  ]),
  mk('cmd_agri', 'Agri Softs Basket', 'commodity', 4000, 0.05, 0.18, 0, 'Soft commodities', 'income', [
    p('inv_agri', 'Harvest Hedge', 'Wealth', { annualStatEffect: { wealth: 1 } }),
  ]),
  mk('cmd_copper', 'Industrial Metals', 'commodity', 5500, 0.055, 0.2, 0, 'Copper/industrial', 'utility', [
    p('inv_copper', 'Build Thesis', 'Ambition', { annualStatEffect: { ambition: 1 } }),
  ]),
  mk('cmd_silver', 'Silver Trust', 'commodity', 3500, 0.045, 0.22, 0, 'Silver', 'collector', [
    p('inv_silver', 'Shine Stack', 'Looks vibe', { annualStatEffect: { looks: 1 } }),
  ]),
  mk('cmd_carbon', 'Carbon Credits Basket', 'commodity', 4500, 0.07, 0.28, 0, 'Carbon markets', 'lifestyle', [
    p('inv_carbon', 'Green Speculator', 'Social and ambition', { annualStatEffect: { social: 1, ambition: 1 } }),
  ]),

  // REITs (~6)
  mk('reit_office', 'Metro Office REIT', 'reit', 8000, 0.06, 0.14, 0.04, 'Office REIT', 'income', [
    p('inv_reit_off', 'Rent Checks', 'Income', { incomeBonusPct: 0.015 }),
  ]),
  mk('reit_retail', 'Retail Plaza REIT', 'reit', 7000, 0.055, 0.15, 0.045, 'Retail REIT', 'income', [
    p('inv_reit_ret', 'Footfall Yield', 'Income and social', {
      incomeBonusPct: 0.012,
      annualStatEffect: { social: 1 },
    }),
  ]),
  mk('reit_resi', 'Residential Income REIT', 'reit', 7500, 0.05, 0.1, 0.04, 'Apartment REIT', 'lifestyle', [
    p('inv_reit_res', 'Landlord Lite', 'Wealth and calm', { annualStatEffect: { wealth: 1, mentalHealth: 1 } }),
  ]),
  mk('reit_data', 'Data Center REIT', 'reit', 10000, 0.08, 0.16, 0.03, 'Digital real estate', 'business', [
    p('inv_reit_dc', 'Cloud Land', 'Ambition and intelligence', {
      annualStatEffect: { ambition: 2, intelligence: 1 },
    }),
  ]),
  mk('reit_hotel', 'Hospitality REIT', 'reit', 6500, 0.07, 0.2, 0.035, 'Hotels', 'status', [
    p('inv_reit_hot', 'Guest Prestige', 'Social', { annualStatEffect: { social: 2 } }),
  ]),
  mk('reit_industrial', 'Logistics Warehouses', 'reit', 8500, 0.065, 0.12, 0.038, 'Industrial REIT', 'utility', [
    p('inv_reit_ind', 'Warehouse Yield', 'Income', { incomeBonusPct: 0.014 }),
  ]),

  // Venture (~6)
  mk('ven_saas', 'SaaS Seed Pool', 'venture', 12000, 0.15, 0.4, 0, 'SaaS startups', 'business', [
    p('inv_ven_saas', 'Founder Adjacent', 'Ambition and career', {
      annualStatEffect: { ambition: 3 },
      careerPerformanceBonus: 0.02,
    }),
  ], 680),
  mk('ven_bio', 'Biotech Angels', 'venture', 15000, 0.12, 0.45, 0, 'Biotech risk', 'collector', [
    p('inv_ven_bio', 'Lab Dream', 'Intelligence', { annualStatEffect: { intelligence: 3, ambition: 1 } }),
  ], 700),
  mk('ven_fintech', 'Fintech Cohort', 'venture', 13000, 0.14, 0.38, 0, 'Payments/fintech', 'income', [
    p('inv_ven_fin', 'Money Rails', 'Wealth ambition', { annualStatEffect: { wealth: 2, ambition: 2 } }),
  ], 690),
  mk('ven_climate', 'Climate Tech Pool', 'venture', 11000, 0.11, 0.36, 0, 'Climate startups', 'lifestyle', [
    p('inv_ven_cli', 'Impact Cap', 'Social and happiness', { annualStatEffect: { social: 2, happiness: 1 } }),
  ], 680),
  mk('ven_consumer', 'Consumer Brand Seed', 'venture', 10000, 0.13, 0.42, 0, 'DTC brands', 'status', [
    p('inv_ven_con', 'Brand Taste', 'Looks and social', { annualStatEffect: { looks: 1, social: 2 } }),
  ], 670),
  mk('ven_deep', 'Deep Tech Fundlet', 'venture', 16000, 0.16, 0.5, 0, 'Hard tech', 'business', [
    p('inv_ven_deep', 'Moonshot Mind', 'Intelligence and stress', {
      annualStatEffect: { intelligence: 3, ambition: 2, mentalHealth: -1 },
    }),
  ], 720),

  // Legacy ids for old saves
  mk('stock_index', 'Stock Portfolio', 'stock', 10000, 0.08, 0.18, 0.015, 'Broad stock portfolio', 'utility', [
    p('inv_legacy_stock', 'Index Habit', 'Ambition', { annualStatEffect: { ambition: 1 } }),
  ]),
  mk('mutual_growth', 'Growth Mutual Fund', 'mutual_fund', 8000, 0.09, 0.12, 0.01, 'Growth fund', 'business', [
    p('inv_legacy_grow', 'Growth Habit', 'Ambition', { annualStatEffect: { ambition: 1 } }),
  ]),
];

export const MARKET_MAP: Record<string, MarketInstrument> = Object.fromEntries(
  MARKET_INSTRUMENTS.map((i) => [i.id, i]),
);

export function getInstrumentById(id: string): MarketInstrument | undefined {
  return MARKET_MAP[id];
}

export function getInstrumentsByKind(kind: InstrumentKind): MarketInstrument[] {
  return MARKET_INSTRUMENTS.filter((i) => i.kind === kind);
}

/** Backward-compat shim for old INVESTMENTS consumers */
export type InvestmentKind = 'stock' | 'mutual_fund';
export interface InvestmentDef {
  id: string;
  name: string;
  kind: InvestmentKind;
  baseValueUsd: number;
  suggestedBuyUsd: number;
  annualReturnBase: number;
  volatility: number;
}

export const INVESTMENTS: InvestmentDef[] = MARKET_INSTRUMENTS.filter(
  (i) => i.kind === 'stock' || i.kind === 'mutual_fund',
).slice(0, 40).map((i) => ({
  id: i.id,
  name: i.name,
  kind: i.kind as InvestmentKind,
  baseValueUsd: i.suggestedBuyUsd,
  suggestedBuyUsd: i.suggestedBuyUsd,
  annualReturnBase: i.annualReturnBase,
  volatility: i.volatility,
}));

export const INVESTMENT_MAP: Record<string, InvestmentDef> = Object.fromEntries(
  INVESTMENTS.map((i) => [i.id, i]),
);

export function getInvestmentById(id: string): InvestmentDef | undefined {
  return INVESTMENT_MAP[id];
}
