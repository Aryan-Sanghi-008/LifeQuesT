/**
 * Diversified market instruments — stocks, crypto, funds, bonds, commodities, REITs, venture.
 */
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
  /** USD unit / suggested buy anchor */
  suggestedBuyUsd: number;
  annualReturnBase: number;
  volatility: number;
  dividendYield: number;
  minCredit?: number;
  description: string;
}

function stock(id: string, name: string, ret: number, vol: number, div = 0.01): MarketInstrument {
  return {
    id,
    name,
    kind: 'stock',
    suggestedBuyUsd: 5000 + Math.round(ret * 80000),
    annualReturnBase: ret,
    volatility: vol,
    dividendYield: div,
    description: `${name} equity`,
  };
}

function crypto(id: string, name: string, ret: number, vol: number): MarketInstrument {
  return {
    id,
    name,
    kind: 'crypto',
    suggestedBuyUsd: 2000,
    annualReturnBase: ret,
    volatility: vol,
    dividendYield: 0,
    description: `${name} digital asset`,
  };
}

const STOCK_NAMES = [
  ['eq_tech_core', 'NovaTech Inc', 0.11, 0.22],
  ['eq_health', 'Vitalis Health', 0.09, 0.15],
  ['eq_energy', 'Helio Energy', 0.08, 0.2],
  ['eq_bank', 'Summit Bank', 0.07, 0.14],
  ['eq_retail', 'UrbanMart', 0.06, 0.16],
  ['eq_auto', 'Volt Motors', 0.1, 0.25],
  ['eq_media', 'Streamly', 0.09, 0.21],
  ['eq_food', 'Harvest Co', 0.05, 0.12],
  ['eq_aero', 'Skyframe Aero', 0.1, 0.19],
  ['eq_chip', 'Silica Logic', 0.12, 0.28],
  ['eq_pharma', 'CurePath', 0.08, 0.18],
  ['eq_telco', 'LinkNet', 0.06, 0.11],
  ['eq_steel', 'Forge Metals', 0.07, 0.17],
  ['eq_hotel', 'Lumen Hotels', 0.06, 0.16],
  ['eq_game', 'PixelForge', 0.11, 0.26],
  ['eq_cloud', 'Nimbus Cloud', 0.12, 0.2],
  ['eq_agri', 'GreenAcre', 0.05, 0.13],
  ['eq_insure', 'Shield Mutual', 0.06, 0.1],
  ['eq_rail', 'IronLink Rail', 0.07, 0.14],
  ['eq_chem', 'Aether Chem', 0.08, 0.17],
  ['etf_world', 'World Equity ETF', 0.08, 0.12],
  ['etf_em', 'Emerging Markets ETF', 0.09, 0.18],
  ['etf_div', 'Dividend Aristocrats ETF', 0.06, 0.09],
  ['etf_tech', 'Global Tech ETF', 0.1, 0.2],
  ['etf_esg', 'ESG Leaders ETF', 0.07, 0.11],
  ['etf_small', 'Small Cap ETF', 0.09, 0.19],
  ['etf_value', 'Value Factor ETF', 0.07, 0.12],
  ['eq_luxury', 'Maison Luxe', 0.08, 0.15],
  ['eq_sports', 'Arena Sports Co', 0.07, 0.16],
  ['eq_edu', 'BrightMind Ed', 0.06, 0.14],
  ['eq_logistics', 'FastLane Logistics', 0.08, 0.15],
  ['eq_water', 'AquaPure', 0.05, 0.1],
  ['eq_solar', 'Photon Solar', 0.1, 0.24],
  ['eq_biotech', 'GeneVista', 0.11, 0.3],
  ['eq_defense', 'Aegis Defense', 0.07, 0.13],
  ['eq_mining', 'DeepOre', 0.09, 0.22],
  ['eq_fashion', 'Thread & Co', 0.06, 0.17],
  ['eq_bev', 'Spark Beverages', 0.05, 0.12],
  ['eq_reits_eq', 'Property Equity Co', 0.07, 0.14],
  ['eq_fintech', 'PayNova', 0.11, 0.23],
  ['eq_robot', 'MechaWorks', 0.1, 0.21],
  ['eq_space', 'Orbit Labs', 0.12, 0.32],
  ['eq_ai', 'Synapse AI', 0.13, 0.3],
  ['eq_cyber', 'VaultSec', 0.1, 0.22],
  ['eq_waste', 'CleanCycle', 0.06, 0.11],
  ['eq_pet', 'PawCare', 0.07, 0.14],
  ['eq_beauty', 'Glow Labs', 0.08, 0.16],
  ['eq_furniture', 'Nest Home', 0.05, 0.12],
  ['eq_shipping', 'BlueHull Shipping', 0.07, 0.18],
  ['etf_bond_stock', '60/40 Balanced ETF', 0.06, 0.08],
] as const;

