export interface PlayabilityBoost {
  /** Extra multiplier on salary scaling (e.g. 0.15 = +15%). */
  salaryBonus?: number;
  /** Discount on cost scaling (e.g. 0.10 = -10%). */
  costDiscount?: number;
}

export interface CountryEconomyConfig {
  code: string;
  name: string;
  flag: string;

  currencyCode: string;
  currencySymbol: string;
  currencyLocale: string;

  salaryMultiplier: number;
  costOfLivingIndex: number;
  taxRate: number;
  wealthMod: number;

  lifeExpectancy: number;
  crimeSeverityMod: number;

  startingBalance: Record<'poor' | 'middle' | 'wealthy' | 'royalty', number>;

  costs: {
    rent: number;
    groceries: number;
    healthcare: number;
    educationPrimary: number;
    educationUniversity: number;
    carBase: number;
    houseBase: number;
  };

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
    entrepreneur: number;
  };

  stockMarketVolatility: number;
  inflationRate: number;
  propertyAppreciation: number;

  playabilityBoost?: PlayabilityBoost;
}
