// ─── LifeQuest Country Economy System ────────────────────────────────────────
// Single source of truth for all country-specific economic data.
// Every financial value in the game MUST derive from this config.

export interface CountryEconomyConfig {
  code: string;
  name: string;
  flag: string;

  // Currency
  currencyCode: string;        // ISO 4217 e.g. 'USD'
  currencySymbol: string;      // Display symbol e.g. '$'
  currencyLocale: string;      // For Intl.NumberFormat e.g. 'en-US'

  // Economic modifiers (multipliers relative to base)
  salaryMultiplier: number;    // 1.0 = base; 1.5 = 50% higher salaries
  costOfLivingIndex: number;   // 1.0 = base; higher = more expensive
  taxRate: number;             // 0.0–0.6 (income tax %)
  wealthMod: number;           // Starting wealth modifier (legacy compat)

  // Starting bank balance (in local currency units)
  startingBalance: Record<'poor' | 'middle' | 'wealthy' | 'royalty', number>;

  // Major cost anchors (annual, in local currency)
  costs: {
    rent: number;              // Annual rent/housing cost
    groceries: number;         // Annual groceries
    healthcare: number;        // Annual basic healthcare
    educationPrimary: number;  // Annual primary school (public = 0)
    educationUniversity: number; // Annual university fees
    carBase: number;           // Base car price
    houseBase: number;         // Base house/apartment price
  };

  // Salary benchmarks (annual gross, in local currency)
  salaries: {
    minimumWage: number;
    teacher: number;
    engineer: number;
    doctor: number;
    lawyer: number;
    pilot: number;
    nurse: number;
    chef: number;
    police: number;
    banker: number;
    entrepreneur: number;      // Expected annual profit
  };

  // Investment context
  stockMarketVolatility: number; // 0.5 = stable, 2.0 = volatile
  inflationRate: number;         // Annual % e.g. 0.04 = 4%
  propertyAppreciation: number;  // Annual % e.g. 0.06 = 6%
}

// ─── Country Configurations ───────────────────────────────────────────────────