const CRYPTO_NAMES = [
  ['btc_sim', 'BitCoin Sim', 0.15, 0.55],
  ['eth_sim', 'EtherSim', 0.14, 0.5],
  ['sol_sim', 'SolanaSim', 0.18, 0.6],
  ['ada_sim', 'AdaChain', 0.12, 0.48],
  ['dot_sim', 'PolkaDot Sim', 0.11, 0.45],
  ['link_sim', 'OracleLink', 0.13, 0.47],
  ['avax_sim', 'AvalancheSim', 0.16, 0.52],
  ['matic_sim', 'PolygonSim', 0.14, 0.5],
  ['xrp_sim', 'RippleSim', 0.1, 0.42],
  ['ltc_sim', 'LiteSim', 0.09, 0.4],
  ['uni_sim', 'UniSwap Sim', 0.12, 0.48],
  ['atom_sim', 'CosmosSim', 0.11, 0.44],
  ['near_sim', 'NearSim', 0.15, 0.53],
  ['ftm_sim', 'FantomSim', 0.13, 0.55],
  ['algo_sim', 'AlgoSim', 0.1, 0.43],
  ['xlm_sim', 'StellarSim', 0.09, 0.41],
  ['icp_sim', 'ICP Sim', 0.14, 0.58],
  ['fil_sim', 'FileSim', 0.12, 0.5],
  ['hbar_sim', 'HBAR Sim', 0.11, 0.46],
  ['vet_sim', 'VeChainSim', 0.1, 0.45],
] as const;

function buildFunds(): MarketInstrument[] {
  const names = [
    'Balanced Mutual Fund', 'Growth Mutual Fund', 'Income Fund', 'Global Equity Fund',
    'Emerging Growth Fund', 'Conservative Fund', 'Aggressive Growth Fund', 'Index Tracker Fund',
    'Blue Chip Fund', 'Sector Rotation Fund', 'Multi Asset Fund', 'Target Date 2040',
    'Target Date 2050', 'ESG Equity Fund', 'Small Cap Growth Fund', 'Large Cap Value Fund',
    'International Bond Hybrid', 'Quant Alpha Fund', 'Dividend Plus Fund', 'Inflation Shield Fund',
  ];
  return names.map((name, i) => ({
    id: `fund_${i + 1}`,
    name,
    kind: 'mutual_fund' as const,
    suggestedBuyUsd: 4000 + i * 400,
    annualReturnBase: 0.045 + (i % 8) * 0.008,
    volatility: 0.06 + (i % 6) * 0.015,
    dividendYield: 0.015 + (i % 4) * 0.005,
    description: name,
  }));
}

function buildBonds(): MarketInstrument[] {
  const names = [
    'Gov 2Y Bond', 'Gov 10Y Bond', 'Gov 30Y Bond', 'Corp AAA Bond', 'Corp BBB Bond',
    'Municipal Bond', 'Inflation-Linked Bond', 'High Yield Bond', 'Emerging Debt Bond',
    'Green Bond', 'Bank CD Ladder', 'Treasury Bill Ladder', 'Agency Bond',
    'Convertible Bond Fund', 'Floating Rate Note',
  ];
  return names.map((name, i) => ({
    id: `bond_${i + 1}`,
    name,
    kind: 'bond' as const,
    suggestedBuyUsd: 3000 + i * 300,
    annualReturnBase: 0.03 + (i % 5) * 0.005,
    volatility: 0.02 + (i % 4) * 0.01,
    dividendYield: 0.025 + (i % 5) * 0.004,
    description: name,
  }));
}

function buildCommodities(): MarketInstrument[] {
  const items: [string, string, number, number][] = [
    ['cmd_gold', 'Gold Bullion', 0.05, 0.12],
    ['cmd_silver', 'Silver', 0.06, 0.2],
    ['cmd_oil', 'Crude Oil Basket', 0.07, 0.28],
    ['cmd_gas', 'Natural Gas', 0.06, 0.3],
    ['cmd_copper', 'Copper', 0.06, 0.18],
    ['cmd_wheat', 'Wheat Futures', 0.04, 0.16],
    ['cmd_coffee', 'Coffee', 0.05, 0.22],
    ['cmd_lithium', 'Lithium', 0.09, 0.32],
    ['cmd_platinum', 'Platinum', 0.05, 0.15],
    ['cmd_timber', 'Timber Fund', 0.04, 0.1],
    ['cmd_uranium', 'Uranium', 0.08, 0.35],
    ['cmd_palladium', 'Palladium', 0.06, 0.25],
  ];
  return items.map(([id, name, ret, vol]) => ({
    id,
    name,
    kind: 'commodity' as const,
    suggestedBuyUsd: 2500,
    annualReturnBase: ret,
    volatility: vol,
    dividendYield: 0,
    description: name,
  }));
}

