import {
  applyGameplayCoinGrant,
  applyGameplayTicketGrant,
  applyDynastyStatMultiplier,
  applyPremiumCoinBonus,
  driftKarmaTowardNeutral,
  DAILY_GAMEPLAY_COIN_CAP,
  PREMIUM_GAMEPLAY_COIN_MULTIPLIER,
  getGameplayCoinsEarnedToday,
  getGameplayCoinsRemainingToday,
  getTodayKey,
  getIsoWeekKey,
} from '../economyCapEngine';

describe('economyCapEngine', () => {
  it('grants full amount under daily cap', () => {
    const state = { coins: 100, coinsEarnedToday: 0, coinsEarnDate: getTodayKey() };
    const result = applyGameplayCoinGrant(state, 500);
    expect(result.granted).toBe(500);
    expect(result.hitCap).toBe(false);
    expect(state.coins).toBe(600);
  });

  it('partial grant when exceeding daily cap', () => {
    const today = getTodayKey();
    const state = { coins: 0, coinsEarnedToday: 4800, coinsEarnDate: today };
    const result = applyGameplayCoinGrant(state, 500, today);
    expect(result.granted).toBe(200);
    expect(result.hitCap).toBe(true);
    expect(state.coinsEarnedToday).toBe(DAILY_GAMEPLAY_COIN_CAP);
  });

  it('resets daily counter on new date', () => {
    const state = { coins: 0, coinsEarnedToday: 5000, coinsEarnDate: '2020-01-01' };
    const result = applyGameplayCoinGrant(state, 100, getTodayKey());
    expect(result.granted).toBe(100);
    expect(state.coinsEarnDate).toBe(getTodayKey());
  });

  it('getGameplayCoinsEarnedToday returns 0 on stale date', () => {
    const state = { coins: 0, coinsEarnedToday: 4000, coinsEarnDate: '2020-01-01' };
    expect(getGameplayCoinsEarnedToday(state)).toBe(0);
  });

  it('getGameplayCoinsRemainingToday reflects earned amount', () => {
    const today = getTodayKey();
    const state = { coins: 0, coinsEarnedToday: 1200, coinsEarnDate: today };
    expect(getGameplayCoinsRemainingToday(state, today)).toBe(DAILY_GAMEPLAY_COIN_CAP - 1200);
  });

  it('caps weekly ticket grants', () => {
    const week = getIsoWeekKey();
    const state = { mysteryTickets: 0, ticketsEarnedThisWeek: 4, ticketsEarnWeek: week };
    const result = applyGameplayTicketGrant(state, 3, week);
    expect(result.granted).toBe(1);
    expect(result.hitCap).toBe(true);
    expect(state.mysteryTickets).toBe(1);
  });

  it('drifts karma toward neutral', () => {
    expect(driftKarmaTowardNeutral(60)).toBe(58);
    expect(driftKarmaTowardNeutral(40)).toBe(42);
    expect(driftKarmaTowardNeutral(50)).toBe(50);
  });

  it('applies dynasty stat multiplier by tier and generation', () => {
    const base = {
      health: 60,
      happiness: 60,
      intelligence: 60,
      wealth: 40,
      fitness: 60,
      looks: 60,
      social: 60,
      ambition: 60,
      mentalHealth: 60,
    };
    const boosted = applyDynastyStatMultiplier(base, 2, 3);
    expect(boosted.health).toBeGreaterThan(base.health);
    expect(boosted.wealth).toBe(base.wealth);
  });

  it('applyPremiumCoinBonus multiplies gameplay coins for premium users', () => {
    expect(applyPremiumCoinBonus(100, true)).toBe(150);
    expect(applyPremiumCoinBonus(100, false)).toBe(100);
    expect(applyPremiumCoinBonus(0, true)).toBe(0);
    expect(PREMIUM_GAMEPLAY_COIN_MULTIPLIER).toBe(1.5);
  });
});
