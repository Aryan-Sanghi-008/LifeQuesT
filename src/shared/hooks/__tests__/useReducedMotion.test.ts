import { mergeReducedMotion } from '../useReducedMotion';

describe('mergeReducedMotion', () => {
  it('returns true when system reduce motion is enabled', () => {
    expect(mergeReducedMotion(true, false)).toBe(true);
  });

  it('returns true when manual setting is enabled', () => {
    expect(mergeReducedMotion(false, true)).toBe(true);
  });

  it('returns true when both are enabled', () => {
    expect(mergeReducedMotion(true, true)).toBe(true);
  });

  it('returns false when neither is enabled', () => {
    expect(mergeReducedMotion(false, false)).toBe(false);
  });
});
