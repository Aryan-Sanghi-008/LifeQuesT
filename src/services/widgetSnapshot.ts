import { Character } from '../types';
import { saveWidgetSnapshot } from './persistence';

export interface WidgetCharacterSnapshot {
  name: string;
  age: number;
  job: string;
  health: number;
  coins: number;
  mentalHealth: number;
  updatedAt: number;
}

export function buildWidgetSnapshot(character: Character): WidgetCharacterSnapshot {
  return {
    name: character.name,
    age: character.age,
    job: character.job,
    health: character.stats.health,
    coins: character.coins,
    mentalHealth: character.stats.mentalHealth,
    updatedAt: character.updatedAt,
  };
}

export function writeWidgetSnapshot(character: Character): void {
  const snapshot = buildWidgetSnapshot(character);
  saveWidgetSnapshot(JSON.stringify(snapshot));
}
