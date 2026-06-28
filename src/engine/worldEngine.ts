
export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  type: 'recession' | 'pandemic' | 'war' | 'housing_boom' | 'crypto_boom';
  duration: number;
}

const WORLD_EVENTS_POOL: Omit<WorldEvent, 'duration'>[] = [
  {
    id: 'recession',
    title: 'Economic Recession',
    description: 'A global recession is underway. Property values are falling, and raises are harder to get.',
    type: 'recession',
  },
  {
    id: 'pandemic',
    title: 'Global Pandemic',
    description: 'A health crisis has locked down the country. Health levels and general happiness are decreasing.',
    type: 'pandemic',
  },
  {
    id: 'war',
    title: 'Regional Conflict',
    description: 'A military conflict has broken out. Taxes are temporarily raised to fund emergency services.',
    type: 'war',
  },
  {
    id: 'housing_boom',
    title: 'Housing Market Boom',
    description: 'Real estate is in high demand! Property values are appreciating faster than usual.',
    type: 'housing_boom',
  },
  {
    id: 'crypto_boom',
    title: 'Speculative Asset Rally',
    description: 'A crypto and stock market boom is yielding high investment returns.',
    type: 'crypto_boom',
  },
];

export function tickWorldEvents(activeEvents: string[]): {
  nextEvents: string[];
  logs: string[];
} {
  const nextEvents: string[] = [];
  const logs: string[] = [];

  // 1. Tick down active events
  activeEvents.forEach(evtId => {
    // 20% chance to resolve an active event each year
    if (Math.random() < 0.20) {
      const match = WORLD_EVENTS_POOL.find(w => w.id === evtId);
      logs.push(`RESOLVED: The ${match?.title ?? evtId} has officially ended.`);
    } else {
      nextEvents.push(evtId);
    }
  });

  // 2. Chance to trigger a new event if none or few are active
  if (nextEvents.length < 2) {
    // 8% chance to trigger a new macro event
    if (Math.random() < 0.08) {
      const inactive = WORLD_EVENTS_POOL.filter(w => !nextEvents.includes(w.id));
      if (inactive.length > 0) {
        const picked = inactive[Math.floor(Math.random() * inactive.length)];
        nextEvents.push(picked.id);
        logs.push(`ALERT: ${picked.title}! ${picked.description}`);
      }
    }
  }

  return { nextEvents, logs };
}

export interface WorldModifiers {
  propertyAppreciationMultiplier: number;
  taxRateDelta: number;
  healthDelta: number;
  happinessDelta: number;
  promotionChanceModifier: number;
  investmentReturnDelta: number;
}

export function getWorldEventModifiers(activeEvents: string[] = []): WorldModifiers {
  const mods: WorldModifiers = {
    propertyAppreciationMultiplier: 1.0,
    taxRateDelta: 0,
    healthDelta: 0,
    happinessDelta: 0,
    promotionChanceModifier: 0,
    investmentReturnDelta: 0,
  };

  activeEvents.forEach(evtId => {
    switch (evtId) {
      case 'recession':
        mods.propertyAppreciationMultiplier *= 0.5; // slow down appreciation
        mods.promotionChanceModifier -= 15; // -15% promotion rate
        mods.investmentReturnDelta -= 0.08; // -8% return
        break;
      case 'pandemic':
        mods.healthDelta -= 3;
        mods.happinessDelta -= 2;
        mods.promotionChanceModifier -= 5;
        break;
      case 'war':
        mods.taxRateDelta += 0.10; // +10% flat tax rate
        mods.happinessDelta -= 3;
        break;
      case 'housing_boom':
        mods.propertyAppreciationMultiplier *= 2.0; // double appreciation
        break;
      case 'crypto_boom':
        mods.investmentReturnDelta += 0.12; // +12% investment returns
        break;
    }
  });

  return mods;
}
