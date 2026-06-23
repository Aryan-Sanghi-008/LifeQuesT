// ─── Currency Localization Utility ───────────────────────────────────────────
// Maps country code → ISO currency symbol + locale for number formatting.

const COUNTRY_CURRENCY: Record<string, { symbol: string; locale: string; code: string }> = {
  IN: { symbol: '₹', locale: 'en-IN', code: 'INR' },
  US: { symbol: '$', locale: 'en-US', code: 'USD' },
  GB: { symbol: '£', locale: 'en-GB', code: 'GBP' },
  JP: { symbol: '¥', locale: 'ja-JP', code: 'JPY' },
  BR: { symbol: 'R$', locale: 'pt-BR', code: 'BRL' },
  NG: { symbol: '₦', locale: 'en-NG', code: 'NGN' },
  DE: { symbol: '€', locale: 'de-DE', code: 'EUR' },
  AU: { symbol: 'A$', locale: 'en-AU', code: 'AUD' },
  SG: { symbol: 'S$', locale: 'en-SG', code: 'SGD' },
  AE: { symbol: 'د.إ', locale: 'ar-AE', code: 'AED' },
};

const DEFAULT_CURRENCY = COUNTRY_CURRENCY.IN;

export function getCurrencyInfo(countryCode: string) {
  return COUNTRY_CURRENCY[countryCode] ?? DEFAULT_CURRENCY;
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
  return `${sign}${symbol}${abs}`;
}

/**
 * Format a full precise currency amount (for financial screens).
 * e.g. formatCurrencyFull(85000, 'IN') → "₹85,000"
 */
export function formatCurrencyFull(amount: number, countryCode: string): string {
  const { symbol } = getCurrencyInfo(countryCode);
  return `${symbol}${Math.abs(amount).toLocaleString('en-US')}`;
}

/**
 * Get just the symbol for a country.
 */
export function getCurrencySymbol(countryCode: string): string {
  return getCurrencyInfo(countryCode).symbol;
}
