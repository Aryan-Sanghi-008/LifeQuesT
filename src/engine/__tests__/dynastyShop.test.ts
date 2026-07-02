import {
  DYNASTY_PERKS,
  countDynastyPerkPurchases,
  getDynastyPerkById,
} from '../../data/dynastyShop';
import { applyDynastyStatMultiplier } from '../economyCapEngine';
import { createTestCharacter } from '../../test/fixtures/character';

describe('dynasty shop', () => {
  it('defines expected perk catalog', () => {
    expect(DYNASTY_PERKS.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        'dynasty_stat_lineage',
        'dynasty_trait_expansion',
        'dynasty_bloodline_bond',
      ]),
    );
  });

  it('counts stacked lineage purchases', () => {
    const ids = ['dynasty_stat_lineage', 'dynasty_stat_lineage'];
    expect(countDynastyPerkPurchases(ids, 'dynasty_stat_lineage')).toBe(2);
  });

  it('returns crest id for crest perks', () => {
    expect(getDynastyPerkById('dynasty_crest_eagle')?.crestId).toBe('eagle');
  });

  it('applyDynastyStatMultiplier scales stats by tier and generation', () => {
    const char = createTestCharacter({ generation: 2 });
    const boosted = applyDynastyStatMultiplier(char.stats, 2, char.generation ?? 1);
    expect(boosted.intelligence).toBeGreaterThan(char.stats.intelligence);
  });
});
