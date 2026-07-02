/**
 * Absence Catch-Up Engine
 *
 * Advances the character's age and world state passively for each day they
 * were away (capped at 3 years). Unlike the full ageUp() pipeline, this
 * deliberately skips random event picks, pending decisions, and streak
 * changes to avoid modal spam on return.
 */

import { Character, LifeEventRecord } from '../types';
import { agePeople } from './peopleEngine';
import { tickAnnualEconomy } from './economyEngine';
import { getLifeStage } from '@utils/lifeStage';

export interface AbsenceCatchUpResult {
  character: Character;
  summaryLines: string[];
}

export function applyAbsenceCatchUp(
  character: Character,
  years: number,
): AbsenceCatchUpResult {
  const cap = Math.max(0, Math.min(3, years));
  if (cap === 0) return { character, summaryLines: [] };

  let c = { ...character };
  const summaryLines: string[] = [];
  const eventHistory: LifeEventRecord[] = [...(c.eventHistory ?? [])];

  for (let i = 0; i < cap; i++) {
    const newAge = c.age + 1;

    // Age the character
    c = { ...c, age: newAge, lifeStage: getLifeStage(newAge) };

    // Age NPCs passively
    c = { ...c, people: agePeople(c.people ?? []) };

    // Apply passive economy tick using career salary if employed
    const salary = c.career?.salary ?? 0;
    const eco = tickAnnualEconomy(
      newAge,
      c.bankBalance,
      c.debt ?? 0,
      salary,
      c.assets ?? [],
      c.countryCode ?? 'US',
    );
    c = {
      ...c,
      bankBalance: eco.bankBalance,
      debt: eco.debt,
    };

    // Append a lightweight event record so the life feed shows the gap
    const record: LifeEventRecord = {
      id: `absence_catchup_${newAge}_${Date.now()}`,
      age: newAge,
      title: 'Life Went On',
      description: `While you were away, life continued. You turned ${newAge}.`,
      category: 'milestone',
      rarity: 'common',
      statEffect: {},
      color: '#94A3B8',
      timestamp: Date.now(),
    };
    eventHistory.push(record);

    summaryLines.push(`Turned ${newAge} — life went on while you were away.`);
  }

  c = { ...c, eventHistory };

  return { character: c, summaryLines };
}
