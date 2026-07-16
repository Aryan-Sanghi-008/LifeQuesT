export interface CollectibleDef {
  id: string;
  name: string;
  category: 'art' | 'watch' | 'luxury' | 'memorabilia' | 'wine';
  baseValueUsd: number;
  appreciationPct: number;
  volatility: number;
  happinessBonus: number;
  description: string;
}

const RAW: Array<[string, string, CollectibleDef['category'], number, number, number, number]> = [
  ['art_abstract', 'Abstract Canvas', 'art', 8000, 0.04, 0.15, 4],
  ['art_landscape', 'Landscape Oil', 'art', 12000, 0.05, 0.12, 5],
  ['art_portrait', 'Portrait Study', 'art', 15000, 0.045, 0.14, 5],
  ['art_sculpture', 'Bronze Sculpture', 'art', 22000, 0.05, 0.16, 6],
  ['art_photo', 'Limited Photo Print', 'art', 5000, 0.03, 0.18, 3],
  ['watch_steel', 'Steel Chronograph', 'watch', 6000, 0.02, 0.1, 4],
  ['watch_gold', 'Gold Dress Watch', 'watch', 18000, 0.03, 0.12, 6],
  ['watch_dive', 'Dive Watch', 'watch', 9000, 0.025, 0.11, 5],
  ['watch_pilot', 'Pilot Watch', 'watch', 11000, 0.03, 0.13, 5],
  ['watch_smart', 'Luxury Smartwatch', 'watch', 4000, -0.08, 0.2, 3],
  ['lux_bag', 'Designer Handbag', 'luxury', 3500, 0.01, 0.14, 4],
  ['lux_pen', 'Fountain Pen Set', 'luxury', 2000, 0.02, 0.08, 2],
  ['lux_jewelry', 'Diamond Pendant', 'luxury', 25000, 0.03, 0.1, 7],
  ['lux_cigar', 'Cigar Humidor', 'luxury', 1500, 0.01, 0.09, 2],
  ['lux_perfume', 'Rare Perfume Collection', 'luxury', 2800, -0.05, 0.15, 3],
  ['mem_jersey', 'Signed Jersey', 'memorabilia', 4500, 0.04, 0.2, 4],
  ['mem_card', 'Vintage Card Set', 'memorabilia', 3200, 0.05, 0.22, 3],
  ['mem_poster', 'Concert Poster', 'memorabilia', 1800, 0.03, 0.18, 2],
  ['mem_sneaker', 'Limited Sneakers', 'memorabilia', 2500, 0.02, 0.25, 3],
  ['mem_comic', 'First Edition Comic', 'memorabilia', 7000, 0.06, 0.2, 4],
  ['wine_bordeaux', 'Bordeaux Case', 'wine', 5000, 0.04, 0.12, 3],
  ['wine_champagne', 'Vintage Champagne', 'wine', 3500, 0.03, 0.1, 3],
  ['wine_napa', 'Napa Reserve', 'wine', 4200, 0.035, 0.11, 3],
  ['wine_port', 'Aged Port', 'wine', 2800, 0.03, 0.09, 2],
  ['art_nft_print', 'Digital Art Print', 'art', 1500, 0.02, 0.3, 2],
  ['lux_camera', 'Vintage Camera', 'luxury', 3800, 0.02, 0.12, 3],
  ['watch_skeleton', 'Skeleton Watch', 'watch', 14000, 0.03, 0.14, 6],
  ['mem_guitar', 'Signed Guitar', 'memorabilia', 9000, 0.04, 0.16, 5],
];

export const COLLECTIBLES: CollectibleDef[] = RAW.map(
  ([id, name, category, baseValueUsd, appreciationPct, volatility, happinessBonus]) => ({
    id,
    name,
    category,
    baseValueUsd,
    appreciationPct,
    volatility,
    happinessBonus,
    description: `${name} (${category})`,
  }),
);

export const COLLECTIBLE_MAP = Object.fromEntries(COLLECTIBLES.map((c) => [c.id, c]));

export function getCollectibleById(id: string): CollectibleDef | undefined {
  return COLLECTIBLE_MAP[id];
}
