import { LifeEvent, EventCategory } from '../../types';
import { COLORS } from '@theme';

const CATEGORY_COLORS: Record<EventCategory, string> = {
  education: COLORS.sapphire,
  career: COLORS.orchid,
  relationship: COLORS.crimson,
  health: COLORS.emerald,
  financial: COLORS.gold,
  family: COLORS.teal,
  random: COLORS.t3,
  milestone: COLORS.gold2,
  crime: COLORS.crimson,
  travel: COLORS.sapphire,
  activity: COLORS.teal,
};

const TITLES: Record<EventCategory, string[]> = {
  education: ['Pop Quiz', 'Study Group', 'Library Discovery', 'Extra Credit', 'Class Presentation'],
  career: ['Overtime Offer', 'Team Project', 'Office Politics', 'Performance Review', 'Networking Event'],
  relationship: ['Coffee Date', 'Late Night Talk', 'Anniversary', 'Family Dinner', 'Old Friend Returns'],
  health: ['Annual Checkup', 'Flu Season', 'Gym Membership', 'Sleep Deprivation', 'Wellness Retreat'],
  financial: ['Tax Refund', 'Unexpected Bill', 'Investment Tip', 'Side Income', 'Budget Crisis'],
  family: ['Family Reunion', 'Sibling Rivalry', 'Parent Advice', 'Holiday Gathering', 'Home Repair'],
  random: ['Lucky Find', 'Rainy Day', 'Power Outage', 'Neighbour Dispute', 'Street Festival'],
  milestone: ['Birthday Reflection', 'Life Checkpoint', 'Personal Record', 'New Hobby', 'Bucket List Item'],
  crime: ['Suspicious Activity', 'Witness Statement', 'Community Patrol', 'Legal Notice', 'Probation Check'],
  travel: ['Weekend Trip', 'Airport Delay', 'Cultural Festival', 'Road Trip', 'Border Crossing'],
  activity: ['Volunteer Day', 'Cooking Class', 'Book Club', 'Sports League', 'Art Workshop'],
};

const DESCRIPTIONS: Record<EventCategory, string[]> = {
  education: ['You faced an unexpected academic challenge.', 'A teacher noticed your potential.', 'You spent hours preparing for an exam.'],
  career: ['Work demanded more of your time.', 'A colleague shared useful advice.', 'Your boss called you into a meeting.'],
  relationship: ['Someone special reached out.', 'You navigated a tricky conversation.', 'Love was in the air.'],
  health: ['Your body sent you a signal.', 'You reconsidered your habits.', 'A health scare made you think.'],
  financial: ['Money matters demanded attention.', 'An opportunity appeared on your horizon.', 'Your wallet felt lighter.'],
  family: ['Family dynamics shifted.', 'Relatives had opinions about your life.', 'Home felt different this year.'],
  random: ['Life threw a curveball.', 'Something unusual happened nearby.', 'Fate had other plans.'],
  milestone: ['You paused to reflect on how far you have come.', 'A meaningful moment passed.', 'You crossed a personal threshold.'],
  crime: ['The law caught up with your past.', 'You witnessed something unsettling.', 'Authorities took notice.'],
  travel: ['You ventured beyond your routine.', 'A journey changed your perspective.', 'Travel plans went sideways.'],
  activity: ['You tried something new.', 'A hobby brought unexpected joy.', 'Leisure time paid off.'],
};

function statEffectForCategory(_seed: number): LifeEvent['statEffect'] {
  const effects: LifeEvent['statEffect'][] = [
    { happiness: 3, social: 2 },
    { health: 2, fitness: 1 },
    { intelligence: 3 },
    { wealth: 2, ambition: 1 },
    { happiness: -2, mentalHealth: -1 },
    { social: 4, looks: 1 },
    { fitness: 3, health: 2 },
    { ambition: 3, intelligence: 1 },
  ];
  return effects[Math.floor(Math.random() * effects.length)];
}

export function generateExpansionEvents(count: number, idOffset = 0): LifeEvent[] {
  const categories = Object.keys(TITLES) as EventCategory[];
  const events: LifeEvent[] = [];

  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length];
    const titles = TITLES[cat];
    const descs = DESCRIPTIONS[cat];
    const minAge = (i % 8) * 10;
    const maxAge = Math.min(95, minAge + 15 + (i % 10));

    events.push({
      id: `exp_${idOffset + i}`,
      minAge,
      maxAge,
      title: `${titles[i % titles.length]} #${i + 1}`,
      description: descs[i % descs.length],
      statEffect: statEffectForCategory(i),
      category: cat,
      color: CATEGORY_COLORS[cat],
    });
  }
  return events;
}
