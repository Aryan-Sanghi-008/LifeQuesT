import { getBreakpointFlags, TABLET_MIN_WIDTH, LARGE_TABLET_MIN_WIDTH } from '../useBreakpoints';

describe('getBreakpointFlags', () => {
  it('uses standard tablet breakpoints', () => {
    expect(TABLET_MIN_WIDTH).toBe(768);
    expect(LARGE_TABLET_MIN_WIDTH).toBe(1024);
  });

  it('marks phone widths as non-tablet', () => {
    const flags = getBreakpointFlags(390);
    expect(flags.isTablet).toBe(false);
    expect(flags.isLargeTablet).toBe(false);
    expect(flags.contentMaxWidth).toBeUndefined();
  });

  it('marks tablet widths with content max width', () => {
    const flags = getBreakpointFlags(800);
    expect(flags.isTablet).toBe(true);
    expect(flags.isLargeTablet).toBe(false);
    expect(flags.contentMaxWidth).toBe(640);
  });

  it('marks large tablet widths with wider content max', () => {
    const flags = getBreakpointFlags(1200);
    expect(flags.isTablet).toBe(true);
    expect(flags.isLargeTablet).toBe(true);
    expect(flags.contentMaxWidth).toBe(720);
  });
});
