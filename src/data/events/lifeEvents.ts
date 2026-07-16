import type { LifeEvent } from '@/types';
import { CORE_LIFE_EVENTS } from './coreLifeEvents';
import { EXPANSION_AUTHORED_EVENTS } from './expansionAuthored';
import { CRIME_EVENTS } from './crime';
import { SOCIAL_VIRALITY_EVENTS } from './social';
import { COUNTRY_EVENTS } from './country';
import { BUSINESS_EVENTS, EDUCATION_EVENTS } from './businessEducation';
import { LIFE_EVENTS_EXPANDED } from './lifeEventsExpanded';
import { CAREER_EVENTS } from './careerEvents';
import { HEALTH_EVENTS } from './healthEvents';
import { RELATIONSHIP_EVENTS } from './relationshipEvents';
import { EDUCATION_EVENTS_2 } from './educationEvents2';
import { FINANCIAL_EVENTS } from './financialEvents';
import { MILESTONE_EVENTS } from './milestoneEvents';
import { MEMORY_CHAIN_EVENTS } from './memoryChainEvents';
import { PHASE_A_DECISION_EVENTS } from './phaseADecisions';
import { CAREER_EVENTS_EXPANDED } from './careerEventsExpanded';
import { RELATIONSHIP_EVENTS_EXPANDED } from './relationshipEventsExpanded';
import { HEALTH_EVENTS_EXPANDED } from './healthEventsExpanded';
import { EDUCATION_EVENTS_EXPANDED } from './educationEventsExpanded';
import { CRIME_EVENTS_EXPANDED } from './crimeEventsExpanded';
import { FINANCIAL_EVENTS_EXPANDED } from './financialEventsExpanded';
import { FAMILY_EVENTS } from './familyEvents';
import { MILESTONE_EVENTS_EXPANDED } from './milestoneEventsExpanded';
import { QUIRKY_EVENTS } from './quirkyEvents';
import { TRAVEL_EVENTS } from './travelEvents';
import { WORLD_EVENTS_EXPANDED } from './worldEventsExpanded';
import { SCENARIO_EVENTS } from './scenarioEvents';

export { CORE_LIFE_EVENTS };

export const LIFE_EVENTS: LifeEvent[] = [
  ...CORE_LIFE_EVENTS,
  ...CRIME_EVENTS,
  ...SOCIAL_VIRALITY_EVENTS,
  ...BUSINESS_EVENTS,
  ...EDUCATION_EVENTS,
  ...COUNTRY_EVENTS,
  ...EXPANSION_AUTHORED_EVENTS,
  ...LIFE_EVENTS_EXPANDED,
  ...CAREER_EVENTS,
  ...HEALTH_EVENTS,
  ...RELATIONSHIP_EVENTS,
  ...EDUCATION_EVENTS_2,
  ...FINANCIAL_EVENTS,
  ...MILESTONE_EVENTS,
  ...MEMORY_CHAIN_EVENTS,
  ...PHASE_A_DECISION_EVENTS,
  ...CAREER_EVENTS_EXPANDED,
  ...RELATIONSHIP_EVENTS_EXPANDED,
  ...HEALTH_EVENTS_EXPANDED,
  ...EDUCATION_EVENTS_EXPANDED,
  ...CRIME_EVENTS_EXPANDED,
  ...FINANCIAL_EVENTS_EXPANDED,
  ...FAMILY_EVENTS,
  ...MILESTONE_EVENTS_EXPANDED,
  ...QUIRKY_EVENTS,
  ...TRAVEL_EVENTS,
  ...WORLD_EVENTS_EXPANDED,
  ...SCENARIO_EVENTS,
];
