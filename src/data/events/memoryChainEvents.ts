import type { EventCategory, EventChoice, LifeEvent } from '../../types';
import { COLORS } from '../../constants/theme';
import { MEMORY_CHAINS } from '../memoryChains';

const CATEGORY_COLORS: Record<EventCategory, string> = {
  education: COLORS.catEducation,
  career: COLORS.catCareer,
  relationship: COLORS.catRelationship,
  health: COLORS.catHealth,
  financial: COLORS.catFinancial,
  family: COLORS.catFamily,
  random: COLORS.catRandom,
  milestone: COLORS.catMilestone,
  crime: COLORS.catCrime,
  travel: COLORS.catTravel,
  activity: COLORS.catActivity,
};

const CATEGORY_CHOICE_COPY: Record<EventCategory, { positive: [string, string]; negative: [string, string] }> = {
  education: {
    positive: ['Double down on learning', 'Choose the path that sharpens your mind.'],
    negative: ['Let it slide', 'Choose the easier road for now.'],
  },
  career: {
    positive: ['Move forward', 'Take the opportunity and see where it goes.'],
    negative: ['Stay cautious', 'Keep your current footing and avoid the risk.'],
  },
  relationship: {
    positive: ['Reach out', 'Lead with empathy and see what can be repaired.'],
    negative: ['Pull back', 'Protect your heart and keep some distance.'],
  },
  health: {
    positive: ['Get help', 'Treat the warning signs before they grow.'],
    negative: ['Ignore it', 'Hope the problem works itself out.'],
  },
  financial: {
    positive: ['Take the bet', 'Put your money to work and accept the risk.'],
    negative: ['Protect the cash', 'Keep what you have and wait it out.'],
  },
  family: {
    positive: ['Lean on family', 'Show up and keep the bond intact.'],
    negative: ['Step away', 'Keep your distance and preserve your energy.'],
  },
  random: {
    positive: ['Lean into it', 'See where the moment takes you.'],
    negative: ['Walk away', 'Refuse to let chance pull you in.'],
  },
  milestone: {
    positive: ['Celebrate it', 'Own the moment and make it matter.'],
    negative: ['Keep it quiet', 'Stay humble and let it pass.'],
  },
  crime: {
    positive: ['Push deeper', 'Choose the harder, riskier path.'],
    negative: ['Back out', 'Find a way to step away from trouble.'],
  },
  travel: {
    positive: ['Go farther', 'Leave the familiar behind and keep moving.'],
    negative: ['Go home', 'Choose safety and a known routine.'],
  },
  activity: {
    positive: ['Commit fully', 'Put real effort into the experience.'],
    negative: ['Skip it', 'Decide the moment is not worth the hassle.'],
  },
};

const CATEGORY_CHOICE_EFFECTS: Record<EventCategory, { positive: EventChoice['statEffect']; negative: EventChoice['statEffect'] }> = {
  education: {
    positive: { intelligence: 4, ambition: 2, happiness: 1 },
    negative: { intelligence: -1, happiness: -2 },
  },
  career: {
    positive: { ambition: 4, wealth: 2, intelligence: 1 },
    negative: { ambition: -2, happiness: -2 },
  },
  relationship: {
    positive: { happiness: 4, social: 3, mentalHealth: 1 },
    negative: { happiness: -3, mentalHealth: -2, social: -1 },
  },
  health: {
    positive: { health: 4, fitness: 3, mentalHealth: 2 },
    negative: { health: -4, mentalHealth: -2, fitness: -1 },
  },
  financial: {
    positive: { wealth: 4, happiness: 1 },
    negative: { wealth: -4, mentalHealth: -2 },
  },
  family: {
    positive: { happiness: 4, social: 2, mentalHealth: 1 },
    negative: { happiness: -3, mentalHealth: -2, social: -1 },
  },
  random: {
    positive: { happiness: 2, mentalHealth: 2, social: 1 },
    negative: { happiness: -2, mentalHealth: -2 },
  },
  milestone: {
    positive: { happiness: 3, ambition: 2, mentalHealth: 1 },
    negative: { happiness: -1, mentalHealth: -1 },
  },
  crime: {
    positive: { ambition: 3, karma: -6, social: -2 },
    negative: { karma: 4, mentalHealth: -1 },
  },
  travel: {
    positive: { happiness: 3, social: 2, intelligence: 1 },
    negative: { happiness: -2, fitness: -1 },
  },
  activity: {
    positive: { fitness: 3, happiness: 2, mentalHealth: 1 },
    negative: { fitness: -2, happiness: -1 },
  },
};

const STEP_SUFFIXES: Record<number, readonly string[]> = {
  2: ['Opening', 'Aftermath'],
  3: ['Opening', 'Complication', 'Resolution'],
};

function buildChoicePair(
  eventId: string,
  category: EventCategory,
  stepTag: string,
): { choices: EventChoice[]; choiceMemoryTags: Record<string, string[]> } {
  const copy = CATEGORY_CHOICE_COPY[category];
  const effects = CATEGORY_CHOICE_EFFECTS[category];
  const choiceAId = `${eventId}_a`;
  const choiceBId = `${eventId}_b`;
  const choiceATag = `${stepTag}_path_a`;
  const choiceBTag = `${stepTag}_path_b`;

  return {
    choices: [
      {
        id: choiceAId,
        text: copy.positive[0],
        subtext: copy.positive[1],
        statEffect: effects.positive,
      },
      {
        id: choiceBId,
        text: copy.negative[0],
        subtext: copy.negative[1],
        statEffect: effects.negative,
      },
    ],
    choiceMemoryTags: {
      [choiceAId]: [choiceATag],
      [choiceBId]: [choiceBTag],
    },
  };
}

export const MEMORY_CHAIN_EVENTS: LifeEvent[] = MEMORY_CHAINS.flatMap(chain => {
  const stepLabels = STEP_SUFFIXES[chain.steps.length] ?? STEP_SUFFIXES[3];

  return chain.steps.map((step, index) => {
    const stepTitle = stepLabels[index] ?? `Step ${index + 1}`;
    const stepTag = step.grantsTag;
    const branchTags = buildChoicePair(step.eventId, chain.category, stepTag);
    const title = `${chain.label}: ${stepTitle}`;
    const description = `The ${stepTitle.toLowerCase()} of ${chain.label.toLowerCase()} asks whether you commit to the long arc or step back from the consequences.`;

    return {
      id: step.eventId,
      chainId: chain.id,
      chainStep: index + 1,
      minAge: step.minAge ?? (index === 0 ? 14 : step.minAge),
      maxAge: step.maxAge ?? 80,
      title,
      description,
      statEffect: {},
      category: chain.category,
      color: CATEGORY_COLORS[chain.category],
      choices: branchTags.choices,
      requiredMemoryTags: step.requiredTags,
      grantsMemoryTags: [stepTag],
      choiceMemoryTags: branchTags.choiceMemoryTags,
    };
  });
});

export const MEMORY_CHAIN_EVENT_IDS = new Set(MEMORY_CHAIN_EVENTS.map(event => event.id));
