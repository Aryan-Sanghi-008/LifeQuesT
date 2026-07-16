import type { TextStyle } from 'react-native';
import { FONTS } from '@theme/themes';

export type FontPackId = 'default' | 'serif' | 'script' | 'mono';

/** @deprecated Prefer FontPackId — kept for Cosmetics / CharacterNameText imports */
export type NameFontId = FontPackId;

/** Mutable font token map (string values — packs may remap families). */
export type FontTokens = { [K in keyof typeof FONTS]: string };

export interface FontPackProfile {
  id: FontPackId;
  label: string;
  /** Display / name letter spacing hint */
  letterSpacing?: number;
  tokens: FontTokens;
}

/** @deprecated Prefer FontPackProfile */
export interface NameFontStyle {
  id: FontPackId;
  label: string;
  fontFamily: string;
  letterSpacing?: number;
}

const DEFAULT_TOKENS: FontTokens = { ...FONTS } as FontTokens;

const SERIF_TOKENS: FontTokens = {
  ...FONTS,
  displayBlack: FONTS.displayBlack,
  displayBold: FONTS.displayBlack,
  display: FONTS.displayBlack,
  displayItal: FONTS.displayItal,
} as FontTokens;

const SCRIPT_TOKENS: FontTokens = {
  ...FONTS,
  displayBlack: FONTS.displayItal,
  displayBold: FONTS.displayItal,
  display: FONTS.displayItal,
  displayItal: FONTS.displayItal,
} as FontTokens;

const MONO_TOKENS: FontTokens = {
  ...FONTS,
  displayBlack: FONTS.monoSemiBold,
  displayBold: FONTS.monoSemiBold,
  display: FONTS.monoSemiBold,
  displayItal: FONTS.monoSemiBold,
  body: FONTS.mono,
  bodyMedium: FONTS.mono,
  bodySemiBold: FONTS.monoSemiBold,
  bodyBold: FONTS.monoSemiBold,
} as FontTokens;

export const FONT_PACK_PROFILES: Record<FontPackId, FontPackProfile> = {
  default: {
    id: 'default',
    label: 'Default',
    tokens: DEFAULT_TOKENS,
  },
  serif: {
    id: 'serif',
    label: 'Serif',
    letterSpacing: 0.3,
    tokens: SERIF_TOKENS,
  },
  script: {
    id: 'script',
    label: 'Script',
    letterSpacing: 0.2,
    tokens: SCRIPT_TOKENS,
  },
  mono: {
    id: 'mono',
    label: 'Mono',
    letterSpacing: 1,
    tokens: MONO_TOKENS,
  },
};

/** @deprecated Prefer FONT_PACK_PROFILES */
export const NAME_FONT_STYLES: Record<
  FontPackId,
  { id: FontPackId; label: string; fontFamily: string; letterSpacing?: number }
> = {
  default: {
    id: 'default',
    label: 'Default',
    fontFamily: FONTS.displayBold,
  },
  serif: {
    id: 'serif',
    label: 'Serif',
    fontFamily: FONTS.displayBlack,
    letterSpacing: 0.3,
  },
  script: {
    id: 'script',
    label: 'Script',
    fontFamily: FONTS.displayItal,
    letterSpacing: 0.2,
  },
  mono: {
    id: 'mono',
    label: 'Mono',
    fontFamily: FONTS.monoSemiBold,
    letterSpacing: 1,
  },
};

export function resolveFontPackId(cosmeticId?: string | null): FontPackId {
  if (!cosmeticId || cosmeticId === 'font_default') return 'default';
  if (cosmeticId === 'font_serif') return 'serif';
  if (cosmeticId === 'font_script') return 'script';
  if (cosmeticId === 'font_mono') return 'mono';
  return 'default';
}

/** @deprecated Prefer resolveFontPackId */
export function resolveNameFontId(cosmeticId?: string | null): FontPackId {
  return resolveFontPackId(cosmeticId);
}

export function applyFontPack(
  baseFonts: typeof FONTS | FontTokens,
  packId: FontPackId,
): FontTokens {
  const profile = FONT_PACK_PROFILES[packId] ?? FONT_PACK_PROFILES.default;
  if (packId === 'default') return { ...baseFonts } as FontTokens;
  return { ...baseFonts, ...profile.tokens } as FontTokens;
}

export function getNameFontTextStyle(fontId: FontPackId): TextStyle {
  const style = NAME_FONT_STYLES[fontId] ?? NAME_FONT_STYLES.default;
  return {
    fontFamily: style.fontFamily,
    letterSpacing: style.letterSpacing,
  };
}
