export interface BusinessEmployee {
  id: string;
  name: string;
  role: string;
  salary: number;
  performance: number;
}

export interface CareerSkillNode {
  id: string;
  label: string;
  branch: 'technical' | 'leadership' | 'specialist';
  minPerformance: number;
  minYearsInRole: number;
  requiredCert?: string;
}

export interface Business {
  id: string;
  name: string;
  revenue: number;
  expenses: number;
  valuation: number;
  employees: BusinessEmployee[];
  payrollMonthly: number;
  foundedAge: number;
  franchiseId?: string;
  industry?: string;
  risk?: number;
  /** Featured business for fame/perk application */
  equipped?: boolean;
  /** Stack order when featured (shared with asset equip stack). */
  equippedOrder?: number;
}
