import { LifeEvent } from '../../types';

export const FINANCIAL_EVENTS: LifeEvent[] = [
  // ─── Windfall / Income ────────────────────────────────────────────────────
  { id: 'inheritance', title: 'Unexpected Inheritance', description: 'A distant relative passed away and left you money in their will.', category: 'financial', minAge: 20, maxAge: 65, weight: 4, statEffect: { happiness: 10, wealth: 5 }, bankEffect: 50000, color: '#F59E0B', choices: [] },
  { id: 'lottery_win_small', title: 'Lottery Win', description: 'You won a modest prize in the lottery!', category: 'financial', minAge: 18, maxAge: 80, weight: 4, statEffect: { happiness: 15 }, bankEffect: 10000, color: '#F59E0B', choices: [] },
  { id: 'bonus_at_work', title: 'Performance Bonus', description: 'Your employer rewarded your hard work with a generous bonus.', category: 'financial', minAge: 22, maxAge: 65, weight: 8, statEffect: { happiness: 10, ambition: 5 }, bankEffect: 15000, color: '#10B981', choices: [] },
  { id: 'freelance_income', title: 'Freelance Side Income', description: 'Your side hustle is paying off. Clients love your work.', category: 'financial', minAge: 20, maxAge: 55, weight: 7, statEffect: { ambition: 8, happiness: 6 }, bankEffect: 8000, color: '#10B981', choices: [] },
  { id: 'tax_refund', title: 'Tax Refund', description: 'You received a larger-than-expected tax refund this year.', category: 'financial', minAge: 20, maxAge: 70, weight: 9, statEffect: { happiness: 6 }, bankEffect: 3000, color: '#10B981', choices: [] },

  // ─── Expenses / Setbacks ──────────────────────────────────────────────────
  { id: 'car_repair', title: 'Expensive Car Repair', description: 'Your car broke down and the repair bill was significant.', category: 'financial', minAge: 18, maxAge: 70, weight: 9, statEffect: { happiness: -6 }, bankEffect: -4000, color: '#F97316', choices: [] },
  { id: 'emergency_fund_drain', title: 'Emergency Expense', description: 'An unexpected emergency drained your savings.', category: 'financial', minAge: 20, maxAge: 65, weight: 7, statEffect: { happiness: -8, mentalHealth: -5 }, bankEffect: -12000, color: '#EF4444', choices: [] },
  { id: 'credit_card_debt', title: 'Credit Card Debt Spiral', description: 'Poor spending habits have left you with mounting credit card debt.', category: 'financial', minAge: 20, maxAge: 50, weight: 6, statEffect: { mentalHealth: -10, happiness: -8 }, bankEffect: -8000, color: '#EF4444', choices: [
    { id: 'consolidate_debt', text: 'Consolidate and repay aggressively', subtext: 'Take control', statEffect: { mentalHealth: 10, ambition: 8 } },
    { id: 'minimum_payments', text: 'Pay minimums only', subtext: 'Kick the can', statEffect: { mentalHealth: -5 }, bankEffect: -2000 },
  ]},
  { id: 'identity_theft', title: 'Identity Theft', description: 'A scammer stole your personal information and drained your accounts.', category: 'financial', minAge: 18, maxAge: 75, weight: 4, statEffect: { happiness: -15, mentalHealth: -12 }, bankEffect: -20000, color: '#EF4444', choices: [] },
  { id: 'scam_victim', title: 'Financial Scam', description: 'You fell victim to an investment scam.', category: 'financial', minAge: 25, maxAge: 70, weight: 4, statEffect: { happiness: -12, intelligence: -5, mentalHealth: -10 }, bankEffect: -25000, color: '#EF4444', choices: [] },
  { id: 'tax_audit', title: 'Tax Audit', description: 'The tax authorities selected you for an audit.', category: 'financial', minAge: 25, maxAge: 70, weight: 4, statEffect: { mentalHealth: -10, happiness: -8 }, bankEffect: -5000, color: '#F97316', choices: [] },

  // ─── Investment ────────────────────────────────────────────────────────────
  { id: 'stock_market_gain', title: 'Stock Market Rally', description: 'Your investment portfolio surged during a market rally.', category: 'financial', minAge: 20, maxAge: 70, weight: 7, statEffect: { happiness: 12, ambition: 5 }, bankEffect: 30000, color: '#10B981', choices: [] },
  { id: 'stock_market_crash', title: 'Market Crash', description: 'A market correction wiped out a significant portion of your investments.', category: 'financial', minAge: 25, maxAge: 70, weight: 5, statEffect: { happiness: -15, mentalHealth: -10 }, bankEffect: -25000, color: '#EF4444', choices: [
    { id: 'hold_stocks', text: 'Hold and wait it out', subtext: 'Markets recover', statEffect: { ambition: 5, mentalHealth: 5 } },
    { id: 'panic_sell', text: 'Sell everything', subtext: 'Cut your losses', statEffect: { happiness: -5, ambition: -5 }, bankEffect: -10000 },
  ]},
  { id: 'real_estate_deal', title: 'Property Investment', description: 'You bought a rental property that is generating monthly income.', category: 'financial', minAge: 25, maxAge: 60, weight: 5, statEffect: { ambition: 8, happiness: 8 }, bankEffect: -50000, color: '#10B981', choices: [] },
  { id: 'ipo_windfall', title: 'IPO Windfall', description: 'A startup you invested in early went public.', category: 'financial', minAge: 25, maxAge: 55, weight: 3, statEffect: { happiness: 20, ambition: 12 }, bankEffect: 100000, color: '#10B981', choices: [] },
  { id: 'crypto_boom', title: 'Crypto Surge', description: 'Your cryptocurrency investment multiplied in value overnight.', category: 'financial', minAge: 18, maxAge: 50, weight: 4, statEffect: { happiness: 15, ambition: 10 }, bankEffect: 40000, color: '#F59E0B', choices: [] },
  { id: 'crypto_crash', title: 'Crypto Crash', description: 'Your cryptocurrency holdings crashed to near zero.', category: 'financial', minAge: 18, maxAge: 50, weight: 5, statEffect: { happiness: -18, mentalHealth: -12 }, bankEffect: -20000, color: '#EF4444', choices: [] },

  // ─── Major Financial Milestones ────────────────────────────────────────────
  { id: 'first_home_purchase', title: 'Bought Your First Home', description: 'You signed the papers on your first home. A major milestone!', category: 'financial', minAge: 24, maxAge: 45, weight: 5, statEffect: { happiness: 18, ambition: 8, mentalHealth: 5 }, bankEffect: -30000, color: '#10B981', choices: [] },
  { id: 'mortgage_paid_off', title: 'Mortgage Paid Off!', description: 'After years of payments, your home is fully yours!', category: 'financial', minAge: 40, maxAge: 70, weight: 4, statEffect: { happiness: 20, mentalHealth: 15, ambition: 8 }, color: '#10B981', choices: [] },
  { id: 'retirement_fund_milestone', title: 'Retirement Fund Milestone', description: 'Your retirement account crossed a major savings milestone.', category: 'financial', minAge: 35, maxAge: 65, weight: 6, statEffect: { happiness: 12, ambition: 8 }, color: '#10B981', choices: [] },
  { id: 'bankruptcy', title: 'Bankruptcy', description: 'Overwhelming debts forced you to declare bankruptcy.', category: 'financial', minAge: 25, maxAge: 65, weight: 3, statEffect: { happiness: -25, mentalHealth: -20, ambition: -15, social: -10 }, bankEffect: -50000, color: '#EF4444', choices: [
    { id: 'rebuild_bankrupt', text: 'Commit to rebuilding', subtext: 'Start fresh', statEffect: { ambition: 20, mentalHealth: 10 } },
    { id: 'give_up_bankrupt', text: 'Feel overwhelmed', subtext: 'Depression sets in', statEffect: { mentalHealth: -15, happiness: -15 } },
  ]},
  { id: 'salary_negotiation_win', title: 'Salary Negotiation', description: 'You successfully negotiated a significant raise.', category: 'financial', minAge: 22, maxAge: 60, weight: 7, statEffect: { ambition: 8, happiness: 10 }, bankEffect: 10000, color: '#10B981', choices: [] },
  { id: 'startup_investment', title: 'Angel Investment', description: 'A friend pitched their startup idea and asked for investment.', category: 'financial', minAge: 28, maxAge: 55, weight: 5, statEffect: { ambition: 5 }, color: '#10B981', choices: [
    { id: 'invest_startup', text: 'Invest in the startup', subtext: 'High risk, high reward', statEffect: { happiness: 8, ambition: 10 }, bankEffect: -20000, successChance: 35 },
    { id: 'pass_startup', text: 'Pass on the opportunity', subtext: 'Play it safe', statEffect: { ambition: -2 } },
  ]},
];
