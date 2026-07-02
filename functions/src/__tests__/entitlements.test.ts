import { grantsForProduct, grantsToUserPatch, avatarStylesForGrants, scenarioIdsForGrants } from '../entitlements';

describe('grantsForProduct', () => {
  it('grants premium and no ads for yearly subscription', () => {
    const grants = grantsForProduct('premium_yearly');
    expect(grants.isPremium).toBe(true);
    expect(grants.hasNoAds).toBe(true);
    expect(grants.luckBoostGrant).toBe(5);
    expect(grants.hasSeasonPass).toBe(true);
  });

  it('grants premium monthly with season pass', () => {
    const grants = grantsForProduct('premium_monthly');
    expect(grants.isPremium).toBe(true);
    expect(grants.hasSeasonPass).toBe(true);
  });

  it('grants starter pack gems, no ads, and silver spoon', () => {
    const grants = grantsForProduct('starter_pack');
    expect(grants.gemsGrant).toBe(50);
    expect(grants.hasNoAds).toBe(true);
    expect(grants.unlockedScenarioIds).toEqual(['silver_spoon']);
  });

  it('grants season pass without premium', () => {
    const grants = grantsForProduct('season_pass');
    expect(grants.hasSeasonPass).toBe(true);
    expect(grants.isPremium).toBeUndefined();
  });

  it('grants avatar style for avatar packs', () => {
    expect(grantsForProduct('avatar_pack_adventurer').unlockedAvatarStyles).toEqual(['adventurer', 'adventurer-neutral']);
    expect(grantsForProduct('avatar_pack_lorelei').unlockedAvatarStyles).toEqual(['lorelei', 'lorelei-neutral']);
    expect(grantsForProduct('avatar_pack_notionists').unlockedAvatarStyles).toEqual(['notionists']);
  });

  it('grants all avatar styles for avatar bundle', () => {
    const grants = grantsForProduct('avatar_bundle_all');
    expect(grants.unlockedAvatarStyles).toHaveLength(7);
  });

  it('grants scenario unlock for individual scenario SKUs', () => {
    expect(grantsForProduct('scenario_royal').unlockedScenarioIds).toEqual(['royal']);
    expect(grantsForProduct('scenario_cyber').unlockedScenarioIds).toEqual(['cyber']);
  });

  it('grants all premium scenarios for scenario_pack_all', () => {
    const grants = grantsForProduct('scenario_pack_all');
    expect(grants.unlockedScenarioIds).toEqual([
      'royal', 'crime', 'cyber', 'medieval', 'zombie', 'mars', 'celebrity', 'fantasy', 'political',
    ]);
  });
});

describe('grantsToUserPatch', () => {
  it('maps season pass to hasSeasonPass field', () => {
    const patch = grantsToUserPatch({ hasSeasonPass: true });
    expect(patch).toEqual({ hasSeasonPass: true });
  });

  it('does not include avatar styles in patch', () => {
    const patch = grantsToUserPatch({
      unlockedAvatarStyles: ['adventurer'],
    });
    expect(patch).toEqual({});
  });

  it('does not include scenario ids in patch', () => {
    const patch = grantsToUserPatch({
      unlockedScenarioIds: ['royal'],
    });
    expect(patch).toEqual({});
  });
});

describe('avatarStylesForGrants', () => {
  it('extracts avatar styles for arrayUnion', () => {
    const styles = avatarStylesForGrants({
      unlockedAvatarStyles: ['lorelei'],
    });
    expect(styles).toEqual(['lorelei']);
  });
});

describe('scenarioIdsForGrants', () => {
  it('extracts scenario ids for arrayUnion', () => {
    const ids = scenarioIdsForGrants({
      unlockedScenarioIds: ['royal', 'mars'],
    });
    expect(ids).toEqual(['royal', 'mars']);
  });

  it('returns empty array when no scenario grants', () => {
    expect(scenarioIdsForGrants({})).toEqual([]);
  });
});
