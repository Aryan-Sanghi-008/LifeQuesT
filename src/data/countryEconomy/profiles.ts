/** Compact profiles used to build full CountryEconomyConfig entries. */
import type { PlayabilityBoost } from './types';

export interface CountryProfile {
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
  /** Local nominal scale vs US dollar anchors (rent, house, salaries). */
  currencyScale: number;
  stockMarketVolatility?: number;
  inflationRate?: number;
  propertyAppreciation?: number;
  /** Optional gameplay tuning; auto-derived in buildCountryConfig when omitted. */
  playabilityBoost?: PlayabilityBoost;
}

/** US-dollar anchor template — multiplied by currencyScale and salaryMultiplier. */
export const US_ECONOMY_ANCHOR = {
  startingBalance: { poor: 2_000, middle: 25_000, wealthy: 250_000, royalty: 2_500_000 },
  costs: {
    rent: 18_000,
    groceries: 6_000,
    healthcare: 8_000,
    educationPrimary: 0,
    educationUniversity: 35_000,
    carBase: 28_000,
    houseBase: 380_000,
  },
  salaries: {
    minimumWage: 15_000,
    teacher: 55_000,
    engineer: 95_000,
    doctor: 200_000,
    lawyer: 120_000,
    pilot: 130_000,
    nurse: 75_000,
    chef: 45_000,
    police: 58_000,
    banker: 90_000,
    entrepreneur: 110_000,
  },
  stockMarketVolatility: 1.0,
  inflationRate: 0.03,
  propertyAppreciation: 0.05,
};

