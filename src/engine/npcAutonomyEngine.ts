import type { Person } from '../types';

const JOBS = [
  'Teacher', 'Engineer', 'Nurse', 'Office Assistant',
  'Sales Representative', 'Police Officer', 'Chef',
  'Designer', 'Artist', 'Writer', 'Doctor', 'Lawyer',
];

export interface AutonomyResult {
  people: Person[];
  logs: string[];
  bankDelta: number;
}

export function tickNpcAutonomy(
  people: Person[],
  _characterAge: number,
  _characterWealth: number,
  familyBackground: string,
): AutonomyResult {
  const updatedPeople: Person[] = [];
  const logs: string[] = [];
  let bankDelta = 0;

  people.forEach(p => {
    if (!p.isAlive) {
      updatedPeople.push(p);
      return;
    }

    const nextPerson = { ...p };
    const age = nextPerson.age;
    const relType = nextPerson.relationType;

    // 1. Check for natural death (parents/spouses/siblings at old age)
    if (age > 75) {
      // 8% chance to pass away each year after 75
      if (Math.random() < 0.08) {
        nextPerson.isAlive = false;
        logs.push(`Your ${relType} ${nextPerson.name} passed away of old age at age ${age}.`);

        // If parent dies, player gets inheritance
        if (relType === 'father' || relType === 'mother') {
          let inheritance = 0;
          if (familyBackground === 'poor') {
            inheritance = 1000 + Math.floor(Math.random() * 4000);
          } else if (familyBackground === 'middle') {
            inheritance = 10000 + Math.floor(Math.random() * 40000);
          } else if (familyBackground === 'wealthy') {
            inheritance = 100000 + Math.floor(Math.random() * 150000);
          } else if (familyBackground === 'royalty') {
            inheritance = 500000 + Math.floor(Math.random() * 1500000);
          }
          bankDelta += inheritance;
          logs.push(`Inheritance: You received ${inheritance.toLocaleString()} from your late ${relType}'s estate.`);
        }

        updatedPeople.push(nextPerson);
        return;
      }
    }

    // 2. Autonomous events based on relationship type
    if (relType === 'child' || relType === 'sibling') {
      // Graduate high school at 18
      if (age === 18) {
        logs.push(`Your ${relType} ${nextPerson.name} has graduated from high school.`);
      }
      // Graduate university at 22
      if (age === 22) {
        logs.push(`Your ${relType} ${nextPerson.name} graduated from university!`);
      }
      // Get a job (age 18-28)
      if (age >= 18 && age <= 28 && !nextPerson.occupation && Math.random() < 0.25) {
        const job = JOBS[Math.floor(Math.random() * JOBS.length)];
        nextPerson.occupation = job;
        logs.push(`Your ${relType} ${nextPerson.name} started a career as a ${job}.`);
      }
      // Get promoted (age 22-55)
      if (nextPerson.occupation && age >= 22 && age <= 55 && Math.random() < 0.05) {
        logs.push(`Your ${relType} ${nextPerson.name} got a promotion at work.`);
      }
      // Get married (age 22-38)
      if (age >= 22 && age <= 38 && !nextPerson.relationshipStage && Math.random() < 0.06) {
        nextPerson.relationshipStage = 'married';
        logs.push(`Your ${relType} ${nextPerson.name} got married!`);
      }
      // Have a child (age 22-42, if married)
      if (nextPerson.relationshipStage === 'married' && age >= 22 && age <= 42 && Math.random() < 0.08) {
        const pronoun = Math.random() > 0.5 ? 'son' : 'daughter';
        const relation = relType === 'child' ? 'grandchild' : 'niece/nephew';
        logs.push(`Your ${relType} ${nextPerson.name} had a baby ${pronoun} (your new ${relation}!).`);
      }
    } else if (relType === 'spouse' || relType === 'partner') {
      // Spouse promotion
      if (nextPerson.occupation && Math.random() < 0.06) {
        logs.push(`Your spouse ${nextPerson.name} was promoted! They celebrate with a dinner.`);
      }
      // Spouse spends money or buys gift
      if (Math.random() < 0.05) {
        const gift = Math.random() > 0.5;
        if (gift) {
          logs.push(`Your partner ${nextPerson.name} surprised you with a beautiful gift (+5 Happiness).`);
        } else {
          const cost = 200 + Math.floor(Math.random() * 800);
          bankDelta -= cost;
          logs.push(`Your partner ${nextPerson.name} bought some items for the house (-$${cost}).`);
        }
      }
    } else if (relType === 'father' || relType === 'mother') {
      // Retire at age 65
      if (age === 65 && nextPerson.occupation && !nextPerson.occupation.startsWith('Retired')) {
        nextPerson.occupation = `Retired ${nextPerson.occupation}`;
        logs.push(`Your ${relType} ${nextPerson.name} retired from their career.`);
      }
    }

    updatedPeople.push(nextPerson);
  });

  return { people: updatedPeople, logs, bankDelta };
}
