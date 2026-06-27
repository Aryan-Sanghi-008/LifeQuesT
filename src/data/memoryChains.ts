import type { EventCategory } from '../types';

export interface MemoryChainStepDef {
  eventId: string;
  label: string;
  minAge: number;
  maxAge: number;
  grantsTag: string;
  requiredTags?: string[];
}

export interface MemoryChainDef {
  id: string;
  label: string;
  category: EventCategory;
  steps: MemoryChainStepDef[];
}

interface MemoryChainSeed {
  id: string;
  label: string;
  category: EventCategory;
  ages: Array<readonly [number, number]>;
}

const STEP_LABELS: Record<number, readonly string[]> = {
  2: ['Opening', 'Aftermath'],
  3: ['Opening', 'Complication', 'Resolution'],
};

function buildChain(seed: MemoryChainSeed): MemoryChainDef {
  const stepLabels = STEP_LABELS[seed.ages.length] ?? STEP_LABELS[3];

  return {
    id: seed.id,
    label: seed.label,
    category: seed.category,
    steps: seed.ages.map(([minAge, maxAge], index) => {
      const stepNumber = index + 1;
      const grantsTag = `${seed.id}_step_${stepNumber}`;

      return {
        eventId: `${seed.id}_${stepNumber}`,
        label: stepLabels[index] ?? `Step ${stepNumber}`,
        minAge,
        maxAge,
        grantsTag,
        requiredTags: index === 0 ? undefined : [`${seed.id}_step_${stepNumber - 1}`],
      };
    }),
  };
}

