import type { Character, WillDetails, FamilyLineageEntry, Person } from '../types';
import { computeNetWorth } from './economyEngine';
import { generateRandomDNA, generateRandomPersonality } from '@utils/genetics';
import { applyDynastyStatMultiplier } from './economyCapEngine';

export function calculateDynastyScore(character: Character): number {
  const gen = character.generation ?? 1;
  const netWorth = computeNetWorth(character);
  const achievementsCount = character.achievements?.length ?? 0;
  return gen * 1000 + Math.round(netWorth / 1000) + achievementsCount * 50;
}

export interface InheritanceDistribution {
  heirShare: number;
  spouseShare: number;
  charityShare: number;
  childrenShares: Record<string, number>;
}

export function distributeInheritance(
  character: Character,
  will?: WillDetails,
): InheritanceDistribution {
  const totalWealth = Math.max(0, character.bankBalance); // Only inherit cash, ignore properties/debt
  const dist: InheritanceDistribution = {
    heirShare: 0,
    spouseShare: 0,
    charityShare: 0,
    childrenShares: {},
  };

  if (totalWealth <= 0) return dist;

  const type = will?.type ?? 'equal';
  const targetHeirId = will?.targetHeirId;

  const livingChildren = character.people.filter(p => p.relationType === 'child' && p.isAlive);
  const spouse = character.people.find(
    p => (p.relationType === 'spouse' || p.relationType === 'partner') && p.isAlive,
  );

  switch (type) {
    case 'charity':
      dist.charityShare = totalWealth;
      break;

    case 'spouse':
      if (spouse) {
        dist.spouseShare = totalWealth;
      } else if (livingChildren.length > 0) {
        const share = Math.round(totalWealth / livingChildren.length);
        livingChildren.forEach(c => {
          dist.childrenShares[c.id] = share;
        });
      } else {
        dist.charityShare = totalWealth;
      }
      break;

    case 'heir':
      if (targetHeirId) {
        const matchChild = livingChildren.find(c => c.id === targetHeirId);
        const matchSibling = character.people.find(p => p.relationType === 'sibling' && p.id === targetHeirId && p.isAlive);
        if (matchChild) {
          dist.heirShare = totalWealth;
          dist.childrenShares[targetHeirId] = totalWealth;
        } else if (matchSibling) {
          dist.heirShare = totalWealth;
        } else if (spouse) {
          dist.spouseShare = totalWealth;
        } else {
          dist.charityShare = totalWealth;
        }
      } else {
        dist.charityShare = totalWealth;
      }
      break;

    case 'equal':
    default:
      const heirsCount = livingChildren.length + (spouse ? 1 : 0);
      if (heirsCount > 0) {
        const share = Math.round(totalWealth / heirsCount);
        if (spouse) dist.spouseShare = share;
        livingChildren.forEach(c => {
          dist.childrenShares[c.id] = share;
        });
      } else {
        dist.charityShare = totalWealth;
      }
      break;
  }

  return dist;
}

