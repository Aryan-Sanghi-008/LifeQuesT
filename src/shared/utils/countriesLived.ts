import { Character } from '@/types';

const VISITED_POOL = ['US', 'GB', 'FR', 'JP', 'AU', 'BR', 'TH', 'EG', 'CA', 'DE', 'IT', 'ES'];

/** Sync countries lived from birthplace + travel history (for Wanderer collection). */
export function refreshCountriesLived(character: Character): string[] {
  const lived = new Set<string>();
  if (character.countryCode) lived.add(character.countryCode);
  for (const code of character.countriesLived ?? []) lived.add(code);

  const travelCount = character.eventHistory.filter((e) => e.id.startsWith('trv_')).length;
  for (let i = 0; lived.size < 1 + travelCount && i < VISITED_POOL.length; i++) {
    lived.add(VISITED_POOL[i]);
  }

  return Array.from(lived);
}

export function applyCountriesLived(character: Character): void {
  character.countriesLived = refreshCountriesLived(character);
}
