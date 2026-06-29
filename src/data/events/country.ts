import { LifeEvent } from '../../types';
import { COLORS } from '@theme';

const COUNTRY_CODES = ['IN', 'US', 'GB', 'JP', 'BR', 'NG', 'DE', 'AU', 'SG', 'AE'] as const;
const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India', US: 'USA', GB: 'UK', JP: 'Japan', BR: 'Brazil',
  NG: 'Nigeria', DE: 'Germany', AU: 'Australia', SG: 'Singapore', AE: 'UAE',
};

const COUNTRY_EVENT_TEMPLATES = [
  { title: 'Local Festival', desc: 'A traditional festival brought the community together.', effect: { happiness: 8, social: 5 } },
  { title: 'National Holiday', desc: 'You celebrated a national holiday with family.', effect: { happiness: 10, social: 3 } },
  { title: 'Regional Cuisine', desc: 'You discovered a beloved local dish.', effect: { happiness: 5, health: 2 } },
  { title: 'Civic Duty', desc: 'You participated in a local civic event.', effect: { karma: 10, social: 5 } },
  { title: 'Cultural Heritage', desc: 'You connected with your cultural roots.', effect: { happiness: 8, intelligence: 3 } },
];

export const COUNTRY_EVENTS: LifeEvent[] = COUNTRY_CODES.flatMap((code) =>
  COUNTRY_EVENT_TEMPLATES.map((tpl, ti) => ({
    id: `country_${code.toLowerCase()}_${ti}`,
    minAge: 10 + ti * 8,
    maxAge: 70 + ti * 2,
    title: `${COUNTRY_NAMES[code]}: ${tpl.title}`,
    description: tpl.desc,
    statEffect: tpl.effect,
    category: 'family' as const,
    color: COLORS.teal,
    requiresCountry: [code],
    oneTime: ti < 2,
  })),
);
