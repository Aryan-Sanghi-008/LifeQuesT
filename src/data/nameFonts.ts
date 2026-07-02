import { TextStyle } from 'react-native';
import { FONTS } from '@theme';

export type NameFontId = 'default' | 'serif' | 'script' | 'mono';

export interface NameFontStyle {
  id: NameFontId;
  label: string;
  fontFamily: string;
  letterSpacing?: number;
}

export const NAME_FONT_STYLES: Record<NameFontId, NameFontStyle> = {
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

export function resolveNameFontId(cosmeticId?: string | null): NameFontId {
  if (!cosmeticId) return 'default';
  if (cosmeticId === 'font_serif') return 'serif';
  if (cosmeticId === 'font_script') return 'script';
  if (cosmeticId === 'font_mono') return 'mono';
  return 'default';
}

export function getNameFontTextStyle(fontId: NameFontId): TextStyle {
  const style = NAME_FONT_STYLES[fontId] ?? NAME_FONT_STYLES.default;
  return {
    fontFamily: style.fontFamily,
    letterSpacing: style.letterSpacing,
  };
}
