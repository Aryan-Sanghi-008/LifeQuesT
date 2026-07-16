import { COUNTRIES } from '../gameData';
import { COUNTRY_ECONOMY, getCountryEconomy, getLifeExpectancy, getMaxPersonalDebt } from '../countryEconomy';
import {
  scaleEventBankEffect,
  scaleFineAmount,
  scaleCountryAmount,
  getPlayabilityMetrics,
} from '../../engine/countryScaleEngine';

const ENGINEER_USD_ANCHOR = 95_000;

describe('countryEconomy', () => {
  it('has a config entry for every selectable birthplace', () => {
    for (const c of COUNTRIES) {
      expect(COUNTRY_ECONOMY[c.code]).toBeDefined();
      expect(COUNTRY_ECONOMY[c.code].code).toBe(c.code);
    }
  });

  it('does not silently fall back to India for known countries', () => {
    expect(getCountryEconomy('CN').currencyCode).toBe('CNY');
    expect(getCountryEconomy('FR').currencyCode).toBe('EUR');
    expect(getCountryEconomy('NZ').currencyCode).toBe('NZD');
  });

  it('includes lifeExpectancy on all configs', () => {
    for (const c of COUNTRIES) {
      const eco = getCountryEconomy(c.code);
      expect(eco.lifeExpectancy).toBeGreaterThanOrEqual(50);
      expect(eco.lifeExpectancy).toBeLessThanOrEqual(90);
    }
  });

  it('getLifeExpectancy returns country-specific values', () => {
    expect(getLifeExpectancy('JP')).toBeGreaterThan(getLifeExpectancy('NG'));
    expect(getLifeExpectancy('US')).toBe(77);
  });

  it('India and US have different salary multipliers', () => {
    expect(getCountryEconomy('US').salaryMultiplier).toBeGreaterThan(
      getCountryEconomy('IN').salaryMultiplier,
    );
    expect(getCountryEconomy('IN').salaries.engineer).toBeGreaterThan(
      getCountryEconomy('IN').salaries.minimumWage,
    );
  });

  it('scaleEventBankEffect scales fines and gifts by country', () => {
    const usFine = scaleFineAmount(-10000, 'US');
    const inFine = scaleFineAmount(-10000, 'IN');
    expect(Math.abs(inFine)).not.toBe(Math.abs(usFine));

    const usGift = scaleEventBankEffect(50000, 'US', 'gift');
    const inGift = scaleEventBankEffect(50000, 'IN', 'gift');
    expect(inGift).not.toBe(usGift);
  });

  it('getCountrySalary path scales India engineer salary with currencyScale', () => {
    const usSalary = scaleCountryAmount(ENGINEER_USD_ANCHOR, 'US', 'salary');
    const inSalary = scaleCountryAmount(ENGINEER_USD_ANCHOR, 'IN', 'salary');
    expect(inSalary).toBeGreaterThan(usSalary * 5);
    expect(inSalary).toBeGreaterThan(500_000);
  });

  it('getMaxPersonalDebt scales by 100× base and family background', () => {
    const middle = getMaxPersonalDebt('US', 'middle');
    const poor = getMaxPersonalDebt('US', 'poor');
    const royalty = getMaxPersonalDebt('US', 'royalty');
    expect(middle).toBeGreaterThan(0);
    expect(poor).toBe(Math.round(middle * 0.5));
    expect(royalty).toBe(middle * 4);
    expect(royalty).toBeGreaterThan(middle * 3);
  });

  describe('playability per birthplace', () => {
    for (const c of COUNTRIES) {
      it(`${c.code}: engineer can afford stock within 36 months gross`, () => {
        const metrics = getPlayabilityMetrics(c.code);
        expect(metrics.engineerSalary).toBeGreaterThan(0);
        expect(metrics.stockMin).toBeGreaterThan(0);
        expect(metrics.engineerSalary / metrics.stockMin).toBeGreaterThanOrEqual(1);
        expect(metrics.monthsToStock).toBeLessThanOrEqual(36);
      });
    }
  });
});
