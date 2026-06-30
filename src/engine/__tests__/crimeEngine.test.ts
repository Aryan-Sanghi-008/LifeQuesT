import { recordCrime, isInJail, tickJail, tickProbation } from '@engine/crimeEngine';
import { createTestCharacter } from '../../test/fixtures/character';

const baseChar = () => createTestCharacter({
  job: 'Engineer',
  age: 25,
  birthYear: 2000,
  educationLevel: 'graduate',
  criminalRecord: { crimes: [], jailYearsRemaining: 0, onProbation: false },
});

describe('crimeEngine', () => {
  it('records crime and applies karma penalty', () => {
    const updated = recordCrime(baseChar(), 'arrest');
    expect(updated.criminalRecord?.crimes).toContain('arrest');
    expect(updated.karma).toBeLessThan(50);
    expect(isInJail(updated)).toBe(true);
  });

  it('ticks jail years down', () => {
    let char = recordCrime(baseChar(), 'arrest');
    char = tickJail(char);
    expect(char.criminalRecord?.jailYearsRemaining).toBe(1);
  });

  it('clears probation after 3 crime-free years', () => {
    let char = recordCrime(baseChar(), 'shoplifting');
    expect(char.criminalRecord?.onProbation).toBe(true);
    char = { ...char, age: char.age + 1 };
    char = { ...char, ...tickProbation(char) } as typeof char;
    char = { ...char, age: char.age + 1 };
    char = { ...char, ...tickProbation(char) } as typeof char;
    char = { ...char, age: char.age + 1 };
    char = { ...char, ...tickProbation(char) } as typeof char;
    expect(char.criminalRecord?.onProbation).toBe(false);
  });
});