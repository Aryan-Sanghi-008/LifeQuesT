import type { CrimeDef } from '../types';

export const CRIME_CATALOG: CrimeDef[] = [
  { id: 'shoplifting', label: 'Shoplifting', tier: 'petty', heatGain: 8, baseSentenceYears: 0, karmaPenalty: -15, fineAmount: 500 },
  { id: 'vandalism', label: 'Vandalism', tier: 'petty', heatGain: 10, baseSentenceYears: 0, karmaPenalty: -18, fineAmount: 800 },
  { id: 'trespassing', label: 'Trespassing', tier: 'petty', heatGain: 6, baseSentenceYears: 0, karmaPenalty: -10, fineAmount: 300 },
  { id: 'public_intoxication', label: 'Public Intoxication', tier: 'petty', heatGain: 5, baseSentenceYears: 0, karmaPenalty: -8, fineAmount: 400 },
  { id: 'speeding', label: 'Speeding', tier: 'traffic', heatGain: 4, baseSentenceYears: 0, karmaPenalty: -5, fineAmount: 250 },
  { id: 'dui', label: 'DUI', tier: 'traffic', heatGain: 20, baseSentenceYears: 1, karmaPenalty: -25, fineAmount: 2000 },
  { id: 'hit_and_run', label: 'Hit and Run', tier: 'traffic', heatGain: 35, baseSentenceYears: 2, karmaPenalty: -40, fineAmount: 5000 },
  { id: 'burglary', label: 'Burglary', tier: 'property', heatGain: 25, baseSentenceYears: 2, karmaPenalty: -35 },
  { id: 'grand_theft_auto', label: 'Grand Theft Auto', tier: 'property', heatGain: 30, baseSentenceYears: 3, karmaPenalty: -45 },
  { id: 'arson', label: 'Arson', tier: 'property', heatGain: 40, baseSentenceYears: 5, karmaPenalty: -60 },
  { id: 'identity_theft', label: 'Identity Theft', tier: 'financial', heatGain: 28, baseSentenceYears: 2, karmaPenalty: -40, fineAmount: 10000 },
  { id: 'fraud', label: 'Fraud', tier: 'financial', heatGain: 32, baseSentenceYears: 3, karmaPenalty: -50, fineAmount: 15000 },
  { id: 'tax_evasion', label: 'Tax Evasion', tier: 'financial', heatGain: 22, baseSentenceYears: 2, karmaPenalty: -35, fineAmount: 20000 },
  { id: 'embezzlement', label: 'Embezzlement', tier: 'financial', heatGain: 35, baseSentenceYears: 4, karmaPenalty: -55 },
  { id: 'insider_trading', label: 'Insider Trading', tier: 'financial', heatGain: 30, baseSentenceYears: 3, karmaPenalty: -45, fineAmount: 50000 },
  { id: 'assault', label: 'Assault', tier: 'violent', heatGain: 38, baseSentenceYears: 2, karmaPenalty: -35 },
  { id: 'battery', label: 'Battery', tier: 'violent', heatGain: 42, baseSentenceYears: 3, karmaPenalty: -40 },
  { id: 'robbery', label: 'Robbery', tier: 'violent', heatGain: 45, baseSentenceYears: 4, karmaPenalty: -50 },
  { id: 'manslaughter', label: 'Manslaughter', tier: 'violent', heatGain: 70, baseSentenceYears: 8, karmaPenalty: -80 },
  { id: 'murder', label: 'Murder', tier: 'violent', heatGain: 90, baseSentenceYears: 25, karmaPenalty: -100 },
  { id: 'gang_activity', label: 'Gang Activity', tier: 'organized', heatGain: 50, baseSentenceYears: 5, karmaPenalty: -55 },
  { id: 'extortion', label: 'Extortion', tier: 'organized', heatGain: 48, baseSentenceYears: 4, karmaPenalty: -50 },
  { id: 'drug_trafficking', label: 'Drug Trafficking', tier: 'organized', heatGain: 55, baseSentenceYears: 6, karmaPenalty: -65 },
  { id: 'racketeering', label: 'Racketeering', tier: 'organized', heatGain: 60, baseSentenceYears: 8, karmaPenalty: -70 },
  { id: 'hacking', label: 'Hacking', tier: 'cyber', heatGain: 25, baseSentenceYears: 2, karmaPenalty: -30, fineAmount: 8000 },
  { id: 'phishing', label: 'Phishing Scam', tier: 'cyber', heatGain: 18, baseSentenceYears: 1, karmaPenalty: -25, fineAmount: 5000 },
  { id: 'ransomware', label: 'Ransomware', tier: 'cyber', heatGain: 45, baseSentenceYears: 5, karmaPenalty: -55 },
  { id: 'crypto_scam', label: 'Crypto Scam', tier: 'cyber', heatGain: 30, baseSentenceYears: 3, karmaPenalty: -40, fineAmount: 25000 },
  { id: 'bribery', label: 'Bribery', tier: 'financial', heatGain: 35, baseSentenceYears: 3, karmaPenalty: -45 },
  { id: 'arrest', label: 'General Arrest', tier: 'violent', heatGain: 40, baseSentenceYears: 2, karmaPenalty: -40 },
];

export const CRIME_MAP = Object.fromEntries(
  CRIME_CATALOG.map(c => [c.id, c]),
) as Record<string, CrimeDef>;

export function getCrimeDef(id: string): CrimeDef | undefined {
  return CRIME_MAP[id];
}
