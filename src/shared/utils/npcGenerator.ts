import { Person, FamilyBackground, ScenarioId } from '@/types';
import { makeId } from '@engine/ids';
import { generateRandomDNA, generateRandomPersonality } from './genetics';
import { SCENARIO_PARENT_OCCUPATIONS } from '@/data/scenarioNPCs';

// ─── Name Banks ──────────────────────────────────────────────────────────────

const MALE_NAMES_IN = ['Arjun', 'Rahul', 'Vikram', 'Suresh', 'Ravi', 'Amit', 'Rajesh', 'Sanjay', 'Pradeep', 'Mohan', 'Deepak', 'Anil', 'Vikas', 'Naveen', 'Ajay'];
const FEMALE_NAMES_IN = ['Priya', 'Pooja', 'Sunita', 'Anita', 'Rekha', 'Meena', 'Deepa', 'Kavita', 'Neha', 'Ritu', 'Geeta', 'Sonia', 'Nisha', 'Shreya', 'Divya'];

const MALE_NAMES_US = ['James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark'];
const FEMALE_NAMES_US = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley'];

const MALE_NAMES_GLOBAL = ['Lucas', 'Noah', 'Liam', 'Oliver', 'Elijah', 'Mason', 'Logan', 'Ethan', 'Aiden', 'Jackson', 'Kai', 'Leo', 'Finn', 'Omar', 'Hassan'];
const FEMALE_NAMES_GLOBAL = ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Zoe', 'Luna', 'Lily', 'Chloe', 'Grace'];

const LAST_NAMES_IN = ['Sharma', 'Verma', 'Singh', 'Patel', 'Gupta', 'Kumar', 'Joshi', 'Mishra', 'Agarwal', 'Yadav'];
const LAST_NAMES_GLOBAL = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Chen', 'Kim', 'Ali', 'Nguyen', 'Müller'];

const OCCUPATIONS_POOR   = ['Farmer', 'Laborer', 'Street Vendor', 'Factory Worker', 'Cleaner', 'Rickshaw Driver', 'Cook'];
const OCCUPATIONS_MIDDLE = ['Teacher', 'Accountant', 'Engineer', 'Nurse', 'Office Clerk', 'Sales Rep', 'Driver', 'Police Officer'];
const OCCUPATIONS_WEALTHY = ['Doctor', 'Lawyer', 'Architect', 'Business Owner', 'Professor', 'Banker', 'Consultant'];
const OCCUPATIONS_ROYALTY = ['Politician', 'CEO', 'Judge', 'General', 'Entrepreneur', 'Diplomat'];

const PET_NAMES = ['Buddy', 'Charlie', 'Max', 'Bailey', 'Luna', 'Bella', 'Daisy', 'Rocky', 'Molly', 'Rex', 'Shadow', 'Coco', 'Tiger', 'Simba', 'Milo'];

// ─── Seeded Randomness ────────────────────────────────────────────────────────

function seededRandom(seed: string, offset = 0): number {
  let h = offset;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  h = ((h >>> 16) ^ h) * 0x45d9f3b | 0;
  h = ((h >>> 16) ^ h) * 0x45d9f3b | 0;
  h = (h >>> 16) ^ h;
  return Math.abs(h) / 2147483647;
}

function pick<T>(arr: T[], seed: string, offset = 0): T {
  return arr[Math.floor(seededRandom(seed, offset) * arr.length)];
}

// ─── Name generation ──────────────────────────────────────────────────────────

function getNameBank(gender: 'male' | 'female', countryCode: string): string[] {
  if (gender === 'male') {
    if (countryCode === 'IN') return MALE_NAMES_IN;
    if (countryCode === 'US' || countryCode === 'GB') return MALE_NAMES_US;
    return MALE_NAMES_GLOBAL;
  } else {
    if (countryCode === 'IN') return FEMALE_NAMES_IN;
    if (countryCode === 'US' || countryCode === 'GB') return FEMALE_NAMES_US;
    return FEMALE_NAMES_GLOBAL;
  }
}

function getLastNameBank(countryCode: string): string[] {
  return countryCode === 'IN' ? LAST_NAMES_IN : LAST_NAMES_GLOBAL;
}

export function generateName(
  gender: 'male' | 'female',
  countryCode: string,
  seed: string,
  offset = 0,
): string {
  const first = pick(getNameBank(gender, countryCode), seed, offset);
  const last  = pick(getLastNameBank(countryCode), seed, offset + 99);
  return `${first} ${last}`;
}

