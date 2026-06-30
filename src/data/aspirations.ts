import type { AspirationId, EventCategory } from '../types';

export interface AspirationDef {
  id: AspirationId;
  label: string;
  description: string;
  categories: EventCategory[];
}

export const ASPIRATIONS: AspirationDef[] = [
  { id: 'career_peak', label: 'Career Peak', description: 'Reach the top of your profession', categories: ['career'] },
  { id: 'family_dynasty', label: 'Family Dynasty', description: 'Build a lasting family legacy', categories: ['family', 'relationship'] },
  { id: 'fortune', label: 'Fortune', description: 'Accumulate great wealth', categories: ['financial'] },
  { id: 'fame', label: 'Fame', description: 'Become known to the world', categories: ['career', 'random'] },
  { id: 'redemption', label: 'Redemption', description: 'Atone and rebuild your reputation', categories: ['crime', 'family'] },
  { id: 'knowledge', label: 'Knowledge', description: 'Master learning and wisdom', categories: ['education'] },
  { id: 'adventure', label: 'Adventure', description: 'Live boldly and explore', categories: ['travel', 'activity'] },
  { id: 'criminal_empire', label: 'Criminal Empire', description: 'Rule the underworld', categories: ['crime'] },
  { id: 'creative_legacy', label: 'Creative Legacy', description: 'Leave an artistic mark', categories: ['activity', 'career'] },
  { id: 'spiritual', label: 'Spiritual Enlightenment', description: 'Find inner peace and purpose', categories: ['health', 'family'] },
  { id: 'political_power', label: 'Political Power', description: 'Shape society through leadership', categories: ['career', 'family'] },
  { id: 'quiet_life', label: 'Quiet Life', description: 'Happiness in simplicity', categories: ['family', 'health'] },
];

export const ASPIRATION_MAP = Object.fromEntries(
  ASPIRATIONS.map(a => [a.id, a]),
) as Record<AspirationId, AspirationDef>;
