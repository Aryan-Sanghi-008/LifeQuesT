import type { EventCategory, FocusDomain } from '../types';

export interface FocusDomainDef {
  id: FocusDomain;
  label: string;
  description: string;
  categories: EventCategory[];
}

export const FOCUS_DOMAINS: FocusDomainDef[] = [
  { id: 'career', label: 'Career', description: 'Work, promotions, job events', categories: ['career'] },
  { id: 'education', label: 'Education', description: 'School, exams, learning', categories: ['education'] },
  { id: 'health', label: 'Health', description: 'Fitness, wellness, medical', categories: ['health'] },
  { id: 'social', label: 'Social', description: 'Friends, romance, community', categories: ['relationship', 'random'] },
  { id: 'finance', label: 'Finance', description: 'Money, investments, expenses', categories: ['financial'] },
  { id: 'hobby', label: 'Hobby', description: 'Activities, passions, sports', categories: ['activity', 'travel'] },
  { id: 'crime', label: 'Crime', description: 'Risky and illegal paths', categories: ['crime'] },
  { id: 'family', label: 'Family', description: 'Parents, children, home life', categories: ['family', 'milestone'] },
];

export const FOCUS_DOMAIN_MAP = Object.fromEntries(
  FOCUS_DOMAINS.map(d => [d.id, d]),
) as Record<FocusDomain, FocusDomainDef>;
