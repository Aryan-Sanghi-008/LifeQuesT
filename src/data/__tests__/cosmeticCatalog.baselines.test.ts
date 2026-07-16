import {
  FREE_BASELINE_COSMETICS,
  isFreeBaselineCosmetic,
  contrastTextForSwatch,
  getThemeCosmeticsByMode,
} from '../cosmeticCatalog';

describe('cosmeticCatalog baselines', () => {
  it('includes free System Default and Classic', () => {
    expect(FREE_BASELINE_COSMETICS.map((c) => c.id)).toEqual([
      'theme_system_default',
      'sound_pack_classic',
      'font_default',
    ]);
    expect(isFreeBaselineCosmetic('theme_system_default')).toBe(true);
    expect(isFreeBaselineCosmetic('sound_pack_classic')).toBe(true);
    expect(isFreeBaselineCosmetic('font_default')).toBe(true);
    expect(isFreeBaselineCosmetic('theme_porcelain')).toBe(false);
  });

  it('puts System Default first in light themes', () => {
    const light = getThemeCosmeticsByMode('light');
    expect(light[0]?.id).toBe('theme_system_default');
    expect(getThemeCosmeticsByMode('dark').some((c) => c.id === 'theme_system_default')).toBe(false);
  });

  it('picks dark text for light swatches', () => {
    const light = contrastTextForSwatch('#F8FAFC');
    expect(light.titleColor).toBe('#0F172A');
    const dark = contrastTextForSwatch('#0F172A');
    expect(dark.titleColor).toBe('#F8FAFC');
  });
});
