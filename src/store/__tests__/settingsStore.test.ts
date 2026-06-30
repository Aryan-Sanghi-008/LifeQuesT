import { useSettingsStore } from '@store/settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetToDefaults();
  });

  it('setColorScheme updates theme preference', () => {
    useSettingsStore.getState().setColorScheme('dark');
    expect(useSettingsStore.getState().colorScheme).toBe('dark');
  });

  it('setOnboardingComplete persists flag', () => {
    useSettingsStore.getState().setOnboardingComplete(true);
    expect(useSettingsStore.getState().onboardingComplete).toBe(true);
  });

  it('setAgeGateVerified stores age', () => {
    useSettingsStore.getState().setAgeGateVerified(18);
    const state = useSettingsStore.getState();
    expect(state.ageGateVerified).toBe(true);
    expect(state.verifiedAge).toBe(18);
  });

  it('setReducedMotion toggles accessibility setting', () => {
    useSettingsStore.getState().setReducedMotion(true);
    expect(useSettingsStore.getState().reducedMotion).toBe(true);
  });
});
