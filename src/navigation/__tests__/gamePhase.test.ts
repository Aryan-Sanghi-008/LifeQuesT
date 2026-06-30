import { resolveRootRoute } from '@navigation/gamePhase';

describe('resolveRootRoute', () => {
  const base = {
    user: null,
    character: null,
    pendingReincarnation: false,
    onboardingComplete: false,
    ageGateVerified: false,
  };

  it('routes to Onboarding when not complete and no user', () => {
    expect(resolveRootRoute(base)).toBe('Onboarding');
  });

  it('routes to AgeGate after onboarding', () => {
    expect(resolveRootRoute({ ...base, onboardingComplete: true })).toBe('AgeGate');
  });

  it('routes to Auth after age gate', () => {
    expect(resolveRootRoute({ ...base, onboardingComplete: true, ageGateVerified: true })).toBe('Auth');
  });

  it('skips onboarding for existing users', () => {
    expect(
      resolveRootRoute({
        ...base,
        user: { uid: 'u1', displayName: 'A', email: null, photoURL: null, isGuest: true },
      }),
    ).toBe('SaveSlots');
  });
});
