import { LifeEvent } from '../../types';
import { COLORS } from '@theme';

export const CAREER_EVENTS_EXPANDED: LifeEvent[] = [
  // ─── Job Search & Early Career ───────────────────────────────────────────────
  { id: 'cex_linkedin_viral', minAge: 22, maxAge: 40, title: 'LinkedIn Post Goes Viral', description: 'A post about your career journey blew up. Recruiters are sliding into your DMs.', statEffect: { social: 10, ambition: 6 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_ghosted_employer', minAge: 18, maxAge: 35, title: 'Ghosted After Final Interview', description: 'Four rounds of interviews. One LinkedIn connection request. Absolute silence after.', statEffect: { happiness: -8, mentalHealth: -6, ambition: 2 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_overqualified', minAge: 28, maxAge: 45, title: 'Rejected for Being Overqualified', description: 'Hiring manager said you were "too experienced." You stared at the email for a while.', statEffect: { happiness: -5, ambition: -3, intelligence: 2 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_nepotism', minAge: 22, maxAge: 40, title: 'Lost Job to Nepotism', description: "The CEO's nephew got the role you'd been groomed for. Fair? Absolutely not.", statEffect: { happiness: -10, karma: -5, ambition: 4 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_internal_promotion', minAge: 24, maxAge: 50, title: 'Internal Promotion', description: 'Your manager fought for you. You got the title, the raise, and the bigger desk.', statEffect: { ambition: 8, happiness: 10, wealth: 6 }, category: 'career', color: COLORS.orchid, bankEffect: 12000 },
  { id: 'cex_salary_negotiated', minAge: 22, maxAge: 55, title: 'Salary Negotiation Win', description: 'You asked for more and they said yes. Turns out the ask was the hard part.', statEffect: { ambition: 6, happiness: 8, wealth: 4 }, category: 'career', color: COLORS.orchid, bankEffect: 8000 },
  { id: 'cex_counter_offer', minAge: 26, maxAge: 50, title: 'Counter Offer Dilemma', description: 'You accepted a competitor offer. Your current employer matched it plus a bonus.', statEffect: { happiness: 6, wealth: 5 }, choices: [
    { id: 'take_counter', text: 'Accept the counter offer', subtext: 'Loyalty has its price', statEffect: { happiness: 5, ambition: -2 } },
    { id: 'leave_anyway', text: 'Leave for the new job anyway', subtext: 'Fresh start wins', statEffect: { ambition: 8, happiness: 4 } },
  ], category: 'career', color: COLORS.orchid },
  { id: 'cex_laid_off_severance', minAge: 25, maxAge: 58, title: 'Layoff with Generous Severance', description: 'The company downsized. You got three months severance and a glowing reference.', statEffect: { happiness: -5, mentalHealth: -3, wealth: 5 }, bankEffect: 20000, category: 'career', color: COLORS.orchid },
  { id: 'cex_gap_year_career', minAge: 22, maxAge: 35, title: 'Voluntary Career Break', description: 'You quit your job deliberately. Burnout is real and you needed breathing room.', statEffect: { mentalHealth: 12, happiness: 8, wealth: -5 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_accidental_ceo', minAge: 35, maxAge: 55, title: 'Promoted to CEO Unexpectedly', description: 'The CEO resigned abruptly. The board looked around the room and chose you.', statEffect: { ambition: 15, happiness: 8, mentalHealth: -8, wealth: 10 }, category: 'career', color: COLORS.orchid, oneTime: true, bankEffect: 100000 },

  // ─── Workplace Culture ────────────────────────────────────────────────────────
  { id: 'cex_remote_work_approved', minAge: 22, maxAge: 55, title: 'Work From Home Approved', description: 'The company went fully remote. Your commute is now ten steps to your laptop.', statEffect: { happiness: 10, mentalHealth: 8, health: 3 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_return_to_office', minAge: 22, maxAge: 55, title: 'Mandatory Return to Office', description: 'Leadership mandated three days a week in the office. You dusted off your work clothes.', statEffect: { happiness: -6, mentalHealth: -5 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_office_romance', minAge: 22, maxAge: 45, title: 'Office Romance', description: 'You and a colleague started something neither of you planned.', statEffect: { happiness: 8, social: 6, mentalHealth: -3 }, choices: [
    { id: 'pursue_romance', text: 'See where it goes', subtext: 'Life is short', statEffect: { happiness: 10, mentalHealth: 3 } },
    { id: 'end_it_professionalism', text: 'Keep it professional', subtext: "Don't mix work and love", statEffect: { happiness: -5, ambition: 3 } },
  ], category: 'career', color: COLORS.orchid },
  { id: 'cex_culture_fit', minAge: 22, maxAge: 45, title: 'Culture Fit Issues', description: 'The team plays ping pong at lunch and uses words like "synergy." You do not fit in.', statEffect: { happiness: -6, social: -5, mentalHealth: -4 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_team_award', minAge: 24, maxAge: 55, title: 'Team of the Year Award', description: 'Your department won the company-wide award. The plaque is impressive, the bonus less so.', statEffect: { happiness: 8, social: 6, ambition: 4 }, bankEffect: 2000, category: 'career', color: COLORS.orchid },
  { id: 'cex_burnout_leave', minAge: 25, maxAge: 50, title: 'Burnout Leave', description: 'Your doctor ordered rest. You went on medical leave for burnout and it saved you.', statEffect: { mentalHealth: 15, health: 8, happiness: 6, wealth: -3 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_colleague_steals_idea', minAge: 24, maxAge: 50, title: 'Colleague Stole Your Idea', description: 'They presented your idea in the meeting as their own. Management loved it.', statEffect: { happiness: -12, mentalHealth: -8, karma: -2 }, choices: [
    { id: 'confront_thief', text: 'Confront them directly', subtext: 'Demand credit', statEffect: { social: -3, happiness: 5, mentalHealth: 5 } },
    { id: 'report_to_manager', text: 'Report to your manager', subtext: 'Go through proper channels', statEffect: { ambition: 3, happiness: 3 } },
    { id: 'let_it_go', text: 'Let it go this time', subtext: 'Pick your battles', statEffect: { mentalHealth: -5, karma: 5 } },
  ], category: 'career', color: COLORS.orchid },
  { id: 'cex_ai_threat', minAge: 22, maxAge: 55, title: 'AI Threatens Your Job', description: "Management hinted the company is exploring AI tools for your exact role. You're watching it carefully.", statEffect: { mentalHealth: -8, ambition: 5, intelligence: 5 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_four_day_week', minAge: 23, maxAge: 55, title: 'Four-Day Work Week Pilot', description: 'The company launched a trial. Same pay, one less day. Friday became sacred.', statEffect: { happiness: 12, health: 5, mentalHealth: 10 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_harassment_complaint', minAge: 22, maxAge: 55, title: 'Workplace Harassment Complaint', description: 'Someone crossed a line. You filed an official complaint with HR.', statEffect: { mentalHealth: -8, happiness: -6 }, choices: [
    { id: 'pursue_formally', text: 'Pursue the formal complaint', subtext: 'See it through', statEffect: { karma: 8, mentalHealth: 5 } },
    { id: 'settle_quietly', text: 'Accept a settlement', subtext: 'Move on privately', statEffect: { mentalHealth: -3, wealth: 5 }, bankEffect: 15000 },
  ], category: 'career', color: COLORS.orchid },

  // ─── Entrepreneurship ─────────────────────────────────────────────────────────
  { id: 'cex_pitch_competition', minAge: 22, maxAge: 45, title: 'Won a Pitch Competition', description: 'You pitched your idea to a panel of investors. First prize: $25,000 and a partnership offer.', statEffect: { ambition: 12, happiness: 10, social: 6 }, bankEffect: 25000, category: 'career', color: COLORS.orchid },
  { id: 'cex_angel_investment', minAge: 25, maxAge: 45, title: 'Received Angel Investment', description: 'An angel investor believed in you enough to wire $150,000 into your startup account.', statEffect: { ambition: 15, happiness: 12, wealth: 8 }, bankEffect: 150000, category: 'career', color: COLORS.orchid },
  { id: 'cex_startup_failed', minAge: 24, maxAge: 45, title: 'Startup Failed', description: 'You ran out of runway. The team was let go via email on a Friday.', statEffect: { happiness: -15, mentalHealth: -12, ambition: 5, wealth: -12 }, bankEffect: -80000, category: 'career', color: COLORS.orchid },
  { id: 'cex_acquisition_offer', minAge: 30, maxAge: 50, title: 'Acquisition Offer', description: 'A larger company offered to buy your business outright.', statEffect: { wealth: 15, happiness: 8, ambition: -3 }, choices: [
    { id: 'sell_company', text: 'Accept the acquisition', subtext: 'Take the exit', statEffect: { wealth: 20, happiness: 10 }, bankEffect: 500000 },
    { id: 'stay_independent', text: 'Decline and stay independent', subtext: 'Build something bigger', statEffect: { ambition: 10, happiness: 6 } },
  ], category: 'career', color: COLORS.orchid },
  { id: 'cex_franchise_opened', minAge: 30, maxAge: 55, title: 'Opened a Franchise', description: 'You bought into a proven brand. The paperwork took three months. The first month of sales surprised you.', statEffect: { ambition: 8, wealth: 4, happiness: 6 }, bankEffect: -80000, category: 'career', color: COLORS.orchid },
  { id: 'cex_pivot_successful', minAge: 26, maxAge: 45, title: 'Successful Business Pivot', description: 'You threw out the original idea and rebuilt in a completely new direction. It worked.', statEffect: { ambition: 12, happiness: 8, intelligence: 5 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_co_founder_dispute', minAge: 25, maxAge: 45, title: 'Co-Founder Fallout', description: 'Your business partner and you had an irreconcilable disagreement about the direction.', statEffect: { happiness: -12, mentalHealth: -10, social: -8 }, choices: [
    { id: 'mediate_cofound', text: 'Mediate with a neutral party', subtext: 'Save the company', statEffect: { happiness: 8, social: 5 } },
    { id: 'buy_out_cofound', text: 'Buy them out', subtext: 'Go it alone', statEffect: { ambition: 8, wealth: -8 }, bankEffect: -50000 },
  ], category: 'career', color: COLORS.orchid },

  // ─── Gig Economy ──────────────────────────────────────────────────────────────
  { id: 'cex_gig_freelance', minAge: 20, maxAge: 45, title: 'Went Full Freelance', description: 'You traded the steady paycheck for freedom. The income is irregular but you set your own hours.', statEffect: { happiness: 8, ambition: 6, mentalHealth: 3, wealth: -3 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_gig_platform_ban', minAge: 22, maxAge: 40, title: 'Banned from Gig Platform', description: 'Your account was suspended without warning. Three years of reviews: gone.', statEffect: { happiness: -12, wealth: -8, mentalHealth: -8 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_consulting_gig', minAge: 26, maxAge: 55, title: 'High-Value Consulting Contract', description: 'A corporation hired you as a short-term consultant at a premium daily rate.', statEffect: { ambition: 7, wealth: 8, happiness: 6 }, bankEffect: 30000, category: 'career', color: COLORS.orchid },
  { id: 'cex_creator_economy', minAge: 18, maxAge: 40, title: 'Content Creator Income', description: 'Your online presence crossed the threshold where brand deals pay real money.', statEffect: { wealth: 6, social: 8, ambition: 5 }, bankEffect: 15000, category: 'career', color: COLORS.orchid },

  // ─── Professional Development ──────────────────────────────────────────────
  { id: 'cex_sabbatical_research', minAge: 30, maxAge: 55, title: 'Sabbatical Year', description: 'Your employer approved a paid sabbatical. You wrote, researched, and rediscovered what matters.', statEffect: { intelligence: 10, mentalHealth: 12, happiness: 10, ambition: 5 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_conference_speaker', minAge: 28, maxAge: 60, title: 'Keynote Speaker', description: 'You gave a keynote at an industry conference. Two hundred professionals took notes on your words.', statEffect: { social: 10, ambition: 8, intelligence: 5, happiness: 8 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_book_published', minAge: 30, maxAge: 65, title: 'Published a Business Book', description: 'Your expertise became a hardcover. It sold modestly but changed your professional reputation.', statEffect: { ambition: 10, intelligence: 8, social: 6, happiness: 8 }, bankEffect: 20000, category: 'career', color: COLORS.orchid },
  { id: 'cex_executive_coaching', minAge: 35, maxAge: 60, title: 'Hired an Executive Coach', description: 'You invested in working with an executive coach. Your leadership style shifted noticeably.', statEffect: { intelligence: 8, ambition: 6, social: 5 }, bankEffect: -8000, category: 'career', color: COLORS.orchid },
  { id: 'cex_mba_completed', minAge: 24, maxAge: 40, title: 'Completed MBA', description: 'Two years, a mountain of debt, and a network of ambitious people. The degree opened doors.', statEffect: { intelligence: 10, ambition: 8, social: 6 }, bankEffect: -60000, category: 'career', color: COLORS.orchid },

  // ─── Specialized Careers ──────────────────────────────────────────────────────
  { id: 'cex_military_deployment', minAge: 18, maxAge: 35, title: 'Military Deployment', description: 'You were deployed overseas. The experience changed you in ways that are hard to articulate.', statEffect: { health: 8, mentalHealth: -10, karma: 5, ambition: 6 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_politics_run', minAge: 30, maxAge: 65, title: 'Ran for Local Office', description: 'You threw your hat into the ring for a local council seat.', statEffect: { social: 10, ambition: 8 }, choices: [
    { id: 'won_election', text: 'You won', subtext: 'The people chose you', statEffect: { happiness: 12, social: 10, ambition: 8 } },
    { id: 'lost_election', text: 'You lost narrowly', subtext: 'So close', statEffect: { happiness: -5, ambition: 5, social: 5 } },
  ], category: 'career', color: COLORS.orchid },
  { id: 'cex_ngo_work', minAge: 22, maxAge: 55, title: 'Took a Job at an NGO', description: 'You chose purpose over pay. The salary was modest but the work felt real.', statEffect: { karma: 12, happiness: 10, wealth: -4 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_trade_qualification', minAge: 18, maxAge: 35, title: 'Trade Qualification Earned', description: 'You completed your apprenticeship and got licensed. Skilled trades were paying well this year.', statEffect: { intelligence: 6, ambition: 5, wealth: 5 }, bankEffect: 10000, category: 'career', color: COLORS.orchid },
  { id: 'cex_artist_residency', minAge: 22, maxAge: 45, title: 'Artist Residency Accepted', description: 'A prestigious program selected you for a six-month creative residency abroad.', statEffect: { happiness: 14, intelligence: 6, social: 8 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_research_grant', minAge: 25, maxAge: 55, title: 'Research Grant Awarded', description: 'Your proposal was funded by a government science body. Two years of research, finally backed.', statEffect: { intelligence: 10, ambition: 8, happiness: 8 }, bankEffect: 80000, category: 'career', color: COLORS.orchid },

  // ─── End of Career ────────────────────────────────────────────────────────────
  { id: 'cex_early_retirement_offer', minAge: 50, maxAge: 62, title: 'Early Retirement Package', description: 'The company offered a generous early retirement package to reduce headcount.', statEffect: { happiness: 6, wealth: 6 }, choices: [
    { id: 'accept_retire', text: 'Accept early retirement', subtext: 'Enjoy the rest', statEffect: { happiness: 15, mentalHealth: 10, ambition: -8 }, bankEffect: 150000 },
    { id: 'decline_retire', text: 'Decline and keep working', subtext: 'Not ready to stop', statEffect: { ambition: 6, happiness: -2 } },
  ], category: 'career', color: COLORS.orchid },
  { id: 'cex_retirement_party', minAge: 58, maxAge: 72, title: 'Retirement Party', description: 'Decades of work ended with speeches, cake, and an engraved watch. You felt proud and terrified.', statEffect: { happiness: 14, social: 8, ambition: -5 }, category: 'milestone', color: COLORS.gold },
  { id: 'cex_consulting_postretirement', minAge: 60, maxAge: 75, title: 'Post-Retirement Consulting', description: 'Retirement lasted three weeks before former colleagues called. You consult part-time now.', statEffect: { ambition: 5, happiness: 8, wealth: 3 }, bankEffect: 5000, category: 'career', color: COLORS.orchid },
  { id: 'cex_industry_award', minAge: 40, maxAge: 70, title: 'Industry Lifetime Achievement Award', description: 'A professional association honoured you for your career contributions. The standing ovation lasted two minutes.', statEffect: { happiness: 14, social: 10, ambition: 4 }, category: 'career', color: COLORS.gold },

  // ─── Quirky Career ────────────────────────────────────────────────────────────
  { id: 'cex_wrong_meeting', minAge: 22, maxAge: 55, title: 'Joined the Wrong Meeting', description: 'You confidently joined a video call only to realize it was another team\'s strategy session. You stayed.', statEffect: { happiness: 3, intelligence: 4, social: -2 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_expense_report', minAge: 24, maxAge: 55, title: 'Expense Report Nightmare', description: 'Finance rejected your three-month expense report. Every receipt re-submitted individually.', statEffect: { happiness: -5, mentalHealth: -4 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_corporate_retreat', minAge: 25, maxAge: 55, title: 'Team Building Retreat', description: "Three days at a lakeside resort. Trust falls, personality tests, and s'mores. You bonded, sort of.", statEffect: { social: 8, happiness: 5, mentalHealth: 3 }, bankEffect: -500, category: 'career', color: COLORS.orchid },
  { id: 'cex_dress_code_incident', minAge: 22, maxAge: 45, title: 'Dress Code Violation', description: 'You wore jeans on a non-casual Friday. HR sent a reminder to the whole floor.', statEffect: { happiness: -3, social: -2 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_accidentally_replied_all', minAge: 22, maxAge: 55, title: 'Reply-All Disaster', description: 'A very personal email went to the entire 400-person company. The silence in the office was deafening.', statEffect: { happiness: -8, social: -8, mentalHealth: -5 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_commute_from_hell', minAge: 22, maxAge: 50, title: 'Nightmare Commute', description: 'Two hours each way for three years. The podcast library was extensive. The quality of life: less so.', statEffect: { health: -5, mentalHealth: -7, happiness: -6 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_intern_hired', minAge: 22, maxAge: 30, title: 'Intern to Full-Time', description: 'They offered you a full-time position at the end of your internship. You took it without hesitation.', statEffect: { ambition: 10, happiness: 12, wealth: 4 }, bankEffect: 5000, category: 'career', color: COLORS.orchid },
  { id: 'cex_company_goes_bankrupt', minAge: 25, maxAge: 55, title: 'Company Goes Bankrupt', description: 'Your employer filed for bankruptcy. Friday was the last payday. You started job-hunting Saturday.', statEffect: { happiness: -15, mentalHealth: -10, wealth: -8 }, category: 'career', color: COLORS.orchid },
  { id: 'cex_startup_unicorn', minAge: 28, maxAge: 45, title: 'Startup Reached Unicorn Status', description: 'Your early-stage startup was valued at over one billion dollars. The equity email was life-changing.', statEffect: { wealth: 20, happiness: 15, ambition: 10 }, bankEffect: 2000000, category: 'career', color: COLORS.gold, oneTime: true, rarity: 'legendary' },
];
