// ─── Assets ───────────────────────────────────────────────────────────────────

export type AssetType =
  | 'property'
  | 'vehicle'
  | 'investment'
  | 'collectible'
  | 'angel_stake';

export type PropertyOccupancy = 'primary' | 'rental';

export interface AssetPricePoint {
  age: number;
  value: number;
}

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  value: number;
  debt?: number;
  purchasedAge: number;
  propertyDefId?: string;
  catalogId?: string;
  mortgageRate?: number;
  mortgageTermYears?: number;
  /** Original cash invested (investments). */
  costBasis?: number;
  priceHistory?: AssetPricePoint[];
  occupancy?: PropertyOccupancy;
  renovationLevel?: number;
  rentalYieldPct?: number;
  instrumentKind?: string;
  /** Equipped for annual perks (vehicle, collectible, featured property, etc.) */
  equipped?: boolean;
  /** Lower = earlier in stack (1st = 100%, 2nd = 90%, …). Set when equipping. */
  equippedOrder?: number;
}

export type InsuranceLine = 'health' | 'auto' | 'home' | 'life';

export interface InsurancePolicy {
  id: string;
  line: InsuranceLine;
  annualPremium: number;
  coveragePct: number;
  purchasedAge: number;
  productId?: string;
  /** Unequipped = no premium, no coverage */
  equipped?: boolean;
}

export interface CreditFactors {
  paymentHistory: number;
  utilization: number;
  historyLength: number;
  creditMix: number;
  recentInquiries: number;
}

export interface AngelOpportunity {
  id: string;
  name: string;
  sector: string;
  askAmount: number;
  equityPct: number;
  risk: number;
  expectedReturn: number;
  generatedAge: number;
}


export type FinanceLedgerCategory =
  | 'salary'
  | 'living'
  | 'tuition'
  | 'housing'
  | 'event'
  | 'activity'
  | 'business'
  | 'investment'
  | 'purchase'
  | 'social'
  | 'repayment'
  | 'other';

/** One cashflow line for the Finances ledger. */
export interface FinanceLedgerEntry {
  id: string;
  age: number;
  timestamp: number;
  category: FinanceLedgerCategory;
  label: string;
  /** Signed cash flow: positive = income, negative = expense. */
  amount: number;
  bankAfter: number;
  debtAfter: number;
  /** How much personal debt changed from this line (positive = debt grew). */
  debtDelta: number;
}
