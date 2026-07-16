import type { LifeEvent } from '../../types';
import { CORE_LIFE_EVENTS } from './coreLifeEvents';

type PackDef = {
  id: string;
  minAge: number;
  maxAge: number;
  load: () => Promise<LifeEvent[]>;
};

function lazyRequire(loader: () => LifeEvent[]): () => Promise<LifeEvent[]> {
  return () => Promise.resolve(loader());
}

const EVENT_PACKS: PackDef[] = [
  { id: 'crime', minAge: 10, maxAge: 90, load: lazyRequire(() => require('./crime').CRIME_EVENTS) },
  { id: 'social', minAge: 12, maxAge: 70, load: lazyRequire(() => require('./social').SOCIAL_VIRALITY_EVENTS) },
  { id: 'business', minAge: 18, maxAge: 80, load: lazyRequire(() => require('./businessEducation').BUSINESS_EVENTS) },
  { id: 'education', minAge: 5, maxAge: 30, load: lazyRequire(() => require('./businessEducation').EDUCATION_EVENTS) },
  { id: 'lifeExpanded', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./lifeEventsExpanded').LIFE_EVENTS_EXPANDED) },
  { id: 'career', minAge: 16, maxAge: 70, load: lazyRequire(() => require('./careerEvents').CAREER_EVENTS) },
  { id: 'health', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./healthEvents').HEALTH_EVENTS) },
  { id: 'relationship', minAge: 13, maxAge: 90, load: lazyRequire(() => require('./relationshipEvents').RELATIONSHIP_EVENTS) },
  { id: 'education2', minAge: 14, maxAge: 35, load: lazyRequire(() => require('./educationEvents2').EDUCATION_EVENTS_2) },
  { id: 'financial', minAge: 18, maxAge: 90, load: lazyRequire(() => require('./financialEvents').FINANCIAL_EVENTS) },
  { id: 'milestone', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./milestoneEvents').MILESTONE_EVENTS) },
  { id: 'memory', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./memoryChainEvents').MEMORY_CHAIN_EVENTS) },
  { id: 'phaseA', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./phaseADecisions').PHASE_A_DECISION_EVENTS) },
  { id: 'careerExpanded', minAge: 18, maxAge: 70, load: lazyRequire(() => require('./careerEventsExpanded').CAREER_EVENTS_EXPANDED) },
  { id: 'relationshipExpanded', minAge: 13, maxAge: 90, load: lazyRequire(() => require('./relationshipEventsExpanded').RELATIONSHIP_EVENTS_EXPANDED) },
  { id: 'healthExpanded', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./healthEventsExpanded').HEALTH_EVENTS_EXPANDED) },
  { id: 'educationExpanded', minAge: 14, maxAge: 35, load: lazyRequire(() => require('./educationEventsExpanded').EDUCATION_EVENTS_EXPANDED) },
  { id: 'crimeExpanded', minAge: 14, maxAge: 90, load: lazyRequire(() => require('./crimeEventsExpanded').CRIME_EVENTS_EXPANDED) },
  { id: 'financialExpanded', minAge: 18, maxAge: 90, load: lazyRequire(() => require('./financialEventsExpanded').FINANCIAL_EVENTS_EXPANDED) },
  { id: 'family', minAge: 0, maxAge: 90, load: lazyRequire(() => require('./familyEvents').FAMILY_EVENTS) },
  { id: 'milestoneExpanded', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./milestoneEventsExpanded').MILESTONE_EVENTS_EXPANDED) },
  { id: 'quirky', minAge: 5, maxAge: 90, load: lazyRequire(() => require('./quirkyEvents').QUIRKY_EVENTS) },
  { id: 'travel', minAge: 16, maxAge: 80, load: lazyRequire(() => require('./travelEvents').TRAVEL_EVENTS) },
  { id: 'world', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./worldEventsExpanded').WORLD_EVENTS_EXPANDED) },
  { id: 'scenario', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./scenarioEvents').SCENARIO_EVENTS) },
  { id: 'country', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./country').COUNTRY_EVENTS) },
  { id: 'expansionAuthored', minAge: 0, maxAge: 100, load: lazyRequire(() => require('./expansionAuthored').EXPANSION_AUTHORED_EVENTS) },
];

const PRELOAD_MARGIN = 3;
const loadedPackIds = new Set<string>();
let coreRegistered = false;
const loadedEvents: LifeEvent[] = [];
let loadPromise: Promise<void> | null = null;

function registerCoreEvents(): void {
  if (coreRegistered) return;
  loadedEvents.push(...CORE_LIFE_EVENTS);
  loadedPackIds.add('core');
  coreRegistered = true;
}

function packsForAge(age: number): PackDef[] {
  const min = Math.max(0, age - PRELOAD_MARGIN);
  const max = age + PRELOAD_MARGIN;
  return EVENT_PACKS.filter((p) => p.maxAge >= min && p.minAge <= max);
}

async function loadPacks(packs: PackDef[]): Promise<void> {
  registerCoreEvents();
  const pending = packs.filter((p) => !loadedPackIds.has(p.id));
  if (pending.length === 0) return;

  const results = await Promise.all(pending.map(async (p) => {
    const events = await p.load();
    return { id: p.id, events };
  }));

  for (const { id, events } of results) {
    if (!loadedPackIds.has(id)) {
      loadedPackIds.add(id);
      loadedEvents.push(...events);
    }
  }
}

/** Load event packs needed for the given age (+ adjacent stages). */
export async function ensureEventsLoadedForAge(age: number): Promise<void> {
  if (loadPromise) {
    await loadPromise;
  }
  loadPromise = loadPacks(packsForAge(age));
  await loadPromise;
  loadPromise = null;
}

/** Preload all packs (tests / dev). */
export async function preloadAllEventPacks(): Promise<void> {
  registerCoreEvents();
  await loadPacks(EVENT_PACKS);
}

export function preloadAdjacentEventPacks(age: number): void {
  void ensureEventsLoadedForAge(age + PRELOAD_MARGIN);
}

export function getAllLoadedEvents(): LifeEvent[] {
  if (!coreRegistered) {
    registerCoreEvents();
  }
  return loadedEvents;
}

/** @internal tests */
export function __resetEventLoaderForTests(): void {
  loadedPackIds.clear();
  loadedEvents.length = 0;
  coreRegistered = false;
  loadPromise = null;
}