/** All 42 selectable birthplaces — existing 10 are overridden with hand-tuned values in countryEconomy.ts. */
export const COUNTRY_PROFILES: CountryProfile[] = [
  // Asia
  { code: 'IN', name: 'India', flag: '🇮🇳', currencyCode: 'INR', currencySymbol: '₹', currencyLocale: 'en-IN', salaryMultiplier: 0.18, costOfLivingIndex: 0.35, taxRate: 0.20, wealthMod: 0, lifeExpectancy: 72, crimeSeverityMod: 0.85, currencyScale: 83 },
  { code: 'CN', name: 'China', flag: '🇨🇳', currencyCode: 'CNY', currencySymbol: '¥', currencyLocale: 'zh-CN', salaryMultiplier: 0.28, costOfLivingIndex: 0.50, taxRate: 0.25, wealthMod: 8, lifeExpectancy: 78, crimeSeverityMod: 0.9, currencyScale: 7.2 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currencyCode: 'JPY', currencySymbol: '¥', currencyLocale: 'ja-JP', salaryMultiplier: 0.35, costOfLivingIndex: 0.75, taxRate: 0.30, wealthMod: 12, lifeExpectancy: 85, crimeSeverityMod: 0.6, currencyScale: 150 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', currencyCode: 'KRW', currencySymbol: '₩', currencyLocale: 'ko-KR', salaryMultiplier: 0.50, costOfLivingIndex: 0.68, taxRate: 0.24, wealthMod: 12, lifeExpectancy: 83, crimeSeverityMod: 0.65, currencyScale: 1300 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currencyCode: 'SGD', currencySymbol: 'S$', currencyLocale: 'en-SG', salaryMultiplier: 0.80, costOfLivingIndex: 0.95, taxRate: 0.17, wealthMod: 22, lifeExpectancy: 84, crimeSeverityMod: 0.5, currencyScale: 1.35 },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currencyCode: 'MYR', currencySymbol: 'RM', currencyLocale: 'ms-MY', salaryMultiplier: 0.22, costOfLivingIndex: 0.42, taxRate: 0.22, wealthMod: 5, lifeExpectancy: 76, crimeSeverityMod: 0.8, currencyScale: 4.7 },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currencyCode: 'THB', currencySymbol: '฿', currencyLocale: 'th-TH', salaryMultiplier: 0.20, costOfLivingIndex: 0.38, taxRate: 0.20, wealthMod: 2, lifeExpectancy: 77, crimeSeverityMod: 0.75, currencyScale: 35 },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', currencyCode: 'VND', currencySymbol: '₫', currencyLocale: 'vi-VN', salaryMultiplier: 0.12, costOfLivingIndex: 0.30, taxRate: 0.18, wealthMod: -2, lifeExpectancy: 75, crimeSeverityMod: 0.8, currencyScale: 24000 },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currencyCode: 'PHP', currencySymbol: '₱', currencyLocale: 'en-PH', salaryMultiplier: 0.14, costOfLivingIndex: 0.32, taxRate: 0.20, wealthMod: -3, lifeExpectancy: 71, crimeSeverityMod: 0.9, currencyScale: 56 },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currencyCode: 'IDR', currencySymbol: 'Rp', currencyLocale: 'id-ID', salaryMultiplier: 0.12, costOfLivingIndex: 0.30, taxRate: 0.22, wealthMod: 0, lifeExpectancy: 72, crimeSeverityMod: 0.85, currencyScale: 15500 },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currencyCode: 'PKR', currencySymbol: '₨', currencyLocale: 'en-PK', salaryMultiplier: 0.10, costOfLivingIndex: 0.28, taxRate: 0.18, wealthMod: -8, lifeExpectancy: 67, crimeSeverityMod: 0.95, currencyScale: 280 },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currencyCode: 'BDT', currencySymbol: '৳', currencyLocale: 'en-BD', salaryMultiplier: 0.09, costOfLivingIndex: 0.26, taxRate: 0.18, wealthMod: -10, lifeExpectancy: 73, crimeSeverityMod: 0.9, currencyScale: 110 },
  // Middle East
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currencyCode: 'AED', currencySymbol: 'د.إ', currencyLocale: 'ar-AE', salaryMultiplier: 0.95, costOfLivingIndex: 1.05, taxRate: 0.00, wealthMod: 25, lifeExpectancy: 78, crimeSeverityMod: 0.55, currencyScale: 3.67 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currencyCode: 'SAR', currencySymbol: '﷼', currencyLocale: 'ar-SA', salaryMultiplier: 0.55, costOfLivingIndex: 0.72, taxRate: 0.00, wealthMod: 20, lifeExpectancy: 75, crimeSeverityMod: 0.7, currencyScale: 3.75 },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', currencyCode: 'TRY', currencySymbol: '₺', currencyLocale: 'tr-TR', salaryMultiplier: 0.18, costOfLivingIndex: 0.40, taxRate: 0.25, wealthMod: 3, lifeExpectancy: 76, crimeSeverityMod: 0.85, currencyScale: 32 },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', currencyCode: 'ILS', currencySymbol: '₪', currencyLocale: 'he-IL', salaryMultiplier: 0.55, costOfLivingIndex: 0.78, taxRate: 0.30, wealthMod: 18, lifeExpectancy: 83, crimeSeverityMod: 0.65, currencyScale: 3.7 },
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currencyCode: 'GBP', currencySymbol: '£', currencyLocale: 'en-GB', salaryMultiplier: 0.82, costOfLivingIndex: 0.90, taxRate: 0.32, wealthMod: 15, lifeExpectancy: 81, crimeSeverityMod: 0.6, currencyScale: 0.79 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currencyCode: 'EUR', currencySymbol: '€', currencyLocale: 'de-DE', salaryMultiplier: 0.85, costOfLivingIndex: 0.85, taxRate: 0.35, wealthMod: 18, lifeExpectancy: 81, crimeSeverityMod: 0.55, currencyScale: 0.92 },
  { code: 'FR', name: 'France', flag: '🇫🇷', currencyCode: 'EUR', currencySymbol: '€', currencyLocale: 'fr-FR', salaryMultiplier: 0.78, costOfLivingIndex: 0.88, taxRate: 0.33, wealthMod: 16, lifeExpectancy: 83, crimeSeverityMod: 0.6, currencyScale: 0.92 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currencyCode: 'EUR', currencySymbol: '€', currencyLocale: 'es-ES', salaryMultiplier: 0.55, costOfLivingIndex: 0.72, taxRate: 0.30, wealthMod: 12, lifeExpectancy: 84, crimeSeverityMod: 0.65, currencyScale: 0.92 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currencyCode: 'EUR', currencySymbol: '€', currencyLocale: 'it-IT', salaryMultiplier: 0.52, costOfLivingIndex: 0.75, taxRate: 0.32, wealthMod: 12, lifeExpectancy: 83, crimeSeverityMod: 0.7, currencyScale: 0.92 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currencyCode: 'EUR', currencySymbol: '€', currencyLocale: 'nl-NL', salaryMultiplier: 0.88, costOfLivingIndex: 0.92, taxRate: 0.37, wealthMod: 18, lifeExpectancy: 82, crimeSeverityMod: 0.5, currencyScale: 0.92 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currencyCode: 'SEK', currencySymbol: 'kr', currencyLocale: 'sv-SE', salaryMultiplier: 0.90, costOfLivingIndex: 0.95, taxRate: 0.38, wealthMod: 20, lifeExpectancy: 83, crimeSeverityMod: 0.45, currencyScale: 10.5 },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currencyCode: 'NOK', currencySymbol: 'kr', currencyLocale: 'nb-NO', salaryMultiplier: 1.05, costOfLivingIndex: 1.10, taxRate: 0.35, wealthMod: 22, lifeExpectancy: 83, crimeSeverityMod: 0.4, currencyScale: 10.8 },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currencyCode: 'CHF', currencySymbol: 'Fr', currencyLocale: 'de-CH', salaryMultiplier: 1.15, costOfLivingIndex: 1.25, taxRate: 0.28, wealthMod: 25, lifeExpectancy: 84, crimeSeverityMod: 0.35, currencyScale: 0.88 },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currencyCode: 'PLN', currencySymbol: 'zł', currencyLocale: 'pl-PL', salaryMultiplier: 0.35, costOfLivingIndex: 0.48, taxRate: 0.28, wealthMod: 8, lifeExpectancy: 78, crimeSeverityMod: 0.7, currencyScale: 4.0 },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', currencyCode: 'RUB', currencySymbol: '₽', currencyLocale: 'ru-RU', salaryMultiplier: 0.25, costOfLivingIndex: 0.42, taxRate: 0.22, wealthMod: 5, lifeExpectancy: 73, crimeSeverityMod: 0.85, currencyScale: 92 },
  // Americas
  { code: 'US', name: 'USA', flag: '🇺🇸', currencyCode: 'USD', currencySymbol: '$', currencyLocale: 'en-US', salaryMultiplier: 1.0, costOfLivingIndex: 1.0, taxRate: 0.28, wealthMod: 20, lifeExpectancy: 77, crimeSeverityMod: 0.75, currencyScale: 1 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currencyCode: 'CAD', currencySymbol: 'C$', currencyLocale: 'en-CA', salaryMultiplier: 0.85, costOfLivingIndex: 0.92, taxRate: 0.30, wealthMod: 18, lifeExpectancy: 82, crimeSeverityMod: 0.55, currencyScale: 1.36 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currencyCode: 'MXN', currencySymbol: '$', currencyLocale: 'es-MX', salaryMultiplier: 0.22, costOfLivingIndex: 0.42, taxRate: 0.25, wealthMod: 0, lifeExpectancy: 75, crimeSeverityMod: 0.9, currencyScale: 17 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currencyCode: 'BRL', currencySymbol: 'R$', currencyLocale: 'pt-BR', salaryMultiplier: 0.22, costOfLivingIndex: 0.45, taxRate: 0.25, wealthMod: -5, lifeExpectancy: 75, crimeSeverityMod: 0.95, currencyScale: 5.0 },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currencyCode: 'ARS', currencySymbol: '$', currencyLocale: 'es-AR', salaryMultiplier: 0.15, costOfLivingIndex: 0.38, taxRate: 0.28, wealthMod: -2, lifeExpectancy: 76, crimeSeverityMod: 0.9, currencyScale: 900 },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currencyCode: 'COP', currencySymbol: '$', currencyLocale: 'es-CO', salaryMultiplier: 0.18, costOfLivingIndex: 0.35, taxRate: 0.24, wealthMod: -5, lifeExpectancy: 77, crimeSeverityMod: 0.9, currencyScale: 4000 },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currencyCode: 'CLP', currencySymbol: '$', currencyLocale: 'es-CL', salaryMultiplier: 0.30, costOfLivingIndex: 0.52, taxRate: 0.26, wealthMod: 2, lifeExpectancy: 80, crimeSeverityMod: 0.7, currencyScale: 900 },
  // Africa
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currencyCode: 'NGN', currencySymbol: '₦', currencyLocale: 'en-NG', salaryMultiplier: 0.08, costOfLivingIndex: 0.25, taxRate: 0.18, wealthMod: -10, lifeExpectancy: 55, crimeSeverityMod: 1.0, currencyScale: 1500 },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currencyCode: 'ZAR', currencySymbol: 'R', currencyLocale: 'en-ZA', salaryMultiplier: 0.20, costOfLivingIndex: 0.38, taxRate: 0.28, wealthMod: -5, lifeExpectancy: 65, crimeSeverityMod: 1.0, currencyScale: 18 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currencyCode: 'EGP', currencySymbol: 'E£', currencyLocale: 'ar-EG', salaryMultiplier: 0.10, costOfLivingIndex: 0.28, taxRate: 0.20, wealthMod: -5, lifeExpectancy: 72, crimeSeverityMod: 0.9, currencyScale: 31 },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currencyCode: 'KES', currencySymbol: 'KSh', currencyLocale: 'en-KE', salaryMultiplier: 0.08, costOfLivingIndex: 0.26, taxRate: 0.22, wealthMod: -8, lifeExpectancy: 67, crimeSeverityMod: 0.95, currencyScale: 130 },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currencyCode: 'GHS', currencySymbol: '₵', currencyLocale: 'en-GH', salaryMultiplier: 0.09, costOfLivingIndex: 0.27, taxRate: 0.20, wealthMod: -8, lifeExpectancy: 65, crimeSeverityMod: 0.9, currencyScale: 12 },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', currencyCode: 'ETB', currencySymbol: 'Br', currencyLocale: 'am-ET', salaryMultiplier: 0.06, costOfLivingIndex: 0.22, taxRate: 0.18, wealthMod: -12, lifeExpectancy: 67, crimeSeverityMod: 0.95, currencyScale: 56 },
  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currencyCode: 'AUD', currencySymbol: 'A$', currencyLocale: 'en-AU', salaryMultiplier: 0.88, costOfLivingIndex: 0.92, taxRate: 0.30, wealthMod: 15, lifeExpectancy: 83, crimeSeverityMod: 0.55, currencyScale: 1.52 },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currencyCode: 'NZD', currencySymbol: 'NZ$', currencyLocale: 'en-NZ', salaryMultiplier: 0.75, costOfLivingIndex: 0.85, taxRate: 0.28, wealthMod: 15, lifeExpectancy: 83, crimeSeverityMod: 0.5, currencyScale: 1.65 },
];
