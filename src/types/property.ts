export type PropertyTier = 'shelter' | 'basic' | 'mid' | 'upper' | 'luxury';

/** Role of a catalog asset within its price tier (differentiates same-tier items). */
export type AssetRoleTag =
  | 'status'
  | 'utility'
  | 'income'
  | 'collector'
  | 'lifestyle'
  | 'business';

export interface PropertyDef {
  id: string;
  name: string;
  tier: PropertyTier;
  value: number;
  downPaymentPct: number;
  mortgageRate: number;
  termYears: number;
  maintenancePct: number;
  appreciationPct: number;
  minAge: number;
  happinessBonus?: number;
  rentalYieldPct?: number;
  /** Role within tier — drives unique perk identity */
  roleTag?: AssetRoleTag;
  description?: string;
}