function buildReits(): MarketInstrument[] {
  const names = [
    'Urban Office REIT', 'Residential REIT', 'Logistics REIT', 'Data Center REIT',
    'Retail Mall REIT', 'Healthcare REIT', 'Hotel REIT', 'Industrial REIT',
    'Self-Storage REIT', 'Infrastructure REIT', 'Farmland REIT', 'Cell Tower REIT',
  ];
  return names.map((name, i) => ({
    id: `reit_${i + 1}`,
    name,
    kind: 'reit' as const,
    suggestedBuyUsd: 6000 + i * 500,
    annualReturnBase: 0.055 + (i % 4) * 0.008,
    volatility: 0.1 + (i % 5) * 0.02,
    dividendYield: 0.04 + (i % 3) * 0.01,
    description: name,
  }));
}

function buildVenture(): MarketInstrument[] {
  const names = [
    'Seed Venture Fund', 'Series A Basket', 'Fintech Ventures', 'HealthTech Ventures',
    'Climate Ventures', 'Consumer Apps Fund', 'DeepTech Ventures', 'Emerging Startup ETF',
  ];
  return names.map((name, i) => ({
    id: `venture_${i + 1}`,
    name,
    kind: 'venture' as const,
    suggestedBuyUsd: 10000 + i * 2000,
    annualReturnBase: 0.12 + (i % 4) * 0.03,
    volatility: 0.35 + (i % 3) * 0.08,
    dividendYield: 0,
    minCredit: 680,
    description: name,
  }));
}

export const MARKET_INSTRUMENTS: MarketInstrument[] = [
  ...STOCK_NAMES.map(([id, name, ret, vol]) => stock(id, name, ret, vol)),
  ...CRYPTO_NAMES.map(([id, name, ret, vol]) => crypto(id, name, ret, vol)),
  ...buildFunds(),
  ...buildBonds(),
  ...buildCommodities(),
  ...buildReits(),
  ...buildVenture(),
  // Keep legacy ids for old saves
  {
    id: 'stock_index',
    name: 'Stock Portfolio',
    kind: 'stock',
    suggestedBuyUsd: 10000,
    annualReturnBase: 0.08,
    volatility: 0.18,
    dividendYield: 0.015,
    description: 'Broad stock portfolio',
  },
  {
    id: 'mutual_balanced',
    name: 'Balanced Mutual Fund',
    kind: 'mutual_fund',
    suggestedBuyUsd: 5000,
    annualReturnBase: 0.06,
    volatility: 0.08,
    dividendYield: 0.02,
    description: 'Balanced fund',
  },
  {
    id: 'mutual_growth',
    name: 'Growth Mutual Fund',
    kind: 'mutual_fund',
    suggestedBuyUsd: 8000,
    annualReturnBase: 0.09,
    volatility: 0.12,
    dividendYield: 0.01,
    description: 'Growth fund',
  },
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
  kind: i.kind === 'mutual_fund' ? 'mutual_fund' : 'stock',
  baseValueUsd: i.suggestedBuyUsd,
  suggestedBuyUsd: i.suggestedBuyUsd,
  annualReturnBase: i.annualReturnBase,
  volatility: i.volatility,
}));

export const INVESTMENT_MAP: Record<string, InvestmentDef> = Object.fromEntries(
  INVESTMENTS.map((i) => [i.id, i]),
);

export function getInvestmentById(id: string): InvestmentDef | undefined {
  return INVESTMENT_MAP[id] ?? (MARKET_MAP[id]
    ? {
        id: MARKET_MAP[id].id,
        name: MARKET_MAP[id].name,
        kind: MARKET_MAP[id].kind === 'mutual_fund' ? 'mutual_fund' : 'stock',
        baseValueUsd: MARKET_MAP[id].suggestedBuyUsd,
        suggestedBuyUsd: MARKET_MAP[id].suggestedBuyUsd,
        annualReturnBase: MARKET_MAP[id].annualReturnBase,
        volatility: MARKET_MAP[id].volatility,
      }
    : undefined);
}
