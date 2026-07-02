import {
  __setRemoteConfigForTests,
  getInterstitialEveryNLives,
  isStarterPackEnabled,
  getDailyRewardMultiplier,
  getFeaturedScenarioId,
} from '@services/remoteConfig';

describe('remoteConfig', () => {
  beforeEach(() => {
    __setRemoteConfigForTests({
      interstitial_every_n_ageups: 3,
      starter_pack_enabled: true,
      daily_reward_multiplier: 1,
      featured_scenario_id: 'classic',
    });
  });

  it('exposes default interstitial frequency', () => {
    expect(getInterstitialEveryNLives()).toBe(3);
  });

  it('reads remote overrides when set', () => {
    __setRemoteConfigForTests({
      interstitial_every_n_ageups: 5,
      starter_pack_enabled: false,
      daily_reward_multiplier: 2,
      featured_scenario_id: 'mars',
    });
    expect(getInterstitialEveryNLives()).toBe(5);
    expect(isStarterPackEnabled()).toBe(false);
    expect(getDailyRewardMultiplier()).toBe(2);
    expect(getFeaturedScenarioId()).toBe('mars');
  });
});
