/** Minimum touch target per WCAG / platform guidelines (pt/dp). */
export const MIN_TAP_TARGET = 44;

/** Clamp OS font scale to avoid layout breakage at extremes. */
export const MIN_FONT_SCALE = 0.85;
export const MAX_FONT_SCALE = 1.5;

export const FONT_SIZES = {
  xs: 10,
  sm: 11,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  display: 24,
  displayLg: 32,
} as const;

export type FontSizeKey = keyof typeof FONT_SIZES;

export function clampFontScale(scale: number): number {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, scale));
}

export function scaleFontSizes(scale: number): Record<FontSizeKey, number> {
  const clamped = clampFontScale(scale);
  const out = {} as Record<FontSizeKey, number>;
  (Object.keys(FONT_SIZES) as FontSizeKey[]).forEach((key) => {
    out[key] = Math.round(FONT_SIZES[key] * clamped);
  });
  return out;
}

/** Default max multiplier for single-line labels (tabs, badges). */
export const TAB_LABEL_MAX_FONT_SCALE = 1.2;
