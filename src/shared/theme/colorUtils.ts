/**
 * Append alpha to a hex color as #RRGGBBAA (React Native supports 8-digit hex).
 * Accepts #RGB or #RRGGBB.
 */
export function withAlpha(hex: string, alpha01: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha01)) * 255)
    .toString(16)
    .padStart(2, '0');
  const raw = hex.replace('#', '');
  if (raw.length === 3) {
    const expanded = raw
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${expanded}${a}`;
  }
  if (raw.length === 6) return `#${raw}${a}`;
  return hex;
}
