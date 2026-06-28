import type { PropertyDef, PropertyTier } from '../types';

const TIER_CONFIG: Record<PropertyTier, {
  valueRange: [number, number];
  downPaymentPct: number;
  mortgageRate: number;
  maintenancePct: number;
  appreciationPct: number;
  happinessBonus: number;
  minAge: number;
}> = {
  shelter: { valueRange: [50000, 120000], downPaymentPct: 0.1, mortgageRate: 0.08, maintenancePct: 0.02, appreciationPct: 0.01, happinessBonus: -5, minAge: 18 },
  basic: { valueRange: [800000, 2500000], downPaymentPct: 0.15, mortgageRate: 0.065, maintenancePct: 0.015, appreciationPct: 0.03, happinessBonus: 2, minAge: 18 },
  mid: { valueRange: [3000000, 8000000], downPaymentPct: 0.2, mortgageRate: 0.055, maintenancePct: 0.012, appreciationPct: 0.04, happinessBonus: 5, minAge: 22 },
  upper: { valueRange: [10000000, 35000000], downPaymentPct: 0.25, mortgageRate: 0.05, maintenancePct: 0.01, appreciationPct: 0.05, happinessBonus: 8, minAge: 28 },
  luxury: { valueRange: [50000000, 200000000], downPaymentPct: 0.3, mortgageRate: 0.045, maintenancePct: 0.008, appreciationPct: 0.06, happinessBonus: 12, minAge: 35 },
};

const TIER_NAMES: Record<PropertyTier, readonly string[]> = {
  shelter: ['Room Rental', 'Shared Flat', 'Studio Pod', 'Basement Unit', 'Hostel Room', 'Couch Surf Pad', 'Shelter Bed', 'Tiny Room', 'Dorm Bed', 'Boarding Room'],
  basic: ['Studio Apartment', '1BHK Flat', 'Compact Condo', 'Garden Apartment', 'Walk-Up Unit', 'Railway Quarter', 'Suburban Flat', 'City Studio', 'Corner Apartment', 'Loft Starter'],
  mid: ['2BHK House', 'Townhouse', 'Suburban Home', 'Duplex', 'Corner House', 'Family Flat', 'Garden Home', 'Lakeview Condo', 'Hill Cottage', 'Urban Townhouse'],
  upper: ['Penthouse', 'Mansion Wing', 'Estate Villa', 'Waterfront Home', 'Country Manor', 'Skyline Penthouse', 'Heritage Bungalow', 'Golf Course Home', 'Designer Villa', 'Executive Estate'],
  luxury: ['Private Island', 'Castle Estate', 'Mega Mansion', 'Sky Palace', 'Royal Villa', 'Cliffside Retreat', 'Private Compound', 'Historic Castle', 'Ocean Estate', 'Diamond Tower Penthouse'],
};

function buildProperty(tier: PropertyTier, index: number): PropertyDef {
  const cfg = TIER_CONFIG[tier];
  const names = TIER_NAMES[tier];
  const name = names[index % names.length];
  const span = cfg.valueRange[1] - cfg.valueRange[0];
  const value = Math.round(cfg.valueRange[0] + (span * (index + 1)) / (names.length + 1));

  return {
    id: `prop_${tier}_${index + 1}`,
    name,
    tier,
    value,
    downPaymentPct: cfg.downPaymentPct,
    mortgageRate: cfg.mortgageRate,
    termYears: 25,
    maintenancePct: cfg.maintenancePct,
    appreciationPct: cfg.appreciationPct,
    minAge: cfg.minAge,
    happinessBonus: cfg.happinessBonus,
  };
}

export const PROPERTY_CATALOG: PropertyDef[] = (
  Object.keys(TIER_NAMES) as PropertyTier[]
).flatMap(tier => TIER_NAMES[tier].map((_, i) => buildProperty(tier, i)));

export const PROPERTY_MAP = Object.fromEntries(
  PROPERTY_CATALOG.map(p => [p.id, p]),
) as Record<string, PropertyDef>;

export function getPropertiesByTier(tier: PropertyTier): PropertyDef[] {
  return PROPERTY_CATALOG.filter(p => p.tier === tier);
}