export function continueAsHeir(
  parent: Character,
  heirId: string,
  options?: {
    hasBloodlineBond?: boolean;
    dynastyStatBonusTier?: number;
    familyCrestId?: string;
  },
): Character {
  const heirNPC = parent.people.find(p => p.id === heirId && p.isAlive);
  if (!heirNPC) {
    throw new Error('Selected heir is not alive or not found.');
  }

  // 1. Lineage entries
  const currentEntry: FamilyLineageEntry = {
    generation: parent.generation ?? 1,
    name: parent.name,
    lifespan: parent.deathAge ?? parent.age,
    netWorth: computeNetWorth(parent),
    deathCause: parent.deathCause ?? 'natural causes',
    birthYear: parent.birthYear,
  };
  const familyLineage = [...(parent.familyLineage ?? []), currentEntry];

  // 2. Inheritance
  const inheritance = distributeInheritance(parent, parent.will);
  let startingCash = 0;
  if (parent.will?.type === 'heir' && parent.will.targetHeirId === heirId) {
    startingCash = inheritance.heirShare;
  } else if (heirNPC.relationType === 'child') {
    startingCash = inheritance.childrenShares[heirId] ?? 0;
  } else if (heirNPC.relationType === 'sibling') {
    // Sibling case
    startingCash = parent.will?.targetHeirId === heirId ? inheritance.heirShare : 0;
  }

  // 3. New generation count
  const generation = (parent.generation ?? 1) + 1;
  const dynastyScore = (parent.dynastyScore ?? 0) + calculateDynastyScore(parent);

  // 4. Inherited People list adjustments
  // - Other children of the parent become siblings of the heir
  // - The parent's spouse becomes the mother/father of the heir (if they are a child)
  // - The deceased parent is added as a deceased mother/father
  const nextPeople: Person[] = [];

  // Add the deceased parent as deceased
  nextPeople.push({
    id: parent.id,
    name: parent.name,
    age: parent.age,
    gender: parent.gender,
    relationType: parent.gender === 'female' ? 'mother' : 'father',
    relationshipScore: 100,
    avatarSeed: parent.avatarSeed,
    isAlive: false,
    occupation: parent.job,
  });

  parent.people.forEach(p => {
    if (p.id === heirId) return; // Skip the heir themselves

    if (heirNPC.relationType === 'child') {
      // If we are playing as child:
      // Parent's spouse/partner becomes mother/father (if alive)
      if ((p.relationType === 'spouse' || p.relationType === 'partner') && p.isAlive) {
        nextPeople.push({
          ...p,
          relationType: p.gender === 'female' ? 'mother' : 'father',
        });
      }
      // Parent's other children become siblings
      if (p.relationType === 'child' && p.isAlive) {
        nextPeople.push({
          ...p,
          relationType: 'sibling',
        });
      }
    } else if (heirNPC.relationType === 'sibling') {
      // If we are playing as sibling:
      // Parent's parents become parents of sibling
      if ((p.relationType === 'mother' || p.relationType === 'father') && p.isAlive) {
        nextPeople.push(p);
      }
      // Other siblings remain siblings
      if (p.relationType === 'sibling' && p.isAlive) {
        nextPeople.push(p);
      }
    }
  });

  if (options?.hasBloodlineBond && familyLineage.length > 0) {
    const ancestor = familyLineage[familyLineage.length - 1];
    nextPeople.push({
      id: `bloodline_${ancestor.name}_${Date.now()}`,
      name: ancestor.name,
      age: Math.max(heirNPC.age + 20, ancestor.lifespan),
      gender: 'other',
      relationType: 'friend',
      relationshipScore: 70,
      avatarSeed: ancestor.name,
      isAlive: true,
      occupation: 'Family Ancestor',
      archetypeId: 'bloodline_ancestor',
      goals: ['Guide the bloodline'],
    });
  }

  // 5. Generate starting stats/caps for the new heir character
  const dna = heirNPC.dna ?? generateRandomDNA();
  const personality = heirNPC.personality ?? generateRandomPersonality();

  const stats = applyDynastyStatMultiplier(
    {
      health: Math.min(90, 80 + Math.floor(Math.random() * 11)),
      happiness: 80,
      intelligence: dna.statPotentials?.intelligence ?? 60,
      wealth: Math.min(100, Math.round(startingCash / 10000)),
      fitness: 60,
      looks: dna.statPotentials?.looks ?? 50,
      social: 50,
      ambition: personality.conscientiousness ?? 50,
      mentalHealth: 80,
    },
    options?.dynastyStatBonusTier ?? 0,
    generation,
  );

  const currentYear = new Date().getFullYear();

  const newChar: Character = {
    id: `${heirId}_heir_${Date.now()}`,
    name: heirNPC.name,
    gender: heirNPC.gender as 'male' | 'female' | 'other',
    avatarSeed: heirNPC.avatarSeed,
    avatarId: parent.avatarId,
    lifeStage: heirNPC.age >= 60 ? 'senior' : heirNPC.age >= 45 ? 'middle_aged' : heirNPC.age >= 25 ? 'adult' : heirNPC.age >= 18 ? 'young_adult' : 'teen',
    country: parent.country,
    countryFlag: parent.countryFlag,
    countryCode: parent.countryCode,
    zodiac: parent.zodiac,
    familyBackground: parent.familyBackground,
    traits: [],
    job: heirNPC.occupation ?? 'Unemployed',
    age: heirNPC.age,
    birthYear: currentYear - heirNPC.age,
    stats,
    karma: 100,
    bankBalance: startingCash,
    debt: 0,
    netWorthPeak: startingCash,
    relationships: nextPeople.filter(p => p.isAlive).length,
    children: 0,
    educationLevel: heirNPC.age >= 22 ? 'university' : heirNPC.age >= 18 ? 'secondary' : 'elementary',
    people: nextPeople,
    career: heirNPC.occupation ? {
      title: heirNPC.occupation,
      company: 'Local Business',
      salary: 25000 + Math.floor(Math.random() * 15000),
      yearsEmployed: 1,
      performance: 50,
    } : null,
    assets: [],
    achievements: [],
    eventHistory: [],
    isAlive: true,
    coins: parent.coins,
    gems: parent.gems,
    isPremium: parent.isPremium,
    hasNoAds: parent.hasNoAds,
    luckBoostsRemaining: parent.luckBoostsRemaining,
    hasReincarnationScroll: parent.hasReincarnationScroll,
    businesses: [],
    socialFollowers: 10,
    degreeIds: [],
    certificationIds: [],
    totalCareerYears: heirNPC.occupation ? 2 : 0,
    dna,
    personality,
    latentTalents: [],
    memories: [],
    familyReputation: Math.max(30, Math.min(100, Math.round(parent.familyReputation * 0.9))),
    generation,
    dynastyScore,
    familyLineage,
    activeWorldEvents: [],
    familyCrestId: options?.familyCrestId ?? parent.familyCrestId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return newChar;
}