const MEMORY_CHAIN_SEEDS: MemoryChainSeed[] = [
  { id: 'betrayal_arc', label: 'The Betrayal Arc', category: 'relationship', ages: [[14, 17], [22, 30], [40, 55]] },
  { id: 'startup_dream', label: 'Startup Dream', category: 'career', ages: [[19, 25], [26, 35], [36, 50]] },
  { id: 'first_love_lasting', label: 'First Love Lasting', category: 'relationship', ages: [[15, 18], [25, 35], [45, 60]] },
  { id: 'criminal_descent', label: 'Criminal Descent', category: 'crime', ages: [[16, 20], [22, 30], [30, 45]] },
  { id: 'redemption_path', label: 'Redemption Path', category: 'milestone', ages: [[18, 26], [27, 40], [40, 70]] },
  { id: 'academic_rivalry', label: 'Academic Rivalry', category: 'education', ages: [[14, 18], [19, 24], [30, 40]] },
  { id: 'family_business_dynasty', label: 'Family Business Dynasty', category: 'family', ages: [[25, 40], [30, 50], [60, 80]] },
  { id: 'health_scare_wakeup', label: 'Health Scare Wake-Up', category: 'health', ages: [[35, 50], [50, 60], [60, 80]] },
  { id: 'whistleblower', label: 'Whistleblower', category: 'career', ages: [[28, 45], [45, 55], [55, 70]] },
  { id: 'pet_companion_journey', label: 'Pet Companion Journey', category: 'family', ages: [[8, 15], [15, 25], [25, 80]] },
  { id: 'fame_and_fall', label: 'Fame and Fall', category: 'random', ages: [[20, 35], [30, 50], [50, 70]] },
  { id: 'war_deployment', label: 'War Deployment', category: 'random', ages: [[18, 30], [30, 45], [45, 70]] },
  { id: 'secret_child', label: 'Secret Child', category: 'family', ages: [[20, 35], [35, 50], [50, 80]] },
  { id: 'lottery_winner_curse', label: 'Lottery Winner Curse', category: 'financial', ages: [[18, 40], [20, 50], [40, 80]] },
  { id: 'mentorship_legacy', label: 'Mentorship Legacy', category: 'career', ages: [[25, 40], [40, 55], [55, 75]] },
  { id: 'pandemic_survival', label: 'Pandemic Survival', category: 'random', ages: [[18, 60], [19, 65], [25, 80]] },
  { id: 'art_world_discovery', label: 'Art World Discovery', category: 'activity', ages: [[8, 15], [20, 30], [35, 60]] },
  { id: 'political_rise_fall', label: 'Political Rise and Fall', category: 'career', ages: [[25, 40], [40, 60], [60, 80]] },
  { id: 'sibling_rivalry_dynasty', label: 'Sibling Rivalry Dynasty', category: 'family', ages: [[6, 12], [25, 40], [40, 65]] },
  { id: 'immigrant_story', label: 'The Immigrant Story', category: 'travel', ages: [[18, 30], [30, 45], [45, 80]] },
  { id: 'first_apartment', label: 'First Apartment', category: 'financial', ages: [[18, 28], [28, 40]] },
  { id: 'side_hustle', label: 'Side Hustle', category: 'career', ages: [[18, 30], [30, 50]] },
  { id: 'fitness_comeback', label: 'Fitness Comeback', category: 'health', ages: [[18, 40], [40, 65]] },
  { id: 'study_abroad', label: 'Study Abroad', category: 'education', ages: [[18, 26], [26, 40]] },
  { id: 'caregiving_duty', label: 'Caregiving Duty', category: 'family', ages: [[30, 50], [50, 80]] },
  { id: 'marriage_repair', label: 'Marriage Repair', category: 'relationship', ages: [[25, 55], [25, 70]] },
  { id: 'investor_pitch', label: 'Investor Pitch', category: 'financial', ages: [[22, 40], [40, 60]] },
  { id: 'neighborhood_tension', label: 'Neighborhood Tension', category: 'relationship', ages: [[18, 60], [20, 65]] },
  { id: 'volunteer_spiral', label: 'Volunteer Spiral', category: 'activity', ages: [[16, 70], [20, 75]] },
  { id: 'revenge_detour', label: 'Revenge Detour', category: 'crime', ages: [[16, 45], [20, 50]] },
  { id: 'home_renovation', label: 'Home Renovation', category: 'family', ages: [[25, 55], [30, 70]] },
  { id: 'debt_recovery', label: 'Debt Recovery', category: 'financial', ages: [[20, 55], [25, 70]] },
  { id: 'creative_block', label: 'Creative Block', category: 'activity', ages: [[15, 60], [20, 70]] },
  { id: 'scholarship_pressure', label: 'Scholarship Pressure', category: 'education', ages: [[14, 24], [18, 30]] },
  { id: 'new_city', label: 'New City', category: 'travel', ages: [[18, 50], [20, 60]] },
  { id: 'burnout_recovery', label: 'Burnout Recovery', category: 'health', ages: [[22, 60], [25, 70]] },
  { id: 'community_leadership', label: 'Community Leadership', category: 'milestone', ages: [[20, 60], [25, 70]] },
  { id: 'small_business_hiring', label: 'Small Business Hiring', category: 'career', ages: [[24, 55], [30, 65]] },
  { id: 'divorce_aftermath', label: 'Divorce Aftermath', category: 'relationship', ages: [[25, 65], [30, 75]] },
  { id: 'adoption_process', label: 'Adoption Process', category: 'family', ages: [[28, 50], [30, 55]] },
  { id: 'family_reunion', label: 'Family Reunion', category: 'family', ages: [[10, 80], [15, 80]] },
  { id: 'career_reset', label: 'Career Reset', category: 'career', ages: [[22, 60], [25, 70]] },
  { id: 'injury_rehab', label: 'Injury Rehab', category: 'health', ages: [[10, 50], [20, 60]] },
  { id: 'travel_mishap', label: 'Travel Mishap', category: 'travel', ages: [[18, 50], [20, 60]] },
  { id: 'spiritual_search', label: 'Spiritual Search', category: 'milestone', ages: [[18, 80], [20, 80]] },
  { id: 'artistic_breakthrough', label: 'Artistic Breakthrough', category: 'activity', ages: [[12, 60], [20, 70]] },
  { id: 'late_life_friendship', label: 'Late-Life Friendship', category: 'relationship', ages: [[40, 80], [50, 80]] },
  { id: 'reconciliation_letter', label: 'Reconciliation Letter', category: 'family', ages: [[15, 80], [20, 80]] },
  { id: 'public_spotlight', label: 'Public Spotlight', category: 'random', ages: [[18, 60], [20, 70]] },
  { id: 'retirement_reinvention', label: 'Retirement Reinvention', category: 'milestone', ages: [[55, 80], [60, 85]] },
];

export const MEMORY_CHAINS: MemoryChainDef[] = MEMORY_CHAIN_SEEDS.map(buildChain);
