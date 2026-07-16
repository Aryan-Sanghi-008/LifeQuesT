import { createTestCharacter } from '../../test/fixtures/character';
import {
  createPost,
  applyPostToCharacter,
  hireStaff,
  runMonetization,
  tickSocialYear,
  unlockPlatform,
  ensureSocialMedia,
  getStaffMonthlyCostLocal,
  getProductionCostLocal,
} from '@engine/socialMediaEngine';
import { scaleCountryAmount } from '@engine/countryScaleEngine';

describe('socialMediaEngine overhaul', () => {
  it('charges one month payroll per staff on age up, not ×12', () => {
    let char = createTestCharacter({
      age: 22,
      bankBalance: 500_000,
      countryCode: 'IN',
      socialMedia: undefined,
    });
    const hired = hireStaff(char, 'instagram', 'editor');
    expect(hired.ok).toBe(true);
    expect(hired.bankBalance).toBe(char.bankBalance);
    char = {
      ...char,
      socialMedia: hired.state,
      bankBalance: hired.bankBalance ?? char.bankBalance,
    };

    const monthly = getStaffMonthlyCostLocal('editor', 'IN');
    const tick = tickSocialYear({ ...char, age: 23 });
    expect(tick.staffCost).toBe(monthly);
    expect(tick.payrollLines).toHaveLength(1);
    expect(tick.payrollLines[0]?.amount).toBe(monthly);
    expect(tick.staffCost).not.toBe(monthly * 12);
  });

  it('does not reduce bank balance on hire', () => {
    const char = createTestCharacter({ age: 20, bankBalance: 100_000, countryCode: 'IN' });
    const before = char.bankBalance;
    const result = hireStaff(char, 'lifefeed', 'manager');
    expect(result.ok).toBe(true);
    expect(result.bankBalance).toBe(before);
  });

  it('treats marketing spend as local currency without re-scaling', () => {
    const char = createTestCharacter({
      age: 20,
      bankBalance: 1_000_000,
      countryCode: 'IN',
      socialFollowers: 50,
    });
    const marketing = 1500;
    const result = createPost(char, 'Sponsored clip', {
      platformId: 'instagram',
      contentType: 'video',
      marketingSpend: marketing,
    });
    expect(result.post).toBeDefined();
    expect(result.marketingCost).toBe(marketing);
    const prod = getProductionCostLocal('instagram', 'video', 'IN');
    expect(result.post!.cost).toBe(prod + marketing);
    // Must not equal double-scaled marketing
    const wronglyScaled = scaleCountryAmount(marketing, 'IN', 'cost');
    expect(result.marketingCost).not.toBe(wronglyScaled);
  });

  it('appends ledger entries for post production and marketing', () => {
    const char = createTestCharacter({
      age: 20,
      bankBalance: 1_000_000,
      countryCode: 'IN',
    });
    const { post } = createPost(char, 'Hello IG', {
      platformId: 'instagram',
      contentType: 'photo',
      marketingSpend: 200,
    });
    expect(post).toBeDefined();
    const patch = applyPostToCharacter(char, post!);
    const account = patch.socialMedia?.platforms.instagram;
    expect(account?.ledger.some((e) => e.kind === 'marketing')).toBe(true);
    expect(account?.ledger.some((e) => e.kind === 'post_production' || e.amount < 0)).toBe(true);
  });

  it('appends hire ledger with zero amount', () => {
    const char = createTestCharacter({ age: 20, bankBalance: 50_000 });
    const result = hireStaff(char, 'tiktok', 'marketer');
    expect(result.ok).toBe(true);
    const ledger = result.state?.platforms.tiktok?.ledger ?? [];
    expect(ledger.some((e) => e.kind === 'staff_hire' && e.amount === 0)).toBe(true);
  });

  it('unlocks platform at correct age', () => {
    const young = createTestCharacter({ age: 12 });
    expect(unlockPlatform(young, 'linkedin').ok).toBe(false);
    const adult = createTestCharacter({ age: 18 });
    const unlocked = unlockPlatform(adult, 'linkedin');
    expect(unlocked.ok).toBe(true);
    expect(unlocked.state?.platforms.linkedin?.unlocked).toBe(true);
  });

  it('auto-marks platforms unlocked by age in ensureSocialMedia', () => {
    const char = createTestCharacter({ age: 20 });
    const state = ensureSocialMedia(char);
    expect(state.platforms.instagram?.unlocked).toBe(true);
    expect(state.platforms.linkedin?.unlocked).toBe(true);
  });

  it('respects monetization cooldown once per age', () => {
    let char = createTestCharacter({
      age: 22,
      bankBalance: 10_000,
      countryCode: 'US',
    });
    const state = ensureSocialMedia(char);
    const ig = state.platforms.instagram!;
    ig.unlocked = true;
    ig.followers = 10_000;
    ig.subscribers = 2_000;
    ig.totalViews = 50_000;
    ig.totalLikes = 5_000;
    char = { ...char, socialMedia: { ...state, platforms: { ...state.platforms, instagram: ig } } };

    const first = runMonetization(char, 'instagram', 'ads');
    expect(first.ok).toBe(true);
    char = {
      ...char,
      socialMedia: first.state,
      bankBalance: first.bankBalance ?? char.bankBalance,
    };
    const second = runMonetization(char, 'instagram', 'ads');
    expect(second.ok).toBe(false);
    expect(second.message).toMatch(/this year/i);
  });

  it('logs payroll into platform ledger on tick', () => {
    let char = createTestCharacter({ age: 21, bankBalance: 200_000, countryCode: 'US' });
    const hired = hireStaff(char, 'youtube', 'editor');
    char = { ...char, socialMedia: hired.state };
    const tick = tickSocialYear({ ...char, age: 22 });
    const ledger = tick.socialMedia.platforms.youtube?.ledger ?? [];
    expect(ledger.some((e) => e.kind === 'staff_payroll')).toBe(true);
  });
});