export const COUNTRY_ECONOMY: Record<string, CountryEconomyConfig> = {

  IN: {
    code: 'IN', name: 'India', flag: '🇮🇳',
    currencyCode: 'INR', currencySymbol: '₹', currencyLocale: 'en-IN',
    salaryMultiplier: 0.18, costOfLivingIndex: 0.35, taxRate: 0.20, wealthMod: 0,
    startingBalance: { poor: 5_000, middle: 50_000, wealthy: 5_00_000, royalty: 50_00_000 },
    costs: {
      rent: 1_80_000, groceries: 60_000, healthcare: 30_000,
      educationPrimary: 0, educationUniversity: 2_00_000,
      carBase: 6_00_000, houseBase: 40_00_000,
    },
    salaries: {
      minimumWage: 1_20_000, teacher: 3_60_000, engineer: 7_00_000,
      doctor: 12_00_000, lawyer: 8_00_000, pilot: 25_00_000,
      nurse: 3_00_000, chef: 2_40_000, police: 2_40_000, banker: 6_00_000,
      entrepreneur: 8_00_000,
    },
    stockMarketVolatility: 1.4, inflationRate: 0.06, propertyAppreciation: 0.08,
  },

  US: {
    code: 'US', name: 'USA', flag: '🇺🇸',
    currencyCode: 'USD', currencySymbol: '$', currencyLocale: 'en-US',
    salaryMultiplier: 1.0, costOfLivingIndex: 1.0, taxRate: 0.28, wealthMod: 20,
    startingBalance: { poor: 2_000, middle: 25_000, wealthy: 2_50_000, royalty: 2_500_000 },
    costs: {
      rent: 18_000, groceries: 6_000, healthcare: 8_000,
      educationPrimary: 0, educationUniversity: 35_000,
      carBase: 28_000, houseBase: 380_000,
    },
    salaries: {
      minimumWage: 15_000, teacher: 55_000, engineer: 95_000,
      doctor: 200_000, lawyer: 120_000, pilot: 130_000,
      nurse: 75_000, chef: 45_000, police: 58_000, banker: 90_000,
      entrepreneur: 110_000,
    },
    stockMarketVolatility: 1.0, inflationRate: 0.03, propertyAppreciation: 0.05,
  },

  GB: {
    code: 'GB', name: 'UK', flag: '🇬🇧',
    currencyCode: 'GBP', currencySymbol: '£', currencyLocale: 'en-GB',
    salaryMultiplier: 0.82, costOfLivingIndex: 0.9, taxRate: 0.32, wealthMod: 15,
    startingBalance: { poor: 1_500, middle: 20_000, wealthy: 200_000, royalty: 2_000_000 },
    costs: {
      rent: 15_000, groceries: 5_000, healthcare: 1_500,
      educationPrimary: 0, educationUniversity: 9_250,
      carBase: 22_000, houseBase: 285_000,
    },
    salaries: {
      minimumWage: 19_000, teacher: 38_000, engineer: 55_000,
      doctor: 90_000, lawyer: 80_000, pilot: 95_000,
      nurse: 32_000, chef: 28_000, police: 34_000, banker: 65_000,
      entrepreneur: 70_000,
    },
    stockMarketVolatility: 0.9, inflationRate: 0.04, propertyAppreciation: 0.04,
  },

  JP: {
    code: 'JP', name: 'Japan', flag: '🇯🇵',
    currencyCode: 'JPY', currencySymbol: '¥', currencyLocale: 'ja-JP',
    salaryMultiplier: 0.35, costOfLivingIndex: 0.75, taxRate: 0.30, wealthMod: 12,
    startingBalance: { poor: 200_000, middle: 2_000_000, wealthy: 20_000_000, royalty: 200_000_000 },
    costs: {
      rent: 1_500_000, groceries: 600_000, healthcare: 200_000,
      educationPrimary: 0, educationUniversity: 800_000,
      carBase: 2_500_000, houseBase: 30_000_000,
    },
    salaries: {
      minimumWage: 1_600_000, teacher: 4_500_000, engineer: 6_000_000,
      doctor: 14_000_000, lawyer: 10_000_000, pilot: 12_000_000,
      nurse: 4_200_000, chef: 3_500_000, police: 4_800_000, banker: 8_000_000,
      entrepreneur: 7_000_000,
    },
    stockMarketVolatility: 1.1, inflationRate: 0.02, propertyAppreciation: 0.02,
  },

  BR: {
    code: 'BR', name: 'Brazil', flag: '🇧🇷',
    currencyCode: 'BRL', currencySymbol: 'R$', currencyLocale: 'pt-BR',
    salaryMultiplier: 0.22, costOfLivingIndex: 0.45, taxRate: 0.25, wealthMod: -5,
    startingBalance: { poor: 3_000, middle: 30_000, wealthy: 300_000, royalty: 3_000_000 },
    costs: {
      rent: 12_000, groceries: 5_000, healthcare: 4_000,
      educationPrimary: 0, educationUniversity: 15_000,
      carBase: 80_000, houseBase: 450_000,
    },
    salaries: {
      minimumWage: 15_000, teacher: 36_000, engineer: 80_000,
      doctor: 180_000, lawyer: 120_000, pilot: 200_000,
      nurse: 42_000, chef: 30_000, police: 48_000, banker: 90_000,
      entrepreneur: 100_000,
    },
    stockMarketVolatility: 1.8, inflationRate: 0.07, propertyAppreciation: 0.06,
  },

  NG: {
    code: 'NG', name: 'Nigeria', flag: '🇳🇬',
    currencyCode: 'NGN', currencySymbol: '₦', currencyLocale: 'en-NG',
    salaryMultiplier: 0.08, costOfLivingIndex: 0.25, taxRate: 0.18, wealthMod: -10,
    startingBalance: { poor: 50_000, middle: 500_000, wealthy: 5_000_000, royalty: 50_000_000 },
    costs: {
      rent: 600_000, groceries: 300_000, healthcare: 150_000,
      educationPrimary: 0, educationUniversity: 800_000,
      carBase: 8_000_000, houseBase: 40_000_000,
    },
    salaries: {
      minimumWage: 540_000, teacher: 1_500_000, engineer: 4_000_000,
      doctor: 8_000_000, lawyer: 6_000_000, pilot: 15_000_000,
      nurse: 2_000_000, chef: 1_200_000, police: 1_500_000, banker: 5_000_000,
      entrepreneur: 5_000_000,
    },
    stockMarketVolatility: 2.0, inflationRate: 0.18, propertyAppreciation: 0.10,
  },

  DE: {
    code: 'DE', name: 'Germany', flag: '🇩🇪',
    currencyCode: 'EUR', currencySymbol: '€', currencyLocale: 'de-DE',
    salaryMultiplier: 0.85, costOfLivingIndex: 0.85, taxRate: 0.35, wealthMod: 18,
    startingBalance: { poor: 2_000, middle: 22_000, wealthy: 220_000, royalty: 2_200_000 },
    costs: {
      rent: 12_000, groceries: 5_000, healthcare: 2_000,
      educationPrimary: 0, educationUniversity: 1_000,
      carBase: 26_000, houseBase: 350_000,
    },
    salaries: {
      minimumWage: 22_000, teacher: 52_000, engineer: 65_000,
      doctor: 95_000, lawyer: 75_000, pilot: 105_000,
      nurse: 38_000, chef: 30_000, police: 42_000, banker: 70_000,
      entrepreneur: 80_000,
    },
    stockMarketVolatility: 0.85, inflationRate: 0.03, propertyAppreciation: 0.04,
  },

  AU: {
    code: 'AU', name: 'Australia', flag: '🇦🇺',
    currencyCode: 'AUD', currencySymbol: 'A$', currencyLocale: 'en-AU',
    salaryMultiplier: 0.88, costOfLivingIndex: 0.92, taxRate: 0.30, wealthMod: 15,
    startingBalance: { poor: 3_000, middle: 30_000, wealthy: 300_000, royalty: 3_000_000 },
    costs: {
      rent: 20_000, groceries: 7_000, healthcare: 2_000,
      educationPrimary: 0, educationUniversity: 12_000,
      carBase: 32_000, houseBase: 700_000,
    },
    salaries: {
      minimumWage: 28_000, teacher: 75_000, engineer: 100_000,
      doctor: 180_000, lawyer: 130_000, pilot: 140_000,
      nurse: 80_000, chef: 55_000, police: 75_000, banker: 95_000,
      entrepreneur: 110_000,
    },
    stockMarketVolatility: 0.95, inflationRate: 0.035, propertyAppreciation: 0.07,
  },

  SG: {
    code: 'SG', name: 'Singapore', flag: '🇸🇬',
    currencyCode: 'SGD', currencySymbol: 'S$', currencyLocale: 'en-SG',
    salaryMultiplier: 0.80, costOfLivingIndex: 0.95, taxRate: 0.17, wealthMod: 22,
    startingBalance: { poor: 5_000, middle: 50_000, wealthy: 500_000, royalty: 5_000_000 },
    costs: {
      rent: 24_000, groceries: 7_000, healthcare: 2_000,
      educationPrimary: 0, educationUniversity: 15_000,
      carBase: 120_000, houseBase: 800_000,
    },
    salaries: {
      minimumWage: 18_000, teacher: 65_000, engineer: 80_000,
      doctor: 200_000, lawyer: 120_000, pilot: 150_000,
      nurse: 55_000, chef: 40_000, police: 50_000, banker: 100_000,
      entrepreneur: 120_000,
    },
    stockMarketVolatility: 0.8, inflationRate: 0.025, propertyAppreciation: 0.06,
  },

  AE: {
    code: 'AE', name: 'UAE', flag: '🇦🇪',
    currencyCode: 'AED', currencySymbol: 'د.إ', currencyLocale: 'ar-AE',
    salaryMultiplier: 0.95, costOfLivingIndex: 1.05, taxRate: 0.00, wealthMod: 25, // No income tax!
    startingBalance: { poor: 10_000, middle: 100_000, wealthy: 1_000_000, royalty: 10_000_000 },
    costs: {
      rent: 60_000, groceries: 18_000, healthcare: 10_000,
      educationPrimary: 0, educationUniversity: 50_000,
      carBase: 80_000, houseBase: 1_200_000,
    },
    salaries: {
      minimumWage: 0, teacher: 90_000, engineer: 160_000,
      doctor: 350_000, lawyer: 200_000, pilot: 300_000,
      nurse: 100_000, chef: 80_000, police: 90_000, banker: 180_000,
      entrepreneur: 200_000,
    },
    stockMarketVolatility: 1.2, inflationRate: 0.025, propertyAppreciation: 0.08,
  },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

/** Get economy config for a country (falls back to India) */
export function getCountryEconomy(countryCode: string): CountryEconomyConfig {
  return COUNTRY_ECONOMY[countryCode] ?? COUNTRY_ECONOMY.IN;
}

/** Get the salary for a role adjusted for country */
export function getSalaryForCountry(
  roleKey: keyof CountryEconomyConfig['salaries'],
  countryCode: string,
): number {
  const eco = getCountryEconomy(countryCode);
  return eco.salaries[roleKey] ?? eco.salaries.minimumWage;
}

/** Get starting bank balance for family background + country */
export function getStartingBalance(
  background: 'poor' | 'middle' | 'wealthy' | 'royalty',
  countryCode: string,
): number {
  return getCountryEconomy(countryCode).startingBalance[background];
}

/** Regional personal debt ceiling (cash + asset debt) */
export function getMaxPersonalDebt(countryCode: string): number {
  const eco = getCountryEconomy(countryCode);
  const wageBase = eco.salaries.minimumWage > 0
    ? eco.salaries.minimumWage
    : eco.salaries.teacher;
  return Math.round(wageBase * 3 * Math.max(0.5, eco.costOfLivingIndex));
}

/** Apply country tax rate to a gross salary */
export function applyTax(grossSalary: number, countryCode: string): number {
  const eco = getCountryEconomy(countryCode);
  return Math.round(grossSalary * (1 - eco.taxRate));
}

/** Get annual cost of living total for a country */
export function getAnnualCostOfLiving(countryCode: string): number {
  const eco = getCountryEconomy(countryCode);
  return eco.costs.rent + eco.costs.groceries + eco.costs.healthcare;
}
