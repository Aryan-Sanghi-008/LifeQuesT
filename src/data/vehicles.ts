import type { AssetPerk, AssetPerkTier } from './assetPerks';
import { tierFromUsdPrice } from './assetPerks';
import type { AssetRoleTag } from '../types';

export interface VehicleDef {
  id: string;
  name: string;
  baseValueUsd: number;
  /** Legacy field — financing engine caps loan at 50% regardless */
  loanPct: number;
  depreciationPct: number;
  happinessBonus: number;
  roleTag: AssetRoleTag;
  description: string;
  perks: AssetPerk[];
}

function p(
  id: string,
  label: string,
  description: string,
  extras: Partial<AssetPerk> = {},
): AssetPerk {
  return { id, label, description, ...extras };
}

export const VEHICLES: VehicleDef[] = [
  {
    id: 'scooter',
    name: 'City Scooter',
    baseValueUsd: 2500,
    loanPct: 0.5,
    depreciationPct: 0.18,
    happinessBonus: 2,
    roleTag: 'lifestyle',
    description: 'Cheap city mobility. Low upkeep, modest joy.',
    perks: [
      p('veh_scooter_joy', 'Zip Around Town', 'Small happiness from easy commuting', {
        annualStatEffect: { happiness: 2 },
      }),
      p('veh_scooter_fit', 'Kickstart Fitness', 'Light fitness from daily rides', {
        annualStatEffect: { fitness: 1 },
        expenseReducePct: 0.01,
      }),
    ],
  },
  {
    id: 'bike_ebike',
    name: 'Premium E-Bike',
    baseValueUsd: 3500,
    loanPct: 0.5,
    depreciationPct: 0.2,
    happinessBonus: 3,
    roleTag: 'lifestyle',
    description: 'Eco commute — fitness and mental clarity.',
    perks: [
      p('veh_ebike_fit', 'Active Commute', 'Fitness and mental health from riding', {
        annualStatEffect: { fitness: 2, mentalHealth: 1, happiness: 2 },
      }),
      p('veh_ebike_save', 'Skip the Fuel', 'Slight living-cost savings', {
        expenseReducePct: 0.015,
      }),
    ],
  },
  {
    id: 'hatchback',
    name: 'Hatchback Car',
    baseValueUsd: 18000,
    loanPct: 0.5,
    depreciationPct: 0.12,
    happinessBonus: 3,
    roleTag: 'utility',
    description: 'Reliable daily driver. Practical, not flashy.',
    perks: [
      p('veh_hatch_joy', 'Reliable Ride', 'Steady happiness from owning a car', {
        annualStatEffect: { happiness: 3 },
      }),
      p('veh_hatch_util', 'Errand Machine', 'Lower friction living costs', {
        expenseReducePct: 0.02,
        annualStatEffect: { ambition: 1 },
      }),
    ],
  },
  {
    id: 'motorcycle',
    name: 'Sport Motorcycle',
    baseValueUsd: 12000,
    loanPct: 0.5,
    depreciationPct: 0.14,
    happinessBonus: 5,
    roleTag: 'lifestyle',
    description: 'Thrill and looks — higher risk vibe, more social.',
    perks: [
      p('veh_moto_thrill', 'Open Road Thrill', 'Happiness and looks from the ride', {
        annualStatEffect: { happiness: 4, looks: 2 },
      }),
      p('veh_moto_social', 'Rider Scene', 'Social from bike culture', {
        annualStatEffect: { social: 2 },
        fameBonus: 1,
      }),
    ],
  },
  {
    id: 'compact_ev',
    name: 'Compact EV',
    baseValueUsd: 32000,
    loanPct: 0.5,
    depreciationPct: 0.11,
    happinessBonus: 6,
    roleTag: 'lifestyle',
    description: 'Modern EV — ambition signal and lower running costs.',
    perks: [
      p('veh_ev_joy', 'Silent Drive', 'Happiness and mental calm', {
        annualStatEffect: { happiness: 4, mentalHealth: 2 },
      }),
      p('veh_ev_amb', 'Future Signal', 'Ambition from tech-forward ownership', {
        annualStatEffect: { ambition: 2 },
        expenseReducePct: 0.025,
      }),
    ],
  },
  {
    id: 'suv',
    name: 'SUV',
    baseValueUsd: 42000,
    loanPct: 0.5,
    depreciationPct: 0.1,
    happinessBonus: 5,
    roleTag: 'utility',
    description: 'Family and cargo space — comfort over status.',
    perks: [
      p('veh_suv_comfort', 'Family Comfort', 'Happiness and mental health', {
        annualStatEffect: { happiness: 4, mentalHealth: 2 },
      }),
      p('veh_suv_util', 'Haul Anything', 'Utility living-cost edge', {
        expenseReducePct: 0.02,
        annualStatEffect: { social: 1 },
      }),
    ],
  },
  {
    id: 'van_cargo',
    name: 'Cargo Van',
    baseValueUsd: 28000,
    loanPct: 0.5,
    depreciationPct: 0.11,
    happinessBonus: 2,
    roleTag: 'business',
    description: 'Workhorse van — boosts business income and ambition.',
    perks: [
      p('veh_van_biz', 'Mobile Warehouse', 'Business income boost while equipped', {
        incomeBonusPct: 0.04,
        annualStatEffect: { ambition: 3, wealth: 1 },
      }),
      p('veh_van_util', 'Side-Hustle Ready', 'Unlocks small logistics gigs', {
        unlockTag: 'cargo_side_hustle',
        expenseReducePct: 0.01,
      }),
    ],
  },
  {
    id: 'coupe',
    name: 'Sports Coupe',
    baseValueUsd: 55000,
    loanPct: 0.5,
    depreciationPct: 0.16,
    happinessBonus: 7,
    roleTag: 'status',
    description: 'Looks and social heat — premium mid-tier status.',
    perks: [
      p('veh_coupe_looks', 'Curbside Presence', 'Looks and happiness', {
        annualStatEffect: { looks: 4, happiness: 5 },
      }),
      p('veh_coupe_social', 'Night Drive Cred', 'Social and mild fame', {
        annualStatEffect: { social: 3 },
        fameBonus: 3,
      }),
    ],
  },
  {
    id: 'luxury_sedan',
    name: 'Luxury Sedan',
    baseValueUsd: 85000,
    loanPct: 0.5,
    depreciationPct: 0.15,
    happinessBonus: 8,
    roleTag: 'status',
    description: 'Executive sedan — career edge and quiet luxury.',
    perks: [
      p('veh_sedan_exec', 'Boardroom Arrival', 'Career performance and ambition', {
        careerPerformanceBonus: 0.04,
        annualStatEffect: { ambition: 3, happiness: 5, looks: 3 },
      }),
      p('veh_sedan_social', 'Client-Ready', 'Social polish', {
        annualStatEffect: { social: 3 },
        fameBonus: 4,
      }),
    ],
  },
  {
    id: 'luxury_suv',
    name: 'Luxury SUV',
    baseValueUsd: 95000,
    loanPct: 0.5,
    depreciationPct: 0.13,
    happinessBonus: 9,
    roleTag: 'status',
    description: 'High-end SUV — family prestige and social clout.',
    perks: [
      p('veh_luxsuv_status', 'Neighborhood Flagship', 'Looks, social, happiness', {
        annualStatEffect: { looks: 4, social: 4, happiness: 6 },
        fameBonus: 5,
      }),
      p('veh_luxsuv_career', 'Parent Executive', 'Slight career edge', {
        careerPerformanceBonus: 0.03,
      }),
    ],
  },
  {
    id: 'supercar',
    name: 'Supercar',
    baseValueUsd: 220000,
    loanPct: 0.5,
    depreciationPct: 0.18,
    happinessBonus: 14,
    roleTag: 'status',
    description: 'Elite status machine — fame and looks dominate.',
    perks: [
      p('veh_super_fame', 'Headline Machine', 'Massive looks and fame', {
        annualStatEffect: { looks: 7, happiness: 8, social: 5 },
        fameBonus: 12,
      }),
      p('veh_super_career', 'Deal-Closer Aura', 'Career performance boost', {
        careerPerformanceBonus: 0.06,
        annualStatEffect: { ambition: 4 },
      }),
      p('veh_super_net', 'Elite Garage Network', 'Unlocks exclusive circles', {
        unlockTag: 'luxury_vehicle_network',
      }),
    ],
  },
  {
    id: 'yacht_entry',
    name: 'Entry Yacht',
    baseValueUsd: 350000,
    loanPct: 0.5,
    depreciationPct: 0.08,
    happinessBonus: 16,
    roleTag: 'lifestyle',
    description: 'Water lifestyle — happiness, network, mild income from charters.',
    perks: [
      p('veh_yacht_joy', 'Horizon Days', 'Huge happiness and mental health', {
        annualStatEffect: { happiness: 10, mentalHealth: 4, social: 5 },
      }),
      p('veh_yacht_income', 'Weekend Charters', 'Side income from boat use', {
        incomeBonusPct: 0.03,
        fameBonus: 8,
      }),
      p('veh_yacht_net', 'Marina Circle', 'Unlock marina social events', {
        unlockTag: 'marina_network',
      }),
    ],
  },
  {
    id: 'rv',
    name: 'Camper RV',
    baseValueUsd: 78000,
    loanPct: 0.5,
    depreciationPct: 0.1,
    happinessBonus: 7,
    roleTag: 'lifestyle',
    description: 'Travel lifestyle — happiness and expense flexibility.',
    perks: [
      p('veh_rv_travel', 'Road Nomad', 'Happiness and mental reset', {
        annualStatEffect: { happiness: 6, mentalHealth: 3, fitness: 1 },
      }),
      p('veh_rv_save', 'Stay Anywhere', 'Lower housing pressure when traveling', {
        expenseReducePct: 0.03,
      }),
    ],
  },
  {
    id: 'tractor',
    name: 'Farm Tractor',
    baseValueUsd: 52000,
    loanPct: 0.5,
    depreciationPct: 0.08,
    happinessBonus: 2,
    roleTag: 'income',
    description: 'Agri income engine — wealth and side-farm yield.',
    perks: [
      p('veh_tractor_income', 'Harvest Yield', 'Farm side income', {
        incomeBonusPct: 0.05,
        annualStatEffect: { wealth: 2, ambition: 2 },
      }),
      p('veh_tractor_fit', 'Field Work', 'Fitness from farm life', {
        annualStatEffect: { fitness: 2, happiness: 2 },
        unlockTag: 'farm_side_income',
      }),
    ],
  },
  {
    id: 'helicopter',
    name: 'Light Helicopter',
    baseValueUsd: 900000,
    loanPct: 0.5,
    depreciationPct: 0.07,
    happinessBonus: 20,
    roleTag: 'business',
    description: 'Executive travel — career, fame, and unlocks.',
    perks: [
      p('veh_heli_career', 'Sky Commute', 'Major career performance', {
        careerPerformanceBonus: 0.1,
        annualStatEffect: { ambition: 6, happiness: 8 },
      }),
      p('veh_heli_fame', 'Arrival Statement', 'Fame and social', {
        fameBonus: 18,
        annualStatEffect: { social: 6, looks: 4 },
      }),
      p('veh_heli_unlock', 'Executive Travel', 'Unlock exclusive deals', {
        unlockTag: 'executive_travel',
        incomeBonusPct: 0.04,
      }),
    ],
  },
  {
    id: 'private_jet',
    name: 'Light Jet',
    baseValueUsd: 3500000,
    loanPct: 0.5,
    depreciationPct: 0.06,
    happinessBonus: 25,
    roleTag: 'status',
    description: 'Legendary mobility — top-tier fame, career, and network.',
    perks: [
      p('veh_jet_legend', 'Global Reach', 'Legendary stats and fame', {
        annualStatEffect: { happiness: 12, looks: 8, social: 8, ambition: 8 },
        fameBonus: 25,
      }),
      p('veh_jet_career', 'Tycoon Tempo', 'Huge career edge', {
        careerPerformanceBonus: 0.12,
        incomeBonusPct: 0.05,
      }),
      p('veh_jet_net', 'Jet Set Access', 'Unlock tycoon network', {
        unlockTag: 'tycoon_network',
      }),
    ],
  },
];

export const VEHICLE_MAP: Record<string, VehicleDef> = Object.fromEntries(
  VEHICLES.map((v) => [v.id, v]),
);

export function getVehicleById(id: string): VehicleDef | undefined {
  return VEHICLE_MAP[id];
}

export function getVehicleTier(v: VehicleDef): AssetPerkTier {
  return tierFromUsdPrice(v.baseValueUsd);
}
