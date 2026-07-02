let interstitialEveryNLives = 3;
let starterPackEnabled = true;
let dailyRewardMultiplier = 1;
let featuredScenarioId = 'classic';
let initialized = false;

const DEFAULTS = {
  interstitial_every_n_ageups: 3,
  starter_pack_enabled: true,
  daily_reward_multiplier: 1,
  featured_scenario_id: 'classic',
};

function getRemoteConfigModule() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-firebase/remote-config').default as typeof import('@react-native-firebase/remote-config').default;
  } catch {
    return null;
  }
}

function applyValues(values: typeof DEFAULTS): void {
  interstitialEveryNLives = Math.max(1, Math.floor(values.interstitial_every_n_ageups));
  starterPackEnabled = values.starter_pack_enabled;
  dailyRewardMultiplier = Math.max(0.1, values.daily_reward_multiplier);
  featuredScenarioId = values.featured_scenario_id || 'classic';
}

export async function initRemoteConfig(): Promise<void> {
  if (initialized) return;
  applyValues(DEFAULTS);

  const rc = getRemoteConfigModule();
  if (!rc) {
    initialized = true;
    return;
  }

  try {
    await rc().setDefaults(DEFAULTS);
    await rc().setConfigSettings({ minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000 });
    await rc().fetchAndActivate();
    applyValues({
      interstitial_every_n_ageups: rc().getValue('interstitial_every_n_ageups').asNumber(),
      starter_pack_enabled: rc().getValue('starter_pack_enabled').asBoolean(),
      daily_reward_multiplier: rc().getValue('daily_reward_multiplier').asNumber(),
      featured_scenario_id: rc().getValue('featured_scenario_id').asString(),
    });
  } catch (e) {
    if (__DEV__) console.warn('[remoteConfig] fetch failed — using defaults', e);
  }
  initialized = true;
}

export function getInterstitialEveryNLives(): number {
  return interstitialEveryNLives;
}

export function isStarterPackEnabled(): boolean {
  return starterPackEnabled;
}

export function getDailyRewardMultiplier(): number {
  return dailyRewardMultiplier;
}

export function getFeaturedScenarioId(): string {
  return featuredScenarioId;
}

/** Test helper */
export function __setRemoteConfigForTests(values: Partial<typeof DEFAULTS>): void {
  applyValues({ ...DEFAULTS, ...values });
  initialized = true;
}
