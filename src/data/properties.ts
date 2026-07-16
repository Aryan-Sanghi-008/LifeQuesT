import type { PropertyDef, PropertyTier, AssetRoleTag } from '../types';
import type { AssetPerk } from './assetPerks';

function p(
  id: string,
  label: string,
  description: string,
  extras: Partial<AssetPerk> = {},
): AssetPerk {
  return { id, label, description, ...extras };
}

export interface PropertyCatalogEntry extends PropertyDef {
  roleTag: AssetRoleTag;
  description: string;
  perks: AssetPerk[];
}

const PROPERTIES: PropertyCatalogEntry[] = [
  // Shelter (4)
  {
    id: 'prop_shelter_room',
    name: 'Room Rental',
    tier: 'shelter',
    value: 60000,
    downPaymentPct: 0.5,
    mortgageRate: 0.08,
    termYears: 25,
    maintenancePct: 0.02,
    appreciationPct: 0.01,
    minAge: 18,
    happinessBonus: -4,
    rentalYieldPct: 0.07,
    roleTag: 'utility',
    description: 'Cheapest roof — negative happiness, lowest cost.',
    perks: [
      p('prop_room_survive', 'Bare Minimum', 'You have a roof — mental strain', {
        annualStatEffect: { happiness: -3, mentalHealth: -1 },
        expenseReducePct: 0.04,
      }),
    ],
  },
  {
    id: 'prop_shelter_studio_pod',
    name: 'Studio Pod',
    tier: 'shelter',
    value: 85000,
    downPaymentPct: 0.5,
    mortgageRate: 0.08,
    termYears: 25,
    maintenancePct: 0.02,
    appreciationPct: 0.012,
    minAge: 18,
    happinessBonus: -2,
    rentalYieldPct: 0.065,
    roleTag: 'lifestyle',
    description: 'Tiny but yours — slight ambition from independence.',
    perks: [
      p('prop_pod_indep', 'Independence Spark', 'Ambition from having your own place', {
        annualStatEffect: { ambition: 2, happiness: -1 },
      }),
    ],
  },
  {
    id: 'prop_shelter_shared',
    name: 'Shared Flat',
    tier: 'shelter',
    value: 95000,
    downPaymentPct: 0.5,
    mortgageRate: 0.078,
    termYears: 25,
    maintenancePct: 0.018,
    appreciationPct: 0.015,
    minAge: 18,
    happinessBonus: -1,
    rentalYieldPct: 0.06,
    roleTag: 'lifestyle',
    description: 'Roommates — social up, privacy down.',
    perks: [
      p('prop_shared_social', 'Roommate Life', 'Social gains, happiness mixed', {
        annualStatEffect: { social: 2, happiness: -1, mentalHealth: -1 },
      }),
    ],
  },
  {
    id: 'prop_shelter_boarding',
    name: 'Boarding Room',
    tier: 'shelter',
    value: 70000,
    downPaymentPct: 0.5,
    mortgageRate: 0.08,
    termYears: 25,
    maintenancePct: 0.022,
    appreciationPct: 0.008,
    minAge: 18,
    happinessBonus: -5,
    rentalYieldPct: 0.075,
    roleTag: 'income',
    description: 'Income-focused shelter if rented out later.',
    perks: [
      p('prop_board_yield', 'Landlord Starter', 'Higher yield potential when rented', {
        incomeBonusPct: 0.02,
        annualStatEffect: { happiness: -4, ambition: 1 },
      }),
    ],
  },
  // Basic (4)
  {
    id: 'prop_basic_studio',
    name: 'Studio Apartment',
    tier: 'basic',
    value: 1_200_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.065,
    termYears: 25,
    maintenancePct: 0.015,
    appreciationPct: 0.03,
    minAge: 18,
    happinessBonus: 2,
    rentalYieldPct: 0.05,
    roleTag: 'lifestyle',
    description: 'Solid starter home — comfort baseline.',
    perks: [
      p('prop_studio_home', 'First Real Home', 'Happiness and mental health', {
        annualStatEffect: { happiness: 3, mentalHealth: 2 },
      }),
    ],
  },
  {
    id: 'prop_basic_1bhk',
    name: '1BHK Flat',
    tier: 'basic',
    value: 1_800_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.065,
    termYears: 25,
    maintenancePct: 0.015,
    appreciationPct: 0.032,
    minAge: 18,
    happinessBonus: 3,
    rentalYieldPct: 0.048,
    roleTag: 'utility',
    description: 'Space for work-from-home — ambition edge.',
    perks: [
      p('prop_1bhk_wfh', 'Home Office Corner', 'Ambition and slight career', {
        annualStatEffect: { ambition: 2, happiness: 3, mentalHealth: 1 },
        careerPerformanceBonus: 0.015,
      }),
    ],
  },
  {
    id: 'prop_basic_condo',
    name: 'Compact Condo',
    tier: 'basic',
    value: 2_200_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.06,
    termYears: 25,
    maintenancePct: 0.014,
    appreciationPct: 0.035,
    minAge: 20,
    happinessBonus: 3,
    rentalYieldPct: 0.052,
    roleTag: 'income',
    description: 'Best basic rental yield.',
    perks: [
      p('prop_condo_yield', 'Rent-Ready Condo', 'Income focus when rented', {
        incomeBonusPct: 0.025,
        annualStatEffect: { wealth: 1, happiness: 2 },
      }),
    ],
  },
  {
    id: 'prop_basic_garden',
    name: 'Garden Apartment',
    tier: 'basic',
    value: 2_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.063,
    termYears: 25,
    maintenancePct: 0.016,
    appreciationPct: 0.03,
    minAge: 18,
    happinessBonus: 4,
    rentalYieldPct: 0.045,
    roleTag: 'lifestyle',
    description: 'Green space — happiness and fitness vibe.',
    perks: [
      p('prop_garden_calm', 'Patio Peace', 'Happiness, mental health, fitness', {
        annualStatEffect: { happiness: 4, mentalHealth: 2, fitness: 1 },
      }),
    ],
  },
  // Mid (4)
  {
    id: 'prop_mid_townhouse',
    name: 'Townhouse',
    tier: 'mid',
    value: 4_500_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.055,
    termYears: 25,
    maintenancePct: 0.012,
    appreciationPct: 0.04,
    minAge: 22,
    happinessBonus: 5,
    rentalYieldPct: 0.045,
    roleTag: 'lifestyle',
    description: 'Family-ready mid housing.',
    perks: [
      p('prop_th_family', 'Family Nest', 'Happiness and social', {
        annualStatEffect: { happiness: 5, social: 2, mentalHealth: 2 },
      }),
    ],
  },
  {
    id: 'prop_mid_duplex',
    name: 'Duplex',
    tier: 'mid',
    value: 5_200_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.055,
    termYears: 25,
    maintenancePct: 0.013,
    appreciationPct: 0.038,
    minAge: 22,
    happinessBonus: 4,
    rentalYieldPct: 0.055,
    roleTag: 'income',
    description: 'Live in one, rent the other — income play.',
    perks: [
      p('prop_duplex_yield', 'Dual Unit Yield', 'Strong rental income bonus', {
        incomeBonusPct: 0.04,
        annualStatEffect: { wealth: 2, happiness: 3 },
      }),
    ],
  },
  {
    id: 'prop_mid_suburban',
    name: 'Suburban Home',
    tier: 'mid',
    value: 4_800_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.054,
    termYears: 25,
    maintenancePct: 0.012,
    appreciationPct: 0.042,
    minAge: 24,
    happinessBonus: 6,
    rentalYieldPct: 0.04,
    roleTag: 'lifestyle',
    description: 'Quiet suburb — mental health and happiness.',
    perks: [
      p('prop_sub_calm', 'Quiet Streets', 'Mental health and happiness', {
        annualStatEffect: { happiness: 6, mentalHealth: 3, fitness: 1 },
        expenseReducePct: 0.01,
      }),
    ],
  },
  {
    id: 'prop_mid_lakeview',
    name: 'Lakeview Condo',
    tier: 'mid',
    value: 6_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.052,
    termYears: 25,
    maintenancePct: 0.011,
    appreciationPct: 0.045,
    minAge: 25,
    happinessBonus: 6,
    rentalYieldPct: 0.042,
    roleTag: 'status',
    description: 'View premium — looks and mild fame.',
    perks: [
      p('prop_lake_status', 'View Flex', 'Looks, social, fame', {
        annualStatEffect: { looks: 3, social: 2, happiness: 5 },
        fameBonus: 4,
      }),
    ],
  },
  // Upper (4)
  {
    id: 'prop_upper_penthouse',
    name: 'Penthouse',
    tier: 'upper',
    value: 18_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.05,
    termYears: 25,
    maintenancePct: 0.01,
    appreciationPct: 0.05,
    minAge: 28,
    happinessBonus: 8,
    rentalYieldPct: 0.04,
    roleTag: 'status',
    description: 'Skyline prestige — fame and career.',
    perks: [
      p('prop_ph_status', 'Skyline Address', 'Looks, social, fame, career', {
        annualStatEffect: { looks: 5, social: 4, happiness: 7 },
        fameBonus: 10,
        careerPerformanceBonus: 0.04,
      }),
      p('prop_ph_net', 'Penthouse Network', 'Unlock luxury address circle', {
        unlockTag: 'luxury_address',
      }),
    ],
  },
  {
    id: 'prop_upper_villa',
    name: 'Estate Villa',
    tier: 'upper',
    value: 22_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.048,
    termYears: 25,
    maintenancePct: 0.011,
    appreciationPct: 0.048,
    minAge: 30,
    happinessBonus: 9,
    rentalYieldPct: 0.035,
    roleTag: 'lifestyle',
    description: 'Spacious estate — happiness and family social.',
    perks: [
      p('prop_villa_life', 'Estate Living', 'Happiness, mental health, social', {
        annualStatEffect: { happiness: 8, mentalHealth: 4, social: 3 },
        fameBonus: 6,
      }),
    ],
  },
  {
    id: 'prop_upper_waterfront',
    name: 'Waterfront Home',
    tier: 'upper',
    value: 28_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.047,
    termYears: 25,
    maintenancePct: 0.012,
    appreciationPct: 0.052,
    minAge: 30,
    happinessBonus: 9,
    rentalYieldPct: 0.038,
    roleTag: 'status',
    description: 'Waterfront flex — fame and looks.',
    perks: [
      p('prop_water_flex', 'Shoreline Prestige', 'Looks and fame', {
        annualStatEffect: { looks: 6, social: 4, happiness: 8 },
        fameBonus: 12,
      }),
    ],
  },
  {
    id: 'prop_upper_manor',
    name: 'Country Manor',
    tier: 'upper',
    value: 25_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.049,
    termYears: 25,
    maintenancePct: 0.013,
    appreciationPct: 0.045,
    minAge: 32,
    happinessBonus: 7,
    rentalYieldPct: 0.042,
    roleTag: 'income',
    description: 'Estate that rents well for events.',
    perks: [
      p('prop_manor_events', 'Event Venue Yield', 'Income from estate events', {
        incomeBonusPct: 0.045,
        annualStatEffect: { wealth: 3, happiness: 6, social: 3 },
        fameBonus: 5,
      }),
    ],
  },
  // Luxury (4)
  {
    id: 'prop_lux_island',
    name: 'Private Island',
    tier: 'luxury',
    value: 120_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.045,
    termYears: 25,
    maintenancePct: 0.008,
    appreciationPct: 0.06,
    minAge: 35,
    happinessBonus: 14,
    rentalYieldPct: 0.03,
    roleTag: 'status',
    description: 'Ultimate status — legendary fame.',
    perks: [
      p('prop_island_legend', 'Island Sovereign', 'Legendary fame and happiness', {
        annualStatEffect: { happiness: 12, looks: 8, social: 8, ambition: 5 },
        fameBonus: 30,
        careerPerformanceBonus: 0.08,
        unlockTag: 'tycoon_network',
      }),
    ],
  },
  {
    id: 'prop_lux_castle',
    name: 'Castle Estate',
    tier: 'luxury',
    value: 150_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.044,
    termYears: 25,
    maintenancePct: 0.009,
    appreciationPct: 0.055,
    minAge: 38,
    happinessBonus: 12,
    rentalYieldPct: 0.028,
    roleTag: 'collector',
    description: 'Historic trophy — culture and fame.',
    perks: [
      p('prop_castle_culture', 'Heritage Trophy', 'Intelligence, fame, happiness', {
        annualStatEffect: { intelligence: 5, happiness: 10, social: 6 },
        fameBonus: 25,
        unlockTag: 'heritage_estate',
      }),
    ],
  },
  {
    id: 'prop_lux_sky',
    name: 'Sky Palace',
    tier: 'luxury',
    value: 180_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.043,
    termYears: 25,
    maintenancePct: 0.007,
    appreciationPct: 0.065,
    minAge: 40,
    happinessBonus: 13,
    rentalYieldPct: 0.032,
    roleTag: 'business',
    description: 'Corporate sky residence — career and income.',
    perks: [
      p('prop_sky_biz', 'Corner Office Home', 'Career and business income', {
        careerPerformanceBonus: 0.1,
        incomeBonusPct: 0.05,
        annualStatEffect: { ambition: 8, happiness: 10, looks: 6 },
        fameBonus: 20,
      }),
    ],
  },
  {
    id: 'prop_lux_compound',
    name: 'Private Compound',
    tier: 'luxury',
    value: 200_000_000,
    downPaymentPct: 0.5,
    mortgageRate: 0.042,
    termYears: 25,
    maintenancePct: 0.008,
    appreciationPct: 0.06,
    minAge: 40,
    happinessBonus: 15,
    rentalYieldPct: 0.035,
    roleTag: 'income',
    description: 'Multi-unit compound — top rental prestige.',
    perks: [
      p('prop_compound_yield', 'Trophy Yield', 'Strongest luxury rental income', {
        incomeBonusPct: 0.06,
        annualStatEffect: { wealth: 5, happiness: 11, social: 5 },
        fameBonus: 22,
        unlockTag: 'luxury_address',
      }),
    ],
  },
];

export const PROPERTY_CATALOG: PropertyDef[] = PROPERTIES;

export const PROPERTY_PERKS: Record<string, AssetPerk[]> = Object.fromEntries(
  PROPERTIES.map((p) => [p.id, p.perks]),
);

export const PROPERTY_MAP = Object.fromEntries(
  PROPERTY_CATALOG.map((p) => [p.id, p]),
) as Record<string, PropertyDef>;

export function getPropertiesByTier(tier: PropertyTier): PropertyDef[] {
  return PROPERTY_CATALOG.filter((p) => p.tier === tier);
}

export function getPropertyPerks(propertyDefId: string): AssetPerk[] {
  return PROPERTY_PERKS[propertyDefId] ?? [];
}

export function getPropertyCatalogEntry(id: string): PropertyCatalogEntry | undefined {
  return PROPERTIES.find((p) => p.id === id);
}
