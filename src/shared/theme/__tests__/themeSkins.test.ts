import { COLORS, DARK_COLORS, applyThemeSkinTokens, contrastRatio, THEME_SKINS } from '@theme';
import type { ThemeSkinId } from '@theme/themeSkins';

describe('theme skins contrast', () => {
  const skinIds = Object.keys(THEME_SKINS) as Array<Exclude<ThemeSkinId, 'default'>>;

  it.each(skinIds)('%s has readable t1/t2 on bg and bgCard when mode matches', (id) => {
    const skin = THEME_SKINS[id];
    const isDark = skin.mode === 'dark';
    const base = isDark ? DARK_COLORS : COLORS;
    const colors = applyThemeSkinTokens(base, id, isDark);

    expect(contrastRatio(colors.t1, colors.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.t1, colors.bgCard)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.t2, colors.bg)).toBeGreaterThanOrEqual(3.0);
    expect(contrastRatio(colors.t2, colors.bgCard)).toBeGreaterThanOrEqual(3.0);
  });

  it('does not apply dark skin tokens in light mode', () => {
    const colors = applyThemeSkinTokens(COLORS, 'obsidian', false);
    expect(colors.bg).toBe(COLORS.bg);
  });

  it('does not apply light skin tokens in dark mode', () => {
    const colors = applyThemeSkinTokens(DARK_COLORS, 'porcelain', true);
    expect(colors.bg).toBe(DARK_COLORS.bg);
  });
});
