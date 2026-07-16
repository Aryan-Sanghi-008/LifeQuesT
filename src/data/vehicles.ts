export interface VehicleDef {
  id: string;
  name: string;
  baseValueUsd: number;
  /** Legacy field — financing engine caps loan at 50% regardless */
  loanPct: number;
  depreciationPct: number;
  happinessBonus: number;
}

export const VEHICLES: VehicleDef[] = [
  { id: 'hatchback', name: 'Hatchback Car', baseValueUsd: 18000, loanPct: 0.5, depreciationPct: 0.12, happinessBonus: 3 },
  { id: 'suv', name: 'SUV', baseValueUsd: 42000, loanPct: 0.5, depreciationPct: 0.1, happinessBonus: 5 },
  { id: 'luxury_sedan', name: 'Luxury Sedan', baseValueUsd: 85000, loanPct: 0.5, depreciationPct: 0.15, happinessBonus: 8 },
  { id: 'scooter', name: 'City Scooter', baseValueUsd: 2500, loanPct: 0.5, depreciationPct: 0.18, happinessBonus: 2 },
  { id: 'motorcycle', name: 'Sport Motorcycle', baseValueUsd: 12000, loanPct: 0.5, depreciationPct: 0.14, happinessBonus: 5 },
  { id: 'compact_ev', name: 'Compact EV', baseValueUsd: 32000, loanPct: 0.5, depreciationPct: 0.11, happinessBonus: 6 },
  { id: 'pickup', name: 'Pickup Truck', baseValueUsd: 38000, loanPct: 0.5, depreciationPct: 0.1, happinessBonus: 4 },
  { id: 'minivan', name: 'Family Minivan', baseValueUsd: 36000, loanPct: 0.5, depreciationPct: 0.12, happinessBonus: 4 },
  { id: 'coupe', name: 'Sports Coupe', baseValueUsd: 55000, loanPct: 0.5, depreciationPct: 0.16, happinessBonus: 7 },
  { id: 'convertible', name: 'Convertible', baseValueUsd: 72000, loanPct: 0.5, depreciationPct: 0.15, happinessBonus: 8 },
  { id: 'luxury_suv', name: 'Luxury SUV', baseValueUsd: 95000, loanPct: 0.5, depreciationPct: 0.13, happinessBonus: 9 },
  { id: 'supercar', name: 'Supercar', baseValueUsd: 220000, loanPct: 0.5, depreciationPct: 0.18, happinessBonus: 14 },
  { id: 'classic_car', name: 'Classic Car', baseValueUsd: 48000, loanPct: 0.5, depreciationPct: 0.02, happinessBonus: 7 },
  { id: 'van_cargo', name: 'Cargo Van', baseValueUsd: 28000, loanPct: 0.5, depreciationPct: 0.11, happinessBonus: 2 },
  { id: 'bus_mini', name: 'Mini Bus', baseValueUsd: 65000, loanPct: 0.5, depreciationPct: 0.1, happinessBonus: 3 },
  { id: 'boat_small', name: 'Day Boat', baseValueUsd: 40000, loanPct: 0.5, depreciationPct: 0.09, happinessBonus: 8 },
  { id: 'yacht_entry', name: 'Entry Yacht', baseValueUsd: 350000, loanPct: 0.5, depreciationPct: 0.08, happinessBonus: 16 },
  { id: 'jet_ski', name: 'Jet Ski', baseValueUsd: 14000, loanPct: 0.5, depreciationPct: 0.14, happinessBonus: 6 },
  { id: 'atv', name: 'ATV', baseValueUsd: 9000, loanPct: 0.5, depreciationPct: 0.13, happinessBonus: 4 },
  { id: 'rv', name: 'Camper RV', baseValueUsd: 78000, loanPct: 0.5, depreciationPct: 0.1, happinessBonus: 7 },
  { id: 'hyper_ev', name: 'Hyper EV', baseValueUsd: 140000, loanPct: 0.5, depreciationPct: 0.12, happinessBonus: 12 },
  { id: 'limo', name: 'Stretch Limo', baseValueUsd: 110000, loanPct: 0.5, depreciationPct: 0.14, happinessBonus: 10 },
  { id: 'tractor', name: 'Farm Tractor', baseValueUsd: 52000, loanPct: 0.5, depreciationPct: 0.08, happinessBonus: 2 },
  { id: 'bike_ebike', name: 'Premium E-Bike', baseValueUsd: 3500, loanPct: 0.5, depreciationPct: 0.2, happinessBonus: 3 },
  { id: 'helicopter', name: 'Light Helicopter', baseValueUsd: 900000, loanPct: 0.5, depreciationPct: 0.07, happinessBonus: 20 },
  { id: 'private_jet', name: 'Light Jet', baseValueUsd: 3500000, loanPct: 0.5, depreciationPct: 0.06, happinessBonus: 25 },
];

export const VEHICLE_MAP: Record<string, VehicleDef> = Object.fromEntries(
  VEHICLES.map((v) => [v.id, v]),
);

export function getVehicleById(id: string): VehicleDef | undefined {
  return VEHICLE_MAP[id];
}
