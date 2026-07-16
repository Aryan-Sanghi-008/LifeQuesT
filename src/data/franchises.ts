export interface FranchiseDef {
  id: string;
  name: string;
  industry: string;
  /** USD entry cost (scaled by country) */
  entryCostUsd: number;
  baseRevenueUsd: number;
  expenseRatio: number;
  risk: number;
  minCredit: number;
  minAge: number;
  description: string;
}

export const FRANCHISES: FranchiseDef[] = [
  { id: 'fran_cafe', name: 'Neighborhood Cafe', industry: 'Food', entryCostUsd: 45000, baseRevenueUsd: 80000, expenseRatio: 0.72, risk: 0.25, minCredit: 620, minAge: 21, description: 'Espresso, pastries, locals.' },
  { id: 'fran_gym', name: 'FitZone Gym', industry: 'Fitness', entryCostUsd: 120000, baseRevenueUsd: 160000, expenseRatio: 0.68, risk: 0.3, minCredit: 650, minAge: 22, description: 'Memberships and classes.' },
  { id: 'fran_laundry', name: 'Suds Laundry', industry: 'Services', entryCostUsd: 35000, baseRevenueUsd: 55000, expenseRatio: 0.65, risk: 0.15, minCredit: 600, minAge: 18, description: 'Wash-and-fold staple.' },
  { id: 'fran_salon', name: 'Glow Salon', industry: 'Beauty', entryCostUsd: 55000, baseRevenueUsd: 90000, expenseRatio: 0.7, risk: 0.28, minCredit: 630, minAge: 20, description: 'Cuts, color, vibes.' },
  { id: 'fran_clinic', name: 'QuickCare Clinic', industry: 'Health', entryCostUsd: 220000, baseRevenueUsd: 280000, expenseRatio: 0.75, risk: 0.22, minCredit: 700, minAge: 28, description: 'Walk-in medical franchise.' },
  { id: 'fran_tutoring', name: 'Bright Tutors', industry: 'Education', entryCostUsd: 40000, baseRevenueUsd: 70000, expenseRatio: 0.6, risk: 0.2, minCredit: 640, minAge: 22, description: 'After-school learning center.' },
  { id: 'fran_pet', name: 'Paw Palace', industry: 'Pets', entryCostUsd: 60000, baseRevenueUsd: 95000, expenseRatio: 0.68, risk: 0.26, minCredit: 630, minAge: 21, description: 'Grooming and boarding.' },
  { id: 'fran_auto', name: 'Torque Garage', industry: 'Auto', entryCostUsd: 90000, baseRevenueUsd: 140000, expenseRatio: 0.7, risk: 0.27, minCredit: 650, minAge: 23, description: 'Repairs and detailing.' },
  { id: 'fran_bakery', name: 'Crumb Bakery', industry: 'Food', entryCostUsd: 50000, baseRevenueUsd: 85000, expenseRatio: 0.71, risk: 0.24, minCredit: 620, minAge: 20, description: 'Bread and cakes.' },
  { id: 'fran_pharmacy', name: 'MediMart Pharmacy', industry: 'Health', entryCostUsd: 180000, baseRevenueUsd: 240000, expenseRatio: 0.78, risk: 0.18, minCredit: 700, minAge: 26, description: 'Scripts and OTC.' },
  { id: 'fran_cowork', name: 'DeskHive Cowork', industry: 'Office', entryCostUsd: 150000, baseRevenueUsd: 200000, expenseRatio: 0.66, risk: 0.32, minCredit: 680, minAge: 25, description: 'Hot desks and suites.' },
  { id: 'fran_delivery', name: 'Swift Delivery Hub', industry: 'Logistics', entryCostUsd: 75000, baseRevenueUsd: 130000, expenseRatio: 0.74, risk: 0.3, minCredit: 640, minAge: 22, description: 'Last-mile microhub.' },
  { id: 'fran_arcade', name: 'Neon Arcade', industry: 'Entertainment', entryCostUsd: 100000, baseRevenueUsd: 150000, expenseRatio: 0.69, risk: 0.35, minCredit: 650, minAge: 21, description: 'Games and snacks.' },
  { id: 'fran_nursery', name: 'Little Oaks Nursery', industry: 'Education', entryCostUsd: 110000, baseRevenueUsd: 170000, expenseRatio: 0.73, risk: 0.2, minCredit: 680, minAge: 24, description: 'Childcare franchise.' },
  { id: 'fran_solar', name: 'SunInstall Solar', industry: 'Energy', entryCostUsd: 200000, baseRevenueUsd: 260000, expenseRatio: 0.72, risk: 0.28, minCredit: 700, minAge: 27, description: 'Home solar installs.' },
  { id: 'fran_cleaning', name: 'Sparkle Clean', industry: 'Services', entryCostUsd: 30000, baseRevenueUsd: 60000, expenseRatio: 0.62, risk: 0.18, minCredit: 600, minAge: 18, description: 'Residential cleaning.' },
  { id: 'fran_tech', name: 'ByteFix Repair', industry: 'Tech', entryCostUsd: 45000, baseRevenueUsd: 88000, expenseRatio: 0.65, risk: 0.25, minCredit: 640, minAge: 20, description: 'Phone and PC repair.' },
  { id: 'fran_hotel', name: 'RestInn Boutique', industry: 'Hospitality', entryCostUsd: 400000, baseRevenueUsd: 520000, expenseRatio: 0.76, risk: 0.33, minCredit: 740, minAge: 30, description: 'Small hotel franchise.' },
  { id: 'fran_farm', name: 'Urban Farm Box', industry: 'Agri', entryCostUsd: 70000, baseRevenueUsd: 110000, expenseRatio: 0.7, risk: 0.29, minCredit: 650, minAge: 22, description: 'Subscription produce.' },
  { id: 'fran_studio', name: 'Frame Photo Studio', industry: 'Creative', entryCostUsd: 55000, baseRevenueUsd: 92000, expenseRatio: 0.67, risk: 0.27, minCredit: 630, minAge: 21, description: 'Portraits and events.' },
  { id: 'fran_cloudkitchen', name: 'Cloud Kitchen Pod', industry: 'Food', entryCostUsd: 80000, baseRevenueUsd: 145000, expenseRatio: 0.74, risk: 0.34, minCredit: 660, minAge: 22, description: 'Delivery-only kitchen.' },
  { id: 'fran_ev', name: 'ChargePoint Lot', industry: 'Energy', entryCostUsd: 160000, baseRevenueUsd: 190000, expenseRatio: 0.6, risk: 0.26, minCredit: 700, minAge: 25, description: 'EV charging franchise.' },
];

export const FRANCHISE_MAP = Object.fromEntries(FRANCHISES.map((f) => [f.id, f]));

export function getFranchiseById(id: string): FranchiseDef | undefined {
  return FRANCHISE_MAP[id];
}
