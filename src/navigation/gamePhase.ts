import type { AppUser, Character, RootStackParamList } from '../types';

export interface GameNavState {
  user: AppUser | null;
  character: Character | null;
  pendingReincarnation: boolean;
}

export function resolveRootRoute(state: GameNavState): keyof RootStackParamList {
  if (!state.user) return 'Auth';
  if (!state.character) {
    return state.pendingReincarnation ? 'CharacterCreate' : 'SaveSlots';
  }
  if (!state.character.isAlive) return 'Death';
  return 'MainTabs';
}

export type GamePhase = 'auth' | 'slots' | 'alive' | 'dead';

export function getGamePhase(state: GameNavState): GamePhase {
  if (!state.user) return 'auth';
  if (!state.character) return 'slots';
  if (!state.character.isAlive) return 'dead';
  return 'alive';
}