function getOccupations(background: FamilyBackground, scenarioId?: ScenarioId): string[] {
  if (scenarioId && SCENARIO_PARENT_OCCUPATIONS[scenarioId]?.length) {
    return SCENARIO_PARENT_OCCUPATIONS[scenarioId]!;
  }
  if (background === 'poor')    return OCCUPATIONS_POOR;
  if (background === 'middle')  return OCCUPATIONS_MIDDLE;
  if (background === 'wealthy') return OCCUPATIONS_WEALTHY;
  return OCCUPATIONS_ROYALTY;
}

// ─── Generate Parents ─────────────────────────────────────────────────────────

export function generateParents(
  characterName: string,
  countryCode: string,
  background: FamilyBackground,
  scenarioId?: ScenarioId,
): Person[] {
  const seed = characterName + countryCode;
  const fatherName = generateName('male',   countryCode, seed, 1);
  const motherName = generateName('female', countryCode, seed, 2);
  const occupations = getOccupations(background, scenarioId);

  const father: Person = {
    id: makeId(),
    name: fatherName,
    age: 25 + Math.floor(seededRandom(seed, 3) * 15),
    gender: 'male',
    relationType: 'father',
    relationshipScore: 50 + Math.floor(seededRandom(seed, 4) * 30),
    avatarSeed: fatherName,
    isAlive: true,
    occupation: pick(occupations, seed, 5),
    dna: generateRandomDNA(),
    personality: generateRandomPersonality(),
  };

  const mother: Person = {
    id: makeId(),
    name: motherName,
    age: 23 + Math.floor(seededRandom(seed, 6) * 15),
    gender: 'female',
    relationType: 'mother',
    relationshipScore: 55 + Math.floor(seededRandom(seed, 7) * 30),
    avatarSeed: motherName,
    isAlive: true,
    occupation: pick(occupations, seed, 8),
    dna: generateRandomDNA(),
    personality: generateRandomPersonality(),
  };

  return [father, mother];
}

// ─── Generate Classmate ───────────────────────────────────────────────────────

export function generateClassmate(characterName: string, index: number): Person {
  const seed = characterName + 'classmate' + index;
  const gender = seededRandom(seed, 0) > 0.5 ? 'male' : 'female';
  const name = generateName(gender as 'male' | 'female', 'US', seed, index);
  return {
    id: makeId(),
    name,
    age: 0,
    gender,
    relationType: 'classmate',
    relationshipScore: 20 + Math.floor(seededRandom(seed, index + 1) * 40),
    avatarSeed: name,
    isAlive: true,
  };
}

// ─── Generate Coworker ────────────────────────────────────────────────────────

export function generateCoworker(
  characterName: string,
  index: number,
  occupation: string,
): Person {
  const seed = characterName + 'coworker' + index;
  const gender = seededRandom(seed, 0) > 0.5 ? 'male' : 'female';
  const name = generateName(gender as 'male' | 'female', 'US', seed, index);
  return {
    id: makeId(),
    name,
    age: 22 + Math.floor(seededRandom(seed, 1) * 20),
    gender,
    relationType: 'coworker',
    relationshipScore: 30 + Math.floor(seededRandom(seed, 2) * 40),
    avatarSeed: name,
    isAlive: true,
    occupation,
  };
}

// ─── Generate Pet ─────────────────────────────────────────────────────────────

export function generatePet(type: 'dog' | 'cat' | 'bird'): Person {
  const name = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
  return {
    id: makeId(),
    name: `${name} (${type})`,
    age: 0,
    gender: 'animal',   // Required for NpcAvatar to use bottts style
    relationType: 'pet',
    relationshipScore: 70,
    avatarSeed: name + type,
    isAlive: true,
    occupation: type,
  };
}

// ─── Generate Random Partner ──────────────────────────────────────────────────

export function generatePartner(characterName: string, characterAge: number): Person {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const name = generateName(gender as 'male' | 'female', 'US', characterName + 'partner' + characterAge, 0);
  return {
    id: makeId(),
    name,
    age: characterAge - 3 + Math.floor(Math.random() * 8),
    gender,
    relationType: 'partner',
    relationshipScore: 60 + Math.floor(Math.random() * 30),
    avatarSeed: name,
    isAlive: true,
    dna: generateRandomDNA(),
    personality: generateRandomPersonality(),
  };
}
