// ─── Currency Localization Utility ───────────────────────────────────────────
// All currency data derives from countryEconomy.ts — no hardcoded values here.

import { getCountryEconomy } from '@data/countryEconomy';

export function getCurrencyInfo(countryCode: string) {
  const eco = getCountryEconomy(countryCode);
  return {
    symbol: eco.currencySymbol,
    locale: eco.currencyLocale,
    code: eco.currencyCode,
  };
}

/**
 * Format a number as currency for the given country code.
 * e.g. formatCurrency(1500000, 'US') → "$1.5M"
 *      formatCurrency(85000, 'IN')   → "₹85K"
 */
export function formatCurrency(amount: number, countryCode: string): string {
  const { symbol } = getCurrencyInfo(countryCode);

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000)     return `${sign}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)         return `${sign}${symbol}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

/**
 * Format a full precise currency amount (for financial screens).
 * e.g. formatCurrencyFull(85000, 'IN') → "₹85,000"
 */
export function formatCurrencyFull(amount: number, countryCode: string): string {
  const { symbol } = getCurrencyInfo(countryCode);
  return `${symbol}${Math.abs(Math.round(amount)).toLocaleString('en-US')}`;
}

/**
 * Get just the symbol for a country.
 */
export function getCurrencySymbol(countryCode: string): string {
  return getCurrencyInfo(countryCode).symbol;
}

/**
 * Format salary with period (e.g. "per year").
 */
export function formatSalary(annualAmount: number, countryCode: string): string {
  return `${formatCurrency(annualAmount, countryCode)}/yr`;
}
