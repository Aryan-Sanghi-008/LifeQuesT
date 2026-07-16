import { rollPropertyDisaster, applyPropertyHappinessBonus } from '../housingEngine';
import { createTestCharacter } from '../../test/fixtures/character';

describe('housingEngine property hooks', () => {
  it('applyPropertyHappinessBonus adds property happiness', () => {
    const character = createTestCharacter({
      stats: { ...createTestCharacter().stats, happiness: 50 },
      assets: [{
        id: 'p1',
        type: 'property',
        name: 'Test Home',
        value: 200000,
        purchasedAge: 25,
        propertyDefId: 'prop_basic_1bhk',
      }],
    });
    const next = applyPropertyHappinessBonus(character);
    expect(next).toBeGreaterThan(50);
  });

  it('rollPropertyDisaster may reduce property value', () => {
    const asset = {
      id: 'p1',
      type: 'property' as const,
      name: 'Home',
      value: 100000,
      purchasedAge: 30,
    };
    let reduced = false;
    for (let i = 0; i < 200; i++) {
      const result = rollPropertyDisaster(asset);
      if (result && result.value < asset.value) {
        reduced = true;
        break;
      }
    }
    expect(reduced).toBe(true);
  });
});
