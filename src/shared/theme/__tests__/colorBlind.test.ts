import { applyColorBlindMode, simulateHexColor } from '@theme/colorBlind';
import { COLORS } from '@theme/themes';

describe('colorBlind', () => {
  it('returns unchanged hex when mode is none', () => {
    expect(simulateHexColor('#EF4444', 'none')).toBe('#EF4444');
  });

  it('transforms red and green differently for protanopia vs deuteranopia', () => {
    const red = simulateHexColor('#EF4444', 'protanopia');
    const green = simulateHexColor('#10B981', 'protanopia');
    expect(red).not.toBe('#EF4444');
    expect(green).not.toBe('#10B981');
    expect(simulateHexColor('#EF4444', 'deuteranopia')).not.toBe(red);
  });

  it('applyColorBlindMode adjusts stat tokens on palette', () => {
    const adjusted = applyColorBlindMode(COLORS, 'deuteranopia');
    expect(adjusted.health).not.toBe(COLORS.health);
    expect(adjusted.emerald).not.toBe(COLORS.emerald);
    expect(adjusted.bg).toBe(COLORS.bg);
  });
});
