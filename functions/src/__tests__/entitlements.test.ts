import { grantsForProduct, grantsToUserPatch, avatarStylesForGrants } from '../entitlements';

describe('grantsForProduct', () => {
  it('grants premium and no ads for yearly subscription', () => {
    const grants = grantsForProduct('premium_yearly');
    expect(grants.isPremium).toBe(true);
    expect(grants.hasNoAds).toBe(true);
    expect(grants.luckBoostGrant).toBe(5);
  });

  it('grants season pass without premium', () => {
    const grants = grantsForProduct('season_pass');
    expect(grants.hasSeasonPass).toBe(true);
    expect(grants.isPremium).toBeUndefined();
  });

  it('grants avatar style for avatar packs', () => {
    expect(grantsForProduct('avatar_pack_adventurer').unlockedAvatarStyles).toEqual(['adventurer']);
    expect(grantsForProduct('avatar_pack_lorelei').unlockedAvatarStyles).toEqual(['lorelei']);
    expect(grantsForProduct('avatar_pack_bottts').unlockedAvatarStyles).toEqual(['bottts']);
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
});

describe('avatarStylesForGrants', () => {
  it('extracts avatar styles for arrayUnion', () => {
    const styles = avatarStylesForGrants({
      unlockedAvatarStyles: ['lorelei'],
    });
    expect(styles).toEqual(['lorelei']);
  });
});
