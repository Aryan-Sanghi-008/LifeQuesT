import { LifeEvent } from '../../types';

export const MILESTONE_EVENTS: LifeEvent[] = [
  // ─── Coming of Age ─────────────────────────────────────────────────────────
  { id: 'first_day_school', title: 'First Day of School', description: 'You started your first day of school. The world felt so big.', category: 'milestone', minAge: 5, maxAge: 6, weight: 10, statEffect: { intelligence: 5, social: 5, happiness: 8 }, color: '#3B82F6', choices: [] },
  { id: 'learn_to_ride_bike', title: 'Learned to Ride a Bike', description: 'After many falls, you finally rode your bike without training wheels!', category: 'milestone', minAge: 5, maxAge: 9, weight: 8, statEffect: { fitness: 5, happiness: 10 }, color: '#10B981', choices: [] },
  { id: 'first_job_ever', title: 'First Job', description: 'You got your very first job and earned your own money!', category: 'milestone', minAge: 16, maxAge: 20, weight: 8, statEffect: { ambition: 12, happiness: 10, intelligence: 3 }, bankEffect: 3000, color: '#10B981', choices: [] },
  { id: 'drivers_license', title: 'Drivers License', description: 'You passed your driving test and got your license!', category: 'milestone', minAge: 16, maxAge: 20, weight: 8, statEffect: { happiness: 12, social: 8, ambition: 5 }, color: '#10B981', choices: [] },
  { id: 'first_apartment', title: 'First Apartment', description: 'You moved into your very first apartment — total independence!', category: 'milestone', minAge: 18, maxAge: 25, weight: 8, statEffect: { happiness: 15, ambition: 10, mentalHealth: 8 }, bankEffect: -3000, color: '#10B981', choices: [] },
  { id: 'come_of_age_birthday', title: '18th Birthday', description: 'You turned 18. The world opened up before you.', category: 'milestone', minAge: 18, maxAge: 18, weight: 10, statEffect: { happiness: 15, ambition: 10, social: 8 }, color: '#EC4899', choices: [] },

  // ─── Career Milestones ────────────────────────────────────────────────────
  { id: 'first_promotion', title: 'First Promotion', description: 'Your hard work paid off — your first promotion came through!', category: 'milestone', minAge: 22, maxAge: 40, weight: 7, statEffect: { ambition: 15, happiness: 12, intelligence: 5 }, bankEffect: 10000, color: '#10B981', choices: [] },
  { id: 'dream_job_offer', title: 'Dream Job Offer', description: 'You received an offer for the job you always dreamed of.', category: 'milestone', minAge: 22, maxAge: 45, weight: 5, statEffect: { happiness: 20, ambition: 15 }, bankEffect: 20000, color: '#10B981', choices: [
    { id: 'accept_dream_job', text: 'Accept the offer', subtext: 'Live your dream', statEffect: { happiness: 20, ambition: 15 } },
    { id: 'negotiate_dream_job', text: 'Negotiate for more', subtext: 'Push for better terms', statEffect: { happiness: 18, ambition: 18 }, bankEffect: 15000, successChance: 65 },
  ]},
  { id: 'start_own_business', title: 'Launch Your Own Business', description: 'You decided to take the leap and start your own business.', category: 'milestone', minAge: 22, maxAge: 50, weight: 5, statEffect: { ambition: 20, happiness: 8 }, bankEffect: -15000, color: '#F59E0B', choices: [] },
  { id: 'career_pivot', title: 'Career Pivot', description: 'You decided to completely change your career path.', category: 'milestone', minAge: 25, maxAge: 45, weight: 5, statEffect: { ambition: 8, mentalHealth: 5 }, color: '#8B5CF6', choices: [
    { id: 'bold_pivot', text: 'Make the bold leap', subtext: 'Start fresh', statEffect: { ambition: 15, happiness: 10 } },
    { id: 'gradual_pivot', text: 'Transition gradually', subtext: 'Lower risk', statEffect: { ambition: 8, happiness: 6 } },
  ]},
  { id: 'named_partner', title: 'Named Partner', description: 'After years of hard work, you were named a partner at your firm.', category: 'milestone', minAge: 30, maxAge: 50, weight: 3, statEffect: { ambition: 15, social: 10, happiness: 18 }, bankEffect: 50000, color: '#10B981', choices: [] },

  // ─── Personal Achievements ─────────────────────────────────────────────────
  { id: 'travel_abroad_first', title: 'First International Trip', description: 'You traveled abroad for the first time. The experience changed your perspective.', category: 'milestone', minAge: 18, maxAge: 40, weight: 7, statEffect: { intelligence: 8, happiness: 15, social: 8 }, bankEffect: -5000, color: '#10B981', choices: [] },
  { id: 'write_a_book', title: 'Published a Book', description: 'Your book was accepted by a publisher. You are a published author!', category: 'milestone', minAge: 25, maxAge: 70, weight: 3, statEffect: { intelligence: 10, ambition: 15, social: 8, happiness: 20 }, bankEffect: 15000, color: '#EC4899', choices: [] },
  { id: 'run_for_office', title: 'Run for Local Office', description: 'You decided to run for a local government position.', category: 'milestone', minAge: 28, maxAge: 60, weight: 3, statEffect: { social: 15, ambition: 12 }, bankEffect: -10000, color: '#3B82F6', choices: [
    { id: 'win_election', text: 'Win the election', subtext: 'Victory!', statEffect: { social: 20, ambition: 20, happiness: 15 }, successChance: 45 },
    { id: 'lose_election', text: 'Lose the election', subtext: 'Defeat is hard', statEffect: { social: 5, happiness: -8 } },
  ]},
  { id: 'charity_work_milestone', title: 'Charitable Achievement', description: 'Your years of charitable work were recognized with an award.', category: 'milestone', minAge: 30, maxAge: 75, weight: 5, statEffect: { karma: 20, social: 12, happiness: 15 }, color: '#10B981', choices: [] },
  { id: 'grandparent_milestone', title: 'Becoming a Grandparent', description: 'Your child had a baby! You are a grandparent now.', category: 'milestone', minAge: 45, maxAge: 75, weight: 6, statEffect: { happiness: 20, social: 10, mentalHealth: 12 }, color: '#EC4899', choices: [] },

  // ─── End of Life ───────────────────────────────────────────────────────────
  { id: 'retirement_day', title: 'Retirement Day', description: 'After decades of work, you finally retired. The next chapter begins.', category: 'milestone', minAge: 58, maxAge: 70, weight: 7, statEffect: { happiness: 18, mentalHealth: 12, social: -5, ambition: -10 }, color: '#F59E0B', choices: [
    { id: 'active_retirement', text: 'Stay active and engaged', subtext: 'Travel, volunteer, explore', statEffect: { happiness: 20, health: 8, social: 10 } },
    { id: 'quiet_retirement', text: 'Enjoy the peace and quiet', subtext: 'Rest and relax', statEffect: { mentalHealth: 15, health: 5 } },
  ]},
  { id: 'life_review', title: 'A Life Well Lived?', description: 'Reflecting on your choices, you take stock of what your life has meant.', category: 'milestone', minAge: 70, maxAge: 90, weight: 5, statEffect: { happiness: 5, mentalHealth: 8 }, color: '#8B5CF6', choices: [] },
  { id: 'reconciliation', title: 'Long-Overdue Reconciliation', description: 'You reached out to repair a broken relationship that had haunted you for years.', category: 'milestone', minAge: 35, maxAge: 80, weight: 5, statEffect: { mentalHealth: 18, happiness: 15, karma: 12, social: 8 }, color: '#10B981', choices: [] },
  { id: 'bucket_list_item', title: 'Bucket List Achievement', description: 'You crossed something meaningful off your bucket list.', category: 'milestone', minAge: 25, maxAge: 80, weight: 8, statEffect: { happiness: 18, ambition: 8, mentalHealth: 10 }, bankEffect: -8000, color: '#EC4899', choices: [] },
];
