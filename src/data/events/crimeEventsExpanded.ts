import { LifeEvent } from '../../types';

export const CRIME_EVENTS_EXPANDED: LifeEvent[] = [
  // ─── White Collar ─────────────────────────────────────────────────────────────
  { id: 'crx_embezzlement', minAge: 25, maxAge: 55, title: 'Embezzlement Scheme', description: 'You skimmed funds from company accounts. Small amounts at first. Then larger. Then the audit happened.', statEffect: { karma: -20, mentalHealth: -10, happiness: -8 }, choices: [
    { id: 'turn_yourself_in', text: 'Turn yourself in', subtext: 'Cooperate fully', statEffect: { karma: 8, mentalHealth: 8, wealth: -15 }, bankEffect: -50000 },
    { id: 'cover_tracks', text: 'Cover your tracks', subtext: 'Hope it goes away', statEffect: { karma: -10, mentalHealth: -12 } },
  ], category: 'crime', weight: 2, color: '#EF4444' },
  { id: 'crx_insider_trading', minAge: 28, maxAge: 55, title: 'Insider Trading', description: 'A tip from a friend at the company made you very rich. The SEC noticed the unusual options activity.', statEffect: { karma: -18, mentalHealth: -8, wealth: 15 }, bankEffect: 100000, choices: [
    { id: 'pay_fine_trade', text: 'Pay the fine and move on', subtext: 'Settle quietly', statEffect: { karma: -5, wealth: -15 }, bankEffect: -150000 },
    { id: 'contest_charges', text: 'Contest the charges', subtext: 'Fight it in court', statEffect: { mentalHealth: -15, happiness: -10 }, bankEffect: -50000 },
  ], category: 'crime', weight: 2, color: '#EF4444' },
  { id: 'crx_fraud_insurance', minAge: 25, maxAge: 55, title: 'Insurance Fraud', description: 'You submitted a claim for things that never happened. The payout was substantial. So was the investigation.', statEffect: { karma: -15, mentalHealth: -8 }, bankEffect: 20000, choices: [
    { id: 'caught_fraud', text: 'You were caught', subtext: 'Investigators were thorough', statEffect: { karma: -10, happiness: -15, wealth: -10 }, bankEffect: -30000 },
    { id: 'got_away_fraud', text: 'You got away with it', subtext: 'For now', statEffect: { karma: -5, mentalHealth: -5 } },
  ], category: 'crime', weight: 3, color: '#EF4444' },
  { id: 'crx_tax_evasion', minAge: 30, maxAge: 65, title: 'Tax Evasion Audit', description: 'Years of creative accounting caught up with you. The government wanted every penny plus penalties.', statEffect: { karma: -12, mentalHealth: -10, happiness: -10 }, bankEffect: -40000, category: 'crime', weight: 3, color: '#EF4444' },
  { id: 'crx_bribery_offer', minAge: 25, maxAge: 55, title: 'Bribery Offer', description: 'Someone offered you money to look the other way on an important decision.', statEffect: { karma: -5 }, choices: [
    { id: 'take_bribe', text: 'Accept the money', subtext: 'It pays well', statEffect: { karma: -20, wealth: 8 }, bankEffect: 30000 },
    { id: 'refuse_bribe', text: 'Refuse and report it', subtext: 'Integrity matters', statEffect: { karma: 12, happiness: 6 } },
  ], category: 'crime', weight: 4, color: '#EF4444' },

  // ─── Cybercrime ────────────────────────────────────────────────────────────────
  { id: 'crx_hacking', minAge: 16, maxAge: 40, title: 'Hacking Incident', description: 'You accessed systems you weren\'t authorised to enter. The thrill was real. So were the consequences.', statEffect: { intelligence: 5, karma: -15, mentalHealth: -6 }, choices: [
    { id: 'arrested_hacking', text: 'Got caught and arrested', subtext: 'IP logs are real', statEffect: { happiness: -15, karma: -10, social: -8 } },
    { id: 'white_hat_pivot', text: 'Reported the vulnerability instead', subtext: 'Ethical hacker mode', statEffect: { karma: 10, intelligence: 8, wealth: 3 }, bankEffect: 10000 },
  ], category: 'crime', weight: 3, color: '#EF4444' },
  { id: 'crx_identity_theft', minAge: 18, maxAge: 50, title: 'Identity Theft Victim', description: 'Someone used your details to open accounts in your name. Months of disputes with banks followed.', statEffect: { happiness: -10, mentalHealth: -8, wealth: -8 }, bankEffect: -5000, category: 'crime', weight: 5, color: '#EF4444' },

  // ─── Street Crime ─────────────────────────────────────────────────────────────
  { id: 'crx_mugged', minAge: 14, maxAge: 65, title: 'Mugged', description: 'Someone approached fast and demanded your phone and wallet. You handed them over.', statEffect: { happiness: -10, mentalHealth: -10, health: -3 }, bankEffect: -500, category: 'crime', weight: 5, color: '#EF4444' },
  { id: 'crx_caught_stealing', minAge: 12, maxAge: 30, title: 'Caught Shoplifting', description: 'Security stopped you at the door. The embarrassment outlasted the item you took.', statEffect: { karma: -10, happiness: -8, social: -6 }, category: 'crime', weight: 5, color: '#EF4444' },
  { id: 'crx_vandalism_caught', minAge: 13, maxAge: 22, title: 'Vandalism Charge', description: 'Graffiti seemed like a good idea until the police showed up at 2am with photos.', statEffect: { karma: -8, happiness: -6, social: -5 }, bankEffect: -1000, category: 'crime', weight: 5, color: '#F97316' },
  { id: 'crx_drug_possession', minAge: 16, maxAge: 40, title: 'Drug Possession Charge', description: 'A routine police stop turned into a search. The amount in your pocket made the charge serious.', statEffect: { karma: -12, happiness: -10, mentalHealth: -8, social: -5 }, choices: [
    { id: 'plead_guilty_drugs', text: 'Plead guilty for lesser sentence', subtext: 'Take the deal', statEffect: { karma: -5, happiness: -5 } },
    { id: 'contest_drugs', text: 'Contest the charge', subtext: 'Fight it', statEffect: { mentalHealth: -10, happiness: -8 }, bankEffect: -15000 },
  ], category: 'crime', weight: 4, color: '#EF4444' },
  { id: 'crx_witness_crime', minAge: 18, maxAge: 65, title: 'Witnessed a Crime', description: 'You saw something happen. Now detectives want a statement and you\'re in the middle of something dangerous.', statEffect: { mentalHealth: -8, happiness: -6 }, choices: [
    { id: 'cooperate_witness', text: 'Cooperate with police', subtext: 'Do the right thing', statEffect: { karma: 10, mentalHealth: 5 } },
    { id: 'stay_silent', text: 'Stay silent', subtext: "Don't get involved", statEffect: { karma: -8, mentalHealth: -5 } },
  ], category: 'crime', weight: 5, color: '#EF4444' },

  // ─── Organised Crime ──────────────────────────────────────────────────────────
  { id: 'crx_organized_crime_offer', minAge: 20, maxAge: 40, title: 'Organized Crime Approach', description: 'Someone with connections offered you a role on the periphery of something you knew was illegal.', statEffect: { karma: -5 }, choices: [
    { id: 'join_org_crime', text: 'Take the offer', subtext: 'High risk, high reward', statEffect: { karma: -20, wealth: 10, mentalHealth: -10 }, bankEffect: 50000 },
    { id: 'refuse_org_crime', text: 'Walk away', subtext: 'Self-preservation', statEffect: { karma: 5, mentalHealth: 5 } },
  ], category: 'crime', weight: 2, color: '#EF4444' },
  { id: 'crx_crime_reformed', minAge: 22, maxAge: 45, title: 'Left Criminal Life Behind', description: 'After years on the wrong side of the law, you made a deliberate and difficult choice to change.', statEffect: { karma: 15, mentalHealth: 10, happiness: 12 }, category: 'crime', weight: 3, color: '#10B981' },
  { id: 'crx_wrongly_accused', minAge: 18, maxAge: 55, title: 'Wrongly Accused', description: 'You were charged with something you didn\'t do. Proving your innocence took eighteen months and everything you had.', statEffect: { happiness: -18, mentalHealth: -16, karma: 5 }, bankEffect: -25000, category: 'crime', weight: 2, color: '#EF4444', rarity: 'rare' },
  { id: 'crx_arrest_expunged', minAge: 25, maxAge: 55, title: 'Record Expunged', description: 'After years of good behaviour, a judge cleared your criminal record. A second chance felt real.', statEffect: { happiness: 12, mentalHealth: 10, ambition: 8 }, category: 'crime', weight: 3, color: '#10B981' },
];
