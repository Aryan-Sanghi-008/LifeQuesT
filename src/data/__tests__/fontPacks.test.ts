import {
  applyFontPack,
  resolveFontPackId,
  FONT_PACK_PROFILES,
} from '../fontPacks';
import { FONTS } from '@theme/themes';

describe('fontPacks', () => {
  it('resolves cosmetic ids to pack ids', () => {
    expect(resolveFontPackId(null)).toBe('default');
    expect(resolveFontPackId(undefined)).toBe('default');
    expect(resolveFontPackId('font_default')).toBe('default');
    expect(resolveFontPackId('font_serif')).toBe('serif');
    expect(resolveFontPackId('font_script')).toBe('script');
    expect(resolveFontPackId('font_mono')).toBe('mono');
  });

  it('applyFontPack returns base fonts for default', () => {
    expect(applyFontPack(FONTS, 'default')).toEqual(FONTS);
  });

  it('applyFontPack changes display tokens for serif/script/mono', () => {
    const serif = applyFontPack(FONTS, 'serif');
    expect(serif.displayBold).toBe(FONTS.displayBlack);
    expect(serif.body).toBe(FONTS.body);

    const script = applyFontPack(FONTS, 'script');
    expect(script.displayBold).toBe(FONTS.displayItal);

    const mono = applyFontPack(FONTS, 'mono');
    expect(mono.displayBold).toBe(FONTS.monoSemiBold);
    expect(mono.body).toBe(FONTS.mono);
  });

  it('has a profile for every pack id', () => {
    for (const id of Object.keys(FONT_PACK_PROFILES) as Array<keyof typeof FONT_PACK_PROFILES>) {
      expect(FONT_PACK_PROFILES[id].tokens.displayBold).toBeTruthy();
    }
  });
});
